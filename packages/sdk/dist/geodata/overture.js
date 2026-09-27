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
 * True when the parquet reader and its codecs are installed in this realm.
 *
 * A probe answers a boolean, so the REASON is lost — and the reason is the
 * install command. Pass a logger to keep it: the `GeodataDependencyError`
 * message goes out at debug level before `false` is returned, so a caller who
 * branches on this still has one line naming what to install (D55).
 */
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
 * Throw `GeodataDependencyError` NOW when the parquet reader is absent.
 *
 * The read machinery loads the decoder deep inside itself, at the first row
 * group, so an entry point that plans before it reads reported the plan's own
 * failure instead: `acquireGroundMaterialsArea` said "no read chunk meets any
 * tile rectangle" and `acquireBuildingsArea` said "the source registry is
 * unreachable", neither naming `hyparquet` and neither of the typed class
 * (WAVE2 F3). Every `/geodata` entry point that will certainly read Overture
 * calls this FIRST, so a missing peer dependency is reported as a missing peer
 * dependency.
 *
 * It is the same memoised load `overtureReaderAvailable` probes, so calling it
 * costs one dynamic `import()` per realm and nothing on the reads after it.
 * The two differ only in what they answer with: a boolean loses the install
 * command, and here the install command IS the answer.
 */
export async function requireOvertureReader() {
    await loadParquet();
}
/** Read one Overture collection for an AOI as GeoJSON features. */
export async function readOvertureCollection(collection, bbox, options = {}) {
    const { rows, release } = await readOvertureRows(collection, bbox, options, (row) => row.feature);
    return { features: rows, release };
}
/**
 * The same read as JSON array text.
 *
 * `hyparquet` decodes to JavaScript objects, so one `JSON.stringify` per
 * feature is the boundary cost of a non-kernel decoder. Nothing is parsed
 * again: the text feeds the next kernel call directly (bulk-data rule 1).
 */
export async function readOvertureCollectionJson(collection, bbox, options = {}) {
    const { features, release } = await readOvertureCollection(collection, bbox, options);
    return {
        json: `[${features.map((feature) => JSON.stringify(feature)).join(",")}]`,
        release,
    };
}
