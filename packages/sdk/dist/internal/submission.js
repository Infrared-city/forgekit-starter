import { TransportError } from "./transport.js";
import { uploadPresignedZip } from "./upload.js";
export class SubmissionUncertainError extends Error {
    acceptedJobIds;
    name = "SubmissionUncertainError";
    phase = "unknown-acceptance";
    /** Set when a sent POST got a 3xx or 5xx answer instead of an accept. */
    status;
    constructor(acceptedJobIds, status) {
        super(status === undefined
            ? "job submission returned an invalid accepted response"
            : `job submission received HTTP ${status}; the job may already exist`);
        this.acceptedJobIds = acceptedJobIds;
        this.status = status;
    }
}
/** A typed accepted-response failure that must not be collapsed into a generic parse error. */
export class AcceptedResponseError extends Error {
    name = "AcceptedResponseError";
}
/** A server rejection that confirms no analysis job was accepted. */
export class GeometryReferenceRejectedError extends Error {
    code;
    name = "GeometryReferenceRejectedError";
    constructor(code) {
        super("geometry reference was rejected before job acceptance");
        this.code = code;
    }
}
const GATEWAY_SIZE_MESSAGES = new Set([
    "Request Too Long",
    "HTTP content length exceeded 10485760 bytes",
]);
const PRE_ACCEPT_REF_REJECTIONS = new Map([
    [400, new Set(["REF_INVALID_ENVELOPE", "REF_HOST_NOT_ALLOWED"])],
    [413, new Set(["REF_TOO_LARGE"])],
    [415, new Set(["REF_CONTENT_TYPE_REJECTED"])],
    [422, new Set([
            "REF_GEOMETRY_OVERLAP", "REF_GEOMETRY_UNKNOWN_GROUP",
            "REF_GEOMETRY_NESTED", "REF_GEOMETRY_EMPTY",
        ])],
    [502, new Set(["REF_NOT_FOUND", "REF_EXPIRED", "REF_DECODE_FAILED"])],
    [504, new Set(["REF_FETCH_TIMEOUT"])],
]);
function parseJson(content) {
    if (content.byteLength === 0)
        return undefined;
    try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(content);
        return JSON.parse(text);
    }
    catch {
        return undefined;
    }
}
function signedHttps(value, label) {
    if (typeof value !== "string")
        throw new TypeError(`presign response has no ${label}`);
    let url;
    try {
        url = new URL(value);
    }
    catch {
        throw new TypeError(`presign response ${label} is invalid`);
    }
    if (url.protocol !== "https:" || url.username || url.password || url.hash) {
        throw new TypeError(`presign response ${label} is invalid`);
    }
    return url.href;
}
async function presign(options) {
    const response = await options.uploadGateway.requestJson("/uploads/presign", {
        method: "POST",
        body: { content_length: options.archive.byteLength },
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    if (response === null || typeof response !== "object" || Array.isArray(response)) {
        throw new TypeError("presign response is invalid");
    }
    const value = response;
    return {
        uploadUrl: signedHttps(value["upload-url"], "upload-url"),
        getUrl: signedHttps(value["get-url"], "get-url"),
    };
}
async function presignAndUpload(options) {
    const pair = await presign(options);
    await uploadPresignedZip(pair.uploadUrl, options.archive, {
        fetch: options.fetch,
        timeoutMs: options.timeoutMs,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
    });
    return pair.getUrl;
}
/** Upload one already-built ZIP and return its signed read URL. */
export function uploadArchive(options) {
    return presignAndUpload(options);
}
function exactGatewaySizeRejection(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return false;
    const body = value;
    const keys = Object.keys(body);
    return keys.length === 1 && keys[0] === "message" &&
        typeof body.message === "string" && GATEWAY_SIZE_MESSAGES.has(body.message);
}
function acceptedJobIds(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return [];
    const jobId = value.jobId;
    return typeof jobId === "string" && jobId.length > 0 ? [jobId] : [];
}
async function post(options, body, contentType, allowExpired, allowGatewaySizeFallback) {
    let response;
    try {
        response = await options.gateway.requestBytesWithHeaders(options.endpointPath, {
            method: "POST",
            headers: { "Content-Type": contentType },
            body,
            acceptHttpErrors: true,
            ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
    }
    catch (error) {
        // The transport answers a redirect with an error before the body is read.
        // The POST was sent, so the job may exist (#261, Python's classifier).
        if (error instanceof TransportError && error.phase === "response" &&
            error.status !== undefined && error.status >= 300 && error.status < 400) {
            throw new SubmissionUncertainError([], error.status);
        }
        throw error;
    }
    const parsed = parseJson(response.content);
    const ok = response.status >= 200 && response.status < 300;
    if (!ok) {
        const reportedIds = acceptedJobIds(parsed);
        if (reportedIds.length > 0)
            throw new SubmissionUncertainError(reportedIds);
        if (allowGatewaySizeFallback && response.status === 413 && exactGatewaySizeRejection(parsed)) {
            return { kind: "too-large" };
        }
        if (allowExpired && response.status === 502 && parsed !== null &&
            typeof parsed === "object" && !Array.isArray(parsed) &&
            parsed.code === "REF_EXPIRED")
            return { kind: "expired" };
        if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
            const code = parsed.code;
            if (typeof code === "string" && PRE_ACCEPT_REF_REJECTIONS.get(response.status)?.has(code)) {
                throw new GeometryReferenceRejectedError(code);
            }
        }
        // Only a 4xx proves no job exists. A 5xx (the handler may have queued the
        // job before the proxy failed) and a browser's opaque redirect (status 0
        // under `redirect: "manual"`) are uncertain, so `retryFrom` never pays for
        // them again (#261, #197), as on the binary route.
        if (response.status < 400 || response.status >= 500) {
            throw new SubmissionUncertainError([], response.status);
        }
        throw new TransportError(`job submission received HTTP ${response.status}`, "response", "http", "POST", response.status);
    }
    try {
        return { kind: "accepted", value: options.parseAccepted(parsed) };
    }
    catch (error) {
        if (error instanceof AcceptedResponseError)
            throw error;
        throw new SubmissionUncertainError(acceptedJobIds(parsed));
    }
}
/** Submit one prepared archive. No uncertain mutation is replayed. */
export async function submitArchive(options) {
    if (options.archive.byteLength <= options.thresholdBytes) {
        const result = await post(options, options.archive, "application/zip", false, true);
        if (result.kind === "expired")
            throw new Error("unreachable inline reference state");
        if (result.kind === "accepted")
            return result.value;
    }
    let getUrl = await presignAndUpload(options);
    let envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
    let result = await post(options, envelope, "application/json", true, false);
    if (result.kind === "accepted")
        return result.value;
    getUrl = await presignAndUpload(options);
    envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
    result = await post(options, envelope, "application/json", false, false);
    if (result.kind !== "accepted")
        throw new Error("unreachable reference retry state");
    return result.value;
}
