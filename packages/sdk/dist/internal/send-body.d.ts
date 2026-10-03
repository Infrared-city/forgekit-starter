/**
 * Send one request body under the send guard (#556). The ONE seam every body
 * upload goes through: the presigned PUT (`upload.ts`) and every gateway
 * request with a body (`transport.ts`: the inline job POST, the binary
 * submit, the presign calls).
 */
import { type BodyRequest, type BodySender } from "./body-sender.js";
import type { Deadline } from "./deadline.js";
import type { SendLimits } from "./send-guard.js";
/**
 * The kernel's send budget and stall guard (`ir_geo::send_budget`, the one
 * source the Python SDK reads too) for a body of `totalBytes`, and
 * `responseMs` for the answer after the last byte.
 */
export declare function sendLimits(totalBytes: number, responseMs: number): SendLimits;
/**
 * Dispatch `request` through `sender`. From here the deadline's own timer is
 * replaced by the guard: a stall, the spent budget or the response window
 * stops the request through the deadline, exactly as its timeout did. An
 * EMPTY body has nothing to send: it goes through `fetcher` and keeps the
 * deadline's own timer, as a request without a body does.
 */
export declare function sendBody(sender: BodySender, fetcher: typeof fetch, request: Omit<BodyRequest, "signal">, limits: SendLimits, deadline: Deadline): Promise<Response>;
/** Which rule stopped a guarded request, for the error message. */
export declare function stopDetail(deadline: Deadline, limits: SendLimits): string;
