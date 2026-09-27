/**
 * A stall watch for ONE attempt of a retried public read.
 *
 * The read deadline (`DEFAULT_PUBLIC_TIMEOUT_MS`, three minutes) bounds the
 * whole read, the retries included. It does not end ONE attempt that stops
 * sending data: a stalled Overture S3 connection held the read for the full
 * three minutes and then failed it, with no retry. The Python host has a
 * 60 s socket read timeout (`DEFAULT_TIMEOUT`), so there a stall is a failed
 * attempt and is asked again. This is the TypeScript twin: an attempt that
 * receives no headers and no body bytes for {@link STALL_TIMEOUT_MS} is
 * aborted, and the retry treats it as a failed connection.
 *
 * It is an IDLE timer, not a total one: every body chunk restarts it, so a
 * slow read that makes progress is never cut.
 */
/** Longest time one attempt may go without headers or body bytes. */
export const STALL_TIMEOUT_MS = 60_000;
export class StallWatch {
    parent;
    ms;
    controller = new AbortController();
    timer;
    fired = false;
    // The caller's abort or the read deadline is not a stall: stop the timer.
    onParentAbort = () => {
        clearTimeout(this.timer);
        this.controller.abort();
    };
    constructor(parent, ms) {
        this.parent = parent;
        this.ms = ms;
        if (parent.aborted) {
            this.controller.abort();
            return;
        }
        parent.addEventListener("abort", this.onParentAbort, { once: true });
        this.touch();
    }
    /** True when this attempt ended because no data arrived. */
    get stalled() {
        return this.fired;
    }
    /** Data arrived: restart the idle timer. */
    touch() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.fired = true;
            this.controller.abort();
        }, this.ms);
    }
    /**
     * Restart the timer on every body chunk of `response`.
     *
     * The body is replaced by a stream that forwards each chunk, so the
     * readers downstream (`readCappedBody`, `cancelBody`) are unchanged. The
     * status, headers and response type stay those of the real answer.
     */
    watch(response) {
        const body = response.body;
        if (body === null || typeof body.getReader !== "function")
            return response;
        // A runtime that does not let `body` be replaced keeps the attempt
        // unwatched after its headers; the read deadline still bounds it.
        const own = Object.getOwnPropertyDescriptor(response, "body");
        if (!Object.isExtensible(response) || (own !== undefined && own.configurable !== true)) {
            clearTimeout(this.timer);
            return response;
        }
        const reader = body.getReader();
        const forwarded = new ReadableStream({
            pull: async (controller) => {
                const step = await reader.read();
                if (step.done) {
                    controller.close();
                    return;
                }
                this.touch();
                controller.enqueue(step.value);
            },
            cancel: (reason) => reader.cancel(reason),
        });
        Object.defineProperty(response, "body", { value: forwarded });
        return response;
    }
    close() {
        clearTimeout(this.timer);
        this.parent.removeEventListener("abort", this.onParentAbort);
    }
}
