import { requireCore } from "../internal/core.js";
import { decompose } from "./site-chunks.js";
import { METERS_PER_DEG_LAT } from "./http.js";
// Maintainer note (not published): Public shape-characterisation helpers over
// the rectangle-union decomposition (D57 / rect-union kernel port).
// `decompose` itself moved onto `site-chunks.ts` (the only place this host
// calls it). These three stayed PUBLIC on `/geodata` after `rect-union.ts`
// was deleted (MIGRATION.md): `slabToleranceDeg` crosses into the SAME kernel
// export the decomposition uses, and `bboxAreaM2` / `unionAreaM2` are plain
// arithmetic over its output, not part of the ported algorithm, so they stay
// host-side rather than becoming a kernel export nothing else needs.
/**
 * Safety multiplier (`2`) applied to half the spread of the rectangle widths
 * when {@link slabToleranceDeg} derives the edge-fusion tolerance.
 *
 * @category Geodata
 */
// Maintainer note (not published): Mirrors
// `ir_geo::rect_union::SLAB_TOLERANCE_FACTOR`; see its kernel doc.
export const SLAB_TOLERANCE_FACTOR = 2;
/**
 * Upper limit, in degrees (`1e-4`), on the edge-fusion tolerance
 * {@link slabToleranceDeg} can return.
 *
 * @category Geodata
 */
// Maintainer note (not published): Mirrors
// `ir_geo::rect_union::MAX_SLAB_TOLERANCE_DEG`; see its kernel doc.
export const MAX_SLAB_TOLERANCE_DEG = 1e-4;
/**
 * The edge-fusion tolerance a set of rectangles earns, in degrees.
 *
 * It is {@link SLAB_TOLERANCE_FACTOR} times half the spread of the rectangle
 * widths, capped at {@link MAX_SLAB_TOLERANCE_DEG}. Rectangle edges closer
 * together than this are treated as one edge when a site is decomposed into
 * pieces. A set of equal-width rectangles gets `0`.
 *
 * @param rectangles - The rectangles, in WGS84 degrees.
 * @returns The tolerance, in degrees.
 * @category Geodata
 */
// Maintainer note (not published): Via the kernel's
// `rectUnionSlabToleranceDeg` export, the same derivation `decompose` uses
// internally.
export function slabToleranceDeg(rectangles) {
    const flatRectangles = Float64Array.from(rectangles.flatMap((rect) => [rect.west, rect.south, rect.east, rect.north]));
    return requireCore().rectUnionSlabToleranceDeg(flatRectangles);
}
/**
 * A rectangle's area in square metres, using one flat metres-per-degree scale.
 *
 * @param bbox - The rectangle, in WGS84 degrees.
 * @param cosLat - The cosine of a single latitude used for the whole
 *   comparison, normally the site's mid latitude.
 * @returns The area in square metres; never negative.
 * @category Geodata
 */
export function bboxAreaM2(bbox, cosLat) {
    const width = (bbox.east - bbox.west) * METERS_PER_DEG_LAT * cosLat;
    const height = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
    return Math.max(0, width) * Math.max(0, height);
}
/**
 * The area, in square metres, that a set of rectangles covers inside `clip`.
 *
 * @param clip - The rectangle to measure inside, in WGS84 degrees.
 * @param rectangles - The rectangles whose union is measured.
 * @param cosLat - The cosine of a single latitude used for the whole
 *   comparison, as for {@link bboxAreaM2}.
 * @param pieces - The already-computed disjoint pieces of
 *   `clip ∩ union(rectangles)`. Computed when omitted.
 * @returns The covered area in square metres.
 * @category Geodata
 */
// Maintainer note (not published): The pieces are disjoint, so their areas
// add.
export function unionAreaM2(clip, rectangles, cosLat, pieces) {
    const parts = pieces ?? decompose(clip, rectangles);
    return parts.reduce((total, piece) => total + bboxAreaM2(piece, cosLat), 0);
}
