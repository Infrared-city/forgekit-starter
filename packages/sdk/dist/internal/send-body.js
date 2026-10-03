/**
 * Send one request body under the send guard (#556). The ONE seam every body
 * upload goes through: the presigned PUT (`upload.ts`) and every gateway
 * request with a body (`transport.ts`: the inline job POST, the binary
 * submit, the presign calls).
 */
import { fetchSender } from "./body-sender.js";
import { requireCore } from "./core.js";
/**
 * The kernel's send budget and stall guard (`ir_geo::send_budget`, the one
 * source the Python SDK reads too) for a body of `totalBytes`, and
 * `responseMs` for the answer after the last byte.
 */
export function sendLimits(totalBytes, responseMs) {
    return {
        totalBytes,
        stallMs: requireCore().sendStallSeconds() * 1000,
        budgetMs: requireCore().sendBudgetSeconds(totalBytes) * 1000,
        responseMs,
    };
}
const NO_PROGRESS = { progress: () => undefined, finished: () => undefined };
/**
 * Dispatch `request` through `sender`. From here the deadline's own timer is
 * replaced by the guard: a stall, the spent budget or the response window
 * stops the request through the deadline, exactly as its timeout did. An
 * EMPTY body has nothing to send: it goes through `fetcher` and keeps the
 * deadline's own timer, as a request without a body does.
 */
export function sendBody(sender, fetcher, request, limits, deadline) {
    const signal = deadline.controller.signal;
    if (limits.totalBytes === 0)
        return fetchSender(fetcher).send({ ...request, signal }, NO_PROGRESS);
    const guard = deadline.guardSend(limits, sender.observesProgress);
    return sender.send({ ...request, signal }, guard);
}
/** Which rule stopped a guarded request, for the error message. */
export function stopDetail(deadline, limits) {
    const seconds = (ms) => `${Math.round(ms / 1000)} s`;
    switch (deadline.sendStop()) {
        case "stall": return `no body byte moved for ${seconds(limits.stallMs)}`;
        case "budget": return `the ${seconds(limits.budgetMs)} send budget for ${limits.totalBytes} bytes ran out`;
        case "response": return `no answer ${seconds(limits.responseMs)} after the body was sent`;
        case "window": return `no answer within ${seconds(limits.budgetMs + limits.responseMs)} ` +
            `(the send budget for ${limits.totalBytes} bytes plus the request timeout)`;
        default: return "before the body was sent";
    }
}
