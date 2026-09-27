import { requireCore } from "./internal/core.js";
import { CoreVersionSkewError } from "./internal/errors.js";
/** A vegetation operation failed in a way the caller must see. */
export class VegetationMeshError extends Error {
    name = "VegetationMeshError";
}
function referencePoint(collection) {
    const point = collection["referencePoint"];
    const valid = Array.isArray(point) &&
        point.length === 2 &&
        point.every((value) => typeof value === "number" && Number.isFinite(value));
    if (!valid) {
        throw new VegetationMeshError("featureCollection must carry referencePoint [lon, lat] (the metric frame origin)");
    }
    return [point[0], point[1]];
}
/**
 * Convert tree Point features to dotbim meshes with the initialized core.
 *
 * Errors are typed and never collapse to `[]`: an empty result means the
 * input held no convertible trees, never that the conversion failed.
 */
export function convertPointsToMeshesLocal(featureCollection, options = {}) {
    if (featureCollection === null ||
        typeof featureCollection !== "object" ||
        Array.isArray(featureCollection)) {
        throw new VegetationMeshError("featureCollection must be an object");
    }
    const [lon, lat] = referencePoint(featureCollection);
    const features = featureCollection["features"];
    if (!Array.isArray(features)) {
        throw new VegetationMeshError("featureCollection.features must be an array");
    }
    const core = requireCore();
    const registry = options.registryJson ?? core.vegetationRegistryDocument();
    let meshes;
    try {
        meshes = JSON.parse(core.vegetationPointsToMeshes(JSON.stringify(features), lon, lat, registry));
    }
    catch (error) {
        throw new VegetationMeshError(`local geojson-to-mesh failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
    if (!Array.isArray(meshes)) {
        throw new VegetationMeshError(`local geojson-to-mesh returned ${typeof meshes}, expected an array`);
    }
    return meshes;
}
/** The kernel's baked vegetation registry document (v1.3.0) as JSON. */
export function vegetationRegistryDocument() {
    return requireCore().vegetationRegistryDocument();
}
export { CoreVersionSkewError };
