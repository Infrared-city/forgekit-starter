import type { AuthResolver } from "./internal/auth.js";
import type { FetchLike } from "./internal/transport.js";
import type { Job } from "./jobs.js";
import type { OnGeometryReuseProbe } from "./internal/geometry-reuse/types.js";
import type { Logger } from "./logger.js";
import type { GeometryUrlStore } from "./internal/geometry-url-store.js";
/**
 * Callback invoked after every job status read while waiting for a job.
 *
 * It receives the latest `Job`, the attempt number, the seconds elapsed so far
 * and the seconds until the next status read. Return `false` to stop waiting;
 * the job is then returned as it is. Any other return value keeps waiting. An
 * error thrown by the callback does not stop the wait.
 *
 * @category Requests
 */
export type OnPollCallback = (job: Job, attempt: number, elapsed: number, nextDelay: number) => boolean | void | Promise<boolean | void>;
/**
 * Settings for constructing a `JobsService`.
 *
 * @category Client
 */
export interface JobsServiceOptions {
    /** Base URL of the Infrared API. */
    readonly baseUrl: string | URL;
    /** Supplies the authentication headers for each request. */
    readonly auth: AuthResolver;
    /** Custom `fetch` implementation. */
    readonly fetch?: FetchLike;
    /** Timeout for one API request, in milliseconds. Default 180000. */
    readonly timeoutMs?: number;
    /** Timeout for downloading a result archive, in milliseconds. Default 600000. */
    readonly downloadTimeoutMs?: number;
    /** Fixed delay between status reads while waiting, in milliseconds. By default the delay adapts. */
    readonly pollIntervalMs?: number;
    /** Upper limit on the delay between status reads while waiting, in seconds. */
    readonly backoffCapSeconds?: number;
    /** Base URL used for large-payload uploads. Defaults to `baseUrl`. */
    readonly gatewayBaseUrl?: string | URL;
    /**
     * Payload size in bytes above which a submission is uploaded and sent by
     * reference instead of inline. Default 5 MiB.
     */
    readonly bigPayloadThresholdBytes?: number;
    /** Reuse geometry already accepted by the service instead of resending it. Default `true`. */
    readonly geometryReuseEnabled?: boolean;
    /** Where the service writes its warnings. */
    readonly logger?: Logger;
    /**
     * Called when the first submission that references previously sent geometry
     * settles, with the outcome (`supported` or `unsupported`).
     */
    readonly onGeometryReuseProbe?: OnGeometryReuseProbe;
    /**
     * Reuse the links of binary content already uploaded instead of uploading it
     * again. Default `true`.
     */
    readonly binaryUrlReuse?: boolean;
    /** Keeps uploaded geometry URLs for a new client. See `InfraredClientConfig.geometryUrlStore`. */
    readonly geometryUrlStore?: GeometryUrlStore;
}
/**
 * A downloaded result archive.
 *
 * @category Results and legend
 */
export interface DownloadResult {
    /** The archive bytes. */
    readonly content: Uint8Array;
    /** The download URL the archive was fetched from. */
    readonly presignedUrl: string;
    /** Id of the job the results belong to. */
    readonly jobId: string;
    /** Content type reported for the download. */
    readonly contentType: string;
}
/**
 * The service's acknowledgement of a binary submission, carried on the `Job`.
 *
 * @category Requests
 */
export interface BinaryAcknowledgement {
    /** Input format the service accepted. */
    readonly inputFormat: "irbf";
    /** Format the results will be returned in. */
    readonly resultFormat: "irbf" | "json";
    /** Version of the binary wire format. */
    readonly wireVersion: 1;
    /** Digest of the submitted artifact. */
    readonly artifactDigest: string;
    /** Digest of the submitted content. */
    readonly contentDigest: string;
}
/**
 * Options for waiting for a job to finish.
 *
 * @category Requests
 */
export interface WaitForCompletionOptions {
    /** Longest time to wait, in seconds. Default 900. */
    readonly timeout?: number;
    /** Called after every status read; return `false` to stop waiting. */
    readonly onPoll?: OnPollCallback;
    /** Cancels the wait. */
    readonly signal?: AbortSignal;
}
/**
 * Options for downloading a job's results.
 *
 * @category Requests
 */
export interface DownloadResultsOptions {
    /** A job you already fetched; its status is then not read again. */
    readonly job?: Job;
    /** Cancels the download. */
    readonly signal?: AbortSignal;
}
/**
 * Options for submitting a single job.
 *
 * @category Requests
 */
export interface SubmitOptions {
    /** URL that receives webhook notifications for the job. */
    readonly webhookUrl?: string;
    /** Job events that trigger a notification to `webhookUrl`. */
    readonly webhookEvents?: readonly string[];
    /**
     * Transport for the request body: `"binary"` or `"json"`. When unset, binary
     * is used, or JSON for an analysis that has no binary route.
     */
    readonly transport?: "json" | "binary";
    /** Cancels the submission. */
    readonly signal?: AbortSignal;
}
