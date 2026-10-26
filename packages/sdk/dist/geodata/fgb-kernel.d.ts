import type { Bbox } from "./http.js";
import type { RangeTransport } from "./range-transport.js";
/**
 * Names of the core-library functions the FlatGeobuf reader calls, in call
 * order: file layout, index search step and feature decoding.
 *
 * @category Geodata
 */
export declare const KERNEL_FGB_EXPORTS: Readonly<{
    layout: "fgbLayout";
    indexSearchStep: "fgbIndexSearchStep";
    decodeRangeFeatures: "fgbDecodeRangeFeatures";
}>;
/**
 * Size, in bytes (`8192`), of the first read of a FlatGeobuf file. It is
 * enough for the header of any FlatGeobuf the SDK reads.
 *
 * @category Geodata
 */
export declare const HEADER_PREFIX_BYTES = 8192;
/**
 * Largest single byte range, in bytes (64 MiB), one FlatGeobuf read may
 * fetch. A larger planned range fails with a `GeodataRangeError`.
 *
 * @category Geodata
 */
export declare const MAX_PLANNED_RANGE_BYTES: number;
/**
 * Largest total, in bytes (256 MiB), that the ranges of one FlatGeobuf read
 * may add up to. A larger plan fails with a `GeodataRangeError`.
 *
 * @category Geodata
 */
export declare const MAX_PLANNED_TOTAL_BYTES: number;
interface FgbLayout {
    readonly header_len: number;
    readonly required_prefix_len?: number;
    readonly index_len?: number;
    readonly features_offset?: number;
    readonly features_count?: number;
    readonly index_node_size?: number;
}
interface SearchStep {
    readonly need: ReadonlyArray<readonly [number, number]>;
    readonly features: ReadonlyArray<readonly [number, number]>;
}
interface FetchedNode {
    readonly offset: number;
    readonly bytes: Uint8Array;
}
type Layout = (prefix: Uint8Array) => FgbLayout;
type IndexSearchStep = (header: Uint8Array, minLon: number, minLat: number, maxLon: number, maxLat: number, fileSize: number, fetchedNodes: FetchedNode[]) => SearchStep;
type DecodeRangeFeatures = (header: Uint8Array, featuresBytes: Uint8Array, minLon: number, minLat: number, maxLon: number, maxLat: number) => string;
/**
 * Drop the cached FlatGeobuf headers and index levels held by this runtime.
 *
 * @category Geodata
 */
export declare function clearFgbCache(): void;
/**
 * Read the features of one FlatGeobuf object inside `bbox`, as GeoJSON
 * FeatureCollection text.
 *
 * Only the index nodes and feature ranges that the area needs are fetched. The
 * text is returned unparsed.
 *
 * @param url - The FlatGeobuf object URL.
 * @param bbox - The area to read, in WGS84 degrees.
 * @param transport - The byte-range reader used to fetch ranges.
 * @returns The features as FeatureCollection text.
 * @throws {GeodataRangeError} when the object changes mid-read or a planned
 *   range exceeds the byte caps.
 * @category Geodata
 */
export declare function readFgbBboxJsonWithKernel(url: string, bbox: Bbox, transport: RangeTransport): Promise<string>;
/**
 * The same read as {@link readFgbBboxJsonWithKernel}, against a
 * caller-supplied set of layout, index-search and feature-decoding
 * functions.
 *
 * Intended for tests that need to exercise the range limits, the header-size
 * check and the search-step limit with fake functions.
 *
 * @category Geodata
 */
export declare function readWithFunctions(layout: Layout, searchStep: IndexSearchStep, decodeRangeFeatures: DecodeRangeFeatures, url: string, bbox: Bbox, transport: RangeTransport): Promise<string>;
export {};
