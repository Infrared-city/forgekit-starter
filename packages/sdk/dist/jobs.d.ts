import { A as AuthResolver } from './auth-D2CCPTLa.js';
import { L as Logger } from './logger-U3BDdomT.js';
import { I as IJobsService, J as Job, O as OnPollCallback, D as DownloadResult } from './types-DVfcTlO_.js';
export { a as JobStatus, T as TERMINAL_STATUSES, j as jobFromResponse, p as parseJobStatus } from './types-DVfcTlO_.js';

/**
 * Async job execution pipeline for the Infrared SDK.
 *
 * Ported from Python SDK `analyses/jobs.py` (~585 lines).
 * Uses raw `fetch` instead of `HttpClient` because the job endpoints
 * require access to response headers (Link header) and non-JSON binary
 * downloads with separate auth handling (S3 presigned URLs).
 *
 * Design note: Async job submission uses plain JSON (Content-Type: application/json),
 * matching the Python SDK's `JobsServiceClient.submit()` which sends `json=body`.
 * Gzip compression was only used by the now-removed sync execution path.
 */

interface JobsServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Maximum backoff delay in seconds. Default: 10 */
    backoffCap?: number;
    /**
     * Control-plane request timeout in ms (submit / poll / status).
     * Default: 180_000 (3 minutes), matching Python SDK's API_TIMEOUT_S.
     */
    timeout?: number;
    /**
     * S3 download timeout in ms — used by `downloadResults` for the
     * presigned-URL fetch. Default: 600_000 (10 minutes), matching
     * Python SDK's `S3_TIMEOUT_S`. Larger than `timeout` because
     * cold-Lambda S3 fetches can stream slowly.
     */
    downloadTimeout?: number;
    /** Bare gateway URL for big-payload presign. Threaded from InfraredClient. */
    gatewayBaseUrl?: string;
    /** Lazy big-payload kill switch — re-resolved per call. */
    getBigPayloadEnabled?: () => boolean;
    /** Lazy big-payload threshold (bytes) — re-resolved per call. */
    getBigPayloadThresholdBytes?: () => number;
}
/**
 * Client for async job submission, polling, and result download.
 *
 * Uses raw `fetch` with separate authenticated and unauthenticated
 * request paths (API vs. S3 presigned URLs). All requests include
 * timeout via AbortController.
 */
declare class JobsService implements IJobsService {
    private readonly getAuthHeaders;
    private readonly baseUrl;
    private readonly logger;
    private readonly backoffCap;
    private readonly timeout;
    private readonly downloadTimeout;
    private readonly gatewayBaseUrl?;
    private readonly getBigPayloadEnabled;
    private readonly getBigPayloadThresholdBytes;
    constructor(config: JobsServiceConfig);
    /**
     * Submit an analysis for async execution.
     *
     * POST `{baseUrl}/async/{analysisType}` with a zipped JSON payload
     * (`Content-Type: application/zip`). Mirrors Python SDK 0.4.4
     * `JobsServiceClient.submit`, which dispatches via
     * `post_zip_with_big_payload`. Above the configured threshold the
     * zip is uploaded to S3 via the presign flow and a `$ref` envelope
     * is POSTed to the original URL; below threshold the zip is sent
     * inline (still `application/zip`).
     *
     * Webhook fields are injected at the transport layer (not part of the
     * analysis payload schema).
     */
    submit(analysisType: string, payload: Record<string, unknown>, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<Job>;
    /**
     * Poll job status.
     *
     * GET `{baseUrl}/async/jobs/{jobId}`.
     */
    getStatus(jobId: string): Promise<Job>;
    /**
     * Poll until the job reaches a terminal state or timeout.
     *
     * Uses exponential backoff with full jitter:
     *   delay = max(floor, random(0, min(cap, base * 2^attempt)))
     *
     * @param jobId - The job to poll
     * @param opts.timeout - Maximum seconds to wait (default 300). Must be > 0.
     * @param opts.onPoll - Optional callback fired on every iteration (including terminal).
     *   Return `false` to stop polling early.
     *
     * @throws JobTimeoutError if timeout elapses before terminal state
     * @throws JobFailedError if job reaches Failed status
     */
    waitForCompletion(jobId: string, opts?: {
        timeout?: number;
        onPoll?: OnPollCallback;
    }): Promise<Job>;
    /**
     * Download results for a completed job.
     *
     * 1. Verify job has succeeded (skip if `opts.job` is provided)
     * 2. Fetch presigned S3 URL from Link header
     * 3. Download from S3 without auth headers
     * 4. On 403, refresh presigned URL once and retry
     */
    downloadResults(jobId: string, opts?: {
        job?: Job;
    }): Promise<DownloadResult>;
    /**
     * Decompress ZIP or GZIP content and return parsed JSON dict.
     *
     * Tries ZIP first, then GZIP. If the decompressed JSON is a list,
     * it is normalised to `{ output: <list> }` so callers always receive a dict.
     *
     * Uses fflate for isomorphic decompression (no node:* imports).
     * Uses TextDecoder (not String.fromCharCode) to avoid stack overflow on large grids.
     */
    decompress(content: Uint8Array): Record<string, unknown>;
    /**
     * Make an authenticated fetch request (includes X-Api-Key header + timeout).
     *
     * On timeout, throws InfraredError so callers always receive a typed SDK error.
     */
    private authenticatedFetch;
    /**
     * GET /async/jobs/{jobId}/results and extract presigned URL from Link header.
     *
     * Link header format: `<presigned-url>; rel="results"` or just `<presigned-url>`
     */
    private fetchPresignedUrl;
    /**
     * Download from S3 presigned URL without auth headers.
     *
     * Returns `{ content, contentType }` on success, or `null` on 403
     * (caller should retry with refreshed URL).
     */
    private downloadFromS3;
}

export { DownloadResult, IJobsService, Job, JobsService, type JobsServiceConfig, OnPollCallback };
