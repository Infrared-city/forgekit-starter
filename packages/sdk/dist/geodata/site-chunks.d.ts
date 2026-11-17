import type { Logger } from "../logger.js";
import type { Bbox } from "./http.js";
/**
 * Maximum number of site chunks fetched at once (`2`): one decodes while the next arrives.
 *
 * @category Geodata
 */
export declare const SITE_CHUNKS_IN_FLIGHT = 2;
/**
 * One read chunk of a site: a rectangle and the id its data is keyed by.
 *
 * The id is `chunk-r{row}c{col}` (row-major, zero-based) and is reported in
 * {@link SiteReadError.failedTiles}. A single-rectangle site has the id `site`.
 *
 * @category Geodata
 */
export interface SiteChunk {
    /** The chunk id. */
    readonly id: string;
    /** The chunk rectangle, in WGS84 degrees. */
    readonly bbox: Bbox;
    /**
     * The rectangles to compose for this chunk, each with its id.
     *
     * They are the pieces of `chunk ∩ union(tile rectangles)`. A chunk with one
     * piece covering the whole chunk keeps the chunk's own id; several pieces
     * are `<chunk id>-p<index>`, in decomposition order.
     */
    readonly pieces: ReadonlyArray<{
        readonly id: string;
        readonly bbox: Bbox;
    }>;
}
/**
 * The pieces of `clip ∩ union(rectangles)`, as disjoint rectangles.
 *
 * @param clip - The rectangle to clip to, in WGS84 degrees.
 * @param rectangles - The rectangles whose union is intersected with `clip`.
 * @returns The disjoint rectangles that make up the intersection.
 * @category Geodata
 */
export declare function decompose(clip: Bbox, rectangles: readonly Bbox[]): Bbox[];
/**
 * Give each piece of a decomposition an id.
 *
 * A single piece keeps the owner's own `id`; several pieces are
 * `<id>-p<index>` in decomposition order.
 *
 * @category Geodata
 */
export declare function namePieces(id: string, pieces: readonly Bbox[]): Array<{
    id: string;
    bbox: Bbox;
}>;
/**
 * Split a site rectangle into read chunks, in row-major (south-to-north,
 * west-to-east) order.
 *
 * A site up to 4 km2 is one chunk with the id `site`; larger sites are cut
 * into chunks of about 2 km. A chunk
 * that meets none of the `used` rectangles is dropped, so ground no simulation
 * reads is never composed.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param used - The simulation-tile rectangles. Defaults to the site itself.
 * @param logger - Receives the warning for a site larger than one local frame.
 * @returns The chunks, each with its compose pieces.
 * @category Geodata
 */
export declare function siteChunks(site: Bbox, used?: readonly Bbox[], logger?: Logger): SiteChunk[];
/**
 * Warn once per call when a site is larger than a single local frame is
 * recommended for, and say how far off the far end is.
 *
 * Two rules apply: the area rule (above 20 km2) and the extent rule (above 5 km
 * on the longest side), because a long, narrow strip can be small in
 * area and still carry the error of a long site. The warning is written to
 * `logger`, never directly to the console.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param logger - Where the warning is written.
 * @category Geodata
 */
export declare function warnIfOverOneFrame(site: Bbox, logger: Logger): void;
/**
 * The rectangle that bounds a list of simulation-tile query rectangles.
 *
 * @category Geodata
 */
export declare function siteRectangle(rectangles: readonly Bbox[]): Bbox;
/**
 * Run `task` over the chunks, at most `SITE_CHUNKS_IN_FLIGHT` at once.
 *
 * A chunk that fails does not stop the others, so the error reports every
 * failed chunk. A partial result is never returned.
 *
 * @param chunks - The chunks to read.
 * @param task - Reads one chunk; receives the chunk and its index.
 * @param requested - Requested concurrency. Honoured up to
 *   `SITE_CHUNKS_IN_FLIGHT` and the number of chunks, never above.
 * @param signal - Aborts the read. It is checked before each chunk starts and
 *   its reason is thrown unchanged.
 * @returns The results of `task`, in chunk order.
 * @throws {TypeError} when `requested` is not a positive integer.
 * @throws {SiteReadError} when at least one chunk failed; `cause` is the first failure.
 * @category Geodata
 */
export declare function eachChunk<T>(chunks: readonly SiteChunk[], task: (chunk: SiteChunk, index: number) => Promise<T>, requested?: number, signal?: AbortSignal): Promise<T[]>;
