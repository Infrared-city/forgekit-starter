import type { BuildingAggregate } from "./surface-analysis.js";
/**
 * The type of `SurfaceColumns.values`, as the server stored the values: `"f16"` (raw half
 * bits in a `Uint16Array`), `"f32"`, `"i16"` (scaled integers: physical value = value /
 * `valueDivisor`) or `"f64"` (a JSON result, or a run that mixes types).
 *
 * @category Results and legend
 */
export type SurfaceValueDtype = "f16" | "f32" | "i16" | "f64";
/**
 * The typed array of `SurfaceColumns.values`, one per `SurfaceValueDtype`.
 *
 * @category Results and legend
 */
export type SurfaceValues = Uint16Array | Float32Array | Int16Array | Float64Array;
/**
 * The render triangles of a run, in groups. One group is one job (a tile, or a batch of
 * one). Positions are 32-bit float metres in the job's tile-local frame, and `anchors[2g]`,
 * `anchors[2g + 1]` is the tile's south-west offset they still owe to x and y. Keep the
 * anchor out of the float data and add it as the mesh's position (a 64-bit float in
 * JavaScript), which keeps city-scale coordinates exact.
 *
 * @category Results and legend
 */
export interface SurfaceTriangles {
    /** `C + 1`: cell `c` owns triangles `cellOffsets[c]..cellOffsets[c + 1]` (global index). */
    readonly cellOffsets: Uint32Array;
    /** `C`: 1 when the cell has geometry, 0 for a cell without a sensor. */
    readonly drawn: Uint8Array;
    /** `G + 1`: group `g` holds surfaces `groupSurfaces[g]..groupSurfaces[g + 1]`. */
    readonly groupSurfaces: Uint32Array;
    /** `G + 1`: group `g` holds triangles `groupTriangles[g]..groupTriangles[g + 1]`. */
    readonly groupTriangles: Uint32Array;
    /** `G`: 1 when the group has triangles, 0 when its job fell back. */
    readonly groupEngaged: Uint8Array;
    /** `2G`: each group's tile SW offset, owed to x and y. */
    readonly anchors: Float64Array;
    /** `G`: 9 floats per triangle; the triangles of group `g` in its cell order. */
    readonly positions: readonly Float32Array[];
}
/**
 * The merged surface result of an area run, as columns.
 *
 * There is one typed array per per-surface field (`S` surfaces), one per per-cell field
 * (`C` cells in total) and a triangle table, rather than an object per surface. Every array
 * owns its whole buffer, so the result can be transferred to another thread as it is, and a
 * renderer can upload `triangles.positions[g]` without a copy.
 *
 * Surface `i` has the id `ids.slice(idOffsets[i], idOffsets[i + 1])`, its vectors are
 * `origin[3i..3i+3]` (and likewise the axes), and its cells are
 * `values[cellOffsets[i]..cellOffsets[i + 1]]`. Look a surface up by id with `surfaceIndex`.
 * Join two results by surface id and cell index, never by row: the row order follows the
 * run's entries, not the order the jobs were submitted in.
 *
 * @category Results and legend
 */
export interface SurfaceColumns {
    /** Result discriminator: always `"surface-columns"`. */
    readonly kind: "surface-columns";
    /** Layout version of this result: always `2` (since 1.0.0 `values` keeps the server's type). */
    readonly version: 2;
    /** `S`, the number of surfaces. */
    readonly surfaceCount: number;
    /** Every surface id, back to back. */
    readonly ids: string;
    /** `S + 1`: cuts `ids` (string indices). */
    readonly idOffsets: Uint32Array;
    /** `3S`: each surface grid's origin in the run's frame. */
    readonly origin: Float64Array;
    /** `3S`: the direction of each surface grid's u axis. */
    readonly uAxis: Float64Array;
    /** `3S`: the direction of each surface grid's v axis. */
    readonly vAxis: Float64Array;
    /** `S`: the cell edge length of each surface. */
    readonly gridSize: Float64Array;
    /** `S`: the number of cells along the u axis of each surface. */
    readonly nu: Uint32Array;
    /** `S`: the number of cells along the v axis of each surface. */
    readonly nv: Uint32Array;
    /** `S`: the area of each surface. */
    readonly area: Float64Array;
    /** `S`: the mean value of each surface. */
    readonly mean: Float64Array;
    /** `S`: the peak value of each surface. */
    readonly peak: Float64Array;
    /** `S + 1`: cuts every per-cell column into surfaces. */
    readonly cellOffsets: Uint32Array;
    /**
     * `C`: the value of each cell, in the type the server stored it (`valueDtype`). This keeps
     * the result at 2 or 4 bytes per cell, not 8. Do not read a number from it directly: use
     * `surfaceHasValue` to test a cell and `surfaceValuesF32` for the physical values.
     * - `"f16"`: a `Uint16Array` of IEEE half-precision BITS (JavaScript has no common 16-bit
     *   float array). NaN bits mean no value.
     * - `"f32"`, `"f64"`: NaN means no value.
     * - `"i16"`: scaled integers; physical value = value / `valueDivisor`. An `Int16Array` has no
     *   NaN: `valid` tells which cells have a value.
     */
    readonly values: SurfaceValues;
    /** The type of `values`. */
    readonly valueDtype: SurfaceValueDtype;
    /** `1` unless `valueDtype` is `"i16"`; then physical value = value / `valueDivisor`. */
    readonly valueDivisor: number;
    /**
     * Present only when `valueDtype` is `"i16"`: one bit per cell, least significant bit first
     * (cell `c` is bit `c % 8` of byte `c >> 3`), set when the cell has a value.
     */
    readonly valid?: Uint8Array;
    /**
     * `6T`, present on a facade or roof run of this client (the join rebuilds the layout from the
     * kept capture): the outline triangles of all surfaces in row order, in cell units from the corner of cell (0,0),
     * `s0 t0 s1 t1 s2 t2`. `surfaceRenderBuffers` reads it; a saved layout gives the outline
     * through `options.layout` instead.
     */
    readonly outline?: Float32Array;
    /** `S + 1`, with `outline`: surface row `i` owns outline triangles `outlineOffsets[i]..[i + 1]`. */
    readonly outlineOffsets?: Uint32Array;
    /** `S`: the wire's `cell-area` for the surface: 0 absent, 1 `null`, 2 an array. */
    readonly cellAreaState: Uint8Array;
    /** `C`, present when some surface sent an array: NaN for `null` (and for other surfaces' cells). */
    readonly cellArea?: Float32Array;
    /** The fields no column holds, by surface row. Absent when no surface sent one. */
    readonly extra?: Readonly<Record<number, Readonly<Record<string, unknown>>>>;
    /** Present when triangles were requested (`emitCellTris`) or the server sent some. */
    readonly triangles?: SurfaceTriangles;
    /** Aggregates by group (for example `buildings`), then by id within the group. */
    readonly aggregates: Readonly<Record<string, Readonly<Record<string, BuildingAggregate>>>>;
    /** Lower end of the colour legend. */
    readonly minLegend: number;
    /** Upper end of the colour legend. */
    readonly maxLegend: number;
    /** Total number of sensors. */
    readonly sensorCount: number;
    /**
     * Absent unless triangles were requested and at least one job fell back:
     * the sorted reasons (for example `"hash_mismatch"`). Each fallback is also
     * logged at `warn`.
     */
    readonly cellTrisFallback?: readonly string[];
}
/**
 * The joined surface columns of a run as the join step returns them, before they are shaped
 * into a `SurfaceColumns`. The fields match those of `SurfaceColumns`; `extraJson` and
 * `aggregatesJson` hold JSON text.
 *
 * @category Results and legend
 */
export interface KernelSurfaceJoin {
    /** `S`, the number of surfaces. */
    readonly surfaceCount: number;
    /** Every surface id, back to back. */
    readonly ids: string;
    /** `S + 1`: cuts `ids`. */
    readonly idOffsets: Uint32Array;
    /** `3S`: each surface grid's origin. */
    readonly origin: Float64Array;
    /** `3S`: each surface grid's u axis. */
    readonly uAxis: Float64Array;
    /** `3S`: each surface grid's v axis. */
    readonly vAxis: Float64Array;
    /** `S`: the cell edge length of each surface. */
    readonly gridSize: Float64Array;
    /** `S`: cells along the u axis. */
    readonly nu: Uint32Array;
    /** `S`: cells along the v axis. */
    readonly nv: Uint32Array;
    /** `S`: the area of each surface. */
    readonly area: Float64Array;
    /** `S`: the mean value of each surface. */
    readonly mean: Float64Array;
    /** `S`: the peak value of each surface. */
    readonly peak: Float64Array;
    /** `S + 1`: cuts every per-cell column into surfaces. */
    readonly cellOffsets: Uint32Array;
    /** `C`: the value of each cell, in the type the server stored it. */
    readonly values: SurfaceValues;
    /** The type of `values`. */
    readonly valuesDtype: SurfaceValueDtype;
    /** `1` unless `valuesDtype` is `"i16"`. */
    readonly valueDivisor: number;
    /** The `i16` validity bitmap; absent for the float types. */
    readonly valuesValid?: Uint8Array;
    /** `6T`: the outline triangles, when a layout was rebuilt for the run. */
    readonly outline?: Float32Array;
    /** `S + 1`: the cut of `outline` by surface. */
    readonly outlineOffsets?: Uint32Array;
    /** `S`: whether each surface sent a cell-area array. */
    readonly cellAreaState: Uint8Array;
    /** `C`: the area of each cell, when some surface sent one. */
    readonly cellArea?: Float32Array;
    /** JSON text of the fields no column holds, when there are any. */
    readonly extraJson?: string;
    /** JSON text of the aggregates. */
    readonly aggregatesJson: string;
    /** Lower end of the colour legend. */
    readonly minLegend: number;
    /** Upper end of the colour legend. */
    readonly maxLegend: number;
    /** Total number of sensors. */
    readonly sensorCount: number;
    /** The render triangles, when present. */
    readonly triangles?: SurfaceTriangles;
    /** The jobs whose triangles fell back, with the reason. */
    readonly fallbacks: ReadonlyArray<{
        readonly job: number;
        readonly reason: string;
        readonly detail?: string;
    }>;
    /** The sorted distinct fallback reasons. */
    readonly fallbackReasons: readonly string[];
    /** The argument index of each joined job, in the order the rows were joined. */
    readonly jobOrder: Uint32Array;
}
/**
 * Builds the public `SurfaceColumns` from a join result.
 *
 * @param joined - The joined columns.
 * @returns The surface columns.
 * @category Results and legend
 */
export declare function surfaceColumnsFromJoin(joined: KernelSurfaceJoin): SurfaceColumns;
/**
 * Returns the surface result of a run with no jobs: no surfaces and no cells.
 *
 * @returns An empty `SurfaceColumns`.
 * @category Results and legend
 */
export declare function emptySurfaceColumns(): SurfaceColumns;
/**
 * Returns the id of a surface.
 *
 * @param result - The surface columns.
 * @param row - The surface row, from `0` to `surfaceCount - 1`.
 * @returns The surface id.
 * @category Results and legend
 */
export declare function surfaceId(result: SurfaceColumns, row: number): string;
/**
 * Maps each surface id to its row. The map is built on first use and kept with the result.
 *
 * @param result - The surface columns.
 * @returns A map from surface id to row.
 * @category Results and legend
 */
export declare function surfaceIndex(result: SurfaceColumns): ReadonlyMap<string, number>;
/**
 * Tells whether a surface is a wall: its grid normal is at most 30° from horizontal.
 *
 * @param result - The surface columns.
 * @param row - The surface row.
 * @returns True for a wall.
 * @category Results and legend
 */
export declare function isVertical(result: SurfaceColumns, row: number): boolean;
/**
 * Tells whether a cell has a value. Use it for every type of `values`: NaN (`"f16"` bits,
 * `"f32"`, `"f64"`) or a clear `valid` bit (`"i16"`) means no value.
 *
 * @param result - The surface columns.
 * @param cell - The cell index, from `0` to `cellOffsets[surfaceCount] - 1`.
 * @returns True when the cell has a value.
 * @category Results and legend
 */
export declare function surfaceHasValue(result: SurfaceColumns, cell: number): boolean;
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
export declare function surfaceValuesF32(result: SurfaceColumns, first?: number, last?: number): Float32Array;
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
export declare function vertexValues(result: SurfaceColumns, group: number): Float32Array;
