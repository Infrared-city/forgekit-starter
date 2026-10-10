import type { AreaJobsService, RunAreaOptions } from "./run-options.js";
import type { Polygon } from "./types.js";
/**
 * The jobs, estimated time and estimated cost of an area run, from `previewAreaBatches`.
 *
 * @category Run an analysis
 */
export interface AreaBatchPreview {
    /** Non-empty tiles on the grid. Equal to `plannedJobCount` on a grid run. */
    readonly tileCount: number;
    /** The number of jobs the run would submit. Price from this, not `tileCount`, on a facade run. */
    readonly plannedJobCount: number;
    /** Estimated run time in seconds. */
    readonly estimatedTimeS: number;
    /** Estimated cost in tokens. */
    readonly estimatedCostTokens: number;
    /** Total sensors across the planned facade batches, or `undefined` for a grid preview. */
    readonly sensorCount?: number;
}
/**
 * Preview the jobs a `runArea(service, input, polygon, options)` call would submit, without
 * submitting anything.
 *
 * It reports the real number of jobs, which on a facade (`analysisSurfaces`) request can exceed
 * the tile count because a tile may split into several billed batches. On a grid request it
 * gives one job per tile, like `previewArea`. Most callers want
 * `client.previewAreaBatches(input, polygon, options)`, which passes `client.jobs` as `service`.
 *
 * @param service - The jobs service the plan is prepared against, for example `client.jobs`.
 * @param input - The analysis request fields.
 * @param polygon - The area to analyse.
 * @param options - The same run options `runArea` takes.
 * @returns The tile count, planned job count, estimated time and cost, and the sensor count for
 * a facade request.
 * @category Run an analysis
 */
export declare function previewAreaBatches(service: AreaJobsService, input: RunAreaInputLike, polygon: Polygon, options?: RunAreaOptions): Promise<AreaBatchPreview>;
/**
 * The analysis request fields `previewAreaBatches` accepts: an object keyed by request field
 * name.
 *
 * @category Run an analysis
 */
export type RunAreaInputLike = Readonly<Record<string, unknown>>;
