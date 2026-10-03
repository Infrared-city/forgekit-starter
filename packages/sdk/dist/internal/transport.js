import { AuthPartitionChangedError } from "./auth.js";
import { bodySenderFor } from "./body-sender.js";
import { Deadline, requireTimeout } from "./deadline.js";
import { resolveFetch } from "./fetch.js";
import { sendBody, sendLimits, stopDetail } from "./send-body.js";
import { trimTrailingSlashes } from "./url-trim.js";
export class TransportError extends Error {
    phase;
    reason;
    method;
    status;
    retryAfterS;
    name = "TransportError";
    constructor(message, phase, reason, method, status, 
    /** The response's `Retry-After`, in delta-seconds, when it had one. */
    retryAfterS) {
        super(message);
        this.phase = phase;
        this.reason = reason;
        this.method = method;
        this.status = status;
        this.retryAfterS = retryAfterS;
    }
}
/** A `Retry-After` header in delta-seconds; an HTTP-date is not honoured
 * (the gateway sends delta-seconds), the same rule as the Python host. */
export function retryAfterSeconds(headers) {
    const raw = headers?.get?.("Retry-After") ?? null;
    if (raw === null || raw.trim() === "")
        return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : undefined;
}
// One deadline over headers AND body (D43): three minutes covers the largest
// public-data object at a slow link; the Python twin uses the same default.
// A request WITH a body is timed by the send guard instead (#556): the stall
// guard and the kernel's size-scaled budget while the body is sent, and this
// timeout for the answer after its last byte.
const DEFAULT_TIMEOUT_MS = 180_000;
/** Release an unread error/redirect body without delaying error delivery. */
export function cancelResponseBody(response) {
    try {
        void response.body?.cancel().catch(() => undefined);
    }
    catch {
        // Cleanup must not replace the classified transport error.
    }
}
function mutation(method) {
    return method !== "GET" && method !== "HEAD";
}
function safePhase(method, dispatched) {
    if (!dispatched)
        return "pre-dispatch";
    return mutation(method) ? "unknown-acceptance" : "after-dispatch";
}
function normalizeBaseUrl(input) {
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new TypeError("gateway base URL must be an absolute HTTP(S) URL");
    }
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new TypeError("gateway base URL must be an uncredentialed HTTP(S) URL without query or fragment");
    }
    const path = url.pathname === "/" ? "" : trimTrailingSlashes(url.pathname);
    return { origin: url.origin, path };
}
function decodedPath(raw) {
    let current = raw;
    for (let pass = 0; pass < 8; pass += 1) {
        let next;
        try {
            next = decodeURIComponent(current);
        }
        catch {
            throw new TypeError("gateway path contains invalid percent encoding");
        }
        if (next === current)
            return current;
        current = next;
    }
    throw new TypeError("gateway path is encoded too many times");
}
function validatePath(path) {
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("#")) {
        throw new TypeError("gateway request requires an absolute-path reference without a fragment");
    }
    const rawPath = path.split("?", 1)[0];
    const decoded = decodedPath(rawPath);
    const control = /[\u0000-\u001f\u007f]/;
    if (control.test(rawPath) || control.test(decoded)) {
        throw new TypeError("gateway path contains a control character");
    }
    if (decoded.startsWith("//") || decoded.includes("\\")) {
        throw new TypeError("gateway path contains an unsafe separator");
    }
    if (decoded.split("/").some((part) => part === "." || part === "..")) {
        throw new TypeError("gateway path contains a dot segment");
    }
}
/**
 * A one-attempt gateway transport over the host's Fetch implementation.
 * It uses the standard AbortController signal through fetch and body reads,
 * and manual redirect handling so credentials never follow a redirect.
 *
 * @see https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://developer.mozilla.org/docs/Web/API/AbortController
 */
export class GatewayTransport {
    base;
    auth;
    fetch;
    sender;
    timeoutMs;
    constructor(options) {
        this.base = normalizeBaseUrl(options.baseUrl);
        this.auth = options.auth;
        const fetcher = resolveFetch(options.fetch);
        if (typeof fetcher !== "function")
            throw new TypeError("a fetch implementation is required");
        this.fetch = fetcher;
        // A gateway body carries credentials and may be a paid POST: never one a
        // runtime may send again to a redirect target.
        this.sender = bodySenderFor(fetcher);
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        requireTimeout(this.timeoutMs);
    }
    get baseUrl() { return `${this.base.origin}${this.base.path}`; }
    async requestBytes(path, options = {}) {
        return (await this.requestBytesWithHeaders(path, options)).content;
    }
    async requestBytesWithHeaders(path, options = {}) {
        const method = options.method ?? "GET";
        try {
            validatePath(path);
        }
        catch {
            throw new TransportError("gateway request path is invalid", "pre-dispatch", "validation", method);
        }
        const url = `${this.base.origin}${this.base.path}${path}`;
        const body = options.body;
        const limits = body === undefined ? undefined : sendLimits(body.byteLength, this.timeoutMs);
        const deadline = new Deadline(options.signal, this.timeoutMs);
        let dispatched = false;
        try {
            let auth;
            try {
                auth = await deadline.wait(() => this.auth());
            }
            catch (error) {
                if (error instanceof AuthPartitionChangedError)
                    throw error;
                const stopped = deadline.reason();
                throw new TransportError(stopped === "timeout" ? "gateway request timed out before dispatch" :
                    stopped === "aborted" ? "gateway request was aborted before dispatch" :
                        "gateway request authentication failed", "pre-dispatch", stopped ?? "auth", method);
            }
            const headers = new Headers(options.headers);
            for (const [name, value] of Object.entries(auth))
                headers.set(name, value);
            // A sent PAID POST (the only request with `beforeDispatch`) may already be
            // accepted and billed (#197). The caller's abort still cancels the fetch
            // through `request.signal`, which makes the outcome unknown, but it never
            // discards an answer already in hand. Free requests (presign, upload)
            // still stop at once on an abort.
            const sent = options.beforeDispatch !== undefined && mutation(method);
            if (deadline.controller.signal.aborted)
                throw new Error("request stopped");
            const response = await deadline.wait(() => {
                options.beforeDispatch?.();
                dispatched = true;
                if (limits === undefined || body === undefined) {
                    return this.fetch(url, { method, headers, redirect: "manual", signal: deadline.controller.signal });
                }
                return sendBody(this.sender, this.fetch, { url, method, headers, body, credentials: "same-origin" }, limits, deadline);
            }, sent);
            if (response.status >= 300 && response.status < 400) {
                cancelResponseBody(response);
                throw new TransportError("gateway request received a redirect", "response", "http", method, response.status);
            }
            if (!response.ok && options.acceptHttpErrors !== true) {
                cancelResponseBody(response);
                throw new TransportError(`gateway request received HTTP ${response.status}`, "response", "http", method, response.status, retryAfterSeconds(response.headers));
            }
            const buffer = await deadline.wait(() => response.arrayBuffer(), sent);
            return {
                content: new Uint8Array(buffer),
                headers: response.headers,
                status: response.status,
            };
        }
        catch (error) {
            if (error instanceof TransportError ||
                (error instanceof AuthPartitionChangedError && !dispatched))
                throw error;
            const stopped = deadline.reason();
            const reason = stopped ?? (dispatched ? "network" : "auth");
            const phase = safePhase(method, dispatched);
            const message = stopped === "timeout" ?
                (limits === undefined ? "gateway request timed out" : `gateway request timed out (${stopDetail(deadline, limits)})`) :
                stopped === "aborted" ? "gateway request was aborted" :
                    dispatched ? "gateway request failed after dispatch" : "gateway request failed before dispatch";
            throw new TransportError(message, phase, reason, method);
        }
        finally {
            deadline.close();
        }
    }
    async requestJson(path, options = {}) {
        const method = options.method ?? "GET";
        let body;
        try {
            if (options.body !== undefined) {
                const serialized = JSON.stringify(options.body);
                if (serialized === undefined)
                    throw new TypeError("JSON value has no wire form");
                body = new TextEncoder().encode(serialized);
            }
        }
        catch {
            throw new TransportError("gateway JSON request body is not serializable", "pre-dispatch", "validation", method);
        }
        const headers = { ...options.headers };
        if (body !== undefined)
            headers["Content-Type"] = "application/json";
        const request = {
            method,
            headers,
            ...(body === undefined ? {} : { body }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        };
        const bytes = await this.requestBytes(path, request);
        if (bytes.byteLength === 0)
            return undefined;
        try {
            return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        }
        catch {
            throw new TransportError("gateway response is not valid JSON", "response", "body", method);
        }
    }
}
