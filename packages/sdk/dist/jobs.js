import { jobFromResponse } from "./internal/job-response.js";
export { jobFromResponse, parseJobStatus } from "./internal/job-response.js";
import { requireTimeout } from "./internal/deadline.js";
import { waitForJob } from "./internal/wait-job.js";
import { defaultTransport } from "./internal/transport-choice.js";
import { resolveFetch } from "./internal/fetch.js";
import { downloadPresigned } from "./internal/download.js";
import { pauseBeforeRetry, shouldRetryDownload, } from "./internal/download-retry.js";
import { parseResultsLink } from "./internal/link.js";
import { prepareSubmissionBody } from "./internal/submit-body.js";
import { submitArchive } from "./internal/submission.js";
import { preparedJsonBytes } from "./internal/prepared-json.js";
import { GatewayTransport } from "./internal/transport.js";
import { requireCore } from "./internal/core.js";
import { tryGeometryReuse } from "./internal/geometry-reuse/controller.js";
import { buildGeometryReuseOptions } from "./internal/geometry-reuse/options.js";
import { prepareBinary } from "./internal/binary-submission.js";
import { CapabilityCache } from "./internal/capability-cache.js";
import { treeBoxCollisionLine, treeBoxLogLine, treeBoxOutOfTileLine } from "./internal/tree-boxes.js";
import { consoleLogger } from "./logger.js";
import { withBinaryAdmission } from "./internal/binary-admission.js";
import { BinaryUrlCache } from "./internal/binary-url-cache.js";
import { BinaryRetention } from "./internal/binary-retention.js";
import { fetchStatusBatch } from "./internal/status-batch.js";
import { submitPreparedBinary } from "./internal/binary-submit-coordinator.js";
import { parseResultArchive, } from "./results/router.js";
import { JobNotCompletedError, } from "./job-errors.js";
import { JobStatus, requireJobId, withTreeBoxes, } from "./job-model.js";
import { FacadeSynthesisStore } from "./area/facade-synthesis.js";
export { JobStatus } from "./job-model.js";
export { STATUS_BATCH_LIMIT } from "./internal/status-batch.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
const BIG_PAYLOAD_THRESHOLD_BYTES = 5 * 1024 * 1024;
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
    /** `undefined` until the batched status route has been tried once. */
    batchedStatus;
    binaryPrepared = new BinaryRetention();
    geometryUrls;
    auth;
    binaryUrlReuse;
    /** Default `consoleLogger`, like every other service in this package. The
     * only line it can emit that an earlier SDK did not is the D70 substitution
     * report — and that is on a body an earlier SDK THREW on, so no working
     * caller starts seeing new output. */
    logger;
    /** Bodies whose substitution has already been reported. */
    loggedTreeBoxes = new WeakSet();
    /**
     * This client's facade capture and layout cache (`area/facade-synthesis.ts`).
     * Per client, dies with it: no disk, no IndexedDB, no module-global map, and
     * nothing of it reaches an `AreaSchedule`.
     */
    facadeSynthesis = new FacadeSynthesisStore();
    constructor(options) {
        const fetcher = resolveFetch(options.fetch);
        if (typeof fetcher !== "function")
            throw new TypeError("a fetch implementation is required");
        this.fetch = fetcher;
        this.pollIntervalMs = options.pollIntervalMs;
        if (this.pollIntervalMs !== undefined)
            requireTimeout(this.pollIntervalMs);
        // Legacy option: it now caps the healthy poll interval only (D213).
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
        this.logger = options.logger ?? consoleLogger;
        this.geometryUrls = new BinaryUrlCache(this.binaryUrlReuse);
        this.auth = options.auth;
        if (!Number.isSafeInteger(this.bigPayloadThresholdBytes) || this.bigPayloadThresholdBytes < 0) {
            throw new TypeError("bigPayloadThresholdBytes must be a non-negative safe integer");
        }
        this.gateway = new GatewayTransport(options);
        this.capabilities = new CapabilityCache(this.gateway);
        this.geometryReuseEnabled = options.geometryReuseEnabled ?? true;
        this.geometryReuseOptions = buildGeometryReuseOptions(options, this.fetch, this.bigPayloadThresholdBytes, this.requestTimeoutMs);
        this.uploadGateway = new GatewayTransport({
            ...options,
            baseUrl: options.gatewayBaseUrl ?? options.baseUrl,
        });
    }
    /** Decompress and route an already downloaded result archive. */
    decompress(content, options) {
        return parseResultArchive(content, options);
    }
    async submit(analysisType, payload, options = {}) {
        const prepared = this.prepareSubmission(analysisType, payload, options);
        return this.submitPrepared(prepared, options.signal === undefined ? {} : { signal: options.signal });
    }
    prepareSubmission(analysisType, payload, options = {}) {
        // D196: binary unless the caller asks for JSON or the analysis has no binary route.
        const transport = options.transport ?? defaultTransport(analysisType);
        if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
            throw new TypeError("unsupported option binaryResults; use transport instead");
        }
        // The tree -> box substitution does NOT happen here: it is decided by the
        // model's live `/binary/v1/capabilities` document, which this method has
        // not read and must not block on. `prepareBinary` does it once the
        // capability is in hand (D70).
        return { analysisType, transport,
            body: prepareSubmissionBody(analysisType, payload, options) };
    }
    async submitPrepared(prepared, options = {}) {
        if (prepared.transport === "binary" && prepared.interiorBinary !== undefined) {
            // An interior binary part (D228, `parts/interior-binary.ts`): the
            // scene and this part's control are already prepared, so this skips
            // `prepareBinaryValue`/`prepareBinary` (the outdoor route's own
            // geometry-group split) entirely and asks for the result family the
            // run chose (JSON, or the binary daylight result, D234).
            const binary = prepared.interiorBinary;
            return submitPreparedBinary({ prepared, parseJob: jobFromResponse,
                prepare: async () => binary,
                releasePrepared: () => undefined,
                gateway: this.gateway, uploadGateway: this.uploadGateway, auth: this.auth,
                fetch: this.fetch, timeoutMs: this.requestTimeoutMs,
                urlCache: this.geometryUrls, reuseEnabled: this.binaryUrlReuse,
                resultFormat: prepared.interiorResultFormat ?? "json",
                ...(options.idempotencyKey === undefined ? {} : { idempotencyKey: options.idempotencyKey }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
                ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
                ...(options.uploads === undefined ? {} : { uploads: options.uploads }),
            });
        }
        if (prepared.transport === "binary") {
            // The substitution record lives on the PREPARED BINARY, because that is
            // what `prepareBinary` builds after the capability document decided
            // whether to box at all. Captured here so the accepted `Job` carries it.
            let binary;
            const parseJob = (response) => withTreeBoxes(jobFromResponse(response), binary);
            return submitPreparedBinary({ prepared, parseJob,
                prepare: async (fresh) => {
                    if (!fresh) {
                        const retained = this.binaryPrepared.get(prepared);
                        if (retained !== undefined) {
                            binary = retained;
                            return retained;
                        }
                    }
                    binary = await this.prepareBinaryValue(prepared, options.signal);
                    return binary;
                },
                releasePrepared: () => this.binaryPrepared.release(prepared),
                gateway: this.gateway, uploadGateway: this.uploadGateway, auth: this.auth,
                fetch: this.fetch, timeoutMs: this.requestTimeoutMs,
                urlCache: this.geometryUrls, reuseEnabled: this.binaryUrlReuse,
                ...(options.signal === undefined ? {} : { signal: options.signal }),
                ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
                ...(options.uploads === undefined ? {} : { uploads: options.uploads }),
                ...(options.idempotencyKey === undefined ? {} : { idempotencyKey: options.idempotencyKey }),
            });
        }
        if (this.geometryReuseEnabled) {
            const reused = await tryGeometryReuse(prepared, this.geometryReuseOptions, options.signal, options.beforeDispatch, options.idempotencyKey);
            if (reused !== undefined)
                return reused;
        }
        const json = preparedJsonBytes(prepared);
        const archive = requireCore().zipPayloadJson(json);
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
    async preflightPrepared(prepared, options = {}) {
        if (prepared.transport !== "binary" || this.binaryPrepared.get(prepared) !== undefined)
            return;
        const binary = await withBinaryAdmission(() => this.prepareBinaryValue(prepared, options.signal), options.signal);
        if (options.retain !== false)
            this.binaryPrepared.keep(prepared, binary);
    }
    /** Free what a preflight is holding for a submission that will not happen. */
    releasePreflight(prepared) {
        this.binaryPrepared.release(prepared);
    }
    /**
     * The live `/binary/v1/capabilities` document, cached for
     * `CAPABILITY_TTL_MS` (`internal/capability-cache.ts`). A caller that only
     * needs to know whether a model's binary route is live — the daylight-
     * factor parts auto-routing (D228), among others — reads this instead of
     * guessing from a submission outcome.
     */
    async binaryCapability(signal) {
        return this.capabilities.get(signal);
    }
    async prepareBinaryValue(prepared, signal) {
        const binary = await prepareBinary(prepared, await this.capabilities.get(signal));
        // One line per substitution, on the first preparation of this body: a
        // re-encode for a retry describes the same boxes.
        if (binary.treeBoxes !== undefined && !this.loggedTreeBoxes.has(prepared)) {
            this.loggedTreeBoxes.add(prepared);
            this.logger.info(treeBoxLogLine(binary.treeBoxes));
            if (binary.treeBoxes.idCollisions.length > 0) {
                this.logger.warn(treeBoxCollisionLine(binary.treeBoxes));
            }
            if (binary.treeBoxes.outsideTile > 0) {
                this.logger.warn(treeBoxOutOfTileLine(binary.treeBoxes));
            }
        }
        return binary;
    }
    async getStatusWithSignal(jobId, signal) {
        const id = requireJobId(jobId);
        const response = await this.gateway.requestJson(`/async/jobs/${encodeURIComponent(id)}`, signal === undefined ? {} : { signal });
        const job = jobFromResponse(response);
        if (job.jobId !== id)
            throw new Error("job response ID does not match requested jobId");
        return job;
    }
    async getStatus(jobId, options = {}) {
        return this.getStatusWithSignal(jobId, options.signal);
    }
    /** Whether the batched status route has answered this client at least once.
     *  `false` until it has, and `false` for ever once a gateway has shown it
     *  lacks the route — which is what the area poll reads to choose its
     *  interval (`internal/status-batch.ts`, `docs/DEVIATIONS.md` D121). */
    get batchedStatusSupported() { return this.batchedStatus === true; }
    /** Many job statuses in one request per 50 ids. Ids it could not settle
     *  come back in `unanswered` for the caller to ask about per job; it never
     *  throws for a gateway reason. A gateway that lacks the route is asked
     *  once and never again. */
    async getStatusBatch(jobIds, options = {}) {
        const ids = jobIds.map(requireJobId);
        if (this.batchedStatus === false) {
            return { statuses: new Map(), unanswered: [...ids], batched: false, lacking: true };
        }
        const sweep = await fetchStatusBatch(this.gateway, ids, { ...options, routeProven: this.batchedStatus === true });
        // Only a chunk that actually answered settles the question. A sweep that
        // merely failed leaves the verdict where it found it.
        if (sweep.lacking)
            this.batchedStatus = false;
        else if (sweep.batched)
            this.batchedStatus = true;
        return sweep;
    }
    /** Poll until the job is terminal, on the SDK's one poll engine
     *  (`internal/wait-job.ts`, D213). */
    async waitForCompletion(jobId, options = {}) {
        return waitForJob(requireJobId(jobId), options, {
            // One job: `GET /async/jobs/{id}`. A batch of one saves nothing, and a
            // gateway without the batched route answers `?ids=` with the whole
            // account listing (~70 KB, ~0.9 s).
            status: (id, signal) => this.getStatusWithSignal(id, signal),
            fixedIntervalS: this.pollIntervalMs === undefined ? undefined : this.pollIntervalMs / 1_000,
            maxIntervalS: this.backoffCapMs === undefined ? undefined : this.backoffCapMs / 1_000,
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
    async downloadResults(jobId, options = {}) {
        const id = requireJobId(jobId);
        if (options.job !== undefined && options.job.jobId !== id) {
            throw new TypeError("supplied job ID does not match requested jobId");
        }
        const job = options.job ?? await this.getStatusWithSignal(id, options.signal);
        if (job.status !== JobStatus.Succeeded)
            throw new JobNotCompletedError(id, job.status);
        // Every attempt mints a fresh presign: the link is cheap, idempotent, and
        // an expired one is itself one of the failures worth retrying. The kernel
        // decides whether to go on (D224).
        for (let sendsDone = 1;; sendsDone += 1) {
            try {
                const presignedUrl = await this.resultsUrl(id, options.signal);
                const downloaded = await this.download(presignedUrl, options.signal);
                return { ...downloaded, jobId: id, presignedUrl };
            }
            catch (error) {
                if (!shouldRetryDownload(error, sendsDone))
                    throw error;
                await pauseBeforeRetry(sendsDone, error, options.signal);
            }
        }
    }
}
