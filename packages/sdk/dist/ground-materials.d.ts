/** A GeoJSON feature collection accepted by the core cleaner. */
export interface FeatureCollection {
    type?: string;
    features?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}
/** Ground material name to GeoJSON feature collection. */
export type MaterialLayers = Record<string, FeatureCollection>;
export interface CleanV3Params {
    latitude: number;
    longitude: number;
    distance: number;
    defaultLayer?: string;
    zStep?: number;
}
/** A replaceable asynchronous ground-material cleaning boundary. */
export interface GroundMaterialCleaner {
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
/**
 * Clean ground materials with the initialized Infrared WASM core.
 *
 * Undefined `zStep` selects the core default of 0.05 m (D5). The core also
 * applies canonical material precedence and idempotent backdrop rules
 * (D22-D24). These rules deliberately differ from the old TypeScript
 * insertion-order cleaner and its 0.00001 m default.
 *
 * The existing WASM binding accepts and returns GeoJSON text. This function
 * therefore performs one JSON serialization and one JSON parse. It is not a
 * typed-mesh zero-copy boundary.
 */
export declare function cleanV3Local(layers: MaterialLayers, params: CleanV3Params): MaterialLayers;
/** Run the local WASM cleaner through the asynchronous cleaner interface. */
export declare class LocalCleaner implements GroundMaterialCleaner {
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
