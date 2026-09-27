import { type ReadFgbOptions } from "./fgb.js";
import { type ReadOvertureOptions } from "./overture.js";
import type { Bbox } from "./http.js";
/**
 * Direct building acquisition — footprints straight from the public hosts.
 *
 * Precedence is the `prod-BUILDINGS` Lambda's
 * (`backend-lambdas/services/buildings/lib/cityOverlay.ts`): fetch
 * `sources.json`, and when the tile's query rectangle intersects a
 * registered city outline that publishes a `buildings` layer, range-read
 * that city FlatGeobuf; otherwise read Overture's building theme through the
 * R2 index, with a small candidate buffer around the rectangle. Height and
 * id normalisation is a kernel call.
 */
/** Registry layer key naming a city's building overlay. */
export declare const OVERLAY_LAYER_KEY = "buildings";
/**
 * Candidate buffer around the query rectangle for the Overture leg, in
 * degrees — the Lambda's, so the same edge buildings are considered.
 */
export declare const OVERTURE_CANDIDATE_BUFFER_DEG = 0.002;
export interface DirectBuildingsResult {
    readonly features: ReadonlyArray<Record<string, unknown>>;
    readonly source: string;
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, when Overture was read. */
    readonly overtureRelease: string;
}
export interface DirectBuildingsJson {
    /** The normalised footprints as FeatureCollection text (signature 8). */
    readonly collectionJson: string;
    readonly source: string;
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, when Overture was read. */
    readonly overtureRelease: string;
}
export interface AcquireBuildingsOptions extends ReadFgbOptions, ReadOvertureOptions {
    /** `false` forces the global Overture layer inside a registered city. */
    readonly bestAvailable?: boolean;
}
/**
 * Read building footprints for an AOI straight from the public hosts, as
 * JSON text.
 *
 * Read → normalise is one chain of kernel-facing strings; the caller decides
 * whether to parse or to pass the text into the extruder (bulk-data rule 1).
 */
export declare function acquireBuildingsJson(bbox: Bbox, options?: AcquireBuildingsOptions): Promise<DirectBuildingsJson>;
/** The same read, parsed once for a caller that wants feature objects. */
export declare function acquireBuildings(bbox: Bbox, options?: AcquireBuildingsOptions): Promise<DirectBuildingsResult>;
