/**
 * The errors of a finished or stopped area run. The kernel run engine decides
 * the kind and writes the message (`ir_geo::run_engine::final_error`); these
 * are the classes the TypeScript host raises for them.
 */
import { AreaTimeoutError } from "../client-types.js";
import { requireCore } from "../internal/core.js";
/**
 * Thrown by `InfraredClient.runAreaAndWait` and by an item of
 * `runAreaStream` when the run ended without its full result: a tile failed,
 * a finished job did not download, or a submit is uncertain. The key lists
 * name the tiles; `failedJobs` names the jobs for billing or support.
 *
 * @category Errors
 */
export class AreaRunError extends Error {
    failedKeys;
    lostKeys;
    uncertainKeys;
    failedJobs;
    totalJobs;
    name = "AreaRunError";
    /**
     * @param message - The error message.
     * @param failedKeys - Tiles with no job, and tiles whose job failed on the server.
     * @param lostKeys - Tiles whose job succeeded and whose result did not download.
     * @param uncertainKeys - Tiles that may have a job the SDK cannot name.
     * @param failedJobs - The job ids of the failed and the lost tiles that have one.
     * @param totalJobs - The number of jobs the run made.
     */
    constructor(message, failedKeys, lostKeys, uncertainKeys, failedJobs, totalJobs) {
        super(message);
        this.failedKeys = failedKeys;
        this.lostKeys = lostKeys;
        this.uncertainKeys = uncertainKeys;
        this.failedJobs = failedJobs;
        this.totalJobs = totalJobs;
    }
}
/**
 * Thrown when a status request was refused for good (for example HTTP 401 or
 * 403), so the run cannot learn the state of its jobs.
 *
 * @category Errors
 */
export class JobPollError extends Error {
    status;
    name = "JobPollError";
    /**
     * @param message - The error message.
     * @param status - The HTTP status of the refused status request.
     */
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
/**
 * The error of an analysis that finished with `outcome`, or `undefined` for
 * `ok`. The kernel gives the kind and the message: a timeout is an
 * `AreaTimeoutError` (with the run's counts from `state`), anything else an
 * `AreaRunError`.
 */
export function finalError(outcome, facts, analysisType, areaTimeoutS, state) {
    const text = requireCore().areaFinalError(outcome, JSON.stringify(facts), analysisType, areaTimeoutS);
    if (text === undefined || text === null)
        return undefined;
    const error = JSON.parse(text);
    if (error.kind === "area_timeout")
        return new AreaTimeoutError(error.message, state());
    return new AreaRunError(error.message, error.failed_keys, error.lost_keys, error.uncertain_keys, error.failed_jobs, error.total_jobs);
}
/**
 * The error for a failed `RunEngine.step`, by the kernel's reading of its
 * text (`engineStop`): a refused status request is a `JobPollError`, a status
 * request with no outcome is that request's own error (`pollError`), and any
 * other engine error is thrown as it is.
 */
export function engineStopError(error, pollError) {
    const stop = JSON.parse(requireCore().engineStop(String(error?.message ?? error)));
    if (stop.kind === "poll_refused")
        return new JobPollError(stop.message, stop.status ?? 0);
    if (stop.kind === "host_poll_error" && pollError !== undefined)
        return pollError.error;
    return error;
}
