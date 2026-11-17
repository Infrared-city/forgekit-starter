import { JobResponseMismatchError } from "../internal/job-response.js";
import { SubmissionUncertainError } from "../internal/submission.js";
import { TransportError } from "../internal/transport.js";
/**
 * The raw facts of a failed request: did the paid request leave, which HTTP
 * status came back, was a 2xx body unreadable. The kernel run engine reads
 * the facts and decides (`ir_geo::request_failure`); any other error is the
 * host's own and is thrown again.
 */
export function rawAnswer(error) {
    if (error instanceof JobResponseMismatchError)
        return { phase: "after_send", unreadable_2xx: true };
    if (error instanceof SubmissionUncertainError) {
        return error.status === undefined
            ? { phase: "after_send", unreadable_2xx: true } : { phase: "after_send", status: error.status };
    }
    if (!(error instanceof TransportError))
        throw error;
    if (error.phase === "pre-dispatch")
        return { phase: "before_send" };
    return error.status === undefined ? { phase: "after_send" } : { phase: "after_send", status: error.status };
}
