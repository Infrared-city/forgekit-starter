import type { Logger } from "../logger.js";
import { RangeRetry } from "./retry.js";
import type { FetchLike } from "../internal/transport.js";
export { MAX_HTTP_200_BYTES, MAX_RANGE_BYTES } from "./range-answer.js";
/** A west/south/east/north bounding box in WGS84 degrees. */
export interface Bbox {
    readonly west: number;
    readonly south: number;
    readonly east: number;
    readonly north: number;
}
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
export declare const METERS_PER_DEG_LAT = 111320;
/**
 * Centre point plus radius to a bbox.
 *
 * Verbatim `app.gis.trees.point_to_bbox`: {@link METERS_PER_DEG_LAT} for
 * latitude, the same constant scaled by `cos(latitude)` for longitude, with the
 * cosine clamped so a polar AOI cannot divide by zero.
 */
export declare function pointToBbox(latitude: number, longitude: number, distanceM: number): Bbox;
/** True when the two boxes overlap, edges included. */
export declare function bboxIntersects(a: Bbox, b: Bbox): boolean;
/**
 * The public data host can reject an unset or default User-Agent with 403,
 * so the Python and TypeScript hosts set one. Chromium drops an explicit
 * value, but WebKit can send it; the host CORS policy must allow User-Agent.
 */
export declare const DATA_USER_AGENT = "infrared-sdk-ts/0.14.0-next.0";
/**
 * Largest JSON document read from a public host.
 *
 * The manifests are index objects: the largest real one is about 2 MB. A
 * multi-gigabyte body where a manifest was expected is a failure, not
 * something to buffer. The Python host holds the twin of this cap at
 * `_internal/geodata/http.py::MAX_JSON_BYTES`.
 */
export declare const MAX_JSON_BYTES: number;
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
export declare const DEFAULT_PUBLIC_TIMEOUT_MS = 180000;
export interface PublicRequestOptions {
    readonly fetch?: FetchLike;
    readonly signal?: AbortSignal;
    /** Total time for the answer AND its body. Defaults to {@link DEFAULT_PUBLIC_TIMEOUT_MS}. */
    readonly timeoutMs?: number;
    /**
     * Where a transport retry reports itself. Defaults to the console, which
     * is what the Python twin does with `logging.warning`. Pass `silentLogger`
     * to keep a retry out of the output.
     */
    readonly logger?: Logger;
    /**
     * How long one attempt of a retried read may receive no data before it is
     * aborted and asked again. Defaults to {@link STALL_TIMEOUT_MS}.
     */
    readonly stallTimeoutMs?: number;
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
export declare function withRequest<T>(url: string, headers: Record<string, string>, options: PublicRequestOptions, use: (response: Response) => Promise<T>, retry?: RangeRetry): Promise<T>;
/**
 * GET a public JSON document as text, so a kernel call can take it as-is.
 *
 * The read is retried like a range read: a failed connection, 5xx or 429 is
 * asked again (see `retry.ts`). A ground read fetches five Overture pointer
 * documents on every call, and one connection reset on one of them failed
 * the whole site read with `SiteReadError`.
 */
export declare function fetchPublicText(url: string, options?: PublicRequestOptions): Promise<string>;
/** One whole-object read: the bytes, and the entity tag the host sent. */
export interface PublicBytes {
    readonly bytes: Uint8Array;
    /** Entity tag of the object, when the host sends one. */
    readonly etag?: string;
    /** True when the answer arrived under a content coding (usually gzip). */
    readonly encoded: boolean;
}
export interface PublicBytesOptions extends PublicRequestOptions {
    /** Largest body accepted, in bytes. Defaults to {@link MAX_JSON_BYTES}. */
    readonly cap?: number;
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
export declare function fetchPublicBytes(url: string, options?: PublicBytesOptions): Promise<PublicBytes>;
/** GET and parse a public JSON document. */
export declare function fetchPublicJson<T>(url: string, options?: PublicRequestOptions): Promise<T>;
