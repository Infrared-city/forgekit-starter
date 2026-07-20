import {
  BigPayloadFetchError,
  BigPayloadPresignError,
  BigPayloadUploadError,
  RefExpiredRetryExhausted
} from "./chunk-GOADVAJS.js";

// src/_internal/big-payloads/constants.ts
var THRESHOLD_DEFAULT_BYTES = 5 * 1024 * 1024;
var PRESIGN_TIMEOUT_MS = 3e4;
var S3_PUT_TIMEOUT_MS = 6e5;
var MAX_REF_EXPIRED_RETRIES = 2;
var MAX_PUT_RETRIES = 2;
var ALLOWED_PRESIGNED_SCHEMES = ["https:"];
var ENV_ENABLED = "INFRARED_BIG_PAYLOADS_ENABLED";
var ENV_THRESHOLD = "INFRARED_BIG_PAYLOADS_THRESHOLD_BYTES";
var RESPONSE_MAX_BYTES = 250 * 1024 * 1024;
var RESPONSE_PREFLIGHT_TIMEOUT_MS = 3e4;
var RESPONSE_FETCH_TIMEOUT_MS = 6e5;

// src/_internal/big-payloads/config.ts
function readEnv(env, key) {
  if (env) {
    const v = env[key];
    if (typeof v === "string") return v;
  }
  const proc = globalThis.process;
  return proc?.env?.[key];
}
function readEnabled(env, override) {
  if (override !== void 0) return override;
  const raw = readEnv(env, ENV_ENABLED);
  if (raw === void 0) return true;
  return raw.trim().toLowerCase() === "true";
}
function readThresholdBytes(env, override) {
  if (override !== void 0 && Number.isFinite(override) && override > 0) return override;
  const raw = readEnv(env, ENV_THRESHOLD);
  if (raw === void 0) return THRESHOLD_DEFAULT_BYTES;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : THRESHOLD_DEFAULT_BYTES;
}
function deriveGatewayBaseUrl(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/utils")) {
    return trimmed.slice(0, -"/utils".length);
  }
  return baseUrl;
}

// src/_internal/big-payloads/zip.ts
import { zipSync } from "fflate";
function zipPayloadJson(jsonBytes) {
  return zipSync({ "payload.json": jsonBytes }, { level: 6 });
}

// src/_internal/big-payloads/redact.ts
function redactPresignedUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return "<unparseable-url>";
  }
}

// src/_internal/big-payloads/envelope.ts
async function postEnvelope(args) {
  void redactPresignedUrl(args.getUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), args.timeoutMs);
  let externalAbortHandler;
  if (args.signal) {
    if (args.signal.aborted) {
      clearTimeout(timeoutId);
      const e = new Error("Request aborted by external signal");
      e.name = "AbortError";
      throw e;
    }
    externalAbortHandler = () => controller.abort();
    args.signal.addEventListener("abort", externalAbortHandler, { once: true });
  }
  let response;
  try {
    response = await fetch(args.url, {
      method: "POST",
      headers: {
        ...args.authHeaders,
        ...args.extraHeaders ?? {},
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ $ref: args.getUrl }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
    if (args.signal && externalAbortHandler) {
      args.signal.removeEventListener("abort", externalAbortHandler);
    }
  }
  if (args.responseKind === "binary" && response.ok) {
    const buf = await safeReadArrayBuffer(response);
    return {
      ok: true,
      status: response.status,
      bodyText: "",
      bodyJson: void 0,
      bodyBytes: buf
    };
  }
  const bodyText = await safeReadText(response);
  let bodyJson;
  try {
    bodyJson = bodyText ? JSON.parse(bodyText) : void 0;
  } catch {
    bodyJson = void 0;
  }
  return {
    ok: response.ok,
    status: response.status,
    bodyText,
    bodyJson
  };
}
function classifyEnvelopeResponse(resp) {
  if (resp.ok) return null;
  if (!(resp.status >= 400 && resp.status < 600)) return null;
  if (!resp.bodyJson || typeof resp.bodyJson !== "object" || Array.isArray(resp.bodyJson)) {
    return null;
  }
  const body = resp.bodyJson;
  const code = body.code;
  if (typeof code !== "string" || !code.startsWith("REF_")) return null;
  let message = "";
  const m = body.message;
  const e = body.error;
  if (typeof m === "string" && m) message = m;
  else if (typeof e === "string" && e) message = e;
  else message = resp.bodyText;
  return { code, message };
}
async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
async function safeReadArrayBuffer(response) {
  try {
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return new Uint8Array(0);
  }
}

// src/_internal/big-payloads/presign.ts
async function presignUpload(args) {
  const url = `${args.gatewayBaseUrl.replace(/\/+$/, "")}/uploads/presign`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRESIGN_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        ...args.authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content_length: args.contentLength }),
      signal: controller.signal
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new BigPayloadPresignError(
        `Presign call to ${url} timed out after ${PRESIGN_TIMEOUT_MS}ms`
      );
    }
    const cls = err instanceof Error ? err.constructor.name : "unknown";
    throw new BigPayloadPresignError(
      `Presign call to ${url} failed at transport layer: ${cls}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    const body = await safeReadText2(response);
    throw new BigPayloadPresignError(
      `Presign call to ${url} returned ${response.status}`,
      { statusCode: response.status, responseBody: body }
    );
  }
  const text = await safeReadText2(response);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BigPayloadPresignError("Presign response was not valid JSON", {
      statusCode: response.status,
      responseBody: text
    });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new BigPayloadPresignError("Presign response JSON was not an object", {
      statusCode: response.status,
      responseBody: text
    });
  }
  const data = parsed;
  const uploadUrl = data["upload-url"];
  const getUrl = data["get-url"];
  if (typeof uploadUrl !== "string" || typeof getUrl !== "string") {
    throw new BigPayloadPresignError(
      "Presign response missing 'upload-url' or 'get-url'",
      { statusCode: response.status, responseBody: text }
    );
  }
  for (const [label, raw] of [
    ["upload-url", uploadUrl],
    ["get-url", getUrl]
  ]) {
    let parsedUrl;
    try {
      parsedUrl = new URL(raw);
    } catch {
      throw new BigPayloadPresignError(
        `Presign response '${label}' is not a parseable URL`,
        { statusCode: response.status, responseBody: redactPresignedUrl(raw) }
      );
    }
    if (!ALLOWED_PRESIGNED_SCHEMES.includes(parsedUrl.protocol) || !parsedUrl.host) {
      throw new BigPayloadPresignError(
        `Presign response '${label}' must use HTTPS with a non-empty host`,
        { statusCode: response.status, responseBody: redactPresignedUrl(raw) }
      );
    }
  }
  return { uploadUrl, getUrl };
}
async function safeReadText2(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

// src/_internal/big-payloads/response-ref.ts
import { unzipSync } from "fflate";
var PAYLOAD_ENTRY = "payload.json";
function detectResponseRef(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "$ref") return null;
  const url = body.$ref;
  if (typeof url !== "string" || url.length === 0) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !u.host) return null;
  } catch {
    return null;
  }
  return url;
}
async function resolveResponseRef(body, opts = {}) {
  const url = detectResponseRef(body);
  if (url === null) return body;
  const redacted = redactPresignedUrl(url);
  await preflight(url, redacted, opts.signal);
  const bytes = await fetchFull(url, redacted, opts.signal);
  return decodeInner(bytes, redacted);
}
async function preflight(url, redacted, signal) {
  const resp = await getNoAuth(
    url,
    { Range: "bytes=0-0" },
    RESPONSE_PREFLIGHT_TIMEOUT_MS,
    redacted,
    signal
  );
  checkStatus(resp, redacted);
  checkContentType(resp, redacted);
  const contentRange = resp.headers.get("Content-Range");
  if (contentRange) {
    const m = contentRange.match(/\/\s*(\d+)\s*$/);
    if (m && Number(m[1]) > RESPONSE_MAX_BYTES) {
      throw new BigPayloadFetchError(
        "REF_TOO_LARGE",
        `response $ref body ${m[1]}B exceeds ${RESPONSE_MAX_BYTES}B cap: ${redacted}`,
        { statusCode: resp.status }
      );
    }
  }
  await drain(resp);
}
async function fetchFull(url, redacted, signal) {
  const resp = await getNoAuth(url, {}, RESPONSE_FETCH_TIMEOUT_MS, redacted, signal);
  checkStatus(resp, redacted);
  checkContentType(resp, redacted);
  const contentLength = resp.headers.get("Content-Length");
  if (contentLength && Number(contentLength) > RESPONSE_MAX_BYTES) {
    throw new BigPayloadFetchError(
      "REF_TOO_LARGE",
      `response $ref body ${contentLength}B exceeds ${RESPONSE_MAX_BYTES}B cap: ${redacted}`,
      { statusCode: resp.status }
    );
  }
  let buf;
  try {
    buf = await resp.arrayBuffer();
  } catch (err) {
    throw new BigPayloadFetchError(
      "REF_FETCH_TIMEOUT",
      `response $ref body read failed: ${redacted} (${errMsg(err)})`,
      { statusCode: resp.status }
    );
  }
  if (buf.byteLength > RESPONSE_MAX_BYTES) {
    throw new BigPayloadFetchError(
      "REF_TOO_LARGE",
      `response $ref body ${buf.byteLength}B exceeds ${RESPONSE_MAX_BYTES}B cap: ${redacted}`,
      { statusCode: resp.status }
    );
  }
  return new Uint8Array(buf);
}
function decodeInner(zipBytes, redacted) {
  let files;
  try {
    files = unzipSync(zipBytes);
  } catch (err) {
    throw new BigPayloadFetchError(
      "REF_DECODE_FAILED",
      `response $ref unzip failed: ${redacted} (${errMsg(err)})`
    );
  }
  const firstFile = Object.keys(files).find((k) => !k.endsWith("/"));
  const inner = files[PAYLOAD_ENTRY] ?? (firstFile ? files[firstFile] : void 0);
  if (!inner) {
    throw new BigPayloadFetchError(
      "REF_DECODE_FAILED",
      `response $ref archive has no non-directory entries: ${redacted}`
    );
  }
  if (inner.byteLength > RESPONSE_MAX_BYTES) {
    throw new BigPayloadFetchError(
      "REF_TOO_LARGE",
      `response $ref decompressed payload ${inner.byteLength}B exceeds ${RESPONSE_MAX_BYTES}B cap: ${redacted}`
    );
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(inner);
  } catch (err) {
    throw new BigPayloadFetchError(
      "REF_DECODE_FAILED",
      `response $ref inner payload is not valid UTF-8: ${redacted} (${errMsg(err)})`
    );
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new BigPayloadFetchError(
      "REF_DECODE_FAILED",
      `response $ref inner payload is not valid JSON: ${redacted} (${errMsg(err)})`
    );
  }
}
async function getNoAuth(url, headers, timeoutMs, redacted, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let externalAbortHandler;
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      const e = new Error("Request aborted by external signal");
      e.name = "AbortError";
      throw e;
    }
    externalAbortHandler = () => controller.abort();
    signal.addEventListener("abort", externalAbortHandler, { once: true });
  }
  try {
    return await fetch(url, { method: "GET", headers, redirect: "error", signal: controller.signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new BigPayloadFetchError(
      "REF_FETCH_TIMEOUT",
      `response $ref GET failed/timed out: ${redacted} (${errMsg(err)})`
    );
  } finally {
    clearTimeout(timeoutId);
    if (signal && externalAbortHandler) {
      signal.removeEventListener("abort", externalAbortHandler);
    }
  }
}
function checkStatus(resp, redacted) {
  if (resp.ok) return;
  if (resp.status === 401 || resp.status === 403) {
    throw new BigPayloadFetchError(
      "REF_EXPIRED",
      `response $ref GET unauthorized/expired (${resp.status}): ${redacted}`,
      { statusCode: resp.status }
    );
  }
  throw new BigPayloadFetchError(
    "REF_NOT_FOUND",
    `response $ref GET failed (${resp.status}): ${redacted}`,
    { statusCode: resp.status }
  );
}
function checkContentType(resp, redacted) {
  const ct = resp.headers.get("Content-Type");
  const primary = (ct ?? "").split(";", 1)[0].trim().toLowerCase();
  if (primary !== "application/zip") {
    throw new BigPayloadFetchError(
      "REF_CONTENT_TYPE_REJECTED",
      `response $ref Content-Type ${JSON.stringify(ct)} is not application/zip: ${redacted}`,
      { statusCode: resp.status }
    );
  }
}
async function drain(resp) {
  try {
    await resp.arrayBuffer();
  } catch {
  }
}
function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
}

// src/_internal/big-payloads/upload.ts
async function putZipToS3(uploadUrl, zipBytes) {
  let lastStatus;
  let lastBody = "";
  let lastTransport;
  for (let attempt = 1; attempt <= MAX_PUT_RETRIES + 1; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), S3_PUT_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(uploadUrl, {
        method: "PUT",
        // No auth — explicit. Only Content-Type, which is signed by the
        // gateway via `signableHeaders`.
        headers: { "Content-Type": "application/zip" },
        // Fetch derives Content-Length from the Uint8Array body in all
        // supported runtimes (Node 18+, CF Workers, browser). Cast via
        // BodyInit because TS 5.7 narrowed `Uint8Array<ArrayBufferLike>`
        // out of the union; runtime accepts it.
        body: zipBytes,
        signal: controller.signal
      });
    } catch (err) {
      lastTransport = err instanceof Error ? err.constructor.name : "unknown";
      continue;
    } finally {
      clearTimeout(timeoutId);
    }
    if (response.ok) return;
    lastStatus = response.status;
    lastBody = await safeReadText3(response);
    if (response.status >= 500 && response.status < 600 && attempt <= MAX_PUT_RETRIES) {
      continue;
    }
    break;
  }
  if (lastStatus !== void 0) {
    if (lastBody.includes("SignatureDoesNotMatch")) {
      throw new BigPayloadUploadError(
        "S3 PUT signature mismatch \u2014 byte-count or Content-Type drift between presign and PUT; recompute zip and retry",
        { statusCode: lastStatus, responseBody: lastBody }
      );
    }
    throw new BigPayloadUploadError(`S3 PUT failed: ${lastStatus}`, {
      statusCode: lastStatus,
      responseBody: lastBody
    });
  }
  throw new BigPayloadUploadError(
    `S3 PUT failed at transport layer: ${lastTransport ?? "unknown"}`
  );
}
async function safeReadText3(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

// src/_internal/big-payloads/core.ts
async function postWithBigPayload(args) {
  const rawBytes = new TextEncoder().encode(JSON.stringify(args.body));
  const useEnvelope = args.enabled && rawBytes.length > args.thresholdBytes;
  if (!useEnvelope) {
    args.logger?.debug({
      event: "big_payloads_inline",
      enabled: args.enabled,
      raw: rawBytes.length,
      threshold: args.thresholdBytes
    });
    return await resolveResponseRef(await args.inline(), { signal: args.signal });
  }
  const zipBytes = zipPayloadJson(rawBytes);
  args.logger?.info({
    event: "big_payloads_envelope",
    raw: rawBytes.length,
    zip: zipBytes.length
  });
  const result = await runEnvelopeFlow({
    url: args.url,
    zipBytes,
    authHeaders: args.authHeaders,
    extraHeaders: args.extraHeaders,
    gatewayBaseUrl: args.gatewayBaseUrl,
    envelopeTimeoutMs: args.envelopeTimeoutMs,
    signal: args.signal,
    parseEnvelope: args.parseEnvelope,
    responseKind: args.responseKind,
    logger: args.logger
  });
  return await resolveResponseRef(result, { signal: args.signal });
}
async function postZipWithBigPayload(args) {
  const useEnvelope = args.enabled && args.zipBytes.length > args.thresholdBytes;
  if (!useEnvelope) {
    args.logger?.debug({
      event: "big_payloads_inline_zip",
      enabled: args.enabled,
      zip: args.zipBytes.length,
      threshold: args.thresholdBytes
    });
    const inlineResult = await inlineZipPost({
      url: args.url,
      zipBytes: args.zipBytes,
      authHeaders: args.authHeaders,
      timeoutMs: args.inlineTimeoutMs,
      signal: args.signal,
      parseResponse: args.parseResponse
    });
    return await resolveResponseRef(inlineResult, { signal: args.signal });
  }
  args.logger?.info({
    event: "big_payloads_envelope_zip",
    zip: args.zipBytes.length,
    threshold: args.thresholdBytes
  });
  const result = await runEnvelopeFlow({
    url: args.url,
    zipBytes: args.zipBytes,
    authHeaders: args.authHeaders,
    gatewayBaseUrl: args.gatewayBaseUrl,
    envelopeTimeoutMs: args.envelopeTimeoutMs,
    signal: args.signal,
    parseEnvelope: (resp) => args.parseResponse(resp.status, resp.ok, resp.bodyText, resp.bodyJson),
    logger: args.logger
  });
  return await resolveResponseRef(result, { signal: args.signal });
}
async function runEnvelopeFlow(args) {
  let presigned = await presignUpload({
    gatewayBaseUrl: args.gatewayBaseUrl,
    contentLength: args.zipBytes.length,
    authHeaders: args.authHeaders
  });
  await putZipToS3(presigned.uploadUrl, args.zipBytes);
  let response = await postEnvelope({
    url: args.url,
    getUrl: presigned.getUrl,
    authHeaders: args.authHeaders,
    extraHeaders: args.extraHeaders,
    timeoutMs: args.envelopeTimeoutMs,
    signal: args.signal,
    responseKind: args.responseKind
  });
  for (let attempt = 1; attempt <= MAX_REF_EXPIRED_RETRIES; attempt++) {
    const outcome = classifyEnvelopeResponse(response);
    if (outcome === null) return args.parseEnvelope(response);
    if (outcome.code !== "REF_EXPIRED") {
      throw new BigPayloadFetchError(outcome.code, outcome.message, {
        statusCode: response.status,
        responseBody: response.bodyText
      });
    }
    args.logger?.warn({
      event: "big_payloads_ref_expired",
      attempt,
      max: MAX_REF_EXPIRED_RETRIES
    });
    presigned = await presignUpload({
      gatewayBaseUrl: args.gatewayBaseUrl,
      contentLength: args.zipBytes.length,
      authHeaders: args.authHeaders
    });
    await putZipToS3(presigned.uploadUrl, args.zipBytes);
    response = await postEnvelope({
      url: args.url,
      getUrl: presigned.getUrl,
      authHeaders: args.authHeaders,
      extraHeaders: args.extraHeaders,
      timeoutMs: args.envelopeTimeoutMs,
      signal: args.signal,
      responseKind: args.responseKind
    });
  }
  const finalOutcome = classifyEnvelopeResponse(response);
  if (finalOutcome === null) return args.parseEnvelope(response);
  if (finalOutcome.code === "REF_EXPIRED") {
    throw new RefExpiredRetryExhausted(
      `REF_EXPIRED after ${MAX_REF_EXPIRED_RETRIES} retries: ${finalOutcome.message}`,
      { statusCode: response.status, responseBody: response.bodyText }
    );
  }
  throw new BigPayloadFetchError(finalOutcome.code, finalOutcome.message, {
    statusCode: response.status,
    responseBody: response.bodyText
  });
}
async function inlineZipPost(args) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), args.timeoutMs);
  let externalAbortHandler;
  if (args.signal) {
    if (args.signal.aborted) {
      clearTimeout(timeoutId);
      const e = new Error("Request aborted by external signal");
      e.name = "AbortError";
      throw e;
    }
    externalAbortHandler = () => controller.abort();
    args.signal.addEventListener("abort", externalAbortHandler, { once: true });
  }
  let response;
  try {
    response = await fetch(args.url, {
      method: "POST",
      headers: {
        ...args.authHeaders,
        "Content-Type": "application/zip"
      },
      // Cast via BodyInit — TS 5.7 narrowed Uint8Array<ArrayBufferLike>
      // out of the union; runtime accepts it across Node/Workers/browser.
      body: args.zipBytes,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
    if (args.signal && externalAbortHandler) {
      args.signal.removeEventListener("abort", externalAbortHandler);
    }
  }
  const bodyText = await safeReadText4(response);
  let bodyJson;
  try {
    bodyJson = bodyText ? JSON.parse(bodyText) : void 0;
  } catch {
    bodyJson = void 0;
  }
  return args.parseResponse(response.status, response.ok, bodyText, bodyJson);
}
async function safeReadText4(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export {
  readEnabled,
  readThresholdBytes,
  deriveGatewayBaseUrl,
  zipPayloadJson,
  postWithBigPayload,
  postZipWithBigPayload
};
//# sourceMappingURL=chunk-4RPI3KBZ.js.map