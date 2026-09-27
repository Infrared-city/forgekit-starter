import { type ReadFgbOptions } from "./fgb.js";
import type { Bbox } from "./http.js";
/**
 * Direct tree acquisition — the client-side twin of
 * `GET /utils/gis/vegetation?source=fgb`.
 *
 * Same shape as the service: the global OSM FlatGeobuf and, when the AOI
 * falls inside a registered city, that city's OGD overlay, read in parallel
 * and merged with the city winning near-duplicates. Attribute normalisation
 * and dedup are kernel calls, so the numbers match the service's.
 *
 * The chain read → normalise → dedup passes JSON text from one kernel call
 * to the next (bulk-data rule 1). Only `acquireTrees`, the object-returning
 * wrapper, parses — once, at the end.
 */
/** The global OSM tree layer on the public R2 mirror. */
export declare const TREES_URL = "https://geo.infrared.city/trees-world.fgb";
/** Two trees closer than this are the same tree (`tree_dedup.DEFAULT_RADIUS_M`). */
export declare const DEDUP_RADIUS_M = 2;
export interface DirectTreesResult {
    /** GeoJSON tree features with the normalised Infrared properties. */
    readonly features: ReadonlyArray<Record<string, unknown>>;
    /** Data sources that contributed, in fetch order. */
    readonly sources: readonly string[];
    /** Degradations the caller should surface (never a silent partial result). */
    readonly warnings: readonly string[];
}
export interface DirectTreesJson {
    /** The normalised, deduped features as JSON array text. */
    readonly featuresJson: string;
    readonly sources: readonly string[];
    readonly warnings: readonly string[];
}
export interface AcquireTreesOptions extends ReadFgbOptions {
    /** `false` forces the global OSM layer even inside a registered city. */
    readonly bestAvailable?: boolean;
}
/**
 * Dedup with the service's own rule: two trees of the SAME source are never
 * deduplicated against each other — only a city tree against a coincident
 * OSM one, which is what the `false` argument says.
 *
 * The kernel is matched at `initializeCore()`, so the four-argument shape is
 * the only one this package can meet.
 */
export declare function dedupWithServiceParity(featuresJson: string, preferred: string[]): string;
/** Read trees for an AOI straight from the public hosts, as JSON text. */
export declare function acquireTreesJson(bbox: Bbox, options?: AcquireTreesOptions): Promise<DirectTreesJson>;
/** The same read, parsed once for a caller that wants feature objects. */
export declare function acquireTrees(bbox: Bbox, options?: AcquireTreesOptions): Promise<DirectTreesResult>;
/** The same result as a GeoJSON FeatureCollection. */
export declare function treesFeatureCollection(result: DirectTreesResult): Record<string, unknown>;
