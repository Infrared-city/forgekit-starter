import { unionBbox } from "./overture-area.js";
import { requireCore } from "../internal/core.js";
import { SiteReadError } from "./errors.js";
import { consoleLogger } from "../logger.js";
// Maintainer note (not published): The READ chunking of a site (WP14-A). A 5 km2 site is 81 overlapping
// 512 m simulation tiles but ONE Overture read; a 20 km2 site is a handful of ~2x2 km read chunks. The
// grid only bounds how much parquet is in flight and in memory: every chunk's features go into ONE
// compose call over the whole chunk list, so the answer does not depend on where boundaries fall. Below
// the kernel's single-chunk area the site is one read CHUNK; its compose list is `chunk ∩ union(tile
// rectangles)` (D57), so a RECTANGULAR small site is one rectangle (WP13 gate
// `a_one_rectangle_compose_is_the_single_tile_operation`: byte-identical to a single
// `groundMaterialsCompose`) while an L-shaped or sparse one is composed as `site-p0…` (was one
// rectangle whatever the shape before WP21).
/**
 * Maximum number of site chunks fetched at once (`2`): one decodes while the next arrives.
 *
 * @category Geodata
 */
export const SITE_CHUNKS_IN_FLIGHT = 2;
/**
 * The pieces of `clip ∩ union(rectangles)`, as disjoint rectangles.
 *
 * @param clip - The rectangle to clip to, in WGS84 degrees.
 * @param rectangles - The rectangles whose union is intersected with `clip`.
 * @returns The disjoint rectangles that make up the intersection.
 * @category Geodata
 */
// Maintainer note (not published): Via the kernel's `rectUnionDecompose` export (D57), flat
// `[west, south, east, north, ...]` buffers, one crossing per call; the Python twin uses the SAME
// operation (`ground_materials/_site_chunks.py`). Exported: `buildings-extrude.ts` also uses it.
export function decompose(clip, rectangles) {
    const flatClip = Float64Array.from([clip.west, clip.south, clip.east, clip.north]);
    const flatRectangles = Float64Array.from(rectangles.flatMap((rect) => [rect.west, rect.south, rect.east, rect.north]));
    const flatPieces = requireCore().rectUnionDecompose(flatClip, flatRectangles);
    const pieces = [];
    for (let index = 0; index + 3 < flatPieces.length; index += 4) {
        pieces.push({
            west: flatPieces[index],
            south: flatPieces[index + 1],
            east: flatPieces[index + 2],
            north: flatPieces[index + 3],
        });
    }
    return pieces;
}
/**
 * Give each piece of a decomposition an id.
 *
 * A single piece keeps the owner's own `id`; several pieces are
 * `<id>-p<index>` in decomposition order.
 *
 * @category Geodata
 */
// Maintainer note (not published): the kernel names the pieces of a CHUNK (`siteChunks`) by the same
// format; this names the SITE's pieces for `buildings-extrude.ts`.
export function namePieces(id, pieces) {
    return pieces.length === 1
        ? [{ id, bbox: pieces[0] }]
        : pieces.map((piece, index) => ({ id: `${id}-p${String(index)}`, bbox: piece }));
}
/**
 * Split a site rectangle into read chunks, in row-major (south-to-north,
 * west-to-east) order.
 *
 * A site up to 4 km2 is one chunk with the id `site`; larger sites are cut
 * into chunks of about 2 km. A chunk
 * that meets none of the `used` rectangles is dropped, so ground no simulation
 * reads is never composed.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param used - The simulation-tile rectangles. Defaults to the site itself.
 * @param logger - Receives the warning for a site larger than one local frame.
 * @returns The chunks, each with its compose pieces.
 * @category Geodata
 */
// Maintainer note (not published): the grid and its pieces are the kernel's `siteChunks`, the call the
// Python host makes too. Order is part of the contract: the chunk list is the kernel's rectangle
// list, and its first-seen merge lets the order decide which copy of a feature spanning two chunks
// survives (row-major is the tile grid's order). The GRID still spans the bounding box, the shape the
// Overture read pushes down on: dropping a chunk changes what is COMPOSED, never what is fetched.
export function siteChunks(site, used, logger = consoleLogger) {
    warnIfOverOneFrame(site, logger);
    const flatUsed = Float64Array.from((used ?? [site]).flatMap((rect) => [rect.west, rect.south, rect.east, rect.north]));
    const chunks = JSON.parse(requireCore().siteChunks(flatBbox(site), flatUsed));
    return chunks.map((chunk) => ({
        id: chunk.id,
        bbox: bboxOf(chunk.bbox),
        pieces: chunk.pieces.map((piece) => ({ id: piece.id, bbox: bboxOf(piece.bbox) })),
    }));
}
function flatBbox(bbox) {
    return Float64Array.from([bbox.west, bbox.south, bbox.east, bbox.north]);
}
function bboxOf([west, south, east, north]) {
    return { west, south, east, north };
}
/**
 * Warn once per call when a site is larger than a single local frame is
 * recommended for, and say how far off the far end is.
 *
 * Two rules apply: the area rule (above 20 km2) and the extent rule (above 5 km
 * on the longest side), because a long, narrow strip can be small in
 * area and still carry the error of a long site. The warning is written to
 * `logger`, never directly to the console.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param logger - Where the warning is written.
 * @category Geodata
 */
// Maintainer note (not published): Area rule is D48, extent rule D57. The kernel decides and words
// both (`siteFrameWarnings`), so the Python host says the same; neither says `runArea`/`run_area`. Through the caller's Logger so a
// `silentLogger` caller gets no console output (default `consoleLogger`). Exported for the BUILDINGS
// leg (`buildings-area.ts`), which skips `siteChunks` (FINAL-SANITY F5); each leg warns once per call.
export function warnIfOverOneFrame(site, logger) {
    const warnings = JSON.parse(requireCore().siteFrameWarnings(flatBbox(site)));
    for (const warning of warnings)
        logger.warn(warning);
}
/**
 * The rectangle that bounds a list of simulation-tile query rectangles.
 *
 * @category Geodata
 */
export function siteRectangle(rectangles) {
    return unionBbox(rectangles);
}
/**
 * Run `task` over the chunks, at most `SITE_CHUNKS_IN_FLIGHT` at once.
 *
 * A chunk that fails does not stop the others, so the error reports every
 * failed chunk. A partial result is never returned.
 *
 * @param chunks - The chunks to read.
 * @param task - Reads one chunk; receives the chunk and its index.
 * @param requested - Requested concurrency. Honoured up to
 *   `SITE_CHUNKS_IN_FLIGHT` and the number of chunks, never above.
 * @param signal - Aborts the read. It is checked before each chunk starts and
 *   its reason is thrown unchanged.
 * @returns The results of `task`, in chunk order.
 * @throws {TypeError} when `requested` is not a positive integer.
 * @throws {SiteReadError} when at least one chunk failed; `cause` is the first failure.
 * @category Geodata
 */
// Maintainer note (not published): `min(requested, SITE_CHUNKS_IN_FLIGHT, chunks.length)`: the ceiling
// bounds the bytes held so it cannot be raised, but asking for less must get less; the clamp lives HERE
// so a service default of 10 or 20 cannot reach it. The transport aborts an in-flight request on the
// same `signal`. Python raises `TiledRunError` with the same records. An ABORT is the caller's own
// decision and propagates immediately and unchanged.
export async function eachChunk(chunks, task, requested, signal) {
    if (requested !== undefined && (!Number.isSafeInteger(requested) || requested < 1)) {
        throw new TypeError("maxWorkers must be a positive integer");
    }
    const out = Array.from({ length: chunks.length });
    const failures = [];
    let cursor = 0;
    const ceiling = Math.min(SITE_CHUNKS_IN_FLIGHT, requested ?? SITE_CHUNKS_IN_FLIGHT);
    const workers = Math.min(ceiling, Math.max(1, chunks.length));
    await Promise.all(Array.from({ length: workers }, async () => {
        while (cursor < chunks.length) {
            // Checked BEFORE each chunk starts, not only inside the request: once
            // the caller has given up, the remaining chunks must not be read at
            // all. An in-flight one is aborted by the same signal in the transport.
            if (signal?.aborted === true)
                throw signal.reason ?? new DOMException("aborted", "AbortError");
            const index = cursor++;
            const chunk = chunks[index];
            if (chunk === undefined)
                continue;
            try {
                out[index] = await task(chunk, index);
            }
            catch (error) {
                failures.push({ index, id: chunk.id, error });
            }
        }
    }));
    // Checked AGAIN, after the wave. An abort that lands on the LAST wave has
    // no chunk left to start, so the before-each-chunk check never runs again:
    // the transport's rejections would arrive as chunk failures and the caller
    // would be told the site is unreadable when what happened is that they gave
    // up. The abort reason wins over `SiteReadError` whenever both are true.
    if (signal?.aborted === true)
        throw signal.reason ?? new DOMException("aborted", "AbortError");
    if (failures.length > 0)
        throw siteReadFailure(failures, chunks.length);
    return out;
}
/** The refusal, with the failed chunks in row-major order. */
function siteReadFailure(failures, total) {
    const ordered = [...failures].sort((left, right) => left.index - right.index);
    const ids = ordered.map((failure) => failure.id);
    return new SiteReadError(`site read failed for ${String(ids.length)} of ${String(total)} read ` +
        `chunks (${ids.join(", ")}): every chunk feeds the site, so a partial ` +
        "answer would be an emptier city that nobody can see", ordered.map((failure) => ({
        tileId: failure.id,
        // A chunk has no place in the SIMULATION grid; the Python host writes
        // -1 in the same records for the same reason.
        row: -1,
        col: -1,
        error: failure.error instanceof Error
            ? failure.error.message
            : String(failure.error),
    })), ordered[0]?.error);
}
