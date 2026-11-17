import type { JobsService } from "../jobs.js";
import { type Logger } from "../logger.js";
import type { AreaResult, AreaSchedule, TileJobStatus } from "./schedule-types.js";
import type { FacadeCaptures } from "./facade-captures.js";
import { mergeSurfaceAreaJobs } from "./merge-surface.js";
import type { SurfaceColumns } from "../results/surface-columns.js";
export { mergeSurfaceAreaJobs };
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
    /** @deprecated No effect: the engine sets the widths. Removed in 2.0. */
    readonly maxWorkers?: number;
    /**
     * Job id to status, from your own earlier status checks. A job recorded as
     * `"completed"` or `"failed"` is not asked about again, so a poll loop that ends with a merge
     * sends no second round of status requests.
     */
    readonly known?: Readonly<Record<string, TileJobStatus>>;
    /** Aborts the merge when signalled. */
    readonly signal?: AbortSignal;
    /** Logger that a tile dropped from the merge is warned through. `InfraredClient` passes its own. */
    readonly logger?: Logger;
}
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
export declare function mergeAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: AreaMergeOptions, 
/** @internal `runAreaAndWait` with `retryFrom`: wait up to this many seconds for every job. */
waitS?: number): Promise<AreaResult>;
/**
 * @internal `runAreaAndWait` with `retryFrom` (as in 1.0.0): wait up to `areaTimeout` (default
 * 3600 s) for every job of the schedule `runArea` returned, then merge it.
 */
export declare function waitAndMerge(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options: AreaMergeOptions & {
    readonly areaTimeout?: number;
}): Promise<AreaResult | SurfaceColumns>;
