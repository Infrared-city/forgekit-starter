import { type Bbox, type PublicRequestOptions } from "./http.js";
/**
 * How long, in milliseconds (`300000`, five minutes), the city-overlay
 * registry (`sources.json`) is cached before it is fetched again.
 *
 * @category Geodata
 */
export declare const SOURCES_TTL_MS = 300000;
/**
 * The Overture collections that have a published file index:
 * `building`, `land_cover`, `water` and `land_use`.
 *
 * @category Geodata
 */
export declare const INDEXED_COLLECTIONS: readonly string[];
/**
 * A registered city whose own data overlays the global layers.
 *
 * @category Geodata
 */
export interface OverlayCity {
    /** The city id, such as `vienna`. */
    readonly id: string;
    /** Per-feature `source` label and attribution key, e.g. `vienna_ogd`. */
    readonly sourceKey: string;
    /** Layer name to data key (path under the public data host) for each layer the city publishes. */
    readonly layers: Readonly<Record<string, string>>;
}
/**
 * The outcome of looking up a city overlay for an area.
 *
 * @category Geodata
 */
export interface OverlayResolution {
    /** The city that covers the area, or `undefined` when none does. */
    readonly city?: OverlayCity;
    /** Degradations the caller should surface, never a silent partial result. */
    readonly warnings: readonly string[];
}
/**
 * Drop every cached manifest held by this runtime. Useful in tests and
 * long-lived workers.
 *
 * @category Geodata
 */
export declare function clearManifestCaches(): void;
/**
 * Fetch the city-overlay registry (`sources.json`), reusing the cached copy
 * while it is younger than {@link SOURCES_TTL_MS}.
 *
 * @param options - Request options; `now` overrides the clock, in
 *   milliseconds since the epoch.
 * @returns The parsed registry document.
 * @category Geodata
 */
export declare function fetchSources(options?: PublicRequestOptions & {
    readonly now?: number;
}): Promise<Record<string, unknown>>;
/**
 * Find the registered city overlay that covers an area, if any.
 *
 * A quick bounding-box check over the registry picks candidate cities, then
 * the city outline decides. If the registry or a city outline cannot be
 * fetched, the result has no city and carries a warning, so a registry outage
 * falls back to the global sources instead of failing the whole read.
 *
 * @param bbox - The area, in WGS84 degrees.
 * @param options - Request options; `now` overrides the clock, in
 *   milliseconds since the epoch.
 * @returns The matching city, if any, and any warnings.
 * @category Geodata
 */
export declare function resolveOverlayCity(bbox: Bbox, options?: PublicRequestOptions & {
    readonly now?: number;
}): Promise<OverlayResolution>;
/**
 * Options for fetching an Overture file manifest.
 *
 * @category Geodata
 */
export interface OvertureManifestOptions extends PublicRequestOptions {
    /** Pin an immutable release instead of following the daily pointer. */
    readonly overtureRelease?: string;
}
/**
 * Fetch the Overture file manifest for a collection.
 *
 * The latest-release pointer is read on every call; the manifest itself is
 * fetched again only when the release changes.
 *
 * @param collection - An Overture collection such as `"building"`.
 * @param options - Request options; `overtureRelease` pins a release.
 * @returns The manifest text and the release it belongs to.
 * @throws {GeodataError} when the requested release cannot be pinned for the collection.
 * @category Geodata
 */
export declare function fetchOvertureManifest(collection: string, options?: OvertureManifestOptions): Promise<{
    manifestJson: string;
    release: string;
}>;
/**
 * List the Overture parquet files whose bounding box meets an area.
 *
 * Returns an empty list for a collection that has no published index.
 *
 * @param collection - An Overture collection such as `"building"`.
 * @param bbox - The area, in WGS84 degrees.
 * @param options - Request options; `overtureRelease` pins a release.
 * @returns The file URLs and the release they belong to.
 * @category Geodata
 */
export declare function selectOvertureFiles(collection: string, bbox: Bbox, options?: OvertureManifestOptions): Promise<{
    urls: string[];
    release: string;
}>;
