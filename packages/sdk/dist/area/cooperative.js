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
export const DEFAULT_SLICE_MS = 40;
/** A plan that was stopped by its caller's `AbortSignal`. */
export class PlanAbortedError extends Error {
    constructor(message = "the area plan was stopped before it finished") {
        super(message);
        // The web convention for a signalled stop, so a caller that already
        // branches on `error.name === "AbortError"` around `runArea` needs no
        // second shape for the planning half of the run.
        this.name = "AbortError";
    }
}
function now() {
    return typeof performance === "object" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}
/**
 * One `MessageChannel`, reused, with a queue — not one channel per yield.
 *
 * A channel is a host object with a port pair; minting 49 of them per plan
 * (and 400 on a large site) to send 49 empty messages is exactly the "host
 * objects created only to be thrown away" the root `CLAUDE.md` warns about.
 */
let channel;
const waiting = [];
function viaMessageChannel(resume) {
    if (channel === undefined) {
        channel = new MessageChannel();
        channel.port1.onmessage = () => {
            waiting.shift()?.();
        };
        // A port holds the Node event loop open until it is unref'd; in a browser
        // it does not. `unref` exists only on the Node implementation.
        channel.port1.unref?.();
    }
    waiting.push(resume);
    channel.port2.postMessage(0);
}
function pickSchedule() {
    const immediate = globalThis.setImmediate;
    if (typeof immediate === "function")
        return (resume) => void immediate(resume);
    if (typeof MessageChannel === "function")
        return viaMessageChannel;
    // Last resort. Browsers clamp a nested `setTimeout(0)` to 4 ms, which is
    // slow but still a macrotask, which is the property that matters.
    return (resume) => void setTimeout(resume, 0);
}
let schedule;
/** Hand the thread back to the host, and take it again on the next turn. */
export function yieldToHost() {
    schedule ??= pickSchedule();
    return new Promise((resolve) => {
        schedule(resolve);
    });
}
/**
 * The slice clock a cooperative stage drives.
 *
 * `tick()` is the whole interface: call it before each unit of synchronous
 * work. It returns `undefined` — awaited, a microtask — while the slice has
 * room, and a real macrotask yield when it does not, so the fast path costs
 * one subtraction and the slow path costs one event-loop turn.
 */
export class Slice {
    sliceMs;
    signal;
    started = now();
    yields = 0;
    constructor(options = {}) {
        this.sliceMs = options.sliceMs ?? DEFAULT_SLICE_MS;
        this.signal = options.signal;
    }
    /** How many times this stage handed the thread back. Benchmarks read it. */
    get count() {
        return this.yields;
    }
    /** Refuse to go on when the caller has stopped the run. */
    check() {
        if (this.signal?.aborted === true)
            throw new PlanAbortedError();
    }
    /** Check the signal, and yield when this slice is used up. */
    tick() {
        this.check();
        if (now() - this.started < this.sliceMs)
            return undefined;
        return this.pause();
    }
    /** Yield unconditionally — around one indivisible call, before and after. */
    async pause() {
        this.check();
        this.yields += 1;
        await yieldToHost();
        this.check();
        this.started = now();
    }
}
