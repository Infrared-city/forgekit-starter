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
import { emptySurfaceColumns, surfaceColumnsFromJoin, } from "../results/surface-columns.js";
import { checkAreaState, revivePolledOut } from "./poll.js";
import { parallel, throwable, workerCount } from "./merge-common.js";
import { checkSurfaceBatch, decodeSurfaceChunk, decodeSurfaceHandle, } from "./merge-surface-decode.js";
/** Poll once, then strictly download and join all surface jobs. */
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
    const core = requireCore();
    const store = jobsService.facadeSynthesis;
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
        // A capture is kept only when this client asked for triangles; the
        // merge consumes it. Nothing captured means nothing to draw, and says
        // nothing.
        const captures = scheduled.map(([, job]) => job.jobId === undefined ? undefined : store?.take(job.jobId)?.capture);
        const handles = decoded.map((handle) => handle);
        // `joinSurfaceJobs` owns the handles from here, also when it throws.
        decoded.fill(undefined);
        const joined = core.joinSurfaceJobs(handles, scheduled.map(([entryId]) => entryId), anchors, captures);
        report(joined, scheduled, captures, logger, started);
        return surfaceColumnsFromJoin(joined);
    }
    finally {
        // Every job here is terminal and downloaded, so this schedule is done
        // whether the join finished or threw partway: release the captures it
        // did not take, which would otherwise be held for the life of the client.
        if (store !== undefined) {
            for (const entry of schedule.jobs.values()) {
                if (entry.jobId !== undefined)
                    store.forget(entry.jobId);
            }
        }
    }
}
/**
 * One `warn` per job whose requested triangles did not attach (an alert on
 * `warn` must see degraded output), one `info` per job that got them. A run
 * that never asked says nothing.
 */
function report(joined, scheduled, captures, logger, started) {
    const elapsedMs = Math.round(performance.now() - started);
    // Job indices of the join are in its canonical order (#579); `scheduled`
    // and `captures` are in argument order.
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
    for (let job = 0; job < captures.length; job += 1) {
        if (captures[host(job)] === undefined || fell.has(job) || table.groupEngaged[job] !== 1)
            continue;
        logger.info({ event: "facade_synthesis", outcome: "engaged", jobId: scheduled[host(job)]?.[1].jobId,
            surfaces: table.groupSurfaces[job + 1] - table.groupSurfaces[job], elapsedMs });
    }
}
