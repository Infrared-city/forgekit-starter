import type { JobsService } from "../jobs.js";
import { type Logger } from "../logger.js";
import { type AreaResult, type AreaSchedule } from "./schedule-types.js";
import type { FacadeCaptures } from "./facade-captures.js";
export { mergeSurfaceAreaJobs } from "./merge-surface.js";
/**
 * The jobs service `mergeAreaJobs` needs: it reads job status and downloads job results.
 * `InfraredClient.jobs` satisfies it.
 *
 * @category Run an analysis
 */
export type AreaMergeJobsService = Pick<JobsService, "getStatus" | "downloadResults"> & {
    /**
     * The client's own facade capture and layout cache. Optional: when absent, no job inputs were
     * captured and no cell triangles are synthesized.
     */
    readonly captures?: FacadeCaptures;
};
/**
 * Options for `mergeAreaJobs`.
 *
 * @category Run an analysis
 */
export interface AreaMergeOptions {
    /**
     * How overlapping tiles are blended. Default `"default"`. `"directional"` and
     * `"directional_blend"` apply to wind-speed analyses only and require `windDirectionDeg`.
     */
    readonly strategy?: "default" | "directional" | "directional_blend";
    /** Wind direction in degrees. Required for the directional strategies. */
    readonly windDirectionDeg?: number;
    /**
     * Largest block, in cells per side, that the directional strategies process at once; at least 1.
     * It trades speed against memory only: the result is the same for any value. Default 928.
     */
    readonly block?: number;
    /** Maximum parallel requests, a positive whole number. Default 5 for status checks and 8 for
     * downloads. */
    readonly maxWorkers?: number;
    /** Aborts the merge when signalled. */
    readonly signal?: AbortSignal;
    /** Logger that a tile dropped from the merge is warned through. `InfraredClient` passes its own. */
    readonly logger?: Logger;
}
/**
 * Poll a grid schedule once, download the results of its completed tiles and merge them into
 * one grid.
 *
 * Calling it again after a failure gives tiles that were retired by repeated status errors one
 * more chance, since their jobs usually finished.
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
export declare function mergeAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: AreaMergeOptions): Promise<AreaResult>;
