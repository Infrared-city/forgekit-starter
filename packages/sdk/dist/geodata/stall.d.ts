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
export declare const STALL_TIMEOUT_MS = 60000;
export declare class StallWatch {
    private readonly parent;
    private readonly ms;
    readonly controller: AbortController;
    private timer;
    private fired;
    private readonly onParentAbort;
    constructor(parent: AbortSignal, ms: number);
    /** True when this attempt ended because no data arrived. */
    get stalled(): boolean;
    /** Data arrived: restart the idle timer. */
    touch(): void;
    /**
     * Restart the timer on every body chunk of `response`.
     *
     * The body is replaced by a stream that forwards each chunk, so the
     * readers downstream (`readCappedBody`, `cancelBody`) are unchanged. The
     * status, headers and response type stay those of the real answer.
     */
    watch(response: Response): Response;
    close(): void;
}
