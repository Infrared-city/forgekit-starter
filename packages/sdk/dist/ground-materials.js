import { requireCore } from "./internal/core.js";
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
export function cleanV3Local(layers, params) {
    const result = requireCore().groundCleanV3(JSON.stringify(layers), params.latitude, params.longitude, params.distance, params.defaultLayer, params.zStep);
    return JSON.parse(result);
}
/** Run the local WASM cleaner through the asynchronous cleaner interface. */
export class LocalCleaner {
    async cleanV3(layers, params) {
        return cleanV3Local(layers, params);
    }
}
