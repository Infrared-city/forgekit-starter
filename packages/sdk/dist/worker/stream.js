// Maintainer note (not published): the page side of `WorkerClient.runAreaStream`, and two
// small helpers of the worker calls. Internal to the worker entry.
import { restoreError } from "./protocol.js";
/** Run a page observer; its error never ends the call (the worker owns the run). */
export function observe(callback) {
    try {
        callback();
    }
    catch {
        // An observer error must not end the call: the worker still owns the run.
    }
}
/** The message of an abort reason, as it crosses to the worker. */
export function abortReason(signal) {
    const reason = signal.reason;
    return typeof reason?.message === "string" ? reason.message : "aborted";
}
/**
 * The items of a worker `runAreaStream` call, in the order the worker sends them. `start`
 * makes the call with an item hook and a signal; the hook's `took` tells the worker the
 * caller took the item, and only then does the worker send the next one. Leaving the loop
 * early (`break`) or `outer` aborts the call, and the abort crosses to the worker.
 */
export async function* workerStream(start, outer) {
    const controller = new AbortController();
    const stop = () => controller.abort(outer?.reason);
    if (outer?.aborted === true)
        stop();
    outer?.addEventListener("abort", stop, { once: true });
    const queue = [];
    let wake;
    let end;
    const call = start((message, took) => {
        const { index, analysisType } = message;
        queue.push({ took, item: message.error === undefined
                ? { index, analysisType, result: message.result }
                : { index, analysisType, error: restoreError(message.error) } });
        wake?.();
    }, controller.signal).then(() => { end = {}; wake?.(); }, (error) => { end = { error }; wake?.(); });
    try {
        for (;;) {
            while (queue.length > 0) {
                const { item, took } = queue.shift();
                took();
                yield item;
            }
            if (end !== undefined) {
                if ("error" in end)
                    throw end.error;
                return;
            }
            await new Promise((resolve) => { wake = resolve; });
            wake = undefined;
        }
    }
    finally {
        outer?.removeEventListener("abort", stop);
        if (end === undefined)
            controller.abort(new DOMException("the stream was closed", "AbortError"));
        await call;
    }
}
