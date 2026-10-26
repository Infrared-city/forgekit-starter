import type { Bbox } from "./http.js";
/**
 * Safety multiplier (`2`) applied to half the spread of the rectangle widths
 * when {@link slabToleranceDeg} derives the edge-fusion tolerance.
 *
 * @category Geodata
 */
export declare const SLAB_TOLERANCE_FACTOR = 2;
/**
 * Upper limit, in degrees (`1e-4`), on the edge-fusion tolerance
 * {@link slabToleranceDeg} can return.
 *
 * @category Geodata
 */
export declare const MAX_SLAB_TOLERANCE_DEG = 0.0001;
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
export declare function slabToleranceDeg(rectangles: readonly Bbox[]): number;
/**
 * A rectangle's area in square metres, using one flat metres-per-degree scale.
 *
 * @param bbox - The rectangle, in WGS84 degrees.
 * @param cosLat - The cosine of a single latitude used for the whole
 *   comparison, normally the site's mid latitude.
 * @returns The area in square metres; never negative.
 * @category Geodata
 */
export declare function bboxAreaM2(bbox: Bbox, cosLat: number): number;
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
export declare function unionAreaM2(clip: Bbox, rectangles: readonly Bbox[], cosLat: number, pieces?: readonly Bbox[]): number;
