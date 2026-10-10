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
/**
 * Polls a surface schedule once, downloads the results of all its jobs and joins them into
 * one set of surface columns.
 *
 * Every job must have completed: any failed or missing submission, or any job still pending or
 * running, makes the merge fail instead of returning a partial result. Calling it again after
 * a failure gives tiles that were retired by repeated status errors one more chance. A schedule
 * with no jobs gives empty columns.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea` for a surface analysis.
 * @param options - `maxWorkers` (concurrent downloads), `signal` (cancellation) and `logger`.
 * @returns The merged surface columns.
 * @throws {Error} when the schedule is not a surface schedule, contains an uncertain or invalid
 *   geometry reference, has failed or uncertain submissions, has jobs that did not succeed, or a
 *   download or decode failed (the cause is attached).
 * @throws when `options.signal` is aborted: the abort reason.
 * @category Run an analysis
 */
export declare function mergeSurfaceAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceColumns>;
