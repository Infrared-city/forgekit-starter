import { type BinaryCapability } from "./binary-submission.js";
import { type GatewayTransport } from "./transport.js";
/** How long one capability answer is trusted; the Python host's CAPABILITY_TTL_S. */
export declare const CAPABILITY_TTL_MS = 60000;
/** Attempts for one capability GET, the first one included. */
export declare const CAPABILITY_MAX_ATTEMPTS = 3;
/** Shortest wait between two attempts. */
export declare const CAPABILITY_MIN_BACKOFF_MS = 250;
/** Longest wait between two attempts. */
export declare const CAPABILITY_MAX_BACKOFF_MS = 1000;
/**
 * True for a capability GET failure a further attempt can plausibly fix: a
 * network error, a timeout, or a `429`/`5xx` answer. A `404` means the
 * gateway has no binary route at all -- asking again only repeats it -- and
 * every other 4xx (401, 403, ...) is a real, non-transient answer. Mirrors
 * the Python host's reuse of `tiling.executor._is_retryable` for this same
 * GET (`_internal/binary_capability.py`).
 */
export declare function isRetryableCapabilityError(error: unknown): boolean;
/**
 * One client's `/binary/v1/capabilities` document, read by the binary route
 * only, fetched once for every submission that shares it and trusted for
 * {@link CAPABILITY_TTL_MS}, so a gateway redeploy is picked up inside a
 * long-lived client.
 *
 * A failed fetch is not cached: the next binary submission asks again.
 */
export declare class CapabilityCache {
    private readonly gateway;
    private entry;
    constructor(gateway: GatewayTransport);
    get(signal?: AbortSignal): Promise<BinaryCapability>;
}
