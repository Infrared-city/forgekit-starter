/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * Each download is decoded by the kernel right away (`merge-surface-decode.ts`,
 * WP4). The pushes then run in schedule order: the kernel keeps its merge
 * order, and a duplicate is reported for the same job as before.
 */
import { type SurfaceAnalysisResponse } from "../results/surface-analysis.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { AreaMergeJobsService, AreaMergeOptions } from "./merge.js";
/** Poll once, then strictly download and union all surface jobs. */
export declare function mergeSurfaceAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceAnalysisResponse>;
