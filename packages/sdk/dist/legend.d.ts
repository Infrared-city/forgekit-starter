/**
 * Legend (colour-scale) ranges for grid area results.
 *
 * An {@link AreaResult} already carries the default range on
 * `minLegend` / `maxLegend`: the exact minimum and maximum of the finished,
 * merged and clipped grid. This module covers the other display modes an app
 * may want, computed on demand:
 *
 * - `"exact"`: the true min/max, what `minLegend` / `maxLegend` already hold.
 * - `"trimmed"`: the 2nd/98th percentile (exact, with linear interpolation as
 *   in numpy), an outlier-robust range for display.
 * - `"fixed"`: a caller-supplied full scale, ignoring the data.
 * - {@link registryFixedRange}: the metric's registry-defined scale, when the
 *   public colour registry publishes one.
 *
 * {@link sharedLegendRange} pools several results onto one scale, for
 * comparing scenarios side by side.
 *
 * A categorical result (one that carries a class list in `legend`) has no
 * numeric range: its grid holds class codes. The measured modes return
 * `undefined` for it, and {@link sharedLegendRange} leaves it out of the pool.
 * A bare typed array carries no such marker and is always measured.
 */
import type { AreaResult } from "./area/schedule-types.js";
import { type FetchRegistryOptions, type VisualConfigurations } from "./internal/registry-document.js";
/**
 * How a legend range is chosen: `"exact"` (true min/max), `"trimmed"` (2nd to
 * 98th percentile) or `"fixed"` (a caller-supplied scale).
 *
 * @category Results and legend
 */
export type LegendMode = "exact" | "trimmed" | "fixed";
/**
 * A legend range as `[min, max]`, in the units of the result.
 *
 * @category Results and legend
 */
export type LegendRange = readonly [min: number, max: number];
/**
 * A result to range over: an area result, or its grid on its own.
 *
 * @category Results and legend
 */
export type LegendSource = (Pick<AreaResult, "mergedGrid" | "legend"> & Partial<Pick<AreaResult, "valueDtype" | "valueDivisor" | "valid">>) | Uint16Array | Float32Array | Int16Array | Float64Array;
/**
 * Options for `legendRange` and `sharedLegendRange`.
 *
 * @category Results and legend
 */
export interface LegendRangeOptions {
    /** Required for mode `"fixed"` (finite, `min < max`); refused with any other mode. */
    readonly fixed?: LegendRange;
}
/**
 * Options for `registryFixedRange`.
 *
 * @category Results and legend
 */
export interface RegistryFixedRangeOptions {
    /** Variant selector for analyses with several variants; wins over `subtype`. */
    readonly criteria?: string;
    /** Variant selector, used only when `criteria` is absent. */
    readonly subtype?: string;
    /** Already-fetched `visualConfigurations`; omit it to fetch (and cache). */
    readonly visualConfigurations?: VisualConfigurations;
    /** Overrides for the registry fetch. */
    readonly registry?: FetchRegistryOptions;
}
/**
 * The legend range for one result in the given display mode.
 *
 * @param source - An area result, or its grid as a typed array (a `Uint16Array` holds
 *   half-precision bits; an `Int16Array` needs the area result for its divisor and `valid`).
 * @param mode - `"exact"` (default), `"trimmed"` or `"fixed"`.
 * @param options - `fixed` is required for `"fixed"` and refused with any other mode.
 * @returns The range, or `undefined` when no cell is finite or, in a measured
 *   mode, when the result is categorical.
 * @throws {Error} on an unknown mode, on `"fixed"` without a valid `fixed` range,
 *   and on `fixed` with any other mode.
 * @throws {TypeError} when `source` is not an area result or a typed array.
 * @category Results and legend
 */
export declare function legendRange(source: LegendSource, mode?: LegendMode, options?: LegendRangeOptions): LegendRange | undefined;
/**
 * One legend range pooled over several results.
 *
 * Every finite cell of every result is pooled and `mode` is applied once, so
 * `"trimmed"` is the percentile of the pooled data, never a union of
 * per-result percentiles. Categorical results are left out in the measured
 * modes.
 *
 * @param sources - Area results, or their grids.
 * @param mode - `"exact"` (default), `"trimmed"` or `"fixed"`.
 * @param options - `fixed` is required for `"fixed"` and refused with any other mode.
 * @returns The pooled range, or `undefined` when nothing finite remains.
 * @throws {TypeError} when `sources` is not an array, or an entry is not an area
 *   result or a typed array.
 * @category Results and legend
 */
export declare function sharedLegendRange(sources: readonly LegendSource[], mode?: LegendMode, options?: LegendRangeOptions): LegendRange | undefined;
/**
 * The metric's full scale from the public colour registry, for use as
 * `legendRange(result, "fixed", { fixed })`.
 *
 * Reads the same cached `visualConfigurations` document that grid rendering uses.
 *
 * @param analysisType - The analysis whose scale to look up.
 * @param options - Variant selectors (`criteria`, `subtype`), an already-fetched
 *   registry document, or fetch overrides.
 * @returns The scale, or `undefined` when the registry has no entry for
 *   `analysisType`, or its `steps` are class labels or absent (true of many
 *   analyses today).
 * @category Results and legend
 */
export declare function registryFixedRange(analysisType: string, options?: RegistryFixedRangeOptions): Promise<LegendRange | undefined>;
