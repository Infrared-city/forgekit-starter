import { cellHasValue } from "../internal/cell-has-value.js";
import { requireCore } from "../internal/core.js";
import { getTilingConfig } from "./tiling.js";
/** One kernel merger for the run of `schedule`. */
export function newAreaGridMerger(schedule, strategy, windDirectionDeg, block) {
    const config = getTilingConfig(schedule.analysisType);
    const configJson = JSON.stringify({
        inference_size_m: config.inferenceSizeM,
        inference_size_cells: config.inferenceSizeCells,
        context_size_m: config.contextSizeM,
        step_m: config.stepM,
        step_cells: config.stepCells,
        cell_size_m: config.cellSizeM,
    });
    return new (requireCore().AreaGridMerger)(schedule.gridShape[0], schedule.gridShape[1], configJson, JSON.stringify(schedule.polygon), strategy, windDirectionDeg, block);
}
/** Finish the merge: the grid in its wire type, with what the kernel measured. */
export function finishAreaGrid(merger) {
    const out = merger.finish();
    const bounds = out.bounds;
    return {
        mergedGrid: out.values,
        valueDtype: out.valuesDtype,
        valueDivisor: out.valueDivisor,
        ...(out.valid === undefined ? {} : { valid: out.valid }),
        gridShape: [out.shape[0], out.shape[1]],
        ...(out.legend === undefined ? {} : { legend: Object.freeze(Array.from(out.legend)) }),
        ...(out.minLegend === undefined ? {} : { minLegend: out.minLegend, maxLegend: out.maxLegend }),
        ...(bounds === undefined ? {} : {
            bounds: [bounds[0], bounds[1], bounds[2], bounds[3]],
        }),
    };
}
/**
 * Tells whether a cell of `mergedGrid` has a value. Use it for every `valueDtype`: NaN
 * (`"f16"` bits, `"f32"`, `"f64"`) or a clear `valid` bit (`"i16"`) means no value.
 *
 * @param result - The area result.
 * @param cell - The cell index, row-major, from `0` to `mergedGrid.length - 1`.
 * @returns True when the cell has a value.
 * @category Results and legend
 */
export function areaGridHasValue(result, cell) {
    return cellHasValue(result.valueDtype, result.mergedGrid, result.valid, cell);
}
/**
 * Returns the physical values of `mergedGrid` as 32-bit floats, `NaN` for a cell without a
 * value: the type and the divisor are applied in one call. **An `"i16"` grid read without
 * the divisor is 10 times too large for UTCI; use this function.** The result is a new
 * array; `mergedGrid` does not change. Call `initializeCore()` first.
 *
 * @param result - The area result.
 * @returns One value per cell.
 * @category Results and legend
 */
// Maintainer note (not published): one `surfaceValuesF32` kernel call (D272, D273); the host
// has no f16 decode and no divisor arithmetic.
export function areaGridValuesF32(result) {
    const grid = result.mergedGrid;
    return requireCore("areaGridValuesF32").surfaceValuesF32(new Uint8Array(grid.buffer, grid.byteOffset, grid.byteLength), result.valueDtype, result.valueDivisor, result.valid, 0, grid.length);
}
