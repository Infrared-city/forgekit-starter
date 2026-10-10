// Maintainer note (not published): The merged surface result of an area run, as COLUMNS
// (D197, D198).
//
// The kernel joins every job of a facade / surface run in one call
// (`joinSurfaceJobs`) and this is what it gives back: one typed array per
// per-surface field, one per per-cell field, and a triangle table. There is
// no object per surface and no array per cell. Every array owns its whole
// buffer, so the result can be transferred to another thread as it is, and a
// renderer can upload `triangles.positions[g]` without a copy.
//
// Rows: surface `i` is `ids.slice(idOffsets[i], idOffsets[i + 1])`, its
// vectors are `origin[3i..3i+3]` (and the axes), and its cells are
// `values[cellOffsets[i]..cellOffsets[i + 1]]`. Look a surface up by id with
// `surfaceIndex`. Join two results by surface id and cell index, never
// by row: the row order is the canonical order of the run's entry ids (#579).
import { cellHasValue } from "../internal/cell-has-value.js";
import { requireCore } from "../internal/core.js";
/**
 * Builds the public `SurfaceColumns` from a join result.
 *
 * @param joined - The joined columns.
 * @returns The surface columns.
 * @category Results and legend
 */
// Maintainer note (not published): The public result from the kernel's answer: two JSON
// texts parsed, nothing copied. The values keep the kernel's typed array (D272).
export function surfaceColumnsFromJoin(joined) {
    return {
        kind: "surface-columns", version: 2,
        surfaceCount: joined.surfaceCount, ids: joined.ids, idOffsets: joined.idOffsets,
        origin: joined.origin, uAxis: joined.uAxis, vAxis: joined.vAxis,
        gridSize: joined.gridSize, nu: joined.nu, nv: joined.nv,
        area: joined.area, mean: joined.mean, peak: joined.peak,
        cellOffsets: joined.cellOffsets, values: joined.values, valueDtype: joined.valuesDtype,
        valueDivisor: joined.valueDivisor,
        ...(joined.valuesValid === undefined ? {} : { valid: joined.valuesValid }),
        cellAreaState: joined.cellAreaState,
        ...(joined.outline === undefined || joined.outlineOffsets === undefined
            ? {}
            : { outline: joined.outline, outlineOffsets: joined.outlineOffsets }),
        ...(joined.cellArea === undefined ? {} : { cellArea: joined.cellArea }),
        ...(joined.extraJson === undefined ? {} : { extra: JSON.parse(joined.extraJson) }),
        ...(joined.triangles === undefined ? {} : { triangles: joined.triangles }),
        aggregates: JSON.parse(joined.aggregatesJson),
        minLegend: joined.minLegend, maxLegend: joined.maxLegend, sensorCount: joined.sensorCount,
        ...(joined.fallbackReasons.length === 0 ? {} : { cellTrisFallback: [...joined.fallbackReasons] }),
    };
}
/**
 * Returns the surface result of a run with no jobs: no surfaces and no cells.
 *
 * @returns An empty `SurfaceColumns`.
 * @category Results and legend
 */
export function emptySurfaceColumns() {
    const none = new Float64Array(0);
    return {
        kind: "surface-columns", version: 2, surfaceCount: 0, ids: "", idOffsets: Uint32Array.of(0),
        origin: none, uAxis: none.slice(), vAxis: none.slice(), gridSize: none.slice(),
        nu: new Uint32Array(0), nv: new Uint32Array(0),
        area: none.slice(), mean: none.slice(), peak: none.slice(),
        cellOffsets: Uint32Array.of(0), values: new Float32Array(0), valueDtype: "f32", valueDivisor: 1,
        cellAreaState: new Uint8Array(0),
        aggregates: {}, minLegend: 0, maxLegend: 0, sensorCount: 0,
    };
}
/**
 * Returns the id of a surface.
 *
 * @param result - The surface columns.
 * @param row - The surface row, from `0` to `surfaceCount - 1`.
 * @returns The surface id.
 * @category Results and legend
 */
export function surfaceId(result, row) {
    return result.ids.slice(result.idOffsets[row], result.idOffsets[row + 1]);
}
const indices = new WeakMap();
/**
 * Maps each surface id to its row. The map is built on first use and kept with the result.
 *
 * @param result - The surface columns.
 * @returns A map from surface id to row.
 * @category Results and legend
 */
export function surfaceIndex(result) {
    let index = indices.get(result);
    if (index === undefined) {
        const map = new Map();
        for (let row = 0; row < result.surfaceCount; row += 1)
            map.set(surfaceId(result, row), row);
        indices.set(result, map);
        index = map;
    }
    return index;
}
/**
 * Tells whether a surface is a wall: its grid normal is at most 30° from horizontal.
 *
 * @param result - The surface columns.
 * @param row - The surface row.
 * @returns True for a wall.
 * @category Results and legend
 */
export function isVertical(result, row) {
    const u = 3 * row;
    const normalZ = result.uAxis[u] * result.vAxis[u + 1] - result.uAxis[u + 1] * result.vAxis[u];
    return Math.abs(normalZ) <= 0.5;
}
/**
 * Tells whether a cell has a value. Use it for every type of `values`: NaN (`"f16"` bits,
 * `"f32"`, `"f64"`) or a clear `valid` bit (`"i16"`) means no value.
 *
 * @param result - The surface columns.
 * @param cell - The cell index, from `0` to `cellOffsets[surfaceCount] - 1`.
 * @returns True when the cell has a value.
 * @category Results and legend
 */
export function surfaceHasValue(result, cell) {
    return cellHasValue(result.valueDtype, result.values, result.valid, cell);
}
/**
 * Returns the physical values of cells `first` to `last - 1` as 32-bit floats, `NaN` for a
 * cell without a value. It applies the type and the divisor in one call for the range. The
 * result is a new array; `values` does not change. Call `initializeCore()` first.
 *
 * @param result - The surface columns.
 * @param first - The first cell. Default `0`.
 * @param last - One past the last cell. Default: every cell.
 * @returns One value per cell of the range.
 * @category Results and legend
 */
// Maintainer note (not published): one `surfaceValuesF32` kernel call (D272); the host has no
// f16 decode and no divisor arithmetic.
export function surfaceValuesF32(result, first = 0, last = result.values.length) {
    const v = result.values;
    return requireCore().surfaceValuesF32(new Uint8Array(v.buffer, v.byteOffset, v.byteLength), result.valueDtype, result.valueDivisor, result.valid, first, last);
}
/**
 * Returns the value of each vertex of a group's triangles (three per triangle, aligned with
 * `triangles.positions[group]`): the physical value of the cell the triangle draws, `NaN` for
 * a cell without one. A renderer can upload it as an attribute next to the positions.
 *
 * @param result - The surface columns.
 * @param group - The triangle group (one job).
 * @returns One value per vertex.
 * @throws {Error} When the result has no triangles.
 * @category Results and legend
 */
export function vertexValues(result, group) {
    const table = result.triangles;
    if (table === undefined)
        throw new Error("This result has no cell triangles. Build it with emitCellTris: true.");
    const base = table.groupTriangles[group];
    const out = new Float32Array((table.groupTriangles[group + 1] - base) * 3);
    const first = result.cellOffsets[table.groupSurfaces[group]];
    const last = result.cellOffsets[table.groupSurfaces[group + 1]];
    // f32 and f64 values are physical already; f16 bits and i16 integers go through the kernel.
    const raw = result.valueDtype === "f32" || result.valueDtype === "f64";
    const physical = raw ? result.values.subarray(first, last) : surfaceValuesF32(result, first, last);
    for (let cell = first; cell < last; cell += 1) {
        const start = table.cellOffsets[cell], end = table.cellOffsets[cell + 1];
        if (end > start)
            out.fill(physical[cell - first], (start - base) * 3, (end - base) * 3);
    }
    return out;
}
