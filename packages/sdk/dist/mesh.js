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
export function packMesh(coordinates, indices) {
    validateCoordinates(coordinates);
    validateIndices(indices);
    const coordinateBuffer = coordinates instanceof Float64Array ? coordinates : new Float64Array(coordinates);
    return requireCore().packMesh(coordinateBuffer, indices);
}
