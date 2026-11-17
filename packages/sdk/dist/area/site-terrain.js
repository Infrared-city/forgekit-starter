import { requireCore } from "../internal/core.js";
import { contentFingerprint } from "../internal/geometry-reuse/fingerprint.js";
import { typedAsArray } from "../internal/wire-json.js";
/**
 * Handles the bound evicted and freed. A plan that took one before the
 * eviction builds its site from the document text instead ({@link liveTerrain}).
 */
const freed = new WeakSet();
function release(terrain) {
    freed.add(terrain);
    terrain.free();
}
/** `terrain` when its wasm memory is still held, else `undefined`. */
export function liveTerrain(terrain) {
    return terrain === undefined || freed.has(terrain) ? undefined : terrain;
}
/** How many terrains the realm holds: a design loop one, an A/B two. */
const MAX_TERRAINS = 2;
const byKey = new Map();
const keyMemo = new WeakMap();
/**
 * The content key of one `ground-geometry` group: the kernel's hash of its
 * JSON text. `undefined` for no terrain. The text is written once and kept in
 * `texts` for the kernel read. From an object's second sight on, an unchanged
 * content fingerprint gives the earlier key without a write.
 */
export function terrainKey(value, texts) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    if (Object.keys(value).length === 0)
        return undefined;
    const cached = keyMemo.get(value);
    const fingerprint = cached === undefined ? undefined : contentFingerprint(value);
    if (fingerprint !== undefined && cached?.fingerprint === fingerprint)
        return cached.key;
    const text = JSON.stringify(value, typedAsArray);
    texts?.set(value, text);
    const key = requireCore().terrainContentKey(text);
    keyMemo.set(value, { fingerprint, key });
    return key;
}
/**
 * The kernel terrain of one `ground-geometry` group, read once per content
 * `key` ({@link terrainKey}). `undefined` for no terrain, or a document the
 * kernel refuses to read as a map
 * — the site then reads the text, as before, and gives the same refusal.
 */
export function siteTerrain(value, key, texts) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    if (key === undefined || Object.keys(value).length === 0)
        return undefined;
    let terrain = byKey.get(key);
    if (terrain === undefined) {
        try {
            terrain = new (requireCore().SiteTerrain)(texts?.get(value) ?? JSON.stringify(value, typedAsArray));
        }
        catch {
            return undefined;
        }
    }
    byKey.delete(key);
    byKey.set(key, terrain);
    for (const [key, old] of byKey) {
        if (byKey.size <= MAX_TERRAINS)
            break;
        byKey.delete(key);
        release(old);
    }
    return terrain;
}
/** Release every terrain the realm holds; returns how many. */
export function freeSiteTerrains() {
    const count = byKey.size;
    for (const terrain of byKey.values())
        release(terrain);
    byKey.clear();
    return count;
}
