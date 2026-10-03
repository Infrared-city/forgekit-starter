import type { AreaStatusService, CheckAreaStateOptions, RunAreaInput, RunAreaOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
import type { Polygon } from "./types.js";
export interface RunAreaAndWaitRoundsOptions extends RunAreaOptions {
    readonly areaTimeout: number;
    readonly retries?: number;
    readonly onTimeout: (last: AreaState) => Error;
}
/**
 * Run, wait, and (D224) retry: wait for `schedule0` to complete, then ask
 * for up to `retries` more rounds (default 1) when the kernel plan finds
 * something left to fix. Returns the final, complete schedule.
 *
 * Each round asks for the kernel plan (`buildRetryContext`) and stops when it
 * resubmits nothing (never `failedSubmissions.length`). `runArea` builds its
 * own plan from `retryFrom`; the extra pure kernel call is cheap.
 *
 * `checkAreaState` is the CALLER's method (`client.ts`'s `this.checkAreaState`),
 * not the free function, so an override or a spy on it still reaches this wait.
 */
export declare function runAreaAndWaitRounds(jobs: AreaStatusService, runArea: (input: RunAreaInput, polygon: Polygon, options: RunAreaOptions) => Promise<AreaSchedule>, checkAreaState: (schedule: AreaSchedule, options: CheckAreaStateOptions) => Promise<AreaState>, input: RunAreaInput, polygon: Polygon, options: RunAreaAndWaitRoundsOptions, schedule0: AreaSchedule): Promise<AreaSchedule>;
