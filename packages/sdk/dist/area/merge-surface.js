/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * Each download is decoded by the kernel right away (`merge-surface-decode.ts`,
 * WP4). The pushes then run in schedule order: the kernel keeps its merge
 * order, and a duplicate is reported for the same job as before.
 */
import { consoleLogger } from "../logger.js";
import { requireCore } from "../internal/core.js";
import { mergeViewFromColumns, surfaceAnalysisFromMergeView, } from "../results/surface-analysis.js";
import { checkAreaState, revivePolledOut } from "./poll.js";
import { parallel, throwable, workerCount } from "./merge-common.js";
import { decodeSurfaceJob, synthesisView } from "./merge-surface-decode.js";
import { synthesizeSurfaceTriangles, withCellTrisFallback, } from "./facade-synthesis.js";
/** Poll once, then strictly download and union all surface jobs. */
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
    if (schedule.jobs.size === 0) {
        return { surfaces: {}, aggregates: {}, minLegend: 0, maxLegend: 0, sensorCount: 0 };
    }
    const incomplete = [...schedule.jobs.values()].filter((job) => job.status !== "completed" || !job.jobId);
    if (incomplete.length > 0) {
        throw new Error(`Cannot merge surface results: jobs not succeeded: ${JSON.stringify(incomplete.map((job) => job.jobId ?? job.tileId))}`);
    }
    const scheduled = [...schedule.jobs.entries()];
    const decoded = Array(scheduled.length);
    const errors = Array(scheduled.length);
    try {
        await parallel(scheduled.map((entry, index) => ({ entry, index })), workerCount(options.maxWorkers), async ({ entry: [entryId, job], index }) => {
            try {
                const result = await jobsService.downloadResults(job.jobId, {
                    ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }),
                    ...(options.signal === undefined ? {} : { signal: options.signal }),
                });
                const value = decodeSurfaceJob(result.content);
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
        return unionDecoded(jobsService, schedule, scheduled, decoded, options);
    }
    finally {
        // A decode that no push consumed (a failed download elsewhere, an abort,
        // a failed push) is freed here; its WebAssembly memory would otherwise
        // wait for a finalizer.
        for (const value of decoded)
            value?.archive.free();
    }
}
/** Push every decoded job in schedule order, then build the public result. */
function unionDecoded(jobsService, schedule, scheduled, decoded, options) {
    const positions = new Map(schedule.tilePositions.map((position) => [position.tileId, position]));
    const core = requireCore();
    const merger = new core.SurfaceAreaMerger();
    const synthesized = new Map();
    // The kernel gets each surface's values and origin from the decode; the
    // other fields stay here, as host values, for the public result.
    const hostFields = new Map();
    const store = jobsService.facadeSynthesis;
    const fallbacks = new Set();
    let consumed = false;
    try {
        const anchors = scheduled.map(([entryId]) => {
            const position = positions.get(entryId);
            if (position === undefined)
                throw new Error(`surface entry ${entryId} has no tile position`);
            const [swX, swY] = core.tileSwOffset(position.row, position.col, schedule.analysisType);
            return [swX, swY];
        });
        // The triangles are synthesized from the geometry this client submitted
        // and attached to the FINISHED view, never pushed through the merger:
        // the merge would copy the coordinates into wasm32 memory, which is
        // 1.8 GB of mesh for the F3 scene against a 4 GB ceiling. One kernel call
        // answers every job (`facade-synthesis.ts`).
        if (store !== undefined) {
            const jobs = scheduled.flatMap(([, job], index) => job.jobId === undefined ? [] : [{
                    jobId: job.jobId, response: synthesisView(decoded[index]), anchor: anchors[index],
                }]);
            const views = synthesizeSurfaceTriangles(store, jobs, options.logger ?? consoleLogger, fallbacks);
            for (const [key, view] of views)
                synthesized.set(key, view);
        }
        scheduled.forEach(([entryId], index) => {
            const value = decoded[index];
            value.keys.forEach((key, at) => hostFields.set(key, value.fields[at]));
            const [swX, swY] = anchors[index];
            // `pushArchive` consumes the handle. `JSON.stringify` of the parsed
            // root is the text this merge read before, so the aggregates and the
            // legends do not change by one bit.
            decoded[index] = undefined;
            merger.pushArchive(entryId, JSON.stringify(value.root), value.archive, swX, swY);
        });
        consumed = true; // `finish` consumes the merger, also when it throws.
        // No binding keeps the columns: each entry owns a copy of its part, and
        // the whole-area buffers can go before the public result is built.
        const view = mergeViewFromColumns(merger.finish());
        if (synthesized.size === 0)
            return withCellTrisFallback(surfaceAnalysisFromMergeView(view, hostFields), fallbacks);
        return withCellTrisFallback(surfaceAnalysisFromMergeView({
            metadataJson: view.metadataJson,
            entries: view.entries.map((entry) => {
                const views = synthesized.get(entry.key);
                return views === undefined ? entry : { ...entry, ...views };
            }),
        }, hostFields), fallbacks);
    }
    finally {
        if (!consumed)
            merger.free();
        // Every job here is terminal and downloaded — the guards above returned
        // otherwise — so this schedule is done whether the merge finished or
        // threw partway. The synthesis consumes each capture as it reaches it;
        // this releases the tail it never reached, which would otherwise be held
        // for the life of the client.
        if (store !== undefined) {
            for (const entry of schedule.jobs.values()) {
                if (entry.jobId !== undefined)
                    store.forget(entry.jobId);
            }
        }
    }
}
