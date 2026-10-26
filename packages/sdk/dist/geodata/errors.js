/** Typed failures for the direct data-acquisition layer. */
/**
 * The command that installs the optional Overture parquet packages.
 *
 * @category Geodata
 */
export const INSTALL_COMMAND = "npm install hyparquet hyparquet-compressors";
/**
 * Base class for every direct data-acquisition failure.
 *
 * Catch this class to handle any error thrown by the geodata readers.
 *
 * @category Errors
 */
export class GeodataError extends Error {
    name = "GeodataError";
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
export class HostNotAllowedError extends GeodataError {
    name = "HostNotAllowedError";
    constructor(url) {
        super(`${url} is not a permitted public data URL`);
    }
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
// Maintainer note (not published): Optional peer deps are loaded with a
// dynamic `import()` (D55). ONE error naming BOTH packages and the exact
// command: a message that names only the half that failed sends the caller
// round twice. There is no fallback decoder: an unreadable parquet file
// cannot become an empty area.
export class GeodataDependencyError extends GeodataError {
    name = "GeodataDependencyError";
    /** The command to run, so a caller can print it without parsing prose. */
    static installCommand = INSTALL_COMMAND;
    /** The package that could not be loaded. */
    packageName;
    constructor(packageName, cause) {
        super(`${packageName} is not installed. Reading Overture Maps parquet needs ` +
            `the optional parquet stack; install it with "${INSTALL_COMMAND}". ` +
            "Everything that does not read Overture works without it: payloads, " +
            "area runs over your own geometry, results, images, and the static " +
            "weather catalog.", cause === undefined ? {} : { cause });
        this.packageName = packageName;
    }
}
/**
 * A public host answered in a way the reader cannot use.
 *
 * `status` carries the HTTP status code when there was one.
 *
 * @category Errors
 */
export class GeodataFetchError extends GeodataError {
    status;
    name = "GeodataFetchError";
    constructor(url, detail, status) {
        super(`${url}: ${detail}`);
        this.status = status;
    }
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
export class GeodataRangeError extends GeodataError {
    status;
    name = "GeodataRangeError";
    constructor(url, detail, status) {
        super(`${url}: ${detail}`);
        this.status = status;
    }
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
// Maintainer note (not published): WP12 / D47. The footers are known BEFORE
// any row group is fetched, so this fails once, never as an out-of-memory
// kill or a dead browser tab. The budget is per CALL, not per collection:
// one process holds all three ground themes.
export class OvertureReadTooLargeError extends GeodataError {
    collection;
    plannedBytes;
    limitBytes;
    files;
    rowGroups;
    bbox;
    name = "OvertureReadTooLargeError";
    constructor(
    /** The Overture collection being read, such as `"building"`. */
    collection, 
    /** Compressed bytes the read would have fetched. */
    plannedBytes, 
    /** The byte limit that was exceeded. */
    limitBytes, 
    /** Number of parquet files in the plan. */
    files, 
    /** Number of row groups in the plan. */
    rowGroups, 
    /** The rectangle the read was planned for. */
    bbox) {
        super(`reading ${collection} for ${describe(bbox)} plans ${mib(plannedBytes)} MiB of ` +
            `compressed parquet (${rowGroups} row groups in ${files} files), over the ` +
            `${mib(limitBytes)} MiB limit for this runtime; read a smaller area or raise ` +
            "maxPlannedBytes");
        this.collection = collection;
        this.plannedBytes = plannedBytes;
        this.limitBytes = limitBytes;
        this.files = files;
        this.rowGroups = rowGroups;
        this.bbox = bbox;
    }
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
// Maintainer note (not published): WP12 / D47. Silently reading the first N
// was safe enough for one tile and is not safe for an area: the dropped
// files are dropped for EVERY tile, so the answer would be quietly short
// everywhere.
export class OvertureFileLimitError extends GeodataError {
    collection;
    files;
    maxFiles;
    name = "OvertureFileLimitError";
    constructor(
    /** The Overture collection being read, such as `"building"`. */
    collection, 
    /** Number of files that match the area. */
    files, 
    /** The `maxFiles` limit that was exceeded. */
    maxFiles) {
        super(`${collection} matches ${files} Overture files for this area, over the maxFiles ` +
            `limit of ${maxFiles}; reading only the first ${maxFiles} would drop features ` +
            "from every tile");
        this.collection = collection;
        this.files = files;
        this.maxFiles = maxFiles;
    }
}
function describe(bbox) {
    return `[${bbox.west}, ${bbox.south}, ${bbox.east}, ${bbox.north}]`;
}
function mib(bytes) {
    return Math.round(bytes / (1024 * 1024));
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
// Maintainer note (not published): The Python host raises `TiledRunError`
// with the same `failed_tiles` records and the same first underlying error
// as its `__cause__`; this is the TypeScript twin, so the two hosts refuse
// the same failure with the same information (D48).
export class SiteReadError extends GeodataError {
    failedTiles;
    name = "SiteReadError";
    constructor(message, 
    /** Every chunk that failed, in row-major order. */
    failedTiles, cause) {
        super(message, cause === undefined ? {} : { cause });
        this.failedTiles = failedTiles;
    }
}
