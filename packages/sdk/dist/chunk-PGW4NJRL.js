import {
  postZipWithBigPayload,
  zipPayloadJson
} from "./chunk-4RPI3KBZ.js";
import {
  InfraredError,
  JobFailedError,
  JobNotCompletedError,
  JobPollError,
  JobSubmitError,
  JobTimeoutError,
  ResultsDownloadError
} from "./chunk-GOADVAJS.js";

// src/jobs/types.ts
var JobStatus = {
  Pending: "pending",
  Running: "running",
  Succeeded: "succeeded",
  Failed: "failed",
  Unknown: "unknown"
};
var RAW_TO_STATUS = {
  Pending: JobStatus.Pending,
  Running: JobStatus.Running,
  Succeeded: JobStatus.Succeeded,
  Succeded: JobStatus.Succeeded,
  // normalise historical API typo
  Failed: JobStatus.Failed
};
function parseJobStatus(raw) {
  return RAW_TO_STATUS[raw] ?? JobStatus.Unknown;
}
var TERMINAL_STATUSES = /* @__PURE__ */ new Set([
  JobStatus.Succeeded,
  JobStatus.Failed
]);
function asStringOrUndefined(v) {
  return typeof v === "string" ? v : void 0;
}
function jobFromResponse(data) {
  const jobId = asStringOrUndefined(data.jobId);
  if (!jobId) {
    throw new Error(
      `jobFromResponse: missing or non-string jobId (got ${typeof data.jobId})`
    );
  }
  const rawStatus = asStringOrUndefined(data.jobStatus) ?? asStringOrUndefined(data.status) ?? "Unknown";
  return {
    jobId,
    modelName: asStringOrUndefined(data.modelName) ?? "",
    status: parseJobStatus(rawStatus),
    requestedAt: asStringOrUndefined(data.requestedAt) ?? "",
    startedAt: asStringOrUndefined(data.startedAt),
    finishedAt: asStringOrUndefined(data.finishedAt),
    resultsUrl: asStringOrUndefined(data.results),
    error: asStringOrUndefined(data.error)
  };
}

// src/jobs/service.ts
import { gunzipSync, unzipSync } from "fflate";
var BACKOFF_BASE = 2;
var BACKOFF_CAP = 10;
var BACKOFF_FLOOR_S = 0.5;
var DEFAULT_TIMEOUT_S = 300;
var DEFAULT_REQUEST_TIMEOUT_MS = 18e4;
var DEFAULT_DOWNLOAD_TIMEOUT_MS = 6e5;
var JobsService = class {
  getAuthHeaders;
  baseUrl;
  logger;
  backoffCap;
  timeout;
  downloadTimeout;
  gatewayBaseUrl;
  getBigPayloadEnabled;
  getBigPayloadThresholdBytes;
  constructor(config) {
    this.getAuthHeaders = config.getAuthHeaders;
    this.baseUrl = config.baseUrl;
    this.logger = config.logger;
    this.backoffCap = config.backoffCap ?? BACKOFF_CAP;
    this.timeout = config.timeout ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.downloadTimeout = config.downloadTimeout ?? DEFAULT_DOWNLOAD_TIMEOUT_MS;
    this.gatewayBaseUrl = config.gatewayBaseUrl;
    this.getBigPayloadEnabled = config.getBigPayloadEnabled ?? (() => true);
    this.getBigPayloadThresholdBytes = config.getBigPayloadThresholdBytes ?? (() => 5 * 1024 * 1024);
  }
  // -- public methods -------------------------------------------------------
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
  async submit(analysisType, payload, opts) {
    const url = `${this.baseUrl}/async/${encodeURIComponent(analysisType)}`;
    const body = { ...payload };
    if (opts?.webhookUrl !== void 0) {
      body["webhook-url"] = opts.webhookUrl;
    }
    if (opts?.webhookEvents !== void 0) {
      body["webhook-events"] = opts.webhookEvents;
    }
    this.logger.debug({ event: "job_submit", url, analysisType });
    const rawBytes = new TextEncoder().encode(JSON.stringify(body));
    const zipBytes = zipPayloadJson(rawBytes);
    const authHeaders = await this.getAuthHeaders();
    return await postZipWithBigPayload({
      url,
      zipBytes,
      authHeaders,
      gatewayBaseUrl: this.gatewayBaseUrl ?? "",
      thresholdBytes: this.getBigPayloadThresholdBytes(),
      enabled: this.getBigPayloadEnabled() && !!this.gatewayBaseUrl,
      inlineTimeoutMs: this.timeout,
      envelopeTimeoutMs: this.timeout,
      logger: this.logger,
      parseResponse: (status, ok, bodyText, bodyJson) => {
        if (!ok) {
          throw new JobSubmitError(
            `Failed to submit ${analysisType} job: ${status} - ${bodyText}`,
            { statusCode: status, responseBody: bodyText }
          );
        }
        return jobFromResponse(bodyJson);
      }
    });
  }
  /**
   * Poll job status.
   *
   * GET `{baseUrl}/async/jobs/{jobId}`.
   */
  async getStatus(jobId) {
    const url = `${this.baseUrl}/async/jobs/${encodeURIComponent(jobId)}`;
    this.logger.info({ event: "job_poll", url });
    const response = await this.authenticatedFetch(url, { method: "GET" });
    if (!response.ok) {
      const text = await response.text();
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfter = retryAfterHeader !== null && !Number.isNaN(Number(retryAfterHeader)) ? Number(retryAfterHeader) : null;
      throw new JobPollError(`Failed to poll job ${jobId}: ${response.status}`, {
        jobId,
        statusCode: response.status,
        responseBody: text,
        retryAfter
      });
    }
    const data = await response.json();
    return jobFromResponse(data);
  }
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
  async waitForCompletion(jobId, opts) {
    const timeout = opts?.timeout;
    if (timeout !== void 0 && timeout <= 0) {
      throw new Error(`timeout must be > 0, got ${timeout}`);
    }
    const effectiveTimeout = timeout ?? DEFAULT_TIMEOUT_S;
    const start = performance.now() / 1e3;
    let attempt = 0;
    while (true) {
      const job = await this.getStatus(jobId);
      const elapsed = performance.now() / 1e3 - start;
      const isTerminal = job.status === JobStatus.Succeeded || job.status === JobStatus.Failed;
      const nextDelay = isTerminal ? 0 : Math.max(
        BACKOFF_FLOOR_S,
        Math.random() * Math.min(this.backoffCap, BACKOFF_BASE * 2 ** attempt)
      );
      if (opts?.onPoll) {
        try {
          const result = await opts.onPoll(job, attempt, elapsed, nextDelay);
          if (result === false) {
            return job;
          }
        } catch (callbackError) {
          this.logger.warn({
            event: "on_poll_error",
            attempt,
            error: String(callbackError)
          });
        }
      }
      if (job.status === JobStatus.Succeeded) {
        return job;
      }
      if (job.status === JobStatus.Failed) {
        throw new JobFailedError(`Job ${jobId} failed: ${job.error}`, {
          jobId,
          errorMessage: job.error ?? ""
        });
      }
      if (elapsed + nextDelay >= effectiveTimeout) {
        throw new JobTimeoutError(`Job ${jobId} timed out after ${elapsed.toFixed(1)}s`, {
          jobId
        });
      }
      await sleep(nextDelay * 1e3);
      attempt++;
    }
  }
  /**
   * Download results for a completed job.
   *
   * 1. Verify job has succeeded (skip if `opts.job` is provided)
   * 2. Fetch presigned S3 URL from Link header
   * 3. Download from S3 without auth headers
   * 4. On 403, refresh presigned URL once and retry
   */
  async downloadResults(jobId, opts) {
    const job = opts?.job ?? await this.getStatus(jobId);
    if (job.status !== JobStatus.Succeeded) {
      throw new JobNotCompletedError(`Job ${jobId} is not completed (status: ${job.status})`, {
        jobId
      });
    }
    let presignedUrl = await this.fetchPresignedUrl(jobId);
    let result = await this.downloadFromS3(presignedUrl);
    if (result === null) {
      this.logger.debug({ event: "presigned_url_refresh", jobId });
      presignedUrl = await this.fetchPresignedUrl(jobId);
      result = await this.downloadFromS3(presignedUrl);
      if (result === null) {
        throw new ResultsDownloadError(
          `Presigned URL still invalid after refresh for job ${jobId}`,
          { statusCode: 403, responseBody: "Forbidden" }
        );
      }
    }
    return {
      content: result.content,
      presignedUrl,
      jobId,
      contentType: result.contentType
    };
  }
  /**
   * Decompress ZIP or GZIP content and return parsed JSON dict.
   *
   * Tries ZIP first, then GZIP. If the decompressed JSON is a list,
   * it is normalised to `{ output: <list> }` so callers always receive a dict.
   *
   * Uses fflate for isomorphic decompression (no node:* imports).
   * Uses TextDecoder (not String.fromCharCode) to avoid stack overflow on large grids.
   */
  decompress(content) {
    let jsonString;
    try {
      const unzipped = unzipSync(content);
      const fileNames = Object.keys(unzipped);
      if (fileNames.length === 0) {
        throw new Error("Empty ZIP archive");
      }
      jsonString = new TextDecoder().decode(unzipped[fileNames[0]]);
    } catch {
      try {
        const decompressed = gunzipSync(content);
        jsonString = new TextDecoder().decode(decompressed);
      } catch {
        throw new Error("Could not decompress content. Unknown format (not ZIP or GZIP).");
      }
    }
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return { output: parsed };
    }
    return parsed;
  }
  // -- private helpers ------------------------------------------------------
  /**
   * Make an authenticated fetch request (includes X-Api-Key header + timeout).
   *
   * On timeout, throws InfraredError so callers always receive a typed SDK error.
   */
  async authenticatedFetch(url, init) {
    const headers = new Headers(init.headers);
    const auth = await this.getAuthHeaders();
    for (const [k, v] of Object.entries(auth)) headers.set(k, v);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, { ...init, headers, signal: controller.signal });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new InfraredError(`Request timed out after ${this.timeout}ms: ${url}`, {
          statusCode: 0,
          responseBody: "Request timed out"
        });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  /**
   * GET /async/jobs/{jobId}/results and extract presigned URL from Link header.
   *
   * Link header format: `<presigned-url>; rel="results"` or just `<presigned-url>`
   */
  async fetchPresignedUrl(jobId) {
    const url = `${this.baseUrl}/async/jobs/${encodeURIComponent(jobId)}/results`;
    this.logger.debug({ event: "fetch_presigned_url", url });
    const response = await this.authenticatedFetch(url, { method: "GET" });
    if (!response.ok) {
      const text = await response.text();
      throw new ResultsDownloadError(
        `Failed to fetch results URL for job ${jobId}: ${response.status}`,
        { statusCode: response.status, responseBody: text }
      );
    }
    const linkHeader = response.headers.get("Link") ?? "";
    const match = linkHeader.match(/<([^>]+)>/);
    const presignedUrl = match ? match[1] : linkHeader.trim();
    if (!presignedUrl) {
      throw new ResultsDownloadError(`No Link header in results response for job ${jobId}`, {
        statusCode: response.status,
        responseBody: await response.text().catch(() => "")
      });
    }
    return presignedUrl;
  }
  /**
   * Download from S3 presigned URL without auth headers.
   *
   * Returns `{ content, contentType }` on success, or `null` on 403
   * (caller should retry with refreshed URL).
   */
  async downloadFromS3(presignedUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.downloadTimeout);
      let response;
      try {
        response = await fetch(presignedUrl, { signal: controller.signal });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new ResultsDownloadError(`S3 download timed out after ${this.downloadTimeout}ms`, {
            statusCode: 0,
            responseBody: "Request timed out"
          });
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
      if (response.status === 403) {
        return null;
      }
      if (!response.ok) {
        const text = await response.text();
        throw new ResultsDownloadError(`Failed to download from S3: ${response.status}`, {
          statusCode: response.status,
          responseBody: text
        });
      }
      const buffer = await response.arrayBuffer();
      return {
        content: new Uint8Array(buffer),
        contentType: response.headers.get("Content-Type") ?? ""
      };
    } catch (error) {
      if (error instanceof ResultsDownloadError) {
        throw error;
      }
      throw new ResultsDownloadError(`Failed to download from S3: ${error}`, {
        statusCode: 0,
        responseBody: String(error)
      });
    }
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
  JobStatus,
  parseJobStatus,
  TERMINAL_STATUSES,
  jobFromResponse,
  JobsService
};
//# sourceMappingURL=chunk-PGW4NJRL.js.map