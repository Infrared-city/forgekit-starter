"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkH6ZH5SHIcjs = require('./chunk-H6ZH5SHI.cjs');


var _chunkRCUR3TGScjs = require('./chunk-RCUR3TGS.cjs');

// src/http.ts
var _fflate = require('fflate');
function extractStatusCode(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
    if (e.response && typeof e.response.status === "number") return e.response.status;
  }
  if (err instanceof Error) {
    const match = err.message.match(/HTTP\s+(\d{3})/);
    if (match) return Number(match[1]);
  }
  return 0;
}
function extractResponseBody(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (typeof e.responseBody === "string") return e.responseBody;
    if (e.response) {
      if (typeof e.response.body === "string") return e.response.body;
      if (typeof e.response.text === "string") return e.response.text;
    }
  }
  return err instanceof Error ? err.message : "";
}
function parseRetryAfter(value) {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function extractRetryAfter(err) {
  if (err && typeof err === "object") {
    const e = err;
    if (typeof e.retryAfter === "number") return e.retryAfter;
  }
  return null;
}
var HttpError = class extends Error {
  
  
  
  constructor(statusCode, responseBody, retryAfter) {
    super(`HTTP ${statusCode}: ${responseBody}`);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.retryAfter = retryAfter;
  }
};
var DEFAULT_TIMEOUT = 18e4;
var DEFAULT_MAX_RETRIES = 2;
var BACKOFF_BASE = 2;
var BACKOFF_CAP = 10;
var BACKOFF_FLOOR_S = 0.5;
var RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([429, 500, 502, 503, 504]);
var HttpClient = class {
  
  
  
  
  
  
  
  
  
  constructor(config) {
    this.getAuthHeaders = config.getAuthHeaders;
    this.baseUrl = config.baseUrl;
    this.logger = config.logger;
    this.timeout = _nullishCoalesce(config.timeout, () => ( DEFAULT_TIMEOUT));
    this.maxRetries = _nullishCoalesce(config.maxRetries, () => ( DEFAULT_MAX_RETRIES));
    this.interceptors = _nullishCoalesce(config.interceptors, () => ( {}));
    this.gatewayBaseUrl = config.gatewayBaseUrl;
    this.getBigPayloadEnabled = _nullishCoalesce(config.getBigPayloadEnabled, () => ( (() => true)));
    this.getBigPayloadThresholdBytes = _nullishCoalesce(config.getBigPayloadThresholdBytes, () => ( (() => 5 * 1024 * 1024)));
  }
  /**
   * POST request with optional gzip compression.
   *
   * `options.bigPayload`: when `true`, requests with serialized JSON bytes
   * exceeding the configured threshold automatically switch to the `$ref`
   * envelope flow (presign → S3 PUT → envelope POST). Below the threshold,
   * or when the kill switch is off, the call uses the inline path with
   * existing retry/backoff. Mutually exclusive with `compress` — gzip is
   * for the legacy text/plain control-plane path; big-payloads use a
   * different wire shape.
   */
  async post(path, data, options = {}) {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug({ event: "http_request", method: "POST", url });
    const headers = { ...await this.getAuthHeaders() };
    let body;
    const shouldSerialize = _nullishCoalesce(options.serializeNames, () => ( true));
    const payload = shouldSerialize ? _chunkH6ZH5SHIcjs.serializeToKebab.call(void 0, data) : data;
    if (options.compress) {
      const jsonData = JSON.stringify(payload);
      const compressed = _chunkH6ZH5SHIcjs.gzipAndEncode.call(void 0, jsonData);
      headers["Content-Type"] = "text/plain";
      headers["X-Content-Encoding"] = "gzip";
      headers["X-Infrared-Encoding"] = "gzip";
      body = compressed;
    } else if (options.gzip) {
      headers["Content-Type"] = "application/json";
      headers["Content-Encoding"] = "gzip";
      body = _fflate.gzipSync.call(void 0, new TextEncoder().encode(JSON.stringify(payload)));
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }
    if (options.bigPayload && this.gatewayBaseUrl && !options.compress && !options.gzip) {
      const json2 = await _chunkRCUR3TGScjs.postWithBigPayload.call(void 0, {
        url,
        body: payload,
        authHeaders: { ...headers },
        gatewayBaseUrl: this.gatewayBaseUrl,
        thresholdBytes: this.getBigPayloadThresholdBytes(),
        enabled: this.getBigPayloadEnabled(),
        envelopeTimeoutMs: this.timeout,
        signal: options.signal,
        logger: this.logger,
        inline: () => this.fetchWithRetry({
          url,
          method: "POST",
          headers,
          body,
          signal: options.signal
        }),
        parseEnvelope: (resp) => {
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.bodyText}`);
          }
          return _nullishCoalesce(resp.bodyJson, () => ( void 0));
        }
      });
      if (options.decompressResult) {
        return _chunkH6ZH5SHIcjs.decompressResultField.call(void 0, json2, this.logger);
      }
      return json2;
    }
    const json = await this.fetchWithRetry({
      url,
      method: "POST",
      headers,
      body,
      signal: options.signal
    });
    if (options.decompressResult) {
      return _chunkH6ZH5SHIcjs.decompressResultField.call(void 0, json, this.logger);
    }
    return json;
  }
  /**
   * DELETE request
   */
  async delete(path) {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug({ event: "http_request", method: "DELETE", url });
    const headers = { ...await this.getAuthHeaders() };
    const json = await this.fetchWithRetry({ url, method: "DELETE", headers });
    return json;
  }
  /**
   * GET request
   */
  async get(path, params) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const urlString = url.toString();
    this.logger.debug({ event: "http_request", method: "GET", url: urlString });
    const headers = { ...await this.getAuthHeaders() };
    return await this.fetchWithRetry({ url: urlString, method: "GET", headers });
  }
  /**
   * Execute an HTTP request with retry logic.
   *
   * Retry strategy (matching Python SDK):
   * - Retryable status codes: 429, 500, 502, 503, 504
   * - Exponential backoff with full jitter: random(0, min(cap, base * 2^attempt))
   * - Floor: max(floor, computed_delay)
   * - Retry-After header support (always wins over computed backoff)
   * - Configurable max retries (default: 2)
   */
  async fetchWithRetry(config) {
    let attempt = 0;
    while (true) {
      let effectiveConfig = config;
      if (this.interceptors.onRequest) {
        effectiveConfig = await this.interceptors.onRequest({ ...config });
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const externalSignal = effectiveConfig.signal;
      let externalAbortHandler;
      if (externalSignal) {
        if (externalSignal.aborted) {
          clearTimeout(timeoutId);
          const abortError = new Error("Request aborted by external signal");
          abortError.name = "AbortError";
          throw abortError;
        }
        externalAbortHandler = () => controller.abort();
        externalSignal.addEventListener("abort", externalAbortHandler, { once: true });
      }
      let response;
      try {
        response = await fetch(effectiveConfig.url, {
          method: effectiveConfig.method,
          headers: effectiveConfig.headers,
          // Cast for Uint8Array bodies (gzip) — TS's BodyInit narrows it out,
          // but every target runtime accepts a Uint8Array body at runtime.
          body: effectiveConfig.body,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        if (externalSignal && externalAbortHandler) {
          externalSignal.removeEventListener("abort", externalAbortHandler);
        }
        if (error instanceof Error && error.name === "AbortError") {
          if (_optionalChain([externalSignal, 'optionalAccess', _ => _.aborted])) {
            const abortError = new Error("Request aborted by external signal");
            abortError.name = "AbortError";
            if (this.interceptors.onError) {
              await this.interceptors.onError(abortError);
            }
            throw abortError;
          }
          const timeoutError = new Error(`Request timed out after ${this.timeout}ms`);
          this.logger.error({ event: "http_timeout", timeoutMs: this.timeout });
          if (this.interceptors.onError) {
            await this.interceptors.onError(timeoutError);
          }
          throw timeoutError;
        }
        if (error instanceof TypeError && attempt < this.maxRetries) {
          const delay = this.computeRetryDelay(attempt);
          this.logger.warn({
            event: "http_retry",
            error: String(error),
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delayMs: Math.round(delay * 1e3)
          });
          await sleep(delay * 1e3);
          attempt++;
          continue;
        }
        if (error instanceof Error && this.interceptors.onError) {
          await this.interceptors.onError(error);
        }
        this.logger.error({ event: "http_request_failed", error: String(error) });
        throw error;
      }
      if (externalSignal && externalAbortHandler) {
        externalSignal.removeEventListener("abort", externalAbortHandler);
      }
      if (!response.ok) {
        const errorText = await response.text();
        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.maxRetries) {
          const delay = this.computeRetryDelay(attempt, response);
          this.logger.warn({
            event: "http_retry",
            status: response.status,
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delayMs: Math.round(delay * 1e3)
          });
          await sleep(delay * 1e3);
          attempt++;
          continue;
        }
        const error = new HttpError(
          response.status,
          errorText,
          parseRetryAfter(response.headers.get("Retry-After"))
        );
        this.logger.error({ event: "http_error", status: response.status, body: errorText });
        if (this.interceptors.onError) {
          await this.interceptors.onError(error);
        }
        throw error;
      }
      if (this.interceptors.onResponse) {
        await this.interceptors.onResponse(response.clone());
      }
      if (response.status === 204) {
        return void 0;
      }
      if (typeof response.text === "function") {
        const text = await response.text();
        if (!text || !text.trim()) {
          return void 0;
        }
        try {
          return JSON.parse(text);
        } catch (e2) {
          throw new Error(
            `HTTP ${response.status}: response body is not valid JSON: ${text.slice(0, 200)}`
          );
        }
      }
      return await response.json();
    }
  }
  /**
   * Compute retry delay with full jitter, matching Python SDK.
   *
   * Priority:
   * 1. Retry-After header (if present) -- always wins
   * 2. Full jitter: random(0, min(cap, base * 2^attempt))
   * 3. Floor: max(backoff_floor, computed_delay)
   */
  computeRetryDelay(attempt, response) {
    if (response) {
      const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
      if (retryAfter !== null) return retryAfter;
    }
    const maxDelay = Math.min(BACKOFF_CAP, BACKOFF_BASE * 2 ** attempt);
    const jitter = Math.random() * maxDelay;
    return Math.max(BACKOFF_FLOOR_S, jitter);
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}







exports.extractStatusCode = extractStatusCode; exports.extractResponseBody = extractResponseBody; exports.parseRetryAfter = parseRetryAfter; exports.extractRetryAfter = extractRetryAfter; exports.HttpClient = HttpClient;
//# sourceMappingURL=chunk-P76CV7YN.cjs.map