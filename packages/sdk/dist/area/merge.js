import { consoleLogger } from "../logger.js";
import { collectOnEngine } from "./engine-jobs.js";
import { checkGridSchedule, GridMerge } from "./grid-merge.js";
import { mergeSurfaceAreaJobs } from "./merge-surface.js";
export { mergeSurfaceAreaJobs };
/**
 * Poll a grid schedule once, download the results of its completed tiles and merge them into
 * one grid.
 *
 * Calling it again after a failure asks every unfinished job again.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea`.
 * @param options - Blend strategy, concurrency, cancellation and logging.
 * @returns The merged grid with its shape, legend range and any failed or skipped tiles.
 * @throws {Error} when the schedule is a facade or surface schedule, contains an uncertain
 * or invalid geometry reference, or `options` ask for a directional strategy on a
 * non-wind analysis or without `windDirectionDeg`.
 * @throws {Error} when any tile failed, was skipped or could not be downloaded.
 * @category Run an analysis
 */
export async function mergeAreaJobs(jobsService, schedule, options = {}, 
/** @internal `runAreaAndWait` with `retryFrom`: wait up to this many seconds for every job. */
waitS) {
    const started = performance.now();
    checkGridSchedule(schedule);
    const grid = new GridMerge(schedule, options);
    try {
        // The engine asks every job once and downloads the ready ones (goal
        // `available`); calling this function again is its recovery. Each archive
        // is merged as it arrives.
        const { facts } = await collectOnEngine(jobsService, schedule.jobs, { grid }, {
            ...(waitS === undefined ? { goal: "available" } : { goal: "results", timeoutS: waitS }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.known === undefined ? {} : { known: options.known }),
        });
        for (const key of facts.lost)
            grid.lose(schedule.jobs.get(key), new Error("result download failed"));
        const logger = options.logger ?? consoleLogger;
        return grid.finish(schedule, logger, started);
    }
    finally {
        grid.free();
    }
}
/**
 * @internal `runAreaAndWait` with `retryFrom` (as in 1.0.0): wait up to `areaTimeout` (default
 * 3600 s) for every job of the schedule `runArea` returned, then merge it.
 */
export function waitAndMerge(jobsService, schedule, options) {
    const waitS = options.areaTimeout ?? 3_600;
    return schedule.surfaceFields === true ? mergeSurfaceAreaJobs(jobsService, schedule, options, waitS)
        : mergeAreaJobs(jobsService, schedule, options, waitS);
}
