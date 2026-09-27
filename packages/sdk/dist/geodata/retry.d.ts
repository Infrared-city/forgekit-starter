/**
 * A bounded, content-safe retry for ONE public byte-range read.
 *
 * The live gates showed two transient answers on roughly one range read in
 * 2,400: the anonymous Overture bucket resets a connection, and R2 answers a
 * `Range` request with `200` on a cold multi-gigabyte object. Both are the
 * network being the network. Neither is a reason to fail a tile, and neither
 * was retried here — only the static-weather reader had a retry of its own.
 *
 * Three rules make a retry safe rather than merely convenient:
 *
 * 1. **Bounded.** Three attempts in total, a jittered 0.25-1 s wait between
 *    them, and every wait runs under the request's own {@link Deadline}. A
 *    read cannot become slower than the deadline the caller already accepted.
 * 2. **Only transient answers.** A connection that failed, an aborted body,
 *    HTTP 5xx, 429, and a `200` answer to a `Range` request. Nothing else. A
 *    404 is an answer, a 412 is an answer, and a body that breaks the range
 *    contract is an answer: asking again only repeats them.
 * 3. **Same object, or a loud error.** Every retry carries `If-Match` with
 *    the entity tag of the logical read — the caller's tag, or the tag the
 *    first answer of this read carried. An answer under a different tag is a
 *    typed stale error, never bytes from a file that was replaced between two
 *    attempts. This is the transport half of "keep content identity in retry
 *    records".
 */
import { type Logger } from "../logger.js";
/** Attempts for one read, the first one included. */
export declare const MAX_RANGE_ATTEMPTS = 3;
/** Shortest wait between two attempts. */
export declare const MIN_BACKOFF_MS = 250;
/** Longest wait between two attempts. */
export declare const MAX_BACKOFF_MS = 1000;
/** Why one attempt is being made again. Logged, never guessed at. */
export type RetryReason = "connection" | "server" | "throttled" | "whole-object";
/**
 * The retry state of one logical range read.
 *
 * One instance per `read()` call: it counts the attempts, holds the entity
 * tag every attempt must match, and decides — once per failure — whether
 * there is anything to gain by asking again.
 */
export declare class RangeRetry {
    private readonly url;
    private readonly logger;
    /** Attempts already finished. */
    private attempts;
    /** A `200` answer to a `Range` request is asked again at most once. */
    private wholeObjectRetries;
    private tag;
    constructor(url: string, callerIfMatch: string | undefined, logger?: Logger);
    /** `If-Match` for the next attempt: the entity tag of the logical read. */
    headers(): Record<string, string>;
    /**
     * Record the entity tag an answer carried, or refuse the answer.
     *
     * The first answer of a read that named no tag pins one, so a retry cannot
     * silently read a different file. A later answer under another tag is the
     * object having been replaced under the read — the same event a 412 names,
     * reported the same way, for a host that ignores `If-Match`.
     */
    observe(etag: string | undefined): void;
    /**
     * True when a `200` answer to this `Range` request is worth asking again.
     *
     * Read BEFORE the body: a `200` means the server ignored the range and is
     * offering the whole object, which on the world FlatGeobufs is gigabytes.
     * Asking again costs one request; reading it first costs up to the 8 MiB
     * cap. When this is false — the one re-ask is spent, or no attempt is left
     * — the answer falls to the existing whole-object rule, which accepts a
     * small object and refuses a large one.
     */
    willAskAgainForWholeObject(): boolean;
    /**
     * The wait before the next attempt, or `undefined` when the read must fail.
     *
     * Called once per failed attempt. It counts the attempt, so a caller that
     * asks twice about one failure gets one retry, not two.
     */
    next(error: unknown): number | undefined;
    /** Attempts finished so far — the evidence a gate run reports. */
    get attemptsMade(): number;
    private reasonFor;
}
