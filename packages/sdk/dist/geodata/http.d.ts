import type { Logger } from "../logger.js";
import { RangeRetry } from "./retry.js";
import type { FetchLike } from "../internal/transport.js";
export { MAX_HTTP_200_BYTES, MAX_RANGE_BYTES } from "./range-answer.js";
/**
 * A west/south/east/north bounding box in WGS84 degrees.
 *
 * @category Geodata
 */
export interface Bbox {
    /** Western edge, longitude in degrees. */
    readonly west: number;
    /** Southern edge, latitude in degrees. */
    readonly south: number;
    /** Eastern edge, longitude in degrees. */
    readonly east: number;
    /** Northern edge, latitude in degrees. */
    readonly north: number;
}
/**
 * Metres per degree of latitude (111 320 m) used by flat bounding-box derivations
 * such as {@link pointToBbox}.
 *
 * A fixed approximation, about 0.11 % above the mean-radius value (about
 * 111 195 m); do not use it for projection.
 *
 * @category Geodata
 */
export declare const METERS_PER_DEG_LAT = 111320;
/**
 * Convert a centre point and a radius into a bounding box.
 *
 * The box extends `distanceM` metres from the centre in each direction, using
 * `METERS_PER_DEG_LAT` for latitude and that value scaled by `cos(latitude)`
 * for longitude (the cosine is clamped, so a pole does not divide by zero).
 *
 * @param latitude - Centre latitude in degrees.
 * @param longitude - Centre longitude in degrees.
 * @param distanceM - Half-width of the box in metres.
 * @returns The bounding box in degrees.
 * @category Geodata
 */
export declare function pointToBbox(latitude: number, longitude: number, distanceM: number): Bbox;
/**
 * Report whether two bounding boxes overlap; boxes that only touch along an edge
 * count as overlapping.
 *
 * @param a - The first box.
 * @param b - The second box.
 * @category Geodata
 */
export declare function bboxIntersects(a: Bbox, b: Bbox): boolean;
/**
 * The `User-Agent` value sent on public data requests (`infrared-sdk-ts/<version>`).
 *
 * The public data host can reject an unset or default `User-Agent` with HTTP 403,
 * so the SDK sets one. The host's CORS policy must allow the `User-Agent` header.
 *
 * @category Geodata
 */
export declare const DATA_USER_AGENT = "infrared-sdk-ts/1.0.1";
/**
 * Largest JSON document, in bytes (32 MiB), read from a public host; a larger
 * body is refused.
 *
 * @category Geodata
 */
export declare const MAX_JSON_BYTES: number;
/**
 * How long one public read may take, body included, when no `timeoutMs` is
 * given: 180 000 ms (three minutes).
 *
 * @category Geodata
 */
export declare const DEFAULT_PUBLIC_TIMEOUT_MS = 180000;
/**
 * Options shared by every public data request.
 *
 * @category Geodata
 */
export interface PublicRequestOptions {
    /** Custom `fetch` implementation; defaults to the runtime's global `fetch`. */
    readonly fetch?: FetchLike;
    /** Abort signal; aborting it ends the read with a `GeodataFetchError`. */
    readonly signal?: AbortSignal;
    /** Total time for the answer and its body. Defaults to {@link DEFAULT_PUBLIC_TIMEOUT_MS}. */
    readonly timeoutMs?: number;
    /**
     * Where a transport retry reports itself. Defaults to the console. Pass
     * `silentLogger` to keep a retry out of the output.
     */
    readonly logger?: Logger;
    /**
     * How long one attempt of a retried read may receive no data before it is
     * aborted and asked again. Defaults to `STALL_TIMEOUT_MS`.
     */
    readonly stallTimeoutMs?: number;
}
/**
 * Send one GET request to an allowed public host and hand the response to a
 * callback, under a single deadline that covers the headers and the body.
 *
 * The request carries no credentials and refuses redirects. The deadline is
 * `options.timeoutMs`, or {@link DEFAULT_PUBLIC_TIMEOUT_MS}. With a `retry`
 * state, retryable failures (connection errors, stalls, 5xx, 429) are repeated
 * within the same deadline; without it the request runs once.
 *
 * @param url - The URL to fetch; it must be on the allow-list.
 * @param headers - Extra request headers.
 * @param options - Request options.
 * @param use - Callback that reads the response and returns the result.
 * @param retry - Optional retry state for repeatable reads.
 * @returns Whatever `use` returns.
 * @throws {HostNotAllowedError} when the URL is not allowed.
 * @throws {GeodataFetchError} when the request fails, is redirected, times out or is aborted.
 * @category Geodata
 */
export declare function withRequest<T>(url: string, headers: Record<string, string>, options: PublicRequestOptions, use: (response: Response) => Promise<T>, retry?: RangeRetry): Promise<T>;
/**
 * GET a public JSON document and return it as unparsed text.
 *
 * A failed connection, a 5xx or a 429 answer is retried. The body is capped at
 * {@link MAX_JSON_BYTES} and must be valid UTF-8.
 *
 * @param url - The URL to fetch; it must be on the allow-list.
 * @param options - Request options.
 * @returns The response body as text.
 * @throws {HostNotAllowedError} when the URL is not allowed.
 * @throws {GeodataFetchError} when the request fails, the status is not 2xx, the
 *   size cap is exceeded or the body is not UTF-8.
 * @category Geodata
 */
export declare function fetchPublicText(url: string, options?: PublicRequestOptions): Promise<string>;
/**
 * One whole-object read: the bytes and the entity tag.
 *
 * @category Geodata
 */
export interface PublicBytes {
    readonly bytes: Uint8Array;
    /** Entity tag of the object, when the host sends one. */
    readonly etag?: string;
    /** True when the answer arrived under a content coding (usually gzip). */
    readonly encoded: boolean;
}
/**
 * Options for {@link fetchPublicBytes}.
 *
 * @category Geodata
 */
export interface PublicBytesOptions extends PublicRequestOptions {
    /** Largest body accepted, in bytes. Defaults to {@link MAX_JSON_BYTES}. */
    readonly cap?: number;
}
/**
 * GET a whole public object as undecoded bytes, under a size cap.
 *
 * Use this instead of {@link fetchPublicText} when the raw bytes matter. The
 * read sends no credentials, refuses redirects and runs under one deadline over
 * the headers and the body. The cap is enforced on the bytes actually received.
 *
 * @param url - The URL to fetch; it must be on the allow-list.
 * @param options - Request options plus `cap`, the largest body accepted in
 *   bytes (defaults to {@link MAX_JSON_BYTES}).
 * @returns The bytes, the entity tag if sent, and whether the answer was encoded.
 * @throws {HostNotAllowedError} when the URL is not allowed.
 * @throws {GeodataFetchError} when the request fails, is not 2xx or exceeds the cap.
 * @category Geodata
 */
export declare function fetchPublicBytes(url: string, options?: PublicBytesOptions): Promise<PublicBytes>;
/**
 * GET a public JSON document and parse it.
 *
 * @typeParam T - Expected shape of the document; it is not validated.
 * @param url - The URL to fetch; it must be on the allow-list.
 * @param options - Request options.
 * @returns The parsed document.
 * @throws {HostNotAllowedError} when the URL is not allowed.
 * @throws {GeodataFetchError} when the request fails or the body is not JSON.
 * @category Geodata
 */
export declare function fetchPublicJson<T>(url: string, options?: PublicRequestOptions): Promise<T>;
