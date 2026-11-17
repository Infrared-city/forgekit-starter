/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * The downloads of each engine turn are decoded in ONE kernel call (`decodeSurfaceJobsStart`, on the
 * rayon pool in the threaded core, while this thread goes on: `pool-task.ts`) and go into the kernel's `SurfaceJoinStream`
 * (D-2026101011-slate-aspen-pine, D-2026101110-iris-nectar-maple): the kernel builds their layouts
 * from the captures this client kept, in one call per turn and analysis, so that work overlaps the
 * network, and keeps the archives. Then ONE kernel call joins the run (D197): the triangle checks,
 * the union in the canonical order of the entry ids, and the columns this module returns (D198). This host builds
 * no object per surface and no array per cell.
 */
import { consoleLogger } from "../logger.js";
import { coreThreads, requireCore } from "../internal/core.js";
import { perTurn } from "../internal/per-turn.js";
import { poolCall } from "../internal/pool-task.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
import { FacadeCaptures } from "./facade-captures.js";
import { emptySurfaceColumns, surfaceColumnsFromJoin, } from "../results/surface-columns.js";
import { collectOnEngine } from "./engine-jobs.js";
/**
 * Polls a surface schedule once, downloads the results of all its jobs and joins them into
 * one set of surface columns.
 *
 * Every job must have completed: any failed or missing submission, or any job still pending or
 * running, makes the merge fail instead of returning a partial result. Calling it again after
 * a failure asks every unfinished job again. A schedule
 * with no jobs gives empty columns.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea` for a surface analysis.
 * @param options - `signal` (cancellation) and `logger`; `maxWorkers` is deprecated (no effect).
 * @returns The merged surface columns.
 * @throws {Error} when the schedule is not a surface schedule, contains an uncertain or invalid
 *   geometry reference, has failed or uncertain submissions, has jobs that did not succeed, or a
 *   download or decode failed (the cause is attached).
 * @throws when `options.signal` is aborted: the abort reason.
 * @category Run an analysis
 */
// Maintainer note (not published): the join is one kernel call for the whole run (D197).
export async function mergeSurfaceAreaJobs(jobsService, schedule, options = {}, 
/** @internal `runAreaAndWait` with `retryFrom`: wait up to this many seconds for every job. */
waitS) {
    if (schedule.surfaceFields !== true)
        throw new Error("Surface merge requires a surface schedule");
    if (schedule.geometryProbeUncertain === true) {
        throw new Error("Area run contains an uncertain geometry capability probe");
    }
    if ((schedule.invalidReferenceSubmissions?.length ?? 0) > 0 ||
        [...schedule.jobs.values()].some((job) => job.invalidReference === true)) {
        throw new Error("Area run contains an invalid geometry-reference acceptance");
    }
    if (schedule.failedSubmissions.length > 0) { // known before any request
        throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify([...schedule.failedSubmissions].sort())}`);
    }
    // The engine asks every job once and downloads the ready ones (goal `available`); each
    // download goes into the kernel join as it lands.
    const positions = new Map(schedule.tilePositions.map((position) => [position.tileId, position]));
    const surface = new SurfaceFeed(jobsService, schedule.analysisType, (key) => positions.get(key));
    try {
        return await collectAndJoin(jobsService, schedule, surface, options, waitS);
    }
    finally {
        surface.free();
    }
}
async function collectAndJoin(jobsService, schedule, surface, options, waitS) {
    const { facts } = await collectOnEngine(jobsService, schedule.jobs, { surface }, {
        ...(waitS === undefined ? { goal: "available" } : { goal: "results", timeoutS: waitS }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.known === undefined ? {} : { known: options.known }),
    });
    const recovered = (tileId) => {
        const job = schedule.jobs.get(tileId);
        return job?.status === "completed" && Boolean(job.jobId);
    };
    const missing = (schedule.uncertainSubmissions ?? []).filter((tileId) => !recovered(tileId));
    if (missing.length > 0) {
        throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify(missing.sort())}`);
    }
    if (schedule.jobs.size === 0)
        return emptySurfaceColumns();
    const incomplete = [...schedule.jobs.values()].filter((job) => job.status !== "completed" || !job.jobId);
    if (incomplete.length > 0) {
        throw new Error(`Cannot merge surface results: jobs not succeeded: ${JSON.stringify(incomplete.map((job) => job.jobId ?? job.tileId))}`);
    }
    if (facts.lost.length > 0) {
        throw new Error(`Cannot merge surface results: download failed for ${[...facts.lost].sort()[0]}`);
    }
    return await surface.finish(schedule, options.logger ?? consoleLogger);
}
export class SurfaceFeed {
    analysisType;
    tileOf;
    stream;
    asked = new Map();
    captures;
    own;
    freed = false;
    constructor(service, analysisType, tileOf) {
        this.analysisType = analysisType;
        this.tileOf = tileOf;
        // A service without captures gets an empty store (every surface then has no outline).
        this.own = service.captures === undefined;
        this.captures = service.captures ?? new FacadeCaptures();
    }
    /** Decode job `jobId` of key `key` with the other downloads of this turn. Resolves with why it is not usable, or `undefined`. */
    push(jobId, key, archive) {
        if (this.asked.has(jobId))
            return Promise.resolve(undefined); // downloaded again: the first copy stands
        // Our schedule is wrong, not the archive: the run fails (a host error).
        if (this.tileOf(key) === undefined)
            throw new Error(`surface entry ${key} has no tile position`);
        return decodeSurfaceInTurn({ feed: this, jobId, key, archive });
    }
    /**
     * Keep the jobs `at` of `jobs` (one batch of `decodeSurfaceInTurn`); a reason per item into
     * `out`. Their layouts are built on the pool while this thread goes on.
     */
    async place(jobs, at, items, out) {
        if (this.freed)
            return; // a late download (the run is over) is never kept
        const core = requireCore("mergeSurfaceAreaJobs");
        const stream = this.stream ??= new core.SurfaceJoinStream();
        // The same job twice in one turn: the first copy stands.
        const fresh = at.filter((i, k) => !this.asked.has(items[i].jobId) &&
            at.findIndex((j) => items[j].jobId === items[i].jobId) === k);
        const anchors = new Float64Array(2 * fresh.length);
        for (const [k, i] of fresh.entries()) {
            const tile = this.tileOf(items[i].key);
            const [swX, swY] = core.tileSwOffset(tile.row, tile.col, this.analysisType);
            anchors[2 * k] = swX;
            anchors[2 * k + 1] = swY;
        }
        const jobIds = fresh.map((i) => items[i].jobId);
        // One flag per run: the plan asks for the triangles for every job or for none.
        const asked = this.captures.wantsCellTris(jobIds);
        // Taken now, so a second push of the same job while this one runs is not kept twice.
        for (const id of jobIds)
            this.asked.set(id, asked);
        const reasons = await poolCall(() => stream.pushManyStart(jobs, Uint32Array.from(fresh), fresh.map((i) => items[i].key), anchors, this.captures.store, jobIds, asked), (task) => (this.stream === stream ? stream.pushManyEnd(task) : []));
        for (const [k, i] of fresh.entries()) {
            const reason = reasons[k];
            if (reason !== undefined && reason !== null) {
                this.asked.delete(items[i].jobId);
                out[i] = String(reason);
            }
        }
    }
    /** Join every pushed job of `schedule` into its columns, on the pool while this thread goes on. */
    async finish(schedule, logger) {
        if (schedule.jobs.size === 0)
            return emptySurfaceColumns();
        const started = performance.now();
        // #835: a job accepted while its capture could not be kept. Name each one; the join still
        // runs, and those surfaces have no outline.
        for (const [entryId, job] of schedule.jobs) {
            if (job.jobId !== undefined && this.captures.lostCapture(job.jobId)) {
                logger.warn({ event: "facade_capture_missing", tileId: entryId, jobId: job.jobId,
                    reason: "the capture was not kept after the job was accepted; its surfaces have no " +
                        "outline, and surfaceRenderBuffers refuses them" });
            }
        }
        try {
            const stream = this.stream;
            const joined = await poolCall(() => stream.finishStart(this.captures.store, [...this.asked.values()].some(Boolean)), (task) => stream.finishEnd(task));
            this.captures.forgetSchedule(schedule); // the join released its jobs; this drops the flags
            report(joined, joined.jobIds, logger, started);
            return surfaceColumnsFromJoin(joined);
        }
        finally {
            this.free();
        }
    }
    /** Free the kept jobs (a feed that is not finished). */
    free() {
        this.freed = true;
        this.stream?.free();
        this.stream = undefined;
        // A failed join keeps its jobs for a retry of the merge; `runAreaAndWait` releases them.
        if (this.own)
            this.captures.free();
    }
}
/**
 * One `warn` per job whose requested triangles did not attach (an alert on
 * `warn` must see degraded output), one `info` per job that got them. A run
 * that never asked says nothing.
 */
function report(joined, jobIds, logger, started) {
    const elapsedMs = Math.round(performance.now() - started);
    // Job indices of the join are in its canonical order (#579); `jobIds`
    // is in argument (arrival) order.
    const host = (job) => joined.jobOrder[job];
    const fell = new Set();
    for (const { job, reason, detail } of joined.fallbacks) {
        fell.add(job);
        logger.warn({ event: "facade_synthesis", outcome: "fell_back", reason, jobId: jobIds[host(job)],
            elapsedMs, ...(detail === undefined ? {} : { detail }) });
    }
    const table = joined.triangles;
    if (table === undefined)
        return;
    for (let job = 0; job < jobIds.length; job += 1) {
        if (fell.has(job) || table.groupEngaged[job] !== 1)
            continue;
        logger.info({ event: "facade_synthesis", outcome: "engaged", jobId: jobIds[host(job)],
            surfaces: table.groupSurfaces[job + 1] - table.groupSurfaces[job], elapsedMs });
    }
}
/**
 * The surface archives of one turn (at most `16 x threads`): ONE kernel decode, then one
 * `pushMany` per feed; both on the pool while this thread goes on (`pool-task.ts`).
 */
const decodeSurfaceInTurn = perTurn(async (items) => {
    const limits = RESULT_DECODE_LIMITS;
    const core = requireCore("mergeSurfaceAreaJobs");
    const jobs = await poolCall(() => core.decodeSurfaceJobsStart(items.map((item) => item.archive), BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues)), (task) => core.decodeSurfaceJobsEnd(task));
    try {
        const byFeed = new Map();
        for (const [i, item] of items.entries()) {
            const at = byFeed.get(item.feed);
            if (at === undefined)
                byFeed.set(item.feed, [i]);
            else
                at.push(i);
        }
        const out = new Array(items.length).fill(undefined);
        await Promise.all([...byFeed].map(async ([feed, at]) => {
            try {
                await feed.place(jobs, at, items, out);
            }
            catch (error) { // one feed's failure is not the other analyses' failure
                for (const i of at)
                    out[i] = error instanceof Error ? error.message : String(error);
            }
        }));
        return out;
    }
    finally {
        jobs.free();
    }
}, () => 16 * coreThreads());
