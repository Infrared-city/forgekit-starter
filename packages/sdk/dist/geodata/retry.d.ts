import { type Logger } from "../logger.js";
/**
 * Total number of attempts (`3`) made for one range read, the first one
 * included.
 *
 * @category Geodata
 */
export declare const MAX_RANGE_ATTEMPTS = 3;
/**
 * Shortest wait, in milliseconds (`250`), between two attempts. The actual
 * wait is a random value between this and {@link MAX_BACKOFF_MS}.
 *
 * @category Geodata
 */
export declare const MIN_BACKOFF_MS = 250;
/**
 * Longest wait, in milliseconds (`1000`), between two attempts.
 *
 * @category Geodata
 */
export declare const MAX_BACKOFF_MS = 1000;
/**
 * Why a range read is being attempted again: the connection failed, the
 * server answered with an error status, the server throttled the request, or
 * the server answered a range request with the whole object.
 *
 * @category Geodata
 */
export type RetryReason = "connection" | "server" | "throttled" | "whole-object";
/**
 * The retry state of one range read.
 *
 * Use one instance per read. It counts the attempts, holds the entity tag
 * every attempt must match, and decides, once per failure, whether asking
 * again is worthwhile. Only transient failures are retried: a failed
 * connection, HTTP 5xx, HTTP 429, and a `200` answer to a range request. At
 * most {@link MAX_RANGE_ATTEMPTS} attempts are made.
 *
 * @category Geodata
 */
export declare class RangeRetry {
    private readonly url;
    private readonly logger;
    /** Attempts already finished. */
    private attempts;
    /** A `200` answer to a `Range` request is asked again at most once. */
    private wholeObjectRetries;
    private tag;
    /**
     * @param url - The object being read; only its path is logged.
     * @param callerIfMatch - The entity tag the caller requires, if any.
     * @param logger - Where each retry is reported. Defaults to the console.
     */
    constructor(url: string, callerIfMatch: string | undefined, logger?: Logger);
    /** The `If-Match` header for the next attempt: the entity tag of this read, if known. */
    headers(): Record<string, string>;
    /**
     * Record the entity tag an answer carried, or refuse the answer.
     *
     * The first answer of a read that named no tag pins one, so a retry cannot
     * silently read a different file.
     *
     * @param etag - The entity tag of the answer, if it carried one.
     * @throws {GeodataRangeError} when the tag differs from the one this read is
     *   pinned to, meaning the object was replaced during the read (status 412).
     */
    observe(etag: string | undefined): void;
    /**
     * Whether a `200` answer to this range request is worth asking again.
     *
     * A `200` means the server ignored the range and is offering the whole
     * object. This is asked before the body is read, because asking again costs
     * one request while reading a large body costs much more. It is `false`
     * once the single re-ask is spent or no attempt is left; the answer is then
     * accepted if the object is small and refused if it is large.
     *
     * @returns `true` when the range request should be sent again.
     */
    willAskAgainForWholeObject(): boolean;
    /**
     * The wait before the next attempt, or `undefined` when the read must fail.
     *
     * Call once per failed attempt: each call counts an attempt, and each retry
     * is logged as a warning.
     *
     * @param error - The failure of the attempt that just finished.
     * @returns The wait in milliseconds, or `undefined` when the failure is not
     *   retryable or the attempts are used up.
     */
    next(error: unknown): number | undefined;
    /** The number of attempts finished so far. */
    get attemptsMade(): number;
    private reasonFor;
}
