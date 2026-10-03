/**
 * The upload send budget (#529, #556): ONE state machine for every request
 * that sends a body, whatever runtime sends it.
 *
 * Two rules stop a send, and nothing else does:
 *
 * 1. **Stall guard.** No body byte moved for `stallMs`: stop. A slow upload
 *    that still moves never trips it. It bounds the connect as well, because
 *    no byte moves before the connection exists.
 * 2. **Total budget.** The body is not sent `budgetMs` after the first byte
 *    was offered: stop. `budgetMs` scales with the body size.
 *
 * When the last body byte is sent, both rules end, so the complete body never
 * causes a timeout; the wait for the response then gets its own fresh window,
 * `responseMs` (the request's timeout). No TypeScript sender sends a body
 * twice (a redirect is refused), so there is no rewind here. The numbers come from the kernel (`sendLimits` in `send-body.ts`).
 *
 * A sender that cannot see byte progress (a caller's own `fetch`, or a
 * gateway request in a browser, see `body-sender.ts`) reports nothing. Then no stall is visible and the whole request, body and response,
 * gets one window: `budgetMs + responseMs`.
 */
/** The longest delay `setTimeout` keeps; a longer one would fire at once. */
export declare const MAX_TIMEOUT_MS = 2147483647;
export interface SendLimits {
    /** The body size, bytes. */
    readonly totalBytes: number;
    /** No byte moved for this long: stop. */
    readonly stallMs: number;
    /** The whole body must be sent within this, from the first byte offered. */
    readonly budgetMs: number;
    /** The wait for the response after the last body byte. */
    readonly responseMs: number;
}
/** What a sender reports while it sends a body. */
export interface SendProgress {
    /** Bytes of the body the connection has taken so far. */
    progress(sentBytes: number): void;
    /** The send is over: the last byte is sent, or the server answered first. */
    finished(): void;
}
/** Which rule stopped a send; `"window"` is the one window of a sender that shows no progress. */
export type SendStop = "stall" | "budget" | "response" | "window";
export declare class SendGuard implements SendProgress {
    private readonly limits;
    private readonly onStop;
    private phase;
    private sent;
    private stopped;
    private readonly timers;
    constructor(limits: SendLimits, onStop: (why: SendStop) => void);
    /** Why the guard stopped the send, if it did. */
    get stop(): SendStop | undefined;
    /**
     * Arm the guard at dispatch. A sender that reports byte progress gets the
     * stall guard and the budget; one that cannot gets one window for body and
     * response together (see the module comment).
     */
    start(observesProgress: boolean): void;
    progress(sentBytes: number): void;
    /** The last body byte is sent, or the server answered: end both rules, start the response window. */
    finished(): void;
    close(): void;
    private arm;
    private clear;
}
