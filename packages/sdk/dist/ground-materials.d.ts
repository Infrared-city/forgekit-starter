/**
 * A GeoJSON feature collection, as accepted by the ground-material cleaner.
 *
 * @category Ground materials
 */
export interface FeatureCollection {
    /** The GeoJSON type, normally `"FeatureCollection"`. */
    type?: string;
    /** The GeoJSON features (polygons in WGS84 degrees). */
    features?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}
/**
 * Ground material name to GeoJSON feature collection.
 *
 * @category Ground materials
 */
export type MaterialLayers = Record<string, FeatureCollection>;
/**
 * Parameters for cleaning ground-material layers around a point.
 *
 * @category Ground materials
 */
export interface CleanV3Params {
    /** Latitude of the centre point, in degrees. */
    latitude: number;
    /** Longitude of the centre point, in degrees. */
    longitude: number;
    /** Distance from the centre point to the edge of the cropped area, in metres. */
    distance: number;
    /** Name of the default (background) material layer. */
    defaultLayer?: string;
    /** Vertical step between stacked material layers, in metres. Defaults to `0.05`. */
    zStep?: number;
}
/**
 * An asynchronous ground-material cleaner. Implement it to replace the built-in
 * local cleaner.
 *
 * @category Ground materials
 */
export interface GroundMaterialCleaner {
    /**
     * Clean the layers around the point given in `params`.
     *
     * @param layers - Material name to GeoJSON feature collection.
     * @param params - The centre point, crop distance and layer options.
     * @returns The cleaned layers.
     */
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
/**
 * Clean ground materials locally, using the initialized Infrared core.
 *
 * The layers are cropped to `params.distance` metres around the point, stacked by
 * material precedence rather than by the order of the keys in `layers`, and given
 * a vertical offset per layer. An undefined `zStep` selects the default of 0.05 m.
 * Cleaning the result a second time keeps the same material classification.
 *
 * `initializeCore()` must have completed before you call it. The layers are
 * serialized to JSON text and the result parsed back, so very large inputs cost one
 * serialization and one parse.
 *
 * @param layers - Material name to GeoJSON feature collection (WGS84 degrees).
 * @param params - The centre point, crop distance and layer options.
 * @returns The cleaned layers, keyed by material name.
 *
 * @category Ground materials
 */
export declare function cleanV3Local(layers: MaterialLayers, params: CleanV3Params): MaterialLayers;
/**
 * A `GroundMaterialCleaner` that cleans locally with `cleanV3Local`.
 *
 * @category Ground materials
 */
export declare class LocalCleaner implements GroundMaterialCleaner {
    /**
     * Clean the layers locally. Equivalent to calling `cleanV3Local`.
     *
     * @param layers - Material name to GeoJSON feature collection.
     * @param params - The centre point, crop distance and layer options.
     * @returns The cleaned layers.
     */
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
