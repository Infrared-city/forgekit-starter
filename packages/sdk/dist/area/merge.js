import { consoleLogger } from "../logger.js";
import { checkAreaState, revivePolledOut } from "./poll.js";
import { TileFailurePhase, } from "./schedule-types.js";
import { finishAreaGrid, newAreaGridMerger } from "./area-grid.js";
import { incomplete } from "./incomplete-error.js";
import { parallel, throwable, workerCount } from "./merge-common.js";
export { mergeSurfaceAreaJobs } from "./merge-surface.js";
function failure(tileId, row, col, error, phase, exception) {
    return { tileId, row, col, error, phase, ...(exception === undefined ? {} : { exception }) };
}
/**
 * Poll a grid schedule once, download the results of its completed tiles and merge them into
 * one grid.
 *
 * Calling it again after a failure gives tiles that were retired by repeated status errors one
 * more chance, since their jobs usually finished.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea`.
 * @param options - Blend strategy, concurrency, cancellation and logging.
 * @returns The merged grid with its shape, legend range and any failed or skipped tiles.
 * @throws {Error} when the schedule is a facade or surface schedule, contains an uncertain
 * or invalid geometry reference, or `options` ask for a directional strategy on a
 * non-wind analysis or without `windDirectionDeg`.
 * @throws {Error} when any tile failed, was skipped or could not be downloaded.
 * @category Run an analysis
 */
export async function mergeAreaJobs(jobsService, schedule, options = {}) {
    const started = performance.now();
    if (schedule.surfaceFields === true) {
        throw new Error("Grid merge does not apply to a surface schedule; call mergeSurfaceAreaJobs");
    }
    if (schedule.geometryProbeUncertain === true) {
        throw new Error("Area run contains an uncertain geometry capability probe");
    }
    if ((schedule.invalidReferenceSubmissions?.length ?? 0) > 0 ||
        [...schedule.jobs.values()].some((job) => job.invalidReference === true)) {
        throw new Error("Area run contains an invalid geometry-reference acceptance");
    }
    const strategy = options.strategy ?? "default";
    if (strategy !== "default" && schedule.analysisType !== "wind-speed") {
        throw new Error(`strategy=${JSON.stringify(strategy)} is only valid for wind-speed analyses`);
    }
    if (strategy !== "default" && options.windDirectionDeg === undefined) {
        throw new Error("windDirectionDeg is required");
    }
    // Calling this function IS the caller asking for their results again, which
    // is the recovery D110's error names. So the poll circuit breaker's victims
    // get one more chance here: their jobs exist, are billed, and usually
    // succeeded while we were being throttled. Inside a run the breaker still
    // does its job — this revives only on an explicit merge (D115).
    const revived = revivePolledOut(schedule);
    await checkAreaState(jobsService, schedule, {
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    if (revived > 0) {
        (options.logger ?? consoleLogger).info({
            event: "area_polled_out_revived", count: revived,
        });
    }
    const failedJobs = [];
    const skippedJobs = [];
    const failedTiles = [];
    const seen = new Set();
    const addFailure = (item) => {
        if (!seen.has(item.tileId)) {
            seen.add(item.tileId);
            failedTiles.push(item);
        }
    };
    for (const tileId of schedule.failedSubmissions) {
        const job = schedule.jobs.get(tileId);
        addFailure(failure(tileId, job?.row ?? -1, job?.col ?? -1, job?.error ?? "job submission failed", TileFailurePhase.Submit));
    }
    for (const tileId of schedule.uncertainSubmissions ?? []) {
        const job = schedule.jobs.get(tileId);
        if (job?.status === "completed" && job.jobId)
            continue;
        skippedJobs.push(tileId);
        addFailure(failure(tileId, job?.row ?? -1, job?.col ?? -1, "job submission acceptance is unknown", TileFailurePhase.Skipped));
    }
    const complete = [...schedule.jobs.values()].filter((job) => {
        if (job.status === "completed" && job.jobId)
            return true;
        if (job.status === "failed") {
            const item = failure(job.tileId, job.row, job.col, job.error ?? "job failed", TileFailurePhase.Compute);
            failedJobs.push(item);
            addFailure(item);
        }
        else {
            skippedJobs.push(job.tileId);
            addFailure(failure(job.tileId, job.row, job.col, "job did not reach a terminal state", TileFailurePhase.Skipped));
        }
        return false;
    });
    const logger = options.logger ?? consoleLogger;
    if (complete.length === 0) {
        if (failedTiles.length > 0)
            throw incomplete(schedule, failedTiles);
        return {
            mergedGrid: new Float32Array(0), valueDtype: "f32", valueDivisor: 1, gridShape: [0, 0],
            failedJobs, skippedJobs, failedTiles, executionTime: (performance.now() - started) / 1_000,
        };
    }
    // ONE kernel merger for the run (D273). Each archive goes in as its download
    // completes and is not kept; the kernel decodes, places (or holds, for a
    // directional strategy) and clips.
    const merger = newAreaGridMerger(schedule, strategy, options.windDirectionDeg, options.block);
    try {
        const downloadErrors = Array(complete.length);
        const unusable = Array(complete.length);
        // A run error (numeric and categorical tiles mixed) is kept, not thrown in
        // the task: `parallel` then waits for EVERY task, so no task can push into
        // the merger after `finally` freed it.
        let runError;
        await parallel(complete.map((job, index) => ({ job, index })), workerCount(options.maxWorkers), async ({ job, index }) => {
            let content;
            try {
                content = (await jobsService.downloadResults(job.jobId, {
                    ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }),
                    ...(options.signal === undefined ? {} : { signal: options.signal }),
                })).content;
            }
            catch (error) {
                downloadErrors[index] = throwable(error);
                return;
            }
            if (options.signal?.aborted || runError !== undefined)
                return;
            // A run error is not a download failure. A tile the kernel cannot use
            // comes back as its reason.
            try {
                unusable[index] = merger.push(job.row, job.col, content) ?? undefined;
            }
            catch (error) {
                runError = error;
            }
        });
        if (runError !== undefined)
            throw throwable(runError);
        if (options.signal?.aborted) {
            throw options.signal.reason ?? new DOMException("aborted", "AbortError");
        }
        complete.forEach((job, index) => {
            const exception = downloadErrors[index];
            const reason = unusable[index];
            if (exception === undefined && reason === undefined)
                return;
            skippedJobs.push(job.tileId);
            const error = exception === undefined
                ? `result is not a usable grid: ${reason}` : `download failed: ${exception.message}`;
            // The tile is paid for and lost; name it once here, before the run
            // fails below (D62, #236).
            logger.warn({
                event: "area_tile_download_failed",
                tileId: job.tileId, row: job.row, col: job.col, jobId: job.jobId, error,
            });
            addFailure(failure(job.tileId, job.row, job.col, error, TileFailurePhase.Download, exception));
        });
        // ONE signal a caller cannot walk past, as the surface merge below already
        // does. `failedTiles` and the warning stay — on their own both were missed.
        if (failedTiles.length > 0)
            throw incomplete(schedule, failedTiles);
        return {
            ...finishAreaGrid(merger),
            failedJobs, skippedJobs, failedTiles,
            executionTime: (performance.now() - started) / 1_000,
        };
    }
    finally {
        merger.free();
    }
}
