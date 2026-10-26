import type { AreaResult, AreaSchedule } from "./schedule-types.js";
/**
 * The type of `AreaResult.mergedGrid`: the type the server stored.
 *
 * - `"f16"`: a `Uint16Array` of raw IEEE half-precision bits (solar radiation, sky view
 *   factor, thermal comfort statistics, wind speed). Read it with `areaGridValuesF32`.
 * - `"f32"`: a `Float32Array` (direct sun hours, daylight availability, and the class codes
 *   of a categorical result).
 * - `"i16"`: an `Int16Array` of stored integers (thermal comfort index): physical value =
 *   stored value / `valueDivisor`, and `valid` tells which cells have a value.
 * - `"f64"`: a `Float64Array` (a run that mixes types).
 *
 * @category Results and legend
 */
export type AreaGridDtype = "f16" | "f32" | "i16" | "f64";
/** The grid half of `AreaResult`, as the kernel merger gives it. */
type MergedArea = Pick<AreaResult, "mergedGrid" | "valueDtype" | "valueDivisor" | "valid" | "gridShape" | "legend" | "minLegend" | "maxLegend" | "bounds">;
interface FinishedGrid {
    readonly values: Uint16Array | Float32Array | Int16Array | Float64Array;
    readonly valuesDtype: AreaGridDtype;
    readonly valueDivisor: number;
    readonly valid?: Uint8Array;
    readonly shape: [number, number];
    readonly bounds?: Float64Array;
    readonly legend?: string[];
    readonly minLegend?: number;
    readonly maxLegend?: number;
}
/** The kernel's incremental area grid merger (D273). */
export interface AreaGridMergerHandle {
    push(row: number, col: number, archive: Uint8Array): string | undefined;
    finish(): FinishedGrid;
    free(): void;
}
/** One kernel merger for the run of `schedule`. */
export declare function newAreaGridMerger(schedule: AreaSchedule, strategy: string, windDirectionDeg?: number, block?: number): AreaGridMergerHandle;
/** Finish the merge: the grid in its wire type, with what the kernel measured. */
export declare function finishAreaGrid(merger: AreaGridMergerHandle): MergedArea;
/**
 * Tells whether a cell of `mergedGrid` has a value. Use it for every `valueDtype`: NaN
 * (`"f16"` bits, `"f32"`, `"f64"`) or a clear `valid` bit (`"i16"`) means no value.
 *
 * @param result - The area result.
 * @param cell - The cell index, row-major, from `0` to `mergedGrid.length - 1`.
 * @returns True when the cell has a value.
 * @category Results and legend
 */
export declare function areaGridHasValue(result: AreaResult, cell: number): boolean;
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
export declare function areaGridValuesF32(result: AreaResult): Float32Array;
export {};
