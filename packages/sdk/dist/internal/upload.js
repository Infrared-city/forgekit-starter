import { bodySenderFor } from "./body-sender.js";
import { Deadline, requireTimeout } from "./deadline.js";
import { sendBody, sendLimits, stopDetail } from "./send-body.js";
import { cancelResponseBody, TransportError, } from "./transport.js";
function signedHttps(input) {
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new TypeError("presigned upload URL must be an absolute HTTPS URL");
    }
    if (url.protocol !== "https:" || url.username || url.password || url.hash) {
        throw new TypeError("presigned upload URL must be uncredentialed HTTPS without a fragment");
    }
    return url.href;
}
/**
 * Upload once to a signed URL without gateway credentials or redirects.
 *
 * The body is sent under the send guard (`send-guard.ts`, #556): a moving
 * upload is never stopped, a stalled one is, and the whole body gets the
 * kernel's size-scaled budget; `timeoutMs` bounds the answer after the last
 * byte.
 */
export async function uploadPresignedZip(input, content, options) {
    const url = signedHttps(input);
    requireTimeout(options.timeoutMs);
    const limits = sendLimits(content.byteLength, options.timeoutMs);
    // A presigned PUT is idempotent and carries no credentials: safe to resend.
    const sender = bodySenderFor(options.fetch, { url });
    const deadline = new Deadline(options.signal, options.timeoutMs);
    let dispatched = false;
    try {
        const response = await deadline.wait(() => {
            dispatched = true;
            return sendBody(sender, options.fetch, {
                url,
                method: "PUT",
                headers: new Headers({ "Content-Type": "application/zip" }),
                body: content,
                credentials: "omit",
            }, limits, deadline);
        });
        if (response.status >= 300 && response.status < 400) {
            cancelResponseBody(response);
            throw new TransportError("presigned upload received a redirect", "response", "http", "PUT", response.status);
        }
        if (!response.ok) {
            cancelResponseBody(response);
            throw new TransportError(`presigned upload received HTTP ${response.status}`, "response", "http", "PUT", response.status);
        }
        await deadline.wait(() => response.arrayBuffer());
    }
    catch (error) {
        if (error instanceof TransportError)
            throw error;
        const stopped = deadline.reason();
        throw new TransportError(stopped === "timeout" ? `presigned upload timed out (${stopDetail(deadline, limits)})` :
            stopped === "aborted" ? "presigned upload was aborted" : "presigned upload failed", dispatched ? "unknown-acceptance" : "pre-dispatch", stopped ?? (dispatched ? "network" : "validation"), "PUT");
    }
    finally {
        deadline.close();
    }
}
