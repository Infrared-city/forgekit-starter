import { requireCore } from "../internal/core.js";
/**
 * The polygon-bbox south-west corner: the SITE frame origin (D1, D39).
 *
 * The rule is the kernel's `scalarPolygonOriginF64`, the one the Python host
 * calls: the exterior ring's smallest longitude and latitude, where a NaN
 * after the first position is skipped and a NaN first position stays (D160).
 * This function only packs the ring. Every TILE frame is the kernel's
 * business since D98.
 */
export function kernelPolygonOrigin(polygon) {
    const ring = polygon.coordinates[0] ?? [];
    const pairs = new Float64Array(ring.length * 2);
    for (const [index, point] of ring.entries()) {
        pairs[index * 2] = point[0];
        pairs[index * 2 + 1] = point[1];
    }
    const origin = requireCore().scalarPolygonOriginF64(new Uint8Array(pairs.buffer));
    return { lon: origin[0], lat: origin[1] };
}
