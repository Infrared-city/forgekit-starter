import type { Logger } from "../logger.js";
import { type GridTilesHandle } from "./area-grid.js";
import { type AreaJob, type AreaResult, type AreaSchedule } from "./schedule-types.js";
/** What the merger needs before the first tile: the plan or the schedule. */
export type GridFrame = Pick<AreaSchedule, "analysisType" | "gridShape" | "polygon">;
export interface GridMergeOptions {
    readonly strategy?: "default" | "directional" | "directional_blend";
    readonly windDirectionDeg?: number;
    readonly block?: number;
}
/** Refuse a schedule that a grid merge cannot trust. */
export declare function checkGridSchedule(schedule: AreaSchedule): void;
/** The jobs of `schedule` that finished with a result; `other` sees each other job. */
export declare function completedJobs(schedule: Pick<AreaSchedule, "jobs">, other?: (job: AreaJob) => void): AreaJob[];
export declare class GridMerge {
    private readonly frame;
    private readonly options;
    private merger;
    /** Downloaded tiles that give no grid values, by tile id. */
    private readonly lost;
    /** A run error (numeric and categorical tiles mixed): kept, and thrown by `finish`. */
    private runError;
    /** Freed: a late download (after a timeout) is dropped, never a new canvas. */
    private freed;
    constructor(frame: GridFrame, options?: GridMergeOptions);
    /** Merge one tile archive; the archive is not kept. Resolves with why the tile is not usable. */
    push(job: AreaJob, archive: Uint8Array): Promise<string | undefined>;
    /** Place the tiles `at` of `tiles` (one batch of `decodeInTurn`); a reason per item into `out`. */
    place(tiles: GridTilesHandle, at: readonly number[], items: readonly Pending[], out: (string | undefined)[]): void;
    /** A tile whose download failed; a reason `push` already gave stays. */
    lose(job: AreaJob, error: unknown): void;
    /**
     * The merged grid of `schedule`, after each completed tile was pushed or lost.
     * The caller ran `checkGridSchedule(schedule)` first.
     * @throws {Error} when any tile failed, was skipped or could not be downloaded.
     */
    finish(schedule: AreaSchedule, logger: Logger, started: number): AreaResult;
    free(): void;
}
interface Pending {
    readonly grid: GridMerge;
    readonly job: AreaJob;
    readonly archive: Uint8Array;
}
export {};
