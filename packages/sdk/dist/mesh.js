import { requireCore } from "./internal/core.js";
function validateCoordinates(coordinates) {
    for (const coordinate of coordinates) {
        if (typeof coordinate !== "number" || !Number.isFinite(coordinate)) {
            throw new TypeError("coordinates must contain only finite numbers");
        }
    }
}
function validateIndices(indices) {
    for (const index of indices) {
        if (typeof index !== "number" || !Number.isFinite(index)) {
            throw new TypeError("indices must contain only finite numbers");
        }
    }
}
/**
 * Pack a triangle mesh into the compact form used for request bodies.
 *
 * `initializeCore()` must have completed. Check the result for a
 * `not_representable` field before using it as a `PackedMesh`.
 *
 * @param coordinates - Flat vertex coordinates (`x, y, z, x, y, z, ...`).
 * @param indices - Flat triangle vertex indices, three per triangle.
 * @returns The packed mesh, or a verdict saying why the mesh cannot be packed.
 * @throws {TypeError} when `coordinates` or `indices` contains a non-finite number.
 *
 * @category Buildings
 */
export function packMesh(coordinates, indices) {
    validateCoordinates(coordinates);
    validateIndices(indices);
    const coordinateBuffer = coordinates instanceof Float64Array ? coordinates : new Float64Array(coordinates);
    return requireCore().packMesh(coordinateBuffer, indices);
}
