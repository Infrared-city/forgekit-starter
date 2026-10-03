/**
 * Legend (colour-scale) ranges for grid area results (#390).
 *
 * An {@link AreaResult} already carries the default range on
 * `minLegend` / `maxLegend`: the EXACT min/max the kernel measures over the
 * finished merged, clipped grid. This module is for the other display modes
 * an app may want, computed on demand. A display picks the mode; the SDK only
 * exposes the kernel call, so this host holds no measuring rule of its own
 * (`ir_raster::legend`, ADR 0016).
 *
 * - `"exact"`: the true min/max, what `minLegend` / `maxLegend` already hold.
 * - `"trimmed"`: the 2nd/98th percentile (exact, numpy's linear
 *   interpolation), an outlier-robust range for display.
 * - `"fixed"`: a caller-supplied full scale, ignoring the data.
 * - {@link registryFixedRange}: the metric's registry-defined scale, when the
 *   public colour registry publishes one.
 *
 * {@link sharedLegendRange} pools several results onto ONE scale, for
 * comparing scenarios side by side.
 *
 * A categorical result (one that carries a class list in `legend`) has no
 * numeric range: its grid holds class codes. The measured modes return
 * `undefined` for it, and {@link sharedLegendRange} leaves it out of the pool.
 * A bare typed array carries no such marker and is always measured.
 */
import type { AreaResult } from "./area/schedule-types.js";
import { type FetchRegistryOptions, type VisualConfigurations } from "./internal/registry-document.js";
export type LegendMode = "exact" | "trimmed" | "fixed";
export type LegendRange = readonly [min: number, max: number];
/** A result to range over: an area result, or its grid on its own. */
export type LegendSource = Pick<AreaResult, "mergedGrid" | "legend"> | Float32Array | Float64Array;
export interface LegendRangeOptions {
    /** Required for mode `"fixed"` (finite, `min < max`); refused otherwise. */
    readonly fixed?: LegendRange;
}
export interface RegistryFixedRangeOptions {
    /** Variant selector; wins over `subtype`. */
    readonly criteria?: string;
    /** Variant selector, used only when `criteria` is absent. */
    readonly subtype?: string;
    /** Already-fetched `visualConfigurations`; omit it to fetch (and cache). */
    readonly visualConfigurations?: VisualConfigurations;
    /** Overrides for the registry fetch. */
    readonly registry?: FetchRegistryOptions;
}
/**
 * The legend range for one result in the given display `mode` (default
 * `"exact"`). `undefined` when no cell is finite, or, in a measured mode,
 * when the result is categorical. Throws on an unknown mode, on `"fixed"`
 * without a valid `fixed` range, and on `fixed` with any other mode.
 */
export declare function legendRange(source: LegendSource, mode?: LegendMode, options?: LegendRangeOptions): LegendRange | undefined;
/**
 * ONE legend range pooled over several results: every finite cell of every
 * result is pooled and `mode` is applied once, so `"trimmed"` is the
 * percentile of the pooled data, never a union of per-result percentiles.
 * Categorical results are left out in the measured modes. `undefined` when
 * nothing finite remains.
 */
export declare function sharedLegendRange(sources: readonly LegendSource[], mode?: LegendMode, options?: LegendRangeOptions): LegendRange | undefined;
/**
 * The metric's full scale from the public colour registry, for
 * `legendRange(result, "fixed", { fixed })`. `undefined` when the registry
 * has no entry for `analysisType`, or its `steps` are class labels or absent
 * (many analyses today, infrared-core#527). Reads the same cached
 * `visualConfigurations` document local grid rendering uses.
 */
export declare function registryFixedRange(analysisType: string, options?: RegistryFixedRangeOptions): Promise<LegendRange | undefined>;
