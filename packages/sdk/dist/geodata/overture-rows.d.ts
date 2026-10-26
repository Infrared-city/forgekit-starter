import { type Bbox, type PublicRequestOptions } from "./http.js";
import { type PlannedBudget, type SelectedGroup } from "./overture-budget.js";
import { type ParquetMetadata } from "./overture-parquet.js";
import { type RangeTransport } from "./range-transport.js";
export { isGeneralizedLandCover, LAND_COVER_MIN_MAX_ZOOM } from "./overture-keep.js";
/**
 * The parquet columns read for each Overture collection (`building`, `water`,
 * `land_use`, `land_cover`).
 *
 * @category Geodata
 */
export declare const COLUMNS_BY_COLLECTION: Readonly<Record<string, readonly string[]>>;
/**
 * The Overture `bbox` column of one row, when the file carries it.
 *
 * @category Geodata
 */
export interface FeatureBox {
    xmin?: number;
    xmax?: number;
    ymin?: number;
    ymax?: number;
}
/**
 * One decoded feature and the row bounding box that decides which tiles hold it.
 *
 * @category Geodata
 */
export interface OvertureRow {
    /** The decoded feature. */
    readonly feature: Record<string, unknown>;
    /** The row's bounding box, when the file carries one. */
    readonly box?: FeatureBox;
}
/**
 * Options for reading Overture Maps data.
 *
 * Extends the public-request options (fetch, signal, timeout, logger).
 *
 * @category Geodata
 */
export interface ReadOvertureOptions extends PublicRequestOptions {
    /**
     * Byte-range reader; defaults to HTTP range requests.
     *
     * Pass one instance for a whole area; it carries the file-size cache.
     */
    readonly transport?: RangeTransport;
    /**
     * Maximum number of parquet files to read. A read that matches more files
     * fails with an `OvertureFileLimitError` instead of returning a partial
     * answer. A guard for very large areas.
     */
    readonly maxFiles?: number;
    /**
     * Extra margin, in degrees, added around the area when choosing which files
     * to read. It never changes which features are returned.
     *
     * A file whose recorded bounding box stops just short of the area is still
     * considered. Features are still filtered against the exact area, so the
     * margin costs at most one extra file read.
     */
    readonly candidateBufferDeg?: number;
    /**
     * Pin the Overture release, e.g. `"2026-08-19.0"`.
     *
     * Without a pin the latest release is used, which is refreshed daily, so
     * the same area read on two days can return different data. A pinned
     * release is reproducible.
     */
    readonly overtureRelease?: string;
    /**
     * Compressed bytes this read may plan, when it makes its own budget.
     * Defaults to the runtime's ceiling. A larger plan fails with an
     * `OvertureReadTooLargeError`.
     */
    readonly maxPlannedBytes?: number;
    /**
     * The byte budget of the call this read belongs to.
     *
     * An area read of several ground layers passes one budget to all of them,
     * so the limit covers the whole call rather than each layer. A read with no
     * budget makes its own.
     */
    readonly budget?: PlannedBudget;
}
/**
 * Row ranges of an Overture parquet file that can hold a feature inside an
 * area, judged by the file's bounding-box statistics.
 *
 * @param metadata - The parquet file footer.
 * @param bbox - The area, in WGS84 degrees.
 * @returns `[start, end)` row ranges, one per selected row group.
 * @category Geodata
 */
export declare function planRowGroups(metadata: ParquetMetadata, bbox: Bbox): Array<[number, number]>;
/**
 * The same selection as {@link planRowGroups}, keeping each row group's index
 * so its size can be counted against the byte budget.
 *
 * @param metadata - The parquet file footer.
 * @param bbox - The area, in WGS84 degrees.
 * @returns The selected row groups with their index and row range.
 * @category Geodata
 */
export declare function selectRowGroups(metadata: ParquetMetadata, bbox: Bbox): SelectedGroup[];
/**
 * Test which feature boxes meet a rectangle.
 *
 * Intervals are closed, so a box that only touches the rectangle counts, and a
 * box with a missing member is treated as meeting every rectangle.
 *
 * @param boxes - The feature boxes; `undefined` entries count as missing.
 * @param bbox - The rectangle, in WGS84 degrees.
 * @returns One byte per box: `1` when it meets the rectangle, otherwise `0`.
 * @category Geodata
 */
export declare function boxesMeet(boxes: ReadonlyArray<FeatureBox | undefined>, bbox: Bbox): Uint8Array;
/**
 * Read one Overture collection for a rectangle, as decoded rows.
 *
 * Rows come back in file, then row-group, then row order. `map` is applied to
 * each row as it is decoded, so a caller that keeps only a compact form never
 * holds the decoded objects of the whole area at once.
 *
 * @param collection - An Overture collection such as `"building"`.
 * @param bbox - The area, in WGS84 degrees.
 * @param options - Read options.
 * @param map - Converts each decoded row into the value that is kept.
 * @returns The mapped rows and the Overture release they came from.
 * @throws {OvertureFileLimitError} when more files match than `maxFiles` allows.
 * @throws {OvertureReadTooLargeError} when the planned read exceeds the byte limit.
 * @throws {GeodataError} when the collection has no published file index.
 * @throws {GeodataDependencyError} when the optional parquet packages are not installed.
 * @category Geodata
 */
export declare function readOvertureRows<T>(collection: string, bbox: Bbox, options: ReadOvertureOptions, map: (row: OvertureRow) => T): Promise<{
    rows: T[];
    release: string;
}>;
