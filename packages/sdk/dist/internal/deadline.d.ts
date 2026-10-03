import { MAX_TIMEOUT_MS, SendGuard, type SendLimits, type SendStop } from "./send-guard.js";
export type StopReason = "aborted" | "timeout";
export { MAX_TIMEOUT_MS };
export declare function requireTimeout(timeoutMs: number): number;
/** One portable AbortController deadline shared by auth, fetch, and body read. */
export declare class Deadline {
    readonly caller: AbortSignal | undefined;
    readonly controller: AbortController;
    /** Aborts on the timeout only, never on the caller's signal. */
    private readonly timeout;
    private timedOut;
    private callerAborted;
    private timer;
    private guard;
    private readonly onCallerAbort;
    constructor(caller: AbortSignal | undefined, timeoutMs: number);
    private expire;
    /**
     * Hand the timeout to a send guard at the dispatch of a request body
     * (`send-body.ts`): this deadline's own timer stops, and the guard's stall,
     * budget and response rules end the request from here, as a timeout.
     */
    guardSend(limits: SendLimits, observesProgress: boolean): SendGuard;
    /** Which send rule stopped the request, when a send guard did. */
    sendStop(): SendStop | undefined;
    reason(): StopReason | undefined;
    /**
     * Start work only when live, and remove this wait's listener on settlement.
     * `timeoutOnly` waits for work that is already sent: only the timeout ends
     * the wait, and the caller's abort reaches the work through
     * `controller.signal` only, so an answer already in hand is kept.
     */
    wait<T>(start: () => Promise<T>, timeoutOnly?: boolean): Promise<T>;
    close(): void;
}
/**
 * Wait *ms*, or stop early when *signal* aborts.
 *
 * One home for the abortable wait: the job poller counts its backoff with it
 * and so does the public-data transport retry. Both clear the timer and take
 * their listener off the signal on every exit, which is the part a hand-rolled
 * `setTimeout` in each caller kept getting wrong.
 */
export declare function delay(ms: number, signal: AbortSignal): Promise<void>;
