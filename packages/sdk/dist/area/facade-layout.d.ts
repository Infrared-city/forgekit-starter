/**
 * The retained facade layout: the kernel's triangle buffers and its compact
 * frames, and the views one frame's surface draws from them. Split out of
 * `facade-synthesis.ts` for the 400-line cap.
 */
import type { SurfaceMergeEntryView } from "../results/surface-analysis.js";
/** The kernel's own buffers, retained for reuse across analyses. */
export interface LayoutRecord {
    readonly cellTris: Float32Array;
    readonly offsets: Uint32Array;
    readonly frames: readonly SurfaceFrame[];
    readonly bytes: number;
}
export interface SurfaceFrame {
    readonly key: string;
    /**
     * The kernel's compact cell map (`compactCells`) as two u32 words for each
     * cell, low word first: `[index, 0]` for a cell with a sensor, and
     * `[MAX_WORD, MAX_WORD]` (`u64::MAX`) for a cell without one.
     */
    readonly words: Uint32Array;
}
/** The triangle half of one merged surface, as `cellTriangles` reads it. */
export type SurfaceTriangleViews = Pick<SurfaceMergeEntryView, "triangleValues" | "triangleOffsets" | "triangleMask" | "hasCellTris" | "triangleAnchor">;
/**
 * The kernel's compact frames (`compactCells`): one u64 LE word for each
 * cell, so the kernel makes no JS value for each cell (Python reads the same
 * form). On a little-endian host the words are a view of the kernel's bytes,
 * not a copy. A cell index is a `u32` (the kernel counts sensors in `u32`),
 * so a word whose high half is neither 0 nor the missing marker is refused.
 */
export declare function frames(raw: unknown): readonly SurfaceFrame[];
/**
 * Cut one frame's triangles out of the layout as VIEWS, never copies.
 *
 * A frame's sensors are one contiguous ascending index range
 * (`ir-geo/src/surfgrid/build.rs:106-119`), so its cells` triangle spans are
 * one contiguous slice of `cell_tris`. The running cursor CHECKS that rather
 * than assuming it: a layout that does not hold the property attaches nothing.
 */
export declare function frameViews(record: LayoutRecord, frame: SurfaceFrame, anchor: readonly [number, number]): SurfaceTriangleViews | undefined;
/** A layout record from one kernel answer (`compactCells`), or the reason it is refused. */
export declare function layoutRecord(buffers: {
    cell_tris: Float32Array | null;
    cell_tris_offsets: Uint32Array | null;
    sensor_layout_hash: string;
    frames: unknown;
}, serverHash: string): LayoutRecord | {
    readonly reason: string;
    readonly detail?: string;
};
