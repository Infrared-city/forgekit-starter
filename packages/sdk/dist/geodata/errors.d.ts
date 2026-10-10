/** Typed failures for the direct data-acquisition layer. */
/**
 * The command that installs the optional Overture parquet packages.
 *
 * @category Geodata
 */
export declare const INSTALL_COMMAND = "npm install hyparquet hyparquet-compressors";
/**
 * Base class for every direct data-acquisition failure.
 *
 * Catch this class to handle any error thrown by the geodata readers.
 *
 * @category Errors
 */
export declare class GeodataError extends Error {
    readonly name: string;
}
/**
 * A URL outside the public data allow-list was requested.
 *
 * The allow-list is what keeps credentials off public objects and keeps a
 * caller-supplied manifest from redirecting a range read at an arbitrary
 * host.
 *
 * @category Errors
 */
export declare class HostNotAllowedError extends GeodataError {
    readonly name = "HostNotAllowedError";
    constructor(url: string);
}
/**
 * The optional Overture parquet packages are not installed.
 *
 * `hyparquet` and `hyparquet-compressors` are optional peer dependencies:
 * only the Overture reader loads them, so a caller who brings their own data
 * never installs them. Everything else in the package (payloads, area runs
 * over your own geometry, results, images, the static weather catalog and the
 * FlatGeobuf layers) works without them.
 *
 * The message names both packages and the exact install command, whichever of
 * the two is missing, because installing only one is never the fix. There is
 * no fallback decoder.
 *
 * @category Errors
 */
export declare class GeodataDependencyError extends GeodataError {
    readonly name = "GeodataDependencyError";
    /** The command to run, so a caller can print it without parsing prose. */
    static readonly installCommand = "npm install hyparquet hyparquet-compressors";
    /** The package that could not be loaded. */
    readonly packageName: string;
    constructor(packageName: string, cause?: unknown);
}
/**
 * A public host answered in a way the reader cannot use.
 *
 * `status` carries the HTTP status code when there was one.
 *
 * @category Errors
 */
export declare class GeodataFetchError extends GeodataError {
    readonly status?: number | undefined;
    readonly name = "GeodataFetchError";
    constructor(url: string, detail: string, status?: number | undefined);
}
/**
 * A ranged read could not be trusted or would not fit.
 *
 * Three cases, all of which must be loud: the object changed between two
 * ranges of one read (`If-Match` → 412), a server answered a `Range`
 * request with the whole object, or a whole-object read would exceed the
 * caller's byte cap.
 *
 * @category Errors
 */
export declare class GeodataRangeError extends GeodataError {
    readonly status?: number | undefined;
    readonly name = "GeodataRangeError";
    constructor(url: string, detail: string, status?: number | undefined);
}
/**
 * An Overture read would move more compressed data than the runtime allows.
 *
 * The amount to fetch is known from the parquet file footers before any data
 * is fetched, so an area too large to decode fails up front. The error names
 * the limit, the planned size and the rectangle it was planned for. Read a
 * smaller area or raise `maxPlannedBytes`.
 *
 * The limit applies to one call, not to each collection: an area read of
 * several ground layers shares one limit.
 *
 * @category Errors
 */
export declare class OvertureReadTooLargeError extends GeodataError {
    /** The Overture collection being read, such as `"building"`. */
    readonly collection: string;
    /** Compressed bytes the read would have fetched. */
    readonly plannedBytes: number;
    /** The byte limit that was exceeded. */
    readonly limitBytes: number;
    /** Number of parquet files in the plan. */
    readonly files: number;
    /** Number of row groups in the plan. */
    readonly rowGroups: number;
    /** The rectangle the read was planned for. */
    readonly bbox: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    readonly name = "OvertureReadTooLargeError";
    constructor(
    /** The Overture collection being read, such as `"building"`. */
    collection: string, 
    /** Compressed bytes the read would have fetched. */
    plannedBytes: number, 
    /** The byte limit that was exceeded. */
    limitBytes: number, 
    /** Number of parquet files in the plan. */
    files: number, 
    /** Number of row groups in the plan. */
    rowGroups: number, 
    /** The rectangle the read was planned for. */
    bbox: {
        west: number;
        south: number;
        east: number;
        north: number;
    });
}
/**
 * More Overture files match an area than the `maxFiles` option allows.
 *
 * Reading only the first N files would silently drop features everywhere in
 * the area, so the read fails instead. The error names both counts and the
 * caller decides whether to raise `maxFiles` or read a smaller area.
 *
 * @category Errors
 */
export declare class OvertureFileLimitError extends GeodataError {
    /** The Overture collection being read, such as `"building"`. */
    readonly collection: string;
    /** Number of files that match the area. */
    readonly files: number;
    /** The `maxFiles` limit that was exceeded. */
    readonly maxFiles: number;
    readonly name = "OvertureFileLimitError";
    constructor(
    /** The Overture collection being read, such as `"building"`. */
    collection: string, 
    /** Number of files that match the area. */
    files: number, 
    /** The `maxFiles` limit that was exceeded. */
    maxFiles: number);
}
/**
 * One read chunk that failed during a site read.
 *
 * `row` and `col` are always `-1`: a site read fails by read chunk, not by
 * simulation tile, so a chunk has no place in the simulation grid. The chunk
 * id (`tileId`) is `chunk-r{row}c{col}`, row-major and zero-based.
 *
 * @category Errors
 */
export interface SiteChunkFailure {
    /** The chunk id, `chunk-r{row}c{col}`. */
    readonly tileId: string;
    /** Always `-1`. */
    readonly row: number;
    /** Always `-1`. */
    readonly col: number;
    /** The failure message of that chunk. */
    readonly error: string;
}
/**
 * A site read in which at least one read chunk failed.
 *
 * Every chunk feeds the site, so one failing chunk fails the whole read. A
 * partial result would be an emptier city that nobody can see. `failedTiles`
 * lists every chunk that failed, in row-major order.
 *
 * `cause` is the first underlying failure in chunk order, for example an
 * `OvertureReadTooLargeError` or a `GeodataFetchError`. Catch this class and
 * read `cause` for the reason and `failedTiles` for which chunks failed.
 *
 * @category Errors
 */
export declare class SiteReadError extends GeodataError {
    /** Every chunk that failed, in row-major order. */
    readonly failedTiles: readonly SiteChunkFailure[];
    readonly name = "SiteReadError";
    constructor(message: string, 
    /** Every chunk that failed, in row-major order. */
    failedTiles: readonly SiteChunkFailure[], cause?: unknown);
}
