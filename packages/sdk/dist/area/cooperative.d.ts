/**
 * Cooperative planning: long synchronous kernel work, cut into slices the
 * host can interrupt (`infrared-core#237`, `docs/DEVIATIONS.md` D78).
 *
 * `planAreaSubmission` is `async` but, before this module, it never gave the
 * thread back: on the F3 benchmark fixture with `analysisSurfaces` on every
 * building it held the JS thread for about 24 s in two uninterrupted blocks
 * before the first byte reached the wire. In a browser worker that is 24 s in
 * which the worker answers no message, and an `AbortSignal` that fires at
 * second 1 is not read until second 24.
 *
 * Yielding is NOT parallelism and this module does not pretend otherwise. The
 * kernel calls still run on the calling thread and the wall time is the same
 * (a little better here, because WP-3 also removed work). What changes is the
 * LONGEST stretch between two yields, which is what decides whether the host
 * around the SDK stays responsive and whether a stop is honoured.
 *
 * Two rules the call sites depend on:
 *
 * 1. **A yield is a MACROTASK, never a microtask.** `await Promise.resolve()`
 *    resumes before the event loop runs a single timer, message or socket
 *    callback, so a loop that only awaits resolved promises blocks the host
 *    exactly as hard as one that awaits nothing. `setImmediate` (Node) and a
 *    `MessageChannel` message (browser, worker, Cloudflare Workers) both
 *    resume after the loop has had its turn.
 * 2. **The slice is measured, not counted.** "Every N tiles" is a guess about
 *    how expensive a tile is; tiles on this path differ by 20x. The driver
 *    yields when the time since the last yield passes `sliceMs`, so one
 *    expensive tile and thirty cheap ones both behave.
 */
/**
 * The longest stretch of synchronous work between two yields, in ms.
 *
 * 40 ms is a little over two 60 Hz frames: small enough that a host redrawing
 * or answering a message does not visibly stall, large enough that the yields
 * themselves stay noise (49 of them cost under a millisecond in total).
 */
export declare const DEFAULT_SLICE_MS = 40;
/** The two things every cooperative call site takes from `RunAreaOptions`. */
export interface CooperativeOptions {
    /** The caller's stop signal. Read at every slice boundary. */
    readonly signal?: AbortSignal;
    /** Override the slice length. For tests and benchmarks. */
    readonly sliceMs?: number;
}
/** A plan that was stopped by its caller's `AbortSignal`. */
export declare class PlanAbortedError extends Error {
    constructor(message?: string);
}
/** Hand the thread back to the host, and take it again on the next turn. */
export declare function yieldToHost(): Promise<void>;
/**
 * The slice clock a cooperative stage drives.
 *
 * `tick()` is the whole interface: call it before each unit of synchronous
 * work. It returns `undefined` — awaited, a microtask — while the slice has
 * room, and a real macrotask yield when it does not, so the fast path costs
 * one subtraction and the slow path costs one event-loop turn.
 */
export declare class Slice {
    private readonly sliceMs;
    private readonly signal;
    private started;
    private yields;
    constructor(options?: CooperativeOptions);
    /** How many times this stage handed the thread back. Benchmarks read it. */
    get count(): number;
    /** Refuse to go on when the caller has stopped the run. */
    check(): void;
    /** Check the signal, and yield when this slice is used up. */
    tick(): Promise<void> | undefined;
    /** Yield unconditionally — around one indivisible call, before and after. */
    pause(): Promise<void>;
}
