import { unionBbox } from "./overture-area.js";
import { requireCore } from "../internal/core.js";
import { SiteReadError } from "./errors.js";
import { consoleLogger } from "../logger.js";
import { METERS_PER_DEG_LAT } from "./http.js";
/**
 * The READ chunking of a site (WP14-A).
 *
 * Acquisition and simulation tiling are decoupled: a 5 km2 site is 81
 * overlapping 512 m simulation tiles, but it is ONE Overture read, and a 20 km2
 * site is a handful of ~2x2 km read chunks. The chunk grid exists only to bound
 * how much parquet is in flight and in memory at once — every chunk's features
 * go into ONE compose call over the whole chunk list, so the answer does not
 * depend on where the chunk boundaries fall.
 *
 * Below {@link SITE_CHUNK_THRESHOLD_KM2} the site is one read CHUNK. Its
 * compose list is still `chunk ∩ union(tile rectangles)` (D57), so a
 * RECTANGULAR small site is one rectangle — the case the WP13 kernel gate
 * `a_one_rectangle_compose_is_the_single_tile_operation` pins as byte-identical
 * to a single `groundMaterialsCompose` — while an L-shaped or sparse small site
 * is composed as `site-p0…`. Before WP21 it was one rectangle whatever the
 * shape.
 */
/** A site smaller than this is read as ONE rectangle. */
export const SITE_CHUNK_THRESHOLD_KM2 = 4;
/**
 * One site frame is recommended up to this area, in km2.
 *
 * `LocalFrame` (D1) fixes the east-west scale at the frame's ORIGIN latitude,
 * so shape error grows with distance from it: 0.04 % at 5 km2, 0.06 % at
 * 10 km2 and 0.08 % at 20 km2 at 48 deg N — a 100 m building off by under
 * 8 cm at the far corner. Above it the SDK WARNS, naming the error; the hard
 * stop is the planned-bytes ceiling. The Python host warns at the same size
 * with the same reason (`ground_materials/_site_chunks.py`), so a caller who
 * uses both hosts is told the same thing by both.
 */
export const SITE_AREA_WARNING_KM2 = 20;
/**
 * One site frame is recommended up to this EXTENT on its longest side, in km.
 *
 * The frame error grows with EXTENT, not with area: a 10 km x 300 m strip is
 * 3 km2 — a seventh of {@link SITE_AREA_WARNING_KM2} — and carries the
 * far-end error of a site 10 km across. At 48 deg N a 5 km extent is about
 * 4.4 m, the same order as the 20 km2 rule's 3.5 m, so the two are one
 * tolerance read on the two axes a site can be big on (D57).
 */
export const SITE_EXTENT_WARNING_KM = 5;
/**
 * Target chunk edge in metres — Jo's "about 2 x 2 km", whatever the site shape.
 *
 * An earlier WP21 round halved it for an elongated site, to read a sliver in
 * finer pieces. It was DROPPED (fix round 0): the Python host reads Overture per
 * chunk, so on a 10 km x 300 m corridor 1 km chunks took its planned compressed
 * parquet from 1,041 MiB to 2,971 MiB for no wall-time gain — a row group spans
 * far more ground than a chunk, so every extra chunk re-fetches the same bytes.
 * The win of WP21 is the COMPOSE list, not the read grid. The named follow-up
 * for a strip's read cost is the Python Overture read once per site, which is
 * what this host already does.
 */
export const SITE_CHUNK_EDGE_M = 2_000;
/** Chunks fetched at once. Two, so one is decoding while the next arrives. */
export const SITE_CHUNKS_IN_FLIGHT = 2;
/**
 * `clip ∩ union(rectangles)`, via the kernel's `rectUnionDecompose` export
 * (D57 / rect-union kernel port) — flat `[west, south, east, north, ...]`
 * buffers, one crossing per call. The Python twin crosses through the SAME
 * kernel operation (`ground_materials/_site_chunks.py`), which is what makes
 * agreement structural now rather than merely tested by pinned fixtures.
 * Exported because the buildings leg (`buildings-extrude.ts`) decomposes the
 * SITE the same way.
 */
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
/** Rough area of a WGS84 rectangle in km2 — a SIZING decision, not geometry. */
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
 * Name a decomposition's pieces — THE single home of the piece-id format.
 *
 * ONE piece keeps the OWNER's own id: for a chunk that is the compact-site case,
 * where the piece IS the chunk and the kernel argument must not move at all.
 * Several pieces are `<owner id>-p<index>` in decomposition order. Exported
 * because the buildings leg names the SITE's pieces with the same rule
 * (`buildings-extrude.ts`) and two spellings of one format is two formats.
 * The Python twin is `_site_chunks.piece_ids`.
 */
export function namePieces(id, pieces) {
    return pieces.length === 1
        ? [{ id, bbox: pieces[0] }]
        : pieces.map((piece, index) => ({ id: `${id}-p${String(index)}`, bbox: piece }));
}
function named(id, bbox, pieces) {
    return { id, bbox, pieces: namePieces(id, pieces) };
}
/**
 * The site rectangle split into read chunks, in row-major (south-to-north,
 * west-to-east) order.
 *
 * Order is part of the contract: the chunk list is handed to the kernel as the
 * rectangle list, and the kernel's first-seen merge lets the caller's order
 * decide which copy of a feature that spans two chunks survives. Row-major is
 * the same order the tile grid uses.
 *
 * `used` is the simulation-tile rectangle list. A chunk that meets NONE of
 * them is DROPPED: an L-shaped or sparse polygon has whole quadrants of its
 * bounding box that no tile covers, and composing them would clip, buffer and
 * clean ground no simulation will ever read, then carry it through the merge.
 * The chunk GRID still spans the bounding box, because that is the shape the
 * Overture read pushes down on (a bbox), so dropping a chunk changes what is
 * COMPOSED, never what is fetched.
 */
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
 * Warn once per call when the site is bigger than one frame is recommended
 * for, and say by how much the far end is off.
 *
 * TWO rules, because one number does not cover both shapes: the AREA rule of
 * D48, and the EXTENT rule of D57 — a 10 km x 300 m strip is 3 km2 and carries
 * the far-end error of a site 10 km across, so area alone never warns about
 * it.
 *
 * Both messages are the Python host's, word for word and with the same
 * numbers, because they are the same decision. Neither says `runArea` or
 * `run_area`, so the two hosts can say exactly the same thing.
 *
 * It goes through the caller's {@link Logger}, never `console` directly: a
 * browser or Worker caller who chose `silentLogger` must not get SDK output
 * in the page console, and a Node caller must be able to capture it. The
 * default is `consoleLogger`, which is what a direct `/geodata` caller had
 * before.
 *
 * Exported for the BUILDINGS leg (`buildings-area.ts`), which decomposes the
 * site without going through `siteChunks` and so said nothing about the frame
 * at all (FINAL-SANITY F5). It is a module export, not a `/geodata` export: it
 * is how the two acquisition legs say one thing, not a surface a caller needs.
 * Each leg warns once per acquisition — a caller who reads buildings AND
 * ground makes two calls and is told about each read, which is the per-call
 * rule this host already followed.
 */
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
 * The flat frame's far-end error for a site `extentM` across.
 *
 * ONE local frame fixes the east-west scale at its origin latitude, so a point
 * `extentM` north of that origin is scaled by `cos(lat + extent) / cos(lat)`
 * and a point `extentM` east of it is displaced by that relative error times
 * the distance. The error therefore goes as the SQUARE of the extent, which is
 * why it is stated per extent and not per area. It reproduces D48's whole
 * table at 48 deg N — 0.9 m at 2.24 km (5 km2), 1.7 m at 3.16 km (10 km2),
 * 3.5 m at 4.47 km (20 km2) — and goes on to 4.4 m at 5 km and 17.4 m at
 * 10 km. The
 * Python host computes it the same way (`ground_materials/_site_warnings.py`).
 */
export function farEndErrorM(southLat, extentM) {
    const cosOrigin = Math.cos((southLat * Math.PI) / 180);
    if (cosOrigin === 0)
        return 0;
    const farLat = southLat + extentM / METERS_PER_DEG_LAT;
    return Math.abs(1 - Math.cos((farLat * Math.PI) / 180) / cosOrigin) * extentM;
}
/** The site rectangle for a list of simulation-tile query rectangles. */
export function siteRectangle(rectangles) {
    return unionBbox(rectangles);
}
/**
 * Run `task` over the chunks, at most {@link SITE_CHUNKS_IN_FLIGHT} at once.
 *
 * `requested` is a caller's own concurrency option. It is honoured as
 * `min(requested, SITE_CHUNKS_IN_FLIGHT, chunks.length)`: the ceiling is what
 * bounds the bytes held, so it cannot be raised, but a caller who asks for
 * less must get less rather than have the option quietly ignored. The clamp
 * lives HERE, at the only place chunks are read, so a service default of 10
 * or 20 cannot reach it — which is the whole point of the bound.
 *
 * `signal` is checked before each chunk STARTS. The transport aborts an
 * in-flight request on the same signal, so nothing outlives the caller's
 * deadline: what is running stops, and what has not begun never does.
 *
 * A chunk that FAILS does not stop the wave: the remaining chunks are read so
 * the caller is told about every chunk that died, not only the first one, and
 * the whole read then raises {@link SiteReadError} carrying those chunk ids
 * with the first failure as its `cause`. The Python host raises
 * `TiledRunError` with the same records for the same reason. A partial site is
 * never returned. An ABORT is different: it is the caller's own decision, so
 * it propagates immediately and unchanged.
 */
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
