import { unionBbox } from "./overture-area.js";
import { requireCore } from "../internal/core.js";
import { SiteReadError } from "./errors.js";
import { consoleLogger } from "../logger.js";
import { METERS_PER_DEG_LAT } from "./http.js";
// Maintainer note (not published): The READ chunking of a site (WP14-A). A 5 km2 site is 81 overlapping
// 512 m simulation tiles but ONE Overture read; a 20 km2 site is a handful of ~2x2 km read chunks. The
// grid only bounds how much parquet is in flight and in memory: every chunk's features go into ONE
// compose call over the whole chunk list, so the answer does not depend on where boundaries fall. Below
// SITE_CHUNK_THRESHOLD_KM2 the site is one read CHUNK; its compose list is `chunk ∩ union(tile
// rectangles)` (D57), so a RECTANGULAR small site is one rectangle (WP13 gate
// `a_one_rectangle_compose_is_the_single_tile_operation`: byte-identical to a single
// `groundMaterialsCompose`) while an L-shaped or sparse one is composed as `site-p0…` (was one
// rectangle whatever the shape before WP21).
/**
 * A site smaller than this area, in km2 (`4`), is read as one rectangle.
 *
 * @category Geodata
 */
export const SITE_CHUNK_THRESHOLD_KM2 = 4;
/**
 * Site area, in km2 (`20`), up to which a single local frame is recommended.
 *
 * Above it the SDK logs a warning naming how far shapes at the far corner are
 * off. The hard limit is the planned-bytes ceiling of the read.
 *
 * @category Geodata
 */
// Maintainer note (not published): `LocalFrame` (D1) fixes the east-west scale at the frame's ORIGIN
// latitude: error is 0.04 % at 5 km2, 0.06 % at 10 km2, 0.08 % at 20 km2 at 48 deg N (a 100 m building
// off by under 8 cm). Python warns at the same size (`ground_materials/_site_chunks.py`).
export const SITE_AREA_WARNING_KM2 = 20;
/**
 * Longest side, in km (`5`), up to which a single local frame is recommended.
 *
 * The frame error grows with extent as well as area, so a long, narrow site
 * can exceed it while staying under `SITE_AREA_WARNING_KM2`. Above it the SDK
 * logs a warning.
 *
 * @category Geodata
 */
// Maintainer note (not published): A 10 km x 300 m strip is 3 km2 yet carries the far-end error of a site
// 10 km across. At 48 deg N a 5 km extent is about 4.4 m, like the 20 km2 rule's 3.5 m (D57).
export const SITE_EXTENT_WARNING_KM = 5;
/**
 * Target edge length, in metres (`2000`), of a read chunk, whatever the site shape.
 *
 * @category Geodata
 */
// Maintainer note (not published): Jo's "about 2 x 2 km". An earlier WP21 round halved it for an
// elongated site; DROPPED (fix round 0): the Python host reads Overture per chunk, so on a 10 km x
// 300 m corridor 1 km chunks took its planned parquet from 1,041 to 2,971 MiB for no wall-time gain
// (a row group spans far more ground than a chunk). The WP21 win is the COMPOSE list, not the read
// grid; its follow-up (Python reads Overture once per site) is what this host already does.
export const SITE_CHUNK_EDGE_M = 2_000;
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
 * Rough area of a WGS84 rectangle in km2, for sizing decisions rather than geometry.
 *
 * @category Geodata
 */
export function bboxAreaKm2(bbox) {
    const midLat = (bbox.south + bbox.north) / 2;
    const height = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
    const width = (bbox.east - bbox.west) * METERS_PER_DEG_LAT *
        Math.cos((midLat * Math.PI) / 180);
    return Math.max(0, height) * Math.max(0, width) / 1_000_000;
}
/** A chunk with its compose pieces, or a defect when it has none. */
function withPieces(id, bbox, rectangles) {
    const pieces = decompose(bbox, rectangles);
    // The site rectangle is the union of the tile rectangles, so at least one of
    // them must meet it with area. An empty list here is a defect in the
    // decomposition, not a site shape, and composing nothing would answer with
    // an empty city.
    if (pieces.length === 0)
        throw new Error("no read chunk meets any tile rectangle");
    return named(id, bbox, pieces);
}
/**
 * Give each piece of a decomposition an id.
 *
 * A single piece keeps the owner's own `id`; several pieces are
 * `<id>-p<index>` in decomposition order.
 *
 * @category Geodata
 */
// Maintainer note (not published): THE single home of the piece-id format; for a chunk the one-piece
// case is the compact site, where the kernel argument must not move. Exported: `buildings-extrude.ts`
// names the SITE's pieces with it. The Python twin is `_site_chunks.piece_ids`.
export function namePieces(id, pieces) {
    return pieces.length === 1
        ? [{ id, bbox: pieces[0] }]
        : pieces.map((piece, index) => ({ id: `${id}-p${String(index)}`, bbox: piece }));
}
function named(id, bbox, pieces) {
    return { id, bbox, pieces: namePieces(id, pieces) };
}
/**
 * Split a site rectangle into read chunks, in row-major (south-to-north,
 * west-to-east) order.
 *
 * A site up to `SITE_CHUNK_THRESHOLD_KM2` is one chunk with the id `site`;
 * larger sites are cut into chunks of about `SITE_CHUNK_EDGE_M` metres. A chunk
 * that meets none of the `used` rectangles is dropped, so ground no simulation
 * reads is never composed.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param used - The simulation-tile rectangles. Defaults to the site itself.
 * @param logger - Receives the warning for a site larger than one local frame.
 * @returns The chunks, each with its compose pieces.
 * @category Geodata
 */
// Maintainer note (not published): Order is part of the contract: the chunk list is the kernel's rectangle
// list, and its first-seen merge lets the order decide which copy of a feature spanning two chunks
// survives (row-major is the tile grid's order). The GRID still spans the bounding box, the shape the
// Overture read pushes down on: dropping a chunk changes what is COMPOSED, never what is fetched.
export function siteChunks(site, used, logger = consoleLogger) {
    warnIfOverOneFrame(site, logger);
    const rectangles = used ?? [site];
    if (bboxAreaKm2(site) <= SITE_CHUNK_THRESHOLD_KM2) {
        return [withPieces("site", site, rectangles)];
    }
    const midLat = (site.south + site.north) / 2;
    const stepLat = SITE_CHUNK_EDGE_M / METERS_PER_DEG_LAT;
    const stepLon = SITE_CHUNK_EDGE_M /
        (METERS_PER_DEG_LAT * Math.max(Math.cos((midLat * Math.PI) / 180), 1e-6));
    const rows = Math.max(1, Math.ceil((site.north - site.south) / stepLat));
    const cols = Math.max(1, Math.ceil((site.east - site.west) / stepLon));
    const chunks = [];
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            const bbox = {
                west: site.west + (col * (site.east - site.west)) / cols,
                east: site.west + ((col + 1) * (site.east - site.west)) / cols,
                south: site.south + (row * (site.north - site.south)) / rows,
                north: site.south + ((row + 1) * (site.north - site.south)) / rows,
            };
            const pieces = decompose(bbox, rectangles);
            // A chunk that covers NO tile rectangle with any area is dropped: the
            // grid spans the BOUNDING BOX, and for an L-shaped or diagonal polygon
            // the notch is bounding box but not tile. Dropping it changes what is
            // COMPOSED, never what is fetched.
            if (pieces.length === 0)
                continue;
            chunks.push(named(`chunk-r${String(row)}c${String(col)}`, bbox, pieces));
        }
    }
    // A chunk grid that dropped everything would read as an empty site. It
    // cannot happen — the grid spans the union of `used` — so it is a defect,
    // not a case.
    if (chunks.length === 0)
        throw new Error("no read chunk meets any tile rectangle");
    return chunks;
}
/**
 * Warn once per call when a site is larger than a single local frame is
 * recommended for, and say how far off the far end is.
 *
 * Two rules apply: the area rule (`SITE_AREA_WARNING_KM2`) and the extent rule
 * (`SITE_EXTENT_WARNING_KM`), because a long, narrow strip can be small in
 * area and still carry the error of a long site. The warning is written to
 * `logger`, never directly to the console.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param logger - Where the warning is written.
 * @category Geodata
 */
// Maintainer note (not published): Area rule is D48, extent rule D57. Both messages are the Python
// host's, word for word, and neither says `runArea`/`run_area`. Through the caller's Logger so a
// `silentLogger` caller gets no console output (default `consoleLogger`). Exported for the BUILDINGS
// leg (`buildings-area.ts`), which skips `siteChunks` (FINAL-SANITY F5); each leg warns once per call.
export function warnIfOverOneFrame(site, logger) {
    const midLat = (site.south + site.north) / 2;
    const cosMid = Math.cos((midLat * Math.PI) / 180);
    const widthM = (site.east - site.west) * METERS_PER_DEG_LAT * cosMid;
    const heightM = (site.north - site.south) * METERS_PER_DEG_LAT;
    const area = bboxAreaKm2(site);
    if (area > SITE_AREA_WARNING_KM2) {
        const error = Math.abs(1 - Math.cos((site.north * Math.PI) / 180) / cosMid) * 100;
        logger.warn(`this area is ${area.toFixed(1)} km2, above the ${SITE_AREA_WARNING_KM2} km2 one run ` +
            "is recommended for: every layer is stored in ONE local frame whose " +
            "east-west scale is fixed at its origin latitude, so shapes at the far " +
            `corner are off by about ${error.toFixed(2)} %. Results stay usable; for exact ` +
            "geometry split the area into several area runs — raster results are " +
            "geo-referenced by bounds and stitch by lat/lon.");
    }
    const longestM = Math.max(widthM, heightM);
    if (longestM > SITE_EXTENT_WARNING_KM * 1_000) {
        logger.warn(`this site is ${(longestM / 1_000).toFixed(1)} km along its longest side, above the ` +
            `${SITE_EXTENT_WARNING_KM.toFixed(1)} km one run is recommended for: every layer is ` +
            "stored in ONE local frame whose east-west scale is fixed at its origin " +
            "latitude, so the far-end error grows with EXTENT, not with area — a long, " +
            "narrow site carries the error of a site as long. Here it is about " +
            `${farEndErrorM(site.south, longestM).toFixed(2)} m. Results stay usable; for exact ` +
            "geometry split the site into several area runs — raster results are " +
            "geo-referenced by bounds and stitch by lat/lon.");
    }
}
/**
 * The far-end error, in metres, of one flat local frame for a site `extentM` across.
 *
 * The error grows with the square of the extent. At 48 deg N it is about
 * 0.9 m at 2.24 km, 3.5 m at 4.47 km and 17.4 m at 10 km.
 *
 * @param southLat - The latitude of the frame origin, in degrees.
 * @param extentM - The site extent, in metres.
 * @category Geodata
 */
// Maintainer note (not published): A point `extentM` north of the origin is scaled by
// `cos(lat + extent) / cos(lat)` and a point `extentM` east is displaced by that relative error times
// the distance, hence the square of the extent. Reproduces D48's table at 48 deg N (0.9 m at 2.24 km,
// 1.7 m at 3.16 km, 3.5 m at 4.47 km) and goes on to 4.4 m at 5 km. Python: `_site_warnings.py`.
export function farEndErrorM(southLat, extentM) {
    const cosOrigin = Math.cos((southLat * Math.PI) / 180);
    if (cosOrigin === 0)
        return 0;
    const farLat = southLat + extentM / METERS_PER_DEG_LAT;
    return Math.abs(1 - Math.cos((farLat * Math.PI) / 180) / cosOrigin) * extentM;
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
