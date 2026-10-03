import type { AreaStatusService, CheckAreaStateOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/** What one check met that the poll engine reads (D213). */
export interface SweepRecord {
    /** Per-job status requests sent after the batched sweep. */
    perJob: number;
    /** Transient failures (HTTP 429, 5xx, network). */
    failures: number;
    /** The longest `Retry-After` among them, seconds. */
    retryAfterS: number | undefined;
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
export declare function revivePolledOut(schedule: Pick<AreaSchedule, "jobs">): number;
export declare function lastSweepRecord(schedule: Pick<AreaSchedule, "jobs">): SweepRecord;
/** Poll every open job of a schedule once. Reads only `jobs`: an area
 * schedule and a daylight-factor parts schedule (D221) poll the same way. */
export declare function checkAreaState(service: AreaStatusService, schedule: Pick<AreaSchedule, "jobs">, options?: CheckAreaStateOptions): Promise<AreaState>;
