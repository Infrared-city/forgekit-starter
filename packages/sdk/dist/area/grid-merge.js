/**
 * One grid analysis, merged tile by tile (D273): each archive goes into the
 * kernel merger soon after its download and is not kept. All the archives of
 * one event-loop turn, of every run in the realm, decode in ONE kernel call
 * (on the pool of the threaded core) and each merger places its own tiles in
 * one more call (D299). `mergeAreaJobs` and the result stream (`stream.ts`)
 * merge through this one class, so the failure report of a run is the same
 * on both paths.
 */
import { coreThreads, requireCore } from "../internal/core.js";
import { poolCall } from "../internal/pool-task.js";
import { perTurn } from "../internal/per-turn.js";
import { finishAreaGrid, newAreaGridMerger } from "./area-grid.js";
import { incomplete } from "./incomplete-error.js";
import { throwable } from "./merge-common.js";
import { TileFailurePhase, } from "./schedule-types.js";
function failure(tileId, row, col, error, phase, exception, job) {
    return { tileId, row, col, error, phase, ...(exception === undefined ? {} : { exception }),
        ...(job?.failureKind === undefined ? {} : { kind: job.failureKind }),
        ...(job?.failureStatus === undefined ? {} : { status: job.failureStatus }) };
}
/** Refuse a schedule that a grid merge cannot trust. */
export function checkGridSchedule(schedule) {
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
}
/** The jobs of `schedule` that finished with a result; `other` sees each other job. */
export function completedJobs(schedule, other = () => { }) {
    return [...schedule.jobs.values()].filter((job) => {
        if (job.status === "completed" && job.jobId)
            return true;
        other(job);
        return false;
    });
}
export class GridMerge {
    frame;
    options;
    merger;
    /** Downloaded tiles that give no grid values, by tile id. */
    lost = new Map();
    /** A run error (numeric and categorical tiles mixed): kept, and thrown by `finish`. */
    runError;
    /** Freed: a late download (after a timeout) is dropped, never a new canvas. */
    freed = false;
    constructor(frame, options = {}) {
        this.frame = frame;
        this.options = options;
        const strategy = options.strategy ?? "default";
        if (strategy !== "default" && frame.analysisType !== "wind-speed") {
            throw new Error(`strategy=${JSON.stringify(strategy)} is only valid for wind-speed analyses`);
        }
        if (strategy !== "default" && options.windDirectionDeg === undefined) {
            throw new Error("windDirectionDeg is required");
        }
    }
    /** Merge one tile archive; the archive is not kept. Resolves with why the tile is not usable. */
    push(job, archive) {
        if (this.runError !== undefined || this.freed)
            return Promise.resolve(undefined);
        return decodeInTurn({ grid: this, job, archive }).then((reason) => reason, (error) => {
            this.runError ??= error;
            return undefined;
        });
    }
    /** Place the tiles `at` of `tiles` (one batch of `decodeInTurn`); a reason per item into `out`. */
    place(tiles, at, items, out) {
        // A late download (after a timeout or a run error) never makes a canvas.
        if (this.runError !== undefined || this.freed)
            return;
        try {
            // The canvas is made at the first tile, not at the plan.
            this.merger ??= newAreaGridMerger(this.frame, this.options.strategy ?? "default", this.options.windDirectionDeg, this.options.block);
            const reasons = this.merger.pushMany(tiles, Uint32Array.from(at), Uint32Array.from(at, (i) => items[i].job.row), Uint32Array.from(at, (i) => items[i].job.col));
            for (const [k, i] of at.entries()) {
                const job = items[i].job;
                const reason = reasons[k];
                if (reason !== undefined && reason !== null) {
                    this.lost.set(job.tileId, { error: `result is not a usable grid: ${reason}` });
                    out[i] = String(reason);
                }
                else {
                    this.lost.delete(job.tileId);
                }
            }
        }
        catch (error) {
            this.runError = error;
        }
    }
    /** A tile whose download failed; a reason `push` already gave stays. */
    lose(job, error) {
        if (this.lost.has(job.tileId))
            return;
        const exception = throwable(error);
        this.lost.set(job.tileId, { error: `download failed: ${exception.message}`, exception });
    }
    /**
     * The merged grid of `schedule`, after each completed tile was pushed or lost.
     * The caller ran `checkGridSchedule(schedule)` first.
     * @throws {Error} when any tile failed, was skipped or could not be downloaded.
     */
    finish(schedule, logger, started) {
        if (this.runError !== undefined)
            throw throwable(this.runError);
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
            addFailure(failure(tileId, job?.row ?? -1, job?.col ?? -1, job?.error ?? "job submission failed", TileFailurePhase.Submit, undefined, job));
        }
        for (const tileId of schedule.uncertainSubmissions ?? []) {
            const job = schedule.jobs.get(tileId);
            if (job?.status === "completed" && job.jobId)
                continue;
            skippedJobs.push(tileId);
            addFailure(failure(tileId, job?.row ?? -1, job?.col ?? -1, "job submission acceptance is unknown", TileFailurePhase.Skipped, undefined, job));
        }
        const complete = completedJobs(schedule, (job) => {
            if (job.status === "failed") {
                const item = failure(job.tileId, job.row, job.col, job.error ?? "job failed", TileFailurePhase.Compute, undefined, job);
                failedJobs.push(item);
                addFailure(item);
            }
            else {
                skippedJobs.push(job.tileId);
                addFailure(failure(job.tileId, job.row, job.col, "job did not reach a terminal state", TileFailurePhase.Skipped));
            }
        });
        const executionTime = () => (performance.now() - started) / 1_000;
        if (complete.length === 0) {
            if (failedTiles.length > 0)
                throw incomplete(schedule, failedTiles);
            return {
                mergedGrid: new Float32Array(0), valueDtype: "f32", valueDivisor: 1, gridShape: [0, 0],
                failedJobs, skippedJobs, failedTiles, executionTime: executionTime(),
            };
        }
        for (const job of complete) {
            const lost = this.lost.get(job.tileId);
            if (lost === undefined)
                continue;
            skippedJobs.push(job.tileId);
            // The tile is paid for and lost; name it once here, before the run
            // fails below (D62, #236).
            logger.warn({
                event: "area_tile_download_failed",
                tileId: job.tileId, row: job.row, col: job.col, jobId: job.jobId, error: lost.error,
            });
            addFailure(failure(job.tileId, job.row, job.col, lost.error, TileFailurePhase.Download, lost.exception, job));
        }
        // ONE signal a caller cannot walk past; `failedTiles` and the warning
        // stay, but on their own both were missed.
        if (failedTiles.length > 0)
            throw incomplete(schedule, failedTiles);
        return {
            ...finishAreaGrid(this.merger),
            failedJobs, skippedJobs, failedTiles, executionTime: executionTime(),
        };
    }
    free() {
        this.freed = true;
        this.merger?.free();
        this.merger = undefined;
    }
}
/**
 * The archives of one turn (at most `16 x threads`): ONE kernel decode, on the pool while this
 * thread goes on (`pool-task.ts`), then one `pushMany` per merger.
 */
const decodeInTurn = perTurn(async (items) => {
    const core = requireCore();
    const tiles = await poolCall(() => core.decodeGridTilesStart(items.map((item) => item.archive)), (task) => core.decodeGridTilesEnd(task));
    try {
        const byGrid = new Map();
        for (const [i, item] of items.entries()) {
            const at = byGrid.get(item.grid);
            if (at === undefined)
                byGrid.set(item.grid, [i]);
            else
                at.push(i);
        }
        const out = new Array(items.length).fill(undefined);
        for (const [grid, at] of byGrid)
            grid.place(tiles, at, items, out);
        return out;
    }
    finally {
        tiles.free();
    }
}, () => 16 * coreThreads());
