import { jobFromResponse, JobResponseMismatchError } from "./internal/job-response.js";
export { jobFromResponse, parseJobStatus } from "./internal/job-response.js";
import { requireTimeout } from "./internal/deadline.js";
import { waitForJob } from "./internal/wait-job.js";
import { warnPollIntervalDeprecated } from "./internal/poll-interval-deprecation.js";
import { defaultTransport } from "./internal/transport-choice.js";
import { resolveFetch } from "./internal/fetch.js";
import { downloadPresigned } from "./internal/download.js";
import { downloadWithRetries } from "./internal/download-retry.js";
import { parseResultsLink } from "./internal/link.js";
import { prepareSubmissionBody } from "./internal/submit-body.js";
import { submitArchive } from "./internal/submission.js";
import { preparedJsonBytes } from "./internal/prepared-json.js";
import { GatewayTransport } from "./internal/transport.js";
import { zipPayload } from "./internal/zip-payload.js";
import { tryGeometryReuse } from "./internal/geometry-reuse/controller.js";
import { buildGeometryReuseOptions } from "./internal/geometry-reuse/options.js";
import { prepareBinary } from "./internal/binary-submission.js";
import { CapabilityCache } from "./internal/capability-cache.js";
import { consoleLogger } from "./logger.js";
import { withBinaryAdmission } from "./internal/binary-admission.js";
import { BinaryUrlCache } from "./internal/binary-url-cache.js";
import { geometryUrlStoreGate } from "./internal/geometry-url-store.js";
import { BinaryRetention } from "./internal/binary-retention.js";
import { fetchStatusBatch } from "./internal/status-batch.js";
import { prepareBinaryEnvelope, submitPreparedBinary, } from "./internal/binary-submit-coordinator.js";
import { dispatchKeyed } from "./internal/idempotent-dispatch.js";
import { parseResultArchive, } from "./results/router.js";
import { JobNotCompletedError } from "./job-errors.js";
import { JobStatus, requireJobId, } from "./job-model.js";
import { FacadeCaptures } from "./area/facade-captures.js";
export { JobStatus } from "./job-model.js";
export { STATUS_BATCH_LIMIT } from "./internal/status-batch.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
const BIG_PAYLOAD_THRESHOLD_BYTES = 5 * 1024 * 1024;
/**
 * Submits analysis jobs, reads their status and downloads their results;
 * available as `InfraredClient.jobs`.
 *
 * @category Run an analysis
 */
export class JobsService {
    gateway;
    uploadGateway;
    fetch;
    pollIntervalMs;
    backoffCapMs;
    downloadTimeoutMs;
    requestTimeoutMs;
    bigPayloadThresholdBytes;
    geometryReuseEnabled;
    geometryReuseOptions;
    capabilities;
    /** What `getStatusBatch` learned of the batched route (1.0.0 behaviour); unset: not known. */
    batchedStatus;
    binaryPrepared = new BinaryRetention();
    geometryUrls;
    auth;
    binaryUrlReuse;
    /** Area runs send their binary jobs in batch submits when the API offers them (`JobsServiceOptions.batchSubmit`). */
    batchSubmit;
    /** Default `consoleLogger`, like every other service in this package. */
    logger;
    /**
     * This client's facade captures, in one capture store. They live only as long as the
     * client: nothing is written to disk and nothing is saved in an `AreaSchedule`. The client has
     * no `dispose`: call `captures.free()` when you are done with it.
     */
    // Maintainer note (not published): see area/facade-captures.ts. No disk,
    // no IndexedDB, no module-global map.
    captures = new FacadeCaptures();
    /**
     * @param options - Base URL, credentials and transport settings.
     * @throws {TypeError} when no `fetch` is available or `bigPayloadThresholdBytes` is invalid.
     */
    constructor(options) {
        const fetcher = resolveFetch(options.fetch);
        if (typeof fetcher !== "function")
            throw new TypeError("a fetch implementation is required");
        this.fetch = fetcher;
        this.pollIntervalMs = options.pollIntervalMs;
        if (this.pollIntervalMs !== undefined) {
            requireTimeout(this.pollIntervalMs);
            warnPollIntervalDeprecated(options.logger ?? consoleLogger);
        }
        const backoffCapSeconds = options.backoffCapSeconds;
        if (backoffCapSeconds !== undefined)
            requireTimeout(backoffCapSeconds * 1_000);
        this.backoffCapMs = backoffCapSeconds === undefined ? undefined : backoffCapSeconds * 1_000;
        this.downloadTimeoutMs = options.downloadTimeoutMs ?? 600_000;
        requireTimeout(this.downloadTimeoutMs);
        this.requestTimeoutMs = options.timeoutMs ?? 180_000;
        requireTimeout(this.requestTimeoutMs);
        this.bigPayloadThresholdBytes = options.bigPayloadThresholdBytes ?? BIG_PAYLOAD_THRESHOLD_BYTES;
        this.binaryUrlReuse = options.binaryUrlReuse !== false;
        this.batchSubmit = options.batchSubmit !== false;
        this.logger = options.logger ?? consoleLogger;
        const urlStore = geometryUrlStoreGate(options.geometryUrlStore, this.logger, this.requestTimeoutMs);
        this.geometryUrls = new BinaryUrlCache(this.binaryUrlReuse, Date.now, urlStore);
        this.auth = options.auth;
        if (!Number.isSafeInteger(this.bigPayloadThresholdBytes) || this.bigPayloadThresholdBytes < 0) {
            throw new TypeError("bigPayloadThresholdBytes must be a non-negative safe integer");
        }
        this.gateway = new GatewayTransport(options);
        this.capabilities = new CapabilityCache(this.gateway);
        this.geometryReuseEnabled = options.geometryReuseEnabled ?? true;
        this.geometryReuseOptions = buildGeometryReuseOptions(options, this.fetch, this.bigPayloadThresholdBytes, this.requestTimeoutMs, urlStore);
        this.uploadGateway = new GatewayTransport({
            ...options,
            baseUrl: options.gatewayBaseUrl ?? options.baseUrl,
        });
    }
    /** Unpacks a downloaded result archive and returns the parsed result. */
    decompress(content, options) {
        return parseResultArchive(content, options);
    }
    /**
     * Prepares and sends one analysis request; returns the accepted `Job`
     * without waiting for it. The request is sent as binary unless
     * `options.transport` is `"json"` or the analysis has no binary route.
     */
    // Maintainer note (not published): binary-by-default routing is D196.
    async submit(analysisType, payload, options = {}) {
        const prepared = this.prepareSubmission(analysisType, payload, options);
        return this.submitPrepared(prepared, options.signal === undefined ? {} : { signal: options.signal });
    }
    /** Validates and encodes a request without sending it; returns the `PreparedSubmission`. */
    prepareSubmission(analysisType, payload, options = {}) {
        // D196: binary unless the caller asks for JSON or the analysis has no binary route.
        const transport = options.transport ?? defaultTransport(analysisType);
        if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
            throw new TypeError("unsupported option binaryResults; use transport instead");
        }
        return { analysisType, transport,
            body: prepareSubmissionBody(analysisType, payload, options) };
    }
    /** Sends a `PreparedSubmission` and returns the accepted `Job`; the options are used by area runs. */
    async submitPrepared(prepared, options = {}) {
        if (prepared.transport === "binary" && prepared.interiorBinary !== undefined) {
            // An interior binary part (D228, `parts/interior-binary.ts`): the
            // scene and this part's control are already prepared, so this skips
            // `prepareBinary` (the outdoor route's own
            // geometry-group split) entirely and asks for the result family the
            // run chose (JSON, or the binary daylight result, D234).
            const binary = prepared.interiorBinary;
            return submitPreparedBinary({ ...this.binaryOptions(prepared, options, async () => binary, () => undefined),
                resultFormat: prepared.interiorResultFormat ?? "json" });
        }
        if (prepared.transport === "binary")
            return submitPreparedBinary(await this.outdoorBinary(prepared, options));
        if (this.geometryReuseEnabled) {
            const reused = await tryGeometryReuse(prepared, this.geometryReuseOptions, options.signal, options.beforeDispatch, options.idempotencyKey);
            if (reused !== undefined)
                return reused;
        }
        const json = preparedJsonBytes(prepared);
        const archive = await zipPayload(json);
        return submitArchive({
            endpointPath: `/async/${encodeURIComponent(prepared.analysisType)}`,
            archive,
            gateway: this.gateway,
            uploadGateway: this.uploadGateway,
            fetch: this.fetch,
            thresholdBytes: this.bigPayloadThresholdBytes,
            timeoutMs: this.requestTimeoutMs,
            parseAccepted: jobFromResponse,
            ...(options.idempotencyKey === undefined ? {} : { idempotencyKey: options.idempotencyKey }),
            ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
    }
    /** The options of one binary submission of this client. */
    binaryOptions(prepared, options, prepare, releasePrepared) {
        return { prepared, parseJob: jobFromResponse, prepare, releasePrepared,
            gateway: this.gateway, uploadGateway: this.uploadGateway, auth: this.auth,
            fetch: this.fetch, timeoutMs: this.requestTimeoutMs,
            urlCache: this.geometryUrls, reuseEnabled: this.binaryUrlReuse,
            ...(options.idempotencyKey === undefined ? {} : { idempotencyKey: options.idempotencyKey }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
            ...(options.stages === undefined ? {} : { stages: options.stages }) };
    }
    /** An outdoor binary submission: the encode and the URL reuse of this client. */
    async outdoorBinary(prepared, options) {
        // The capability GET is network I/O: it runs before the encode admission
        // (#816, D277), never inside it. It is cached, so most calls read memory.
        const supported = await this.capabilities.get(options.signal);
        const prepare = async (fresh) => (fresh ? undefined : this.binaryPrepared.get(prepared)) ?? prepareBinary(prepared, supported);
        return this.binaryOptions(prepared, options, prepare, () => this.binaryPrepared.release(prepared));
    }
    /** @internal Batch submit: one outdoor binary request, uploaded, not POSTed; else `undefined`. */
    async prepareBatchItem(prepared, options = {}) {
        if (prepared.transport !== "binary" || prepared.interiorBinary !== undefined)
            return undefined;
        return prepareBinaryEnvelope(await this.outdoorBinary(prepared, options));
    }
    /** @internal ONE POST of a batch body the run engine wrote; an HTTP error is returned. */
    postBatch(body, options = {}) {
        return dispatchKeyed({ gateway: this.gateway, endpointPath: "/binary/v1/async-batch",
            body: new TextEncoder().encode(body), headers: { "Content-Type": "application/json" }, ...options });
    }
    /**
     * Finishes all validation and encoding of a binary submission before any
     * paid request is sent. The encoded bytes are kept (within a memory budget)
     * and `submitPrepared` sends exactly those bytes. If you pre-check a whole
     * plan and then do not submit part of it, call `releasePreflight` for the
     * rest.
     */
    // Maintainer note (not published): the retained bytes live under this
    // client's byte budget (internal/binary-retention.ts); a submit frees the
    // artifact as soon as its upload has used it; area/submission.ts calls
    // `releasePreflight` for what it does not submit.
    async preflightPrepared(prepared, options = {}) {
        if (prepared.transport !== "binary" || this.binaryPrepared.get(prepared) !== undefined)
            return;
        const supported = await this.capabilities.get(options.signal);
        const binary = await withBinaryAdmission(() => prepareBinary(prepared, supported), options.signal);
        if (options.retain !== false)
            this.binaryPrepared.keep(prepared, binary);
    }
    /** Frees what `preflightPrepared` is holding for a submission that will not happen. */
    releasePreflight(prepared) {
        this.binaryPrepared.release(prepared);
    }
    /**
     * The API's live capability document, which says whether a model's binary
     * route is available. It is cached for a short time, so repeated calls are
     * cheap.
     */
    // Maintainer note (not published): `/binary/v1/capabilities`, cached for
    // `CAPABILITY_TTL_MS` (internal/capability-cache.ts). Read by the
    // daylight-factor parts auto-routing (D228), among others, instead of
    // guessing from a submission outcome.
    async binaryCapability(signal) {
        return this.capabilities.get(signal);
    }
    async getStatusWithSignal(jobId, signal) {
        const id = requireJobId(jobId);
        const response = await this.gateway.requestJson(`/async/jobs/${encodeURIComponent(id)}`, signal === undefined ? {} : { signal });
        const job = jobFromResponse(response);
        if (job.jobId !== id)
            throw new JobResponseMismatchError();
        return job;
    }
    /** Reads one job's status. */
    async getStatus(jobId, options = {}) {
        return this.getStatusWithSignal(jobId, options.signal);
    }
    /**
     * Whether the API's route for reading many job statuses at once has answered this client.
     * `false` until it has, and for good once the API shows it lacks the route.
     */
    get batchedStatusSupported() { return this.batchedStatus === true; }
    /**
     * Reads many job statuses at once, 50 ids per request. Ids it could not
     * settle come back in `unanswered` for you to ask about one by one; it does
     * not throw because of an API problem. An API without the route is asked
     * once and never again.
     */
    async getStatusBatch(jobIds, options = {}) {
        const ids = jobIds.map(requireJobId);
        if (this.batchedStatus === false) {
            return { statuses: new Map(), unanswered: [...ids], batched: false, lacking: true };
        }
        const sweep = await fetchStatusBatch(this.gateway, ids, options);
        // Only a chunk that answered settles it; a sweep that merely failed does not.
        if (sweep.lacking)
            this.batchedStatus = false;
        else if (sweep.batched)
            this.batchedStatus = true;
        return sweep;
    }
    /**
     * Waits for a job to succeed or fail: one `GET /async/jobs/{id}` 1 s after
     * the call, then every 1 s until 10 s, then every 2 s. After HTTP 429, a 5xx
     * or a network error it backs off (at most 30 s, never shorter than
     * `Retry-After`). `options.timeout` is in seconds (default 900).
     *
     * @returns The finished `Job`.
     * @throws {JobFailedError} when the job fails.
     * @throws {JobTimeoutError} when the timeout passes first.
     * @throws {JobAbortedError} when `options.signal` aborts the wait.
     * @throws {JobPollError} when a status request is refused for good (for example 401 or 404).
     */
    // Maintainer note (not published): the kernel `JobWait` (internal/wait-job.ts).
    async waitForCompletion(jobId, options = {}) {
        return waitForJob(requireJobId(jobId), options, {
            // One job: `GET /async/jobs/{id}`. A batch of one saves nothing, and a
            // gateway without the batched route answers `?ids=` with the whole
            // account listing (~70 KB, ~0.9 s).
            status: (id, signal) => this.getStatusWithSignal(id, signal),
            intervalUs: this.pollIntervalMs === undefined ? undefined : Math.round(this.pollIntervalMs * 1_000),
            intervalCapUs: this.backoffCapMs === undefined ? undefined : Math.round(this.backoffCapMs * 1_000),
        });
    }
    async resultsUrl(jobId, signal) {
        const response = await this.gateway.requestBytesWithHeaders(`/async/jobs/${encodeURIComponent(jobId)}/results`, signal === undefined ? {} : { signal });
        return parseResultsLink(response.headers.get("Link"));
    }
    download(url, signal) {
        return downloadPresigned(url, {
            fetch: this.fetch,
            timeoutMs: this.downloadTimeoutMs,
            ...(signal === undefined ? {} : { signal }),
        });
    }
    /**
     * Downloads the result archive of a finished job, retrying a failed
     * download a few times (each try with a fresh link). Pass `options.job` to
     * skip reading the status.
     *
     * @throws {JobNotCompletedError} when the job has not succeeded.
     * @throws {TypeError} when `options.job` is a different job.
     */
    async downloadResults(jobId, options = {}) {
        const id = await this.downloadable(jobId, options);
        // The tries and waits are the kernel engine's (D290), as in an area run.
        return downloadWithRetries(id, (signal) => this.downloadOnce(id, signal), options.signal);
    }
    /** @internal One try of `downloadResults`: the run engine retries an area run's downloads. */
    async downloadResultsOnce(jobId, options = {}) {
        const id = await this.downloadable(jobId, options);
        return this.downloadOnce(id, options.signal);
    }
    async downloadable(jobId, options) {
        const id = requireJobId(jobId);
        if (options.job !== undefined && options.job.jobId !== id) {
            throw new TypeError("supplied job ID does not match requested jobId");
        }
        const job = options.job ?? await this.getStatusWithSignal(id, options.signal);
        if (job.status !== JobStatus.Succeeded)
            throw new JobNotCompletedError(id, job.status);
        return id;
    }
    async downloadOnce(id, signal) {
        const presignedUrl = await this.resultsUrl(id, signal);
        const downloaded = await this.download(presignedUrl, signal);
        return { ...downloaded, jobId: id, presignedUrl };
    }
}
