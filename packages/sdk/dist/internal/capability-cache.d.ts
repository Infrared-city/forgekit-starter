import { type BinaryCapability } from "./binary-submission.js";
import type { GatewayTransport } from "./transport.js";
/** How long one capability answer is trusted; the Python host's CAPABILITY_TTL_S. */
export declare const CAPABILITY_TTL_MS = 60000;
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
