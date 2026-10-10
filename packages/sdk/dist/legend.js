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
// Maintainer note (not published): the range rule is #390. The SDK only exposes
// the kernel call (`ir_raster::legend`, ADR 0016), so this host holds no
// measuring rule of its own; the kernel measures the exact min/max over the
// finished merged, clipped grid.
import { requireCore } from "./internal/core.js";
import { fetchVisualConfigurations, } from "./internal/registry-document.js";
import { resolveVisualConfig } from "./images.js";
const EMPTY = new Float64Array(0);
function isGrid(value) {
    return value instanceof Uint16Array || value instanceof Float32Array
        || value instanceof Int16Array || value instanceof Float64Array;
}
/** The grid behind a source; the type is checked in every mode. A `Uint16Array` is `"f16"`
 * bits (D273). */
function gridOf(source) {
    if (isGrid(source))
        return source;
    const grid = source?.mergedGrid;
    if (isGrid(grid))
        return grid;
    throw new TypeError("expected an AreaResult or a Uint16Array, Float32Array, Int16Array or Float64Array");
}
function isCategorical(source) {
    if (isGrid(source))
        return false;
    return (source.legend?.length ?? 0) > 0;
}
/** The `"i16"` divisor and validity bitmap of a source, for the kernel. */
function wire(source) {
    if (isGrid(source))
        return [undefined, undefined];
    return [source.valueDivisor, source.valid];
}
function toRange(range) {
    return range === undefined ? undefined : [range[0], range[1]];
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
export function legendRange(source, mode = "exact", options = {}) {
    const grid = gridOf(source);
    // Fixed never reads the cells, and a categorical result has none to
    // measure: send none. The kernel still validates the mode and `fixed`.
    const values = mode === "fixed" || isCategorical(source) ? EMPTY : grid;
    const [divisor, valid] = values === EMPTY ? [undefined, undefined] : wire(source);
    return toRange(requireCore("legendRange").legendRange(values, mode, options.fixed?.[0], options.fixed?.[1], divisor, valid));
}
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
export function sharedLegendRange(sources, mode = "exact", options = {}) {
    if (!Array.isArray(sources))
        throw new TypeError("expected an array of results");
    const grids = sources.map(gridOf);
    // The pooled kernel call reads Float32Array and Float64Array only: an "f16" or "i16" grid
    // joins the pool as its physical values (one Float32Array copy).
    const pooled = mode === "fixed" ? [] : grids.flatMap((grid, index) => {
        const source = sources[index];
        if (isCategorical(source))
            return [];
        if (grid instanceof Float32Array || grid instanceof Float64Array)
            return [grid];
        const [divisor, valid] = wire(source);
        return [requireCore("sharedLegendRange").surfaceValuesF32(new Uint8Array(grid.buffer, grid.byteOffset, grid.byteLength), grid instanceof Uint16Array ? "f16" : "i16", divisor ?? 1, valid, 0, grid.length)];
    });
    return toRange(requireCore("sharedLegendRange").sharedLegendRange(pooled, mode, options.fixed?.[0], options.fixed?.[1]));
}
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
// Maintainer note (not published): infrared-core#527 tracks analyses whose
// registry `steps` are class labels or absent.
export async function registryFixedRange(analysisType, options = {}) {
    const configurations = options.visualConfigurations ??
        (await fetchVisualConfigurations(options.registry ?? {})).configurations;
    const config = resolveVisualConfig(configurations, analysisType, {
        criteria: options.criteria,
        subtype: options.subtype,
    });
    if (config === undefined)
        return undefined;
    return toRange(requireCore("registryFixedRange").registryFixedRange(JSON.stringify(config)));
}
