import type { AreaStatusService, CheckAreaStateOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/**
 * Poll every open job of a schedule once and return the resulting progress.
 *
 * Each open job is asked once: in batches of up to 50 jobs where the service supports it, and
 * per job otherwise. Each job record is updated in place. A job whose status request failed
 * keeps its last status; the next check asks it again.
 *
 * @param service - Reads job status, for example `client.jobs`.
 * @param schedule - The schedule to poll. Only its `jobs` are read.
 * @param options - Concurrency, cancellation and a progress callback.
 * @returns The counts of completed, failed, skipped, pending and running jobs.
 * @throws {Error} when `options.signal` is aborted; the abort reason is thrown.
 * @category Run an analysis
 */
export declare function checkAreaState(service: AreaStatusService, schedule: Pick<AreaSchedule, "jobs">, options?: CheckAreaStateOptions): Promise<AreaState>;
