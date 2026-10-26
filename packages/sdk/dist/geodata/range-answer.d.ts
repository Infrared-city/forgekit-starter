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
 * Largest body, in bytes (8 MiB), accepted when a server answers a `Range`
 * request with HTTP 200.
 *
 * A 200 means the server ignored the range and is sending the whole object.
 * Larger bodies are refused while they arrive.
 *
 * @category Geodata
 */
export declare const MAX_HTTP_200_BYTES: number;
/**
 * Largest body, in bytes (64 MiB), accepted for one range answer.
 *
 * A longer answer is refused.
 *
 * @category Geodata
 */
export declare const MAX_RANGE_BYTES: number;
/**
 * The result of one accepted range answer.
 *
 * @category Geodata
 */
export interface RangeAnswer {
    /** The bytes of the requested window. */
    readonly bytes: Uint8Array;
    /** Entity tag of the object, when the host sent one. */
    readonly etag?: string;
    /** Total object size in bytes, when the answer revealed it. */
    readonly totalSize?: number;
}
/**
 * Accept an HTTP 206 answer to a range request, checking that it covers exactly
 * the window that was asked for.
 *
 * A window that runs past the end of the object is satisfiable: the server
 * answers with the last byte it has, so the expected end is the requested end
 * or the last byte of the object, whichever comes first.
 *
 * @param url - The URL that was requested, used in error messages.
 * @param response - The 206 response.
 * @param start - First requested byte offset.
 * @param endExclusive - End of the requested window (exclusive); `undefined`
 *   means "to the end of the object".
 * @returns The bytes, the entity tag and the total object size when known.
 * @throws {GeodataRangeError} when the `Content-Range` header is missing, names
 *   more than one range or another window, the answer is encoded or too large,
 *   or the body length does not match.
 * @category Geodata
 */
export declare function readPartialAnswer(url: string, response: Response, start: number, endExclusive: number | undefined): Promise<RangeAnswer>;
/**
 * Accept an HTTP 200 answer to a range request, under the whole-object cap
 * {@link MAX_HTTP_200_BYTES}.
 *
 * The server ignored the range and sent the whole object; the requested window
 * is cut out of it. The object must reach the end of the requested window.
 *
 * @param url - The URL that was requested, used in error messages.
 * @param response - The 200 response.
 * @param start - First requested byte offset.
 * @param endExclusive - End of the requested window (exclusive); `undefined`
 *   means "to the end of the object".
 * @returns The bytes of the window, the entity tag and the total object size.
 * @throws {GeodataRangeError} when the object exceeds the cap or is too short to
 *   reach the requested window.
 * @category Geodata
 */
export declare function readWholeObjectAnswer(url: string, response: Response, start: number, endExclusive: number | undefined): Promise<RangeAnswer>;
