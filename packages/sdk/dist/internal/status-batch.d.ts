import { type GatewayTransport } from "./transport.js";
import type { Job } from "../job-model.js";
/**
 * Ids per request. It is the cap the endpoint documents and enforces, so it
 * is not ours to raise: `MaxBatchJobIDs` in
 * `infrared-async-inference-stack/internal/jobs_server/handlers_batch.go`.
 * DynamoDB's BatchGetItem takes 100 keys, so 50 keeps one chunk at one store
 * call with room for its UnprocessedKeys retry.
 */
export declare const STATUS_BATCH_LIMIT = 50;
/**
 * The answer to one batched status request for many jobs.
 *
 * @category Run an analysis
 */
export interface StatusSweep {
    /** The status of each answered job, keyed by job id. */
    readonly statuses: Map<string, Job>;
    /** Ids this request did not settle; read each of these with a single-job status call. */
    readonly unanswered: string[];
    /** Whether the service answered in the batched form. */
    readonly batched: boolean;
    /** Whether the service showed that it does not offer batched status. */
    readonly lacking: boolean;
    /** Ids deferred to the next sweep because the service answered 429 or a 5xx. */
    readonly failedIds?: readonly string[];
    /** The longest `Retry-After` those failures carried, in seconds. */
    readonly retryAfterS?: number;
}
/**
 * Ask for many job statuses at once.
 *
 * Never throws for a gateway reason: every id it could not settle comes back
 * in `unanswered`. `signal` aborts are re-thrown, because an aborted run must
 * stop rather than degrade into a per-job sweep.
 */
export declare function fetchStatusBatch(gateway: GatewayTransport, jobIds: readonly string[], options?: {
    readonly signal?: AbortSignal;
    readonly maxWorkers?: number;
    readonly routeProven?: boolean;
}): Promise<StatusSweep>;
