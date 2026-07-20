import { T as TileFailure, a as TileProgress, b as TileEvents, c as TilingConfig, d as Tile, G as GeoJSONPolygon, P as Point, e as TileSize, f as TileGrid } from './types-D2bCDPGh.cjs';
export { A as AreaJob, g as AreaPreview, h as AreaResult, i as AreaResultJSON, j as AreaSchedule, k as AreaScheduleJSON, l as AreaState, B as BuildingsTiledResult, C as CELL_SIZE_M, M as MAX_NON_EMPTY_TILES, m as METERS_PER_DEG_LAT, S as SOLAR_TILING_CONFIG, n as TILE_SIZE_CELLS, o as TILE_SIZE_M, p as TileBuildingResult, q as TileJobStatus, r as TileResult, s as TiledResult, W as WIND_ANALYSIS_TYPES, t as WIND_TILING_CONFIG, u as areaResultFromBinary, v as areaResultFromJSON, w as areaResultToBinary, x as areaResultToJSON, y as areaScheduleFromJSON, z as areaScheduleToJSON, D as computeAreaState, E as contextMarginM, F as cropStartCells, H as getNonEmptyTiles, I as getTilingConfig } from './types-D2bCDPGh.cjs';

/**
 * Concurrent tile executor with concurrency limiting, retry, and progress tracking.
 *
 * Ported from Python SDK `tiling/executor.py`.
 * Uses `p-limit` + `Promise.allSettled` instead of Python's ThreadPoolExecutor.
 * Provides progress tracking via both callback and mitt EventEmitter.
 *
 * Note: Python uses `threading.local()` for per-thread HTTP sessions --
 * TS doesn't need this since fetch is inherently concurrent.
 */

/** Configuration for the tile executor. */
interface TileExecutorConfig {
    /** Maximum number of concurrent tile operations. Default: 20. Must be >= 1. */
    maxWorkers?: number;
    /** Maximum number of retries per tile on failure. Default: 2. Must be >= 0. */
    maxRetries?: number;
    /** Per-tile timeout in milliseconds. Default: 180000 (3 minutes). Must be > 0. */
    tileTimeoutMs?: number;
    /** Total timeout for all tiles in milliseconds. Default: 600000 (10 minutes). Must be > 0. */
    totalTimeoutMs?: number;
    /** Base delay for retry backoff in milliseconds. Default: 1000. */
    retryBackoffBaseMs?: number;
    /** Maximum retry backoff delay in milliseconds. Default: 10000. */
    retryBackoffCapMs?: number;
    /** Callback fired on every tile progress update. */
    onProgress?: (progress: TileProgress) => void;
}
/** Description of a tile operation to execute. */
interface TileJob<T = Record<string, unknown>> {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    /** The async function to execute for this tile. */
    readonly execute: (signal: AbortSignal) => Promise<T>;
}
/** Result of executing a single tile job. */
interface TileJobResult<T = Record<string, unknown>> {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly success: boolean;
    readonly result?: T;
    readonly error?: string;
    readonly exception?: Error;
}
/** Aggregated result from a tile execution run. */
interface ExecutionResult<T = Record<string, unknown>> {
    readonly results: readonly TileJobResult<T>[];
    readonly failures: readonly TileFailure[];
    readonly completedCount: number;
    readonly failedCount: number;
    readonly totalCount: number;
    readonly executionTime: number;
    /** True when execution was cut short by the total timeout. */
    readonly timedOut: boolean;
}
/**
 * Concurrent tile executor with configurable concurrency, retry, and timeout.
 *
 * Both per-tile and total timeouts are enforced via `Promise.race` so that
 * even jobs that ignore the AbortSignal are guaranteed to time out.
 *
 * On total timeout, partial results from tiles that already completed are
 * preserved. Tiles still in-flight are marked as failed with a timeout error.
 *
 * Timeout errors (`TileTimeoutError`) are not retried because the underlying
 * job may still be running in the background (it ignores AbortSignal),
 * and retrying would cause duplicate concurrent executions.
 *
 * Event handlers and onProgress callbacks are wrapped in try/catch so
 * observer errors never change tile execution semantics. Once execution
 * is `closed` (after execute() returns), no further events are emitted.
 *
 * Usage:
 * ```ts
 * const executor = new TileExecutor({ maxWorkers: 10 })
 * executor.on('tile.completed', ({ tileId }) => console.log(`Done: ${tileId}`))
 * const result = await executor.execute(jobs)
 * ```
 */
declare class TileExecutor<T = Record<string, unknown>> {
    private readonly maxWorkers;
    private readonly maxRetries;
    private readonly tileTimeoutMs;
    private readonly totalTimeoutMs;
    private readonly retryBackoffBaseMs;
    private readonly retryBackoffCapMs;
    private readonly onProgress?;
    private readonly emitter;
    constructor(config?: TileExecutorConfig);
    /** Subscribe to tile execution events. */
    on<K extends keyof TileEvents>(event: K, handler: (data: TileEvents[K]) => void): void;
    /** Unsubscribe from tile execution events. */
    off<K extends keyof TileEvents>(event: K, handler: (data: TileEvents[K]) => void): void;
    /**
     * Execute all tile jobs concurrently with concurrency limiting.
     *
     * Each job is retried up to `maxRetries` times with exponential backoff.
     * Timeout errors are never retried (the hung job may still be running).
     *
     * If the total timeout elapses, remaining jobs are aborted and the
     * partial results collected so far are returned (with `timedOut: true`).
     * The returned result is a snapshot -- late-finishing jobs cannot mutate it
     * and no further events are emitted after execute() returns.
     *
     * @param jobs - Array of tile jobs to execute.
     * @returns Aggregated execution result. Check `timedOut` to detect partial results.
     */
    execute(jobs: readonly TileJob<T>[]): Promise<ExecutionResult<T>>;
    /** Build an ExecutionResult from the collected per-tile results. */
    private buildResult;
    /**
     * Execute a single tile job with retry and per-tile timeout.
     *
     * Per-tile timeout is enforced via `Promise.race` so that even jobs
     * ignoring the AbortSignal are guaranteed to time out.
     *
     * Timeout errors (`TileTimeoutError`) are never retried because the
     * hung job may still be running in the background, and retrying would
     * cause duplicate concurrent executions with potential side effects.
     *
     * All event emissions and progress callbacks are gated on `ctx.closed`
     * to prevent events after execute() has returned.
     */
    private executeWithRetry;
    /**
     * Record a tile result into the execution context (if not closed).
     * Also emits progress callback.
     */
    private recordResult;
    /**
     * Compute retry delay with exponential backoff + jitter.
     *
     * delay = min(cap, base * 2^attempt) * random(0.5, 1.0)
     */
    private computeRetryDelay;
    /**
     * Emit a mitt event, catching any exceptions thrown by listeners.
     * Observer errors must not affect tile execution semantics.
     */
    private safeEmit;
    /**
     * Emit progress via callback (best-effort).
     *
     * `finishedCount` tracks how many tiles have reached a terminal state
     * (completed + failed), while `status` indicates the individual tile's outcome.
     *
     * Catches any exceptions thrown by the callback so observer errors
     * never change tile execution semantics.
     */
    private safeEmitProgress;
}

/**
 * Grid merger with centre-crop concatenation and polygon clipping.
 *
 * Mirrors the Python SDK's `tiling/merger.py`:
 *   - Each tile's inference grid is cropped to its centre `stepCells × stepCells`
 *     region and placed at `(row * stepCells, col * stepCells)` in the merged grid.
 *   - No overlap, no blending. Wind: 256×256 inner crop from each 512×512 tile.
 *     Solar/UTCI/etc.: full 512×512 placed edge-to-edge (stepCells == inferenceSizeCells).
 *
 * Cells outside the original polygon are set to NaN via cell-level polygon clipping.
 *
 * Uses Float64Array (no NumPy) for isomorphic compatibility.
 */

/**
 * Tile merge strategy. Mirrors Python `tiling/merger.py`:
 *  - `default`            — plain centre-crop placement (no overlap blending).
 *  - `directional`        — argmax-only winner per cell, weighted by an
 *                           upstream-extent reliability mask. Wind-speed only.
 *  - `directional_blend`  — S12a smart-blend (argmax + spread-gated
 *                           upstream-biased Gaussian softening). Wind-speed only.
 */
type MergeStrategy = 'default' | 'directional' | 'directional_blend';
/**
 * Compute the merged grid dimensions for an R × C tile layout.
 *
 * @param numRows - Number of tile rows.
 * @param numCols - Number of tile columns.
 * @param config - Tiling config; defaults to wind config for backwards compat.
 * @returns [height, width] in cells.
 */
declare function mergedGridShape(numRows: number, numCols: number, config?: TilingConfig): [number, number];
/**
 * Map a tile grid position to its start offset in the merged grid.
 *
 * @param row - Tile row index (0-based, south to north).
 * @param col - Tile column index (0-based, west to east).
 * @param config - Tiling config; defaults to wind config for backwards compat.
 * @returns [startRow, startCol] in the merged grid.
 */
declare function tileToGridOffset(row: number, col: number, config?: TilingConfig): [number, number];
/** A tile grid with its position in the overall grid. */
interface TileGridEntry {
    row: number;
    col: number;
    /** A flat Float64Array of shape (inferenceSizeCells × inferenceSizeCells). */
    grid: Float64Array;
}
/**
 * Merge tile grids into a single array using centre-crop placement.
 *
 * Each tile's inference grid is cropped to its centre `stepCells × stepCells`
 * region and placed at `(row * stepCells, col * stepCells)` in the merged grid.
 *
 * @param tileGrids - Each element is `{row, col, grid}` where grid is a flat
 *   Float64Array of shape (inferenceSizeCells × inferenceSizeCells).
 * @param numRows - Total rows in the tile grid.
 * @param numCols - Total columns in the tile grid.
 * @param config - Tiling config; defaults to wind config for backwards compat.
 * @returns Merged Float64Array, stored row-major. Cells with no contributing
 *   data are NaN.
 */
declare function mergeTiles(tileGrids: readonly TileGridEntry[], numRows: number, numCols: number, config?: TilingConfig, opts?: {
    strategy?: MergeStrategy;
    windDirectionDeg?: number;
}): {
    grid: Float64Array;
    height: number;
    width: number;
};
/**
 * Set cells outside the polygon to NaN.
 *
 * Cell centers are tested at
 *   (gridOrigin[0] + (col + 0.5) * cellSizeM,
 *    gridOrigin[1] + (row + 0.5) * cellSizeM)
 * in the tangent-plane meter space.
 *
 * @param grid - Flat Float64Array (modified in place and returned).
 * @param height - Grid height in rows.
 * @param width - Grid width in columns.
 * @param polygonMeters - Polygon vertices in meter-space as [x, y] pairs (open ring).
 * @param gridOrigin - Position of cell (0,0) as [originX, originY]. Default [0, 0].
 * @param cellSizeM - Metres per grid cell (default 1.0).
 * @returns The clipped grid (same array as input).
 */
declare function clipToPolygon(grid: Float64Array, height: number, width: number, polygonMeters: ReadonlyArray<readonly [number, number]>, gridOrigin?: readonly [number, number], cellSizeM?: number): Float64Array;
/**
 * Project a GeoJSON polygon to tangent-plane meter space.
 *
 * Origin is the bounding box SW corner. Uses the same local tangent
 * plane approximation as the tile generation module.
 */
declare function projectPolygonToMeters(geojsonPolygon: {
    coordinates: ReadonlyArray<ReadonlyArray<readonly [number, number, ...number[]]>>;
}): {
    polygonMeters: Array<[number, number]>;
    originLon: number;
    originLat: number;
};
/**
 * Convert a Float64Array grid to a nested array with NaN replaced by null.
 * Suitable for JSON serialization.
 */
declare function gridToList(grid: Float64Array, height: number, width: number): Array<Array<number | null>>;

/**
 * Area orchestration utilities for tiled analysis.
 *
 * Ported from Python SDK `tiling/orchestrator.py`.
 * Provides payload cloning with per-tile location overrides for
 * location-aware analysis types, and grid extraction from analysis results.
 */

/**
 * Deep clone an analysis payload and override the location fields
 * with the tile's centroid coordinates.
 *
 * For location-aware analysis types (Solar, SolarRadiation, UTCI/TCI, TCS),
 * the `latitude` and `longitude` fields in the payload are replaced with
 * the tile centroid's values. For non-location types, the payload is
 * returned as a deep clone without location modification.
 *
 * @param payload - The original analysis payload to clone.
 * @param tile - The tile whose centroid provides the location override.
 * @param analysisType - The analysis type name (used to determine if location override is needed).
 * @returns A deep-cloned payload with tile-specific location fields.
 */
declare function clonePayloadForTile(payload: Record<string, unknown>, tile: Tile, analysisType: string): Record<string, unknown>;
/**
 * Extract a Float64Array grid from an analysis result object.
 *
 * The analysis API returns results in several formats:
 * - `{ output: number[][] }` — array of arrays (most common)
 * - `{ matrix: number[][] }` — alternative key
 * - `{ data: number[][] }` — another alternative
 *
 * The result is flattened into a row-major Float64Array of shape
 * (TILE_SIZE_CELLS x TILE_SIZE_CELLS). If the grid is smaller than
 * expected, remaining cells are filled with NaN.
 *
 * @param result - The raw analysis result object.
 * @returns A flat Float64Array of shape (TILE_SIZE_CELLS x TILE_SIZE_CELLS).
 * @throws Error if no recognizable grid data is found in the result.
 */
declare function extractGrid(result: Record<string, unknown>): Float64Array;

/**
 * Tile generation for polygon-based analysis orchestration.
 *
 * Generates a 2-D grid of tiles covering a GeoJSON polygon bounding box
 * with 50% overlap. Tile IDs are deterministic UUID5 values derived from
 * the polygon geometry and grid position.
 *
 * Coordinate convention: x=longitude, y=latitude, matching GeoJSON [lon, lat].
 *
 * Projection: local tangent plane approximation for meter-to-degree conversion.
 * Accurate for city-scale polygons (< ~50 km span).
 */

declare const TILE_NAMESPACE: string;
interface TileServiceOptions {
    /** A GeoJSON Polygon object. Validated and winding-order-normalized on construction. */
    polygon: unknown;
    /** Optional maximum number of non-empty tiles (default: 100). */
    maxTilesOverride?: number;
    /**
     * Analysis type — determines which tiling config (wind vs solar/etc.) drives
     * tile spacing. Wind: 256m step (50% overlap). Solar/UTCI/etc.: 512m step
     * (edge-to-edge). Defaults to wind config for backwards compatibility.
     */
    analysisType?: string;
}
/**
 * Generate a grid of tiles covering a GeoJSON polygon.
 *
 * Validates the polygon, generates the tile grid with the appropriate spacing
 * for the analysis type (wind: 50% overlap; solar/etc.: edge-to-edge), marks
 * empty tiles, and enforces the non-empty tile limit.
 */
declare class TileService {
    readonly polygon: GeoJSONPolygon;
    readonly points: readonly Point[];
    readonly tileSize: TileSize;
    readonly maxNonEmpty: number;
    readonly tilingConfig: TilingConfig;
    constructor(options: TileServiceOptions);
    /**
     * Generate a grid of tiles covering the polygon's bounding box.
     *
     * Returns a TileGrid where tiles[row][col] is a Tile.
     * Row 0 is the southernmost row; column 0 is the westernmost column.
     * Each tile is marked empty=true if it does not intersect the polygon.
     *
     * @throws PolygonValidationError if the number of non-empty tiles exceeds maxNonEmpty.
     */
    generateTilesForPolygon(): TileGrid;
}
/**
 * Serialize polygon vertices to a canonical string for hashing.
 *
 * Coordinates are quantized to 5 decimal places (~1.1 m at the equator,
 * >100× below the 256 m tile step) so float precision drift doesn't
 * change the fingerprint. Vertex order is preserved as-given — matches
 * Python SDK's `_polygon_fingerprint` so cross-SDK tile IDs are
 * byte-identical for the same input polygon.
 */
declare function polygonFingerprint(polygon: readonly Point[]): string;

/**
 * Coordinate transformations for building-to-tile assignment.
 *
 * Pure functions that convert building coordinates between polygon-bbox-SW
 * and tile-SW reference frames, and assign buildings to tiles based on
 * bounding-box spatial intersection (with context margin) — mirrors the
 * server-side `turf.intersect()` behaviour so a building straddling a
 * tile boundary lands in every tile it overlaps, with full unclipped
 * geometry. Ported from Python SDK `tiling/transforms.py`.
 *
 * Coordinates are flat `[x, y, z, x, y, z, ...]` — stride 3 per vertex.
 */

/**
 * SW-corner offset of a tile relative to the polygon-bbox SW corner (meters).
 * Mirrors Python `tile_sw_offset(row, col, config)`.
 */
declare function tileSwOffset(row: number, col: number, config?: TilingConfig): [number, number];
/** Compute the (x, y) centroid of a flat coordinate array. */
declare function computeBuildingCentroid(coords: Float64Array | readonly number[]): [number, number];
/** Axis-aligned (x, y) bounding box of a flat coordinate array. */
declare function computeBuildingBbox(coords: readonly number[] | Float64Array): [number, number, number, number];
/**
 * Shift a flat coordinate array from polygon-bbox-SW to tile-SW frame by
 * subtracting `(offsetX, offsetY)` from each (x, y) pair. Z is preserved.
 *
 * Returns a new array — input is not mutated. Mirrors Python
 * `transform_building_coords(coordinates, offset_x, offset_y)`.
 */
declare function transformBuildingCoords(coords: readonly number[] | Float64Array, offsetX: number, offsetY: number): number[];
/** Loose dict shape Python uses — buildings are arbitrary key-value bags with `coordinates`. */
type BuildingData = {
    coordinates?: readonly number[];
    [k: string]: unknown;
};
/**
 * Assign buildings to all tiles whose context bbox overlaps the building bbox.
 *
 * For each building, computes its axis-aligned bbox in polygon-bbox-SW meters
 * and places it in **every** tile whose context bbox (inference bbox plus
 * `contextMarginM`) intersects that bbox. A building straddling a tile
 * boundary lands in all adjacent tiles with its full unclipped geometry —
 * mirrors server-side `turf.intersect()`.
 *
 * Coordinates are deep-copied per tile and translated to that tile's SW frame.
 *
 * Mirrors Python `assign_buildings_to_tiles` 1:1.
 *
 * @param buildings - Flat `{building_id: data}` dict. Each value must have
 *   a `coordinates` field with a stride-3 flat number array.
 * @param tiles - Non-empty tiles as `{row, col, tile}` (e.g. from `getNonEmptyTiles`).
 * @param opts.config - Tiling config (wind / solar). Defaults to wind.
 * @param opts.strict - When true, throw on invalid coordinates instead of skipping.
 * @returns `{tileId: {building_id: data}}` map. Coords in tile-SW frame.
 *   Buildings outside all tiles are silently dropped.
 */
declare function assignBuildingsToTiles(buildings: Readonly<Record<string, BuildingData>>, tiles: ReadonlyArray<{
    row: number;
    col: number;
    tile: Tile;
}>, opts?: {
    config?: TilingConfig;
    strict?: boolean;
}): Record<string, Record<string, BuildingData>>;

/**
 * GeoJSON polygon validation for tiling operations.
 *
 * Validates GeoJSON Polygon objects and normalizes winding order.
 * All geometry computations use the convention x=longitude, y=latitude,
 * consistent with GeoJSON coordinate order [lon, lat].
 */

/**
 * Validate and normalize a GeoJSON Polygon.
 *
 * Validation chain:
 * 1. GeoJSON format (must be an object with 'type' and 'coordinates')
 * 2. type == "Polygon"
 * 3. Single ring (len(coordinates) == 1)
 * 4. >= 4 positions (3 unique vertices + closing vertex)
 * 5. Ring closed (first == last)
 * 6. Coordinate range: lon in [-180, 180], lat in [-90, 90]
 * 7. Self-intersection check (O(n^2) edge pairs)
 * 8. Winding order normalization (CCW exterior via shoelace, x=lon y=lat)
 *
 * @param geojson - A GeoJSON-like object to validate.
 * @returns A validated GeoJSONPolygon with CCW winding order.
 * @throws PolygonValidationError if any validation step fails.
 *
 * @example
 * ```ts
 * const polygon = validatePolygon({
 *   type: 'Polygon',
 *   coordinates: [[[13.39, 52.51], [13.4, 52.51], [13.4, 52.52], [13.39, 52.52], [13.39, 52.51]]],
 * })
 * ```
 */
declare function validatePolygon(geojson: unknown): GeoJSONPolygon;

export { type BuildingData, type ExecutionResult, GeoJSONPolygon, Point, TILE_NAMESPACE, Tile, TileEvents, TileExecutor, type TileExecutorConfig, TileFailure, TileGrid, type TileGridEntry, type TileJob, type TileJobResult, TileProgress, TileService, type TileServiceOptions, TileSize, TilingConfig, assignBuildingsToTiles, clipToPolygon, clonePayloadForTile, computeBuildingBbox, computeBuildingCentroid, extractGrid, gridToList, mergeTiles, mergedGridShape, polygonFingerprint, projectPolygonToMeters, tileSwOffset, tileToGridOffset, transformBuildingCoords, validatePolygon };
