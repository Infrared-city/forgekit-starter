import type { Slice } from "./cooperative.js";
import type { RunAreaOptions } from "./run-options.js";
import type { SiteAnswer } from "./site-assign.js";
import type { IndexedTile, Polygon, TilingConfig } from "./types.js";
/**
 * The site, prepared ONCE per (site content, tiling family) and reused by
 * every `runArea` call in this realm (`docs/DEVIATIONS.md` D96).
 *
 * Six analyses of one site used to mean six plans: six site passes, six
 * kernel composes, six re-anchors of every tile's occluders, six terrain
 * slices. Four of the six were the solar family on one tiling, the other two
 * the wind family on another — two distinct answers, computed six times, on
 * the one JavaScript thread the four concurrent runs share. What differs
 * between the runs of a family is the analysis config and the weather, and
 * neither reaches this stage.
 *
 * The prepared site is what the plan reads after that stage: the composed
 * tile groups, finished into each tile's frame, and the site pass's answers.
 * Nothing on the submit path writes into a composed group (`buildEntries`
 * spreads shallow copies, the facade split and the reuse controller build new
 * maps), so the same objects serve every run — which is also what lets the
 * geometry-reuse identity of a tile's group be memoised on the object itself
 * (`internal/geometry-reuse/identity.ts`).
 *
 * The cache is MODULE-level, not per client: the platform builds a fresh
 * client per request in some modes, and a client-attached cache is silently
 * defeated there (forge-kit #977). It holds a few sites, evicts the least
 * recently used, and single-flights a build: the first caller builds, the
 * others await the same promise. There is no TTL and no invalidation — a
 * changed input is a different key, and a key is content.
 */
export interface PreparedSite {
    /**
     * Every tile's groups, finished into the tile's frame, keyed by tile id,
     * parsed on the first ask and kept. A GRID run asks; a facade run's bodies
     * are the kernel's (`area/site-facade.ts`) and it never does.
     */
    readonly composed: (slice: Slice) => Promise<Readonly<Record<string, Record<string, unknown>>>>;
    /** Membership, ownership and the shrink band, per tile, in tile order. */
    /** The site: the tile answers, and the binary transport's artifacts on ask. */
    readonly answers: SiteAnswer;
    /** The facade fold of every tile's buildings, memoised on the first facade run. */
    tileBuildingFolds?: Record<string, unknown>;
}
/** What the site stage reads, and therefore what names a prepared site. */
export interface SiteInputs {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly options: RunAreaOptions;
    readonly polygon: Polygon;
    readonly config: TilingConfig;
    readonly terrainContextMarginM: number;
    /** The wind family's consumed `terrain-alignment` choice (D91). */
    readonly grade: unknown;
}
/**
 * The JSON text of each group document the key wrote, by object, for the
 * kernel `Site` constructor of the same plan (`site-assign.ts`). The key
 * and the constructor both need that text; this map lets them write it
 * once. It lives for one plan: nothing keeps it after the site is built.
 */
export type SiteTexts = Map<object, string>;
/**
 * The content key of a site: the digest of every geometry source, plus the
 * tiling family.
 *
 * Each source — a payload group, or an acquired `buildings` / `vegetation` /
 * `groundMaterials` object — is hashed from its JSON text, exactly as it will
 * be read, so two runs handed the same content share a site, while a NEW
 * input map with different content does not, and neither does a map the
 * caller changed in place (the memo checks a content fingerprint). An
 * acquisition result contributes its site content only
 * ({@link acquisitionContent}), so a second fetch of the same site gives the
 * same key and the same `siteIdentity` (D187). The
 * family is the polygon, the preset's three metre scalars, the terrain
 * margin, the tile cap and the wind datum: everything `composeTiles` and the drop to grade read. `undefined` when the
 * realm has no SHA-256 (the same runtimes that get no geometry reuse), in
 * which case the site is built uncached.
 *
 * `legacy` gives the key of 0.12.13-next.17 and older, which hashed each
 * acquisition result WHOLE, per-fetch fields included. Only a retry of a
 * schedule those versions saved asks for it (`planning.ts`).
 */
export declare function preparedSiteKey(inputs: SiteInputs, texts?: SiteTexts, legacy?: boolean): Promise<string | undefined>;
/** The site stage of `planAreaSubmission`: layers, compose, checks. */
export declare function buildPreparedSite(inputs: SiteInputs, analysisType: string, tiles: readonly IndexedTile[], slice: Slice, texts?: SiteTexts): Promise<PreparedSite>;
/** Bounded, realm-local, single-flight. */
export declare class PreparedSiteCache {
    private readonly maxSites;
    private readonly sites;
    constructor(maxSites?: number);
    /**
     * The site under `key`, built by `build` when no caller has built it yet.
     *
     * A caller that arrives while a build is in flight awaits that build. If the
     * build fails, the failure is the builder's own — its stop signal, or an
     * input it alone reported — so a waiter that was not itself stopped builds
     * for itself rather than inherit it.
     */
    get(key: string | undefined, build: () => Promise<PreparedSite>, signal?: AbortSignal): Promise<PreparedSite>;
    /** How many sites are held. */
    get size(): number;
    /** Release every prepared site; returns how many were held. */
    clear(): number;
    private build;
}
/** The realm's prepared sites. */
export declare function preparedSites(): PreparedSiteCache;
/**
 * Release every prepared site this realm holds; returns how many it held.
 *
 * A long-lived process that has finished with a site can drop tens of
 * megabytes here instead of waiting for the byte bound to evict them. The
 * next `runArea` on that site prepares it again.
 */
export declare function freePreparedSites(): number;
