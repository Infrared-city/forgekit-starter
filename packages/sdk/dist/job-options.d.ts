import type { AuthResolver } from "./internal/auth.js";
import type { FetchLike } from "./internal/transport.js";
import type { Job } from "./jobs.js";
import type { OnGeometryReuseProbe } from "./internal/geometry-reuse/types.js";
import type { Logger } from "./logger.js";
export type OnPollCallback = (job: Job, attempt: number, elapsed: number, nextDelay: number) => boolean | void | Promise<boolean | void>;
export interface JobsServiceOptions {
    readonly baseUrl: string | URL;
    readonly auth: AuthResolver;
    readonly fetch?: FetchLike;
    readonly timeoutMs?: number;
    readonly downloadTimeoutMs?: number;
    readonly pollIntervalMs?: number;
    readonly backoffCapSeconds?: number;
    readonly gatewayBaseUrl?: string | URL;
    readonly bigPayloadThresholdBytes?: number;
    readonly geometryReuseEnabled?: boolean;
    readonly logger?: Logger;
    readonly onGeometryReuseProbe?: OnGeometryReuseProbe;
    /** Internal: URL reuse is safe only while the credential identity is fixed. */
    readonly binaryUrlReuse?: boolean;
}
export interface DownloadResult {
    readonly content: Uint8Array;
    readonly presignedUrl: string;
    readonly jobId: string;
    readonly contentType: string;
}
export interface BinaryAcknowledgement {
    readonly inputFormat: "irbf";
    readonly resultFormat: "irbf";
    readonly wireVersion: 1;
    readonly artifactDigest: string;
    readonly contentDigest: string;
}
export interface WaitForCompletionOptions {
    readonly timeout?: number;
    readonly onPoll?: OnPollCallback;
    readonly signal?: AbortSignal;
}
export interface DownloadResultsOptions {
    readonly job?: Job;
    readonly signal?: AbortSignal;
}
export interface SubmitOptions {
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
    readonly transport?: "json" | "binary";
    readonly signal?: AbortSignal;
}
