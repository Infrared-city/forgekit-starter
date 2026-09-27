/**
 * The byte-range seam: one remote object, read a window at a time.
 *
 * Split out of `http.ts` so that neither file passes 400 lines once the
 * range read gained a retry. `http.ts` owns the request itself — the
 * allow-list, the deadline, the credential-free headers — and this module
 * owns what a `Range` answer must prove and what is worth asking again.
 *
 * The retry is described in `retry.ts`. Two of its rules are visible here:
 * a `200` answer to a `Range` request is asked again BEFORE its body is
 * read, and the entity tag of every answer is recorded so a second attempt
 * cannot silently read a file that was replaced meanwhile.
 */
import { GeodataFetchError, GeodataRangeError } from "./errors.js";
import { withRequest } from "./http.js";
import { readPartialAnswer, readWholeObjectAnswer } from "./range-answer.js";
import { RangeRetry } from "./retry.js";
import { cancelBody } from "../internal/capped-body.js";
/** HTTP `Range` reader with a per-instance object-size cache. */
export function httpRangeTransport(options = {}) {
    const sizes = new Map();
    async function ranged(url, start, endExclusive, read) {
        const range = endExclusive === undefined ? `bytes=${start}-` : `bytes=${start}-${endExclusive - 1}`;
        // The retry state holds the caller's `If-Match` as well, so ONE place
        // decides which entity tag every attempt of this read carries.
        const retry = new RangeRetry(url, read?.ifMatch, options.logger);
        const answer = await withRequest(url, {
            Range: range,
            // Lengths are checked on decoded bytes, so an encoded range answer
            // cannot be checked at all. Browser handling of this header varies;
            // the answer is checked as well as asked for. Hosts must allow it
            // in CORS when a browser sends it.
            "Accept-Encoding": "identity",
        }, options, async (response) => {
            if (response.status === 412) {
                cancelBody(response);
                throw new GeodataRangeError(url, "the object changed between two ranges of one read (If-Match failed)", 412);
            }
            if (response.status !== 200 && response.status !== 206) {
                cancelBody(response);
                throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
            }
            // A host that ignores `If-Match` answers 200 or 206 under the NEW
            // entity tag. That is the same event a 412 names, and it is reported
            // the same way rather than decoded. Only a 200 or a 206 reaches this
            // line, so an error page's own entity tag can never pin the read.
            try {
                retry.observe(response.headers.get("etag") ?? undefined);
            }
            catch (stale) {
                // Every other refusal in this file releases the body first.
                cancelBody(response);
                throw stale;
            }
            if (response.status === 200 && retry.willAskAgainForWholeObject()) {
                // Before a byte is read: a 200 means the range was ignored, and on
                // the world FlatGeobufs the whole object is gigabytes.
                cancelBody(response);
                throw new GeodataRangeError(url, "a range request was answered with 200; the range is asked for once more", 200);
            }
            return response.status === 200
                ? await readWholeObjectAnswer(url, response, start, endExclusive)
                : await readPartialAnswer(url, response, start, endExclusive);
        }, retry);
        // The streamed length of a 200 and the `Content-Range` total of a 206
        // are the only sizes this reader trusts. A total of `*` names none, so
        // the size cache stays empty for it.
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
/** Serve one in-memory object as a range transport (tests, cached buffers). */
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
