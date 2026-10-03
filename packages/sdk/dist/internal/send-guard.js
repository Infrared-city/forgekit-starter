/**
 * The upload send budget (#529, #556): ONE state machine for every request
 * that sends a body, whatever runtime sends it.
 *
 * Two rules stop a send, and nothing else does:
 *
 * 1. **Stall guard.** No body byte moved for `stallMs`: stop. A slow upload
 *    that still moves never trips it. It bounds the connect as well, because
 *    no byte moves before the connection exists.
 * 2. **Total budget.** The body is not sent `budgetMs` after the first byte
 *    was offered: stop. `budgetMs` scales with the body size.
 *
 * When the last body byte is sent, both rules end, so the complete body never
 * causes a timeout; the wait for the response then gets its own fresh window,
 * `responseMs` (the request's timeout). No TypeScript sender sends a body
 * twice (a redirect is refused), so there is no rewind here. The numbers come from the kernel (`sendLimits` in `send-body.ts`).
 *
 * A sender that cannot see byte progress (a caller's own `fetch`, or a
 * gateway request in a browser, see `body-sender.ts`) reports nothing. Then no stall is visible and the whole request, body and response,
 * gets one window: `budgetMs + responseMs`.
 */
/** The longest delay `setTimeout` keeps; a longer one would fire at once. */
export const MAX_TIMEOUT_MS = 2_147_483_647;
export class SendGuard {
    limits;
    onStop;
    phase = "idle";
    sent = 0;
    stopped;
    timers = new Map();
    constructor(limits, onStop) {
        this.limits = limits;
        this.onStop = onStop;
    }
    /** Why the guard stopped the send, if it did. */
    get stop() {
        return this.stopped;
    }
    /**
     * Arm the guard at dispatch. A sender that reports byte progress gets the
     * stall guard and the budget; one that cannot gets one window for body and
     * response together (see the module comment).
     */
    start(observesProgress) {
        if (this.phase !== "idle")
            return;
        this.phase = "sending";
        if (observesProgress) {
            this.arm("stall", this.limits.stallMs);
            this.arm("budget", this.limits.budgetMs);
        }
        else {
            this.arm("window", this.limits.budgetMs + this.limits.responseMs);
        }
    }
    progress(sentBytes) {
        if (this.phase !== "sending")
            return;
        if (sentBytes !== this.sent)
            this.arm("stall", this.limits.stallMs);
        this.sent = sentBytes;
        if (sentBytes >= this.limits.totalBytes)
            this.finished();
    }
    /** The last body byte is sent, or the server answered: end both rules, start the response window. */
    finished() {
        if (this.phase !== "sending")
            return;
        this.phase = "sent";
        this.clear("stall");
        this.clear("budget");
        this.arm("response", this.limits.responseMs);
    }
    close() {
        for (const timer of this.timers.values())
            clearTimeout(timer);
        this.timers.clear();
    }
    arm(why, ms) {
        this.clear(why);
        this.timers.set(why, setTimeout(() => {
            this.phase = "stopped";
            this.stopped = why;
            this.close();
            this.onStop(why);
        }, Math.min(ms, MAX_TIMEOUT_MS)));
    }
    clear(why) {
        const timer = this.timers.get(why);
        if (timer !== undefined)
            clearTimeout(timer);
        this.timers.delete(why);
    }
}
