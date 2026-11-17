/**
 * The ONE Node implementation of this package (infrared-core#683).
 *
 * `scripts/build.mjs` bundles this file to `dist/node-runtime.cjs`. Every
 * Node entry point is a thin wrapper over that one file:
 *
 * - `dist/index.cjs` (root, `require`) re-exports `root`;
 * - `dist/node.js` (root, `import`) re-exports `root` through `index.cjs`;
 * - `dist/node-tiling.js`, `node-geodata.js`, `node-utilities.js`,
 *   `node-billing.js` and `node-worker.js` (the ESM subpaths) re-export
 *   their namespace below. The worker subpath in Node can load the packaged
 *   threaded core (`createWorkerClient({ threads })`).
 *
 * So a Node process has one module graph, one kernel core and one class
 * object per name, whatever mix of `require` and `import` it uses. Before
 * this, the root resolved to a CommonJS bundle and each subpath to the ESM
 * build: two cores, and `initializeCore()` on one did not prepare the other.
 * This is the "ES module wrapper" approach of the Node documentation
 * (Packages, "Dual package hazard").
 *
 * Browsers do not load this file. They resolve the `import` condition, one
 * ESM graph, and are not changed.
 */
import * as root from "./node.js";
import * as geodataEntry from "./geodata/index.js";
import * as workerEntry from "./worker/index.js";
export { root };
export declare const tiling: Readonly<{
    initializeCore: typeof root.initializeCore;
    CoreInitializationError: typeof root.CoreInitializationError;
    CoreNotReadyError: typeof root.CoreNotReadyError;
    CoreTerminalError: typeof root.CoreTerminalError;
    composeTilePayloads: typeof root.composeTilePayloads;
    CELL_SIZE_M: 1;
    TILE_SIZE_CELLS: number;
    TILE_SIZE_M: 512;
    generateTilesForPolygon: typeof root.generateTilesForPolygon;
    getTilingConfig: typeof root.getTilingConfig;
    validatePolygon: typeof root.validatePolygon;
    prepareAnalysisPayload: typeof root.prepareAnalysisPayload;
    prepareAreaPayload: typeof root.prepareAnalysisPayload;
    PHYSICS_TIERS: readonly ["v1", "detail", "advanced", "advanced-moist"];
    THERMAL_CONTROLS: readonly ["physics", "wallAlbedo", "wallAbsorptivity", "canopyTransmissivity", "groundAlbedo", "groundDtMax"];
    checkAreaState: typeof root.checkAreaState;
    areaScheduleFromJSON: typeof root.areaScheduleFromJSON;
    areaScheduleToJSON: typeof root.areaScheduleToJSON;
    computeAreaState: typeof root.computeAreaState;
    freezeAreaSchedule: typeof root.freezeAreaSchedule;
    AreaGeometryProbeError: typeof root.AreaGeometryProbeError;
    AreaGeometryReferenceError: typeof root.AreaGeometryReferenceError;
    runArea: typeof root.runArea;
    submitAreaPlan: typeof root.submitAreaPlan;
    previewAreaBatches: typeof root.previewAreaBatches;
    freePreparedSites: typeof root.freePreparedSites;
    ConfigHashPolicyError: typeof root.ConfigHashPolicyError;
    FacadeCountContractError: typeof root.FacadeCountContractError;
    mergeAreaJobs: typeof root.mergeAreaJobs;
    mergeSurfaceAreaJobs: typeof root.mergeSurfaceAreaJobs;
    areaGridHasValue: typeof root.areaGridHasValue;
    areaGridValuesF32: typeof root.areaGridValuesF32;
    SCHEDULE_CONTRACT_VERSION: 13;
    WeatherIdentityError: typeof root.WeatherIdentityError;
    TILE_FAILURE_KINDS: readonly ["send_refused", "host_refused", "rate_limited", "payment_required", "uncertain", "server_failed", "download_failed", "timeout"];
    TileFailurePhase: {
        readonly Submit: "submit";
        readonly Compute: "compute";
        readonly Download: "download";
        readonly Skipped: "skipped";
    };
}>;
export declare const geodata: Readonly<{
    initializeCore: typeof root.initializeCore;
    CoreInitializationError: typeof root.CoreInitializationError;
    CoreNotReadyError: typeof root.CoreNotReadyError;
    CoreTerminalError: typeof root.CoreTerminalError;
    ALLOWED_HOSTS: readonly string[];
    assertAllowedUrl: typeof geodataEntry.assertAllowedUrl;
    GEO_BASE_URL: "https://geo.infrared.city";
    geoUrlFor: typeof geodataEntry.geoUrlFor;
    isAllowedUrl: typeof geodataEntry.isAllowedUrl;
    GeodataDependencyError: typeof root.GeodataDependencyError;
    GeodataError: typeof root.GeodataError;
    GeodataFetchError: typeof root.GeodataFetchError;
    GeodataRangeError: typeof root.GeodataRangeError;
    HostNotAllowedError: typeof root.HostNotAllowedError;
    OvertureFileLimitError: typeof root.OvertureFileLimitError;
    OvertureReadTooLargeError: typeof root.OvertureReadTooLargeError;
    SiteReadError: typeof root.SiteReadError;
    bboxIntersects: typeof geodataEntry.bboxIntersects;
    DATA_USER_AGENT: "infrared-sdk-ts/1.1.0";
    DEFAULT_PUBLIC_TIMEOUT_MS: 180000;
    fetchPublicBytes: typeof geodataEntry.fetchPublicBytes;
    fetchPublicJson: typeof geodataEntry.fetchPublicJson;
    fetchPublicText: typeof geodataEntry.fetchPublicText;
    MAX_JSON_BYTES: number;
    pointToBbox: typeof geodataEntry.pointToBbox;
    groundReadDistanceM: typeof root.groundReadDistanceM;
    readMarginM: typeof root.readMarginM;
    ReadMarginError: typeof root.ReadMarginError;
    requiredMarginM: typeof root.requiredMarginM;
    resolveReadAnalysisType: typeof root.resolveReadAnalysisType;
    WIDEST_READ_ANALYSIS_TYPE: "solar-radiation";
    bytesRangeTransport: typeof geodataEntry.bytesRangeTransport;
    httpRangeTransport: typeof geodataEntry.httpRangeTransport;
    featureCollectionJson: typeof geodataEntry.featureCollectionJson;
    featuresArrayText: typeof geodataEntry.featuresArrayText;
    jsonArrayOf: typeof geodataEntry.jsonArrayOf;
    jsonObjectOf: typeof geodataEntry.jsonObjectOf;
    requireFeatureCollection: typeof geodataEntry.requireFeatureCollection;
    requireJsonArray: typeof geodataEntry.requireJsonArray;
    spliceJsonArrays: typeof geodataEntry.spliceJsonArrays;
    clearManifestCaches: typeof geodataEntry.clearManifestCaches;
    fetchOvertureManifest: typeof geodataEntry.fetchOvertureManifest;
    fetchSources: typeof geodataEntry.fetchSources;
    INDEXED_COLLECTIONS: readonly string[];
    resolveOverlayCity: typeof geodataEntry.resolveOverlayCity;
    selectOvertureFiles: typeof geodataEntry.selectOvertureFiles;
    SOURCES_TTL_MS: 300000;
    clearFgbCache: typeof geodataEntry.clearFgbCache;
    readFgbBbox: typeof geodataEntry.readFgbBbox;
    readFgbBboxJson: typeof geodataEntry.readFgbBboxJson;
    readFgbBytes: typeof geodataEntry.readFgbBytes;
    HEADER_PREFIX_BYTES: 8192;
    KERNEL_FGB_EXPORTS: Readonly<{
        layout: "fgbLayout";
        indexSearchStep: "fgbIndexSearchStep";
        decodeRangeFeatures: "fgbDecodeRangeFeatures";
    }>;
    COLUMNS_BY_COLLECTION: Readonly<Record<string, readonly string[]>>;
    LAND_COVER_MIN_MAX_ZOOM: 8;
    overtureReaderAvailable: typeof geodataEntry.overtureReaderAvailable;
    planRowGroups: typeof geodataEntry.planRowGroups;
    readOvertureCollection: typeof geodataEntry.readOvertureCollection;
    readOvertureCollectionJson: typeof geodataEntry.readOvertureCollectionJson;
    requireOvertureReader: typeof geodataEntry.requireOvertureReader;
    clearOvertureMetadataCache: typeof geodataEntry.clearOvertureMetadataCache;
    acquireTrees: typeof geodataEntry.acquireTrees;
    acquireTreesJson: typeof geodataEntry.acquireTreesJson;
    DEDUP_RADIUS_M: 2;
    treesFeatureCollection: typeof geodataEntry.treesFeatureCollection;
    TREES_URL: "https://geo.infrared.city/trees-world.fgb";
    acquireGroundMaterials: typeof geodataEntry.acquireGroundMaterials;
    acquireGroundMaterialsJson: typeof geodataEntry.acquireGroundMaterialsJson;
    GROUND_COLLECTIONS: readonly string[];
    roadsToIrFeatures: typeof geodataEntry.roadsToIrFeatures;
    ROADS_URL: "https://geo.infrared.city/roads-surface-world.fgb";
    acquireGroundMaterialsArea: typeof geodataEntry.acquireGroundMaterialsArea;
    acquireBuildings: typeof geodataEntry.acquireBuildings;
    acquireBuildingsJson: typeof geodataEntry.acquireBuildingsJson;
    acquireBuildingsArea: typeof geodataEntry.acquireBuildingsArea;
    decompose: typeof geodataEntry.decompose;
    namePieces: typeof geodataEntry.namePieces;
    SITE_CHUNKS_IN_FLIGHT: 2;
    siteChunks: typeof geodataEntry.siteChunks;
    siteRectangle: typeof geodataEntry.siteRectangle;
    bboxAreaM2: typeof geodataEntry.bboxAreaM2;
    MAX_SLAB_TOLERANCE_DEG: 0.0001;
    SLAB_TOLERANCE_FACTOR: 2;
    slabToleranceDeg: typeof geodataEntry.slabToleranceDeg;
    unionAreaM2: typeof geodataEntry.unionAreaM2;
}>;
export declare const utilities: Readonly<{
    CATALOG_TTL_MS: 300000;
    clearWeatherCatalogCache: typeof root.clearWeatherCatalogCache;
    DEFAULT_STATIC_BASE_URL: "https://geo.infrared.city/weather";
    MAX_STATIC_BYTES: number;
    StaticWeatherReader: typeof root.StaticWeatherReader;
    WeatherService: typeof root.WeatherService;
    WeatherServiceError: typeof root.WeatherServiceError;
}>;
export declare const billing: Readonly<{
    resolveBracketName(pricing: root.PublicPricing, areaKm2: number): string | null;
    estimateWorkflowRunTokens(pricing: root.PublicPricing, workflowId: string, areaKm2: number): {
        readonly tokens: number;
        readonly bracket: string;
    } | null;
    PricingUnavailableError: typeof root.PricingUnavailableError;
    resolveTokensPerJob: typeof root.resolveTokensPerJob;
    BillingService: typeof root.BillingService;
}>;
export declare const worker: Readonly<{
    serveSdkWorker: typeof workerEntry.serveSdkWorker;
    createWorkerClient: typeof workerEntry.createWorkerClient;
    WorkerLostError: typeof workerEntry.WorkerLostError;
    FacadeLayout: typeof root.FacadeLayout;
    synthesizeFacadeLayout: typeof root.synthesizeFacadeLayout;
    attachValues: typeof root.attachValues;
}>;
