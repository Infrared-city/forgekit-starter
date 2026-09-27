/** Typed failures for the direct data-acquisition layer. */
/** The one command that installs the optional Overture parquet stack. */
export const INSTALL_COMMAND = "npm install hyparquet hyparquet-compressors";
/** Base class: every direct-acquisition failure the caller must see. */
export class GeodataError extends Error {
    name = "GeodataError";
}
/**
 * A URL outside the public data allow-list was requested.
 *
 * The allow-list is what keeps credentials off public objects and keeps a
 * caller-supplied manifest from redirecting a range read at an arbitrary
 * host.
 */
export class HostNotAllowedError extends GeodataError {
    name = "HostNotAllowedError";
    constructor(url) {
        super(`${url} is not a permitted public data URL`);
    }
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
export class GeodataDependencyError extends GeodataError {
    name = "GeodataDependencyError";
    /** The command to run, so a caller can print it without parsing prose. */
    static installCommand = INSTALL_COMMAND;
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
/** A public host answered in a way the reader cannot use. */
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
export class OvertureReadTooLargeError extends GeodataError {
    collection;
    plannedBytes;
    limitBytes;
    files;
    rowGroups;
    bbox;
    name = "OvertureReadTooLargeError";
    constructor(collection, plannedBytes, limitBytes, files, rowGroups, bbox) {
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
 * More Overture files match an AOI than the caller's `maxFiles` allows.
 *
 * Silently reading the first N was safe enough for one tile and is not safe
 * for an area: the dropped files are dropped for EVERY tile, so the answer
 * would be quietly short everywhere. The cap now names both counts and the
 * caller decides (WP12 / D47).
 */
export class OvertureFileLimitError extends GeodataError {
    collection;
    files;
    maxFiles;
    name = "OvertureFileLimitError";
    constructor(collection, files, maxFiles) {
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
export class SiteReadError extends GeodataError {
    failedTiles;
    name = "SiteReadError";
    constructor(message, failedTiles, cause) {
        super(message, cause === undefined ? {} : { cause });
        this.failedTiles = failedTiles;
    }
}
