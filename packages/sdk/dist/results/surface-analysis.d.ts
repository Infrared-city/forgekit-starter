/**
 * The surface result of ONE job, as the wire document reads (a single-job
 * IRBF decode, `internal/binary-result.ts`). An area run's merged surface
 * result is columns instead: `SurfaceColumns` (`surface-columns.ts`, D198).
 */
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
}
