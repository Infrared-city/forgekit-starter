import { A as AuthResolver } from './auth-D2CCPTLa.js';
import { L as Logger } from './logger-U3BDdomT.js';

/**
 * Custom error hierarchy for the Infrared SDK.
 *
 * Base class: InfraredError
 * Job errors: JobSubmitError, JobPollError, JobFailedError, JobTimeoutError,
 *             ResultsDownloadError, JobNotCompletedError
 * Validation: PolygonValidationError
 *
 * All specific error types carry `statusCode` and `responseBody` properties
 * for uniform error handling. Errors not originating from HTTP responses
 * use sensible defaults (statusCode: 0, responseBody: '').
 */
/**
 * Base error for all Infrared SDK errors.
 *
 * @example
 * ```ts
 * try {
 *   await client.run(input)
 * } catch (error) {
 *   if (error instanceof InfraredError) {
 *     console.error(error.statusCode, error.responseBody)
 *   }
 * }
 * ```
 */
declare class InfraredError extends Error {
    readonly statusCode: number;
    readonly responseBody: string;
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
        cause?: unknown;
    });
}
/**
 * Raised when the job submission HTTP request fails.
 *
 * Carries `retryAfter` parsed from the server's `Retry-After` header (seconds)
 * when the API rate-limits or temporarily 503s — mirrors Python SDK's
 * `JobSubmitError.retry_after`. `null` if the header was absent or unparseable.
 */
declare class JobSubmitError extends InfraredError {
    readonly retryAfter: number | null;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        retryAfter?: number | null;
    });
}
/**
 * Raised when the API returns 402 (Payment Required / insufficient credits).
 * Extends `JobSubmitError` so callers that catch `JobSubmitError` still handle
 * it; `statusCode` is always 402. Mirrors the Python SDK's status-code-based
 * 402 fail-fast (the Python SDK detects 402 by status rather than a dedicated
 * class). The submission loop treats this as non-retryable and aborts the whole
 * batch immediately — it is account-global, not per-tile.
 */
declare class InsufficientCreditsError extends JobSubmitError {
    constructor(message: string, opts: {
        responseBody: string;
        retryAfter?: number | null;
    });
}
/**
 * Raised when polling job status fails.
 *
 * Carries `retryAfter` from the response's `Retry-After` header (seconds).
 * Matches Python SDK's `JobPollError.retry_after`.
 */
declare class JobPollError extends InfraredError {
    readonly jobId: string;
    readonly retryAfter: number | null;
    constructor(message: string, opts: {
        jobId: string;
        statusCode: number;
        responseBody: string;
        retryAfter?: number | null;
    });
}
/**
 * Raised when the job reaches Failed status.
 */
declare class JobFailedError extends InfraredError {
    readonly jobId: string;
    readonly errorMessage: string;
    constructor(message: string, opts: {
        jobId: string;
        errorMessage: string;
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Raised when polling exceeds the timeout.
 */
declare class JobTimeoutError extends InfraredError {
    readonly jobId: string;
    constructor(message: string, opts: {
        jobId: string;
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Raised when downloading or fetching the presigned URL fails.
 *
 * Carries `retryAfter` from the response's `Retry-After` header. Mirrors
 * Python SDK's `ResultsDownloadError.retry_after`.
 */
declare class ResultsDownloadError extends InfraredError {
    readonly retryAfter: number | null;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        retryAfter?: number | null;
    });
}
/**
 * Raised when results are requested for a non-completed job.
 */
declare class JobNotCompletedError extends InfraredError {
    readonly jobId: string;
    constructor(message: string, opts: {
        jobId: string;
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Raised when a GeoJSON polygon fails validation.
 */
declare class PolygonValidationError extends InfraredError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Base class for all async-job-related errors. Mirrors Python SDK's
 * `InfraredJobError`. Lets callers `catch (e: InfraredJobError)` to handle any
 * job-lifecycle failure (submit, poll, run, timeout, download) uniformly,
 * separately from non-job SDK errors.
 *
 * Existing concrete classes (JobSubmitError, JobPollError, JobFailedError,
 * JobTimeoutError, JobNotCompletedError, ResultsDownloadError) still extend
 * `InfraredError`; they additionally satisfy `instanceof InfraredJobError` via
 * the prototype chain set up below.
 */
declare class InfraredJobError extends InfraredError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Raised when an area-level tiled run finishes with zero successful tiles
 * and at least one failed/skipped tile, OR when explicitly thrown by
 * `runAreaAndWait` to signal "every job in this run failed."
 *
 * Carries the partition of job IDs so callers can do recovery logic
 * (e.g. retry only `failedJobs`, ignore `skippedJobs`).
 */
declare class AreaRunError extends InfraredError {
    readonly failedJobs: readonly string[];
    readonly skippedJobs: readonly string[];
    readonly totalJobs: number;
    constructor(message: string, opts: {
        failedJobs: readonly string[];
        skippedJobs: readonly string[];
        totalJobs: number;
    });
}
/**
 * Raised when `runAreaAndWait` exceeds its `areaTimeout`. Carries the
 * last observed `AreaState` so the caller can inspect partial progress
 * and decide whether to merge what's available.
 */
declare class AreaTimeoutError extends InfraredError {
    readonly areaState: unknown;
    constructor(message: string, opts: {
        areaState: unknown;
    });
}
/**
 * Raised when a single tile within a tiled area run fails with a
 * permanent (non-retryable) error. Wraps the underlying job error.
 */
declare class TiledRunError extends InfraredError {
    readonly tileId: string;
    readonly cause?: unknown;
    constructor(message: string, opts: {
        tileId: string;
        cause?: unknown;
    });
}
/** Raised when a weather/utilities API call returns an HTTP error.
 *
 * Carries `retryAfter` parsed from the server's `Retry-After` header (seconds),
 * matching Python 0.4.9's `WeatherServiceError.retry_after` and the
 * `JobSubmitError`/`JobPollError` contract, so callers can implement an outer
 * backoff. `null` when the header was absent or unparseable. (Transparent retry
 * on retryable status is already performed by `HttpClient.fetchWithRetry`; this
 * field surfaces the hint on the final, retries-exhausted error.) */
declare class WeatherServiceError extends InfraredError {
    readonly operation: string;
    readonly retryAfter: number | null;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        operation: string;
        retryAfter?: number | null;
        cause?: unknown;
    });
}
/** Raised when a buildings API call returns an HTTP error. */
declare class BuildingsServiceError extends InfraredError {
    readonly operation: string;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        operation: string;
    });
}
/** Raised when a vegetation API call returns an HTTP error. */
declare class VegetationServiceError extends InfraredError {
    readonly operation: string;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        operation: string;
    });
}
/** Raised when a ground-materials API call returns an HTTP error. */
declare class GroundMaterialsServiceError extends InfraredError {
    readonly operation: string;
    constructor(message: string, opts: {
        statusCode: number;
        responseBody: string;
        operation: string;
    });
}
/** Base class for all big-payload-flow errors. */
declare class BigPayloadError extends InfraredError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/** Raised when the gateway's `/uploads/presign` call fails or returns an
 * invalid response (non-JSON body, missing `upload-url`/`get-url`, non-HTTPS
 * scheme). */
declare class BigPayloadPresignError extends BigPayloadError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/** Raised when the S3 PUT to the presigned URL fails. Common root causes:
 * `Content-Length` mismatch (S3 returns `SignatureDoesNotMatch`), or transient
 * 5xx exhausted the bounded retry budget. */
declare class BigPayloadUploadError extends BigPayloadError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/**
 * Raised when the receiving service returns a typed `REF_*` error after the
 * envelope POST. `code` carries the gateway/lambda-models contract code
 * (`REF_NOT_FOUND`, `REF_TOO_LARGE`, `REF_INVALID_ENVELOPE`, `REF_FETCH_TIMEOUT`,
 * `REF_HOST_NOT_ALLOWED`, `REF_CONTENT_TYPE_REJECTED`, `REF_DECODE_FAILED`,
 * `REF_EXPIRED`). Callers can dispatch on `code` without parsing the message.
 */
declare class BigPayloadFetchError extends BigPayloadError {
    readonly code: string;
    constructor(code: string, message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}
/** Raised when the `REF_EXPIRED` retry budget is consumed without success.
 * Always carries `code="REF_EXPIRED"` so existing handlers that dispatch on
 * `BigPayloadFetchError.code` keep working. */
declare class RefExpiredRetryExhausted extends BigPayloadFetchError {
    constructor(message: string, opts?: {
        statusCode?: number;
        responseBody?: string;
    });
}

/**
 * Webhook types and constants for the Infrared SDK.
 *
 * Provides WebhookEndpoint interface, WebhookRegistration type,
 * exception hierarchy, and webhook event constants.
 */

declare const WEBHOOK_EVENT_RUNNING: "job.running";
declare const WEBHOOK_EVENT_SUCCEEDED: "job.succeeded";
declare const WEBHOOK_EVENT_FAILED: "job.failed";
/** Base exception for all webhook errors. */
declare class WebhookError extends InfraredError {
    constructor(message: string);
}
/** Raised when webhook registration fails. */
declare class WebhookRegistrationError extends WebhookError {
    constructor(message: string);
}
/** Raised when a webhook endpoint is not found. */
declare class WebhookNotFoundError extends WebhookError {
    constructor(message: string);
}
/**
 * Immutable snapshot of a webhook endpoint from the API.
 *
 * The `createdAt` and `updatedAt` fields are optional because the
 * registration response (POST /webhooks) only returns `{id, url, type}`
 * without timestamps, whereas list/get responses include them.
 */
interface WebhookEndpoint {
    readonly id: string;
    readonly url: string;
    readonly type: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}
declare function webhookEndpointFromResponse(data: Record<string, unknown>): WebhookEndpoint;
/** Registration request payload for creating a webhook endpoint. */
interface WebhookRegistration {
    readonly url: string;
    readonly type: string;
    readonly ip?: string;
}

/**
 * Webhooks service client.
 *
 * Provides WebhooksService for managing webhook endpoints via the
 * Infrared API (CRUD operations) and verifying webhook signatures
 * using the Standard Webhooks HMAC-SHA256 scheme.
 *
 * Signature verification uses `crypto.subtle` for isomorphic
 * compatibility (browser, Node, Cloudflare Workers). Timing-safe
 * comparison uses the double-HMAC pattern to avoid timing attacks
 * without relying on `crypto.timingSafeEqual`.
 */

interface WebhooksServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retries for retryable errors. Default: 2 */
    maxRetries?: number;
}
/**
 * Interface for dependency injection and testing.
 */
interface IWebhooksService {
    register(url: string, type: string, ip?: string): Promise<WebhookEndpoint>;
    list(): Promise<WebhookEndpoint[]>;
    get(endpointId: string): Promise<WebhookEndpoint>;
    delete(endpointId: string): Promise<void>;
    verifySignature(payloadBody: Uint8Array | string, headers: Record<string, string>, secret: string, tolerance?: number): Promise<boolean>;
}
/**
 * Service for managing webhook endpoints and verifying signatures.
 *
 * CRUD operations (register, list, get, delete) communicate with the
 * Infrared webhooks API. Signature verification uses HMAC-SHA256 via
 * `crypto.subtle` with the Standard Webhooks format.
 */
declare class WebhooksService implements IWebhooksService {
    private httpClient;
    private logger;
    constructor(config: WebhooksServiceConfig);
    /**
     * Register a new webhook endpoint.
     *
     * @param url - The URL to receive webhook events.
     * @param type - Endpoint type ("production" or "development").
     * @param ip - Optional IP address filter.
     * @returns The newly created endpoint.
     * @throws WebhookRegistrationError if the request fails.
     */
    register(url: string, type: string, ip?: string): Promise<WebhookEndpoint>;
    /**
     * List all webhook endpoints.
     *
     * @returns All registered endpoints.
     * @throws WebhookError if the request fails.
     */
    list(): Promise<WebhookEndpoint[]>;
    /**
     * Get a specific webhook endpoint by ID.
     *
     * @param endpointId - The ID of the endpoint to retrieve.
     * @returns The requested endpoint.
     * @throws WebhookNotFoundError if the endpoint is not found (404).
     * @throws WebhookError if the request fails for other reasons.
     */
    get(endpointId: string): Promise<WebhookEndpoint>;
    /**
     * Delete a webhook endpoint by ID.
     *
     * @param endpointId - The ID of the endpoint to delete.
     * @throws WebhookNotFoundError if the endpoint is not found (404).
     * @throws WebhookError if the request fails for other reasons.
     */
    delete(endpointId: string): Promise<void>;
    /**
     * Verify a Standard Webhooks HMAC-SHA256 signature.
     *
     * Validates that the signature in the `webhook-signature` header matches
     * the expected HMAC for the given payload, and that the timestamp is
     * within the tolerance window (replay protection).
     *
     * Uses `crypto.subtle` for HMAC computation (isomorphic: browser, Node,
     * CF Workers) and a double-HMAC pattern for timing-safe comparison
     * (no dependency on `crypto.timingSafeEqual`).
     *
     * @param payloadBody - The raw request body (bytes or string).
     * @param headers - Request headers containing `webhook-id`, `webhook-timestamp`, and `webhook-signature`.
     * @param secret - The webhook secret (`"whsec_"` prefixed, base64-encoded).
     * @param tolerance - Maximum age of the timestamp in seconds (default 300). Set to 0 to disable replay protection.
     * @returns `true` if the signature is valid and the timestamp is within tolerance.
     */
    verifySignature(payloadBody: Uint8Array | string, headers: Record<string, string>, secret: string, tolerance?: number): Promise<boolean>;
}

export { AreaRunError as A, BigPayloadError as B, GroundMaterialsServiceError as G, type IWebhooksService as I, JobFailedError as J, PolygonValidationError as P, RefExpiredRetryExhausted as R, TiledRunError as T, VegetationServiceError as V, WEBHOOK_EVENT_FAILED as W, AreaTimeoutError as a, BigPayloadFetchError as b, BigPayloadPresignError as c, BigPayloadUploadError as d, BuildingsServiceError as e, InfraredError as f, InfraredJobError as g, InsufficientCreditsError as h, JobNotCompletedError as i, JobPollError as j, JobSubmitError as k, JobTimeoutError as l, ResultsDownloadError as m, WEBHOOK_EVENT_RUNNING as n, WEBHOOK_EVENT_SUCCEEDED as o, WeatherServiceError as p, type WebhookEndpoint as q, WebhookError as r, WebhookNotFoundError as s, type WebhookRegistration as t, WebhookRegistrationError as u, WebhooksService as v, type WebhooksServiceConfig as w, webhookEndpointFromResponse as x };
