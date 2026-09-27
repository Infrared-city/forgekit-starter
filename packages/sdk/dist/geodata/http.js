import { assertAllowedUrl } from "./allowed-hosts.js";
import { GeodataError, GeodataFetchError } from "./errors.js";
import { VERSION } from "../version.js";
import { cancelBody, readCappedBody } from "../internal/capped-body.js";
import { Deadline, delay } from "../internal/deadline.js";
import { resolveFetch } from "../internal/fetch.js";
import { RangeRetry } from "./retry.js";
import { STALL_TIMEOUT_MS, StallWatch } from "./stall.js";
export { MAX_HTTP_200_BYTES, MAX_RANGE_BYTES } from "./range-answer.js";
/**
 * Metres per degree of latitude in the FLAT SDK convention — the ONE home of
 * this number on this host.
 *
 * It is the kernel's `ir_geo::consts::METERS_PER_DEG_LAT`
 * (`public/rust/crates/ir-geo/src/consts.rs`), the `111 320 m/deg`
 * approximation and NOT `EARTH_RADIUS_M * DEG2RAD` (about 111 194.9 m); the
 * ~0.11 % gap IS the D1 deviation, and it is kept for parity with the SDK tile,
 * vegetation and ground-material frames. The binding exposes no constants, so
 * this is a copy with its source named rather than a second decision. It lives
 * beside `Bbox` and `pointToBbox` because every user of it is a bbox
 * derivation; the Python twin is
 * `infrared_sdk._internal.geodata.bbox.METERS_PER_DEG_LAT`.
 *
 * Never use it in `LocalFrame` code, which projects through the kernel.
 */
export const METERS_PER_DEG_LAT = 111_320;
/**
 * Centre point plus radius to a bbox.
 *
 * Verbatim `app.gis.trees.point_to_bbox`: {@link METERS_PER_DEG_LAT} for
 * latitude, the same constant scaled by `cos(latitude)` for longitude, with the
 * cosine clamped so a polar AOI cannot divide by zero.
 */
export function pointToBbox(latitude, longitude, distanceM) {
    const deltaLat = distanceM / METERS_PER_DEG_LAT;
    const cosLat = Math.max(Math.cos((latitude * Math.PI) / 180), 1e-6);
    const deltaLon = distanceM / (METERS_PER_DEG_LAT * cosLat);
    return {
        west: longitude - deltaLon,
        south: latitude - deltaLat,
        east: longitude + deltaLon,
        north: latitude + deltaLat,
    };
}
/** True when the two boxes overlap, edges included. */
export function bboxIntersects(a, b) {
    return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;
}
/**
 * The public data host can reject an unset or default User-Agent with 403,
 * so the Python and TypeScript hosts set one. Chromium drops an explicit
 * value, but WebKit can send it; the host CORS policy must allow User-Agent.
 */
export const DATA_USER_AGENT = `infrared-sdk-ts/${VERSION}`;
/**
 * Largest JSON document read from a public host.
 *
 * The manifests are index objects: the largest real one is about 2 MB. A
 * multi-gigabyte body where a manifest was expected is a failure, not
 * something to buffer. The Python host holds the twin of this cap at
 * `_internal/geodata/http.py::MAX_JSON_BYTES`.
 */
export const MAX_JSON_BYTES = 32 * 1024 * 1024;
/**
 * How long one public read may take, the body included, when the caller
 * names no `timeoutMs`.
 *
 * A read with no deadline at all is not a fast read, it is a read that can
 * hang for ever: a server that answers and then stalls used to hold a
 * default-constructed client open with no end. This is the same three
 * minutes the gateway transport gives an authenticated call
 * (`internal/transport.ts`), so the SDK has ONE answer to "how long can a
 * request hang". A caller that knows better passes its own `timeoutMs`.
 */
export const DEFAULT_PUBLIC_TIMEOUT_MS = 180_000;
function fetchImpl(options) {
    const implementation = resolveFetch(options.fetch);
    if (typeof implementation !== "function") {
        throw new GeodataFetchError("fetch", "no fetch implementation is available");
    }
    return implementation;
}
/**
 * One request under ONE deadline that covers the headers AND the body.
 *
 * The timer used to be cleared as soon as the headers arrived, so a server
 * that answered and then stalled held the read open for as long as it liked.
 * {@link Deadline} carries one abort controller for the whole call — the
 * fetch, the body read, and the caller's own signal — and `close()` clears
 * the timer and removes the listener the caller's signal got, so a finished
 * read leaves nothing behind.
 *
 * Every read has a deadline: `timeoutMs` when the caller names one, and
 * {@link DEFAULT_PUBLIC_TIMEOUT_MS} when it does not.
 *
 * A `retry` state makes the request repeatable: the loop asks again only
 * while {@link RangeRetry.next} names a wait, and that wait is spent inside
 * the same deadline. Without one — a whole-object read — the loop runs
 * exactly once. The static-weather reader, the one whole-object caller, has
 * a retry of its own.
 */
export async function withRequest(url, headers, options, use, retry) {
    const checked = assertAllowedUrl(url);
    const timeoutMs = options.timeoutMs ?? DEFAULT_PUBLIC_TIMEOUT_MS;
    const deadline = new Deadline(options.signal, timeoutMs);
    const signal = deadline.controller.signal;
    const step = (work) => deadline.wait(work);
    const stopped = (error) => new GeodataFetchError(checked, stopDetail(error, deadline, timeoutMs));
    const stallMs = options.stallTimeoutMs ?? STALL_TIMEOUT_MS;
    try {
        for (;;) {
            // A retried read watches each attempt for a stall (see `stall.ts`).
            // Without a retry there is nothing to gain from ending an attempt early.
            const watch = retry !== undefined && stallMs < timeoutMs ? new StallWatch(signal, stallMs) : undefined;
            try {
                // No credentials: these are public objects and an API key must never
                // reach them. `redirect: "error"` keeps the allow-list honest: a 3xx
                // from an allow-listed host would otherwise carry the request to any
                // host at all, which is the one thing `assertAllowedUrl` prevents.
                // `retry.headers()` adds the `If-Match` of the logical read, so a
                // second attempt cannot read a file that was replaced meanwhile.
                const response = await step(() => fetchImpl(options)(checked, {
                    headers: {
                        "User-Agent": DATA_USER_AGENT,
                        ...headers,
                        ...(retry === undefined ? {} : retry.headers()),
                    },
                    redirect: "error",
                    signal: watch?.controller.signal ?? signal,
                }));
                watch?.touch();
                // A transport that answers a redirect instead of refusing it (a
                // caller's own `fetch`) must not slip past the rule either.
                if (response.status >= 300 && response.status < 400) {
                    cancelBody(response);
                    throw new GeodataFetchError(checked, `redirect refused: HTTP ${response.status} (the allow-list is checked per URL)`, response.status);
                }
                return await step(() => use(watch === undefined ? response : watch.watch(response)));
            }
            catch (caught) {
                // A stall is a failed connection: asked again, and named if it is the last.
                const error = watch?.stalled === true
                    ? new Error(`no data arrived for ${stallMs} ms`)
                    : caught;
                // A stopped deadline is the caller's own limit. It ends the read
                // whatever the answer was, and it is never a reason to ask again.
                const waitMs = deadline.reason() === undefined ? retry?.next(error) : undefined;
                if (waitMs === undefined) {
                    if (error instanceof GeodataError)
                        throw error;
                    throw stopped(error);
                }
                // The wait runs under the same deadline as the request, so a retry
                // can never take a read past the limit the caller accepted.
                try {
                    await step(() => delay(waitMs, signal));
                }
                catch (stop) {
                    throw stopped(stop);
                }
            }
            finally {
                watch?.close();
            }
        }
    }
    finally {
        deadline.close();
    }
}
/** Name the reason the read ended: the deadline knows it, the error does not. */
function stopDetail(error, deadline, timeoutMs) {
    const stopped = deadline.reason();
    if (stopped === "timeout") {
        return `the answer and its body did not complete within ${timeoutMs} ms`;
    }
    if (stopped === "aborted")
        return "the caller aborted the request";
    return `request failed: ${error instanceof Error ? error.message : String(error)}`;
}
/**
 * GET a public JSON document as text, so a kernel call can take it as-is.
 *
 * The read is retried like a range read: a failed connection, 5xx or 429 is
 * asked again (see `retry.ts`). A ground read fetches five Overture pointer
 * documents on every call, and one connection reset on one of them failed
 * the whole site read with `SiteReadError`.
 */
export async function fetchPublicText(url, options = {}) {
    const retry = new RangeRetry(url, undefined, options.logger);
    return withRequest(url, { Accept: "application/json" }, options, async (response) => {
        if (!response.ok) {
            cancelBody(response);
            throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
        }
        const bytes = await readCappedBody(response, {
            cap: MAX_JSON_BYTES,
            fail: (detail) => new GeodataFetchError(url, `the answer ${detail}`),
        });
        try {
            return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        }
        catch {
            throw new GeodataFetchError(url, "the body is not UTF-8 text");
        }
    }, retry);
}
/**
 * GET a whole public object as BYTES, under a streamed cap.
 *
 * The JSON readers above decode to text; a caller that must look at the
 * raw bytes first — the static weather reader sniffs a gzip magic number
 * when a host serves gzip without `Content-Encoding` — needs them
 * undecoded. Everything else is the same read: allow-listed host, no
 * credentials, `redirect: "error"`, one deadline over the headers AND the
 * body, and a cap kept by the streamed total rather than by a header.
 *
 * `Accept-Encoding` is NOT pinned to `identity` here, unlike a `Range`
 * read: a whole-object read WANTS the host's content coding, and the
 * capped reader skips the declared-length comparison for an encoded body
 * because no header describes its decoded length.
 */
export async function fetchPublicBytes(url, options = {}) {
    const cap = options.cap ?? MAX_JSON_BYTES;
    return withRequest(url, { Accept: "application/json" }, options, async (response) => {
        if (!response.ok) {
            cancelBody(response);
            throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
        }
        const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
        const etag = response.headers.get("etag");
        const bytes = await readCappedBody(response, {
            cap,
            fail: (detail) => new GeodataFetchError(url, `the answer ${detail}`),
        });
        return {
            bytes,
            ...(etag === null ? {} : { etag }),
            encoded: encoding !== "" && encoding !== "identity",
        };
    });
}
/** GET and parse a public JSON document. */
export async function fetchPublicJson(url, options = {}) {
    const text = await fetchPublicText(url, options);
    try {
        return JSON.parse(text);
    }
    catch (error) {
        throw new GeodataFetchError(url, `body is not JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
}
