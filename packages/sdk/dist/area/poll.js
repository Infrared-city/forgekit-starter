import { collectOnEngine } from "./engine-jobs.js";
import { computeAreaState } from "./schedule.js";
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
// Maintainer note (not published): the kernel run engine, goal `status`. Reads only `jobs`, so an area schedule and a
// daylight-factor parts schedule (D221) poll the same way.
// Maintainer note (not published): the kernel run engine, goal `status`. Reads only `jobs`, so an area schedule and a
// daylight-factor parts schedule (D221) poll the same way.
export async function checkAreaState(service, schedule, options = {}) {
    await collectOnEngine(service, schedule.jobs, {}, {
        goal: "status",
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    // A failed job is never merged (a retry makes a new job), so its capture is dead weight.
    for (const job of schedule.jobs.values()) {
        if (job.status === "failed" && job.jobId)
            service.captures?.forget(job.jobId);
    }
    const state = computeAreaState(schedule);
    try {
        options.onProgress?.(state);
    }
    catch {
        // Poll observers do not control the durable job state.
    }
    return state;
}
