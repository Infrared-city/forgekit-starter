/** The last known outcome of one key's submit. */
export type SubmitOutcome = "accepted" | "failed" | "uncertain";
/** A TERMINAL job status the host knows; absent when the job is still open
 * or its status is unknown. */
export type TerminalJobStatus = "completed" | "failed";
/**
 * What the host knows about ONE schedule key. `retry-context.ts` gives the
 * kernel one of these per `schedule.jobs` value, plus one per failed and one
 * per uncertain key -- RAW, with no host filtering. The kernel merges
 * several entries for the same key itself (uncertain > failed > accepted,
 * the highest attempt, the first job status given).
 */
export interface KeyState {
    readonly key: string;
    readonly submit: SubmitOutcome;
    readonly jobStatus?: TerminalJobStatus | undefined;
    /** The attempt of the CURRENT job or submit of this key. Absent means
     * attempt 1. */
    readonly attempt?: number | undefined;
}
/** Why one key is in the plan's `resubmit` list. */
export type RetryReason = "failedSubmit" | "computeFailed" | "uncertain";
/** One submit the host sends, with its `Idempotency-Key` header value. */
export interface RetryEntry {
    readonly key: string;
    readonly attempt: number;
    readonly idempotencyKey: string;
    readonly reason: RetryReason;
}
/** The kernel's answer: what to send, what to name and not send, and what
 * to store on the new schedule. */
export interface RetryPlan {
    readonly runId: string;
    readonly resubmit: readonly RetryEntry[];
    readonly exhausted: readonly string[];
    readonly heldUncertain: readonly string[];
    /** The WHOLE attempt map after this plan. Store it on the new schedule as
     * it is; never merge it with the old map. */
    readonly attempts: Readonly<Record<string, number>>;
}
/**
 * What the host knows about the schedule it retries: every key's state, RAW
 * -- `retry-context.ts` builds this from the schedule with no filtering, and
 * the kernel merges several entries for one key itself.
 *
 * No `serverIdempotency` field: the server dedups by `Idempotency-Key`
 * unconditionally (lambda-models #462 ships before this SDK), so the kernel
 * takes no capability gate and rejects the field by name
 * (`deny_unknown_fields`). An uncertain key is resent with the same key
 * whenever the schedule has a run id; only a schedule with none (an older
 * SDK, whose first submit carried no key) holds its uncertain keys.
 */
export interface RetryPlanInput {
    readonly runId?: string;
    readonly freshRunId?: string;
    readonly keys: readonly KeyState[];
}
/** The retry plan of one area schedule (D224). Throws on a bad input (for
 * example a schedule with no run id and no fresh one given). */
export declare function planAreaRetry(input: RetryPlanInput): RetryPlan;
/** The `Idempotency-Key` header value of one tile submit (D224). */
export declare function areaIdempotencyKey(runId: string, jobKey: string, attempt: number): string;
/**
 * A fresh run id for a schedule written before this field existed: 32 lower
 * -case hex characters from the platform's random source. The kernel does
 * not read any structure into the run id, so this shape is a host choice,
 * not a shared contract.
 */
export declare function freshRunId(): string;
