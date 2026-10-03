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
import { requireCore } from "./internal/core.js";
import { fetchVisualConfigurations, } from "./internal/registry-document.js";
import { resolveVisualConfig } from "./images.js";
const EMPTY = new Float64Array(0);
/** The grid behind a source; the type is checked in every mode. */
function gridOf(source) {
    if (source instanceof Float32Array || source instanceof Float64Array)
        return source;
    const grid = source?.mergedGrid;
    if (grid instanceof Float32Array || grid instanceof Float64Array)
        return grid;
    throw new TypeError("expected an AreaResult, a Float32Array or a Float64Array");
}
function isCategorical(source) {
    if (source instanceof Float32Array || source instanceof Float64Array)
        return false;
    return (source.legend?.length ?? 0) > 0;
}
function toRange(range) {
    return range === undefined ? undefined : [range[0], range[1]];
}
/**
 * The legend range for one result in the given display `mode` (default
 * `"exact"`). `undefined` when no cell is finite, or, in a measured mode,
 * when the result is categorical. Throws on an unknown mode, on `"fixed"`
 * without a valid `fixed` range, and on `fixed` with any other mode.
 */
export function legendRange(source, mode = "exact", options = {}) {
    const grid = gridOf(source);
    // Fixed never reads the cells, and a categorical result has none to
    // measure: send none. The kernel still validates the mode and `fixed`.
    const values = mode === "fixed" || isCategorical(source) ? EMPTY : grid;
    return toRange(requireCore().legendRange(values, mode, options.fixed?.[0], options.fixed?.[1]));
}
/**
 * ONE legend range pooled over several results: every finite cell of every
 * result is pooled and `mode` is applied once, so `"trimmed"` is the
 * percentile of the pooled data, never a union of per-result percentiles.
 * Categorical results are left out in the measured modes. `undefined` when
 * nothing finite remains.
 */
export function sharedLegendRange(sources, mode = "exact", options = {}) {
    if (!Array.isArray(sources))
        throw new TypeError("expected an array of results");
    const grids = sources.map(gridOf);
    const pooled = mode === "fixed" ? [] : grids.filter((_, index) => !isCategorical(sources[index]));
    return toRange(requireCore().sharedLegendRange(pooled, mode, options.fixed?.[0], options.fixed?.[1]));
}
/**
 * The metric's full scale from the public colour registry, for
 * `legendRange(result, "fixed", { fixed })`. `undefined` when the registry
 * has no entry for `analysisType`, or its `steps` are class labels or absent
 * (many analyses today, infrared-core#527). Reads the same cached
 * `visualConfigurations` document local grid rendering uses.
 */
export async function registryFixedRange(analysisType, options = {}) {
    const configurations = options.visualConfigurations ??
        (await fetchVisualConfigurations(options.registry ?? {})).configurations;
    const config = resolveVisualConfig(configurations, analysisType, {
        criteria: options.criteria,
        subtype: options.subtype,
    });
    if (config === undefined)
        return undefined;
    return toRange(requireCore().registryFixedRange(JSON.stringify(config)));
}
