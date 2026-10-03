import { requireCore } from "../internal/core.js";
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
const byDigest = new Map();
/** The `ground-geometry` digest the prepared-site key carries, if any. */
export function terrainDigest(siteKey) {
    return siteKey?.match(/^ground-geometry=(.+)$/m)?.[1];
}
/**
 * The kernel terrain of one `ground-geometry` group, read once per content
 * `digest` ({@link terrainDigest}). `undefined` for no terrain, no digest (a
 * realm without SHA-256), or a document the kernel refuses to read as a map
 * — the site then reads the text, as before, and gives the same refusal.
 */
export function siteTerrain(value, digest, texts) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    if (digest === undefined || Object.keys(value).length === 0)
        return undefined;
    let terrain = byDigest.get(digest);
    if (terrain === undefined) {
        try {
            terrain = new (requireCore().SiteTerrain)(texts?.get(value) ?? JSON.stringify(value));
        }
        catch {
            return undefined;
        }
    }
    byDigest.delete(digest);
    byDigest.set(digest, terrain);
    for (const [key, old] of byDigest) {
        if (byDigest.size <= MAX_TERRAINS)
            break;
        byDigest.delete(key);
        release(old);
    }
    return terrain;
}
/** Release every terrain the realm holds; returns how many. */
export function freeSiteTerrains() {
    const count = byDigest.size;
    for (const terrain of byDigest.values())
        release(terrain);
    byDigest.clear();
    return count;
}
