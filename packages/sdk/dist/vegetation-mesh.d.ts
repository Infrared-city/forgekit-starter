import { CoreVersionSkewError } from "./internal/errors.js";
/**
 * Local point-to-mesh conversion for trees.
 *
 * The Python SDK offers the same computation as
 * `VegetationServiceClient.convert_to_mesh(converter="local")` over
 * `ir_simprep::vegetation::convert_points_to_meshes`. This module is the
 * TypeScript host adapter for the same kernel function, exposed by the WASM
 * package as `vegetationPointsToMeshes`.
 *
 * The TypeScript SDK has never had a remote convert route, so this path is
 * local-only (recorded as D39). The option is still named `converter` so the
 * two SDKs read alike.
 *
 * Contract, matching the Python host: the collection carries
 * `referencePoint: [lon, lat]` (the origin of the local metric frame) and
 * `features` (GeoJSON Point features). `properties.height` / `height_m` and
 * `properties.crownDiameter` / `diameter_crown` / `diameter_m` / `crown_m`
 * are the dimension keys; `properties.modelId` selects a registry model.
 *
 * Registry: the kernel's baked registry document (v1.3.0) is the default
 * source. Untagged trees use its first model, an archetype (D10, D15).
 */
/** A dotbim mesh as the kernel emits it. */
export interface VegetationMesh extends Readonly<Record<string, unknown>> {
    readonly mesh_id: number;
    readonly coordinates: readonly number[];
    readonly indices: readonly number[];
}
/** A vegetation operation failed in a way the caller must see. */
export declare class VegetationMeshError extends Error {
    readonly name = "VegetationMeshError";
}
export interface ToMeshesOptions {
    /** Only `"local"` exists in TypeScript; see D39. */
    readonly converter?: "local";
    /** Overrides the kernel's baked registry document. */
    readonly registryJson?: string;
}
/**
 * Convert tree Point features to dotbim meshes with the initialized core.
 *
 * Errors are typed and never collapse to `[]`: an empty result means the
 * input held no convertible trees, never that the conversion failed.
 */
export declare function convertPointsToMeshesLocal(featureCollection: Readonly<Record<string, unknown>>, options?: Pick<ToMeshesOptions, "registryJson">): VegetationMesh[];
/** The kernel's baked vegetation registry document (v1.3.0) as JSON. */
export declare function vegetationRegistryDocument(): string;
export { CoreVersionSkewError };
