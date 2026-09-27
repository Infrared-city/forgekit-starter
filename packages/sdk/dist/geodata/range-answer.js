/**
 * What a `Range` answer must prove before its bytes are used.
 *
 * A ranged read of a 5.4 GB object is only safe while the reader stays strict.
 * Three answers are possible and each one has a trap:
 *
 * - **206.** The right answer, but only when `Content-Range` says the window
 *   that was asked for and the body carries exactly that many bytes. A short
 *   body, a shifted start, or a second range in one answer would decode into
 *   silently wrong geometry.
 * - **200.** The server ignored the range and sends the WHOLE object. On the
 *   world FlatGeobufs that is not a slow path, it is an out-of-memory crash,
 *   so it is tolerated only under a small cap and only when the object really
 *   reaches the end of the requested window.
 * - **anything else.** Not a range answer at all.
 *
 * Every check here runs on the bytes that arrived, never on a header alone.
 */
import { GeodataRangeError } from "./errors.js";
import { cancelBody, declaredLength, readCappedBody } from "../internal/capped-body.js";
/**
 * Largest body accepted when a server answers a `Range` request with `200`.
 *
 * A `200` means the server ignored the range and is sending the WHOLE
 * object. On the world FlatGeobufs that is 5.4 GB and 14.4 GB, so buffering
 * it is not a slow path, it is an out-of-memory crash. Anything larger is
 * refused while it arrives.
 */
export const MAX_HTTP_200_BYTES = 8 * 1024 * 1024;
/**
 * Largest body accepted for ONE range answer.
 *
 * This is a transport bound, not the planner's bound: it limits what one HTTP
 * answer may deliver, whoever asked for it. `MAX_PLANNED_RANGE_BYTES` in
 * `fgb-kernel.ts` limits what the kernel may ask the host to fetch. The two
 * hold the same number today and are changed by different arguments, so they
 * stay two constants (CLAUDE.md rule 6). The Python host holds the twin of
 * this one at `_internal/geodata/fgb.py::MAX_RANGE_BYTES`.
 */
export const MAX_RANGE_BYTES = 64 * 1024 * 1024;
const CONTENT_RANGE = /^bytes (\d+)-(\d+)\/(\d+|\*)$/;
function etagOf(response) {
    return response.headers.get("etag") ?? undefined;
}
/**
 * Refuse an answer that carries more than one range, or encoded bytes.
 *
 * Lengths are compared on the bytes the reader sees, which are the DECODED
 * bytes, so a compressed range answer cannot be checked against its own
 * `Content-Range` at all. Node asks for `identity` on every range request; a
 * browser is not allowed to set that header, which is why a non-identity
 * answer is refused here rather than assumed away.
 */
function assertOneUnencodedRange(url, response) {
    const type = (response.headers.get("content-type") ?? "").toLowerCase();
    if (type.startsWith("multipart/byteranges")) {
        cancelBody(response);
        throw new GeodataRangeError(url, "the answer is multipart/byteranges; this reader asks for one range " +
            "and reads one range", 206);
    }
    const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
    if (encoding !== "" && encoding !== "identity") {
        cancelBody(response);
        throw new GeodataRangeError(url, `the range answer is encoded as ${encoding}; lengths are checked on ` +
            "decoded bytes, so only identity is accepted", 206);
    }
}
/**
 * Parse `Content-Range`, or refuse the answer.
 *
 * A second `Content-Range` header joins into one comma-separated value, which
 * this pattern refuses: one range answer carries exactly one range.
 */
function parseContentRange(url, response) {
    const raw = response.headers.get("content-range");
    const match = raw === null ? null : CONTENT_RANGE.exec(raw.trim());
    if (match === null) {
        cancelBody(response);
        throw new GeodataRangeError(url, raw === null
            ? "the range answer carries no content-range"
            : `content-range is not one byte range: ${raw}`, 206);
    }
    const start = Number(match[1]);
    const end = Number(match[2]);
    const total = match[3] === "*" ? undefined : Number(match[3]);
    const usable = Number.isSafeInteger(start) &&
        Number.isSafeInteger(end) &&
        end >= start &&
        (total === undefined || (Number.isSafeInteger(total) && total > end));
    if (!usable) {
        cancelBody(response);
        throw new GeodataRangeError(url, `content-range is not a usable byte range: ${raw}`, 206);
    }
    return { start, end, ...(total === undefined ? {} : { total }) };
}
/**
 * Accept a 206: the window it names must be the window that was asked for.
 *
 * A window that runs past the end of the object is SATISFIABLE (RFC 7233
 * section 4.1): the server answers with the last byte it has. A FlatGeobuf
 * shorter than the fixed header prefix is exactly that case, so the expected
 * end is the requested end or the last byte of the object, whichever is first.
 */
export async function readPartialAnswer(url, response, start, endExclusive) {
    assertOneUnencodedRange(url, response);
    const range = parseContentRange(url, response);
    const requestedEnd = endExclusive === undefined ? undefined : endExclusive - 1;
    const expectedEnd = requestedEnd === undefined
        ? range.end
        : range.total === undefined
            ? requestedEnd
            : Math.min(requestedEnd, range.total - 1);
    if (range.start !== start || range.end !== expectedEnd) {
        cancelBody(response);
        throw new GeodataRangeError(url, `content-range answers bytes ${range.start}-${range.end}, not the ` +
            `requested ${start}-${requestedEnd ?? "end"}`, 206);
    }
    const expected = range.end - range.start + 1;
    if (expected > MAX_RANGE_BYTES) {
        cancelBody(response);
        throw new GeodataRangeError(url, `the range answer announces ${expected} bytes; the limit for one range ` +
            `is ${MAX_RANGE_BYTES} bytes`, 206);
    }
    const bytes = await readCappedBody(response, {
        cap: expected,
        fail: (detail) => new GeodataRangeError(url, `the range answer ${detail}`, 206),
    });
    if (bytes.byteLength !== expected) {
        throw new GeodataRangeError(url, `the range answer carries ${bytes.byteLength} bytes, not the ${expected} ` +
            "bytes of its content-range", 206);
    }
    const etag = etagOf(response);
    return {
        bytes,
        ...(range.total === undefined ? {} : { totalSize: range.total }),
        ...(etag === undefined ? {} : { etag }),
    };
}
/**
 * Accept a 200 answer to a range request, under the whole-object cap.
 *
 * The object must reach the end of the window that was asked for. A shorter
 * one would slice into an empty or short result and hand back wrong bytes
 * without an error.
 */
export async function readWholeObjectAnswer(url, response, start, endExclusive) {
    const declared = declaredLength(response);
    if (declared !== undefined && declared > MAX_HTTP_200_BYTES) {
        cancelBody(response);
        throw new GeodataRangeError(url, `a range request was answered with 200 and ${declared} bytes; the limit ` +
            `is ${MAX_HTTP_200_BYTES} bytes`, 200);
    }
    const whole = await readCappedBody(response, {
        cap: MAX_HTTP_200_BYTES,
        fail: (detail) => new GeodataRangeError(url, `a range request was answered with 200 and it ${detail}`, 200),
    });
    const needed = endExclusive ?? start;
    if (whole.byteLength < needed) {
        throw new GeodataRangeError(url, `a range request was answered with 200 and ${whole.byteLength} bytes, ` +
            `which do not reach the requested bytes ${start}-${needed}`, 200);
    }
    const etag = etagOf(response);
    return {
        bytes: whole.slice(start, endExclusive ?? whole.byteLength),
        totalSize: whole.byteLength,
        ...(etag === undefined ? {} : { etag }),
    };
}
