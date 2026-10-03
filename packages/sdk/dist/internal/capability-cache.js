import { capability } from "./binary-submission.js";
import { delay } from "./deadline.js";
import { TransportError } from "./transport.js";
/** How long one capability answer is trusted; the Python host's CAPABILITY_TTL_S. */
export const CAPABILITY_TTL_MS = 60_000;
/** Attempts for one capability GET, the first one included. */
export const CAPABILITY_MAX_ATTEMPTS = 3;
/** Shortest wait between two attempts. */
export const CAPABILITY_MIN_BACKOFF_MS = 250;
/** Longest wait between two attempts. */
export const CAPABILITY_MAX_BACKOFF_MS = 1_000;
/**
 * True for a capability GET failure a further attempt can plausibly fix: a
 * network error, a timeout, or a `429`/`5xx` answer. A `404` means the
 * gateway has no binary route at all -- asking again only repeats it -- and
 * every other 4xx (401, 403, ...) is a real, non-transient answer. Mirrors
 * the Python host's reuse of `tiling.executor._is_retryable` for this same
 * GET (`_internal/binary_capability.py`).
 */
export function isRetryableCapabilityError(error) {
    if (!(error instanceof TransportError))
        return false;
    if (error.reason === "network" || error.reason === "timeout")
        return true;
    if (error.reason === "http" && error.status !== undefined) {
        return error.status === 429 || (error.status >= 500 && error.status < 600);
    }
    return false;
}
/**
 * Wait before the next attempt, honouring the caller's own cancellation.
 * Reuses `delay` (`internal/deadline.ts`), the one abortable-wait helper the
 * job poller and the public-data transport retry already share.
 */
async function pauseBeforeCapabilityRetry(signal) {
    const waitMs = CAPABILITY_MIN_BACKOFF_MS + Math.random() * (CAPABILITY_MAX_BACKOFF_MS - CAPABILITY_MIN_BACKOFF_MS);
    try {
        await delay(waitMs, signal ?? new AbortController().signal);
    }
    catch {
        throw new TransportError("binary capability GET was aborted while waiting to retry", "pre-dispatch", "aborted", "GET");
    }
}
/**
 * GET the capability document, retrying a transient failure.
 *
 * This GET runs before every binary submission and used to make exactly one
 * attempt: a dropped connection, a timeout, or a transient `5xx`/`429`
 * failed the whole run before a single tile was submitted. Up to
 * {@link CAPABILITY_MAX_ATTEMPTS} attempts total, short jittered backoff
 * between them, never retried past a real 4xx answer.
 */
async function fetchCapability(gateway, signal) {
    for (let attempt = 1;; attempt += 1) {
        try {
            return await capability(gateway, signal);
        }
        catch (error) {
            if (attempt >= CAPABILITY_MAX_ATTEMPTS || !isRetryableCapabilityError(error))
                throw error;
        }
        await pauseBeforeCapabilityRetry(signal);
    }
}
/**
 * One client's `/binary/v1/capabilities` document, read by the binary route
 * only, fetched once for every submission that shares it and trusted for
 * {@link CAPABILITY_TTL_MS}, so a gateway redeploy is picked up inside a
 * long-lived client.
 *
 * A failed fetch is not cached: the next binary submission asks again.
 */
export class CapabilityCache {
    gateway;
    entry;
    constructor(gateway) {
        this.gateway = gateway;
    }
    get(signal) {
        const now = Date.now();
        if (this.entry !== undefined && now - this.entry.at < CAPABILITY_TTL_MS)
            return this.entry.value;
        const value = fetchCapability(this.gateway, signal).catch((error) => {
            if (this.entry?.value === value)
                this.entry = undefined;
            throw error;
        });
        this.entry = { at: now, value };
        return value;
    }
}
