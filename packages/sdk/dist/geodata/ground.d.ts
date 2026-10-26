import { type ReadFgbOptions } from "./fgb.js";
import { type ReadOvertureOptions } from "./overture.js";
import type { Bbox } from "./http.js";
/**
 * URL of the OSM road centrelines (with a surface tag) on the public Infrared
 * data mirror.
 *
 * @category Geodata
 */
export declare const ROADS_URL = "https://geo.infrared.city/roads-surface-world.fgb";
/**
 * The Overture Maps base themes read to compose ground materials: `land_cover`,
 * `land_use` and `water`.
 *
 * @category Geodata
 */
export declare const GROUND_COLLECTIONS: readonly string[];
/**
 * Composed ground materials: material name to GeoJSON feature collection, in
 * z order.
 *
 * @category Geodata
 */
export type GroundLayers = Record<string, {
    type: string;
    features: unknown[];
}>;
/**
 * Options for the ground-material readers.
 *
 * Combines the FlatGeobuf read options, the Overture read options and
 * {@link ComposeFrame}.
 *
 * @category Geodata
 */
export interface AcquireGroundOptions extends ReadFgbOptions, ReadOvertureOptions, ComposeFrame {
}
/**
 * Normalise road features read from the FlatGeobuf file into the shape the
 * ground composer takes as input.
 *
 * Use this when you already hold feature objects. The acquisition functions do
 * not call it; they pass the road data on as text.
 *
 * The id of a road comes from its `@id` property only. `surface` and `lanes`
 * are read from the feature's own properties, where the world file does not
 * carry them, so every road composes as asphalt.
 *
 * @param features - Road features as read from the world FlatGeobuf file.
 * @returns The normalised road features.
 * @category Ground materials
 */
export declare function roadsToIrFeatures(features: ReadonlyArray<Record<string, unknown>>): Array<Record<string, unknown>>;
/**
 * Ground materials composed for an area, parsed into objects.
 *
 * @category Geodata
 */
export interface DirectGroundResult {
    /** The composed layers, material name to GeoJSON feature collection. */
    readonly layers: GroundLayers;
    /** Features across every composed layer. */
    readonly featureCount: number;
    /** Overture release the base themes came from, for reproducibility. */
    readonly overtureRelease: string;
}
/**
 * Ground materials composed for an area, as unparsed JSON text.
 *
 * @category Geodata
 */
export interface AcquireGroundJson {
    /** The composed `{material: FeatureCollection}` document, as text. */
    readonly json: string;
    /** Overture release the base themes came from, for reproducibility. */
    readonly overtureRelease: string;
}
/**
 * Frame option shared by the ground-material readers.
 *
 * @category Geodata
 */
export interface ComposeFrame {
    /**
     * The area-level frame origin as `[longitude, latitude]` in degrees: the
     * south-west corner of the tiling polygon. Pass the same origin for every
     * tile of one area so that a road fetched by two overlapping tiles is
     * buffered identically and the duplicate can be removed. Defaults to the
     * south-west corner of the requested bounding box.
     */
    readonly frameOrigin?: readonly [number, number];
}
/**
 * Read and compose ground materials for an area, returning JSON text.
 *
 * Reads OSM roads and the Overture base themes for the bounding box and
 * composes them into material layers, clipped to the box. The result is left
 * unparsed so it can be passed on without building objects.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read and frame options.
 * @returns The composed `{material: FeatureCollection}` JSON text and the
 *   Overture release it came from.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Ground materials
 */
export declare function acquireGroundMaterialsJson(bbox: Bbox, options?: AcquireGroundOptions): Promise<AcquireGroundJson>;
/**
 * Read and compose ground materials for an area, returning parsed layers.
 *
 * The same composition as {@link acquireGroundMaterialsJson}, parsed once for a
 * caller that wants objects.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read and frame options.
 * @returns The layers, the total feature count and the Overture release.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Ground materials
 */
export declare function acquireGroundMaterials(bbox: Bbox, options?: AcquireGroundOptions): Promise<DirectGroundResult>;
