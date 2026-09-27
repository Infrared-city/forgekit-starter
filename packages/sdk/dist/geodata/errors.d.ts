/** Typed failures for the direct data-acquisition layer. */
/** The one command that installs the optional Overture parquet stack. */
export declare const INSTALL_COMMAND = "npm install hyparquet hyparquet-compressors";
/** Base class: every direct-acquisition failure the caller must see. */
export declare class GeodataError extends Error {
    readonly name: string;
}
/**
 * A URL outside the public data allow-list was requested.
 *
 * The allow-list is what keeps credentials off public objects and keeps a
 * caller-supplied manifest from redirecting a range read at an arbitrary
 * host.
 */
export declare class HostNotAllowedError extends GeodataError {
    readonly name = "HostNotAllowedError";
    constructor(url: string);
}
/**
 * The optional Overture parquet stack is not installed.
 *
 * `hyparquet` and `hyparquet-compressors` are OPTIONAL peer dependencies:
 * only the `/geodata` Overture reader loads them, and it loads them with a
 * dynamic `import()`, so a caller who brings their own data never installs
 * them (`docs/DEVIATIONS.md` D55). Everything else in the package — payloads,
 * area runs over your own geometry, results, images, the static weather
 * catalog, and the FlatGeobuf layers the kernel reads — works without them.
 *
 * ONE error, naming BOTH packages and the exact command, whichever of the two
 * is missing: installing one without the other is never the fix, and a
 * message that names only the half that failed sends the caller round twice.
 * There is no fallback decoder — an unreadable parquet file cannot become an
 * empty area.
 */
export declare class GeodataDependencyError extends GeodataError {
    readonly name = "GeodataDependencyError";
    /** The command to run, so a caller can print it without parsing prose. */
    static readonly installCommand = "npm install hyparquet hyparquet-compressors";
    readonly packageName: string;
    constructor(packageName: string, cause?: unknown);
}
/** A public host answered in a way the reader cannot use. */
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
 */
export declare class GeodataRangeError extends GeodataError {
    readonly status?: number | undefined;
    readonly name = "GeodataRangeError";
    constructor(url: string, detail: string, status?: number | undefined);
}
/**
 * An Overture read would move more compressed bytes than the realm allows.
 *
 * The row groups an AOI selects are known from the parquet footers BEFORE
 * any of them is fetched, so an area too large to decode fails here, once,
 * naming the limit, what it planned and the RECTANGLE it planned it for —
 * never as an out-of-memory kill or a dead browser tab (WP12 / D47).
 *
 * The budget is per CALL, not per collection: one area read of three ground
 * themes shares one limit, because it is one process that holds all three.
 */
export declare class OvertureReadTooLargeError extends GeodataError {
    readonly collection: string;
    readonly plannedBytes: number;
    readonly limitBytes: number;
    readonly files: number;
    readonly rowGroups: number;
    readonly bbox: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    readonly name = "OvertureReadTooLargeError";
    constructor(collection: string, plannedBytes: number, limitBytes: number, files: number, rowGroups: number, bbox: {
        west: number;
        south: number;
        east: number;
        north: number;
    });
}
/**
 * More Overture files match an AOI than the caller's `maxFiles` allows.
 *
 * Silently reading the first N was safe enough for one tile and is not safe
 * for an area: the dropped files are dropped for EVERY tile, so the answer
 * would be quietly short everywhere. The cap now names both counts and the
 * caller decides (WP12 / D47).
 */
export declare class OvertureFileLimitError extends GeodataError {
    readonly collection: string;
    readonly files: number;
    readonly maxFiles: number;
    readonly name = "OvertureFileLimitError";
    constructor(collection: string, files: number, maxFiles: number);
}
/**
 * One read chunk that failed, in the shape the Python host's
 * `TiledRunError.failed_tiles` carries.
 *
 * The two hosts spell one record the same way so a caller who uses both reads
 * one field. `row` and `col` are `-1`: a site read fails by READ CHUNK, not by
 * simulation tile, and a chunk has no place in the simulation grid. The chunk
 * id itself is `chunk-r{row}c{col}` (row-major, zero-based) on both hosts.
 */
export interface SiteChunkFailure {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly error: string;
}
/**
 * A site read in which at least one read chunk failed.
 *
 * Every chunk feeds the site, so ONE failing chunk fails the site. A partial
 * ground set is not a degraded answer. It is an emptier city that nobody can
 * see. The Python host raises `TiledRunError` with the same `failed_tiles`
 * records and the same first underlying error as its `__cause__`; this is the
 * TypeScript twin, so the two hosts refuse the same failure with the same
 * information (`docs/DEVIATIONS.md` D48).
 *
 * `cause` is the FIRST underlying failure in chunk order — the typed
 * `OvertureReadTooLargeError` or `GeodataFetchError` a caller used to catch
 * directly. Catch this class and read `cause` for the reason,
 * {@link failedTiles} for which chunks died.
 */
export declare class SiteReadError extends GeodataError {
    readonly failedTiles: readonly SiteChunkFailure[];
    readonly name = "SiteReadError";
    constructor(message: string, failedTiles: readonly SiteChunkFailure[], cause?: unknown);
}
