import { JobStatus } from "../jobs.js";
import { computeAreaState } from "./schedule.js";
const failures = new WeakMap();
const FAILURE_LIMIT = 5;
/**
 * The breaker also needs the failures to span this long (D176). With the 1 s
 * fast start, five failed sweeps fit in 3.2 s, so a short 429 burst could
 * retire a paid job that later succeeds. Five sweeps at the steady 2 s took
 * 6.4 s; this keeps at least that much, and more.
 */
const FAILURE_MIN_SPAN_MS = 10_000;
function workerCount(value) {
    const count = value ?? 5;
    if (!Number.isSafeInteger(count) || count < 1)
        throw new TypeError("maxWorkers must be a positive integer");
    return count;
}
function applySnapshot(job, snapshot) {
    job.lastJobSnapshot = snapshot;
    if (snapshot.status === JobStatus.Succeeded)
        job.status = "completed";
    else if (snapshot.status === JobStatus.Failed) {
        job.status = "failed";
        job.error = snapshot.error ?? "job failed";
    }
    else if (snapshot.status === JobStatus.Running)
        job.status = "running";
    else
        job.status = "pending";
}
async function pollOne(service, job, signal) {
    if (job.invalidReference === true || !job.jobId || job.status === "completed" ||
        job.status === "failed" || job.status === "skipped")
        return;
    if (signal?.aborted)
        throw signal.reason ?? new DOMException("aborted", "AbortError");
    try {
        const snapshot = await service.getStatus(job.jobId, signal === undefined ? {} : { signal });
        failures.delete(job);
        applySnapshot(job, snapshot);
    }
    catch (error) {
        if (signal?.aborted)
            throw signal.reason ?? new DOMException("aborted", "AbortError");
        const now = performance.now();
        const previous = failures.get(job);
        const count = (previous?.count ?? 0) + 1;
        const sinceMs = previous?.sinceMs ?? now;
        failures.set(job, { count, sinceMs });
        if (count >= FAILURE_LIMIT && now - sinceMs >= FAILURE_MIN_SPAN_MS) {
            job.status = "skipped";
            job.error = error instanceof Error ? error.message : String(error);
        }
    }
}
/**
 * Give the poll circuit breaker's victims one more chance.
 *
 * `pollOne` retires a job to `"skipped"` after FAILURE_LIMIT consecutive
 * `getStatus` failures, and `checkAreaState` then never polls it again for the
 * life of the schedule. That is right INSIDE one run: a tile the gateway keeps
 * refusing must not hold the poll loop open forever.
 *
 * It is wrong when the caller comes back and explicitly asks for their results
 * again. The job exists, it is billed, and it very often SUCCEEDED while we
 * were being throttled — a live smoke test found 23 of 23 retired tiles had
 * already succeeded server-side, fetchable by `jobId` in under 50 ms
 * (`sdk-bench/reports/SMOKE-TS-A-2026-09-20`). Leaving them retired made
 * D110's "call mergeAreaJobs again" a promise the SDK could not keep.
 *
 * Only the breaker's victims are revived: a `"skipped"` job WITH a `jobId`.
 * A tile skipped by an aborted submission has no `jobId` and stays as it is.
 */
export function revivePolledOut(schedule) {
    let revived = 0;
    for (const job of schedule.jobs.values()) {
        if (job.status !== "skipped" || !job.jobId)
            continue;
        job.status = "pending";
        failures.delete(job);
        revived += 1;
    }
    return revived;
}
/**
 * One batched request per 50 jobs, in place of one per job.
 *
 * Returns the jobs this sweep did NOT settle, which the per-job path then
 * asks about individually. That list is everything when the gateway does not
 * have the batched route (production today), so the fallback is the ordinary
 * path, not an error path — the sweep below is then exactly the sweep this
 * SDK has always done. `internal/status-batch.ts` has the detection rules.
 */
async function pollBatched(service, pending, options) {
    const getStatusBatch = service.getStatusBatch;
    if (getStatusBatch === undefined)
        return pending;
    const byId = new Map();
    for (const job of pending)
        if (job.jobId)
            byId.set(job.jobId, job);
    if (byId.size === 0)
        return pending;
    let sweep;
    try {
        sweep = await getStatusBatch.call(service, [...byId.keys()], {
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        });
    }
    catch (error) {
        if (options.signal?.aborted === true)
            throw error;
        // A batched sweep that failed for any other reason costs nothing: every
        // job is asked about per job, exactly as before.
        return pending;
    }
    for (const [id, job] of byId) {
        const snapshot = sweep.statuses.get(id);
        if (snapshot === undefined)
            continue;
        failures.delete(job);
        applySnapshot(job, snapshot);
    }
    return sweep.unanswered.map((id) => byId.get(id)).filter((job) => job !== undefined);
}
/** Per-job status requests the last check of each schedule sent after its
 *  batched sweep. The poll interval reads it (D176): such a sweep is not a
 *  one-request sweep, so it gets no fast start. */
const perJobRequests = new WeakMap();
export function lastPerJobRequests(schedule) {
    return perJobRequests.get(schedule) ?? 0;
}
export async function checkAreaState(service, schedule, options = {}) {
    const pending = [...schedule.jobs.values()].filter((job) => Boolean(job.jobId) && job.status !== "completed" && job.status !== "failed" && job.status !== "skipped");
    // Synchronously short-circuited, not awaited, when there is no batched
    // route to try: a service written against an earlier SDK — and every test
    // that hand-rolls one — must see the exact sweep it always saw, down to
    // when the first request is dispatched relative to an abort.
    const remaining = service.getStatusBatch === undefined || pending.length === 0
        ? pending
        : await pollBatched(service, pending, options);
    perJobRequests.set(schedule, remaining.length);
    const count = Math.min(workerCount(options.maxWorkers), Math.max(1, remaining.length));
    let cursor = 0;
    await Promise.all(Array.from({ length: count }, async () => {
        while (cursor < remaining.length) {
            const job = remaining[cursor++];
            if (job)
                await pollOne(service, job, options.signal);
        }
    }));
    const state = computeAreaState(schedule);
    try {
        options.onProgress?.(state);
    }
    catch {
        // Poll observers do not control the durable job state.
    }
    return state;
}
