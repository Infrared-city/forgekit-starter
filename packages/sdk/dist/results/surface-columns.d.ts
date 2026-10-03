/**
 * The merged surface result of an area run, as COLUMNS (D197, D198).
 *
 * The kernel joins every job of a facade / surface run in one call
 * (`joinSurfaceJobs`) and this is what it gives back: one typed array per
 * per-surface field, one per per-cell field, and a triangle table. There is
 * no object per surface and no array per cell. Every array owns its whole
 * buffer, so the result can be transferred to another thread as it is, and a
 * renderer can upload `triangles.positions[g]` without a copy.
 *
 * Rows: surface `i` is `ids.slice(idOffsets[i], idOffsets[i + 1])`, its
 * vectors are `origin[3i..3i+3]` (and the axes), and its cells are
 * `values[cellOffsets[i]..cellOffsets[i + 1]]`. Look a surface up by id with
 * {@link surfaceIndex}. Join two results by surface id and cell index, never
 * by row: the row order is the canonical order of the run's entry ids (#579).
 */
import type { BuildingAggregate } from "./surface-analysis.js";
/**
 * The render triangles of a run. One GROUP is one job (a tile, or a batch of
 * one): its positions are f32 metres in the job's TILE-LOCAL frame, and
 * `anchors[2g]`, `anchors[2g + 1]` is the tile's SW offset they still owe to
 * x and y. Keep the anchor out of the f32 data: add it as the mesh's
 * position (f64 in JavaScript), which keeps city-scale coordinates exact.
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
export interface SurfaceColumns {
    readonly kind: "surface-columns";
    readonly version: 1;
    /** `S`, the number of surfaces. */
    readonly surfaceCount: number;
    /** Every surface id, back to back. */
    readonly ids: string;
    /** `S + 1`: cuts `ids` (string indices). */
    readonly idOffsets: Uint32Array;
    /** `3S`: each surface grid's origin in the run's frame. */
    readonly origin: Float64Array;
    /** `3S` each. */
    readonly uAxis: Float64Array;
    readonly vAxis: Float64Array;
    /** `S` each. */
    readonly gridSize: Float64Array;
    readonly nu: Uint32Array;
    readonly nv: Uint32Array;
    readonly area: Float64Array;
    readonly mean: Float64Array;
    readonly peak: Float64Array;
    /** `S + 1`: cuts every per-cell column into surfaces. */
    readonly cellOffsets: Uint32Array;
    /** `C`: NaN for a cell without a value. */
    readonly values: Float64Array;
    /** `S`: the wire's `cell-area` for the surface: 0 absent, 1 `null`, 2 an array. */
    readonly cellAreaState: Uint8Array;
    /** `C`, present when some surface sent an array: NaN for `null` (and for other surfaces' cells). */
    readonly cellArea?: Float64Array;
    /** The fields no column holds, by surface row. Absent when no surface sent one. */
    readonly extra?: Readonly<Record<number, Readonly<Record<string, unknown>>>>;
    /** Present when triangles were requested (`emitCellTris`) or the server sent some. */
    readonly triangles?: SurfaceTriangles;
    readonly aggregates: Readonly<Record<string, Readonly<Record<string, BuildingAggregate>>>>;
    readonly minLegend: number;
    readonly maxLegend: number;
    readonly sensorCount: number;
    /**
     * Absent unless triangles were requested and at least one job fell back:
     * the sorted reasons (for example `"hash_mismatch"`). Each fallback is also
     * logged at `warn`.
     */
    readonly cellTrisFallback?: readonly string[];
}
/** What `joinSurfaceJobs` returns (`bindings/wasm/src/surface_join.rs`). */
export interface KernelSurfaceJoin {
    readonly surfaceCount: number;
    readonly ids: string;
    readonly idOffsets: Uint32Array;
    readonly origin: Float64Array;
    readonly uAxis: Float64Array;
    readonly vAxis: Float64Array;
    readonly gridSize: Float64Array;
    readonly nu: Uint32Array;
    readonly nv: Uint32Array;
    readonly area: Float64Array;
    readonly mean: Float64Array;
    readonly peak: Float64Array;
    readonly cellOffsets: Uint32Array;
    readonly values: Float64Array;
    readonly cellAreaState: Uint8Array;
    readonly cellArea?: Float64Array;
    readonly extraJson?: string;
    readonly aggregatesJson: string;
    readonly minLegend: number;
    readonly maxLegend: number;
    readonly sensorCount: number;
    readonly triangles?: SurfaceTriangles;
    readonly fallbacks: ReadonlyArray<{
        readonly job: number;
        readonly reason: string;
        readonly detail?: string;
    }>;
    readonly fallbackReasons: readonly string[];
    /** The argument index of each joined job: the kernel joins in canonical entry order (#579). */
    readonly jobOrder: Uint32Array;
}
/** The public result from the kernel's answer: two JSON texts parsed, nothing copied. */
export declare function surfaceColumnsFromJoin(joined: KernelSurfaceJoin): SurfaceColumns;
/** The result of a run with no jobs. */
export declare function emptySurfaceColumns(): SurfaceColumns;
/** The id of surface `row`. */
export declare function surfaceId(result: SurfaceColumns, row: number): string;
/** Surface id → row, built on first use and kept with the result. */
export declare function surfaceIndex(result: SurfaceColumns): ReadonlyMap<string, number>;
/** True when surface `row` is a wall: its grid normal is at most 30° from horizontal. */
export declare function isVertical(result: SurfaceColumns, row: number): boolean;
/**
 * The value of each VERTEX of group `group`'s triangles (three per
 * triangle, aligned with `triangles.positions[group]`): the value of the
 * cell the triangle draws, NaN for a cell without one. One attribute a
 * renderer uploads next to the positions.
 */
export declare function vertexValues(result: SurfaceColumns, group: number): Float32Array;
