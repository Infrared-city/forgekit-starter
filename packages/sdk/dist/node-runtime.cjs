const import_meta_url = require("node:url").pathToFileURL(__filename).href;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/internal/node-loader.ts
var node_loader_exports = {};
__export(node_loader_exports, {
  packagedCoreBytes: () => packagedCoreBytes
});
async function packagedCoreBytes(path = new URL("../../generated/infrared-core_bg.wasm", import_meta_url)) {
  const file = await (0, import_promises.readFile)(path);
  const bytes = new Uint8Array(file.byteLength);
  bytes.set(file);
  return bytes;
}
var import_promises;
var init_node_loader = __esm({
  "src/internal/node-loader.ts"() {
    "use strict";
    import_promises = require("node:fs/promises");
  }
});

// src/node-runtime.ts
var node_runtime_exports = {};
__export(node_runtime_exports, {
  billing: () => billing,
  geodata: () => geodata,
  root: () => node_exports,
  tiling: () => tiling,
  utilities: () => utilities,
  worker: () => worker
});
module.exports = __toCommonJS(node_runtime_exports);

// src/node.ts
var node_exports = {};
__export(node_exports, {
  AnalysesName: () => AnalysesName,
  AnalysisPartsError: () => AnalysisPartsError,
  AnalysisService: () => AnalysisService,
  AreaGeometryProbeError: () => AreaGeometryProbeError,
  AreaGeometryReferenceError: () => AreaGeometryReferenceError,
  AreaRunError: () => AreaRunError,
  AreaTimeoutError: () => AreaTimeoutError,
  BillingService: () => BillingService,
  BuildingsService: () => BuildingsService,
  CATALOG_TTL_MS: () => CATALOG_TTL_MS,
  CELL_SIZE_M: () => CELL_SIZE_M,
  ConfigHashPolicyError: () => ConfigHashPolicyError,
  CoreInitializationError: () => CoreInitializationError,
  CoreNotReadyError: () => CoreNotReadyError,
  CoreTerminalError: () => CoreTerminalError,
  CoreVersionSkewError: () => CoreVersionSkewError,
  DEFAULT_DAYLIGHT_RESULT_FORMAT: () => DEFAULT_DAYLIGHT_RESULT_FORMAT,
  DEFAULT_MAX_LONG_AXIS_PX: () => DEFAULT_MAX_LONG_AXIS_PX,
  DEFAULT_STATIC_BASE_URL: () => DEFAULT_STATIC_BASE_URL,
  DaylightFactorResult: () => DaylightFactorResult,
  EpwParseError: () => EpwParseError,
  FacadeArtifactMismatchError: () => FacadeArtifactMismatchError,
  FacadeCountContractError: () => FacadeCountContractError,
  FacadeLayout: () => FacadeLayout,
  GeodataDependencyError: () => GeodataDependencyError,
  GeodataError: () => GeodataError,
  GeodataFetchError: () => GeodataFetchError,
  GeodataRangeError: () => GeodataRangeError,
  GeometryReferenceAcknowledgementError: () => GeometryReferenceAcknowledgementError,
  GeometryReferenceSubmissionError: () => GeometryReferenceSubmissionError,
  GridImageError: () => GridImageError,
  GroundMaterialsService: () => GroundMaterialsService,
  HostNotAllowedError: () => HostNotAllowedError,
  InfraredClient: () => InfraredClient,
  InvalidOptionError: () => InvalidOptionError,
  JobAbortedError: () => JobAbortedError,
  JobFailedError: () => JobFailedError,
  JobNotCompletedError: () => JobNotCompletedError,
  JobPollError: () => JobPollError,
  JobStatus: () => JobStatus,
  JobTimeoutError: () => JobTimeoutError,
  JobsService: () => JobsService,
  LocalCleaner: () => LocalCleaner,
  MAX_REGISTRY_BYTES: () => MAX_REGISTRY_BYTES,
  MAX_STATIC_BYTES: () => MAX_STATIC_BYTES,
  NO_ROOM: () => NO_ROOM,
  OvertureFileLimitError: () => OvertureFileLimitError,
  OvertureReadTooLargeError: () => OvertureReadTooLargeError,
  PHYSICS_TIERS: () => PHYSICS_TIERS,
  PartsTimeoutError: () => PartsTimeoutError,
  PricingUnavailableError: () => PricingUnavailableError,
  REGISTRY_URL: () => REGISTRY_URL,
  ReadMarginError: () => ReadMarginError,
  RegistryFetchError: () => RegistryFetchError,
  SCHEDULE_CONTRACT_VERSION: () => SCHEDULE_CONTRACT_VERSION,
  SiteReadError: () => SiteReadError,
  StaticWeatherReader: () => StaticWeatherReader,
  SubmissionUncertainError: () => SubmissionUncertainError,
  THERMAL_CONTROLS: () => THERMAL_CONTROLS,
  TILE_FAILURE_KINDS: () => TILE_FAILURE_KINDS,
  TILE_SIZE_CELLS: () => TILE_SIZE_CELLS,
  TILE_SIZE_M: () => TILE_SIZE_M,
  TILING_SUPPORTED_TYPES: () => TILING_SUPPORTED_TYPES,
  TileFailurePhase: () => TileFailurePhase,
  VERSION: () => VERSION,
  VegetationMeshError: () => VegetationMeshError,
  VegetationService: () => VegetationService,
  WEATHER_BEARING_ANALYSES: () => WEATHER_BEARING_ANALYSES,
  WIDEST_READ_ANALYSIS_TYPE: () => WIDEST_READ_ANALYSIS_TYPE,
  WIND_ANALYSIS_TYPES: () => WIND_ANALYSIS_TYPES,
  WeatherDocument: () => WeatherDocument,
  WeatherIdentityError: () => WeatherIdentityError,
  WeatherModelInputsError: () => WeatherModelInputsError,
  WeatherService: () => WeatherService,
  WeatherServiceError: () => WeatherServiceError,
  areaGridHasValue: () => areaGridHasValue,
  areaGridValuesF32: () => areaGridValuesF32,
  areaScheduleFromJSON: () => areaScheduleFromJSON,
  areaScheduleToJSON: () => areaScheduleToJSON,
  attachValues: () => attachValues,
  buildAuthResolver: () => buildAuthResolver,
  checkAreaState: () => checkAreaState,
  cleanMesh: () => cleanMesh,
  cleanV3Local: () => cleanV3Local,
  clearRegistryCache: () => clearRegistryCache,
  clearWeatherCatalogCache: () => clearWeatherCatalogCache,
  composeTilePayloads: () => composeTilePayloads,
  computeAreaState: () => computeAreaState,
  consoleLogger: () => consoleLogger,
  convertPointsToMeshesLocal: () => convertPointsToMeshesLocal,
  coreVersion: () => coreVersion,
  decompressResultArchive: () => decompressResultArchive,
  decompressResultValue: () => decompressResultValue,
  deserializeToCamelCase: () => deserializeToCamelCase,
  estimateWorkflowRunTokens: () => estimateWorkflowRunTokens,
  exportMeshes: () => exportMeshes,
  fetchVisualConfigurations: () => fetchVisualConfigurations,
  flattenVisualConfigs: () => flattenVisualConfigs,
  freePreparedSites: () => freePreparedSites,
  freezeAreaSchedule: () => freezeAreaSchedule,
  generateTilesForPolygon: () => generateTilesForPolygon,
  geojsonLayersToDotbim: () => geojsonLayersToDotbim,
  getTilingConfig: () => getTilingConfig,
  gridImageSize: () => gridImageSize,
  groundReadDistanceM: () => groundReadDistanceM,
  initializeCore: () => initializeCore2,
  isVertical: () => isVertical,
  jobFromResponse: () => jobFromResponse,
  legendRange: () => legendRange,
  mergeAreaJobs: () => mergeAreaJobs,
  mergeSurfaceAreaJobs: () => mergeSurfaceAreaJobs,
  normalizeGrid: () => normalizeGrid,
  packMesh: () => packMesh,
  parseEpw: () => parseEpw,
  parseJobStatus: () => parseJobStatus,
  parseResultArchive: () => parseResultArchive,
  parseSurfaceResult: () => parseSurfaceResult,
  prepareAnalysisPayload: () => prepareAnalysisPayload,
  prepareAreaPayload: () => prepareAreaPayload,
  preparedWeatherIdentity: () => preparedWeatherIdentity,
  previewAreaBatches: () => previewAreaBatches,
  readMarginM: () => readMarginM,
  registryFixedRange: () => registryFixedRange,
  renderGridPng: () => renderGridPng,
  requiredMarginM: () => requiredMarginM,
  resolveBracketName: () => resolveBracketName,
  resolveReadAnalysisType: () => resolveReadAnalysisType,
  resolveTokensPerJob: () => resolveTokensPerJob,
  resolveVisualConfig: () => resolveVisualConfig,
  retryPolicy: () => retryPolicy,
  runArea: () => runArea,
  serializeToKebab: () => serializeToKebab,
  setOwnKey: () => setOwnKey,
  sharedLegendRange: () => sharedLegendRange,
  silentLogger: () => silentLogger,
  simplifyMeshes: () => simplifyMeshes,
  submitAreaPlan: () => submitAreaPlan,
  surfaceColumnsFromBytes: () => surfaceColumnsFromBytes,
  surfaceColumnsToBytes: () => surfaceColumnsToBytes,
  surfaceHasValue: () => surfaceHasValue,
  surfaceId: () => surfaceId,
  surfaceIndex: () => surfaceIndex,
  surfaceRenderBuffers: () => surfaceRenderBuffers,
  surfaceValuesF32: () => surfaceValuesF32,
  synthesizeFacadeLayout: () => synthesizeFacadeLayout,
  toCamelCase: () => toCamelCase,
  toKebabCase: () => toKebabCase,
  validatePolygon: () => validatePolygon,
  vegetationRegistryDocument: () => vegetationRegistryDocument,
  vertexValues: () => vertexValues,
  weldMeshes: () => weldMeshes,
  windClassOrdinals: () => windClassOrdinals
});

// src/internal/node-digest.ts
var import_node_crypto = require("node:crypto");

// src/internal/geometry-reuse/canonical.ts
var INVALID = Symbol("invalid JSON value");
var MAX_DEPTH = 512;
function plainObject(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function own(target, key, value) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}
function canonicalValue(value, ancestors, depth) {
  if (depth > MAX_DEPTH) return INVALID;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : INVALID;
  if (typeof value !== "object") return INVALID;
  if (ancestors.has(value)) return INVALID;
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const output2 = [];
      for (const item of value) {
        const canonical = canonicalValue(item, ancestors, depth + 1);
        if (canonical === INVALID) return INVALID;
        output2.push(canonical);
      }
      return output2;
    }
    if (!plainObject(value)) return INVALID;
    const output = {};
    for (const key of Object.keys(value).sort()) {
      const canonical = canonicalValue(value[key], ancestors, depth + 1);
      if (canonical === INVALID) return INVALID;
      own(output, key, canonical);
    }
    return output;
  } finally {
    ancestors.delete(value);
  }
}
function canonicalSnapshot(value) {
  try {
    const canonical = canonicalValue(value, /* @__PURE__ */ new WeakSet(), 0);
    if (canonical === INVALID) return void 0;
    const text = JSON.stringify(canonical);
    return text === void 0 ? void 0 : {
      value: canonical,
      bytes: new TextEncoder().encode(text)
    };
  } catch {
    return void 0;
  }
}
function canonicalJsonBytes(value) {
  return canonicalSnapshot(value)?.bytes;
}
var sha256Native;
function setSha256Native(value) {
  sha256Native = value;
}
async function sha256Hex(bytes) {
  return sha256HexParts([bytes]);
}
async function sha256HexParts(parts) {
  if (sha256Native !== void 0) {
    try {
      return sha256Native(parts);
    } catch {
      return void 0;
    }
  }
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.subtle === void 0) return void 0;
  try {
    const owned = parts.length === 1 ? parts[0].slice() : joinParts(parts);
    const digest = await cryptoApi.subtle.digest("SHA-256", owned);
    return Array.from(new Uint8Array(digest), (item) => item.toString(16).padStart(2, "0")).join("");
  } catch {
    return void 0;
  }
}
function joinParts(parts) {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

// src/internal/node-digest.ts
setSha256Native((parts) => {
  const hash = (0, import_node_crypto.createHash)("sha256");
  for (const part of parts) hash.update(part);
  return hash.digest("hex");
});

// src/node.ts
var import_node_os = require("node:os");

// src/internal/errors.ts
function detectCoreRealm() {
  const scope = globalThis;
  if (typeof scope.WorkerGlobalScope === "function" && globalThis instanceof scope.WorkerGlobalScope) {
    return "Web Worker";
  }
  if (typeof scope.process?.versions?.node === "string") return "Node";
  return "main thread";
}
function coreNotStartedMessage(realm, method) {
  return `The Infrared core is not started in this ${realm}. Call \`await initializeCore()\` in this ${realm} before \`${method ?? "any core function"}\`. Each Web Worker needs its own call.`;
}
var CoreNotReadyError = class extends Error {
  name = "CoreNotReadyError";
  /** The JavaScript realm that has no started core. */
  realm;
  /** The public function that needed the core, when the caller knows it. */
  method;
  constructor(method) {
    const realm = detectCoreRealm();
    super(coreNotStartedMessage(realm, method));
    this.realm = realm;
    this.method = method;
  }
};
var CoreInitializationError = class extends Error {
  name = "CoreInitializationError";
};
var CoreTerminalError = class extends CoreInitializationError {
  terminal = true;
};
var CoreVersionSkewError = class extends Error {
  name = "CoreVersionSkewError";
  constructor(missing) {
    super(
      `the Infrared core is initialized but lacks ${missing.join(", ")} \u2014 version skew, not a missing install`
    );
  }
};

// src/internal/core-exports.ts
var REQUIRED_FUNCTION_EXPORTS = [
  "coreVersion",
  // The bundled kernel's roof-gate version (infrared-core #674): every
  // surface request names it, so the worker runs the gate this SDK was
  // tested against instead of guessing from an absent field.
  "surfgridVersion",
  "geometryGroups",
  // D293: the context options as the site key names them.
  "contextKey",
  // Geometry schema 2 (D206): the body fields the geometry document carries,
  // the schema this kernel writes, and the one per-job sensor budget.
  "binaryGeometryFields",
  "hostRetryWaitSeconds",
  "rangeReadStep",
  "geometrySchemaVersion",
  "maxSensorsPerJob",
  "geometryGroupHash",
  // The schedule identity (audit M8b, D81): sha256 of the canonical config
  // JSON (sorted keys, 6dp half-away rounding, integral collapse). Replaces
  // this package's own `bankersRound6` fold.
  "configHash",
  // The v2 schedule identity (#679): the kernel picks the fields from the
  // field registry; the host builds the control body and the group hashes.
  "configHashV2",
  "configGroupHash",
  // Hashes over buffers (no JSON): a mesh group, the site key, the buildings
  // fingerprint fold, a terrain document's content key.
  "configGroupHashBuffers",
  "siteKey",
  "foldBuildingsFingerprint",
  "terrainContentKey",
  "energyBalanceYear",
  // Rules that were host copies: which models may take a terrain hash from a
  // `SiteTerrain` handle, and the `as-is` default for a supplied scene.
  "inertKeys",
  "terrainHandleHashApplies",
  "resolveTerrainAlignment",
  // The tree z warning of an "as-is" run on terrain (#980).
  "treeZWarning",
  "fieldRegistryJson",
  // D91: the wind family's datum — every supplied mesh's own lowest point to
  // z = 0, one pass over the packed site at the plan seam.
  "dropToGrade",
  "planGeometryReuse",
  "verifyGeometryAck",
  "getTilingConfig",
  "validatePolygon",
  "generateTilesForPolygon",
  // The SITE (D84, D90, WS2) and the ARENA (D98): membership, ownership and
  // every tile's finished group bodies with their reuse identities, for the
  // whole grid, from ONE copy of the site the kernel reads and keeps. The
  // kernel's `composeTilePayloads` driver is no longer called from this
  // package. A `#[wasm_bindgen]` CLASS appears in the instance as its
  // methods, so the class name itself is not listable here —
  // `tests/required-exports.wasm.test.ts` maps it onto these.
  "__wbg_site_free",
  "site_new",
  // D200: the site's terrain read once per content, and the site built on it.
  "__wbg_siteterrain_free",
  "siteterrain_new",
  "siteterrain_groupHash",
  "site_withTerrain",
  "site_allTileIds",
  "site_bodies",
  // D101: every tile's IRBF artifact from the same site, and one body's for
  // the direct `submit` path — the kernel packs, frames, zips and digests.
  "site_artifactsStart",
  "site_artifactsEnd",
  "geometryArtifact",
  // The facade batches, planned from the same kept site, and every batch's
  // selected body, capture and artifact (D156: its targets, the rest as
  // context) from one call per tile, as the Python host does
  // (`area/site-facade.ts`, WP3).
  "site_facadeBatchesStart",
  "site_facadeBatchesEnd",
  "site_facadeFramesStart",
  "site_facadeFramesEnd",
  "site_facadeScenesStart",
  "site_facadeScenesEnd",
  // A facade job's capture, put straight into the client's store (D-2026101110-iris-nectar-maple).
  "site_facadeCapturesStart",
  "site_facadeCapturesEnd",
  // The facade analyses of one stream share each tile's parts (`area/stream.ts`).
  "site_shareFacadeParts",
  "site_checkTerrain",
  "site_identity",
  // `splitFacadeCoreContext` and its report twin are NOT here: the kernel
  // `Site` plans every facade job (`site_facadeBatchesStart`), so this package
  // calls neither. The kernel still exports both.
  // `partitionFacadeCoreContext` and its `...F64` twin are NOT here: the site
  // pass answers `core`, the shrink band, the demoted ids and `unowned` for the
  // whole grid in one call, so this package no longer asks per tile (D90). The
  // kernel still exports both, for a caller composing tiles itself.
  // D158: the cap's one validation rule, checked before any planning (a fresh
  // run or a retry, D300). The exact planner itself runs inside
  // `site_facadeBatchesStart`; the kernel still exports
  // `planExactSurfaceBatchesCapped` for a caller composing tiles.
  "checkSensorCap",
  // D300: rules both hosts kept their own copy of -- the terrain margin, the
  // Overture byte cap, the final error of a run and of an engine stop, the
  // time window, the catalog weather columns, the pinned surface fields and
  // the price of a run (list URL, price per job, estimate, price source).
  "terrainMargin",
  "overturePlannedBytesLimit",
  "areaFinalError",
  "engineStop",
  "apiKeyRefusedMessage",
  "validateTimeWindow",
  "weatherColumns",
  "surfaceWireFields",
  "pricingUrl",
  "tokensPerJob",
  "areaEstimate",
  "priceSource",
  // D160: four small rules this package used to restate, now asked of the
  // kernel as the Python host does — which analyses get the tile location,
  // the Overture bbox membership, the terrain triangle cap, and the polygon
  // frame origin.
  "tileLocationApplies",
  "bboxMeetsRows",
  "terrainTriangleCap",
  "scalarPolygonOriginF64",
  "projectPolygonToMeters",
  // The tile south-west corner's own (lon, lat) (infrared-core#725): the
  // same kernel call `scalarSiteToTileAffine` composes internally, reused by
  // `area/facade-layout-schedule.ts` to derive a saved schedule's per-job
  // `tileOrigin` without restating that math host-side.
  "scalarUnproject",
  // The area GRID merge (D273): one kernel merger per run places, blends and
  // clips every tile, in the wire dtype; the archives of one turn decode in
  // ONE call (`decodeGridTilesStart`, D299). A class appears as its methods (see
  // the SITE note above).
  "decodeGridTilesStart",
  "decodeGridTilesEnd",
  "__wbg_gridtiles_free",
  "__wbg_areagridmerger_free",
  "areagridmerger_new",
  "areagridmerger_pushMany",
  "areagridmerger_finish",
  // The run engine: every send, poll, download and hand-over decision of a
  // stream run (`area/run-engine.ts`; a class: its methods).
  "__wbg_runengine_free",
  "runengine_new",
  "runengine_step",
  "runengine_facts",
  // The wait for ONE job (`JobWait`): the host does the GET and the sleep.
  "__wbg_jobwait_free",
  "jobwait_new",
  "jobwait_next",
  "groundCleanV3",
  // Flat GeoJSON layer tessellation (`geojsonLayersToDotbim`, #985).
  "geojsonLayersToDotbim",
  "gridToPng",
  "packedIndexCount",
  "tileFrameOrigin",
  "tileSwOffset",
  // Facade "pretty mode" (ADR 0008, D88): the SDK draws the per-cell render
  // geometry with the kernel it already bundles instead of downloading 12.6x
  // the body from the server. The area merge synthesizes inside the one-call
  // join (`SurfaceJoinStream.finish`, below).
  "synthesizeSurfaces",
  // Offline facade layout rebuild + compact export (#707, D252/D254). Both
  // calls return a `FacadeLayoutHandle` that holds the rebuilt/reloaded
  // layout: `.fields()` reads it (a caller that only wants to SHOW a layout
  // never pays for compression), `.toBytes()` exports THAT SAME held layout
  // -- never a second synthesis pass (issue #707 "toBytes() crash", D254).
  "synthesizeFacadeLayoutHandle",
  "facadeLayoutFromBytes",
  // The public mesh utility `cleanMesh` (#555, D208).
  "cleanMesh",
  // The context-mesh utilities `weldMeshes`, `simplifyMeshes` and
  // `exportMeshes` (D294).
  "weldMeshes",
  "simplifyMeshes",
  "exportMeshes",
  // The exact per-tile re-anchor. It replaced the constant-offset loop the
  // host used to run per mesh (D48), which is why `transformBuildingCoords`
  // is no longer on this list: the kernel still exports it, both bindings
  // still ship it, and nothing in this package calls it any more.
  "frameReanchorBytes",
  "vegetationRegistryDocument",
  // The rectangle-union decomposition every site-chunk / building-extrude
  // compose calls (D57 / rect-union kernel port): `chunk ∩ union(tile
  // rectangles)`, replacing this package's own `geodata/rect-union.ts`.
  "rectUnionDecompose",
  "siteChunks",
  "siteFrameWarnings",
  // Daylight-factor floor parts (`parts/`, D221): plan, part body, join.
  "daylightParts",
  "daylightPartBody",
  "daylightMerge",
  "interiorArtifact",
  // The binary daylight-factor result (family 7, D232): views, binary join,
  // JSON projection both ways.
  "decodeDaylightResult",
  "daylightMergeBinary",
  "daylightJsonFromFrame",
  "daylightFrameFromJson",
  // The same port's tolerance export, called by the public
  // `slabToleranceDeg` measurement helper (`geodata/rect-union-metrics.ts`).
  "rectUnionSlabToleranceDeg",
  // The default transport (D196); the send budget (#556); the poll schedule (D213).
  "defaultTransport",
  "sendBudgetSeconds",
  "sendStallSeconds",
  "pollDefaultTimeoutSeconds",
  // The area retry plan and its idempotency key (D224). See `area/retry-plan.ts`.
  "areaIdempotencyKey",
  "planAreaRetry",
  // The run engine's retry limits, read-only (issue #873). See `area/run-engine.ts`.
  "retryPolicy",
  "windClassOrdinals",
  "overlayAoiIntersectsPolygon",
  "overlayBboxCandidates",
  // `mergeTileLayers` and `mergeAndCleanTileLayers` are NOT here:
  // `groundMaterialsComposeAndMergeBytes` composes, merges and cleans in one
  // call, so nothing in this SDK calls either any more (D48). The kernel still
  // exports both.
  // Direct data acquisition: the kernel is the ONLY FlatGeobuf reader and
  // the ONLY normaliser, so a build without these exports cannot serve the
  // shipped paths. Naming them here makes the mismatch one loud failure at
  // initialization instead of a per-path probe that silently picks older
  // semantics.
  "fgbLayout",
  "fgbIndexSearchStep",
  "fgbDecodeRangeFeatures",
  "treesNormalize",
  "dedupTrees",
  "dedupVegetationFeatures",
  "roadsNormalize",
  "groundMaterialsCompose",
  // The submission gate (WP20/D56): an unknown ground-material layer name is
  // the model's UNKNOWN material row — a job that succeeds, bills and returns
  // a wrong thermal result. The kernel owns the list of five names.
  "validateGroundLayers",
  // The site-level tiling operations (WP13), adopted by the acquisition path
  // in WP14-A: one compose+merge+clean per site, one assign+extrude per site.
  "groundMaterialsComposeAndMergeBytes",
  // The bytes twin (WP14-D): the same kernel operation, with each document
  // crossing as a `Uint8Array` instead of a JS string. The Python binding
  // has taken `str | bytes` and returned `bytes` from the start, so this is
  // a wasm idiom, not a second operation — the parity gate folds it onto
  // `buildingsAssignAndExtrude`, which is why the string form is no longer
  // listed: nothing in this package calls it.
  "buildingsAssignAndExtrudeBytes",
  "buildingsNormalize",
  // `extrudeFootprintsToDotbim` is NOT here: `buildingsAssignAndExtrude`
  // superseded it on every shipped path (D48). The kernel still exports it and
  // the frame gate still uses it as its independent reference, but this SDK
  // does not call it.
  "vegetationPointsToMeshes",
  "overtureSelectFiles",
  // Static weather: the `WeatherCatalog` handle, the pointer rule, the hour
  // filter and the row shaper behind the three public weather methods
  // (D-2026101012-heron-quartz-maple).
  "__wbg_weathercatalog_free",
  "weathercatalog_new",
  "weathercatalog_nearest",
  "weathercatalog_find",
  "weatherPointerFolder",
  "weatherFilterHours",
  "weatherRows",
  // Bring-your-own weather. A core without these cannot parse an EPW file,
  // cannot prove which weather a run used and cannot select a model's
  // arrays — each of them a shipped path, so a missing one is one loud
  // failure at initialization, not a TypeError at the call.
  "weatherParseEpw",
  "weatherIdentity",
  "weatherModelInputs",
  // The RUN identity. Without it no weather-bearing run can be resumed at
  // all: the schedule records this value for every weather source.
  "weatherRunIdentity",
  "renderGridRegistry",
  "legendRange",
  "sharedLegendRange",
  "registryFixedRange",
  "packMesh",
  // The canonical JSON writer behind every binary submission envelope. It
  // reached the kernel through a local `ReturnType<typeof requireCore> & {…}`
  // cast for months, so `initializeCore()` never checked for it and the one
  // matched-kernel list this package has was not true (ADR 0013, audit M5).
  "canonicalMetadataJson",
  "decodeBinaryResult",
  "inspectBinaryResult",
  "decodeGridDocument",
  // The area SURFACE merge (D197, D-2026101011-slate-aspen-pine): the downloads of each turn decoded in
  // ONE call (`decodeSurfaceJobsStart`, D-2026101110-iris-nectar-maple) and kept by the stream, then the whole run joined
  // into columns, triangles included (a class: its methods).
  "decodeSurfaceJobsStart",
  "decodeSurfaceJobsEnd",
  "__wbg_surfacejobs_free",
  "__wbg_surfacejoinstream_free",
  "surfacejoinstream_new",
  "surfacejoinstream_pushManyStart",
  "surfacejoinstream_pushManyEnd",
  "surfacejoinstream_finishStart",
  "surfacejoinstream_finishEnd",
  // The captures of the run, shared by its analyses (a class: its methods).
  "__wbg_capturestore_free",
  "capturestore_new",
  "capturestore_remember",
  "__wbg_capturehold_free",
  "capturehold_bind",
  "capturehold_key",
  // A single facade job (D-2026101113-spruce-hazel-bison): its capture and its per-cell triangles.
  "surfaceJobCapture",
  "surfaceJobTriangles",
  // The one batch widen of surface values (D272): `surfaceValuesF32`.
  "surfaceValuesF32",
  // The render buffers of a surface result (D271, #753): `surfaceRenderBuffers`.
  "surfaceRenderBuffers",
  // The values-only blob of one result (D271, #753): `surfaceColumnsToBytes`, `surfaceColumnsFromBytes`.
  "surfaceColumnsToBytes",
  "surfaceColumnsFromBytes",
  // Brief J (D106): the deterministic `payload.json` ZIP writer every json
  // submit body and geometry-reference document uses; every body of one
  // turn in ONE call (`internal/zip-payload.ts`, D299).
  "zipPayloadJsonManyStart",
  "zipPayloadJsonManyEnd",
  // A heavy kernel call runs on the pool while the JS thread goes on: a `...Start` gives a
  // `PoolTask`, its `...End` reads the result (`internal/pool-task.ts`).
  "__wbg_pooltask_free",
  "pooltask_flag",
  "pooltask_done",
  "__wbindgen_malloc",
  "__wbindgen_realloc",
  "__wbindgen_free",
  // No `__wbindgen_exn_store`: the threaded core catches JS exceptions with
  // WebAssembly exception handling (D299) and does not export it; the glue
  // of each build checks its own internals.
  "__wbindgen_start",
  "__externref_table_alloc",
  "__externref_table_dealloc",
  "__externref_drop_slice",
  "__wbg_griddocumentdecode_free",
  "griddocumentdecode_route",
  "griddocumentdecode_finiteNumbersValidated",
  "__wbg_categoricalareadense_free",
  "categoricalareadense_values",
  "categoricalareadense_legend"
];

// src/internal/core.ts
var core;
var coreMemory;
var pending;
var sourceIdentity;
var terminalFailure;
var threadCount = 1;
function coreThreads() {
  return threadCount;
}
function terminal(error, message) {
  const failure2 = new CoreTerminalError(
    error instanceof CoreInitializationError ? error.message : message,
    { cause: error }
  );
  terminalFailure = failure2;
  return failure2;
}
async function compileSource(source) {
  if (source instanceof WebAssembly.Module) return source;
  if (typeof source === "string" || source instanceof URL) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new CoreInitializationError(
        `could not load the Infrared core (HTTP ${response.status})`
      );
    }
    return WebAssembly.compile(await response.arrayBuffer());
  }
  return WebAssembly.compile(source);
}
function requireCapabilities(output) {
  if (!(output.memory instanceof WebAssembly.Memory)) {
    throw new CoreInitializationError(
      "the Infrared core has no compatible memory export"
    );
  }
  if (!(output.__wbindgen_externrefs instanceof WebAssembly.Table)) {
    throw new CoreInitializationError(
      "the Infrared core has no compatible reference table"
    );
  }
  for (const name of REQUIRED_FUNCTION_EXPORTS) {
    if (typeof output[name] !== "function") {
      throw new CoreInitializationError(
        `the Infrared core is missing required export ${name}`
      );
    }
  }
}
async function loadCore(source) {
  const compiled = await compileSource(source.source);
  const module2 = source.threaded === void 0 ? await import("../generated/infrared-core.js") : await source.threaded.glue();
  let output;
  try {
    output = await module2.default({ module_or_path: compiled });
  } catch (error) {
    throw terminal(
      error,
      "the loaded Infrared core failed during initialization"
    );
  }
  try {
    requireCapabilities(output);
    if (module2.coreVersion() !== "0.4.0") {
      throw new CoreInitializationError(
        `incompatible Infrared core version ${module2.coreVersion()}`
      );
    }
  } catch (error) {
    throw terminal(
      error,
      "the loaded Infrared core failed its capability check"
    );
  }
  if (source.threaded !== void 0) await startPool(module2, source.threaded.threads);
  core = module2;
  coreMemory = output.memory;
}
async function startPool(module2, threads) {
  const threaded = module2;
  const init = threaded.initThreadPool;
  const abortOnOom = threaded.installOomAbort;
  try {
    if (typeof init !== "function" || typeof abortOnOom !== "function") {
      throw new CoreInitializationError(
        "the threaded Infrared core has no initThreadPool or installOomAbort export"
      );
    }
    abortOnOom();
    await init(threads);
  } catch (error) {
    throw new CoreInitializationError(
      "the threaded Infrared core could not start its worker threads",
      { cause: error }
    );
  }
  threadCount = threads;
}
function initializeCoreSource(source) {
  if (terminalFailure !== void 0) {
    return Promise.reject(terminalFailure);
  }
  if (core !== void 0) {
    if (source?.threaded !== void 0 && source.threaded.threads !== threadCount) {
      return Promise.reject(new CoreInitializationError(
        `the Infrared core is already initialized with ${threadCount} thread(s)`
      ));
    }
    if (source?.source instanceof WebAssembly.Module && source.identity !== sourceIdentity) {
      const names = new Set(WebAssembly.Module.exports(source.source).map((entry) => entry.name));
      const missing = REQUIRED_FUNCTION_EXPORTS.find((name) => !names.has(name));
      if (missing !== void 0) {
        return Promise.reject(new CoreInitializationError(
          `the Infrared core is already initialized; the other module is missing export ${missing}`
        ));
      }
    }
    return Promise.resolve();
  }
  if (source === void 0) {
    return Promise.reject(
      new CoreInitializationError(
        "a URL, byte buffer, or compiled module is required"
      )
    );
  }
  if (pending !== void 0) {
    if (source.identity === sourceIdentity) return pending;
    return pending.then(
      () => initializeCoreSource(source),
      () => initializeCoreSource(source)
    );
  }
  sourceIdentity = source.identity;
  pending = loadCore(source).catch((error) => {
    if (terminalFailure === void 0) {
      pending = void 0;
      sourceIdentity = void 0;
    }
    throw error;
  });
  return pending;
}
function requireCore(method) {
  if (core === void 0) throw new CoreNotReadyError(method);
  return core;
}
function requireCoreMemory() {
  if (coreMemory === void 0) throw new CoreNotReadyError();
  return coreMemory;
}
var packagedCoreLoader;
function registerPackagedCoreLoader(load) {
  packagedCoreLoader = load;
}
function loadPackagedCore(threads) {
  if (packagedCoreLoader === void 0) {
    return Promise.reject(new CoreInitializationError(
      "threads need the packaged Node core: load @infrared-city/infrared-sdk/worker in a Node worker_threads Worker"
    ));
  }
  return packagedCoreLoader(threads);
}
async function ensureCore(method) {
  if (core !== void 0) return;
  if (packagedCoreLoader !== void 0) {
    await packagedCoreLoader();
    return;
  }
  throw new CoreInitializationError(coreNotStartedMessage(detectCoreRealm(), method));
}

// src/internal/options.ts
function resolveCoreSource(options) {
  const supplied = [options.url, options.bytes, options.module].filter(
    (value) => value !== void 0
  );
  if (options.threads !== void 0 && options.threads !== 1) {
    throw new CoreInitializationError("initializeCore({ threads }) above 1 is supported on Node only (D205)");
  }
  if (supplied.length > 1) {
    throw new CoreInitializationError("initializeCore accepts exactly one core source");
  }
  if (options.url !== void 0) {
    const value = options.url instanceof URL ? options.url : new URL(options.url);
    return { source: value, identity: value.href };
  }
  if (options.bytes !== void 0) {
    return { source: options.bytes, identity: options.bytes };
  }
  if (options.module !== void 0) {
    return { source: options.module, identity: options.module };
  }
  return void 0;
}

// src/internal/initialize.ts
function initializeCore(options = {}) {
  return initializeCoreSource(resolveCoreSource(options));
}

// src/version.ts
var VERSION = "1.1.0";

// src/logger.ts
var discard = (..._args) => void 0;
var silentLogger = Object.freeze({
  debug: discard,
  info: discard,
  warn: discard,
  error: discard
});
var consoleLogger = console;

// src/analysis-types.ts
var AnalysesName = {
  WindSpeed: "wind-speed",
  DaylightAvailability: "daylight-availability",
  DirectSunHours: "direct-sun-hours",
  SkyViewFactors: "sky-view-factors",
  SolarRadiation: "solar-radiation",
  ThermalComfortIndex: "thermal-comfort-index",
  PedestrianWindComfort: "pedestrian-wind-comfort",
  ThermalComfortStatistics: "thermal-comfort-statistics",
  DaylightFactor: "daylight-factor"
};
var WIND_ANALYSIS_TYPES = /* @__PURE__ */ new Set([
  AnalysesName.WindSpeed,
  AnalysesName.PedestrianWindComfort
]);
var TILING_SUPPORTED_TYPES = new Set(
  Object.values(AnalysesName).filter((name) => name !== AnalysesName.DaylightFactor)
);

// src/billing.ts
var billing_exports = {};
__export(billing_exports, {
  BillingService: () => BillingService,
  PricingUnavailableError: () => PricingUnavailableError,
  estimateWorkflowRunTokens: () => estimateWorkflowRunTokens,
  resolveBracketName: () => resolveBracketName,
  resolveTokensPerJob: () => resolveTokensPerJob
});

// src/internal/auth.ts
var AuthPartitionChangedError = class extends Error {
  name = "AuthPartitionChangedError";
  constructor() {
    super("active authentication credential changed before dispatch");
  }
};
var SDK_HEADER_VALUE = `ts-sdk/${VERSION}`;
function buildAuthResolver(options) {
  const { apiKey, token, getToken, surface = "script" } = options;
  if (token !== void 0 && getToken !== void 0) {
    throw new Error("`token` and `getToken` are mutually exclusive");
  }
  if (!apiKey && token === void 0 && getToken === void 0) {
    throw new Error("provide at least one of `apiKey`, `token`, or `getToken`");
  }
  return async () => {
    const headers = {
      "x-infrared-application": surface,
      "x-infrared-sdk": SDK_HEADER_VALUE
    };
    if (apiKey) headers["X-Api-Key"] = apiKey;
    const resolvedToken = getToken === void 0 ? token : await getToken();
    if (getToken !== void 0 && (typeof resolvedToken !== "string" || !resolvedToken)) {
      throw new Error("`getToken` must return a non-empty string");
    }
    if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`;
    return headers;
  };
}

// src/internal/fetch.ts
var defaults = /* @__PURE__ */ new WeakSet();
function resolveFetch(implementation) {
  if (implementation != null) return implementation;
  const native = globalThis.fetch;
  if (typeof native !== "function") return void 0;
  const bound3 = native.bind(globalThis);
  defaults.add(bound3);
  return bound3;
}
function isDefaultFetch(fetcher) {
  return defaults.has(fetcher);
}

// src/internal/stream-sender.ts
var BLOCK_BYTES = 64 * 1024;
function streamSender(fetcher) {
  return {
    observesProgress: true,
    async send(request, progress) {
      const body = request.body;
      const total = body.byteLength;
      let offset = 0;
      const stream = new ReadableStream({
        pull(controller) {
          progress.progress(offset);
          if (offset >= total) {
            controller.close();
            return;
          }
          const end = Math.min(offset + BLOCK_BYTES, total);
          controller.enqueue(body.subarray(offset, end));
          offset = end;
        }
      }, { highWaterMark: 0 });
      const headers = new Headers(request.headers);
      headers.set("content-length", String(total));
      const init = {
        method: request.method,
        headers,
        body: stream,
        duplex: "half",
        credentials: request.credentials,
        redirect: "manual",
        signal: request.signal
      };
      const response = await fetcher(request.url, init);
      progress.finished();
      return response;
    }
  };
}

// src/internal/xhr-sender.ts
var NULL_BODY_STATUS = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function responseHeaders(raw) {
  const headers = new Headers();
  for (const line of raw.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    try {
      headers.append(line.slice(0, colon).trim(), line.slice(colon + 1).trim());
    } catch {
    }
  }
  return headers;
}
function sameUrl(a, b) {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return a === b;
  }
}
var xhrSender = {
  // A redirect is followed, and the body sent again, before this code sees
  // it: `bodySenderFor` gives this sender only a body that is safe to resend.
  observesProgress: true,
  send(request, progress) {
    return new Promise((resolve, reject) => {
      if (request.signal.aborted) {
        reject(new Error("request stopped"));
        return;
      }
      const xhr = new XMLHttpRequest();
      const total = request.body.byteLength;
      const onAbort = () => xhr.abort();
      const settled2 = () => request.signal.removeEventListener("abort", onAbort);
      xhr.open(request.method, request.url);
      xhr.responseType = "arraybuffer";
      xhr.withCredentials = false;
      request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
      xhr.upload.onprogress = (event) => progress.progress(event.loaded);
      xhr.upload.onload = () => progress.progress(total);
      xhr.onload = () => {
        settled2();
        progress.finished();
        if (xhr.responseURL !== "" && !sameUrl(xhr.responseURL, request.url)) {
          resolve(Response.error());
          return;
        }
        const body = NULL_BODY_STATUS.has(xhr.status) ? null : xhr.response;
        try {
          resolve(new Response(body, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders(xhr.getAllResponseHeaders())
          }));
        } catch (error) {
          reject(error);
        }
      };
      xhr.onerror = () => {
        settled2();
        reject(new Error("the request failed"));
      };
      xhr.onabort = () => {
        settled2();
        reject(new Error("request stopped"));
      };
      request.signal.addEventListener("abort", onAbort, { once: true });
      xhr.send(request.body);
    });
  }
};

// src/internal/body-sender.ts
function fetchSender(fetcher) {
  return {
    observesProgress: false,
    send: (request) => fetcher(request.url, {
      method: request.method,
      headers: request.headers,
      // Browser, Node 18+, and Workers accept ArrayBufferView bodies. The DOM
      // declaration narrows the generic ArrayBufferLike parameter out, so the
      // runtime object is kept and cast only at this seam.
      body: request.body,
      credentials: request.credentials,
      redirect: "manual",
      signal: request.signal
    })
  };
}
function streamedUploads() {
  const runtime = globalThis;
  const versions = runtime.process?.versions ?? {};
  return runtime.process?.release?.name === "node" && typeof versions.node === "string" && versions.bun === void 0 && versions.deno === void 0 && versions.electron === void 0;
}
function crossOrigin(url) {
  const page = globalThis.location?.origin;
  try {
    return typeof page !== "string" || new URL(url).origin !== page;
  } catch {
    return false;
  }
}
function bodySenderFor(fetcher, presigned) {
  if (!isDefaultFetch(fetcher)) return fetchSender(fetcher);
  if (streamedUploads()) return streamSender(fetcher);
  if (presigned !== void 0 && typeof XMLHttpRequest === "function" && crossOrigin(presigned.url)) {
    return xhrSender;
  }
  return fetchSender(fetcher);
}

// src/internal/send-guard.ts
var MAX_TIMEOUT_MS = 2147483647;
var SendGuard = class {
  constructor(limits, onStop) {
    this.limits = limits;
    this.onStop = onStop;
  }
  phase = "idle";
  sent = 0;
  pulled = false;
  stopped;
  timers = /* @__PURE__ */ new Map();
  /** Why the guard stopped the send, if it did. */
  get stop() {
    return this.stopped;
  }
  /**
   * Arm the guard at dispatch. A sender that reports byte progress gets the
   * stall guard and the budget; one that cannot gets one window for body and
   * response together (see the module comment).
   */
  start(observesProgress) {
    if (this.phase !== "idle") return;
    this.phase = "sending";
    if (observesProgress) {
      this.arm("budget", this.limits.budgetMs);
    } else {
      this.arm("window", this.limits.budgetMs + this.limits.responseMs);
    }
  }
  progress(sentBytes) {
    if (this.phase !== "sending") return;
    if (!this.pulled || sentBytes !== this.sent) this.arm("stall", this.limits.stallMs);
    this.pulled = true;
    this.sent = sentBytes;
    if (sentBytes >= this.limits.totalBytes) this.finished();
  }
  /** The last body byte is sent, or the server answered: end both rules, start the response window. */
  finished() {
    if (this.phase !== "sending") return;
    this.phase = "sent";
    this.clear("stall");
    this.clear("budget");
    this.arm("response", this.limits.responseMs);
  }
  close() {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }
  arm(why, ms) {
    this.clear(why);
    this.timers.set(why, setTimeout(() => {
      this.phase = "stopped";
      this.stopped = why;
      this.close();
      this.onStop(why);
    }, Math.min(ms, MAX_TIMEOUT_MS)));
  }
  clear(why) {
    const timer = this.timers.get(why);
    if (timer !== void 0) clearTimeout(timer);
    this.timers.delete(why);
  }
};

// src/internal/deadline.ts
function requireTimeout(timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_TIMEOUT_MS) {
    throw new TypeError(`timeoutMs must be in (0, ${MAX_TIMEOUT_MS}]`);
  }
  return timeoutMs;
}
var Deadline = class {
  constructor(caller, timeoutMs) {
    this.caller = caller;
    this.onCallerAbort = () => {
      this.callerAborted = true;
      this.controller.abort();
    };
    if (caller?.aborted) this.onCallerAbort();
    else caller?.addEventListener("abort", this.onCallerAbort, { once: true });
    this.timer = setTimeout(() => this.expire(), requireTimeout(timeoutMs));
  }
  controller = new AbortController();
  /** Aborts on the timeout only, never on the caller's signal. */
  timeout = new AbortController();
  timedOut = false;
  callerAborted = false;
  timer;
  guard;
  onCallerAbort;
  expire() {
    this.timedOut = true;
    this.timeout.abort();
    this.controller.abort();
  }
  /**
   * Hand the timeout to a send guard at the dispatch of a request body
   * (`send-body.ts`): this deadline's own timer stops, and the guard's stall,
   * budget and response rules end the request from here, as a timeout.
   */
  guardSend(limits, observesProgress) {
    clearTimeout(this.timer);
    this.timer = void 0;
    this.guard?.close();
    this.guard = new SendGuard(limits, () => this.expire());
    if (!this.controller.signal.aborted) this.guard.start(observesProgress);
    return this.guard;
  }
  /** Which send rule stopped the request, when a send guard did. */
  sendStop() {
    return this.guard?.stop;
  }
  reason() {
    if (this.callerAborted) return "aborted";
    if (this.timedOut) return "timeout";
    return void 0;
  }
  /**
   * Start work only when live, and remove this wait's listener on settlement.
   * `timeoutOnly` waits for work that is already sent: only the timeout ends
   * the wait, and the caller's abort reaches the work through
   * `controller.signal` only, so an answer already in hand is kept.
   */
  wait(start, timeoutOnly = false) {
    const stop = timeoutOnly ? this.timeout.signal : this.controller.signal;
    if (stop.aborted) return Promise.reject(new Error("request stopped"));
    return new Promise((resolve, reject) => {
      const cleanup = () => stop.removeEventListener("abort", onAbort);
      const onAbort = () => {
        cleanup();
        reject(new Error("request stopped"));
      };
      stop.addEventListener("abort", onAbort, { once: true });
      let work;
      try {
        work = start();
      } catch (error) {
        cleanup();
        reject(error);
        return;
      }
      work.then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
    });
  }
  close() {
    clearTimeout(this.timer);
    this.guard?.close();
    this.caller?.removeEventListener("abort", this.onCallerAbort);
  }
};
function delay(ms, signal) {
  if (signal.aborted) return Promise.reject(new Error("the wait was stopped"));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(new Error("the wait was stopped"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

// src/internal/send-body.ts
function sendLimits(totalBytes, responseMs) {
  return {
    totalBytes,
    stallMs: requireCore().sendStallSeconds() * 1e3,
    budgetMs: requireCore().sendBudgetSeconds(totalBytes) * 1e3,
    responseMs
  };
}
var NO_PROGRESS = { progress: () => void 0, finished: () => void 0 };
function sendBody(sender, fetcher, request, limits, deadline) {
  const signal = deadline.controller.signal;
  if (limits.totalBytes === 0) return fetchSender(fetcher).send({ ...request, signal }, NO_PROGRESS);
  const guard = deadline.guardSend(limits, sender.observesProgress);
  return sender.send({ ...request, signal }, guard);
}
function stopDetail(deadline, limits) {
  const seconds = (ms) => `${Math.round(ms / 1e3)} s`;
  switch (deadline.sendStop()) {
    case "stall":
      return `no body byte moved for ${seconds(limits.stallMs)}`;
    case "budget":
      return `the ${seconds(limits.budgetMs)} send budget for ${limits.totalBytes} bytes ran out`;
    case "response":
      return `no answer ${seconds(limits.responseMs)} after the body was sent`;
    case "window":
      return `no answer within ${seconds(limits.budgetMs + limits.responseMs)} (the send budget for ${limits.totalBytes} bytes plus the request timeout)`;
    default:
      return "before the body was sent";
  }
}

// src/internal/url-trim.ts
function trimTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return end === value.length ? value : value.slice(0, end);
}

// src/internal/transport.ts
var TransportError = class extends Error {
  constructor(message, phase, reason2, method, status2, retryAfterS) {
    super(message);
    this.phase = phase;
    this.reason = reason2;
    this.method = method;
    this.status = status2;
    this.retryAfterS = retryAfterS;
  }
  name = "TransportError";
};
function retryAfterSeconds(headers) {
  const raw = headers?.get?.("Retry-After") ?? null;
  if (raw === null || raw.trim() === "") return void 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : void 0;
}
function httpErrorMessage(status2) {
  if (status2 === 401 || status2 === 403) {
    try {
      return requireCore().apiKeyRefusedMessage(status2);
    } catch (error) {
      if (!(error instanceof CoreNotReadyError)) throw error;
    }
  }
  return `gateway request received HTTP ${status2}`;
}
var DEFAULT_TIMEOUT_MS = 18e4;
function cancelResponseBody(response) {
  try {
    void response.body?.cancel().catch(() => void 0);
  } catch {
  }
}
function mutation(method) {
  return method !== "GET" && method !== "HEAD";
}
var NEVER_CONNECTED = /* @__PURE__ */ new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "UND_ERR_CONNECT_TIMEOUT"]);
function connectFailure(error) {
  const cause = error?.cause;
  if (typeof cause?.code !== "string" || !NEVER_CONNECTED.has(cause.code)) return void 0;
  return typeof cause.message === "string" ? cause.message : cause.code;
}
function safePhase(method, dispatched) {
  if (!dispatched) return "pre-dispatch";
  return mutation(method) ? "unknown-acceptance" : "after-dispatch";
}
function normalizeBaseUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new TypeError("gateway base URL must be an absolute HTTP(S) URL");
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new TypeError("gateway base URL must be an uncredentialed HTTP(S) URL without query or fragment");
  }
  const path = url.pathname === "/" ? "" : trimTrailingSlashes(url.pathname);
  return { origin: url.origin, path };
}
function decodedPath(raw) {
  let current = raw;
  for (let pass = 0; pass < 8; pass += 1) {
    let next;
    try {
      next = decodeURIComponent(current);
    } catch {
      throw new TypeError("gateway path contains invalid percent encoding");
    }
    if (next === current) return current;
    current = next;
  }
  throw new TypeError("gateway path is encoded too many times");
}
function validatePath(path) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("#")) {
    throw new TypeError("gateway request requires an absolute-path reference without a fragment");
  }
  const rawPath = path.split("?", 1)[0];
  const decoded = decodedPath(rawPath);
  const control = /[\u0000-\u001f\u007f]/;
  if (control.test(rawPath) || control.test(decoded)) {
    throw new TypeError("gateway path contains a control character");
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) {
    throw new TypeError("gateway path contains an unsafe separator");
  }
  if (decoded.split("/").some((part) => part === "." || part === "..")) {
    throw new TypeError("gateway path contains a dot segment");
  }
}
var GatewayTransport = class {
  base;
  auth;
  fetch;
  sender;
  timeoutMs;
  constructor(options) {
    this.base = normalizeBaseUrl(options.baseUrl);
    this.auth = options.auth;
    const fetcher = resolveFetch(options.fetch);
    if (typeof fetcher !== "function") throw new TypeError("a fetch implementation is required");
    this.fetch = fetcher;
    this.sender = bodySenderFor(fetcher);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    requireTimeout(this.timeoutMs);
  }
  get baseUrl() {
    return `${this.base.origin}${this.base.path}`;
  }
  async requestBytes(path, options = {}) {
    return (await this.requestBytesWithHeaders(path, options)).content;
  }
  async requestBytesWithHeaders(path, options = {}) {
    const method = options.method ?? "GET";
    try {
      validatePath(path);
    } catch {
      throw new TransportError("gateway request path is invalid", "pre-dispatch", "validation", method);
    }
    const url = `${this.base.origin}${this.base.path}${path}`;
    const body = options.body;
    const limits = body === void 0 ? void 0 : sendLimits(body.byteLength, this.timeoutMs);
    const deadline = new Deadline(options.signal, this.timeoutMs);
    let dispatched = false;
    try {
      let auth;
      try {
        auth = await deadline.wait(() => this.auth());
      } catch (error) {
        if (error instanceof AuthPartitionChangedError) throw error;
        const stopped = deadline.reason();
        throw new TransportError(
          stopped === "timeout" ? "gateway request timed out before dispatch" : stopped === "aborted" ? "gateway request was aborted before dispatch" : "gateway request authentication failed",
          "pre-dispatch",
          stopped ?? "auth",
          method
        );
      }
      const headers = new Headers(options.headers);
      for (const [name, value] of Object.entries(auth)) headers.set(name, value);
      const sent = options.beforeDispatch !== void 0 && mutation(method);
      if (deadline.controller.signal.aborted) throw new Error("request stopped");
      const response = await deadline.wait(() => {
        options.beforeDispatch?.();
        dispatched = true;
        if (limits === void 0 || body === void 0) {
          return this.fetch(url, { method, headers, redirect: "manual", signal: deadline.controller.signal });
        }
        return sendBody(
          this.sender,
          this.fetch,
          { url, method, headers, body, credentials: "same-origin" },
          limits,
          deadline
        );
      }, sent);
      if (response.status >= 300 && response.status < 400) {
        cancelResponseBody(response);
        throw new TransportError("gateway request received a redirect", "response", "http", method, response.status);
      }
      if (!response.ok && options.acceptHttpErrors !== true) {
        cancelResponseBody(response);
        throw new TransportError(
          httpErrorMessage(response.status),
          "response",
          "http",
          method,
          response.status,
          retryAfterSeconds(response.headers)
        );
      }
      const buffer = await deadline.wait(() => response.arrayBuffer(), sent);
      return {
        content: new Uint8Array(buffer),
        headers: response.headers,
        status: response.status
      };
    } catch (error) {
      if (error instanceof TransportError || error instanceof AuthPartitionChangedError && !dispatched) throw error;
      const stopped = deadline.reason();
      const refused = stopped === void 0 ? connectFailure(error) : void 0;
      if (refused !== void 0) {
        throw new TransportError(`gateway request could not connect: ${refused}`, "pre-dispatch", "network", method);
      }
      const reason2 = stopped ?? (dispatched ? "network" : "auth");
      const phase = safePhase(method, dispatched);
      const message = stopped === "timeout" ? limits === void 0 ? "gateway request timed out" : `gateway request timed out (${stopDetail(deadline, limits)})` : stopped === "aborted" ? "gateway request was aborted" : dispatched ? "gateway request failed after dispatch" : "gateway request failed before dispatch";
      throw new TransportError(message, phase, reason2, method);
    } finally {
      deadline.close();
    }
  }
  async requestJson(path, options = {}) {
    const method = options.method ?? "GET";
    let body;
    try {
      if (options.body !== void 0) {
        const serialized = JSON.stringify(options.body);
        if (serialized === void 0) throw new TypeError("JSON value has no wire form");
        body = new TextEncoder().encode(serialized);
      }
    } catch {
      throw new TransportError("gateway JSON request body is not serializable", "pre-dispatch", "validation", method);
    }
    const headers = { ...options.headers };
    if (body !== void 0) headers["Content-Type"] = "application/json";
    const request = {
      method,
      headers,
      ...body === void 0 ? {} : { body },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    };
    const bytes = await this.requestBytes(path, request);
    if (bytes.byteLength === 0) return void 0;
    try {
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch {
      throw new TransportError("gateway response is not valid JSON", "response", "body", method);
    }
  }
};

// src/internal/map-limit.ts
async function mapLimit(values, limit3, operation) {
  if (!Number.isSafeInteger(limit3) || limit3 < 1) throw new TypeError("maxWorkers must be positive");
  const output = new Array(values.length);
  let next = 0;
  async function worker2() {
    while (next < values.length) {
      const index2 = next++;
      output[index2] = await operation(values[index2], index2);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit3, values.length) }, worker2));
  return output;
}

// src/internal/service.ts
var InvalidOptionError = class extends TypeError {
  name = "InvalidOptionError";
};
function rejectRemovedOption(options, name, replacement) {
  if (options === void 0) return;
  const value = options[name];
  if (value === void 0) return;
  throw new InvalidOptionError(`${name} was removed; ${replacement}`);
}
function serviceTransport(options, suffix = "") {
  const base = trimTrailingSlashes(String(options.baseUrl));
  return new GatewayTransport({
    baseUrl: `${base}${suffix}`,
    auth: options.auth,
    ...options.fetch === void 0 ? {} : { fetch: options.fetch },
    ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs }
  });
}
function requireJson(value, operation) {
  if (value === void 0) throw new Error(`${operation} returned an empty response`);
  return value;
}

// src/price-list.ts
var PricingUnavailableError = class extends Error {
  /**
   * @param url - The price list URL that was fetched.
   * @param cause - Why the fetch failed.
   */
  constructor(url, cause) {
    super(
      `the price list at ${url} cannot be fetched: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause }
    );
    this.url = url;
  }
  name = "PricingUnavailableError";
};
function estimateRun(plannedJobs, quote) {
  const estimate = JSON.parse(requireCore().areaEstimate(plannedJobs, quote.tokensPerJob));
  return {
    ...quote,
    estimatedCostTokens: estimate.estimated_cost_tokens,
    estimatedTimeS: estimate.estimated_time_s
  };
}
var PriceCache = class {
  constructor(fetchList, url, logger, nowMs = Date.now) {
    this.fetchList = fetchList;
    this.url = url;
    this.logger = logger;
    this.nowMs = nowMs;
  }
  list;
  /** The price of one job of `analysisType`. */
  async quote(analysisType2) {
    const core2 = requireCore();
    const ageS = this.list === void 0 ? void 0 : (this.nowMs() - this.list.fetchedAtMs) / 1e3;
    let source = ageS === void 0 ? void 0 : core2.priceSource(false, ageS);
    if (source !== "cached") {
      try {
        this.list = { body: await this.fetchList(), fetchedAtMs: this.nowMs() };
        source = core2.priceSource(true, 0);
      } catch (error) {
        if (this.list === void 0 || ageS === void 0) throw new PricingUnavailableError(this.url, error);
        this.logger.warn({
          event: "pricing_fetch_failed",
          message: "the price list cannot be fetched; using the last list the client fetched",
          url: this.url,
          error: error instanceof Error ? error.message : String(error)
        });
        source = core2.priceSource(false, ageS);
      }
    }
    const price = JSON.parse(core2.tokensPerJob(JSON.stringify(this.list.body), analysisType2));
    return {
      tokensPerJob: price.tokens_per_job,
      ...price.version === void 0 || price.version === null ? {} : { pricingVersion: String(price.version) },
      pricingSource: source
    };
  }
};

// src/legacy-pricing.ts
function resolveTokensPerJob(pricing, analysisType2) {
  return JSON.parse(requireCore().tokensPerJob(JSON.stringify(pricing), analysisType2)).tokens_per_job;
}
async function previewAreaWithPricing(client, polygon, options) {
  const { forceRefresh: _ignored, ...previewOptions } = options;
  const { pricingSource: _source, ...preview } = await client.previewArea(polygon, previewOptions);
  return { ...preview, pricingSource: "remote" };
}

// src/billing.ts
var PRICING_PATH = "/billing/pricing";
var BillingService = class {
  /** Creates the service from the client's base URL, credentials and transport settings. */
  constructor(options) {
    this.options = options;
  }
  transport;
  prices;
  // The price list is a public route at the API root, outside `/v2` (`pricingUrl`, a kernel
  // call, so it runs on first use: a client may be made before `initializeCore`).
  url() {
    return requireCore().pricingUrl(String(this.options.baseUrl));
  }
  /**
   * Fetches the current public price list.
   *
   * @returns The `PublicPricing` document.
   * @throws Error when the API returns an empty response, or the request fails.
   */
  async getPublicPricing() {
    this.transport ??= serviceTransport({
      ...this.options,
      baseUrl: this.url().slice(0, -PRICING_PATH.length)
    });
    return requireJson(
      await this.transport.requestJson(PRICING_PATH),
      "pricing lookup"
    );
  }
  /**
   * The price of one job of an analysis, from the price list. The client
   * keeps the list for 20 minutes; `pricingSource` says whether the price is
   * `"live"`, `"cached"` or `"stale"` (the list could not be fetched again).
   *
   * @param analysisType - The analysis to price.
   * @throws {PricingUnavailableError} when the list cannot be fetched and the client has none.
   */
  quote(analysisType2) {
    this.prices ??= new PriceCache(
      () => this.getPublicPricing(),
      this.url(),
      this.options.logger ?? consoleLogger
    );
    return this.prices.quote(analysisType2);
  }
};
function validTokens(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function resolveBracketName(pricing, areaKm2) {
  const tiers = Object.entries(pricing.brackets ?? {}).filter((entry) => entry[1]?.maxKm2 === null || validTokens(entry[1]?.maxKm2)).sort((a, b) => (a[1].maxKm2 ?? Number.POSITIVE_INFINITY) - (b[1].maxKm2 ?? Number.POSITIVE_INFINITY));
  return tiers.find(([, tier]) => tier.maxKm2 === null || areaKm2 <= tier.maxKm2)?.[0] ?? null;
}
function estimateWorkflowRunTokens(pricing, workflowId, areaKm2) {
  const bracket = resolveBracketName(pricing, areaKm2);
  if (bracket === null) return null;
  const tokens = pricing.workflows?.[workflowId]?.[bracket];
  return validTokens(tokens) ? { tokens, bracket } : null;
}

// src/internal/footprints.ts
var DEFAULT_HEIGHT_M = 9;

// src/area/tiling.ts
var WASM_USIZE_MAX = 4294967295;
function optionalUsize(value, name) {
  if (value === void 0) return void 0;
  if (!Number.isSafeInteger(value) || value < 0 || value > WASM_USIZE_MAX) {
    throw new TypeError(`${name} must be an integer from 0 through ${WASM_USIZE_MAX}`);
  }
  return value;
}
function parseJson(document2) {
  return JSON.parse(document2);
}
function validatePolygon(polygon) {
  return parseJson(requireCore("validatePolygon").validatePolygon(JSON.stringify(polygon)));
}
function grouped(value) {
  return value.toLocaleString("en-US");
}
function capRefusal(verdict) {
  const grid = `the ${verdict.family} grid (${verdict.step_m} m step)`;
  if (verdict.kind === "bbox_too_large") {
    return `Polygon bbox would generate about ${grouped(verdict.estimate)} tiles on ${grid}, over the limit of ${grouped(verdict.limit)} non-empty tiles; a bbox grid that large is refused before a single tile is built. Most bbox tiles will not be non-empty, so read the count as an upper bound. To get past this pre-check, pass maxTilesOverride: ${verdict.min_override} or more; the non-empty cap is checked after it. A bbox this large is more often a coordinate-order mistake (GeoJSON is [lon, lat]).`;
  }
  return `Polygon produces ${grouped(verdict.count)} non-empty tiles on ${grid}, over the limit of ${grouped(verdict.limit)}. Each tile is one billed job. To run it, pass maxTilesOverride: ${verdict.count}; to spend less, shrink the polygon or size it first with previewArea().`;
}
function generateTilesForPolygon(polygon, options = {}) {
  const limit3 = optionalUsize(options.maxTilesOverride, "maxTilesOverride");
  const verdict = parseJson(
    requireCore("generateTilesForPolygon").generateTilesForPolygon(
      JSON.stringify(polygon),
      options.analysisType ?? void 0,
      limit3
    )
  );
  if (!verdict.ok) throw new Error(capRefusal(verdict));
  return verdict.tiles;
}
function getTilingConfig(analysisType2) {
  const wire2 = parseJson(
    requireCore("getTilingConfig").getTilingConfig(analysisType2 ?? void 0)
  );
  return {
    inferenceSizeM: wire2.inference_size_m,
    inferenceSizeCells: wire2.inference_size_cells,
    contextSizeM: wire2.context_size_m,
    stepM: wire2.step_m,
    stepCells: wire2.step_cells,
    cellSizeM: wire2.cell_size_m
  };
}

// src/area/tile-frames.ts
function kernelPolygonOrigin(polygon) {
  const ring = polygon.coordinates[0] ?? [];
  const pairs = new Float64Array(ring.length * 2);
  for (const [index2, point] of ring.entries()) {
    pairs[index2 * 2] = point[0];
    pairs[index2 * 2 + 1] = point[1];
  }
  const origin = requireCore("kernelPolygonOrigin").scalarPolygonOriginF64(new Uint8Array(pairs.buffer));
  return { lon: origin[0], lat: origin[1] };
}

// src/area/reanchor.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function reanchorEntries(entries3, source, target) {
  const document2 = encoder.encode(JSON.stringify(entries3));
  const moved = requireCore().frameReanchorBytes(
    document2,
    source.lon,
    source.lat,
    target.lon,
    target.lat
  );
  return JSON.parse(decoder.decode(moved));
}
function acquiredBuildings(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const origin = candidate["origin"];
  const buildings = candidate["buildings"];
  if (!Array.isArray(origin) || origin.length !== 2) return void 0;
  const [lon, lat] = origin;
  if (typeof lon !== "number" || !Number.isFinite(lon)) return void 0;
  if (typeof lat !== "number" || !Number.isFinite(lat)) return void 0;
  if (buildings === null || typeof buildings !== "object" || Array.isArray(buildings)) {
    return void 0;
  }
  return { buildings, origin: [lon, lat] };
}
function siteFrameBuildings(value, polygon) {
  const acquired = acquiredBuildings(value);
  if (acquired === void 0) return value;
  const target = kernelPolygonOrigin(polygon);
  const source = { lon: acquired.origin[0], lat: acquired.origin[1] };
  if (source.lon === target.lon && source.lat === target.lat) return acquired.buildings;
  if (Object.keys(acquired.buildings).length === 0) return acquired.buildings;
  return reanchorEntries(acquired.buildings, source, target);
}

// src/geodata/index.ts
var geodata_exports = {};
__export(geodata_exports, {
  ALLOWED_HOSTS: () => ALLOWED_HOSTS,
  COLUMNS_BY_COLLECTION: () => COLUMNS_BY_COLLECTION,
  CoreInitializationError: () => CoreInitializationError,
  CoreNotReadyError: () => CoreNotReadyError,
  CoreTerminalError: () => CoreTerminalError,
  DATA_USER_AGENT: () => DATA_USER_AGENT,
  DEDUP_RADIUS_M: () => DEDUP_RADIUS_M,
  DEFAULT_PUBLIC_TIMEOUT_MS: () => DEFAULT_PUBLIC_TIMEOUT_MS,
  GEO_BASE_URL: () => GEO_BASE_URL,
  GROUND_COLLECTIONS: () => GROUND_COLLECTIONS,
  GeodataDependencyError: () => GeodataDependencyError,
  GeodataError: () => GeodataError,
  GeodataFetchError: () => GeodataFetchError,
  GeodataRangeError: () => GeodataRangeError,
  HEADER_PREFIX_BYTES: () => HEADER_PREFIX_BYTES,
  HostNotAllowedError: () => HostNotAllowedError,
  INDEXED_COLLECTIONS: () => INDEXED_COLLECTIONS,
  KERNEL_FGB_EXPORTS: () => KERNEL_FGB_EXPORTS,
  LAND_COVER_MIN_MAX_ZOOM: () => LAND_COVER_MIN_MAX_ZOOM,
  MAX_JSON_BYTES: () => MAX_JSON_BYTES,
  MAX_SLAB_TOLERANCE_DEG: () => MAX_SLAB_TOLERANCE_DEG,
  OvertureFileLimitError: () => OvertureFileLimitError,
  OvertureReadTooLargeError: () => OvertureReadTooLargeError,
  ROADS_URL: () => ROADS_URL,
  ReadMarginError: () => ReadMarginError,
  SITE_CHUNKS_IN_FLIGHT: () => SITE_CHUNKS_IN_FLIGHT,
  SLAB_TOLERANCE_FACTOR: () => SLAB_TOLERANCE_FACTOR,
  SOURCES_TTL_MS: () => SOURCES_TTL_MS,
  SiteReadError: () => SiteReadError,
  TREES_URL: () => TREES_URL,
  WIDEST_READ_ANALYSIS_TYPE: () => WIDEST_READ_ANALYSIS_TYPE,
  acquireBuildings: () => acquireBuildings,
  acquireBuildingsArea: () => acquireBuildingsArea,
  acquireBuildingsJson: () => acquireBuildingsJson,
  acquireGroundMaterials: () => acquireGroundMaterials,
  acquireGroundMaterialsArea: () => acquireGroundMaterialsArea,
  acquireGroundMaterialsJson: () => acquireGroundMaterialsJson,
  acquireTrees: () => acquireTrees,
  acquireTreesJson: () => acquireTreesJson,
  assertAllowedUrl: () => assertAllowedUrl,
  bboxAreaM2: () => bboxAreaM2,
  bboxIntersects: () => bboxIntersects,
  bytesRangeTransport: () => bytesRangeTransport,
  clearFgbCache: () => clearFgbCache,
  clearManifestCaches: () => clearManifestCaches,
  clearOvertureMetadataCache: () => clearOvertureMetadataCache,
  decompose: () => decompose,
  featureCollectionJson: () => featureCollectionJson,
  featuresArrayText: () => featuresArrayText,
  fetchOvertureManifest: () => fetchOvertureManifest,
  fetchPublicBytes: () => fetchPublicBytes,
  fetchPublicJson: () => fetchPublicJson,
  fetchPublicText: () => fetchPublicText,
  fetchSources: () => fetchSources,
  geoUrlFor: () => geoUrlFor,
  groundReadDistanceM: () => groundReadDistanceM,
  httpRangeTransport: () => httpRangeTransport,
  initializeCore: () => initializeCore,
  isAllowedUrl: () => isAllowedUrl,
  jsonArrayOf: () => jsonArrayOf,
  jsonObjectOf: () => jsonObjectOf,
  namePieces: () => namePieces,
  overtureReaderAvailable: () => overtureReaderAvailable,
  planRowGroups: () => planRowGroups,
  pointToBbox: () => pointToBbox,
  readFgbBbox: () => readFgbBbox,
  readFgbBboxJson: () => readFgbBboxJson,
  readFgbBytes: () => readFgbBytes,
  readMarginM: () => readMarginM,
  readOvertureCollection: () => readOvertureCollection,
  readOvertureCollectionJson: () => readOvertureCollectionJson,
  requireFeatureCollection: () => requireFeatureCollection,
  requireJsonArray: () => requireJsonArray,
  requireOvertureReader: () => requireOvertureReader,
  requiredMarginM: () => requiredMarginM,
  resolveOverlayCity: () => resolveOverlayCity,
  resolveReadAnalysisType: () => resolveReadAnalysisType,
  roadsToIrFeatures: () => roadsToIrFeatures,
  selectOvertureFiles: () => selectOvertureFiles,
  siteChunks: () => siteChunks,
  siteRectangle: () => siteRectangle,
  slabToleranceDeg: () => slabToleranceDeg,
  spliceJsonArrays: () => spliceJsonArrays,
  treesFeatureCollection: () => treesFeatureCollection,
  unionAreaM2: () => unionAreaM2
});

// src/geodata/errors.ts
var INSTALL_COMMAND = "npm install hyparquet hyparquet-compressors";
var GeodataError = class extends Error {
  name = "GeodataError";
};
var HostNotAllowedError = class extends GeodataError {
  name = "HostNotAllowedError";
  constructor(url) {
    super(`${url} is not a permitted public data URL`);
  }
};
var GeodataDependencyError = class extends GeodataError {
  name = "GeodataDependencyError";
  /** The command to run, so a caller can print it without parsing prose. */
  static installCommand = INSTALL_COMMAND;
  /** The package that could not be loaded. */
  packageName;
  constructor(packageName, cause) {
    super(
      `${packageName} is not installed. Reading Overture Maps parquet needs the optional parquet stack; install it with "${INSTALL_COMMAND}". Everything that does not read Overture works without it: payloads, area runs over your own geometry, results, images, and the static weather catalog.`,
      cause === void 0 ? {} : { cause }
    );
    this.packageName = packageName;
  }
};
var GeodataFetchError = class extends GeodataError {
  constructor(url, detail, status2, options) {
    super(`${url}: ${detail}`, options);
    this.status = status2;
  }
  name = "GeodataFetchError";
};
var GeodataRangeError = class extends GeodataError {
  constructor(url, detail, status2) {
    super(`${url}: ${detail}`);
    this.status = status2;
  }
  name = "GeodataRangeError";
};
var OvertureReadTooLargeError = class extends GeodataError {
  constructor(collection, plannedBytes2, limitBytes, files, rowGroups, bbox) {
    super(
      `reading ${collection} for ${describe(bbox)} plans ${mib(plannedBytes2)} MiB of compressed parquet (${rowGroups} row groups in ${files} files), over the ${mib(limitBytes)} MiB limit for this runtime; read a smaller area or raise maxPlannedBytes`
    );
    this.collection = collection;
    this.plannedBytes = plannedBytes2;
    this.limitBytes = limitBytes;
    this.files = files;
    this.rowGroups = rowGroups;
    this.bbox = bbox;
  }
  name = "OvertureReadTooLargeError";
};
var OvertureFileLimitError = class extends GeodataError {
  constructor(collection, files, maxFiles) {
    super(
      `${collection} matches ${files} Overture files for this area, over the maxFiles limit of ${maxFiles}; reading only the first ${maxFiles} would drop features from every tile`
    );
    this.collection = collection;
    this.files = files;
    this.maxFiles = maxFiles;
  }
  name = "OvertureFileLimitError";
};
function describe(bbox) {
  return `[${bbox.west}, ${bbox.south}, ${bbox.east}, ${bbox.north}]`;
}
function mib(bytes) {
  return Math.round(bytes / (1024 * 1024));
}
var SiteReadError = class extends GeodataError {
  constructor(message, failedTiles, cause) {
    super(message, cause === void 0 ? {} : { cause });
    this.failedTiles = failedTiles;
  }
  name = "SiteReadError";
};

// src/geodata/allowed-hosts.ts
var ALLOWED_HOSTS = Object.freeze([
  "geo.infrared.city",
  "registry.infrared.city",
  "overturemaps-us-west-2.s3.us-west-2.amazonaws.com"
]);
var GEO_BASE_URL = "https://geo.infrared.city";
function isAllowedUrl(url) {
  let parsed;
  try {
    parsed = url instanceof URL ? url : new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
}
function assertAllowedUrl(url) {
  if (!isAllowedUrl(url)) throw new HostNotAllowedError(String(url));
  return String(url);
}
function geoUrlFor(key) {
  const url = /^https?:/i.test(key) ? key : `${GEO_BASE_URL}/${key.replace(/^\/+/, "")}`;
  return assertAllowedUrl(url);
}

// src/internal/capped-body.ts
function cancelBody(response) {
  try {
    void response.body?.cancel().catch(() => void 0);
  } catch {
  }
}
function hasComparableLength(response) {
  const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
  return encoding === "identity" || encoding === "" && response.type !== "cors";
}
function declaredLength(response) {
  const raw = response.headers.get("content-length");
  if (raw === null) return void 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : void 0;
}
async function readCappedBody(response, limits) {
  const declared = declaredLength(response);
  if (declared !== void 0 && declared > limits.cap) {
    cancelBody(response);
    throw limits.fail(
      `declares ${declared} bytes; the limit is ${limits.cap} bytes`
    );
  }
  const comparable = hasComparableLength(response) ? declared : void 0;
  const stream = response.body;
  if (stream === null || typeof stream.getReader !== "function") {
    return readWithoutStream(response, declared, comparable, limits);
  }
  return readStream(stream.getReader(), comparable, limits);
}
async function readStream(reader, comparable, limits) {
  const chunks = [];
  let total = 0;
  for (; ; ) {
    const step2 = await reader.read();
    if (step2.done) break;
    const chunk2 = step2.value;
    if (chunk2 === void 0) continue;
    total += chunk2.byteLength;
    if (total > limits.cap) {
      await reader.cancel().catch(() => void 0);
      throw limits.fail(
        `passed the ${limits.cap}-byte limit while it arrived; the read was abandoned`
      );
    }
    chunks.push(chunk2);
  }
  if (comparable !== void 0 && comparable !== total) {
    throw limits.fail(
      `declares ${comparable} bytes but carries ${total} bytes`
    );
  }
  return join(chunks, total);
}
async function readWithoutStream(response, declared, comparable, limits) {
  if (declared === void 0) {
    throw limits.fail(
      "has no body stream and no content-length, so the limit cannot be kept; the read was refused"
    );
  }
  const body = new Uint8Array(await response.arrayBuffer());
  if (body.byteLength > limits.cap) {
    throw limits.fail(
      `carries ${body.byteLength} bytes; the limit is ${limits.cap} bytes`
    );
  }
  if (comparable !== void 0 && body.byteLength !== comparable) {
    throw limits.fail(
      `declares ${comparable} bytes but carries ${body.byteLength} bytes`
    );
  }
  return body;
}
function join(chunks, total) {
  if (chunks.length === 1) return chunks[0];
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk2 of chunks) {
    out.set(chunk2, at);
    at += chunk2.byteLength;
  }
  return out;
}

// src/geodata/stall.ts
var STALL_TIMEOUT_MS = 6e4;
var StallWatch = class {
  constructor(parent, ms) {
    this.parent = parent;
    this.ms = ms;
    if (parent.aborted) {
      this.controller.abort();
      return;
    }
    parent.addEventListener("abort", this.onParentAbort, { once: true });
    this.touch();
  }
  controller = new AbortController();
  timer;
  fired = false;
  // The caller's abort or the read deadline is not a stall: stop the timer.
  onParentAbort = () => {
    clearTimeout(this.timer);
    this.controller.abort();
  };
  /** True when this attempt ended because no data arrived. */
  get stalled() {
    return this.fired;
  }
  /** Data arrived: restart the idle timer. */
  touch() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.fired = true;
      this.controller.abort();
    }, this.ms);
  }
  /**
   * Restart the timer on every body chunk of `response`.
   *
   * The body is replaced by a stream that forwards each chunk, so the
   * readers downstream (`readCappedBody`, `cancelBody`) are unchanged. The
   * status, headers and response type stay those of the real answer.
   */
  watch(response) {
    const body = response.body;
    if (body === null || typeof body.getReader !== "function") return response;
    const own2 = Object.getOwnPropertyDescriptor(response, "body");
    if (!Object.isExtensible(response) || own2 !== void 0 && own2.configurable !== true) {
      clearTimeout(this.timer);
      return response;
    }
    const reader = body.getReader();
    const forwarded = new ReadableStream({
      pull: async (controller) => {
        const step2 = await reader.read();
        if (step2.done) {
          controller.close();
          return;
        }
        this.touch();
        controller.enqueue(step2.value);
      },
      cancel: (reason2) => reader.cancel(reason2)
    });
    Object.defineProperty(response, "body", { value: forwarded });
    return response;
  }
  close() {
    clearTimeout(this.timer);
    this.parent.removeEventListener("abort", this.onParentAbort);
  }
};

// src/geodata/http.ts
var METERS_PER_DEG_LAT = 111320;
function pointToBbox(latitude, longitude, distanceM) {
  const deltaLat = distanceM / METERS_PER_DEG_LAT;
  const cosLat = Math.max(Math.cos(latitude * Math.PI / 180), 1e-6);
  const deltaLon = distanceM / (METERS_PER_DEG_LAT * cosLat);
  return {
    west: longitude - deltaLon,
    south: latitude - deltaLat,
    east: longitude + deltaLon,
    north: latitude + deltaLat
  };
}
function bboxIntersects(a, b) {
  return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;
}
var DATA_USER_AGENT = `infrared-sdk-ts/${VERSION}`;
var MAX_JSON_BYTES = 32 * 1024 * 1024;
var DEFAULT_PUBLIC_TIMEOUT_MS = 18e4;
function fetchImpl(options) {
  const implementation = resolveFetch(options.fetch);
  if (typeof implementation !== "function") {
    throw new GeodataFetchError("fetch", "no fetch implementation is available");
  }
  return implementation;
}
var PublicGetRetry = class {
  tries = 0;
  attempt() {
    this.tries += 1;
    return {};
  }
  next(error) {
    const status2 = error instanceof GeodataFetchError ? error.status : void 0;
    if (error instanceof GeodataError && status2 === void 0) return void 0;
    const waitS = requireCore().hostRetryWaitSeconds(
      "public_get",
      "after_send",
      status2,
      this.tries,
      Math.random(),
      void 0
    );
    return waitS === void 0 ? void 0 : waitS * 1e3;
  }
};
async function withRequest(url, headers, options, use, retry) {
  const checked = assertAllowedUrl(url);
  const timeoutMs = options.timeoutMs ?? DEFAULT_PUBLIC_TIMEOUT_MS;
  const deadline = new Deadline(options.signal, timeoutMs);
  const signal = deadline.controller.signal;
  const step2 = (work) => deadline.wait(work);
  const stopped = (error) => new GeodataFetchError(checked, stopDetail2(error, deadline, timeoutMs), void 0, { cause: error });
  const stallMs = options.stallTimeoutMs ?? STALL_TIMEOUT_MS;
  try {
    for (; ; ) {
      const watch = retry !== void 0 && stallMs < timeoutMs ? new StallWatch(signal, stallMs) : void 0;
      try {
        const response = await step2(
          () => fetchImpl(options)(checked, {
            headers: {
              "User-Agent": DATA_USER_AGENT,
              ...headers,
              ...retry === void 0 ? {} : retry.attempt()
            },
            redirect: "error",
            signal: watch?.controller.signal ?? signal
          })
        );
        watch?.touch();
        if (response.status >= 300 && response.status < 400) {
          cancelBody(response);
          throw new GeodataFetchError(
            checked,
            `redirect refused: HTTP ${response.status} (the allow-list is checked per URL)`,
            response.status
          );
        }
        return await step2(() => use(watch === void 0 ? response : watch.watch(response)));
      } catch (caught) {
        const error = watch?.stalled === true ? new Error(`no data arrived for ${stallMs} ms`) : caught;
        const waitMs = deadline.reason() === void 0 ? retry?.next(error) : void 0;
        if (waitMs === void 0) {
          if (error instanceof GeodataError) throw error;
          throw stopped(error);
        }
        try {
          await step2(() => delay(waitMs, signal));
        } catch (stop) {
          throw stopped(stop);
        }
      } finally {
        watch?.close();
      }
    }
  } finally {
    deadline.close();
  }
}
function stopDetail2(error, deadline, timeoutMs) {
  const stopped = deadline.reason();
  if (stopped === "timeout") {
    return `the answer and its body did not complete within ${timeoutMs} ms`;
  }
  if (stopped === "aborted") return "the caller aborted the request";
  return `request failed: ${error instanceof Error ? error.message : String(error)}`;
}
async function fetchPublicText(url, options = {}) {
  const retry = new PublicGetRetry();
  return withRequest(url, { Accept: "application/json" }, options, async (response) => {
    if (!response.ok) {
      cancelBody(response);
      throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
    }
    const bytes = await readCappedBody(response, {
      cap: MAX_JSON_BYTES,
      fail: (detail) => new GeodataFetchError(url, `the answer ${detail}`)
    });
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new GeodataFetchError(url, "the body is not UTF-8 text");
    }
  }, retry);
}
async function fetchPublicBytes(url, options = {}) {
  const cap = options.cap ?? MAX_JSON_BYTES;
  return withRequest(url, { Accept: "application/json" }, options, async (response) => {
    if (!response.ok) {
      cancelBody(response);
      throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
    }
    const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
    const etag = response.headers.get("etag");
    const bytes = await readCappedBody(response, {
      cap,
      fail: (detail) => new GeodataFetchError(url, `the answer ${detail}`)
    });
    return {
      bytes,
      ...etag === null ? {} : { etag },
      encoded: encoding !== "" && encoding !== "identity"
    };
  });
}
async function fetchPublicJson(url, options = {}) {
  const text = await fetchPublicText(url, options);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new GeodataFetchError(
      url,
      `body is not JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// src/geodata/read-margin.ts
var WIDEST_READ_ANALYSIS_TYPE = "solar-radiation";
function resolveReadAnalysisType(analysisType2) {
  const name = (analysisType2 ?? "").trim();
  return name === "" ? WIDEST_READ_ANALYSIS_TYPE : name;
}
function readMarginM(analysisType2) {
  return getTilingConfig(resolveReadAnalysisType(analysisType2)).contextSizeM / 2;
}
function groundReadDistanceM(analysisType2) {
  return Math.ceil(Math.SQRT2 * readMarginM(analysisType2));
}
var ReadMarginError = class extends Error {
  /** The layer that was acquired too narrowly, for example `"buildings"`. */
  layer;
  /** The read margin, in metres, the layer was acquired with. */
  acquiredMarginM;
  /** The analysis type the layer was acquired for, when recorded. */
  acquiredAnalysisType;
  /** The read margin, in metres, the run needs. */
  requiredMarginM;
  /** The analysis type that sets the required margin. */
  requiredAnalysisType;
  constructor(fields) {
    super(
      `${fields.layer} were acquired with a ${fields.acquiredMarginM} m read margin (analysisType=${JSON.stringify(fields.acquiredAnalysisType)}), and this run's analysisType=${JSON.stringify(fields.requiredAnalysisType)} needs ${fields.requiredMarginM} m. The outer band of context ${fields.layer} beyond the site is missing, which would change the result with no other symptom. Re-acquire with analysisType=${JSON.stringify(fields.requiredAnalysisType)}, or with no analysisType at all \u2014 the default reads the widest margin and is valid for every analysis.`
    );
    this.name = "ReadMarginError";
    this.layer = fields.layer;
    this.acquiredMarginM = fields.acquiredMarginM;
    this.acquiredAnalysisType = fields.acquiredAnalysisType;
    this.requiredMarginM = fields.requiredMarginM;
    this.requiredAnalysisType = fields.requiredAnalysisType;
  }
};
function recordedMargin(layer) {
  if (typeof layer !== "object" || layer === null) return void 0;
  const value = layer.readMarginM;
  if (typeof value !== "number" || !Number.isFinite(value)) return void 0;
  const named = layer.analysisType;
  return {
    readMarginM: value,
    ...typeof named === "string" ? { analysisType: named } : {}
  };
}
var LAYER_REQUIREMENT = {
  buildings: readMarginM,
  "ground materials": groundReadDistanceM,
  trees: groundReadDistanceM
};
function requiredMarginM(layer, analysisType2) {
  const derive = LAYER_REQUIREMENT[layer];
  if (derive === void 0) {
    throw new TypeError(
      `unknown acquisition layer ${JSON.stringify(layer)}; known layers are ${Object.keys(LAYER_REQUIREMENT).sort().join(", ")}`
    );
  }
  return derive(analysisType2);
}
function checkReadMargin(acquired, layer, analysisTypes) {
  const record3 = recordedMargin(acquired);
  if (record3 === void 0) return;
  const names = analysisTypes.length === 0 ? [void 0] : analysisTypes;
  let widest = names[0];
  let required2 = requiredMarginM(layer, widest);
  for (const name of names.slice(1)) {
    const candidate = requiredMarginM(layer, name);
    if (candidate > required2) {
      required2 = candidate;
      widest = name;
    }
  }
  if (record3.readMarginM >= required2) return;
  throw new ReadMarginError({
    layer,
    acquiredMarginM: record3.readMarginM,
    ...record3.analysisType === void 0 ? {} : { acquiredAnalysisType: record3.analysisType },
    requiredMarginM: required2,
    ...widest == null ? {} : { requiredAnalysisType: widest }
  });
}

// src/geodata/range-transport.ts
function httpRangeTransport(options = {}) {
  const sizes = /* @__PURE__ */ new Map();
  async function ranged(url, start, endExclusive, read) {
    const range2 = endExclusive === void 0 ? `bytes=${start}-` : `bytes=${start}-${endExclusive - 1}`;
    const state = new KernelRangeRead(url, start, endExclusive, read?.ifMatch, options.logger);
    const answer = await withRequest(
      url,
      { Range: range2, "Accept-Encoding": "identity" },
      options,
      (response) => state.answer(response),
      state
    );
    if (answer.totalSize !== void 0) sizes.set(url, answer.totalSize);
    return answer;
  }
  return {
    async byteLength(url) {
      const cached2 = sizes.get(url);
      if (cached2 !== void 0) return cached2;
      const first = await ranged(url, 0, 1, void 0);
      const total = first.totalSize ?? sizes.get(url);
      if (total === void 0) throw new GeodataFetchError(url, "no usable content-range");
      sizes.set(url, total);
      return total;
    },
    read: (url, start, endExclusive, read) => ranged(url, start, endExclusive, read)
  };
}
function bytesRangeTransport(bytes, url = "https://geo.infrared.city/in-memory.fgb") {
  const etag = `"in-memory-${bytes.byteLength}"`;
  return {
    byteLength: (requested) => {
      if (requested !== url) {
        return Promise.reject(new GeodataFetchError(requested, "not the in-memory object"));
      }
      return Promise.resolve(bytes.byteLength);
    },
    read: (requested, start, endExclusive, options) => {
      if (requested !== url) {
        return Promise.reject(new GeodataFetchError(requested, "not the in-memory object"));
      }
      if (options?.ifMatch !== void 0 && options.ifMatch !== etag) {
        return Promise.reject(
          new GeodataRangeError(requested, "in-memory object entity tag mismatch", 412)
        );
      }
      return Promise.resolve({
        bytes: bytes.slice(start, endExclusive ?? bytes.byteLength),
        etag,
        totalSize: bytes.byteLength
      });
    }
  };
}
var AskAgain = class extends Error {
  constructor(waitMs) {
    super("asked again");
    this.waitMs = waitMs;
  }
};
function step(event) {
  return JSON.parse(requireCore().rangeReadStep(JSON.stringify(event)));
}
function header(response, name) {
  return response.headers.get(name);
}
function numberHeader(response, name) {
  const raw = header(response, name);
  const value = raw === null ? Number.NaN : Number(raw.trim());
  return Number.isFinite(value) && value >= 0 ? value : null;
}
var KernelRangeRead = class {
  constructor(url, start, endExclusive, ifMatch, logger = consoleLogger) {
    this.url = url;
    this.logger = logger;
    this.read = {
      start,
      end: endExclusive === void 0 ? null : endExclusive - 1,
      tries: 0,
      pinned: ifMatch ?? null
    };
    let host = url;
    try {
      host = new URL(url).hostname || url;
    } catch {
    }
    this.host = host;
  }
  read;
  host;
  attempt() {
    this.read = { ...this.read, tries: this.read.tries + 1 };
    return this.read.pinned === null ? {} : { "If-Match": this.read.pinned };
  }
  next(error) {
    const waitMs = error instanceof AskAgain ? error.waitMs : error instanceof GeodataError ? void 0 : this.afterFailure();
    if (waitMs !== void 0) {
      this.logger.warn(
        `range read retry attempt=${this.read.tries + 1} path=${this.path()} wait_ms=${Math.round(waitMs)}`
      );
    }
    return waitMs;
  }
  async answer(response) {
    const decided = step({
      event: "answer",
      read: this.read,
      answer: {
        status: response.status,
        content_range: header(response, "content-range"),
        content_type: header(response, "content-type"),
        content_encoding: header(response, "content-encoding"),
        content_length: numberHeader(response, "content-length"),
        etag: header(response, "etag"),
        retry_after_s: numberHeader(response, "retry-after")
      },
      jitter: Math.random(),
      host: this.host
    });
    if (decided.do !== "body") cancelBody(response);
    if (decided.do === "again") {
      this.read = decided.read;
      throw new AskAgain(decided.wait_s * 1e3);
    }
    if (decided.do === "stale") throw new GeodataRangeError(this.url, decided.message, 412);
    if (decided.do === "refuse") {
      if (response.status !== 200 && response.status !== 206) {
        throw new GeodataFetchError(this.url, `HTTP ${response.status}`, response.status);
      }
      throw new GeodataRangeError(this.url, decided.message, response.status);
    }
    this.read = decided.read;
    const bytes = await readCappedBody(response, {
      cap: decided.cap,
      fail: (detail) => new GeodataRangeError(
        this.url,
        decided.whole ? `${this.host} answered 200 to a Range request (host cache configuration); report it at https://github.com/Infrared-city/infrared-core/issues` : `the range answer ${detail}`,
        response.status
      )
    });
    const checked = step({
      event: "body",
      read: this.read,
      whole: decided.whole,
      cap: decided.cap,
      body_len: bytes.byteLength
    });
    if (typeof checked["refuse"] === "string") {
      throw new GeodataRangeError(this.url, checked["refuse"], response.status);
    }
    const etag = header(response, "etag") ?? void 0;
    const offset = checked["offset"];
    const length = checked["length"];
    const total = decided.whole ? bytes.byteLength : decided.total;
    return {
      bytes: decided.whole ? bytes.subarray(offset, offset + length) : bytes,
      ...total === null ? {} : { totalSize: total },
      ...etag === void 0 ? {} : { etag }
    };
  }
  afterFailure() {
    const decided = step({ event: "failure", read: this.read, phase: "after_send", jitter: Math.random() });
    const waitS = decided["wait_s"];
    return typeof waitS === "number" ? waitS * 1e3 : void 0;
  }
  path() {
    try {
      return new URL(this.url).pathname;
    } catch {
      return this.url;
    }
  }
};

// src/geodata/json-chain.ts
function firstToken(json) {
  const match = /^\s*(.)/.exec(json);
  return match?.[1] ?? "";
}
function requireJsonArray(json, origin) {
  if (firstToken(json) !== "[") {
    throw new GeodataError(
      `${origin} returned ${firstToken(json) === "{" ? "an object" : "a non-array"}; the chained readers expect a JSON array of features`
    );
  }
  return json;
}
function requireFeatureCollection(json, origin) {
  if (firstToken(json) !== "{") {
    throw new GeodataError(
      `${origin} returned ${firstToken(json) === "[" ? "an array" : "a non-object"}; the chained readers expect a FeatureCollection document`
    );
  }
  return json;
}
function featuresArrayText(featureCollectionText, origin) {
  const key = /"features"\s*:\s*\[/g;
  let match = null;
  let candidate;
  while ((match = key.exec(featureCollectionText)) !== null) {
    candidate = match.index + match[0].length - 1;
    const end = scanArray(featureCollectionText, candidate);
    if (end !== void 0) return featureCollectionText.slice(candidate, end + 1);
  }
  throw new GeodataError(`${origin} returned no readable features array`);
}
function scanArray(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index2 = start; index2 < text.length; index2 += 1) {
    const character = text[index2];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "[" || character === "{") depth += 1;
    else if (character === "]" || character === "}") {
      depth -= 1;
      if (depth === 0) return character === "]" ? index2 : void 0;
      if (depth < 0) return void 0;
    }
  }
  return void 0;
}
function spliceJsonArrays(parts) {
  const bodies = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
      throw new GeodataError("only JSON array texts can be spliced");
    }
    const body = trimmed.slice(1, -1).trim();
    if (body.length > 0) bodies.push(body);
  }
  return `[${bodies.join(",")}]`;
}
function featureCollectionJson(featuresJson) {
  return `{"type":"FeatureCollection","features":${featuresJson.trim()}}`;
}
function jsonArrayOf(elements) {
  return `[${elements.map((element) => element ?? "null").join(",")}]`;
}
function jsonObjectOf(key, valueJson) {
  return `{${JSON.stringify(key)}:${valueJson}}`;
}

// src/geodata/manifests.ts
var SOURCES_TTL_MS = 3e5;
var OVERTURE_INDEX_BASE = `${GEO_BASE_URL}/overture-index`;
var INDEXED_COLLECTIONS = Object.freeze([
  "building",
  "land_cover",
  "water",
  "land_use"
]);
var sourcesCache;
var overtureCache = /* @__PURE__ */ new Map();
var polygonCache = /* @__PURE__ */ new Map();
function clearManifestCaches() {
  sourcesCache = void 0;
  overtureCache.clear();
  polygonCache.clear();
}
async function fetchSources(options = {}) {
  return (await fetchSourcesEntry(options)).document;
}
async function fetchSourcesEntry(options = {}) {
  const now3 = options.now ?? Date.now();
  if (sourcesCache !== void 0 && now3 - sourcesCache.fetchedAt < SOURCES_TTL_MS) {
    return sourcesCache;
  }
  const text = await fetchPublicText(`${GEO_BASE_URL}/sources.json`, options);
  const document2 = JSON.parse(text);
  sourcesCache = { fetchedAt: now3, document: document2, text };
  return sourcesCache;
}
function sourceKeyFor(document2, id) {
  const cities = document2["cities"];
  if (Array.isArray(cities)) {
    for (const entry of cities) {
      if (entry !== null && typeof entry === "object" && entry["id"] === id) {
        const key = entry["source_key"];
        if (typeof key === "string" && key.length > 0) return key;
      }
    }
  }
  return `${id}_ogd`;
}
async function cityPolygon(polygonUrl, options) {
  const url = geoUrlFor(polygonUrl);
  const cached2 = polygonCache.get(url);
  if (cached2 !== void 0) return cached2;
  const document2 = await fetchPublicJson(url, options);
  const text = JSON.stringify(document2);
  polygonCache.set(url, text);
  return text;
}
async function resolveOverlayCity(bbox, options = {}) {
  const warnings = [];
  let entry;
  try {
    entry = await fetchSourcesEntry(options);
  } catch {
    return { warnings: ["sources_registry_unavailable"] };
  }
  const document2 = entry.document;
  const candidates = requireCore().overlayBboxCandidates(
    entry.text,
    bbox.west,
    bbox.south,
    bbox.east,
    bbox.north
  );
  const parsed = JSON.parse(candidates);
  const intersects = requireCore().overlayAoiIntersectsPolygon;
  for (const candidate of parsed) {
    let polygon;
    try {
      polygon = await cityPolygon(candidate.polygon_url, options);
    } catch {
      warnings.push(`${candidate.id}_polygon_unavailable`);
      continue;
    }
    if (!intersects(polygon, bbox.west, bbox.south, bbox.east, bbox.north)) continue;
    const layers = {};
    for (const [name, key] of Object.entries(candidate.layers)) {
      if (typeof key === "string" && key.length > 0) layers[name] = key;
    }
    return {
      city: { id: candidate.id, sourceKey: sourceKeyFor(document2, candidate.id), layers },
      warnings
    };
  }
  return { warnings };
}
function pointerKey(collection) {
  return collection === "building" ? "latest.json" : `latest-${collection}.json`;
}
async function fetchOvertureManifest(collection, options = {}) {
  const pinned = options.overtureRelease;
  const cached2 = overtureCache.get(collection);
  if (pinned !== void 0 && cached2?.release === pinned) {
    return { manifestJson: cached2.manifestJson, release: cached2.release };
  }
  const pointer = await fetchPublicJson(
    `${OVERTURE_INDEX_BASE}/${pointerKey(collection)}`,
    options
  );
  const release4 = pinned ?? pointer.release;
  if (cached2 !== void 0 && cached2.release === release4) {
    return { manifestJson: cached2.manifestJson, release: release4 };
  }
  const pointerPath = pointer.manifest_key.split("/").slice(1).join("/") || pointer.manifest_key;
  const key = pinned === void 0 ? pointerPath : pointerPath.replace(pointer.release, pinned);
  if (pinned !== void 0 && key === pointerPath && pinned !== pointer.release) {
    throw new GeodataError(
      `cannot pin ${collection} to Overture release ${pinned}: the pointer key ${pointer.manifest_key} does not carry release ${pointer.release}`
    );
  }
  const manifestJson = await fetchPublicText(`${OVERTURE_INDEX_BASE}/${key}`, options);
  overtureCache.set(collection, { release: release4, manifestJson });
  return { manifestJson, release: release4 };
}
async function selectOvertureFiles(collection, bbox, options = {}) {
  if (!INDEXED_COLLECTIONS.includes(collection)) {
    return { urls: [], release: options.overtureRelease ?? "" };
  }
  const { manifestJson, release: release4 } = await fetchOvertureManifest(collection, options);
  const urls = requireCore().overtureSelectFiles(
    manifestJson,
    bbox.west,
    bbox.south,
    bbox.east,
    bbox.north
  );
  return { urls: urls.map((url) => assertAllowedUrl(url)), release: release4 };
}

// src/geodata/fgb-kernel.ts
var KERNEL_FGB_EXPORTS = Object.freeze({
  layout: "fgbLayout",
  indexSearchStep: "fgbIndexSearchStep",
  decodeRangeFeatures: "fgbDecodeRangeFeatures"
});
var HEADER_PREFIX_BYTES = 8192;
var MAX_HEADER_BYTES = 16 * 1024 * 1024;
var MAX_SEARCH_STEPS = 32;
var objectCache = /* @__PURE__ */ new Map();
function clearFgbCache() {
  objectCache.clear();
}
function cacheKey(url, etag) {
  return `${url} ${etag ?? ""}`;
}
function concat(chunks) {
  const total = chunks.reduce((sum, chunk2) => sum + chunk2.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk2 of chunks) {
    out.set(chunk2, offset);
    offset += chunk2.byteLength;
  }
  return out;
}
function checkedRange(url, range2, fileSize, budget) {
  const start = Number(range2[0]);
  const length = Number(range2[1]);
  if (!Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length < 0) {
    throw new GeodataError(
      `${url}: the kernel planned an unusable range [${String(range2[0])}, ${String(range2[1])}]`
    );
  }
  const checked = JSON.parse(requireCore().rangeReadStep(JSON.stringify({
    event: "plan",
    start,
    length,
    file_size: fileSize,
    spent: budget.spent
  })));
  if (checked.refuse !== void 0) throw new GeodataRangeError(url, checked.refuse);
  budget.spent = checked.spent;
  return [start, length];
}
async function openObject(url, transport3, layout) {
  const first = await transport3.read(url, 0, HEADER_PREFIX_BYTES);
  const key = cacheKey(url, first.etag);
  const cached2 = objectCache.get(key);
  if (cached2 !== void 0) return cached2;
  const fileSize = first.totalSize ?? await transport3.byteLength(url);
  const shape = layout(first.bytes);
  const required2 = Number(shape.required_prefix_len ?? shape.header_len);
  if (!Number.isInteger(required2) || required2 <= 0 || required2 > MAX_HEADER_BYTES) {
    throw new GeodataError(`${url}: the kernel reported an unusable header size ${required2}`);
  }
  const header2 = required2 <= first.bytes.byteLength ? first.bytes.subarray(0, required2) : (await transport3.read(url, 0, required2, {
    ...first.etag === void 0 ? {} : { ifMatch: first.etag }
  })).bytes;
  const entry = { etag: first.etag, fileSize, header: header2, topNodes: [] };
  objectCache.set(key, entry);
  return entry;
}
async function readFgbBboxJsonWithKernel(url, bbox, transport3) {
  const core2 = requireCore();
  return readWithFunctions(
    core2[KERNEL_FGB_EXPORTS.layout],
    core2[KERNEL_FGB_EXPORTS.indexSearchStep],
    core2[KERNEL_FGB_EXPORTS.decodeRangeFeatures],
    url,
    bbox,
    transport3
  );
}
async function readWithFunctions(layout, searchStep, decodeRangeFeatures, url, bbox, transport3) {
  const cache2 = await openObject(url, transport3, layout);
  const ifMatch = cache2.etag === void 0 ? {} : { ifMatch: cache2.etag };
  const budget = { url, spent: 0 };
  const fetchedNodes = [...cache2.topNodes];
  let step2;
  for (let attempt = 0; attempt < MAX_SEARCH_STEPS; attempt += 1) {
    step2 = searchStep(
      cache2.header,
      bbox.west,
      bbox.south,
      bbox.east,
      bbox.north,
      cache2.fileSize,
      fetchedNodes
    );
    if (step2.need.length === 0) break;
    for (const range2 of step2.need) {
      const [start, length] = checkedRange(url, range2, cache2.fileSize, budget);
      const answer = await transport3.read(url, start, start + length, ifMatch);
      fetchedNodes.push({ offset: start, bytes: answer.bytes });
    }
    if (attempt === 0 && cache2.topNodes.length === 0) {
      cache2.topNodes = [...fetchedNodes];
    }
  }
  if (step2 === void 0 || step2.need.length > 0) {
    throw new GeodataError(`${url}: the index search did not converge`);
  }
  if (step2.features.length === 0) return '{"type":"FeatureCollection","features":[]}';
  const chunks = [];
  for (const range2 of step2.features) {
    const [start, length] = checkedRange(url, range2, cache2.fileSize, budget);
    chunks.push((await transport3.read(url, start, start + length, ifMatch)).bytes);
  }
  return decodeRangeFeatures(
    cache2.header,
    concat(chunks),
    bbox.west,
    bbox.south,
    bbox.east,
    bbox.north
  );
}

// src/geodata/fgb.ts
async function readFgbBboxJson(url, bbox, options = {}) {
  const checked = assertAllowedUrl(url);
  const transport3 = options.transport ?? httpRangeTransport(options);
  return readFgbBboxJsonWithKernel(checked, bbox, transport3);
}
async function readFgbBbox(url, bbox, options = {}) {
  return features(await readFgbBboxJson(assertAllowedUrl(url), bbox, options));
}
async function readFgbBytes(bytes, bbox) {
  const url = "https://geo.infrared.city/in-memory.fgb";
  return features(await readFgbBboxJsonWithKernel(url, bbox, bytesRangeTransport(bytes, url)));
}
function features(json) {
  const parsed = JSON.parse(json);
  return Array.isArray(parsed) ? parsed : parsed.features ?? [];
}

// src/geodata/overture-cache.ts
var OVERTURE_METADATA_CACHE_LIMIT = 50;
var entries = /* @__PURE__ */ new Map();
function clearOvertureMetadataCache() {
  entries.clear();
}
async function cachedOvertureMetadata(release4, url, load) {
  const key = `${release4}${url}`;
  const cached2 = entries.get(key);
  if (cached2 !== void 0) {
    entries.delete(key);
    entries.set(key, cached2);
    return cached2;
  }
  const pending2 = load().catch((error) => {
    if (entries.get(key) === pending2) entries.delete(key);
    throw error;
  });
  entries.set(key, pending2);
  while (entries.size > OVERTURE_METADATA_CACHE_LIMIT) {
    const oldest = entries.keys().next();
    if (oldest.done === true) break;
    entries.delete(oldest.value);
  }
  return pending2;
}

// src/geodata/overture-budget.ts
var OVERTURE_HOST_CONCURRENCY = hostConcurrencyFor(isNode());
function plannedBytesLimitFor(node) {
  return requireCore().overturePlannedBytesLimit(node ? "node" : "browser");
}
function hostConcurrencyFor(node) {
  return node ? 16 : 6;
}
function isNode() {
  const runtime = globalThis.process;
  return typeof runtime?.versions?.node === "string";
}
function plannedBudget(limit3 = plannedBytesLimitFor(isNode())) {
  let planned = 0;
  return {
    limitBytes: limit3,
    get plannedBytes() {
      return planned;
    },
    add(collection, bbox, bytes, files, rowGroups) {
      planned += bytes;
      if (planned > limit3) {
        throw new OvertureReadTooLargeError(collection, planned, limit3, files, rowGroups, bbox);
      }
    }
  };
}
function plannedBytes(metadata, groups, columns) {
  const wanted = new Set(columns);
  let total = 0;
  for (const group of groups) {
    const rowGroup = metadata.row_groups[group.index];
    if (rowGroup === void 0) continue;
    for (const column of rowGroup.columns) {
      const path = column.meta_data?.path_in_schema[0];
      if (path === void 0 || !wanted.has(path)) continue;
      total += Number(column.meta_data?.total_compressed_size ?? 0);
    }
  }
  return total;
}
var active = 0;
var waiting = [];
function acquire() {
  if (active < OVERTURE_HOST_CONCURRENCY) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}
function release() {
  const next = waiting.shift();
  if (next === void 0) active -= 1;
  else next();
}
async function withHostSlot(run) {
  await acquire();
  try {
    return await run();
  } finally {
    release();
  }
}

// src/geodata/overture-parquet.ts
var parquetModule;
async function loadParquet() {
  if (parquetModule === void 0) {
    parquetModule = (async () => {
      let parquet;
      try {
        parquet = await import(
          /* @vite-ignore */
          "hyparquet"
        );
      } catch (error) {
        throw new GeodataDependencyError("hyparquet", error);
      }
      let compressors;
      try {
        const module2 = await import(
          /* @vite-ignore */
          "hyparquet-compressors"
        );
        compressors = module2.compressors;
      } catch (error) {
        throw new GeodataDependencyError("hyparquet-compressors", error);
      }
      const geometry = await loadRawGeometry();
      return geometry === void 0 ? { parquet, compressors } : { parquet, compressors, geometry };
    })().catch((error) => {
      parquetModule = void 0;
      throw error;
    });
  }
  return parquetModule;
}
async function loadRawGeometry() {
  try {
    const [convert, wkb] = await Promise.all([
      import(
        /* @vite-ignore */
        "hyparquet/src/convert.js"
      ),
      import(
        /* @vite-ignore */
        "hyparquet/src/wkb.js"
      )
    ]);
    const { DEFAULT_PARSERS: defaults2 } = convert;
    const { wkbToGeojson } = wkb;
    if (defaults2 === void 0 || typeof wkbToGeojson !== "function") return void 0;
    const keep = (bytes) => bytes;
    return {
      // hyparquet takes the parser set as given, so it must be complete.
      parsers: { ...defaults2, geometryFromBytes: keep, geographyFromBytes: keep },
      toGeojson: (bytes) => wkbToGeojson({ view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), offset: 0 })
    };
  } catch {
    return void 0;
  }
}
function asyncBufferOf(url, byteLength, transport3) {
  return {
    byteLength,
    async slice(start, end) {
      const { bytes } = await transport3.read(url, start, end);
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      );
    }
  };
}
function oneTurnBuffer(file) {
  let pending2;
  let gate = Promise.resolve();
  return {
    byteLength: file.byteLength,
    slice(start, end) {
      if (pending2 === void 0) {
        const batch = [];
        pending2 = batch;
        gate = new Promise((resolve) => queueMicrotask(resolve)).then(() => {
          pending2 = void 0;
          return Promise.all(batch);
        });
      }
      const read = file.slice(start, end);
      pending2.push(read);
      return gate.then(() => read);
    }
  };
}

// src/geodata/overture-span.ts
async function meetingSpan(parquet, file, compressors, group, bbox, meet) {
  const rows = await parquet.parquetReadObjects({
    file,
    compressors,
    rowStart: group.start,
    rowEnd: group.end,
    columns: ["bbox"]
  });
  const boxes = rows.map((row) => row["bbox"]);
  const meets = meet(boxes, bbox);
  const first = meets.indexOf(1);
  if (first < 0) return void 0;
  const last = meets.lastIndexOf(1);
  return {
    start: group.start + first,
    end: group.start + last + 1,
    boxes: boxes.slice(first, last + 1)
  };
}

// src/geodata/overture-keep.ts
var LAND_COVER_MIN_MAX_ZOOM = 8;
function isGeneralizedLandCover(properties) {
  const cartography = properties["cartography"];
  if (cartography === null || typeof cartography !== "object") return false;
  const maxZoom = cartography.max_zoom;
  if (typeof maxZoom !== "number") return false;
  return maxZoom < LAND_COVER_MIN_MAX_ZOOM;
}
function toFeature(row, collection, raw) {
  const value = row["geometry"];
  const geometry = raw !== void 0 && value instanceof Uint8Array ? raw.toGeojson(value) : value;
  if (geometry === null || typeof geometry !== "object") return void 0;
  const properties = { overture_type: collection };
  for (const [key, value2] of Object.entries(row)) {
    if (key === "geometry" || key === "bbox") continue;
    properties[key] = value2;
  }
  const names = properties["names"];
  if (names !== null && typeof names === "object") {
    properties["name"] = names.primary;
  }
  const sources = properties["sources"];
  if (Array.isArray(sources) && sources.length > 0) {
    const first = sources[0];
    if (first !== null && typeof first === "object") {
      properties["source"] = first.dataset ?? "unknown";
    }
  }
  return {
    type: "Feature",
    id: properties["id"] ?? "",
    geometry,
    properties
  };
}
function keepRows(rows, boxes, meets, collection, raw, map) {
  const kept = [];
  for (const [index2, row] of rows.entries()) {
    const box = boxes[index2];
    if (meets[index2] !== 1) continue;
    const feature = toFeature(row, collection, raw);
    if (feature === void 0) continue;
    if (collection === "land_cover" && isGeneralizedLandCover(feature["properties"])) {
      continue;
    }
    kept.push(map(box === void 0 ? { feature } : { feature, box }));
  }
  return kept;
}

// src/geodata/overture-rows.ts
var BASE_COLUMNS = ["id", "geometry", "bbox", "names", "sources", "class", "subtype"];
var COLUMNS_BY_COLLECTION = Object.freeze({
  building: [
    ...BASE_COLUMNS,
    "height",
    "num_floors",
    "has_parts",
    "facade_material",
    "facade_color",
    "roof_shape",
    "roof_material",
    "roof_color"
  ],
  water: [...BASE_COLUMNS, "is_salt", "is_intermittent"],
  land_use: BASE_COLUMNS,
  land_cover: ["id", "geometry", "bbox", "sources", "subtype", "cartography"]
});
var OVERTURE_ROW_GROUP_CONCURRENCY = OVERTURE_HOST_CONCURRENCY > 6 ? 6 : 3;
var OVERTURE_FILE_CONCURRENCY = 4;
function statisticsFor(group) {
  const out = {};
  for (const column of group.columns) {
    const path = column.meta_data?.path_in_schema.join(".");
    const statistics = column.meta_data?.statistics;
    if (path !== void 0 && statistics !== void 0) out[path] = statistics;
  }
  return out;
}
function planRowGroups(metadata, bbox) {
  return selectRowGroups(metadata, bbox).map((group) => [group.start, group.end]);
}
function selectRowGroups(metadata, bbox) {
  const boxes = metadata.row_groups.map((group) => {
    const statistics = statisticsFor(group);
    const box = {};
    const xmin = numeric(statistics["bbox.xmin"]?.min_value);
    const ymin = numeric(statistics["bbox.ymin"]?.min_value);
    const xmax = numeric(statistics["bbox.xmax"]?.max_value);
    const ymax = numeric(statistics["bbox.ymax"]?.max_value);
    if (xmin !== void 0) box.xmin = xmin;
    if (ymin !== void 0) box.ymin = ymin;
    if (xmax !== void 0) box.xmax = xmax;
    if (ymax !== void 0) box.ymax = ymax;
    return box;
  });
  const meets = boxesMeet(boxes, bbox);
  const kept = [];
  let start = 0;
  for (const [index2, group] of metadata.row_groups.entries()) {
    const rows = Number(group.num_rows);
    if (meets[index2] === 1 && rows > 0) kept.push({ index: index2, start, end: start + rows });
    start += rows;
  }
  return kept;
}
function numeric(value) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return void 0;
}
function boxesMeet(boxes, bbox) {
  const rows = new Float64Array(boxes.length * 4);
  for (const [index2, box] of boxes.entries()) {
    rows[index2 * 4] = member(box?.xmin);
    rows[index2 * 4 + 1] = member(box?.ymin);
    rows[index2 * 4 + 2] = member(box?.xmax);
    rows[index2 * 4 + 3] = member(box?.ymax);
  }
  return requireCore().bboxMeetsRows(rows, bbox.west, bbox.south, bbox.east, bbox.north);
}
function member(value) {
  return typeof value === "number" ? value : Number.NaN;
}
async function selectFiles(collection, bbox, options) {
  const buffer = options.candidateBufferDeg ?? 0;
  const fileBbox = buffer === 0 ? bbox : {
    west: bbox.west - buffer,
    south: bbox.south - buffer,
    east: bbox.east + buffer,
    north: bbox.north + buffer
  };
  const { urls, release: release4 } = await selectOvertureFiles(collection, fileBbox, options);
  if (options.maxFiles !== void 0 && urls.length > options.maxFiles) {
    throw new OvertureFileLimitError(collection, urls.length, options.maxFiles);
  }
  return { urls, release: release4 };
}
async function readOvertureRows(collection, bbox, options, map) {
  const columns = COLUMNS_BY_COLLECTION[collection];
  if (columns === void 0) {
    throw new GeodataError(`${collection} has no published Overture file index`);
  }
  const { urls, release: release4 } = await selectFiles(collection, bbox, options);
  if (urls.length === 0) return { rows: [], release: release4 };
  const { parquet, compressors, geometry: raw } = await loadParquet();
  const transport3 = options.transport ?? httpRangeTransport(options);
  const plans = await mapLimit(
    urls,
    OVERTURE_FILE_CONCURRENCY,
    async (url) => {
      const described = await cachedOvertureMetadata(release4, url, async () => {
        const byteLength = await transport3.byteLength(url);
        const metadata = await parquet.parquetMetadataAsync(
          asyncBufferOf(url, byteLength, transport3)
        );
        return { byteLength, metadata };
      });
      const available = new Set(described.metadata.schema.map((element) => element.name));
      const projected = columns.filter((name) => available.has(name));
      const groups = selectRowGroups(described.metadata, bbox);
      return {
        file: asyncBufferOf(url, described.byteLength, transport3),
        columns: projected,
        groups,
        bytes: plannedBytes(described.metadata, groups, projected)
      };
    }
  );
  const tasks = plans.flatMap((plan) => plan.groups.map((group) => ({ plan, group })));
  const budget = options.budget ?? plannedBudget(options.maxPlannedBytes);
  budget.add(
    collection,
    bbox,
    plans.reduce((sum, plan) => sum + plan.bytes, 0),
    plans.length,
    tasks.length
  );
  const decoded = await mapLimit(
    tasks,
    OVERTURE_ROW_GROUP_CONCURRENCY,
    ({ plan, group }) => (
      // The per-host slot is shared by every type read in this wave, so three
      // concurrent themes cannot together exceed a browser's six connections.
      withHostSlot(async () => {
        const span = plan.columns.includes("bbox") ? await meetingSpan(parquet, plan.file, compressors, group, bbox, boxesMeet) : { start: group.start, end: group.end, boxes: void 0 };
        if (span === void 0) return [];
        const columns2 = span.boxes === void 0 ? plan.columns : plan.columns.filter((name) => name !== "bbox");
        const rows = await parquet.parquetReadObjects({
          file: oneTurnBuffer(plan.file),
          compressors,
          rowStart: span.start,
          rowEnd: span.end,
          ...raw === void 0 ? {} : { parsers: raw.parsers },
          ...columns2.length === 0 ? {} : { columns: columns2 }
        });
        if (span.boxes !== void 0 && rows.length !== span.boxes.length) {
          throw new GeodataError(`${collection}: the span read gave ${span.boxes.length} boxes for ${rows.length} rows`);
        }
        const boxes = span.boxes ?? rows.map((row) => row["bbox"]);
        return keepRows(rows, boxes, boxesMeet(boxes, bbox), collection, raw, map);
      })
    )
  );
  return { rows: decoded.flat(), release: release4 };
}

// src/geodata/overture.ts
async function overtureReaderAvailable(logger = silentLogger) {
  try {
    await loadParquet();
    return true;
  } catch (error) {
    logger.debug(error.message ?? String(error));
    return false;
  }
}
async function requireOvertureReader() {
  await loadParquet();
}
async function readOvertureCollection(collection, bbox, options = {}) {
  const { rows, release: release4 } = await readOvertureRows(
    collection,
    bbox,
    options,
    (row) => row.feature
  );
  return { features: rows, release: release4 };
}
async function readOvertureCollectionJson(collection, bbox, options = {}) {
  const { features: features2, release: release4 } = await readOvertureCollection(collection, bbox, options);
  return {
    json: `[${features2.map((feature) => JSON.stringify(feature)).join(",")}]`,
    release: release4
  };
}

// src/geodata/trees.ts
var TREES_URL = `${GEO_BASE_URL}/trees-world.fgb`;
var OVERLAY_LAYER_KEY = "trees_overlay";
var DEDUP_RADIUS_M = 2;
function dedupWithServiceParity(featuresJson, preferred) {
  const out = requireCore().dedupTrees(featuresJson, DEDUP_RADIUS_M, preferred, false);
  return requireJsonArray(out, "dedupTrees");
}
async function acquireTreesJson(bbox, options = {}) {
  const normalize = (collectionJson, source, idPrefix) => requireFeatureCollection(
    requireCore().treesNormalize(collectionJson, source, idPrefix),
    "treesNormalize"
  );
  const warnings = [];
  let overlayUrl;
  let sourceKey;
  let cityId;
  if (options.bestAvailable !== false) {
    const resolution = await resolveOverlayCity(bbox, options);
    warnings.push(...resolution.warnings);
    const key = resolution.city?.layers[OVERLAY_LAYER_KEY];
    if (key !== void 0 && resolution.city !== void 0) {
      overlayUrl = geoUrlFor(key);
      sourceKey = resolution.city.sourceKey;
      cityId = resolution.city.id;
    }
  }
  const [osm, overlay] = await Promise.allSettled([
    readFgbBboxJson(TREES_URL, bbox, options),
    overlayUrl === void 0 ? Promise.resolve(void 0) : readFgbBboxJson(overlayUrl, bbox, options)
  ]);
  if (osm.status === "rejected") {
    throw osm.reason instanceof Error ? osm.reason : new Error(String(osm.reason));
  }
  const sources = ["osm"];
  let collection = normalize(osm.value, "osm");
  if (overlay.status === "rejected" && overlayUrl !== void 0) {
    warnings.push(`${cityId ?? "city"}_overlay_unavailable`);
  }
  if (overlay.status === "fulfilled" && overlay.value !== void 0 && sourceKey !== void 0) {
    const overlayCollection = normalize(overlay.value, sourceKey, cityId);
    const overlayFeatures = featuresArrayText(overlayCollection, "treesNormalize");
    if (overlayFeatures.trim() !== "[]") {
      sources.push(sourceKey);
      const deduped = dedupWithServiceParity(
        spliceJsonArrays([
          featuresArrayText(collection, "treesNormalize"),
          overlayFeatures
        ]),
        [sourceKey]
      );
      collection = featureCollectionJson(deduped);
    }
  }
  return { featuresJson: featuresArrayText(collection, "treesNormalize"), sources, warnings };
}
async function acquireTrees(bbox, options = {}) {
  const { featuresJson, sources, warnings } = await acquireTreesJson(bbox, options);
  return {
    features: JSON.parse(featuresJson),
    sources,
    warnings
  };
}
function treesFeatureCollection(result2) {
  return { type: "FeatureCollection", features: [...result2.features] };
}

// src/geodata/ground.ts
var ROADS_URL = `${GEO_BASE_URL}/roads-surface-world.fgb`;
var GROUND_COLLECTIONS = Object.freeze([
  "land_cover",
  "land_use",
  "water"
]);
function roadsToIrFeatures(features2) {
  const collection = featureCollectionJson(
    `[${features2.map((feature) => JSON.stringify(feature)).join(",")}]`
  );
  return requireFeatureArray(requireCore().roadsNormalize(collection));
}
function requireFeatureArray(json) {
  const parsed = JSON.parse(json);
  return Array.isArray(parsed) ? parsed : parsed.features ?? [];
}
async function acquireGroundMaterialsJson(bbox, options = {}) {
  const [roads, ...themes] = await Promise.all([
    readFgbBboxJson(ROADS_URL, bbox, options),
    ...GROUND_COLLECTIONS.map((name) => readOvertureCollectionJson(name, bbox, options))
  ]);
  const roadsFc = requireCore().roadsNormalize(roads);
  const origin = options.frameOrigin ?? [bbox.west, bbox.south];
  const json = requireCore().groundMaterialsCompose(
    roadsFc,
    featureCollectionJson(spliceJsonArrays(themes.map((theme) => theme.json))),
    origin[0],
    origin[1],
    bbox.west,
    bbox.south,
    bbox.east,
    bbox.north
  );
  return { json, overtureRelease: themes[0]?.release ?? "" };
}
async function acquireGroundMaterials(bbox, options = {}) {
  const { json, overtureRelease } = await acquireGroundMaterialsJson(bbox, options);
  const layers = JSON.parse(json);
  return {
    layers,
    featureCount: Object.values(layers).reduce(
      (sum, value) => sum + (value.features?.length ?? 0),
      0
    ),
    overtureRelease
  };
}

// src/geodata/overture-area.ts
function unionBbox(boxes) {
  const first = boxes[0];
  if (first === void 0) throw new TypeError("an area needs at least one tile rectangle");
  let { west, south, east, north } = first;
  for (const box of boxes) {
    west = Math.min(west, box.west);
    south = Math.min(south, box.south);
    east = Math.max(east, box.east);
    north = Math.max(north, box.north);
  }
  return { west, south, east, north };
}
async function readOvertureArea(collection, bbox, options = {}) {
  const { rows, release: release4 } = await readOvertureRows(
    collection,
    bbox,
    options,
    (row) => row.box === void 0 ? { json: JSON.stringify(row.feature) } : { json: JSON.stringify(row.feature), box: row.box }
  );
  return { features: rows, release: release4 };
}
function tileFeaturesJson(features2, bbox) {
  const parts = [];
  const meets = boxesMeet(features2.map((feature) => feature.box), bbox);
  for (const [index2, feature] of features2.entries()) {
    if (meets[index2] === 1) parts.push(feature.json);
  }
  return `[${parts.join(",")}]`;
}

// src/geodata/site-chunks.ts
var SITE_CHUNKS_IN_FLIGHT = 2;
function decompose(clip, rectangles) {
  const flatClip = Float64Array.from([clip.west, clip.south, clip.east, clip.north]);
  const flatRectangles = Float64Array.from(
    rectangles.flatMap((rect) => [rect.west, rect.south, rect.east, rect.north])
  );
  const flatPieces = requireCore().rectUnionDecompose(flatClip, flatRectangles);
  const pieces = [];
  for (let index2 = 0; index2 + 3 < flatPieces.length; index2 += 4) {
    pieces.push({
      west: flatPieces[index2],
      south: flatPieces[index2 + 1],
      east: flatPieces[index2 + 2],
      north: flatPieces[index2 + 3]
    });
  }
  return pieces;
}
function namePieces(id, pieces) {
  return pieces.length === 1 ? [{ id, bbox: pieces[0] }] : pieces.map((piece, index2) => ({ id: `${id}-p${String(index2)}`, bbox: piece }));
}
function siteChunks(site, used, logger = consoleLogger) {
  warnIfOverOneFrame(site, logger);
  const flatUsed = Float64Array.from(
    (used ?? [site]).flatMap((rect) => [rect.west, rect.south, rect.east, rect.north])
  );
  const chunks = JSON.parse(requireCore().siteChunks(flatBbox(site), flatUsed));
  return chunks.map((chunk2) => ({
    id: chunk2.id,
    bbox: bboxOf(chunk2.bbox),
    pieces: chunk2.pieces.map((piece) => ({ id: piece.id, bbox: bboxOf(piece.bbox) }))
  }));
}
function flatBbox(bbox) {
  return Float64Array.from([bbox.west, bbox.south, bbox.east, bbox.north]);
}
function bboxOf([west, south, east, north]) {
  return { west, south, east, north };
}
function warnIfOverOneFrame(site, logger) {
  const warnings = JSON.parse(requireCore().siteFrameWarnings(flatBbox(site)));
  for (const warning of warnings) logger.warn(warning);
}
function siteRectangle(rectangles) {
  return unionBbox(rectangles);
}
async function eachChunk(chunks, task, requested, signal) {
  if (requested !== void 0 && (!Number.isSafeInteger(requested) || requested < 1)) {
    throw new TypeError("maxWorkers must be a positive integer");
  }
  const out = Array.from({ length: chunks.length });
  const failures = [];
  let cursor = 0;
  const ceiling = Math.min(SITE_CHUNKS_IN_FLIGHT, requested ?? SITE_CHUNKS_IN_FLIGHT);
  const workers = Math.min(ceiling, Math.max(1, chunks.length));
  await Promise.all(Array.from({ length: workers }, async () => {
    while (cursor < chunks.length) {
      if (signal?.aborted === true) throw signal.reason ?? new DOMException("aborted", "AbortError");
      const index2 = cursor++;
      const chunk2 = chunks[index2];
      if (chunk2 === void 0) continue;
      try {
        out[index2] = await task(chunk2, index2);
      } catch (error) {
        failures.push({ index: index2, id: chunk2.id, error });
      }
    }
  }));
  if (signal?.aborted === true) throw signal.reason ?? new DOMException("aborted", "AbortError");
  if (failures.length > 0) throw siteReadFailure(failures, chunks.length);
  return out;
}
function siteReadFailure(failures, total) {
  const ordered = [...failures].sort((left, right) => left.index - right.index);
  const ids = ordered.map((failure2) => failure2.id);
  return new SiteReadError(
    `site read failed for ${String(ids.length)} of ${String(total)} read chunks (${ids.join(", ")}): every chunk feeds the site, so a partial answer would be an emptier city that nobody can see`,
    ordered.map((failure2) => ({
      tileId: failure2.id,
      // A chunk has no place in the SIMULATION grid; the Python host writes
      // -1 in the same records for the same reason.
      row: -1,
      col: -1,
      error: failure2.error instanceof Error ? failure2.error.message : String(failure2.error)
    })),
    ordered[0]?.error
  );
}

// src/geodata/ground-area.ts
var decoder2 = new TextDecoder();
var encoder2 = new TextEncoder();
async function acquireGroundMaterialsArea(site, options) {
  await requireOvertureReader();
  const chunks = siteChunks(site, options.tileRectangles, options.logger);
  const read = {
    ...options,
    budget: options.budget ?? plannedBudget(options.maxPlannedBytes)
  };
  const [themes, roadsPerChunk] = await Promise.all([
    Promise.all(GROUND_COLLECTIONS.map((name) => readOvertureArea(name, site, read))),
    eachChunk(
      chunks,
      (chunk2) => readFgbBboxJson(ROADS_URL, chunk2.bbox, options),
      options.maxWorkers,
      options.signal
    )
  ]);
  const parts = chunks.map((chunk2, index2) => ({
    chunk: chunk2,
    themes,
    roads: roadsPerChunk[index2]
  }));
  const core2 = requireCore();
  const roadsByChunk = `{${parts.map(({ chunk: chunk2, roads }) => `${JSON.stringify(chunk2.id)}:${core2.roadsNormalize(roads)}`).join(",")}}`;
  const overtureFc = featureCollectionJson(spliceJsonArrays(
    themes.map((theme) => tileFeaturesJson(theme.features, site))
  ));
  const origin = options.frameOrigin ?? [site.west, site.south];
  const extent = options.cleaningExtent;
  const merged = core2.groundMaterialsComposeAndMergeBytes(
    encoder2.encode(roadsByChunk),
    encoder2.encode(overtureFc),
    origin[0],
    origin[1],
    // `chunk` names the read chunk each piece was cut from, which is how the
    // kernel finds the roads that were handed over once for it (WP22). Written
    // for a single-piece chunk too: one rule, and the answer is the same.
    encoder2.encode(JSON.stringify(chunks.flatMap((chunk2) => chunk2.pieces.map((piece) => ({
      id: piece.id,
      bbox: [piece.bbox.west, piece.bbox.south, piece.bbox.east, piece.bbox.north],
      chunk: chunk2.id
    }))))),
    extent.latitude,
    extent.longitude,
    extent.distance,
    options.defaultLayer,
    options.zStep
  );
  return {
    layersJson: decoder2.decode(merged),
    overtureRelease: themes[0]?.release ?? "",
    chunks
  };
}

// src/geodata/buildings.ts
var OVERLAY_LAYER_KEY2 = "buildings";
var OVERTURE_CANDIDATE_BUFFER_DEG = 2e-3;
async function acquireBuildingsJson(bbox, options = {}) {
  const warnings = [];
  let collectionJson;
  let source = "overture";
  if (options.bestAvailable !== false) {
    const resolution = await resolveOverlayCity(bbox, options);
    warnings.push(...resolution.warnings);
    const key = resolution.city?.layers[OVERLAY_LAYER_KEY2];
    if (key !== void 0 && resolution.city !== void 0) {
      try {
        collectionJson = await readFgbBboxJson(geoUrlFor(key), bbox, options);
        source = resolution.city.sourceKey;
      } catch {
        warnings.push(`${resolution.city.id}_overlay_unavailable`);
        collectionJson = void 0;
      }
    }
  }
  let overtureRelease = "";
  if (collectionJson === void 0) {
    const read = await readOvertureCollectionJson("building", bbox, {
      ...options,
      candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG
    });
    collectionJson = featureCollectionJson(read.json);
    overtureRelease = read.release;
  }
  return {
    collectionJson: requireFeatureCollection(
      requireCore().buildingsNormalize(collectionJson, source),
      "buildingsNormalize"
    ),
    source,
    warnings,
    overtureRelease
  };
}
async function acquireBuildings(bbox, options = {}) {
  const { collectionJson, source, warnings, overtureRelease } = await acquireBuildingsJson(
    bbox,
    options
  );
  const parsed = JSON.parse(collectionJson);
  return { features: parsed.features ?? [], source, warnings, overtureRelease };
}

// src/geodata/buildings-extrude.ts
var encoder3 = new TextEncoder();
var decoder3 = new TextDecoder();
function extrudeRectangle(collectionJson, source, id, rectangle, defaultHeightM) {
  return extrudeAll(collectionJson, source, [{ id, bbox: rectangle }], defaultHeightM)[id] ?? {};
}
function extrudeAll(collectionJson, source, rectangles, defaultHeightM) {
  const tiles = JSON.stringify(rectangles.map(({ id, bbox }) => ({
    id,
    bbox: [bbox.west, bbox.south, bbox.east, bbox.north]
  })));
  const document2 = requireCore().buildingsAssignAndExtrudeBytes(
    encoder3.encode(collectionJson),
    source,
    encoder3.encode(tiles),
    defaultHeightM
  );
  return JSON.parse(decoder3.decode(document2));
}
function extrudePieces(collectionJson, source, site, rectangles, defaultHeightM) {
  const pieces = decompose(site, rectangles.length > 0 ? rectangles : [site]);
  if (pieces.length === 0) throw new Error("no site piece meets any tile rectangle");
  if (pieces.length === 1) {
    return extrudeRectangle(
      collectionJson,
      source,
      "site",
      pieces[0],
      defaultHeightM
    );
  }
  const named = namePieces("site", pieces);
  const answer = extrudeAll(collectionJson, source, named, defaultHeightM);
  const buildings = {};
  for (const piece of named) {
    const bodies = answer[piece.id] ?? {};
    if (Object.keys(bodies).length === 0) continue;
    const moved = reanchorEntries(
      bodies,
      { lon: piece.bbox.west, lat: piece.bbox.south },
      { lon: site.west, lat: site.south }
    );
    for (const [key, body] of Object.entries(moved)) {
      if (!Object.hasOwn(buildings, key)) {
        buildings[key] = body;
      }
    }
  }
  return buildings;
}

// src/geodata/buildings-area.ts
async function acquireBuildingsArea(site, options) {
  if (options.bestAvailable === false) await requireOvertureReader();
  const rectangles = options.rectangles ?? [];
  if (rectangles.length > 1 && !await tilesAgreeOnSource(rectangles, options)) {
    return perRectangleArea(site, rectangles, options);
  }
  const overlay = await readOverlay(site, options);
  let collectionJson;
  let source;
  let overtureRelease = "";
  if (overlay.collectionJson !== void 0 && overlay.source !== void 0) {
    collectionJson = overlay.collectionJson;
    source = overlay.source;
  } else {
    await requireOvertureReader();
    const read = await readOvertureArea("building", site, {
      ...options,
      candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG,
      budget: options.budget ?? plannedBudget(options.maxPlannedBytes)
    });
    collectionJson = featureCollectionJson(tileFeaturesJson(read.features, site));
    source = "overture";
    overtureRelease = read.release;
  }
  warnIfOverOneFrame(site, options.logger ?? consoleLogger);
  return {
    buildings: extrudePieces(
      collectionJson,
      source,
      site,
      rectangles,
      options.defaultHeightM
    ),
    origin: [site.west, site.south],
    source,
    warnings: overlay.warnings,
    overtureRelease
  };
}
async function readOverlay(bbox, options) {
  if (options.bestAvailable === false) return { warnings: [] };
  const warnings = [];
  const resolution = await resolveOverlayCity(bbox, options);
  warnings.push(...resolution.warnings);
  const key = resolution.city?.layers[OVERLAY_LAYER_KEY2];
  if (key === void 0 || resolution.city === void 0) return { warnings };
  try {
    return {
      warnings,
      collectionJson: await readFgbBboxJson(geoUrlFor(key), bbox, options),
      source: resolution.city.sourceKey
    };
  } catch {
    warnings.push(`${resolution.city.id}_overlay_unavailable`);
    return { warnings };
  }
}
async function tilesAgreeOnSource(rectangles, options) {
  if (options.bestAvailable === false) return true;
  let first;
  for (const [index2, rectangle] of rectangles.entries()) {
    const resolution = await resolveOverlayCity(rectangle, options);
    const layer = resolution.city?.layers[OVERLAY_LAYER_KEY2];
    const key = layer === void 0 || resolution.city === void 0 ? "overture" : resolution.city.sourceKey;
    if (index2 === 0) first = key;
    else if (key !== first) return false;
  }
  return true;
}
async function perRectangleArea(site, rectangles, options) {
  const buildings = {};
  const warnings = /* @__PURE__ */ new Set();
  const sources = /* @__PURE__ */ new Set();
  let overtureRelease = "";
  for (const [index2, rectangle] of rectangles.entries()) {
    const read = await readRectangle(rectangle, options);
    for (const warning of read.warnings) warnings.add(warning);
    sources.add(read.source);
    if (overtureRelease === "") overtureRelease = read.overtureRelease;
    const bodies = extrudeRectangle(
      read.collectionJson,
      read.source,
      `rect-${String(index2)}`,
      rectangle,
      options.defaultHeightM
    );
    if (Object.keys(bodies).length === 0) continue;
    const moved = reanchorEntries(
      bodies,
      { lon: rectangle.west, lat: rectangle.south },
      { lon: site.west, lat: site.south }
    );
    for (const [key, body] of Object.entries(moved)) {
      if (!Object.hasOwn(buildings, key)) {
        buildings[key] = body;
      }
    }
  }
  warnIfOverOneFrame(site, options.logger ?? consoleLogger);
  return {
    buildings,
    origin: [site.west, site.south],
    source: [...sources].sort().join("+"),
    warnings: [...warnings],
    overtureRelease
  };
}
async function readRectangle(rectangle, options) {
  const overlay = await readOverlay(rectangle, options);
  if (overlay.collectionJson !== void 0 && overlay.source !== void 0) {
    return {
      collectionJson: overlay.collectionJson,
      source: overlay.source,
      overtureRelease: "",
      warnings: overlay.warnings
    };
  }
  await requireOvertureReader();
  const read = await readOvertureArea("building", rectangle, {
    ...options,
    candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG,
    budget: options.budget ?? plannedBudget(options.maxPlannedBytes)
  });
  return {
    collectionJson: featureCollectionJson(tileFeaturesJson(read.features, rectangle)),
    source: "overture",
    overtureRelease: read.release,
    warnings: overlay.warnings
  };
}

// src/geodata/rect-union-metrics.ts
var SLAB_TOLERANCE_FACTOR = 2;
var MAX_SLAB_TOLERANCE_DEG = 1e-4;
function slabToleranceDeg(rectangles) {
  const flatRectangles = Float64Array.from(
    rectangles.flatMap((rect) => [rect.west, rect.south, rect.east, rect.north])
  );
  return requireCore().rectUnionSlabToleranceDeg(flatRectangles);
}
function bboxAreaM2(bbox, cosLat) {
  const width = (bbox.east - bbox.west) * METERS_PER_DEG_LAT * cosLat;
  const height = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
  return Math.max(0, width) * Math.max(0, height);
}
function unionAreaM2(clip, rectangles, cosLat, pieces) {
  const parts = pieces ?? decompose(clip, rectangles);
  return parts.reduce((total, piece) => total + bboxAreaM2(piece, cosLat), 0);
}

// src/buildings.ts
var BuildingsService = class {
  request;
  /** The client's logger: an overlay degrade is reported through it. */
  logger;
  /**
   * @param options - Transport settings: `fetch`, `timeoutMs` and `logger` are
   *   used for the public reads; `baseUrl` and `auth` are accepted but not used.
   */
  constructor(options) {
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs },
      // A retry of a public read reports through the client's logger.
      ...options.logger === void 0 ? {} : { logger: options.logger }
    };
    this.logger = options.logger ?? consoleLogger;
  }
  /**
   * Reads and extrudes the buildings of a polygon area.
   *
   * The footprints are read once for the whole site and extruded in one frame,
   * returned as `origin`. The read margin follows `options.analysisType`.
   *
   * @param polygon - The area to read: a GeoJSON `Polygon` with one closed ring of
   *   `[longitude, latitude]` positions.
   * @param options - Optional read settings; see `BuildingsConfig`.
   * @returns The meshes keyed by building id, with the read's frame, margin and
   *   any warnings.
   * @throws {InvalidOptionError} when `options` carries a removed option
   *   (`acquisition`, `compress`, `optimizations` or `outputFormat`).
   */
  async getBuildingsInArea(polygon, options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "footprints are read from the public data hosts only; remove the option"
    );
    for (const name of ["compress", "optimizations", "outputFormat"]) {
      rejectRemovedOption(
        options,
        name,
        "it shaped the deleted POST /buildings request; the extrusion is local and always returns dotbim meshes"
      );
    }
    await ensureCore("buildings.getBuildingsInArea");
    return this.directArea(polygon, options, performance.now());
  }
  // Maintainer note (not published): footprints read straight from the public
  // hosts and extruded ONCE. The area is read for one site rectangle (in ~2x2 km
  // chunks when it is large), normalised once and extruded once in the site
  // frame, and the bodies are then moved into the POLYGON's frame, the canonical
  // D1 origin the payload path and the tile grid both use. Up to 0.12 this read,
  // normalised and extruded per tile and offset the results into the grid, which
  // mixed two frames (D48).
  async directArea(polygon, options, started) {
    const analysisType2 = resolveReadAnalysisType(options.analysisType);
    const halfExtentM = readMarginM(analysisType2);
    const grid = generateTilesForPolygon(polygon, {
      analysisType: analysisType2,
      ...options.maxTilesOverride === void 0 ? {} : { maxTilesOverride: options.maxTilesOverride }
    });
    const active3 = grid.flat().filter((tile) => !tile.empty);
    const rectangles = active3.map((tile) => pointToBbox(tile.centroid.latitude, tile.centroid.longitude, halfExtentM));
    if (rectangles.length === 0) {
      const empty = kernelPolygonOrigin(polygon);
      return {
        buildings: {},
        buildingIds: [],
        totalBuildings: 0,
        executionTime: (performance.now() - started) / 1e3,
        failedTiles: [],
        warnings: [],
        origin: [empty.lon, empty.lat],
        readMarginM: halfExtentM,
        analysisType: analysisType2
      };
    }
    const site = siteRectangle(rectangles);
    const request = {
      ...this.request,
      ...options.signal === void 0 ? {} : { signal: options.signal }
    };
    const direct = {
      ...request,
      // ONE transport for the whole site, carrying the caller's signal: it is
      // the wall-clock lever over the chunk SEQUENCE, where `timeoutMs` bounds
      // only each request (D48).
      transport: httpRangeTransport({ ...request }),
      defaultHeightM: DEFAULT_HEIGHT_M,
      // The tile rectangles decide TWO things. Whether the site has ONE
      // building source: a polygon straddling a registered city's outline does
      // not, and takes the per-rectangle read instead of a city-only answer
      // (D48, M3). And which rectangles the footprints are extruded in: the
      // compose list is `site ∩ union(rectangles)`, so a long, narrow site does
      // not extrude the empty corners of its bounding box (D57).
      rectangles,
      ...options.overtureRelease === void 0 ? {} : { overtureRelease: options.overtureRelease }
    };
    const area = await acquireBuildingsArea(site, direct);
    const overtureRelease = area.overtureRelease === "" ? void 0 : area.overtureRelease;
    const polygonOrigin = kernelPolygonOrigin(polygon);
    const buildings = Object.keys(area.buildings).length === 0 ? {} : reanchorEntries(
      area.buildings,
      { lon: area.origin[0], lat: area.origin[1] },
      polygonOrigin
    );
    for (const warning of area.warnings) {
      this.logger.warn(`buildings: ${warning}`);
    }
    return {
      buildings,
      warnings: [...area.warnings],
      origin: [polygonOrigin.lon, polygonOrigin.lat],
      // Always empty: the deleted Lambda returned Mapbox ids only, and the
      // public sources this path reads carry none (MIGRATION.md).
      buildingIds: [],
      totalBuildings: Object.keys(buildings).length,
      executionTime: (performance.now() - started) / 1e3,
      // A site-level read succeeds or fails as one. A partial answer is a
      // thinner city that nobody can see (D48).
      failedTiles: [],
      readMarginM: halfExtentM,
      analysisType: analysisType2,
      ...overtureRelease === void 0 ? {} : { overtureRelease }
    };
  }
};

// src/internal/kernel-group.ts
var EMPTY = { bytes: new TextEncoder().encode("{}"), hash: void 0 };
var KernelGroup = class {
  #text;
  #load;
  #empty;
  #ids;
  /**
   * `empty`: the group holds no mesh, known from the plan without writing it
   * (its text is `{}`); a function is asked on the first read only.
   * `ids`: a batch's `geometries`, the targets it counted.
   */
  constructor(load, empty, ids) {
    this.#load = load;
    this.#empty = empty;
    this.#ids = ids;
  }
  /** True when the group holds no mesh. */
  get empty() {
    if (typeof this.#empty === "function") this.#empty = this.#empty();
    return this.#empty;
  }
  /** The target ids of a batch's `geometries`, or `undefined` for other groups. */
  get ids() {
    return this.#ids;
  }
  /** The kernel's text, written on the first ask and kept. */
  text() {
    if (this.#text === void 0) this.#text = this.empty ? EMPTY : this.#load();
    return this.#text;
  }
  /**
   * The group as a JavaScript value, parsed from the kernel's text. The SDK's
   * own writers never ask (`jsonWireBytes` writes the bytes); a caller that
   * logs or stringifies a prepared body gets the same content.
   */
  toJSON() {
    return JSON.parse(new TextDecoder().decode(this.text().bytes));
  }
};
function groupHasContent(value) {
  if (value instanceof KernelGroup) return !value.empty;
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

// src/internal/wire-json.ts
function hasToJson(value) {
  return value !== null && typeof value === "object" && typeof value.toJSON === "function";
}
var encoder4 = new TextEncoder();
var sequence = 0;
function typedAsArray(_key, value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView) ? Array.from(value) : value;
}
function jsonWireBytes(body, replacer) {
  return spliceJsonBytes(body, () => void 0, replacer);
}
function spliceJsonBytes(body, known, replacer) {
  const plain = () => {
    const text = JSON.stringify(body, replacer);
    return text === void 0 ? void 0 : encoder4.encode(text);
  };
  if (body === null || typeof body !== "object" || Array.isArray(body)) return plain();
  if (hasToJson(body)) return plain();
  const entries3 = Object.entries(body);
  const texts = [];
  const stand = {};
  sequence = (sequence + 1) % Number.MAX_SAFE_INTEGER;
  const tag = `\0ir-wire-${sequence}-${Math.random().toString(36).slice(2)}-`;
  for (const [key, value] of entries3) {
    const text = value instanceof KernelGroup ? value.text().bytes : hasToJson(value) ? void 0 : known(value);
    let written = value;
    if (text !== void 0) {
      written = `${tag}${texts.length}`;
      texts.push(text);
    }
    Object.defineProperty(stand, key, {
      value: written,
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  if (texts.length === 0) return plain();
  const outer = JSON.stringify(stand, replacer);
  if (outer === void 0) return plain();
  const pieces = [];
  let from = 0;
  for (let index2 = 0; index2 < texts.length; index2 += 1) {
    const marker = JSON.stringify(`${tag}${index2}`);
    const at2 = outer.indexOf(marker, from);
    if (at2 === -1 || outer.indexOf(marker, at2 + marker.length) !== -1) return plain();
    pieces.push(encoder4.encode(outer.slice(from, at2)), texts[index2]);
    from = at2 + marker.length;
  }
  if (outer.indexOf(JSON.stringify(tag).slice(1, -1), from) !== -1) return plain();
  pieces.push(encoder4.encode(outer.slice(from)));
  let total = 0;
  for (const piece of pieces) total += piece.byteLength;
  const out = new Uint8Array(total);
  let at = 0;
  for (const piece of pieces) {
    out.set(piece, at);
    at += piece.byteLength;
  }
  return out;
}

// src/area/field-registry.ts
var cached;
function registryModels() {
  const core2 = requireCore();
  if (cached?.core === core2) return cached.models;
  const document2 = JSON.parse(core2.fieldRegistryJson());
  const models = /* @__PURE__ */ new Map();
  for (const [name, row] of Object.entries(document2.models)) {
    models.set(name, { fields: row.fields, byKey: new Map(row.fields.map((f) => [f.key, f])) });
  }
  cached = { core: core2, models };
  return models;
}
function registryModel(model) {
  return registryModels().get(model);
}
function modelsWithField(key) {
  const names = /* @__PURE__ */ new Set();
  for (const [name, row] of registryModels()) if (row.byKey.has(key)) names.add(name);
  return names;
}
function fieldEnum(model, key) {
  return registryModel(model)?.byKey.get(key)?.enum;
}
function knownValues(models, key) {
  const values = /* @__PURE__ */ new Set();
  for (const model of models) {
    const field = registryModel(model)?.byKey.get(key);
    if (field === void 0) continue;
    for (const value of field.enum ?? []) values.add(String(value));
    for (const value of Object.keys(field.deprecatedValues ?? {})) values.add(value);
    for (const value of Object.keys(field.rejectedValues ?? {})) values.add(value);
  }
  return [...values];
}
function fieldMinimum(model, key) {
  return registryModel(model)?.byKey.get(key)?.minimum;
}

// src/area/mesh-buffers.ts
function packMeshGroup(group) {
  if (group === null || typeof group !== "object" || Array.isArray(group)) return void 0;
  const meshes = Object.entries(group);
  const ids = [];
  const points = [];
  const triangles = [];
  const coordinateOffsets = new Uint32Array(meshes.length + 1);
  const indexOffsets = new Uint32Array(meshes.length + 1);
  let narrow = meshes.length > 0;
  for (const [id, mesh] of meshes) {
    if (mesh === null || typeof mesh !== "object") return void 0;
    const { coordinates, indices: indices2, coordinates_bin: cb, indices_bin: ib } = mesh;
    if (cb !== void 0 || ib !== void 0) return void 0;
    const plain = (value) => Array.isArray(value) || ArrayBuffer.isView(value);
    if (!plain(coordinates) || !plain(indices2)) return void 0;
    if (!(coordinates instanceof Float32Array)) narrow = false;
    ids.push(id);
    points.push(coordinates);
    triangles.push(indices2);
    coordinateOffsets[ids.length] = coordinateOffsets[ids.length - 1] + coordinates.length;
    indexOffsets[ids.length] = indexOffsets[ids.length - 1] + indices2.length;
  }
  const flat = narrow ? new Float32Array(coordinateOffsets[ids.length]) : new Float64Array(coordinateOffsets[ids.length]);
  const words2 = new Uint32Array(indexOffsets[ids.length]);
  for (let mesh = 0; mesh < ids.length; mesh++) {
    const block = points[mesh];
    flat.set(block, coordinateOffsets[mesh]);
    words2.set(triangles[mesh], indexOffsets[mesh]);
  }
  return { ids, coordinates: flat, coordinateOffsets, indices: words2, indexOffsets };
}

// src/area/config-hash.ts
function kernelConfigHash(fields) {
  return requireCore().configHash(JSON.stringify(fields));
}
var CONFIG_HASH_V2_CONTRACT_VERSION = 10;
function kernelGroupHashOnce(model, key, value, memo2) {
  const object5 = value !== null && typeof value === "object" ? value : void 0;
  const known = object5 === void 0 ? void 0 : memo2?.get(object5);
  if (known !== void 0) return known;
  const hashed = meshOrDocumentHash(model, key, value);
  if (object5 !== void 0) memo2?.set(object5, hashed);
  return hashed;
}
function meshOrDocumentHash(model, key, value) {
  const core2 = requireCore();
  const buffers = packMeshGroup(value);
  const hashed = buffers === void 0 ? void 0 : core2.configGroupHashBuffers(
    model,
    key,
    buffers.ids,
    buffers.coordinates,
    buffers.coordinateOffsets,
    buffers.indices,
    buffers.indexOffsets
  );
  return hashed ?? core2.configGroupHash(model, key, JSON.stringify(value, typedAsArray));
}
function hashInputs(model, payload, terrain, memo2) {
  const row = registryModel(model);
  if (row === void 0) {
    throw new Error(`the kernel field registry has no model ${JSON.stringify(model)}: its config hash cannot be built`);
  }
  const classes = /* @__PURE__ */ new Map();
  for (const field of row.fields) classes.set(field.key, field.hash);
  const core2 = requireCore();
  const inert = new Set(core2.inertKeys(model));
  const control = {};
  const groups = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === void 0) continue;
    const hashClass = classes.get(key);
    if (hashClass === void 0) {
      if (!inert.has(key)) control[key] = value;
      continue;
    }
    if (hashClass === "exclude") continue;
    if (hashClass === "value") {
      control[key] = value;
      continue;
    }
    const known = key === "ground-geometry" && core2.terrainHandleHashApplies(model) ? terrain?.groupHash : void 0;
    groups[key] = typeof known === "string" ? known : kernelGroupHashOnce(model, key, value, memo2);
  }
  return { control, groups };
}
function resolvedBalanceYear(control, now3) {
  const series = control["dry-bulb-temperature"];
  const rows = Array.isArray(series) || ArrayBuffer.isView(series) ? series.length : 0;
  return requireCore().energyBalanceYear(void 0, now3.getUTCFullYear(), rows);
}
function scheduleConfigHash(model, payload, terrain, now3 = /* @__PURE__ */ new Date(), memo2) {
  const { control, groups } = hashInputs(model, payload, terrain, memo2);
  if (model === "energy-balance" && control.year === void 0) control.year = resolvedBalanceYear(control, now3);
  return requireCore().configHashV2(model, JSON.stringify(control), JSON.stringify(groups));
}

// src/internal/scene-alignment.ts
function suppliedSceneAlignment(analysisType2, body) {
  const suppliedScene = [
    "geometries",
    "context-geometry",
    "vegetation",
    "vegetation-instances"
  ].some((name) => groupHasContent(body[name]));
  return requireCore().resolveTerrainAlignment(
    analysisType2,
    Object.prototype.hasOwnProperty.call(body, "terrain-alignment"),
    groupHasContent(body["ground-geometry"]),
    suppliedScene
  );
}

// src/internal/transport-choice.ts
function defaultTransport(analysisType2) {
  return requireCore().defaultTransport(analysisType2) === "json" ? "json" : "binary";
}
function areaTransport(options, analysisType2) {
  if (options.transport !== void 0) return options.transport;
  if (options.retryFrom !== void 0) return options.retryFrom.transport ?? "json";
  return defaultTransport(analysisType2);
}

// src/area/count-contract.ts
var FACADE_COUNT_CONTRACT_VERSION = 13;
var COUNT_CHANGES = [
  [6, "the kernel welds each building's vertices (infrared-core #555)"],
  [7, "the kernel gives each wall a level grid (infrared-core #582)"],
  [8, "the kernel cleans each building in a canonical order (infrared-core #630)"],
  [9, "the kernel gives a terrace under an overhang roof sensors (infrared-core #674)"],
  [11, "the kernel gives downward-facing faces sensors too (infrared-core surfgrid v7)"],
  [12, "the kernel gates each building on its own mesh, not its job (infrared-core surfgrid v8)"],
  [13, "the kernel lays out each building from its own geometry, with a fixed roof frame (infrared-core surfgrid v9)"]
];
var FacadeCountContractError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "FacadeCountContractError";
  }
};
function checkFacadeCountContract(retryFrom) {
  if (retryFrom === void 0 || retryFrom.batchingPolicyVersion !== 2) return;
  const version = retryFrom.scheduleContractVersion ?? 1;
  if (version >= FACADE_COUNT_CONTRACT_VERSION) return;
  const since = COUNT_CHANGES.filter(([at]) => at > version).map(([, change]) => change);
  throw new FacadeCountContractError(
    `retryFrom: this facade schedule was planned under schedule contract version ${String(version)}. Since then, ${since.join("; ")}. Its batches were sized with the old sensor counts, and this SDK counts under contract ${FACADE_COUNT_CONTRACT_VERSION}. The finished tiles of this schedule stay readable on their own; a fresh runArea runs (and bills) the whole area again under the new rule.`
  );
}

// src/area/cooperative.ts
var DEFAULT_SLICE_MS = 40;
var PlanAbortedError = class extends Error {
  constructor(message = "the area plan was stopped before it finished") {
    super(message);
    this.name = "AbortError";
  }
};
function now() {
  return typeof performance === "object" && typeof performance.now === "function" ? performance.now() : Date.now();
}
var channel;
var waiting2 = [];
function viaMessageChannel(resume) {
  if (channel === void 0) {
    channel = new MessageChannel();
    channel.port1.onmessage = () => {
      waiting2.shift()?.();
    };
    channel.port1.unref?.();
  }
  waiting2.push(resume);
  channel.port2.postMessage(0);
}
function pickSchedule() {
  const immediate = globalThis.setImmediate;
  if (typeof immediate === "function") return (resume) => void immediate(resume);
  if (typeof MessageChannel === "function") return viaMessageChannel;
  return (resume) => void setTimeout(resume, 0);
}
var schedule;
function yieldToHost() {
  schedule ??= pickSchedule();
  return new Promise((resolve) => {
    schedule(resolve);
  });
}
var Slice = class {
  sliceMs;
  signal;
  started = now();
  yields = 0;
  constructor(options = {}) {
    this.sliceMs = options.sliceMs ?? DEFAULT_SLICE_MS;
    this.signal = options.signal;
  }
  /** How many times this stage handed the thread back. Benchmarks read it. */
  get count() {
    return this.yields;
  }
  /** Refuse to go on when the caller has stopped the run. */
  check() {
    if (this.signal?.aborted === true) throw new PlanAbortedError();
  }
  /** Check the signal, and yield when this slice is used up. */
  tick() {
    this.check();
    if (now() - this.started < this.sliceMs) return void 0;
    return this.pause();
  }
  /** Yield unconditionally — around one indivisible call, before and after. */
  async pause() {
    this.check();
    this.yields += 1;
    await yieldToHost();
    this.check();
    this.started = now();
  }
};

// src/area/thermal-controls.ts
var THERMAL_CONTROLS = [
  "physics",
  "wallAlbedo",
  "wallAbsorptivity",
  "canopyTransmissivity",
  "groundAlbedo",
  "groundDtMax"
];
var THERMAL_CONTROL_SPELLINGS = [
  ["physics", "physics"],
  ["wallAlbedo", "wall-albedo"],
  ["wallAbsorptivity", "wall-absorptivity"],
  ["canopyTransmissivity", "canopy-transmissivity"],
  ["groundAlbedo", "ground-albedo"],
  ["groundDtMax", "ground-dt-max"]
];
var THERMAL_CONTROL_KEYS = [
  ...THERMAL_CONTROLS,
  ...THERMAL_CONTROL_SPELLINGS.filter(([camel, wire2]) => camel !== wire2).map(([, wire2]) => wire2)
];
var THERMAL_MODELS = /* @__PURE__ */ new Set([
  "thermal-comfort-index",
  "thermal-comfort-statistics"
]);
var PHYSICS_TIERS = ["v1", "detail", "advanced", "advanced-moist"];
function rejectThermalControls(input, type) {
  for (const [camel, wire2] of THERMAL_CONTROL_SPELLINGS) {
    const key = input[camel] !== void 0 && input[camel] !== null ? camel : input[wire2] !== void 0 && input[wire2] !== null ? wire2 : void 0;
    if (key === void 0) continue;
    throw new TypeError(
      `${key} is not read by ${type}: the six global thermal controls (${THERMAL_CONTROLS.join(", ")}) are inputs to thermal-comfort-index and thermal-comfort-statistics only. Remove it, or run one of those two.`
    );
  }
}
function validatePhysics(input) {
  const value = input.physics;
  if (value === void 0 || value === null) return;
  const tiers = knownValues([...THERMAL_MODELS], "physics");
  if (typeof value !== "string" || !tiers.includes(value)) {
    throw new TypeError(
      `physics must be one of ${tiers.join(", ")} (got ${JSON.stringify(value)}). thermal-comfort-statistics does not reject an unknown tier server-side \u2014 it runs the advanced engine and bills for it \u2014 so the spelling is checked here.`
    );
  }
}
function enforcePhysicsPolicy(input, type) {
  const value = input.physics;
  if (typeof value !== "string") return;
  const field = registryModel(type)?.byKey.get("physics");
  const refused = field?.rejectedValues?.[value];
  if (refused !== void 0) {
    throw new TypeError(
      `physics ${JSON.stringify(value)} is not accepted by ${type}: ${refused} Use one of ${(field?.enum ?? []).join(", ")}, or leave physics unset.`
    );
  }
  if (field?.deprecatedValues?.[value] !== void 0) warnPhysicsDeprecated(value);
}
var physicsWarned = /* @__PURE__ */ new Set();
function warnPhysicsDeprecated(value) {
  if (physicsWarned.has(value)) return;
  physicsWarned.add(value);
  const message = `The '${value}' physics tier is deprecated. Use the default tier (leave 'physics' unset). A later release will remove '${value}'.`;
  if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
    process.emitWarning(message, "DeprecationWarning");
  } else {
    consoleLogger.warn(`DeprecationWarning: ${message}`);
  }
}

// src/request-validation.ts
var INTERIOR_TYPES = /* @__PURE__ */ new Set(["daylight-factor", "energy-balance", "spatial-daylight-autonomy"]);
var ALIGNMENT_WIND_TYPES = ["wind-speed", "pedestrian-wind-comfort"];
var THERMAL_REFERENCE = "thermal-comfort-index";
var SURFACE_REFERENCE = "direct-sun-hours";
var TCS_MODEL = "thermal-comfort-statistics";
function listOr(values, quote) {
  const shown = values.map((value) => quote ? JSON.stringify(value) : value);
  if (shown.length <= 2) return shown.join(" or ");
  return `${shown.slice(0, -1).join(", ")}, or ${shown[shown.length - 1]}`;
}
function required(value, what) {
  if (value === void 0) throw new Error(`the kernel field registry has no ${what}`);
  return value;
}
var SURFACE_FIELDS = [
  "analysis-surfaces",
  "sensor-points",
  "sensor-normals",
  "context-geometry",
  "surface-grid-size",
  "surface-offset",
  "emit-cell-tris",
  "mesh-cleaning",
  "surfgrid-version"
];
var TERRAIN_FIELDS = ["ground-geometry"];
var ALIGNMENT_FIELDS = ["terrain-alignment"];
var FAST_FIELDS = ["fast"];
var GRADE_ALIGNMENT_MODES = ["to-ground", "as-is"];
function present(input, names) {
  return names.filter((name) => input[name] !== void 0 && input[name] !== null);
}
function vectors(value, name) {
  if (!Array.isArray(value)) throw new TypeError(`${name} must be an array`);
  return value;
}
function validateVector(value, name, nonZero) {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((component) => typeof component === "number" && Number.isFinite(component))) {
    throw new TypeError(`${name} must be a finite 3-component vector`);
  }
  if (nonZero && Math.hypot(value[0], value[1], value[2]) < 1e-9) {
    throw new TypeError(`${name} must be non-zero`);
  }
}
function validateSensors(input) {
  const surfaces2 = input["analysis-surfaces"];
  const pointsValue = input["sensor-points"];
  const normalsValue = input["sensor-normals"];
  const emitCellTris = input["emit-cell-tris"];
  if (surfaces2 != null) {
    const surfaceModes = required(fieldEnum(SURFACE_REFERENCE, "analysis-surfaces"), "analysis-surfaces values");
    if (typeof surfaces2 !== "string" || !surfaceModes.includes(surfaces2)) {
      throw new TypeError(`analysis-surfaces must be ${listOr(surfaceModes, false)}`);
    }
  }
  if (surfaces2 != null && pointsValue != null) {
    throw new TypeError("analysis-surfaces and sensor-points are mutually exclusive");
  }
  if (normalsValue != null && pointsValue == null) {
    throw new TypeError("sensor-normals require sensor-points");
  }
  if (pointsValue != null) {
    const points = vectors(pointsValue, "sensor-points");
    if (points.length === 0) throw new TypeError("sensor-points must not be empty");
    const maxSensors = requireCore().maxSensorsPerJob();
    if (points.length > maxSensors) {
      throw new TypeError(`sensor-points length exceeds the maximum of ${maxSensors}`);
    }
    points.forEach((point, index2) => validateVector(point, `sensor-points[${index2}]`, false));
    if (normalsValue != null) {
      const normals = vectors(normalsValue, "sensor-normals");
      if (normals.length !== points.length) {
        throw new TypeError("sensor-normals length must match sensor-points length");
      }
      normals.forEach((normal, index2) => validateVector(normal, `sensor-normals[${index2}]`, true));
    }
  }
  const gridSize = input["surface-grid-size"];
  if (gridSize != null) {
    const minGrid = required(fieldMinimum(SURFACE_REFERENCE, "surface-grid-size"), "surface-grid-size bound");
    if (typeof gridSize !== "number" || !Number.isFinite(gridSize) || gridSize < minGrid) {
      throw new TypeError(`surface-grid-size must be a finite number >= ${minGrid} m`);
    }
  }
  const offset = input["surface-offset"];
  if (offset != null) {
    const minOffset = required(fieldMinimum(SURFACE_REFERENCE, "surface-offset"), "surface-offset bound");
    if (typeof offset !== "number" || !Number.isFinite(offset) || offset < minOffset) {
      throw new TypeError(`surface-offset must be a finite number >= ${minOffset}`);
    }
  }
  if (emitCellTris != null && typeof emitCellTris !== "boolean") {
    throw new TypeError("emit-cell-tris must be a Boolean");
  }
  if (emitCellTris != null && surfaces2 == null) {
    throw new TypeError("emit-cell-tris only applies to analysis-surfaces requests");
  }
  const cleaning = input["mesh-cleaning"];
  if (cleaning != null) {
    const cleaningModes = required(fieldEnum(SURFACE_REFERENCE, "mesh-cleaning"), "mesh-cleaning values");
    if (!cleaningModes.includes(cleaning)) {
      throw new TypeError(`mesh-cleaning must be ${listOr(cleaningModes, true)}`);
    }
  }
  if (cleaning != null && surfaces2 == null) {
    throw new TypeError("mesh-cleaning only applies to analysis-surfaces requests");
  }
}
function validateCanonicalBase64(blob, key) {
  if (blob.length % 4 !== 0) throw new TypeError(
    `ground-geometry[${JSON.stringify(key)}].indices_bin must be canonical base64`
  );
  const padding = blob.endsWith("==") ? 2 : blob.endsWith("=") ? 1 : 0;
  for (let index2 = 0; index2 < blob.length - padding; index2 += 1) {
    const code = blob.charCodeAt(index2);
    const valid = code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 43 || code === 47;
    if (!valid) throw new TypeError(
      `ground-geometry[${JSON.stringify(key)}].indices_bin must be canonical base64`
    );
  }
  for (let index2 = blob.length - padding; index2 < blob.length; index2 += 1) {
    if (blob[index2] !== "=") throw new TypeError("packed terrain indices have invalid base64 padding");
  }
}
function packedIndexCount(mesh, key) {
  const blob = mesh.indices_bin;
  if (typeof blob !== "string") return void 0;
  validateCanonicalBase64(blob, key);
  return requireCore().packedIndexCount(blob);
}
function validateTerrain(input, enforceLimit) {
  const value = input["ground-geometry"];
  if (value == null || value instanceof KernelGroup) return;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("ground-geometry must be an id-keyed mesh map");
  }
  const indexLengths = [];
  for (const [key, meshValue] of Object.entries(value)) {
    if (meshValue === null || typeof meshValue !== "object" || Array.isArray(meshValue)) {
      throw new TypeError(`ground-geometry[${JSON.stringify(key)}] must be a mesh`);
    }
    const mesh = meshValue;
    if (mesh.coordinates_bin_encoding !== void 0 || mesh.indices_bin_encoding !== void 0) {
      throw new TypeError("request terrain binary fields do not support encoding sidecars");
    }
    const hasCoordinates = typeof mesh.coordinates_bin === "string" || mesh.coordinates !== void 0;
    const hasIndices = typeof mesh.indices_bin === "string" || mesh.indices !== void 0;
    if (!hasCoordinates || !hasIndices) {
      throw new TypeError(`ground-geometry[${JSON.stringify(key)}] must be a mesh`);
    }
    const indices2 = mesh.indices;
    let indexCount = 0;
    if (typeof mesh.indices_bin === "string") indexCount = packedIndexCount(mesh, key) ?? 0;
    else if (Array.isArray(indices2)) indexCount = indices2.length;
    else if (ArrayBuffer.isView(indices2) && "length" in indices2 && typeof indices2.length === "number") {
      indexCount = indices2.length;
    }
    if (indexCount % 3 !== 0) throw new TypeError("terrain indices must contain complete triangles");
    indexLengths.push(indexCount);
  }
  if (!enforceLimit) return;
  const checked = JSON.parse(requireCore().terrainTriangleCap(Uint32Array.from(indexLengths)));
  if (checked.over_cap) {
    throw new TypeError(`ground-geometry has ${checked.triangles} triangles, exceeding the ${checked.limit} cap`);
  }
}
function validateGroundMaterials(layers) {
  if (layers === null || layers === void 0 || layers instanceof KernelGroup) return;
  if (typeof layers !== "object" || Array.isArray(layers)) {
    throw new TypeError("ground-materials must be an object of {material_name: FeatureCollection}");
  }
  const keys = Object.keys(layers);
  if (keys.length === 0) return;
  const placeholder = {};
  for (const key of keys) placeholder[key] = null;
  requireCore().validateGroundLayers(JSON.stringify(placeholder));
}
function validatePreparedAnalysisRequest(input, options = {}) {
  const type = input["analysis-type"];
  if (Object.hasOwn(input, "terrain-alignment")) {
    const grade = WIND_ANALYSIS_TYPES.has(type);
    const chosen = input["terrain-alignment"];
    if (typeof chosen !== "string" || !(grade ? GRADE_ALIGNMENT_MODES : required(fieldEnum(THERMAL_REFERENCE, "terrain-alignment"), "terrain-alignment values")).includes(chosen)) {
      throw new TypeError(grade ? "terrain-alignment must be to-ground or as-is on the wind models" : "terrain-alignment must be as-is, auto-align, or assume-aligned");
    }
  }
  const fast = present(input, FAST_FIELDS);
  if (fast.length > 0 && !modelsWithField("fast").has(type)) {
    throw new TypeError(`${fast.join(", ")} not valid on '${type}'`);
  }
  if (input.fast != null && typeof input.fast !== "boolean") {
    throw new TypeError("fast must be a Boolean");
  }
  if (typeof type === "string") enforcePhysicsPolicy(input, type);
  if (typeof type !== "string" || INTERIOR_TYPES.has(type)) return;
  if (type === "thermal-comfort-statistics") {
    const subtype = input.subtype;
    const subtypes = required(fieldEnum(TCS_MODEL, "subtype"), "subtype values");
    if (typeof subtype !== "string" || !subtypes.includes(subtype)) {
      throw new TypeError(
        `subtype (one of ${subtypes.join(", ")}) is required on 'thermal-comfort-statistics'`
      );
    }
  }
  const surface = present(input, SURFACE_FIELDS);
  if (surface.length > 0 && !modelsWithField("analysis-surfaces").has(type)) {
    throw new TypeError(`${surface.join(", ")} not valid on '${type}'`);
  }
  const terrain = present(input, TERRAIN_FIELDS);
  if (terrain.length > 0 && !modelsWithField("ground-geometry").has(type)) {
    throw new TypeError(`${terrain.join(", ")} not valid on '${type}'`);
  }
  const alignment = present(input, ALIGNMENT_FIELDS);
  if (alignment.length > 0 && !modelsWithField("terrain-alignment").has(type) && !ALIGNMENT_WIND_TYPES.includes(type)) {
    throw new TypeError(`${alignment.join(", ")} not valid on '${type}'`);
  }
  validateSensors(input);
  validateTerrain(input, options.enforceTerrainTriangleLimit === true);
  validateGroundMaterials(input["ground-materials"]);
  if (groupHasContent(input["context-geometry"]) && input["sensor-points"] == null && input["analysis-surfaces"] == null && input["ground-geometry"] == null) {
    throw new TypeError("context-geometry requires sensor-points, analysis-surfaces, or ground-geometry");
  }
}

// src/internal/weather-window.ts
function weatherWindow(filters, analysisType2) {
  const start = filters?.period?.start;
  const end = filters?.period?.end;
  const window = {
    start_month: start?.month,
    start_day: start?.day,
    start_hour: start?.hour,
    end_month: end?.month,
    end_day: end?.day,
    end_hour: end?.hour
  };
  try {
    return JSON.parse(requireCore().validateTimeWindow(JSON.stringify(window), analysisType2));
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError(`time window: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function weatherWindowJson(filters, analysisType2) {
  return JSON.stringify(weatherWindow(filters, analysisType2));
}

// src/weather-epw.ts
var WEATHER_BEARING_ANALYSES = /* @__PURE__ */ new Set([
  "thermal-comfort-index",
  "thermal-comfort-statistics",
  "solar-radiation",
  "energy-balance"
]);
var EpwParseError = class extends Error {
  /**
   * @param message - The reason the file was refused.
   * @param options - `cause` is the underlying error.
   */
  constructor(message, options) {
    super(message, options);
    this.name = "EpwParseError";
  }
};
var WeatherModelInputsError = class extends Error {
  /**
   * @param message - The reason the document cannot serve the request.
   * @param options - `cause` is the underlying error.
   */
  constructor(message, options) {
    super(message, options);
    this.name = "WeatherModelInputsError";
  }
};
function reason(error) {
  return error instanceof Error ? error.message : String(error);
}
var WeatherDocument = class {
  /**
   * @param document - The validated document, as a JSON object.
   * @throws {TypeError} when `document` is not an object.
   */
  constructor(document2) {
    this.document = document2;
    if (document2 === null || typeof document2 !== "object" || Array.isArray(document2)) {
      throw new TypeError("a weather document is a JSON object");
    }
  }
  /**
   * The versioned weather identity, `"sha256:<hex>"`.
   *
   * It covers the validated values, their order, the location, the calendar
   * columns and the hour basis, but never the file name, a station id or the
   * raw text, so two differently formatted files with the same readings
   * share one identity.
   *
   * @throws {EpwParseError} when the document has no computable identity.
   */
  get identity() {
    try {
      return requireCore().weatherIdentity(JSON.stringify(this.document));
    } catch (error) {
      throw new EpwParseError(
        `this weather document has no computable identity: ${reason(error)}`,
        { cause: error }
      );
    }
  }
  /** The EPW `LOCATION` header, as the document records it. Empty when the document has none. */
  get location() {
    return this.document.location ?? {};
  }
  /** Row count, records per hour, and whether the data is a leap year or a full year. */
  get period() {
    return this.document.period ?? {};
  }
  /** Data rows in the file, before any window is applied. */
  get rows() {
    const rows = this.period.rows;
    return typeof rows === "number" ? rows : 0;
  }
  /**
   * The snake_case arrays one analysis reads, for one time window.
   *
   * The window is applied first, then the required fields are checked on the
   * selected rows and then the period rule. A gap outside the window is
   * harmless, a gap inside it is refused, and an analysis that needs a full
   * year refuses a shorter one. Every refusal happens before a request is
   * submitted, so nothing is billed.
   *
   * `solarModel` applies to `analysisType: "energy-balance"` only; on any
   * other analysis it is refused. `"irradiance"` selects the irradiance input
   * set, which needs a full year; omitted, or `"legacy-flat"`, selects the
   * two climate arrays that model reads.
   *
   * @param request - The analysis, time window and options.
   * @returns The arrays, by field name.
   * @throws {WeatherModelInputsError} when the document cannot serve the request.
   */
  modelInputs(request) {
    const wire2 = {
      analysis_type: request.analysisType,
      time_period: weatherWindow(request.timePeriod, request.analysisType)
    };
    if (request.subtype !== void 0) wire2.subtype = request.subtype;
    if (request.solarModel !== void 0) wire2.solar_model = request.solarModel;
    try {
      return JSON.parse(
        requireCore().weatherModelInputs(JSON.stringify(this.document), JSON.stringify(wire2))
      );
    } catch (error) {
      throw new WeatherModelInputsError(
        `the weather file cannot serve ${request.analysisType} for this window: ${reason(error)}`,
        { cause: error }
      );
    }
  }
  /**
   * The file's hours inside `filters`, one record per hour: the same shape
   * `WeatherService.filterWeatherData` returns for a public station, from a
   * local file and with no network call.
   *
   * @param filters - The time window.
   * @returns One record per selected hour.
   * @throws {WeatherModelInputsError} when the file cannot be filtered to that window.
   */
  filterHours(filters) {
    const core2 = requireCore();
    try {
      return JSON.parse(
        core2.weatherRows(
          core2.weatherFilterHours(
            JSON.stringify({ weatherData: this.document.values ?? {} }),
            weatherWindowJson(filters)
          )
        )
      );
    } catch (error) {
      throw new WeatherModelInputsError(
        `this weather file cannot be filtered to that window: ${reason(error)}`,
        { cause: error }
      );
    }
  }
};
function parseEpw(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("parseEpw takes the EPW file's text; read the file first");
  }
  const wire2 = {};
  if (options.maxBytes !== void 0) wire2.max_bytes = options.maxBytes;
  if (options.maxRows !== void 0) wire2.max_rows = options.maxRows;
  try {
    return new WeatherDocument(
      JSON.parse(
        requireCore().weatherParseEpw(
          text,
          Object.keys(wire2).length === 0 ? "null" : JSON.stringify(wire2)
        )
      )
    );
  } catch (error) {
    if (error instanceof EpwParseError) throw error;
    throw new EpwParseError(`this is not a usable EPW file: ${reason(error)}`, {
      cause: error
    });
  }
}

// src/area/payload-aliases.ts
var TOP_LEVEL_ALIASES = /* @__PURE__ */ new Map([
  ["analysisType", "analysis-type"],
  ["analysisSurfaces", "analysis-surfaces"],
  ["binaryResults", "binary-results"],
  ["contextGeometry", "context-geometry"],
  ["emitCellTris", "emit-cell-tris"],
  ["groundGeometry", "ground-geometry"],
  ["groundMaterials", "ground-materials"],
  ["meshCleaning", "mesh-cleaning"],
  ["pwcCriteria", "pwc-criteria"],
  ["sensorPoints", "sensor-points"],
  ["sensorNormals", "sensor-normals"],
  ["sensorSurfaces", "sensor-surfaces"],
  ["surfaceGridSize", "surface-grid-size"],
  ["surfaceOffset", "surface-offset"],
  ["surfgridVersion", "surfgrid-version"],
  ["terrainAlignment", "terrain-alignment"],
  ["timePeriod", "time-period"],
  ["weatherFile", "weather-file"],
  ["vegetationInstances", "vegetation-instances"],
  ["windData", "wind-data"],
  ["windDirection", "wind-direction"],
  ["windSpeed", "wind-speed"],
  ["horizontalInfraredRadiationIntensity", "horizontal-infrared-radiation-intensity"],
  ["diffuseHorizontalRadiation", "diffuse-horizontal-radiation"],
  ["directNormalRadiation", "direct-normal-radiation"],
  ["globalHorizontalRadiation", "global-horizontal-radiation"],
  ["dryBulbTemperature", "dry-bulb-temperature"],
  ["relativeHumidity", "relative-humidity"],
  // Five of the six global thermal controls (WP15 / D53). `physics` is
  // deliberately absent: it is already the wire spelling, `normalizeTopLevel`
  // passes an unaliased key through unchanged, and this table has no other
  // identity row — one would read as a rule with an effect it does not have.
  // `THERMAL_CONTROLS` below is the one place the SET is written down.
  ["wallAlbedo", "wall-albedo"],
  ["wallAbsorptivity", "wall-absorptivity"],
  ["canopyTransmissivity", "canopy-transmissivity"],
  ["groundAlbedo", "ground-albedo"],
  ["groundDtMax", "ground-dt-max"]
]);
var PERIOD_ALIASES = /* @__PURE__ */ new Map([
  ["startMonth", "start-month"],
  ["startDay", "start-day"],
  ["startHour", "start-hour"],
  ["endMonth", "end-month"],
  ["endDay", "end-day"],
  ["endHour", "end-hour"]
]);
var MODEL_INPUT_NAMES = {
  horizontal_infrared_radiation_intensity: "horizontalInfraredRadiationIntensity",
  diffuse_horizontal_radiation: "diffuseHorizontalRadiation",
  direct_normal_radiation: "directNormalRadiation",
  global_horizontal_radiation: "globalHorizontalRadiation",
  dry_bulb_temperature: "dryBulbTemperature",
  wind_speed: "windSpeed",
  wind_direction: "windDirection",
  relative_humidity: "relativeHumidity"
};
var BASE = ["analysisType", "geometries", "vegetation", "groundMaterials"];
var LOCATION = ["latitude", "longitude"];
var SURFACE = [
  "analysisSurfaces",
  "sensorPoints",
  "sensorNormals",
  "contextGeometry",
  "surfaceGridSize",
  "surfaceOffset",
  "emitCellTris",
  "meshCleaning",
  "surfgridVersion"
];
var TERRAIN = ["groundGeometry", "terrainAlignment"];
var FAST = ["fast"];

// src/area/registry-pick.ts
var NOT_OFFERED = {
  "direct-sun-hours": ["min-coverage", "partial-cells", "vegetation-instances", "representative-days"],
  "daylight-availability": ["min-coverage", "partial-cells", "vegetation-instances", "representative-days"],
  "solar-radiation": ["min-coverage", "partial-cells", "vegetation-instances"],
  "thermal-comfort-index": [
    "annual-clusters",
    "annual-mode",
    "context-geometry",
    "leaf-state",
    "utci-output",
    "vegetation-instances"
  ],
  "thermal-comfort-statistics": [
    "annual-clusters",
    "annual-mode",
    "context-geometry",
    "leaf-state",
    "utci-output",
    "vegetation-instances",
    "comfort-stats-method"
  ],
  // The pair is built from the weather rows; the host writes no location here.
  "pedestrian-wind-comfort": ["latitude", "longitude", "wind-data", "wind-speed", "wind-direction"]
};
var ASSIGNED = /* @__PURE__ */ new Set(["analysis-type", "time-period"]);
var KEBAB = /-([a-z])/g;
function camelOf(wire2) {
  for (const [camel, alias] of TOP_LEVEL_ALIASES) if (alias === wire2) return camel;
  return wire2.replace(KEBAB, (_, letter) => letter.toUpperCase());
}
var aliasTables = /* @__PURE__ */ new WeakMap();
function registryAlias(key) {
  if (!/[A-Z]/.test(key)) return void 0;
  const models = registryModels();
  let table = aliasTables.get(models);
  if (table === void 0) {
    const built = /* @__PURE__ */ new Map();
    for (const model of PICK_MODELS) {
      for (const field of models.get(model)?.fields ?? []) {
        if (field.internal !== true && field.key.includes("-")) built.set(camelOf(field.key), field.key);
      }
    }
    aliasTables.set(models, built);
    table = built;
  }
  return table.get(key);
}
var PICK_MODELS = [
  "direct-sun-hours",
  "daylight-availability",
  "solar-radiation",
  "thermal-comfort-index",
  "thermal-comfort-statistics",
  "pedestrian-wind-comfort"
];
function pickKeys(model, ordered) {
  const row = registryModel(model);
  if (row === void 0) return [...ordered];
  const named = new Set(ordered.map((key) => TOP_LEVEL_ALIASES.get(key) ?? key));
  const refused = new Set(NOT_OFFERED[model] ?? []);
  const joined = [];
  for (const field of row.fields) {
    if (field.internal === true || field.group === "weather" || ASSIGNED.has(field.key)) continue;
    if (named.has(field.key) || refused.has(field.key)) continue;
    joined.push(camelOf(field.key));
  }
  return [...ordered, ...joined];
}

// src/area/surface-fields.ts
var CAMEL_SURFACE_FIELDS = {
  surfaces: "analysisSurfaces",
  cellTris: "emitCellTris",
  version: "surfgridVersion",
  cleaning: "meshCleaning"
};
var WIRE_SURFACE_FIELDS = {
  surfaces: "analysis-surfaces",
  cellTris: "emit-cell-tris",
  version: "surfgrid-version",
  cleaning: "mesh-cleaning"
};
function pinSurfaceFields(target, names) {
  if (Object.values(names).every((key) => target[key] == null)) return;
  const wire2 = JSON.parse(requireCore().surfaceWireFields(JSON.stringify({
    analysis_surfaces: target[names.surfaces] != null,
    emit_cell_tris: target[names.cellTris],
    surfgrid_version: target[names.version],
    mesh_cleaning: target[names.cleaning]
  })));
  const values = [
    [names.cellTris, wire2.emit_cell_tris],
    [names.version, wire2.surfgrid_version],
    [names.cleaning, wire2.mesh_cleaning]
  ];
  for (const [key, value] of values) {
    if (value !== null && value !== void 0) target[key] = value;
    else if (target[key] !== null) delete target[key];
  }
}

// src/area/payload.ts
function define(target, key, value) {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}
function record(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value;
}
function numeric2(value, name) {
  const result2 = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(result2)) throw new TypeError(`${name} must be numeric`);
  return result2;
}
function range(value) {
  if (typeof value !== "string" || value.length === 0) return void 0;
  const parts = value.split("-").map(Number);
  if (parts.length === 1 && Number.isFinite(parts[0])) return [parts[0], parts[0]];
  if (parts.length === 2 && parts.every(Number.isFinite)) return [parts[0], parts[1]];
  return void 0;
}
function timePeriod(filtersValue, type) {
  const filters = record(filtersValue, "dateFilters");
  const period = record(filters.period, "dateFilters.period");
  const start = record(period.start, "dateFilters.period.start");
  const end = record(period.end, "dateFilters.period.end");
  const filter = filters.filter === void 0 ? {} : record(filters.filter, "dateFilters.filter");
  const hours = range(filter.hour);
  const days = range(filter.day);
  const resolved = {
    startMonth: numeric2(start.month, "start month"),
    startDay: days?.[0] ?? numeric2(start.day, "start day"),
    startHour: hours?.[0] ?? numeric2(start.hour, "start hour"),
    endMonth: numeric2(end.month, "end month"),
    endDay: days?.[1] ?? numeric2(end.day, "end day"),
    endHour: hours?.[1] ?? numeric2(end.hour, "end hour")
  };
  weatherWindow(windowOf(resolved), type);
  return resolved;
}
function weatherColumns(value, type, period) {
  let text;
  try {
    text = requireCore("prepareAnalysisPayload").weatherColumns(
      JSON.stringify(value),
      type,
      period === void 0 ? void 0 : weatherWindowJson(windowOf(period), type)
    );
  } catch (error) {
    if (error instanceof CoreNotReadyError) throw error;
    throw new TypeError(`weatherData: ${error instanceof Error ? error.message : String(error)}`);
  }
  const output = {};
  for (const [snake, column] of Object.entries(JSON.parse(text))) {
    const camel = MODEL_INPUT_NAMES[snake];
    if (camel === void 0) throw new TypeError(`unexpected weather column ${snake}`);
    output[camel] = column;
  }
  return output;
}
function pick(input, keys) {
  const output = {};
  for (const key of keys) {
    if (input[key] !== void 0) output[key] = input[key];
  }
  return output;
}
function windowOf(period) {
  return {
    period: {
      start: {
        month: period.startMonth,
        day: period.startDay,
        hour: period.startHour
      },
      end: {
        month: period.endMonth,
        day: period.endDay,
        hour: period.endHour
      }
    }
  };
}
function kernelWeather(output, document2, type, period, subtype) {
  const columns = document2.modelInputs({
    analysisType: type,
    timePeriod: windowOf(period),
    ...subtype === void 0 ? {} : { subtype }
  });
  for (const [snake, value] of Object.entries(columns)) {
    const camel = MODEL_INPUT_NAMES[snake];
    if (camel === void 0) throw new TypeError(`unexpected weather column ${snake}`);
    output[camel] = value;
  }
}
function modelTransform(input) {
  const byoWeather = input.weather instanceof WeatherDocument ? input.weather : void 0;
  if (input.analysisType === void 0 && typeof input["analysis-type"] === "string") {
    if (byoWeather !== void 0) {
      throw new TypeError(
        "weather (a parsed EPW document) needs the camelCase input form: the wire-shaped `analysis-type` input is passed through untransformed, so no weather arrays are selected. Pass analysisType and dateFilters, or select the arrays yourself with document.modelInputs(...)."
      );
    }
    const raw = { ...input };
    pinSurfaceFields(raw, WIRE_SURFACE_FIELDS);
    return raw;
  }
  const type = input.analysisType ?? input["analysis-type"];
  if (typeof type !== "string" || type.length === 0) throw new TypeError("area input requires analysisType");
  if (THERMAL_MODELS.has(type)) validatePhysics(input);
  else rejectThermalControls(input, type);
  let output = { ...input };
  pinSurfaceFields(output, CAMEL_SURFACE_FIELDS);
  if (output.dateFilters === void 0) {
    if (byoWeather !== void 0) {
      throw new TypeError(
        "weather (a parsed EPW document) requires dateFilters: the window is what selects the hours a model reads, and without it no arrays can be built from the file."
      );
    }
    return output;
  }
  const filters = record(output.dateFilters, "dateFilters");
  const period = timePeriod(filters, type);
  if (type === "direct-sun-hours" || type === "daylight-availability") {
    if (byoWeather !== void 0) {
      throw new TypeError(
        `${type} takes no weather arrays; a parsed EPW document is only an input to solar-radiation, thermal-comfort-index and thermal-comfort-statistics`
      );
    }
    output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "accuracy", ...SURFACE, ...TERRAIN, ...FAST]));
    output.timePeriod = period;
    return output;
  }
  if (byoWeather !== void 0) {
    if (output.weatherData !== void 0) {
      throw new TypeError(
        "pass either weather (a parsed EPW document) or weatherData (catalog records), never both: the SDK does not choose which weather was meant"
      );
    }
    if (output.solarModel !== void 0) {
      throw new TypeError(
        "solarModel is not an area-request field: this SDK cannot submit an interior-irradiance run yet. To VALIDATE a file against that model's required set and its full-year rule, call document.modelInputs({ analysisType, timePeriod, solarModel }) directly."
      );
    }
    const subtype = typeof output.subtype === "string" ? output.subtype : void 0;
    if (type === "solar-radiation") {
      output = pick(output, pickKeys(type, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]));
    } else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
      output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS, ...FAST]));
    } else {
      throw new TypeError(
        `${type} takes no weather arrays; a parsed EPW document is only an input to solar-radiation, thermal-comfort-index and thermal-comfort-statistics`
      );
    }
    output.timePeriod = period;
    kernelWeather(output, byoWeather, type, period, subtype);
    return output;
  }
  if (output.weatherData === void 0) throw new TypeError(`${type} requires weatherData`);
  const weather = output.weatherData;
  if (type === "pedestrian-wind-comfort") {
    output = pick(output, pickKeys(type, [...BASE, "criteria"]));
  } else if (type === "solar-radiation") {
    output = pick(output, pickKeys(type, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]));
    output.timePeriod = period;
  } else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
    output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS, ...FAST]));
    output.timePeriod = period;
  } else {
    throw new TypeError(`unsupported analysis type ${type}`);
  }
  Object.assign(output, weatherColumns(weather, type, period));
  return output;
}
function wirePeriod(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
  const output = {};
  for (const [key, item] of Object.entries(value)) define(output, PERIOD_ALIASES.get(key) ?? key, item);
  return output;
}
function normalizeTopLevel(input, preserveNullish) {
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (!preserveNullish && (value === null || value === void 0)) continue;
    const target = TOP_LEVEL_ALIASES.get(key) ?? registryAlias(key) ?? key;
    if (Object.hasOwn(output, target)) throw new TypeError(`conflicting aliases for ${target}`);
    const plain = ArrayBuffer.isView(value) && !(value instanceof DataView) ? Array.from(value) : value;
    define(output, target, target === "time-period" ? wirePeriod(plain) : plain);
  }
  return output;
}
function prepareAnalysisPayload(input) {
  const source = record(input, "analysis input");
  validatePreparedAnalysisRequest(normalizeTopLevel(source, true));
  const explicitWire = source.analysisType === void 0 && typeof source["analysis-type"] === "string";
  const transformed = modelTransform(source);
  const output = normalizeTopLevel(transformed, explicitWire);
  validatePreparedAnalysisRequest(output);
  return output;
}
var prepareAreaPayload = prepareAnalysisPayload;

// src/area/unknown-request-keys.ts
function dropUnknownRequestKeys(payload, logger) {
  const model = payload["analysis-type"];
  if (typeof model !== "string") return;
  const row = registryModel(model);
  if (row === void 0) return;
  const inert = new Set(requireCore().inertKeys(model));
  for (const key of Object.keys(payload)) {
    if (key === "analysis-type" || row.byKey.has(key) || inert.has(key)) continue;
    delete payload[key];
    logger.warn({
      event: "ignored_unknown_request_key",
      analysisType: model,
      key,
      message: `ignored unknown request key ${JSON.stringify(key)} for ${model} (run option? pass it in runAreaAndWait options)`
    });
  }
}

// src/area/context-options.ts
function contextKey(options) {
  return requireCore().contextKey(siteOptionsJson(options));
}
function siteOptionsJson(options) {
  const value = (v) => typeof v === "number" && !Number.isFinite(v) ? String(v) : v;
  return JSON.stringify({
    terrain_margin_m: value(options.terrainMarginM),
    context_reach_m: value(options.contextReachM),
    context_buffer_m: value(options.contextBufferM)
  });
}
function contextOptions(options) {
  return {
    ...options.contextReachM === void 0 ? {} : { contextReachM: options.contextReachM },
    ...options.contextBufferM === void 0 ? {} : { contextBufferM: options.contextBufferM }
  };
}
function warnContextHole(warning, logger) {
  if (warning !== void 0) (logger ?? consoleLogger).warn(warning);
}

// src/area/site-pack.ts
function plainCoordinates(mesh) {
  if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh)) return void 0;
  const coordinates = mesh.coordinates;
  const flat = Array.isArray(coordinates) || coordinates instanceof Float64Array || coordinates instanceof Float32Array ? coordinates : void 0;
  if (flat === void 0) return void 0;
  if (flat.length === 0 || flat.length % 3 !== 0) return void 0;
  return flat;
}
function words(value) {
  return Array.isArray(value) || value instanceof Uint32Array ? value : void 0;
}
function pack(meshes, keepUnreadable) {
  const ids = [];
  const blocks = [];
  const triangles = [];
  const offsets = [0];
  const indexOffsets = [0];
  const stripped = /* @__PURE__ */ Object.create(null);
  let total = 0;
  let indexTotal = 0;
  for (const [id, mesh] of Object.entries(meshes)) {
    const coordinates2 = plainCoordinates(mesh);
    const triangle = keepUnreadable ? words(mesh?.indices) : [];
    const readable = coordinates2 !== void 0 && triangle !== void 0;
    if (!readable && !keepUnreadable) continue;
    const block = readable ? coordinates2 : [];
    ids.push(id);
    blocks.push(block);
    triangles.push(readable ? triangle : []);
    total += block.length;
    indexTotal += readable ? triangle.length : 0;
    offsets.push(total);
    indexOffsets.push(indexTotal);
    if (!keepUnreadable) stripped[id] = { ...mesh, coordinates: void 0 };
  }
  const coordinates = new Float64Array(total);
  const indices2 = new Uint32Array(indexTotal);
  blocks.forEach((block, mesh) => {
    coordinates.set(block, offsets[mesh]);
    indices2.set(triangles[mesh], indexOffsets[mesh]);
  });
  return {
    ids,
    coordinates,
    bytes: new Uint8Array(coordinates.buffer),
    offsets: Uint32Array.from(offsets),
    indices: indices2,
    indexOffsets: Uint32Array.from(indexOffsets),
    document: keepUnreadable ? "" : JSON.stringify(stripped, typedAsArray)
  };
}

// src/internal/geometry-reuse/fingerprint.ts
function contentFingerprint(value) {
  const numberView = new Float64Array(1);
  const numberWords = new Uint32Array(numberView.buffer);
  let lane1 = 2166136261;
  let lane2 = 2538058380;
  const mix = (word) => {
    lane1 = Math.imul(lane1 ^ word, 2246822507);
    lane1 ^= lane1 >>> 13;
    lane2 = Math.imul(lane2 ^ word, 3266489909);
    lane2 ^= lane2 >>> 16;
    lane2 = lane2 + lane1 | 0;
  };
  const mixString = (text) => {
    mix(text.length);
    for (let index2 = 0; index2 < text.length; index2 += 1) mix(text.charCodeAt(index2));
  };
  const walk = (item) => {
    if (typeof item === "number") {
      numberView[0] = item;
      mix(1);
      mix(numberWords[0]);
      mix(numberWords[1]);
      return true;
    }
    if (typeof item === "string") {
      mix(2);
      mixString(item);
      return true;
    }
    if (item === null) {
      mix(3);
      return true;
    }
    if (typeof item === "boolean") {
      mix(item ? 4 : 5);
      return true;
    }
    if (item === void 0) {
      mix(6);
      return true;
    }
    if (typeof item !== "object" || "toJSON" in item) return false;
    if (Array.isArray(item)) {
      if (Object.getPrototypeOf(item) !== Array.prototype) return false;
      mix(7);
      mix(item.length);
      for (let index2 = 0; index2 < item.length; index2 += 1) {
        if (!walk(item[index2])) return false;
      }
      return true;
    }
    const prototype = Object.getPrototypeOf(item);
    if (prototype !== Object.prototype && prototype !== null) return false;
    mix(8);
    const record3 = item;
    for (const key in record3) {
      const field = Object.getOwnPropertyDescriptor(record3, key);
      if (field === void 0 || !("value" in field)) return false;
      mixString(key);
      if (!walk(record3[key])) return false;
    }
    mix(9);
    return true;
  };
  try {
    if (!walk(value)) return void 0;
  } catch {
    return void 0;
  }
  return `${(lane1 >>> 0).toString(16)}:${(lane2 >>> 0).toString(16)}`;
}

// src/area/site-terrain.ts
var freed = /* @__PURE__ */ new WeakSet();
function release2(terrain) {
  freed.add(terrain);
  terrain.free();
}
function liveTerrain(terrain) {
  return terrain === void 0 || freed.has(terrain) ? void 0 : terrain;
}
var MAX_TERRAINS = 2;
var byKey = /* @__PURE__ */ new Map();
var keyMemo = /* @__PURE__ */ new WeakMap();
function terrainKey(value, texts) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  if (Object.keys(value).length === 0) return void 0;
  const cached2 = keyMemo.get(value);
  const fingerprint = cached2 === void 0 ? void 0 : contentFingerprint(value);
  if (fingerprint !== void 0 && cached2?.fingerprint === fingerprint) return cached2.key;
  const text = JSON.stringify(value, typedAsArray);
  texts?.set(value, text);
  const key = requireCore().terrainContentKey(text);
  keyMemo.set(value, { fingerprint, key });
  return key;
}
function siteTerrain(value, key, texts) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  if (key === void 0 || Object.keys(value).length === 0) return void 0;
  let terrain = byKey.get(key);
  if (terrain === void 0) {
    try {
      terrain = new (requireCore()).SiteTerrain(texts?.get(value) ?? JSON.stringify(value, typedAsArray));
    } catch {
      return void 0;
    }
  }
  byKey.delete(key);
  byKey.set(key, terrain);
  for (const [key2, old] of byKey) {
    if (byKey.size <= MAX_TERRAINS) break;
    byKey.delete(key2);
    release2(old);
  }
  return terrain;
}

// src/area/site-kernel.ts
function document(value, texts) {
  if (value === void 0) return void 0;
  const known = value !== null && typeof value === "object" ? texts?.get(value) : void 0;
  return known ?? JSON.stringify(value, typedAsArray);
}
var NO_BUFFER = new Uint32Array(0);
function kernelSite(inputs, texts) {
  const { groups, tiles, polygon } = inputs;
  const buildings = pack(asMap(groups.geometries), false);
  const context = pack(asMap(groups["context-geometry"]), true);
  const contextIndices = groups["context-geometry"] === void 0 ? NO_BUFFER : context.indices;
  const contextIndexOffsets = groups["context-geometry"] === void 0 ? NO_BUFFER : context.indexOffsets;
  const config = getTilingConfig(inputs.analysisType);
  const origin = kernelPolygonOrigin(polygon);
  const terrain = liveTerrain(inputs.terrain);
  if (terrain !== void 0) {
    return requireCore().Site.withTerrain(
      buildings.ids,
      buildings.bytes,
      buildings.offsets,
      context.ids,
      context.bytes,
      context.offsets,
      Uint32Array.from(tiles, (tile) => tile.row),
      Uint32Array.from(tiles, (tile) => tile.col),
      tiles.map((tile) => tile.tileId),
      config.inferenceSizeM,
      config.contextSizeM,
      config.stepM,
      origin.lon,
      origin.lat,
      groups.geometries === void 0 ? void 0 : buildings.document,
      void 0,
      document(groups.vegetation, texts),
      document(groups["ground-materials"], texts),
      JSON.stringify(polygon),
      terrain,
      contextIndices,
      contextIndexOffsets,
      siteOptions(inputs)
    );
  }
  return new (requireCore()).Site(
    buildings.ids,
    buildings.bytes,
    buildings.offsets,
    context.ids,
    context.bytes,
    context.offsets,
    Uint32Array.from(tiles, (tile) => tile.row),
    Uint32Array.from(tiles, (tile) => tile.col),
    tiles.map((tile) => tile.tileId),
    config.inferenceSizeM,
    config.contextSizeM,
    config.stepM,
    origin.lon,
    origin.lat,
    groups.geometries === void 0 ? void 0 : buildings.document,
    void 0,
    document(groups["ground-geometry"], texts),
    document(groups.vegetation, texts),
    document(groups["ground-materials"], texts),
    JSON.stringify(polygon),
    contextIndices,
    contextIndexOffsets,
    siteOptions(inputs)
  );
}
function siteOptions(inputs) {
  return siteOptionsJson({
    terrainMarginM: inputs.terrainContextMarginM,
    contextReachM: inputs.contextReachM,
    contextBufferM: inputs.contextBufferM
  });
}
var release3 = typeof FinalizationRegistry === "function" ? new FinalizationRegistry((inner) => inner.free()) : void 0;
function asMap(value) {
  if (value === null || value === void 0 || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

// src/internal/pool-task.ts
async function settled(task) {
  if (task.done) return;
  const words2 = new Int32Array(requireCoreMemory().buffer);
  const alive = setInterval(() => {
  }, 1 << 30);
  try {
    while (!task.done) {
      const wait = Atomics.waitAsync(words2, task.flag >>> 2, 0);
      if (wait.async) await wait.value;
    }
  } finally {
    clearInterval(alive);
  }
}
var MAX_IN_FLIGHT = 1;
var inFlight = 0;
var waiting3 = [];
async function poolCall(start, end) {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise((resolve) => waiting3.push(resolve));
  inFlight += 1;
  try {
    const task = start();
    try {
      await settled(task);
      return end(task);
    } finally {
      task.free();
    }
  } finally {
    inFlight -= 1;
    waiting3.shift()?.();
  }
}
function poolCallSync(start, end) {
  const task = start();
  try {
    if (!task.done) {
      const words2 = new Int32Array(requireCoreMemory().buffer);
      while (!task.done) Atomics.wait(words2, task.flag >>> 2, 0);
    }
    return end(task);
  } finally {
    task.free();
  }
}

// src/area/site-facade-calls.ts
function facadeFramesCall(withKernel, index2, batches, parts) {
  const limits = parts.artifact?.limits;
  const tiles = Uint32Array.from(batches, () => index2);
  const counts = Uint32Array.from(batches, (ids2) => ids2.length);
  const ids = batches.flatMap((group) => [...group]);
  const site = requireCore().Site;
  const capture = parts.capture;
  if (capture !== void 0) {
    return {
      start: () => withKernel((inner) => inner.facadeCapturesStart(
        tiles,
        counts,
        ids,
        capture.alignment ?? void 0,
        capture.store
      )),
      end: (task) => site.facadeCapturesEnd(task).map((item) => {
        const error = item.error;
        return error === void 0 ? { capture: item } : { error };
      })
    };
  }
  return {
    start: () => withKernel((inner) => inner.facadeFramesStart(
      tiles,
      counts,
      ids,
      parts.body === true,
      false,
      false,
      void 0,
      parts.artifact !== void 0,
      BigInt(limits?.maxGeometryBytes ?? 0),
      limits?.maxMetadataBytes ?? 0,
      BigInt(limits?.maxMeshes ?? 0),
      BigInt(limits?.maxInstances ?? 0)
    )),
    end: (task) => site.facadeFramesEnd(task).map((frame) => {
      if (frame.error !== void 0) return { error: frame.error };
      const { body, artifact } = frame;
      return {
        ...body === void 0 ? {} : { body },
        ...artifact === void 0 ? {} : {
          artifact: {
            archive: artifact.archive,
            artifactDigest: artifact.artifactDigest,
            geometryContentDigest: artifact.contentDigest,
            encoding: artifact.encoding,
            targetIds: artifact.targetIds
          }
        }
      };
    })
  };
}

// src/area/site-facade-scene.ts
function mapFacadeScenes(raw) {
  const scenes = raw.scenes.map((scene) => ({
    archive: scene.archive,
    artifactDigest: scene.artifactDigest,
    geometryContentDigest: scene.contentDigest,
    encoding: scene.encoding
  }));
  const jobs = raw.jobs.map((job) => {
    if (job.error !== void 0) return { error: job.error };
    if (job.targets !== void 0) return { targets: job.targets, targetIds: job.targetIds ?? [] };
    const artifact = job.artifact;
    return {
      artifact: {
        archive: artifact.archive,
        artifactDigest: artifact.artifactDigest,
        geometryContentDigest: artifact.contentDigest,
        encoding: artifact.encoding,
        targetIds: artifact.targetIds
      }
    };
  });
  return { scenes, jobs };
}

// src/area/site-assign.ts
var ARENA_GROUPS = [
  "geometries",
  "context-geometry",
  "ground-geometry",
  "vegetation",
  "ground-materials"
];
var SiteAssignment = class _SiteAssignment {
  constructor(tiles, arena, present2, carried, inner, inputs) {
    this.tiles = tiles;
    this.arena = arena;
    this.present = present2;
    this.carried = carried;
    this.inner = inner;
    this.inputs = inputs;
  }
  artifacts = /* @__PURE__ */ new Map();
  /** The kernel's warning for the context hole (D293). */
  contextWarning;
  /** Point trees without z when the site has terrain, else 0. */
  treesWithoutZ = 0;
  /**
   * Keep the kernel site from now on, reading it once more when a JSON run
   * built this answer without it. A facade run asks the kept site for its
   * batches and its selected bodies (`area/site-facade.ts`).
   */
  keepKernel() {
    if (this.inner !== void 0) return true;
    if (release3 === void 0 || this.inputs === void 0) return false;
    this.inner = kernelSite(this.inputs);
    release3.register(this, this.inner);
    this.inputs = void 0;
    return true;
  }
  shareFacadeParts(analyses) {
    this.inner?.shareFacadeParts(analyses);
  }
  /** Run `use` on the kept kernel site, or on a fresh read that is freed after. */
  withKernel(use) {
    const inner = this.inner ?? kernelSite(this.inputs);
    try {
      return use(inner);
    } finally {
      if (this.inner === void 0) inner.free();
    }
  }
  /**
   * Read the site once: the kernel prepares every layer in one crossing and
   * answers the membership and the bodies from them.
   *
   * `keepKernelSite`: a BINARY run keeps the kernel site for the artifacts it will encode at
   * submit time, and a FACADE run for its batches and bodies (`area/site-facade.ts`), freed
   * with this object. A grid JSON run frees it before this returns — a run that never encodes
   * holds no wasm memory. A realm without `FinalizationRegistry` always frees it here.
   */
  static read(groups, tiles, polygon, analysisType2, terrainContextMarginM, keepKernelSite = false, texts, terrain, contextReachM, contextBufferM) {
    const inputs = {
      groups,
      tiles,
      polygon,
      analysisType: analysisType2,
      terrainContextMarginM,
      contextReachM,
      contextBufferM,
      ...terrain === void 0 ? {} : { terrain }
    };
    const inner = kernelSite(inputs, texts);
    let kept = false;
    try {
      const answers = JSON.parse(inner.allTileIds()).map((ids) => ({
        members: ids.members,
        core: ids.core,
        shrinkBand: ids.shrink_band,
        demoted: ids.demoted,
        context: ids.context
      }));
      const present2 = new Set(ARENA_GROUPS.filter((group) => groups[group] !== void 0));
      const carried = Object.keys(groups).filter((group) => present2.has(group));
      const keep = keepKernelSite && release3 !== void 0;
      const site = keep ? new _SiteAssignment(answers, void 0, present2, carried, inner, void 0) : new _SiteAssignment(
        answers,
        inner.bodies(0, tiles.length),
        present2,
        carried,
        void 0,
        inputs
      );
      site.contextWarning = inner.contextWarning();
      site.treesWithoutZ = inner.treesWithoutZ();
      if (keep && release3 !== void 0) {
        release3.register(site, inner);
        kept = true;
      }
      return site;
    } finally {
      if (!kept) inner.free();
    }
  }
  /** One tile's group, or `undefined` when the run does not carry it. */
  group(tile, name) {
    if (!this.present.has(name)) return void 0;
    const arena = this.arena ??= this.withKernel((inner) => inner.bodies(0, this.tiles.length));
    const slot = tile * ARENA_GROUPS.length + ARENA_GROUPS.indexOf(name);
    const hash = arena.hashes[slot];
    return {
      bytes: arena.bytes.subarray(arena.offsets[slot], arena.offsets[slot + 1]),
      hash: hash === "" ? void 0 : hash
    };
  }
  /**
   * Every tile's presence mask (bit `i` for `ARENA_GROUPS[i]`: carried AND not
   * empty) and its `geometries` / `context-geometry` group hashes, two per
   * tile, `""` for none, without writing a body. Read once and kept.
   */
  identity() {
    return this.#identity ??= this.withKernel((inner) => inner.identity(0, this.tiles.length));
  }
  #identity;
  /**
   * One tile's artifact (D101), encoded on the first ask for THAT tile and
   * kept: one kernel crossing per tile (#816, D277), so the first job uploads
   * after its own encode, not after the encode of every tile. Never a facade
   * batch's (D156).
   */
  tileArtifact(index2, limits) {
    if (!Number.isSafeInteger(index2) || index2 < 0 || index2 >= this.tiles.length) {
      throw new RangeError(`tile index ${index2} is outside the site`);
    }
    const key = [
      limits.maxGeometryBytes,
      limits.maxMetadataBytes,
      limits.maxMeshes,
      limits.maxInstances
    ].join("\n");
    let tiles = this.artifacts.get(key);
    if (tiles === void 0) {
      tiles = /* @__PURE__ */ new Map();
      this.artifacts.set(key, tiles);
    }
    let artifact = tiles.get(index2);
    if (artifact === void 0) {
      const encoding = this.encode(index2, limits);
      artifact = encoding;
      tiles.set(index2, encoding);
      encoding.catch(() => {
        if (tiles.get(index2) === encoding) tiles.delete(index2);
      });
    }
    return artifact;
  }
  /**
   * The parts of every facade batch of tile `index`, from ONE kernel call
   * that builds the tile once (`Site.facadeFrames`, WP3): the batch's targets
   * in `geometries`, the rest of the tile in `context-geometry` (D156).
   * Nothing is kept here — `area/site-facade.ts` hands each part out once.
   */
  facadeFrames(index2, batches, parts) {
    const call = facadeFramesCall((use) => this.withKernel(use), index2, batches, parts);
    return poolCall(call.start, call.end);
  }
  /** The bodies of `batches`, now: a JSON body is read synchronously (blocks in the threaded core). */
  facadeBodies(index2, batches) {
    const call = facadeFramesCall((use) => this.withKernel(use), index2, batches, { body: true });
    return poolCallSync(call.start, call.end);
  }
  /**
   * One tile's facade scenes (#602): one shared frame for every batch of
   * `batches`, and each batch's job as a range into it, or its own frame.
   * `site-facade-scene.ts` shapes the kernel's raw answer.
   */
  async facadeScenes(index2, batches, limits) {
    const raw = await poolCall(() => this.withKernel((inner) => inner.facadeScenesStart(
      Uint32Array.from(batches, () => index2),
      Uint32Array.from(batches, (ids) => ids.length),
      batches.flatMap((ids) => [...ids]),
      BigInt(limits.maxGeometryBytes),
      limits.maxMetadataBytes,
      BigInt(limits.maxMeshes),
      BigInt(limits.maxInstances)
    )), (task) => requireCore().Site.facadeScenesEnd(task));
    return mapFacadeScenes(raw);
  }
  async encode(index2, limits) {
    const encoded = await poolCall(() => this.withKernel((inner) => inner.artifactsStart(
      index2,
      index2 + 1,
      BigInt(limits.maxGeometryBytes),
      limits.maxMetadataBytes,
      BigInt(limits.maxMeshes),
      BigInt(limits.maxInstances)
    )), (task) => requireCore().Site.artifactsEnd(task));
    return {
      archive: encoded.bytes.subarray(encoded.offsets[0], encoded.offsets[1]),
      artifactDigest: encoded.artifactDigests[0],
      geometryContentDigest: encoded.contentDigests[0],
      encoding: encoded.encodings[0]
    };
  }
};

// src/area/site-facade-scene-frames.ts
async function pickSceneArtifact(cache2, fetched, key, wanted, index2, fetch2) {
  let pending2 = cache2.get(key);
  if (pending2 === void 0 && !fetched.has(key) && wanted.includes(index2)) {
    pending2 = fetch2(wanted);
    cache2.set(key, pending2);
    fetched.add(key);
    pending2.catch(() => {
      if (cache2.get(key) === pending2) cache2.delete(key);
      fetched.delete(key);
    });
  }
  const ready = pending2 === void 0 ? void 0 : await pending2;
  let result2 = ready?.get(index2);
  if (result2 === void 0) {
    const indices2 = wanted.includes(index2) ? wanted : [index2];
    result2 = (await fetch2(indices2)).get(index2);
  }
  ready?.delete(index2);
  if (ready?.size === 0 && cache2.get(key) === pending2) cache2.delete(key);
  if (result2 === void 0) throw new Error(`facade scene: no job for batch ${index2}`);
  if (result2 instanceof Error) throw result2;
  return result2;
}

// src/area/site-facade.ts
function savedBatches(schedule2, tiles) {
  const index2 = new Map(tiles.map((tile, position) => [tile.tileId, position]));
  const records = [];
  for (const [key, activeIds] of Object.entries(schedule2.batchMembership ?? {})) {
    const tileId = key.split("#batch")[0] ?? key;
    const tileIndex = index2.get(tileId);
    if (tileIndex === void 0) throw new Error(`retry schedule batch ${key} names no tile of this grid`);
    const count2 = schedule2.batchSensorCounts?.[key];
    records.push({
      tile_index: tileIndex,
      key,
      active_ids: [...activeIds],
      ...count2 === void 0 ? {} : { sensor_count: count2 }
    });
  }
  return records;
}
var CALLER_FIELDS = [
  ["surface-grid-size", "grid_size"],
  ["surface-offset", "offset"],
  ["partial-cells", "partial_cells"],
  ["min-coverage", "min_coverage"],
  // #555: the plan counts with the same cleaning the server runs.
  ["mesh-cleaning", "mesh_cleaning"]
];
function facadeRequest(payload, tiles, retryFrom, maxSensorsPerJob, packing) {
  const request = {
    policy_version: 2,
    mode: payload["analysis-surfaces"],
    auto_align: payload["terrain-alignment"] === "auto-align"
  };
  for (const [wire2, key] of CALLER_FIELDS) {
    if (payload[wire2] !== void 0 && payload[wire2] !== null) request[key] = payload[wire2];
  }
  request.saved = retryFrom === void 0 ? null : savedBatches(retryFrom, tiles);
  if (maxSensorsPerJob !== void 0) request.max_sensors_per_job = maxSensorsPerJob;
  if (packing !== void 0 && packing !== "regular") request.packing = packing;
  return request;
}
function kernelOf(site) {
  if (site.withKernel === void 0) throw new Error("facade planning needs the kernel site");
  site.keepKernel?.();
  return site;
}
async function planFacadeRecords(site, tileCount, selected, request, slice) {
  const text = JSON.stringify(request);
  const kernel = kernelOf(site);
  const out = /* @__PURE__ */ new Map();
  for (let index2 = 0; index2 < tileCount; index2 += 1) {
    if (!selected.has(index2)) continue;
    await slice.tick();
    const records = await poolCall(() => kernel.withKernel((inner) => inner.facadeBatchesStart(index2, index2 + 1, text)), (task) => requireCore().Site.facadeBatchesEnd(task));
    out.set(index2, JSON.parse(records));
  }
  return out;
}
var TARGET_GROUPS = /* @__PURE__ */ new Set(["geometries", "context-geometry"]);
var TileFrames = class {
  constructor(site, tile, records, submits) {
    this.site = site;
    this.tile = tile;
    this.records = records;
    this.wanted = records.flatMap((record3, at) => submits(record3) ? [at] : []);
  }
  shared = /* @__PURE__ */ new Map();
  written;
  handed = /* @__PURE__ */ new Map();
  /** Scene-mode (#602) answers, by limits key, handed out once like `handed`. */
  scenes = /* @__PURE__ */ new Map();
  /** Keys `scenes` already fetched the full `wanted` list for once (#602 review). */
  scenesFetched = /* @__PURE__ */ new Set();
  /** The batches the plan submits, by index: only these are written ahead. */
  wanted;
  batch(index2, group) {
    if (this.written?.[index2] !== void 0) return this.read(index2, group);
    const indices2 = this.wanted.includes(index2) ? this.wanted : [index2];
    if (this.site.facadeBodies === void 0) throw new Error("facade jobs need the kernel site");
    const answered = this.site.facadeBodies(this.tile, indices2.map((at) => this.records[at].active_ids));
    this.written ??= [];
    for (const [at, frame] of answered.entries()) {
      if (this.written[indices2[at]] !== void 0) continue;
      this.written[indices2[at]] = this.texts(frame);
    }
    return this.read(index2, group);
  }
  read(index2, group) {
    const texts = this.written[index2];
    if (texts instanceof Error) throw texts;
    if (TARGET_GROUPS.has(group)) return texts.get(group);
    return this.shared.get(group);
  }
  texts(frame) {
    if (frame.error !== void 0) return new Error(frame.error);
    const arena = frame.body;
    const texts = /* @__PURE__ */ new Map();
    for (const [slot, name] of ARENA_GROUPS.entries()) {
      const start = arena.offsets[slot];
      const end = arena.offsets[slot + 1];
      if (!TARGET_GROUPS.has(name) && this.shared.has(name)) continue;
      const hash = arena.hashes[slot];
      const text = end > start ? { bytes: arena.bytes.slice(start, end), hash: hash === "" ? void 0 : hash } : { bytes: new TextEncoder().encode("{}"), hash: void 0 };
      if (TARGET_GROUPS.has(name)) texts.set(name, text);
      else this.shared.set(name, text);
    }
    return texts;
  }
  tileGroup(group) {
    if (!this.shared.has(group)) this.batch(this.wanted[0] ?? 0, group);
    return this.shared.get(group);
  }
  async capture(index2, alignment, store) {
    return (await this.once(index2, `capture
${alignment}`, { capture: { alignment, store } })).capture;
  }
  /**
   * The batch's binary artifact. With `limits.facadeTargets` (#602), scene
   * mode: the tile's jobs share ONE uploaded scene and each carries its own
   * target range. Without it (an old server, no `facadeTargets`), one
   * artifact per batch, as before.
   */
  async artifact(index2, limits) {
    if ((limits.facadeTargets ?? 0) >= 1) return this.sceneArtifact(index2, limits);
    const key = [
      "artifact",
      limits.maxGeometryBytes,
      limits.maxMetadataBytes,
      limits.maxMeshes,
      limits.maxInstances
    ].join("\n");
    return (await this.once(index2, key, { artifact: { limits } })).artifact;
  }
  /** Batch `index`'s facade-scene artifact (#602); the cache logic is
   * {@link pickSceneArtifact} (`site-facade-scene-frames.ts`). */
  sceneArtifact(index2, limits) {
    const key = [
      "scene",
      limits.maxGeometryBytes,
      limits.maxMetadataBytes,
      limits.maxMeshes,
      limits.maxInstances
    ].join("\n");
    return pickSceneArtifact(
      this.scenes,
      this.scenesFetched,
      key,
      this.wanted,
      index2,
      (indices2) => this.scenesFor(indices2, limits)
    );
  }
  /** One `facadeScenes` call over `indices`, mapped to this batch's artifact.
   * A tile answer is uniform (D218): every job `targets` (scene), every job
   * `artifact`, or every job `error` (a refusal). The first job's shape
   * decides which of the three this answer is. */
  async scenesFor(indices2, limits) {
    if (this.site.facadeScenes === void 0) throw new Error("facade scenes need the kernel site");
    const active3 = indices2.map((at) => this.records[at].active_ids);
    const answer = await this.site.facadeScenes(this.tile, active3, limits);
    const out = /* @__PURE__ */ new Map();
    if (answer.jobs[0]?.error !== void 0) {
      indices2.forEach((at, position) => out.set(at, new Error(answer.jobs[position].error)));
      return out;
    }
    if (answer.jobs[0]?.targets !== void 0) {
      const scene = answer.scenes[0];
      indices2.forEach((at, position) => {
        const job = answer.jobs[position];
        out.set(at, {
          archive: scene.archive,
          artifactDigest: scene.artifactDigest,
          geometryContentDigest: scene.geometryContentDigest,
          encoding: scene.encoding,
          targetIds: job.targetIds ?? [],
          targets: { start: job.targets.start, count: job.targets.count }
        });
      });
      return out;
    }
    indices2.forEach((at, position) => out.set(at, answer.jobs[position].artifact));
    return out;
  }
  /**
   * Batch `index`'s part under `key`. The first ask writes it for every
   * batch of the tile that the plan submits (a retry's other batches are not
   * written); each is handed out once and then dropped, so an artifact or a
   * capture is not kept after its job took it. What a stopped run leaves is
   * at most the untaken parts of the tiles it had started.
   */
  async once(index2, key, parts) {
    let pending2 = this.handed.get(key);
    if (pending2 === void 0 && this.wanted.includes(index2)) {
      const wanted = this.wanted;
      pending2 = this.frames(wanted, parts).then((frames) => new Map(frames.map((frame2, at) => [wanted[at], frame2])));
      this.handed.set(key, pending2);
      pending2.catch(() => {
        if (this.handed.get(key) === pending2) this.handed.delete(key);
      });
    }
    const ready = pending2 === void 0 ? void 0 : await pending2;
    let frame = ready?.get(index2);
    if (frame === void 0) frame = (await this.frames([index2], parts))[0];
    ready?.delete(index2);
    if (ready?.size === 0 && this.handed.get(key) === pending2) this.handed.delete(key);
    if (frame.error !== void 0) throw new Error(frame.error);
    return frame;
  }
  frames(indices2, parts) {
    if (this.site.facadeFrames === void 0) throw new Error("facade jobs need the kernel site");
    return this.site.facadeFrames(this.tile, indices2.map((at) => this.records[at].active_ids), parts);
  }
};
function facadeTileBase(base, carried, location) {
  const value = { ...base };
  for (const group of carried) value[group] = void 0;
  if (location !== void 0) {
    value.latitude = location.latitude;
    value.longitude = location.longitude;
  }
  return value;
}
function facadeBatchesForTile(value, tileId, tileIndex, records, site, answer, present2, submits = () => true) {
  if (records.length === 0) return [];
  site.withKernel((inner) => inner.checkTerrain(tileIndex, tileIndex + 1));
  const bodies = new TileFrames(site, tileIndex, records, submits);
  const carried = site.carried ?? [];
  const tileGroups = /* @__PURE__ */ new Map();
  for (const [slot, group] of ARENA_GROUPS.entries()) {
    if (TARGET_GROUPS.has(group) || !carried.includes(group)) continue;
    tileGroups.set(group, new KernelGroup(() => bodies.tileGroup(group), (present2 & 1 << slot) === 0));
  }
  return records.map((record3, index2) => {
    const count2 = record3.sensor_count;
    if (count2 === null || !Number.isSafeInteger(count2) || count2 < 1) throw new Error("invalid exact sensor count");
    if (record3.active_ids.length === 0) throw new Error(`exact batch membership does not match tile ${tileId}`);
    const payload = { ...value };
    for (const [group, kernel] of tileGroups) payload[group] = kernel;
    payload.geometries = new KernelGroup(() => bodies.batch(index2, "geometries"), false, record3.active_ids);
    const moved = answer.members.length > record3.active_ids.length;
    payload["context-geometry"] = new KernelGroup(
      () => bodies.batch(index2, "context-geometry"),
      !(answer.context.length > 0 || moved)
    );
    return {
      key: record3.key,
      buildingIds: [...record3.active_ids],
      sensorCount: count2,
      payload,
      capture: (alignment, store) => bodies.capture(index2, alignment, store),
      ...site.facadeFrames === void 0 ? {} : {
        artifact: (limits) => bodies.artifact(index2, limits)
      }
    };
  });
}

// src/area/retry-plan.ts
function planAreaRetry(input) {
  const raw = requireCore().planAreaRetry(JSON.stringify(input));
  return JSON.parse(raw);
}
function areaIdempotencyKey(runId, jobKey, attempt) {
  return requireCore().areaIdempotencyKey(runId, jobKey, attempt);
}
function freshRunId() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// src/area/plan-entries.ts
function retryIncludesTile(tileId, retry) {
  if (retry === void 0 || retry.has(tileId)) return true;
  for (const key of retry) if (key.startsWith(`${tileId}#batch`)) return true;
  return false;
}
async function buildEntries(tiles, input, slice) {
  const { service, options, analysisType: analysisType2, base, composed, byId, site, surfaceFields } = input;
  const retryFrom = options.retryFrom;
  const entries3 = [];
  const batchMembership = { ...retryFrom?.batchMembership ?? {} };
  const batchSensorCounts = { ...retryFrom?.batchSensorCounts ?? {} };
  const extraPositions = [];
  const tileLocation = requireCore().tileLocationApplies(analysisType2);
  const facadeRecords = surfaceFields ? await planFacadeRecords(site, tiles.length, new Set(tiles.flatMap((tile, index2) => retryIncludesTile(tile.tileId, input.retry) ? [index2] : [])), input.facadeRequest, slice) : void 0;
  for (const [index2, tile] of tiles.entries()) {
    if (!retryIncludesTile(tile.tileId, input.retry)) continue;
    await slice.tick();
    const detail = byId.get(tile.tileId);
    const location = detail && tileLocation ? detail.centroid : void 0;
    const answer = site.tiles[index2];
    if (surfaceFields && answer === void 0) {
      throw new Error(`tile ${JSON.stringify(tile.tileId)} has no site assignment`);
    }
    let payloads;
    if (surfaceFields && answer !== void 0) {
      const records = facadeRecords?.get(index2) ?? [];
      const value = facadeTileBase(base, site.carried ?? [], location);
      payloads = facadeBatchesForTile(
        value,
        tile.tileId,
        index2,
        records,
        site,
        answer,
        site.identity().present[index2] ?? 0,
        (record3) => input.retry === void 0 || input.retry.has(record3.key)
      );
    } else {
      const value = { ...base };
      if (composed === void 0) Object.assign(value, kernelGroups(site, index2));
      else Object.assign(value, composed[tile.tileId] ?? {});
      if (location !== void 0) {
        value.latitude = location.latitude;
        value.longitude = location.longitude;
      }
      payloads = [{ key: tile.tileId, payload: value }];
    }
    for (const batch of payloads) {
      const targets = "buildingIds" in batch ? batch.buildingIds : void 0;
      if ("buildingIds" in batch) {
        batchMembership[batch.key] = batch.buildingIds;
        batchSensorCounts[batch.key] = batch.sensorCount;
        if (retryFrom === void 0 && batch.key !== tile.tileId) {
          extraPositions.push({ ...tile, tileId: batch.key });
        }
      }
      if (input.retry !== void 0 && !input.retry.has(batch.key)) continue;
      const prepared = service.prepareSubmission(analysisType2, batch.payload, {
        transport: areaTransport(options, analysisType2),
        ...options.webhookUrl === void 0 ? {} : { webhookUrl: options.webhookUrl },
        ...options.webhookEvents === void 0 ? {} : { webhookEvents: options.webhookEvents }
      });
      entries3.push({
        key: batch.key,
        row: tile.row,
        col: tile.col,
        idempotencyKey: areaIdempotencyKey(input.runId, batch.key, input.attemptFor(batch.key)),
        prepared: {
          ...prepared,
          reuseScope: input.reuseScope(batch.key),
          // A facade batch uploads ITS OWN selection (D156): its targets in
          // `geometries`, the rest of the tile as context — the body the plan
          // counted sensors for. The unsplit tile artifact (D101) made the
          // server synthesize sensors on every member of the tile. Grid
          // tiles keep the shared tile artifact.
          ..."artifact" in batch && batch.artifact !== void 0 ? { artifact: batch.artifact } : targets === void 0 ? tileArtifactFor(site, index2) : {}
        },
        ..."capture" in batch ? { capture: batch.capture } : {}
      });
    }
  }
  return { entries: entries3, batchMembership, batchSensorCounts, extraPositions };
}
function kernelGroups(site, index2) {
  const answer = site.tiles[index2];
  const groups = {};
  for (const group of site.carried ?? []) {
    const slot = ARENA_GROUPS.indexOf(group);
    const empty = group === "geometries" && answer !== void 0 ? answer.members.length === 0 : group === "context-geometry" && answer !== void 0 ? answer.context.length === 0 : () => ((site.identity().present[index2] ?? 0) & 1 << slot) === 0;
    groups[group] = new KernelGroup(() => site.group(index2, group), empty);
  }
  return groups;
}
function tileArtifactFor(site, index2) {
  return site.tileArtifact === void 0 ? {} : {
    artifact: (limits) => site.tileArtifact(index2, limits)
  };
}

// src/internal/geometry-reuse/identity.ts
var IDENTITY_SPACE = "geometry-group-transport-v1";
function hasContent(value) {
  if (value instanceof KernelGroup) return groupHasContent(value);
  if (value === null || value === void 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}
async function envelopeIdentity(name, exact, kernelHash) {
  const contentDigest = await sha256Hex(exact);
  if (contentDigest === void 0) return void 0;
  const material = canonicalJsonBytes({
    content_digest: contentDigest,
    group: name,
    kernel_group_hash: kernelHash,
    namespace: IDENTITY_SPACE,
    version: 1
  });
  if (material === void 0) return void 0;
  const digest = await sha256Hex(material);
  return digest === void 0 ? void 0 : `ggid1:${digest}`;
}
async function identityFor(name, exact) {
  let kernelHash;
  try {
    kernelHash = requireCore().geometryGroupHash(name, new TextDecoder().decode(exact));
  } catch {
    return void 0;
  }
  if (typeof kernelHash !== "string" || kernelHash.length === 0) return void 0;
  return envelopeIdentity(name, exact, kernelHash);
}
async function groupIdentity(name, value) {
  const snapshot = canonicalSnapshot(value);
  if (snapshot === void 0) return void 0;
  return { value: snapshot.value, bytes: snapshot.bytes, identity: await identityFor(name, snapshot.bytes) };
}
var memo = /* @__PURE__ */ new WeakMap();
function rememberGroup(name, value, bytes, hash) {
  memo.set(value, { name, bytes, hash });
}
async function arenaIdentity(value, group) {
  const identity = group.hash === void 0 ? void 0 : await envelopeIdentity(group.name, group.bytes, group.hash);
  return { value, bytes: group.bytes, identity };
}
async function kernelIdentity(name, value) {
  const { bytes, hash } = value.text();
  const identity = hash === void 0 ? void 0 : await envelopeIdentity(name, bytes, hash);
  return { value, bytes, identity };
}
function memoised(name, value) {
  if (value instanceof KernelGroup) {
    const entry2 = memo.get(value);
    if (entry2 instanceof Promise) return entry2;
    const pending3 = kernelIdentity(name, value);
    memo.set(value, pending3);
    return pending3;
  }
  if (value === null || typeof value !== "object") return groupIdentity(name, value);
  const entry = memo.get(value);
  if (entry instanceof Promise) return entry;
  if (entry !== void 0 && !("pending" in entry)) {
    const pending3 = arenaIdentity(value, entry);
    memo.set(value, pending3);
    return pending3;
  }
  const fingerprint = entry === void 0 ? void 0 : contentFingerprint(value);
  if (fingerprint !== void 0 && entry?.name === name && entry.fingerprint === fingerprint) {
    return entry.pending;
  }
  const pending2 = groupIdentity(name, value);
  memo.set(value, { name, fingerprint, pending: pending2 });
  return pending2;
}
async function prepareGeometryGroups(body) {
  let registry;
  try {
    registry = requireCore().geometryGroups();
  } catch {
    return { body, identities: {}, bytes: {} };
  }
  const ownedBody = { ...body };
  const identities = {};
  const bytes = {};
  for (const row of registry) {
    if (typeof row.name !== "string" || !hasContent(body[row.name])) continue;
    const group = await memoised(row.name, body[row.name]);
    if (group === void 0) continue;
    ownedBody[row.name] = group.value;
    bytes[row.name] = group.bytes;
    if (group.identity !== void 0) identities[row.name] = group.identity;
  }
  return { body: ownedBody, identities, bytes };
}
var encoder5 = new TextEncoder();
var OPEN = Uint8Array.of(123);
var CLOSE = Uint8Array.of(125);
function selectedDocumentParts(prepared, groups) {
  const parts = [OPEN];
  for (const name of Object.keys(groups).sort()) {
    const value = prepared.bytes[name];
    if (value === void 0) return void 0;
    parts.push(encoder5.encode(`${parts.length === 1 ? "" : ","}${JSON.stringify(name)}:`), value);
  }
  parts.push(CLOSE);
  return parts;
}
var GROUPS_FIELD = "geometry-$ref-groups";
function bodyWithReference(body, groups, url) {
  const output = {};
  for (const [name, value] of Object.entries(body)) {
    if (!Object.hasOwn(groups, name)) Object.defineProperty(output, name, {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  }
  Object.defineProperty(output, "geometry-$ref", {
    configurable: true,
    enumerable: true,
    value: url,
    writable: true
  });
  const declared = Object.keys(groups).sort();
  if (declared.length > 0) {
    Object.defineProperty(output, GROUPS_FIELD, {
      configurable: true,
      enumerable: true,
      value: declared,
      writable: true
    });
  }
  return output;
}

// src/area/composition.ts
var WASM_USIZE_MAX2 = 4294967295;
var SUPPORTED = [
  "geometries",
  "context-geometry",
  "ground-geometry",
  "vegetation",
  "ground-materials"
];
var BINARY_MESH_FIELDS = [
  "coordinates_bin",
  "coordinates_bin_encoding",
  "indices_bin",
  "indices_bin_encoding"
];
function rejectBinaryMeshes(key, data) {
  if (key !== "geometries" && key !== "context-geometry" && key !== "ground-geometry") return;
  if (data === null || typeof data !== "object" || Array.isArray(data)) return;
  for (const mesh of Object.values(data)) {
    if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh)) continue;
    for (const field of BINARY_MESH_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(mesh, field)) {
        throw new TypeError(`${key} must use JSON mesh coordinates for area tiling`);
      }
    }
  }
}
function checkedIndex(value, field) {
  if (!Number.isSafeInteger(value) || value < 0 || value > WASM_USIZE_MAX2) {
    throw new TypeError(`${field} must be an integer from 0 through ${WASM_USIZE_MAX2}`);
  }
  return value;
}
function registeredNames() {
  const records = Array.from(requireCore().geometryGroups());
  return new Set(records.map((record3) => record3.name).filter((name) => typeof name === "string"));
}
function composeTilePayloads(groups, tiles, polygon, options = {}) {
  const run = beginCompose(groups, tiles, polygon, options);
  for (let index2 = 0; index2 < tiles.length; index2 += 1) run.tile(index2);
  return run.payloads;
}
var decoder4 = new TextDecoder();
function beginCompose(groups, tiles, polygon, options = {}, keepKernelSite = false, texts, rememberWire = false, terrain) {
  const tileInput = tiles.map((tile) => ({
    row: checkedIndex(tile.row, "tile row"),
    col: checkedIndex(tile.col, "tile col"),
    tileId: tile.tileId
  }));
  const registered = registeredNames();
  const present2 = [];
  for (const [key, data] of Object.entries(groups)) {
    if (!registered.has(key)) throw new TypeError(`unknown geometry group '${key}'`);
    if (!SUPPORTED.includes(key)) {
      throw new TypeError(`geometry group '${key}' has no area tiling policy`);
    }
    rejectBinaryMeshes(key, data);
    present2.push(key);
  }
  if (groups["ground-geometry"] !== void 0 && options.terrainContext === void 0) {
    throw new TypeError("terrainContext is required for ground-geometry");
  }
  const site = SiteAssignment.read(
    groups,
    tileInput,
    polygon,
    options.analysisType ?? void 0,
    options.terrainContext?.margin_m,
    keepKernelSite,
    texts,
    terrain,
    options.contextReachM,
    options.contextBufferM
  );
  const payloads = {};
  return {
    site,
    payloads,
    tile(index2) {
      const tile = tiles[index2];
      if (tile === void 0) throw new RangeError(`tile index ${index2} is outside the grid`);
      const payload = {};
      for (const group of present2) {
        const written = site.group(index2, group);
        if (written === void 0) continue;
        if (rememberWire) {
          const text = { bytes: written.bytes, hash: written.hash };
          payload[group] = new KernelGroup(() => text, written.bytes.length === 2);
          continue;
        }
        const value = JSON.parse(decoder4.decode(written.bytes));
        rememberGroup(group, value, written.bytes, written.hash);
        payload[group] = value;
      }
      payloads[tile.tileId] = payload;
    }
  };
}

// src/area/plan-layers.ts
var GROUP_KEYS = [
  "geometries",
  "context-geometry",
  "ground-geometry",
  "vegetation",
  "ground-materials"
];
function acquiredLayer(value, attribute, layer, analysisTypes) {
  checkReadMargin(value, layer, analysisTypes);
  const record3 = value;
  const inner = record3[attribute];
  return typeof record3.readMarginM === "number" && inner !== void 0 ? inner : value;
}
function geometryGroups(payload, options, polygon, analysisTypes) {
  if (options.buildings?.fetch === true) {
    throw new TypeError("buildings: {fetch: true} requires the AOI buildings service");
  }
  const groups = {};
  for (const key of GROUP_KEYS) {
    const value = payload[key];
    if (value !== void 0) groups[key] = value;
  }
  if (options.buildings !== void 0) {
    checkReadMargin(options.buildings, "buildings", analysisTypes);
    groups.geometries = siteFrameBuildings(
      options.buildings,
      polygon
    );
  }
  if (options.vegetation !== void 0) {
    groups.vegetation = acquiredLayer(options.vegetation, "features", "trees", analysisTypes);
  }
  if (options.groundMaterials !== void 0) {
    groups["ground-materials"] = acquiredLayer(
      options.groundMaterials,
      "layers",
      "ground materials",
      analysisTypes
    );
  }
  validateGroundMaterials(groups["ground-materials"]);
  return groups;
}
function indexed(grid) {
  const tiles = [];
  const byId = /* @__PURE__ */ new Map();
  for (let row = 0; row < grid.length; row += 1) {
    const line = grid[row] ?? [];
    for (let col = 0; col < line.length; col += 1) {
      const tile = line[col];
      if (!tile || tile.empty) continue;
      tiles.push({ row, col, tileId: tile.tileId });
      byId.set(tile.tileId, tile);
    }
  }
  return { tiles, byId };
}
async function composeTiles(groups, tiles, polygon, options, slice) {
  await slice.pause();
  const run = beginCompose(groups, tiles, polygon, {
    analysisType: options.analysisType,
    terrainContext: { margin_m: options.terrainContextMarginM },
    ...options.contextReachM === void 0 ? {} : { contextReachM: options.contextReachM },
    ...options.contextBufferM === void 0 ? {} : { contextBufferM: options.contextBufferM }
  }, options.keepKernelSite ?? false, options.texts, true, options.terrain);
  let parsed;
  const composed = (tileSlice) => parsed ??= (async () => {
    for (let index2 = 0; index2 < tiles.length; index2 += 1) {
      await tileSlice.tick();
      run.tile(index2);
    }
    return run.payloads;
  })().catch((error) => {
    parsed = void 0;
    throw error;
  });
  return { composed, site: run.site };
}
function rejectFullyDroppedTargets(groups, site) {
  const requested = groups.geometries;
  if (requested === void 0 || Object.keys(requested).length === 0) return;
  if (!site.tiles.some((tile) => tile.members.length > 0)) {
    throw new TypeError("all requested target geometries are malformed or outside the area");
  }
}

// src/to-grade.ts
var TO_GROUND = "to-ground";
var AS_IS = "as-is";
function takesGradeDrop(analysisType2) {
  return typeof analysisType2 === "string" && WIND_ANALYSIS_TYPES.has(analysisType2);
}
function dropMeshesToGrade(meshes) {
  const ids = Object.keys(meshes);
  if (ids.length === 0) return meshes;
  const blocks = ids.map((id) => plainCoordinates(meshes[id]) ?? []);
  const offsets = new Uint32Array(ids.length + 1);
  let total = 0;
  for (let slot = 0; slot < blocks.length; slot += 1) {
    total += blocks[slot].length;
    offsets[slot + 1] = total;
  }
  const bytes = new Uint8Array(total * 8);
  const view = new DataView(bytes.buffer);
  let at = 0;
  for (const block of blocks) {
    for (const value of block) {
      view.setFloat64(at, value, true);
      at += 8;
    }
  }
  const { coordinates, removed } = requireCore().dropToGrade(bytes, offsets);
  if (!removed.some((value) => value !== 0)) return meshes;
  const values = new Float64Array(coordinates.slice().buffer);
  const out = { ...meshes };
  for (let slot = 0; slot < ids.length; slot += 1) {
    if (removed[slot] === 0) continue;
    const id = ids[slot];
    const mesh = meshes[id];
    out[id] = {
      ...mesh,
      coordinates: Array.from(values.subarray(offsets[slot], offsets[slot + 1]))
    };
  }
  return out;
}
function consumeGradeOption(payload) {
  if (!takesGradeDrop(payload["analysis-type"])) return void 0;
  const chosen = payload["terrain-alignment"] ?? AS_IS;
  delete payload["terrain-alignment"];
  return chosen;
}
function dropSiteToGrade(groups, chosen) {
  if (chosen !== TO_GROUND) return groups;
  const meshes = groups.geometries;
  if (meshes === null || typeof meshes !== "object" || Array.isArray(meshes)) return groups;
  const dropped = dropMeshesToGrade(meshes);
  return dropped === meshes ? groups : { ...groups, geometries: dropped };
}

// src/area/prepared-site.ts
var MAX_SITES = 4;
function acquisitionContent(name, value, inner) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  const record3 = value;
  const margin = [record3.readMarginM ?? null, record3.analysisType ?? null];
  if (name === "buildings") {
    const acquired = acquiredBuildings(value);
    return acquired === void 0 ? void 0 : { document: acquired.buildings, meta: JSON.stringify([acquired.origin, ...margin]) };
  }
  const document2 = inner === void 0 ? void 0 : record3[inner];
  if (typeof record3.readMarginM !== "number" || document2 === null || typeof document2 !== "object") {
    return void 0;
  }
  return { document: document2, meta: JSON.stringify(margin) };
}
function preparedSiteKey(inputs, texts, ground = terrainKey(inputs.payload["ground-geometry"], texts), memo2) {
  const { payload, options, polygon, config } = inputs;
  const meta = [];
  const layer = (name, given, inner) => {
    if (given === void 0) return void 0;
    const content = acquisitionContent(name, given, inner);
    if (content !== void 0) meta.push(content.meta);
    const document2 = content?.document ?? given;
    const text = JSON.stringify(document2, typedAsArray);
    if (document2 !== null && typeof document2 === "object") texts?.set(document2, text);
    return text;
  };
  let source = payload.geometries;
  if (options.buildings !== void 0) {
    const acquired = acquisitionContent("buildings", options.buildings, void 0);
    if (acquired !== void 0) meta.push(acquired.meta);
    source = acquired?.document ?? options.buildings;
  }
  const vegetation = layer("vegetation", options.vegetation ?? payload.vegetation, "features");
  const materials = layer("groundMaterials", options.groundMaterials ?? payload["ground-materials"], "layers");
  const family = JSON.stringify([
    config.inferenceSizeM,
    config.contextSizeM,
    config.stepM,
    inputs.terrainContextMarginM,
    options.maxTilesOverride ?? null,
    inputs.grade ?? null,
    meta,
    payload["context-geometry"] === void 0 ? null : contextKey(options)
    // D293
  ]);
  const groups = [meshDigest(source, memo2?.meshes), contextDigest(payload, memo2?.groups)];
  return requireCore().siteKey(
    "[]",
    NO_F64,
    ZERO,
    NO_U32,
    ZERO,
    "[]",
    NO_F64,
    ZERO,
    NO_U32,
    ZERO,
    JSON.stringify(groups),
    void 0,
    ground,
    vegetation,
    materials,
    NO_U32,
    NO_U32,
    "[]",
    NO_F64,
    JSON.stringify(polygon),
    family
  );
}
function siteKeyMemo() {
  return { meshes: /* @__PURE__ */ new WeakMap(), groups: /* @__PURE__ */ new WeakMap() };
}
function contextDigest(payload, memo2) {
  const context = payload["context-geometry"];
  if (context === null || typeof context !== "object" || Array.isArray(context)) return null;
  return `${kernelGroupHashOnce(String(payload["analysis-type"]), "context-geometry", context, memo2)}:${JSON.stringify(Object.keys(context))}`;
}
var NO_F64 = new Float64Array(0);
var NO_U32 = new Uint32Array(0);
var ZERO = Uint32Array.of(0);
function meshDigest(source, memo2) {
  if (source === null || typeof source !== "object" || Array.isArray(source)) return null;
  const known = memo2?.get(source);
  if (known !== void 0) return known;
  const group = pack(source, false);
  const digest = requireCore().siteKey(
    JSON.stringify(group.ids),
    group.coordinates,
    group.offsets,
    NO_U32,
    ZERO,
    "[]",
    NO_F64,
    ZERO,
    NO_U32,
    ZERO,
    group.document,
    void 0,
    void 0,
    void 0,
    void 0,
    NO_U32,
    NO_U32,
    "[]",
    NO_F64,
    "null",
    "buildings"
  );
  memo2?.set(source, digest);
  return digest;
}
async function buildPreparedSite(inputs, analysisType2, tiles, slice, texts, terrain) {
  const { payload, options, polygon } = inputs;
  const groups = dropSiteToGrade(
    geometryGroups(payload, options, polygon, [analysisType2]),
    inputs.grade
  );
  const { composed, site } = await composeTiles(
    groups,
    tiles,
    polygon,
    {
      analysisType: analysisType2,
      terrainContextMarginM: inputs.terrainContextMarginM,
      ...contextOptions(options),
      // A binary run encodes artifacts from the kernel site (WS2, D136); a facade
      // run plans its batches and writes its bodies from it (`area/site-facade.ts`).
      keepKernelSite: areaTransport(options, analysisType2) === "binary" || payload["analysis-surfaces"] != null,
      ...texts === void 0 ? {} : { texts },
      ...terrain === void 0 ? {} : { terrain }
    },
    slice
  );
  rejectFullyDroppedTargets(groups, site);
  warnContextHole(site.contextWarning, options.logger);
  return { composed, answers: site };
}
function abortReason(signal) {
  return signal.reason ?? new DOMException("aborted", "AbortError");
}
var PreparedSiteCache = class {
  /** @param maxSites - How many sites to keep; default 4. */
  constructor(maxSites = MAX_SITES) {
    this.maxSites = maxSites;
  }
  sites = /* @__PURE__ */ new Map();
  /**
   * Returns the site under `key`, built by `build` when no caller has built it yet.
   *
   * With an undefined `key` the site is built every time and not kept. A caller that arrives
   * while a build is in flight awaits that build. If the build fails, the failure is the
   * builder's own (its stop signal, or an input it alone reported), so a waiter that was not
   * itself stopped builds for itself rather than inherit it.
   *
   * @param key - The content key (see `preparedSiteKey`), or `undefined` to build without caching.
   * @param build - Builds the site.
   * @param signal - Cancels a caller that is waiting on another caller's build.
   * @returns The prepared site.
   */
  async get(key, build, signal) {
    if (key === void 0) return build();
    for (; ; ) {
      const pending2 = this.sites.get(key);
      if (pending2 === void 0) return this.build(key, build);
      try {
        const site = await pending2;
        if (this.sites.get(key) === pending2) {
          this.sites.delete(key);
          this.sites.set(key, pending2);
        }
        return site;
      } catch {
        if (signal?.aborted) throw abortReason(signal);
      }
    }
  }
  /** How many sites are held. */
  get size() {
    return this.sites.size;
  }
  /** Release every prepared site; returns how many were held. */
  clear() {
    const count2 = this.sites.size;
    this.sites.clear();
    return count2;
  }
  async build(key, build) {
    const pending2 = build();
    this.sites.set(key, pending2);
    try {
      return await pending2;
    } catch (error) {
      if (this.sites.get(key) === pending2) this.sites.delete(key);
      throw error;
    } finally {
      for (const other of this.sites.keys()) {
        if (this.sites.size <= this.maxSites) break;
        if (this.sites.get(other) !== pending2) this.sites.delete(other);
      }
    }
  }
};
var shared = new PreparedSiteCache();
function preparedSites() {
  return shared;
}
function freePreparedSites() {
  return shared.clear();
}

// src/area/site-identity-guard.ts
var MISMATCH = "retryFrom site identity mismatch: geometry or layer inputs changed. Retry with the original immutable inputs or start a fresh run.";
var UNVERIFIABLE = "retryFrom cannot verify site identity in this runtime (the current site inputs cannot be hashed, for example no crypto.subtle). Run in a runtime that can hash them, or start a fresh run.";
var SITE_IDENTITY_PREFIX = "site2:";
var OLD_KEY = "retryFrom site identity: the schedule was written by an older SDK, whose site key this SDK no longer computes (D297). Start a fresh run.";
function refuseOldSiteIdentity(...identities) {
  if (identities.some((id) => id !== void 0 && !id.startsWith(SITE_IDENTITY_PREFIX))) throw new Error(OLD_KEY);
}
var LEGACY_SCHEDULE_EVENT = "area.resume.site_identity_missing";
var legacyWarned = false;
function warnLegacyScheduleOnce(logger) {
  if (legacyWarned) return;
  legacyWarned = true;
  const message = "retryFrom schedule has no site identity (written by an older SDK), so the SDK cannot prove that trees, ground materials and per-building overrides are unchanged. Resuming without that check.";
  if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
    process.emitWarning(message, { type: "Warning", code: LEGACY_SCHEDULE_EVENT });
  } else {
    logger.warn(`${LEGACY_SCHEDULE_EVENT}: ${message}`);
  }
}
function checkPaidRetrySiteIdentity(prior, current, willSubmit, logger = consoleLogger) {
  if (prior === void 0) return;
  if (!willSubmit) {
    if (prior.siteIdentity === void 0) warnLegacyScheduleOnce(logger);
    if (prior.siteIdentity !== void 0) {
      if (current === void 0) throw new Error(UNVERIFIABLE);
      refuseOldSiteIdentity(prior.siteIdentity);
      if (prior.siteIdentity !== current) throw new Error(MISMATCH);
    }
    return;
  }
  if (prior.siteIdentity === void 0 || current === void 0) {
    throw new Error("retryFrom schedule has no provable site identity; old schedules may be polled and merged, but failed tiles cannot be retried safely. Start a fresh run.");
  }
  refuseOldSiteIdentity(prior.siteIdentity);
  if (prior.siteIdentity !== current) {
    throw new Error(MISMATCH);
  }
}

// src/area/sensor-cap.ts
function checkFacadeSensorCap(options) {
  try {
    requireCore().checkSensorCap(
      options.maxSensorsPerJob,
      options.retryFrom !== void 0,
      options.retryFrom?.maxSensorsPerJob
    );
  } catch (error) {
    throw new RangeError(`maxSensorsPerJob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/client-types.ts
var AreaTimeoutError = class extends Error {
  /** The run's counts at the moment it timed out. */
  areaState;
  /**
   * @param message - The error message.
   * @param areaState - The run's counts at the moment it timed out.
   */
  constructor(message, areaState) {
    super(message);
    this.name = "AreaTimeoutError";
    this.areaState = areaState;
  }
};

// src/area/run-errors.ts
var AreaRunError = class extends Error {
  /**
   * @param message - The error message.
   * @param failedKeys - Tiles with no job, and tiles whose job failed on the server.
   * @param lostKeys - Tiles whose job succeeded and whose result did not download.
   * @param uncertainKeys - Tiles that may have a job the SDK cannot name.
   * @param failedJobs - The job ids of the failed and the lost tiles that have one.
   * @param totalJobs - The number of jobs the run made.
   */
  constructor(message, failedKeys, lostKeys, uncertainKeys, failedJobs, totalJobs) {
    super(message);
    this.failedKeys = failedKeys;
    this.lostKeys = lostKeys;
    this.uncertainKeys = uncertainKeys;
    this.failedJobs = failedJobs;
    this.totalJobs = totalJobs;
  }
  name = "AreaRunError";
};
var JobPollError = class extends Error {
  /**
   * @param message - The error message.
   * @param status - The HTTP status of the refused status request.
   */
  constructor(message, status2) {
    super(message);
    this.status = status2;
  }
  name = "JobPollError";
};
function finalError(outcome, facts, analysisType2, areaTimeoutS, state) {
  const text = requireCore().areaFinalError(outcome, JSON.stringify(facts), analysisType2, areaTimeoutS);
  if (text === void 0 || text === null) return void 0;
  const error = JSON.parse(text);
  if (error.kind === "area_timeout") return new AreaTimeoutError(error.message, state());
  return new AreaRunError(
    error.message,
    error.failed_keys,
    error.lost_keys,
    error.uncertain_keys,
    error.failed_jobs,
    error.total_jobs
  );
}
function engineStopError(error, pollError) {
  const stop = JSON.parse(requireCore().engineStop(String(error?.message ?? error)));
  if (stop.kind === "poll_refused") return new JobPollError(stop.message, stop.status ?? 0);
  if (stop.kind === "host_poll_error" && pollError !== void 0) return pollError.error;
  return error;
}

// src/area/run-engine.ts
function us(seconds) {
  return seconds === void 0 || !Number.isFinite(seconds) || seconds < 0 ? {} : { retry_after_us: Math.round(seconds * 1e6) };
}
var now2 = () => Math.round(performance.now() * 1e3);
var MAX_TIMER_MS = 2 ** 31 - 1;
var EngineDriver = class {
  handle;
  inbox = [];
  kick = () => {
  };
  inFlight = /* @__PURE__ */ new Set();
  stopped = false;
  /** Records a job a batch submit accepted (the engine's `accepted`), before any other action. */
  onAccepted = () => {
  };
  constructor(config) {
    this.handle = new (requireCore()).RunEngine(JSON.stringify({
      ...config,
      seed: Math.floor(Math.random() * 2 ** 32) >>> 0
    }));
  }
  /** The error of the last status request that had no request outcome. */
  pollError;
  /**
   * One engine step. An error of the engine is classified by the kernel
   * (`engineStop`): a refused status request is a `JobPollError`, a status
   * request with no outcome throws that request's own error.
   */
  step(events) {
    try {
      return this.handle.step(now2(), JSON.stringify(events));
    } catch (error) {
      throw engineStopError(error, this.pollError);
    }
  }
  /** An event for the next wake (`taken` from the consumer). */
  push(event) {
    this.inbox.push(event);
    this.kick();
  }
  /** Stop the run: no new request; the requests in flight end and their answers count. */
  stop() {
    this.stopped = true;
    this.kick();
  }
  /** The facts of analysis `a` now. */
  facts(a) {
    return JSON.parse(this.handle.facts(a));
  }
  /**
   * Run until every analysis is finished or `signal` aborts. `io` does one
   * action's IO with the action's own signal (aborted when `signal` aborts)
   * and resolves with its raw answer; `onFinish` hands an
   * analysis over; `onSweep` runs after each status answer. The handle is
   * freed after every IO has settled.
   */
  async run(plans, signal, io, onFinish, onSweep) {
    for (const plan of plans) this.inbox.push({ kind: "planned", ...plan });
    let open = plans.length;
    const children = /* @__PURE__ */ new Set();
    const wake = () => {
      for (const child of children) child.abort(signal.reason);
      this.kick();
    };
    signal.addEventListener("abort", wake, { once: true });
    let thrown = true;
    try {
      while (open > 0 && !signal.aborted && !this.stopped) {
        const events = this.inbox.splice(0);
        const step2 = JSON.parse(this.step(events));
        if (onSweep !== void 0 && events.some((e) => e.kind === "sweep")) onSweep();
        for (const act of step2.actions) {
          if (act.kind === "finish") {
            open -= 1;
            onFinish(act);
            continue;
          }
          if (act.kind === "accepted") {
            this.onAccepted(act);
            continue;
          }
          const child = new AbortController();
          if (signal.aborted) child.abort(signal.reason);
          children.add(child);
          const work = io(act, child.signal).then((event) => this.push(event), (error) => {
            if (act.kind === "poll") this.pollError = { error };
            this.push({ kind: "host_error", action: act, message: String(error) });
          });
          this.inFlight.add(work);
          void work.finally(() => {
            this.inFlight.delete(work);
            children.delete(child);
          });
        }
        if (this.inbox.length > 0 || open === 0) continue;
        let timer;
        await new Promise((resolve) => {
          this.kick = resolve;
          if (step2.wake_at_us !== null) {
            timer = setTimeout(resolve, Math.min(MAX_TIMER_MS, Math.max(0, step2.wake_at_us / 1e3 - performance.now())));
          }
        });
        clearTimeout(timer);
        this.kick = () => {
        };
      }
      thrown = false;
    } finally {
      signal.removeEventListener("abort", wake);
      while (this.inFlight.size > 0) await Promise.allSettled([...this.inFlight]);
      if (thrown) this.handle.free();
    }
    try {
      try {
        const last = JSON.parse(this.handle.step(now2(), JSON.stringify([
          ...this.inbox.splice(0),
          { kind: "abort" }
        ])));
        for (const act of last.actions) if (act.kind === "accepted") this.onAccepted(act);
      } catch {
      }
      return plans.map((_, a) => this.facts(a));
    } finally {
      this.handle.free();
    }
  }
};
function retryPolicy() {
  const raw = JSON.parse(requireCore().retryPolicy());
  return {
    submitMaxSends: raw.submit_max_sends,
    maxAttempts: raw.max_attempts,
    failureAdvice: raw.failure_advice
  };
}

// src/internal/idempotent-dispatch.ts
async function dispatchKeyed(options) {
  return options.gateway.requestBytesWithHeaders(options.endpointPath, {
    method: "POST",
    headers: options.headers,
    body: options.body,
    acceptHttpErrors: true,
    ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
}

// src/internal/upload.ts
function signedHttps(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new TypeError("presigned upload URL must be an absolute HTTPS URL");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new TypeError("presigned upload URL must be uncredentialed HTTPS without a fragment");
  }
  return url.href;
}
async function uploadPresignedZip(input, content, options) {
  const url = signedHttps(input);
  requireTimeout(options.timeoutMs);
  const limits = sendLimits(content.byteLength, options.timeoutMs);
  const sender = bodySenderFor(options.fetch, { url });
  const deadline = new Deadline(options.signal, options.timeoutMs);
  let dispatched = false;
  try {
    const response = await deadline.wait(() => {
      dispatched = true;
      return sendBody(sender, options.fetch, {
        url,
        method: "PUT",
        headers: new Headers({ "Content-Type": "application/zip" }),
        body: content,
        credentials: "omit"
      }, limits, deadline);
    });
    if (response.status >= 300 && response.status < 400) {
      cancelResponseBody(response);
      throw new TransportError("presigned upload received a redirect", "response", "http", "PUT", response.status);
    }
    if (!response.ok) {
      cancelResponseBody(response);
      throw new TransportError(`presigned upload received HTTP ${response.status}`, "response", "http", "PUT", response.status);
    }
    await deadline.wait(() => response.arrayBuffer());
  } catch (error) {
    if (error instanceof TransportError) throw error;
    const stopped = deadline.reason();
    throw new TransportError(
      stopped === "timeout" ? `presigned upload timed out (${stopDetail(deadline, limits)})` : stopped === "aborted" ? "presigned upload was aborted" : "presigned upload failed",
      dispatched ? "unknown-acceptance" : "pre-dispatch",
      stopped ?? (dispatched ? "network" : "validation"),
      "PUT"
    );
  } finally {
    deadline.close();
  }
}

// src/internal/submission.ts
var SubmissionUncertainError = class extends Error {
  constructor(acceptedJobIds2, status2) {
    super(status2 === void 0 ? "job submission returned an invalid accepted response" : `job submission received HTTP ${status2}; the job may already exist`);
    this.acceptedJobIds = acceptedJobIds2;
    this.status = status2;
  }
  name = "SubmissionUncertainError";
  /** Always `"unknown-acceptance"`. */
  phase = "unknown-acceptance";
  /** The HTTP status when the answer was a redirect (3xx) or a server error (5xx), otherwise `undefined`. */
  status;
};
var AcceptedResponseError = class extends Error {
  name = "AcceptedResponseError";
};
var GeometryReferenceRejectedError = class extends Error {
  constructor(code) {
    super("geometry reference was rejected before job acceptance");
    this.code = code;
  }
  name = "GeometryReferenceRejectedError";
};
var GATEWAY_SIZE_MESSAGES = /* @__PURE__ */ new Set([
  "Request Too Long",
  "HTTP content length exceeded 10485760 bytes"
]);
var PRE_ACCEPT_REF_REJECTIONS = /* @__PURE__ */ new Map([
  [400, /* @__PURE__ */ new Set(["REF_INVALID_ENVELOPE", "REF_HOST_NOT_ALLOWED"])],
  [413, /* @__PURE__ */ new Set(["REF_TOO_LARGE"])],
  [415, /* @__PURE__ */ new Set(["REF_CONTENT_TYPE_REJECTED"])],
  [422, /* @__PURE__ */ new Set([
    "REF_GEOMETRY_OVERLAP",
    "REF_GEOMETRY_UNKNOWN_GROUP",
    "REF_GEOMETRY_NESTED",
    "REF_GEOMETRY_EMPTY"
  ])],
  [502, /* @__PURE__ */ new Set(["REF_NOT_FOUND", "REF_EXPIRED", "REF_DECODE_FAILED"])],
  [504, /* @__PURE__ */ new Set(["REF_FETCH_TIMEOUT"])]
]);
function parseJson2(content) {
  if (content.byteLength === 0) return void 0;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(content);
    return JSON.parse(text);
  } catch {
    return void 0;
  }
}
function signedHttps2(value, label) {
  if (typeof value !== "string") throw new TypeError(`presign response has no ${label}`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError(`presign response ${label} is invalid`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new TypeError(`presign response ${label} is invalid`);
  }
  return url.href;
}
async function presign(options) {
  const response = await options.uploadGateway.requestJson("/uploads/presign", {
    method: "POST",
    body: { content_length: options.archive.byteLength },
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new TypeError("presign response is invalid");
  }
  const value = response;
  return {
    uploadUrl: signedHttps2(value["upload-url"], "upload-url"),
    getUrl: signedHttps2(value["get-url"], "get-url")
  };
}
async function presignAndUpload(options) {
  const pair = await presign(options);
  await uploadPresignedZip(pair.uploadUrl, options.archive, {
    fetch: options.fetch,
    timeoutMs: options.timeoutMs,
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  return pair.getUrl;
}
function uploadArchive(options) {
  return presignAndUpload(options);
}
function exactGatewaySizeRejection(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const body = value;
  const keys = Object.keys(body);
  return keys.length === 1 && keys[0] === "message" && typeof body.message === "string" && GATEWAY_SIZE_MESSAGES.has(body.message);
}
function acceptedJobIds(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  const jobId = value.jobId;
  return typeof jobId === "string" && jobId.length > 0 ? [jobId] : [];
}
async function post(options, body, contentType, allowExpired, allowGatewaySizeFallback) {
  let response;
  try {
    response = await dispatchKeyed({
      gateway: options.gateway,
      endpointPath: options.endpointPath,
      body,
      headers: {
        "Content-Type": contentType,
        ...options.idempotencyKey === void 0 ? {} : { "Idempotency-Key": options.idempotencyKey }
      },
      ...options.idempotencyKey === void 0 ? {} : { idempotencyKey: options.idempotencyKey },
      ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  } catch (error) {
    if (error instanceof SubmissionUncertainError) throw error;
    if (error instanceof TransportError && error.phase === "response" && error.status !== void 0 && error.status >= 300 && error.status < 400) {
      throw new SubmissionUncertainError([], error.status);
    }
    throw error;
  }
  const parsed = parseJson2(response.content);
  const ok = response.status >= 200 && response.status < 300;
  if (!ok) {
    const reportedIds = acceptedJobIds(parsed);
    if (reportedIds.length > 0) throw new SubmissionUncertainError(reportedIds);
    if (allowGatewaySizeFallback && response.status === 413 && exactGatewaySizeRejection(parsed)) {
      return { kind: "too-large" };
    }
    if (allowExpired && response.status === 502 && parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) && parsed.code === "REF_EXPIRED") return { kind: "expired" };
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      const code = parsed.code;
      if (typeof code === "string" && PRE_ACCEPT_REF_REJECTIONS.get(response.status)?.has(code)) {
        throw new GeometryReferenceRejectedError(code);
      }
    }
    if (response.status < 400 || response.status >= 500) {
      throw new SubmissionUncertainError([], response.status);
    }
    throw new TransportError(
      `job submission received HTTP ${response.status}`,
      "response",
      "http",
      "POST",
      response.status
    );
  }
  try {
    return { kind: "accepted", value: options.parseAccepted(parsed) };
  } catch (error) {
    if (error instanceof AcceptedResponseError) throw error;
    throw new SubmissionUncertainError(acceptedJobIds(parsed));
  }
}
async function submitArchive(options) {
  if (options.archive.byteLength <= options.thresholdBytes) {
    const result3 = await post(options, options.archive, "application/zip", false, true);
    if (result3.kind === "expired") throw new Error("unreachable inline reference state");
    if (result3.kind === "accepted") return result3.value;
  }
  let getUrl = await presignAndUpload(options);
  let envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
  let result2 = await post(options, envelope, "application/json", true, false);
  if (result2.kind === "accepted") return result2.value;
  getUrl = await presignAndUpload(options);
  envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
  result2 = await post(options, envelope, "application/json", false, false);
  if (result2.kind !== "accepted") throw new Error("unreachable reference retry state");
  return result2.value;
}

// src/internal/geometry-reuse/errors.ts
function unique(ids) {
  return Object.freeze([...new Set(ids.filter((value) => typeof value === "string" && value.length > 0))]);
}
var GeometryReferenceSubmissionError = class extends AcceptedResponseError {
  constructor(acceptedJobIds2 = [], reason2 = "geometry-reference-outcome-uncertain", message = "geometry-reference submission cannot be used or retried safely") {
    super(message);
    this.reason = reason2;
    this.acceptedJobIds = unique(acceptedJobIds2);
  }
  name = "GeometryReferenceSubmissionError";
  /** Ids of the jobs the API reported as accepted, without duplicates. */
  acceptedJobIds;
  /** Always `true`: the reference or its outcome cannot be used. */
  invalidReference = true;
  /** Always `true`: repeating the submission is not safe. */
  nonRetryable = true;
};
var GeometryReferenceAcknowledgementError = class extends GeometryReferenceSubmissionError {
  name = "GeometryReferenceAcknowledgementError";
  constructor(acceptedJobIds2 = [], reason2 = "invalid-geometry-acknowledgement") {
    super(
      acceptedJobIds2,
      reason2,
      "accepted geometry-reference submission had no valid acknowledgement"
    );
  }
};

// src/internal/submission-stopped.ts
var SubmissionStoppedError = class extends TransportError {
  constructor(message = "submission stopped after an invalid geometry reference") {
    super(message, "pre-dispatch", "aborted", "POST");
  }
};

// src/internal/job-response.ts
function requiredString(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("invalid job response");
  }
  return value;
}
function optionalString(value) {
  return typeof value === "string" ? value : void 0;
}
function binaryAcknowledgement(value) {
  if (value === void 0) return void 0;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("invalid binary acknowledgement");
  }
  const raw = value;
  const resultFormat = raw.resultFormat;
  if (raw.inputFormat !== "irbf" || resultFormat !== "irbf" && resultFormat !== "json" || raw.wireVersion !== 1) {
    throw new TypeError("invalid binary acknowledgement");
  }
  return {
    inputFormat: "irbf",
    resultFormat,
    wireVersion: 1,
    artifactDigest: requiredString(raw.artifactDigest),
    contentDigest: requiredString(raw.contentDigest)
  };
}
function parseJobStatus(value) {
  switch (value.toLowerCase()) {
    case "pending":
      return "pending";
    case "running":
      return "running";
    case "succeeded":
    case "succeded":
      return "succeeded";
    case "failed":
      return "failed";
    default:
      return "unknown";
  }
}
function jobFromResponse(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("invalid job response");
  }
  const value = input;
  const statusValue = value.jobStatus ?? value.status;
  if (statusValue !== void 0 && statusValue !== null && typeof statusValue !== "string") {
    throw new TypeError("invalid job response");
  }
  const startedAt = optionalString(value.startedAt);
  const finishedAt = optionalString(value.finishedAt);
  const resultsUrl = optionalString(value.resultsUrl ?? value.results);
  const error = optionalString(value.error);
  const binary = binaryAcknowledgement(value.binary);
  return {
    jobId: requiredString(value.jobId),
    modelName: optionalString(value.modelName) ?? "",
    status: parseJobStatus(optionalString(statusValue) ?? "Unknown"),
    requestedAt: optionalString(value.requestedAt) ?? "",
    ...startedAt === void 0 ? {} : { startedAt },
    ...finishedAt === void 0 ? {} : { finishedAt },
    ...resultsUrl === void 0 ? {} : { resultsUrl },
    ...error === void 0 ? {} : { error },
    ...binary === void 0 ? {} : { binary }
  };
}
var JobResponseMismatchError = class extends Error {
  constructor() {
    super("job response ID does not match requested jobId");
  }
};

// src/area/raw-answer.ts
function rawAnswer(error) {
  if (error instanceof JobResponseMismatchError) return { phase: "after_send", unreadable_2xx: true };
  if (error instanceof SubmissionUncertainError) {
    return error.status === void 0 ? { phase: "after_send", unreadable_2xx: true } : { phase: "after_send", status: error.status };
  }
  if (!(error instanceof TransportError)) throw error;
  if (error.phase === "pre-dispatch") return { phase: "before_send" };
  return error.status === void 0 ? { phase: "after_send" } : { phase: "after_send", status: error.status };
}

// src/internal/poll-notify.ts
async function notifyPoll(deadline, callback, job, attempt, elapsed, nextDelay) {
  if (callback === void 0) return void 0;
  try {
    return await deadline.wait(() => Promise.resolve(callback(job, attempt, elapsed, nextDelay)));
  } catch (error) {
    if (deadline.reason() !== void 0) throw error;
    return void 0;
  }
}

// src/job-errors.ts
var JobFailedError = class extends Error {
  /**
   * @param jobId - Id of the job that failed.
   * @param errorMessage - The failure message reported for the job; may be empty.
   */
  constructor(jobId, errorMessage2) {
    super("job failed");
    this.jobId = jobId;
    this.errorMessage = errorMessage2;
  }
  name = "JobFailedError";
};
var JobTimeoutError = class extends Error {
  /** @param jobId - Id of the job that was being waited on. */
  constructor(jobId) {
    super("job polling timed out");
    this.jobId = jobId;
  }
  name = "JobTimeoutError";
};
var JobAbortedError = class extends Error {
  /** @param jobId - Id of the job that was being waited on. */
  constructor(jobId) {
    super("job polling was aborted");
    this.jobId = jobId;
  }
  name = "JobAbortedError";
};
var JobNotCompletedError = class extends Error {
  /**
   * @param jobId - Id of the job.
   * @param status - The status the job had when results were requested.
   */
  constructor(jobId, status2) {
    super("job is not completed");
    this.jobId = jobId;
    this.status = status2;
  }
  name = "JobNotCompletedError";
};

// src/internal/wait-job.ts
function statusAnswer(job) {
  return JSON.stringify({ status: { status: job.status, error: job.error || null } });
}
function failureAnswer(error) {
  if (!(error instanceof TransportError)) return JSON.stringify({ host_error: { message: "host error" } });
  const after = error.retryAfterS;
  return JSON.stringify({ failure: {
    failure: rawAnswer(error),
    retry_after_us: after === void 0 || !Number.isFinite(after) ? null : Math.round(after * 1e6)
  } });
}
async function waitForJob(id, options, deps) {
  const timeoutSeconds = options.timeout ?? requireCore().pollDefaultTimeoutSeconds();
  requireTimeout(timeoutSeconds * 1e3);
  const deadline = new Deadline(options.signal, timeoutSeconds * 1e3);
  const wait = new (requireCore()).JobWait(
    id,
    Math.round(timeoutSeconds * 1e6),
    Math.floor(Math.random() * 2 ** 32) >>> 0,
    deps.intervalUs,
    deps.intervalCapUs
  );
  const t0 = performance.now();
  const clockUs = () => Math.round((performance.now() - t0) * 1e3);
  let job;
  let failure2;
  let answer = "";
  let attempt = -1;
  try {
    for (; ; ) {
      let step2;
      try {
        step2 = JSON.parse(wait.next(clockUs(), answer));
      } catch (error) {
        throw engineStopError(error, failure2);
      }
      if (step2.notify === true && job !== void 0) {
        const nextS = step2.kind === "sleep" ? step2.us / 1e6 : 0;
        if (await notifyPoll(deadline, options.onPoll, job, attempt, clockUs() / 1e6, nextS) === false) return job;
      }
      answer = "";
      if (step2.kind === "sleep") {
        await deadline.wait(() => delay(step2.us / 1e3, deadline.controller.signal));
      } else if (step2.kind === "get") {
        attempt += 1;
        failure2 = void 0;
        try {
          job = await deadline.wait(() => deps.status(id, deadline.controller.signal));
          answer = statusAnswer(job);
        } catch (error) {
          if (deadline.reason() !== void 0) throw error;
          failure2 = { error };
          answer = failureAnswer(error);
        }
      } else if (step2.outcome === "timeout") {
        throw new JobTimeoutError(id);
      } else if (step2.outcome === "failed") {
        throw new JobFailedError(id, job?.error ?? "");
      } else {
        return job;
      }
    }
  } catch (error) {
    const reason2 = deadline.reason();
    if (reason2 !== void 0) throw reason2 === "timeout" ? new JobTimeoutError(id) : new JobAbortedError(id);
    throw error;
  } finally {
    deadline.close();
    wait.free();
  }
}

// src/internal/poll-interval-deprecation.ts
var warned = false;
function warnPollIntervalDeprecated(logger) {
  if (warned) return;
  warned = true;
  logger.warn("DeprecationWarning: pollIntervalMs is deprecated and will be removed in 2.0. The SDK sets the poll interval.");
}

// src/internal/download.ts
async function downloadPresigned(input, options = {}) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new TypeError("presigned download URL must be an absolute HTTPS URL");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new TypeError("presigned download URL must be uncredentialed HTTPS");
  }
  const fetcher = resolveFetch(options.fetch);
  if (typeof fetcher !== "function") throw new TypeError("a fetch implementation is required");
  const timeoutMs = options.timeoutMs ?? 18e4;
  requireTimeout(timeoutMs);
  const deadline = new Deadline(options.signal, timeoutMs);
  let dispatched = false;
  try {
    const response = await deadline.wait(() => {
      dispatched = true;
      return fetcher(url.href, {
        method: "GET",
        credentials: "omit",
        redirect: "manual",
        signal: deadline.controller.signal
      });
    });
    if (response.status >= 300 && response.status < 400) {
      cancelResponseBody(response);
      throw new TransportError("presigned download received a redirect", "response", "http", "GET", response.status);
    }
    if (!response.ok) {
      cancelResponseBody(response);
      throw new TransportError(`presigned download received HTTP ${response.status}`, "response", "http", "GET", response.status);
    }
    return {
      content: new Uint8Array(await deadline.wait(() => response.arrayBuffer())),
      contentType: response.headers.get("Content-Type") ?? ""
    };
  } catch (error) {
    if (error instanceof TransportError) throw error;
    const reason2 = deadline.reason() ?? (dispatched ? "network" : "validation");
    const phase = dispatched ? "after-dispatch" : "pre-dispatch";
    const message = reason2 === "timeout" ? "presigned download timed out" : reason2 === "aborted" ? "presigned download was aborted" : "presigned download failed";
    throw new TransportError(message, phase, reason2, "GET");
  } finally {
    deadline.close();
  }
}

// src/internal/download-retry.ts
async function downloadWithRetries(jobId, once, signal) {
  const own2 = signal ?? new AbortController().signal;
  let result2;
  let last;
  const driver = new EngineDriver({ retries: 0, area_timeout_us: 36e8, goal: "available" });
  await driver.run(
    [{ keys: ["k"], run_id: "", jobs: { k: jobId }, states: { [jobId]: "succeeded" } }],
    own2,
    async (act, request) => {
      if (act.kind !== "download") throw new Error(`unexpected engine action ${act.kind}`);
      try {
        result2 = { value: await once(request) };
        return { kind: "download_done", job: jobId };
      } catch (error) {
        last = error;
        if (error instanceof TransportError && (error.reason === "timeout" || error.reason === "aborted")) {
          throw error;
        }
        return {
          kind: "download_failed",
          job: jobId,
          answer: rawAnswer(error),
          ...us(error.retryAfterS)
        };
      }
    },
    () => {
    }
  );
  if (result2 !== void 0) return result2.value;
  throw last ?? new TransportError("presigned download was aborted", "after-dispatch", "aborted", "GET");
}

// src/internal/link.ts
var TOKEN = /[!#$%&'*+\-.^_`|~0-9A-Za-z]/;
function splitLinkValues(header2) {
  const values = [];
  let start = 0;
  let quoted = false;
  let escaped = false;
  let angled = false;
  for (let index2 = 0; index2 < header2.length; index2 += 1) {
    const character = header2[index2];
    if (escaped) {
      escaped = false;
    } else if (quoted) {
      if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
    } else if (angled) {
      if (character === ">") angled = false;
      else if (character === "<" || character === '"') return void 0;
    } else if (character === '"') {
      quoted = true;
    } else if (character === "<") {
      angled = true;
    } else if (character === ">") {
      return void 0;
    } else if (character === ",") {
      const value = header2.slice(start, index2).trim();
      if (value.length === 0) return void 0;
      values.push(value);
      start = index2 + 1;
    }
  }
  if (quoted || escaped || angled) return void 0;
  const last = header2.slice(start).trim();
  if (last.length === 0) return void 0;
  values.push(last);
  return values;
}
function readParameters(input) {
  let index2 = 0;
  let relations;
  const skipWhitespace = () => {
    while (input[index2] === " " || input[index2] === "	") index2 += 1;
  };
  while (index2 < input.length) {
    skipWhitespace();
    if (index2 === input.length) break;
    if (input[index2] !== ";") return null;
    index2 += 1;
    skipWhitespace();
    const nameStart = index2;
    while (index2 < input.length && TOKEN.test(input[index2])) index2 += 1;
    if (nameStart === index2) return null;
    const name = input.slice(nameStart, index2).toLowerCase();
    skipWhitespace();
    if (input[index2] !== "=") return null;
    index2 += 1;
    skipWhitespace();
    let parameter = "";
    if (input[index2] === '"') {
      index2 += 1;
      let closed = false;
      while (index2 < input.length) {
        const character = input[index2++];
        if (character === "\\") {
          if (index2 === input.length) return null;
          parameter += input[index2++];
        } else if (character === '"') {
          closed = true;
          break;
        } else {
          parameter += character;
        }
      }
      if (!closed) return null;
    } else {
      const valueStart = index2;
      while (index2 < input.length && TOKEN.test(input[index2])) index2 += 1;
      if (valueStart === index2) return null;
      parameter = input.slice(valueStart, index2);
    }
    skipWhitespace();
    if (index2 < input.length && input[index2] !== ";") return null;
    if (name === "rel") {
      if (relations !== void 0) return null;
      relations = parameter.split(/[ \t]+/).filter((item) => item.length > 0);
    }
  }
  return relations;
}
function parseResultsLink(header2) {
  const values = header2 === null ? void 0 : splitLinkValues(header2);
  if (values === void 0) throw new Error("results response has no usable Link header");
  const matches = [];
  let unqualified;
  for (const value of values) {
    if (!value.startsWith("<")) {
      if (values.length === 1 && value.startsWith("https://")) unqualified = value;
      else throw new Error("results response has no usable Link header");
      continue;
    }
    const end = value.indexOf(">");
    if (end <= 1) throw new Error("results response has no usable Link header");
    const url = value.slice(1, end);
    const relations = readParameters(value.slice(end + 1));
    if (relations === null) throw new Error("results response has no usable Link header");
    if (relations?.some((item) => item.toLowerCase() === "results")) matches.push(url);
    else if (relations === void 0 && values.length === 1) unqualified = url;
  }
  const selected = matches.length === 1 ? matches[0] : matches.length === 0 ? unqualified : void 0;
  if (selected === void 0 || !selected.startsWith("https://")) {
    throw new Error("results response has no usable Link header");
  }
  return selected;
}

// src/internal/submit-body.ts
var UNSUPPORTED_TOP_LEVEL_ALIASES = /* @__PURE__ */ new Set([
  "analysisType",
  "analysis_type",
  "analysisSurfaces",
  "analysis_surfaces",
  "binaryResults",
  "binary_results",
  "contextGeometry",
  "context_geometry",
  "emitCellTris",
  "emit_cell_tris",
  "groundMaterials",
  "ground_materials",
  "groundGeometry",
  "ground_geometry",
  "meshCleaning",
  "mesh_cleaning",
  "sensorSurfaces",
  "sensor_surfaces",
  "surfaceGridSize",
  "surface_grid_size",
  "surfaceOffset",
  "surface_offset",
  "surfgridVersion",
  "surfgrid_version",
  "terrainAlignment",
  "terrain_alignment",
  "webhookEvents",
  "webhook_events",
  "webhookUrl",
  "webhook_url"
]);
function prepareSubmissionBody(analysisType2, payload, options) {
  if (typeof analysisType2 !== "string" || analysisType2.length === 0) {
    throw new TypeError("analysisType must be a non-empty string");
  }
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("analysis payload must be an object");
  }
  for (const name of UNSUPPORTED_TOP_LEVEL_ALIASES) {
    if (Object.prototype.hasOwnProperty.call(payload, name)) {
      throw new TypeError(`analysis payload must use wire-keyed fields; unsupported ${name}`);
    }
  }
  const bodyType = payload["analysis-type"];
  if (bodyType !== void 0 && bodyType !== analysisType2) {
    throw new TypeError("payload analysis-type does not match analysisType");
  }
  if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
    throw new TypeError("unsupported option binaryResults; use transport instead");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "binary-results")) {
    throw new TypeError("unsupported payload field binary-results; use transport instead");
  }
  const supplied = suppliedSceneAlignment(analysisType2, payload);
  const body = { ...payload, "analysis-type": analysisType2 };
  validatePreparedAnalysisRequest(body, { enforceTerrainTriangleLimit: true });
  pinSurfaceFields(body, WIRE_SURFACE_FIELDS);
  if (takesGradeDrop(analysisType2)) delete body["terrain-alignment"];
  if (options.webhookUrl !== void 0) body["webhook-url"] = options.webhookUrl;
  if (options.webhookEvents !== void 0) body["webhook-events"] = [...options.webhookEvents];
  if (supplied !== void 0) body["terrain-alignment"] = supplied;
  return body;
}

// src/internal/prepared-json.ts
function preparedJsonBytes(prepared) {
  if (prepared.json !== void 0) return prepared.json();
  try {
    const bytes = jsonWireBytes(prepared.body, (_key, value) => ArrayBuffer.isView(value) ? Array.from(value) : value);
    if (bytes === void 0) throw new TypeError("request has no JSON wire form");
    return bytes;
  } catch {
    throw new TransportError("job request is not JSON serializable", "pre-dispatch", "validation", "POST");
  }
}

// src/internal/per-turn.ts
var later = typeof setImmediate === "function" ? (run) => {
  setImmediate(run);
} : (run) => {
  setTimeout(run, 0);
};
function perTurn(flush, limit3 = () => Number.POSITIVE_INFINITY) {
  const queue = [];
  const run = () => {
    const batch = queue.splice(0, Math.max(1, limit3()));
    if (queue.length > 0) later(run);
    flush(batch.map((waiting5) => waiting5.item)).then((results) => {
      for (const [index2, waiting5] of batch.entries()) waiting5.resolve(results[index2]);
    }, (error) => {
      for (const waiting5 of batch) waiting5.reject(error);
    });
  };
  return (item) => new Promise((resolve, reject) => {
    if (queue.length === 0) later(run);
    queue.push({ item, resolve, reject });
  });
}

// src/internal/zip-payload.ts
var zipPayload = perTurn(async (items) => {
  const core2 = requireCore();
  return poolCall(() => core2.zipPayloadJsonManyStart([...items]), (task) => core2.zipPayloadJsonManyEnd(task));
}, () => 16 * coreThreads());

// src/internal/geometry-reuse/expiry.ts
var DEFAULT_REF_TTL_MS = 24 * 60 * 60 * 1e3;
var EXPIRY_MARGIN_MS = 15 * 60 * 1e3;
function expiryFromUrl(value, now3 = Date.now()) {
  let signedAt = now3;
  let ttl = DEFAULT_REF_TTL_MS;
  try {
    const url = new URL(value);
    const expires = Number(url.searchParams.get("X-Amz-Expires"));
    if (Number.isFinite(expires) && expires > 0) ttl = expires * 1e3;
    const stamp = url.searchParams.get("X-Amz-Date");
    if (stamp !== null && /^\d{8}T\d{6}Z$/.test(stamp)) {
      const iso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`;
      const parsed = Date.parse(iso);
      if (Number.isFinite(parsed)) signedAt = parsed;
    }
  } catch {
  }
  return signedAt + ttl - EXPIRY_MARGIN_MS;
}

// src/internal/geometry-reuse/cache.ts
var MAX_PARTITIONS = 64;
var MAX_SCOPES = 256;
var MAX_DOCUMENTS = 256;
var MAX_IN_FLIGHT_FIRST_USES = 64;
var MAX_SCOPE_LOCKS = 64;
var MAX_SHARED_UPLOADS = 64;
var UNSUPPORTED_TTL_MS = 24 * 60 * 60 * 1e3;
var GeometryReuseCapacityError = class extends Error {
  name = "GeometryReuseCapacityError";
};
function emptyState() {
  return { schema_version: 1, last_hashes: {}, documents: [] };
}
function cloneSnapshot(scope) {
  if (scope === void 0) return { state: emptyState(), urls: {} };
  return {
    state: structuredClone(scope.state),
    urls: { ...scope.urls }
  };
}
function liveCapability(value, now3) {
  if (value === void 0) return void 0;
  return value.expiresAt === void 0 || now3 < value.expiresAt ? value.outcome : void 0;
}
var GeometryReuseCache = class {
  constructor(now3 = Date.now) {
    this.now = now3;
  }
  partitions = /* @__PURE__ */ new Map();
  firstUses = /* @__PURE__ */ new Map();
  scopeLocks = /* @__PURE__ */ new Map();
  uploads = /* @__PURE__ */ new Map();
  /** Upload entries whose PUT has finished: the only ones the bound evicts. */
  settledUploads = /* @__PURE__ */ new Set();
  getCapability(partitionKey) {
    const partition = this.partitions.get(partitionKey);
    if (partition === void 0) return void 0;
    const outcome = liveCapability(partition.capability, this.now());
    if (outcome === void 0) delete partition.capability;
    return outcome;
  }
  setCapability(partitionKey, outcome) {
    const now3 = this.now();
    const partition = this.partition(partitionKey, now3);
    partition.capability = outcome === "supported" ? { outcome } : { outcome, expiresAt: now3 + UNSUPPORTED_TTL_MS };
  }
  /**
   * Single-flight the FIRST reference-carrying submission of a partition.
   *
   * There is no probe job any more: the verdict is learned from a real
   * customer submission (D71). One submission therefore has to go first and
   * alone, or a 49-tile run against a deployment that ignores the field would
   * discard 49 billed jobs where one is enough. `owned` marks the caller that
   * ran it, and only that caller may use the returned job. A waiter learns
   * nothing except that the question has been answered; it reads the verdict.
   */
  async firstUse(partitionKey, task, signal) {
    const existing = this.firstUses.get(partitionKey);
    if (existing !== void 0) {
      await waitFor(existing.then(ignore, ignore), signal);
      if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
      return { owned: false };
    }
    if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
    if (this.firstUses.size >= MAX_IN_FLIGHT_FIRST_USES) return { owned: false };
    let pending2;
    pending2 = task().finally(() => {
      if (this.firstUses.get(partitionKey) === pending2) this.firstUses.delete(partitionKey);
    });
    this.firstUses.set(partitionKey, pending2);
    return { owned: true, value: await pending2 };
  }
  snapshot(partitionKey, scopeKey) {
    const now3 = this.now();
    const partition = this.partitions.get(partitionKey);
    const scope = partition?.scopes.get(scopeKey);
    if (scope === void 0) return cloneSnapshot(void 0);
    const documents = scope.state.documents.filter((item) => now3 / 1e3 < item.expires_at && scope.urls[item.key] !== void 0);
    if (documents.length !== scope.state.documents.length) {
      const keys = new Set(documents.map((item) => item.key));
      scope.state = { ...scope.state, documents };
      scope.urls = Object.fromEntries(Object.entries(scope.urls).filter(([key]) => keys.has(key)));
    }
    scope.touchedAt = now3;
    if (partition !== void 0) partition.touchedAt = now3;
    return cloneSnapshot(scope);
  }
  acknowledge(partitionKey, scopeKey, value) {
    const now3 = this.now();
    if (!Number.isFinite(value.expiresAt) || value.expiresAt <= now3) return;
    const partition = this.partition(partitionKey, now3);
    const prior = partition.scopes.get(scopeKey);
    const documents = (prior?.state.documents ?? []).filter((item) => item.key !== value.key);
    const document2 = {
      key: value.key,
      groups: { ...value.groups },
      acknowledged_at: now3 / 1e3,
      expires_at: value.expiresAt / 1e3
    };
    partition.scopes.delete(scopeKey);
    partition.scopes.set(scopeKey, {
      state: {
        schema_version: 1,
        last_hashes: { ...value.current },
        documents: [...documents, document2]
      },
      urls: { ...prior?.urls ?? {}, [value.key]: value.url },
      touchedAt: now3
    });
    this.trim();
  }
  /**
   * Record `current` as the last group hashes of an inline submission (D189).
   * Only an acknowledgement recorded them before, so a group that changed
   * while no reference was sent never became "unchanged since the last run"
   * and stayed inline on every later run. A scope with no history is left
   * absent: empty state is a first use, which uploads every eligible group.
   */
  observe(partitionKey, scopeKey, current) {
    const scope = this.partitions.get(partitionKey)?.scopes.get(scopeKey);
    if (scope === void 0) return;
    scope.state = { ...scope.state, last_hashes: { ...current } };
  }
  invalidate(partitionKey, scopeKey, key, url) {
    const scope = this.partitions.get(partitionKey)?.scopes.get(scopeKey);
    if (scope === void 0 || scope.urls[key] !== url) return;
    delete scope.urls[key];
    scope.state = {
      ...scope.state,
      documents: scope.state.documents.filter((item) => item.key !== key)
    };
  }
  /**
   * The URL of the document `key` names, PUT at most once per partition
   * (D201). The key is the document's CONTENT, not a job's scope, so every
   * job that sends the same document — the grid job and the facade job of
   * one tile, the next design edit — shares one upload: the first caller
   * PUTs, callers that arrive meanwhile await it, and later callers get its
   * URL until the URL expires. `fresh` is true only for the caller whose
   * `put` ran. A failed PUT is its caller's: it is not kept. A waiter stops
   * waiting when its own `signal` aborts.
   */
  async sharedUpload(partitionKey, key, put, signal) {
    const id = `${partitionKey}
${key}`;
    for (; ; ) {
      const pending2 = this.uploads.get(id);
      if (pending2 === void 0) {
        const created = put().then((url) => ({ url, expiresAt: expiryFromUrl(url) }));
        this.uploads.set(id, created);
        this.settledUploads.delete(id);
        try {
          const { url } = await created;
          if (this.uploads.get(id) === created) this.settledUploads.add(id);
          for (const old of [...this.settledUploads]) {
            if (this.uploads.size <= MAX_SHARED_UPLOADS) break;
            this.uploads.delete(old);
            this.settledUploads.delete(old);
          }
          return { url, fresh: true };
        } catch (error) {
          if (this.uploads.get(id) === created) this.uploads.delete(id);
          throw error;
        }
      }
      let value;
      try {
        value = await waitFor(pending2, signal);
      } catch (error) {
        if (signal?.aborted) throw error;
      }
      if (value !== void 0 && this.now() < value.expiresAt) return { url: value.url, fresh: false };
      if (this.uploads.get(id) === pending2) {
        this.uploads.delete(id);
        this.settledUploads.delete(id);
      }
    }
  }
  /** Forget `key`'s upload when its URL is `url` (a dead reference). */
  async dropUpload(partitionKey, key, url) {
    const id = `${partitionKey}
${key}`;
    const pending2 = this.uploads.get(id);
    if (pending2 === void 0) return;
    const value = await pending2.catch(ignore);
    if (value?.url === url && this.uploads.get(id) === pending2) {
      this.uploads.delete(id);
      this.settledUploads.delete(id);
    }
  }
  async withScope(partitionKey, scopeKey, task, signal) {
    const key = `${partitionKey}
${scopeKey}`;
    const prior = this.scopeLocks.get(key) ?? Promise.resolve();
    if (!this.scopeLocks.has(key) && this.scopeLocks.size >= MAX_SCOPE_LOCKS) {
      throw new GeometryReuseCapacityError("geometry reuse scope capacity is full");
    }
    let release4;
    const next = new Promise((resolve) => {
      release4 = resolve;
    });
    const tail = prior.then(() => next);
    this.scopeLocks.set(key, tail);
    const wait = signal === void 0 ? prior : new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason ?? new DOMException("aborted", "AbortError"));
        return;
      }
      const abort = () => reject(signal.reason ?? new DOMException("aborted", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      void prior.then(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      });
    });
    try {
      await wait;
    } catch (error) {
      release4();
      void tail.then(() => {
        if (this.scopeLocks.get(key) === tail) this.scopeLocks.delete(key);
      });
      throw error;
    }
    try {
      return await task();
    } finally {
      release4();
      if (this.scopeLocks.get(key) === tail) this.scopeLocks.delete(key);
    }
  }
  counts() {
    const scopes = [...this.partitions.values()].flatMap((item) => [...item.scopes.values()]);
    return {
      partitions: this.partitions.size,
      scopes: scopes.length,
      documents: scopes.reduce((sum, item) => sum + item.state.documents.length, 0)
    };
  }
  partition(key, now3) {
    const found = this.partitions.get(key);
    if (found !== void 0) {
      found.touchedAt = now3;
      this.partitions.delete(key);
      this.partitions.set(key, found);
      return found;
    }
    const created = { scopes: /* @__PURE__ */ new Map(), touchedAt: now3 };
    this.partitions.set(key, created);
    this.trim();
    return created;
  }
  trim() {
    while (this.partitions.size > MAX_PARTITIONS) this.partitions.delete(this.partitions.keys().next().value);
    const allScopes = () => [...this.partitions].flatMap(
      ([partition, value]) => [...value.scopes].map(
        ([scope, state]) => [partition, scope, state]
      )
    );
    while (allScopes().length > MAX_SCOPES) {
      const [partition, scope] = allScopes().sort((left, right) => left[2].touchedAt - right[2].touchedAt)[0];
      this.partitions.get(partition)?.scopes.delete(scope);
    }
    while (allScopes().reduce((sum, item) => sum + item[2].state.documents.length, 0) > MAX_DOCUMENTS) {
      const candidates = allScopes().flatMap(([partition, scope, value2]) => value2.state.documents.map((document2) => ({ partition, scope, document: document2 })));
      candidates.sort((left, right) => left.document.acknowledged_at - right.document.acknowledged_at);
      const oldest = candidates[0];
      if (oldest === void 0) break;
      const value = this.partitions.get(oldest.partition)?.scopes.get(oldest.scope);
      if (value !== void 0) {
        value.state = { ...value.state, documents: value.state.documents.filter((item) => item !== oldest.document) };
        delete value.urls[oldest.document.key];
      }
    }
  }
};
function ignore() {
  return void 0;
}
function waitFor(pending2, signal) {
  if (signal === void 0) return pending2;
  if (signal.aborted) return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    void pending2.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
var sharedCache = new GeometryReuseCache();
function getGeometryReuseCache() {
  return sharedCache;
}

// src/internal/geometry-reuse/credentials.ts
function activeCredential(headers) {
  let apiKey;
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === "authorization") {
      const match = /^\s*Bearer\s+(.+)$/i.exec(value);
      if (match?.[1]?.trim()) return { kind: "bearer", value: match[1].trim() };
    }
    if (name.toLowerCase() === "x-api-key" && value.trim()) apiKey = value.trim();
  }
  return apiKey === void 0 ? void 0 : { kind: "api-key", value: apiKey };
}
async function credentialPartition(baseUrl, headers) {
  const credential = activeCredential(headers);
  if (credential === void 0) return void 0;
  const material = canonicalJsonBytes(`${credential.kind}\0${credential.value}`);
  const digest = material === void 0 ? void 0 : await sha256Hex(material);
  return digest === void 0 ? void 0 : `${trimTrailingSlashes(baseUrl)}
${credential.kind}:${digest}`;
}
async function exactAuthHeadersDigest(headers) {
  if (activeCredential(headers) === void 0) return void 0;
  const normalized = Object.entries(normalizeAuthHeaders(headers));
  const material = canonicalJsonBytes(normalized);
  return material === void 0 ? void 0 : sha256Hex(material);
}
function normalizeAuthHeaders(headers) {
  const normalized = new Headers();
  for (const [name, value] of Object.entries(headers)) normalized.set(name, value);
  return Object.fromEntries(normalized.entries());
}

// src/internal/geometry-reuse/observer.ts
function safeLog(logger, level, event, reason2) {
  try {
    logger[level]({ event, reason: reason2 });
  } catch {
  }
}
function notifyCapability(options, outcome, ids) {
  const event = Object.freeze({ outcome, acceptedJobIds: Object.freeze([...ids]) });
  try {
    const pending2 = options.onProbe?.(event);
    if (pending2 !== void 0) void Promise.resolve(pending2).catch(() => void 0);
  } catch {
  }
  safeLog(
    options.logger,
    outcome === "supported" ? "info" : "warn",
    "geometry_ref_capability",
    `${outcome}; accepted job IDs: ${ids.length} reported`
  );
}

// src/internal/geometry-reuse/submit.ts
function expectedAck(value, groups) {
  const job = jobFromResponse(value);
  let acknowledged = false;
  let reason2 = "geometry acknowledgement verifier failed";
  try {
    const verdict = JSON.parse(requireCore().verifyGeometryAck(JSON.stringify(value), [...groups]));
    acknowledged = verdict.status === "acknowledged";
    if (typeof verdict.reason === "string") reason2 = verdict.reason;
  } catch {
  }
  if (!acknowledged) throw new GeometryReferenceAcknowledgementError([job.jobId], reason2);
  return job;
}
function bound(options, partitionKey, signal, beforeDispatch, idempotencyKey) {
  const auth = async () => {
    const headers = await options.auth();
    if (await credentialPartition(options.baseUrl, headers) !== partitionKey) {
      throw new AuthPartitionChangedError();
    }
    return headers;
  };
  return {
    gateway: new GatewayTransport({ baseUrl: options.baseUrl, auth, fetch: options.fetch, timeoutMs: options.timeoutMs }),
    uploadGateway: new GatewayTransport({
      baseUrl: options.gatewayBaseUrl,
      auth,
      fetch: options.fetch,
      timeoutMs: options.timeoutMs
    }),
    fetch: options.fetch,
    thresholdBytes: options.thresholdBytes,
    timeoutMs: options.timeoutMs,
    ...signal === void 0 ? {} : { signal },
    ...beforeDispatch === void 0 ? {} : { beforeDispatch },
    ...idempotencyKey === void 0 ? {} : { idempotencyKey }
  };
}
async function submitBody(analysisType2, body, transport3, groups = []) {
  const json = jsonWireBytes(body);
  if (json === void 0) throw new TypeError("request has no JSON wire form");
  return submitArchive({
    endpointPath: `/async/${encodeURIComponent(analysisType2)}`,
    archive: await zipPayload(json),
    gateway: transport3.gateway,
    uploadGateway: transport3.uploadGateway,
    fetch: transport3.fetch,
    thresholdBytes: transport3.thresholdBytes,
    timeoutMs: transport3.timeoutMs,
    ...transport3.beforeDispatch === void 0 ? {} : { beforeDispatch: transport3.beforeDispatch },
    parseAccepted: groups.length === 0 ? jobFromResponse : (value) => expectedAck(value, groups),
    ...transport3.signal === void 0 ? {} : { signal: transport3.signal },
    ...transport3.idempotencyKey === void 0 ? {} : { idempotencyKey: transport3.idempotencyKey }
  });
}
async function uploadGeometry(bytes, transport3) {
  return uploadArchive({
    archive: await zipPayload(bytes),
    uploadGateway: transport3.uploadGateway,
    fetch: transport3.fetch,
    timeoutMs: transport3.timeoutMs,
    ...transport3.signal === void 0 ? {} : { signal: transport3.signal }
  });
}

// src/internal/geometry-url-store.ts
var STORED_URL_LIFETIME_MS = 23 * 60 * 60 * 1e3;
var MAX_STORE_WAIT_MS = 2e3;
var MAX_CLAIM_WAIT_MS = 6e4;
function signedUrlEnd(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return void 0;
  }
  const date = url.searchParams.get("X-Amz-Date");
  const seconds = Number(url.searchParams.get("X-Amz-Expires"));
  if (date === null || !/^\d{8}T\d{6}Z$/.test(date) || !(seconds > 0)) return void 0;
  const signedAt = Date.parse(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`);
  return Number.isFinite(signedAt) ? signedAt + seconds * 1e3 : void 0;
}
function storeKey(tag, key) {
  return `${tag}:${key.replaceAll("\n", ":")}`;
}
function within(work, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no answer in ${ms} ms`)), ms);
    timer.unref?.();
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
var GeometryUrlStoreGate = class {
  constructor(store, logger, timeoutMs, now3 = Date.now, claimWaitMs = MAX_CLAIM_WAIT_MS) {
    this.store = store;
    this.logger = logger;
    this.now = now3;
    this.claimWaitMs = claimWaitMs;
    this.waitMs = Math.min(MAX_STORE_WAIT_MS, timeoutMs);
  }
  warned = false;
  waitMs;
  /** The stored entry for `key` while it is good. */
  async get(key) {
    let entry;
    try {
      entry = await within(Promise.resolve().then(() => this.store.get(key)), this.waitMs);
    } catch (error) {
      this.warn("get", error);
      return void 0;
    }
    if (typeof entry !== "object" || entry === null) return void 0;
    const { url, expiresAt } = entry;
    if (typeof url !== "string" || url === "" || typeof expiresAt !== "number") return void 0;
    const end = Math.min(expiresAt, signedUrlEnd(url) ?? Infinity);
    return this.now() < end ? { url, expiresAt: end } : void 0;
  }
  /** Keep `url`, uploaded now. The promise settles when the store's write
   * settles and never rejects; a run never awaits it (a claim holder releases
   * when it settles). */
  set(key, url) {
    const expiresAt = Math.min(this.now() + STORED_URL_LIFETIME_MS, signedUrlEnd(url) ?? Infinity);
    return Promise.resolve().then(() => this.store.set(key, url, expiresAt)).then(() => void 0, (error) => {
      this.warn("set", error);
    });
  }
  /** The store's claim on `key` ({@link GeometryUrlStore.claim}), held until
   * the returned release runs; `undefined` without a claim, when it fails or
   * after {@link MAX_CLAIM_WAIT_MS}. A claim that arrives after the wait
   * ended is released at once. No caller's signal: the claim belongs to the
   * shared upload, and each caller stops waiting on its own abort. */
  async claim(key) {
    if (this.store.claim === void 0) return void 0;
    let abandoned = false;
    const claimed = Promise.resolve().then(() => this.store.claim(key));
    claimed.then((release4) => {
      if (abandoned) this.release(release4);
    }, () => void 0);
    let timer;
    const stop = new Promise((resolve) => {
      timer = setTimeout(() => {
        this.warn("claim", new Error(`no claim in ${this.claimWaitMs} ms`));
        resolve(void 0);
      }, this.claimWaitMs);
      timer.unref?.();
    });
    try {
      const release4 = await Promise.race([claimed, stop]);
      if (release4 === void 0) abandoned = true;
      return release4 === void 0 ? void 0 : () => {
        this.release(release4);
      };
    } catch (error) {
      abandoned = true;
      this.warn("claim", error);
      return void 0;
    } finally {
      clearTimeout(timer);
    }
  }
  release(release4) {
    try {
      release4();
    } catch (error) {
      this.warn("claim", error);
    }
  }
  warn(verb, error) {
    if (this.warned) return;
    this.warned = true;
    try {
      this.logger.warn(`geometryUrlStore.${verb} failed; the SDK uploads the geometry instead`, error);
    } catch {
    }
  }
};
function geometryUrlStoreGate(store, logger, timeoutMs) {
  return store === void 0 ? void 0 : new GeometryUrlStoreGate(store, logger, timeoutMs);
}

// src/internal/geometry-reuse/controller.ts
var DIRECT_SCOPE = "direct-v1";
var DEAD_REF_CODES = /* @__PURE__ */ new Set(["REF_EXPIRED", "REF_NOT_FOUND"]);
var INTERIOR_ANALYSES = /* @__PURE__ */ new Set([
  "daylight-factor",
  "energy-balance",
  "spatial-daylight-autonomy"
]);
var planning = { withSizes: true };
function parsePlan(prepared, snapshot) {
  const sizes = {};
  for (const name of Object.keys(prepared.identities)) {
    const bytes = prepared.bytes[name];
    if (bytes !== void 0) sizes[name] = bytes.byteLength;
  }
  return JSON.parse(requireCore().planGeometryReuse(
    JSON.stringify(prepared.identities),
    JSON.stringify(snapshot.state),
    Date.now() / 1e3,
    planning.withSizes ? JSON.stringify(sizes) : void 0
  ));
}
async function referenceFromPlan(planValue, prepared, snapshot) {
  if (planValue === null || typeof planValue !== "object" || Array.isArray(planValue)) return void 0;
  const plan = planValue;
  if (typeof plan.reference === "string") {
    const matches = snapshot.state.documents.filter((item) => item.key === plan.reference);
    if (matches.length !== 1) return void 0;
    const document2 = matches[0];
    const url = snapshot.urls[document2.key];
    if (Object.entries(document2.groups).some(
      ([name, identity]) => prepared.identities[name] !== identity
    )) return void 0;
    const parts2 = selectedDocumentParts(prepared, document2.groups);
    if (url === void 0 || parts2 === void 0) return void 0;
    return { key: document2.key, groups: document2.groups, parts: parts2, url, cached: true };
  }
  if (plan.upload === null || typeof plan.upload !== "object" || Array.isArray(plan.upload)) return void 0;
  const groups = plan.upload.groups;
  if (groups === null || typeof groups !== "object" || Array.isArray(groups) || Object.keys(groups).length === 0) {
    return void 0;
  }
  const selected = groups;
  if (Object.entries(selected).some(([name, identity]) => prepared.identities[name] !== identity)) return void 0;
  const parts = selectedDocumentParts(prepared, selected);
  if (parts === void 0) return void 0;
  const digest = await sha256HexParts(parts);
  return digest === void 0 ? void 0 : { key: `gref1:${digest}`, groups: selected, parts, cached: false };
}
function unsafeCandidate(error, keyed) {
  if (error instanceof GeometryReferenceAcknowledgementError) throw error;
  if (error instanceof GeometryReferenceRejectedError) throw error;
  if (error instanceof TransportError && error.reason === "aborted") throw error;
  if (error instanceof SubmissionUncertainError) {
    throw new GeometryReferenceSubmissionError(
      error.acceptedJobIds,
      error.status === void 0 ? "accepted-response-invalid" : "endpoint-response-uncertain"
    );
  }
  if (keyed && error instanceof TransportError && error.phase === "unknown-acceptance" && error.status === void 0) throw error;
  if (error instanceof TransportError && error.phase === "unknown-acceptance") {
    throw new GeometryReferenceSubmissionError([], "endpoint-post-failed");
  }
  if (error instanceof TransportError && error.status !== void 0 && (error.status >= 300 && error.status < 400 || error.status >= 500)) {
    throw new GeometryReferenceSubmissionError([], "endpoint-response-uncertain");
  }
  throw error;
}
async function executePlan(prepared, analysisType2, partitionKey, scopeKey, transport3, recover, options) {
  const cache2 = getGeometryReuseCache();
  const logger = options.logger;
  try {
    return await cache2.withScope(partitionKey, scopeKey, async () => {
      const snapshot = cache2.snapshot(partitionKey, scopeKey);
      let reference;
      try {
        reference = await referenceFromPlan(parsePlan(prepared, snapshot), prepared, snapshot);
      } catch {
        safeLog(logger, "warn", "geometry_ref_fallback", "planning failed");
        return { kind: "prepost" };
      }
      if (reference === void 0) {
        cache2.observe(partitionKey, scopeKey, prepared.identities);
        return { kind: "prepost" };
      }
      const shared2 = async (planned, refresh = false) => {
        let stored = false;
        const tagged = storeKey("json", `${partitionKey}
${planned.key}`);
        const { url, fresh } = await cache2.sharedUpload(partitionKey, planned.key, async () => {
          const entry = refresh ? void 0 : await options.urlStore?.get(tagged);
          if (entry !== void 0) {
            stored = true;
            return entry.url;
          }
          const uploaded = await uploadGeometry(joinParts(planned.parts), transport3);
          options.urlStore?.set(tagged, uploaded);
          return uploaded;
        }, transport3.signal);
        return { ...planned, url, cached: !fresh || stored };
      };
      if (reference.url === void 0) {
        try {
          reference = await shared2(reference);
        } catch {
          safeLog(logger, "warn", "geometry_ref_fallback", "geometry upload failed");
          return { kind: "prepost" };
        }
      }
      let referenceUrl = reference.url;
      if (referenceUrl === void 0) return { kind: "prepost" };
      let refreshed = false;
      while (true) {
        try {
          const job = await submitBody(
            analysisType2,
            bodyWithReference(prepared.body, reference.groups, referenceUrl),
            transport3,
            Object.keys(reference.groups).sort()
          );
          try {
            cache2.acknowledge(partitionKey, scopeKey, {
              key: reference.key,
              groups: reference.groups,
              url: referenceUrl,
              current: prepared.identities,
              expiresAt: expiryFromUrl(referenceUrl)
            });
          } catch {
            safeLog(logger, "warn", "geometry_ref_state", "accepted state could not be saved");
          }
          return { kind: "job", job };
        } catch (error) {
          if (error instanceof GeometryReferenceAcknowledgementError) {
            cache2.invalidate(partitionKey, scopeKey, reference.key, referenceUrl);
            await cache2.dropUpload(partitionKey, reference.key, referenceUrl);
          }
          if (!(error instanceof GeometryReferenceRejectedError)) {
            unsafeCandidate(error, transport3.idempotencyKey !== void 0);
          }
          if (!recover) return { kind: "ref-rejected", code: error.code };
          if (reference.cached && !refreshed && DEAD_REF_CODES.has(error.code)) {
            cache2.invalidate(partitionKey, scopeKey, reference.key, referenceUrl);
            await cache2.dropUpload(partitionKey, reference.key, referenceUrl);
            try {
              reference = await shared2(reference, true);
              referenceUrl = reference.url;
              refreshed = true;
              continue;
            } catch {
              safeLog(logger, "warn", "geometry_ref_fallback", "geometry refresh failed");
              return { kind: "prepost" };
            }
          }
          safeLog(logger, "warn", "geometry_ref_fallback", `server rejected ${error.code}`);
          return { kind: "ref-rejected", code: error.code };
        }
      }
    }, transport3.signal);
  } catch (error) {
    if (!(error instanceof GeometryReuseCapacityError)) throw error;
    safeLog(logger, "warn", "geometry_ref_fallback", "scope capacity is full");
    return { kind: "prepost" };
  }
}
async function tryGeometryReuse(preparedSubmission, options, signal, beforeDispatch, idempotencyKey) {
  if (INTERIOR_ANALYSES.has(preparedSubmission.analysisType)) return void 0;
  const prepared = await prepareGeometryGroups(preparedSubmission.body);
  if (Object.keys(prepared.identities).length === 0) return void 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const headers = await options.auth();
    const partitionKey = await credentialPartition(options.baseUrl, headers);
    if (partitionKey === void 0) return void 0;
    const transport3 = bound(options, partitionKey, signal, beforeDispatch, idempotencyKey);
    try {
      return await submitInPartition(preparedSubmission, prepared, partitionKey, transport3, options);
    } catch (error) {
      if (!(error instanceof AuthPartitionChangedError) || attempt === 1) throw error;
    }
  }
  throw new Error("unreachable credential partition state");
}
async function submitInPartition(preparedSubmission, prepared, partitionKey, transport3, options) {
  const cache2 = getGeometryReuseCache();
  if (cache2.getCapability(partitionKey) === void 0) {
    const first = await cache2.firstUse(
      partitionKey,
      () => establish(preparedSubmission, prepared, partitionKey, transport3, options),
      transport3.signal
    );
    if (first.owned) return first.value;
  }
  if (cache2.getCapability(partitionKey) !== "supported") {
    return submitBody(preparedSubmission.analysisType, prepared.body, transport3);
  }
  return referenced(preparedSubmission, prepared, partitionKey, transport3, options);
}
async function establish(preparedSubmission, prepared, partitionKey, transport3, options) {
  const cache2 = getGeometryReuseCache();
  try {
    const outcome = await executePlan(
      prepared,
      preparedSubmission.analysisType,
      partitionKey,
      preparedSubmission.reuseScope ?? DIRECT_SCOPE,
      transport3,
      true,
      options
    );
    if (outcome.kind === "job") {
      cache2.setCapability(partitionKey, "supported");
      notifyCapability(options, "supported", [outcome.job.jobId]);
      return outcome.job;
    }
    return await submitBody(preparedSubmission.analysisType, prepared.body, transport3);
  } catch (error) {
    if (error instanceof GeometryReferenceAcknowledgementError) {
      cache2.setCapability(partitionKey, "unsupported");
      notifyCapability(options, "unsupported", error.acceptedJobIds);
      throw error;
    }
    if (error instanceof AuthPartitionChangedError) throw error;
    if (error instanceof TransportError && (error.status === 400 || error.status === 422)) {
      safeLog(options.logger, "warn", "geometry_ref_fallback", `server rejected ${error.status}`);
      return await submitBody(preparedSubmission.analysisType, prepared.body, transport3);
    }
    throw error;
  }
}
async function referenced(preparedSubmission, prepared, partitionKey, transport3, options) {
  const cache2 = getGeometryReuseCache();
  try {
    const outcome = await executePlan(
      prepared,
      preparedSubmission.analysisType,
      partitionKey,
      preparedSubmission.reuseScope ?? DIRECT_SCOPE,
      transport3,
      true,
      options
    );
    if (outcome.kind === "job") return outcome.job;
    return submitBody(preparedSubmission.analysisType, prepared.body, transport3);
  } catch (error) {
    if (error instanceof GeometryReferenceAcknowledgementError) {
      cache2.setCapability(partitionKey, "unsupported");
      notifyCapability(options, "unsupported", error.acceptedJobIds);
    }
    throw error;
  }
}

// src/internal/geometry-reuse/options.ts
function buildGeometryReuseOptions(options, fetch2, thresholdBytes, timeoutMs, urlStore) {
  return {
    baseUrl: trimTrailingSlashes(String(options.baseUrl)),
    gatewayBaseUrl: trimTrailingSlashes(String(options.gatewayBaseUrl ?? options.baseUrl)),
    auth: options.auth,
    fetch: fetch2,
    thresholdBytes,
    timeoutMs,
    logger: options.logger ?? consoleLogger,
    ...options.onGeometryReuseProbe === void 0 ? {} : {
      onProbe: options.onGeometryReuseProbe
    },
    ...urlStore === void 0 ? {} : { urlStore }
  };
}

// src/internal/binary-artifact.ts
function bodyArtifact(body, limits) {
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 4294967295) {
      throw new RangeError(`${name} must be a non-negative uint32 integer`);
    }
  }
  const core2 = requireCore();
  const encoded = core2.geometryArtifact(
    JSON.stringify(body),
    BigInt(limits.maxGeometryBytes),
    limits.maxMetadataBytes,
    BigInt(limits.maxMeshes),
    BigInt(limits.maxInstances)
  );
  return {
    archive: encoded.archive,
    artifactDigest: encoded.artifactDigest,
    geometryContentDigest: encoded.contentDigest,
    encoding: encoded.encoding
  };
}

// src/internal/facade-artifact-guard.ts
var FacadeArtifactMismatchError = class extends Error {
  constructor(analysisType2, missing, unplanned) {
    super(
      `binary ${analysisType2}: the facade artifact does not carry exactly the batch's planned target buildings (${missing.length} missing, ${unplanned.length} unplanned); refused before any paid submission`
    );
    this.analysisType = analysisType2;
    this.missing = missing;
    this.unplanned = unplanned;
  }
  name = "FacadeArtifactMismatchError";
};
function isSurfaceBody(body) {
  return typeof body["analysis-surfaces"] === "string";
}
function checkFacadeArtifact(analysisType2, body, artifact) {
  const geometries = body.geometries;
  const planned = geometries instanceof KernelGroup ? [...geometries.ids ?? []] : geometries !== null && typeof geometries === "object" && !Array.isArray(geometries) ? Object.keys(geometries) : [];
  const carried = artifact.targetIds;
  if (carried === void 0) throw new FacadeArtifactMismatchError(analysisType2, planned, ["<unsplit tile>"]);
  const have = new Set(carried);
  const want = new Set(planned);
  const missing = planned.filter((id) => !have.has(id));
  const unplanned = carried.filter((id) => !want.has(id));
  if (missing.length > 0 || unplanned.length > 0 || have.size !== carried.length) {
    throw new FacadeArtifactMismatchError(analysisType2, missing, unplanned);
  }
}

// src/internal/host-retry.ts
function factsOf(error) {
  if (error instanceof TransportError) {
    if (error.phase === "pre-dispatch") return { phase: "before_send" };
    return {
      phase: "after_send",
      ...error.status === void 0 ? {} : { status: error.status },
      ...error.retryAfterS === void 0 ? {} : { retryAfterS: error.retryAfterS }
    };
  }
  if (error instanceof GeodataFetchError && (error.status !== void 0 || error.cause !== void 0)) {
    return { phase: "after_send", ...error.status === void 0 ? {} : { status: error.status } };
  }
  return void 0;
}
async function withHostRetry(request, call, options = {}) {
  for (let tries = 1; ; tries += 1) {
    try {
      return await call();
    } catch (error) {
      const facts = options.signal?.aborted === true ? void 0 : factsOf(error);
      if (facts === void 0) throw error;
      const waitS = requireCore().hostRetryWaitSeconds(
        request,
        facts.phase,
        facts.status,
        tries,
        Math.random(),
        facts.retryAfterS
      );
      if (waitS === void 0) throw error;
      options.logger?.warn(`${request} retry ${tries + 1}: wait ${waitS.toFixed(2)} s`);
      try {
        await delay(waitS * 1e3, options.signal ?? new AbortController().signal);
      } catch {
        if (error instanceof TransportError) {
          throw new TransportError(
            "request was aborted while waiting to retry",
            "pre-dispatch",
            "aborted",
            error.method
          );
        }
        throw error;
      }
    }
  }
}

// src/internal/binary-submission.ts
var MAX_CONTROL_METADATA_BYTES = 4194304;
function geometryFields() {
  return Array.from(requireCore().binaryGeometryFields());
}
async function capability(gateway, signal) {
  const raw = await gateway.requestJson(
    "/binary/v1/capabilities",
    signal === void 0 ? {} : { signal }
  );
  const value = object(raw, "binary capability");
  if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1) {
    throw new TypeError("gateway has an incompatible binary wire format");
  }
  const geometrySchemas = Array.isArray(value.geometrySchemas) ? value.geometrySchemas : [1];
  const limits = object(value.limits, "binary limits");
  const parsedLimits = {
    maxGeometryBytes: positive(limits.maxGeometryBytes, 67108864, "maxGeometryBytes"),
    // Ground polygons and point vegetation share this bounded input metadata budget.
    maxMetadataBytes: positive(limits.maxMetadataBytes, 8388608, "maxMetadataBytes"),
    maxMeshes: positive(limits.maxMeshes, 1e5, "maxMeshes"),
    maxInstances: positive(limits.maxInstances, 1e5, "maxInstances"),
    maxResultBytes: positive(limits.maxResultBytes, 268435456, "maxResultBytes"),
    maxResultCells: positive(limits.maxResultCells, 16777216, "maxResultCells"),
    maxTriangleValues: positive(limits.maxTriangleValues, 67108864, "maxTriangleValues")
  };
  const models = object(value.models, "binary capability models");
  for (const [name, raw2] of Object.entries(models)) {
    const model = object(raw2, `binary model ${name}`);
    if (!Array.isArray(model.geometryGroups) || !model.geometryGroups.every((item) => typeof item === "string") || !Array.isArray(model.resultFamilies) || !model.resultFamilies.every((item) => typeof item === "string")) {
      throw new TypeError(`binary model ${name} is invalid`);
    }
  }
  const facadeTargets = Number.isSafeInteger(value.facadeTargets) && value.facadeTargets > 0 ? value.facadeTargets : void 0;
  return {
    inputFormat: "irbf",
    resultFormat: "irbf",
    wireVersion: 1,
    geometrySchemas,
    models,
    limits: parsedLimits,
    ...facadeTargets === void 0 ? {} : { facadeTargets },
    ...value.batchSubmit === void 0 ? {} : { batchSubmit: value.batchSubmit }
  };
}
function checkBinaryRoute(analysisType2, supported) {
  const schema = requireCore().geometrySchemaVersion();
  const schemas = supported.geometrySchemas ?? [1];
  if (!schemas.includes(schema)) {
    throw new TypeError(`this endpoint reads binary geometry schema(s) ${JSON.stringify(schemas)}; this SDK writes schema ${schema}. The server needs the geometry schema ${schema} update.`);
  }
  const model = supported.models[analysisType2];
  if (model === void 0 || !Array.isArray(model.geometryGroups) || !Array.isArray(model.resultFamilies) || model.resultFamilies.length === 0) {
    throw new TypeError(`model ${analysisType2} does not support binary transport`);
  }
  return model;
}
async function prepareBinary(prepared, supported) {
  const model = checkBinaryRoute(prepared.analysisType, supported);
  const body = { ...prepared.body };
  const fields = geometryFields();
  const present2 = fields.filter((name) => {
    const value = body[name];
    return value !== void 0 && value !== null && typeof value === "object";
  });
  for (const name of present2) if (!model.geometryGroups.includes(name)) {
    throw new TypeError(`model ${prepared.analysisType} does not support binary geometry group ${name}`);
  }
  const control = { ...body };
  for (const name of fields) delete control[name];
  delete control["binary-results"];
  const controlJson = JSON.stringify(control);
  if (controlJson === void 0) throw new TypeError("binary control has no JSON wire form");
  canonicalJsonBytes2(controlJson, Math.min(
    supported.limits.maxMetadataBytes,
    MAX_CONTROL_METADATA_BYTES
  ), "binary control");
  const tile = prepared.artifact === void 0 ? bodyArtifact(prepared.body, supported.limits) : await prepared.artifact({ ...supported.limits, facadeTargets: supported.facadeTargets ?? 0 });
  if (prepared.artifact !== void 0 && isSurfaceBody(prepared.body)) {
    checkFacadeArtifact(prepared.analysisType, prepared.body, tile);
  }
  const artifact = tile;
  return { artifact, control, limits: supported.limits };
}
async function uploadGeometry2(uploadGateway, fetch2, prepared, timeoutMs, signal) {
  const response = await withHostRetry("upload", () => uploadGateway.requestJson("/uploads/presign", {
    method: "POST",
    body: { content_length: prepared.artifact.archive.byteLength },
    ...signal === void 0 ? {} : { signal }
  }), { signal });
  const value = object(response, "presign response");
  const uploadUrl = https(value["upload-url"], "upload-url");
  const getUrl = https(value["get-url"], "get-url");
  await withHostRetry("upload", () => uploadPresignedZip(uploadUrl, prepared.artifact.archive, {
    fetch: fetch2,
    timeoutMs,
    ...signal === void 0 ? {} : { signal }
  }), { signal });
  return getUrl;
}
function binarySubmission(binary, geometryUrl, resultFormat = "irbf") {
  return {
    geometry: {
      url: geometryUrl,
      encoding: binary.artifact.encoding,
      artifactDigest: binary.artifact.artifactDigest,
      contentDigest: binary.artifact.geometryContentDigest,
      byteLength: binary.artifact.archive.byteLength
    },
    control: binary.control,
    limits: binary.limits,
    resultFormat,
    ...binary.artifact.targets === void 0 ? {} : { targets: binary.artifact.targets }
  };
}
function binaryEnvelope(binary) {
  const envelope = JSON.stringify({
    inputFormat: "irbf",
    resultFormat: binary.resultFormat,
    wireVersion: 1,
    geometry: binary.geometry,
    control: binary.control,
    ...binary.targets === void 0 ? {} : { targets: binary.targets }
  });
  return canonicalJsonBytes2(
    envelope,
    Math.min(
      binary.limits.maxMetadataBytes,
      MAX_CONTROL_METADATA_BYTES
    ) + 65536,
    "binary submission envelope"
  );
}
async function submitBinary(gateway, prepared, binary, parseJob2, signal, beforeDispatch, idempotencyKey) {
  const body = binaryEnvelope(binary);
  const endpointPath = `/binary/v1/async/${encodeURIComponent(prepared.analysisType)}`;
  const headers = {
    "Content-Type": "application/json",
    ...idempotencyKey === void 0 ? {} : { "Idempotency-Key": idempotencyKey }
  };
  let response;
  try {
    response = await dispatchKeyed({
      gateway,
      endpointPath,
      body,
      headers,
      ...idempotencyKey === void 0 ? {} : { idempotencyKey },
      ...beforeDispatch === void 0 ? {} : { beforeDispatch },
      ...signal === void 0 ? {} : { signal }
    });
  } catch (error) {
    if (error instanceof SubmissionUncertainError) throw error;
    if (error instanceof TransportError && error.phase !== "pre-dispatch") {
      throw new SubmissionUncertainError([]);
    }
    throw error;
  }
  const rejected = response.status < 200 || response.status >= 300;
  if (rejected && idempotencyKey !== void 0) {
    throw new TransportError(
      `binary submission received HTTP ${response.status}`,
      "response",
      "http",
      "POST",
      response.status
    );
  }
  let raw;
  try {
    raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(response.content));
  } catch {
    throw new SubmissionUncertainError([]);
  }
  if (rejected) {
    if (!preacceptRejection(response.status, raw)) {
      throw new SubmissionUncertainError(jobIds(raw));
    }
    throw new TransportError(
      `binary submission received HTTP ${response.status}`,
      "response",
      "http",
      "POST",
      response.status
    );
  }
  let record3;
  let job;
  try {
    record3 = object(raw, "binary accepted response");
    job = parseJob2(record3);
  } catch {
    throw new SubmissionUncertainError(jobIds(raw));
  }
  try {
    validateAck(record3.binary, binary.geometry, binary.resultFormat);
  } catch {
    throw new SubmissionUncertainError([job.jobId]);
  }
  return job;
}
function preacceptRejection(status2, raw) {
  if (![400, 401, 402, 404, 413, 415, 422, 429].includes(status2) || raw === null || typeof raw !== "object" || Array.isArray(raw)) return false;
  const value = raw;
  return Object.keys(value).sort().join() === "code,detail,status,title,type" && value.status === status2 && value.code === "JOB_BINARY_REJECTED" && [value.type, value.title, value.detail].every((item) => typeof item === "string");
}
function validateAck(raw, geometry, resultFormat) {
  const value = object(raw, "binary acknowledgement");
  if (value.inputFormat !== "irbf" || value.resultFormat !== resultFormat || value.wireVersion !== 1 || value.artifactDigest !== geometry.artifactDigest || value.contentDigest !== geometry.contentDigest) {
    throw new TypeError("binary acknowledgement does not match the submitted artifact");
  }
}
function positive(value, cap, name) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > cap) throw new TypeError(`binary ${name} is invalid`);
  return value;
}
function object(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object`);
  return value;
}
function https(value, name) {
  if (typeof value !== "string") throw new TypeError(`presign response has no ${name}`);
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.hash) throw new TypeError(`presign response ${name} is invalid`);
  return url.href;
}
function jobIds(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  const id = value.jobId;
  return typeof id === "string" && id ? [id] : [];
}
function canonicalJsonBytes2(value, maxBytes, name) {
  try {
    return requireCore().canonicalMetadataJson(value, maxBytes, 32);
  } catch (error) {
    if (error instanceof Error && /byte limit/i.test(error.message)) {
      throw new RangeError(`${name} exceeds its byte limit`);
    }
    throw error;
  }
}

// src/internal/capability-cache.ts
var CAPABILITY_TTL_MS = 6e4;
function fetchCapability(gateway, signal) {
  return withHostRetry("capability", () => capability(gateway, signal), { signal });
}
var CapabilityCache = class {
  constructor(gateway) {
    this.gateway = gateway;
  }
  entry;
  get(signal) {
    const now3 = Date.now();
    if (this.entry !== void 0 && now3 - this.entry.at < CAPABILITY_TTL_MS) return this.entry.value;
    const value = fetchCapability(this.gateway, signal).catch((error) => {
      if (this.entry?.value === value) this.entry = void 0;
      throw error;
    });
    this.entry = { at: now3, value };
    return value;
  }
};

// src/internal/binary-admission.ts
var limit = 2;
var active2 = 0;
var waiting4 = [];
async function withBinaryAdmission(operation, signal) {
  if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
  if (active2 < limit && waiting4.length === 0) active2 += 1;
  else await new Promise((resolve, reject) => {
    const waiter = { resolve, reject, ...signal === void 0 ? {} : { signal } };
    if (signal !== void 0) {
      const abort = () => {
        const index2 = waiting4.indexOf(waiter);
        if (index2 >= 0) waiting4.splice(index2, 1);
        reject(signal.reason ?? new DOMException("aborted", "AbortError"));
      };
      waiter.abort = abort;
      signal.addEventListener("abort", abort, { once: true });
    }
    waiting4.push(waiter);
  });
  try {
    if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
    return await operation();
  } finally {
    active2 -= 1;
    while (active2 < limit && waiting4.length > 0) {
      const waiter = waiting4.shift();
      if (waiter.signal !== void 0 && waiter.abort !== void 0) {
        waiter.signal.removeEventListener("abort", waiter.abort);
      }
      active2 += 1;
      waiter.resolve();
    }
  }
}

// src/internal/binary-url-cache.ts
var FALLBACK_TTL_MS = 60 * 60 * 1e3;
var SAFETY_MARGIN_MS = 60 * 1e3;
var MAX_URL_LENGTH = 8192;
var MAX_ENTRIES = 256;
var entries2 = /* @__PURE__ */ new Map();
var BinaryUrlCache = class {
  /** The caller's `geometryUrlStore`, read once per key before an upload. */
  constructor(enabled, now3 = Date.now, store) {
    this.enabled = enabled;
    this.now = now3;
    this.store = store;
  }
  /** The uploads that run now, one per URL key, for this client only (T4).
   * Used also when reuse is off: it only joins an upload that runs now. */
  inFlight = /* @__PURE__ */ new Map();
  get(key) {
    if (!this.enabled) return void 0;
    const entry = entries2.get(key);
    if (entry === void 0) return void 0;
    if (this.now() >= entry.expiresAt) {
      entries2.delete(key);
      return void 0;
    }
    entries2.delete(key);
    entries2.set(key, entry);
    return entry.url;
  }
  /** Forget `key` when its URL is `url` (the server refused it). */
  drop(key, url) {
    if (entries2.get(key)?.url === url) entries2.delete(key);
  }
  /** Keep `url`; `limit` is a known end of validity (from the caller's store). */
  set(key, url, limit3 = Infinity) {
    if (!this.enabled || url.length > MAX_URL_LENGTH) return;
    const until = reusableUntil(url, this.now());
    const expiresAt = until === void 0 ? void 0 : Math.min(until, limit3);
    if (expiresAt === void 0 || expiresAt <= this.now()) return;
    entries2.delete(key);
    entries2.set(key, { url, expiresAt });
    while (entries2.size > MAX_ENTRIES) entries2.delete(entries2.keys().next().value);
  }
};
function reusableUntil(raw, now3) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return void 0;
  }
  const date = url.searchParams.get("X-Amz-Date");
  const seconds = url.searchParams.get("X-Amz-Expires");
  if (date === null && seconds === null) return now3 + FALLBACK_TTL_MS - SAFETY_MARGIN_MS;
  if (date === null || seconds === null || !/^\d{8}T\d{6}Z$/.test(date) || !/^\d+$/.test(seconds)) {
    return void 0;
  }
  const signedAt = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(4, 6)) - 1,
    Number(date.slice(6, 8)),
    Number(date.slice(9, 11)),
    Number(date.slice(11, 13)),
    Number(date.slice(13, 15))
  );
  const ttl = Number(seconds) * 1e3;
  if (!Number.isSafeInteger(ttl) || ttl <= 0) return void 0;
  const canonical = new Date(signedAt).toISOString().replace(/[-:]/g, "").replace(".000", "");
  if (canonical !== date) return void 0;
  return Math.min(signedAt + ttl, now3 + FALLBACK_TTL_MS) - SAFETY_MARGIN_MS;
}

// src/internal/binary-retention.ts
var BUDGET_BYTES = 64 * 1024 * 1024;
var BinaryRetention = class {
  held = /* @__PURE__ */ new WeakMap();
  bytes = 0;
  get(prepared) {
    return this.held.get(prepared);
  }
  /** Hold this artifact if the budget allows. Returns the bytes now held for it. */
  keep(prepared, binary) {
    if (this.held.has(prepared)) return binary.artifact.archive.byteLength;
    if (this.bytes >= BUDGET_BYTES) return 0;
    this.held.set(prepared, binary);
    this.bytes += binary.artifact.archive.byteLength;
    return binary.artifact.archive.byteLength;
  }
  /** Drop what is held for this submission. A no-op when nothing is. */
  release(prepared) {
    const binary = this.held.get(prepared);
    if (binary === void 0) return;
    this.held.delete(prepared);
    this.bytes -= binary.artifact.archive.byteLength;
  }
  /** What this client is holding right now. Zero when every tile is released. */
  get retainedBytes() {
    return this.bytes;
  }
};

// src/internal/status-batch.ts
function isTransientStatusError(error) {
  if (!(error instanceof TransportError)) return false;
  if (error.reason === "network" || error.reason === "timeout") return true;
  return error.reason === "http" && error.status !== void 0 && (error.status === 429 || error.status >= 500);
}
var STATUS_BATCH_LIMIT = 50;
function rejectsTheForm(error) {
  if (!(error instanceof TransportError) || error.status === void 0) return false;
  return error.status === 400 || error.status === 404 || error.status === 405 || error.status === 501;
}
function chunk(ids) {
  const chunks = [];
  for (let start = 0; start < ids.length; start += STATUS_BATCH_LIMIT) {
    chunks.push(ids.slice(start, start + STATUS_BATCH_LIMIT));
  }
  return chunks;
}
function readJobs(payload) {
  if (Array.isArray(payload)) return { jobs: payload, batched: false };
  if (payload !== null && typeof payload === "object") {
    const jobs = payload.jobs;
    if (Array.isArray(jobs)) return { jobs, batched: true };
  }
  return void 0;
}
async function fetchChunk(gateway, ids, signal) {
  const query = ids.map((id) => encodeURIComponent(id)).join(",");
  let payload;
  try {
    payload = await gateway.requestJson(
      `/async/jobs?ids=${query}`,
      signal === void 0 ? {} : { signal }
    );
  } catch (error) {
    if (rejectsTheForm(error)) return "unsupported";
    throw error;
  }
  const read = readJobs(payload);
  if (read === void 0) return "unsupported";
  const statuses = /* @__PURE__ */ new Map();
  for (const entry of read.jobs) {
    let job;
    try {
      job = jobFromResponse(entry);
    } catch {
      continue;
    }
    statuses.set(job.jobId, job);
  }
  return { statuses, batched: read.batched };
}
async function fetchStatusBatch(gateway, jobIds2, options = {}) {
  const statuses = /* @__PURE__ */ new Map();
  const unanswered = [];
  let answered = 0;
  let lacking = false;
  const failedIds = [];
  let retryAfterS;
  let refusedStatus;
  if (jobIds2.length === 0) return { statuses, unanswered, batched: false, lacking: false };
  const chunks = chunk(jobIds2);
  const workers = Math.max(1, Math.min(options.maxWorkers ?? 5, chunks.length));
  let cursor = 0;
  await Promise.all(Array.from({ length: workers }, async () => {
    while (cursor < chunks.length) {
      const ids = chunks[cursor++];
      if (ids === void 0) return;
      let answer;
      try {
        answer = await fetchChunk(gateway, ids, options.signal);
      } catch (error) {
        if (options.signal?.aborted === true) throw error;
        if (isTransientStatusError(error) && error.reason === "http") {
          failedIds.push(...ids);
          if (error.retryAfterS !== void 0) retryAfterS = Math.max(retryAfterS ?? 0, error.retryAfterS);
          continue;
        }
        if (error instanceof TransportError && error.reason === "http" && error.status !== void 0) {
          refusedStatus ??= error.status;
        }
        unanswered.push(...ids);
        continue;
      }
      if (answer === "unsupported") {
        lacking = true;
        unanswered.push(...ids);
        continue;
      }
      if (answer.batched) answered += 1;
      else lacking = true;
      for (const id of ids) {
        const job = answer.statuses.get(id);
        if (job === void 0) unanswered.push(id);
        else statuses.set(id, job);
      }
    }
  }));
  return {
    statuses,
    unanswered,
    batched: answered > 0,
    lacking,
    ...failedIds.length === 0 ? {} : { failedIds },
    ...refusedStatus === void 0 ? {} : { refusedStatus },
    ...retryAfterS === void 0 ? {} : { retryAfterS }
  };
}

// src/internal/binary-submit-coordinator.ts
function awaitAbortable(promise, signal) {
  if (signal === void 0) return promise;
  if (signal.aborted) return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}
async function sharedUpload(options, key, uploadGateway, prepared, keep, refresh = false) {
  const inFlight2 = options.urlCache.inFlight;
  let upload = inFlight2.get(key);
  if (upload !== void 0) {
    options.stages?.uploaded();
    return awaitAbortable(upload, options.signal);
  }
  upload = (keep ? storedOrUploaded(options, key, uploadGateway, prepared, refresh) : uploadGeometry2(uploadGateway, options.fetch, prepared, options.timeoutMs, void 0).then((url) => ({ url, reused: false }))).finally(() => {
    inFlight2.delete(key);
  });
  inFlight2.set(key, upload);
  upload.catch(() => void 0);
  try {
    return await awaitAbortable(upload, options.signal);
  } finally {
    options.stages?.uploaded();
  }
}
async function storedOrUploaded(options, key, uploadGateway, prepared, refresh) {
  const cache2 = options.urlCache;
  const tagged = storeKey("irbf", key);
  const stored = refresh ? void 0 : await cache2.store?.get(tagged);
  if (stored !== void 0) {
    cache2.set(key, stored.url, stored.expiresAt);
    return { url: stored.url, reused: true };
  }
  const release4 = refresh ? void 0 : await cache2.store?.claim(tagged);
  let held = release4;
  try {
    const claimed = release4 === void 0 ? void 0 : await cache2.store?.get(tagged);
    if (claimed !== void 0) {
      cache2.set(key, claimed.url, claimed.expiresAt);
      return { url: claimed.url, reused: true };
    }
    const url = await uploadGeometry2(uploadGateway, options.fetch, prepared, options.timeoutMs, void 0);
    cache2.set(key, url);
    const written = cache2.store?.set(tagged, url);
    if (release4 !== void 0 && written !== void 0) {
      held = void 0;
      void written.then(release4);
    }
    return { url, reused: false };
  } finally {
    held?.();
  }
}
function refusedGeometry(error) {
  return error instanceof TransportError && error.phase === "response" && error.status !== void 0 && [400, 404, 410, 422].includes(error.status);
}
async function refreshedSubmission(options, key, uploadGateway, deadUrl) {
  options.urlCache.drop(key, deadUrl);
  try {
    const prepared = await encodeAdmitted(options, true);
    const known = options.urlCache.get(key);
    const url = known !== void 0 && known !== deadUrl ? known : (await sharedUpload(options, key, uploadGateway, prepared, true, true)).url;
    return binarySubmission(prepared, url, options.resultFormat);
  } finally {
    options.releasePrepared();
  }
}
function urlCacheKey(uploadBaseUrl, gatewayBaseUrl, digest, encoding, artifactDigest) {
  return [gatewayBaseUrl, uploadBaseUrl, digest ?? "", encoding, artifactDigest].join("\n");
}
function post2(options, send) {
  return options.stages === void 0 ? send() : options.stages.post(send);
}
function boundAuth(headers, expected, auth) {
  return async () => {
    const current = await auth();
    if (await exactAuthHeadersDigest(current) !== expected) {
      throw new AuthPartitionChangedError();
    }
    return headers;
  };
}
async function resolveAuth(options) {
  const deadline = new Deadline(options.signal, options.timeoutMs);
  try {
    const headers = await deadline.wait(() => options.auth());
    return normalizeAuthHeaders(headers);
  } catch {
    const stopped = deadline.reason();
    throw new TransportError(
      stopped === "timeout" ? "gateway request timed out before dispatch" : stopped === "aborted" ? "gateway request was aborted before dispatch" : "gateway request authentication failed",
      "pre-dispatch",
      stopped ?? "auth",
      "POST"
    );
  } finally {
    deadline.close();
  }
}
function transport(baseUrl, auth, options) {
  return new GatewayTransport({ baseUrl, auth, fetch: options.fetch, timeoutMs: options.timeoutMs });
}
function encodeAdmitted(options, fresh) {
  return withBinaryAdmission(() => options.prepare(fresh), options.signal);
}
async function prepareUncached(options, fresh) {
  try {
    const binary = await encodeAdmitted(options, fresh);
    const digest = await exactAuthHeadersDigest(await resolveAuth(options));
    const key = urlCacheKey(
      options.uploadGateway.baseUrl,
      options.gateway.baseUrl,
      digest,
      binary.artifact.encoding,
      binary.artifact.artifactDigest
    );
    const { url: geometryUrl } = await sharedUpload(options, key, options.uploadGateway, binary, false);
    return binarySubmission(binary, geometryUrl, options.resultFormat);
  } finally {
    options.releasePrepared();
  }
}
async function uncached(options, fresh, deliver) {
  const binary = await prepareUncached(options, fresh);
  return deliver(options.gateway, binary, options.beforeDispatch);
}
function submitPreparedBinary(options) {
  return deliverPrepared(options, (gateway, binary, beforeDispatch) => post2(options, () => submitBinary(
    gateway,
    options.prepared,
    binary,
    options.parseJob,
    options.signal,
    beforeDispatch,
    options.idempotencyKey
  )));
}
function prepareBinaryEnvelope(options) {
  return deliverPrepared(options, async (_gateway, binary) => binaryEnvelope(binary));
}
async function deliverPrepared(options, deliver) {
  if (!options.reuseEnabled) return uncached(options, false, deliver);
  const headers = await resolveAuth(options);
  const digest = await exactAuthHeadersDigest(headers);
  if (digest === void 0) return uncached(options, false, deliver);
  const strictAuth = boundAuth(headers, digest, options.auth);
  const gateway = transport(options.gateway.baseUrl, strictAuth, options);
  const uploadGateway = transport(options.uploadGateway.baseUrl, strictAuth, options);
  let paidDispatched = false;
  const beforeDispatch = () => {
    options.beforeDispatch?.();
    paidDispatched = true;
  };
  const send = (binary) => deliver(gateway, binary, beforeDispatch);
  try {
    let binary;
    let cacheKey2;
    let url;
    let reused = true;
    try {
      const prepared = await encodeAdmitted(options, false);
      cacheKey2 = urlCacheKey(
        uploadGateway.baseUrl,
        gateway.baseUrl,
        digest,
        prepared.artifact.encoding,
        prepared.artifact.artifactDigest
      );
      url = options.urlCache.get(cacheKey2);
      if (url === void 0) ({ url, reused } = await sharedUpload(options, cacheKey2, uploadGateway, prepared, true));
      else options.stages?.uploaded();
      binary = binarySubmission(prepared, url, options.resultFormat);
    } finally {
      options.releasePrepared();
    }
    try {
      return await send(binary);
    } catch (error) {
      if (!reused || !refusedGeometry(error)) throw error;
      return await send(await refreshedSubmission(options, cacheKey2, uploadGateway, url));
    }
  } catch (error) {
    if (!(error instanceof AuthPartitionChangedError)) throw error;
    if (paidDispatched) throw error;
    return uncached(options, true, deliver);
  }
}

// src/results/retired.ts
var RETIRED_SIDECAR_KEYS = [
  "values_bin",
  "values_bin_dtype",
  "values_bin_encoding",
  "cell-tris_bin",
  "cell-tris_bin_dtype",
  "cell-tris_offsets_bin",
  "cell-tris_bin_encoding",
  "cell-tris_offsets_bin_encoding"
];
var RETIRED_ROOT_KEYS = [
  "output_bin",
  "output_bin_dtype",
  "output_bin_shape",
  "output_bin_encoding",
  "values_bin",
  "values_bin_dtype",
  "values_bin_shape",
  "values_bin_encoding"
];
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function rejectRetiredResultFields(value) {
  if (!isRecord(value)) return;
  for (const field of RETIRED_ROOT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(value, field)) {
      throw new TypeError(`result contains retired field ${field}`);
    }
  }
  if (!isRecord(value.surfaces)) return;
  for (const [key, entry] of Object.entries(value.surfaces)) {
    if (!isRecord(entry)) continue;
    for (const field of RETIRED_SIDECAR_KEYS) {
      if (Object.prototype.hasOwnProperty.call(entry, field)) {
        throw new TypeError(`surface ${key} contains retired result field ${field}`);
      }
    }
  }
}

// src/internal/binary-result.ts
var F16_EXPONENT_SCALE = Array.from({ length: 31 }, (_, exponent) => 2 ** (exponent - 25));
function decodeBinaryResultDocument(document2, limits) {
  checkLimits(limits);
  const source = typeof SharedArrayBuffer !== "undefined" && document2.buffer instanceof SharedArrayBuffer ? document2.slice() : document2;
  const inspected = callCore("inspectBinaryResult", source, limits);
  const decoded = { ...inspected, sections: inspected.sections.map((section) => {
    const [offset, length] = section.byteRange;
    return { ...section, bytes: source.subarray(offset, offset + length) };
  }) };
  return projectDecoded(decoded);
}
function callCore(method, document2, limits) {
  return requireCore()[method](
    document2,
    BigInt(limits.maxTotalBytes),
    limits.maxMetadataBytes,
    64,
    BigInt(Math.max(limits.maxCells + 1, limits.maxTriangleValues)),
    32,
    BigInt(limits.maxCells),
    BigInt(limits.maxTriangleValues)
  );
}
function projectDecoded(decoded) {
  const metadata = object2(JSON.parse(decoded.metadataJson), "binary result metadata");
  const sections = new Map(decoded.sections.map((section) => [section.role, section]));
  if (decoded.family === "surfaces") return {
    family: decoded.family,
    value: surfaces(metadata, sections)
  };
  const data = requireSection(sections, 1), validity = requireSection(sections, 2);
  const dataValues = numericSource(data);
  let dictionary;
  if (decoded.family === "categorical-grid") {
    dictionary = metadata.dictionary;
    if (!Array.isArray(dictionary)) throw new TypeError("categorical dictionary is missing");
  }
  const attributes = { ...object2(metadata.attributes ?? {}, "result attributes") };
  projectArrays(attributes, metadata.arrays, sections);
  if (decoded.family === "vector") return { family: decoded.family, value: {
    ...attributes,
    output: materializeRange(
      dataValues,
      validity,
      0,
      Number(data.elementCount),
      dictionary,
      valueDivisor(metadata, data)
    )
  } };
  const shape = metadata.shape;
  if (!Array.isArray(shape) || shape.length !== 2) throw new TypeError("grid shape is invalid");
  const rows = shape[0], columns = shape[1], matrix = [];
  for (let row = 0; row < rows; row += 1) {
    matrix.push(materializeRange(
      dataValues,
      validity,
      row * columns,
      (row + 1) * columns,
      dictionary,
      valueDivisor(metadata, data)
    ));
  }
  return {
    family: decoded.family,
    value: metadata.root === "array" ? matrix : { ...attributes, output: matrix }
  };
}
function checkLimits(limits) {
  for (const [name, value] of Object.entries(limits)) checkLimit(value, name);
}
function projectArrays(target, raw, sections) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) throw new TypeError("binary result arrays must be an array");
  for (const candidate of raw) {
    const descriptor = object2(candidate, "binary result array descriptor");
    const path = descriptor.path, shape = descriptor.shape;
    const data = requireSection(sections, descriptor.dataRole);
    const validity = descriptor.validityRole;
    const value = materializeShape(
      numericSource(data),
      validity === void 0 ? void 0 : requireSection(sections, validity),
      shape,
      valueDivisor(descriptor, data)
    );
    let owner = target;
    for (const key of path.slice(0, -1)) {
      const child = Object.hasOwn(owner, key) ? owner[key] : void 0;
      if (child === void 0) defineOwn(owner, key, {});
      else if (child === null || typeof child !== "object" || Array.isArray(child)) {
        throw new Error("binary result auxiliary path collides with metadata");
      }
      owner = owner[key];
    }
    defineOwn(owner, path[path.length - 1], value);
  }
}
function materializeShape(values, validity, shape, divisor) {
  let cursor = 0;
  const visit = (depth) => {
    if (depth === shape.length) {
      const index2 = cursor++;
      return validity !== void 0 && !validAt(validity, index2) ? null : values.at(index2) / divisor;
    }
    const output = new Array(shape[depth]);
    for (let index2 = 0; index2 < output.length; index2 += 1) output[index2] = visit(depth + 1);
    return output;
  };
  return visit(0);
}
function surfaces(metadata, sections) {
  if (!Array.isArray(metadata.frames)) throw new TypeError("surface frames are missing");
  const values = requireSection(sections, 1), valueValidity = requireSection(sections, 2);
  const valueSource = numericSource(values);
  const areas = sections.get(3), areaValidity = sections.get(4);
  const offsets = sections.get(5);
  const triangles = sections.has(6) ? typed(requireSection(sections, 6)) : void 0;
  const triangleBits = sections.get(7);
  const output = /* @__PURE__ */ Object.create(null);
  for (const raw of metadata.frames) {
    const frame = object2(raw, "surface frame"), shape = frame.shape;
    if (!Array.isArray(shape) || shape.length !== 2) throw new TypeError("surface shape is invalid");
    const start = frame.start, end = start + shape[0] * shape[1];
    const attributes2 = object2(frame.attributes ?? {}, "surface attributes");
    const item = {
      ...attributes2,
      nu: shape[0],
      nv: shape[1],
      values: materializeRange(
        valueSource,
        valueValidity,
        start,
        end,
        void 0,
        valueDivisor(metadata, values)
      )
    };
    if (frame.hasCellArea === true && areas !== void 0 && areaValidity !== void 0) {
      item["cell-area"] = materializeRange(numericSource(areas), areaValidity, start, end);
    }
    if (frame.hasCellTris === true && offsets !== void 0 && triangles !== void 0) {
      const cells = new Array(end - start);
      for (let cell = start; cell < end; cell += 1) {
        if (triangleBits !== void 0 && !validAt(triangleBits, cell)) {
          cells[cell - start] = null;
          continue;
        }
        const first = u64OffsetAt(offsets, cell), last = u64OffsetAt(offsets, cell + 1);
        const coordinates = new Array(last - first);
        for (let index2 = first; index2 < last; index2 += 1) {
          coordinates[index2 - first] = triangles[index2];
        }
        cells[cell - start] = coordinates;
      }
      item["cell-tris"] = cells;
    }
    output[String(frame.id)] = item;
  }
  const attributes = object2(metadata.attributes ?? {}, "surface root attributes");
  return { ...attributes, surfaces: output };
}
function materializeRange(values, validity, start, end, dictionary, divisor = 1) {
  const output = new Array(end - start);
  for (let index2 = start; index2 < end; index2 += 1) {
    const value = values.at(index2);
    output[index2 - start] = !validAt(validity, index2) ? null : dictionary === void 0 ? value / divisor : dictionary[value];
  }
  return output;
}
function typed(section) {
  if (section.dtype === "u8") return section.bytes;
  if (section.dtype === "f16") throw new TypeError("f16 requires scalar projection");
  const definitions = {
    u32: [Uint32Array, 4],
    i16: [Int16Array, 2],
    i32: [Int32Array, 4],
    f32: [Float32Array, 4],
    f64: [Float64Array, 8],
    u64: [BigUint64Array, 8]
  };
  const definition = definitions[section.dtype];
  if (definition === void 0) throw new TypeError(`unsupported result dtype ${section.dtype}`);
  const [Constructor, width] = definition;
  if (section.bytes.buffer instanceof ArrayBuffer && section.bytes.byteOffset % width === 0) {
    return new Constructor(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength / width);
  }
  const copy = new Uint8Array(section.bytes.length);
  copy.set(section.bytes);
  return new Constructor(copy.buffer, 0, copy.byteLength / width);
}
function numericSource(section) {
  if (section.dtype === "u64") throw new TypeError("u64 is not a scalar result value dtype");
  if (section.dtype === "f16") {
    const view = new DataView(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength);
    return { at: (index2) => decodeF16(view.getUint16(index2 * 2, true)) };
  }
  const values = typed(section);
  return { at: (index2) => values[index2] };
}
function valueDivisor(owner, data) {
  const raw = owner.valueDivisor;
  if (raw === void 0 || raw === null) return 1;
  if (data.dtype !== "i16" || !Number.isSafeInteger(raw) || raw < 1 || raw > 1e6) throw new TypeError("valueDivisor requires i16 data and a uint value from 1 through 1000000");
  return raw;
}
function decodeF16(bits2) {
  const sign = bits2 & 32768 ? -1 : 1;
  const exponent = bits2 >>> 10 & 31, fraction = bits2 & 1023;
  return exponent === 0 ? sign * fraction * F16_EXPONENT_SCALE[1] : exponent === 31 ? fraction === 0 ? sign * Infinity : NaN : sign * (fraction + 1024) * F16_EXPONENT_SCALE[exponent];
}
function validAt(section, index2) {
  return (section.bytes[index2 >> 3] & 1 << (index2 & 7)) !== 0;
}
function u64OffsetAt(section, index2) {
  if (section.dtype !== "u64") throw new TypeError("triangle offsets must use u64");
  const position = index2 * 8;
  const view = new DataView(section.bytes.buffer, section.bytes.byteOffset, section.bytes.byteLength);
  if (view.getUint32(position + 4, true) !== 0) {
    throw new RangeError("triangle offset exceeds the supported uint32 range");
  }
  return view.getUint32(position, true);
}
function defineOwn(owner, key, value) {
  Object.defineProperty(owner, key, { value, enumerable: true, configurable: true, writable: true });
}
function requireSection(sections, role) {
  const value = sections.get(role);
  if (value === void 0) throw new Error(`binary result omitted role ${role}`);
  return value;
}
function object2(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${name} must be an object`);
  return value;
}
function checkLimit(value, name) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 4294967295) throw new RangeError(`${name} must be a non-negative uint32 integer`);
}

// src/parts/daylight-result.ts
var NO_ROOM = 65535;
function daylightCore() {
  return requireCore();
}
var DaylightFactorResult = class {
  /** Result discriminator: always `"daylight-points"`. */
  // Maintainer note (not published): The result shape, as `SurfaceColumns.kind` for a facade run.
  kind = "daylight-points";
  /** The frame's schema version. */
  version;
  /** The binary frame every view reads. Do not change it. */
  frame;
  /** How the sensors are grouped. */
  layout;
  /** Total number of sensors (the length of every per-sensor column). */
  sensorCount;
  /** Lower end of the colour legend, as for a grid or facade result. */
  // Maintainer note (not published): The worker's `min-legend` / `max-legend`.
  minLegend;
  /** Upper end of the colour legend. */
  maxLegend;
  /** Sensor x coordinates. */
  x;
  /** Sensor y coordinates. */
  y;
  /** Sensor z coordinates. */
  z;
  /** The daylight factor per sensor: the `values` column of the grid and facade results. */
  values;
  /** Bit `i % 8` of byte `i / 8`: `values[i]` is present (as a grid result's `validity`). */
  validity;
  /** Index into `rooms` per sensor, or `NO_ROOM` for a sensor without a room. */
  room;
  /** The sensor groups, in frame order. */
  groups;
  /** The room rows, which `groups` and `room` index into. */
  rooms;
  /** Building names, indexed by `DaylightGroup.building`. */
  buildings;
  /** Warnings the analysis reported for the whole result. */
  warnings;
  /**
   * Validates `frame` and creates the views over it.
   *
   * The views share the buffer of `frame` when it starts on an 8-byte boundary; otherwise
   * it is copied once.
   *
   * @param frame - A binary daylight-factor result.
   * @throws {RangeError} When the frame exceeds the result size limit.
   * @throws {Error} When the frame is not a valid daylight-factor result.
   */
  constructor(frame) {
    if (frame.length > RESULT_DECODE_LIMITS.maxTotalBytes) {
      throw new RangeError(`daylight-factor result frame of ${frame.length} bytes exceeds the result limit of ${RESULT_DECODE_LIMITS.maxTotalBytes} bytes`);
    }
    const owned = frame.byteOffset % 8 === 0 ? frame : new Uint8Array(frame);
    const core2 = daylightCore();
    const summary = core2.decodeDaylightResult(owned);
    const s = summary.sections;
    const view = (make, i) => new make(owned.buffer, owned.byteOffset + i.offset, i.count);
    this.frame = owned;
    this.layout = summary.layout;
    this.sensorCount = summary.sensor_count;
    this.version = summary.schema_version;
    this.minLegend = summary.legend[0];
    this.maxLegend = summary.legend[1];
    this.x = view(Float64Array, s.x);
    this.y = view(Float64Array, s.y);
    this.z = view(Float64Array, s.z);
    this.values = view(Float32Array, s.df);
    this.validity = view(Uint8Array, s.df_validity);
    this.room = view(Uint16Array, s.room);
    this.groups = Object.freeze(summary.groups.map((g) => Object.freeze({
      key: g.key,
      building: g.building,
      start: g.start,
      end: g.end,
      hasRooms: g.rooms,
      roomStart: g.room_start,
      roomEnd: g.room_end,
      meanDf: g.mean_df,
      meanDfAll: g.mean_df_all
    })));
    this.rooms = Object.freeze(summary.rooms.map((r) => Object.freeze({
      id: r.id,
      name: r.name,
      sensors: r.sensors,
      meanDf: r.mean_df,
      medianDf: r.median_df,
      minDf: r.min_df,
      maxDf: r.max_df,
      areaPctDfGe2: r.area_pct_df_ge_2,
      windowArea: r.window_area,
      floorArea: r.floor_area,
      irc: r.irc
    })));
    this.buildings = Object.freeze([...summary.buildings]);
    this.warnings = Object.freeze([...summary.warnings]);
  }
  /**
   * Returns the result as the analysis's JSON document, as UTF-8 bytes.
   *
   * @returns The JSON bytes.
   */
  // Maintainer note (not published): Byte for byte the worker's JSON (`daylightJsonFromFrame`).
  toJsonBytes() {
    const core2 = daylightCore();
    return core2.daylightJsonFromFrame(this.frame);
  }
  /**
   * Returns the result as the parsed JSON value, the same value the `"json"` result
   * format gives.
   *
   * @returns The parsed JSON document.
   */
  toJson() {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(this.toJsonBytes()));
  }
};
function isDaylightFrame(document2) {
  return document2.length >= 12 && document2[0] === 73 && document2[1] === 82 && document2[2] === 66 && document2[3] === 70 && document2[10] === 7 && document2[11] === 0;
}

// node_modules/fflate/esm/index.mjs
var import_module = require("module");
var require2 = (0, import_module.createRequire)("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var gzs = function(d) {
  if (d[0] != 31 || d[1] != 139 || d[2] != 8)
    err(6, "invalid gzip data");
  var flg = d[3];
  var st = 10;
  if (flg & 4)
    st += (d[10] | d[11] << 8) + 2;
  for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
    ;
  return st + (flg & 2);
};
var gzl = function(d) {
  var l = d.length;
  return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
};
var Inflate = /* @__PURE__ */ (function() {
  function Inflate2(opts, cb) {
    if (typeof opts == "function")
      cb = opts, opts = {};
    this.ondata = cb;
    var dict = opts && opts.dictionary && opts.dictionary.subarray(-32768);
    this.s = { i: 0, b: dict ? dict.length : 0 };
    this.o = new u8(32768);
    this.p = new u8(0);
    if (dict)
      this.o.set(dict);
  }
  Inflate2.prototype.e = function(c) {
    if (!this.ondata)
      err(5);
    if (this.d)
      err(4);
    if (!this.p.length)
      this.p = c;
    else if (c.length) {
      var n = new u8(this.p.length + c.length);
      n.set(this.p), n.set(c, this.p.length), this.p = n;
    }
  };
  Inflate2.prototype.c = function(final) {
    this.s.i = +(this.d = final || false);
    var bts = this.s.b;
    var dt = inflt(this.p, this.s, this.o);
    this.ondata(slc(dt, bts, this.s.b), this.d);
    this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
    this.p = slc(this.p, this.s.p / 8 | 0), this.s.p &= 7;
  };
  Inflate2.prototype.push = function(chunk2, final) {
    this.e(chunk2), this.c(final);
  };
  return Inflate2;
})();
var Gunzip = /* @__PURE__ */ (function() {
  function Gunzip2(opts, cb) {
    this.v = 1;
    this.r = 0;
    Inflate.call(this, opts, cb);
  }
  Gunzip2.prototype.push = function(chunk2, final) {
    Inflate.prototype.e.call(this, chunk2);
    this.r += chunk2.length;
    if (this.v) {
      var p = this.p.subarray(this.v - 1);
      var s = p.length > 3 ? gzs(p) : 4;
      if (s > p.length) {
        if (!final)
          return;
      } else if (this.v > 1 && this.onmember) {
        this.onmember(this.r - p.length);
      }
      this.p = p.subarray(s), this.v = 0;
    }
    Inflate.prototype.c.call(this, 0);
    if (this.s.f && !this.s.l) {
      this.v = shft(this.s.p) + 9;
      this.s = { i: 0 };
      this.o = new u8(0);
      this.push(new u8(0), final);
    } else if (final) {
      Inflate.prototype.c.call(this, final);
    }
  };
  return Gunzip2;
})();
function gunzipSync(data, opts) {
  var st = gzs(data);
  if (st + 8 > data.length)
    err(6, "invalid gzip data");
  return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var UnzipPassThrough = /* @__PURE__ */ (function() {
  function UnzipPassThrough2() {
  }
  UnzipPassThrough2.prototype.push = function(chunk2, final) {
    this.ondata(null, chunk2, final);
  };
  UnzipPassThrough2.compression = 0;
  return UnzipPassThrough2;
})();
var UnzipInflate = /* @__PURE__ */ (function() {
  function UnzipInflate2() {
    var _this = this;
    this.i = new Inflate(function(dat, final) {
      _this.ondata(null, dat, final);
    });
  }
  UnzipInflate2.prototype.push = function(chunk2, final) {
    try {
      this.i.push(chunk2, final);
    } catch (e) {
      this.ondata(e, null, final);
    }
  };
  UnzipInflate2.compression = 8;
  return UnzipInflate2;
})();
var Unzip = /* @__PURE__ */ (function() {
  function Unzip2(cb) {
    this.onfile = cb;
    this.k = [];
    this.o = {
      0: UnzipPassThrough
    };
    this.p = et;
  }
  Unzip2.prototype.push = function(chunk2, final) {
    var _this = this;
    if (!this.onfile)
      err(5);
    if (!this.p)
      err(4);
    if (this.c > 0) {
      var len = Math.min(this.c, chunk2.length);
      var toAdd = chunk2.subarray(0, len);
      this.c -= len;
      if (this.d)
        this.d.push(toAdd, !this.c);
      else
        this.k[0].push(toAdd);
      chunk2 = chunk2.subarray(len);
      if (chunk2.length)
        return this.push(chunk2, final);
    } else {
      var f = 0, i = 0, is = void 0, buf = void 0;
      if (!this.p.length)
        buf = chunk2;
      else if (!chunk2.length)
        buf = this.p;
      else {
        buf = new u8(this.p.length + chunk2.length);
        buf.set(this.p), buf.set(chunk2, this.p.length);
      }
      var l = buf.length, oc = this.c, add = oc && this.d;
      var _loop_2 = function() {
        var sig = b4(buf, i);
        if (sig == 67324752) {
          f = 1, is = i;
          this_1.d = null;
          this_1.c = 0;
          var bf = b2(buf, i + 6), cmp_1 = b2(buf, i + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i + 26), es = b2(buf, i + 28);
          if (l > i + 30 + fnl + es) {
            var chks_3 = [];
            this_1.k.unshift(chks_3);
            f = 2;
            var lsc = b4(buf, i + 18), lsu = b4(buf, i + 22);
            var fn_1 = strFromU8(buf.subarray(i + 30, i += 30 + fnl), !u);
            var _a2 = z64hs(buf, i, es, 2, lsc, lsu, 0), sc_1 = _a2[0], su_1 = _a2[1], z64 = _a2[3];
            if (dd)
              sc_1 = -1 - z64;
            i += es;
            this_1.c = sc_1;
            var d_1;
            var file_1 = {
              name: fn_1,
              compression: cmp_1,
              start: function() {
                if (!file_1.ondata)
                  err(5);
                if (!sc_1)
                  file_1.ondata(null, et, true);
                else {
                  var ctr = _this.o[cmp_1];
                  if (!ctr)
                    file_1.ondata(err(14, "unknown compression type " + cmp_1, 1), null, false);
                  d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                  d_1.ondata = function(err2, dat3, final2) {
                    file_1.ondata(err2, dat3, final2);
                  };
                  for (var _i = 0, chks_4 = chks_3; _i < chks_4.length; _i++) {
                    var dat2 = chks_4[_i];
                    d_1.push(dat2, false);
                  }
                  if (_this.k[0] == chks_3 && _this.c)
                    _this.d = d_1;
                  else
                    d_1.push(et, true);
                }
              },
              terminate: function() {
                if (d_1 && d_1.terminate)
                  d_1.terminate();
              }
            };
            if (sc_1 >= 0)
              file_1.size = sc_1, file_1.originalSize = su_1;
            this_1.onfile(file_1);
          }
          return "break";
        } else if (oc) {
          if (sig == 134695760) {
            is = i += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
            return "break";
          } else if (sig == 33639248) {
            is = i -= 4, f = 3, this_1.c = 0;
            return "break";
          }
        }
      };
      var this_1 = this;
      for (; i < l - 4; ++i) {
        var state_1 = _loop_2();
        if (state_1 === "break")
          break;
      }
      this.p = et;
      if (oc < 0) {
        var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 134695760 && 4)) : buf.subarray(0, i);
        if (add)
          add.push(dat, !!f);
        else
          this.k[+(f == 2)].push(dat);
      }
      if (f & 2)
        return this.push(buf.subarray(i), final);
      this.p = buf.subarray(i);
    }
    if (final) {
      if (this.c)
        err(13);
      this.p = null;
    }
  };
  Unzip2.prototype.register = function(decoder6) {
    this.o[decoder6.compression] = decoder6;
  };
  return Unzip2;
})();

// src/results/archive.ts
var DEFAULT_MAX_COMPRESSED_BYTES = 64 * 1024 * 1024;
var DEFAULT_MAX_EXPANDED_BYTES = 512 * 1024 * 1024;
var INPUT_CHUNK_BYTES = 8 * 1024;
function limit2(value, fallback, name) {
  const resolved = value === void 0 ? fallback : value;
  if (!Number.isSafeInteger(resolved) || resolved <= 0) {
    throw new TypeError(`${name} must be a positive safe integer`);
  }
  return resolved;
}
function join2(chunks, length) {
  const result2 = new Uint8Array(length);
  let offset = 0;
  for (const chunk2 of chunks) {
    result2.set(chunk2, offset);
    offset += chunk2.length;
  }
  return result2;
}
function feed(content, push) {
  for (let offset = 0; offset < content.length; offset += INPUT_CHUNK_BYTES) {
    const end = Math.min(offset + INPUT_CHUNK_BYTES, content.length);
    push(content.subarray(offset, end), false);
  }
  push(new Uint8Array(), true);
}
function expandGzip(content, maximum) {
  const chunks = [];
  let length = 0;
  let complete = false;
  let lastMemberOffset = 0;
  const stream = new Gunzip((chunk2, final) => {
    if (chunk2.length > maximum - length) {
      throw new Error("result archive exceeds the expanded byte limit");
    }
    if (chunk2.length > 0) chunks.push(chunk2);
    length += chunk2.length;
    complete ||= final;
  });
  stream.onmember = (offset) => {
    lastMemberOffset = offset;
    complete = false;
  };
  feed(content, (chunk2, final) => stream.push(chunk2, final));
  if (content.length - lastMemberOffset < 18) {
    throw new Error("result GZIP archive is truncated");
  }
  if (!complete) throw new Error("result GZIP archive is truncated");
  return join2(chunks, length);
}
function expandZip(content, maximum) {
  const chunks = [];
  let length = 0;
  let selected = false;
  let complete = false;
  const stream = new Unzip((file) => {
    if (selected || file.name.endsWith("/")) return;
    selected = true;
    file.ondata = (error, chunk2, final) => {
      if (error !== null) throw error;
      if (chunk2.length > maximum - length) {
        throw new Error("result archive exceeds the expanded byte limit");
      }
      if (chunk2.length > 0) chunks.push(chunk2);
      length += chunk2.length;
      complete ||= final;
    };
    file.start();
  });
  stream.register(UnzipInflate);
  feed(content, (chunk2, final) => stream.push(chunk2, final));
  if (!selected) throw new Error("result ZIP archive is empty");
  if (!complete) throw new Error("result ZIP archive is truncated");
  return join2(chunks, length);
}
function checkArchiveOptions(options) {
  limit2(options.maxCompressedBytes, DEFAULT_MAX_COMPRESSED_BYTES, "maxCompressedBytes");
  limit2(options.maxExpandedBytes, DEFAULT_MAX_EXPANDED_BYTES, "maxExpandedBytes");
}
function decompressResultArchive(content, options = {}) {
  const compressed = limit2(
    options.maxCompressedBytes,
    DEFAULT_MAX_COMPRESSED_BYTES,
    "maxCompressedBytes"
  );
  const expanded = limit2(
    options.maxExpandedBytes,
    DEFAULT_MAX_EXPANDED_BYTES,
    "maxExpandedBytes"
  );
  if (content.length > compressed) {
    throw new Error("result archive exceeds the compressed byte limit");
  }
  if (content[0] === 80 && content[1] === 75) {
    return expandZip(content, expanded);
  }
  if (content[0] === 31 && content[1] === 139) {
    return expandGzip(content, expanded);
  }
  throw new Error("result content is not a ZIP or GZIP archive");
}

// src/results/surface-record.ts
var hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function ownValue(value, key) {
  return hasOwn(value, key) ? value[key] : void 0;
}
function emptyMap() {
  return /* @__PURE__ */ Object.create(null);
}
function setOwn(target, key, value) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}
function record2(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value;
}
function finite(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  return value;
}
function count(value, name) {
  const result2 = finite(value, name);
  if (!Number.isSafeInteger(result2) || result2 < 0 || result2 > 4294967295) {
    throw new TypeError(`${name} must be an unsigned 32-bit integer`);
  }
  return result2;
}
function vector(value, name) {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new TypeError(`${name} must be a finite three-component vector`);
  }
  value.forEach((component, index2) => finite(component, `${name}[${index2}]`));
}
function validateNullableNumbers(value, expected, name) {
  if (!Array.isArray(value) || value.length !== expected) {
    throw new TypeError(`${name} must contain exactly ${expected} cells`);
  }
  value.forEach((item, index2) => {
    if (item !== null) finite(item, `${name}[${index2}]`);
  });
}
function validateCellTriangles(value, expected, name) {
  if (value === void 0 || value === null) return;
  if (!Array.isArray(value) || value.length !== expected) {
    throw new TypeError(`${name} must contain exactly ${expected} cells`);
  }
  value.forEach((cell, cellIndex) => {
    if (cell === null) return;
    if (!Array.isArray(cell) || cell.length % 9 !== 0) {
      throw new TypeError(`${name}[${cellIndex}] must contain complete triangles`);
    }
    cell.forEach((item, index2) => finite(item, `${name}[${cellIndex}][${index2}]`));
  });
}
function validateEntry(entry, key, trustedBulk = false) {
  vector(ownValue(entry, "origin"), `surface ${key} origin`);
  vector(ownValue(entry, "u-axis"), `surface ${key} u-axis`);
  vector(ownValue(entry, "v-axis"), `surface ${key} v-axis`);
  const gridSize = finite(ownValue(entry, "grid-size"), `surface ${key} grid-size`);
  if (gridSize <= 0) throw new TypeError(`surface ${key} grid-size must be positive`);
  const nu = count(ownValue(entry, "nu"), `surface ${key} nu`);
  const nv = count(ownValue(entry, "nv"), `surface ${key} nv`);
  const expected = nu * nv;
  if (!Number.isSafeInteger(expected)) {
    throw new TypeError(`surface ${key} cell count is not representable`);
  }
  finite(ownValue(entry, "area"), `surface ${key} area`);
  finite(ownValue(entry, "mean"), `surface ${key} mean`);
  finite(ownValue(entry, "peak"), `surface ${key} peak`);
  const values = ownValue(entry, "values");
  if (trustedBulk) {
    if (!Array.isArray(values) || values.length !== expected) {
      throw new TypeError(`surface ${key} values must contain exactly ${expected} cells`);
    }
  } else if (values instanceof Float64Array) {
    if (values.length !== expected) {
      throw new TypeError(`surface ${key} values must contain exactly ${expected} cells`);
    }
    values.forEach((item, index2) => {
      if (!Number.isFinite(item) && !Number.isNaN(item)) {
        throw new TypeError(`surface ${key} values[${index2}] must be finite or masked`);
      }
    });
  } else {
    validateNullableNumbers(values, expected, `surface ${key} values`);
  }
  const cellArea = ownValue(entry, "cell-area");
  if (cellArea !== void 0 && cellArea !== null) {
    if (trustedBulk) {
      if (!Array.isArray(cellArea) || cellArea.length !== expected) {
        throw new TypeError(`surface ${key} cell-area must contain exactly ${expected} cells`);
      }
    } else validateNullableNumbers(cellArea, expected, `surface ${key} cell-area`);
  }
  const cellTriangles = ownValue(entry, "cell-tris");
  if (trustedBulk) {
    if (cellTriangles !== void 0 && cellTriangles !== null && (!Array.isArray(cellTriangles) || cellTriangles.length !== expected)) {
      throw new TypeError(`surface ${key} cell-tris must contain exactly ${expected} cells`);
    }
  } else validateCellTriangles(cellTriangles, expected, `surface ${key} cell-tris`);
  return entry;
}
function parseRecord(rawValue, options, trustedBulk) {
  const raw = record2(rawValue, "surface result");
  if (!trustedBulk) rejectRetiredResultFields(raw);
  const rawSurfaces = record2(ownValue(raw, "surfaces"), "surface result surfaces");
  const surfaces2 = emptyMap();
  for (const [key, value] of Object.entries(rawSurfaces)) {
    setOwn(surfaces2, key, validateEntry(record2(value, `surface ${key}`), key, trustedBulk));
  }
  const complete = Object.values(surfaces2).every(
    (entry) => entry["cell-tris"] !== void 0 && entry["cell-tris"] !== null
  );
  if (options.requireCellGeometry === true && !complete) {
    throw new Error(
      "surface cell geometry was omitted and no synthesis inputs were provided"
    );
  }
  return {
    route: "surface",
    value: { ...raw, surfaces: surfaces2 },
    cellGeometry: complete ? "complete" : "omitted"
  };
}
function parseSurfaceRecord(rawValue, options = {}) {
  return parseRecord(rawValue, options, false);
}
function parseValidatedIrBfSurfaceRecord(rawValue, options = {}) {
  return parseRecord(rawValue, options, true);
}

// src/results/router.ts
var IRBF_MAGIC = [73, 82, 66, 70, 13, 10, 26, 10];
var RESULT_DECODE_LIMITS = {
  maxTotalBytes: 268435456,
  maxMetadataBytes: 4194304,
  maxCells: 16777216,
  maxTriangleValues: 67108864
};
function parseJson3(document2) {
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document2));
}
function requireFiniteNumbers(value) {
  const pending2 = [value];
  while (pending2.length > 0) {
    const item = pending2.pop();
    if (typeof item === "number" && !Number.isFinite(item)) throw new Error("JSON result contains a non-finite number");
    if (Array.isArray(item)) for (const child of item) pending2.push(child);
    else if (item !== null && typeof item === "object") for (const child of Object.values(item)) pending2.push(child);
  }
}
function isSurfaceResult(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, "surfaces")) return false;
  const surfaces2 = value.surfaces;
  return surfaces2 !== null && typeof surfaces2 === "object" && !Array.isArray(surfaces2);
}
function jsonRoute(document2, options) {
  const decoded = requireCore().decodeGridDocument(document2, options.expectedGridKind);
  let route = "";
  let finiteNumbersValidated = false;
  try {
    route = decoded.route;
    finiteNumbersValidated = decoded.finiteNumbersValidated === true;
  } finally {
    decoded.free();
  }
  const value = parseJson3(document2);
  rejectRetiredResultFields(value);
  if (route === "json-grid" && !finiteNumbersValidated) requireFiniteNumbers(value);
  if (route !== "json-grid" && isSurfaceResult(value)) {
    return options.surface === void 0 ? parseSurfaceRecord(value) : parseSurfaceRecord(value, options.surface);
  }
  return { route: "json", value };
}
function parseResultDocument(document2, options = {}) {
  const irbf = document2.length >= IRBF_MAGIC.length && IRBF_MAGIC.every((value, index2) => document2[index2] === value);
  if (!irbf) return jsonRoute(document2, options);
  if (isDaylightFrame(document2)) return { route: "daylight-points", value: new DaylightFactorResult(document2) };
  const decoded = decodeBinaryResultDocument(document2, RESULT_DECODE_LIMITS);
  if (decoded.family === "surfaces") {
    return options.surface === void 0 ? parseValidatedIrBfSurfaceRecord(decoded.value) : parseValidatedIrBfSurfaceRecord(decoded.value, options.surface);
  }
  const kind = decoded.family === "categorical-grid" ? "categorical" : decoded.family === "numeric-grid" ? "numeric" : void 0;
  if (options.expectedGridKind !== void 0 && kind !== void 0 && options.expectedGridKind !== kind) {
    throw new TypeError(`result grid kind is ${kind}, expected ${options.expectedGridKind}`);
  }
  return { route: "json", value: decoded.value };
}
function parseResultArchive(content, options = {}) {
  return parseResultDocument(decompressResultArchive(content, options.archive), options);
}

// src/job-model.ts
var JobStatus = {
  Pending: "pending",
  Running: "running",
  Succeeded: "succeeded",
  Failed: "failed",
  Unknown: "unknown"
};
function requireJobId(jobId) {
  if (typeof jobId !== "string" || jobId.length === 0) throw new TypeError("jobId must be a non-empty string");
  return jobId;
}

// src/area/facade-captures.ts
var FacadeCaptures = class {
  kernel;
  asked = /* @__PURE__ */ new Set();
  // Accepted jobs whose capture was not kept (#835): the merge names them.
  lost = /* @__PURE__ */ new Set();
  // Maintainer note (not published): the kernel store, created on first use.
  get store() {
    return this.kernel ??= new (requireCore()).CaptureStore();
  }
  /** The number of jobs that hold a capture. */
  get jobCount() {
    return this.kernel?.jobCount ?? 0;
  }
  /** The bytes held: the distinct captures and the syntheses made from them. */
  get heldBytes() {
    return this.kernel?.heldBytes ?? 0;
  }
  /**
   * Keep the capture of an accepted job: its bytes, or a capture already held in this store.
   * `cellTris`: the run asked for the per-cell triangles.
   */
  // Maintainer note (not published): a hold is `Site.facadeCaptures`' (D-2026101110-iris-nectar-maple).
  remember(jobId, capture, cellTris) {
    try {
      if (capture instanceof Uint8Array) this.store.remember(jobId, capture);
      else capture.bind(jobId);
    } catch (error) {
      this.lost.add(jobId);
      throw error;
    }
    if (cellTris) this.asked.add(jobId);
  }
  /** Release a job's capture that no merge will use. */
  forget(jobId) {
    this.kernel?.forget(jobId);
    this.asked.delete(jobId);
    this.lost.delete(jobId);
  }
  /** Whether the capture of this accepted job was not kept (the store refused it). */
  lostCapture(jobId) {
    return this.lost.has(jobId);
  }
  /** Release every capture of a schedule you will not merge. */
  forgetSchedule(schedule2) {
    for (const job of schedule2.jobs.values()) {
      if (job.jobId !== void 0) this.forget(job.jobId);
    }
  }
  /** Whether any of these jobs asked for the per-cell triangles. */
  wantsCellTris(jobIds2) {
    return jobIds2.some((id) => id !== void 0 && this.asked.has(id));
  }
  /** Free the held captures. Call it when you are done with the client. */
  free() {
    this.kernel?.free();
    this.kernel = void 0;
    this.asked.clear();
    this.lost.clear();
  }
};

// src/jobs.ts
var BIG_PAYLOAD_THRESHOLD_BYTES = 5 * 1024 * 1024;
var JobsService = class {
  gateway;
  uploadGateway;
  fetch;
  pollIntervalMs;
  backoffCapMs;
  downloadTimeoutMs;
  requestTimeoutMs;
  bigPayloadThresholdBytes;
  geometryReuseEnabled;
  geometryReuseOptions;
  capabilities;
  /** What `getStatusBatch` learned of the batched route (1.0.0 behaviour); unset: not known. */
  batchedStatus;
  binaryPrepared = new BinaryRetention();
  geometryUrls;
  auth;
  binaryUrlReuse;
  /** Area runs send their binary jobs in batch submits when the API offers them (`JobsServiceOptions.batchSubmit`). */
  batchSubmit;
  /** Default `consoleLogger`, like every other service in this package. */
  logger;
  /**
   * This client's facade captures, in one capture store. They live only as long as the
   * client: nothing is written to disk and nothing is saved in an `AreaSchedule`. The client has
   * no `dispose`: call `captures.free()` when you are done with it.
   */
  // Maintainer note (not published): see area/facade-captures.ts. No disk,
  // no IndexedDB, no module-global map.
  captures = new FacadeCaptures();
  /**
   * @param options - Base URL, credentials and transport settings.
   * @throws {TypeError} when no `fetch` is available or `bigPayloadThresholdBytes` is invalid.
   */
  constructor(options) {
    const fetcher = resolveFetch(options.fetch);
    if (typeof fetcher !== "function") throw new TypeError("a fetch implementation is required");
    this.fetch = fetcher;
    this.pollIntervalMs = options.pollIntervalMs;
    if (this.pollIntervalMs !== void 0) {
      requireTimeout(this.pollIntervalMs);
      warnPollIntervalDeprecated(options.logger ?? consoleLogger);
    }
    const backoffCapSeconds = options.backoffCapSeconds;
    if (backoffCapSeconds !== void 0) requireTimeout(backoffCapSeconds * 1e3);
    this.backoffCapMs = backoffCapSeconds === void 0 ? void 0 : backoffCapSeconds * 1e3;
    this.downloadTimeoutMs = options.downloadTimeoutMs ?? 6e5;
    requireTimeout(this.downloadTimeoutMs);
    this.requestTimeoutMs = options.timeoutMs ?? 18e4;
    requireTimeout(this.requestTimeoutMs);
    this.bigPayloadThresholdBytes = options.bigPayloadThresholdBytes ?? BIG_PAYLOAD_THRESHOLD_BYTES;
    this.binaryUrlReuse = options.binaryUrlReuse !== false;
    this.batchSubmit = options.batchSubmit !== false;
    this.logger = options.logger ?? consoleLogger;
    const urlStore = geometryUrlStoreGate(options.geometryUrlStore, this.logger, this.requestTimeoutMs);
    this.geometryUrls = new BinaryUrlCache(this.binaryUrlReuse, Date.now, urlStore);
    this.auth = options.auth;
    if (!Number.isSafeInteger(this.bigPayloadThresholdBytes) || this.bigPayloadThresholdBytes < 0) {
      throw new TypeError("bigPayloadThresholdBytes must be a non-negative safe integer");
    }
    this.gateway = new GatewayTransport(options);
    this.capabilities = new CapabilityCache(this.gateway);
    this.geometryReuseEnabled = options.geometryReuseEnabled ?? true;
    this.geometryReuseOptions = buildGeometryReuseOptions(
      options,
      this.fetch,
      this.bigPayloadThresholdBytes,
      this.requestTimeoutMs,
      urlStore
    );
    this.uploadGateway = new GatewayTransport({
      ...options,
      baseUrl: options.gatewayBaseUrl ?? options.baseUrl
    });
  }
  /** Unpacks a downloaded result archive and returns the parsed result. */
  decompress(content, options) {
    return parseResultArchive(content, options);
  }
  /**
   * Prepares and sends one analysis request; returns the accepted `Job`
   * without waiting for it. The request is sent as binary unless
   * `options.transport` is `"json"` or the analysis has no binary route.
   */
  // Maintainer note (not published): binary-by-default routing is D196.
  async submit(analysisType2, payload, options = {}) {
    const prepared = this.prepareSubmission(analysisType2, payload, options);
    return this.submitPrepared(prepared, options.signal === void 0 ? {} : { signal: options.signal });
  }
  /** Validates and encodes a request without sending it; returns the `PreparedSubmission`. */
  prepareSubmission(analysisType2, payload, options = {}) {
    const transport3 = options.transport ?? defaultTransport(analysisType2);
    if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
      throw new TypeError("unsupported option binaryResults; use transport instead");
    }
    return {
      analysisType: analysisType2,
      transport: transport3,
      body: prepareSubmissionBody(analysisType2, payload, options)
    };
  }
  /** Sends a `PreparedSubmission` and returns the accepted `Job`; the options are used by area runs. */
  async submitPrepared(prepared, options = {}) {
    if (prepared.transport === "binary" && prepared.interiorBinary !== void 0) {
      const binary = prepared.interiorBinary;
      return submitPreparedBinary({
        ...this.binaryOptions(prepared, options, async () => binary, () => void 0),
        resultFormat: prepared.interiorResultFormat ?? "json"
      });
    }
    if (prepared.transport === "binary") return submitPreparedBinary(await this.outdoorBinary(prepared, options));
    if (this.geometryReuseEnabled) {
      const reused = await tryGeometryReuse(
        prepared,
        this.geometryReuseOptions,
        options.signal,
        options.beforeDispatch,
        options.idempotencyKey
      );
      if (reused !== void 0) return reused;
    }
    const json = preparedJsonBytes(prepared);
    const archive = await zipPayload(json);
    return submitArchive({
      endpointPath: `/async/${encodeURIComponent(prepared.analysisType)}`,
      archive,
      gateway: this.gateway,
      uploadGateway: this.uploadGateway,
      fetch: this.fetch,
      thresholdBytes: this.bigPayloadThresholdBytes,
      timeoutMs: this.requestTimeoutMs,
      parseAccepted: jobFromResponse,
      ...options.idempotencyKey === void 0 ? {} : { idempotencyKey: options.idempotencyKey },
      ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  }
  /** The options of one binary submission of this client. */
  binaryOptions(prepared, options, prepare2, releasePrepared) {
    return {
      prepared,
      parseJob: jobFromResponse,
      prepare: prepare2,
      releasePrepared,
      gateway: this.gateway,
      uploadGateway: this.uploadGateway,
      auth: this.auth,
      fetch: this.fetch,
      timeoutMs: this.requestTimeoutMs,
      urlCache: this.geometryUrls,
      reuseEnabled: this.binaryUrlReuse,
      ...options.idempotencyKey === void 0 ? {} : { idempotencyKey: options.idempotencyKey },
      ...options.signal === void 0 ? {} : { signal: options.signal },
      ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
      ...options.stages === void 0 ? {} : { stages: options.stages }
    };
  }
  /** An outdoor binary submission: the encode and the URL reuse of this client. */
  async outdoorBinary(prepared, options) {
    const supported = await this.capabilities.get(options.signal);
    const prepare2 = async (fresh) => (fresh ? void 0 : this.binaryPrepared.get(prepared)) ?? prepareBinary(prepared, supported);
    return this.binaryOptions(prepared, options, prepare2, () => this.binaryPrepared.release(prepared));
  }
  /** @internal Batch submit: one outdoor binary request, uploaded, not POSTed; else `undefined`. */
  async prepareBatchItem(prepared, options = {}) {
    if (prepared.transport !== "binary" || prepared.interiorBinary !== void 0) return void 0;
    return prepareBinaryEnvelope(await this.outdoorBinary(prepared, options));
  }
  /** @internal ONE POST of a batch body the run engine wrote; an HTTP error is returned. */
  postBatch(body, options = {}) {
    return dispatchKeyed({
      gateway: this.gateway,
      endpointPath: "/binary/v1/async-batch",
      body: new TextEncoder().encode(body),
      headers: { "Content-Type": "application/json" },
      ...options
    });
  }
  /**
   * Finishes all validation and encoding of a binary submission before any
   * paid request is sent. The encoded bytes are kept (within a memory budget)
   * and `submitPrepared` sends exactly those bytes. If you pre-check a whole
   * plan and then do not submit part of it, call `releasePreflight` for the
   * rest.
   */
  // Maintainer note (not published): the retained bytes live under this
  // client's byte budget (internal/binary-retention.ts); a submit frees the
  // artifact as soon as its upload has used it; area/submission.ts calls
  // `releasePreflight` for what it does not submit.
  async preflightPrepared(prepared, options = {}) {
    if (prepared.transport !== "binary" || this.binaryPrepared.get(prepared) !== void 0) return;
    const supported = await this.capabilities.get(options.signal);
    const binary = await withBinaryAdmission(() => prepareBinary(prepared, supported), options.signal);
    if (options.retain !== false) this.binaryPrepared.keep(prepared, binary);
  }
  /** Frees what `preflightPrepared` is holding for a submission that will not happen. */
  releasePreflight(prepared) {
    this.binaryPrepared.release(prepared);
  }
  /**
   * The API's live capability document, which says whether a model's binary
   * route is available. It is cached for a short time, so repeated calls are
   * cheap.
   */
  // Maintainer note (not published): `/binary/v1/capabilities`, cached for
  // `CAPABILITY_TTL_MS` (internal/capability-cache.ts). Read by the
  // daylight-factor parts auto-routing (D228), among others, instead of
  // guessing from a submission outcome.
  async binaryCapability(signal) {
    return this.capabilities.get(signal);
  }
  async getStatusWithSignal(jobId, signal) {
    const id = requireJobId(jobId);
    const response = await this.gateway.requestJson(
      `/async/jobs/${encodeURIComponent(id)}`,
      signal === void 0 ? {} : { signal }
    );
    const job = jobFromResponse(response);
    if (job.jobId !== id) throw new JobResponseMismatchError();
    return job;
  }
  /** Reads one job's status. */
  async getStatus(jobId, options = {}) {
    return this.getStatusWithSignal(jobId, options.signal);
  }
  /**
   * Whether the API's route for reading many job statuses at once has answered this client.
   * `false` until it has, and for good once the API shows it lacks the route.
   */
  get batchedStatusSupported() {
    return this.batchedStatus === true;
  }
  /**
   * Reads many job statuses at once, 50 ids per request. Ids it could not
   * settle come back in `unanswered` for you to ask about one by one; it does
   * not throw because of an API problem. An API without the route is asked
   * once and never again.
   */
  async getStatusBatch(jobIds2, options = {}) {
    const ids = jobIds2.map(requireJobId);
    if (this.batchedStatus === false) {
      return { statuses: /* @__PURE__ */ new Map(), unanswered: [...ids], batched: false, lacking: true };
    }
    const sweep = await fetchStatusBatch(this.gateway, ids, options);
    if (sweep.lacking) this.batchedStatus = false;
    else if (sweep.batched) this.batchedStatus = true;
    return sweep;
  }
  /**
   * Waits for a job to succeed or fail: one `GET /async/jobs/{id}` 1 s after
   * the call, then every 1 s until 10 s, then every 2 s. After HTTP 429, a 5xx
   * or a network error it backs off (at most 30 s, never shorter than
   * `Retry-After`). `options.timeout` is in seconds (default 900).
   *
   * @returns The finished `Job`.
   * @throws {JobFailedError} when the job fails.
   * @throws {JobTimeoutError} when the timeout passes first.
   * @throws {JobAbortedError} when `options.signal` aborts the wait.
   * @throws {JobPollError} when a status request is refused for good (for example 401 or 404).
   */
  // Maintainer note (not published): the kernel `JobWait` (internal/wait-job.ts).
  async waitForCompletion(jobId, options = {}) {
    return waitForJob(requireJobId(jobId), options, {
      // One job: `GET /async/jobs/{id}`. A batch of one saves nothing, and a
      // gateway without the batched route answers `?ids=` with the whole
      // account listing (~70 KB, ~0.9 s).
      status: (id, signal) => this.getStatusWithSignal(id, signal),
      intervalUs: this.pollIntervalMs === void 0 ? void 0 : Math.round(this.pollIntervalMs * 1e3),
      intervalCapUs: this.backoffCapMs === void 0 ? void 0 : Math.round(this.backoffCapMs * 1e3)
    });
  }
  async resultsUrl(jobId, signal) {
    const response = await this.gateway.requestBytesWithHeaders(
      `/async/jobs/${encodeURIComponent(jobId)}/results`,
      signal === void 0 ? {} : { signal }
    );
    return parseResultsLink(response.headers.get("Link"));
  }
  download(url, signal) {
    return downloadPresigned(url, {
      fetch: this.fetch,
      timeoutMs: this.downloadTimeoutMs,
      ...signal === void 0 ? {} : { signal }
    });
  }
  /**
   * Downloads the result archive of a finished job, retrying a failed
   * download a few times (each try with a fresh link). Pass `options.job` to
   * skip reading the status.
   *
   * @throws {JobNotCompletedError} when the job has not succeeded.
   * @throws {TypeError} when `options.job` is a different job.
   */
  async downloadResults(jobId, options = {}) {
    const id = await this.downloadable(jobId, options);
    return downloadWithRetries(id, (signal) => this.downloadOnce(id, signal), options.signal);
  }
  /** @internal One try of `downloadResults`: the run engine retries an area run's downloads. */
  async downloadResultsOnce(jobId, options = {}) {
    const id = await this.downloadable(jobId, options);
    return this.downloadOnce(id, options.signal);
  }
  async downloadable(jobId, options) {
    const id = requireJobId(jobId);
    if (options.job !== void 0 && options.job.jobId !== id) {
      throw new TypeError("supplied job ID does not match requested jobId");
    }
    const job = options.job ?? await this.getStatusWithSignal(id, options.signal);
    if (job.status !== JobStatus.Succeeded) throw new JobNotCompletedError(id, job.status);
    return id;
  }
  async downloadOnce(id, signal) {
    const presignedUrl = await this.resultsUrl(id, signal);
    const downloaded = await this.download(presignedUrl, signal);
    return { ...downloaded, jobId: id, presignedUrl };
  }
};

// src/area/run-io.ts
function postFacts(error, sent) {
  if (error instanceof SubmissionStoppedError) return { phase: "before_send" };
  if (error instanceof TransportError && (error.method === "PUT" || !sent && error.reason === "aborted")) {
    return { phase: "before_send" };
  }
  if (!sent) return rawAnswer(error);
  try {
    return rawAnswer(error);
  } catch {
    return { phase: "unknown" };
  }
}
function status(job) {
  return job.status === JobStatus.Succeeded ? "completed" : job.status === JobStatus.Failed ? "failed" : job.status === JobStatus.Running ? "running" : "pending";
}
function rememberAccepted(io, an, capture, jobId, tileId) {
  try {
    an.remember?.(capture, jobId);
  } catch (error) {
    try {
      (io.logger ?? consoleLogger).warn({
        event: "facade_capture_not_kept",
        tileId,
        jobId,
        reason: error instanceof Error ? error.message : String(error)
      });
    } catch {
    }
  }
}
function recordAccepted(io, a, key, job, capture) {
  const an = io.analyses[a];
  const entry = an.entries.get(key);
  an.jobs.set(key, {
    tileId: entry.key,
    row: entry.row,
    col: entry.col,
    jobId: job.jobId,
    status: status(job),
    lastJobSnapshot: job,
    ...job.binary === void 0 ? {} : { binary: job.binary }
  });
  io.byJob.set(job.jobId, { a, key });
  try {
    io.onAccepted?.(job.jobId, key);
  } catch {
  }
  rememberAccepted(io, an, capture, job.jobId, entry.key);
}
async function post3(io, act, signal) {
  const an = io.analyses[act.a];
  const entry = an.entries.get(act.key);
  const reply = { kind: "post_answer", a: act.a, key: act.key };
  let sent = false;
  let capture;
  try {
    capture = await an.capture?.(entry);
    const job = await io.service.submitPrepared(
      entry.prepared,
      { signal, idempotencyKey: act.idempotency_key, beforeDispatch: () => {
        if (io.stopped?.() === true) throw new SubmissionStoppedError();
        sent = true;
      } }
    );
    recordAccepted(io, act.a, act.key, job, capture);
    return { ...reply, answer: { status: 202 }, job_id: job.jobId };
  } catch (error) {
    if (error instanceof GeometryReferenceSubmissionError) {
      const accepted = error.acceptedJobIds[0];
      an.jobs.set(act.key, {
        tileId: entry.key,
        row: entry.row,
        col: entry.col,
        status: "failed",
        invalidReference: true,
        error: error.message,
        ...accepted === void 0 ? {} : { jobId: accepted }
      });
      io.onInvalidReference?.();
      throw error;
    }
    return failedPost(act, error, sent);
  } finally {
    free(capture);
  }
}
function free(capture) {
  if (capture !== void 0 && !(capture instanceof Uint8Array)) capture.free();
}
function failedPost(act, error, sent) {
  return {
    kind: "post_answer",
    a: act.a,
    key: act.key,
    answer: postFacts(error, sent),
    ...us(error.retryAfterS),
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  };
}
var preparedCaptures = /* @__PURE__ */ new WeakMap();
async function prepare(io, act, signal) {
  const an = io.analyses[act.a];
  const entry = an.entries.get(act.key);
  let request;
  try {
    request = await io.service.prepareBatchItem?.(entry.prepared, { signal });
  } catch (error) {
    return failedPost(act, error, false);
  }
  if (request === void 0) return post3(io, { ...act, kind: "post" }, signal);
  let captures = preparedCaptures.get(an);
  if (captures === void 0) preparedCaptures.set(an, captures = /* @__PURE__ */ new Map());
  const capture = await an.capture?.(entry);
  free(captures.get(act.key));
  captures.set(act.key, capture);
  return {
    kind: "prepared",
    a: act.a,
    key: act.key,
    model: entry.prepared.analysisType,
    request: new TextDecoder().decode(request)
  };
}
async function postBatch(io, act, signal) {
  let sent = false;
  try {
    const response = await io.service.postBatch(act.body, { signal, beforeDispatch: () => {
      if (io.stopped?.() === true) throw new SubmissionStoppedError();
      sent = true;
    } });
    const ok = response.status >= 200 && response.status < 300;
    const after = Number(response.headers.get("Retry-After") ?? Number.NaN);
    return {
      kind: "batch_answer",
      batch: act.batch,
      answer: { status: response.status },
      ...ok ? { body: new TextDecoder().decode(response.content) } : {},
      ...us(after)
    };
  } catch (error) {
    return {
      kind: "batch_answer",
      batch: act.batch,
      answer: postFacts(error, sent),
      ...us(error.retryAfterS),
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    };
  }
}
function acceptedAction(io, act) {
  const an = io.analyses[act.a];
  const captures = preparedCaptures.get(an);
  const capture = captures?.get(act.key);
  captures?.delete(act.key);
  let job;
  try {
    job = jobFromResponse(act.body);
  } catch {
    job = { jobId: act.job_id, status: JobStatus.Pending };
  }
  recordAccepted(io, act.a, act.key, job, capture);
  free(capture);
}
function freePreparedCaptures(io) {
  for (const an of io.analyses) {
    for (const capture of preparedCaptures.get(an)?.values() ?? []) free(capture);
    preparedCaptures.delete(an);
  }
}
async function poll(io, act, signal) {
  const statuses = /* @__PURE__ */ new Map();
  try {
    if (act.batched) {
      const sweep = await io.service.getStatusBatch?.(act.job_ids, { signal });
      if (sweep === void 0 || sweep.lacking) {
        return { kind: "sweep", answer: { status: 404 }, job_ids: act.job_ids, status: [] };
      }
      if (sweep.refusedStatus !== void 0) {
        return { kind: "sweep", answer: { status: sweep.refusedStatus }, job_ids: act.job_ids, status: [] };
      }
      if (sweep.failedIds !== void 0 || !sweep.batched) {
        return { kind: "sweep", answer: "after_send", ...us(sweep.retryAfterS), job_ids: act.job_ids, status: [] };
      }
      for (const [job, value] of sweep.statuses) statuses.set(job, value);
    } else {
      statuses.set(act.job_ids[0], await io.service.getStatus(act.job_ids[0], { signal }));
    }
  } catch (error) {
    return {
      kind: "sweep",
      answer: rawAnswer(error),
      ...us(error.retryAfterS),
      job_ids: act.job_ids,
      status: []
    };
  }
  const jobIds2 = [];
  const texts = [];
  const errors = {};
  for (const [id, job] of statuses) {
    if (job.status === JobStatus.Failed && job.error) errors[id] = job.error;
    const where = io.byJob.get(id);
    const record3 = where === void 0 ? void 0 : io.analyses[where.a].jobs.get(where.key);
    if (record3 !== void 0) {
      record3.lastJobSnapshot = job;
      record3.status = status(job);
      if (job.error !== void 0) record3.error = job.error;
    }
    jobIds2.push(id);
    texts.push(job.status);
  }
  return {
    kind: "sweep",
    answer: { status: 200 },
    job_ids: jobIds2,
    status: texts,
    ...Object.keys(errors).length === 0 ? {} : { errors }
  };
}
async function download(io, act, signal) {
  const an = io.analyses[act.a];
  const key = io.byJob.get(act.job).key;
  const job = an.jobs.get(key);
  let archive;
  try {
    const once = io.service.downloadResultsOnce?.bind(io.service) ?? io.service.downloadResults.bind(io.service);
    archive = (await once(
      act.job,
      { signal, ...job.lastJobSnapshot === void 0 ? {} : { job: job.lastJobSnapshot } }
    )).content;
  } catch (error) {
    return {
      kind: "download_failed",
      job: act.job,
      answer: rawAnswer(error),
      ...us(error.retryAfterS)
    };
  }
  if (signal.aborted) throw signal.reason;
  const refused = an.grid !== void 0 ? await an.grid.push(job, archive) : an.surface !== void 0 ? await an.surface.push(act.job, key, archive) : void an.archives?.set(act.job, archive);
  if (refused !== void 0) return { kind: "download_failed", job: act.job, answer: "unreadable_2xx" };
  return { kind: "download_done", job: act.job };
}
function runAction(io, act, signal) {
  if (act.kind === "post") return post3(io, act, signal);
  if (act.kind === "prepare") return prepare(io, act, signal);
  if (act.kind === "post_batch") return postBatch(io, act, signal);
  if (act.kind === "poll") return poll(io, act, signal);
  return download(io, act, signal);
}
async function batchConfig(service, binary, signal) {
  if (!binary || service.batchSubmit !== true || service.binaryCapability === void 0 || service.postBatch === void 0) return {};
  try {
    const batch = (await service.binaryCapability(signal)).batchSubmit;
    return batch === void 0 ? {} : { batch_submit: batch };
  } catch {
    return {};
  }
}

// src/area/engine-jobs.ts
function recordsFromFacts(an, facts) {
  const state = { succeeded: "completed", failed: "failed" };
  for (const [key, jobId] of Object.entries(facts.jobs)) {
    const job = an.jobs.get(key);
    const last = facts.job_state[jobId];
    if (job !== void 0 && job.jobId === jobId && last !== void 0 && last !== "running") job.status = state[last];
    if (job !== void 0 && job.jobId === jobId && last === "failed" && facts.errors?.[key] !== void 0) {
      job.error = facts.errors[key];
    }
  }
  for (const key of [...facts.failed, ...facts.uncertain]) {
    if (an.jobs.get(key)?.invalidReference === true) continue;
    const entry = an.entries.get(key);
    an.jobs.set(key, {
      tileId: key,
      row: entry.row,
      col: entry.col,
      status: facts.failed.includes(key) ? "failed" : "skipped",
      error: facts.failed.includes(key) ? facts.errors?.[key] ?? "job submission failed" : "submission outcome is unknown; do not resubmit automatically"
    });
  }
  applyFailures(an.jobs, facts);
}
function applyFailures(jobs, facts) {
  for (const [key, failure2] of Object.entries(facts.failures ?? {})) {
    const job = jobs.get(key);
    if (job === void 0) continue;
    job.failureKind = failure2.kind;
    if (failure2.status === void 0) delete job.failureStatus;
    else job.failureStatus = failure2.status;
  }
}
async function submitOnEngine(service, entries3, options) {
  const jobs = /* @__PURE__ */ new Map();
  for (const [key, job] of options.priorJobs ?? []) jobs.set(key, { ...job });
  const an = {
    entries: new Map(entries3.map((e) => [e.key, e])),
    jobs,
    ...options.capture === void 0 ? {} : { capture: options.capture },
    ...options.remember === void 0 ? {} : { remember: options.remember }
  };
  const sent = new Set(entries3.map((e) => e.key));
  const attempts = Object.fromEntries(Object.entries(options.attempts ?? {}).filter(([k]) => sent.has(k)));
  const signal = options.signal ?? new AbortController().signal;
  const binary = entries3.some((e) => e.prepared.transport === "binary");
  const driver = new EngineDriver({
    retries: 0,
    area_timeout_us: 36e8,
    goal: "sent",
    ...await batchConfig(service, binary, signal)
  });
  let invalid2 = false;
  const io = {
    service,
    analyses: [an],
    byJob: /* @__PURE__ */ new Map(),
    ...options.onAccepted === void 0 ? {} : { onAccepted: options.onAccepted },
    ...options.logger === void 0 ? {} : { logger: options.logger },
    // No new POST after an invalid geometry-reference acceptance; the POSTs in flight keep their jobs.
    onInvalidReference: () => {
      invalid2 = true;
      driver.stop();
    },
    stopped: () => invalid2
  };
  driver.onAccepted = (act) => acceptedAction(io, act);
  const [facts] = await driver.run(
    [{ keys: [...sent], run_id: options.runId, attempts }],
    signal,
    (act, own2) => runAction(io, act, own2),
    () => {
    }
  ).finally(() => freePreparedCaptures(io));
  recordsFromFacts(an, facts);
  const invalidKeys = [...jobs.values()].filter((j) => j.invalidReference === true && sent.has(j.tileId)).map((j) => j.tileId);
  const uncertain = new Set((options.priorUncertain ?? []).filter((k) => !sent.has(k)));
  for (const key of facts.uncertain) if (!invalidKeys.includes(key)) uncertain.add(key);
  return {
    jobs,
    failedSubmissions: facts.failed.filter((k) => !invalidKeys.includes(k)),
    uncertainSubmissions: [...uncertain],
    invalidReferenceSubmissions: [...options.priorInvalidReference ?? [], ...invalid2 ? invalidKeys : []],
    submissionAbortStatus: facts.payment_stopped ? 402 : null,
    runId: facts.run_id,
    attempts: { ...options.attempts, ...facts.attempts }
  };
}
async function collectOnEngine(service, jobs, sink, options) {
  const known = {};
  const withJob = {};
  const byJob = /* @__PURE__ */ new Map();
  for (const [key, job] of jobs) {
    if (!job.jobId || job.invalidReference === true) continue;
    withJob[key] = job.jobId;
    byJob.set(job.jobId, { a: 0, key });
    const status2 = options.known?.[job.jobId] ?? job.status;
    if (status2 === "completed") known[job.jobId] = "succeeded";
    else if (status2 === "failed") known[job.jobId] = "failed";
  }
  const an = {
    entries: /* @__PURE__ */ new Map(),
    jobs,
    ...sink.grid === void 0 ? {} : { grid: sink.grid },
    ...sink.surface === void 0 ? {} : { surface: sink.surface },
    ...sink.archives === void 0 ? {} : { archives: sink.archives }
  };
  const io = { service, analyses: [an], byJob };
  const signal = options.signal ?? new AbortController().signal;
  const driver = new EngineDriver({
    retries: 0,
    area_timeout_us: Math.round((options.timeoutS ?? 3600) * 1e6),
    goal: options.goal
  });
  let outcome = "incomplete";
  const [facts] = await driver.run(
    [{ keys: Object.keys(withJob), run_id: "", jobs: withJob, states: known }],
    signal,
    (act, own2) => runAction(io, act, own2),
    (act) => {
      outcome = act.outcome;
    },
    options.onProgress
  );
  if (options.signal?.aborted) throw options.signal.reason ?? new DOMException("aborted", "AbortError");
  applyFailures(jobs, facts);
  return { facts, outcome };
}

// src/area/schedule-retry-fields.ts
function freezeRetryFields(schedule2) {
  const attempts = schedule2.attempts === void 0 ? void 0 : Object.freeze({ ...schedule2.attempts });
  return {
    ...attempts === void 0 ? {} : { attempts },
    ...schedule2.runId === void 0 ? {} : { runId: schedule2.runId }
  };
}
function retryFieldsToJSON(schedule2) {
  return {
    ...schedule2.runId === void 0 ? {} : { runId: schedule2.runId },
    ...schedule2.attempts === void 0 ? {} : { attempts: { ...schedule2.attempts } }
  };
}
function object3(value, name, invalid2) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) invalid2(`${name} must be an object`);
  return value;
}
function positiveIntegers(value, name, invalid2) {
  if (value === void 0) return void 0;
  const raw = object3(value, name, invalid2);
  const entries3 = [];
  for (const [key, item] of Object.entries(raw)) {
    if (!Number.isSafeInteger(item) || item < 1) invalid2(`${name}.${key} must be a positive integer`);
    entries3.push([key, item]);
  }
  return Object.fromEntries(entries3);
}
function parseRetryFields(raw, invalid2) {
  if (raw.runId !== void 0 && (typeof raw.runId !== "string" || raw.runId.length === 0)) {
    invalid2("runId must be a non-empty string");
  }
  const attempts = positiveIntegers(raw.attempts, "attempts", invalid2);
  return {
    ...raw.runId === void 0 ? {} : { runId: raw.runId },
    ...attempts === void 0 ? {} : { attempts }
  };
}

// src/area/schedule.ts
var STATUSES = /* @__PURE__ */ new Set([
  "pending",
  "running",
  "completed",
  "failed",
  "skipped"
]);
function frozenMap(source) {
  const map = new Map(source);
  let proxy;
  proxy = new Proxy(map, {
    get(target, property) {
      if (property === "set" || property === "delete" || property === "clear") {
        return () => {
          throw new TypeError("AreaSchedule.jobs is frozen");
        };
      }
      if (property === "forEach") {
        return (callback, thisArg) => target.forEach((value2, key) => callback.call(thisArg, value2, key, proxy));
      }
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    set() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    },
    deleteProperty() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    },
    defineProperty() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    }
  });
  return proxy;
}
function freezeAreaSchedule(schedule2) {
  const membership = schedule2.batchMembership === void 0 ? void 0 : Object.freeze(
    Object.fromEntries(Object.entries(schedule2.batchMembership).map(([key, ids]) => [key, Object.freeze([...ids])]))
  );
  const counts = schedule2.batchSensorCounts === void 0 ? void 0 : Object.freeze({ ...schedule2.batchSensorCounts });
  const polygon = Object.freeze({
    ...schedule2.polygon,
    coordinates: Object.freeze(schedule2.polygon.coordinates.map((ring) => Object.freeze(ring.map((position) => Object.freeze([...position])))))
  });
  const tilePositions = Object.freeze(schedule2.tilePositions.map((position) => Object.freeze({ ...position })));
  return Object.freeze({
    ...schedule2,
    jobs: frozenMap(schedule2.jobs),
    polygon,
    tilePositions,
    gridShape: Object.freeze([...schedule2.gridShape]),
    failedSubmissions: Object.freeze([...schedule2.failedSubmissions]),
    ...freezeRetryFields(schedule2),
    ...schedule2.uncertainSubmissions === void 0 ? {} : {
      uncertainSubmissions: Object.freeze([...schedule2.uncertainSubmissions])
    },
    ...schedule2.invalidReferenceSubmissions === void 0 ? {} : {
      invalidReferenceSubmissions: Object.freeze([...schedule2.invalidReferenceSubmissions])
    },
    ...schedule2.geometryProbeJobIds === void 0 ? {} : {
      geometryProbeJobIds: Object.freeze([...schedule2.geometryProbeJobIds])
    },
    ...schedule2.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {},
    ...membership === void 0 ? {} : { batchMembership: membership },
    ...counts === void 0 ? {} : { batchSensorCounts: counts },
    ...schedule2.webhookEvents === void 0 ? {} : {
      webhookEvents: Object.freeze([...schedule2.webhookEvents])
    }
  });
}
function jsonJob(job) {
  const copy = {
    tileId: job.tileId,
    row: job.row,
    col: job.col,
    status: job.status,
    ...job.jobId === void 0 ? {} : { jobId: job.jobId },
    ...job.error === void 0 ? {} : { error: job.error },
    ...job.failureKind === void 0 ? {} : { failureKind: job.failureKind },
    ...job.failureStatus === void 0 ? {} : { failureStatus: job.failureStatus },
    ...job.invalidReference === true ? { invalidReference: true } : {},
    ...job.binary === void 0 ? {} : { binary: { ...job.binary } }
  };
  return copy;
}
function areaScheduleToJSON(schedule2) {
  return {
    jobs: [...schedule2.jobs].map(([key, job]) => [key, jsonJob(job)]),
    polygon: schedule2.polygon,
    configHash: schedule2.configHash,
    ...schedule2.siteIdentity === void 0 ? {} : { siteIdentity: schedule2.siteIdentity },
    tilePositions: schedule2.tilePositions.map((position) => ({ ...position })),
    gridShape: [...schedule2.gridShape],
    analysisType: schedule2.analysisType,
    transport: schedule2.transport ?? "json",
    ...schedule2.wireVersion === void 0 ? {} : { wireVersion: schedule2.wireVersion },
    failedSubmissions: [...schedule2.failedSubmissions],
    ...schedule2.uncertainSubmissions === void 0 ? {} : { uncertainSubmissions: [...schedule2.uncertainSubmissions] },
    ...schedule2.invalidReferenceSubmissions === void 0 ? {} : {
      invalidReferenceSubmissions: [...schedule2.invalidReferenceSubmissions]
    },
    ...schedule2.geometryProbeJobIds === void 0 ? {} : {
      geometryProbeJobIds: [...schedule2.geometryProbeJobIds]
    },
    ...schedule2.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {},
    submissionAbortStatus: schedule2.submissionAbortStatus,
    surfaceFields: schedule2.surfaceFields ?? false,
    ...schedule2.terrainContextMarginM === void 0 ? {} : { terrainContextMarginM: schedule2.terrainContextMarginM },
    ...schedule2.maxSensorsPerJob === void 0 ? {} : { maxSensorsPerJob: schedule2.maxSensorsPerJob },
    ...schedule2.weatherIdentity === void 0 ? {} : { weatherIdentity: schedule2.weatherIdentity },
    ...schedule2.scheduleContractVersion === void 0 ? {} : { scheduleContractVersion: schedule2.scheduleContractVersion },
    ...schedule2.batchingPolicyVersion === void 0 ? {} : { batchingPolicyVersion: schedule2.batchingPolicyVersion },
    ...schedule2.batchMembership === void 0 ? {} : { batchMembership: structuredClone(schedule2.batchMembership) },
    ...schedule2.batchSensorCounts === void 0 ? {} : { batchSensorCounts: { ...schedule2.batchSensorCounts } },
    ...schedule2.webhookUrl === void 0 ? {} : { webhookUrl: schedule2.webhookUrl },
    ...schedule2.webhookEvents === void 0 ? {} : { webhookEvents: [...schedule2.webhookEvents] },
    ...retryFieldsToJSON(schedule2)
  };
}
function invalid(message) {
  throw new TypeError(`invalid area schedule: ${message}`);
}
function object4(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) invalid(`${name} must be an object`);
  return value;
}
function string(value, name) {
  if (typeof value !== "string" || value.length === 0) invalid(`${name} must be a non-empty string`);
  return value;
}
function index(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) invalid(`${name} must be a non-negative integer`);
  return value;
}
function parseJob(key, value) {
  const raw = object4(value, `job ${key}`);
  if (raw.result !== void 0 || raw.lastJobSnapshot !== void 0) invalid(`job ${key} contains non-durable state`);
  const tileId = string(raw.tileId, `job ${key}.tileId`);
  if (tileId !== key) invalid(`job key ${key} does not match tileId ${tileId}`);
  if (typeof raw.status !== "string" || !STATUSES.has(raw.status)) invalid(`job ${key} has invalid status`);
  if (raw.jobId !== void 0 && (typeof raw.jobId !== "string" || raw.jobId.length === 0)) invalid(`job ${key} has invalid jobId`);
  if (raw.error !== void 0 && typeof raw.error !== "string") invalid(`job ${key} has invalid error`);
  if (raw.failureKind !== void 0 && typeof raw.failureKind !== "string") invalid(`job ${key} has invalid failureKind`);
  if (raw.failureStatus !== void 0 && !Number.isSafeInteger(raw.failureStatus)) {
    invalid(`job ${key} has invalid failureStatus`);
  }
  if (raw.invalidReference !== void 0 && raw.invalidReference !== true) {
    invalid(`job ${key} has invalid invalidReference marker`);
  }
  const binary = parseBinary(raw.binary, key);
  return {
    tileId,
    row: index(raw.row, `job ${key}.row`),
    col: index(raw.col, `job ${key}.col`),
    status: raw.status,
    ...raw.jobId === void 0 ? {} : { jobId: raw.jobId },
    ...raw.error === void 0 ? {} : { error: raw.error },
    ...raw.failureKind === void 0 ? {} : { failureKind: raw.failureKind },
    ...raw.failureStatus === void 0 ? {} : { failureStatus: raw.failureStatus },
    ...raw.invalidReference === true ? { invalidReference: true } : {},
    ...binary === void 0 ? {} : { binary }
  };
}
function uniqueReferences(items, name) {
  const unique2 = new Set(items);
  if (unique2.size !== items.length) invalid(`${name} must not contain duplicates`);
  return unique2;
}
function validateSubmissionReferences(jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions) {
  const failed = uniqueReferences(failedSubmissions, "failedSubmissions");
  const uncertain = uniqueReferences(uncertainSubmissions, "uncertainSubmissions");
  const invalidReferences = uniqueReferences(
    invalidReferenceSubmissions,
    "invalidReferenceSubmissions"
  );
  for (const tileId of failed) {
    const job = jobs.get(tileId);
    if (!job) invalid(`failed submission ${tileId} has no job`);
    if (job.status !== "failed" || job.jobId !== void 0) {
      invalid(`failed submission ${tileId} must be a failed job without a jobId`);
    }
    if (uncertain.has(tileId)) invalid(`submission ${tileId} is both failed and uncertain`);
  }
  for (const tileId of uncertain) {
    const job = jobs.get(tileId);
    if (!job) invalid(`uncertain submission ${tileId} has no job`);
    if (job.jobId === void 0 && job.status !== "skipped") {
      invalid(`uncertain submission ${tileId} without a jobId must be skipped`);
    }
  }
  for (const tileId of invalidReferences) {
    const job = jobs.get(tileId);
    if (!job || job.status !== "failed" || job.invalidReference !== true) {
      invalid(`invalid reference submission ${tileId} must remain a failed invalid-reference job`);
    }
    if (failed.has(tileId) || uncertain.has(tileId)) {
      invalid(`invalid reference submission ${tileId} is in another submission outcome list`);
    }
  }
  for (const [tileId, job] of jobs) {
    if (job.invalidReference === true && !invalidReferences.has(tileId)) {
      invalid(`invalid-reference job ${tileId} is absent from invalidReferenceSubmissions`);
    }
  }
}
function areaScheduleFromJSON(value) {
  const raw = object4(value, "root");
  if (!Array.isArray(raw.jobs)) invalid("jobs must be an array");
  const jobs = /* @__PURE__ */ new Map();
  for (const entry of raw.jobs) {
    if (!Array.isArray(entry) || entry.length !== 2) invalid("job entry must be a pair");
    const key = string(entry[0], "job key");
    if (jobs.has(key)) invalid(`duplicate job ${key}`);
    jobs.set(key, parseJob(key, entry[1]));
  }
  const polygon = object4(raw.polygon, "polygon");
  if (polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) invalid("polygon must be GeoJSON Polygon");
  if (!Array.isArray(raw.gridShape) || raw.gridShape.length !== 2) invalid("gridShape must contain two indexes");
  if (!Array.isArray(raw.tilePositions) || !Array.isArray(raw.failedSubmissions)) invalid("schedule arrays are missing");
  const tilePositions = raw.tilePositions.map((item, at) => {
    const position = object4(item, `tilePositions[${at}]`);
    return { row: index(position.row, "tile row"), col: index(position.col, "tile col"), tileId: string(position.tileId, "tileId") };
  });
  const failedSubmissions = raw.failedSubmissions.map((item) => string(item, "failed submission"));
  if (raw.uncertainSubmissions !== void 0 && !Array.isArray(raw.uncertainSubmissions)) invalid("uncertainSubmissions must be an array");
  const uncertainSubmissions = raw.uncertainSubmissions?.map((item) => string(item, "uncertain submission"));
  if (raw.invalidReferenceSubmissions !== void 0 && !Array.isArray(raw.invalidReferenceSubmissions)) {
    invalid("invalidReferenceSubmissions must be an array");
  }
  const invalidReferenceSubmissions = raw.invalidReferenceSubmissions?.map((item) => string(item, "invalid reference submission"));
  if (raw.geometryProbeJobIds !== void 0 && !Array.isArray(raw.geometryProbeJobIds)) {
    invalid("geometryProbeJobIds must be an array");
  }
  const geometryProbeJobIds = raw.geometryProbeJobIds?.map((item) => string(item, "geometry probe job ID"));
  if (geometryProbeJobIds !== void 0) uniqueReferences(geometryProbeJobIds, "geometryProbeJobIds");
  if (raw.geometryProbeUncertain !== void 0 && raw.geometryProbeUncertain !== true) {
    invalid("geometryProbeUncertain must be true when present");
  }
  if ((geometryProbeJobIds?.length ?? 0) > 0 && raw.geometryProbeUncertain !== true) {
    invalid("geometry probe job IDs require an uncertain-probe marker");
  }
  validateSubmissionReferences(
    jobs,
    failedSubmissions,
    uncertainSubmissions ?? [],
    invalidReferenceSubmissions ?? []
  );
  const abort = raw.submissionAbortStatus ?? null;
  if (abort !== null && !Number.isSafeInteger(abort)) invalid("submissionAbortStatus must be an integer or null");
  if (raw.surfaceFields !== void 0 && typeof raw.surfaceFields !== "boolean") invalid("surfaceFields must be Boolean");
  if (raw.terrainContextMarginM !== void 0 && (typeof raw.terrainContextMarginM !== "number" || !Number.isFinite(raw.terrainContextMarginM) || raw.terrainContextMarginM < 0)) {
    invalid("terrainContextMarginM must be a finite non-negative number");
  }
  if (raw.maxSensorsPerJob !== void 0 && (!Number.isSafeInteger(raw.maxSensorsPerJob) || raw.maxSensorsPerJob < 1)) {
    invalid("maxSensorsPerJob must be a positive integer");
  }
  if (raw.batchingPolicyVersion !== void 0 && raw.batchingPolicyVersion !== 2) {
    invalid("batchingPolicyVersion must be 2");
  }
  if (raw.weatherIdentity !== void 0 && (typeof raw.weatherIdentity !== "string" || !raw.weatherIdentity.startsWith("sha256:"))) {
    invalid("weatherIdentity must be a sha256: digest");
  }
  if (raw.siteIdentity !== void 0 && (typeof raw.siteIdentity !== "string" || !/^(site2|sha256):[0-9a-f]{64}$/.test(raw.siteIdentity))) {
    invalid("siteIdentity must be a site2: (or, before D297, sha256:) digest");
  }
  if (raw.scheduleContractVersion !== void 0 && (!Number.isSafeInteger(raw.scheduleContractVersion) || raw.scheduleContractVersion < 1)) {
    invalid("scheduleContractVersion must be a positive integer");
  }
  const membership = optionalStringArrays(raw.batchMembership, "batchMembership");
  const counts = optionalPositiveIntegers(raw.batchSensorCounts, "batchSensorCounts");
  if (membership === void 0 !== (counts === void 0)) invalid("exact batch records must be present together");
  if (raw.batchingPolicyVersion === 2 !== (membership !== void 0)) {
    invalid("exact batch policy and records must be present together");
  }
  if (raw.webhookEvents !== void 0 && !Array.isArray(raw.webhookEvents)) invalid("webhookEvents must be an array");
  if (raw.webhookUrl !== void 0 && (typeof raw.webhookUrl !== "string" || raw.webhookUrl.length === 0)) {
    invalid("webhookUrl must be a non-empty string");
  }
  const retryFields = parseRetryFields(raw, invalid);
  const schedule2 = {
    jobs,
    polygon,
    configHash: string(raw.configHash, "configHash"),
    tilePositions,
    ...raw.siteIdentity === void 0 ? {} : { siteIdentity: raw.siteIdentity },
    gridShape: [index(raw.gridShape[0], "grid rows"), index(raw.gridShape[1], "grid cols")],
    analysisType: string(raw.analysisType, "analysisType"),
    failedSubmissions,
    transport: raw.transport === void 0 ? "json" : transport2(raw.transport),
    ...raw.wireVersion === void 0 ? {} : { wireVersion: wireVersion(raw.wireVersion) },
    ...uncertainSubmissions === void 0 ? {} : { uncertainSubmissions },
    ...invalidReferenceSubmissions === void 0 ? {} : { invalidReferenceSubmissions },
    ...geometryProbeJobIds === void 0 ? {} : { geometryProbeJobIds },
    ...raw.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {},
    submissionAbortStatus: abort,
    surfaceFields: raw.surfaceFields === true,
    ...raw.terrainContextMarginM === void 0 ? {} : { terrainContextMarginM: raw.terrainContextMarginM },
    ...raw.maxSensorsPerJob === void 0 ? {} : { maxSensorsPerJob: raw.maxSensorsPerJob },
    ...raw.weatherIdentity === void 0 ? {} : { weatherIdentity: raw.weatherIdentity },
    ...raw.scheduleContractVersion === void 0 ? {} : { scheduleContractVersion: raw.scheduleContractVersion },
    ...raw.batchingPolicyVersion === void 0 ? {} : { batchingPolicyVersion: 2 },
    ...membership === void 0 ? {} : { batchMembership: membership, batchSensorCounts: counts },
    ...raw.webhookUrl === void 0 ? {} : { webhookUrl: raw.webhookUrl },
    ...Array.isArray(raw.webhookEvents) ? { webhookEvents: raw.webhookEvents.map((item) => string(item, "webhook event")) } : {},
    ...retryFields
  };
  if (schedule2.transport === "binary" && schedule2.wireVersion !== 1) {
    invalid("binary transport requires wireVersion 1");
  }
  if (schedule2.transport === "json" && schedule2.wireVersion !== void 0) {
    invalid("JSON transport must not contain wireVersion");
  }
  for (const [key, job] of schedule2.jobs) {
    if (schedule2.transport === "json" && job.binary !== void 0) {
      invalid(`JSON job ${key} contains a binary acknowledgement`);
    }
  }
  return freezeAreaSchedule(schedule2);
}
function parseBinary(value, key) {
  if (value === void 0) return void 0;
  const raw = object4(value, `job ${key}.binary`);
  if (raw.inputFormat !== "irbf" || raw.resultFormat !== "irbf" || raw.wireVersion !== 1) {
    invalid(`job ${key} has an incompatible binary acknowledgement`);
  }
  return {
    inputFormat: "irbf",
    resultFormat: "irbf",
    wireVersion: 1,
    artifactDigest: string(raw.artifactDigest, `job ${key} artifactDigest`),
    contentDigest: string(raw.contentDigest, `job ${key} contentDigest`)
  };
}
function transport2(value) {
  if (value !== "json" && value !== "binary") invalid("transport must be json or binary");
  return value;
}
function wireVersion(value) {
  if (value !== 1) invalid("wireVersion must be 1");
  return 1;
}
function optionalStringArrays(value, name) {
  if (value === void 0) return void 0;
  const raw = object4(value, name);
  const entries3 = [];
  for (const [key, items] of Object.entries(raw)) {
    if (!Array.isArray(items)) invalid(`${name}.${key} must be an array`);
    entries3.push([key, items.map((item) => string(item, `${name}.${key}`))]);
  }
  return Object.fromEntries(entries3);
}
function optionalPositiveIntegers(value, name) {
  if (value === void 0) return void 0;
  const raw = object4(value, name);
  const entries3 = [];
  for (const [key, item] of Object.entries(raw)) {
    if (!Number.isSafeInteger(item) || item < 1) invalid(`${name}.${key} must be positive`);
    entries3.push([key, item]);
  }
  return Object.fromEntries(entries3);
}
function computeAreaState(schedule2) {
  let completedCount = 0, failedCount = 0, skippedCount = 0, pendingCount = 0, runningCount = 0;
  for (const job of schedule2.jobs.values()) {
    if (job.status === "completed") completedCount += 1;
    else if (job.status === "failed") failedCount += 1;
    else if (job.status === "skipped") skippedCount += 1;
    else if (job.status === "pending") pendingCount += 1;
    else runningCount += 1;
  }
  return {
    totalCount: schedule2.jobs.size,
    completedCount,
    failedCount,
    skippedCount,
    pendingCount,
    runningCount,
    isComplete: pendingCount === 0 && runningCount === 0
  };
}

// src/area/poll.ts
async function checkAreaState(service, schedule2, options = {}) {
  await collectOnEngine(service, schedule2.jobs, {}, {
    goal: "status",
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  for (const job of schedule2.jobs.values()) {
    if (job.status === "failed" && job.jobId) service.captures?.forget(job.jobId);
  }
  const state = computeAreaState(schedule2);
  try {
    options.onProgress?.(state);
  } catch {
  }
  return state;
}

// src/area/retry-context.ts
function scheduleKeyStates(schedule2) {
  const attempt = (key) => schedule2.attempts?.[key];
  const states = [];
  for (const job of schedule2.jobs.values()) {
    const jobStatus = job.jobId !== void 0 && (job.status === "completed" || job.status === "failed") ? job.status : void 0;
    states.push({ key: job.tileId, submit: "accepted", jobStatus, attempt: attempt(job.tileId) });
  }
  for (const key of schedule2.failedSubmissions) states.push({ key, submit: "failed", attempt: attempt(key) });
  for (const key of schedule2.uncertainSubmissions ?? []) {
    states.push({ key, submit: "uncertain", attempt: attempt(key) });
  }
  return states;
}
async function buildRetryContext(service, retryFrom, options = {}) {
  await checkAreaState(service, retryFrom, {
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  const plan = planAreaRetry({
    ...retryFrom.runId === void 0 ? { freshRunId: freshRunId() } : { runId: retryFrom.runId },
    keys: scheduleKeyStates(retryFrom)
  });
  return {
    runId: plan.runId,
    attempts: plan.attempts,
    resubmitKeys: new Set(plan.resubmit.map((entry) => entry.key)),
    idempotencyKeys: new Map(plan.resubmit.map((entry) => [entry.key, entry.idempotencyKey])),
    carryUncertain: plan.heldUncertain
  };
}

// src/area/weather-guard.ts
var SCHEDULE_CONTRACT_VERSION = 13;
var WEATHER_IDENTITY_CONTRACT_VERSION = 4;
var MIGRATION = "Start a fresh run, or re-run the finished tiles yourself. The SDK will not assign the current weather to jobs it cannot prove were run with it, and it will not start a billed run on your behalf. Build the retry payload from the SAME weather \u2014 the same file, the same catalog window or the same arrays \u2014 and the resume is admitted.";
var WeatherIdentityError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "WeatherIdentityError";
  }
};
var WIRE_TO_COLUMN = Object.fromEntries(
  Object.entries(MODEL_INPUT_NAMES).map(([column, camel]) => [
    TOP_LEVEL_ALIASES.get(camel) ?? camel,
    column
  ])
);
var WINDOW_KEYS = [
  ["start-month", "start_month"],
  ["start-day", "start_day"],
  ["start-hour", "start_hour"],
  ["end-month", "end_month"],
  ["end-day", "end_day"],
  ["end-hour", "end_hour"]
];
function numbers(value) {
  if (!Array.isArray(value)) return void 0;
  const out = [];
  for (const item of value) {
    if (typeof item !== "number" || !Number.isFinite(item)) return void 0;
    out.push(item);
  }
  return out;
}
function preparedWeatherIdentity(payload) {
  const refuse = (detail) => {
    throw new WeatherIdentityError(
      `this payload's weather cannot be identified: ${detail}. The SDK does not submit a weather-bearing run it cannot describe, because a run with no identity cannot be resumed and cannot be shown to be the run a retry carries.`
    );
  };
  const latitude = payload.latitude;
  const longitude = payload.longitude;
  const period = payload["time-period"];
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    refuse("it carries no location");
  }
  if (period === null || typeof period !== "object") refuse("it carries no window");
  const source = period;
  const window = {};
  for (const [wire2, kernel] of WINDOW_KEYS) {
    const value = source[wire2];
    if (typeof value !== "number" || !Number.isInteger(value)) {
      refuse("its window is incomplete");
    }
    window[kernel] = value;
  }
  const columns = {};
  for (const [wire2, kernel] of Object.entries(WIRE_TO_COLUMN)) {
    if (!Object.hasOwn(payload, wire2)) continue;
    const values = numbers(payload[wire2]);
    if (values === void 0) refuse(`column ${wire2} holds a value that is not a number`);
    columns[kernel] = values;
  }
  if (Object.keys(columns).length === 0) refuse("it carries no weather column");
  return requireCore().weatherRunIdentity(
    JSON.stringify({ latitude, longitude, window, columns })
  );
}
function isWeatherBearing(analysisType2) {
  return WEATHER_BEARING_ANALYSES.has(analysisType2);
}
function checkResumeWeather(retryFrom, currentIdentity) {
  if (retryFrom === void 0 || !isWeatherBearing(retryFrom.analysisType)) return;
  const version = retryFrom.scheduleContractVersion;
  if (version === void 0 || version < WEATHER_IDENTITY_CONTRACT_VERSION) {
    throw new WeatherIdentityError(
      `retryFrom schedule predates the weather run identity (schedule contract version ${String(version)}, this SDK writes ${WEATHER_IDENTITY_CONTRACT_VERSION}). An earlier version records either no weather at all, or the identity of an EPW FILE, which is computed over a different preimage under a different version tag and can never equal this SDK's value \u2014 so comparing them would report a weather change that did not happen, and skipping the comparison could submit the failed tiles with one climate and carry the succeeded tiles forward with another, in one grid. ${MIGRATION}`
    );
  }
  const recorded = retryFrom.weatherIdentity;
  if (recorded === void 0) {
    throw new WeatherIdentityError(
      `retryFrom schedule has no weather identity: it describes a weather-bearing run whose weather this SDK cannot name, so it cannot show that your retry carries the same readings at the same location. ${MIGRATION}`
    );
  }
  if (currentIdentity === void 0) {
    throw new WeatherIdentityError(
      `this retry's weather cannot be identified, and the schedule it resumes carries an identity (${recorded.slice(0, 19)}...). The prepared payload reads no weather array, or carries no location or window. ${MIGRATION}`
    );
  }
  if (currentIdentity !== recorded) {
    throw new WeatherIdentityError(
      `retryFrom weather identity mismatch: the schedule was created with ${recorded.slice(0, 19)}..., this retry computes ${currentIdentity.slice(0, 19)}.... The window is unchanged, so configHash matches and every other guard passes \u2014 but the readings, or the latitude and longitude, differ, so the resubmitted tiles and the carried-forward ones would hold two different climates. ${MIGRATION}`
    );
  }
}

// src/area/planning.ts
async function planAreaSubmission(service, input, polygonInput, options = {}, memo2, facadeSites) {
  const slice = new Slice(options);
  slice.check();
  if (input.vegetationInstances != null || input["vegetation-instances"] != null) {
    throw new TypeError("vegetation-instances have no area tiling policy");
  }
  const payload = prepareAreaPayload(input);
  const grade = consumeGradeOption(payload);
  dropUnknownRequestKeys(payload, options.logger ?? consoleLogger);
  if (payload["vegetation-instances"] != null) {
    throw new TypeError("vegetation-instances have no area tiling policy");
  }
  const analysisType2 = payload["analysis-type"];
  const weatherIdentity = isWeatherBearing(analysisType2) ? preparedWeatherIdentity(payload) : void 0;
  const surfaceFields = payload["analysis-surfaces"] != null;
  if (payload["sensor-points"] !== void 0) {
    throw new TypeError("sensor-points are not supported for area analysis");
  }
  if (surfaceFields && options.retryFrom !== void 0 && options.retryFrom.batchingPolicyVersion !== 2) {
    throw new Error("legacy facade schedules can be polled and merged but cannot be retried safely");
  }
  if (surfaceFields) checkFacadeCountContract(options.retryFrom);
  if (surfaceFields) checkFacadeSensorCap(options);
  checkResumeWeather(options.retryFrom, weatherIdentity);
  if (options.retryFrom !== void 0) requireCurrentConfigHash(options.retryFrom);
  const polygon = validatePolygon(polygonInput);
  const grid = generateTilesForPolygon(polygon, {
    analysisType: analysisType2,
    ...options.maxTilesOverride === void 0 ? {} : { maxTilesOverride: options.maxTilesOverride }
  });
  const { tiles, byId } = indexed(grid);
  const config = getTilingConfig(analysisType2);
  const terrainContextMarginM = JSON.parse(
    requireCore().terrainMargin(analysisType2, options.terrainContextMarginM)
  ).effective_m;
  if (options.retryFrom?.terrainContextMarginM !== void 0 && options.retryFrom.terrainContextMarginM !== terrainContextMarginM) {
    throw new Error("retryFrom terrainContextMarginM mismatch");
  }
  validateRetryGrid(options.retryFrom, polygon, analysisType2, tiles, grid);
  if (options.terrainContext !== void 0) throw new TypeError("terrainContext is internal; use terrainContextMarginM");
  const inputs = {
    payload,
    options,
    polygon,
    config,
    terrainContextMarginM,
    grade
  };
  const texts = /* @__PURE__ */ new Map();
  const ground = terrainKey(payload["ground-geometry"], texts);
  const hashes = memo2 ?? siteKeyMemo();
  const siteKey = preparedSiteKey(inputs, texts, ground, hashes);
  const retryContext = options.retryFrom === void 0 ? void 0 : await buildRetryContext(service, options.retryFrom, options);
  const currentSiteIdentity = `${SITE_IDENTITY_PREFIX}${kernelConfigHash({ siteKey })}`;
  const siteIdentity = options.retryFrom === void 0 ? currentSiteIdentity : options.retryFrom.siteIdentity;
  const terrain = siteTerrain(payload["ground-geometry"], ground, texts);
  const site = await preparedSites().get(
    siteKey,
    () => buildPreparedSite(inputs, analysisType2, tiles, slice, texts, terrain),
    options.signal
  );
  texts.clear();
  slice.check();
  if (surfaceFields && facadeSites !== void 0) {
    const inputs2 = JSON.stringify([facadeRequest(
      payload,
      tiles,
      options.retryFrom,
      options.maxSensorsPerJob,
      options.packing
    ), payload["terrain-alignment"] ?? null]);
    facadeSites.set(site.answers, [...facadeSites.get(site.answers) ?? [], inputs2]);
  }
  const composed = surfaceFields || areaTransport(options, analysisType2) === "binary" ? void 0 : await composedTiles(site, slice, options.signal);
  const base = { ...payload };
  for (const key of GROUP_KEYS) delete base[key];
  const alignment = suppliedSceneAlignment(analysisType2, payload);
  const treeZ = requireCore().treeZWarning(
    site.answers.treesWithoutZ ?? 0,
    payload["terrain-alignment"] ?? alignment
  );
  if (treeZ !== void 0) (options.logger ?? consoleLogger).warn(treeZ);
  const gridHash = scheduleConfigHash(
    analysisType2,
    alignment === void 0 ? payload : { ...payload, "terrain-alignment": alignment },
    liveTerrain(terrain),
    void 0,
    hashes.groups
  );
  const configHash = gridHash;
  if (options.retryFrom !== void 0) {
    if (options.retryFrom.configHash !== configHash) {
      throw new Error("retryFrom schedule configHash mismatch");
    }
    checkPaidRetrySiteIdentity(
      options.retryFrom,
      currentSiteIdentity,
      (retryContext?.resubmitKeys.size ?? 0) > 0,
      options.logger
    );
  }
  const runId = retryContext?.runId ?? options.retryFrom?.runId ?? freshRunId();
  const attemptFor = (key) => retryContext?.attempts[key] ?? 1;
  const retry = retryContext === void 0 ? void 0 : retryContext.resubmitKeys;
  const tilePositions = options.retryFrom === void 0 ? tiles.map((tile) => ({ ...tile })) : options.retryFrom.tilePositions.map((position) => ({ ...position }));
  const built = await buildEntries(tiles, {
    service,
    options,
    analysisType: analysisType2,
    base,
    byId,
    site: site.answers,
    surfaceFields,
    retry,
    runId,
    attemptFor,
    ...composed === void 0 ? {} : { composed },
    ...surfaceFields ? { facadeRequest: facadeRequest(
      base,
      tiles,
      options.retryFrom,
      options.maxSensorsPerJob,
      options.packing
    ) } : {},
    reuseScope: (key) => [
      "area-v1",
      key,
      config.inferenceSizeM,
      config.contextSizeM,
      config.stepM,
      terrainContextMarginM,
      surfaceFields ? 2 : 0
    ].join(":")
  }, slice);
  tilePositions.push(...built.extraPositions);
  return {
    polygon,
    analysisType: analysisType2,
    configHash,
    ...siteIdentity === void 0 ? {} : { siteIdentity },
    gridShape: [grid.length, grid.reduce((width, line) => Math.max(width, line.length), 0)],
    tilePositions,
    entries: built.entries,
    surfaceFields,
    // Read off the CALLER input, not the payload: every path pins
    // `emit-cell-tris` false on the wire (the server arm is 12x the bytes and
    // is never requested), so asking for triangles is what selects LOCAL
    // synthesis in the merge. `docs/DEVIATIONS.md` D88.
    ...surfaceFields && (input.emitCellTris === true || input["emit-cell-tris"] === true) ? { localCellTris: true } : {},
    // The real planned job count (WP-6, `infrared-core#240` / `#209`): one
    // entry per tile on a grid run, but one per facade sub-batch on a
    // surface run -- `tilePositions.length` is NOT this (it also carries a
    // base entry for every empty-of-batches tile). `previewAreaBatches`
    // (`area/preview.ts`) reads this so a caller prices from the plan, not
    // from the tile count.
    plannedJobCount: built.entries.length,
    terrainContextMarginM,
    runId,
    ...retryContext === void 0 ? {} : { retryContext },
    ...weatherIdentity === void 0 ? {} : { weatherIdentity },
    ...surfaceFields ? {
      batchingPolicyVersion: 2,
      batchMembership: built.batchMembership,
      batchSensorCounts: built.batchSensorCounts
    } : {}
  };
}
async function composedTiles(site, slice, signal) {
  try {
    return await site.composed(slice);
  } catch (error) {
    if (signal?.aborted) throw error;
    return site.composed(slice);
  }
}
function validateRetryGrid(retry, polygon, analysisType2, tiles, grid) {
  if (retry === void 0) return;
  if (retry.analysisType !== analysisType2) throw new Error("retryFrom analysisType mismatch");
  if (JSON.stringify(retry.polygon) !== JSON.stringify(polygon)) throw new Error("retryFrom polygon mismatch");
  const shape = [grid.length, grid.reduce((width, line) => Math.max(width, line.length), 0)];
  if (retry.gridShape[0] !== shape[0] || retry.gridShape[1] !== shape[1]) throw new Error("retryFrom gridShape mismatch");
  const expected = new Map(tiles.map((tile) => [tile.tileId, `${tile.row}:${tile.col}`]));
  for (const position of retry.tilePositions) {
    if (position.tileId.includes("#batch")) continue;
    if (expected.get(position.tileId) !== `${position.row}:${position.col}`) {
      throw new Error("retryFrom tilePositions mismatch");
    }
    expected.delete(position.tileId);
  }
  if (expected.size !== 0) throw new Error("retryFrom tilePositions mismatch");
}
function requireCurrentConfigHash(retryFrom) {
  const version = retryFrom.scheduleContractVersion ?? 1;
  if (version >= CONFIG_HASH_V2_CONTRACT_VERSION) return;
  throw new ConfigHashPolicyError(
    `retryFrom schedule predates this SDK's configHash (schedule contract version ${String(version)}, this SDK writes ${CONFIG_HASH_V2_CONTRACT_VERSION}). configHash now takes its fields from the kernel field registry and hashes an unset field as the server default, so the hash of an older SDK can never equal the one of the same inputs and a mismatch would say nothing about your inputs. Start a fresh run with the same inputs: the tiles that already succeeded are unaffected on the server, and this SDK will not resume a schedule whose identity it cannot verify.`
  );
}
var ConfigHashPolicyError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigHashPolicyError";
  }
};

// src/mesh-clean.ts
function cleanMesh(coordinates, indices2) {
  const coords = coordinates instanceof Float64Array || coordinates instanceof Float32Array ? coordinates : Float32Array.from(coordinates);
  const tris = indices2 instanceof Uint32Array ? indices2 : checkedIndices(indices2);
  return requireCore().cleanMesh(coords, tris);
}
function checkedIndices(indices2) {
  const out = new Uint32Array(indices2.length);
  for (let i = 0; i < indices2.length; i++) {
    const value = indices2[i];
    if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new RangeError(
        `indices[${i}] = ${String(value)} is not a whole number in 0..2**32-1`
      );
    }
    out[i] = value;
  }
  return out;
}

// src/mesh-simplify.ts
function pack2(geometry) {
  const names = Object.keys(geometry);
  const only = names.length === 1 ? geometry[names[0]] : void 0;
  if (only !== void 0 && only.coordinates instanceof Float64Array && only.indices instanceof Uint32Array) {
    return {
      names,
      coordinates: only.coordinates,
      vertOffsets: Uint32Array.of(0, only.coordinates.length / 3),
      indices: only.indices,
      faceOffsets: Uint32Array.of(0, only.indices.length / 3)
    };
  }
  const vertOffsets = new Uint32Array(names.length + 1);
  const faceOffsets = new Uint32Array(names.length + 1);
  names.forEach((n, k) => {
    vertOffsets[k + 1] = vertOffsets[k] + geometry[n].coordinates.length / 3;
    faceOffsets[k + 1] = faceOffsets[k] + geometry[n].indices.length / 3;
  });
  const coordinates = new Float64Array(3 * vertOffsets[names.length]);
  const indices2 = new Uint32Array(3 * faceOffsets[names.length]);
  names.forEach((n, k) => {
    coordinates.set(geometry[n].coordinates, 3 * vertOffsets[k]);
    indices2.set(geometry[n].indices, 3 * faceOffsets[k]);
  });
  return { names, coordinates, vertOffsets, indices: indices2, faceOffsets };
}
function jsonAsArray(view) {
  return Object.defineProperty(view, "toJSON", {
    value() {
      return Array.from(this);
    }
  });
}
function result(p, out, errors, kept) {
  const geometry = {};
  const report2 = {};
  (kept === void 0 ? p.names.map((_, e) => e) : Array.from(kept)).forEach((e, k) => {
    const name = p.names[e];
    const [v0, v1, f0, f1] = [out.vertOffsets[k], out.vertOffsets[k + 1], out.faceOffsets[k], out.faceOffsets[k + 1]];
    geometry[name] = {
      coordinates: jsonAsArray(out.coordinates.subarray(3 * v0, 3 * v1)),
      indices: jsonAsArray(out.indices.subarray(3 * f0, 3 * f1))
    };
    report2[name] = {
      trianglesIn: p.faceOffsets[e + 1] - p.faceOffsets[e],
      trianglesOut: f1 - f0,
      verticesIn: p.vertOffsets[e + 1] - p.vertOffsets[e],
      verticesOut: v1 - v0,
      ...errors === void 0 ? {} : { errorM: errors[k] }
    };
  });
  return { geometry, report: report2 };
}
function weldMeshes(geometry, options = {}) {
  const p = pack2(geometry);
  const out = requireCore().weldMeshes(
    p.coordinates,
    p.vertOffsets,
    p.indices,
    p.faceOffsets,
    options.toleranceM
  );
  return result(p, out);
}
function simplifyMeshes(geometry, options = {}) {
  const p = pack2(geometry);
  const out = requireCore().simplifyMeshes(
    p.coordinates,
    p.vertOffsets,
    p.indices,
    p.faceOffsets,
    options.targetRatio,
    options.maxErrorM,
    options.lockBorder
  );
  return result(p, out, out.errorsM, out.kept);
}
function exportMeshes(geometry, format = "dotbim") {
  const p = pack2(geometry);
  return requireCore().exportMeshes(
    p.names,
    p.coordinates,
    p.vertOffsets,
    p.indices,
    p.faceOffsets,
    format,
    p.names.map((n) => geometry[n].type ?? "")
  );
}

// src/area/facade-layout-free.ts
var handleRegistry = new FinalizationRegistry((handle) => {
  handle.free();
});
var HandleGuard = class {
  constructor(owner, handle) {
    this.owner = owner;
    this.handle = handle;
    handleRegistry.register(owner, handle, owner);
  }
  freed = false;
  get isFreed() {
    return this.freed;
  }
  free() {
    if (this.freed) return;
    this.freed = true;
    handleRegistry.unregister(this.owner);
    this.handle.free();
  }
};

// src/area/facade-layout-schedule.ts
function tileOrigin(row, col, schedule2, siteOrigin) {
  const core2 = requireCore("tiling");
  const [lon, lat] = core2.tileFrameOrigin(row, col, schedule2.analysisType, siteOrigin.lon, siteOrigin.lat);
  return { lon, lat };
}
function jobsFromSchedule(schedule2) {
  const siteOrigin = kernelPolygonOrigin(schedule2.polygon);
  const jobs = [];
  for (const key of [...schedule2.jobs.keys()].sort()) {
    const job = schedule2.jobs.get(key);
    if (job.jobId === void 0) continue;
    const activeIds = schedule2.batchMembership?.[key];
    jobs.push({
      jobId: job.jobId,
      ...activeIds === void 0 ? {} : { activeIds },
      tileOrigin: tileOrigin(job.row, job.col, schedule2, siteOrigin)
    });
  }
  return { siteOrigin, jobs };
}
function jobSiteShifts(schedule2) {
  const core2 = requireCore("jobSiteShifts");
  const shifts = /* @__PURE__ */ new Map();
  for (const job of schedule2.jobs.values()) {
    if (job.jobId === void 0) continue;
    const [swX, swY] = core2.tileSwOffset(job.row, job.col, schedule2.analysisType);
    shifts.set(job.jobId, [swX, swY]);
  }
  return shifts;
}
function shiftJobToSiteFrame(job, shift) {
  if (shift === void 0) return job;
  const [swX, swY] = shift;
  return {
    ...job,
    points: shiftXY(job.points, swX, swY),
    ...job.cellTris === void 0 ? {} : { cellTris: shiftXY(job.cellTris, swX, swY) },
    frames: job.frames.map((frame) => ({
      ...frame,
      origin: [frame.origin[0] + swX, frame.origin[1] + swY, frame.origin[2]]
    }))
  };
}
function shiftXY(array, swX, swY) {
  const shifted = array.slice();
  for (let i = 0; i < shifted.length; i += 3) {
    shifted[i] = shifted[i] + swX;
    shifted[i + 1] = shifted[i + 1] + swY;
  }
  return shifted;
}

// src/area/facade-layout-request.ts
function meshToPlain(mesh) {
  return { coordinates: Array.from(mesh.coordinates), indices: Array.from(mesh.indices) };
}
function meshesToPlain(meshes) {
  const out = {};
  for (const [id, mesh] of Object.entries(meshes)) {
    out[id] = meshToPlain(mesh);
  }
  return out;
}
function buildRequest(input) {
  const request = {
    buildings: meshesToPlain(input.buildings),
    ground: input.ground === void 0 ? null : meshesToPlain(input.ground),
    terrainAlignment: input.terrainAlignment ?? null,
    mode: input.analysisSurfaces,
    gridSize: input.surfaceGridSize,
    // 0.1 is the server's own default for an absent `surface-offset` on a
    // live run (lambda-models `solar-models/src/surfgrid_parse.rs`,
    // `docs/DEVIATIONS.md` B4) -- an omitted `surfaceOffset` here must
    // rebuild the same layout a live run produced.
    offset: input.surfaceOffset ?? 0.1,
    maxSensors: input.maxSensorsPerJob ?? 262144,
    partialCells: input.partialCells ?? true,
    minCoverage: input.minCoverage ?? 0.05,
    meshCleaning: input.meshCleaning ?? "auto",
    ...input.emitCellTris === void 0 ? {} : { emitCellTris: input.emitCellTris },
    ...input.surfgridVersion === void 0 ? {} : { surfgridVersion: input.surfgridVersion },
    ...input.siteOrigin === void 0 ? {} : { siteOrigin: [input.siteOrigin.lon, input.siteOrigin.lat] },
    ...input.jobs === void 0 ? {} : {
      jobs: input.jobs.map((job) => ({
        jobId: job.jobId,
        activeIds: job.activeIds ?? null,
        ...job.tileOrigin === void 0 ? {} : { tileOrigin: [job.tileOrigin.lon, job.tileOrigin.lat] }
      }))
    }
  };
  return JSON.stringify(request);
}

// src/area/facade-layout-raw.ts
function asFloat64(values) {
  return values instanceof Float64Array ? values : Float64Array.from(values);
}
function asFloat32(values) {
  return values instanceof Float32Array ? values : Float32Array.from(values);
}
function asUint32(values) {
  return values instanceof Uint32Array ? values : Uint32Array.from(values);
}
function isStaleView(view, memory) {
  return view !== null && view.buffer !== memory.buffer;
}
function rawFieldsStale(fields, memory) {
  return fields.jobs.some(
    (job) => isStaleView(job.points, memory) || isStaleView(job.normals, memory) || isStaleView(job.cell_area, memory) || isStaleView(job.cell_tris, memory) || isStaleView(job.cell_tris_offsets, memory)
  );
}
function materializeJob(job) {
  return {
    ...job,
    points: job.points.slice(),
    normals: job.normals.slice(),
    cell_area: job.cell_area === null ? null : job.cell_area.slice(),
    cell_tris: job.cell_tris === null ? null : job.cell_tris.slice(),
    cell_tris_offsets: job.cell_tris_offsets === null ? null : job.cell_tris_offsets.slice()
  };
}
function materializeFields(fields) {
  return { ...fields, jobs: fields.jobs.map(materializeJob) };
}
function jobFromRaw(raw) {
  return {
    jobId: raw.job_id,
    hasTerrain: raw.has_terrain,
    sensorLayoutHash: raw.sensor_layout_hash,
    entityHashes: raw.entity_hashes,
    warnings: raw.warnings,
    culledBelowTerrain: raw.culled_below_terrain,
    points: asFloat64(raw.points),
    normals: asFloat64(raw.normals),
    ...raw.cell_area === null ? {} : { cellArea: asFloat32(raw.cell_area) },
    ...raw.cell_tris === null ? {} : { cellTris: asFloat32(raw.cell_tris) },
    ...raw.cell_tris_offsets === null ? {} : { cellTrisOffsets: asUint32(raw.cell_tris_offsets) },
    frames: raw.frames.map((f) => ({
      key: f.key,
      origin: [f.origin[0], f.origin[1], f.origin[2]],
      uAxis: [f.u_axis[0], f.u_axis[1], f.u_axis[2]],
      vAxis: [f.v_axis[0], f.v_axis[1], f.v_axis[2]],
      gridSize: f.grid_size,
      nu: f.nu,
      nv: f.nv,
      cells: f.cells
    }))
  };
}

// src/internal/cell-has-value.ts
function cellHasValue(dtype, data, valid, cell) {
  switch (dtype) {
    case "i16":
      return (valid[cell >> 3] >> (cell & 7) & 1) === 1;
    case "f16":
      return (data[cell] & 32767) <= 31744;
    default:
      return !Number.isNaN(data[cell]);
  }
}

// src/results/surface-columns.ts
function surfaceColumnsFromJoin(joined) {
  return {
    kind: "surface-columns",
    version: 2,
    surfaceCount: joined.surfaceCount,
    ids: joined.ids,
    idOffsets: joined.idOffsets,
    origin: joined.origin,
    uAxis: joined.uAxis,
    vAxis: joined.vAxis,
    gridSize: joined.gridSize,
    nu: joined.nu,
    nv: joined.nv,
    area: joined.area,
    mean: joined.mean,
    peak: joined.peak,
    cellOffsets: joined.cellOffsets,
    values: joined.values,
    valueDtype: joined.valuesDtype,
    valueDivisor: joined.valueDivisor,
    ...joined.valuesValid === void 0 ? {} : { valid: joined.valuesValid },
    cellAreaState: joined.cellAreaState,
    ...joined.outline === void 0 || joined.outlineOffsets === void 0 ? {} : { outline: joined.outline, outlineOffsets: joined.outlineOffsets },
    ...joined.cellArea === void 0 ? {} : { cellArea: joined.cellArea },
    ...joined.extraJson === void 0 ? {} : { extra: JSON.parse(joined.extraJson) },
    ...joined.triangles === void 0 ? {} : { triangles: joined.triangles },
    aggregates: JSON.parse(joined.aggregatesJson),
    minLegend: joined.minLegend,
    maxLegend: joined.maxLegend,
    sensorCount: joined.sensorCount,
    ...joined.fallbackReasons.length === 0 ? {} : { cellTrisFallback: [...joined.fallbackReasons] },
    ...joined.layoutKey === void 0 ? {} : { layoutKey: joined.layoutKey }
  };
}
function emptySurfaceColumns() {
  const none = new Float64Array(0);
  return {
    kind: "surface-columns",
    version: 2,
    surfaceCount: 0,
    ids: "",
    idOffsets: Uint32Array.of(0),
    origin: none,
    uAxis: none.slice(),
    vAxis: none.slice(),
    gridSize: none.slice(),
    nu: new Uint32Array(0),
    nv: new Uint32Array(0),
    area: none.slice(),
    mean: none.slice(),
    peak: none.slice(),
    cellOffsets: Uint32Array.of(0),
    values: new Float32Array(0),
    valueDtype: "f32",
    valueDivisor: 1,
    cellAreaState: new Uint8Array(0),
    aggregates: {},
    minLegend: 0,
    maxLegend: 0,
    sensorCount: 0
  };
}
function surfaceId(result2, row) {
  return result2.ids.slice(result2.idOffsets[row], result2.idOffsets[row + 1]);
}
var indices = /* @__PURE__ */ new WeakMap();
function surfaceIndex(result2) {
  let index2 = indices.get(result2);
  if (index2 === void 0) {
    const map = /* @__PURE__ */ new Map();
    for (let row = 0; row < result2.surfaceCount; row += 1) map.set(surfaceId(result2, row), row);
    indices.set(result2, map);
    index2 = map;
  }
  return index2;
}
function isVertical(result2, row) {
  const u = 3 * row;
  const normalZ = result2.uAxis[u] * result2.vAxis[u + 1] - result2.uAxis[u + 1] * result2.vAxis[u];
  return Math.abs(normalZ) <= 0.5;
}
function surfaceHasValue(result2, cell) {
  return cellHasValue(result2.valueDtype, result2.values, result2.valid, cell);
}
function surfaceValuesF32(result2, first = 0, last = result2.values.length) {
  const v = result2.values;
  return requireCore().surfaceValuesF32(
    new Uint8Array(v.buffer, v.byteOffset, v.byteLength),
    result2.valueDtype,
    result2.valueDivisor,
    result2.valid,
    first,
    last
  );
}
function vertexValues(result2, group) {
  const table = result2.triangles;
  if (table === void 0) throw new Error("This result has no cell triangles. Build it with emitCellTris: true.");
  const base = table.groupTriangles[group];
  const out = new Float32Array((table.groupTriangles[group + 1] - base) * 3);
  const first = result2.cellOffsets[table.groupSurfaces[group]];
  const last = result2.cellOffsets[table.groupSurfaces[group + 1]];
  const raw = result2.valueDtype === "f32" || result2.valueDtype === "f64";
  const physical = raw ? result2.values.subarray(first, last) : surfaceValuesF32(result2, first, last);
  for (let cell = first; cell < last; cell += 1) {
    const start = table.cellOffsets[cell], end = table.cellOffsets[cell + 1];
    if (end > start) out.fill(physical[cell - first], (start - base) * 3, (end - base) * 3);
  }
  return out;
}

// src/area/facade-layout-attach.ts
var AXIS_CLOSE_ENOUGH = 1e-4;
var ORIGIN_CLOSE_ENOUGH_M = 0.01;
function closeEnough(a, b) {
  return Math.abs(a - b) <= AXIS_CLOSE_ENOUGH * Math.max(1, Math.abs(a), Math.abs(b));
}
function attachValues(layout, columns, options) {
  if (layout.layoutKey !== options.expectedLayoutKey) {
    throw new Error(
      `facade layout mismatch: layoutKey '${layout.layoutKey}' does not match the expected '${options.expectedLayoutKey}' -- the geometry, synth params or kernel version this layout was built from differs from what the stored result was built from`
    );
  }
  const seenKeys = /* @__PURE__ */ new Set();
  for (const job of layout.jobs) {
    for (const frame of job.frames) {
      if (seenKeys.has(frame.key)) {
        throw new Error(
          `facade layout mismatch: duplicate frame key '${frame.key}' (job '${job.jobId}') -- attachValues requires frame keys unique across the whole layout`
        );
      }
      seenKeys.add(frame.key);
    }
  }
  const index2 = surfaceIndex(columns);
  for (const job of layout.jobs) {
    for (const frame of job.frames) {
      const row = index2.get(frame.key);
      if (row === void 0) {
        throw new Error(
          `facade layout mismatch: surface '${frame.key}' (job '${job.jobId}') is not in this result`
        );
      }
      if (!frameGeometryMatches(columns, row, frame)) {
        throw new Error(
          `facade layout mismatch: surface '${frame.key}' geometry differs from the layout`
        );
      }
      if (!cellLayoutMatches(columns, row, frame)) {
        throw new Error(
          `facade layout mismatch: surface '${frame.key}' cell layout (which cells have a sensor) differs from the layout`
        );
      }
    }
  }
  return columns;
}
function frameGeometryMatches(columns, row, frame) {
  const o = 3 * row;
  for (let k = 0; k < 3; k += 1) {
    if (Math.abs(columns.origin[o + k] - frame.origin[k]) > ORIGIN_CLOSE_ENOUGH_M) return false;
    if (!closeEnough(columns.uAxis[o + k], frame.uAxis[k])) return false;
    if (!closeEnough(columns.vAxis[o + k], frame.vAxis[k])) return false;
  }
  return columns.gridSize[row] === frame.gridSize && columns.nu[row] === frame.nu && columns.nv[row] === frame.nv;
}
function cellLayoutMatches(columns, row, frame) {
  const start = columns.cellOffsets[row];
  const end = columns.cellOffsets[row + 1];
  if (end - start !== frame.cells.length) return false;
  for (let k = 0; k < frame.cells.length; k += 1) {
    const livePresent = surfaceHasValue(columns, start + k);
    const layoutPresent = frame.cells[k] !== null;
    if (livePresent !== layoutPresent) return false;
  }
  return true;
}

// src/area/facade-layout.ts
var FacadeLayout = class _FacadeLayout {
  constructor(handle, fields, bytes, siteShiftByJobId) {
    this.handle = handle;
    this.fields = fields;
    this.siteShiftByJobId = siteShiftByJobId;
    this.bytes = bytes;
    this.guard = new HandleGuard(this, handle);
  }
  bytes;
  guard;
  /**
   * Release the memory this layout holds. Safe to call more than once. Every other member keeps
   * working after `free()`, except `toBytes()`: call it before `free()`, unless its result was
   * already cached by an earlier `toBytes()` call.
   *
   * `jobs` also keeps returning correct data after `free()`: its arrays are copied out of the
   * held memory once, at that moment. Arrays you already took from an earlier read of `jobs`
   * are independent and unaffected.
   */
  // Maintainer note (not published): releases the wasm handle (`docs/UPGRADING.md`, "Call
  // free() in long-running servers"); see the constructor's comments.
  // `jobs`' bulk arrays are zero-copy views onto the handle until this call
  // (perf/ts-facade-layout-views): `free()` snapshots (copies) every job's
  // `points`/`normals`/`cellArea`/`cellTris`/`cellTrisOffsets` into
  // independent arrays FIRST, then releases the handle -- so `jobs` keeps
  // returning correct data after `free()`, same as before this change, at
  // the cost of one copy made exactly once, here, instead of one made
  // eagerly at construction whether or not a caller ever reads `jobs`
  // again. A typed array a caller already extracted from an EARLIER `jobs`
  // read and is still holding is unaffected either way (it was already an
  // independent reference once returned -- only a live VIEW inside
  // `this.fields` needs this snapshot). The GC backstop
  // (`facade-layout-free.ts`) does NOT run this snapshot -- it frees the
  // handle directly, because nothing can still be reading `this.fields`
  // once this object itself is unreachable.
  free() {
    if (!this.guard.isFreed) this.fields = materializeFields(this.fields);
    this.guard.free();
  }
  /** Lets `using layout = synthesizeFacadeLayout(...)` call `free()` at the end of its scope. */
  // Maintainer note (not published): TS `esnext.disposable`, this package's own `lib` setting.
  [Symbol.dispose]() {
    this.free();
  }
  /**
   * Load a layout from the format `FacadeLayout.toBytes` produces.
   *
   * @param bytes - The bytes returned by `toBytes()`.
   * @param options - Pass `schedule`, the saved tiled run, when the bytes were exported from a
   * layout built from a `schedule`; the reloaded layout is then shifted into the site frame
   * exactly as the original was.
   * @returns The reloaded layout.
   */
  // Maintainer note (not published): `toBytes` round-trips the kernel's held TILE-frame layout
  // verbatim, so `options.schedule` applies the SAME per-job shift
  // `jobSiteShifts`/`shiftJobToSiteFrame` do (infrared-core#725 follow-up), or `attachValues`
  // refuses a reloaded tiled layout.
  static fromBytes(bytes, options) {
    const handle = requireCore("FacadeLayout.fromBytes").facadeLayoutFromBytes(bytes);
    const siteShiftByJobId = options?.schedule === void 0 ? void 0 : jobSiteShifts(options.schedule);
    return new _FacadeLayout(handle, handle.fields(), bytes, siteShiftByJobId);
  }
  /**
   * The compact export of this layout: no full-cell triangles, compressed. It never rebuilds
   * the layout, and is computed once and cached.
   *
   * @returns The bytes to store and reload with `FacadeLayout.fromBytes`.
   * @throws {Error} when the layout was already freed and its bytes were never cached.
   */
  // Maintainer note (not published): zlib-deflated; throws instead of touching the now-freed
  // wasm handle.
  toBytes() {
    if (this.bytes !== void 0) return this.bytes;
    if (this.guard.isFreed) {
      throw new Error(
        "FacadeLayout.toBytes(): this layout was already freed and its bytes were not cached -- call toBytes() before free() (or do not free a layout you still need to export)"
      );
    }
    this.bytes = this.handle.toBytes();
    return this.bytes;
  }
  /** Identifier of this layout. Store it with your results and check it on reload. */
  get layoutKey() {
    return this.fields.layoutKey;
  }
  /** The sensor-layout version this layout was built at. */
  get surfgridVersion() {
    return this.fields.surfgridVersion;
  }
  /** Version of the bundled geometry engine that built this layout. */
  get coreVersion() {
    return this.fields.coreVersion;
  }
  // Maintainer note (not published): used by `surfaceRenderBuffers`; the kernel reads the
  // outline of this held layout.
  _surfaceRenderBuffers(columns) {
    if (this.guard.isFreed) throw new Error("this FacadeLayout was freed; build or load it again");
    return this.handle.surfaceRenderBuffers(columns);
  }
  /** The sensor settings this layout was built with. */
  get synthParams() {
    return this.fields.synthParams;
  }
  /** The rebuilt layout of each job. */
  get jobs() {
    this.refreshFieldsIfStale();
    const built = this.fields.jobs.map(jobFromRaw);
    if (this.siteShiftByJobId === void 0) return built;
    return built.map((job) => shiftJobToSiteFrame(job, this.siteShiftByJobId.get(job.jobId)));
  }
  /**
   * Re-reads `handle.fields()` when THIS layout's cached views were
   * detached by a wasm memory grow that happened elsewhere (another
   * `synthesizeFacadeLayout`/`fromBytes` call, any other core call that
   * allocates) since they were captured -- `rawFieldsStale` compares each
   * view's `.buffer` against the core's current one
   * (perf/ts-facade-layout-views). A no-op once `free()` has already run:
   * `free()` replaces `this.fields` with real copies that never go stale.
   */
  refreshFieldsIfStale() {
    if (this.guard.isFreed) return;
    if (!rawFieldsStale(this.fields, requireCoreMemory())) return;
    this.fields = this.handle.fields();
  }
  /** @internal */
  static _fromHandle(handle, siteShiftByJobId) {
    return new _FacadeLayout(handle, handle.fields(), void 0, siteShiftByJobId);
  }
};
function resolveSchedule(input) {
  if (input.schedule === void 0) return input;
  if (input.siteOrigin !== void 0 || input.jobs !== void 0) {
    throw new Error(
      "synthesizeFacadeLayout: pass either `schedule` or explicit `siteOrigin`/`jobs`, not both"
    );
  }
  const { siteOrigin, jobs } = jobsFromSchedule(input.schedule);
  return { ...input, siteOrigin, jobs };
}
function synthesizeFacadeLayout(input) {
  const handle = requireCore("synthesizeFacadeLayout").synthesizeFacadeLayoutHandle(buildRequest(resolveSchedule(input)));
  const siteShiftByJobId = input.schedule === void 0 ? void 0 : jobSiteShifts(input.schedule);
  return FacadeLayout._fromHandle(handle, siteShiftByJobId);
}

// src/vegetation-mesh.ts
var VegetationMeshError = class extends Error {
  name = "VegetationMeshError";
};
function referencePoint(collection) {
  const point = collection["referencePoint"];
  const valid = Array.isArray(point) && point.length === 2 && point.every((value) => typeof value === "number" && Number.isFinite(value));
  if (!valid) {
    throw new VegetationMeshError(
      "featureCollection must carry referencePoint [lon, lat] (the metric frame origin)"
    );
  }
  return [point[0], point[1]];
}
function convertPointsToMeshesLocal(featureCollection, options = {}) {
  if (featureCollection === null || typeof featureCollection !== "object" || Array.isArray(featureCollection)) {
    throw new VegetationMeshError("featureCollection must be an object");
  }
  const [lon, lat] = referencePoint(featureCollection);
  const features2 = featureCollection["features"];
  if (!Array.isArray(features2)) {
    throw new VegetationMeshError("featureCollection.features must be an array");
  }
  const core2 = requireCore();
  const registry = options.registryJson ?? core2.vegetationRegistryDocument();
  let meshes;
  try {
    meshes = JSON.parse(
      core2.vegetationPointsToMeshes(JSON.stringify(features2), lon, lat, registry)
    );
  } catch (error) {
    throw new VegetationMeshError(
      `local geojson-to-mesh failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
  if (!Array.isArray(meshes)) {
    throw new VegetationMeshError(
      `local geojson-to-mesh returned ${typeof meshes}, expected an array`
    );
  }
  return meshes;
}
function vegetationRegistryDocument() {
  return requireCore().vegetationRegistryDocument();
}

// src/vegetation.ts
var VegetationService = class {
  request;
  /**
   * @param options - Transport settings: `fetch`, `timeoutMs` and `logger` are
   *   used for the public reads; `baseUrl` and `auth` are accepted but not used.
   */
  constructor(options) {
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs },
      // A retry of a public read reports through the client's logger.
      ...options.logger === void 0 ? {} : { logger: options.logger }
    };
  }
  /**
   * Reads the trees around one point.
   *
   * @param lat - Centre latitude in degrees.
   * @param lon - Centre longitude in degrees.
   * @param distance - Half-width of the square to read, in metres.
   * @returns A feature collection, or `null` when there are no trees there. Any
   *   read warnings are listed under `_warnings`.
   */
  async getGeoJson(lat, lon, distance) {
    const result2 = await acquireTrees(pointToBbox(lat, lon, distance), { ...this.request });
    if (result2.features.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: result2.features,
      ...result2.warnings.length === 0 ? {} : { _warnings: [...result2.warnings] }
    };
  }
  // Maintainer note (not published): one tile's trees as FeatureCollection JSON
  // text. The area path uses this rather than the object form: the per-tile
  // texts are spliced into the array the deduplicator takes, so no tile's
  // features are ever built as host objects (bulk-data rule 1).
  async tileJsonDirect(lat, lon, distance, options) {
    const { featuresJson } = await acquireTreesJson(pointToBbox(lat, lon, distance), options);
    return featureCollectionJson(featuresJson);
  }
  /**
   * Converts tree Point features to dotbim meshes, locally.
   *
   * `converter` accepts only `"local"`; any other value is an error rather than
   * a silent local run.
   *
   * @param featureCollection - A feature collection with `referencePoint: [lon, lat]`
   *   and `features` (GeoJSON Point features).
   * @param options - Optional `converter` and `registryJson`.
   * @returns One mesh per convertible tree.
   * @throws {VegetationMeshError} when `converter` is not `"local"`, the input is
   *   malformed, or the conversion fails.
   */
  // Maintainer note (not published): the local WASM kernel does the conversion.
  // A remote value is a typed error rather than a silent local run (D39).
  // Mirrors Python `VegetationServiceClient.convert_to_mesh(converter="local")`.
  toMeshes(featureCollection, options = {}) {
    const converter = options.converter ?? "local";
    if (converter !== "local") {
      throw new VegetationMeshError(
        `converter must be "local"; the TypeScript SDK has no remote convert route`
      );
    }
    return convertPointsToMeshesLocal(
      featureCollection,
      options.registryJson === void 0 ? {} : { registryJson: options.registryJson }
    );
  }
  /**
   * Reads the trees over a polygon area, tile by tile.
   *
   * Tiles are read concurrently, and trees found in more than one tile are
   * listed once. A tile whose read fails is skipped and listed in `failedTiles`.
   *
   * @param polygon - The area to read: a GeoJSON `Polygon` with one closed ring of
   *   `[longitude, latitude]` positions.
   * @param options - `maxWorkers` is the number of tiles read at once (default 10),
   *   `maxTilesOverride` raises the tile limit, `analysisType` sets the tile grid
   *   and read margin, and `signal` cancels the read.
   * @returns The trees with the read's margin and any failed tiles.
   * @throws {Error} when the read of every tile fails.
   * @throws {InvalidOptionError} when `options` carries the removed `acquisition` option.
   */
  async getArea(polygon, options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "trees are read from the public data hosts only; remove the option"
    );
    await ensureCore("vegetation.getArea");
    const started = performance.now();
    const analysisType2 = resolveReadAnalysisType(options.analysisType);
    const readDistanceM = groundReadDistanceM(analysisType2);
    const tiles = generateTilesForPolygon(polygon, {
      analysisType: analysisType2,
      ...options.maxTilesOverride === void 0 ? {} : { maxTilesOverride: options.maxTilesOverride }
    });
    const active3 = tiles.flat().filter((tile) => !tile.empty);
    const failedTiles = [];
    const workers = options.maxWorkers ?? 10;
    const request = {
      ...this.request,
      ...options.signal === void 0 ? {} : { signal: options.signal }
    };
    const direct = { ...request, transport: httpRangeTransport(request) };
    const stopIfAborted = () => {
      if (options.signal?.aborted === true) {
        throw options.signal.reason ?? new DOMException("aborted", "AbortError");
      }
    };
    const tilesJson = jsonArrayOf(
      await mapLimit(active3, workers, async (tile) => {
        stopIfAborted();
        try {
          return await this.tileJsonDirect(
            tile.centroid.latitude,
            tile.centroid.longitude,
            readDistanceM,
            direct
          );
        } catch {
          stopIfAborted();
          failedTiles.push(tile.tileId);
          return void 0;
        }
      })
    );
    stopIfAborted();
    if (active3.length > 0 && failedTiles.length === active3.length) {
      throw new Error(`Vegetation fetch failed for all ${active3.length} area tiles`);
    }
    const features2 = JSON.parse(requireCore().dedupVegetationFeatures(tilesJson));
    return {
      features: features2,
      polygon,
      totalTrees: Object.keys(features2).length,
      executionTime: (performance.now() - started) / 1e3,
      failedTiles,
      readMarginM: readDistanceM,
      analysisType: analysisType2
    };
  }
};

// src/internal/ground-merge.ts
function resolveCleaner(requested) {
  if (requested === void 0) return "local";
  if (typeof requested === "string") {
    throw new InvalidOptionError(
      `cleaner ${JSON.stringify(requested)} was removed; leave cleaner unset for the bundled kernel cleaner, or pass a GroundMaterialCleaner object`
    );
  }
  return requested;
}
function cleaningExtent(polygon, fetchDistanceM) {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length === 0) throw new TypeError("polygon exterior ring is empty");
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;
  let minLongitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  for (const point of ring) {
    minLongitude = Math.min(minLongitude, point[0]);
    maxLongitude = Math.max(maxLongitude, point[0]);
    minLatitude = Math.min(minLatitude, point[1]);
    maxLatitude = Math.max(maxLatitude, point[1]);
  }
  const projected = JSON.parse(requireCore().projectPolygonToMeters(JSON.stringify(polygon)));
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const [x, y] of projected.polygon_meters) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    distance: Math.max(fetchDistanceM, Math.hypot(maxX - minX, maxY - minY) / 2)
  };
}

// src/ground-materials-service.ts
var GroundMaterialsService = class {
  request;
  // The client's logger: the 20 km2 site warning goes through it (D48).
  logger;
  /** Creates the service from the client's transport settings (`fetch`, timeout and logger). */
  constructor(options) {
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs },
      // A retry of a public read reports through the client's logger.
      ...options.logger === void 0 ? {} : { logger: options.logger }
    };
    this.logger = options.logger ?? consoleLogger;
  }
  /** Base options for a direct read: the client's transport settings. */
  directOptions() {
    return { ...this.request };
  }
  /**
   * Reads the material layers of one square tile around a point.
   *
   * @param lat - Centre latitude in degrees.
   * @param lon - Centre longitude in degrees.
   * @param distance - Half-width of the tile in metres.
   * @returns The layers, or `null` when the tile has no material at all.
   */
  async getRaw(lat, lon, distance) {
    await ensureCore("groundMaterials.getRaw");
    const { layers } = await acquireGroundMaterials(pointToBbox(lat, lon, distance), {
      ...this.directOptions()
    });
    const empty = Object.values(layers).every(
      (collection) => (collection.features?.length ?? 0) === 0
    );
    return empty ? null : layers;
  }
  /**
   * Reads the material layers for a whole polygon area and cleans them, ready
   * to pass to `runArea` as `groundMaterials`. Which tiles are read, and how
   * far around each, follows the analysis (`options.analysisType`).
   *
   * @param polygon - The GeoJSON polygon to cover.
   * @param options - Read options; see each field.
   * @returns The `AreaGroundMaterials`, with empty layers when the polygon has no tiles to read.
   * @throws {InvalidOptionError} when the removed `acquisition` option is passed.
   */
  async getArea(polygon, options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "ground materials are composed from the public data hosts only; remove the option"
    );
    await ensureCore("groundMaterials.getArea");
    const cleaner = resolveCleaner(options.cleaner);
    const started = performance.now();
    const analysisType2 = resolveReadAnalysisType(options.analysisType);
    const tileQueryHalfM = groundReadDistanceM(analysisType2);
    const grid = generateTilesForPolygon(polygon, {
      analysisType: analysisType2,
      ...options.maxTilesOverride === void 0 ? {} : { maxTilesOverride: options.maxTilesOverride }
    });
    const active3 = grid.flat().filter((tile) => !tile.empty);
    const extent = active3.length > 0 ? cleaningExtent(polygon, tileQueryHalfM) : void 0;
    if (active3.length === 0 || extent === void 0) {
      return {
        layers: {},
        polygon,
        totalFeatures: 0,
        executionTime: (performance.now() - started) / 1e3,
        failedTiles: [],
        readMarginM: tileQueryHalfM,
        analysisType: analysisType2
      };
    }
    const transport3 = httpRangeTransport({
      ...this.directOptions(),
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
    const rectangles = active3.map((tile) => pointToBbox(tile.centroid.latitude, tile.centroid.longitude, tileQueryHalfM));
    const site = siteRectangle(rectangles);
    const origin = kernelPolygonOrigin(polygon);
    const direct = {
      ...this.directOptions(),
      ...options.signal === void 0 ? {} : { signal: options.signal },
      transport: transport3,
      // The same frame origin for every chunk, so one road buffers to one
      // polygon whichever chunk sees it (D39).
      frameOrigin: [origin.lon, origin.lat],
      cleaningExtent: extent,
      // The rectangles the simulation actually reads: a chunk meeting none of
      // them is not composed (an L-shaped polygon's empty quadrant).
      tileRectangles: rectangles,
      logger: this.logger,
      ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
      ...options.defaultMaterial === void 0 ? {} : { defaultLayer: options.defaultMaterial },
      ...options.zStep === void 0 ? {} : { zStep: options.zStep },
      ...options.overtureRelease === void 0 ? {} : { overtureRelease: options.overtureRelease }
    };
    const area = await acquireGroundMaterialsArea(site, direct);
    const overtureRelease = area.overtureRelease === "" ? void 0 : area.overtureRelease;
    let layers = JSON.parse(area.layersJson);
    if (cleaner !== "local" && Object.keys(layers).length > 0) {
      layers = await cleaner.cleanV3(layers, {
        latitude: extent.latitude,
        longitude: extent.longitude,
        distance: extent.distance,
        ...options.defaultMaterial === void 0 ? {} : { defaultLayer: options.defaultMaterial },
        ...options.zStep === void 0 ? {} : { zStep: options.zStep }
      });
    }
    const totalFeatures = Object.values(layers).reduce(
      (sum, collection) => sum + (collection.features?.length ?? 0),
      0
    );
    return {
      layers,
      polygon,
      totalFeatures,
      executionTime: (performance.now() - started) / 1e3,
      // A site-level read succeeds or fails as one. A partial ground set is
      // not a degraded answer. It is an emptier city that nobody can see (D48).
      failedTiles: [],
      readMarginM: tileQueryHalfM,
      analysisType: analysisType2,
      ...overtureRelease === void 0 ? {} : { overtureRelease }
    };
  }
};

// src/internal/weather-static-decode.ts
var WeatherServiceError = class extends Error {
  constructor(message, statusCode, operation) {
    super(message);
    this.statusCode = statusCode;
    this.operation = operation;
  }
  name = "WeatherServiceError";
};
var GZIP_MAGIC = [31, 139];
function failWeather(message, statusCode, operation) {
  throw new WeatherServiceError(message, statusCode, operation);
}
function decodeUtf8(bytes, subject, operation) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return failWeather(`${subject} payload was not UTF-8 text`, 502, operation);
  }
}
function parseJsonObject(text, subject, operation) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return failWeather(
      `${subject} payload was not JSON: ${error instanceof Error ? error.message : String(error)}`,
      502,
      operation
    );
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return failWeather(`${subject} payload was not a JSON object`, 502, operation);
  }
  return value;
}
function gunzipIfNeeded(bytes, uuid, operation) {
  if (bytes.length < 2 || bytes[0] !== GZIP_MAGIC[0] || bytes[1] !== GZIP_MAGIC[1]) return bytes;
  try {
    return gunzipSync(bytes);
  } catch (error) {
    return failWeather(
      `Weather station ${JSON.stringify(uuid)} payload sniffs as gzip but failed to decompress: ${error instanceof Error ? error.message : String(error)}`,
      502,
      operation
    );
  }
}

// src/internal/weather-static-cache.ts
var BoundedCache = class {
  constructor(limit3) {
    this.limit = limit3;
    if (!Number.isSafeInteger(limit3) || limit3 < 1) {
      throw new TypeError("cache limit must be a positive integer");
    }
  }
  entries = /* @__PURE__ */ new Map();
  get(key) {
    const value = this.entries.get(key);
    if (value === void 0) return void 0;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }
  set(key, value) {
    this.entries.delete(key);
    this.entries.set(key, value);
    while (this.entries.size > this.limit) {
      const oldest = this.entries.keys().next();
      if (oldest.done === true) break;
      this.entries.delete(oldest.value);
    }
  }
  clear() {
    this.entries.clear();
  }
  get size() {
    return this.entries.size;
  }
};
var CATALOG_CACHE_LIMIT = 2;
var POINTER_CACHE_LIMIT = 4;
var STATION_CACHE_LIMIT = 3;

// src/weather-static.ts
var DEFAULT_STATIC_BASE_URL = "https://geo.infrared.city/weather";
var MAX_STATIC_BYTES = 64 * 1024 * 1024;
var DEFAULT_RADIUS_KM = 100;
var STATION_LIMIT = 10;
var CATALOG_TTL_MS = 3e5;
var catalogCache = new BoundedCache(CATALOG_CACHE_LIMIT);
var catalogPending = /* @__PURE__ */ new Map();
var pointerCache = new BoundedCache(
  POINTER_CACHE_LIMIT
);
var pointerPending = /* @__PURE__ */ new Map();
var stationCache = new BoundedCache(STATION_CACHE_LIMIT);
var stationPending = /* @__PURE__ */ new Map();
function loadOnce(pendingCache, limit3, readyCache, key, load) {
  const current = pendingCache.get(key);
  if (current !== void 0) {
    pendingCache.delete(key);
    pendingCache.set(key, current);
    return current;
  }
  let pending2;
  pending2 = Promise.resolve().then(load).then(
    (value) => {
      if (pendingCache.get(key) === pending2) {
        pendingCache.delete(key);
        readyCache.set(key, value);
      }
      return value;
    },
    (error) => {
      if (pendingCache.get(key) === pending2) pendingCache.delete(key);
      throw error;
    }
  );
  pendingCache.set(key, pending2);
  while (pendingCache.size > limit3) {
    const oldest = pendingCache.keys().next();
    if (oldest.done === true) break;
    pendingCache.delete(oldest.value);
  }
  return pending2;
}
function clearWeatherCatalogCache() {
  catalogCache.clear();
  catalogPending.clear();
  pointerCache.clear();
  pointerPending.clear();
  stationCache.clear();
  stationPending.clear();
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
async function staticBytes(url, operation, request) {
  try {
    const answer = await withHostRetry(
      "public_get",
      () => fetchPublicBytes(url, { ...request, cap: MAX_STATIC_BYTES }),
      request
    );
    return { bytes: answer.bytes, etag: answer.etag };
  } catch (error) {
    if (error instanceof GeodataError) {
      failWeather(`${operation} refused the answer: ${error.message}`, 502, operation);
    }
    throw error;
  }
}
var StaticWeatherReader = class {
  baseUrl;
  request;
  ttlMs;
  /** Create a reader; every option is optional. */
  constructor(options = {}) {
    this.baseUrl = trimTrailingSlashes(options.baseUrl ?? DEFAULT_STATIC_BASE_URL);
    this.ttlMs = options.catalogTtlMs ?? CATALOG_TTL_MS;
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.signal === void 0 ? {} : { signal: options.signal },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs }
    };
  }
  /** The generation folder the pointer names, re-read on the TTL. */
  async folderUrl() {
    const cached2 = pointerCache.get(this.baseUrl);
    if (cached2 !== void 0 && Date.now() - cached2.at < this.ttlMs) return cached2.folderUrl;
    const loaded = await loadOnce(
      pointerPending,
      POINTER_CACHE_LIMIT,
      pointerCache,
      this.baseUrl,
      async () => {
        const pointerOperation = "fetchWeatherCatalogPointer";
        const { bytes } = await staticBytes(
          `${this.baseUrl}/latest.json`,
          pointerOperation,
          this.request
        );
        try {
          return {
            folderUrl: requireCore().weatherPointerFolder(this.baseUrl, bytes),
            at: Date.now()
          };
        } catch (error) {
          return failWeather(errorMessage(error), 502, pointerOperation);
        }
      }
    );
    return loaded.folderUrl;
  }
  /** The catalog handle for the current generation, read at most once per generation. */
  async catalog() {
    const folderUrl = await this.folderUrl();
    const catalogOperation = "fetchWeatherCatalog";
    const url = `${folderUrl}/catalog.json`;
    const cached2 = catalogCache.get(url);
    if (cached2 !== void 0) return { folderUrl, entry: cached2 };
    const entry = await loadOnce(catalogPending, CATALOG_CACHE_LIMIT, catalogCache, url, async () => {
      const { bytes } = await staticBytes(url, catalogOperation, this.request);
      try {
        return new (requireCore()).WeatherCatalog(bytes);
      } catch (error) {
        return failWeather(errorMessage(error), 502, catalogOperation);
      }
    });
    return { folderUrl, entry };
  }
  /** uuid or fileName to the catalog's uuid, or the typed 404 (D40). The rule and its text are the kernel's. */
  stationUuid(entry, identifier, operation) {
    let row;
    try {
      row = entry.find(identifier);
    } catch (error) {
      return failWeather(errorMessage(error), 404, operation);
    }
    return JSON.parse(row).uuid;
  }
  /** One station's data object as TEXT, gzip handled either way. */
  async stationText(folderUrl, uuid, operation) {
    const url = `${folderUrl}/stations/${encodeURIComponent(uuid)}.json`;
    const cached2 = stationCache.get(url);
    if (cached2 !== void 0) return cached2;
    return loadOnce(stationPending, STATION_CACHE_LIMIT, stationCache, url, async () => {
      const { bytes } = await staticBytes(url, "fetchWeatherStation", this.request);
      const subject = `Weather station ${JSON.stringify(uuid)}`;
      return decodeUtf8(gunzipIfNeeded(bytes, uuid, operation), subject, operation);
    });
  }
  /**
   * The nearest stations to a point (`lat`, `lon` in degrees), nearest first, at most
   * ten. `radiusKm` defaults to 100.
   *
   * @throws {WeatherServiceError} when the catalog cannot be read or ranked.
   */
  async nearestStations(lat, lon, radiusKm) {
    const operation = "getWeatherFileFromLocation";
    const { entry } = await this.catalog();
    try {
      return JSON.parse(
        entry.nearest(lat, lon, radiusKm ?? DEFAULT_RADIUS_KM, STATION_LIMIT)
      );
    } catch (error) {
      return failWeather(
        `local weather catalog nearest failed: ${errorMessage(error)}`,
        500,
        operation
      );
    }
  }
  /**
   * One station's full document, found by `uuid` or `fileName`.
   *
   * @throws {WeatherServiceError} when the station is unknown (404) or the catalog is unreadable.
   */
  async stationByIdentifier(identifier) {
    const operation = "getWeatherFileFromIdentifier";
    const { folderUrl, entry } = await this.catalog();
    const uuid = this.stationUuid(entry, identifier, operation);
    const text = await this.stationText(folderUrl, uuid, operation);
    return parseJsonObject(text, `Weather station ${JSON.stringify(uuid)}`, operation);
  }
  /**
   * A station's hours inside a period given as JSON text built from `TimeFilters`, one
   * record per hour.
   *
   * @throws {WeatherServiceError} when the station is unknown, the catalog is unreadable or the
   * period is rejected.
   */
  async filterHours(identifier, timePeriodJson) {
    const operation = "filterWeatherData";
    const { folderUrl, entry } = await this.catalog();
    const uuid = this.stationUuid(entry, identifier, operation);
    const stationJson = await this.stationText(folderUrl, uuid, operation);
    const core2 = requireCore();
    try {
      return JSON.parse(
        core2.weatherRows(core2.weatherFilterHours(stationJson, timePeriodJson))
      );
    } catch (error) {
      return failWeather(
        `local weatherFilterHours failed: ${errorMessage(error)}`,
        500,
        operation
      );
    }
  }
};

// src/weather.ts
var WeatherService = class {
  reader;
  /**
   * @param options - Service options; `staticBaseUrl`, `fetch` and `timeoutMs` apply.
   */
  constructor(options) {
    this.reader = new StaticWeatherReader({
      ...options.staticBaseUrl === void 0 ? {} : { baseUrl: options.staticBaseUrl },
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs }
    });
  }
  /**
   * The nearest catalog stations to a point.
   *
   * At most ten stations come back, nearest first.
   *
   * @param lat - Latitude of the point, in degrees.
   * @param lon - Longitude of the point, in degrees.
   * @param radius - Search radius in kilometres. Defaults to 100.
   * @returns The stations within the radius, nearest first.
   * @throws {WeatherServiceError} when the catalog cannot be read.
   */
  // Maintainer note (not published): `radius` is in KILOMETRES, as the deleted route's
  // `radius` query parameter was, and defaults to 100. The limit of ten is the same one
  // the route's `$geoNear` pipeline had.
  async getWeatherFileFromLocation(lat, lon, radius) {
    const stations = await this.reader.nearestStations(lat, lon, radius);
    return stations.map((station) => {
      const uuid = station["uuid"];
      if (typeof uuid !== "string") throw new TypeError("weather location has no uuid");
      return { ...station, uuid, identifier: uuid };
    });
  }
  /**
   * One station's full document, found by `uuid` or by `fileName`.
   *
   * @param identifier - The station's `uuid` or `fileName`.
   * @returns The station's document, including its hourly data.
   * @throws {WeatherServiceError} when the station is not in the public catalog (status
   * 404) or the catalog cannot be read.
   */
  async getWeatherFileFromIdentifier(identifier) {
    return this.reader.stationByIdentifier(identifier);
  }
  /**
   * Read and validate the text of one local `.epw` file. This is the way to use your
   * own weather, and the only way for a file that is not in the public catalog.
   * Nothing is uploaded or registered, and no request leaves this process.
   *
   * Keep the returned document for the retry: its `identity` is what proves a
   * resumed run uses the same weather.
   *
   * @param text - The contents of the `.epw` file.
   * @param options - Optional tighter limits on file size and row count.
   * @returns The validated weather document.
   * @throws {EpwParseError} when the file is not a valid EPW file.
   */
  parseEpw(text, options) {
    return parseEpw(text, options);
  }
  /**
   * Hours inside the given period, one record per hour.
   *
   * `source` is a public catalog station, given by `uuid` or by `fileName`, or a
   * `WeatherDocument` from `parseEpw`. A document is accepted everywhere a station id
   * is, is filtered locally and makes no request; the period means the same for both.
   *
   * @param source - A station `uuid` or `fileName`, or a `WeatherDocument`.
   * @param filters - The period to keep.
   * @returns One record per hour inside the period; empty when nothing matches.
   * @throws {TypeError} when the period is malformed (a month outside 1-12, an hour
   * outside 0-23, a day outside its month) or ends earlier in the year than it starts.
   * @throws {WeatherServiceError} when the station is not in the public catalog or the
   * catalog cannot be read.
   */
  async filterWeatherData(source, filters) {
    rejectRemovedOption(
      filters,
      "filter",
      "it was the deleted route's `hour-filter` body field and has no kernel twin; filter the returned records yourself"
    );
    if (source instanceof WeatherDocument) return source.filterHours(filters);
    return this.reader.filterHours(source, weatherWindowJson(filters));
  }
};

// src/compat.ts
function decompressResultValue(jobs, content, options) {
  return jobs.decompress(content, options).value;
}

// src/serialization.ts
var ID_MAP_FIELDS = /* @__PURE__ */ new Set([
  "geometries",
  "groundGeometry",
  "contextGeometry",
  "vegetation",
  "groundMaterials"
]);
var VERBATIM_MAP_FIELDS = /* @__PURE__ */ new Set([
  "barriers",
  "openings",
  "buildings",
  "sensorSurfaces",
  "roomReflectances",
  "globalTransform"
]);
var WIRE_KEY_OVERRIDES = /* @__PURE__ */ new Map([
  ["openingFactor", "openingFactor"],
  ["windowArea", "window_area"],
  ["roomReflectances", "room_reflectances"],
  ["exteriorGroundReflectance", "exterior_ground_reflectance"],
  ["useObb", "use_obb"],
  ["globalTransform", "global_transform"]
]);
function toCamelCase(value) {
  return value.replace(/[-_]([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}
function toKebabCase(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
function setOwnKey(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
}
function serializeMap(value, recurse) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return recurse ? serializeToKebab(value) : value;
  }
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === null || item === void 0) continue;
    setOwnKey(output, key, recurse ? serializeToKebab(item) : item);
  }
  return output;
}
function serializeToKebab(value) {
  if (value === null || value === void 0) return value;
  if (Array.isArray(value)) return value.map(serializeToKebab);
  if (typeof value !== "object" || value.constructor !== Object) return value;
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === null || item === void 0) continue;
    const wireKey = WIRE_KEY_OVERRIDES.get(key) ?? toKebabCase(key);
    if (VERBATIM_MAP_FIELDS.has(key)) setOwnKey(output, wireKey, serializeMap(item, false));
    else if (ID_MAP_FIELDS.has(key)) setOwnKey(output, wireKey, serializeMap(item, true));
    else setOwnKey(output, wireKey, serializeToKebab(item));
  }
  return output;
}
function deserializeToCamelCase(value) {
  if (value === null || value === void 0) return value;
  if (Array.isArray(value)) return value.map(deserializeToCamelCase);
  if (typeof value !== "object" || value.constructor !== Object) return value;
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    setOwnKey(output, toCamelCase(key), deserializeToCamelCase(item));
  }
  return output;
}

// src/mesh.ts
function validateCoordinates(coordinates) {
  for (const coordinate of coordinates) {
    if (typeof coordinate !== "number" || !Number.isFinite(coordinate)) {
      throw new TypeError("coordinates must contain only finite numbers");
    }
  }
}
function validateIndices(indices2) {
  for (const index2 of indices2) {
    if (typeof index2 !== "number" || !Number.isFinite(index2)) {
      throw new TypeError("indices must contain only finite numbers");
    }
  }
}
function packMesh(coordinates, indices2) {
  validateCoordinates(coordinates);
  validateIndices(indices2);
  const coordinateBuffer = coordinates instanceof Float64Array ? coordinates : new Float64Array(coordinates);
  return requireCore().packMesh(coordinateBuffer, indices2);
}

// src/internal/registry-document.ts
var REGISTRY_URL = "https://registry.infrared.city/models/latest.json";
var ALLOWED_HOSTS2 = ["registry.infrared.city"];
var DEFAULT_TTL_MS = 15 * 60 * 1e3;
var DEFAULT_TIMEOUT_MS2 = 3e4;
var MAX_REGISTRY_BYTES = 8 * 1024 * 1024;
var RegistryFetchError = class extends Error {
  name = "RegistryFetchError";
};
function deepFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const inner of Object.values(value)) deepFreeze(inner);
  return Object.freeze(value);
}
var cache;
function clearRegistryCache() {
  cache = void 0;
}
function assertAllowedRegistryUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new RegistryFetchError(`registry URL is not a URL: ${url}`);
  }
  if (parsed.protocol !== "https:") {
    throw new RegistryFetchError(`registry URL must be https, got ${parsed.protocol}`);
  }
  if (!ALLOWED_HOSTS2.includes(parsed.hostname)) {
    throw new RegistryFetchError(
      `registry host ${parsed.hostname} is not allow-listed (allowed: ${ALLOWED_HOSTS2.join(", ")})`
    );
  }
}
function userAgent() {
  return "infrared-sdk-ts (+https://infrared.city) registry-colors";
}
function assertNotRedirect(response) {
  if (response.status >= 300 && response.status < 400) {
    cancelBody(response);
    throw new RegistryFetchError(
      `colour registry redirect refused (HTTP ${response.status})`
    );
  }
}
async function readDocument(response) {
  const bytes = await readCappedBody(response, {
    cap: MAX_REGISTRY_BYTES,
    fail: (detail) => new RegistryFetchError(`the colour registry document ${detail}`)
  });
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    throw new RegistryFetchError(
      `colour registry document is not JSON: ${String(error)}`,
      { cause: error }
    );
  }
}
function stopDetail3(error, deadline, timeoutMs) {
  const stopped = deadline.reason();
  if (stopped === "timeout") {
    return `the colour registry did not answer within ${timeoutMs} ms`;
  }
  if (stopped === "aborted") return "the caller aborted the colour registry read";
  return `could not fetch the colour registry: ${String(error)}`;
}
async function fetchVisualConfigurations(options = {}) {
  const url = options.url ?? REGISTRY_URL;
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const isDefault = url === REGISTRY_URL;
  if (isDefault && cache !== void 0 && Date.now() - cache.fetchedAt < ttlMs) {
    return { configurations: cache.configurations, version: cache.version };
  }
  assertAllowedRegistryUrl(url);
  const call = resolveFetch(options.fetch);
  if (typeof call !== "function") {
    throw new RegistryFetchError("no fetch implementation is available");
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS2;
  const deadline = new Deadline(options.signal, timeoutMs);
  let document2;
  try {
    const response = await deadline.wait(
      () => call(url, {
        headers: { Accept: "application/json", "User-Agent": userAgent() },
        redirect: "error",
        signal: deadline.controller.signal
      })
    );
    assertNotRedirect(response);
    if (!response.ok) {
      cancelBody(response);
      throw new RegistryFetchError(
        `could not fetch the colour registry (HTTP ${response.status})`
      );
    }
    document2 = await deadline.wait(() => readDocument(response));
  } catch (error) {
    if (error instanceof RegistryFetchError) throw error;
    throw new RegistryFetchError(stopDetail3(error, deadline, timeoutMs), { cause: error });
  } finally {
    deadline.close();
  }
  if (typeof document2 !== "object" || document2 === null) {
    throw new RegistryFetchError("colour registry document is not a JSON object");
  }
  const record3 = document2;
  const configurations = record3["visualConfigurations"];
  if (typeof configurations !== "object" || configurations === null) {
    throw new RegistryFetchError("colour registry has no `visualConfigurations` object");
  }
  const rawVersion = record3["version"];
  const resolved = deepFreeze({
    configurations,
    version: typeof rawVersion === "string" ? rawVersion : null
  });
  if (isDefault) cache = { ...resolved, fetchedAt: Date.now() };
  return resolved;
}

// src/images.ts
var DEFAULT_MAX_LONG_AXIS_PX = 960;
var GridImageError = class extends Error {
  name = "GridImageError";
};
var windOrdinals;
function isDirectConfig(value) {
  return typeof value === "object" && value !== null && "colors" in value;
}
function flattenVisualConfigs(configurations) {
  const flat = {};
  for (const [processId, value] of Object.entries(configurations)) {
    if (isDirectConfig(value)) {
      flat[processId] = value;
    } else if (typeof value === "object" && value !== null) {
      for (const [variant, config] of Object.entries(value)) {
        if (isDirectConfig(config)) flat[`${processId}:${variant}`] = config;
      }
    }
  }
  return flat;
}
function resolveVisualConfig(configurations, analysisType2, selectors = {}) {
  const flat = flattenVisualConfigs(configurations);
  if (analysisType2 in flat) return flat[analysisType2];
  const variant = selectors.criteria ?? selectors.subtype;
  if (variant !== void 0 && variant !== "") {
    const compound = `${analysisType2}:${variant}`;
    if (compound in flat) return flat[compound];
  }
  return void 0;
}
function windClassOrdinals() {
  if (windOrdinals === void 0) {
    const raw = requireCore().windClassOrdinals();
    windOrdinals = JSON.parse(raw);
  }
  return windOrdinals;
}
function normalizeGrid(grid) {
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new GridImageError("grid is empty");
  }
  const height = grid.length;
  const last = grid[height - 1];
  if (!Array.isArray(last) || last.length === 0) {
    throw new GridImageError("grid is empty");
  }
  const width = grid[0]?.length ?? 0;
  if (width === 0) throw new GridImageError("grid rows are empty");
  const classScale = last.some((cell) => typeof cell === "string");
  const ordinals = classScale ? windClassOrdinals() : {};
  const values = new Float32Array(width * height);
  let at = 0;
  for (let y = 0; y < height; y += 1) {
    const row = grid[y];
    if (!Array.isArray(row) || row.length !== width) {
      throw new GridImageError(
        `grid is ragged \u2014 row ${y} has ${row?.length ?? 0} cells, row 0 has ${width}`
      );
    }
    for (const cell of row) {
      if (cell === null || cell === void 0) {
        values[at] = Number.NaN;
      } else if (typeof cell === "string") {
        if (!classScale) {
          throw new GridImageError(
            `grid mixes text into a numeric result \u2014 row ${y} holds ${JSON.stringify(cell)} but the last row has no class labels, so the grid is read as numbers`
          );
        }
        values[at] = ordinals[cell] ?? Number.NaN;
      } else if (typeof cell === "number") {
        values[at] = cell;
      } else {
        throw new GridImageError(`grid row ${y} holds a non-numeric cell`);
      }
      at += 1;
    }
  }
  return { values, width, height };
}
async function renderGridPng(grid, options = {}) {
  const { values, width, height } = normalizeGrid(grid);
  const reverseRows = options.reverseRows ?? false;
  const maxLongAxisPx = options.maxLongAxisPx ?? DEFAULT_MAX_LONG_AXIS_PX;
  let config;
  if (options.analysisType !== void 0 && options.analysisType !== "") {
    const configurations = options.visualConfigurations ?? (await fetchVisualConfigurations(options.registry ?? {})).configurations;
    config = resolveVisualConfig(configurations, options.analysisType, {
      criteria: options.criteria,
      subtype: options.subtype
    });
  }
  try {
    if (config !== void 0) {
      return requireCore("renderGridPng").renderGridRegistry(
        values,
        width,
        height,
        JSON.stringify(config),
        reverseRows,
        maxLongAxisPx
      );
    }
    return requireCore("renderGridPng").gridToPng(
      values,
      width,
      height,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      maxLongAxisPx,
      reverseRows
    );
  } catch (error) {
    if (error instanceof GridImageError) throw error;
    throw new GridImageError(`local rendering failed: ${String(error)}`, { cause: error });
  }
}
function gridImageSize(png, gridWidth, gridHeight) {
  if (png.length < 24) throw new GridImageError("not a PNG");
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (signature.some((byte, at) => png[at] !== byte)) {
    throw new GridImageError("not a PNG");
  }
  if (gridWidth <= 0 || gridHeight <= 0) {
    throw new GridImageError("the grid must have both dimensions");
  }
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const scale = gridWidth >= gridHeight ? width / gridWidth : height / gridHeight;
  return { width, height, scale };
}

// src/legend.ts
var EMPTY2 = new Float64Array(0);
function isGrid(value) {
  return value instanceof Uint16Array || value instanceof Float32Array || value instanceof Int16Array || value instanceof Float64Array;
}
function gridOf(source) {
  if (isGrid(source)) return source;
  const grid = source?.mergedGrid;
  if (isGrid(grid)) return grid;
  throw new TypeError("expected an AreaResult or a Uint16Array, Float32Array, Int16Array or Float64Array");
}
function isCategorical(source) {
  if (isGrid(source)) return false;
  return (source.legend?.length ?? 0) > 0;
}
function wire(source) {
  if (isGrid(source)) return [void 0, void 0];
  return [source.valueDivisor, source.valid];
}
function toRange(range2) {
  return range2 === void 0 ? void 0 : [range2[0], range2[1]];
}
function legendRange(source, mode = "exact", options = {}) {
  const grid = gridOf(source);
  const values = mode === "fixed" || isCategorical(source) ? EMPTY2 : grid;
  const [divisor, valid] = values === EMPTY2 ? [void 0, void 0] : wire(source);
  return toRange(requireCore("legendRange").legendRange(
    values,
    mode,
    options.fixed?.[0],
    options.fixed?.[1],
    divisor,
    valid
  ));
}
function sharedLegendRange(sources, mode = "exact", options = {}) {
  if (!Array.isArray(sources)) throw new TypeError("expected an array of results");
  const grids = sources.map(gridOf);
  const pooled = mode === "fixed" ? [] : grids.flatMap((grid, index2) => {
    const source = sources[index2];
    if (isCategorical(source)) return [];
    if (grid instanceof Float32Array || grid instanceof Float64Array) return [grid];
    const [divisor, valid] = wire(source);
    return [requireCore("sharedLegendRange").surfaceValuesF32(
      new Uint8Array(grid.buffer, grid.byteOffset, grid.byteLength),
      grid instanceof Uint16Array ? "f16" : "i16",
      divisor ?? 1,
      valid,
      0,
      grid.length
    )];
  });
  return toRange(
    requireCore("sharedLegendRange").sharedLegendRange(pooled, mode, options.fixed?.[0], options.fixed?.[1])
  );
}
async function registryFixedRange(analysisType2, options = {}) {
  const configurations = options.visualConfigurations ?? (await fetchVisualConfigurations(options.registry ?? {})).configurations;
  const config = resolveVisualConfig(configurations, analysisType2, {
    criteria: options.criteria,
    subtype: options.subtype
  });
  if (config === void 0) return void 0;
  return toRange(requireCore("registryFixedRange").registryFixedRange(JSON.stringify(config)));
}

// src/ground-materials.ts
function cleanV3Local(layers, params) {
  const result2 = requireCore().groundCleanV3(
    JSON.stringify(layers),
    params.latitude,
    params.longitude,
    params.distance,
    params.defaultLayer,
    params.zStep
  );
  return JSON.parse(result2);
}
var LocalCleaner = class {
  /**
   * Clean the layers locally. Equivalent to calling `cleanV3Local`.
   *
   * @param layers - Material name to GeoJSON feature collection.
   * @param params - The centre point, crop distance and layer options.
   * @returns The cleaned layers.
   */
  async cleanV3(layers, params) {
    return cleanV3Local(layers, params);
  }
};

// src/tessellate.ts
function geojsonLayersToDotbim(layers) {
  const result2 = requireCore("geojsonLayersToDotbim").geojsonLayersToDotbim(
    JSON.stringify(layers)
  );
  return JSON.parse(result2);
}

// src/area/index.ts
var area_exports = {};
__export(area_exports, {
  AreaGeometryProbeError: () => AreaGeometryProbeError,
  AreaGeometryReferenceError: () => AreaGeometryReferenceError,
  CELL_SIZE_M: () => CELL_SIZE_M,
  ConfigHashPolicyError: () => ConfigHashPolicyError,
  CoreInitializationError: () => CoreInitializationError,
  CoreNotReadyError: () => CoreNotReadyError,
  CoreTerminalError: () => CoreTerminalError,
  FacadeCountContractError: () => FacadeCountContractError,
  PHYSICS_TIERS: () => PHYSICS_TIERS,
  SCHEDULE_CONTRACT_VERSION: () => SCHEDULE_CONTRACT_VERSION,
  THERMAL_CONTROLS: () => THERMAL_CONTROLS,
  TILE_FAILURE_KINDS: () => TILE_FAILURE_KINDS,
  TILE_SIZE_CELLS: () => TILE_SIZE_CELLS,
  TILE_SIZE_M: () => TILE_SIZE_M,
  TileFailurePhase: () => TileFailurePhase,
  WeatherIdentityError: () => WeatherIdentityError,
  areaGridHasValue: () => areaGridHasValue,
  areaGridValuesF32: () => areaGridValuesF32,
  areaScheduleFromJSON: () => areaScheduleFromJSON,
  areaScheduleToJSON: () => areaScheduleToJSON,
  checkAreaState: () => checkAreaState,
  composeTilePayloads: () => composeTilePayloads,
  computeAreaState: () => computeAreaState,
  freePreparedSites: () => freePreparedSites,
  freezeAreaSchedule: () => freezeAreaSchedule,
  generateTilesForPolygon: () => generateTilesForPolygon,
  getTilingConfig: () => getTilingConfig,
  initializeCore: () => initializeCore,
  mergeAreaJobs: () => mergeAreaJobs,
  mergeSurfaceAreaJobs: () => mergeSurfaceAreaJobs,
  prepareAnalysisPayload: () => prepareAnalysisPayload,
  prepareAreaPayload: () => prepareAreaPayload,
  previewAreaBatches: () => previewAreaBatches,
  runArea: () => runArea,
  submitAreaPlan: () => submitAreaPlan,
  validatePolygon: () => validatePolygon
});

// src/area/constants.ts
var CELL_SIZE_M = 1;
var TILE_SIZE_M = 512;
var TILE_SIZE_CELLS = TILE_SIZE_M / CELL_SIZE_M;

// src/area/submission.ts
function effectiveOptions(options, analysisType2) {
  if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
    throw new TypeError("unsupported option binaryResults; use transport instead");
  }
  const transport3 = areaTransport(options, analysisType2);
  if (options.transport !== void 0 && options.retryFrom?.transport !== void 0 && options.transport !== options.retryFrom.transport) {
    throw new Error("retryFrom transport mismatch");
  }
  const margin = options.terrainContextMarginM ?? options.retryFrom?.terrainContextMarginM;
  if (options.terrainContextMarginM !== void 0 && options.retryFrom?.terrainContextMarginM !== void 0 && options.terrainContextMarginM !== options.retryFrom.terrainContextMarginM) {
    throw new Error("retryFrom terrainContextMarginM mismatch");
  }
  return {
    ...options,
    transport: transport3,
    ...margin === void 0 ? {} : { terrainContextMarginM: margin },
    ...options.webhookUrl !== void 0 || options.retryFrom?.webhookUrl === void 0 ? {} : { webhookUrl: options.retryFrom.webhookUrl },
    ...options.webhookEvents !== void 0 || options.retryFrom?.webhookEvents === void 0 ? {} : { webhookEvents: [...options.retryFrom.webhookEvents] }
  };
}
function scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options) {
  const siteIdentity = options.retryFrom === void 0 ? plan.siteIdentity : options.retryFrom.siteIdentity;
  const sensorCap = options.maxSensorsPerJob ?? options.retryFrom?.maxSensorsPerJob;
  const attempts = plan.retryContext?.attempts;
  return {
    jobs,
    polygon: plan.polygon,
    configHash: plan.configHash,
    ...siteIdentity === void 0 ? {} : { siteIdentity },
    tilePositions: plan.tilePositions,
    gridShape: plan.gridShape,
    analysisType: plan.analysisType,
    failedSubmissions,
    uncertainSubmissions,
    invalidReferenceSubmissions,
    transport: areaTransport(options, plan.analysisType),
    ...areaTransport(options, plan.analysisType) === "binary" ? { wireVersion: 1 } : {},
    submissionAbortStatus,
    surfaceFields: plan.surfaceFields,
    terrainContextMarginM: plan.terrainContextMarginM,
    // A retry that omits the cap replays a plan made under the saved one.
    ...sensorCap === void 0 ? {} : { maxSensorsPerJob: sensorCap },
    // Stamped on every schedule this SDK writes, whether or not the weather
    // is provable: the VERSION is what tells a schedule that recorded no
    // identity from one written before the field existed, and only the first
    // can be resumed once the caller brings a parsed file.
    scheduleContractVersion: SCHEDULE_CONTRACT_VERSION,
    ...plan.weatherIdentity === void 0 ? {} : { weatherIdentity: plan.weatherIdentity },
    ...plan.batchingPolicyVersion === void 0 ? {} : { batchingPolicyVersion: plan.batchingPolicyVersion },
    ...plan.batchMembership === void 0 ? {} : { batchMembership: plan.batchMembership },
    ...plan.batchSensorCounts === void 0 ? {} : { batchSensorCounts: plan.batchSensorCounts },
    ...options.webhookUrl === void 0 ? {} : { webhookUrl: options.webhookUrl },
    ...options.webhookEvents === void 0 ? {} : { webhookEvents: [...options.webhookEvents] },
    runId: plan.runId,
    ...attempts === void 0 ? {} : { attempts }
  };
}
var AreaGeometryReferenceError = class extends Error {
  constructor(areaSchedule, acceptedJobIds2) {
    super("area submission stopped after an invalid geometry-reference acceptance");
    this.areaSchedule = areaSchedule;
    this.acceptedJobIds = acceptedJobIds2;
  }
  name = "AreaGeometryReferenceError";
};
var AreaGeometryProbeError = class extends Error {
  constructor(areaSchedule, acceptedProbeJobIds) {
    super("area submission stopped after an uncertain geometry-reference capability probe");
    this.areaSchedule = areaSchedule;
    this.acceptedProbeJobIds = acceptedProbeJobIds;
  }
  name = "AreaGeometryProbeError";
};
async function facadeCaptureFor(service, plan, entry) {
  if (service.captures === void 0 || !plan.surfaceFields) return void 0;
  if (entry.capture === void 0) return void 0;
  const alignment = entry.prepared.body["terrain-alignment"];
  return await entry.capture(typeof alignment === "string" ? alignment : null, service.captures.store);
}
function rememberFacadeInputs(service, capture, jobId, cellTris = false) {
  const store = service.captures;
  if (store === void 0 || jobId === void 0 || capture === void 0) return;
  store.remember(jobId, capture, cellTris);
}
async function submitAreaPlan(service, plan, options = {}) {
  const entries3 = plan.entries;
  if ((options.retryFrom?.invalidReferenceSubmissions?.length ?? 0) > 0) {
    const ids = [...options.retryFrom.jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== void 0 ? [job.jobId] : []);
    throw new AreaGeometryReferenceError(options.retryFrom, ids);
  }
  if (options.retryFrom?.geometryProbeUncertain === true) {
    throw new AreaGeometryProbeError(options.retryFrom, options.retryFrom.geometryProbeJobIds ?? []);
  }
  checkPaidRetrySiteIdentity(options.retryFrom, plan.siteIdentity, entries3.length > 0, options.logger);
  let outcome;
  try {
    if (areaTransport(options, plan.analysisType) === "binary" && entries3.length > 0 && service.binaryCapability !== void 0) {
      checkBinaryRoute(plan.analysisType, await service.binaryCapability(options.signal));
    }
    outcome = await submitOnEngine(service, entries3, {
      // A plan built by hand may lack the run id; the engine keys need one.
      runId: plan.runId ?? freshRunId(),
      ...plan.retryContext?.attempts === void 0 ? {} : { attempts: plan.retryContext.attempts },
      ...options.signal === void 0 ? {} : { signal: options.signal },
      ...options.onAccepted === void 0 ? {} : { onAccepted: options.onAccepted },
      ...options.retryFrom === void 0 ? {} : {
        priorJobs: options.retryFrom.jobs,
        // D224: the kernel plan's held-uncertain list, not the raw saved
        // one -- a key the pre-plan sweep resolved to `completed` is gone
        // (nothing to carry), and one resolved to `failed` is a fresh
        // `computeFailed` entry in `plan.resubmit`, not a carried record.
        priorUncertain: plan.retryContext?.carryUncertain ?? options.retryFrom.uncertainSubmissions ?? [],
        priorInvalidReference: options.retryFrom.invalidReferenceSubmissions ?? []
      },
      capture: (entry) => facadeCaptureFor(service, plan, entry),
      remember: (capture, jobId) => rememberFacadeInputs(service, capture, jobId, plan.localCellTris === true),
      ...options.logger === void 0 ? {} : { logger: options.logger }
    });
  } finally {
    for (const entry of entries3) service.releasePreflight?.(entry.prepared);
  }
  const {
    jobs,
    failedSubmissions,
    uncertainSubmissions,
    invalidReferenceSubmissions,
    submissionAbortStatus
  } = outcome;
  const schedule2 = freezeAreaSchedule({
    ...scheduleFromPlan(
      plan,
      jobs,
      failedSubmissions,
      uncertainSubmissions,
      invalidReferenceSubmissions,
      submissionAbortStatus,
      options
    ),
    // A new attempt the engine made (a new key) travels with the schedule (D224).
    ...Object.keys(outcome.attempts).length === 0 ? {} : { attempts: outcome.attempts }
  });
  try {
    options.onProgress?.(computeAreaState(schedule2));
  } catch {
  }
  if (invalidReferenceSubmissions.length > 0) {
    for (const job of jobs.values()) {
      if (job.jobId !== void 0) service.captures?.forget(job.jobId);
    }
    const ids = [...jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== void 0 ? [job.jobId] : []);
    throw new AreaGeometryReferenceError(schedule2, ids);
  }
  return schedule2;
}
async function runArea(service, input, polygon, options = {}) {
  const effective = effectiveOptions(options, String(input.analysisType ?? input["analysis-type"]));
  const plan = await planAreaSubmission(service, input, polygon, effective);
  return submitAreaPlan(service, plan, effective);
}
function shareFacadeSites(facadeSites) {
  const shared2 = [...facadeSites].filter(([, plans]) => plans.length >= 2 && new Set(plans).size === 1);
  for (const [site, plans] of shared2) site.shareFacadeParts?.(plans.length);
  return () => {
    for (const [site] of shared2) site.shareFacadeParts?.(0);
  };
}
async function runAreaMany(service, inputs, polygon, options = {}) {
  if (options.retryFrom !== void 0) {
    throw new TypeError("retryFrom is not supported with a list of analyses: retry each analysis alone");
  }
  const memo2 = siteKeyMemo();
  const facadeSites = /* @__PURE__ */ new Map();
  const plans = [];
  for (const input of inputs) {
    const effective = effectiveOptions(options, String(input.analysisType ?? input["analysis-type"]));
    plans.push({ plan: await planAreaSubmission(service, input, polygon, effective, memo2, facadeSites), effective });
  }
  const release4 = shareFacadeSites(facadeSites);
  try {
    const settled2 = await Promise.allSettled(plans.map(({ plan, effective }) => submitAreaPlan(service, plan, effective)));
    const failed = settled2.find((outcome) => outcome.status === "rejected");
    if (failed !== void 0) throw failed.reason;
    return settled2.map((outcome) => outcome.value);
  } finally {
    release4();
  }
}

// src/area/preview.ts
function gridTileCount(tilePositions) {
  return tilePositions.filter((position) => !position.tileId.includes("#batch")).length;
}
function sumSensorCounts(counts) {
  if (counts === void 0) return void 0;
  return Object.values(counts).reduce((total, count2) => total + count2, 0);
}
async function previewAreaBatches(service, billing2, input, polygon, options = {}) {
  const plan = await planAreaSubmission(service, input, polygon, options);
  const plannedJobCount = plan.plannedJobCount ?? plan.entries.length;
  const sensorCount = sumSensorCounts(plan.batchSensorCounts);
  const priced = estimateRun(plannedJobCount, await billing2.quote(plan.analysisType));
  return {
    tileCount: gridTileCount(plan.tilePositions),
    plannedJobCount,
    estimatedTimeS: priced.estimatedTimeS,
    estimatedCostTokens: priced.estimatedCostTokens,
    tokensPerJob: priced.tokensPerJob,
    pricingSource: priced.pricingSource,
    ...priced.pricingVersion === void 0 ? {} : { pricingVersion: priced.pricingVersion },
    ...sensorCount === void 0 ? {} : { sensorCount }
  };
}

// src/area/area-grid.ts
function newAreaGridMerger(schedule2, strategy, windDirectionDeg, block) {
  const config = getTilingConfig(schedule2.analysisType);
  const configJson = JSON.stringify({
    inference_size_m: config.inferenceSizeM,
    inference_size_cells: config.inferenceSizeCells,
    context_size_m: config.contextSizeM,
    step_m: config.stepM,
    step_cells: config.stepCells,
    cell_size_m: config.cellSizeM
  });
  return new (requireCore()).AreaGridMerger(
    schedule2.gridShape[0],
    schedule2.gridShape[1],
    configJson,
    JSON.stringify(schedule2.polygon),
    strategy,
    windDirectionDeg,
    block
  );
}
function finishAreaGrid(merger) {
  const out = merger.finish();
  const bounds = out.bounds;
  return {
    mergedGrid: out.values,
    valueDtype: out.valuesDtype,
    valueDivisor: out.valueDivisor,
    ...out.valid === void 0 ? {} : { valid: out.valid },
    gridShape: [out.shape[0], out.shape[1]],
    ...out.legend === void 0 ? {} : { legend: Object.freeze(Array.from(out.legend)) },
    ...out.minLegend === void 0 ? {} : { minLegend: out.minLegend, maxLegend: out.maxLegend },
    ...bounds === void 0 ? {} : {
      bounds: [bounds[0], bounds[1], bounds[2], bounds[3]]
    }
  };
}
function areaGridHasValue(result2, cell) {
  return cellHasValue(result2.valueDtype, result2.mergedGrid, result2.valid, cell);
}
function areaGridValuesF32(result2) {
  const grid = result2.mergedGrid;
  return requireCore("areaGridValuesF32").surfaceValuesF32(
    new Uint8Array(grid.buffer, grid.byteOffset, grid.byteLength),
    result2.valueDtype,
    result2.valueDivisor,
    result2.valid,
    0,
    grid.length
  );
}

// src/area/incomplete-error.ts
function incomplete(schedule2, missing) {
  const uncertain = new Set(schedule2.uncertainSubmissions ?? []);
  const unreachable = missing.filter(
    (tile) => uncertain.has(tile.tileId) && schedule2.jobs.get(tile.tileId)?.jobId === void 0
  );
  const failedAfterUncertain = missing.filter((tile) => {
    const job = schedule2.jobs.get(tile.tileId);
    return uncertain.has(tile.tileId) && job?.jobId !== void 0 && job.status === "failed";
  });
  const kindText = (tile) => tile.kind === void 0 ? "" : `; kind=${tile.kind}${tile.status === void 0 ? "" : `, status=${tile.status}`}`;
  const named = missing.map((tile) => `${tile.tileId} (${tile.phase ?? "unknown"}: ${tile.error}${kindText(tile)})`);
  const advice = retryPolicy().failureAdvice;
  const adviceNote = [...new Set(missing.flatMap((tile) => tile.kind === void 0 ? [] : [tile.kind]))].map((kind) => ` [${kind}] ${advice[kind]}`).join("");
  const totalTiles = (/* @__PURE__ */ new Set([...schedule2.jobs.keys(), ...missing.map((tile) => tile.tileId)])).size;
  const cause = missing.find((tile) => tile.exception !== void 0)?.exception;
  const uncertainNote = unreachable.length === 0 ? "" : ` ${unreachable.length} of them (${unreachable.map((tile) => tile.tileId).join(", ")}) had an UNKNOWN submission outcome: neither recovery reaches those, because the server may or may not hold a job for them. Resubmitting one can pay for it twice, so this SDK will not do it for you \u2014 check the account's jobs, or call runArea for just those tiles knowing the cost.`;
  const failedNote = failedAfterUncertain.length === 0 ? "" : ` ${failedAfterUncertain.length} of them (${failedAfterUncertain.map((tile) => tile.tileId).join(", ")}) had an uncertain submission that turned out to be ACCEPTED: the job ran and FAILED, so there is no result for mergeAreaJobs to fetch. This SDK will not resubmit it for you either, for the same reason \u2014 check the job's own error, or call runArea for just that tile knowing the cost.`;
  return new Error(
    `Area run is incomplete: ${missing.length} of ${totalTiles} tiles did not contribute to the grid. Call mergeAreaJobs again with this schedule to fetch a result that is already computed.${adviceNote}${uncertainNote}${failedNote} Missing: ${named.join("; ")}`,
    cause === void 0 ? {} : { cause }
  );
}

// src/area/merge-common.ts
function throwable(error) {
  return error instanceof Error ? error : new Error(String(error));
}

// src/area/schedule-types.ts
var TileFailurePhase = {
  Submit: "submit",
  Compute: "compute",
  Download: "download",
  Skipped: "skipped"
};
var TILE_FAILURE_KINDS = [
  "send_refused",
  "host_refused",
  "rate_limited",
  "payment_required",
  "uncertain",
  "server_failed",
  "download_failed",
  "timeout"
];

// src/area/grid-merge.ts
function failure(tileId, row, col, error, phase, exception, job) {
  return {
    tileId,
    row,
    col,
    error,
    phase,
    ...exception === void 0 ? {} : { exception },
    ...job?.failureKind === void 0 ? {} : { kind: job.failureKind },
    ...job?.failureStatus === void 0 ? {} : { status: job.failureStatus }
  };
}
function checkGridSchedule(schedule2) {
  if (schedule2.surfaceFields === true) {
    throw new Error("Grid merge does not apply to a surface schedule; call mergeSurfaceAreaJobs");
  }
  if (schedule2.geometryProbeUncertain === true) {
    throw new Error("Area run contains an uncertain geometry capability probe");
  }
  if ((schedule2.invalidReferenceSubmissions?.length ?? 0) > 0 || [...schedule2.jobs.values()].some((job) => job.invalidReference === true)) {
    throw new Error("Area run contains an invalid geometry-reference acceptance");
  }
}
function completedJobs(schedule2, other = () => {
}) {
  return [...schedule2.jobs.values()].filter((job) => {
    if (job.status === "completed" && job.jobId) return true;
    other(job);
    return false;
  });
}
var GridMerge = class {
  constructor(frame, options = {}) {
    this.frame = frame;
    this.options = options;
    const strategy = options.strategy ?? "default";
    if (strategy !== "default" && frame.analysisType !== "wind-speed") {
      throw new Error(`strategy=${JSON.stringify(strategy)} is only valid for wind-speed analyses`);
    }
    if (strategy !== "default" && options.windDirectionDeg === void 0) {
      throw new Error("windDirectionDeg is required");
    }
  }
  merger;
  /** Downloaded tiles that give no grid values, by tile id. */
  lost = /* @__PURE__ */ new Map();
  /** A run error (numeric and categorical tiles mixed): kept, and thrown by `finish`. */
  runError;
  /** Freed: a late download (after a timeout) is dropped, never a new canvas. */
  freed = false;
  /** Merge one tile archive; the archive is not kept. Resolves with why the tile is not usable. */
  push(job, archive) {
    if (this.runError !== void 0 || this.freed) return Promise.resolve(void 0);
    return decodeInTurn({ grid: this, job, archive }).then((reason2) => reason2, (error) => {
      this.runError ??= error;
      return void 0;
    });
  }
  /** Place the tiles `at` of `tiles` (one batch of `decodeInTurn`); a reason per item into `out`. */
  place(tiles, at, items, out) {
    if (this.runError !== void 0 || this.freed) return;
    try {
      this.merger ??= newAreaGridMerger(
        this.frame,
        this.options.strategy ?? "default",
        this.options.windDirectionDeg,
        this.options.block
      );
      const reasons = this.merger.pushMany(
        tiles,
        Uint32Array.from(at),
        Uint32Array.from(at, (i) => items[i].job.row),
        Uint32Array.from(at, (i) => items[i].job.col)
      );
      for (const [k, i] of at.entries()) {
        const job = items[i].job;
        const reason2 = reasons[k];
        if (reason2 !== void 0 && reason2 !== null) {
          this.lost.set(job.tileId, { error: `result is not a usable grid: ${reason2}` });
          out[i] = String(reason2);
        } else {
          this.lost.delete(job.tileId);
        }
      }
    } catch (error) {
      this.runError = error;
    }
  }
  /** A tile whose download failed; a reason `push` already gave stays. */
  lose(job, error) {
    if (this.lost.has(job.tileId)) return;
    const exception = throwable(error);
    this.lost.set(job.tileId, { error: `download failed: ${exception.message}`, exception });
  }
  /**
   * The merged grid of `schedule`, after each completed tile was pushed or lost.
   * The caller ran `checkGridSchedule(schedule)` first.
   * @throws {Error} when any tile failed, was skipped or could not be downloaded.
   */
  finish(schedule2, logger, started) {
    if (this.runError !== void 0) throw throwable(this.runError);
    const failedJobs = [];
    const skippedJobs = [];
    const failedTiles = [];
    const seen = /* @__PURE__ */ new Set();
    const addFailure = (item) => {
      if (!seen.has(item.tileId)) {
        seen.add(item.tileId);
        failedTiles.push(item);
      }
    };
    for (const tileId of schedule2.failedSubmissions) {
      const job = schedule2.jobs.get(tileId);
      addFailure(failure(
        tileId,
        job?.row ?? -1,
        job?.col ?? -1,
        job?.error ?? "job submission failed",
        TileFailurePhase.Submit,
        void 0,
        job
      ));
    }
    for (const tileId of schedule2.uncertainSubmissions ?? []) {
      const job = schedule2.jobs.get(tileId);
      if (job?.status === "completed" && job.jobId) continue;
      skippedJobs.push(tileId);
      addFailure(failure(
        tileId,
        job?.row ?? -1,
        job?.col ?? -1,
        "job submission acceptance is unknown",
        TileFailurePhase.Skipped,
        void 0,
        job
      ));
    }
    const complete = completedJobs(schedule2, (job) => {
      if (job.status === "failed") {
        const item = failure(
          job.tileId,
          job.row,
          job.col,
          job.error ?? "job failed",
          TileFailurePhase.Compute,
          void 0,
          job
        );
        failedJobs.push(item);
        addFailure(item);
      } else {
        skippedJobs.push(job.tileId);
        addFailure(failure(
          job.tileId,
          job.row,
          job.col,
          "job did not reach a terminal state",
          TileFailurePhase.Skipped
        ));
      }
    });
    const executionTime = () => (performance.now() - started) / 1e3;
    if (complete.length === 0) {
      if (failedTiles.length > 0) throw incomplete(schedule2, failedTiles);
      return {
        mergedGrid: new Float32Array(0),
        valueDtype: "f32",
        valueDivisor: 1,
        gridShape: [0, 0],
        failedJobs,
        skippedJobs,
        failedTiles,
        executionTime: executionTime()
      };
    }
    for (const job of complete) {
      const lost = this.lost.get(job.tileId);
      if (lost === void 0) continue;
      skippedJobs.push(job.tileId);
      logger.warn({
        event: "area_tile_download_failed",
        tileId: job.tileId,
        row: job.row,
        col: job.col,
        jobId: job.jobId,
        error: lost.error
      });
      addFailure(failure(job.tileId, job.row, job.col, lost.error, TileFailurePhase.Download, lost.exception, job));
    }
    if (failedTiles.length > 0) throw incomplete(schedule2, failedTiles);
    return {
      ...finishAreaGrid(this.merger),
      failedJobs,
      skippedJobs,
      failedTiles,
      executionTime: executionTime()
    };
  }
  free() {
    this.freed = true;
    this.merger?.free();
    this.merger = void 0;
  }
};
var decodeInTurn = perTurn(async (items) => {
  const core2 = requireCore();
  const tiles = await poolCall(
    () => core2.decodeGridTilesStart(items.map((item) => item.archive)),
    (task) => core2.decodeGridTilesEnd(task)
  );
  try {
    const byGrid = /* @__PURE__ */ new Map();
    for (const [i, item] of items.entries()) {
      const at = byGrid.get(item.grid);
      if (at === void 0) byGrid.set(item.grid, [i]);
      else at.push(i);
    }
    const out = new Array(items.length).fill(void 0);
    for (const [grid, at] of byGrid) grid.place(tiles, at, items, out);
    return out;
  } finally {
    tiles.free();
  }
}, () => 16 * coreThreads());

// src/area/merge-surface.ts
async function mergeSurfaceAreaJobs(jobsService, schedule2, options = {}, waitS) {
  if (schedule2.surfaceFields !== true) throw new Error("Surface merge requires a surface schedule");
  if (schedule2.geometryProbeUncertain === true) {
    throw new Error("Area run contains an uncertain geometry capability probe");
  }
  if ((schedule2.invalidReferenceSubmissions?.length ?? 0) > 0 || [...schedule2.jobs.values()].some((job) => job.invalidReference === true)) {
    throw new Error("Area run contains an invalid geometry-reference acceptance");
  }
  if (schedule2.failedSubmissions.length > 0) {
    throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify([...schedule2.failedSubmissions].sort())}`);
  }
  const positions = new Map(schedule2.tilePositions.map((position) => [position.tileId, position]));
  const surface = new SurfaceFeed(jobsService, schedule2.analysisType, (key) => positions.get(key));
  try {
    return await collectAndJoin(jobsService, schedule2, surface, options, waitS);
  } finally {
    surface.free();
  }
}
async function collectAndJoin(jobsService, schedule2, surface, options, waitS) {
  const { facts } = await collectOnEngine(jobsService, schedule2.jobs, { surface }, {
    ...waitS === void 0 ? { goal: "available" } : { goal: "results", timeoutS: waitS },
    ...options.signal === void 0 ? {} : { signal: options.signal },
    ...options.known === void 0 ? {} : { known: options.known }
  });
  const recovered = (tileId) => {
    const job = schedule2.jobs.get(tileId);
    return job?.status === "completed" && Boolean(job.jobId);
  };
  const missing = (schedule2.uncertainSubmissions ?? []).filter((tileId) => !recovered(tileId));
  if (missing.length > 0) {
    throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify(missing.sort())}`);
  }
  if (schedule2.jobs.size === 0) return emptySurfaceColumns();
  const incomplete2 = [...schedule2.jobs.values()].filter((job) => job.status !== "completed" || !job.jobId);
  if (incomplete2.length > 0) {
    throw new Error(`Cannot merge surface results: jobs not succeeded: ${JSON.stringify(incomplete2.map((job) => job.jobId ?? job.tileId))}`);
  }
  if (facts.lost.length > 0) {
    throw new Error(`Cannot merge surface results: download failed for ${[...facts.lost].sort()[0]}`);
  }
  return await surface.finish(schedule2, options.logger ?? consoleLogger);
}
var SurfaceFeed = class {
  constructor(service, analysisType2, tileOf) {
    this.analysisType = analysisType2;
    this.tileOf = tileOf;
    this.own = service.captures === void 0;
    this.captures = service.captures ?? new FacadeCaptures();
  }
  stream;
  asked = /* @__PURE__ */ new Map();
  captures;
  own;
  freed = false;
  /** Decode job `jobId` of key `key` with the other downloads of this turn. Resolves with why it is not usable, or `undefined`. */
  push(jobId, key, archive) {
    if (this.asked.has(jobId)) return Promise.resolve(void 0);
    if (this.tileOf(key) === void 0) throw new Error(`surface entry ${key} has no tile position`);
    return decodeSurfaceInTurn({ feed: this, jobId, key, archive });
  }
  /**
   * Keep the jobs `at` of `jobs` (one batch of `decodeSurfaceInTurn`); a reason per item into
   * `out`. Their layouts are built on the pool while this thread goes on.
   */
  async place(jobs, at, items, out) {
    if (this.freed) return;
    const core2 = requireCore("mergeSurfaceAreaJobs");
    const stream = this.stream ??= new core2.SurfaceJoinStream();
    const fresh = at.filter((i, k) => !this.asked.has(items[i].jobId) && at.findIndex((j) => items[j].jobId === items[i].jobId) === k);
    const anchors = new Float64Array(2 * fresh.length);
    for (const [k, i] of fresh.entries()) {
      const tile = this.tileOf(items[i].key);
      const [swX, swY] = core2.tileSwOffset(tile.row, tile.col, this.analysisType);
      anchors[2 * k] = swX;
      anchors[2 * k + 1] = swY;
    }
    const jobIds2 = fresh.map((i) => items[i].jobId);
    const asked = this.captures.wantsCellTris(jobIds2);
    for (const id of jobIds2) this.asked.set(id, asked);
    const reasons = await poolCall(
      () => stream.pushManyStart(
        jobs,
        Uint32Array.from(fresh),
        fresh.map((i) => items[i].key),
        anchors,
        this.captures.store,
        jobIds2,
        asked
      ),
      (task) => this.stream === stream ? stream.pushManyEnd(task) : []
    );
    for (const [k, i] of fresh.entries()) {
      const reason2 = reasons[k];
      if (reason2 !== void 0 && reason2 !== null) {
        this.asked.delete(items[i].jobId);
        out[i] = String(reason2);
      }
    }
  }
  /** Join every pushed job of `schedule` into its columns, on the pool while this thread goes on. */
  async finish(schedule2, logger) {
    if (schedule2.jobs.size === 0) return emptySurfaceColumns();
    const started = performance.now();
    for (const [entryId, job] of schedule2.jobs) {
      if (job.jobId !== void 0 && this.captures.lostCapture(job.jobId)) {
        logger.warn({
          event: "facade_capture_missing",
          tileId: entryId,
          jobId: job.jobId,
          reason: "the capture was not kept after the job was accepted; its surfaces have no outline, and surfaceRenderBuffers refuses them"
        });
      }
    }
    try {
      const stream = this.stream;
      const joined = await poolCall(
        () => stream.finishStart(this.captures.store, [...this.asked.values()].some(Boolean)),
        (task) => stream.finishEnd(task)
      );
      this.captures.forgetSchedule(schedule2);
      report(joined, joined.jobIds, logger, started);
      return surfaceColumnsFromJoin(joined);
    } finally {
      this.free();
    }
  }
  /** Free the kept jobs (a feed that is not finished). */
  free() {
    this.freed = true;
    this.stream?.free();
    this.stream = void 0;
    if (this.own) this.captures.free();
  }
};
function report(joined, jobIds2, logger, started) {
  const elapsedMs = Math.round(performance.now() - started);
  const host = (job) => joined.jobOrder[job];
  const fell = /* @__PURE__ */ new Set();
  for (const { job, reason: reason2, detail } of joined.fallbacks) {
    fell.add(job);
    logger.warn({
      event: "facade_synthesis",
      outcome: "fell_back",
      reason: reason2,
      jobId: jobIds2[host(job)],
      elapsedMs,
      ...detail === void 0 ? {} : { detail }
    });
  }
  const table = joined.triangles;
  if (table === void 0) return;
  for (let job = 0; job < jobIds2.length; job += 1) {
    if (fell.has(job) || table.groupEngaged[job] !== 1) continue;
    logger.info({
      event: "facade_synthesis",
      outcome: "engaged",
      jobId: jobIds2[host(job)],
      surfaces: table.groupSurfaces[job + 1] - table.groupSurfaces[job],
      elapsedMs
    });
  }
}
var decodeSurfaceInTurn = perTurn(async (items) => {
  const limits = RESULT_DECODE_LIMITS;
  const core2 = requireCore("mergeSurfaceAreaJobs");
  const jobs = await poolCall(() => core2.decodeSurfaceJobsStart(
    items.map((item) => item.archive),
    BigInt(limits.maxTotalBytes),
    limits.maxMetadataBytes,
    BigInt(limits.maxCells),
    BigInt(limits.maxTriangleValues)
  ), (task) => core2.decodeSurfaceJobsEnd(task));
  try {
    const byFeed = /* @__PURE__ */ new Map();
    for (const [i, item] of items.entries()) {
      const at = byFeed.get(item.feed);
      if (at === void 0) byFeed.set(item.feed, [i]);
      else at.push(i);
    }
    const out = new Array(items.length).fill(void 0);
    await Promise.all([...byFeed].map(async ([feed2, at]) => {
      try {
        await feed2.place(jobs, at, items, out);
      } catch (error) {
        for (const i of at) out[i] = error instanceof Error ? error.message : String(error);
      }
    }));
    return out;
  } finally {
    jobs.free();
  }
}, () => 16 * coreThreads());

// src/area/merge.ts
async function mergeAreaJobs(jobsService, schedule2, options = {}, waitS) {
  const started = performance.now();
  checkGridSchedule(schedule2);
  const grid = new GridMerge(schedule2, options);
  try {
    const { facts } = await collectOnEngine(jobsService, schedule2.jobs, { grid }, {
      ...waitS === void 0 ? { goal: "available" } : { goal: "results", timeoutS: waitS },
      ...options.signal === void 0 ? {} : { signal: options.signal },
      ...options.known === void 0 ? {} : { known: options.known }
    });
    for (const key of facts.lost) grid.lose(schedule2.jobs.get(key), new Error("result download failed"));
    const logger = options.logger ?? consoleLogger;
    return grid.finish(schedule2, logger, started);
  } finally {
    grid.free();
  }
}
function waitAndMerge(jobsService, schedule2, options) {
  const waitS = options.areaTimeout ?? 3600;
  return schedule2.surfaceFields === true ? mergeSurfaceAreaJobs(jobsService, schedule2, options, waitS) : mergeAreaJobs(jobsService, schedule2, options, waitS);
}

// src/results/surface.ts
function parseSurfaceResult(document2, options = {}) {
  const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document2));
  return parseSurfaceRecord(raw, options);
}

// src/results/surface-columns-bytes.ts
function surfaceColumnsToBytes(columns, options = {}) {
  return requireCore().surfaceColumnsToBytes(columns, options.layoutKey);
}
function surfaceColumnsFromBytes(bytes) {
  const joined = requireCore().surfaceColumnsFromBytes(bytes);
  const columns = surfaceColumnsFromJoin(joined);
  return joined.layoutKey === void 0 ? { columns } : { columns, layoutKey: joined.layoutKey };
}

// src/results/surface-render.ts
function surfaceRenderBuffers(columns, options = {}) {
  return options.layout === void 0 ? requireCore("surfaceRenderBuffers").surfaceRenderBuffers(columns) : options.layout._surfaceRenderBuffers(columns);
}

// src/area/stream.ts
var DEFAULT_AREA_TIMEOUT_S = 3600;
function analysisType(input) {
  return String(input.analysisType ?? input["analysis-type"]);
}
function scheduleFromFacts(an, facts, options) {
  recordsFromFacts(an, facts);
  return freezeAreaSchedule({
    ...scheduleFromPlan(
      an.plan,
      an.jobs,
      facts.failed,
      facts.uncertain,
      [],
      facts.payment_stopped ? 402 : null,
      options
    ),
    runId: facts.run_id,
    ...Object.keys(facts.attempts).length === 0 ? {} : { attempts: facts.attempts }
  });
}
async function finish(service, an, outcome, facts, options) {
  an.done = true;
  const { index: index2, analysisType: analysisType2 } = an;
  let schedule2;
  try {
    const made = scheduleFromFacts(an, facts, options);
    schedule2 = made;
    const failure2 = finalError(
      outcome,
      facts,
      analysisType2,
      options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S,
      () => computeAreaState(made)
    );
    if (failure2 !== void 0) throw failure2;
    if (an.grid === void 0) {
      return { index: index2, analysisType: analysisType2, result: await an.surface.finish(made, options.logger) };
    }
    checkGridSchedule(made);
    return { index: index2, analysisType: analysisType2, result: an.grid.finish(made, options.logger, an.started) };
  } catch (error) {
    return { index: index2, analysisType: analysisType2, error: throwable(error) };
  } finally {
    const tidy = (step2) => {
      try {
        step2();
      } catch {
      }
    };
    tidy(() => service.captures?.forgetSchedule(schedule2 ?? { jobs: an.jobs }));
    tidy(() => an.grid?.free());
    tidy(() => an.surface?.free());
    for (const entry of an.entries.values()) tidy(() => service.releasePreflight?.(entry.prepared));
    an.entries.clear();
    an.plan = { ...an.plan, entries: [] };
  }
}
function tilesOf(plan) {
  const tiles = new Map(plan.entries.map((e) => [e.key, { row: e.row, col: e.col }]));
  return (key) => tiles.get(key);
}
async function* streamArea(service, inputs, polygon, options = {}) {
  if (options.retryFrom !== void 0) throw new TypeError("runAreaStream takes no retryFrom; use runArea");
  const how = { ...options, logger: options.logger ?? consoleLogger };
  const controller = new AbortController();
  const outer = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted === true) outer();
  options.signal?.addEventListener("abort", outer, { once: true });
  const signal = controller.signal;
  const ready = [];
  const analyses = [];
  const memo2 = siteKeyMemo();
  const facadeSites = /* @__PURE__ */ new Map();
  for (const [index2, input] of inputs.entries()) {
    try {
      const effective = effectiveOptions({ ...options, signal }, analysisType(input));
      const plan = await planAreaSubmission(service, input, polygon, effective, memo2, facadeSites);
      if (areaTransport(effective, plan.analysisType) === "binary" && plan.entries.length > 0 && service.binaryCapability !== void 0) {
        checkBinaryRoute(plan.analysisType, await service.binaryCapability(signal));
      }
      analyses.push({
        index: index2,
        analysisType: analysisType(input),
        plan,
        jobs: /* @__PURE__ */ new Map(),
        entries: new Map(plan.entries.map((e) => [e.key, e])),
        started: performance.now(),
        capture: (entry) => facadeCaptureFor(service, plan, entry),
        remember: (capture, jobId) => rememberFacadeInputs(service, capture, jobId, plan.localCellTris === true),
        ...plan.surfaceFields ? { surface: new SurfaceFeed(service, plan.analysisType, tilesOf(plan)) } : { grid: new GridMerge(plan, options) }
      });
    } catch (error) {
      ready.push({ index: index2, analysisType: analysisType(input), error: throwable(error) });
    }
  }
  const release4 = shareFacadeSites(facadeSites);
  const binary = analyses.some((an) => an.plan.entries.some((e) => e.prepared.transport === "binary"));
  const driver = new EngineDriver({
    retries: options.retries ?? 1,
    area_timeout_us: Math.round((options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S) * 1e6),
    ...await batchConfig(service, binary, signal)
  });
  const io = {
    service,
    analyses,
    byJob: /* @__PURE__ */ new Map(),
    logger: how.logger,
    ...options.onAccepted === void 0 ? {} : { onAccepted: options.onAccepted }
  };
  driver.onAccepted = (act) => acceptedAction(io, act);
  let wakeConsumer = () => {
  };
  const finishing = [];
  const progress = options.onProgress === void 0 ? void 0 : () => {
    for (const [a, an] of analyses.entries()) {
      if (an.done === true) continue;
      try {
        options.onProgress(computeAreaState(scheduleFromFacts(an, driver.facts(a), how)));
      } catch {
      }
    }
  };
  const loop = driver.run(
    analyses.map((an) => ({ keys: an.plan.entries.map((e) => e.key), run_id: an.plan.runId })),
    signal,
    (act, own2) => runAction(io, act, own2),
    (act) => {
      const an = analyses[act.a];
      finishing.push(finish(service, an, act.outcome, act.facts, how).then((item) => {
        ready.push(item);
        wakeConsumer();
      }, (error) => {
        ready.push({ index: an.index, analysisType: an.analysisType, error: throwable(error) });
        wakeConsumer();
      }));
    },
    progress
  ).catch((error) => {
    controller.abort(error);
  }).finally(async () => {
    try {
      await Promise.all(finishing);
      freePreparedCaptures(io);
    } finally {
      endUnfinished();
    }
  });
  function endUnfinished() {
    for (const an of analyses) {
      if (an.done === true) continue;
      ready.push({
        index: an.index,
        analysisType: an.analysisType,
        error: throwable(signal.reason ?? new Error("run stopped"))
      });
      try {
        service.captures?.forgetSchedule({ jobs: an.jobs });
        an.grid?.free();
        for (const entry of an.entries.values()) service.releasePreflight?.(entry.prepared);
      } catch {
      }
    }
    wakeConsumer();
  }
  try {
    for (let left = inputs.length; left > 0; left -= 1) {
      while (ready.length === 0) await new Promise((resolve) => {
        wakeConsumer = resolve;
      });
      const item = ready.shift();
      const a = analyses.findIndex((an) => an.index === item.index);
      if (a >= 0) driver.push({ kind: "taken", a });
      yield item;
    }
  } finally {
    controller.abort(new DOMException("result stream closed", "AbortError"));
    options.signal?.removeEventListener("abort", outer);
    await loop;
    release4();
  }
}
async function allResults(stream, count2) {
  const results = new Array(count2);
  const errors = /* @__PURE__ */ new Map();
  for await (const item of stream) {
    if (item.error !== void 0) errors.set(item.index, item.error);
    else results[item.index] = item.result;
  }
  if (errors.size > 0) throw errors.get(Math.min(...errors.keys()));
  return results;
}

// src/parts/result-format.ts
var DEFAULT_DAYLIGHT_RESULT_FORMAT = "irbf";
var DAYLIGHT_POINTS_FAMILY = "daylight-points";
function resolveResultFormat(value) {
  return value ?? DEFAULT_DAYLIGHT_RESULT_FORMAT;
}
function binaryResultSupported(capability2, analysisType2) {
  return capability2.models[analysisType2]?.resultFamilies.includes(DAYLIGHT_POINTS_FAMILY) === true;
}

// src/parts/interior-binary.ts
var decoder5 = new TextDecoder("utf-8", { fatal: true });
function interiorRouteSupported(capability2, analysisType2, wanted = "json") {
  const model = capability2.models[analysisType2];
  return model !== void 0 && (model.resultFamilies.includes("json") || wanted === "irbf" && binaryResultSupported(capability2, analysisType2));
}
function encodeInteriorArtifact(bytes, analysisType2, limits) {
  try {
    const core2 = requireCore();
    const encoded = core2.interiorArtifact(
      bytes,
      analysisType2,
      BigInt(limits.maxGeometryBytes),
      limits.maxMetadataBytes,
      BigInt(limits.maxMeshes),
      BigInt(limits.maxInstances)
    );
    return {
      artifact: {
        archive: encoded.archive,
        artifactDigest: encoded.artifactDigest,
        geometryContentDigest: encoded.contentDigest,
        encoding: encoded.encoding
      },
      control: encoded.control
    };
  } catch {
    return void 0;
  }
}
function interiorPartBinary(shared2, limits, part) {
  const bytes = requireCore().daylightPartBody(shared2.control, JSON.stringify(part));
  const control = JSON.parse(decoder5.decode(bytes));
  return { artifact: shared2.artifact, control, limits };
}
async function planInteriorRoute(service, analysisType2, bytes, options, logger, wanted = "json") {
  if (options.transport !== void 0 || service.binaryCapability === void 0) return void 0;
  let capability2;
  try {
    capability2 = await service.binaryCapability(options.signal);
  } catch (error) {
    logger.info({
      event: "analysis_parts_binary",
      outcome: "capability_unavailable",
      analysisType: analysisType2,
      error: error instanceof Error ? error.message : String(error)
    });
    return void 0;
  }
  if (!interiorRouteSupported(capability2, analysisType2, wanted)) return void 0;
  const shared2 = encodeInteriorArtifact(bytes, analysisType2, capability2.limits);
  if (shared2 === void 0) {
    logger.info({
      event: "analysis_parts_binary",
      outcome: "encode_refused",
      analysisType: analysisType2,
      message: "the request carries a field the interior frame cannot encode; parts are sent as JSON"
    });
    return void 0;
  }
  const resultFormat = wanted === "irbf" && binaryResultSupported(capability2, analysisType2) ? "irbf" : "json";
  return { shared: shared2, limits: capability2.limits, resultFormat };
}

// src/parts/plan.ts
var SPLIT_ANALYSES = /* @__PURE__ */ new Set(["daylight-factor"]);
function splitsAnalysis(analysisType2) {
  return SPLIT_ANALYSES.has(analysisType2);
}
function checkMaxParts(value) {
  if (value === void 0) return;
  if (!Number.isSafeInteger(value) || value < 1) throw new TypeError("maxParts must be a positive integer");
}
function retryTarget(prior) {
  if (prior === void 0) return void 0;
  const target = JSON.parse(prior.plan).target;
  return typeof target === "number" ? target : void 0;
}
function planRequest(jobs, input, options, logger, target) {
  checkMaxParts(options.maxParts);
  const payload = prepareAnalysisPayload(input);
  const analysisType2 = String(payload["analysis-type"]);
  const prepared = jobs.prepareSubmission(analysisType2, payload, {
    ...options.webhookUrl === void 0 ? {} : { webhookUrl: options.webhookUrl },
    ...options.webhookEvents === void 0 ? {} : { webhookEvents: options.webhookEvents },
    ...options.transport === void 0 ? {} : { transport: options.transport }
  });
  if (!SPLIT_ANALYSES.has(analysisType2) || prepared.transport !== "json" || options.maxParts === 1) {
    const cellTris = input.emitCellTris === true || input["emit-cell-tris"] === true;
    return { analysisType: analysisType2, prepared, ...cellTris ? { cellTris: true } : {} };
  }
  const bytes = preparedJsonBytes(prepared);
  const one = { ...prepared, json: () => bytes };
  const effectiveTarget = target ?? retryTarget(options.retryFrom);
  let planText;
  try {
    planText = requireCore().daylightParts(bytes, effectiveTarget);
  } catch (error) {
    logger.warn({
      event: "analysis_parts",
      outcome: "unplanned",
      analysisType: analysisType2,
      message: "the request is sent as one job",
      error: error instanceof Error ? error.message : String(error)
    });
    return { analysisType: analysisType2, prepared: one, bytes };
  }
  const plan = JSON.parse(planText);
  for (const note of plan.notes) logger.warn({ event: "analysis_parts", analysisType: analysisType2, note });
  if (options.maxParts !== void 0 && plan.parts.length > options.maxParts) {
    throw new RangeError(
      `the ${analysisType2} request plans ${plan.parts.length} parts (${plan.total_sensors} sensors), more than maxParts ${options.maxParts}; nothing was sent. Pass maxParts: 1 to send one job.`
    );
  }
  return { analysisType: analysisType2, prepared: one, bytes, plan, planText };
}
function partEntries(request, keys, interior) {
  const { plan, bytes, prepared } = request;
  if (plan === void 0 || bytes === void 0) throw new Error("the request has no parts plan");
  const entries3 = [];
  plan.parts.forEach((part, index2) => {
    if (keys !== void 0 && !keys.has(part.key)) return;
    if (interior !== void 0) {
      entries3.push({
        key: part.key,
        row: 0,
        col: index2,
        prepared: {
          ...prepared,
          transport: "binary",
          interiorResultFormat: interior.resultFormat,
          interiorBinary: interiorPartBinary(interior.shared, interior.limits, part)
        }
      });
      return;
    }
    const text = JSON.stringify(part);
    entries3.push({
      key: part.key,
      row: 0,
      col: index2,
      prepared: { ...prepared, json: () => requireCore().daylightPartBody(bytes, text) }
    });
  });
  return entries3;
}

// src/parts/submit.ts
function retryableParts(schedule2) {
  const uncertain = new Set(schedule2.uncertainSubmissions);
  return schedule2.partKeys.filter((key) => {
    if (uncertain.has(key)) return false;
    const job = schedule2.jobs.get(key);
    return job === void 0 || job.status === "failed" || job.status === "skipped" && !job.jobId;
  });
}
function checkRetry(prior, request, digest) {
  if (digest === void 0 || prior.requestDigest === void 0) {
    throw new Error("retryFrom needs a SHA-256 digest of the request, and this runtime or the saved schedule has none; start a fresh run");
  }
  if (prior.analysisType !== request.analysisType || prior.requestDigest !== digest) {
    throw new Error("retryFrom is a run of a different request; retry with the same request or start a fresh run");
  }
  if (prior.plan !== request.planText) {
    throw new Error("retryFrom plan mismatch: the kernel plans this request differently now; start a fresh run");
  }
}
async function submitParts(service, request, options = {}, logger = silentLogger) {
  const { plan, planText, bytes } = request;
  if (plan === void 0 || planText === void 0 || bytes === void 0) {
    throw new Error("the request has no parts plan");
  }
  const hex = await sha256Hex(bytes);
  const requestDigest = hex === void 0 ? void 0 : `sha256:${hex}`;
  const prior = options.retryFrom;
  if (prior !== void 0) checkRetry(prior, request, requestDigest);
  const interior = plan.parts.length > 1 ? await planInteriorRoute(
    service,
    request.analysisType,
    bytes,
    options,
    logger,
    resolveResultFormat(options.resultFormat)
  ) : void 0;
  const entries3 = partEntries(
    request,
    prior === void 0 ? void 0 : new Set(retryableParts(prior)),
    interior
  );
  const outcome = await submitOnEngine(service, entries3, {
    runId: freshRunId(),
    ...options.signal === void 0 ? {} : { signal: options.signal },
    ...options.onAccepted === void 0 ? {} : { onAccepted: options.onAccepted },
    ...prior === void 0 ? {} : { priorJobs: prior.jobs, priorUncertain: prior.uncertainSubmissions }
  });
  const schedule2 = Object.freeze({
    analysisType: request.analysisType,
    ...requestDigest === void 0 ? {} : { requestDigest },
    plan: planText,
    partKeys: Object.freeze(plan.parts.map((part) => part.key)),
    jobs: outcome.jobs,
    failedSubmissions: Object.freeze(outcome.failedSubmissions),
    uncertainSubmissions: Object.freeze(outcome.uncertainSubmissions),
    submissionAbortStatus: outcome.submissionAbortStatus,
    resultFormat: resolveResultFormat(options.resultFormat)
  });
  try {
    options.onProgress?.(computeAreaState(schedule2));
  } catch {
  }
  return schedule2;
}

// src/parts/types.ts
var AnalysisPartsError = class extends Error {
  /**
   * @param message - What went wrong.
   * @param failedParts - Parts a `retryFrom` sends again; empty when every part has a result.
   * @param schedule - The run, with its accepted jobs.
   * @param downloadFailedParts - Parts whose result is on the server but did not download:
   * `mergeParts(schedule)` (or a `retryFrom`, which then sends nothing) downloads them again.
   * @param options - Standard error options, such as `cause`.
   */
  constructor(message, failedParts, schedule2, downloadFailedParts = [], options) {
    super(message, options);
    this.failedParts = failedParts;
    this.schedule = schedule2;
    this.downloadFailedParts = downloadFailedParts;
  }
  name = "AnalysisPartsError";
};

// src/parts/merge.ts
function framesOf(core2, parts) {
  const frames = [];
  for (const part of parts) {
    if (isDaylightFrame(part)) {
      frames.push(part);
      continue;
    }
    try {
      frames.push(core2.daylightFrameFromJson(part));
    } catch {
      return void 0;
    }
  }
  return frames;
}
function mergeFormat(schedule2, options) {
  return resolveResultFormat(options.resultFormat ?? schedule2.resultFormat);
}
function join3(plan, parts, format, logger) {
  const core2 = requireCore();
  const jsonJoin = () => core2.daylightMerge(plan, parts.map((p) => isDaylightFrame(p) ? core2.daylightJsonFromFrame(p) : p));
  if (format === "json") return jsonJoin();
  const frames = framesOf(core2, parts);
  if (frames === void 0) return jsonJoin();
  try {
    return core2.daylightMergeBinary(plan, frames);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("65 535 rooms")) throw error;
    logger?.warn({
      event: "daylight_result",
      outcome: "json",
      message: "the merged result has more than 65 535 rooms; it is returned as JSON"
    });
    return jsonJoin();
  }
}
function missingParts(schedule2) {
  const retry = new Set(retryableParts(schedule2));
  return schedule2.partKeys.filter((key) => {
    if (retry.has(key)) return true;
    const job = schedule2.jobs.get(key);
    return job === void 0 || !job.jobId;
  });
}
async function mergePartsDocument(service, schedule2, options = {}) {
  const archives = /* @__PURE__ */ new Map();
  const { facts } = await collectOnEngine(service, schedule2.jobs, { archives }, {
    goal: "available",
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  return joinParts2(schedule2, archives, facts.lost, options);
}
function joinParts2(schedule2, archives, lost, options = {}) {
  const missing = missingParts(schedule2);
  if (missing.length > 0) {
    const uncertain = missing.filter((key) => schedule2.uncertainSubmissions.includes(key));
    throw new AnalysisPartsError(
      `${missing.length} of ${schedule2.partKeys.length} ${schedule2.analysisType} parts have no result: ${JSON.stringify(missing)}` + (uncertain.length === 0 ? "" : `; outcome unknown, never resent: ${JSON.stringify(uncertain)}`) + ". Pass this error's schedule as retryFrom to send the failed parts again.",
      missing,
      schedule2
    );
  }
  const failed = schedule2.partKeys.filter((key) => lost.includes(key));
  if (failed.length > 0) {
    throw new AnalysisPartsError(
      `Cannot join the parts: download failed for ${JSON.stringify(failed)}; call mergeParts with this error's schedule to download them again.`,
      [],
      schedule2,
      failed
    );
  }
  const open = schedule2.partKeys.filter((key) => schedule2.jobs.get(key)?.status !== "completed");
  if (open.length > 0) {
    throw new AnalysisPartsError(
      `Cannot join the parts: not finished: ${JSON.stringify(open)}; merge this error's schedule again later.`,
      [],
      schedule2
    );
  }
  const documents = schedule2.partKeys.map((key) => decompressResultArchive(archives.get(schedule2.jobs.get(key).jobId)));
  if (!splitsAnalysis(schedule2.analysisType)) return requireCore().daylightMerge(schedule2.plan, documents);
  return join3(schedule2.plan, documents, mergeFormat(schedule2, options), options.logger);
}

// src/parts/cell-tris.ts
var FALLBACK_KEY = "cell-tris-fallback";
function cellTrisCapture(request) {
  if (request.cellTris !== true) return void 0;
  return requireCore().surfaceJobCapture(preparedJsonBytes(request.prepared)) ?? void 0;
}
function attachCellTris(value, archive, jobId, capture, logger) {
  const surfaces2 = value?.surfaces;
  if (surfaces2 === void 0) return;
  const core2 = requireCore();
  const store = new core2.CaptureStore();
  let out;
  try {
    store.remember(jobId, capture);
    const limits = RESULT_DECODE_LIMITS;
    out = core2.surfaceJobTriangles(
      archive,
      store,
      jobId,
      BigInt(limits.maxTotalBytes),
      limits.maxMetadataBytes,
      BigInt(limits.maxCells),
      BigInt(limits.maxTriangleValues)
    );
  } finally {
    store.free();
  }
  if (out.fallbackReasons.length > 0) {
    value[FALLBACK_KEY] = [...out.fallbackReasons];
    logger.warn({ event: "cell_tris", outcome: "fell_back", jobId, reasons: out.fallbackReasons });
    return;
  }
  const tri = out.triangleOffsets;
  if (tri.length === 0) return;
  out.ids.forEach((id, row) => {
    const [first, last] = [out.cellOffsets[row], out.cellOffsets[row + 1]];
    const base = tri[first] * 9;
    const offsets = new Uint32Array(last - first + 1);
    for (let cell = first; cell <= last; cell += 1) offsets[cell - first] = tri[cell] * 9 - base;
    const entry = surfaces2[id];
    entry.cellTris = out.positions.subarray(base, tri[last] * 9);
    entry.cellTrisOffsets = offsets;
  });
}

// src/parts/run.ts
var PartsTimeoutError = class extends Error {
  /**
   * @param message - What timed out and how many parts had finished.
   * @param schedule - The submitted parts run, with its accepted jobs.
   */
  constructor(message, schedule2) {
    super(message);
    this.schedule = schedule2;
  }
  name = "PartsTimeoutError";
};
function logWarnings(value, analysisType2, logger) {
  if (value === null || typeof value !== "object") return;
  if (value instanceof DaylightFactorResult) {
    if (value.warnings.length > 0) logger.warn({ event: "analysis_warnings", analysisType: analysisType2, warnings: value.warnings });
    return;
  }
  const warnings = value.warnings;
  if (!Array.isArray(warnings) || warnings.length === 0) return;
  logger.warn({ event: "analysis_warnings", analysisType: analysisType2, warnings });
}
function splits(request) {
  return request.plan !== void 0 && request.plan.parts.length > 1;
}
function daylightValue(document2, format, logger) {
  if (isDaylightFrame(document2)) {
    const result2 = new DaylightFactorResult(document2);
    return format === "irbf" ? result2 : result2.toJson();
  }
  if (format === "irbf") {
    try {
      const core2 = requireCore();
      return new DaylightFactorResult(core2.daylightFrameFromJson(document2));
    } catch (error) {
      logger.info({
        event: "daylight_result",
        outcome: "json",
        message: "the result has no exact binary frame",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document2));
}
async function runPlannedAndWait(jobs, logger, request, options = {}) {
  const timeoutS = options.timeout ?? requireCore().pollDefaultTimeoutSeconds();
  requireTimeout(timeoutS * 1e3);
  if (options.archive !== void 0) checkArchiveOptions(options.archive);
  if (!splits(request)) {
    if (options.retryFrom !== void 0) {
      throw new Error("retryFrom needs a request that plans into more than one part");
    }
    const signal = options.signal === void 0 ? {} : { signal: options.signal };
    const daylight = splitsAnalysis(request.analysisType);
    const format = resolveResultFormat(options.resultFormat);
    const capture = cellTrisCapture(request);
    const job = await jobs.submitPrepared(request.prepared, signal);
    const completed = await jobs.waitForCompletion(job.jobId, {
      ...signal,
      ...options.timeout === void 0 ? {} : { timeout: options.timeout },
      ...options.onPoll === void 0 ? {} : { onPoll: options.onPoll }
    });
    const download2 = await jobs.downloadResults(completed.jobId, { job: completed, ...signal });
    const archive = options.archive;
    if (!daylight) {
      const value2 = decompressResultValue(jobs, download2.content, archive === void 0 ? void 0 : { archive });
      if (capture !== void 0) attachCellTris(value2, download2.content, completed.jobId, capture, logger);
      return value2;
    }
    const value = daylightValue(decompressResultArchive(download2.content, archive), format, logger);
    logWarnings(value, request.analysisType, logger);
    return value;
  }
  const schedule2 = await submitParts(jobs, request, options, logger);
  try {
    return await waitAndJoin(jobs, logger, request, schedule2, timeoutS, options);
  } catch (error) {
    throw withSchedule(error, schedule2);
  }
}
function withSchedule(error, schedule2) {
  if (error !== null && typeof error === "object" && error.schedule === schedule2) {
    return error;
  }
  const message = error instanceof Error ? error.message : String(error);
  return new AnalysisPartsError(
    `${schedule2.analysisType} parts stopped after submission: ${message}. This error's schedule holds the accepted jobs: merge it again, or pass it as retryFrom.`,
    [],
    schedule2,
    [],
    { cause: error }
  );
}
async function waitAndJoin(jobs, logger, request, schedule2, timeoutS, options) {
  const archives = /* @__PURE__ */ new Map();
  const { facts, outcome } = await collectOnEngine(jobs, schedule2.jobs, { archives }, {
    goal: "results",
    timeoutS,
    ...options.signal === void 0 ? {} : { signal: options.signal },
    ...options.onProgress === void 0 ? {} : {
      onProgress: () => {
        try {
          options.onProgress(computeAreaState(schedule2));
        } catch {
        }
      }
    }
  });
  if (outcome === "timeout") {
    const last = computeAreaState(schedule2);
    throw new PartsTimeoutError(
      `${request.analysisType} parts timed out after ${timeoutS}s: ${last.completedCount}/${last.totalCount} completed, ${last.failedCount} failed`,
      schedule2
    );
  }
  const format = mergeFormat(schedule2, options);
  const document2 = joinParts2(schedule2, archives, facts.lost, { ...options, resultFormat: format, logger });
  const value = daylightValue(document2, format, logger);
  logWarnings(value, request.analysisType, logger);
  return value;
}
async function runAndWaitParts(jobs, logger, input, options = {}) {
  return runPlannedAndWait(jobs, logger, planRequest(jobs, input, options, logger), options);
}
async function runParts(jobs, logger, input, options = {}) {
  const request = planRequest(jobs, input, options, logger);
  if (!splits(request)) {
    throw new Error(`the ${request.analysisType} request is one job; submit it with run or analyses.execute`);
  }
  return submitParts(jobs, request, options, logger);
}
async function previewParts(jobs, billing2, logger, input, options = {}, target) {
  const { analysisType: analysisType2, plan } = planRequest(jobs, input, options, logger, target);
  const parts = plan === void 0 ? [] : plan.parts.map((part) => ({
    key: part.key,
    floorKeys: [...part.floor_keys],
    sensors: part.sensors
  }));
  const partCount = Math.max(1, parts.length);
  const priced = estimateRun(partCount, await billing2.quote(analysisType2));
  return {
    analysisType: analysisType2,
    partCount,
    totalSensors: plan?.total_sensors ?? 0,
    parts,
    tokensPerJob: priced.tokensPerJob,
    estimatedCostTokens: priced.estimatedCostTokens,
    pricingSource: priced.pricingSource,
    ...priced.pricingVersion === void 0 ? {} : { pricingVersion: priced.pricingVersion },
    ...plan?.unsplit_reason == null ? {} : { unsplitReason: plan.unsplit_reason },
    notes: plan?.notes ?? []
  };
}
async function mergePartsValue(jobs, logger, schedule2, options = {}) {
  const format = mergeFormat(schedule2, options);
  const document2 = await mergePartsDocument(jobs, schedule2, { ...options, resultFormat: format, logger });
  const value = splitsAnalysis(schedule2.analysisType) ? daylightValue(document2, format, logger) : parseResultDocument(document2).value;
  logWarnings(value, schedule2.analysisType, logger);
  return value;
}

// src/analysis-service.ts
var AnalysisService = class {
  /** @param jobs - The jobs service that sends the request. */
  constructor(jobs) {
    this.jobs = jobs;
  }
  /**
   * Submits a request that already uses the API's own keys; does not wait.
   * Returns the accepted `Job`, or rejects with a `TypeError` when the payload
   * is not an object or has no `"analysis-type"`.
   */
  execute(payload, options = {}) {
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      return Promise.reject(new TypeError("analysis payload must be an object"));
    }
    const analysisType2 = payload["analysis-type"];
    if (typeof analysisType2 !== "string" || analysisType2.length === 0) {
      return Promise.reject(new TypeError("analysis payload requires analysis-type"));
    }
    return this.jobs.submit(analysisType2, payload, options);
  }
};

// src/client-setup.ts
var DEFAULT_BASE_URL = "https://api.infrared.city/v2";
function envValue(env, name) {
  if (env?.[name] !== void 0) return env[name];
  return globalThis.process?.env?.[name];
}
function geometryReuseSetting(env) {
  const value = envValue(env, "INFRARED_GEOMETRY_REF_ENABLED");
  if (value === void 0 || value === "") return true;
  if (/^(1|true|yes|on)$/i.test(value)) return true;
  if (/^(0|false|no|off)$/i.test(value)) return false;
  throw new TypeError("INFRARED_GEOMETRY_REF_ENABLED must be a Boolean string");
}
function jobsServiceOptions(options, baseUrl, auth, logger, timeoutMs) {
  const downloadTimeoutMs = options.downloadTimeoutMs ?? options.downloadTimeout;
  const geometryReuseEnabled = geometryReuseSetting(options.env);
  return {
    baseUrl,
    auth,
    ...options.fetch === void 0 ? {} : { fetch: options.fetch },
    ...timeoutMs === void 0 ? {} : { timeoutMs },
    ...downloadTimeoutMs === void 0 ? {} : { downloadTimeoutMs },
    ...options.gatewayBaseUrl === void 0 ? {} : { gatewayBaseUrl: options.gatewayBaseUrl },
    ...options.bigPayloadThresholdBytes === void 0 ? {} : {
      bigPayloadThresholdBytes: options.bigPayloadThresholdBytes
    },
    geometryReuseEnabled,
    logger,
    ...options.onGeometryReuseProbe === void 0 ? {} : {
      onGeometryReuseProbe: options.onGeometryReuseProbe
    },
    ...options.geometryUrlStore === void 0 ? {} : { geometryUrlStore: options.geometryUrlStore },
    // A batch item carries a geometry URL of the credential it was prepared
    // with; only fixed credentials keep one partition for the whole run.
    batchSubmit: options.batchSubmit !== false && options.getToken === void 0 && options.auth === void 0
  };
}

// src/client.ts
var InfraredClient = class {
  /** The API base URL in use, without trailing slashes. */
  baseUrl;
  /** The API key the client was created with, if any. */
  apiKey;
  /** Where the SDK's warnings go. */
  logger;
  /** Submits jobs, reads their status and downloads results. */
  jobs;
  /** Submits requests that already use the API's own keys. */
  analyses;
  /** Weather stations and data. */
  weather;
  /** Buildings around a site. */
  buildings;
  /** Trees around a site. */
  vegetation;
  /** Ground materials around a site. */
  groundMaterials;
  /** The public price list. */
  billing;
  /**
   * Creates a client; give a credential (`apiKey`, `token`, `getToken` or
   * `auth`) here or through the environment.
   *
   * @param options - See `InfraredClientConfig`.
   * @throws {TypeError} when `auth` is combined with another credential, or
   * `INFRARED_GEOMETRY_REF_ENABLED` is not a Boolean string.
   * @throws {InvalidOptionError} when a removed option such as `acquisition` is passed.
   * @throws {Error} when no credential is given.
   */
  constructor(options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "the public-data path is the only path; remove the option"
    );
    const apiKey = options.apiKey ?? envValue(options.env, "INFRARED_API_KEY");
    const baseUrl = options.baseUrl ?? envValue(options.env, "INFRARED_BASE_URL") ?? DEFAULT_BASE_URL;
    this.baseUrl = trimTrailingSlashes(String(baseUrl));
    this.apiKey = apiKey;
    this.logger = options.logger ?? consoleLogger;
    const credentialsPresent = apiKey !== void 0 || options.token !== void 0 || options.getToken !== void 0;
    if (options.auth !== void 0 && credentialsPresent) {
      throw new TypeError("auth cannot be combined with apiKey, token, or getToken");
    }
    const auth = options.auth ?? buildAuthResolver({
      ...apiKey === void 0 ? {} : { apiKey },
      ...options.token === void 0 ? {} : { token: options.token },
      ...options.getToken === void 0 ? {} : { getToken: options.getToken },
      ...options.surface === void 0 ? {} : { surface: options.surface }
    });
    const timeoutMs = options.timeoutMs ?? options.timeout;
    this.jobs = new JobsService(jobsServiceOptions(options, this.baseUrl, auth, this.logger, timeoutMs));
    this.analyses = new AnalysisService(this.jobs);
    const serviceOptions = {
      baseUrl: this.baseUrl,
      auth,
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...timeoutMs === void 0 ? {} : { timeoutMs },
      logger: this.logger
      // every acquisition warning, never `console` (D48)
    };
    this.weather = new WeatherService(serviceOptions);
    this.buildings = new BuildingsService(serviceOptions);
    this.vegetation = new VegetationService(serviceOptions);
    this.groundMaterials = new GroundMaterialsService(serviceOptions);
    this.billing = new BillingService(serviceOptions);
  }
  /**
   * Submits one analysis request and returns the accepted `Job` without
   * waiting; follow with `jobs.waitForCompletion`, or use `runAndWait`.
   * Throws a `TypeError` straight away, before a promise is returned, when the request is not
   * valid; later failures reject the returned promise.
   *
   * @example
   * ```ts
   * const job = await client.run({ analysisType: AnalysesName.WindSpeed, ...parameters });
   * ```
   */
  run(input, options = {}) {
    const payload = prepareAnalysisPayload(input);
    return this.analyses.execute(payload, options);
  }
  /**
   * Submits a request, waits for it and returns the decoded result. A
   * `daylight-factor` request whose floors do not fit one job is sent as
   * parts in parallel and joined into the result a single request would give
   * (`maxParts: 1` sends one job); any other request is one job. A
   * `daylight-factor` result is a `DaylightFactorResult`, or the JSON value
   * with `resultFormat: "json"`.
   *
   * Rejects when a job fails or the wait times out.
   *
   * @example
   * ```ts
   * const result = await client.runAndWait({ analysisType: AnalysesName.WindSpeed, ...parameters });
   * ```
   */
  // Maintainer note (not published): the parts are the kernel's plan (D221);
  // the `daylight-factor` result format default is D234.
  runAndWait(input, options = {}) {
    return runAndWaitParts(this.jobs, this.logger, input, options);
  }
  /** Submits a request as its parts without waiting; returns the saved `PartsSchedule`. */
  runParts(input, options = {}) {
    return runParts(this.jobs, this.logger, input, options);
  }
  /** Reads the status of every open part once; returns the run's counts. */
  checkPartsState(schedule2, options = {}) {
    return checkAreaState(this.jobs, schedule2, options);
  }
  /** Downloads and joins a finished parts run; throws `AnalysisPartsError` naming a failed part. */
  mergeParts(schedule2, options = {}) {
    return mergePartsValue(this.jobs, this.logger, schedule2, options);
  }
  /** The parts, sensors and tokens a `runAndWait` of `input` would bill; sends nothing. */
  previewParts(input, options = {}) {
    return previewParts(this.jobs, this.billing, this.logger, input, options);
  }
  async runArea(input, polygon, options = {}) {
    const how = { logger: this.logger, ...options };
    if (Array.isArray(input)) return runAreaMany(this.jobs, input, polygon, how);
    return runArea(this.jobs, input, polygon, how);
  }
  /** Reads the status of the schedule's jobs once, updates it and returns the run's counts. */
  checkAreaState(schedule2, options = {}) {
    return checkAreaState(this.jobs, schedule2, options);
  }
  /**
   * Downloads the finished grid jobs of an area run and merges them into an
   * `AreaResult`. Throws when a tile did not contribute; calling it again
   * with the same schedule completes a run whose results could not be fetched.
   */
  mergeAreaJobs(schedule2, options = {}) {
    return mergeAreaJobs(this.jobs, schedule2, { logger: this.logger, ...options });
  }
  /** Downloads the finished surface jobs of an area run and joins them into `SurfaceColumns`. */
  mergeSurfaceAreaJobs(schedule2, options = {}) {
    return mergeSurfaceAreaJobs(this.jobs, schedule2, { logger: this.logger, ...options });
  }
  async runAreaAndWait(input, polygon, options = {}) {
    const list = Array.isArray(input);
    if (options.retryFrom !== void 0) {
      if (list) throw new TypeError("retryFrom is not supported with a list of analyses: retry each analysis alone");
      return waitAndMerge(
        this.jobs,
        await this.runArea(input, polygon, options),
        { logger: this.logger, ...options }
      );
    }
    const inputs = list ? input : [input];
    const results = await allResults(this.runAreaStream(inputs, polygon, options), inputs.length);
    return list ? results : results[0];
  }
  /**
   * Runs analyses over one polygon area as `runAreaAndWait` does, and yields each
   * result the moment its last tile is merged, in the order they finish. Read the
   * items one by one: the SDK keeps no reference to a yielded result. A failed
   * analysis yields an item with `error`; the others continue. `break` or
   * `options.signal` cancels the analyses not yet yielded. `options` apply to every
   * analysis; `onProgress` reports each analysis until it is finished (then its bodies are freed).
   *
   * @throws {TypeError} on the first `next()` when `areaTimeout` is not a positive finite number.
   * @category Run an analysis
   * @example
   * ```ts
   * for await (const item of client.runAreaStream([solar, wind], polygon)) draw(item);
   * ```
   */
  runAreaStream(inputs, polygon, options = {}) {
    const list = Array.isArray(inputs) ? inputs : [inputs];
    return streamArea(this.jobs, list, polygon, { ...options, logger: options.logger ?? this.logger });
  }
  /** Builds the tile grid covering a polygon, south to north; sends no request. */
  generateTiles(polygon, options = {}) {
    return generateTilesForPolygon(polygon, options);
  }
  /**
   * Estimates an area run from its tile count; submits nothing. The cost is
   * the jobs times the API's price for the analysis (`pricingSource` says if
   * the price is `"live"`, `"cached"` or `"stale"`). For a facade run use
   * `previewAreaBatches`. Throws when the polygon needs more non-empty tiles
   * than the limit.
   *
   * @throws {PricingUnavailableError} when the price list cannot be fetched and the client has none.
   *
   * @example
   * ```ts
   * const preview = await client.previewArea(polygon, { analysisType: "wind-speed" });
   * ```
   */
  async previewArea(polygon, options) {
    const tiles = this.generateTiles(polygon, options);
    const tileCount = tiles.flat().filter((tile) => !tile.empty).length;
    const { tokensPerJob, pricingVersion, pricingSource, estimatedCostTokens, estimatedTimeS } = estimateRun(tileCount, await this.billing.quote(options.analysisType));
    return {
      tileCount,
      estimatedTimeS,
      estimatedCostTokens,
      tokensPerJob,
      pricingSource,
      ...pricingVersion === void 0 ? {} : { pricingVersion }
    };
  }
  /** @deprecated Use `previewArea`: it is priced with the same price list. Removed in 2.0. */
  previewAreaWithPricing(polygon, options) {
    return previewAreaWithPricing(this, polygon, options);
  }
  /**
   * Previews a facade run: builds the plan `runArea` would and reports its job
   * count instead of submitting it. Pass the same `input` a `runArea` call
   * would, because `previewArea` under-reports a facade (`analysisSurfaces`) run.
   */
  // Maintainer note (not published): added by WP-6; see area/preview.ts.
  previewAreaBatches(input, polygon, options = {}) {
    return previewAreaBatches(this.jobs, this.billing, input, polygon, { logger: this.logger, ...options });
  }
  /** Decodes an already downloaded result archive; prefer `jobs.decompress`, which returns a typed result. */
  // Maintainer note (not published): explicit legacy adapter; `jobs.decompress`
  // remains route-aware.
  decompressResult(content) {
    return decompressResultValue(this.jobs, content);
  }
};

// src/index.ts
function coreVersion() {
  return requireCore().coreVersion();
}

// src/node.ts
var packagedBytes;
var packagedInitialization;
registerPackagedCoreLoader((threads) => initializeCore2(threads === void 0 ? {} : { threads }));
function initializeCore2(options = {}) {
  const { threads, ...source } = options;
  if (threads !== void 0 && threads !== 1) return initializeThreadedCore(source, threads);
  const supplied = source.url !== void 0 || source.bytes !== void 0 || source.module !== void 0;
  if (threads === void 0 && !supplied) return initializeDefaultCore();
  return initializeSerialCore(source).then(() => {
    if (coreThreads() !== 1) {
      throw new CoreInitializationError(
        `the Infrared core is already initialized with ${coreThreads()} thread(s)`
      );
    }
  });
}
function initializeSerialCore(options) {
  if (options.url !== void 0 || options.bytes !== void 0 || options.module !== void 0) {
    return initializeCore(options);
  }
  packagedInitialization ??= Promise.resolve().then(() => (init_node_loader(), node_loader_exports)).then(({ packagedCoreBytes: packagedCoreBytes2 }) => {
    packagedBytes ??= packagedCoreBytes2(
      new URL("../generated/infrared-core_bg.wasm", import_meta_url)
    );
    return packagedBytes;
  }).then((bytes) => initializeCore({ bytes })).catch((error) => {
    packagedBytes = void 0;
    packagedInitialization = void 0;
    throw error;
  });
  return packagedInitialization;
}
var MAX_THREADS = 64;
function defaultThreads() {
  const cores = (0, import_node_os.availableParallelism)();
  return Math.min(cores >= 16 ? 8 : 4, cores);
}
function initializeDefaultCore() {
  try {
    requireCore();
    return Promise.resolve();
  } catch {
  }
  const threads = defaultThreads();
  if (Number(process.versions.node.split(".")[0]) < 22 || threads < 2) return initializeSerialCore({});
  defaultInitialization ??= initializeThreadedCore({}, threads).catch((error) => {
    process.emitWarning(
      `the threaded Infrared core did not start; using the single-threaded core (${describe2(error)})`,
      { type: "InfraredThreadsFallbackWarning" }
    );
    return initializeSerialCore({});
  }).catch((error) => {
    defaultInitialization = void 0;
    throw error;
  });
  return defaultInitialization;
}
var defaultInitialization;
function initializeThreadedCore(options, threads) {
  if (!Number.isSafeInteger(threads) || threads < 1 || threads > MAX_THREADS) {
    return Promise.reject(new CoreInitializationError(
      `threads must be an integer from 1 to ${MAX_THREADS}`
    ));
  }
  if (options.url !== void 0 || options.bytes !== void 0 || options.module !== void 0) {
    return Promise.reject(new CoreInitializationError(
      "the threaded core is the packaged one: pass threads without url, bytes or module"
    ));
  }
  if (Number(process.versions.node.split(".")[0]) < 22) {
    return Promise.reject(new CoreInitializationError(
      `the threaded core needs Node 22 or later; this is Node ${process.versions.node}`
    ));
  }
  const glue = new URL("../generated-threads/infrared-core.js", import_meta_url);
  return Promise.resolve().then(() => (init_node_loader(), node_loader_exports)).then(({ packagedCoreBytes: packagedCoreBytes2 }) => packagedCoreBytes2(new URL("../generated-threads/infrared-core_bg.wasm", import_meta_url))).catch((error) => {
    throw new CoreInitializationError(
      "this package has no threaded core (npm run build:wasm:threads builds it)",
      { cause: error }
    );
  }).then((bytes) => initializeCoreSource({
    source: bytes,
    identity: `threads:${threads}`,
    threaded: { threads, glue: () => import(glue.href) }
  }));
}
function describe2(error) {
  const parts = [];
  for (let e = error; e instanceof Error && parts.length < 4; e = e.cause) parts.push(e.message);
  return parts.join(": ");
}

// src/utilities.ts
var utilities_exports = {};
__export(utilities_exports, {
  CATALOG_TTL_MS: () => CATALOG_TTL_MS,
  DEFAULT_STATIC_BASE_URL: () => DEFAULT_STATIC_BASE_URL,
  MAX_STATIC_BYTES: () => MAX_STATIC_BYTES,
  StaticWeatherReader: () => StaticWeatherReader,
  WeatherService: () => WeatherService,
  WeatherServiceError: () => WeatherServiceError,
  clearWeatherCatalogCache: () => clearWeatherCatalogCache
});

// src/node-runtime.ts
var import_node_worker_threads = require("node:worker_threads");

// src/worker/index.ts
var worker_exports = {};
__export(worker_exports, {
  FacadeLayout: () => FacadeLayout,
  WorkerLostError: () => WorkerLostError,
  attachValues: () => attachValues,
  createWorkerClient: () => createWorkerClient,
  serveSdkWorker: () => serveSdkWorker,
  synthesizeFacadeLayout: () => synthesizeFacadeLayout
});

// src/worker/protocol.ts
function stringList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? [...value] : void 0;
}
function serializeError(error) {
  const fields = typeof error === "object" && error !== null ? error : {};
  const name = typeof fields.name === "string" ? fields.name : "Error";
  const message = typeof fields.message === "string" ? fields.message : String(error);
  const acceptedJobIds2 = stringList(fields.acceptedJobIds);
  let areaSchedule;
  try {
    if (fields.areaSchedule !== void 0) areaSchedule = areaScheduleToJSON(fields.areaSchedule);
  } catch {
  }
  return {
    name,
    message,
    ...typeof fields.status === "number" ? { status: fields.status } : {},
    ...acceptedJobIds2 === void 0 ? {} : { acceptedJobIds: acceptedJobIds2 },
    ...areaSchedule === void 0 ? {} : { areaSchedule },
    ...fields.terminal === true ? { terminal: true } : {}
  };
}
function restoreError(detail) {
  const error = new Error(detail.message);
  error.name = detail.name;
  const fields = {};
  if (detail.status !== void 0) fields.status = detail.status;
  if (detail.acceptedJobIds !== void 0) fields.acceptedJobIds = detail.acceptedJobIds;
  if (detail.areaSchedule !== void 0) fields.areaSchedule = areaScheduleFromJSON(detail.areaSchedule);
  if (detail.terminal === true) fields.terminal = true;
  return Object.assign(error, fields);
}
function transferables(value) {
  const found = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const visit = (item) => {
    if (typeof item !== "object" || item === null || seen.has(item)) return;
    seen.add(item);
    if (ArrayBuffer.isView(item)) {
      const buffer = item.buffer;
      if (buffer instanceof ArrayBuffer && item.byteOffset === 0 && item.byteLength === buffer.byteLength) {
        found.add(buffer);
      }
      return;
    }
    if (Array.isArray(item)) {
      for (const child of item) visit(child);
      return;
    }
    for (const child of Object.values(item)) visit(child);
  };
  visit(value);
  return [...found];
}

// src/worker/node-port.ts
var isNodeStyle = (value) => typeof value.addEventListener !== "function" && typeof value.on === "function";
function adaptNodeWorker(worker2) {
  if (!isNodeStyle(worker2)) return worker2;
  const node = worker2;
  return {
    postMessage: (message, transfer) => node.postMessage(message, transfer),
    addEventListener(type, listener) {
      if (type === "error") {
        node.on("exit", (() => listener({ error: new Error("the SDK worker exited"), preventDefault() {
        } })));
      }
      node.on(type, ((value) => {
        listener(type === "message" ? { data: value } : { error: value, preventDefault() {
        } });
      }));
    },
    terminate: () => {
      void node.terminate();
    }
  };
}
function adaptNodePort(port) {
  if (!isNodeStyle(port)) return port;
  const node = port;
  return {
    postMessage: (message, transfer) => node.postMessage(message, transfer),
    addEventListener(_type, listener) {
      node.on("message", ((data) => listener({ data })));
    }
  };
}

// src/worker/stream.ts
function observe(callback) {
  try {
    callback();
  } catch {
  }
}
function abortReason2(signal) {
  const reason2 = signal.reason;
  return typeof reason2?.message === "string" ? reason2.message : "aborted";
}
async function* workerStream(start, outer) {
  const controller = new AbortController();
  const stop = () => controller.abort(outer?.reason);
  if (outer?.aborted === true) stop();
  outer?.addEventListener("abort", stop, { once: true });
  const queue = [];
  let wake;
  let end;
  const call = start((message, took) => {
    const { index: index2, analysisType: analysisType2 } = message;
    queue.push({ took, item: message.error === void 0 ? { index: index2, analysisType: analysisType2, result: message.result } : { index: index2, analysisType: analysisType2, error: restoreError(message.error) } });
    wake?.();
  }, controller.signal).then(() => {
    end = {};
    wake?.();
  }, (error) => {
    end = { error };
    wake?.();
  });
  try {
    for (; ; ) {
      while (queue.length > 0) {
        const { item, took } = queue.shift();
        took();
        yield item;
      }
      if (end !== void 0) {
        if ("error" in end) throw end.error;
        return;
      }
      await new Promise((resolve) => {
        wake = resolve;
      });
      wake = void 0;
    }
  } finally {
    outer?.removeEventListener("abort", stop);
    if (end === void 0) controller.abort(new DOMException("the stream was closed", "AbortError"));
    await call;
  }
}

// src/worker/lost-error.ts
var WorkerLostError = class extends Error {
  /**
   * @param reason - `"load"` or `"lost"`, as described above.
   * @param acceptedJobIds - Ids of the jobs the server accepted before the worker ended.
   * @param message - The error message; a default is given for each reason.
   */
  constructor(reason2, acceptedJobIds2, message = reason2 === "load" ? "the SDK worker failed to load" : "the SDK worker ended during a call") {
    super(message);
    this.reason = reason2;
    this.acceptedJobIds = acceptedJobIds2;
  }
  name = "WorkerLostError";
};

// src/worker/client.ts
var bound2 = /* @__PURE__ */ new WeakSet();
function createWorkerClient(options) {
  const { getToken } = options;
  const worker2 = adaptNodeWorker(options.worker);
  if (bound2.has(options.worker)) throw new TypeError("this worker already serves an SDK worker client");
  bound2.add(options.worker);
  const open = /* @__PURE__ */ new Set();
  let ready = false;
  let closed = false;
  const end = (error) => {
    if (closed) return;
    closed = true;
    worker2.terminate();
    for (const call2 of [...open]) call2.fail(error(call2));
  };
  worker2.addEventListener("error", (event) => {
    event.preventDefault();
    const started = ready || [...open].some((call2) => call2.accepted.length > 0);
    end((call2) => new WorkerLostError(started ? "lost" : "load", [...call2.accepted]));
  });
  const undeliverable = () => {
    end((call2) => new WorkerLostError("lost", [...call2.accepted], "an SDK worker message could not be read"));
  };
  worker2.addEventListener("messageerror", undeliverable);
  worker2.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "ready") ready = true;
    if (message?.type !== "token-request" || closed) return;
    const reply = (fields) => {
      if (!closed) worker2.postMessage({ type: "token", id: message.id, ...fields });
    };
    if (getToken === void 0) {
      reply({ error: "createWorkerClient has no getToken" });
      return;
    }
    Promise.resolve().then(getToken).then((token) => reply({ token }), (error) => reply({ error: String(error) }));
  });
  worker2.postMessage({
    type: "init",
    ...options.module === void 0 ? {} : { module: options.module },
    config: options.config ?? {},
    getToken: getToken !== void 0,
    ...options.threads === void 0 ? {} : { threads: options.threads }
  });
  function call(op, args, hooks, decode) {
    if (closed) return Promise.reject(new Error("the SDK worker client is closed; create a new one"));
    return new Promise((resolve, reject) => {
      const channel2 = new MessageChannel();
      const port = channel2.port1;
      const signal = hooks.signal;
      const onAbort = () => port.postMessage({ type: "abort", reason: abortReason2(signal) });
      const entry = {
        accepted: [],
        fail: (error) => finish2(() => reject(error))
      };
      const finish2 = (settle) => {
        if (!open.delete(entry)) return;
        signal?.removeEventListener("abort", onAbort);
        port.close();
        settle();
      };
      port.addEventListener("message", (event) => {
        const message = event.data;
        if (message.type === "progress") {
          observe(() => hooks.onProgress?.(message.state));
        } else if (message.type === "accepted") {
          entry.accepted.push(message.jobId);
          observe(() => hooks.onAccepted?.(message.jobId, message.tileKey));
        } else if (message.type === "item") {
          hooks.onItem?.(message, () => port.postMessage({ type: "taken" }));
        } else if (message.type === "done") {
          finish2(() => {
            try {
              resolve(decode(message.value));
            } catch (error) {
              reject(error);
            }
          });
        } else if (message.type === "failed") {
          finish2(() => reject(restoreError(message.error)));
        }
      });
      port.addEventListener("messageerror", undeliverable);
      port.start();
      open.add(entry);
      try {
        worker2.postMessage({ type: "call", op, args, port: channel2.port2 }, [channel2.port2]);
      } catch (error) {
        entry.fail(error);
        return;
      }
      if (signal?.aborted) onAbort();
      else signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
  const same = (value) => value;
  const plain = (value) => {
    const { signal, ...rest } = value ?? {};
    return { rest, hooks: { signal } };
  };
  return {
    runArea(input, polygon, runOptions = {}) {
      const { signal, onProgress, onAccepted, retryFrom, ...rest } = runOptions;
      const sent = { ...rest, ...retryFrom === void 0 ? {} : { retryFrom: areaScheduleToJSON(retryFrom) } };
      return call(
        "runArea",
        [input, polygon, sent],
        { signal, onProgress, onAccepted },
        (value) => Array.isArray(value) ? value.map((one) => areaScheduleFromJSON(one)) : areaScheduleFromJSON(value)
      );
    },
    runAreaStream(inputs, polygon, streamOptions = {}) {
      if (streamOptions.retryFrom !== void 0) throw new TypeError("runAreaStream takes no retryFrom; use runArea");
      const { signal, onProgress, onAccepted, ...rest } = streamOptions;
      return workerStream((onItem, inner) => call(
        "runAreaStream",
        [inputs, polygon, rest],
        { signal: inner, onProgress, onAccepted, onItem },
        same
      ), signal);
    },
    mergeAreaJobs(schedule2, mergeOptions) {
      const { rest, hooks } = plain(mergeOptions);
      return call("mergeAreaJobs", [areaScheduleToJSON(schedule2), rest], hooks, same);
    },
    mergeSurfaceAreaJobs(schedule2, mergeOptions) {
      const { rest, hooks } = plain(mergeOptions);
      return call("mergeSurfaceAreaJobs", [areaScheduleToJSON(schedule2), rest], hooks, same);
    },
    vegetation: {
      getArea(polygon, readOptions) {
        const { rest, hooks } = plain(readOptions);
        return call("vegetation.getArea", [polygon, rest], hooks, same);
      }
    },
    groundMaterials: {
      getArea(polygon, readOptions) {
        const { rest, hooks } = plain(readOptions);
        return call("groundMaterials.getArea", [polygon, rest], hooks, same);
      }
    },
    buildings: {
      getBuildingsInArea(polygon, readOptions) {
        const { rest, hooks } = plain(readOptions);
        return call("buildings.getBuildingsInArea", [polygon, rest], hooks, same);
      }
    },
    dispose() {
      end((entry) => new WorkerLostError("lost", [...entry.accepted], "the SDK worker client was disposed"));
    }
  };
}

// src/worker/serve.ts
function serveSdkWorker(options = {}) {
  const scope = adaptNodePort(options.scope ?? globalThis);
  let client;
  let nextToken = 1;
  const tokens = /* @__PURE__ */ new Map();
  const requestToken = () => new Promise((resolve, reject) => {
    const id = nextToken++;
    tokens.set(id, { resolve, reject });
    scope.postMessage({ type: "token-request", id });
  });
  const init = async (message) => {
    if (message.module === void 0 || message.threads !== void 0 && message.threads !== 1) {
      await loadPackagedCore(message.threads);
    } else await initializeCore({ module: message.module });
    const created = new InfraredClient({
      ...message.config,
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.geometryUrlStore === void 0 ? {} : { geometryUrlStore: options.geometryUrlStore },
      ...message.getToken ? { getToken: requestToken } : {}
    });
    scope.postMessage({ type: "ready" });
    return created;
  };
  scope.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "init") {
      client ??= init(message);
      client.catch(() => void 0);
    } else if (message?.type === "call") {
      void serveCall(message, client);
    } else if (message?.type === "token") {
      const waiter = tokens.get(message.id);
      if (waiter === void 0) return;
      tokens.delete(message.id);
      if (message.token !== void 0) waiter.resolve(message.token);
      else waiter.reject(new Error(message.error ?? "getToken failed on the page"));
    }
  });
}
async function serveCall(message, client) {
  const port = message.port;
  const abort = new AbortController();
  let taken = 0;
  let wakeTaken = () => {
  };
  port.addEventListener("message", (event) => {
    if (event.data?.type === "abort") abort.abort(new DOMException(event.data.reason, "AbortError"));
    if (event.data?.type === "taken") taken += 1;
    wakeTaken();
  });
  const pageTook = async () => {
    while (taken === 0 && !abort.signal.aborted) await new Promise((resolve) => {
      wakeTaken = resolve;
    });
    taken = Math.max(0, taken - 1);
  };
  port.start();
  const send = (reply, transfer = []) => port.postMessage(reply, transfer);
  try {
    if (client === void 0) throw new Error("the SDK worker received a call before init");
    const value = await dispatch(await client, message.op, message.args, abort.signal, send, pageTook);
    send({ type: "done", value }, transferables(value));
  } catch (error) {
    send({ type: "failed", error: serializeError(error) });
  } finally {
    port.close();
  }
}
async function dispatch(client, op, args, signal, send, pageTook) {
  const [first, second, third] = args;
  if (op === "runArea") {
    const { retryFrom, ...options2 } = third ?? {};
    const schedule2 = await client.runArea(first, second, {
      ...options2,
      ...retryFrom === void 0 ? {} : { retryFrom: areaScheduleFromJSON(retryFrom) },
      signal,
      onProgress: (state) => send({ type: "progress", state }),
      onAccepted: (jobId, tileKey) => send({ type: "accepted", jobId, tileKey })
    });
    return Array.isArray(schedule2) ? schedule2.map(areaScheduleToJSON) : areaScheduleToJSON(schedule2);
  }
  if (op === "runAreaStream") {
    for await (const item of client.runAreaStream(first, second, {
      ...third,
      signal,
      onProgress: (state) => send({ type: "progress", state }),
      onAccepted: (jobId, tileKey) => send({ type: "accepted", jobId, tileKey })
    })) {
      const { index: index2, analysisType: analysisType2 } = item;
      if (item.error !== void 0) send({ type: "item", index: index2, analysisType: analysisType2, error: serializeError(item.error) });
      else send({ type: "item", index: index2, analysisType: analysisType2, result: item.result }, transferables(item.result));
      await pageTook();
    }
    return void 0;
  }
  const options = { ...second, signal };
  if (op === "mergeAreaJobs") {
    return client.mergeAreaJobs(areaScheduleFromJSON(first), options);
  }
  if (op === "mergeSurfaceAreaJobs") {
    return client.mergeSurfaceAreaJobs(areaScheduleFromJSON(first), options);
  }
  if (op === "vegetation.getArea") return client.vegetation.getArea(first, options);
  if (op === "groundMaterials.getArea") return client.groundMaterials.getArea(first, options);
  if (op === "buildings.getBuildingsInArea") return client.buildings.getBuildingsInArea(first, options);
  throw new Error(`unknown SDK worker operation ${String(op)}`);
}

// src/node-runtime.ts
var nodeInitialize = { initializeCore: initializeCore2 };
var tiling = Object.freeze({ ...area_exports, ...nodeInitialize });
var geodata = Object.freeze({ ...geodata_exports, ...nodeInitialize });
var utilities = Object.freeze({ ...utilities_exports });
var billing = Object.freeze({ ...billing_exports });
var serveSdkWorker2 = (options = {}) => {
  const scope = options.scope ?? import_node_worker_threads.parentPort;
  if (scope === null) throw new Error("serveSdkWorker() needs a worker thread: call it in a node:worker_threads Worker, or pass `scope`");
  serveSdkWorker({ ...options, scope });
};
var worker = Object.freeze({ ...worker_exports, serveSdkWorker: serveSdkWorker2 });
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  billing,
  geodata,
  root,
  tiling,
  utilities,
  worker
});
