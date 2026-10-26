import type { GatewayTransport } from "./transport.js";
import { type FetchLike } from "./transport.js";
export interface SubmitArchiveOptions<T> {
    readonly beforeDispatch?: () => void;
    readonly endpointPath: string;
    readonly archive: Uint8Array;
    readonly gateway: GatewayTransport;
    readonly uploadGateway: GatewayTransport;
    readonly fetch: FetchLike;
    readonly thresholdBytes: number;
    readonly timeoutMs: number;
    readonly signal?: AbortSignal;
    readonly parseAccepted: (value: unknown) => T;
    /** The `Idempotency-Key` sent with this submission so an area retry cannot create a duplicate job. */
    readonly idempotencyKey?: string;
}
/**
 * Thrown when a job submission was sent but it is not certain whether the API created a
 * job, so repeating it could be billed twice.
 *
 * `acceptedJobIds` lists any job ids the API reported, so they can be checked or
 * reconciled against billing. The SDK does not retry such a submission by itself.
 *
 * @category Errors
 */
export declare class SubmissionUncertainError extends Error {
    readonly acceptedJobIds: readonly string[];
    readonly name = "SubmissionUncertainError";
    /** Always `"unknown-acceptance"`. */
    readonly phase = "unknown-acceptance";
    /** The HTTP status when the answer was a redirect (3xx) or a server error (5xx), otherwise `undefined`. */
    readonly status: number | undefined;
    constructor(acceptedJobIds: readonly string[], status?: number);
}
/** A typed accepted-response failure that must not be collapsed into a generic parse error. */
export declare class AcceptedResponseError extends Error {
    readonly name: string;
}
/** A server rejection that confirms no analysis job was accepted. */
export declare class GeometryReferenceRejectedError extends Error {
    readonly code: string;
    readonly name = "GeometryReferenceRejectedError";
    constructor(code: string);
}
/** Upload one already-built ZIP and return its signed read URL. */
export declare function uploadArchive(options: Pick<SubmitArchiveOptions<unknown>, "archive" | "uploadGateway" | "fetch" | "timeoutMs" | "signal">): Promise<string>;
/** Submit one prepared archive. No uncertain mutation is replayed. */
export declare function submitArchive<T>(options: SubmitArchiveOptions<T>): Promise<T>;
