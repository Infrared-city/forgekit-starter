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
/** One batched sweep's answer. */
export interface StatusSweep {
    /** What the gateway said, keyed by job id. */
    readonly statuses: Map<string, Job>;
    /**
     * Ids this sweep did not settle — no row, or a chunk that failed. The
     * caller asks about these per job, which gives them exactly the treatment
     * `GET /jobs/{id}` has always given them (including the 404 that retires a
     * tile after five consecutive failures).
     */
    readonly unanswered: string[];
    /**
     * At least one chunk came back in the batched SHAPE. That shape IS the
     * proof, not whether any job matched: a sweep of ids the gateway has no
     * row for is a perfectly good batched answer, and treating it as unproven
     * would leave a working client on the 15 s ladder for its first interval.
     */
    readonly batched: boolean;
    /**
     * At least one chunk PROVED the gateway does not have the route — it
     * rejected the form, or answered with the whole-account listing. Distinct
     * from `!batched`, which a purely transient sweep also produces: a timeout
     * says nothing about whether the route exists, and must not condemn it.
     */
    readonly lacking: boolean;
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
}): Promise<StatusSweep>;
