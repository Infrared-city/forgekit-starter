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
 * True when the parquet reader and its codecs are installed in this realm.
 *
 * A probe answers a boolean, so the REASON is lost — and the reason is the
 * install command. Pass a logger to keep it: the `GeodataDependencyError`
 * message goes out at debug level before `false` is returned, so a caller who
 * branches on this still has one line naming what to install (D55).
 */
export declare function overtureReaderAvailable(logger?: Logger): Promise<boolean>;
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
export declare function requireOvertureReader(): Promise<void>;
/** Features plus the release they came from, for the result metadata. */
export interface OvertureRead {
    readonly features: Array<Record<string, unknown>>;
    readonly release: string;
}
/** Read one Overture collection for an AOI as GeoJSON features. */
export declare function readOvertureCollection(collection: string, bbox: Bbox, options?: ReadOvertureOptions): Promise<OvertureRead>;
/**
 * The same read as JSON array text.
 *
 * `hyparquet` decodes to JavaScript objects, so one `JSON.stringify` per
 * feature is the boundary cost of a non-kernel decoder. Nothing is parsed
 * again: the text feeds the next kernel call directly (bulk-data rule 1).
 */
export declare function readOvertureCollectionJson(collection: string, bbox: Bbox, options?: ReadOvertureOptions): Promise<{
    json: string;
    release: string;
}>;
