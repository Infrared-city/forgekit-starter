import { CoreVersionSkewError } from "./internal/errors.js";
/**
 * Local point-to-mesh conversion for trees.
 *
 * The input is a GeoJSON feature collection that carries
 * `referencePoint: [lon, lat]` (the origin of the local metric frame) and
 * `features` (GeoJSON Point features). The dimension keys are
 * `properties.height` / `height_m` and `properties.crownDiameter` /
 * `diameter_crown` / `diameter_m` / `crown_m`; `properties.modelId` selects a
 * tree model from the registry.
 *
 * The built-in registry document is the default source. A tree without a model
 * id uses its first model, an archetype.
 */
/**
 * One tree mesh in dotbim form: flat vertex coordinates plus triangle indices.
 *
 * @category Vegetation
 */
export interface VegetationMesh extends Readonly<Record<string, unknown>> {
    /** Identifier of the mesh. */
    readonly mesh_id: number;
    /** Flat vertex coordinates `[x, y, z, ...]`, in metres in the local frame. */
    readonly coordinates: readonly number[];
    /** Flat triangle vertex indices. */
    readonly indices: readonly number[];
}
/**
 * Thrown when a vegetation operation fails in a way the caller must see, for
 * example a malformed feature collection or a failed conversion.
 *
 * @category Errors
 */
export declare class VegetationMeshError extends Error {
    readonly name = "VegetationMeshError";
}
/**
 * Options for `VegetationService.toMeshes`.
 *
 * @category Vegetation
 */
export interface ToMeshesOptions {
    /** Where the conversion runs. Only `"local"` is supported, and it is the default. */
    readonly converter?: "local";
    /** Replaces the built-in tree registry document with your own, as JSON text. */
    readonly registryJson?: string;
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
export declare function convertPointsToMeshesLocal(featureCollection: Readonly<Record<string, unknown>>, options?: Pick<ToMeshesOptions, "registryJson">): VegetationMesh[];
/**
 * The built-in tree registry document, as JSON text.
 *
 * Pass an edited copy as `registryJson` to replace it.
 *
 * @returns The registry document.
 * @category Vegetation
 */
export declare function vegetationRegistryDocument(): string;
export { CoreVersionSkewError };
