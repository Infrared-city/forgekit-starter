import { requireCore } from "../internal/core.js";
import { decompose } from "./site-chunks.js";
import { METERS_PER_DEG_LAT } from "./http.js";
/**
 * Public shape-characterisation helpers over the rectangle-union
 * decomposition (D57 / rect-union kernel port).
 *
 * `decompose` itself moved onto `site-chunks.ts` (the only place this host
 * calls it). These three stayed PUBLIC on `/geodata` after `rect-union.ts`
 * was deleted (MIGRATION.md) — `slabToleranceDeg` crosses into the SAME
 * kernel export the decomposition uses, and `bboxAreaM2` / `unionAreaM2` are
 * plain arithmetic over its output, not part of the ported algorithm, so they
 * stay host-side rather than becoming a kernel export nothing else needs.
 */
/** Mirrors `ir_geo::rect_union::SLAB_TOLERANCE_FACTOR` — see its kernel doc. */
export const SLAB_TOLERANCE_FACTOR = 2;
/** Mirrors `ir_geo::rect_union::MAX_SLAB_TOLERANCE_DEG` — see its kernel doc. */
export const MAX_SLAB_TOLERANCE_DEG = 1e-4;
/**
 * The fusion tolerance a rectangle set earns, in degrees — via the kernel's
 * `rectUnionSlabToleranceDeg` export, the same derivation `decompose` uses
 * internally.
 */
export function slabToleranceDeg(rectangles) {
    const flatRectangles = Float64Array.from(rectangles.flatMap((rect) => [rect.west, rect.south, rect.east, rect.north]));
    return requireCore().rectUnionSlabToleranceDeg(flatRectangles);
}
/**
 * A rectangle's area in square metres, in the FLAT metre-per-degree
 * convention. `cosLat` is the cosine of ONE latitude for the whole
 * comparison — the site's mid latitude.
 */
export function bboxAreaM2(bbox, cosLat) {
    const width = (bbox.east - bbox.west) * METERS_PER_DEG_LAT * cosLat;
    const height = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
    return Math.max(0, width) * Math.max(0, height);
}
/**
 * The area the rectangles actually cover inside `clip`. The pieces are
 * disjoint, so their areas add.
 */
export function unionAreaM2(clip, rectangles, cosLat, pieces) {
    const parts = pieces ?? decompose(clip, rectangles);
    return parts.reduce((total, piece) => total + bboxAreaM2(piece, cosLat), 0);
}
