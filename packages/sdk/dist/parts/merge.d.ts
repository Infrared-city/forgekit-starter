import type { AreaStatusService } from "../area/run-options.js";
import type { JobsService } from "../jobs.js";
import type { Logger } from "../logger.js";
import { type DaylightResultFormat } from "./result-format.js";
import { type PartsSchedule } from "./types.js";
/**
 * The job service a parts run needs to merge: job status polling plus result download.
 *
 * @category Run an analysis
 */
export type PartsJobsService = AreaStatusService & Pick<JobsService, "downloadResults">;
/**
 * Options for joining the results of a parts run.
 *
 * @category Run an analysis
 */
export interface MergePartsOptions {
    /** Width of the download pool. */
    readonly maxWorkers?: number;
    /** Aborts the polling and the downloads. */
    readonly signal?: AbortSignal;
    /** As `PartsOptions.resultFormat`. Unset: `DEFAULT_DAYLIGHT_RESULT_FORMAT`. */
    readonly resultFormat?: DaylightResultFormat;
    /** Where a JSON fallback of the join is logged. */
    readonly logger?: Logger;
}
/**
 * Resolves the result format of a join: the caller's, else the schedule's own, else the
 * default.
 *
 * @param schedule - The parts run being joined.
 * @param options - Merge options; `resultFormat` wins when set.
 * @returns `"irbf"` or `"json"`.
 * @category Run an analysis
 */
export declare function mergeFormat(schedule: PartsSchedule, options: MergePartsOptions): DaylightResultFormat;
/**
 * Joins the finished parts of a run into one result document.
 *
 * Polls the run once, downloads every part and joins them. The result is the binary frame or
 * the JSON bytes, depending on the result format. Nothing is resubmitted or billed.
 *
 * @param service - The job service used to poll and download.
 * @param schedule - The submitted parts run.
 * @param options - Worker count, abort signal, result format and logger.
 * @returns The joined result document.
 * @throws {AnalysisPartsError} When a part has no result, is not finished, or fails to
 * download. Its `schedule` can be merged again or passed as `retryFrom`.
 * @category Run an analysis
 */
export declare function mergePartsDocument(service: PartsJobsService, schedule: PartsSchedule, options?: MergePartsOptions): Promise<Uint8Array>;
