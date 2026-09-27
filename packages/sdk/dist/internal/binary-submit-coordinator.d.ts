import type { Job, PreparedSubmission } from "../jobs.js";
import { type AuthResolver } from "./auth.js";
import { type PreparedBinary } from "./binary-submission.js";
import { BinaryUrlCache } from "./binary-url-cache.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
interface BinarySubmitOptions {
    readonly prepared: PreparedSubmission;
    readonly prepare: (fresh: boolean) => Promise<PreparedBinary>;
    readonly releasePrepared: () => void;
    readonly parseJob: (value: unknown) => Job;
    readonly gateway: GatewayTransport;
    readonly uploadGateway: GatewayTransport;
    readonly auth: AuthResolver;
    readonly fetch: FetchLike;
    readonly timeoutMs: number;
    readonly urlCache: BinaryUrlCache;
    readonly reuseEnabled: boolean;
    readonly signal?: AbortSignal;
    readonly beforeDispatch?: () => void;
}
/** Coordinate strict shared-URL reuse with one safe, uncached compatibility fallback. */
export declare function submitPreparedBinary(options: BinarySubmitOptions): Promise<Job>;
export {};
