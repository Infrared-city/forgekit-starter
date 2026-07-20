import { A as AnalysesName } from './constants-qkmLe0Zv.js';
export { E as ExecutionConfig, P as PwcCriteria, T as ThermalComfortStatisticsSubType } from './constants-qkmLe0Zv.js';
import { I as IAnalysisService, A as AnalysisInput, k as InferAnalysisResponse } from './service-CMTWGK7o.js';
export { a as AnalysesUnion, a as AnalysisRequest, b as AnalysisResponse, c as AnalysisResponseMap, d as AnalysisService, e as AnalysisServiceConfig, B as BaseAnalysisPayload, h as BasePwcRequest, E as EPWData, j as EPWDataSchema, L as LOCATION_ANALYSIS_TYPES, l as Location, o as PwcRequest, q as PwcResponse, S as SolarAnalysisResponse, t as SolarModelRequest, z as SolarRadiationRequest, C as SvfAnalysisResponse, D as SvfModelRequest, H as TCSModelRequest, M as THERMAL_WEATHER_FIELDS, N as TILING_SUPPORTED_TYPES, O as ThermalModelWeatherData, U as UtciModelBaseRequest, X as UtciModelRequest, Z as UtciResponse, _ as WeatherDataUnion, $ as WeatherDataUnionSchema, a0 as WindModelRequest, a2 as WindSpeedResponse, a3 as configHash, a4 as extractWeatherFields } from './service-CMTWGK7o.js';
import { D as DotBimMesh$1, T as TimeFilters, b as TimePeriod } from './types-ChcKqRt2.js';
export { c as DataList, d as Day, e as DayRange, H as Hour, f as HourRange, L as Latitude, g as Longitude, M as Month, h as MonthRange, i as TimeFilter, j as TimeFilterPeriod, k as TimeFilterStamp, l as TimePeriodSchema, W as WeatherDataPoint } from './types-ChcKqRt2.js';
import { z } from 'zod';
import { a as TileProgress, f as TileGrid, g as AreaPreview, J as AreaPreviewWithPricing, j as AreaSchedule, l as AreaState, h as AreaResult } from './types-D2bCDPGh.js';
export { A as AreaJob, G as GeoJSONPolygon, S as SOLAR_TILING_CONFIG, T as TileFailure, K as TileFailurePhase, q as TileJobStatus, c as TilingConfig, W as WIND_ANALYSIS_TYPES, t as WIND_TILING_CONFIG, E as contextMarginM, F as cropStartCells, I as getTilingConfig } from './types-D2bCDPGh.js';
import { A as AuthResolver } from './auth-D2CCPTLa.js';
export { a as AuthHeaders, b as AuthOptions, c as buildAuthResolver } from './auth-D2CCPTLa.js';
import { L as Logger } from './logger-U3BDdomT.js';
export { a as LogEvent, c as consoleLogger, s as silentLogger } from './logger-U3BDdomT.js';
import { IBillingService } from './billing.js';
export { BillingService, BillingServiceConfig, DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE, PER_JOB_MODEL_KEYS, PublicPricing, estimateWorkflowRunTokens, resolveBracketName, resolveTokensPerJob } from './billing.js';
import { I as IJobsService, J as Job } from './types-DVfcTlO_.js';
export { D as DownloadResult, a as JobStatus, O as OnPollCallback, T as TERMINAL_STATUSES, j as jobFromResponse, p as parseJobStatus } from './types-DVfcTlO_.js';
import { IWeatherService } from './utilities.js';
export { WeatherService, WeatherServiceConfig } from './utilities.js';
import { I as IWebhooksService } from './index-DoRWMsYQ.js';
export { A as AreaRunError, a as AreaTimeoutError, B as BigPayloadError, b as BigPayloadFetchError, c as BigPayloadPresignError, d as BigPayloadUploadError, e as BuildingsServiceError, G as GroundMaterialsServiceError, f as InfraredError, g as InfraredJobError, h as InsufficientCreditsError, J as JobFailedError, i as JobNotCompletedError, j as JobPollError, k as JobSubmitError, l as JobTimeoutError, P as PolygonValidationError, R as RefExpiredRetryExhausted, m as ResultsDownloadError, T as TiledRunError, V as VegetationServiceError, W as WEBHOOK_EVENT_FAILED, n as WEBHOOK_EVENT_RUNNING, o as WEBHOOK_EVENT_SUCCEEDED, p as WeatherServiceError, q as WebhookEndpoint, r as WebhookError, s as WebhookNotFoundError, t as WebhookRegistration, u as WebhookRegistrationError, v as WebhooksService, w as WebhooksServiceConfig, x as webhookEndpointFromResponse } from './index-DoRWMsYQ.js';
export { JobsService, JobsServiceConfig } from './jobs.js';

/**
 * Coordinates for the center of the request area
 */
declare const BuildingCoordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, z.core.$strip>;
type BuildingCoordinates = z.infer<typeof BuildingCoordinatesSchema>;
/**
 * Size of the request area in meters
 */
declare const BuildingSizeSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strip>;
type BuildingSize = z.infer<typeof BuildingSizeSchema>;
/**
 * Optimization options for building generation
 */
declare const BuildingOptimizationsSchema: z.ZodObject<{
    mapCollectionOptimized: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    groupedBuildings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    optimized2D: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    optimized3D: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
type BuildingOptimizations = z.infer<typeof BuildingOptimizationsSchema>;
/**
 * Output format options
 */
declare const OutputFormatSchema: z.ZodEnum<{
    GeoJson: "GeoJson";
    DotBim: "DotBim";
    Mesh: "Mesh";
}>;
type OutputFormat = z.infer<typeof OutputFormatSchema>;
/**
 * Main request body for the buildings endpoint
 */
declare const BuildingsRequestSchema: z.ZodObject<{
    coordinates: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, z.core.$strip>;
    size: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strip>;
    returnBuildingIds: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        GeoJson: "GeoJson";
        DotBim: "DotBim";
        Mesh: "Mesh";
    }>>>;
    compress: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    optimizations: z.ZodOptional<z.ZodObject<{
        mapCollectionOptimized: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        groupedBuildings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        optimized2D: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        optimized3D: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type BuildingsRequest = z.infer<typeof BuildingsRequestSchema>;
/**
 * Response structure for uncompressed data
 */
interface BuildingsResponseData {
    buildingIds?: number[];
    buildings?: Record<string, DotBimMesh$1>;
}
interface BuildingsResponse {
    success: boolean;
    data: BuildingsResponseData;
    compressed?: boolean;
    error?: {
        code: string;
        message: string;
        statusCode: number;
    };
}
/**
 * Configuration for tiled buildings retrieval (area-level operations).
 */
interface BuildingsConfig {
    /** Desired output format. Default: 'DotBim'. */
    outputFormat?: OutputFormat;
    /** Whether to request compressed responses. Default: false. */
    compress?: boolean;
    /** Optimization options for building generation. */
    optimizations?: BuildingOptimizations;
    /** Progress callback for tile execution updates. */
    onProgress?: (progress: TileProgress) => void;
}
/**
 * Result of `getBuildingsInArea()`.
 *
 * Contains deduplicated buildings with coordinates transformed
 * from tile-SW to polygon-bbox-SW meter space.
 */
interface AreaBuildings {
    /** Building meshes keyed by building identifier. */
    buildings: Record<string, DotBimMesh$1>;
    /** Numeric building IDs from the API response. */
    buildingIds: number[];
    /** Total number of buildings. */
    totalBuildings: number;
    /** Wall-clock seconds for the fetch. */
    executionTime: number;
}

/**
 * Combine per-tile buildings dicts into one for visualization.
 *
 * Mirrors Python SDK's `merge_buildings`: all non-null values from
 * `buildingsMap` are merged into a single object. List-valued keys are
 * concatenated across tiles; scalar keys take the last-seen value.
 *
 * @param buildingsMap - tileId → buildings object (or null).
 * @returns Combined buildings object, or `{}` if every entry was null.
 */
declare function mergeBuildings(buildingsMap: Record<string, Record<string, unknown> | null | undefined>): Record<string, unknown>;

interface BuildingsServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retries for retryable errors. Default: 2 */
    maxRetries?: number;
    /** Bare gateway URL for big-payload presign. Threaded from InfraredClient. */
    gatewayBaseUrl?: string;
    /** Lazy big-payload kill switch — re-resolved per call. */
    getBigPayloadEnabled?: () => boolean;
    /** Lazy big-payload threshold (bytes) — re-resolved per call. */
    getBigPayloadThresholdBytes?: () => number;
}
/**
 * Interface for dependency injection and testing.
 */
interface IBuildingsService {
    getBuildings(request: BuildingsRequest): Promise<BuildingsResponse>;
    getBuildingsInArea(polygon: unknown, config?: BuildingsConfig): Promise<AreaBuildings>;
    getBuildingsByTiles(tiles: TileGrid, config?: BuildingsConfig): Promise<Record<string, Record<string, unknown> | null>>;
}
/**
 * Service for accessing building data.
 *
 * Supports single-tile requests via `getBuildings()`, area-based retrieval
 * with deduplication via `getBuildingsInArea()`, and composable tile-grid
 * retrieval via `getBuildingsByTiles()`.
 */
declare class BuildingsService implements IBuildingsService {
    private httpClient;
    private logger;
    constructor(config: BuildingsServiceConfig);
    /**
     * Fetch 3D building data for a single tile.
     *
     * @param request - The buildings request with coordinates, size, and options.
     * @returns The buildings response with mesh data.
     *
     * @example
     * ```ts
     * const response = await client.buildings.getBuildings({
     *   coordinates: { latitude: 52.52, longitude: 13.405 },
     *   size: { x: 512, y: 512 },
     *   outputFormat: 'DotBim',
     * })
     * ```
     */
    getBuildings(request: BuildingsRequest): Promise<BuildingsResponse>;
    /**
     * Fetch and deduplicate buildings for a polygon area.
     *
     * Tiles the polygon, fetches buildings per tile in parallel via TileExecutor,
     * deduplicates by building key in deterministic grid order, and transforms
     * coordinates from tile-SW to polygon-bbox-SW frame.
     *
     * @param polygon - GeoJSON Polygon (validated internally).
     * @param config - Optional configuration for output format, compression, and progress.
     * @returns Deduplicated buildings with execution time.
     */
    getBuildingsInArea(polygon: unknown, config?: BuildingsConfig): Promise<AreaBuildings>;
    /**
     * Fetch buildings for each non-empty tile in a pre-generated grid.
     *
     * Returns a flat `{tileId: buildings_dict | null}` mapping suitable for
     * composable usage. A `null` value means the fetch failed for that tile.
     *
     * @param tiles - Tile grid produced by TileService.generateTilesForPolygon().
     * @param config - Optional configuration for output format, compression, and progress.
     * @returns Map from tile ID to buildings dict, or null for failed tiles.
     */
    getBuildingsByTiles(tiles: TileGrid, config?: BuildingsConfig): Promise<Record<string, Record<string, unknown> | null>>;
}

/**
 * Env-var resolution for big-payload config.
 *
 * Resolution order (matches Python `_is_enabled` / `_threshold_bytes` plus
 * the SDK's universal Worker/Node pattern):
 *   1. Explicit constructor override (`InfraredClientConfig.bigPayloads`).
 *   2. Worker `env` binding (`INFRARED_BIG_PAYLOADS_ENABLED` /
 *      `INFRARED_BIG_PAYLOADS_THRESHOLD_BYTES`).
 *   3. `process.env` (Node only — guarded so Workers don't break).
 *   4. Defaults (`true` / 5 MiB).
 *
 * Read on every call so notebook users can flip the kill-switch mid-session
 * without re-importing — matches Python.
 */
/** Bindings carrying the two big-payload env vars. */
interface BigPayloadEnvBindings {
    INFRARED_BIG_PAYLOADS_ENABLED?: string;
    INFRARED_BIG_PAYLOADS_THRESHOLD_BYTES?: string;
}
/** Constructor-time overrides (frozen — short-circuit env reads). */
interface BigPayloadOverride {
    enabled?: boolean;
    thresholdBytes?: number;
}

/** Request configuration passed to interceptors */
interface RequestConfig {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string | ArrayBuffer | Uint8Array;
    /** External abort signal to cancel the request. */
    signal?: AbortSignal;
}
/** Interceptor hooks for request/response lifecycle */
interface HttpInterceptors {
    /** Called before the request is sent. Can modify the config. */
    onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    /** Called after a successful response. */
    onResponse?: (response: Response) => void | Promise<void>;
    /** Called when a request fails (after all retries exhausted). */
    onError?: (error: Error) => void | Promise<void>;
}
interface HttpClientConfig {
    /**
     * Auth header resolver. Called per request — `getToken` callers refresh
     * JWTs without rebuilding the client, env var changes propagate, etc.
     */
    getAuthHeaders: AuthResolver;
    /** Base URL for the API */
    baseUrl: string;
    /** Logger instance */
    logger: Logger;
    /** Request timeout in milliseconds. Default: 180000 (3 minutes) */
    timeout?: number;
    /** Maximum number of retries for retryable errors. Default: 2 */
    maxRetries?: number;
    /** Request/response interceptor hooks */
    interceptors?: HttpInterceptors;
    /**
     * Big-payload runtime config — bare gateway URL for `/uploads/presign`
     * plus the auto-switching kill-switch and threshold. The kill-switch and
     * threshold are passed as **getters** so they're re-resolved on every
     * call: notebook / Worker users that flip
     * `INFRARED_BIG_PAYLOADS_ENABLED` mid-session see the new value
     * immediately. Snapshotting once at construction violated the
     * documented runtime contract.
     */
    gatewayBaseUrl?: string;
    getBigPayloadEnabled?: () => boolean;
    getBigPayloadThresholdBytes?: () => number;
}
declare class HttpClient {
    private getAuthHeaders;
    private baseUrl;
    private logger;
    private timeout;
    private maxRetries;
    private interceptors;
    private gatewayBaseUrl?;
    private getBigPayloadEnabled;
    private getBigPayloadThresholdBytes;
    constructor(config: HttpClientConfig);
    /**
     * POST request with optional gzip compression.
     *
     * `options.bigPayload`: when `true`, requests with serialized JSON bytes
     * exceeding the configured threshold automatically switch to the `$ref`
     * envelope flow (presign → S3 PUT → envelope POST). Below the threshold,
     * or when the kill switch is off, the call uses the inline path with
     * existing retry/backoff. Mutually exclusive with `compress` — gzip is
     * for the legacy text/plain control-plane path; big-payloads use a
     * different wire shape.
     */
    post<T = any>(path: string, data: any, options?: {
        compress?: boolean;
        serializeNames?: boolean;
        decompressResult?: boolean;
        /** External abort signal to cancel the request. */
        signal?: AbortSignal;
        /** Route through big-payload `$ref` envelope above threshold. */
        bigPayload?: boolean;
        /**
         * Gzip the JSON body with a standard `Content-Encoding: gzip` header
         * (raw gzip bytes — NOT the legacy base64 `compress` convention). The
         * gateway gunzips transparently. Geometry compresses ~18×, keeping large
         * bodies small enough to send inline and sidestepping the (server-side
         * unsupported on these endpoints) `$ref` envelope. Mutually exclusive
         * with `compress` / `bigPayload`.
         */
        gzip?: boolean;
    }): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = any>(path: string): Promise<T | undefined>;
    /**
     * GET request
     */
    get<T = any>(path: string, params?: Record<string, any>): Promise<T>;
    /**
     * Execute an HTTP request with retry logic.
     *
     * Retry strategy (matching Python SDK):
     * - Retryable status codes: 429, 500, 502, 503, 504
     * - Exponential backoff with full jitter: random(0, min(cap, base * 2^attempt))
     * - Floor: max(floor, computed_delay)
     * - Retry-After header support (always wins over computed backoff)
     * - Configurable max retries (default: 2)
     */
    private fetchWithRetry;
    /**
     * Compute retry delay with full jitter, matching Python SDK.
     *
     * Priority:
     * 1. Retry-After header (if present) -- always wins
     * 2. Full jitter: random(0, min(cap, base * 2^attempt))
     * 3. Floor: max(backoff_floor, computed_delay)
     */
    private computeRetryDelay;
}

/**
 * Client-side port of `POST /ground-material/clean-v3`.
 *
 * 1:1 with the golden-tested Rust reference
 * `ir-simprep::{ground_clean,ground_clip}` (infrared-core). NOT ported from the
 * Python — the Rust's documented parity quirks (columnized props, positional
 * ids, GEOS ring reordering on clip; deviations D5–D8) ARE the contract.
 *
 * Pure, synchronous, universal-runtime (no I/O, no `node:` imports).
 */

/**
 * osmnx-compatible bbox `(west, south, east, north)` around a lat/lon point,
 * `distance` meters in each direction. 1:1 port of
 * ir-simprep::ground_clean::bbox_from_point.
 *
 * Latitude is clamped to ±89.9° ONCE; the clamped value feeds BOTH the cos()
 * in the longitude delta AND the south/north edges (Rust shadows the variable).
 */
declare function bboxFromPoint(latitude: number, longitude: number, distance: number): [number, number, number, number];
interface CleanV3Params {
    latitude: number;
    longitude: number;
    distance: number;
    defaultLayer?: string;
    zStep?: number;
}
/**
 * Client-side port of `POST /ground-material/clean-v3`. Pure, synchronous.
 * Iterates layers in INSERTION order (z depends on order — never raw
 * Object.keys, which would hoist integer-like keys); crops + filters to
 * Polygon/MultiPolygon; z-stamps each layer at `(i+1)*zStep`; inserts the
 * bbox default feature. 1:1 with ir-simprep::ground_clean::clean_v3.
 */
declare function cleanV3Local(layers: MaterialLayers, params: CleanV3Params): MaterialLayers;

/**
 * GroundMaterialCleaner — the swappable clean-v3 seam.
 *
 * `cleanV3` returns a Promise so a caller can run the work anywhere (inline, a
 * worker, WASM) without the SDK knowing. Two impls ship here:
 *   - RemoteCleaner: the existing `POST /ground-material/clean-v3` gateway call.
 *   - LocalCleaner:  the pure client-side port (`cleanV3Local`).
 * A future WASM cleaner (infrared-core) implements the same interface — one
 * injected object, no call-site churn.
 */

/** Pluggable clean-v3 backend. */
interface GroundMaterialCleaner {
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
/** Runs the pure client-side port inline. */
declare class LocalCleaner implements GroundMaterialCleaner {
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}
interface RemoteCleanerDeps {
    httpClient: Pick<HttpClient, 'post'>;
}
/** Wraps the existing `POST /ground-material/clean-v3` gateway call. */
declare class RemoteCleaner implements GroundMaterialCleaner {
    private deps;
    constructor(deps: RemoteCleanerDeps);
    cleanV3(layers: MaterialLayers, params: CleanV3Params): Promise<MaterialLayers>;
}

/**
 * GroundMaterialsService — port of Python SDK's `GroundMaterialsServiceClient`.
 *
 * Three public methods:
 *   - getRaw(lat, lon, distance, source?)              — single-point fetch
 *   - clean(layers, lat, lon, distance, default?)      — masking + bbox crop
 *   - getArea(polygon, opts?)                          — tile + fetch + merge
 *                                                        + clean pipeline
 *
 * NOTE: forge-kit's `@forge-kit/ground-materials` primitive is a different
 * package (drawing styles, registry, plugin UI) — this is the API service
 * client that mirrors Python's `GroundMaterialsServiceClient`. They are
 * complementary, not substitutes.
 */

interface GroundMaterialsServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Request timeout in ms; default 300_000 (5 min). */
    timeout?: number;
    /** Bare gateway URL for big-payload presign. Threaded from InfraredClient. */
    gatewayBaseUrl?: string;
    /** Lazy big-payload kill switch — re-resolved per call. */
    getBigPayloadEnabled?: () => boolean;
    /** Lazy big-payload threshold (bytes) — re-resolved per call. */
    getBigPayloadThresholdBytes?: () => number;
}
/** GeoJSON FeatureCollection. */
type FeatureCollection = {
    type?: string;
    features?: Array<Record<string, unknown>>;
    [key: string]: unknown;
};
/** A dict of `layer_name -> FeatureCollection`. */
type MaterialLayers = Record<string, FeatureCollection>;
/** Aggregated result — mirrors Python `AreaGroundMaterials`. */
interface AreaGroundMaterials {
    /** Cleaned material layers keyed by name (`'asphalt'`, `'vegetation'`, ...). */
    layers: MaterialLayers;
    polygon: unknown;
    totalFeatures: number;
    executionTime: number;
}
interface IGroundMaterialsService {
    getRaw(lat: number, lon: number, distance: number, source?: string): Promise<MaterialLayers | null>;
    clean(layers: MaterialLayers, lat: number, lon: number, distance: number, defaultMaterial?: string): Promise<MaterialLayers | null>;
    getArea(polygon: unknown, opts?: {
        maxWorkers?: number;
        defaultMaterial?: string;
        maxTilesOverride?: number;
        /** Which clean-v3 backend to use. Default 'remote' (the gateway call).
         *  'local' = pure client-side port; a custom object = worker/WASM bridge. */
        cleaner?: 'remote' | 'local' | GroundMaterialCleaner;
        /** z-step for local/custom cleaners (ignored by 'remote'). Default 0.00001. */
        zStep?: number;
    }): Promise<AreaGroundMaterials>;
}
declare class GroundMaterialsService implements IGroundMaterialsService {
    private httpClient;
    private logger;
    constructor(config: GroundMaterialsServiceConfig);
    getRaw(lat: number, lon: number, distance: number, source?: string): Promise<MaterialLayers | null>;
    clean(layers: MaterialLayers, lat: number, lon: number, distance: number, defaultMaterial?: string): Promise<MaterialLayers | null>;
    getArea(polygon: unknown, opts?: {
        maxWorkers?: number;
        defaultMaterial?: string;
        maxTilesOverride?: number;
        cleaner?: 'remote' | 'local' | GroundMaterialCleaner;
        zStep?: number;
    }): Promise<AreaGroundMaterials>;
}

/**
 * VegetationService — port of Python SDK's VegetationServiceClient.
 *
 * Three public methods:
 *   - getGeoJson(lat, lon, distance, source?)  — single point fetch
 *   - convertToMesh(featureCollection)         — DotBim mesh conversion
 *   - getArea(polygon, opts?)                  — parallel per-tile fetch +
 *                                                cross-tile deduplication
 */

interface VegetationServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Request timeout in ms; default 300_000 (5 min). */
    timeout?: number;
    /** Bare gateway URL for big-payload presign. Threaded from InfraredClient. */
    gatewayBaseUrl?: string;
    /** Lazy big-payload kill switch — re-resolved per call. */
    getBigPayloadEnabled?: () => boolean;
    /** Lazy big-payload threshold (bytes) — re-resolved per call. */
    getBigPayloadThresholdBytes?: () => number;
}
/** GeoJSON FeatureCollection — tree points returned by the API. */
type GeoJsonFeatureCollection = {
    type?: string;
    features?: Array<Record<string, unknown>>;
    referencePoint?: [number, number];
    [key: string]: unknown;
};
/** DotBim mesh as returned by `/convert/geojson-to-mesh`. */
interface DotBimMesh {
    mesh_id: number;
    coordinates: number[];
    indices?: number[];
}
/** Aggregated area vegetation result — mirrors Python `AreaVegetation`. */
interface AreaVegetation {
    /**
     * Deduplicated GeoJSON features keyed by stable id (OSM id, OSM @id,
     * or rounded lat/lon fallback).
     */
    features: Record<string, Record<string, unknown>>;
    polygon: unknown;
    totalTrees: number;
    executionTime: number;
    /**
     * Tile IDs whose vegetation fetch failed. The tile is treated as
     * no-vegetation (null result) so the pipeline continues. Mirrors Python
     * SDK `AreaVegetation.failed_tiles` (0.4.10).
     */
    failedTiles: string[];
}
interface IVegetationService {
    getGeoJson(lat: number, lon: number, distance: number, source?: string): Promise<GeoJsonFeatureCollection | null>;
    convertToMesh(featureCollection: GeoJsonFeatureCollection): Promise<DotBimMesh[]>;
    getArea(polygon: unknown, opts?: {
        maxWorkers?: number;
        maxTilesOverride?: number;
    }): Promise<AreaVegetation>;
}
declare class VegetationService implements IVegetationService {
    private httpClient;
    private logger;
    constructor(config: VegetationServiceConfig);
    getGeoJson(lat: number, lon: number, distance: number, source?: string): Promise<GeoJsonFeatureCollection | null>;
    convertToMesh(featureCollection: GeoJsonFeatureCollection): Promise<DotBimMesh[]>;
    getArea(polygon: unknown, opts?: {
        maxWorkers?: number;
        maxTilesOverride?: number;
    }): Promise<AreaVegetation>;
}

/**
 * InfraredClient -- main entry point for the Infrared City API.
 *
 * Supports single-tile analysis via `run()` / `runAndWait()`, area-level
 * tiled orchestration via `runArea()` / `runAreaAndWait()`, and webhook
 * management via `client.webhooks`.
 *
 * Constructor: apiKey + baseUrl can be passed directly OR resolved from the
 * Worker `env` bindings object OR from process.env (Node). See the constructor
 * doc-comment for the resolution order.
 *
 * The SDK is fully self-contained — every service Python exposes
 * (weather, vegetation, ground-materials, buildings, webhooks) has a
 * TS counterpart here. No external `@forge-kit/*` packages required.
 */

/**
 * Worker bindings shape — anything with `INFRARED_API_KEY` and optional
 * `INFRARED_BASE_URL` keys (e.g. Cloudflare Workers `env` object). Also
 * carries the big-payload kill switch / threshold env vars.
 */
interface InfraredEnvBindings extends BigPayloadEnvBindings {
    INFRARED_API_KEY?: string;
    INFRARED_BASE_URL?: string;
}
interface InfraredClientConfig {
    /**
     * API key for authentication. Falls back to `env.INFRARED_API_KEY` then to
     * `process.env.INFRARED_API_KEY` (Node only). Sent as `X-Api-Key` header
     * on every request. May coexist with `token` / `getToken` (gateway
     * authenticates the JWT, downstream Lambdas read `X-Api-Key`).
     */
    apiKey?: string;
    /**
     * Static JWT bearer token. Sent as `Authorization: Bearer <token>` on
     * every request. Use for long-lived service tokens. Mutually exclusive
     * with `getToken`.
     */
    token?: string;
    /**
     * Dynamic JWT bearer resolver. Called on **every** request — right
     * pattern for browser / Worker contexts where tokens expire and the app
     * refreshes them out-of-band. Mutually exclusive with `token`.
     */
    getToken?: () => string | Promise<string>;
    /**
     * Base URL for the API. Falls back to `env.INFRARED_BASE_URL`, then
     * `process.env.INFRARED_BASE_URL`, then `https://api.infrared.city/v2`.
     */
    baseUrl?: string;
    /**
     * Cloudflare Worker bindings (or any object) carrying `INFRARED_API_KEY` /
     * `INFRARED_BASE_URL`. Workers don't expose `process.env`, so pass `env`
     * here.
     */
    env?: InfraredEnvBindings;
    logger?: Logger;
    /**
     * Control-plane request timeout in ms (submit / poll / status / utility).
     * Default 180_000 (3 min). Mirrors Python SDK's `(10, 300)` read budget.
     */
    timeout?: number;
    /**
     * S3 result-download timeout in ms (presigned-URL fetch in `downloadResults`).
     * Default 600_000 (10 min). Larger than `timeout` because cold-Lambda S3
     * fetches of full-year weather payloads stream slowly; matches Python SDK's
     * `S3_TIMEOUT_S = (10, 600)`.
     */
    downloadTimeout?: number;
    /** Pre-configured JobsService instance (for DI / testing). */
    jobsService?: IJobsService;
    /** Pre-configured AnalysisService instance (for DI / testing). */
    analysisService?: IAnalysisService;
    /** Pre-configured WeatherService instance (for DI / testing). */
    weatherService?: IWeatherService;
    /** Pre-configured VegetationService instance (for DI / testing). */
    vegetationService?: IVegetationService;
    /** Pre-configured GroundMaterialsService instance (for DI / testing). */
    groundMaterialsService?: IGroundMaterialsService;
    /** Pre-configured BuildingsService instance (for DI / testing). */
    buildingsService?: IBuildingsService;
    /** Pre-configured WebhooksService instance (for DI / testing). */
    webhooksService?: IWebhooksService;
    /** Pre-configured BillingService instance (for DI / testing). */
    billingService?: IBillingService;
    /**
     * Big-payload flow overrides. When set, short-circuits env-var resolution.
     * `enabled=false` forces inline path even above threshold; `thresholdBytes`
     * tunes the cut-over (default 5 MiB). Service clients route their large
     * POSTs (buildings, vegetation, ground-materials, weather generate-image,
     * filter, analyses jobs) through the auto-switching `$ref` envelope flow
     * that mirrors Python SDK 0.4.4. Both can also be set via env vars
     * `INFRARED_BIG_PAYLOADS_ENABLED` / `INFRARED_BIG_PAYLOADS_THRESHOLD_BYTES`.
     */
    bigPayloads?: BigPayloadOverride;
    /**
     * Bare gateway URL for the big-payload presign endpoint
     * (`{gateway}/uploads/presign`). Defaults to
     * `deriveGatewayBaseUrl(baseUrl)` (strips trailing `/utils`). Override only
     * if the gateway lives at a different host than `baseUrl`.
     */
    gatewayBaseUrl?: string;
}
/**
 * Options for `runArea` / `runAreaAndWait`. Mirrors the keyword-only
 * surface of Python SDK's `run_area`:
 *
 *   buildings / vegetation / ground_materials  layer maps to inject per-tile.
 *   max_tiles_override                         override the non-empty tile cap.
 *   max_workers                                concurrency cap for submit.
 *   webhook_url / webhook_events               optional async webhook hook.
 *   retry_from                                 only resubmit tiles in the
 *                                              failed_submissions list of a
 *                                              prior schedule.
 */
interface RunAreaOptions {
    /**
     * Buildings hint. Pass any non-empty dict to trigger the
     * `BuildingsService.getBuildingsByTiles` server-side fetch path.
     * (Per-tile pre-supplied buildings will land in v0.7.)
     */
    buildings?: Record<string, unknown>;
    /**
     * Vegetation features keyed by stable feature ID (typically the dict
     * returned from `client.vegetation.getArea(polygon)` `.features` field).
     * Each feature is assigned to every tile whose bbox contains its centroid.
     * Pass `undefined` or `{}` to skip vegetation injection (server runs without
     * tree shading).
     */
    vegetation?: Record<string, Record<string, unknown>>;
    /**
     * Ground-material layers (`{ layerName: FeatureCollection }`), typically
     * the `.layers` field returned from `client.groundMaterials.getArea(polygon)`.
     * Each feature is assigned to every tile whose bbox overlaps its bbox.
     * Pass `undefined` or `{}` to skip ground-material injection.
     */
    groundMaterials?: Record<string, {
        features?: Array<Record<string, unknown>>;
    }>;
    /** Override the default non-empty-tile cap (`MAX_NON_EMPTY_TILES`). */
    maxTilesOverride?: number;
    /** Concurrent submit cap. Defaults to `MAX_PARALLEL_SUBMISSIONS` (8). */
    maxWorkers?: number;
    /** Optional webhook URL to register on each submitted job. */
    webhookUrl?: string;
    /** Webhook events to subscribe (default: `['job.succeeded', 'job.failed']`). */
    webhookEvents?: string[];
    /**
     * Retry mode — when supplied, only tiles in
     * `retryFrom.failedSubmissions` are resubmitted. Other tiles are skipped.
     */
    retryFrom?: AreaSchedule;
}
/**
 * Main Infrared SDK client.
 *
 * Provides high-level methods for single-tile and area-level analysis,
 * building data retrieval, and webhook management.
 */
declare class InfraredClient {
    /**
     * Resolved API key (if provided). `undefined` when the client was built
     * with JWT auth only. Exposed as `readonly` for consumers that need to
     * forward the key to non-SDK code paths.
     */
    readonly apiKey: string | undefined;
    readonly baseUrl: string;
    readonly jobs: IJobsService;
    readonly analyses: IAnalysisService;
    readonly weather: IWeatherService;
    readonly vegetation: IVegetationService;
    readonly groundMaterials: IGroundMaterialsService;
    readonly buildings: IBuildingsService;
    /**
     * Per-job count of consecutive `checkAreaState` poll failures. When the
     * count exceeds `MAX_CONSECUTIVE_POLL_FAILURES`, the job is marked
     * `skipped` so the wait loop unblocks instead of hanging until timeout.
     */
    private readonly pollFailureCounts;
    readonly webhooks: IWebhooksService;
    /**
     * Public billing/pricing reads (`GET {gateway}/billing/pricing`, no auth).
     * Backs `previewAreaWithPricing()`; usable directly for raw pricing data.
     */
    readonly billing: IBillingService;
    /** Bare gateway URL for big-payload presign (`{gateway}/uploads/presign`). */
    readonly gatewayBaseUrl: string;
    /**
     * Live big-payload kill switch — re-resolves env / override on every
     * read. Use the getter form (`bigPayloadEnabled`) to observe current
     * state; the boolean property below is kept for back-compat, snapshots
     * the value at construction, and **does not** see env-var flips.
     */
    get bigPayloadEnabled(): boolean;
    /** Live big-payload threshold in bytes — re-resolves env / override per read. */
    get bigPayloadThresholdBytes(): number;
    /** Live resolvers — closures over `env` + `override`. Re-read on each call. */
    private readonly getBigPayloadEnabled;
    private readonly getBigPayloadThresholdBytes;
    private readonly getAuthHeaders;
    private readonly logger;
    constructor(config?: InfraredClientConfig);
    /**
     * Release owned resources. Safe to call multiple times.
     */
    close(): void;
    /**
     * Transform an AnalysisInput into a kebab-case payload ready for the API,
     * preserving camelCase for wind-data as the backend expects.
     */
    private preparePayload;
    /**
     * Submit a single-tile analysis job and return the Job handle.
     *
     * @param input - Analysis input configuration.
     * @param opts - Optional webhook configuration.
     * @returns The submitted job.
     */
    run(input: AnalysisInput, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<Job>;
    /**
     * Submit a single-tile analysis, wait for completion, return decompressed results.
     *
     * Return type is inferred from `input.analysisType` via `InferAnalysisResponse<T>`,
     * so callers get a precisely-typed response (`WindSpeedResponse`,
     * `SolarAnalysisResponse`, etc.) without needing `as`.
     *
     * @param input - Analysis input configuration.
     * @param timeout - Timeout in seconds (default 300).
     * @param opts - Optional webhook configuration.
     */
    runAndWait<T extends AnalysisInput>(input: T, timeout?: number, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<InferAnalysisResponse<T>>;
    /**
     * Preview tiling for a polygon without running any analyses.
     *
     * Uses TileService internally -- no API call, just tile grid calculation.
     * Wind analyses tile at 50% overlap (256m step); solar / UTCI / daylight /
     * SVF / TCS tile edge-to-edge (512m step) — so the SAME polygon produces
     * up to ~4× more wind tiles than solar tiles. `analysisType` is therefore
     * required: the tile count (and cost estimate) only matches what `runArea`
     * will submit — and what the gateway will charge — when it is the same
     * analysis type you pass to `runArea`.
     *
     * Cost semantics: the gateway charges a flat per-job token price at
     * submission time (`estimatedCostTokens = tileCount × tokensPerJob`).
     * Tiles whose submission FAILS are never charged, so the actual charge is
     * always ≤ the estimate. This method uses the offline fallback price
     * (`DEFAULT_TOKENS_PER_JOB`); use `previewAreaWithPricing()` for a quote
     * based on the gateway's live pricing document.
     *
     * @param polygon - A GeoJSON Polygon object.
     * @param opts.analysisType - Analysis type the preview should size for.
     *   Required at the type level. At runtime a missing value logs a warning
     *   and falls back to wind tiling (pre-0.12 behavior) — which OVERCOUNTS
     *   solar-family analyses ~4×.
     * @param opts.maxTilesOverride - Optional override for the non-empty tile cap.
     * @returns Preview with tile count, estimated time, and estimated cost.
     * @throws Error if `analysisType` is not supported for tiling (same guard
     *   as `runArea`).
     */
    previewArea(polygon: unknown, opts: {
        analysisType: AnalysesName;
        maxTilesOverride?: number;
    }): AreaPreview;
    /**
     * Preview tiling for a polygon AND price it with the gateway's live public
     * pricing document (`GET /billing/pricing`).
     *
     * The tile count comes from the same local computation as `previewArea()`
     * (single source of truth); only the per-job token price is remote. When
     * the pricing fetch fails for ANY reason the method logs a warning and
     * falls back to the offline constant (`DEFAULT_TOKENS_PER_JOB`) with
     * `pricingSource: 'fallback'` — it never throws for pricing reasons.
     * Polygon-validation and unsupported-type errors still throw, exactly as
     * in `previewArea()`.
     *
     * @param polygon - A GeoJSON Polygon object.
     * @param opts.analysisType - Analysis type the preview should size for.
     * @param opts.maxTilesOverride - Optional override for the non-empty tile cap.
     * @param opts.forceRefresh - Bypass the 5-minute pricing cache.
     * @returns Preview with tile count, per-job token price, its source, and
     *   the pricing document version when resolved remotely.
     */
    previewAreaWithPricing(polygon: unknown, opts: {
        analysisType: AnalysesName;
        maxTilesOverride?: number;
        forceRefresh?: boolean;
    }): Promise<AreaPreviewWithPricing>;
    /**
     * Submit tiled analysis jobs over a polygon.
     *
     * Validates the polygon, generates tiles internally, optionally fetches
     * buildings per tile via the API, and submits jobs. Returns an AreaSchedule
     * for tracking and later merging.
     *
     * When `buildings` is provided (non-empty object), the SDK calls
     * `getBuildingsByTiles()` to retrieve per-tile building data from the
     * API with server-side spatial filtering. The `buildings` parameter
     * signals that building geometry context is needed for the analysis.
     *
     * @param input - Analysis input (template payload).
     * @param polygon - A GeoJSON Polygon object.
     * @param buildings - Building meshes keyed by identifier. When provided and non-empty,
     *   triggers per-tile building fetch via the API. Pass `undefined` to skip building injection.
     * @returns Schedule of submitted jobs.
     */
    runArea(input: AnalysisInput, polygon: unknown, opts?: RunAreaOptions): Promise<AreaSchedule>;
    /**
     * Query all job statuses in an area schedule and compute aggregate state.
     *
     * @param schedule - The schedule to check.
     * @returns Current area state with status counts.
     */
    checkAreaState(schedule: AreaSchedule): Promise<AreaState>;
    /**
     * Query one job's status with per-call retry. Mirrors Python
     * `_polling.py::query_one`: up to STATUS_RETRY_MAX retries on
     * retryable errors (429 / 5xx / timeout), honoring `Retry-After` when
     * present; on terminal failure increments the cross-round wedge
     * counter and may flip the tile to `skipped`.
     */
    private pollOneJobStatus;
    /**
     * Download and merge results for succeeded jobs in a schedule.
     *
     * Can be called any time -- does NOT require all jobs to be terminal.
     * Uses stored tile positions and grid shape from the schedule.
     *
     * @param schedule - The schedule whose results to merge.
     * @returns Merged result with grid, failed_jobs, skipped_jobs.
     */
    mergeAreaJobs(schedule: AreaSchedule, opts?: {
        strategy?: 'default' | 'directional' | 'directional_blend';
        windDirectionDeg?: number;
    }): Promise<AreaResult>;
    /**
     * Submit area jobs, poll until complete, merge and return results.
     *
     * @param input - Analysis input (template payload).
     * @param polygon - A GeoJSON Polygon object.
     * @param buildings - Building meshes keyed by identifier. When provided and non-empty,
     *   triggers per-tile building fetch. Pass `undefined` to skip.
     * @param maxWorkers - Reserved for future concurrency control. Currently unused.
     * @param opts - Optional polling configuration.
     * @returns Merged area result.
     * @throws Error if areaTimeout is reached before all jobs complete.
     */
    runAreaAndWait(input: AnalysisInput, polygon: unknown, opts?: RunAreaOptions & {
        /** Total area timeout in seconds. Default: 3600. */
        areaTimeout?: number;
        /** Callback fired each polling round with the current area state. */
        onProgress?: (state: AreaState) => void;
        /**
         * Merge strategy passed through to `mergeAreaJobs`. Default
         * `'default'` (centre-crop). `'directional'` / `'directional_blend'`
         * are wind-speed only and require `windDirectionDeg`.
         */
        strategy?: 'default' | 'directional' | 'directional_blend';
        /** Wind-from direction in degrees, required for directional strategies. */
        windDirectionDeg?: number;
    }): Promise<AreaResult>;
}

/**
 * Pre-flight check for direct-sun-hours context-buffer adequacy.
 *
 * Mirrors `infrared_sdk/preflight/sun_context.py` from the Python SDK.
 *
 * The SDK's solar tiling fetches buildings within a fixed margin of each
 * tile (`contextSizeM`). Buildings beyond that margin can't cast shadows
 * into the tile's inference area, so at low sun angles results may
 * degrade at tile edges. This module estimates whether that geometric
 * loss is material for a given (location, time-period, buffer) combo
 * and returns a severity verdict the caller can render as a banner.
 *
 * The estimate is deliberately **conservative** (single-elevation worst
 * case, no irradiance weighting). It's a yes/no "should I worry"
 * pre-flight gate, not a precise error model. Tree shadows, polygon-edge
 * fetch limits, terrain, and atmospheric effects are not modelled.
 */
/**
 * Severity levels in monotonic increasing order of concern.
 * `info` is reserved for cases where the question doesn't apply
 * (no positive-elevation hours in the window, or invalid input).
 */
declare const SUN_CONTEXT_SEVERITY_LEVELS: readonly ["info", "ok", "marginal", "warning", "critical"];
type SunContextSeverity = (typeof SUN_CONTEXT_SEVERITY_LEVELS)[number];
/** Structured result returned by `estimateSunContextLoss`. */
interface SunContextResult {
    severity: SunContextSeverity;
    /** Human-readable explanation suitable for a banner. */
    message: string;
    /** Lowest above-horizon sun elevation (°). `null` if no positive samples. */
    minSunElevationDeg: number | null;
    minSunElevationMonth: number | null;
    minSunElevationDay: number | null;
    minSunElevationHour: number | null;
    /** Hemisphere/season/time-band label, e.g. `"Northern hemisphere, winter, late morning"`. */
    pattern: string | null;
    /** Tallest building whose full shadow fits inside `bufferM` at the worst-case elevation. */
    bufferBreakevenHeightM: number;
    /** Shadow length of a `typicalBuildingHeightM` building at worst-case elevation. */
    shadowAtTypicalBuildingM: number;
    /** Shadow length of a `maxBuildingHeightM` building. `null` if not supplied. */
    shadowAtMaxBuildingM: number | null;
}
/**
 * Approximate solar elevation in degrees.
 *
 * Uses a sinusoidal declination model
 * (`δ ≈ 23.45° · sin(360°/365 · (n − 81))`) and the standard altitude
 * formula. Equation-of-time and atmospheric refraction are intentionally
 * not modelled — accuracy is well within the ~5° tolerance required for
 * a pre-flight gate.
 */
declare function solarElevationDeg(latDeg: number, dayOfYear: number, solarHour: number): number;
/**
 * Geometric buffer needed for a single building's full shadow to fit.
 * Returns `Infinity` for non-positive sun elevations.
 */
declare function requiredBufferM(buildingHeightM: number, sunElevationDeg: number): number;
interface SunContextInput {
    /** Polygon centroid latitude (°). Drives sun-angle math. */
    lat: number;
    /** Polygon centroid longitude (°). Drives clock→solar hour correction. */
    lon?: number;
    /**
     * Locale's clock offset from UTC (hours). `undefined` approximates as
     * `round(lon / 15)` — fine for meridian-aligned zones, first-order for the rest.
     */
    timezoneOffsetH?: number;
    startMonth: number;
    startDay: number;
    startHour: number;
    endMonth: number;
    endDay: number;
    endHour: number;
    /** Effective per-cell context buffer (m). Default 77 = `SOLAR_TILING_CONFIG.contextSizeM` margin. */
    bufferM?: number;
    /** Reference building height for severity. Default 25 m (European mid-rise). */
    typicalBuildingHeightM?: number;
    /**
     * Optional worst-case height. When supplied, drives severity via
     * `breakeven / max(typical, max)` so a single tall outlier doesn't slip
     * past as `ok`.
     */
    maxBuildingHeightM?: number;
}
/**
 * Estimate whether a tile geometry-context buffer is sufficient.
 *
 * Never throws on bad input — returns `severity: "info"` with a diagnostic
 * message instead.
 */
declare function estimateSunContextLoss(input: SunContextInput): SunContextResult;
/**
 * Raised by the opt-in pre-flight gate when the configuration is unlikely
 * to produce reliable results. Only thrown when caller passes
 * `mode: "raise"` to `runPreflightSafely`.
 */
declare class PreflightWarning extends Error {
    constructor(message: string);
}

/**
 * Convert snake_case or kebab-case to camelCase.
 *
 * @param str - The snake_case or kebab-case string to convert.
 * @returns The camelCase version of the string.
 *
 * @example
 * ```ts
 * toCamelCase('first_name')     // 'firstName'
 * toCamelCase('wind-speed')     // 'windSpeed'
 * ```
 */
declare function toCamelCase(str: string): string;
/**
 * Convert camelCase or snake_case to kebab-case.
 *
 * @param str - The camelCase or snake_case string to convert.
 * @returns The kebab-case version of the string.
 *
 * @example
 * ```ts
 * toKebabCase('firstName')    // 'first-name'
 * toKebabCase('wind_speed')   // 'wind-speed'
 * ```
 */
declare function toKebabCase(str: string): string;
/**
 * Recursively convert all object keys to kebab-case for API serialization.
 *
 * @param obj - The object whose keys should be converted.
 * @returns A new object with all keys in kebab-case.
 *
 * @example
 * ```ts
 * serializeToKebab({ firstName: 'John', addressLine: '123 Main' })
 * // { 'first-name': 'John', 'address-line': '123 Main' }
 * ```
 */
declare function serializeToKebab(obj: any): any;
/**
 * Compress data using gzip and encode as base64.
 * Uses fflate (isomorphic, no node:* imports).
 *
 * @param data - The string data to compress.
 * @returns A base64-encoded gzip string.
 *
 * @example
 * ```ts
 * const compressed = gzipAndEncode('{"key":"value"}')
 * // compressed is a base64 string like "H4sIAAAA..."
 * ```
 */
declare function gzipAndEncode(data: string): string;
/**
 * Decompress base64-encoded gzip data.
 * Uses fflate (isomorphic, no node:* imports).
 *
 * @param data - The base64-encoded gzip string to decompress.
 * @returns The decompressed string.
 *
 * @example
 * ```ts
 * const original = gunzipAndDecode(gzipAndEncode('hello'))
 * // original === 'hello'
 * ```
 */
declare function gunzipAndDecode(data: string): string;
/**
 * Decompress a base64-encoded compressed file (ZIP or gzip) and extract its content.
 *
 * Decompression wire contract:
 * 1. Try ZIP (fflate unzipSync) first
 * 2. Fallback to GZIP (fflate gunzipSync)
 * 3. Decode decompressed bytes via TextDecoder (never String.fromCharCode on decompressed content)
 * 4. Parse as JSON; if result is a bare array, wrap as { output: array }
 *
 * @param base64String - Base64-encoded compressed data
 * @param fn - Optional transform function applied to the decoded string
 * @returns Parsed JSON content or transformed content if fn is provided
 */
declare function decompressString<T>(base64String: string, fn?: (s: string) => T): T;
/**
 * Create TimePeriod from TimeFilters object.
 *
 * Mirrors Python SDK's `TimePeriod` model: inclusive start + end with
 * individual month/day/hour fields, serialized to `time-period: { start-month,
 * start-day, start-hour, end-month, end-day, end-hour }` on the wire.
 *
 * The optional `filter.day` / `filter.hour` overrides on the input narrow the
 * window further; if absent, the period's start/end values are used directly.
 *
 * @example
 * ```ts
 * createTimePeriodFromFilters({
 *   period: {
 *     start: { month: 6, day: 1, hour: 8 },
 *     end:   { month: 9, day: 30, hour: 18 },
 *   },
 * })
 * // { startMonth: 6, startDay: 1, startHour: 8, endMonth: 9, endDay: 30, endHour: 18 }
 * ```
 */
declare function createTimePeriodFromFilters(timeFilters: TimeFilters): TimePeriod;

/**
 * Runtime SDK version. Mirrors Python's `infrared_sdk.__version__`.
 * Bumped by release-please via the block-style marker below; the lockstep
 * guard (`bun run check:version`) verifies this matches `package.json#version`.
 */
declare const VERSION = "0.12.3";

export { AnalysesName, type AreaBuildings, type AreaGroundMaterials, AreaPreview, AreaPreviewWithPricing, AreaResult, AreaSchedule, AreaState, type AreaVegetation, AuthResolver, type BuildingCoordinates, type BuildingOptimizations, type BuildingSize, type BuildingsConfig, type BuildingsRequest, type BuildingsResponse, type BuildingsResponseData, BuildingsService, type BuildingsServiceConfig, type CleanV3Params, DotBimMesh$1 as DotBimMesh, type FeatureCollection, type GeoJsonFeatureCollection, type GroundMaterialCleaner, GroundMaterialsService, type GroundMaterialsServiceConfig, HttpClient, type HttpClientConfig, type HttpInterceptors, IAnalysisService, IBillingService, type IBuildingsService, type IGroundMaterialsService, IJobsService, type IVegetationService, IWeatherService, IWebhooksService, InferAnalysisResponse, InfraredClient, type InfraredClientConfig, type InfraredEnvBindings, Job, LocalCleaner, Logger, type MaterialLayers, type OutputFormat, PreflightWarning, RemoteCleaner, type RequestConfig, SUN_CONTEXT_SEVERITY_LEVELS, type SunContextInput, type SunContextResult, type SunContextSeverity, TimeFilters, TimePeriod, VERSION, type DotBimMesh as VegetationDotBimMesh, VegetationService, type VegetationServiceConfig, bboxFromPoint, cleanV3Local, createTimePeriodFromFilters, decompressString, estimateSunContextLoss, gunzipAndDecode, gzipAndEncode, mergeBuildings, requiredBufferM, serializeToKebab, solarElevationDeg, toCamelCase, toKebabCase };
