import { requireCore } from "./internal/core.js";
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
// Maintainer note (not published): the core default z-step is 0.05 m (D5). The core also
// applies canonical material precedence and idempotent backdrop rules (D22-D24). These
// rules deliberately differ from the old TypeScript insertion-order cleaner and its
// 0.00001 m default. The WASM binding accepts and returns GeoJSON text, so this function
// does one JSON serialization and one JSON parse; it is not a typed-mesh zero-copy boundary.
export function cleanV3Local(layers, params) {
    const result = requireCore().groundCleanV3(JSON.stringify(layers), params.latitude, params.longitude, params.distance, params.defaultLayer, params.zStep);
    return JSON.parse(result);
}
/**
 * A `GroundMaterialCleaner` that cleans locally with `cleanV3Local`.
 *
 * @category Ground materials
 */
export class LocalCleaner {
    /**
     * Clean the layers locally. Equivalent to calling `cleanV3Local`.
     *
     * @param layers - Material name to GeoJSON feature collection.
     * @param params - The centre point, crop distance and layer options.
     * @returns The cleaned layers.
     */
    async cleanV3(layers, params) {
        return cleanV3Local(layers, params);
    }
}
