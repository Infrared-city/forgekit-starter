/**
 * The errors of a finished or stopped area run. The kernel run engine decides
 * the kind and writes the message (`ir_geo::run_engine::final_error`); these
 * are the classes the TypeScript host raises for them.
 */
import { AreaTimeoutError } from "../client-types.js";
import type { EngineFacts, EngineOutcome } from "./run-engine.js";
import type { AreaState } from "./schedule-types.js";
/**
 * Thrown by `InfraredClient.runAreaAndWait` and by an item of
 * `runAreaStream` when the run ended without its full result: a tile failed,
 * a finished job did not download, or a submit is uncertain. The key lists
 * name the tiles; `failedJobs` names the jobs for billing or support.
 *
 * @category Errors
 */
export declare class AreaRunError extends Error {
    readonly failedKeys: readonly string[];
    readonly lostKeys: readonly string[];
    readonly uncertainKeys: readonly string[];
    readonly failedJobs: readonly string[];
    readonly totalJobs: number;
    readonly name = "AreaRunError";
    /**
     * @param message - The error message.
     * @param failedKeys - Tiles with no job, and tiles whose job failed on the server.
     * @param lostKeys - Tiles whose job succeeded and whose result did not download.
     * @param uncertainKeys - Tiles that may have a job the SDK cannot name.
     * @param failedJobs - The job ids of the failed and the lost tiles that have one.
     * @param totalJobs - The number of jobs the run made.
     */
    constructor(message: string, failedKeys: readonly string[], lostKeys: readonly string[], uncertainKeys: readonly string[], failedJobs: readonly string[], totalJobs: number);
}
/**
 * Thrown when a status request was refused for good (for example HTTP 401 or
 * 403), so the run cannot learn the state of its jobs.
 *
 * @category Errors
 */
export declare class JobPollError extends Error {
    readonly status: number;
    readonly name = "JobPollError";
    /**
     * @param message - The error message.
     * @param status - The HTTP status of the refused status request.
     */
    constructor(message: string, status: number);
}
/**
 * The error of an analysis that finished with `outcome`, or `undefined` for
 * `ok`. The kernel gives the kind and the message: a timeout is an
 * `AreaTimeoutError` (with the run's counts from `state`), anything else an
 * `AreaRunError`.
 */
export declare function finalError(outcome: EngineOutcome, facts: EngineFacts, analysisType: string, areaTimeoutS: number, state: () => AreaState): AreaTimeoutError | AreaRunError | undefined;
/**
 * The error for a failed `RunEngine.step`, by the kernel's reading of its
 * text (`engineStop`): a refused status request is a `JobPollError`, a status
 * request with no outcome is that request's own error (`pollError`), and any
 * other engine error is thrown as it is.
 */
export declare function engineStopError(error: unknown, pollError: {
    readonly error: unknown;
} | undefined): unknown;
