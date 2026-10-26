import type { AreaStatusService, CheckAreaStateOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/**
 * What one status check of a schedule encountered, which the wait loop reads to pace itself.
 *
 * @category Run an analysis
 */
export interface SweepRecord {
    /** Per-job status requests sent after the batched sweep. */
    perJob: number;
    /** Transient failures (HTTP 429, 5xx, network). */
    failures: number;
    /** The longest `Retry-After` among them, in seconds. */
    retryAfterS: number | undefined;
}
/**
 * Give the jobs that polling gave up on one more chance, and return how many were revived.
 *
 * Polling retires a job to `"skipped"` after repeated status failures, so a tile the gateway
 * keeps refusing cannot hold a run open forever. Such a job exists and is billed, and it has
 * often finished. This puts every skipped job that has a `jobId` back to `"pending"` so the
 * next check polls it again. A tile skipped by an aborted submission has no `jobId` and stays
 * as it is.
 *
 * @param schedule - The schedule whose jobs are revived.
 * @returns The number of jobs put back to pending.
 * @category Run an analysis
 */
export declare function revivePolledOut(schedule: Pick<AreaSchedule, "jobs">): number;
/**
 * What the most recent `checkAreaState` of a schedule encountered, or zeroes when it has not
 * been checked yet.
 *
 * @param schedule - The schedule that was checked.
 * @returns The per-job request count, transient failure count and longest `Retry-After`.
 * @category Run an analysis
 */
export declare function lastSweepRecord(schedule: Pick<AreaSchedule, "jobs">): SweepRecord;
/**
 * Poll every open job of a schedule once and return the resulting progress.
 *
 * Status is read in batches of up to 50 jobs where the service supports it, and per job
 * otherwise. Each job record is updated in place. A job whose status request keeps failing is
 * marked `"skipped"` after repeated failures; a rate limit or temporary server error is never
 * counted against a job.
 *
 * @param service - Reads job status, for example `client.jobs`.
 * @param schedule - The schedule to poll. Only its `jobs` are read.
 * @param options - Concurrency, cancellation and a progress callback.
 * @returns The counts of completed, failed, skipped, pending and running jobs.
 * @throws {TypeError} when `options.maxWorkers` is not a positive whole number.
 * @throws {Error} when `options.signal` is aborted; the abort reason is thrown.
 * @category Run an analysis
 */
export declare function checkAreaState(service: AreaStatusService, schedule: Pick<AreaSchedule, "jobs">, options?: CheckAreaStateOptions): Promise<AreaState>;
