import { type ReadFgbOptions } from "./fgb.js";
import type { Bbox } from "./http.js";
/**
 * URL of the global OpenStreetMap tree layer on the public Infrared data mirror.
 *
 * @category Geodata
 */
export declare const TREES_URL = "https://geo.infrared.city/trees-world.fgb";
/**
 * Distance in metres (2.0) below which two trees from different sources are
 * treated as the same tree.
 *
 * @category Geodata
 */
export declare const DEDUP_RADIUS_M = 2;
/**
 * Trees acquired for an area, parsed into objects.
 *
 * @category Geodata
 */
export interface DirectTreesResult {
    /** GeoJSON tree features with the normalised Infrared properties. */
    readonly features: ReadonlyArray<Record<string, unknown>>;
    /** Data sources that contributed, in fetch order. */
    readonly sources: readonly string[];
    /** Degradations you should surface, for example an unavailable city overlay. */
    readonly warnings: readonly string[];
}
/**
 * Trees acquired for an area, as unparsed JSON text.
 *
 * @category Geodata
 */
export interface DirectTreesJson {
    /** The normalised, deduplicated features as JSON array text. */
    readonly featuresJson: string;
    /** Data sources that contributed, in fetch order. */
    readonly sources: readonly string[];
    /** Degradations you should surface, for example an unavailable city overlay. */
    readonly warnings: readonly string[];
}
/**
 * Options for {@link acquireTrees} and {@link acquireTreesJson}: the
 * FlatGeobuf read options plus `bestAvailable`.
 *
 * @category Geodata
 */
export interface AcquireTreesOptions extends ReadFgbOptions {
    /**
     * Set to `false` to use only the global OpenStreetMap layer, even inside a
     * registered city. By default a city's open-data overlay is merged in when
     * the area falls inside a registered city.
     */
    readonly bestAvailable?: boolean;
}
/**
 * Remove duplicate trees from a feature array: a tree from the preferred source
 * wins over a coincident tree from another source.
 *
 * Two trees of the same source are never deduplicated against each other.
 *
 * @param featuresJson - JSON text of an array of tree features.
 * @param preferred - Source keys whose trees win over coincident ones.
 * @returns JSON text of the deduplicated feature array.
 * @category Geodata
 */
export declare function dedupWithServiceParity(featuresJson: string, preferred: string[]): string;
/**
 * Read trees for an area straight from the public data hosts, as JSON text.
 *
 * Reads the global OpenStreetMap tree layer and, when the area falls inside a
 * registered city (and `bestAvailable` is not `false`), that city's open-data
 * overlay, in parallel. The two are normalised and merged, with the city's trees
 * winning over coincident OpenStreetMap trees. If only the overlay fails, the
 * result is still returned and a `<city>_overlay_unavailable` warning is added.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read options and `bestAvailable`.
 * @returns The features as JSON array text, the contributing sources and any
 *   warnings.
 * @throws {GeodataFetchError} when the global OpenStreetMap read fails.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Vegetation
 */
export declare function acquireTreesJson(bbox: Bbox, options?: AcquireTreesOptions): Promise<DirectTreesJson>;
/**
 * Read trees for an area, returning parsed feature objects.
 *
 * The same read as {@link acquireTreesJson}, parsed once.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read options and `bestAvailable`.
 * @returns The tree features, the contributing sources and any warnings.
 * @throws {GeodataFetchError} when the global OpenStreetMap read fails.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Vegetation
 */
export declare function acquireTrees(bbox: Bbox, options?: AcquireTreesOptions): Promise<DirectTreesResult>;
/**
 * Convert an acquired tree result into a GeoJSON FeatureCollection.
 *
 * @param result - The result of {@link acquireTrees}.
 * @returns A `FeatureCollection` object holding the tree features.
 * @category Vegetation
 */
export declare function treesFeatureCollection(result: DirectTreesResult): Record<string, unknown>;
