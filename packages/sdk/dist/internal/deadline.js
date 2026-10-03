import { MAX_TIMEOUT_MS, SendGuard } from "./send-guard.js";
export { MAX_TIMEOUT_MS };
export function requireTimeout(timeoutMs) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_TIMEOUT_MS) {
        throw new TypeError(`timeoutMs must be in (0, ${MAX_TIMEOUT_MS}]`);
    }
    return timeoutMs;
}
/** One portable AbortController deadline shared by auth, fetch, and body read. */
export class Deadline {
    caller;
    controller = new AbortController();
    /** Aborts on the timeout only, never on the caller's signal. */
    timeout = new AbortController();
    timedOut = false;
    callerAborted = false;
    timer;
    guard;
    onCallerAbort;
    constructor(caller, timeoutMs) {
        this.caller = caller;
        this.onCallerAbort = () => {
            this.callerAborted = true;
            this.controller.abort();
        };
        if (caller?.aborted)
            this.onCallerAbort();
        else
            caller?.addEventListener("abort", this.onCallerAbort, { once: true });
        this.timer = setTimeout(() => this.expire(), requireTimeout(timeoutMs));
    }
    expire() {
        this.timedOut = true;
        this.timeout.abort();
        this.controller.abort();
    }
    /**
     * Hand the timeout to a send guard at the dispatch of a request body
     * (`send-body.ts`): this deadline's own timer stops, and the guard's stall,
     * budget and response rules end the request from here, as a timeout.
     */
    guardSend(limits, observesProgress) {
        clearTimeout(this.timer);
        this.timer = undefined;
        this.guard?.close();
        this.guard = new SendGuard(limits, () => this.expire());
        if (!this.controller.signal.aborted)
            this.guard.start(observesProgress);
        return this.guard;
    }
    /** Which send rule stopped the request, when a send guard did. */
    sendStop() {
        return this.guard?.stop;
    }
    reason() {
        if (this.callerAborted)
            return "aborted";
        if (this.timedOut)
            return "timeout";
        return undefined;
    }
    /**
     * Start work only when live, and remove this wait's listener on settlement.
     * `timeoutOnly` waits for work that is already sent: only the timeout ends
     * the wait, and the caller's abort reaches the work through
     * `controller.signal` only, so an answer already in hand is kept.
     */
    wait(start, timeoutOnly = false) {
        const stop = timeoutOnly ? this.timeout.signal : this.controller.signal;
        if (stop.aborted)
            return Promise.reject(new Error("request stopped"));
        return new Promise((resolve, reject) => {
            const cleanup = () => stop.removeEventListener("abort", onAbort);
            const onAbort = () => {
                cleanup();
                reject(new Error("request stopped"));
            };
            stop.addEventListener("abort", onAbort, { once: true });
            let work;
            try {
                work = start();
            }
            catch (error) {
                cleanup();
                reject(error);
                return;
            }
            work.then((value) => {
                cleanup();
                resolve(value);
            }, (error) => {
                cleanup();
                reject(error);
            });
        });
    }
    close() {
        clearTimeout(this.timer);
        this.guard?.close();
        this.caller?.removeEventListener("abort", this.onCallerAbort);
    }
}
/**
 * Wait *ms*, or stop early when *signal* aborts.
 *
 * One home for the abortable wait: the job poller counts its backoff with it
 * and so does the public-data transport retry. Both clear the timer and take
 * their listener off the signal on every exit, which is the part a hand-rolled
 * `setTimeout` in each caller kept getting wrong.
 */
export function delay(ms, signal) {
    if (signal.aborted)
        return Promise.reject(new Error("the wait was stopped"));
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            signal.removeEventListener("abort", onAbort);
            reject(new Error("the wait was stopped"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
    });
}
