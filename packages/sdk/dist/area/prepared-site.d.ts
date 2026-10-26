import type { KernelTerrain } from "./site-terrain.js";
import type { Slice } from "./cooperative.js";
import type { RunAreaOptions } from "./run-options.js";
import type { SiteAnswer } from "./site-assign.js";
import type { IndexedTile, Polygon, TilingConfig } from "./types.js";
/**
 * The site of an area run, prepared once for each site content and tiling family and reused by
 * every `runArea` call in the same process.
 *
 * Analyses of one site that share a tiling family (wind, or solar and thermal) share one
 * preparation: the composed tile groups and the site pass's answers. What differs between those
 * runs, the analysis settings and the weather, does not enter this stage. A few sites are kept,
 * the least recently used is evicted first, and `freePreparedSites` releases them all. The key
 * is the content of the inputs, so a changed input is a different site.
 *
 * @category Run an analysis
 */
export interface PreparedSite {
    /**
     * Every tile's groups, finished into the tile's own frame, keyed by tile id. Parsed on the
     * first call and kept. Grid runs use it; facade runs do not.
     */
    readonly composed: (slice: Slice) => Promise<Readonly<Record<string, Record<string, unknown>>>>;
    /**
     * The site pass's answers: membership, ownership and the shrink band per tile, in tile
     * order, and on request the artifacts of the binary transport.
     */
    readonly answers: SiteAnswer;
}
/**
 * What the site stage reads, and therefore what names a prepared site.
 *
 * @category Run an analysis
 */
export interface SiteInputs {
    /** The analysis payload, including any geometry groups given in it. */
    readonly payload: Readonly<Record<string, unknown>>;
    /** The options of the run; its buildings, vegetation, ground materials and tile cap are read. */
    readonly options: RunAreaOptions;
    /** The area polygon. */
    readonly polygon: Polygon;
    /** The tiling parameters of the analysis family. */
    readonly config: TilingConfig;
    /** How far past each tile terrain and geometry are read, in metres. */
    readonly terrainContextMarginM: number;
    /** The `terrain-alignment` choice the wind analyses read. */
    readonly grade: unknown;
}
/**
 * The JSON text of each group document written while keying a site, by object, so that building
 * the site does not write it again. It lives for one plan: nothing keeps it after the site is
 * built.
 *
 * @category Run an analysis
 */
export type SiteTexts = Map<object, string>;
/**
 * Computes the content key of a site: the digest of every geometry source, plus the tiling
 * family.
 *
 * Each source (a payload group, or an acquired `buildings`, `vegetation` or `groundMaterials`
 * object) is hashed from its JSON text as it will be read. Two runs given the same content share
 * a site; a new input map with different content does not, and neither does a map changed in
 * place. An acquisition result contributes its site content only, so a second fetch of the same
 * site gives the same key and the same `siteIdentity`. The tiling family is the polygon, the
 * preset's three metre sizes, the terrain margin, the tile cap and the wind datum.
 *
 * @param inputs - What the site stage reads.
 * @param texts - Collects the JSON text of each group written for the key, to reuse it when
 *   the site is built.
 * @param legacy - Computes the key of earlier SDK versions (see the note below).
 * @returns The key, or `undefined` when the runtime has no SHA-256, in which case the site is
 *   built uncached.
 * @category Run an analysis
 */
export declare function preparedSiteKey(inputs: SiteInputs, texts?: SiteTexts, legacy?: boolean): Promise<string | undefined>;
/**
 * Builds the prepared site: assembles the geometry layers, composes every tile and checks that
 * no analysis target is dropped entirely.
 *
 * @param inputs - What the site stage reads.
 * @param analysisType - The analysis type, which selects the tiling parameters.
 * @param tiles - The tiles of the grid.
 * @param slice - Lets the work yield the thread between tiles.
 * @param texts - Group texts already written for the site key.
 * @param terrain - The terrain, read once.
 * @returns The prepared site.
 * @category Run an analysis
 */
export declare function buildPreparedSite(inputs: SiteInputs, analysisType: string, tiles: readonly IndexedTile[], slice: Slice, texts?: SiteTexts, terrain?: KernelTerrain): Promise<PreparedSite>;
/**
 * The cache of prepared sites: bounded (least recently used out first), local to the process,
 * and single-flight (concurrent requests for one key share one build).
 *
 * @category Run an analysis
 */
export declare class PreparedSiteCache {
    private readonly maxSites;
    private readonly sites;
    /** @param maxSites - How many sites to keep; default 4. */
    constructor(maxSites?: number);
    /**
     * Returns the site under `key`, built by `build` when no caller has built it yet.
     *
     * With an undefined `key` the site is built every time and not kept. A caller that arrives
     * while a build is in flight awaits that build. If the build fails, the failure is the
     * builder's own (its stop signal, or an input it alone reported), so a waiter that was not
     * itself stopped builds for itself rather than inherit it.
     *
     * @param key - The content key (see `preparedSiteKey`), or `undefined` to build without caching.
     * @param build - Builds the site.
     * @param signal - Cancels a caller that is waiting on another caller's build.
     * @returns The prepared site.
     */
    get(key: string | undefined, build: () => Promise<PreparedSite>, signal?: AbortSignal): Promise<PreparedSite>;
    /** How many sites are held. */
    get size(): number;
    /** Release every prepared site; returns how many were held. */
    clear(): number;
    private build;
}
/**
 * Returns the cache of prepared sites that `runArea` uses in this process.
 *
 * @category Run an analysis
 */
export declare function preparedSites(): PreparedSiteCache;
/**
 * Release every prepared site this realm holds; returns how many it held.
 *
 * A long-lived process that has finished with a site can drop tens of
 * megabytes here instead of waiting for the byte bound to evict them. The
 * next `runArea` on that site prepares it again.
 *
 * @returns The number of sites that were held.
 * @category Run an analysis
 */
export declare function freePreparedSites(): number;
