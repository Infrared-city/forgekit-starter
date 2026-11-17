import type { TileFailureKind } from "./schedule-types.js";
import type { RawSendAnswer } from "../internal/idempotent-dispatch.js";
export type EngineGoal = "results" | "sent" | "available" | "status";
export interface EngineConfig {
    readonly retries: number;
    readonly area_timeout_us: number;
    readonly goal?: EngineGoal;
    /** The server's `batchSubmit` capability as it came; the kernel reads it (unset: one POST per key). */
    readonly batch_submit?: unknown;
}
export type EngineJobState = "running" | "succeeded" | "failed";
/** One analysis for the engine: its keys; `jobs` = keys that have a job already;
 * `states` = jobs known to be terminal (not asked again, D52). */
export interface EnginePlan {
    readonly keys: readonly string[];
    readonly run_id: string;
    readonly jobs?: Readonly<Record<string, string>>;
    readonly attempts?: Readonly<Record<string, number>>;
    readonly states?: Readonly<Record<string, EngineJobState>>;
}
/** The public facts of one analysis (one source for every host). */
export interface EngineFacts {
    readonly run_id: string;
    readonly jobs: Readonly<Record<string, string>>;
    readonly job_state: Readonly<Record<string, EngineJobState>>;
    readonly attempts: Readonly<Record<string, number>>;
    readonly failed: readonly string[];
    readonly uncertain: readonly string[];
    /** Keys whose job succeeded and whose download gave up. */
    readonly lost: readonly string[];
    readonly payment_stopped: boolean;
    /** Why the host stopped a key: the message of its POST's `host_error` (only keys that have one). */
    readonly errors?: Readonly<Record<string, string>>;
    /** Why a key has no result, as the engine decided it (issue #613). */
    readonly failures?: Readonly<Record<string, {
        readonly kind: TileFailureKind;
        readonly status?: number;
    }>>;
}
export type EngineOutcome = "ok" | "incomplete" | "timeout";
export type EngineAction = {
    readonly kind: "post";
    readonly a: number;
    readonly key: string;
    readonly attempt: number;
    readonly idempotency_key: string;
}
/** Upload key `key` and make its request, without the POST: answer `prepared` (batch submit). */
 | {
    readonly kind: "prepare";
    readonly a: number;
    readonly key: string;
    readonly attempt: number;
    readonly idempotency_key: string;
}
/** POST `body` once to `/binary/v1/async-batch`: answer `batch_answer`. */
 | {
    readonly kind: "post_batch";
    readonly batch: number;
    readonly body: string;
}
/** No IO: a batch submit accepted key `key`; `body` is the item's 202 body. */
 | {
    readonly kind: "accepted";
    readonly a: number;
    readonly key: string;
    readonly job_id: string;
    readonly body: unknown;
} | {
    readonly kind: "poll";
    readonly job_ids: readonly string[];
    readonly batched: boolean;
} | {
    readonly kind: "download";
    readonly a: number;
    readonly job: string;
} | {
    readonly kind: "finish";
    readonly a: number;
    readonly outcome: EngineOutcome;
    readonly facts: EngineFacts;
};
export type EngineEvent = ({
    readonly kind: "planned";
} & EnginePlan) | {
    readonly kind: "post_answer";
    readonly a: number;
    readonly key: string;
    readonly answer: RawSendAnswer;
    readonly job_id?: string;
    readonly retry_after_us?: number;
    /** The text of a failed POST: the key's `facts.errors` entry when it ends with no job (D302). */
    readonly error?: string;
} | {
    readonly kind: "sweep";
    readonly answer: RawSendAnswer;
    readonly retry_after_us?: number;
    readonly job_ids: readonly string[];
    /** The server's status texts (any case); a text the kernel does not know is an open job. */
    readonly status: readonly string[];
    /** The server's error text of a failed job, by job id. */
    readonly errors?: Readonly<Record<string, string>>;
} | {
    readonly kind: "prepared";
    readonly a: number;
    readonly key: string;
    readonly model: string;
    readonly request: string;
} | {
    readonly kind: "batch_answer";
    readonly batch: number;
    readonly answer: RawSendAnswer;
    readonly body?: string;
    readonly retry_after_us?: number;
    readonly error?: string;
} | {
    readonly kind: "download_done";
    readonly job: string;
} | {
    readonly kind: "download_failed";
    readonly job: string;
    readonly answer: RawSendAnswer;
    readonly retry_after_us?: number;
} | {
    readonly kind: "taken";
    readonly a: number;
} | {
    readonly kind: "host_error";
    readonly action: EngineAction;
    readonly message: string;
} | {
    readonly kind: "abort";
};
/** Seconds (a `Retry-After`) to whole microseconds. */
export declare function us(seconds: number | undefined): {
    retry_after_us?: number;
};
/** One run of the kernel engine. */
export declare class EngineDriver {
    private readonly handle;
    private readonly inbox;
    private kick;
    private readonly inFlight;
    private stopped;
    /** Records a job a batch submit accepted (the engine's `accepted`), before any other action. */
    onAccepted: (action: Extract<EngineAction, {
        kind: "accepted";
    }>) => void;
    constructor(config: EngineConfig);
    /** The error of the last status request that had no request outcome. */
    private pollError;
    /**
     * One engine step. An error of the engine is classified by the kernel
     * (`engineStop`): a refused status request is a `JobPollError`, a status
     * request with no outcome throws that request's own error.
     */
    private step;
    /** An event for the next wake (`taken` from the consumer). */
    push(event: EngineEvent): void;
    /** Stop the run: no new request; the requests in flight end and their answers count. */
    stop(): void;
    /** The facts of analysis `a` now. */
    facts(a: number): EngineFacts;
    /**
     * Run until every analysis is finished or `signal` aborts. `io` does one
     * action's IO with the action's own signal (aborted when `signal` aborts)
     * and resolves with its raw answer; `onFinish` hands an
     * analysis over; `onSweep` runs after each status answer. The handle is
     * freed after every IO has settled.
     */
    run(plans: readonly EnginePlan[], signal: AbortSignal, io: (action: Exclude<EngineAction, {
        kind: "finish" | "accepted";
    }>, signal: AbortSignal) => Promise<EngineEvent>, onFinish: (action: Extract<EngineAction, {
        kind: "finish";
    }>) => void, onSweep?: () => void): Promise<EngineFacts[]>;
}
/**
 * The SDK's retry and resend limits, read-only.
 *
 * @category Run an analysis
 */
export interface RetryPolicy {
    /** Sends of one submit that may have a job (5xx, 408, 409, network), the first included. */
    readonly submitMaxSends: number;
    /** Attempts (keys) of one tile, the first included. */
    readonly maxAttempts: number;
    /** What to do about a tile of each `TileFailure.kind`. The keys are every kind. */
    readonly failureAdvice: Readonly<Record<TileFailureKind, string>>;
}
/**
 * The SDK's retry and resend limits, read-only. A new object on every call;
 * changing it changes nothing in the SDK.
 *
 * @category Run an analysis
 */
export declare function retryPolicy(): RetryPolicy;
