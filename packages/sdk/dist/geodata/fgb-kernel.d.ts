import type { Bbox } from "./http.js";
import type { RangeTransport } from "./range-transport.js";
/**
 * Kernel-backed FlatGeobuf reading: the host does `fetch` with `Range`
 * headers and nothing else.
 *
 * The reader is the sans-I/O mirror of `PackedRTree::http_stream_search`,
 * because the whole packed index of the world files is 1.4-1.7 GB and must
 * never be downloaded:
 *
 * 1. read a small prefix and ask the kernel for the file's layout
 *    (`fgbLayout`), which also says how many bytes the full header needs;
 * 2. loop: hand the kernel the header, the AOI, the file size and every
 *    index node fetched so far (`fgbIndexSearchStep`); it answers with the
 *    node ranges it still needs (`need`) or, once it has descended the tree,
 *    the feature ranges (`features`);
 * 3. fetch those feature ranges in order and decode them
 *    (`fgbDecodeRangeFeatures`).
 *
 * Every kernel call is pure and stateless, so the host can await between
 * steps — which is what makes this work in a browser, where `fetch` cannot
 * be blocked on.
 *
 * Consistency: the first answer's entity tag is sent as `If-Match` on every
 * follow-up range, so a quarterly file replacement mid-read fails typed
 * instead of decoding two halves of two different files. The header and the
 * top index levels are cached per realm, keyed by `(url, ETag)`.
 *
 * The export names live in one constant so a rename is a one-line change.
 */
/** The kernel exports this backend needs, in call order. */
export declare const KERNEL_FGB_EXPORTS: Readonly<{
    layout: "fgbLayout";
    indexSearchStep: "fgbIndexSearchStep";
    decodeRangeFeatures: "fgbDecodeRangeFeatures";
}>;
/** First read: enough for the header of any FlatGeobuf we publish. */
export declare const HEADER_PREFIX_BYTES = 8192;
/**
 * Caps on what the kernel may ask the host to fetch.
 *
 * The host trusts the kernel's plan, and the objects behind it are 5.4 GB
 * and 14.4 GB, so "the kernel would not do that" is not a bound. A single
 * planned range and the sum of one read's ranges are both capped, and a
 * breach is a typed error rather than an allocation.
 */
export declare const MAX_PLANNED_RANGE_BYTES: number;
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
/** Drop the cached FlatGeobuf headers and index levels in this realm. */
export declare function clearFgbCache(): void;
/**
 * Read one FlatGeobuf object inside `bbox` via the kernel, as JSON text.
 *
 * The kernel's answer is handed on unparsed: the next kernel call in the
 * chain takes the same string (bulk-data rule 1). Buffers: each range read
 * is a fresh `Uint8Array` owned by this call; the header and the top index
 * levels are owned by the realm cache and only borrowed here; nothing else
 * outlives the read.
 */
export declare function readFgbBboxJsonWithKernel(url: string, bbox: Bbox, transport: RangeTransport): Promise<string>;
/**
 * The same read against a caller-supplied set of kernel functions.
 *
 * The core module namespace cannot be patched, so this is the host's own
 * seam for a test to supply a fake `layout` / `indexSearchStep` /
 * `decodeRangeFeatures` set and exercise the range budget, the header-size
 * check and the convergence limit without a built core that has the reader.
 * Exported for that one caller (`tests/geodata/fgb-kernel.wasm.test.ts`); the
 * per-core-object adapter lives in the test itself.
 */
export declare function readWithFunctions(layout: Layout, searchStep: IndexSearchStep, decodeRangeFeatures: DecodeRangeFeatures, url: string, bbox: Bbox, transport: RangeTransport): Promise<string>;
export {};
