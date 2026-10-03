/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * Each download is decoded by the kernel as it arrives
 * (`merge-surface-decode.ts`), so the decode overlaps the network. Then ONE
 * kernel call joins the run (`joinSurfaceJobs`, D197): the triangle checks
 * and the synthesis from the captures this client kept, the union in
 * schedule order, and the columns this function returns (D198). This host
 * builds no object per surface and no array per cell.
 */
import { type SurfaceColumns } from "../results/surface-columns.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { AreaMergeJobsService, AreaMergeOptions } from "./merge.js";
/** Poll once, then strictly download and join all surface jobs. */
export declare function mergeSurfaceAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceColumns>;
