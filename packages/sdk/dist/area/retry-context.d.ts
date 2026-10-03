import type { AreaStatusService } from "./run-options.js";
import type { AreaSchedule } from "./schedule-types.js";
export interface AreaRetryContext {
    /** The run id to keep on the new schedule (kept, or freshly made here). */
    readonly runId: string;
    /** The attempt of every key the plan named, after this round; stamp it
     * over the old map on the new schedule. */
    readonly attempts: Readonly<Record<string, number>>;
    /** Keys this round resubmits: what `buildEntries` rebuilds. */
    readonly resubmitKeys: ReadonlySet<string>;
    readonly idempotencyKeys: ReadonlyMap<string, string>;
    /** Uncertain keys the plan holds: not sent, stay uncertain (only a
     * schedule with no run id -- an older SDK -- ever lands here now, since a
     * keyed schedule always resends its uncertain keys). */
    readonly carryUncertain: readonly string[];
}
export declare function buildRetryContext(service: AreaStatusService, retryFrom: AreaSchedule, options?: {
    readonly signal?: AbortSignal;
    readonly maxWorkers?: number;
}): Promise<AreaRetryContext>;
