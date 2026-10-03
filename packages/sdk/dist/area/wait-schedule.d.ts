/**
 * Wait until every job of a schedule is terminal, on the SDK's one poll
 * engine (D213). Moved out of `client.ts`: `runAreaAndWait` and the
 * daylight-factor parts (`parts/`, D221) wait the same way.
 */
import type { AreaStatusService, CheckAreaStateOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
export declare function abortableSleep(milliseconds: number, signal?: AbortSignal): Promise<void>;
export interface WaitScheduleOptions {
    readonly timeoutS: number;
    /** One sweep; default `checkAreaState(service, schedule, ...)`. */
    readonly check?: (options: CheckAreaStateOptions) => Promise<AreaState>;
    readonly maxWorkers?: number;
    readonly signal?: AbortSignal;
    readonly onProgress?: (state: AreaState) => void;
    /** The error for a wait that ran out of time, from the last state. */
    readonly onTimeout: (last: AreaState) => Error;
}
export declare function waitForSchedule(service: AreaStatusService, schedule: Pick<AreaSchedule, "jobs">, options: WaitScheduleOptions): Promise<AreaState>;
