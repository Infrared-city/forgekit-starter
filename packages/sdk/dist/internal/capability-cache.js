import { capability } from "./binary-submission.js";
import { withHostRetry } from "./host-retry.js";
/** How long one capability answer is trusted; the Python host's CAPABILITY_TTL_S. */
export const CAPABILITY_TTL_MS = 60_000;
/**
 * GET the capability document. A transient failure is asked again by the
 * kernel retry table (`withHostRetry`); a real 4xx answer is not.
 */
function fetchCapability(gateway, signal) {
    return withHostRetry("capability", () => capability(gateway, signal), { signal });
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
