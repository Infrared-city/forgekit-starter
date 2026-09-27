import type { RangeTransport } from "./range-transport.js";
/**
 * The `hyparquet` seam: loading the decoder, and the buffer it reads from.
 *
 * Its own module so the reader above it (`overture-rows.ts`) is about rows
 * and rectangles only, and so the one place that names the optional
 * dependency is small enough to read. The kernel cannot do this job: the
 * Rust parquet stack needs C zstd, which does not build for wasm32 (D39).
 */
export interface ParquetModule {
    parquetMetadataAsync(file: AsyncBuffer): Promise<ParquetMetadata>;
    parquetReadObjects(options: {
        file: AsyncBuffer;
        compressors?: unknown;
        columns?: readonly string[];
        rowStart?: number;
        rowEnd?: number;
        parsers?: Record<string, (value: never) => unknown>;
    }): Promise<Array<Record<string, unknown>>>;
}
/** What `hyparquet` reads a file through: a length and a byte window. */
export interface AsyncBuffer {
    byteLength: number;
    slice(start: number, end?: number): Promise<ArrayBuffer>;
}
export interface ColumnStatistics {
    min_value?: number;
    max_value?: number;
}
export interface ParquetMetadata {
    row_groups: Array<{
        num_rows: number | bigint;
        columns: Array<{
            meta_data?: {
                path_in_schema: string[];
                statistics?: ColumnStatistics;
                /** Compressed size of this column chunk; the byte-budget input. */
                total_compressed_size?: number | bigint;
            };
        }>;
    }>;
    schema: Array<{
        name: string;
    }>;
}
/**
 * Geometry kept as WKB bytes during the decode, turned into GeoJSON per kept row.
 *
 * `hyparquet` turns every GeoParquet geometry of a decoded page into GeoJSON,
 * one JavaScript array per position. A span starts and ends on page
 * boundaries, so a land_cover span that keeps 1 row converted 1 000 to 4 000
 * polygons: 35-60 MB of heap per row group, all of it garbage after the row
 * filter. `parsers` keeps the bytes, and `toGeojson` is `hyparquet`'s own WKB
 * decoder, so a kept row gets the same GeoJSON as before.
 *
 * Both come from `hyparquet`'s `./src/*.js` subpath export. Where that export
 * is absent, this is `undefined` and the read decodes GeoJSON as before.
 */
export interface RawGeometry {
    readonly parsers: Record<string, (value: never) => unknown>;
    toGeojson(bytes: Uint8Array): unknown;
}
export interface LoadedParquet {
    readonly parquet: ParquetModule;
    readonly compressors: unknown;
    readonly geometry?: RawGeometry;
}
/** The decoder and its codecs, imported once per realm. */
export declare function loadParquet(): Promise<LoadedParquet>;
/**
 * A parquet file window served by the range transport.
 *
 * The LENGTH is a parameter rather than a fetch: it belongs to the file, not
 * to the read, so a caller that already knows it (from the footer cache)
 * builds a buffer without touching the network at all (D47).
 */
export declare function asyncBufferOf(url: string, byteLength: number, transport: RangeTransport): AsyncBuffer;
/**
 * The same file, but the slices asked in one synchronous turn resolve together.
 *
 * `hyparquet` asks for every column chunk of a row group at once, one range
 * each, and decodes a chunk as soon as its range arrives. The small chunks
 * arrive first, so each row group in flight held its decoded nested columns
 * (`sources`, `names`, `bbox`: the WHOLE group, not only the span) while it
 * waited for its large geometry chunk. With six row groups in flight per theme
 * that was most of the peak heap.
 *
 * Released together, the chunks of one row group decode and are filtered in
 * one run of microtasks (the zstd codec is synchronous), so no other row group
 * decodes between them. This is not a lock across groups: two groups whose last
 * ranges complete in the SAME event-loop task decode in the same run. Ranges
 * of two groups arrive on two requests, so that is rare, and the measured live
 * set of a 600 m ground read fell from 611 MB to 127 MB. The ranges, the
 * requests and their concurrency do not change: only the compressed bytes wait.
 */
export declare function oneTurnBuffer(file: AsyncBuffer): AsyncBuffer;
