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
import { GeodataError, GeodataRangeError } from "./errors.js";
import { consoleLogger } from "../logger.js";
/** Attempts for one read, the first one included. */
export const MAX_RANGE_ATTEMPTS = 3;
/** Shortest wait between two attempts. */
export const MIN_BACKOFF_MS = 250;
/** Longest wait between two attempts. */
export const MAX_BACKOFF_MS = 1_000;
/** The path of a URL, with no query: a log line must carry no credential. */
function pathOf(url) {
    try {
        return new URL(url).pathname;
    }
    catch {
        return url;
    }
}
/** True for a status a public host answers when it is briefly unwell. */
function transientStatus(status) {
    return status === 429 || (status >= 500 && status < 600);
}
/**
 * The retry state of one logical range read.
 *
 * One instance per `read()` call: it counts the attempts, holds the entity
 * tag every attempt must match, and decides — once per failure — whether
 * there is anything to gain by asking again.
 */
export class RangeRetry {
    url;
    logger;
    /** Attempts already finished. */
    attempts = 0;
    /** A `200` answer to a `Range` request is asked again at most once. */
    wholeObjectRetries = 0;
    tag;
    constructor(url, callerIfMatch, logger = consoleLogger) {
        this.url = url;
        this.logger = logger;
        this.tag = callerIfMatch;
    }
    /** `If-Match` for the next attempt: the entity tag of the logical read. */
    headers() {
        return this.tag === undefined ? {} : { "If-Match": this.tag };
    }
    /**
     * Record the entity tag an answer carried, or refuse the answer.
     *
     * The first answer of a read that named no tag pins one, so a retry cannot
     * silently read a different file. A later answer under another tag is the
     * object having been replaced under the read — the same event a 412 names,
     * reported the same way, for a host that ignores `If-Match`.
     */
    observe(etag) {
        if (etag === undefined || etag === "")
            return;
        if (this.tag === undefined) {
            this.tag = etag;
            return;
        }
        if (this.tag !== etag) {
            throw new GeodataRangeError(this.url, `the object changed between two attempts of one read (entity tag ` +
                `${this.tag} became ${etag})`, 412);
        }
    }
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
    willAskAgainForWholeObject() {
        return this.wholeObjectRetries === 0 && this.attempts + 1 < MAX_RANGE_ATTEMPTS;
    }
    /**
     * The wait before the next attempt, or `undefined` when the read must fail.
     *
     * Called once per failed attempt. It counts the attempt, so a caller that
     * asks twice about one failure gets one retry, not two.
     */
    next(error) {
        this.attempts += 1;
        if (this.attempts >= MAX_RANGE_ATTEMPTS)
            return undefined;
        const reason = this.reasonFor(error);
        if (reason === undefined)
            return undefined;
        if (reason === "whole-object")
            this.wholeObjectRetries += 1;
        const waitMs = MIN_BACKOFF_MS + Math.random() * (MAX_BACKOFF_MS - MIN_BACKOFF_MS);
        // One line per retry: which attempt, why, and which object. The path
        // carries no query, and a public host never receives the API key, so
        // there is nothing here a log may not hold.
        this.logger.warn(`range read retry attempt=${this.attempts + 1}/${MAX_RANGE_ATTEMPTS} ` +
            `reason=${reason} path=${pathOf(this.url)} ` +
            `wait_ms=${Math.round(waitMs)}`);
        return waitMs;
    }
    /** Attempts finished so far — the evidence a gate run reports. */
    get attemptsMade() {
        return this.attempts;
    }
    reasonFor(error) {
        // Not a typed answer at all: the fetch was refused, the connection was
        // reset, or the body stopped before it completed. That is the failure
        // this retry exists for.
        if (!(error instanceof GeodataError))
            return "connection";
        const status = error.status;
        if (status === undefined)
            return undefined;
        if (status === 200) {
            return this.wholeObjectRetries === 0 ? "whole-object" : undefined;
        }
        if (status === 429)
            return "throttled";
        if (transientStatus(status))
            return "server";
        // Every other answer — 404, 412, a broken range contract — is a decision,
        // not a hiccup.
        return undefined;
    }
}
