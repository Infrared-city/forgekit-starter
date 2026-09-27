import { cancelResponseBody, TransportError } from "./transport.js";
import { Deadline, requireTimeout } from "./deadline.js";
import { resolveFetch } from "./fetch.js";
/**
 * Download one presigned HTTPS object without gateway authentication.
 * Redirects are manual because a redirected signed URL needs a separate,
 * reviewed origin and query policy. The API deliberately accepts no headers.
 * Uses the standard portable Fetch and AbortController APIs available in the
 * browser, Workers, and the supported Node 18+ runtime.
 *
 * @see https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://nodejs.org/api/globals.html#fetch
 */
export async function downloadPresignedBytes(input, options = {}) {
    return (await downloadPresigned(input, options)).content;
}
export async function downloadPresigned(input, options = {}) {
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new TypeError("presigned download URL must be an absolute HTTPS URL");
    }
    if (url.protocol !== "https:" || url.username || url.password) {
        throw new TypeError("presigned download URL must be uncredentialed HTTPS");
    }
    const fetcher = resolveFetch(options.fetch);
    if (typeof fetcher !== "function")
        throw new TypeError("a fetch implementation is required");
    const timeoutMs = options.timeoutMs ?? 180_000;
    requireTimeout(timeoutMs);
    const deadline = new Deadline(options.signal, timeoutMs);
    let dispatched = false;
    try {
        const response = await deadline.wait(() => {
            dispatched = true;
            return fetcher(url.href, {
                method: "GET",
                credentials: "omit",
                redirect: "manual",
                signal: deadline.controller.signal,
            });
        });
        if (response.status >= 300 && response.status < 400) {
            cancelResponseBody(response);
            throw new TransportError("presigned download received a redirect", "response", "http", "GET", response.status);
        }
        if (!response.ok) {
            cancelResponseBody(response);
            throw new TransportError(`presigned download received HTTP ${response.status}`, "response", "http", "GET", response.status);
        }
        return {
            content: new Uint8Array(await deadline.wait(() => response.arrayBuffer())),
            contentType: response.headers.get("Content-Type") ?? "",
        };
    }
    catch (error) {
        if (error instanceof TransportError)
            throw error;
        const reason = deadline.reason() ?? (dispatched ? "network" : "validation");
        const phase = dispatched ? "after-dispatch" : "pre-dispatch";
        const message = reason === "timeout" ? "presigned download timed out" :
            reason === "aborted" ? "presigned download was aborted" : "presigned download failed";
        throw new TransportError(message, phase, reason, "GET");
    }
    finally {
        deadline.close();
    }
}
