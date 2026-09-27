import type { Polygon } from "./types.js";
/** A frame origin in WGS84 degrees. */
export interface FrameOrigin {
    readonly lon: number;
    readonly lat: number;
}
/**
 * The polygon-bbox south-west corner: the SITE frame origin (D1, D39).
 *
 * The rule is the kernel's `scalarPolygonOriginF64`, the one the Python host
 * calls: the exterior ring's smallest longitude and latitude, where a NaN
 * after the first position is skipped and a NaN first position stays (D160).
 * This function only packs the ring. Every TILE frame is the kernel's
 * business since D98.
 */
export declare function kernelPolygonOrigin(polygon: Polygon): FrameOrigin;
