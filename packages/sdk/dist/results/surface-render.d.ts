import type { FacadeLayout } from "../area/facade-layout.js";
import type { SurfaceColumns } from "./surface-columns.js";
/**
 * The buffers a renderer needs to draw a surface result: one record per frame, the outline
 * triangles of each frame, one value per cell and a validity bit per cell.
 *
 * A renderer draws each frame as the triangles of its outline. A vertex `(s, t)` of the outline
 * is at `corner + s * uStep + t * vStep`, where `s` and `t` count cells. The fragment stage
 * finds the cell of a point and reads its value. Every array owns its buffer: you can transfer
 * it to another thread, and it stays valid for as long as you keep it.
 *
 * @category Results and legend
 */
export interface SurfaceRenderBuffers {
    /** `3`: the centroid of the frame corners, in the run's frame. Add it back in 64-bit floats. */
    readonly anchor: Float64Array;
    /** `9S`: for each frame `corner`, `uStep`, `vStep`, relative to `anchor`. */
    readonly frames: Float32Array;
    /** `3S`: for each frame `nu`, `nv` and `cellStart` (the first cell of the frame in `values`). */
    readonly dims: Uint32Array;
    /** `6T`: the outline triangles of all frames, `s0 t0 s1 t1 s2 t2`, in cell units. */
    readonly outline: Float32Array;
    /** `S + 1`: frame `f` owns outline triangles `outlineOffsets[f]..outlineOffsets[f + 1]`. */
    readonly outlineOffsets: Uint32Array;
    /**
     * `C`: the value of a valid cell, `0` for a cell without a value. Half float BITS in a
     * `Uint16Array` when `valueDtype` is `"f16"`, else a `Float32Array`. Never NaN or infinite.
     */
    readonly values: Uint16Array | Float32Array;
    /** The type of `values`. */
    readonly valueDtype: "f16" | "f32";
    /** `ceil(C / 8)`: cell `k` is bit `k & 7` of byte `k >> 3`; set when the cell has a value. */
    readonly validity: Uint8Array;
    /** The least value over the valid cells, `0` when there is none. */
    readonly valueMin: number;
    /** The greatest value over the valid cells, `0` when there is none. */
    readonly valueMax: number;
    /** `false` when no cell has a value. */
    readonly anyValid: boolean;
}
/**
 * The options of `surfaceRenderBuffers`.
 *
 * @category Results and legend
 */
export interface SurfaceRenderOptions {
    /**
     * A saved or rebuilt layout that holds the outline of each surface. Each surface of the
     * columns is found in it by id. Check the pair first with `attachValues`.
     */
    readonly layout?: FacadeLayout;
}
/**
 * Builds the render buffers of a surface result.
 *
 * The outline comes from `options.layout` (a saved layout: `FacadeLayout.fromBytes`), or from the
 * columns themselves: a facade or roof result of this client has one.
 *
 * @param columns - The surface columns.
 * @param options - `layout`, the layout that holds the outline.
 * @returns The render buffers, as owned typed arrays.
 * @throws {Error} When there is no outline, when a surface is not in the layout, or when a
 *   column breaks the contract (for example a frame with cells and no outline triangle, or a
 *   grid larger than 65,535 cells on a side). The message names the frame.
 * @category Results and legend
 */
export declare function surfaceRenderBuffers(columns: SurfaceColumns, options?: SurfaceRenderOptions): SurfaceRenderBuffers;
