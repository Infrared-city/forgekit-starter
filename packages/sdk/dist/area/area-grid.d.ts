import type { AreaResult, AreaSchedule } from "./schedule-types.js";
/**
 * The type of `AreaResult.mergedGrid`: the type the server stored.
 *
 * - `"f16"`: a `Uint16Array` of raw IEEE half-precision bits (solar radiation, sky view
 *   factor, thermal comfort statistics, wind speed). Read it with `areaGridValuesF32`.
 * - `"f32"`: a `Float32Array` (direct sun hours, daylight availability, and the class codes
 *   of a categorical result).
 * - `"i16"`: an `Int16Array` of stored integers (thermal comfort index saved before 2026-10-07; UTCI is `"f16"` since then): physical value =
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
    /** Place `tiles[indices[i]]` at `(rows[i], cols[i])`; per tile `undefined` or why it is not usable. */
    pushMany(tiles: GridTilesHandle, indices: Uint32Array, rows: Uint32Array, cols: Uint32Array): (string | undefined)[];
    finish(): FinishedGrid;
    free(): void;
}
/** Decoded tile archives in the kernel (`decodeGridTilesStart` / `End`, D299). */
export interface GridTilesHandle {
    free(): void;
}
/** One kernel merger for the run of `schedule`. */
export declare function newAreaGridMerger(schedule: Pick<AreaSchedule, "analysisType" | "gridShape" | "polygon">, strategy: string, windDirectionDeg?: number, block?: number): AreaGridMergerHandle;
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
 * value: the type and the divisor are applied in one call. **An old `"i16"` UTCI grid (saved
 * before 2026-10-07; UTCI is `"f16"` with no divisor since then) read without the
 * divisor is 10 times too large; use this function, it handles both.** The result is a new
 * array; `mergedGrid` does not change. Call `initializeCore()` first.
 *
 * A categorical result (pedestrian wind comfort) gives class CODES, unchanged: a code is an
 * index into `result.legend`, which holds only the classes of THIS run, sorted. The same code
 * can be a different class in another run. Map each code through `result.legend` before you
 * count or compare classes.
 *
 * @param result - The area result.
 * @returns One value per cell.
 * @category Results and legend
 */
export declare function areaGridValuesF32(result: AreaResult): Float32Array;
export {};
