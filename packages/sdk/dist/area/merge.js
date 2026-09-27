import { consoleLogger } from "../logger.js";
import { requireCore } from "../internal/core.js";
import { checkAreaState, revivePolledOut } from "./poll.js";
import { TileFailurePhase, } from "./schedule-types.js";
import { denseGridTiles, flattenGridTile, GridCanvas, gridWireConfig, } from "./merge-grid-data.js";
import { areaGridResult } from "./compact-grid-result.js";
import { incomplete } from "./incomplete-error.js";
import { parallel, throwable, workerCount } from "./merge-common.js";
export { mergeSurfaceAreaJobs } from "./merge-surface.js";
function failure(tileId, row, col, error, phase, exception) {
    return { tileId, row, col, error, phase, ...(exception === undefined ? {} : { exception }) };
}
/** Poll once, download completed grid jobs, and merge them in the shared core. */
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
    const config = gridWireConfig(schedule.analysisType);
    const tileCells = config.inference_size_cells ** 2;
    // ONE canvas, filled as the tiles arrive and compacted in place at the end:
    // no per-tile buffer ever coexists with it (WP14-C).
    const canvas = new GridCanvas(complete.length, tileCells);
    const downloadErrors = Array(complete.length);
    await parallel(complete.map((job, index) => ({ job, index })), workerCount(options.maxWorkers), async ({ job, index }) => {
        let parsed;
        try {
            const result = await jobsService.downloadResults(job.jobId, {
                ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
            });
            parsed = areaGridResult(result.content);
        }
        catch (error) {
            downloadErrors[index] = throwable(error);
            return;
        }
        // OUTSIDE the catch: a malformed result is not a download failure, and
        // folding it into one would report it as a network problem. Flattening
        // here rather than after every download lets the decoded grid — 262,144
        // boxed numbers for a 512 x 512 tile — go as soon as it is copied.
        canvas.place(index, flattenGridTile(job.row, job.col, parsed, tileCells));
    });
    if (options.signal?.aborted) {
        throw options.signal.reason ?? new DOMException("aborted", "AbortError");
    }
    const logger = options.logger ?? consoleLogger;
    downloadErrors.forEach((exception, index) => {
        if (exception === undefined)
            return;
        const job = complete[index];
        skippedJobs.push(job.tileId);
        // The tile is paid for and lost after the retry in `downloadResults`;
        // name it once here, before the run fails below (D62, #236).
        logger.warn({
            event: "area_tile_download_failed",
            tileId: job.tileId, row: job.row, col: job.col, jobId: job.jobId,
            error: exception.message,
        });
        addFailure(failure(job.tileId, job.row, job.col, `download failed: ${exception.message}`, TileFailurePhase.Download, exception));
    });
    // ONE signal a caller cannot walk past, as the surface merge below already
    // does. `failedTiles` and the warning stay — on their own both were missed.
    if (failedTiles.length > 0)
        throw incomplete(schedule, failedTiles);
    // The gaps the failed tiles left are closed IN PLACE; `usable` carries only
    // each kept tile's position (and its labels, for a categorical area).
    const { tiles: usable, values: filled } = canvas.finish();
    if (usable.length === 0) {
        return {
            mergedGrid: new Float64Array(0), gridShape: [0, 0], failedJobs, skippedJobs,
            failedTiles, executionTime: (performance.now() - started) / 1_000,
        };
    }
    const dense = denseGridTiles(usable, tileCells, filled);
    const core = requireCore();
    const compactCore = core;
    const configJson = JSON.stringify(config), polygonJson = JSON.stringify(schedule.polygon);
    const merged = dense.values instanceof Float32Array && strategy === "default"
        ? compactCore.mergeAreaGridCompact(dense.values, dense.positions, schedule.gridShape[0], schedule.gridShape[1], configJson, polygonJson)
        : dense.values instanceof Float32Array
            ? compactCore.mergeAreaGridCompactWind(dense.values, dense.positions, schedule.gridShape[0], schedule.gridShape[1], configJson, polygonJson, strategy, options.windDirectionDeg, options.block)
            : core.mergeAreaGridDenseF64(dense.values, dense.positions, schedule.gridShape[0], schedule.gridShape[1], configJson, polygonJson, strategy, options.windDirectionDeg, options.block);
    try {
        const shape = merged.shape;
        if (shape.length !== 2)
            throw new Error("area merge returned an invalid grid shape");
        const bounds = merged.bounds;
        return {
            mergedGrid: merged.values,
            gridShape: [shape[0], shape[1]],
            ...(dense.legend === undefined ? {} : { legend: dense.legend }),
            failedJobs, skippedJobs, failedTiles,
            executionTime: (performance.now() - started) / 1_000,
            ...(bounds === undefined ? {} : {
                bounds: [bounds[0], bounds[1], bounds[2], bounds[3]],
            }),
        };
    }
    finally {
        merged.free();
    }
}
