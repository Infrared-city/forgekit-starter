import { type ReadOvertureOptions } from "./overture-rows.js";
import { type Bbox } from "./http.js";
import { type Logger } from "../logger.js";
/**
 * Overture parquet reading over the anonymous public S3 bucket.
 *
 * Mirrors `app/maps/overture/fetcher_s3.py::_read_via_r2_index`: the R2 file
 * index picks the parquet files, the reader prunes row groups with the
 * `bbox` column statistics, projects the columns each collection needs and
 * applies the AOI and the land_cover zoom-band filter. Overture ships
 * GeoParquet, so `hyparquet` returns decoded GeoJSON geometry — no WKB step.
 *
 * This module is the per-RECTANGLE face of the reader. The decoding, the
 * file selection and the row filter live in `overture-rows.ts`, which the
 * area-level reader (`overture-area.ts`) shares, so one rectangle and a
 * whole AOI cannot be read by two different rules (WP12 / D47).
 */
export { COLUMNS_BY_COLLECTION, LAND_COVER_MIN_MAX_ZOOM, planRowGroups, } from "./overture-rows.js";
export type { FeatureBox, ReadOvertureOptions } from "./overture-rows.js";
/**
 * Report whether the optional parquet reader packages are installed.
 *
 * A boolean cannot say what is missing, so when the reader is absent the
 * message naming what to install is written to the logger at debug level before
 * `false` is returned.
 *
 * @param logger - Where the reason is written; defaults to `silentLogger`.
 * @returns `true` when the parquet reader and its codecs can be loaded.
 * @category Geodata
 */
export declare function overtureReaderAvailable(logger?: Logger): Promise<boolean>;
/**
 * Check up front that the optional parquet reader packages are installed.
 *
 * Call it before planning an Overture read so that a missing package is
 * reported as such, with the install command, rather than as a later failure.
 * Repeated calls are cheap.
 *
 * @throws {GeodataDependencyError} when the parquet reader or its codecs are not
 *   installed; the message names what to install.
 * @category Geodata
 */
export declare function requireOvertureReader(): Promise<void>;
/**
 * Features read from an Overture collection, plus the release they came from.
 *
 * @category Geodata
 */
export interface OvertureRead {
    /** The GeoJSON features inside the requested box. */
    readonly features: Array<Record<string, unknown>>;
    /** Overture release the features came from, for reproducibility. */
    readonly release: string;
}
/**
 * Read one Overture collection for an area as GeoJSON features.
 *
 * @param collection - The Overture collection name, for example `"water"`.
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read options (transport, file limit, release pin, byte budget).
 * @returns The features and the Overture release they came from.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @category Geodata
 */
export declare function readOvertureCollection(collection: string, bbox: Bbox, options?: ReadOvertureOptions): Promise<OvertureRead>;
/**
 * Read one Overture collection for an area as JSON array text.
 *
 * The same read as {@link readOvertureCollection}, returning the features as
 * unparsed JSON text.
 *
 * @param collection - The Overture collection name, for example `"water"`.
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read options (transport, file limit, release pin, byte budget).
 * @returns The features as a JSON array text and the Overture release.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @category Geodata
 */
export declare function readOvertureCollectionJson(collection: string, bbox: Bbox, options?: ReadOvertureOptions): Promise<{
    json: string;
    release: string;
}>;
