import { delay } from "./deadline.js";
import { requireCore } from "./core.js";
import { TransportError } from "./transport.js";
/**
 * Result download retry (D224). The kernel decides, with the same rule as a
 * keyed submit: a 429 is retried with no limit, a 403 (expired presign), a 5xx
 * or a network failure inside the kernel's send budget, each with the kernel's
 * delay. A GET is idempotent, so a spent budget is a plain failure.
 *
 * A timeout is NOT retried: it already spent the whole download deadline.
 * An abort is the caller's own decision. Any other 4xx is a real answer.
 */
export function isRetryableDownloadError(error) {
    if (!(error instanceof TransportError))
        return false;
    if (error.status === undefined)
        return error.reason === "network";
    return error.status === 403 || error.status === 429 || (error.status >= 500 && error.status < 600);
}
/** True when the kernel says send the download again. */
export function shouldRetryDownload(error, sendsDone) {
    if (!isRetryableDownloadError(error))
        return false;
    const status = error.status;
    const next = status === 429 || (status !== undefined && status >= 500)
        ? requireCore().classifySubmitSend("status", sendsDone, status)
        : requireCore().classifySubmitSend("after_send", sendsDone);
    return next === "resend";
}
/**
 * Wait before the next attempt, and report a caller's abort the way every
 * other stopped download reports it. `delay` rejects with a bare `Error`,
 * which would reach the caller as neither a `TransportError` nor an abort.
 */
export async function pauseBeforeRetry(sendsDone, error, signal) {
    const retryAfterS = error instanceof TransportError ? error.retryAfterS : undefined;
    const seconds = requireCore().submitResendDelaySeconds(sendsDone, Math.random(), retryAfterS);
    try {
        await delay(seconds * 1_000, signal ?? new AbortController().signal);
    }
    catch {
        throw new TransportError("presigned download was aborted", "after-dispatch", "aborted", "GET");
    }
}
