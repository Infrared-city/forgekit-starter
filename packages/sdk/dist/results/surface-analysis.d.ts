/**
 * The sensor grid of one surface: its placement, cell values and summary statistics.
 *
 * The surface result of a single job is read as a map of these. An area run's merged
 * surface result is `SurfaceColumns` instead.
 *
 * @category Results and legend
 */
export interface SurfaceSensorGrid extends Readonly<Record<string, unknown>> {
    /** Grid origin `[x, y, z]`. */
    readonly origin: readonly number[];
    /** Direction of the grid's u axis `[x, y, z]`. */
    readonly uAxis: readonly number[];
    /** Direction of the grid's v axis `[x, y, z]`. */
    readonly vAxis: readonly number[];
    /** Cell edge length. */
    readonly gridSize: number;
    /** Number of cells along the u axis. */
    readonly nu: number;
    /** Number of cells along the v axis. */
    readonly nv: number;
    /** The value of each cell (`nu * nv` entries); `null` or `NaN` marks a cell without a value. */
    readonly values: ReadonlyArray<number | null> | Float64Array;
    /** Total area of the surface's cells. */
    readonly area: number;
    /** Mean value over the surface. */
    readonly mean: number;
    /** Peak value over the surface. */
    readonly peak: number;
    /** Area of each cell, when the result carries it. */
    readonly cellArea?: ReadonlyArray<number | null>;
    /** Render triangles of each cell (9 numbers per triangle), when the result carries them. */
    readonly cellTris?: ReadonlyArray<readonly number[] | null>;
}
/**
 * Aggregate statistics of the surfaces of one building: area, mean and peak.
 *
 * @category Results and legend
 */
export interface BuildingAggregate {
    /** Total area. */
    readonly area: number;
    /** Mean value. */
    readonly mean: number;
    /** Peak value. */
    readonly peak: number;
}
/**
 * A surface analysis result: the sensor grid of each surface, per-building aggregates and
 * the legend range.
 *
 * @category Results and legend
 */
export interface SurfaceAnalysisResponse {
    /** The sensor grid of each surface, by surface id. */
    readonly surfaces: Readonly<Record<string, SurfaceSensorGrid>>;
    /** Aggregates by group (for example `buildings`), then by id within the group. */
    readonly aggregates: Readonly<Record<string, Readonly<Record<string, BuildingAggregate>>>>;
    /** Lower end of the colour legend. */
    readonly minLegend: number;
    /** Upper end of the colour legend. */
    readonly maxLegend: number;
    /** Total number of sensors. */
    readonly sensorCount: number;
}
