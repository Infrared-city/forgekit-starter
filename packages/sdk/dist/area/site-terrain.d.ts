/**
 * The site's terrain, read ONCE per terrain content (WP1,
 * `docs/DEVIATIONS.md` D200): the Python twin is
 * `_internal/site_terrain.py`.
 *
 * A design loop edits a building and runs again on the SAME terrain. Before,
 * every `runArea` handed the terrain to the kernel twice more as JSON text:
 * once for the schedule hash (`geometryGroupHash`, about 0.17 s on a 2 m DEM)
 * and once for every kernel `Site` read (the parse, the slice index and the
 * slice). The kernel's `SiteTerrain` holds the parsed, indexed terrain and its
 * group hash; this module keeps it by the terrain's content digest, so a
 * building edit — and the facade run beside the grid run — builds its site
 * on the terrain already read.
 *
 * Content, not identity: the key is the kernel's content key of the group's
 * JSON text (`terrainContentKey`, the same value `SiteTerrain.contentKey`
 * gives), memoised per object with its content fingerprint (D104, D182), so a
 * map changed in place is read again. wasm-bindgen frees a handle once nothing
 * holds it; the cache holds the last few.
 */
export interface KernelTerrain {
    /** `geometryGroupHash("ground-geometry", …)` of the whole terrain. */
    readonly groupHash: string | undefined;
    free(): void;
}
/** `terrain` when its wasm memory is still held, else `undefined`. */
export declare function liveTerrain(terrain: KernelTerrain | undefined): KernelTerrain | undefined;
/**
 * The content key of one `ground-geometry` group: the kernel's hash of its
 * JSON text. `undefined` for no terrain. The text is written once and kept in
 * `texts` for the kernel read. From an object's second sight on, an unchanged
 * content fingerprint gives the earlier key without a write.
 */
export declare function terrainKey(value: unknown, texts?: Map<object, string>): string | undefined;
/**
 * The kernel terrain of one `ground-geometry` group, read once per content
 * `key` ({@link terrainKey}). `undefined` for no terrain, or a document the
 * kernel refuses to read as a map
 * — the site then reads the text, as before, and gives the same refusal.
 */
export declare function siteTerrain(value: unknown, key: string | undefined, texts?: ReadonlyMap<object, string>): KernelTerrain | undefined;
/** Release every terrain the realm holds; returns how many. */
export declare function freeSiteTerrains(): number;
