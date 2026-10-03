/**
 * The submit-path half of D224: a POST that carries an `Idempotency-Key`
 * (`area/retry-plan.ts`) is resent with the SAME key while the kernel's
 * `classifySubmitSend` says "resend". The kernel owns which answers resend,
 * the budget, and what is uncertain; this file only maps each send's outcome
 * to the kernel input and acts on the answer.
 *
 * An UNKEYED POST (no `idempotencyKey`) is unchanged: today's D59 single
 * attempt, straight to `uncertainSubmissions` on any ambiguous answer.
 *
 * `dispatchKeyed` is the ONE resend loop for both transports:
 * `internal/submission.ts` (JSON) and `internal/binary-submission.ts`
 * (binary) both call it; neither keeps a resend loop of its own.
 */
import { delay } from "./deadline.js";
import { SubmissionUncertainError } from "./submission.js";
import { retryAfterSeconds, TransportError } from "./transport.js";
import { requireCore } from "./core.js";
/** A 2xx whose body is not JSON: the job may exist, the answer was lost. */
function unreadableBody(response) {
    try {
        JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(response.content));
        return false;
    }
    catch {
        return true;
    }
}
async function resendDelay(sendsDone, retryAfterS, signal) {
    const seconds = requireCore().submitResendDelaySeconds(sendsDone, Math.random(), retryAfterS);
    try {
        await delay(seconds * 1_000, signal ?? new AbortController().signal);
    }
    catch {
        // A send already happened, so the job may exist: uncertain, not a pre-dispatch failure.
        throw new SubmissionUncertainError([]);
    }
}
/**
 * One POST, resent with the SAME `Idempotency-Key` while the kernel's
 * `classifySubmitSend` answers "resend" (D224). Each send's outcome is
 * mapped to the kernel input: the HTTP status; a transport error before the
 * request left (`before_send`) or after it may have (`after_send`); a 2xx
 * body that is not readable (`unreadable_2xx`). On "uncertain" this throws
 * `SubmissionUncertainError`; on "accepted" or "definite_fail" it returns
 * the response (a 4xx, including 409, goes to the caller's ordinary
 * rejection handling) or rethrows the transport error. An UNKEYED call
 * makes exactly one send and classifies nothing.
 */
export async function dispatchKeyed(options) {
    const keyed = options.idempotencyKey !== undefined;
    const core = requireCore();
    for (let sendsDone = 1;; sendsDone += 1) {
        let response;
        try {
            response = await options.gateway.requestBytesWithHeaders(options.endpointPath, {
                method: "POST",
                headers: options.headers,
                body: options.body,
                acceptHttpErrors: true,
                ...(options.beforeDispatch === undefined ? {} : { beforeDispatch: options.beforeDispatch }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
            });
        }
        catch (error) {
            if (!keyed || !(error instanceof TransportError))
                throw error;
            // An abort after a resend: an earlier send of this key may have landed.
            if (error.reason === "aborted")
                throw sendsDone > 1 ? new SubmissionUncertainError([]) : error;
            const answer = error.phase === "pre-dispatch" ? "before_send" : "after_send";
            const next = core.classifySubmitSend(answer, sendsDone);
            if (next === "uncertain")
                throw new SubmissionUncertainError([]);
            if (next !== "resend")
                throw error;
            await resendDelay(sendsDone, undefined, options.signal);
            continue;
        }
        if (!keyed)
            return response;
        const ok2xx = response.status >= 200 && response.status < 300;
        const next = ok2xx && unreadableBody(response)
            ? core.classifySubmitSend("unreadable_2xx", sendsDone)
            : core.classifySubmitSend("status", sendsDone, response.status);
        if (next === "uncertain")
            throw new SubmissionUncertainError([], response.status);
        if (next !== "resend")
            return response;
        await resendDelay(sendsDone, retryAfterSeconds(response.headers), options.signal);
    }
}
