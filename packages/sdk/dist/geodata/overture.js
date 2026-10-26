import { readOvertureRows } from "./overture-rows.js";
import { loadParquet } from "./overture-parquet.js";
import { silentLogger } from "../logger.js";
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
// Maintainer note (not published): a probe answers a boolean, so the REASON is
// lost — and the reason is the install command. Passing a logger keeps it (D55).
export async function overtureReaderAvailable(logger = silentLogger) {
    try {
        await loadParquet();
        return true;
    }
    catch (error) {
        logger.debug(error.message ?? String(error));
        return false;
    }
}
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
// Maintainer note (not published): the read machinery loads the decoder deep
// inside itself, at the first row group, so an entry point that plans before it
// reads reported the plan's own failure instead: `acquireGroundMaterialsArea`
// said "no read chunk meets any tile rectangle" and `acquireBuildingsArea` said
// "the source registry is unreachable", neither naming `hyparquet` and neither
// of the typed class (WAVE2 F3). Every `/geodata` entry point that will
// certainly read Overture calls this FIRST, so a missing peer dependency is
// reported as a missing peer dependency.
//
// It is the same memoised load `overtureReaderAvailable` probes, so calling it
// costs one dynamic `import()` per realm and nothing on the reads after it.
// The two differ only in what they answer with: a boolean loses the install
// command, and here the install command IS the answer.
export async function requireOvertureReader() {
    await loadParquet();
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
export async function readOvertureCollection(collection, bbox, options = {}) {
    const { rows, release } = await readOvertureRows(collection, bbox, options, (row) => row.feature);
    return { features: rows, release };
}
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
// Maintainer note (not published): `hyparquet` decodes to JavaScript objects, so
// one `JSON.stringify` per feature is the boundary cost of a non-kernel decoder.
// Nothing is parsed again: the text feeds the next kernel call directly
// (bulk-data rule 1).
export async function readOvertureCollectionJson(collection, bbox, options = {}) {
    const { features, release } = await readOvertureCollection(collection, bbox, options);
    return {
        json: `[${features.map((feature) => JSON.stringify(feature)).join(",")}]`,
        release,
    };
}
