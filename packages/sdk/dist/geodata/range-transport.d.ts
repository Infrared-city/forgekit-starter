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
import { type PublicRequestOptions } from "./http.js";
/** One ranged read: the bytes, plus what the answer said about the object. */
export interface RangeReadResult {
    readonly bytes: Uint8Array;
    /** Entity tag of the object this range came from, when the host sends one. */
    readonly etag?: string;
    /** Total object size, from `Content-Range`, when the answer carries it. */
    readonly totalSize?: number;
}
export interface RangeReadOptions {
    /**
     * Sent as `If-Match`. Every follow-up range of one logical read carries
     * the entity tag the first range answered with, so a quarterly file
     * replacement between two requests fails loudly instead of decoding two
     * halves of two different files.
     */
    readonly ifMatch?: string;
}
/**
 * A byte-range reader over one remote object.
 *
 * Both FlatGeobuf backends and the Parquet reader talk to the network only
 * through this seam, so a test can serve an object from memory and a caller
 * can supply its own caching or credential-free transport.
 *
 * One instance is meant to be reused across the tiles of one area: it
 * carries the object-size cache, and a fresh one per tile re-learns every
 * object's size.
 */
export interface RangeTransport {
    /** Total object size in bytes. */
    byteLength(url: string): Promise<number>;
    /** Bytes `[start, endExclusive)`; `endExclusive` omitted means "to the end". */
    read(url: string, start: number, endExclusive?: number, options?: RangeReadOptions): Promise<RangeReadResult>;
}
/** HTTP `Range` reader with a per-instance object-size cache. */
export declare function httpRangeTransport(options?: PublicRequestOptions): RangeTransport;
/** Serve one in-memory object as a range transport (tests, cached buffers). */
export declare function bytesRangeTransport(bytes: Uint8Array, url?: string): RangeTransport;
