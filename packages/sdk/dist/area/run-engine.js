/**
 * The kernel `RunEngine` (wasm), its JSON wire types, and the ONE TypeScript
 * driver loop (`docs/engine-driver-contract.md`): ask the engine for actions,
 * do the IO, give the raw answers back. The engine decides every POST, poll,
 * download, retry, stop and hand-over; this host decides nothing. The same
 * code runs on Node, in Node `worker_threads`, in a browser page and in a
 * Web Worker. Contract: `public/rust/crates/ir-geo/src/run_engine/types.rs`.
 */
import { requireCore } from "../internal/core.js";
import { engineStopError } from "./run-errors.js";
/** Seconds (a `Retry-After`) to whole microseconds. */
export function us(seconds) {
    return seconds === undefined || !Number.isFinite(seconds) || seconds < 0 ? {}
        : { retry_after_us: Math.round(seconds * 1e6) };
}
const now = () => Math.round(performance.now() * 1_000);
/** The longest delay `setTimeout` takes (about 24.8 days). */
const MAX_TIMER_MS = 2 ** 31 - 1;
/** One run of the kernel engine. */
export class EngineDriver {
    handle;
    inbox = [];
    kick = () => { };
    inFlight = new Set();
    stopped = false;
    /** Records a job a batch submit accepted (the engine's `accepted`), before any other action. */
    onAccepted = () => { };
    constructor(config) {
        this.handle = new (requireCore().RunEngine)(JSON.stringify({
            ...config, seed: Math.floor(Math.random() * 2 ** 32) >>> 0
        }));
    }
    /** The error of the last status request that had no request outcome. */
    pollError;
    /**
     * One engine step. An error of the engine is classified by the kernel
     * (`engineStop`): a refused status request is a `JobPollError`, a status
     * request with no outcome throws that request's own error.
     */
    step(events) {
        try {
            return this.handle.step(now(), JSON.stringify(events));
        }
        catch (error) {
            throw engineStopError(error, this.pollError);
        }
    }
    /** An event for the next wake (`taken` from the consumer). */
    push(event) {
        this.inbox.push(event);
        this.kick();
    }
    /** Stop the run: no new request; the requests in flight end and their answers count. */
    stop() {
        this.stopped = true;
        this.kick();
    }
    /** The facts of analysis `a` now. */
    facts(a) {
        return JSON.parse(this.handle.facts(a));
    }
    /**
     * Run until every analysis is finished or `signal` aborts. `io` does one
     * action's IO with the action's own signal (aborted when `signal` aborts)
     * and resolves with its raw answer; `onFinish` hands an
     * analysis over; `onSweep` runs after each status answer. The handle is
     * freed after every IO has settled.
     */
    async run(plans, signal, io, onFinish, onSweep) {
        for (const plan of plans)
            this.inbox.push({ kind: "planned", ...plan });
        let open = plans.length;
        // ONE listener on the caller's signal for the whole run. Each request gets
        // its own child signal, aborted from here, so up to 61 requests in flight
        // never put a listener each on the caller's signal (Node's
        // MaxListenersExceededWarning at 11).
        const children = new Set();
        const wake = () => {
            for (const child of children)
                child.abort(signal.reason);
            this.kick();
        };
        signal.addEventListener("abort", wake, { once: true });
        let thrown = true;
        try {
            while (open > 0 && !signal.aborted && !this.stopped) {
                const events = this.inbox.splice(0);
                const step = JSON.parse(this.step(events));
                if (onSweep !== undefined && events.some((e) => e.kind === "sweep"))
                    onSweep();
                for (const act of step.actions) {
                    if (act.kind === "finish") {
                        open -= 1;
                        onFinish(act);
                        continue;
                    }
                    if (act.kind === "accepted") {
                        this.onAccepted(act);
                        continue;
                    }
                    const child = new AbortController();
                    if (signal.aborted)
                        child.abort(signal.reason);
                    children.add(child);
                    const work = io(act, child.signal).then((event) => this.push(event), (error) => {
                        // The engine judges a host error; a status request's own error is
                        // kept, to be thrown when the engine ends the run for it.
                        if (act.kind === "poll")
                            this.pollError = { error };
                        this.push({ kind: "host_error", action: act, message: String(error) });
                    });
                    this.inFlight.add(work);
                    void work.finally(() => {
                        this.inFlight.delete(work);
                        children.delete(child);
                    });
                }
                if (this.inbox.length > 0 || open === 0)
                    continue;
                let timer;
                await new Promise((resolve) => {
                    this.kick = resolve;
                    if (step.wake_at_us !== null) {
                        timer = setTimeout(resolve, Math.min(MAX_TIMER_MS, Math.max(0, step.wake_at_us / 1_000 - performance.now())));
                    }
                });
                clearTimeout(timer);
                this.kick = () => { };
            }
            thrown = false;
        }
        finally {
            signal.removeEventListener("abort", wake);
            while (this.inFlight.size > 0)
                await Promise.allSettled([...this.inFlight]);
            if (thrown)
                this.handle.free();
        }
        try {
            // Answers that came after the loop ended (a POST accepted after an
            // abort) go into the facts too.
            try {
                const last = JSON.parse(this.handle.step(now(), JSON.stringify([...this.inbox.splice(0),
                    { kind: "abort" }])));
                // A batch item accepted after the stop: its job is billed and recorded.
                for (const act of last.actions)
                    if (act.kind === "accepted")
                        this.onAccepted(act);
            }
            catch { /* the run is over; the facts are what counts */ }
            return plans.map((_, a) => this.facts(a));
        }
        finally {
            this.handle.free();
        }
    }
}
/**
 * The SDK's retry and resend limits, read-only. A new object on every call;
 * changing it changes nothing in the SDK.
 *
 * @category Run an analysis
 */
export function retryPolicy() {
    const raw = JSON.parse(requireCore().retryPolicy());
    return { submitMaxSends: raw.submit_max_sends, maxAttempts: raw.max_attempts,
        failureAdvice: raw.failure_advice };
}
