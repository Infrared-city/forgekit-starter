import type { Job, PreparedSubmission } from "../jobs.js";
import { type AuthResolver } from "./auth.js";
import { type PreparedBinary } from "./binary-submission.js";
import { BinaryUrlCache } from "./binary-url-cache.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
/**
 * The two stages of one area run (T4). The upload (presign + PUT) holds an
 * upload slot; the paid POST holds a POST slot. A submit that waits for an
 * upload another submit started holds no upload slot, so the run can upload
 * its next tile in the meantime.
 */
export interface SubmitStages {
    /** This submit needs no upload slot any more. Called at most once. */
    readonly uploaded: () => void;
    /** Send the paid POST in one of the run's POST slots. */
    readonly post: <T>(send: () => Promise<T>) => Promise<T>;
}
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
    /** The two stages of an area run (T4); unset for a direct, single submit. */
    readonly stages?: SubmitStages;
    readonly signal?: AbortSignal;
    readonly beforeDispatch?: () => void;
    /** The area retry `Idempotency-Key` for this submit (D224); unset for a
     * direct, non-area submit. */
    readonly idempotencyKey?: string;
    /** The result family this submission asks for (D228); default `"irbf"`,
     * the outdoor/facade route every caller before D228 used. */
    readonly resultFormat?: "irbf" | "json";
}
/** Coordinate strict shared-URL reuse with one safe, uncached compatibility fallback. */
export declare function submitPreparedBinary(options: BinarySubmitOptions): Promise<Job>;
export {};
