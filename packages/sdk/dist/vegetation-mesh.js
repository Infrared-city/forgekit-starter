import { requireCore } from "./internal/core.js";
import { CoreVersionSkewError } from "./internal/errors.js";
/**
 * Thrown when a vegetation operation fails in a way the caller must see, for
 * example a malformed feature collection or a failed conversion.
 *
 * @category Errors
 */
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
 * Converts tree Point features to dotbim meshes, locally.
 *
 * Errors are typed and never collapse to `[]`: an empty result means the input
 * held no convertible trees, never that the conversion failed.
 *
 * @param featureCollection - A feature collection with `referencePoint: [lon, lat]`
 *   and `features` (GeoJSON Point features).
 * @param options - `registryJson` replaces the built-in tree registry.
 * @returns One mesh per convertible tree.
 * @throws {VegetationMeshError} when `featureCollection` is not an object, has no
 *   valid `referencePoint` or no `features` array, or the conversion fails.
 * @category Vegetation
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
/**
 * The built-in tree registry document, as JSON text.
 *
 * Pass an edited copy as `registryJson` to replace it.
 *
 * @returns The registry document.
 * @category Vegetation
 */
export function vegetationRegistryDocument() {
    return requireCore().vegetationRegistryDocument();
}
export { CoreVersionSkewError };
