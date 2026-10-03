/**
 * Join a finished parts run: poll once, download every part, and let the
 * kernel join the part results into the bytes the single request gives:
 * `daylightMergeBinary` (the IRBF frame, D234; it reads JSON and IRBF parts)
 * or `daylightMerge` (the JSON bytes, as before). All or nothing, like the
 * facade merge: a part without a result stops the join with an
 * `AnalysisPartsError` that names it.
 */
import type { AreaStatusService } from "../area/run-options.js";
import type { JobsService } from "../jobs.js";
import type { Logger } from "../logger.js";
import { type DaylightResultFormat } from "./result-format.js";
import { type PartsSchedule } from "./types.js";
export type PartsJobsService = AreaStatusService & Pick<JobsService, "downloadResults">;
export interface MergePartsOptions {
    readonly maxWorkers?: number;
    readonly signal?: AbortSignal;
    /** As `PartsOptions.resultFormat`. Unset: `DEFAULT_DAYLIGHT_RESULT_FORMAT`. */
    readonly resultFormat?: DaylightResultFormat;
    /** Where a JSON fallback of the join is logged. */
    readonly logger?: Logger;
}
/** The format of a join: the caller's, else the schedule's own, else the default. */
export declare function mergeFormat(schedule: PartsSchedule, options: MergePartsOptions): DaylightResultFormat;
/** The joined result document of a parts run: the IRBF frame or the JSON bytes. */
export declare function mergePartsDocument(service: PartsJobsService, schedule: PartsSchedule, options?: MergePartsOptions): Promise<Uint8Array>;
