import type { CompactGridResult } from "../internal/binary-result.js";
export interface CompactCategory {
    readonly codes: Uint32Array;
    readonly validity: Uint8Array;
    readonly dictionary: readonly string[];
}
/** Keep owned compact values; apply missing cells without making nested arrays. */
export declare function compactGridTile(parsed: CompactGridResult, cells: number): {
    values?: Float32Array | Float64Array;
    compactCategory?: CompactCategory;
};
/**
 * Normalize compact dictionaries with the same kernel rule as staging.
 *
 * Used to take a second `jsonSources` source list (raw string labels per
 * cell, for a JSON tile decoded in JS) alongside `sources`. D107 moved the
 * JSON route's categorical decode into the kernel too — `decode_grid_json_f64`
 * already returns a `CompactCategory`-shaped per-tile dictionary, so every
 * caller now arrives through `sources`, and that second list is gone.
 */
export declare function compactCategoricalDense(sources: readonly {
    index: number;
    category: CompactCategory;
}[], slots: number, cells: number): {
    values: Float32Array;
    legend: readonly string[];
};
/** Promote only when a JSON or legacy F64 tile requires its original precision. */
export declare function numericCanvas(current: Float32Array | Float64Array | undefined, length: number, incoming: Float32Array | Float64Array): Float32Array | Float64Array;
