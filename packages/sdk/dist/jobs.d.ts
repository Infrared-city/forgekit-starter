export { jobFromResponse, parseJobStatus } from "./internal/job-response.js";
import { type BinaryCapability } from "./internal/binary-submission.js";
import { type StatusSweep } from "./internal/status-batch.js";
import { type ParsedResult, type ParseResultOptions } from "./results/router.js";
import type { DownloadResult, DownloadResultsOptions, JobsServiceOptions, SubmitOptions, WaitForCompletionOptions } from "./job-options.js";
export type { BinaryAcknowledgement, DownloadResult, DownloadResultsOptions, JobsServiceOptions, OnPollCallback, SubmitOptions, WaitForCompletionOptions, } from "./job-options.js";
import { type Job, type PreparedSubmission } from "./job-model.js";
import { FacadeCaptures } from "./area/facade-captures.js";
export { JobStatus } from "./job-model.js";
export type { Job, PreparedSubmission } from "./job-model.js";
export { STATUS_BATCH_LIMIT } from "./internal/status-batch.js";
export type { StatusSweep } from "./internal/status-batch.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
/**
 * Submits analysis jobs, reads their status and downloads their results;
 * available as `InfraredClient.jobs`.
 *
 * @category Run an analysis
 */
export declare class JobsService {
    private readonly gateway;
    private readonly uploadGateway;
    private readonly fetch;
    private readonly pollIntervalMs;
    private readonly backoffCapMs;
    private readonly downloadTimeoutMs;
    private readonly requestTimeoutMs;
    private readonly bigPayloadThresholdBytes;
    private readonly geometryReuseEnabled;
    private readonly geometryReuseOptions;
    private readonly capabilities;
    /** `undefined` until the batched status route has been tried once. */
    private batchedStatus;
    private readonly binaryPrepared;
    private readonly geometryUrls;
    private readonly auth;
    private readonly binaryUrlReuse;
    /** Default `consoleLogger`, like every other service in this package. */
    private readonly logger;
    /**
     * This client's facade captures, in one capture store. They live only as long as the
     * client: nothing is written to disk and nothing is saved in an `AreaSchedule`. The client has
     * no `dispose`: call `captures.free()` when you are done with it.
     */
    readonly captures: FacadeCaptures;
    /**
     * @param options - Base URL, credentials and transport settings.
     * @throws {TypeError} when no `fetch` is available or `bigPayloadThresholdBytes` is invalid.
     */
    constructor(options: JobsServiceOptions);
    /** Unpacks a downloaded result archive and returns the parsed result. */
    decompress(content: Uint8Array, options?: ParseResultOptions): ParsedResult;
    /**
     * Prepares and sends one analysis request; returns the accepted `Job`
     * without waiting for it. The request is sent as binary unless
     * `options.transport` is `"json"` or the analysis has no binary route.
     */
    submit(analysisType: string, payload: Readonly<Record<string, unknown>>, options?: SubmitOptions): Promise<Job>;
    /** Validates and encodes a request without sending it; returns the `PreparedSubmission`. */
    prepareSubmission(analysisType: string, payload: Readonly<Record<string, unknown>>, options?: Omit<SubmitOptions, "signal">): PreparedSubmission;
    /** Sends a `PreparedSubmission` and returns the accepted `Job`; the options are used by area runs. */
    submitPrepared(prepared: PreparedSubmission, options?: {
        readonly signal?: AbortSignal;
        readonly beforeDispatch?: () => void;
        /** The upload and POST slots of one area run; unset for a single submit. */
        readonly stages?: {
            readonly uploaded: () => void;
            readonly post: <T>(send: () => Promise<T>) => Promise<T>;
        };
        /** The `Idempotency-Key` that makes a retried send safe; unset for a single submit. */
        readonly idempotencyKey?: string;
    }): Promise<Job>;
    /**
     * Finishes all validation and encoding of a binary submission before any
     * paid request is sent. The encoded bytes are kept (within a memory budget)
     * and `submitPrepared` sends exactly those bytes. If you pre-check a whole
     * plan and then do not submit part of it, call `releasePreflight` for the
     * rest.
     */
    preflightPrepared(prepared: PreparedSubmission, options?: {
        readonly signal?: AbortSignal;
        readonly retain?: boolean;
    }): Promise<void>;
    /** Frees what `preflightPrepared` is holding for a submission that will not happen. */
    releasePreflight(prepared: PreparedSubmission): void;
    /**
     * The API's live capability document, which says whether a model's binary
     * route is available. It is cached for a short time, so repeated calls are
     * cheap.
     */
    binaryCapability(signal?: AbortSignal): Promise<BinaryCapability>;
    private getStatusWithSignal;
    /** Reads one job's status. */
    getStatus(jobId: string, options?: {
        readonly signal?: AbortSignal;
    }): Promise<Job>;
    /**
     * Whether the API's route for reading many job statuses at once has
     * answered this client. `false` until it has, and for good once the API
     * shows it lacks the route; area runs use it to choose their poll interval.
     */
    get batchedStatusSupported(): boolean;
    /**
     * Reads many job statuses at once, 50 ids per request. Ids it could not
     * settle come back in `unanswered` for you to ask about one by one; it does
     * not throw because of an API problem. An API without the route is asked
     * once and never again.
     */
    getStatusBatch(jobIds: readonly string[], options?: {
        readonly signal?: AbortSignal;
        readonly maxWorkers?: number;
    }): Promise<StatusSweep>;
    /**
     * Polls a job until it succeeds or fails. `options.timeout` is in seconds
     * (default 900).
     *
     * @returns The finished `Job`.
     * @throws {JobFailedError} when the job fails.
     * @throws {JobTimeoutError} when the timeout passes first.
     * @throws {JobAbortedError} when `options.signal` aborts the wait.
     */
    waitForCompletion(jobId: string, options?: WaitForCompletionOptions): Promise<Job>;
    private resultsUrl;
    private download;
    /**
     * Downloads the result archive of a finished job, retrying a failed
     * download a few times. Pass `options.job` to skip reading the status.
     *
     * @throws {JobNotCompletedError} when the job has not succeeded.
     * @throws {TypeError} when `options.job` is a different job.
     */
    downloadResults(jobId: string, options?: DownloadResultsOptions): Promise<DownloadResult>;
}
