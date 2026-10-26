/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * Each download is decoded by the kernel as it arrives
 * (`merge-surface-decode.ts`), so the decode overlaps the network. Then ONE
 * kernel call joins the run (`joinSurfaceJobs`, D197): the triangle checks
 * and the synthesis from the captures this client kept, the union in
 * schedule order, and the columns this function returns (D198). This host
 * builds no object per surface and no array per cell.
 */
import { consoleLogger } from "../logger.js";
import { coreThreads, requireCore } from "../internal/core.js";
import { FacadeCaptures } from "./facade-captures.js";
import { emptySurfaceColumns, surfaceColumnsFromJoin, } from "../results/surface-columns.js";
import { checkAreaState, revivePolledOut } from "./poll.js";
import { parallel, throwable, workerCount } from "./merge-common.js";
import { checkSurfaceBatch, decodeSurfaceChunk, decodeSurfaceHandle, } from "./merge-surface-decode.js";
/**
 * Polls a surface schedule once, downloads the results of all its jobs and joins them into
 * one set of surface columns.
 *
 * Every job must have completed: any failed or missing submission, or any job still pending or
 * running, makes the merge fail instead of returning a partial result. Calling it again after
 * a failure gives tiles that were retired by repeated status errors one more chance. A schedule
 * with no jobs gives empty columns.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea` for a surface analysis.
 * @param options - `maxWorkers` (concurrent downloads), `signal` (cancellation) and `logger`.
 * @returns The merged surface columns.
 * @throws {Error} when the schedule is not a surface schedule, contains an uncertain or invalid
 *   geometry reference, has failed or uncertain submissions, has jobs that did not succeed, or a
 *   download or decode failed (the cause is attached).
 * @throws when `options.signal` is aborted: the abort reason.
 * @category Run an analysis
 */
// Maintainer note (not published): an explicit merge is a retry, so the poll breaker's victims
// get one more chance (D115). The join is one kernel call for the whole run (D197).
export async function mergeSurfaceAreaJobs(jobsService, schedule, options = {}) {
    if (schedule.surfaceFields !== true)
        throw new Error("Surface merge requires a surface schedule");
    if (schedule.geometryProbeUncertain === true) {
        throw new Error("Area run contains an uncertain geometry capability probe");
    }
    if ((schedule.invalidReferenceSubmissions?.length ?? 0) > 0 ||
        [...schedule.jobs.values()].some((job) => job.invalidReference === true)) {
        throw new Error("Area run contains an invalid geometry-reference acceptance");
    }
    // Same reason as the grid merge: an explicit merge is a retry, so the
    // poll breaker's victims get one more chance (D115).
    revivePolledOut(schedule);
    await checkAreaState(jobsService, schedule, {
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    const recovered = (tileId) => {
        const job = schedule.jobs.get(tileId);
        return job?.status === "completed" && Boolean(job.jobId);
    };
    const missing = [
        ...schedule.failedSubmissions,
        ...(schedule.uncertainSubmissions ?? []).filter((tileId) => !recovered(tileId)),
    ];
    if (missing.length > 0) {
        throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify(missing.sort())}`);
    }
    if (schedule.jobs.size === 0)
        return emptySurfaceColumns();
    const incomplete = [...schedule.jobs.values()].filter((job) => job.status !== "completed" || !job.jobId);
    if (incomplete.length > 0) {
        throw new Error(`Cannot merge surface results: jobs not succeeded: ${JSON.stringify(incomplete.map((job) => job.jobId ?? job.tileId))}`);
    }
    const scheduled = [...schedule.jobs.entries()];
    const decoded = Array(scheduled.length);
    const errors = Array(scheduled.length);
    // The serial core decodes each download as it arrives, overlapping the
    // network. The threaded core (D205) decodes them in calls of
    // `2 x threads` on its pool, also as they arrive: at most one call's worth
    // of downloaded bytes waits in this process.
    const batch = coreThreads() > 1;
    const contents = Array(batch ? scheduled.length : 0);
    const waiting = [];
    const decodeWaiting = () => decodeSurfaceChunk(waiting.splice(0), contents, decoded);
    try {
        await parallel(scheduled.map((entry, index) => ({ entry, index })), workerCount(options.maxWorkers), async ({ entry: [entryId, job], index }) => {
            try {
                const result = await jobsService.downloadResults(job.jobId, {
                    ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }),
                    ...(options.signal === undefined ? {} : { signal: options.signal }),
                });
                if (batch) {
                    contents[index] = result.content;
                    waiting.push(index);
                    if (waiting.length >= 2 * coreThreads())
                        decodeWaiting();
                    return;
                }
                const value = decodeSurfaceHandle(result.content);
                if (value === undefined) {
                    throw new Error(`surface entry ${entryId} returned a non-surface result`);
                }
                decoded[index] = value;
            }
            catch (error) {
                errors[index] = throwable(error);
            }
        });
        if (options.signal?.aborted) {
            throw options.signal.reason ?? new DOMException("aborted", "AbortError");
        }
        const failedAt = errors.findIndex((error) => error !== undefined);
        if (failedAt !== -1) {
            throw new Error(`Cannot merge surface results: download failed for ${scheduled[failedAt][0]}`, {
                cause: errors[failedAt],
            });
        }
        if (batch) {
            decodeWaiting();
            checkSurfaceBatch(scheduled.map(([entryId]) => entryId), decoded);
        }
        return join(jobsService, schedule, scheduled, decoded, options.logger ?? consoleLogger);
    }
    finally {
        // A handle no join consumed (a failed download elsewhere, an abort, a
        // missing tile position) is freed here; its WebAssembly memory would
        // otherwise wait for a finalizer. The join takes the others.
        for (const value of decoded)
            value?.free();
    }
}
/** One kernel call for the whole run; the fallbacks are logged here. */
function join(jobsService, schedule, scheduled, decoded, logger) {
    const started = performance.now();
    const positions = new Map(schedule.tilePositions.map((position) => [position.tileId, position]));
    const core = requireCore("mergeSurfaceAreaJobs");
    const captures = jobsService.captures;
    // A service without captures gets an empty store for this call (every surface then has no outline).
    const store = captures ?? new FacadeCaptures();
    try {
        const anchors = new Float64Array(scheduled.length * 2);
        scheduled.forEach(([entryId], index) => {
            const position = positions.get(entryId);
            if (position === undefined)
                throw new Error(`surface entry ${entryId} has no tile position`);
            const [swX, swY] = core.tileSwOffset(position.row, position.col, schedule.analysisType);
            anchors[index * 2] = swX;
            anchors[index * 2 + 1] = swY;
        });
        // Every surface run of this client keeps its capture in the kernel store: the join rebuilds
        // the layout from it and gives each surface its outline, and releases the jobs it consumed.
        // The per-cell triangles are built only when the caller asked for them (`emitCellTris`). No
        // capture means no outline, and `surfaceRenderBuffers` then refuses the surface.
        const jobIds = scheduled.map(([, job]) => job.jobId);
        // #835: a job accepted while its capture could not be kept. Name each one; the join still
        // runs, and those surfaces have no outline.
        for (const [entryId, job] of scheduled) {
            if (job.jobId !== undefined && captures?.lostCapture(job.jobId) === true) {
                logger.warn({ event: "facade_capture_missing", tileId: entryId, jobId: job.jobId,
                    reason: "the capture was not kept after the job was accepted; its surfaces have no " +
                        "outline, and surfaceRenderBuffers refuses them" });
            }
        }
        const emitCellTris = captures?.wantsCellTris(jobIds) ?? false;
        const handles = decoded.map((handle) => handle);
        // `joinSurfaceJobs` owns the handles from here, also when it throws.
        decoded.fill(undefined);
        const joined = core.joinSurfaceJobs(handles, scheduled.map(([entryId]) => entryId), anchors, store.store, jobIds, emitCellTris);
        store.forgetSchedule(schedule); // the join released its jobs on success; this drops the flags
        report(joined, scheduled, logger, started);
        return surfaceColumnsFromJoin(joined);
    }
    finally {
        // A failed join keeps its jobs for a retry of the merge; `runAreaAndWait` releases them.
        if (captures === undefined)
            store.free();
    }
}
/**
 * One `warn` per job whose requested triangles did not attach (an alert on
 * `warn` must see degraded output), one `info` per job that got them. A run
 * that never asked says nothing.
 */
function report(joined, scheduled, logger, started) {
    const elapsedMs = Math.round(performance.now() - started);
    // Job indices of the join are in its canonical order (#579); `scheduled`
    // is in argument order.
    const host = (job) => joined.jobOrder[job];
    const fell = new Set();
    for (const { job, reason, detail } of joined.fallbacks) {
        fell.add(job);
        logger.warn({ event: "facade_synthesis", outcome: "fell_back", reason, jobId: scheduled[host(job)]?.[1].jobId,
            elapsedMs, ...(detail === undefined ? {} : { detail }) });
    }
    const table = joined.triangles;
    if (table === undefined)
        return;
    for (let job = 0; job < scheduled.length; job += 1) {
        if (fell.has(job) || table.groupEngaged[job] !== 1)
            continue;
        logger.info({ event: "facade_synthesis", outcome: "engaged", jobId: scheduled[host(job)]?.[1].jobId,
            surfaces: table.groupSurfaces[job + 1] - table.groupSurfaces[job], elapsedMs });
    }
}
