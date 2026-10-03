import { requireCore } from "./core.js";
import { TransportError } from "./transport.js";
/** The default wait timeout, seconds (kernel-owned, D213). */
export function defaultPollTimeoutS() {
    return requireCore().pollDefaultTimeoutSeconds();
}
/** A status request failure the engine backs off on: HTTP 429, a 5xx, or a
 * network failure or request timeout. Anything else is the caller's error. */
export function isTransientStatusError(error) {
    if (!(error instanceof TransportError))
        return false;
    if (error.reason === "network" || error.reason === "timeout")
        return true;
    return error.reason === "http" && error.status !== undefined &&
        (error.status === 429 || error.status >= 500);
}
/** Sweep until `sweep` says done, or throw `onTimeout(elapsedS)`. */
export async function poll(sweep, options) {
    const now = options.now ?? (() => performance.now());
    const random = options.random ?? Math.random;
    const started = now();
    const deadline = started + options.timeoutS * 1_000;
    let errors = 0;
    // No sweep at t = 0: a job submitted a moment ago cannot be done yet.
    const firstS = Math.min(requireCore().pollFirstDelaySeconds(), options.timeoutS, options.fixedIntervalS ?? Infinity, options.maxIntervalS ?? Infinity);
    if (options.firstSweepNow !== true)
        await options.sleep(firstS * 1_000);
    for (let attempt = 0;; attempt += 1) {
        const outcome = await sweep();
        const elapsedS = (now() - started) / 1_000;
        let delayS = 0;
        if (outcome.done) {
            delayS = 0;
        }
        else if (outcome.failed === true) {
            errors += 1;
            // Never faster than the rate bound either: a failed per-job sweep of 81
            // jobs still waits at least 40.5 s.
            delayS = Math.max(requireCore().pollErrorDelaySeconds(errors, random(), outcome.retryAfterS), requireCore().pollIntervalSeconds(elapsedS, Math.max(1, outcome.nextRequests ?? 1)));
        }
        else {
            errors = 0;
            delayS = options.fixedIntervalS ??
                requireCore().pollIntervalSeconds(elapsedS, Math.max(1, outcome.nextRequests ?? 1));
            if (options.maxIntervalS !== undefined)
                delayS = Math.min(delayS, options.maxIntervalS);
        }
        if (options.observe !== undefined &&
            await options.observe(outcome, attempt, elapsedS, delayS) === false)
            return outcome;
        if (outcome.done)
            return outcome;
        const remainingMs = deadline - now();
        if (remainingMs <= 0)
            throw options.onTimeout(elapsedS);
        await options.sleep(Math.min(delayS * 1_000, remainingMs));
    }
}
