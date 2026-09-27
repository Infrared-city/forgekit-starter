export interface SurfaceTriangle {
    readonly value: number | null;
    readonly vertices: readonly [
        readonly [number, number, number],
        readonly [number, number, number],
        readonly [number, number, number]
    ];
}
export interface SurfaceSensorGrid extends Readonly<Record<string, unknown>> {
    readonly origin: readonly number[];
    readonly uAxis: readonly number[];
    readonly vAxis: readonly number[];
    readonly gridSize: number;
    readonly nu: number;
    readonly nv: number;
    readonly values: ReadonlyArray<number | null> | Float64Array;
    readonly area: number;
    readonly mean: number;
    readonly peak: number;
    readonly cellArea?: ReadonlyArray<number | null>;
    readonly cellTris?: ReadonlyArray<readonly number[] | null>;
}
export interface BuildingAggregate {
    readonly area: number;
    readonly mean: number;
    readonly peak: number;
}
export interface SurfaceAnalysisResponse {
    readonly surfaces: Readonly<Record<string, SurfaceSensorGrid>>;
    readonly aggregates: Readonly<Record<string, Readonly<Record<string, BuildingAggregate>>>>;
    readonly minLegend: number;
    readonly maxLegend: number;
    readonly sensorCount: number;
    /**
     * Absent unless `emitCellTris: true` was requested and the local synthesis
     * of the cell triangles fell back for at least one job. Then it holds the
     * sorted fallback reasons (for example `"hash_mismatch"`), and the affected
     * surfaces carry no `cellTris`. Each fallback is also logged at `warn`.
     */
    readonly cellTrisFallback?: readonly string[];
}
export interface SurfaceMergeEntryView {
    readonly key: string;
    readonly values: Float64Array;
    /** `Float32Array` when the triangles came from the kernel's own buffers. */
    readonly triangleValues: Float64Array | Float32Array;
    readonly triangleOffsets: Uint32Array;
    readonly triangleMask: Uint8Array;
    readonly hasCellTris: boolean;
    /**
     * The tile SW offset still owed to x/y. The merger re-anchors what it is
     * given and its entries carry none; locally synthesized triangles stay in
     * the kernel's tile-local frame and carry theirs, because narrowing a
     * global-frame metre onto f32 loses 1e-5 m at city scale (root `CLAUDE.md`
     * rule 6). It is added here, in f64, where the cell is widened anyway.
     */
    readonly triangleAnchor?: readonly [number, number] | undefined;
}
export interface SurfaceMergeView {
    readonly metadataJson: Uint8Array;
    readonly entries: readonly SurfaceMergeEntryView[];
}
/**
 * `SurfaceAreaMerger.finish` output (WP4): every merged surface in a few
 * large columns instead of one kernel-built object per surface. The
 * triangle columns are empty unless some surface has cell triangles; then
 * they hold one span per cell of EVERY surface, aligned with `values`.
 */
export interface SurfaceMergeColumns {
    readonly metadataJson: Uint8Array;
    readonly ids: string;
    /** Cuts `ids` in UTF-16 code units. */
    readonly idOffsets: Uint32Array;
    readonly values: Float64Array;
    readonly valueOffsets: Uint32Array;
    readonly hasCellTris: Uint8Array;
    readonly triangleValues: Float64Array;
    readonly triangleOffsets: Uint32Array;
    readonly triangleMask: Uint8Array;
}
/**
 * Cut the merge columns into one entry per surface, the view
 * `surfaceAnalysisFromMergeView` reads. Each entry OWNS its buffers
 * (`slice`, not `subarray`): a caller that keeps one surface must not keep
 * the whole area's values alive (`docs/sdk-data-flow.md`, bulk-data rule 5).
 * The entries are the ones the per-surface kernel `finish` built, buffer
 * for buffer; a surface without triangles shares the three empty arrays.
 */
export declare function mergeViewFromColumns(columns: SurfaceMergeColumns): SurfaceMergeView;
/**
 * Convert the kernel merge view to the legacy camel-case public contract.
 *
 * `hostFields`, when given, holds each surface's decoded fields as the host
 * parsed them; the kernel's own per-surface fields (the re-anchored `origin`)
 * are written over them, in place, so the field order is the response's.
 * Without it the kernel metadata carries every field, as before.
 */
export declare function surfaceAnalysisFromMergeView(view: SurfaceMergeView, hostFields?: ReadonlyMap<string, Readonly<Record<string, unknown>>>): SurfaceAnalysisResponse;
export declare function hasCellGeometry(surface: SurfaceSensorGrid): boolean;
export declare function isVertical(surface: Pick<SurfaceSensorGrid, "uAxis" | "vAxis">): boolean;
export declare function surfaceTriangles(surface: SurfaceSensorGrid): Generator<SurfaceTriangle>;
