import type { Bbox } from "./http.js";
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
export declare const SLAB_TOLERANCE_FACTOR = 2;
/** Mirrors `ir_geo::rect_union::MAX_SLAB_TOLERANCE_DEG` — see its kernel doc. */
export declare const MAX_SLAB_TOLERANCE_DEG = 0.0001;
/**
 * The fusion tolerance a rectangle set earns, in degrees — via the kernel's
 * `rectUnionSlabToleranceDeg` export, the same derivation `decompose` uses
 * internally.
 */
export declare function slabToleranceDeg(rectangles: readonly Bbox[]): number;
/**
 * A rectangle's area in square metres, in the FLAT metre-per-degree
 * convention. `cosLat` is the cosine of ONE latitude for the whole
 * comparison — the site's mid latitude.
 */
export declare function bboxAreaM2(bbox: Bbox, cosLat: number): number;
/**
 * The area the rectangles actually cover inside `clip`. The pieces are
 * disjoint, so their areas add.
 */
export declare function unionAreaM2(clip: Bbox, rectangles: readonly Bbox[], cosLat: number, pieces?: readonly Bbox[]): number;
