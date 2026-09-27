export { jobFromResponse, parseJobStatus } from "./internal/job-response.js";
import { type StatusSweep } from "./internal/status-batch.js";
import { type ParsedResult, type ParseResultOptions } from "./results/router.js";
import type { DownloadResult, DownloadResultsOptions, JobsServiceOptions, SubmitOptions, WaitForCompletionOptions } from "./job-options.js";
export type { BinaryAcknowledgement, DownloadResult, DownloadResultsOptions, JobsServiceOptions, OnPollCallback, SubmitOptions, WaitForCompletionOptions, } from "./job-options.js";
import { type Job, type PreparedSubmission } from "./job-model.js";
import { FacadeSynthesisStore } from "./area/facade-synthesis.js";
export { JobStatus } from "./job-model.js";
export type { Job, PreparedSubmission } from "./job-model.js";
export { STATUS_BATCH_LIMIT } from "./internal/status-batch.js";
export type { StatusSweep } from "./internal/status-batch.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
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
    private capabilityPromise;
    /** `undefined` until the batched status route has been tried once. */
    private batchedStatus;
    private readonly binaryPrepared;
    private readonly geometryUrls;
    private readonly auth;
    private readonly binaryUrlReuse;
    /** Default `consoleLogger`, like every other service in this package. The
     * only line it can emit that an earlier SDK did not is the D70 substitution
     * report — and that is on a body an earlier SDK THREW on, so no working
     * caller starts seeing new output. */
    private readonly logger;
    /** Bodies whose substitution has already been reported. */
    private readonly loggedTreeBoxes;
    /**
     * This client's facade capture and layout cache (`area/facade-synthesis.ts`).
     * Per client, dies with it: no disk, no IndexedDB, no module-global map, and
     * nothing of it reaches an `AreaSchedule`.
     */
    readonly facadeSynthesis: FacadeSynthesisStore;
    constructor(options: JobsServiceOptions);
    /** Decompress and route an already downloaded result archive. */
    decompress(content: Uint8Array, options?: ParseResultOptions): ParsedResult;
    submit(analysisType: string, payload: Readonly<Record<string, unknown>>, options?: SubmitOptions): Promise<Job>;
    prepareSubmission(analysisType: string, payload: Readonly<Record<string, unknown>>, options?: Omit<SubmitOptions, "signal">): PreparedSubmission;
    submitPrepared(prepared: PreparedSubmission, options?: {
        readonly signal?: AbortSignal;
        readonly beforeDispatch?: () => void;
    }): Promise<Job>;
    /**
     * Finish all binary validation and encoding before a paid submission.
     *
     * What it encodes is RETAINED, under this client's byte budget
     * (`internal/binary-retention.ts`), and `submitPrepared` sends exactly those
     * bytes instead of encoding the same body a second time. The submit frees the
     * artifact as soon as its upload has used it; a caller that preflights a
     * whole plan and then does NOT submit some of it must call
     * `releasePreflight` for those — `area/submission.ts` does.
     */
    preflightPrepared(prepared: PreparedSubmission, options?: {
        readonly signal?: AbortSignal;
        readonly retain?: boolean;
    }): Promise<void>;
    /** Free what a preflight is holding for a submission that will not happen. */
    releasePreflight(prepared: PreparedSubmission): void;
    private prepareBinaryValue;
    private getStatusWithSignal;
    getStatus(jobId: string, options?: {
        readonly signal?: AbortSignal;
    }): Promise<Job>;
    /** Whether the batched status route has answered this client at least once.
     *  `false` until it has, and `false` for ever once a gateway has shown it
     *  lacks the route — which is what the area poll reads to choose its
     *  interval (`internal/status-batch.ts`, `docs/DEVIATIONS.md` D121). */
    get batchedStatusSupported(): boolean;
    /** Many job statuses in one request per 50 ids. Ids it could not settle
     *  come back in `unanswered` for the caller to ask about per job; it never
     *  throws for a gateway reason. A gateway that lacks the route is asked
     *  once and never again. */
    getStatusBatch(jobIds: readonly string[], options?: {
        readonly signal?: AbortSignal;
        readonly maxWorkers?: number;
    }): Promise<StatusSweep>;
    private notify;
    waitForCompletion(jobId: string, options?: WaitForCompletionOptions): Promise<Job>;
    private resultsUrl;
    private download;
    downloadResults(jobId: string, options?: DownloadResultsOptions): Promise<DownloadResult>;
}
