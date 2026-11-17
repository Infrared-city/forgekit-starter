/**
 * The strict surface union of an area run. Split out of `merge.ts` for the
 * 400-line cap.
 *
 * The downloads of each engine turn are decoded in ONE kernel call (`decodeSurfaceJobsStart`, on the
 * rayon pool in the threaded core, while this thread goes on: `pool-task.ts`) and go into the kernel's `SurfaceJoinStream`
 * (D-2026101011-slate-aspen-pine, D-2026101110-iris-nectar-maple): the kernel builds their layouts
 * from the captures this client kept, in one call per turn and analysis, so that work overlaps the
 * network, and keeps the archives. Then ONE kernel call joins the run (D197): the triangle checks,
 * the union in the canonical order of the entry ids, and the columns this module returns (D198). This host builds
 * no object per surface and no array per cell.
 */
import { type Logger } from "../logger.js";
import { type WasmCore } from "../internal/core.js";
import { type SurfaceColumns } from "../results/surface-columns.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { AreaMergeJobsService, AreaMergeOptions } from "./merge.js";
/**
 * Polls a surface schedule once, downloads the results of all its jobs and joins them into
 * one set of surface columns.
 *
 * Every job must have completed: any failed or missing submission, or any job still pending or
 * running, makes the merge fail instead of returning a partial result. Calling it again after
 * a failure asks every unfinished job again. A schedule
 * with no jobs gives empty columns.
 *
 * @param jobsService - Reads job status and downloads results, for example `client.jobs`.
 * @param schedule - The schedule returned by `runArea` for a surface analysis.
 * @param options - `signal` (cancellation) and `logger`; `maxWorkers` is deprecated (no effect).
 * @returns The merged surface columns.
 * @throws {Error} when the schedule is not a surface schedule, contains an uncertain or invalid
 *   geometry reference, has failed or uncertain submissions, has jobs that did not succeed, or a
 *   download or decode failed (the cause is attached).
 * @throws when `options.signal` is aborted: the abort reason.
 * @category Run an analysis
 */
export declare function mergeSurfaceAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger" | "known">, 
/** @internal `runAreaAndWait` with `retryFrom`: wait up to this many seconds for every job. */
waitS?: number): Promise<SurfaceColumns>;
/** Where a schedule key's tile is: its row and column. */
export type TileOf = (key: string) => {
    readonly row: number;
    readonly col: number;
} | undefined;
/**
 * The kernel join of one surface analysis, fed as jobs land (D-2026101011-slate-aspen-pine):
 * `push` hands the archive to the decode of this turn; the kernel checks the job, builds its
 * layout from the capture this client kept and keeps the archive (a decoded job is a few times
 * its archive). `finish` decodes them again on the pool and joins them, reading the cached layouts.
 */
/** Decoded surface archives in the kernel (`decodeSurfaceJobsStart` / `End`). */
type SurfaceJobsHandle = ReturnType<WasmCore["decodeSurfaceJobsEnd"]>;
export declare class SurfaceFeed {
    private readonly analysisType;
    private readonly tileOf;
    private stream;
    private readonly asked;
    private readonly captures;
    private readonly own;
    private freed;
    constructor(service: Pick<AreaMergeJobsService, "captures">, analysisType: string, tileOf: TileOf);
    /** Decode job `jobId` of key `key` with the other downloads of this turn. Resolves with why it is not usable, or `undefined`. */
    push(jobId: string, key: string, archive: Uint8Array): Promise<string | undefined>;
    /**
     * Keep the jobs `at` of `jobs` (one batch of `decodeSurfaceInTurn`); a reason per item into
     * `out`. Their layouts are built on the pool while this thread goes on.
     */
    place(jobs: SurfaceJobsHandle, at: readonly number[], items: readonly PendingSurface[], out: (string | undefined)[]): Promise<void>;
    /** Join every pushed job of `schedule` into its columns, on the pool while this thread goes on. */
    finish(schedule: AreaSchedule, logger: Logger): Promise<SurfaceColumns>;
    /** Free the kept jobs (a feed that is not finished). */
    free(): void;
}
interface PendingSurface {
    readonly feed: SurfaceFeed;
    readonly jobId: string;
    readonly key: string;
    readonly archive: Uint8Array;
}
export {};
