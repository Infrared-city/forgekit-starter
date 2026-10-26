import type { AreaJobsService } from "../area/run-options.js";
import type { JobsService, OnPollCallback } from "../jobs.js";
import type { Logger } from "../logger.js";
import { type DecompressResultArchiveOptions } from "../results/archive.js";
import { type MergePartsOptions, type PartsJobsService } from "./merge.js";
import { type PlannedRequest } from "./plan.js";
import { type DaylightResultFormat } from "./result-format.js";
import { type PartsPreview, type PartsSchedule, type PartsWaitOptions } from "./types.js";
/**
 * The job service a parts run needs: submission, polling, download and decompression.
 *
 * @category Run an analysis
 */
export type PartsClientJobs = AreaJobsService & PartsJobsService & Pick<JobsService, "prepareSubmission" | "waitForCompletion" | "decompress">;
/**
 * Options for running an analysis and waiting for its result, when the request may be
 * split into parts.
 *
 * @category Run an analysis
 */
export interface RunAndWaitOptions extends PartsWaitOptions {
    /**
     * Called with one job's status after each poll. Not called for a multi-part run, which
     * polls all parts together: use `onProgress` there.
     */
    readonly onPoll?: OnPollCallback;
    /** Size limits for the downloaded result archive (as `jobs.decompress`), for every analysis. */
    readonly archive?: DecompressResultArchiveOptions;
}
/**
 * Thrown when the parts of a run do not all finish within the timeout.
 *
 * The parts are already submitted and billed. `schedule` holds the accepted jobs, so the
 * run can be merged again later or passed as `retryFrom`.
 *
 * @category Errors
 */
export declare class PartsTimeoutError extends Error {
    readonly schedule: PartsSchedule;
    readonly name = "PartsTimeoutError";
    /**
     * @param message - What timed out and how many parts had finished.
     * @param schedule - The submitted parts run, with its accepted jobs.
     */
    constructor(message: string, schedule: PartsSchedule);
}
/**
 * Logs the `warnings` of a result once, at `warn` level, on the client logger.
 *
 * @param value - The result value; anything without warnings is ignored.
 * @param analysisType - The analysis type, added to the log entry.
 * @param logger - The logger to write to.
 * @category Run an analysis
 */
export declare function logWarnings(value: unknown, analysisType: string, logger: Logger): void;
/**
 * Turns one daylight-factor result document into a value in the requested format.
 *
 * A binary frame is viewed in place. With `"irbf"`, a JSON document (from an older server,
 * or a result that could not be written as a frame) is converted to a frame; when it has no
 * exact frame, the parsed JSON value is returned and the fallback is logged.
 *
 * @param document - The decompressed result document.
 * @param format - `"irbf"` for a `DaylightFactorResult`, `"json"` for the JSON value.
 * @param logger - Where a JSON fallback is logged.
 * @returns A `DaylightFactorResult` or the parsed JSON value.
 * @category Results and legend
 */
export declare function daylightValue(document: Uint8Array, format: DaylightResultFormat, logger: Logger): unknown;
/**
 * Submits a planned request, waits for it and returns the result.
 *
 * A request of one part runs as one job. A request of several parts submits every part,
 * waits for all of them and joins the results. From the moment parts are submitted, every
 * error leaves with the run's schedule so nothing has to be paid for twice.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param request - The planned request.
 * @param options - Timeout, progress callbacks, result format, retry schedule and so on.
 * @returns The analysis result: a `DaylightFactorResult` or a JSON value.
 * @throws {PartsTimeoutError} When the parts do not finish within `options.timeout`.
 * @throws {AnalysisPartsError} When a part fails or the results cannot be joined.
 * @category Run an analysis
 */
export declare function runPlannedAndWait(jobs: PartsClientJobs, logger: Logger, request: PlannedRequest, options?: RunAndWaitOptions): Promise<unknown>;
/**
 * Plans a request, submits it (as parts when it splits), waits and returns the result.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - Timeout, progress callbacks, result format, retry schedule and so on.
 * @returns The analysis result: a `DaylightFactorResult` or a JSON value.
 * @throws {PartsTimeoutError} When the parts do not finish within `options.timeout`.
 * @throws {AnalysisPartsError} When a part fails or the results cannot be joined.
 * @category Run an analysis
 */
export declare function runAndWaitParts(jobs: PartsClientJobs, logger: Logger, input: Readonly<Record<string, unknown>>, options?: RunAndWaitOptions): Promise<unknown>;
/**
 * Submits a request as parts and returns the schedule without waiting.
 *
 * A request that is one job is refused here; submit it with `run` or `analyses.execute`.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - Part limits, workers, webhook, transport, result format and retry schedule.
 * @returns The schedule of the submitted parts.
 * @throws {Error} When the request is one job.
 * @category Run an analysis
 */
export declare function runParts(jobs: PartsClientJobs, logger: Logger, input: Readonly<Record<string, unknown>>, options?: PartsWaitOptions): Promise<PartsSchedule>;
/**
 * Previews what a run of `input` would submit and bill, offline: no request is sent.
 *
 * @param jobs - The job service (only used to prepare the submission).
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - The same options as the run.
 * @param target - Optional planning target for the split.
 * @returns The part count, sensors per part and estimated cost in tokens.
 * @category Run an analysis
 */
export declare function previewParts(jobs: Pick<JobsService, "prepareSubmission">, logger: Logger, input: Readonly<Record<string, unknown>>, options?: PartsWaitOptions, target?: number): PartsPreview;
/**
 * Joins the finished parts of a run into one result value.
 *
 * Only a daylight-factor run has the binary result; any other analysis keeps its JSON value.
 *
 * @param jobs - The job service used to poll and download.
 * @param logger - The client logger.
 * @param schedule - The submitted parts run.
 * @param options - Worker count, abort signal and result format.
 * @returns The joined result value.
 * @throws {AnalysisPartsError} When a part has no result, is not finished, or fails to
 * download.
 * @category Run an analysis
 */
export declare function mergePartsValue(jobs: PartsJobsService, logger: Logger, schedule: PartsSchedule, options?: MergePartsOptions): Promise<unknown>;
