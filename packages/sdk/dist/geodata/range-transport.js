/**
 * The byte-range seam: one remote object, read a window at a time.
 *
 * `http.ts` owns the request itself — the allow-list, the deadline, the
 * credential-free headers. What a `Range` answer must prove, what is worth
 * asking again, the waits and the entity-tag pin are the kernel's
 * (`rangeReadStep`, the rule the Python host calls too); this module sends
 * the facts of each answer and reads the body under the cap it is given.
 */
import { GeodataError, GeodataFetchError, GeodataRangeError } from "./errors.js";
import { withRequest } from "./http.js";
import { cancelBody, readCappedBody } from "../internal/capped-body.js";
import { requireCore } from "../internal/core.js";
import { consoleLogger } from "../logger.js";
/**
 * Create a {@link RangeTransport} that reads objects over HTTP `Range` requests,
 * with a per-instance object-size cache.
 *
 * Requests go only to allowed public hosts, carry no credentials and are
 * retried on transient failures.
 *
 * @param options - Fetch, abort signal, timeout, logger and stall timeout.
 * @returns A transport; reuse it for all reads of one area.
 * @category Geodata
 */
export function httpRangeTransport(options = {}) {
    const sizes = new Map();
    async function ranged(url, start, endExclusive, read) {
        const range = endExclusive === undefined ? `bytes=${start}-` : `bytes=${start}-${endExclusive - 1}`;
        const state = new KernelRangeRead(url, start, endExclusive, read?.ifMatch, options.logger);
        const answer = await withRequest(url, { Range: range, "Accept-Encoding": "identity" }, options, (response) => state.answer(response), state);
        if (answer.totalSize !== undefined)
            sizes.set(url, answer.totalSize);
        return answer;
    }
    return {
        async byteLength(url) {
            const cached = sizes.get(url);
            if (cached !== undefined)
                return cached;
            // One byte, read for its `Content-Range` total — never a bodyless GET
            // of a multi-gigabyte object.
            const first = await ranged(url, 0, 1, undefined);
            const total = first.totalSize ?? sizes.get(url);
            if (total === undefined)
                throw new GeodataFetchError(url, "no usable content-range");
            sizes.set(url, total);
            return total;
        },
        read: (url, start, endExclusive, read) => ranged(url, start, endExclusive, read),
    };
}
/**
 * Create a {@link RangeTransport} that serves one in-memory object, for tests or
 * already-downloaded buffers.
 *
 * @param bytes - The object's bytes.
 * @param url - The URL the object answers to; defaults to
 *   `https://geo.infrared.city/in-memory.fgb`. Reads of any other URL are
 *   rejected with a `GeodataFetchError`.
 * @returns A transport over the bytes.
 * @category Geodata
 */
export function bytesRangeTransport(bytes, url = "https://geo.infrared.city/in-memory.fgb") {
    const etag = `"in-memory-${bytes.byteLength}"`;
    return {
        byteLength: (requested) => {
            if (requested !== url) {
                return Promise.reject(new GeodataFetchError(requested, "not the in-memory object"));
            }
            return Promise.resolve(bytes.byteLength);
        },
        read: (requested, start, endExclusive, options) => {
            if (requested !== url) {
                return Promise.reject(new GeodataFetchError(requested, "not the in-memory object"));
            }
            if (options?.ifMatch !== undefined && options.ifMatch !== etag) {
                return Promise.reject(new GeodataRangeError(requested, "in-memory object entity tag mismatch", 412));
            }
            return Promise.resolve({
                bytes: bytes.slice(start, endExclusive ?? bytes.byteLength),
                etag,
                totalSize: bytes.byteLength,
            });
        },
    };
}
/** The kernel's wait for an answer it wants asked again; never leaves this module. */
class AskAgain extends Error {
    waitMs;
    constructor(waitMs) {
        super("asked again");
        this.waitMs = waitMs;
    }
}
function step(event) {
    return JSON.parse(requireCore().rangeReadStep(JSON.stringify(event)));
}
function header(response, name) {
    return response.headers.get(name);
}
function numberHeader(response, name) {
    const raw = header(response, name);
    const value = raw === null ? Number.NaN : Number(raw.trim());
    return Number.isFinite(value) && value >= 0 ? value : null;
}
/** One logical range read: the host does the HTTP, the kernel decides. */
class KernelRangeRead {
    url;
    logger;
    read;
    host;
    constructor(url, start, endExclusive, ifMatch, logger = consoleLogger) {
        this.url = url;
        this.logger = logger;
        this.read = {
            start,
            end: endExclusive === undefined ? null : endExclusive - 1,
            tries: 0,
            pinned: ifMatch ?? null,
        };
        let host = url;
        try {
            host = new URL(url).hostname || url;
        }
        catch { /* not a URL: keep it */ }
        this.host = host;
    }
    attempt() {
        this.read = { ...this.read, tries: this.read.tries + 1 };
        return this.read.pinned === null ? {} : { "If-Match": this.read.pinned };
    }
    next(error) {
        const waitMs = error instanceof AskAgain
            ? error.waitMs
            : error instanceof GeodataError
                ? undefined
                : this.afterFailure();
        if (waitMs !== undefined) {
            this.logger.warn(`range read retry attempt=${this.read.tries + 1} path=${this.path()} ` +
                `wait_ms=${Math.round(waitMs)}`);
        }
        return waitMs;
    }
    async answer(response) {
        const decided = step({
            event: "answer",
            read: this.read,
            answer: {
                status: response.status,
                content_range: header(response, "content-range"),
                content_type: header(response, "content-type"),
                content_encoding: header(response, "content-encoding"),
                content_length: numberHeader(response, "content-length"),
                etag: header(response, "etag"),
                retry_after_s: numberHeader(response, "retry-after"),
            },
            jitter: Math.random(),
            host: this.host,
        });
        if (decided.do !== "body")
            cancelBody(response);
        if (decided.do === "again") {
            this.read = decided.read;
            throw new AskAgain(decided.wait_s * 1_000);
        }
        if (decided.do === "stale")
            throw new GeodataRangeError(this.url, decided.message, 412);
        if (decided.do === "refuse") {
            if (response.status !== 200 && response.status !== 206) {
                throw new GeodataFetchError(this.url, `HTTP ${response.status}`, response.status);
            }
            throw new GeodataRangeError(this.url, decided.message, response.status);
        }
        this.read = decided.read;
        const bytes = await readCappedBody(response, {
            cap: decided.cap,
            fail: (detail) => new GeodataRangeError(this.url, decided.whole
                ? `${this.host} answered 200 to a Range request (host cache configuration); report it ` +
                    "at https://github.com/Infrared-city/infrared-core/issues"
                : `the range answer ${detail}`, response.status),
        });
        const checked = step({
            event: "body", read: this.read, whole: decided.whole, cap: decided.cap, body_len: bytes.byteLength,
        });
        if (typeof checked["refuse"] === "string") {
            throw new GeodataRangeError(this.url, checked["refuse"], response.status);
        }
        const etag = header(response, "etag") ?? undefined;
        const offset = checked["offset"];
        const length = checked["length"];
        const total = decided.whole ? bytes.byteLength : decided.total;
        return {
            bytes: decided.whole ? bytes.subarray(offset, offset + length) : bytes,
            ...(total === null ? {} : { totalSize: total }),
            ...(etag === undefined ? {} : { etag }),
        };
    }
    afterFailure() {
        const decided = step({ event: "failure", read: this.read, phase: "after_send", jitter: Math.random() });
        const waitS = decided["wait_s"];
        return typeof waitS === "number" ? waitS * 1_000 : undefined;
    }
    path() {
        try {
            return new URL(this.url).pathname;
        }
        catch {
            return this.url;
        }
    }
}
