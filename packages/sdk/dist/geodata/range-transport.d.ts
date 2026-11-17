/**
 * The byte-range seam: one remote object, read a window at a time.
 *
 * `http.ts` owns the request itself — the allow-list, the deadline, the
 * credential-free headers. What a `Range` answer must prove, what is worth
 * asking again, the waits and the entity-tag pin are the kernel's
 * (`rangeReadStep`, the rule the Python host calls too); this module sends
 * the facts of each answer and reads the body under the cap it is given.
 */
import { type PublicRequestOptions } from "./http.js";
/**
 * One ranged read: the bytes, plus what the answer said about the object.
 *
 * @category Geodata
 */
export interface RangeReadResult {
    readonly bytes: Uint8Array;
    /** Entity tag of the object this range came from, when the host sends one. */
    readonly etag?: string;
    /** Total object size, from `Content-Range`, when the answer carries it. */
    readonly totalSize?: number;
}
/**
 * Options for one ranged read.
 *
 * @category Geodata
 */
export interface RangeReadOptions {
    /**
     * Entity tag sent as `If-Match`. Every follow-up range of one logical read
     * carries the entity tag the first range answered with, so a file replaced
     * between two requests fails with an error instead of mixing two versions of
     * the file.
     */
    readonly ifMatch?: string;
}
/**
 * A byte-range reader over remote objects.
 *
 * The FlatGeobuf and Parquet readers reach the network only through this
 * interface, so you can supply your own transport (for example one that serves
 * bytes from memory or adds caching).
 *
 * Reuse one instance across all tiles of an area: it caches object sizes, and a
 * fresh instance per tile has to learn every size again.
 *
 * @category Geodata
 */
export interface RangeTransport {
    /**
     * Total size of the object at `url`, in bytes.
     *
     * @param url - The object URL.
     */
    byteLength(url: string): Promise<number>;
    /**
     * Read the bytes `[start, endExclusive)` of the object at `url`;
     * `endExclusive` omitted means "to the end".
     *
     * @param url - The object URL.
     * @param start - First byte offset.
     * @param endExclusive - End offset (exclusive).
     * @param options - Per-read options such as `ifMatch`.
     */
    read(url: string, start: number, endExclusive?: number, options?: RangeReadOptions): Promise<RangeReadResult>;
}
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
export declare function httpRangeTransport(options?: PublicRequestOptions): RangeTransport;
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
export declare function bytesRangeTransport(bytes: Uint8Array, url?: string): RangeTransport;
