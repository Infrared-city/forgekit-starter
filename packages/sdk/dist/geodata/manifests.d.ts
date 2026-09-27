import { type Bbox, type PublicRequestOptions } from "./http.js";
/**
 * Public manifests: the city-overlay registry and the Overture file index.
 *
 * Fetching is the host's job and the selection logic is the kernel's, exactly
 * as in `app/sources/registry.py` and `app/maps/overture/fetcher_s3.py`. The
 * caches below are module state, so each realm (page, Web Worker, Node
 * process) keeps its own — a Worker never shares a cache with the main
 * thread, which matches the SDK's one-core-per-realm rule.
 */
/** `sources.json` refresh interval; matches the service's 5-minute TTL. */
export declare const SOURCES_TTL_MS = 300000;
/** Collections the R2 index publishes a manifest for. */
export declare const INDEXED_COLLECTIONS: readonly string[];
export interface OverlayCity {
    readonly id: string;
    /** Per-feature `source` label and attribution key, e.g. `vienna_ogd`. */
    readonly sourceKey: string;
    readonly layers: Readonly<Record<string, string>>;
}
export interface OverlayResolution {
    readonly city?: OverlayCity;
    /** Degradations the caller should surface, never a silent partial result. */
    readonly warnings: readonly string[];
}
/** Drop every cached manifest in this realm (tests, long-lived workers). */
export declare function clearManifestCaches(): void;
/** Fetch `sources.json`, re-using the cached copy inside the TTL. */
export declare function fetchSources(options?: PublicRequestOptions & {
    readonly now?: number;
}): Promise<Record<string, unknown>>;
/**
 * Resolve the city overlay for an AOI, or nothing.
 *
 * Two stages, as the kernel documents them: a cheap bbox prefilter over
 * `sources.json`, then the precise polygon gate on each candidate. Fetch
 * failures degrade to "no overlay" with a warning — the utilities service
 * behaves the same way, so a registry outage keeps the default world sources
 * working instead of failing the whole acquisition.
 */
export declare function resolveOverlayCity(bbox: Bbox, options?: PublicRequestOptions & {
    readonly now?: number;
}): Promise<OverlayResolution>;
export interface OvertureManifestOptions extends PublicRequestOptions {
    /** Pin an immutable release instead of following the daily pointer. */
    readonly overtureRelease?: string;
}
/**
 * Fetch the immutable Overture file manifest for a collection.
 *
 * The pointer is read every call (it is edge-cached with a 5-minute
 * max-age); the manifest itself is re-fetched only when the release changes,
 * as in the Python reader.
 */
export declare function fetchOvertureManifest(collection: string, options?: OvertureManifestOptions): Promise<{
    manifestJson: string;
    release: string;
}>;
/** Parquet URLs whose file bbox meets the AOI, chosen by the kernel. */
export declare function selectOvertureFiles(collection: string, bbox: Bbox, options?: OvertureManifestOptions): Promise<{
    urls: string[];
    release: string;
}>;
