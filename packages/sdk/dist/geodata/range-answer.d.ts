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
/**
 * Largest body accepted when a server answers a `Range` request with `200`.
 *
 * A `200` means the server ignored the range and is sending the WHOLE
 * object. On the world FlatGeobufs that is 5.4 GB and 14.4 GB, so buffering
 * it is not a slow path, it is an out-of-memory crash. Anything larger is
 * refused while it arrives.
 */
export declare const MAX_HTTP_200_BYTES: number;
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
export declare const MAX_RANGE_BYTES: number;
/** The result of one accepted range answer. */
export interface RangeAnswer {
    readonly bytes: Uint8Array;
    readonly etag?: string;
    readonly totalSize?: number;
}
/**
 * Accept a 206: the window it names must be the window that was asked for.
 *
 * A window that runs past the end of the object is SATISFIABLE (RFC 7233
 * section 4.1): the server answers with the last byte it has. A FlatGeobuf
 * shorter than the fixed header prefix is exactly that case, so the expected
 * end is the requested end or the last byte of the object, whichever is first.
 */
export declare function readPartialAnswer(url: string, response: Response, start: number, endExclusive: number | undefined): Promise<RangeAnswer>;
/**
 * Accept a 200 answer to a range request, under the whole-object cap.
 *
 * The object must reach the end of the window that was asked for. A shorter
 * one would slice into an empty or short result and hand back wrong bytes
 * without an error.
 */
export declare function readWholeObjectAnswer(url: string, response: Response, start: number, endExclusive: number | undefined): Promise<RangeAnswer>;
