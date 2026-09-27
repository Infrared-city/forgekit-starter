import { jobFromResponse } from "./internal/job-response.js";
export { jobFromResponse, parseJobStatus } from "./internal/job-response.js";
import { Deadline, delay, requireTimeout } from "./internal/deadline.js";
import { resolveFetch } from "./internal/fetch.js";
import { downloadPresigned } from "./internal/download.js";
import { DOWNLOAD_RETRY_ATTEMPTS, isRetryableDownloadError, pauseBeforeRetry, } from "./internal/download-retry.js";
import { parseResultsLink } from "./internal/link.js";
import { prepareSubmissionBody } from "./internal/submit-body.js";
import { submitArchive } from "./internal/submission.js";
import { jsonWireBytes } from "./internal/wire-json.js";
import { GatewayTransport, TransportError } from "./internal/transport.js";
import { requireCore } from "./internal/core.js";
import { tryGeometryReuse } from "./internal/geometry-reuse/controller.js";
import { buildGeometryReuseOptions } from "./internal/geometry-reuse/options.js";
import { capability, prepareBinary } from "./internal/binary-submission.js";
import { treeBoxCollisionLine, treeBoxLogLine, treeBoxOutOfTileLine } from "./internal/tree-boxes.js";
import { consoleLogger } from "./logger.js";
import { withBinaryAdmission } from "./internal/binary-admission.js";
import { BinaryUrlCache } from "./internal/binary-url-cache.js";
import { BinaryRetention } from "./internal/binary-retention.js";
import { fetchStatusBatch } from "./internal/status-batch.js";
import { submitPreparedBinary } from "./internal/binary-submit-coordinator.js";
import { parseResultArchive, } from "./results/router.js";
import { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
import { JobStatus, requireJobId, withTreeBoxes, } from "./job-model.js";
import { FacadeSynthesisStore } from "./area/facade-synthesis.js";
export { JobStatus } from "./job-model.js";
export { STATUS_BATCH_LIMIT } from "./internal/status-batch.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./job-errors.js";
const DEFAULT_POLL_TIMEOUT_SECONDS = 300;
const BACKOFF_BASE_MS = 2_000;
const BACKOFF_FLOOR_MS = 500;
const BACKOFF_CAP_SECONDS = 10;
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
    capabilityPromise;
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
        const backoffCapSeconds = options.backoffCapSeconds ?? BACKOFF_CAP_SECONDS;
        requireTimeout(backoffCapSeconds * 1_000);
        this.backoffCapMs = backoffCapSeconds * 1_000;
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
        const transport = options.transport ?? "json";
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
            });
        }
        if (this.geometryReuseEnabled) {
            const reused = await tryGeometryReuse(prepared, this.geometryReuseOptions, options.signal, options.beforeDispatch);
            if (reused !== undefined)
                return reused;
        }
        let json;
        try {
            // `JSON.stringify` bytes; area groups come from the arena (`wire-json.ts`).
            const bytes = jsonWireBytes(prepared.body, (_key, value) => ArrayBuffer.isView(value) ? Array.from(value) : value);
            if (bytes === undefined)
                throw new TypeError("request has no JSON wire form");
            json = bytes;
        }
        catch {
            throw new TransportError("job request is not JSON serializable", "pre-dispatch", "validation", "POST");
        }
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
    async prepareBinaryValue(prepared, signal) {
        this.capabilityPromise ??= capability(this.gateway, signal).catch((error) => {
            this.capabilityPromise = undefined;
            throw error;
        });
        const binary = await prepareBinary(prepared, await this.capabilityPromise);
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
        const sweep = await fetchStatusBatch(this.gateway, ids, options);
        // Only a chunk that actually answered settles the question. A sweep that
        // merely failed leaves the verdict where it found it.
        if (sweep.lacking)
            this.batchedStatus = false;
        else if (sweep.batched)
            this.batchedStatus = true;
        return sweep;
    }
    async notify(deadline, callback, job, attempt, elapsed, nextDelay) {
        if (callback === undefined)
            return undefined;
        try {
            return await deadline.wait(() => Promise.resolve(callback(job, attempt, elapsed, nextDelay)));
        }
        catch (error) {
            if (deadline.reason() !== undefined)
                throw error;
            // Preserve the legacy callback contract: observer failures do not stop polling.
            return undefined;
        }
    }
    async waitForCompletion(jobId, options = {}) {
        const id = requireJobId(jobId);
        const timeoutSeconds = options.timeout ?? DEFAULT_POLL_TIMEOUT_SECONDS;
        requireTimeout(timeoutSeconds * 1_000);
        const deadline = new Deadline(options.signal, timeoutSeconds * 1_000);
        const startedAt = performance.now();
        let attempt = 0;
        try {
            while (true) {
                const job = await deadline.wait(() => this.getStatusWithSignal(id, deadline.controller.signal));
                const terminal = job.status === JobStatus.Succeeded || job.status === JobStatus.Failed;
                const elapsed = (performance.now() - startedAt) / 1_000;
                const delayMs = this.pollIntervalMs ?? Math.max(BACKOFF_FLOOR_MS, Math.random() * Math.min(this.backoffCapMs, BACKOFF_BASE_MS * 2 ** attempt));
                const nextDelay = terminal ? 0 : delayMs / 1_000;
                const keepGoing = await this.notify(deadline, options.onPoll, job, attempt, elapsed, nextDelay);
                if (keepGoing === false)
                    return job;
                if (job.status === JobStatus.Succeeded)
                    return job;
                if (job.status === JobStatus.Failed)
                    throw new JobFailedError(id, job.error ?? "");
                attempt += 1;
                await deadline.wait(() => delay(delayMs, deadline.controller.signal));
            }
        }
        catch (error) {
            const stopped = deadline.reason();
            if (stopped !== undefined) {
                throw stopped === "timeout" ? new JobTimeoutError(id) : new JobAbortedError(id);
            }
            throw error;
        }
        finally {
            deadline.close();
        }
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
        // an expired one is itself one of the failures worth retrying.
        for (let attempt = 0;; attempt += 1) {
            const presignedUrl = await this.resultsUrl(id, options.signal);
            try {
                const downloaded = await this.download(presignedUrl, options.signal);
                return { ...downloaded, jobId: id, presignedUrl };
            }
            catch (error) {
                if (attempt >= DOWNLOAD_RETRY_ATTEMPTS || !isRetryableDownloadError(error))
                    throw error;
            }
            await pauseBeforeRetry(options.signal);
        }
    }
}
