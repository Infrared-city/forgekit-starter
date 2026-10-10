import { type ReadFgbOptions } from "./fgb.js";
import { type ReadOvertureOptions } from "./overture.js";
import type { Bbox } from "./http.js";
/**
 * Registry layer key naming a city's building overlay (`"buildings"`).
 *
 * @category Geodata
 */
export declare const OVERLAY_LAYER_KEY = "buildings";
/**
 * Candidate buffer, in degrees (`0.002`), added around the query rectangle
 * when choosing which Overture files to read, so footprints that reach into
 * the rectangle from a neighbouring file are not missed.
 *
 * @category Geodata
 */
export declare const OVERTURE_CANDIDATE_BUFFER_DEG = 0.002;
/**
 * Building footprints read for an area, as parsed GeoJSON feature objects.
 *
 * @category Buildings
 */
export interface DirectBuildingsResult {
    /** The normalised building footprint features. */
    readonly features: ReadonlyArray<Record<string, unknown>>;
    /** Which source answered: a city overlay key, or `"overture"`. */
    readonly source: string;
    /** Degradations the caller should surface, such as an unavailable city overlay. */
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, or `""` when Overture was not read. */
    readonly overtureRelease: string;
}
/**
 * Building footprints read for an area, as GeoJSON FeatureCollection text.
 *
 * @category Buildings
 */
export interface DirectBuildingsJson {
    /** The normalised footprints as GeoJSON FeatureCollection text. */
    readonly collectionJson: string;
    /** Which source answered: a city overlay key, or `"overture"`. */
    readonly source: string;
    /** Degradations the caller should surface, such as an unavailable city overlay. */
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, or `""` when Overture was not read. */
    readonly overtureRelease: string;
}
/**
 * Options for {@link acquireBuildings} and {@link acquireBuildingsJson}.
 *
 * Combines the FlatGeobuf read options and the Overture read options.
 *
 * @category Buildings
 */
export interface AcquireBuildingsOptions extends ReadFgbOptions, ReadOvertureOptions {
    /**
     * Set `false` to read the global Overture layer even inside a registered
     * city. By default a registered city's own footprints are used when one
     * covers the area.
     */
    readonly bestAvailable?: boolean;
}
/**
 * Read building footprints for an area straight from the public data hosts,
 * as GeoJSON text.
 *
 * A registered city's footprint layer is used when one covers the area,
 * otherwise Overture's building layer. The text is returned unparsed so it can
 * be passed straight on; use {@link acquireBuildings} for parsed features.
 *
 * @param bbox - The area to read, in WGS84 degrees.
 * @param options - Read options.
 * @returns The footprints as FeatureCollection text, the source, any warnings
 *   and the Overture release.
 * @throws {OvertureReadTooLargeError} when the planned Overture read exceeds
 *   the byte limit.
 * @throws {GeodataDependencyError} when Overture must be read and the optional
 *   parquet packages are not installed.
 * @category Buildings
 */
export declare function acquireBuildingsJson(bbox: Bbox, options?: AcquireBuildingsOptions): Promise<DirectBuildingsJson>;
/**
 * Read building footprints for an area, parsed into feature objects.
 *
 * The same read as {@link acquireBuildingsJson}, parsed once for a caller that
 * wants feature objects.
 *
 * @param bbox - The area to read, in WGS84 degrees.
 * @param options - Read options.
 * @returns The footprint features, the source, any warnings and the Overture
 *   release.
 * @throws {OvertureReadTooLargeError} when the planned Overture read exceeds
 *   the byte limit.
 * @throws {GeodataDependencyError} when Overture must be read and the optional
 *   parquet packages are not installed.
 * @category Buildings
 */
export declare function acquireBuildings(bbox: Bbox, options?: AcquireBuildingsOptions): Promise<DirectBuildingsResult>;
