import { GeodataFetchError } from "../geodata/errors.js";
import { requireCore } from "./core.js";
import { delay } from "./deadline.js";
import { TransportError } from "./transport.js";
/** The raw facts of a failed call, or `undefined` for an error that is not ours to retry. */
function factsOf(error) {
    if (error instanceof TransportError) {
        if (error.phase === "pre-dispatch")
            return { phase: "before_send" };
        return {
            phase: "after_send",
            ...(error.status === undefined ? {} : { status: error.status }),
            ...(error.retryAfterS === undefined ? {} : { retryAfterS: error.retryAfterS }),
        };
    }
    // A status answer, or a failed connection (`cause` set). An over-cap or
    // unreadable body carries neither and is not asked again.
    if (error instanceof GeodataFetchError && (error.status !== undefined || error.cause !== undefined)) {
        return { phase: "after_send", ...(error.status === undefined ? {} : { status: error.status }) };
    }
    return undefined;
}
/**
 * Run `call`; on a failure ask the kernel retry table for the wait and try
 * again, or throw the failure when the table says give up. The caller's
 * abort ends the loop at once.
 */
export async function withHostRetry(request, call, options = {}) {
    for (let tries = 1;; tries += 1) {
        try {
            return await call();
        }
        catch (error) {
            const facts = options.signal?.aborted === true ? undefined : factsOf(error);
            if (facts === undefined)
                throw error;
            const waitS = requireCore().hostRetryWaitSeconds(request, facts.phase, facts.status, tries, Math.random(), facts.retryAfterS);
            if (waitS === undefined)
                throw error;
            options.logger?.warn(`${request} retry ${tries + 1}: wait ${waitS.toFixed(2)} s`);
            try {
                await delay(waitS * 1_000, options.signal ?? new AbortController().signal);
            }
            catch {
                if (error instanceof TransportError) {
                    throw new TransportError("request was aborted while waiting to retry", "pre-dispatch", "aborted", error.method);
                }
                throw error;
            }
        }
    }
}
