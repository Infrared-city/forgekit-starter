/**
 * `runAndWait` for an analysis the kernel splits into parts (daylight-factor,
 * D221): plan, submit the parts, wait, join. A request of one part takes the
 * one-job path and sends the bytes it always sent.
 */
import type { AreaJobsService } from "../area/run-options.js";
import type { JobsService, OnPollCallback } from "../jobs.js";
import type { Logger } from "../logger.js";
import { type DecompressResultArchiveOptions } from "../results/archive.js";
import { type MergePartsOptions, type PartsJobsService } from "./merge.js";
import { type PlannedRequest } from "./plan.js";
import { type DaylightResultFormat } from "./result-format.js";
import { type PartsPreview, type PartsSchedule, type PartsWaitOptions } from "./types.js";
export type PartsClientJobs = AreaJobsService & PartsJobsService & Pick<JobsService, "prepareSubmission" | "waitForCompletion" | "decompress">;
export interface RunAndWaitOptions extends PartsWaitOptions {
    /** One job's status after each poll. Not called for a multi-part run, which
     * polls a schedule: use `onProgress` there. */
    readonly onPoll?: OnPollCallback;
    /** Limits of the one-job result archive (as `jobs.decompress`), every analysis. */
    readonly archive?: DecompressResultArchiveOptions;
}
export declare class PartsTimeoutError extends Error {
    readonly schedule: PartsSchedule;
    readonly name = "PartsTimeoutError";
    constructor(message: string, schedule: PartsSchedule);
}
/** The result's `warnings`, once per run, on the client logger. */
export declare function logWarnings(value: unknown, analysisType: string, logger: Logger): void;
/**
 * The value of one daylight-factor result document in `format` (D234). A
 * frame is viewed in place. With `"irbf"`, a JSON document (an older server,
 * or a result the worker could not write as a frame) is turned into the
 * frame by the kernel; when it has no exact frame, the JSON value is
 * returned and logged.
 */
export declare function daylightValue(document: Uint8Array, format: DaylightResultFormat, logger: Logger): unknown;
export declare function runPlannedAndWait(jobs: PartsClientJobs, logger: Logger, request: PlannedRequest, options?: RunAndWaitOptions): Promise<unknown>;
export declare function runAndWaitParts(jobs: PartsClientJobs, logger: Logger, input: Readonly<Record<string, unknown>>, options?: RunAndWaitOptions): Promise<unknown>;
/** Submit a request as parts; a request of one part is refused here (use `run`). */
export declare function runParts(jobs: PartsClientJobs, logger: Logger, input: Readonly<Record<string, unknown>>, options?: PartsWaitOptions): Promise<PartsSchedule>;
/** What a run of `input` submits and bills, offline: no request is sent. */
export declare function previewParts(jobs: Pick<JobsService, "prepareSubmission">, logger: Logger, input: Readonly<Record<string, unknown>>, options?: PartsWaitOptions, target?: number): PartsPreview;
/** `mergeParts`: the joined value of a finished run. Only a daylight-factor
 * schedule has the binary result; any other keeps its JSON value. */
export declare function mergePartsValue(jobs: PartsJobsService, logger: Logger, schedule: PartsSchedule, options?: MergePartsOptions): Promise<unknown>;
