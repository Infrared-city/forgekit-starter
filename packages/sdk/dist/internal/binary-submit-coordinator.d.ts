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
    /**
     * In-flight uploads of a shared archive, one per encoding+digest (#602):
     * an area submission's jobs race to upload one shared archive, and this
     * makes a later job await the first upload instead of starting its own.
     * ONE map per area run, made by the caller and passed here — a direct,
     * single submit passes none, so it never shares an upload with anything.
     * Applies whether or not URL reuse is on; reuse only decides whether the
     * finished URL is also KEPT in `urlCache` for a later, separate
     * submission. The entry comes out of the map the moment its upload
     * settles.
     */
    readonly uploads?: Map<string, Promise<string>>;
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
