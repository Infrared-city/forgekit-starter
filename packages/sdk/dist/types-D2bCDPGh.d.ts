/**
 * Model-grouped tiling configuration.
 *
 * Wind and solar analysis types have fundamentally different spatial requirements:
 * - Wind models need dense overlap (50%) because wind effects propagate laterally.
 *   Output is the inner 256×256 of each 512×512 inference tile (center-crop).
 * - Solar / daylight / SVF / UTCI / TCS use a wider context window (for distant
 *   shadow-casting buildings) and place output tiles edge-to-edge with no overlap.
 *
 * Two frozen presets — WIND_TILING_CONFIG and SOLAR_TILING_CONFIG — replace the
 * former single set of hard-coded constants. `getTilingConfig()` dispatches on
 * analysis type.
 *
 * Mirrors `infrared_sdk.tiling.config` in the Python SDK.
 */
/** Immutable tiling parameters for a model group. */
interface TilingConfig {
    /** Physical tile size sent to the API (meters). Always 512. */
    readonly inferenceSizeM: number;
    /** Grid cells in the inference result. Always 512. */
    readonly inferenceSizeCells: number;
    /**
     * Context bbox size for building assignment (meters).
     * Wind: 512 (same as inference). Solar: 666 (extra shadow context).
     */
    readonly contextSizeM: number;
    /**
     * Step between tile centres in meters.
     * Wind: 256 (50% overlap). Solar: 512 (edge-to-edge).
     */
    readonly stepM: number;
    /** Step in grid cells (matches stepM / cellSizeM). */
    readonly stepCells: number;
    /** Metres per grid cell. Always 1.0. */
    readonly cellSizeM: number;
}
/**
 * Offset (in cells) into the inference grid where the centre crop begins.
 * Wind: (512 - 256) / 2 = 128. Solar: (512 - 512) / 2 = 0.
 */
declare function cropStartCells(config: TilingConfig): number;
/**
 * Extra margin per side for building-context expansion (meters).
 * Wind: 0. Solar: 77.
 */
declare function contextMarginM(config: TilingConfig): number;
/**
 * Tiling config for wind models (wind-speed, pedestrian-wind-comfort).
 * 256m step = 50% overlap. Centre-crop extracts the inner 256×256 from each
 * 512×512 inference tile.
 */
declare const WIND_TILING_CONFIG: TilingConfig;
/**
 * Tiling config for solar / daylight / thermal models.
 * 512m step = no overlap. 666m context window fetches buildings 77m beyond the
 * inference tile on each side (shadows cast long).
 */
declare const SOLAR_TILING_CONFIG: TilingConfig;
/** Analysis types that use the wind tiling config. */
declare const WIND_ANALYSIS_TYPES: ReadonlySet<string>;
/**
 * Return the tiling config for an analysis type.
 *
 * @param analysisType - Analysis type name. `undefined` defaults to wind config
 *   for backwards compatibility with serialized data that pre-dates explicit
 *   analysis-type storage.
 * @returns Solar config for known non-wind types; wind config otherwise.
 */
declare function getTilingConfig(analysisType?: string): TilingConfig;

/**
 * Core types for tiled analysis operations.
 *
 * Provides interfaces for tiles, tile grids, progress/failure tracking,
 * and area orchestration types.
 */
/** A geographic point with named latitude/longitude fields. */
interface Point {
    readonly latitude: number;
    readonly longitude: number;
}
/** Physical tile dimensions in meters. */
interface TileSize {
    readonly x: number;
    readonly y: number;
}
/** A single tile in the tile grid. */
interface Tile {
    readonly tileId: string;
    readonly empty: boolean;
    readonly centroid: Point;
    readonly size: TileSize;
}
/**
 * Immutable wrapper around a 2-D grid of tiles.
 *
 * Tile IDs are deterministic UUIDs derived from the polygon geometry
 * and grid position -- the same polygon always produces the same IDs.
 *
 * Row 0 is the southernmost row; column 0 is the westernmost column.
 */
interface TileGrid {
    readonly tiles: ReadonlyArray<ReadonlyArray<Tile>>;
    readonly numRows: number;
    readonly numCols: number;
    readonly polygon: GeoJSONPolygon;
    /**
     * Active tiling config for this grid (wind vs solar). Mirrors Python's
     * `TileGrid.config` added in 0.4.3. Required so downstream layer-assignment
     * (vegetation, ground-materials) uses the correct stride / inference size
     * instead of silently falling back to the wind preset — Python fix
     * `00f5f97` / `eef3917` on staging.
     */
    readonly config: TilingConfig;
}
/** Return non-empty tiles with their grid positions. */
declare function getNonEmptyTiles(grid: TileGrid): Array<{
    row: number;
    col: number;
    tile: Tile;
}>;
/** A GeoJSON Polygon object. */
interface GeoJSONPolygon {
    readonly type: 'Polygon';
    readonly coordinates: ReadonlyArray<ReadonlyArray<readonly [number, number, ...number[]]>>;
}
/**
 * Progress snapshot emitted during tiled execution.
 *
 * `completedCount` tracks only successfully completed tiles.
 * `finishedCount` tracks all tiles that reached a terminal state
 * (completed + failed), useful for progress bar percentage calculations.
 */
interface TileProgress {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly status: 'running' | 'completed' | 'failed' | 'skipped';
    /** Number of successfully completed tiles so far. */
    readonly completedCount: number;
    /** Total number of tiles in the execution. */
    readonly totalCount: number;
    /** Number of tiles that have reached a terminal state (completed + failed). */
    readonly finishedCount: number;
    /** Elapsed time in seconds since execution started. */
    readonly elapsedTime: number;
}
/**
 * Phase in which a tile failed during an area run. Mirrors Python's
 * `TileFailurePhase` StrEnum (#158). Uses the const-object + type pattern (like
 * `JobStatus`) so the values are referenceable at runtime and serialize as
 * their string form.
 * - `submit`:   job submission failed; never reached the queue.
 * - `compute`:  job ended in `JobStatus.Failed`.
 * - `download`: server reported succeeded, but result fetch / grid extraction
 *               failed permanently.
 * - `skipped`:  job was still non-terminal (pending/running/unknown) at merge.
 */
declare const TileFailurePhase: {
    readonly Submit: "submit";
    readonly Compute: "compute";
    readonly Download: "download";
    readonly Skipped: "skipped";
};
type TileFailurePhase = (typeof TileFailurePhase)[keyof typeof TileFailurePhase];
/** Record of a single tile that failed after all retries. */
interface TileFailure {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly error: string;
    readonly exception?: Error;
    /**
     * Phase in which this tile failed (Python 0.4.9 #158). Optional for backward
     * compatibility — legacy callers and deserialized legacy payloads omit it.
     */
    readonly phase?: TileFailurePhase;
}
/** Raw result from a single analysis tile. */
interface TileResult {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly data?: Record<string, unknown>;
}
/** Raw result from a single buildings tile. */
interface TileBuildingResult {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly data?: Record<string, unknown>;
}
/** Aggregated result from a tiled analysis run. */
interface TiledResult {
    /** Merged Float64Array grid with NaN for outside-polygon cells. */
    readonly mergedGrid: Float64Array;
    readonly polygon: GeoJSONPolygon;
    readonly tileCount: number;
    readonly gridShape: readonly [number, number];
    readonly failedTiles: readonly TileFailure[];
    readonly skippedTiles: readonly string[];
    readonly executionTime: number;
    readonly perTileResults: readonly TileResult[];
    readonly analysisType: string;
}
/** Aggregated result from a tiled buildings fetch. */
interface BuildingsTiledResult {
    readonly buildings: Record<string, unknown>;
    readonly polygon: GeoJSONPolygon;
    readonly tileCount: number;
    readonly totalBuildings: number;
    readonly duplicateCount: number | null;
    readonly failedTiles: readonly TileFailure[];
    readonly skippedTiles: readonly string[];
    readonly executionTime: number;
    readonly perTileResults: readonly TileBuildingResult[];
}
/**
 * Physical tile size in meters. Always 512 — both wind and solar use the same
 * inference tile size; the difference is in the step (overlap) and context
 * window. See `./config.ts` for analysis-type-aware values.
 */
declare const TILE_SIZE_M = 512;
/** Each tile result is a 512x512 grid. */
declare const TILE_SIZE_CELLS = 512;
/** Each grid cell is 1m x 1m. */
declare const CELL_SIZE_M = 1;
/** Default maximum number of non-empty tiles. */
declare const MAX_NON_EMPTY_TILES = 100;
/** Approximate meters per degree of latitude (constant). */
declare const METERS_PER_DEG_LAT = 111320;
/** Status of a single tile job within an area schedule. */
type TileJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
/** A single job entry in an area schedule. */
interface AreaJob {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    /** The API job ID (set after submission). */
    jobId?: string;
    status: TileJobStatus;
    result?: Record<string, unknown>;
    error?: string;
    /** Last known Job snapshot from status polling (opaque, used internally by InfraredClient). */
    lastJobSnapshot?: unknown;
}
/**
 * Schedule of tile jobs for an area analysis run.
 *
 * JSON-serializable for persistence and resumption. The `configHash` field
 * enables cache invalidation when analysis config changes.
 */
interface AreaSchedule {
    readonly jobs: ReadonlyMap<string, AreaJob>;
    readonly polygon: GeoJSONPolygon;
    readonly configHash: string;
    readonly tilePositions: ReadonlyArray<{
        row: number;
        col: number;
        tileId: string;
    }>;
    readonly gridShape: readonly [number, number];
    /**
     * Analysis type — determines which tiling config (wind vs solar) is used
     * for tile generation, merging, and polygon clipping. Required for
     * correctness on multi-tile non-wind analyses; missing = wind default.
     */
    readonly analysisType: string;
    /** Tile IDs whose submission failed during run_area; eligible for retry. */
    readonly failedSubmissions: readonly string[];
    /**
     * HTTP status code that caused the submission loop to abort early
     * (e.g. 402 = insufficient credits). `null` when the loop completed
     * normally. Mirrors Python SDK `AreaSchedule.submission_abort_status`.
     */
    readonly submissionAbortStatus: number | null;
}
/** JSON representation of an AreaSchedule for serialization. */
interface AreaScheduleJSON {
    readonly jobs: Array<[string, AreaJob]>;
    readonly polygon: GeoJSONPolygon;
    readonly configHash: string;
    readonly tilePositions: ReadonlyArray<{
        row: number;
        col: number;
        tileId: string;
    }>;
    readonly gridShape: readonly [number, number];
    readonly analysisType: string;
    readonly failedSubmissions: readonly string[];
    readonly submissionAbortStatus: number | null;
}
/** Serialize an AreaSchedule to a JSON-safe object. */
declare function areaScheduleToJSON(schedule: AreaSchedule): AreaScheduleJSON;
/** Deserialize an AreaSchedule from its JSON representation. The returned
 * schedule is structurally frozen (matches Python's `MappingProxyType`). */
declare function areaScheduleFromJSON(json: AreaScheduleJSON): AreaSchedule;
/** Aggregated status of all jobs in an area schedule. */
interface AreaState {
    readonly totalCount: number;
    readonly completedCount: number;
    readonly failedCount: number;
    readonly skippedCount: number;
    readonly pendingCount: number;
    readonly runningCount: number;
    readonly isComplete: boolean;
}
/** Derive the aggregated state from an area schedule. */
declare function computeAreaState(schedule: AreaSchedule): AreaState;
/**
 * Merged result from an area analysis run.
 *
 * Supports both JSON serialization (toJSON) and binary encoding (toBinary)
 * for compact storage of the Float64Array grid.
 */
interface AreaResult {
    readonly mergedGrid: Float64Array;
    readonly gridShape: readonly [number, number];
    readonly failedJobs: readonly TileFailure[];
    readonly skippedJobs: readonly string[];
    readonly executionTime: number;
    /**
     * Per-tile failure records classified by {@link TileFailurePhase} — submit /
     * compute / download / skipped. The same tileId never appears twice
     * (first-seen phase wins, priority submit > compute > download > skipped).
     * Empty when every tile produced usable output. Lets callers ask "which
     * tiles produced no usable output, and why?" without reverse-mapping
     * failed_jobs → tile_id. Mirrors Python `AreaResult.failed_tiles` (#158).
     * Optional for backward compatibility.
     */
    readonly failedTiles?: readonly TileFailure[];
    /**
     * Geographic extent of `mergedGrid` as `[minLng, minLat, maxLng, maxLat]`.
     * The grid is anchored at the polygon bbox SW corner and padded N/E to the
     * next step boundary when the polygon side isn't an integer multiple of the
     * step; this reports the true extent so visualisers place the bitmap without
     * an SW-anchored squash. `undefined` when no grid was produced. Mirrors
     * Python `AreaResult.bounds` (#122).
     */
    readonly bounds?: readonly [number, number, number, number];
}
/** JSON representation of an AreaResult. NaN grid cells become null. */
interface AreaResultJSON {
    readonly mergedGrid: Array<Array<number | null>>;
    readonly gridShape: readonly [number, number];
    readonly failedJobs: readonly TileFailure[];
    readonly skippedJobs: readonly string[];
    readonly executionTime: number;
    readonly failedTiles?: readonly TileFailure[];
    readonly bounds?: readonly [number, number, number, number];
}
/**
 * Serialize an AreaResult to a JSON-safe object.
 * Converts Float64Array to nested `(number | null)[][]` via gridToList pattern.
 *
 * @throws Error if mergedGrid length is less than gridShape dimensions require.
 */
declare function areaResultToJSON(result: AreaResult): AreaResultJSON;
/**
 * Deserialize an AreaResult from its JSON representation.
 * Converts nested `(number | null)[][]` back to Float64Array (null becomes NaN).
 */
declare function areaResultFromJSON(json: AreaResultJSON): AreaResult;
/**
 * Base64-encode the Float64Array buffer for compact binary storage.
 *
 * Uses btoa with chunked Uint8Array-to-string conversion to avoid
 * quadratic string concatenation and stack overflow on large grids.
 * Isomorphic (no Buffer dependency).
 *
 * Uses `byteOffset` and `byteLength` from the typed array view to
 * correctly handle subarrays/views that don't start at buffer offset 0.
 */
declare function areaResultToBinary(result: AreaResult): string;
/**
 * Decode a base64-encoded binary representation back to a Float64Array.
 *
 * @param base64 - Base64-encoded string from `areaResultToBinary`.
 * @param gridShape - Expected [height, width] for validation.
 * @throws Error if the decoded buffer size does not match gridShape.
 */
declare function areaResultFromBinary(base64: string, gridShape: readonly [number, number]): Float64Array;
/** Preview estimate for an area analysis run. */
interface AreaPreview {
    readonly tileCount: number;
    readonly estimatedTimeS: number;
    readonly estimatedCostTokens: number;
}
/**
 * Area preview enriched with pricing resolved from the gateway's public
 * pricing endpoint (`GET /billing/pricing`). Returned by
 * `InfraredClient.previewAreaWithPricing()`.
 *
 * `estimatedCostTokens` is `tileCount * tokensPerJob` — with
 * `pricingSource: 'remote'` the multiplier came from the live pricing
 * document; with `'fallback'` the offline constant
 * (`DEFAULT_TOKENS_PER_JOB`) was used because the pricing fetch failed.
 */
interface AreaPreviewWithPricing extends AreaPreview {
    /** Tokens charged per submitted job (tile). */
    readonly tokensPerJob: number;
    /** Where `tokensPerJob` came from: live gateway pricing or offline constant. */
    readonly pricingSource: 'remote' | 'fallback';
    /** Pricing document version (only when `pricingSource === 'remote'`). */
    readonly pricingVersion?: string;
}
/** Events emitted by the tile executor via mitt. */
type TileEvents = {
    'tile.started': {
        tileId: string;
        row: number;
        col: number;
    };
    'tile.completed': {
        tileId: string;
        row: number;
        col: number;
        result: Record<string, unknown>;
    };
    'tile.failed': {
        tileId: string;
        row: number;
        col: number;
        error: string;
    };
    'tile.retrying': {
        tileId: string;
        row: number;
        col: number;
        attempt: number;
        delay: number;
    };
};

export { type AreaJob as A, type BuildingsTiledResult as B, CELL_SIZE_M as C, computeAreaState as D, contextMarginM as E, cropStartCells as F, type GeoJSONPolygon as G, getNonEmptyTiles as H, getTilingConfig as I, type AreaPreviewWithPricing as J, TileFailurePhase as K, MAX_NON_EMPTY_TILES as M, type Point as P, SOLAR_TILING_CONFIG as S, type TileFailure as T, WIND_ANALYSIS_TYPES as W, type TileProgress as a, type TileEvents as b, type TilingConfig as c, type Tile as d, type TileSize as e, type TileGrid as f, type AreaPreview as g, type AreaResult as h, type AreaResultJSON as i, type AreaSchedule as j, type AreaScheduleJSON as k, type AreaState as l, METERS_PER_DEG_LAT as m, TILE_SIZE_CELLS as n, TILE_SIZE_M as o, type TileBuildingResult as p, type TileJobStatus as q, type TileResult as r, type TiledResult as s, WIND_TILING_CONFIG as t, areaResultFromBinary as u, areaResultFromJSON as v, areaResultToBinary as w, areaResultToJSON as x, areaScheduleFromJSON as y, areaScheduleToJSON as z };
