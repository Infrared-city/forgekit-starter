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

// src/node.ts
var node_exports = {};
__export(node_exports, {
  AnalysesName: () => AnalysesName,
  AnalysisService: () => AnalysisService,
  AreaGeometryProbeError: () => AreaGeometryProbeError,
  AreaGeometryReferenceError: () => AreaGeometryReferenceError,
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
  DEFAULT_MAX_LONG_AXIS_PX: () => DEFAULT_MAX_LONG_AXIS_PX,
  DEFAULT_STATIC_BASE_URL: () => DEFAULT_STATIC_BASE_URL,
  DEFAULT_TOKENS_PER_JOB: () => DEFAULT_TOKENS_PER_JOB,
  ESTIMATED_SECONDS_PER_TILE: () => ESTIMATED_SECONDS_PER_TILE,
  EpwParseError: () => EpwParseError,
  FacadeArtifactMismatchError: () => FacadeArtifactMismatchError,
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
  JobStatus: () => JobStatus,
  JobTimeoutError: () => JobTimeoutError,
  JobsService: () => JobsService,
  LocalCleaner: () => LocalCleaner,
  MAX_REGISTRY_BYTES: () => MAX_REGISTRY_BYTES,
  MAX_STATIC_BYTES: () => MAX_STATIC_BYTES,
  OvertureFileLimitError: () => OvertureFileLimitError,
  OvertureReadTooLargeError: () => OvertureReadTooLargeError,
  PER_JOB_MODEL_KEYS: () => PER_JOB_MODEL_KEYS,
  PHYSICS_TIERS: () => PHYSICS_TIERS,
  REGISTRY_URL: () => REGISTRY_URL,
  ReadMarginError: () => ReadMarginError,
  RegistryFetchError: () => RegistryFetchError,
  SCHEDULE_CONTRACT_VERSION: () => SCHEDULE_CONTRACT_VERSION,
  SiteReadError: () => SiteReadError,
  StaticWeatherReader: () => StaticWeatherReader,
  SubmissionUncertainError: () => SubmissionUncertainError,
  THERMAL_CONTROLS: () => THERMAL_CONTROLS,
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
  areaScheduleFromJSON: () => areaScheduleFromJSON,
  areaScheduleToJSON: () => areaScheduleToJSON,
  buildAuthResolver: () => buildAuthResolver,
  checkAreaState: () => checkAreaState,
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
  fetchVisualConfigurations: () => fetchVisualConfigurations,
  flattenVisualConfigs: () => flattenVisualConfigs,
  freePreparedSites: () => freePreparedSites,
  freezeAreaSchedule: () => freezeAreaSchedule,
  generateTilesForPolygon: () => generateTilesForPolygon,
  getTilingConfig: () => getTilingConfig,
  gridImageSize: () => gridImageSize,
  groundReadDistanceM: () => groundReadDistanceM,
  hasCellGeometry: () => hasCellGeometry,
  initializeCore: () => initializeCore2,
  isVertical: () => isVertical,
  jobFromResponse: () => jobFromResponse,
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
  renderGridPng: () => renderGridPng,
  requiredMarginM: () => requiredMarginM,
  resolveBracketName: () => resolveBracketName,
  resolveReadAnalysisType: () => resolveReadAnalysisType,
  resolveTokensPerJob: () => resolveTokensPerJob,
  resolveVisualConfig: () => resolveVisualConfig,
  runArea: () => runArea,
  serializeToKebab: () => serializeToKebab,
  setOwnKey: () => setOwnKey,
  silentLogger: () => silentLogger,
  submitAreaPlan: () => submitAreaPlan,
  surfaceTriangles: () => surfaceTriangles,
  toCamelCase: () => toCamelCase,
  toKebabCase: () => toKebabCase,
  validatePolygon: () => validatePolygon,
  vegetationRegistryDocument: () => vegetationRegistryDocument,
  windClassOrdinals: () => windClassOrdinals
});
module.exports = __toCommonJS(node_exports);

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

// src/internal/errors.ts
var CoreNotReadyError = class extends Error {
  name = "CoreNotReadyError";
  constructor() {
    super("initializeCore() must complete before synchronous core operations");
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

// src/internal/core.ts
var core;
var pending;
var sourceIdentity;
var terminalFailure;
var REQUIRED_FUNCTION_EXPORTS = [
  "coreVersion",
  "geometryGroups",
  "geometryGroupHash",
  // The schedule identity (audit M8b, D81): sha256 of the canonical config
  // JSON (sorted keys, 6dp half-away rounding, integral collapse). Replaces
  // this package's own `bankersRound6` fold.
  "configHash",
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
  "site_allTileIds",
  "site_bodies",
  // D101: every tile's IRBF artifact from the same site, and one body's for
  // the direct `submit` path — the kernel packs, frames, zips and digests.
  "site_artifacts",
  "geometryArtifact",
  // The facade batches, planned from the same kept site, and every batch's
  // selected body, capture and artifact (D156: its targets, the rest as
  // context) from one call per tile, as the Python host does
  // (`area/site-facade.ts`, WP3).
  "site_facadeBatches",
  "site_facadeFrames",
  "site_checkTerrain",
  "site_identity",
  "site_unowned",
  // `splitFacadeCoreContext` and its report twin are NOT here: the kernel
  // `Site` plans every facade job (`site_facadeBatches`), so this package
  // calls neither. The kernel still exports both.
  // `partitionFacadeCoreContext` and its `...F64` twin are NOT here: the site
  // pass answers `core`, the shrink band, the demoted ids and `unowned` for the
  // whole grid in one call, so this package no longer asks per tile (D90). The
  // kernel still exports both, for a caller composing tiles itself.
  // D158: the cap's one validation rule, checked before any planning. The
  // exact planner itself runs inside `site_facadeBatches`; the kernel still
  // exports `planExactSurfaceBatchesCapped` for a caller composing tiles.
  "checkMaxSensorsPerJob",
  // D160: four small rules this package used to restate, now asked of the
  // kernel as the Python host does — which analyses get the tile location,
  // the Overture bbox membership, the terrain triangle cap, and the polygon
  // frame origin.
  "tileLocationApplies",
  "bboxMeetsRows",
  "terrainTriangleCap",
  "scalarPolygonOriginF64",
  "projectPolygonToMeters",
  "mergeAreaGridDense",
  "mergeAreaGridDenseF64",
  "mergeAreaGridCompact",
  "mergeAreaGridCompactWind",
  // `normalizeAreaCategoricalLabels` is NOT here: D107 moved the JSON route's
  // categorical decode into the kernel too, so every categorical tile now
  // carries a `CompactCategory` dictionary and merges through
  // `normalizeAreaCategoricalCompact` — nothing calls the labels-only form
  // any more. The kernel still exports it.
  "normalizeAreaCategoricalCompact",
  "groundCleanV3",
  "gridToPng",
  "packedIndexCount",
  "tileSwOffset",
  // Facade "pretty mode" (ADR 0008, D88): the SDK draws the per-cell render
  // geometry with the kernel it already bundles instead of downloading 12.6x
  // the body from the server. `decodeSurfaceIdentity` reads the layout hash
  // the synthesis is checked against. The terrain arm is the kernel's capture
  // reader: it decodes and merges the terrain (D20) and seats the targets the
  // way the server does before it synthesizes. One call answers every
  // capture of a merge (D185).
  "decodeSurfaceIdentity",
  "synthesizeSurfaces",
  "synthesizeSurfacesFromCaptures",
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
  // The same port's tolerance export, called by the public
  // `slabToleranceDeg` measurement helper (`geodata/rect-union-metrics.ts`).
  "rectUnionSlabToleranceDeg",
  // Trees as boxes on the binary wind routes (D70). Without these the SDK
  // cannot honour a binary wind/PWC body that carries vegetation at all.
  "vegetationTreeBoxDecision",
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
  // Static weather: the two kernel operations behind the three public
  // weather methods.
  "weatherNearestStations",
  "weatherFilterHours",
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
  "packMesh",
  // The canonical JSON writer behind every binary submission envelope. It
  // reached the kernel through a local `ReturnType<typeof requireCore> & {…}`
  // cast for months, so `initializeCore()` never checked for it and the one
  // matched-kernel list this package has was not true (ADR 0013, audit M5).
  "canonicalMetadataJson",
  "decodeBinaryResult",
  "inspectBinaryResult",
  "decodeGridDocument",
  // The area grid merge's tile decode (D107): inflate a downloaded result
  // archive and flatten a JSON grid in one crossing, or hand back an IRBF
  // document for `decodeBinaryResult`/`inspectBinaryResult` to decode.
  "decodeResultArchive",
  // The area SURFACE merge's job decode (WP4): inflate, route, parse,
  // validate and flatten a JSON or IRBF surface result in one call, handed
  // to `SurfaceAreaMerger.pushArchive` without a second crossing.
  "decodeSurfaceArchive",
  // Brief J (D106): the deterministic `payload.json` ZIP writer every json
  // submit body and geometry-reference document uses. Replaces
  // `internal/zip.ts` (`fflate`), deleted in the same PR.
  "zipPayloadJson",
  "__wbindgen_malloc",
  "__wbindgen_realloc",
  "__wbindgen_free",
  "__wbindgen_exn_store",
  "__wbindgen_start",
  "__externref_table_alloc",
  "__externref_table_dealloc",
  "__externref_drop_slice",
  "__wbg_griddocumentdecode_free",
  "griddocumentdecode_route",
  "griddocumentdecode_finiteNumbersValidated",
  "__wbg_areagridmerge_free",
  "__wbg_categoricalareadense_free",
  "__wbg_surfaceareamerger_free",
  "__wbg_surfacearchive_free",
  "areagridmerge_values",
  "areagridmerge_shape",
  "areagridmerge_bounds",
  "categoricalareadense_values",
  "categoricalareadense_legend",
  "surfacearchive_route",
  "surfacearchive_takeRootJson",
  "surfacearchive_takeFieldsJson",
  "surfacearchive_takeCellArea",
  "surfacearchive_valueOffsets",
  "surfacearchive_cellAreaState",
  "surfacearchive_cellTrisState",
  "surfaceareamerger_new",
  "surfaceareamerger_pushArchive",
  "surfaceareamerger_finish"
];
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
  const module2 = await import("../generated/infrared-core.js");
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
    core = module2;
  } catch (error) {
    throw terminal(
      error,
      "the loaded Infrared core failed its capability check"
    );
  }
}
function initializeCoreSource(source) {
  if (terminalFailure !== void 0) {
    return Promise.reject(terminalFailure);
  }
  if (core !== void 0) {
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
function requireCore() {
  if (core === void 0) throw new CoreNotReadyError();
  return core;
}

// src/internal/options.ts
function resolveCoreSource(options) {
  const supplied = [options.url, options.bytes, options.module].filter(
    (value) => value !== void 0
  );
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
var VERSION = "0.12.13-next.19";

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

// src/internal/deadline.ts
var MAX_TIMEOUT_MS = 2147483647;
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
    this.timer = setTimeout(() => {
      this.timedOut = true;
      this.timeout.abort();
      this.controller.abort();
    }, requireTimeout(timeoutMs));
  }
  controller = new AbortController();
  /** Aborts on the timeout only, never on the caller's signal. */
  timeout = new AbortController();
  timedOut = false;
  callerAborted = false;
  timer;
  onCallerAbort;
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

// src/internal/fetch.ts
function resolveFetch(implementation) {
  if (implementation != null) return implementation;
  const native = globalThis.fetch;
  return typeof native === "function" ? native.bind(globalThis) : void 0;
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
  constructor(message, phase, reason2, method, status) {
    super(message);
    this.phase = phase;
    this.reason = reason2;
    this.method = method;
    this.status = status;
  }
  name = "TransportError";
};
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
  timeoutMs;
  constructor(options) {
    this.base = normalizeBaseUrl(options.baseUrl);
    this.auth = options.auth;
    const fetcher = resolveFetch(options.fetch);
    if (typeof fetcher !== "function") throw new TypeError("a fetch implementation is required");
    this.fetch = fetcher;
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
      const request = {
        method,
        headers,
        redirect: "manual",
        signal: deadline.controller.signal
      };
      if (options.body !== void 0) request.body = options.body;
      const sent = options.beforeDispatch !== void 0 && mutation(method);
      if (deadline.controller.signal.aborted) throw new Error("request stopped");
      const response = await deadline.wait(() => {
        options.beforeDispatch?.();
        dispatched = true;
        return this.fetch(url, request);
      }, sent);
      if (response.status >= 300 && response.status < 400) {
        cancelResponseBody(response);
        throw new TransportError("gateway request received a redirect", "response", "http", method, response.status);
      }
      if (!response.ok && options.acceptHttpErrors !== true) {
        cancelResponseBody(response);
        throw new TransportError(`gateway request received HTTP ${response.status}`, "response", "http", method, response.status);
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
      const reason2 = stopped ?? (dispatched ? "network" : "auth");
      const phase = safePhase(method, dispatched);
      const message = stopped === "timeout" ? "gateway request timed out" : stopped === "aborted" ? "gateway request was aborted" : dispatched ? "gateway request failed after dispatch" : "gateway request failed before dispatch";
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
  async function worker() {
    while (next < values.length) {
      const index2 = next++;
      output[index2] = await operation(values[index2], index2);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit3, values.length) }, worker));
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

// src/pricing.ts
var DEFAULT_TOKENS_PER_JOB = 10;
var ESTIMATED_SECONDS_PER_TILE = 10;

// src/billing.ts
var BillingService = class {
  transport;
  constructor(options) {
    this.transport = serviceTransport(options);
  }
  async getPublicPricing() {
    return requireJson(
      await this.transport.requestJson("/billing/pricing"),
      "pricing lookup"
    );
  }
};
var PER_JOB_MODEL_KEYS = Object.freeze({
  "wind-speed": "wind_pix2pix",
  "pedestrian-wind-comfort": "wind_pix2pix",
  "thermal-comfort-index": "utci",
  "thermal-comfort-statistics": "utci",
  "daylight-availability": "daylight_availability",
  "direct-sun-hours": "dsh",
  "solar-radiation": "solar_radiation",
  "sky-view-factors": "svf",
  "daylight-factor": "daylight_factor"
});
function validTokens(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function resolveTokensPerJob(pricing, analysisType) {
  const current = pricing.analysisType?.[analysisType]?.tokens;
  if (validTokens(current)) return current;
  const action = pricing.actionCatalog?.["run-analysis"]?.tokens;
  if (validTokens(action)) return action;
  const legacy = pricing.perJob?.[PER_JOB_MODEL_KEYS[analysisType]]?.tokens;
  if (validTokens(legacy)) return legacy;
  const fallback = pricing.perJob?.default?.tokens;
  return validTokens(fallback) ? fallback : DEFAULT_TOKENS_PER_JOB;
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
  return parseJson(requireCore().validatePolygon(JSON.stringify(polygon)));
}
function grouped(value) {
  return value.toLocaleString("en-US");
}
function capRefusal(verdict) {
  const grid = `the ${verdict.family} grid (${verdict.step_m} m step)`;
  if (verdict.kind === "bbox_too_large") {
    const cost2 = verdict.estimate * DEFAULT_TOKENS_PER_JOB;
    return `Polygon bbox would generate about ${grouped(verdict.estimate)} tiles on ${grid}, over the limit of ${grouped(verdict.limit)} non-empty tiles; a bbox grid that large is refused before a single tile is built. At about ${DEFAULT_TOKENS_PER_JOB} tokens per billed tile that is up to about ${grouped(cost2)} tokens IF every bbox tile were non-empty \u2014 most will not be, so read it as an upper bound. To get past this pre-check, pass maxTilesOverride: ${verdict.min_override} or more; the non-empty cap is checked after it. A bbox this large is more often a coordinate-order mistake (GeoJSON is [lon, lat]).`;
  }
  const cost = verdict.count * DEFAULT_TOKENS_PER_JOB;
  return `Polygon produces ${grouped(verdict.count)} non-empty tiles on ${grid}, over the limit of ${grouped(verdict.limit)}. Each tile is one billed job at about ${DEFAULT_TOKENS_PER_JOB} tokens, so this run would cost about ${grouped(cost)} tokens. To run it, pass maxTilesOverride: ${verdict.count}; to spend less, shrink the polygon or size it first with previewArea().`;
}
function generateTilesForPolygon(polygon, options = {}) {
  const limit3 = optionalUsize(options.maxTilesOverride, "maxTilesOverride");
  const verdict = parseJson(
    requireCore().generateTilesForPolygon(
      JSON.stringify(polygon),
      options.analysisType ?? void 0,
      limit3
    )
  );
  if (!verdict.ok) throw new Error(capRefusal(verdict));
  return verdict.tiles;
}
function getTilingConfig(analysisType) {
  const wire = parseJson(
    requireCore().getTilingConfig(analysisType ?? void 0)
  );
  return {
    inferenceSizeM: wire.inference_size_m,
    inferenceSizeCells: wire.inference_size_cells,
    contextSizeM: wire.context_size_m,
    stepM: wire.step_m,
    stepCells: wire.step_cells,
    cellSizeM: wire.cell_size_m
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
  const origin = requireCore().scalarPolygonOriginF64(new Uint8Array(pairs.buffer));
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
  constructor(url, detail, status) {
    super(`${url}: ${detail}`);
    this.status = status;
  }
  name = "GeodataFetchError";
};
var GeodataRangeError = class extends GeodataError {
  constructor(url, detail, status) {
    super(`${url}: ${detail}`);
    this.status = status;
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
    const step = await reader.read();
    if (step.done) break;
    const chunk2 = step.value;
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

// src/geodata/retry.ts
var MAX_RANGE_ATTEMPTS = 3;
var MIN_BACKOFF_MS = 250;
var MAX_BACKOFF_MS = 1e3;
function pathOf(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
function transientStatus(status) {
  return status === 429 || status >= 500 && status < 600;
}
var RangeRetry = class {
  constructor(url, callerIfMatch, logger = consoleLogger) {
    this.url = url;
    this.logger = logger;
    this.tag = callerIfMatch;
  }
  /** Attempts already finished. */
  attempts = 0;
  /** A `200` answer to a `Range` request is asked again at most once. */
  wholeObjectRetries = 0;
  tag;
  /** `If-Match` for the next attempt: the entity tag of the logical read. */
  headers() {
    return this.tag === void 0 ? {} : { "If-Match": this.tag };
  }
  /**
   * Record the entity tag an answer carried, or refuse the answer.
   *
   * The first answer of a read that named no tag pins one, so a retry cannot
   * silently read a different file. A later answer under another tag is the
   * object having been replaced under the read — the same event a 412 names,
   * reported the same way, for a host that ignores `If-Match`.
   */
  observe(etag) {
    if (etag === void 0 || etag === "") return;
    if (this.tag === void 0) {
      this.tag = etag;
      return;
    }
    if (this.tag !== etag) {
      throw new GeodataRangeError(
        this.url,
        `the object changed between two attempts of one read (entity tag ${this.tag} became ${etag})`,
        412
      );
    }
  }
  /**
   * True when a `200` answer to this `Range` request is worth asking again.
   *
   * Read BEFORE the body: a `200` means the server ignored the range and is
   * offering the whole object, which on the world FlatGeobufs is gigabytes.
   * Asking again costs one request; reading it first costs up to the 8 MiB
   * cap. When this is false — the one re-ask is spent, or no attempt is left
   * — the answer falls to the existing whole-object rule, which accepts a
   * small object and refuses a large one.
   */
  willAskAgainForWholeObject() {
    return this.wholeObjectRetries === 0 && this.attempts + 1 < MAX_RANGE_ATTEMPTS;
  }
  /**
   * The wait before the next attempt, or `undefined` when the read must fail.
   *
   * Called once per failed attempt. It counts the attempt, so a caller that
   * asks twice about one failure gets one retry, not two.
   */
  next(error) {
    this.attempts += 1;
    if (this.attempts >= MAX_RANGE_ATTEMPTS) return void 0;
    const reason2 = this.reasonFor(error);
    if (reason2 === void 0) return void 0;
    if (reason2 === "whole-object") this.wholeObjectRetries += 1;
    const waitMs = MIN_BACKOFF_MS + Math.random() * (MAX_BACKOFF_MS - MIN_BACKOFF_MS);
    this.logger.warn(
      `range read retry attempt=${this.attempts + 1}/${MAX_RANGE_ATTEMPTS} reason=${reason2} path=${pathOf(this.url)} wait_ms=${Math.round(waitMs)}`
    );
    return waitMs;
  }
  /** Attempts finished so far — the evidence a gate run reports. */
  get attemptsMade() {
    return this.attempts;
  }
  reasonFor(error) {
    if (!(error instanceof GeodataError)) return "connection";
    const status = error.status;
    if (status === void 0) return void 0;
    if (status === 200) {
      return this.wholeObjectRetries === 0 ? "whole-object" : void 0;
    }
    if (status === 429) return "throttled";
    if (transientStatus(status)) return "server";
    return void 0;
  }
};

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
        const step = await reader.read();
        if (step.done) {
          controller.close();
          return;
        }
        this.touch();
        controller.enqueue(step.value);
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

// src/geodata/range-answer.ts
var MAX_HTTP_200_BYTES = 8 * 1024 * 1024;
var MAX_RANGE_BYTES = 64 * 1024 * 1024;
var CONTENT_RANGE = /^bytes (\d+)-(\d+)\/(\d+|\*)$/;
function etagOf(response) {
  return response.headers.get("etag") ?? void 0;
}
function assertOneUnencodedRange(url, response) {
  const type = (response.headers.get("content-type") ?? "").toLowerCase();
  if (type.startsWith("multipart/byteranges")) {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      "the answer is multipart/byteranges; this reader asks for one range and reads one range",
      206
    );
  }
  const encoding = (response.headers.get("content-encoding") ?? "").trim().toLowerCase();
  if (encoding !== "" && encoding !== "identity") {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      `the range answer is encoded as ${encoding}; lengths are checked on decoded bytes, so only identity is accepted`,
      206
    );
  }
}
function parseContentRange(url, response) {
  const raw = response.headers.get("content-range");
  const match = raw === null ? null : CONTENT_RANGE.exec(raw.trim());
  if (match === null) {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      raw === null ? "the range answer carries no content-range" : `content-range is not one byte range: ${raw}`,
      206
    );
  }
  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = match[3] === "*" ? void 0 : Number(match[3]);
  const usable = Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start && (total === void 0 || Number.isSafeInteger(total) && total > end);
  if (!usable) {
    cancelBody(response);
    throw new GeodataRangeError(url, `content-range is not a usable byte range: ${raw}`, 206);
  }
  return { start, end, ...total === void 0 ? {} : { total } };
}
async function readPartialAnswer(url, response, start, endExclusive) {
  assertOneUnencodedRange(url, response);
  const range2 = parseContentRange(url, response);
  const requestedEnd = endExclusive === void 0 ? void 0 : endExclusive - 1;
  const expectedEnd = requestedEnd === void 0 ? range2.end : range2.total === void 0 ? requestedEnd : Math.min(requestedEnd, range2.total - 1);
  if (range2.start !== start || range2.end !== expectedEnd) {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      `content-range answers bytes ${range2.start}-${range2.end}, not the requested ${start}-${requestedEnd ?? "end"}`,
      206
    );
  }
  const expected = range2.end - range2.start + 1;
  if (expected > MAX_RANGE_BYTES) {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      `the range answer announces ${expected} bytes; the limit for one range is ${MAX_RANGE_BYTES} bytes`,
      206
    );
  }
  const bytes = await readCappedBody(response, {
    cap: expected,
    fail: (detail) => new GeodataRangeError(url, `the range answer ${detail}`, 206)
  });
  if (bytes.byteLength !== expected) {
    throw new GeodataRangeError(
      url,
      `the range answer carries ${bytes.byteLength} bytes, not the ${expected} bytes of its content-range`,
      206
    );
  }
  const etag = etagOf(response);
  return {
    bytes,
    ...range2.total === void 0 ? {} : { totalSize: range2.total },
    ...etag === void 0 ? {} : { etag }
  };
}
async function readWholeObjectAnswer(url, response, start, endExclusive) {
  const declared = declaredLength(response);
  if (declared !== void 0 && declared > MAX_HTTP_200_BYTES) {
    cancelBody(response);
    throw new GeodataRangeError(
      url,
      `a range request was answered with 200 and ${declared} bytes; the limit is ${MAX_HTTP_200_BYTES} bytes`,
      200
    );
  }
  const whole = await readCappedBody(response, {
    cap: MAX_HTTP_200_BYTES,
    fail: (detail) => new GeodataRangeError(url, `a range request was answered with 200 and it ${detail}`, 200)
  });
  const needed = endExclusive ?? start;
  if (whole.byteLength < needed) {
    throw new GeodataRangeError(
      url,
      `a range request was answered with 200 and ${whole.byteLength} bytes, which do not reach the requested bytes ${start}-${needed}`,
      200
    );
  }
  const etag = etagOf(response);
  return {
    bytes: whole.slice(start, endExclusive ?? whole.byteLength),
    totalSize: whole.byteLength,
    ...etag === void 0 ? {} : { etag }
  };
}

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
async function withRequest(url, headers, options, use, retry) {
  const checked = assertAllowedUrl(url);
  const timeoutMs = options.timeoutMs ?? DEFAULT_PUBLIC_TIMEOUT_MS;
  const deadline = new Deadline(options.signal, timeoutMs);
  const signal = deadline.controller.signal;
  const step = (work) => deadline.wait(work);
  const stopped = (error) => new GeodataFetchError(checked, stopDetail(error, deadline, timeoutMs));
  const stallMs = options.stallTimeoutMs ?? STALL_TIMEOUT_MS;
  try {
    for (; ; ) {
      const watch = retry !== void 0 && stallMs < timeoutMs ? new StallWatch(signal, stallMs) : void 0;
      try {
        const response = await step(
          () => fetchImpl(options)(checked, {
            headers: {
              "User-Agent": DATA_USER_AGENT,
              ...headers,
              ...retry === void 0 ? {} : retry.headers()
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
        return await step(() => use(watch === void 0 ? response : watch.watch(response)));
      } catch (caught) {
        const error = watch?.stalled === true ? new Error(`no data arrived for ${stallMs} ms`) : caught;
        const waitMs = deadline.reason() === void 0 ? retry?.next(error) : void 0;
        if (waitMs === void 0) {
          if (error instanceof GeodataError) throw error;
          throw stopped(error);
        }
        try {
          await step(() => delay(waitMs, signal));
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
function stopDetail(error, deadline, timeoutMs) {
  const stopped = deadline.reason();
  if (stopped === "timeout") {
    return `the answer and its body did not complete within ${timeoutMs} ms`;
  }
  if (stopped === "aborted") return "the caller aborted the request";
  return `request failed: ${error instanceof Error ? error.message : String(error)}`;
}
async function fetchPublicText(url, options = {}) {
  const retry = new RangeRetry(url, void 0, options.logger);
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
function resolveReadAnalysisType(analysisType) {
  const name = (analysisType ?? "").trim();
  return name === "" ? WIDEST_READ_ANALYSIS_TYPE : name;
}
function readMarginM(analysisType) {
  return getTilingConfig(resolveReadAnalysisType(analysisType)).contextSizeM / 2;
}
function groundReadDistanceM(analysisType) {
  return Math.ceil(Math.SQRT2 * readMarginM(analysisType));
}
var ReadMarginError = class extends Error {
  layer;
  acquiredMarginM;
  acquiredAnalysisType;
  requiredMarginM;
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
  const named2 = layer.analysisType;
  return {
    readMarginM: value,
    ...typeof named2 === "string" ? { analysisType: named2 } : {}
  };
}
var LAYER_REQUIREMENT = {
  buildings: readMarginM,
  "ground materials": groundReadDistanceM,
  trees: groundReadDistanceM
};
function requiredMarginM(layer, analysisType) {
  const derive = LAYER_REQUIREMENT[layer];
  if (derive === void 0) {
    throw new TypeError(
      `unknown acquisition layer ${JSON.stringify(layer)}; known layers are ${Object.keys(LAYER_REQUIREMENT).sort().join(", ")}`
    );
  }
  return derive(analysisType);
}
function checkReadMargin(acquired, layer, analysisTypes) {
  const record4 = recordedMargin(acquired);
  if (record4 === void 0) return;
  const names = analysisTypes.length === 0 ? [void 0] : analysisTypes;
  let widest = names[0];
  let required = requiredMarginM(layer, widest);
  for (const name of names.slice(1)) {
    const candidate = requiredMarginM(layer, name);
    if (candidate > required) {
      required = candidate;
      widest = name;
    }
  }
  if (record4.readMarginM >= required) return;
  throw new ReadMarginError({
    layer,
    acquiredMarginM: record4.readMarginM,
    ...record4.analysisType === void 0 ? {} : { acquiredAnalysisType: record4.analysisType },
    requiredMarginM: required,
    ...widest == null ? {} : { requiredAnalysisType: widest }
  });
}

// src/geodata/range-transport.ts
function httpRangeTransport(options = {}) {
  const sizes = /* @__PURE__ */ new Map();
  async function ranged(url, start, endExclusive, read) {
    const range2 = endExclusive === void 0 ? `bytes=${start}-` : `bytes=${start}-${endExclusive - 1}`;
    const retry = new RangeRetry(url, read?.ifMatch, options.logger);
    const answer = await withRequest(
      url,
      {
        Range: range2,
        // Lengths are checked on decoded bytes, so an encoded range answer
        // cannot be checked at all. Browser handling of this header varies;
        // the answer is checked as well as asked for. Hosts must allow it
        // in CORS when a browser sends it.
        "Accept-Encoding": "identity"
      },
      options,
      async (response) => {
        if (response.status === 412) {
          cancelBody(response);
          throw new GeodataRangeError(
            url,
            "the object changed between two ranges of one read (If-Match failed)",
            412
          );
        }
        if (response.status !== 200 && response.status !== 206) {
          cancelBody(response);
          throw new GeodataFetchError(url, `HTTP ${response.status}`, response.status);
        }
        try {
          retry.observe(response.headers.get("etag") ?? void 0);
        } catch (stale) {
          cancelBody(response);
          throw stale;
        }
        if (response.status === 200 && retry.willAskAgainForWholeObject()) {
          cancelBody(response);
          throw new GeodataRangeError(
            url,
            "a range request was answered with 200; the range is asked for once more",
            200
          );
        }
        return response.status === 200 ? await readWholeObjectAnswer(url, response, start, endExclusive) : await readPartialAnswer(url, response, start, endExclusive);
      },
      retry
    );
    if (answer.totalSize !== void 0) sizes.set(url, answer.totalSize);
    return answer;
  }
  return {
    async byteLength(url) {
      const cached = sizes.get(url);
      if (cached !== void 0) return cached;
      const first = await ranged(url, 0, 1, void 0);
      const total = first.totalSize ?? sizes.get(url);
      if (total === void 0) throw new GeodataFetchError(url, "no usable content-range");
      sizes.set(url, total);
      return total;
    },
    read: (url, start, endExclusive, read) => ranged(url, start, endExclusive, read)
  };
}

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
async function fetchSourcesEntry(options = {}) {
  const now2 = options.now ?? Date.now();
  if (sourcesCache !== void 0 && now2 - sourcesCache.fetchedAt < SOURCES_TTL_MS) {
    return sourcesCache;
  }
  const text = await fetchPublicText(`${GEO_BASE_URL}/sources.json`, options);
  const document2 = JSON.parse(text);
  sourcesCache = { fetchedAt: now2, document: document2, text };
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
  const cached = polygonCache.get(url);
  if (cached !== void 0) return cached;
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
  const cached = overtureCache.get(collection);
  if (pinned !== void 0 && cached?.release === pinned) {
    return { manifestJson: cached.manifestJson, release: cached.release };
  }
  const pointer = await fetchPublicJson(
    `${OVERTURE_INDEX_BASE}/${pointerKey(collection)}`,
    options
  );
  const release3 = pinned ?? pointer.release;
  if (cached !== void 0 && cached.release === release3) {
    return { manifestJson: cached.manifestJson, release: release3 };
  }
  const pointerPath = pointer.manifest_key.split("/").slice(1).join("/") || pointer.manifest_key;
  const key = pinned === void 0 ? pointerPath : pointerPath.replace(pointer.release, pinned);
  if (pinned !== void 0 && key === pointerPath && pinned !== pointer.release) {
    throw new GeodataError(
      `cannot pin ${collection} to Overture release ${pinned}: the pointer key ${pointer.manifest_key} does not carry release ${pointer.release}`
    );
  }
  const manifestJson = await fetchPublicText(`${OVERTURE_INDEX_BASE}/${key}`, options);
  overtureCache.set(collection, { release: release3, manifestJson });
  return { manifestJson, release: release3 };
}
async function selectOvertureFiles(collection, bbox, options = {}) {
  if (!INDEXED_COLLECTIONS.includes(collection)) {
    return { urls: [], release: options.overtureRelease ?? "" };
  }
  const { manifestJson, release: release3 } = await fetchOvertureManifest(collection, options);
  const urls = requireCore().overtureSelectFiles(
    manifestJson,
    bbox.west,
    bbox.south,
    bbox.east,
    bbox.north
  );
  return { urls: urls.map((url) => assertAllowedUrl(url)), release: release3 };
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
var MAX_PLANNED_RANGE_BYTES = 64 * 1024 * 1024;
var MAX_PLANNED_TOTAL_BYTES = 256 * 1024 * 1024;
var objectCache = /* @__PURE__ */ new Map();
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
var RangeBudget = class {
  constructor(url) {
    this.url = url;
  }
  spent = 0;
  take(length) {
    if (length > MAX_PLANNED_RANGE_BYTES) {
      throw new GeodataRangeError(
        this.url,
        `the kernel planned a ${length}-byte range, over the ${MAX_PLANNED_RANGE_BYTES}-byte per-range cap`
      );
    }
    this.spent += length;
    if (this.spent > MAX_PLANNED_TOTAL_BYTES) {
      throw new GeodataRangeError(
        this.url,
        `the kernel planned ${this.spent} bytes for one read, over the ${MAX_PLANNED_TOTAL_BYTES}-byte total cap`
      );
    }
  }
};
function checkedRange(url, range2, fileSize, budget) {
  const start = Number(range2[0]);
  const length = Number(range2[1]);
  if (!Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length <= 0) {
    throw new GeodataError(
      `${url}: the kernel planned an unusable range [${String(range2[0])}, ${String(range2[1])}]`
    );
  }
  budget.take(length);
  if (start + length > fileSize) {
    throw new GeodataError(
      `${url}: the kernel planned a range past the end of the file ([${start}, ${length}] of ${fileSize} bytes)`
    );
  }
  return [start, length];
}
async function openObject(url, transport3, layout) {
  const first = await transport3.read(url, 0, HEADER_PREFIX_BYTES);
  const key = cacheKey(url, first.etag);
  const cached = objectCache.get(key);
  if (cached !== void 0) return cached;
  const fileSize = first.totalSize ?? await transport3.byteLength(url);
  const shape = layout(first.bytes);
  const required = Number(shape.required_prefix_len ?? shape.header_len);
  if (!Number.isInteger(required) || required <= 0 || required > MAX_HEADER_BYTES) {
    throw new GeodataError(`${url}: the kernel reported an unusable header size ${required}`);
  }
  const header = required <= first.bytes.byteLength ? first.bytes.subarray(0, required) : (await transport3.read(url, 0, required, {
    ...first.etag === void 0 ? {} : { ifMatch: first.etag }
  })).bytes;
  const entry = { etag: first.etag, fileSize, header, topNodes: [] };
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
  const budget = new RangeBudget(url);
  const fetchedNodes = [...cache2.topNodes];
  let step;
  for (let attempt = 0; attempt < MAX_SEARCH_STEPS; attempt += 1) {
    step = searchStep(
      cache2.header,
      bbox.west,
      bbox.south,
      bbox.east,
      bbox.north,
      cache2.fileSize,
      fetchedNodes
    );
    if (step.need.length === 0) break;
    for (const range2 of step.need) {
      const [start, length] = checkedRange(url, range2, cache2.fileSize, budget);
      const answer = await transport3.read(url, start, start + length, ifMatch);
      fetchedNodes.push({ offset: start, bytes: answer.bytes });
    }
    if (attempt === 0 && cache2.topNodes.length === 0) {
      cache2.topNodes = [...fetchedNodes];
    }
  }
  if (step === void 0 || step.need.length > 0) {
    throw new GeodataError(`${url}: the index search did not converge`);
  }
  if (step.features.length === 0) return '{"type":"FeatureCollection","features":[]}';
  const chunks = [];
  for (const range2 of step.features) {
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

// src/geodata/overture-cache.ts
var OVERTURE_METADATA_CACHE_LIMIT = 50;
var entries = /* @__PURE__ */ new Map();
async function cachedOvertureMetadata(release3, url, load) {
  const key = `${release3}${url}`;
  const cached = entries.get(key);
  if (cached !== void 0) {
    entries.delete(key);
    entries.set(key, cached);
    return cached;
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
var OVERTURE_PLANNED_BYTES_LIMIT = plannedBytesLimitFor(isNode());
var OVERTURE_HOST_CONCURRENCY = hostConcurrencyFor(isNode());
function plannedBytesLimitFor(node) {
  return node ? 512 * 1024 * 1024 : 256 * 1024 * 1024;
}
function hostConcurrencyFor(node) {
  return node ? 16 : 6;
}
function isNode() {
  const runtime = globalThis.process;
  return typeof runtime?.versions?.node === "string";
}
function plannedBudget(limit3 = OVERTURE_PLANNED_BYTES_LIMIT) {
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
    const { DEFAULT_PARSERS: defaults } = convert;
    const { wkbToGeojson } = wkb;
    if (defaults === void 0 || typeof wkbToGeojson !== "function") return void 0;
    const keep = (bytes) => bytes;
    return {
      // hyparquet takes the parser set as given, so it must be complete.
      parsers: { ...defaults, geometryFromBytes: keep, geographyFromBytes: keep },
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
  const { urls, release: release3 } = await selectOvertureFiles(collection, fileBbox, options);
  if (options.maxFiles !== void 0 && urls.length > options.maxFiles) {
    throw new OvertureFileLimitError(collection, urls.length, options.maxFiles);
  }
  return { urls, release: release3 };
}
async function readOvertureRows(collection, bbox, options, map) {
  const columns = COLUMNS_BY_COLLECTION[collection];
  if (columns === void 0) {
    throw new GeodataError(`${collection} has no published Overture file index`);
  }
  const { urls, release: release3 } = await selectFiles(collection, bbox, options);
  if (urls.length === 0) return { rows: [], release: release3 };
  const { parquet, compressors, geometry: raw } = await loadParquet();
  const transport3 = options.transport ?? httpRangeTransport(options);
  const plans2 = await mapLimit(
    urls,
    OVERTURE_FILE_CONCURRENCY,
    async (url) => {
      const described = await cachedOvertureMetadata(release3, url, async () => {
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
  const tasks = plans2.flatMap((plan) => plan.groups.map((group) => ({ plan, group })));
  const budget = options.budget ?? plannedBudget(options.maxPlannedBytes);
  budget.add(
    collection,
    bbox,
    plans2.reduce((sum, plan) => sum + plan.bytes, 0),
    plans2.length,
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
  return { rows: decoded.flat(), release: release3 };
}

// src/geodata/overture.ts
async function requireOvertureReader() {
  await loadParquet();
}
async function readOvertureCollection(collection, bbox, options = {}) {
  const { rows, release: release3 } = await readOvertureRows(
    collection,
    bbox,
    options,
    (row) => row.feature
  );
  return { features: rows, release: release3 };
}
async function readOvertureCollectionJson(collection, bbox, options = {}) {
  const { features, release: release3 } = await readOvertureCollection(collection, bbox, options);
  return {
    json: `[${features.map((feature) => JSON.stringify(feature)).join(",")}]`,
    release: release3
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

// src/geodata/ground.ts
var ROADS_URL = `${GEO_BASE_URL}/roads-surface-world.fgb`;
var GROUND_COLLECTIONS = Object.freeze([
  "land_cover",
  "land_use",
  "water"
]);
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
  const { rows, release: release3 } = await readOvertureRows(
    collection,
    bbox,
    options,
    (row) => row.box === void 0 ? { json: JSON.stringify(row.feature) } : { json: JSON.stringify(row.feature), box: row.box }
  );
  return { features: rows, release: release3 };
}
function tileFeaturesJson(features, bbox) {
  const parts = [];
  const meets = boxesMeet(features.map((feature) => feature.box), bbox);
  for (const [index2, feature] of features.entries()) {
    if (meets[index2] === 1) parts.push(feature.json);
  }
  return `[${parts.join(",")}]`;
}

// src/geodata/site-chunks.ts
var SITE_CHUNK_THRESHOLD_KM2 = 4;
var SITE_AREA_WARNING_KM2 = 20;
var SITE_EXTENT_WARNING_KM = 5;
var SITE_CHUNK_EDGE_M = 2e3;
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
function bboxAreaKm2(bbox) {
  const midLat = (bbox.south + bbox.north) / 2;
  const height = (bbox.north - bbox.south) * METERS_PER_DEG_LAT;
  const width = (bbox.east - bbox.west) * METERS_PER_DEG_LAT * Math.cos(midLat * Math.PI / 180);
  return Math.max(0, height) * Math.max(0, width) / 1e6;
}
function withPieces(id, bbox, rectangles) {
  const pieces = decompose(bbox, rectangles);
  if (pieces.length === 0) throw new Error("no read chunk meets any tile rectangle");
  return named(id, bbox, pieces);
}
function namePieces(id, pieces) {
  return pieces.length === 1 ? [{ id, bbox: pieces[0] }] : pieces.map((piece, index2) => ({ id: `${id}-p${String(index2)}`, bbox: piece }));
}
function named(id, bbox, pieces) {
  return { id, bbox, pieces: namePieces(id, pieces) };
}
function siteChunks(site, used, logger = consoleLogger) {
  warnIfOverOneFrame(site, logger);
  const rectangles = used ?? [site];
  if (bboxAreaKm2(site) <= SITE_CHUNK_THRESHOLD_KM2) {
    return [withPieces("site", site, rectangles)];
  }
  const midLat = (site.south + site.north) / 2;
  const stepLat = SITE_CHUNK_EDGE_M / METERS_PER_DEG_LAT;
  const stepLon = SITE_CHUNK_EDGE_M / (METERS_PER_DEG_LAT * Math.max(Math.cos(midLat * Math.PI / 180), 1e-6));
  const rows = Math.max(1, Math.ceil((site.north - site.south) / stepLat));
  const cols = Math.max(1, Math.ceil((site.east - site.west) / stepLon));
  const chunks = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const bbox = {
        west: site.west + col * (site.east - site.west) / cols,
        east: site.west + (col + 1) * (site.east - site.west) / cols,
        south: site.south + row * (site.north - site.south) / rows,
        north: site.south + (row + 1) * (site.north - site.south) / rows
      };
      const pieces = decompose(bbox, rectangles);
      if (pieces.length === 0) continue;
      chunks.push(named(`chunk-r${String(row)}c${String(col)}`, bbox, pieces));
    }
  }
  if (chunks.length === 0) throw new Error("no read chunk meets any tile rectangle");
  return chunks;
}
function warnIfOverOneFrame(site, logger) {
  const midLat = (site.south + site.north) / 2;
  const cosMid = Math.cos(midLat * Math.PI / 180);
  const widthM = (site.east - site.west) * METERS_PER_DEG_LAT * cosMid;
  const heightM = (site.north - site.south) * METERS_PER_DEG_LAT;
  const area = bboxAreaKm2(site);
  if (area > SITE_AREA_WARNING_KM2) {
    const error = Math.abs(1 - Math.cos(site.north * Math.PI / 180) / cosMid) * 100;
    logger.warn(
      `this area is ${area.toFixed(1)} km2, above the ${SITE_AREA_WARNING_KM2} km2 one run is recommended for: every layer is stored in ONE local frame whose east-west scale is fixed at its origin latitude, so shapes at the far corner are off by about ${error.toFixed(2)} %. Results stay usable; for exact geometry split the area into several area runs \u2014 raster results are geo-referenced by bounds and stitch by lat/lon.`
    );
  }
  const longestM = Math.max(widthM, heightM);
  if (longestM > SITE_EXTENT_WARNING_KM * 1e3) {
    logger.warn(
      `this site is ${(longestM / 1e3).toFixed(1)} km along its longest side, above the ${SITE_EXTENT_WARNING_KM.toFixed(1)} km one run is recommended for: every layer is stored in ONE local frame whose east-west scale is fixed at its origin latitude, so the far-end error grows with EXTENT, not with area \u2014 a long, narrow site carries the error of a site as long. Here it is about ${farEndErrorM(site.south, longestM).toFixed(2)} m. Results stay usable; for exact geometry split the site into several area runs \u2014 raster results are geo-referenced by bounds and stitch by lat/lon.`
    );
  }
}
function farEndErrorM(southLat, extentM) {
  const cosOrigin = Math.cos(southLat * Math.PI / 180);
  if (cosOrigin === 0) return 0;
  const farLat = southLat + extentM / METERS_PER_DEG_LAT;
  return Math.abs(1 - Math.cos(farLat * Math.PI / 180) / cosOrigin) * extentM;
}
function siteRectangle(rectangles) {
  return unionBbox(rectangles);
}
async function eachChunk(chunks, task, requested, signal) {
  if (requested !== void 0 && (!Number.isSafeInteger(requested) || requested < 1)) {
    throw new TypeError("maxWorkers must be a positive integer");
  }
  const out = Array.from({ length: chunks.length });
  const failures2 = [];
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
        failures2.push({ index: index2, id: chunk2.id, error });
      }
    }
  }));
  if (signal?.aborted === true) throw signal.reason ?? new DOMException("aborted", "AbortError");
  if (failures2.length > 0) throw siteReadFailure(failures2, chunks.length);
  return out;
}
function siteReadFailure(failures2, total) {
  const ordered = [...failures2].sort((left, right) => left.index - right.index);
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
  const named2 = namePieces("site", pieces);
  const answer = extrudeAll(collectionJson, source, named2, defaultHeightM);
  const buildings = {};
  for (const piece of named2) {
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
  warnIfOverOneFrame(site, options.logger ?? consoleLogger);
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

// src/buildings.ts
var BuildingsService = class {
  request;
  /** The client's logger: an overlay degrade is reported through it. */
  logger;
  constructor(options) {
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs },
      // A retry of a public read reports through the client's logger.
      ...options.logger === void 0 ? {} : { logger: options.logger }
    };
    this.logger = options.logger ?? consoleLogger;
  }
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
    return this.directArea(polygon, options, performance.now());
  }
  /**
   * Footprints read straight from the public hosts and extruded ONCE.
   *
   * The area is read for one site rectangle (in ~2x2 km chunks when it is
   * large), normalised once and extruded once in the site frame, and the
   * bodies are then moved into the POLYGON's frame — the canonical D1 origin
   * the payload path and the tile grid both use. Up to 0.12 this read,
   * normalised and extruded per tile and offset the results into the grid,
   * which mixed two frames (D48).
   */
  async directArea(polygon, options, started) {
    const analysisType = resolveReadAnalysisType(options.analysisType);
    const halfExtentM = readMarginM(analysisType);
    const grid = generateTilesForPolygon(polygon, {
      analysisType,
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
        analysisType
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
      analysisType,
      ...overtureRelease === void 0 ? {} : { overtureRelease }
    };
  }
};

// src/area/config-hash.ts
function kernelConfigHash(fields) {
  return requireCore().configHash(JSON.stringify(fields));
}
function kernelFacadeConfigHash(fields, buildings) {
  const config = kernelConfigHash(fields);
  return kernelConfigHash({ config, buildings: buildings ?? {} });
}
var FOLDED_HASH_GROUPS = ["context-geometry", "ground-geometry", "vegetation"];
var CONFIG_HASH_FOLD_CONTRACT_VERSION = 5;
function foldGeometryGroup(name, value) {
  const hash = requireCore().geometryGroupHash(name, JSON.stringify(value));
  return typeof hash === "string" ? { "group-hash": hash } : value;
}
function foldHashFields(fields) {
  const output = { ...fields };
  for (const name of FOLDED_HASH_GROUPS) {
    if (output[name] === void 0) continue;
    output[name] = foldGeometryGroup(name, output[name]);
  }
  return output;
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

// src/internal/kernel-group.ts
var EMPTY = { bytes: new TextEncoder().encode("{}"), hash: void 0 };
var KernelGroup = class {
  #text;
  #load;
  #empty;
  #ids;
  /**
   * `empty`: the group holds no mesh, known from the plan without writing it
   * (its text is `{}`). `ids`: a batch's `geometries`, the targets it counted.
   */
  constructor(load, empty, ids) {
    this.#load = load;
    this.#empty = empty;
    this.#ids = ids;
  }
  /** True when the group holds no mesh. */
  get empty() {
    return this.#empty;
  }
  /** The target ids of a batch's `geometries`, or `undefined` for other groups. */
  get ids() {
    return this.#ids;
  }
  /** The kernel's text, written on the first ask and kept. */
  text() {
    if (this.#text === void 0) this.#text = this.#empty ? EMPTY : this.#load();
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

// src/request-validation.ts
var MAX_SENSOR_POINTS = 1e5;
var SURFACE_TYPES = /* @__PURE__ */ new Set([
  "sky-view-factors",
  "solar-radiation",
  "direct-sun-hours",
  "daylight-availability"
]);
var TERRAIN_TYPES = /* @__PURE__ */ new Set([
  ...SURFACE_TYPES,
  "thermal-comfort-index",
  "thermal-comfort-statistics"
]);
var INTERIOR_TYPES = /* @__PURE__ */ new Set(["daylight-factor", "energy-balance", "spatial-daylight-autonomy"]);
var TCS_SUBTYPES = /* @__PURE__ */ new Set(["thermal-comfort", "heat-stress", "cold-stress"]);
var SURFACE_FIELDS = [
  "analysis-surfaces",
  "sensor-points",
  "sensor-normals",
  "context-geometry",
  "surface-grid-size",
  "surface-offset",
  "emit-cell-tris"
];
var TERRAIN_FIELDS = ["ground-geometry"];
var ALIGNMENT_FIELDS = ["terrain-alignment"];
var ALIGNMENT_TYPES = /* @__PURE__ */ new Set([
  ...TERRAIN_TYPES,
  "wind-speed",
  "pedestrian-wind-comfort"
]);
var TERRAIN_ALIGNMENT_MODES = /* @__PURE__ */ new Set(["as-is", "auto-align", "assume-aligned"]);
var GRADE_ALIGNMENT_MODES = /* @__PURE__ */ new Set(["to-ground", "as-is"]);
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
  if (surfaces2 != null && (typeof surfaces2 !== "string" || !["facades", "roofs", "all"].includes(surfaces2))) {
    throw new TypeError("analysis-surfaces must be facades, roofs, or all");
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
    if (points.length > MAX_SENSOR_POINTS) {
      throw new TypeError(`sensor-points length exceeds the maximum of ${MAX_SENSOR_POINTS}`);
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
  if (gridSize != null && (typeof gridSize !== "number" || !Number.isFinite(gridSize) || gridSize < 0.25)) {
    throw new TypeError("surface-grid-size must be a finite number >= 0.25 m");
  }
  const offset = input["surface-offset"];
  if (offset != null && (typeof offset !== "number" || !Number.isFinite(offset) || offset < 0)) {
    throw new TypeError("surface-offset must be a finite number >= 0");
  }
  if (emitCellTris != null && typeof emitCellTris !== "boolean") {
    throw new TypeError("emit-cell-tris must be a Boolean");
  }
  if (emitCellTris != null && surfaces2 == null) {
    throw new TypeError("emit-cell-tris only applies to analysis-surfaces requests");
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
    const indices = mesh.indices;
    let indexCount = 0;
    if (typeof mesh.indices_bin === "string") indexCount = packedIndexCount(mesh, key) ?? 0;
    else if (Array.isArray(indices)) indexCount = indices.length;
    else if (ArrayBuffer.isView(indices) && "length" in indices && typeof indices.length === "number") {
      indexCount = indices.length;
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
    if (typeof chosen !== "string" || !(grade ? GRADE_ALIGNMENT_MODES : TERRAIN_ALIGNMENT_MODES).has(chosen)) {
      throw new TypeError(grade ? "terrain-alignment must be to-ground or as-is on the wind models" : "terrain-alignment must be as-is, auto-align, or assume-aligned");
    }
  }
  if (typeof type !== "string" || INTERIOR_TYPES.has(type)) return;
  if (type === "thermal-comfort-statistics") {
    const subtype = input.subtype;
    if (typeof subtype !== "string" || !TCS_SUBTYPES.has(subtype)) {
      throw new TypeError(
        `subtype (one of ${[...TCS_SUBTYPES].join(", ")}) is required on 'thermal-comfort-statistics'`
      );
    }
  }
  const surface = present(input, SURFACE_FIELDS);
  if (surface.length > 0 && !SURFACE_TYPES.has(type)) {
    throw new TypeError(`${surface.join(", ")} not valid on '${type}'`);
  }
  const terrain = present(input, TERRAIN_FIELDS);
  if (terrain.length > 0 && !TERRAIN_TYPES.has(type)) {
    throw new TypeError(`${terrain.join(", ")} not valid on '${type}'`);
  }
  const alignment = present(input, ALIGNMENT_FIELDS);
  if (alignment.length > 0 && !ALIGNMENT_TYPES.has(type)) {
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
var MAX_DAY_PER_MONTH = [
  31,
  29,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
];
function integer(value, name) {
  const number2 = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number2)) throw new TypeError(`${name} must be a whole number`);
  return number2;
}
function endpoint(point, label) {
  const month = integer(point?.month, `${label} month`);
  const day = integer(point?.day, `${label} day`);
  const hour = integer(point?.hour, `${label} hour`);
  if (month < 1 || month > 12) throw new TypeError(`${label} month ${month} is not 1-12`);
  if (hour < 0 || hour > 23) throw new TypeError(`${label} hour ${hour} is not 0-23`);
  const longest = MAX_DAY_PER_MONTH[month - 1];
  if (day < 1 || day > longest) {
    throw new TypeError(`${label} day ${day} is not 1-${longest} for month ${month}`);
  }
  return [month, day, hour];
}
function weatherWindow(filters) {
  const period = filters?.period;
  if (period === void 0 || period === null) throw new TypeError("a window needs a period");
  const [startMonth, startDay, startHour] = endpoint(period.start, "start");
  const [endMonth, endDay, endHour] = endpoint(period.end, "end");
  if (endMonth < startMonth) {
    throw new TypeError(
      `time-period wraps across the year (month ${startMonth} to ${endMonth}); no model accepts a wrapping window \u2014 split it into two forward requests instead`
    );
  }
  return {
    start_month: startMonth,
    start_day: startDay,
    start_hour: startHour,
    end_month: endMonth,
    end_day: endDay,
    end_hour: endHour
  };
}
function weatherWindowJson(filters) {
  return JSON.stringify(weatherWindow(filters));
}

// src/weather-epw.ts
var WEATHER_BEARING_ANALYSES = /* @__PURE__ */ new Set([
  "thermal-comfort-index",
  "thermal-comfort-statistics",
  "solar-radiation",
  "energy-balance"
]);
var EpwParseError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "EpwParseError";
  }
};
var WeatherModelInputsError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "WeatherModelInputsError";
  }
};
function reason(error) {
  return error instanceof Error ? error.message : String(error);
}
var WeatherDocument = class {
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
   * columns and the hour basis — never the file name, a station id or the
   * raw text, so two differently formatted files with the same readings
   * share one identity.
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
  /** The EPW `LOCATION` header, as the document records it. */
  get location() {
    return this.document.location ?? {};
  }
  /** Row count, records per hour, leap-year and full-year verdicts. */
  get period() {
    return this.document.period ?? {};
  }
  /** Data rows in the file, before any window is applied. */
  get rows() {
    const rows = this.period.rows;
    return typeof rows === "number" ? rows : 0;
  }
  /**
   * The snake_case arrays one model reads, for one window.
   *
   * The kernel applies the window first, then checks the required fields on
   * the FILTERED rows, then the period rule — so a gap outside the window is
   * harmless, a gap inside it raises, and a model that needs a full year
   * raises on a shorter one. Every rejection reaches the caller BEFORE a
   * request is submitted, and therefore before anything is billed.
   *
   * `solarModel` belongs to `analysisType: "energy-balance"`, the one
   * analysis whose worker reads it; on any other analysis it raises,
   * because nothing in the fleet would read it there. `"irradiance"`
   * selects the interior-irradiance input set and its full-year rule;
   * omitted, or `"legacy-flat"`, selects the two climate arrays that model
   * reads.
   */
  modelInputs(request) {
    const wire = {
      analysis_type: request.analysisType,
      time_period: weatherWindow(request.timePeriod)
    };
    if (request.subtype !== void 0) wire.subtype = request.subtype;
    if (request.solarModel !== void 0) wire.solar_model = request.solarModel;
    try {
      return JSON.parse(
        requireCore().weatherModelInputs(JSON.stringify(this.document), JSON.stringify(wire))
      );
    } catch (error) {
      throw new WeatherModelInputsError(
        `the weather file cannot serve ${request.analysisType} for this window: ${reason(error)}`,
        { cause: error }
      );
    }
  }
  /**
   * The file's hours inside `filters`, one record per hour — the same shape
   * `WeatherService.filterWeatherData` returns for a public station, from a
   * local file and with no network call.
   */
  filterHours(filters) {
    let out;
    try {
      out = requireCore().weatherFilterHours(
        JSON.stringify({ weatherData: this.document.values ?? {} }),
        weatherWindowJson(filters)
      );
    } catch (error) {
      throw new WeatherModelInputsError(
        `this weather file cannot be filtered to that window: ${reason(error)}`,
        { cause: error }
      );
    }
    const filtered = JSON.parse(out).weatherData;
    if (filtered === null || typeof filtered !== "object" || Array.isArray(filtered)) return [];
    return rowsFromColumns(filtered);
  }
};
function rowsFromColumns(columns) {
  const arrays = Object.entries(columns).filter(
    (entry) => Array.isArray(entry[1])
  );
  const rowCount = arrays.reduce((most, [, values]) => Math.max(most, values.length), 0);
  const rows = [];
  for (let index2 = 0; index2 < rowCount; index2 += 1) {
    const record4 = {};
    for (const [field, values] of arrays) {
      record4[field] = index2 < values.length ? values[index2] : null;
    }
    rows.push(record4);
  }
  return rows;
}
function parseEpw(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("parseEpw takes the EPW file's text; read the file first");
  }
  const wire = {};
  if (options.maxBytes !== void 0) wire.max_bytes = options.maxBytes;
  if (options.maxRows !== void 0) wire.max_rows = options.maxRows;
  try {
    return new WeatherDocument(
      JSON.parse(
        requireCore().weatherParseEpw(
          text,
          Object.keys(wire).length === 0 ? "null" : JSON.stringify(wire)
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
  ["pwcCriteria", "pwc-criteria"],
  ["sensorPoints", "sensor-points"],
  ["sensorNormals", "sensor-normals"],
  ["sensorSurfaces", "sensor-surfaces"],
  ["surfaceGridSize", "surface-grid-size"],
  ["surfaceOffset", "surface-offset"],
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
  "emitCellTris"
];
var TERRAIN = ["groundGeometry", "terrainAlignment"];

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
  ...THERMAL_CONTROL_SPELLINGS.filter(([camel, wire]) => camel !== wire).map(([, wire]) => wire)
];
var THERMAL_MODELS = /* @__PURE__ */ new Set([
  "thermal-comfort-index",
  "thermal-comfort-statistics"
]);
var PHYSICS_TIERS = ["v1", "detail", "advanced", "advanced-moist"];
function rejectThermalControls(input, type) {
  for (const [camel, wire] of THERMAL_CONTROL_SPELLINGS) {
    const key = input[camel] !== void 0 && input[camel] !== null ? camel : input[wire] !== void 0 && input[wire] !== null ? wire : void 0;
    if (key === void 0) continue;
    throw new TypeError(
      `${key} is not read by ${type}: the six global thermal controls (${THERMAL_CONTROLS.join(", ")}) are inputs to thermal-comfort-index and thermal-comfort-statistics only. Remove it, or run one of those two.`
    );
  }
}
function validatePhysics(input) {
  const value = input.physics;
  if (value === void 0 || value === null) return;
  if (typeof value !== "string" || !PHYSICS_TIERS.includes(value)) {
    throw new TypeError(
      `physics must be one of ${PHYSICS_TIERS.join(", ")} (got ${JSON.stringify(value)}). thermal-comfort-statistics does not reject an unknown tier server-side \u2014 it runs the advanced engine and bills for it \u2014 so the spelling is checked here.`
    );
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
  const result = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(result)) throw new TypeError(`${name} must be numeric`);
  return result;
}
function range(value) {
  if (typeof value !== "string" || value.length === 0) return void 0;
  const parts = value.split("-").map(Number);
  if (parts.length === 1 && Number.isFinite(parts[0])) return [parts[0], parts[0]];
  if (parts.length === 2 && parts.every(Number.isFinite)) return [parts[0], parts[1]];
  return void 0;
}
function timePeriod(filtersValue) {
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
  weatherWindow(windowOf(resolved));
  return resolved;
}
function weatherRows(value, period) {
  if (Array.isArray(value)) return value.map((row, index2) => record(row, `weatherData[${index2}]`));
  const columns = record(value, "weatherData");
  if (!Array.isArray(columns.month) || !Array.isArray(columns.day) || !Array.isArray(columns.hour)) {
    throw new TypeError("weatherData must be rows or an EPW column object");
  }
  let filtered;
  try {
    filtered = requireCore().weatherFilterHours(
      JSON.stringify({ weatherData: columns }),
      weatherWindowJson(windowOf(period))
    );
  } catch (error) {
    if (error instanceof CoreNotReadyError) throw error;
    throw new TypeError(
      `weatherData could not be filtered to dateFilters.period: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const kept = record(record(JSON.parse(filtered), "weatherData").weatherData, "weatherData");
  const hours = Array.isArray(kept.hour) ? kept.hour : [];
  const output = [];
  for (let index2 = 0; index2 < hours.length; index2 += 1) {
    const row = {};
    for (const [key, column] of Object.entries(kept)) {
      if (Array.isArray(column)) row[key] = column[index2];
    }
    output.push(row);
  }
  return output;
}
function series(rows, key) {
  const output = [];
  for (const [index2, row] of rows.entries()) {
    const value = row[key];
    if (value === null || value === void 0) {
      throw new TypeError(
        `weather column ${key} has no reading at row ${index2} of ${rows.length} in the selected window. A gap in a required column is refused, never filled in: substituting a value would change a billed result. Choose a window without the gap, or bring a file that covers it.`
      );
    }
    output.push(numeric2(value, `weatherData.${key}`));
  }
  return output;
}
function pairedWind(rows) {
  const windSpeed = [];
  const windDirection = [];
  for (const row of rows) {
    if (row.windSpeed === null || row.windSpeed === void 0 || row.windDirection === null || row.windDirection === void 0) continue;
    windSpeed.push(numeric2(row.windSpeed, "weatherData.windSpeed"));
    windDirection.push(numeric2(row.windDirection, "weatherData.windDirection"));
  }
  return { windSpeed, windDirection };
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
    if (raw["analysis-surfaces"] != null) raw["emit-cell-tris"] = false;
    return raw;
  }
  const type = input.analysisType ?? input["analysis-type"];
  if (typeof type !== "string" || type.length === 0) throw new TypeError("area input requires analysisType");
  if (THERMAL_MODELS.has(type)) validatePhysics(input);
  else rejectThermalControls(input, type);
  let output = { ...input };
  if (output.analysisSurfaces != null) output.emitCellTris = false;
  if (output.dateFilters === void 0) {
    if (byoWeather !== void 0) {
      throw new TypeError(
        "weather (a parsed EPW document) requires dateFilters: the window is what selects the hours a model reads, and without it no arrays can be built from the file."
      );
    }
    return output;
  }
  const filters = record(output.dateFilters, "dateFilters");
  const period = timePeriod(filters);
  if (type === "direct-sun-hours" || type === "daylight-availability") {
    if (byoWeather !== void 0) {
      throw new TypeError(
        `${type} takes no weather arrays; a parsed EPW document is only an input to solar-radiation, thermal-comfort-index and thermal-comfort-statistics`
      );
    }
    output = pick(output, [...BASE, ...LOCATION, "accuracy", ...SURFACE, ...TERRAIN]);
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
      output = pick(output, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]);
    } else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
      output = pick(output, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS]);
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
  const rows = weatherRows(output.weatherData, period);
  if (type === "pedestrian-wind-comfort") {
    output = pick(output, [...BASE, "criteria"]);
    const wind = pairedWind(rows);
    if (wind.windSpeed.length === 0) throw new TypeError("pedestrian-wind-comfort needs paired wind data");
    Object.assign(output, wind);
  } else if (type === "solar-radiation") {
    output = pick(output, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]);
    output.timePeriod = period;
    output.directNormalRadiation = series(rows, "directNormalRadiation");
    output.diffuseHorizontalRadiation = series(rows, "diffuseHorizontalRadiation");
  } else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
    output = pick(output, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS]);
    output.timePeriod = period;
    for (const key of [
      "horizontalInfraredRadiationIntensity",
      "diffuseHorizontalRadiation",
      "directNormalRadiation",
      "globalHorizontalRadiation",
      "dryBulbTemperature",
      "windSpeed",
      "relativeHumidity"
    ]) output[key] = series(rows, key);
  } else {
    throw new TypeError(`unsupported analysis type ${type}`);
  }
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
    const target = TOP_LEVEL_ALIASES.get(key) ?? key;
    if (Object.hasOwn(output, target)) throw new TypeError(`conflicting aliases for ${target}`);
    define(output, target, target === "time-period" ? wirePeriod(value) : value);
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

// src/area/site-pack.ts
function plainCoordinates(mesh) {
  if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh)) return void 0;
  const coordinates = mesh.coordinates;
  if (!Array.isArray(coordinates)) return void 0;
  if (coordinates.length === 0 || coordinates.length % 3 !== 0) return void 0;
  for (const value of coordinates) {
    if (typeof value !== "number" || !Number.isFinite(value)) return void 0;
  }
  return coordinates;
}
function pack(meshes, keepUnreadable) {
  const ids = [];
  const blocks = [];
  const offsets = [0];
  const stripped = /* @__PURE__ */ Object.create(null);
  let total = 0;
  for (const [id, mesh] of Object.entries(meshes)) {
    const readable = plainCoordinates(mesh);
    if (readable === void 0 && !keepUnreadable) continue;
    const block = readable ?? [];
    ids.push(id);
    blocks.push(block);
    total += block.length;
    offsets.push(total);
    stripped[id] = readable === void 0 ? mesh : { ...mesh, coordinates: void 0 };
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
  return { ids, bytes, offsets: Uint32Array.from(offsets), document: JSON.stringify(stripped) };
}

// src/area/site-kernel.ts
function document(value, texts) {
  if (value === void 0) return void 0;
  const known = value !== null && typeof value === "object" ? texts?.get(value) : void 0;
  return known ?? JSON.stringify(value);
}
function kernelSite(inputs, texts) {
  const { groups, tiles, polygon } = inputs;
  const buildings = pack(asMap(groups.geometries), false);
  const context = pack(asMap(groups["context-geometry"]), true);
  const config = getTilingConfig(inputs.analysisType);
  const origin = kernelPolygonOrigin(polygon);
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
    groups["context-geometry"] === void 0 ? void 0 : context.document,
    document(groups["ground-geometry"], texts),
    document(groups.vegetation, texts),
    document(groups["ground-materials"], texts),
    JSON.stringify(polygon),
    inputs.terrainContextMarginM
  );
}
var release2 = typeof FinalizationRegistry === "function" ? new FinalizationRegistry((inner) => inner.free()) : void 0;
function asMap(value) {
  if (value === null || value === void 0 || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
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
  constructor(tiles, unowned, arena, present2, carried, inner, inputs) {
    this.tiles = tiles;
    this.unowned = unowned;
    this.arena = arena;
    this.present = present2;
    this.carried = carried;
    this.inner = inner;
    this.inputs = inputs;
  }
  artifacts = /* @__PURE__ */ new Map();
  /**
   * Keep the kernel site from now on, reading it once more when a JSON run
   * built this answer without it. A facade run asks the kept site for its
   * batches and its selected bodies (`area/site-facade.ts`), as the Python
   * host does.
   */
  keepKernel() {
    if (this.inner !== void 0) return true;
    if (release2 === void 0 || this.inputs === void 0) return false;
    this.inner = kernelSite(this.inputs);
    release2.register(this, this.inner);
    this.inputs = void 0;
    return true;
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
   * `keepKernelSite`: a BINARY run keeps the kernel site for the artifacts
   * it will encode at submit time, and a FACADE run for its batches and
   * bodies (`area/site-facade.ts`), freed with this object. A grid JSON run
   * frees it before this returns — its bodies are JavaScript-owned copies
   * already — so a run that never encodes holds no wasm memory, as before
   * WS2; a later binary or facade run on the same prepared site reads the
   * site again. A realm without
   * `FinalizationRegistry` always takes that second path.
   */
  static read(groups, tiles, polygon, analysisType, terrainContextMarginM, keepKernelSite = false, texts) {
    const inputs = { groups, tiles, polygon, analysisType, terrainContextMarginM };
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
      const keep = keepKernelSite && release2 !== void 0;
      const site = keep ? new _SiteAssignment(answers, inner.unowned(), void 0, present2, carried, inner, void 0) : new _SiteAssignment(
        answers,
        inner.unowned(),
        inner.bodies(0, tiles.length),
        present2,
        carried,
        void 0,
        inputs
      );
      if (keep && release2 !== void 0) {
        release2.register(site, inner);
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
   * Every tile's presence mask (bit `i` for `ARENA_GROUPS[i]`, set when the
   * tile carries the group AND it holds something) and its `geometries` /
   * `context-geometry` group hashes, two per tile, `""` for none — without
   * writing a body. Read once and kept.
   */
  identity() {
    return this.#identity ??= this.withKernel((inner) => inner.identity(0, this.tiles.length));
  }
  #identity;
  /**
   * One tile's artifact (D101). The first ask under a given capability answer
   * — whether the trees are boxed, and the four limits — encodes every tile in
   * one crossing from the kept kernel site; the archives are kept, so the
   * tiles of a family's repeat run share them. Never a facade batch's (D156).
   */
  tileArtifact(index2, boxTrees, limits) {
    const key = [
      boxTrees,
      limits.maxGeometryBytes,
      limits.maxMetadataBytes,
      limits.maxMeshes,
      limits.maxInstances
    ].join("\n");
    let tiles = this.artifacts.get(key);
    if (tiles === void 0) {
      tiles = this.encode(boxTrees, limits);
      this.artifacts.set(key, tiles);
    }
    const artifact = tiles[index2];
    if (artifact === void 0) throw new RangeError(`tile index ${index2} is outside the site`);
    return artifact;
  }
  /**
   * The parts of every facade batch of tile `index`, from ONE kernel call
   * that builds the tile once (`Site.facadeFrames`, WP3). The artifact is the
   * SAME kernel selection the Python host uploads (D156): the batch's targets
   * in `geometries`, the rest of the tile in `context-geometry`. Nothing is
   * kept here — `area/site-facade.ts` hands each part out once.
   */
  facadeFrames(index2, batches, parts) {
    const limits = parts.artifact?.limits;
    const raw = this.withKernel((inner) => inner.facadeFrames(
      Uint32Array.from(batches, () => index2),
      Uint32Array.from(batches, (ids) => ids.length),
      batches.flatMap((ids) => [...ids]),
      parts.body === true,
      false,
      parts.capture !== void 0,
      parts.capture?.alignment ?? void 0,
      parts.artifact !== void 0,
      parts.artifact?.boxTrees ?? false,
      BigInt(limits?.maxGeometryBytes ?? 0),
      limits?.maxMetadataBytes ?? 0,
      BigInt(limits?.maxMeshes ?? 0),
      BigInt(limits?.maxInstances ?? 0)
    ));
    return raw.map((frame) => {
      if (frame.error !== void 0) return { error: frame.error };
      const { body, capture, artifact } = frame;
      const counts = artifact === void 0 ? null : JSON.parse(artifact.treeBoxes);
      return {
        ...body === void 0 ? {} : { body },
        ...capture === void 0 ? {} : { capture },
        ...artifact === void 0 ? {} : {
          artifact: {
            archive: artifact.archive,
            artifactDigest: artifact.artifactDigest,
            geometryContentDigest: artifact.contentDigest,
            encoding: artifact.encoding,
            targetIds: artifact.targetIds,
            ...counts === null ? {} : { treeBoxes: counts }
          }
        }
      };
    });
  }
  encode(boxTrees, limits) {
    const encoded = this.withKernel((inner) => inner.artifacts(
      0,
      this.tiles.length,
      boxTrees,
      BigInt(limits.maxGeometryBytes),
      limits.maxMetadataBytes,
      BigInt(limits.maxMeshes),
      BigInt(limits.maxInstances)
    ));
    const boxes = JSON.parse(encoded.treeBoxes);
    return encoded.artifactDigests.map((artifactDigest, index2) => {
      const counts = boxes[index2];
      return {
        archive: encoded.bytes.subarray(encoded.offsets[index2], encoded.offsets[index2 + 1]),
        artifactDigest,
        geometryContentDigest: encoded.contentDigests[index2],
        encoding: encoded.encodings[index2],
        ...counts === null || counts === void 0 ? {} : { treeBoxes: counts }
      };
    });
  }
};

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
  ["min-coverage", "min_coverage"]
];
function facadeRequest(payload, tiles, retryFrom, maxSensorsPerJob) {
  const request = {
    policy_version: 2,
    mode: payload["analysis-surfaces"],
    auto_align: payload["terrain-alignment"] === "auto-align"
  };
  for (const [wire, key] of CALLER_FIELDS) {
    if (payload[wire] !== void 0 && payload[wire] !== null) request[key] = payload[wire];
  }
  request.saved = retryFrom === void 0 ? null : savedBatches(retryFrom, tiles);
  if (maxSensorsPerJob !== void 0) request.max_sensors_per_job = maxSensorsPerJob;
  return request;
}
var plans = /* @__PURE__ */ new WeakMap();
var MAX_PLANS = 4;
function kernelOf(site) {
  if (site.withKernel === void 0) throw new Error("facade planning needs the kernel site");
  site.keepKernel?.();
  return site;
}
async function planFacadeRecords(site, tileCount, selected, request, slice) {
  const text = JSON.stringify(request);
  const fresh = request.saved === null;
  const byRequest = plans.get(site) ?? /* @__PURE__ */ new Map();
  const kept = fresh ? byRequest.get(text) : void 0;
  const out = /* @__PURE__ */ new Map();
  if (kept !== void 0) {
    for (const index2 of selected) out.set(index2, kept[index2] ?? []);
    return out;
  }
  const kernel = kernelOf(site);
  const all = [];
  const every = fresh && selected.size === tileCount;
  for (let index2 = 0; index2 < tileCount; index2 += 1) {
    if (!selected.has(index2)) continue;
    await slice.tick();
    const records = JSON.parse(kernel.withKernel((inner) => inner.facadeBatches(index2, index2 + 1, text)));
    out.set(index2, records);
    all[index2] = records;
  }
  if (every) {
    byRequest.set(text, all);
    for (const key of byRequest.keys()) {
      if (byRequest.size <= MAX_PLANS) break;
      if (key !== text) byRequest.delete(key);
    }
    plans.set(site, byRequest);
  }
  return out;
}
var TARGET_GROUPS = /* @__PURE__ */ new Set(["geometries", "context-geometry"]);
var TileFrames = class {
  constructor(site, tile, records, submits) {
    this.site = site;
    this.tile = tile;
    this.records = records;
    this.wanted = records.flatMap((record4, at) => submits(record4) ? [at] : []);
  }
  shared = /* @__PURE__ */ new Map();
  written;
  handed = /* @__PURE__ */ new Map();
  /** The batches the plan submits, by index: only these are written ahead. */
  wanted;
  batch(index2, group) {
    if (this.written?.[index2] !== void 0) return this.read(index2, group);
    const indices = this.wanted.includes(index2) ? this.wanted : [index2];
    const answered = this.frames(indices, { body: true });
    this.written ??= [];
    for (const [at, frame] of answered.entries()) {
      if (this.written[indices[at]] !== void 0) continue;
      this.written[indices[at]] = this.texts(frame);
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
  capture(index2, alignment) {
    return this.once(index2, `capture
${alignment}`, { capture: { alignment } }).capture;
  }
  artifact(index2, boxTrees, limits) {
    const key = [
      "artifact",
      boxTrees,
      limits.maxGeometryBytes,
      limits.maxMetadataBytes,
      limits.maxMeshes,
      limits.maxInstances
    ].join("\n");
    return this.once(index2, key, { artifact: { boxTrees, limits } }).artifact;
  }
  /**
   * Batch `index`'s part under `key`. The first ask writes it for every
   * batch of the tile that the plan submits (a retry's other batches are not
   * written); each is handed out once and then dropped, so an artifact or a
   * capture is not kept after its job took it. What a stopped run leaves is
   * at most the untaken parts of the tiles it had started.
   */
  once(index2, key, parts) {
    let ready = this.handed.get(key);
    if (ready === void 0 && this.wanted.includes(index2)) {
      const wanted = this.wanted;
      ready = new Map(this.frames(wanted, parts).map((frame2, at) => [wanted[at], frame2]));
      this.handed.set(key, ready);
    }
    let frame = ready?.get(index2);
    if (frame === void 0) frame = this.frames([index2], parts)[0];
    ready?.delete(index2);
    if (ready?.size === 0) this.handed.delete(key);
    if (frame.error !== void 0) throw new Error(frame.error);
    return frame;
  }
  frames(indices, parts) {
    if (this.site.facadeFrames === void 0) throw new Error("facade jobs need the kernel site");
    return this.site.facadeFrames(this.tile, indices.map((at) => this.records[at].active_ids), parts);
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
  return records.map((record4, index2) => {
    const count2 = record4.sensor_count;
    if (count2 === null || !Number.isSafeInteger(count2) || count2 < 1) throw new Error("invalid exact sensor count");
    if (record4.active_ids.length === 0) throw new Error(`exact batch membership does not match tile ${tileId}`);
    const payload = { ...value };
    for (const [group, kernel] of tileGroups) payload[group] = kernel;
    payload.geometries = new KernelGroup(() => bodies.batch(index2, "geometries"), false, record4.active_ids);
    const moved = answer.members.length > record4.active_ids.length;
    payload["context-geometry"] = new KernelGroup(
      () => bodies.batch(index2, "context-geometry"),
      !(answer.context.length > 0 || moved)
    );
    return {
      key: record4.key,
      buildingIds: [...record4.active_ids],
      sensorCount: count2,
      payload,
      capture: (alignment) => bodies.capture(index2, alignment),
      ...site.facadeFrames === void 0 ? {} : {
        artifact: (boxTrees, limits) => bodies.artifact(index2, boxTrees, limits)
      }
    };
  });
}

// src/area/plan-entries.ts
function retryIncludesTile(tileId, retry) {
  if (retry === void 0 || retry.has(tileId)) return true;
  for (const key of retry) if (key.startsWith(`${tileId}#batch`)) return true;
  return false;
}
async function buildEntries(tiles, input, slice) {
  const { service, options, analysisType, base, composed, byId, ownership, site, surfaceFields } = input;
  const retryFrom = options.retryFrom;
  const entries3 = [];
  const batchMembership = { ...retryFrom?.batchMembership ?? {} };
  const batchSensorCounts = { ...retryFrom?.batchSensorCounts ?? {} };
  const extraPositions = [];
  const tileLocation = requireCore().tileLocationApplies(analysisType);
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
      ownership.observe(tile.tileId, answer, records.flatMap((record4) => record4.active_ids));
      const value = facadeTileBase(base, site.carried ?? [], location);
      payloads = facadeBatchesForTile(
        value,
        tile.tileId,
        index2,
        records,
        site,
        answer,
        site.identity().present[index2] ?? 0,
        (record4) => input.retry === void 0 || input.retry.has(record4.key)
      );
    } else {
      const value = { ...base };
      Object.assign(value, composed[tile.tileId] ?? {});
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
      const prepared = service.prepareSubmission(analysisType, batch.payload, {
        ...options.transport === void 0 ? {} : { transport: options.transport },
        ...options.webhookUrl === void 0 ? {} : { webhookUrl: options.webhookUrl },
        ...options.webhookEvents === void 0 ? {} : { webhookEvents: options.webhookEvents }
      });
      entries3.push({
        key: batch.key,
        row: tile.row,
        col: tile.col,
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
function tileArtifactFor(site, index2) {
  return site.tileArtifact === void 0 ? {} : {
    artifact: (boxTrees, limits) => site.tileArtifact(index2, boxTrees, limits)
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
    const record4 = item;
    for (const key in record4) {
      const field = Object.getOwnPropertyDescriptor(record4, key);
      if (field === void 0 || !("value" in field)) return false;
      mixString(key);
      if (!walk(record4[key])) return false;
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
var encoder4 = new TextEncoder();
var OPEN = Uint8Array.of(123);
var CLOSE = Uint8Array.of(125);
function selectedDocumentParts(prepared, groups) {
  const parts = [OPEN];
  for (const name of Object.keys(groups).sort()) {
    const value = prepared.bytes[name];
    if (value === void 0) return void 0;
    parts.push(encoder4.encode(`${parts.length === 1 ? "" : ","}${JSON.stringify(name)}:`), value);
  }
  parts.push(CLOSE);
  return parts;
}
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
  return output;
}

// src/internal/wire-json.ts
var remembered = /* @__PURE__ */ new WeakMap();
function rememberWireText(value, bytes) {
  remembered.set(value, { bytes });
}
var QUOTE = 34;
var COLON = 58;
function hasDigitKey(bytes) {
  let at = bytes.indexOf(COLON);
  while (at !== -1) {
    let back = at - 1;
    if (back >= 0 && bytes[back] === QUOTE) {
      back -= 1;
      let digits = 0;
      while (back >= 0 && bytes[back] >= 48 && bytes[back] <= 57) {
        back -= 1;
        digits += 1;
      }
      if (digits > 0 && back >= 0 && bytes[back] === QUOTE) return true;
    }
    at = bytes.indexOf(COLON, at + 1);
  }
  return false;
}
function spliceText(value) {
  if (value === null || typeof value !== "object") return void 0;
  const entry = remembered.get(value);
  if (entry === void 0) return void 0;
  entry.spliceable ??= !hasDigitKey(entry.bytes);
  return entry.spliceable ? entry.bytes : void 0;
}
function hasToJson(value) {
  return value !== null && typeof value === "object" && typeof value.toJSON === "function";
}
var encoder5 = new TextEncoder();
var sequence = 0;
function jsonWireBytes(body, replacer) {
  return spliceJsonBytes(body, spliceText, replacer);
}
function spliceJsonBytes(body, known, replacer) {
  const plain = () => {
    const text = JSON.stringify(body, replacer);
    return text === void 0 ? void 0 : encoder5.encode(text);
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
    pieces.push(encoder5.encode(outer.slice(from, at2)), texts[index2]);
    from = at2 + marker.length;
  }
  if (outer.indexOf(JSON.stringify(tag).slice(1, -1), from) !== -1) return plain();
  pieces.push(encoder5.encode(outer.slice(from)));
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
  return new Set(records.map((record4) => record4.name).filter((name) => typeof name === "string"));
}
function composeTilePayloads(groups, tiles, polygon, options = {}) {
  const run = beginCompose(groups, tiles, polygon, options);
  for (let index2 = 0; index2 < tiles.length; index2 += 1) run.tile(index2);
  return run.payloads;
}
var decoder4 = new TextDecoder();
function beginCompose(groups, tiles, polygon, options = {}, keepKernelSite = false, texts, rememberWire = false) {
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
    texts
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
        const value = JSON.parse(decoder4.decode(written.bytes));
        rememberGroup(group, value, written.bytes, written.hash);
        if (rememberWire) rememberWireText(value, written.bytes);
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
  const record4 = value;
  const inner = record4[attribute];
  return typeof record4.readMarginM === "number" && inner !== void 0 ? inner : value;
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
    terrainContext: { margin_m: options.terrainContextMarginM }
  }, options.keepKernelSite ?? false, options.texts, true);
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
async function foldTileBuildings(tiles, slice, site) {
  const folded = {};
  const hashes = site.identity?.().meshGroupHashes;
  for (const [index2, tile] of tiles.entries()) {
    await slice.tick();
    const hash = hashes === void 0 ? site.group?.(index2, "geometries")?.hash : hashes[index2 * 2];
    if (hash) {
      folded[tile.tileId] = { "group-hash": hash };
      continue;
    }
    const written = site.tiles[index2]?.members.length === 0 ? void 0 : site.group?.(index2, "geometries");
    folded[tile.tileId] = foldGeometryGroup("geometries", written === void 0 ? {} : JSON.parse(new TextDecoder().decode(written.bytes)));
  }
  return folded;
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
function takesGradeDrop(analysisType) {
  return typeof analysisType === "string" && WIND_ANALYSIS_TYPES.has(analysisType);
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
  const chosen = payload["terrain-alignment"] ?? TO_GROUND;
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
var encoder6 = new TextEncoder();
var groupDigestMemo = /* @__PURE__ */ new WeakMap();
function sourceBytes(source, inner, texts) {
  if (texts === void 0) return encoder6.encode(JSON.stringify(source));
  const record4 = source;
  const document2 = inner === void 0 ? void 0 : record4[inner];
  if (document2 === null || typeof document2 !== "object" || Array.isArray(source)) {
    const text = JSON.stringify(source);
    texts.set(source, text);
    return encoder6.encode(text);
  }
  let innerBytes;
  const bytes = spliceJsonBytes(record4, (value) => {
    if (value !== document2) return void 0;
    const text = JSON.stringify(document2);
    texts.set(document2, text);
    innerBytes ??= encoder6.encode(text);
    return innerBytes;
  });
  return bytes ?? encoder6.encode(JSON.stringify(source));
}
async function sourceDigest(source, inner, texts) {
  if (source === null || typeof source !== "object") {
    return sha256Hex(encoder6.encode(JSON.stringify(source)));
  }
  const cached = groupDigestMemo.get(source);
  const fingerprint = cached === void 0 ? void 0 : contentFingerprint(source);
  if (fingerprint !== void 0 && cached?.fingerprint === fingerprint) return cached.digest;
  const digest = await sha256Hex(sourceBytes(source, inner, texts));
  if (digest === void 0) groupDigestMemo.delete(source);
  else groupDigestMemo.set(source, { fingerprint, digest });
  return digest;
}
function acquisitionContent(name, value, inner) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  const record4 = value;
  const margin = [record4.readMarginM ?? null, record4.analysisType ?? null];
  if (name === "buildings") {
    const acquired = acquiredBuildings(value);
    return acquired === void 0 ? void 0 : { document: acquired.buildings, meta: JSON.stringify([acquired.origin, ...margin]) };
  }
  const document2 = inner === void 0 ? void 0 : record4[inner];
  if (typeof record4.readMarginM !== "number" || document2 === null || typeof document2 !== "object") {
    return void 0;
  }
  return { document: document2, meta: JSON.stringify(margin) };
}
async function preparedSiteKey(inputs, texts, legacy = false) {
  const { payload, options, polygon, config } = inputs;
  const sources = [
    ...GROUP_KEYS.map((key) => [key, payload[key], void 0]),
    ["buildings", options.buildings, void 0],
    ["vegetation", options.vegetation, "features"],
    ["groundMaterials", options.groundMaterials, "layers"]
  ];
  const parts = [legacy ? "prepared-site-v1" : "prepared-site-v2"];
  for (const [name, given, inner] of sources) {
    if (given === void 0) continue;
    const content = legacy ? void 0 : acquisitionContent(name, given, inner);
    const keep = name === "buildings" || name === "geometries" || name === "context-geometry" ? void 0 : texts;
    const digest = content === void 0 ? await sourceDigest(given, inner, keep) : await sourceDigest(content.document, void 0, keep);
    if (digest === void 0) return void 0;
    parts.push(`${name}=${digest}`);
    if (content !== void 0) parts.push(`${name}:meta=${content.meta}`);
  }
  parts.push(
    JSON.stringify(polygon),
    String(config.inferenceSizeM),
    String(config.contextSizeM),
    String(config.stepM),
    String(inputs.terrainContextMarginM),
    String(options.maxTilesOverride),
    String(inputs.grade)
  );
  return parts.join("\n");
}
async function buildPreparedSite(inputs, analysisType, tiles, slice, texts) {
  const { payload, options, polygon } = inputs;
  const groups = dropSiteToGrade(
    geometryGroups(payload, options, polygon, [analysisType]),
    inputs.grade
  );
  const { composed, site } = await composeTiles(
    groups,
    tiles,
    polygon,
    {
      analysisType,
      terrainContextMarginM: inputs.terrainContextMarginM,
      // A binary run encodes artifacts from the kernel site (WS2, D136); a
      // facade run plans its batches and writes its bodies from it
      // (`area/site-facade.ts`).
      keepKernelSite: options.transport === "binary" || payload["analysis-surfaces"] != null,
      ...texts === void 0 ? {} : { texts }
    },
    slice
  );
  rejectFullyDroppedTargets(groups, site);
  return { composed, answers: site };
}
function abortReason(signal) {
  return signal.reason ?? new DOMException("aborted", "AbortError");
}
var PreparedSiteCache = class {
  constructor(maxSites = MAX_SITES) {
    this.maxSites = maxSites;
  }
  sites = /* @__PURE__ */ new Map();
  /**
   * The site under `key`, built by `build` when no caller has built it yet.
   *
   * A caller that arrives while a build is in flight awaits that build. If the
   * build fails, the failure is the builder's own — its stop signal, or an
   * input it alone reported — so a waiter that was not itself stopped builds
   * for itself rather than inherit it.
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
function checkPaidRetrySiteIdentity(prior, current, willSubmit) {
  if (prior === void 0 || !willSubmit) return;
  if (prior.siteIdentity === void 0 || current === void 0) {
    throw new Error("retryFrom schedule has no provable site identity; old schedules may be polled and merged, but failed tiles cannot be retried safely. Start a fresh run.");
  }
  if (prior.siteIdentity !== current) {
    throw new Error("retryFrom site identity mismatch: geometry or layer inputs changed. Retry with the original immutable inputs or start a fresh run.");
  }
}

// src/area/sensor-cap.ts
function checkFacadeSensorCap(options) {
  const cap = options.maxSensorsPerJob;
  if (cap === void 0) return;
  if (typeof cap !== "number") {
    throw new TypeError("maxSensorsPerJob must be a number of retained sensors");
  }
  try {
    requireCore().checkMaxSensorsPerJob(cap);
  } catch (error) {
    throw new RangeError(`maxSensorsPerJob: ${error instanceof Error ? error.message : String(error)}`);
  }
  const saved = options.retryFrom?.maxSensorsPerJob;
  if (options.retryFrom !== void 0 && saved !== cap) {
    throw new Error(
      `retryFrom maxSensorsPerJob mismatch: the original run planned at ${saved ?? "the default target"}, this retry passes ${cap}. Omit maxSensorsPerJob to replay the saved batches.`
    );
  }
}

// src/area/facade-ownership.ts
var FacadeOwnership = class {
  /** `unowned` is the site pass's own answer, computed before any seeding. */
  constructor(unowned) {
    this.unowned = unowned;
  }
  savedOwner = /* @__PURE__ */ new Map();
  demoted = [];
  /**
   * Ids some visited tile ANALYSES, and the tiles this pass visited. A saved
   * owner is the only thing that can leave a building unclaimed, and whether
   * that is a defect depends on whether its tile was rebuilt — see
   * {@link FacadeOwnership.finish}.
   */
  claimed = /* @__PURE__ */ new Set();
  visited = /* @__PURE__ */ new Set();
  /**
   * Adopt the ownership a saved schedule already recorded.
   *
   * A retry rebuilds SOME tiles. The kernel's answer is a property of the GRID
   * and not of one pass over it, so a fresh run and a retry agree by
   * construction — but a schedule saved by an older SDK, or one whose grid was
   * planned under a different tile list, may not. Where it disagrees the SAVED
   * answer wins: those sensors are already billed.
   *
   * "Wins" means it SELECTS a tile, not merely that it rejects the kernel's.
   * Using it only to reject loses the building in both — the saved tile never
   * had it in `core`, and the kernel's tile gives it up — and the kernel's own
   * `unowned` cannot see that, because it is computed before this filter.
   * {@link FacadeOwnership.finish} carries the host's own check for it.
   */
  seedFromSchedule(membership) {
    for (const [key, ids] of Object.entries(membership ?? {})) {
      const tileId = key.split("#batch")[0] ?? key;
      for (const id of ids) if (!this.savedOwner.has(id)) this.savedOwner.set(id, tileId);
    }
  }
  /**
   * Record what the kernel selected for this tile (`area/site-facade.ts`).
   *
   * The kernel applies the rule this class used to apply here — a saved owner
   * wins where the tile still carries the mesh, else the tile's post-resolution
   * `core` — so this host only records what was claimed and which duplicates
   * the site pass resolved. The Python twin is `observe_native`.
   */
  observe(tileId, answer, activeIds) {
    this.visited.add(tileId);
    for (const id of activeIds) this.claimed.add(id);
    for (const id of answer.demoted) {
      this.demoted.push({ id, kept: this.savedOwner.get(id) ?? "an earlier tile", later: tileId });
    }
  }
  /**
   * Refuse a building nobody analyses.
   *
   * Two ways to end up analysed by nobody. The kernel's `unowned` is one: a
   * shrink-band building no core took. The other is a saved owner whose tile
   * this pass DID visit and which no longer carries the mesh — and the visited
   * set is what keeps that apart from the ordinary retry, where the owning tile
   * simply was not rebuilt and its existing job still analyses the building.
   * Raising on the second would fail a legitimate retry for geometry that is
   * already billed.
   *
   * `complete` is `false` when only SOME tiles were visited (a retry).
   */
  finish(complete) {
    const stale = [...this.savedOwner.entries()].filter(([id, tile]) => this.visited.has(tile) && !this.claimed.has(id)).map(([id]) => id);
    const orphaned = [.../* @__PURE__ */ new Set([...this.unowned, ...stale])].sort();
    if (orphaned.length === 0 || !complete) return;
    throw new Error(
      `facade ownership left ${orphaned.length} building(s) analysed by no tile: ${orphaned.slice(0, 8).join(", ")}${orphaned.length > 8 ? " ..." : ""}. The re-anchored core box (DEVIATIONS D63) gave them up and no neighbouring tile claimed them. This is a bug in the core-extent rule, not in the payload.`
    );
  }
  /** `{id, kept, later}` per duplicate the kernel resolved, in tile order. */
  get resolved() {
    return this.demoted;
  }
};

// src/area/weather-guard.ts
var SCHEDULE_CONTRACT_VERSION = 5;
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
  for (const [wire, kernel] of WINDOW_KEYS) {
    const value = source[wire];
    if (typeof value !== "number" || !Number.isInteger(value)) {
      refuse("its window is incomplete");
    }
    window[kernel] = value;
  }
  const columns = {};
  for (const [wire, kernel] of Object.entries(WIRE_TO_COLUMN)) {
    if (!Object.hasOwn(payload, wire)) continue;
    const values = numbers(payload[wire]);
    if (values === void 0) refuse(`column ${wire} holds a value that is not a number`);
    columns[kernel] = values;
  }
  if (Object.keys(columns).length === 0) refuse("it carries no weather column");
  return requireCore().weatherRunIdentity(
    JSON.stringify({ latitude, longitude, window, columns })
  );
}
function isWeatherBearing(analysisType) {
  return WEATHER_BEARING_ANALYSES.has(analysisType);
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
async function retrySiteIdentity(current, inputs, prior) {
  const recorded = prior?.siteIdentity;
  if (current === void 0 || recorded === void 0 || recorded === current || prior === void 0 || prior.failedSubmissions.length === 0) return current;
  const legacyKey = await preparedSiteKey(inputs, void 0, true);
  return legacyKey !== void 0 && `sha256:${kernelConfigHash({ siteKey: legacyKey })}` === recorded ? recorded : current;
}
async function planAreaSubmission(service, input, polygonInput, options = {}) {
  const slice = new Slice(options);
  slice.check();
  if (input.vegetationInstances != null || input["vegetation-instances"] != null) {
    throw new TypeError("vegetation-instances have no area tiling policy");
  }
  const payload = prepareAreaPayload(input);
  if (payload["vegetation-instances"] != null) {
    throw new TypeError("vegetation-instances have no area tiling policy");
  }
  const analysisType = payload["analysis-type"];
  const weatherIdentity = isWeatherBearing(analysisType) ? preparedWeatherIdentity(payload) : void 0;
  const surfaceFields = payload["analysis-surfaces"] != null;
  if (payload["sensor-points"] !== void 0) {
    throw new TypeError("sensor-points are not supported for area analysis");
  }
  if (surfaceFields && options.retryFrom !== void 0 && options.retryFrom.batchingPolicyVersion !== 2) {
    throw new Error("legacy facade schedules can be polled and merged but cannot be retried safely");
  }
  if (surfaceFields) checkFacadeSensorCap(options);
  const polygon = validatePolygon(polygonInput);
  const grid = generateTilesForPolygon(polygon, {
    analysisType,
    ...options.maxTilesOverride === void 0 ? {} : { maxTilesOverride: options.maxTilesOverride }
  });
  const { tiles, byId } = indexed(grid);
  const config = getTilingConfig(analysisType);
  const requestedMargin = options.terrainContextMarginM ?? 128;
  const terrainContextMarginM = Math.max(
    (config.contextSizeM - config.inferenceSizeM) / 2,
    requestedMargin
  );
  if (options.retryFrom?.terrainContextMarginM !== void 0 && options.retryFrom.terrainContextMarginM !== terrainContextMarginM) {
    throw new Error("retryFrom terrainContextMarginM mismatch");
  }
  validateRetryGrid(options.retryFrom, polygon, analysisType, tiles, grid);
  if (options.terrainContext !== void 0) throw new TypeError("terrainContext is internal; use terrainContextMarginM");
  const inputs = {
    payload,
    options,
    polygon,
    config,
    terrainContextMarginM,
    grade: consumeGradeOption(payload)
  };
  const texts = /* @__PURE__ */ new Map();
  const siteKey = await preparedSiteKey(inputs, texts);
  const currentSiteIdentity = await retrySiteIdentity(
    siteKey === void 0 ? void 0 : `sha256:${kernelConfigHash({ siteKey })}`,
    inputs,
    options.retryFrom
  );
  const siteIdentity = options.retryFrom === void 0 ? currentSiteIdentity : options.retryFrom.siteIdentity;
  const site = await preparedSites().get(
    siteKey,
    () => buildPreparedSite(inputs, analysisType, tiles, slice, texts),
    options.signal
  );
  texts.clear();
  slice.check();
  const composed = surfaceFields ? void 0 : await composedTiles(site, slice, options.signal);
  const ownership = new FacadeOwnership(site.answers.unowned);
  ownership.seedFromSchedule(options.retryFrom?.batchMembership);
  const base = { ...payload };
  for (const key of GROUP_KEYS) delete base[key];
  const hashFields = { ...payload };
  if (Object.hasOwn(hashFields, "geometries")) hashFields.geometries = {};
  delete hashFields["ground-materials"];
  const foldedFields = foldHashFields(hashFields);
  const hashInput = Object.hasOwn(foldedFields, "ground-geometry") ? { ...foldedFields, terrain_slicing: { v: 1 } } : foldedFields;
  if (analysisType === "sky-view-factors") hashInput.tile_location_policy = { v: 1 };
  const configHash = surfaceFields ? kernelFacadeConfigHash(hashInput, site.tileBuildingFolds ??= await foldTileBuildings(tiles, slice, site.answers)) : kernelConfigHash(hashInput);
  checkResumeWeather(options.retryFrom, weatherIdentity);
  if (options.retryFrom !== void 0) {
    requireFoldedSchedule(options.retryFrom);
    if (options.retryFrom.configHash !== configHash) {
      throw new Error("retryFrom schedule configHash mismatch");
    }
    checkPaidRetrySiteIdentity(
      options.retryFrom,
      currentSiteIdentity,
      options.retryFrom.failedSubmissions.length > 0
    );
  }
  const retry = options.retryFrom === void 0 ? void 0 : new Set(options.retryFrom.failedSubmissions);
  const tilePositions = options.retryFrom === void 0 ? tiles.map((tile) => ({ ...tile })) : options.retryFrom.tilePositions.map((position) => ({ ...position }));
  const built = await buildEntries(tiles, {
    service,
    options,
    analysisType,
    base,
    byId,
    ownership,
    site: site.answers,
    surfaceFields,
    retry,
    ...composed === void 0 ? {} : { composed },
    ...surfaceFields ? { facadeRequest: facadeRequest(base, tiles, options.retryFrom, options.maxSensorsPerJob) } : {},
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
  if (surfaceFields) ownership.finish(options.retryFrom === void 0);
  return {
    polygon,
    analysisType,
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
function validateRetryGrid(retry, polygon, analysisType, tiles, grid) {
  if (retry === void 0) return;
  if (retry.analysisType !== analysisType) throw new Error("retryFrom analysisType mismatch");
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
function requireFoldedSchedule(retryFrom) {
  const version = retryFrom.scheduleContractVersion ?? 1;
  if (version >= CONFIG_HASH_FOLD_CONTRACT_VERSION) return;
  throw new ConfigHashPolicyError(
    `retryFrom schedule predates this SDK's configHash (schedule contract version ${String(version)}, this SDK writes ${CONFIG_HASH_FOLD_CONTRACT_VERSION}). An older SDK either hashed the whole terrain, context-geometry and vegetation documents instead of the kernel's group hash of each (D51), or took the hash itself through this package's own rounding fold instead of the kernel's configHash primitive (D81) \u2014 either way the two identities cannot be compared and a mismatch here would say nothing about your inputs. Start a fresh run with the same inputs: the tiles that already succeeded are unaffected on the server, and this SDK will not resume a schedule whose identity it cannot verify.`
  );
}
var ConfigHashPolicyError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigHashPolicyError";
  }
};

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
  const features = featureCollection["features"];
  if (!Array.isArray(features)) {
    throw new VegetationMeshError("featureCollection.features must be an array");
  }
  const core2 = requireCore();
  const registry = options.registryJson ?? core2.vegetationRegistryDocument();
  let meshes;
  try {
    meshes = JSON.parse(
      core2.vegetationPointsToMeshes(JSON.stringify(features), lon, lat, registry)
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
  constructor(options) {
    this.request = {
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...options.timeoutMs === void 0 ? {} : { timeoutMs: options.timeoutMs },
      // A retry of a public read reports through the client's logger.
      ...options.logger === void 0 ? {} : { logger: options.logger }
    };
  }
  /**
   * One tile's trees, read straight from the public data hosts.
   *
   * Returns `null` for a genuinely empty tile.
   */
  async getGeoJson(lat, lon, distance) {
    const result = await acquireTrees(pointToBbox(lat, lon, distance), { ...this.request });
    if (result.features.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: result.features,
      ...result.warnings.length === 0 ? {} : { _warnings: [...result.warnings] }
    };
  }
  /**
   * One tile's trees as FeatureCollection JSON text.
   *
   * The area path uses this rather than the object form: the per-tile texts
   * are spliced into the array the deduplicator takes, so no tile's features
   * are ever built as host objects (bulk-data rule 1).
   */
  async tileJsonDirect(lat, lon, distance, options) {
    const { featuresJson } = await acquireTreesJson(pointToBbox(lat, lon, distance), options);
    return featureCollectionJson(featuresJson);
  }
  /**
   * Convert tree Point features to dotbim meshes in the local WASM kernel.
   *
   * `converter` accepts only `"local"`: the TypeScript SDK has no remote
   * convert route, so a remote value is a typed error rather than a silent
   * local run (D39). Mirrors Python
   * `VegetationServiceClient.convert_to_mesh(converter="local")`.
   */
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
   * Trees over an area, tile by tile.
   */
  async getArea(polygon, options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "trees are read from the public data hosts only; remove the option"
    );
    const started = performance.now();
    const analysisType = resolveReadAnalysisType(options.analysisType);
    const readDistanceM = groundReadDistanceM(analysisType);
    const tiles = generateTilesForPolygon(polygon, {
      analysisType,
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
    const features = JSON.parse(requireCore().dedupVegetationFeatures(tilesJson));
    return {
      features,
      polygon,
      totalTrees: Object.keys(features).length,
      executionTime: (performance.now() - started) / 1e3,
      failedTiles,
      readMarginM: readDistanceM,
      analysisType
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
  /** The client's logger: the 20 km2 site warning goes through it (D48). */
  logger;
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
   * One tile's layers composed in-process from the public data hosts.
   *
   * Returns `null` for a tile with no material at all.
   */
  async getRaw(lat, lon, distance) {
    const { layers } = await acquireGroundMaterials(pointToBbox(lat, lon, distance), {
      ...this.directOptions()
    });
    const empty = Object.values(layers).every(
      (collection) => (collection.features?.length ?? 0) === 0
    );
    return empty ? null : layers;
  }
  async getArea(polygon, options = {}) {
    rejectRemovedOption(
      options,
      "acquisition",
      "ground materials are composed from the public data hosts only; remove the option"
    );
    const cleaner = resolveCleaner(options.cleaner);
    const started = performance.now();
    const analysisType = resolveReadAnalysisType(options.analysisType);
    const tileQueryHalfM = groundReadDistanceM(analysisType);
    const grid = generateTilesForPolygon(polygon, {
      analysisType,
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
        analysisType
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
      analysisType,
      ...overtureRelease === void 0 ? {} : { overtureRelease }
    };
  }
};

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
  Unzip2.prototype.register = function(decoder5) {
    this.o[decoder5.compression] = decoder5;
  };
  return Unzip2;
})();

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
function decodeJsonObject(bytes, subject, operation) {
  return parseJsonObject(decodeUtf8(bytes, subject, operation), subject, operation);
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
function indexStations(catalog, operation) {
  const stations = catalog["stations"] ?? [];
  if (!Array.isArray(stations)) {
    failWeather("Weather catalog `stations` is not a list", 502, operation);
  }
  const byUuid = /* @__PURE__ */ new Map();
  const byFileName = /* @__PURE__ */ new Map();
  const byRankKey = /* @__PURE__ */ new Map();
  const ranking = [];
  for (const station of stations) {
    if (station === null || typeof station !== "object" || Array.isArray(station)) continue;
    const row = station;
    const uuid = row["uuid"];
    const fileName = row["fileName"];
    const typed2 = row;
    if (typeof uuid !== "string" || uuid === "") continue;
    if (typeof fileName !== "string" || fileName === "") continue;
    byUuid.set(uuid, typed2);
    byFileName.set(fileName, typed2);
    const lat = row["lat"];
    const lon = row["lon"];
    if (typeof lat !== "number" || !Number.isFinite(lat)) continue;
    if (typeof lon !== "number" || !Number.isFinite(lon)) continue;
    if (byRankKey.has(uuid)) continue;
    byRankKey.set(uuid, typed2);
    ranking.push({ uuid, lat, lon });
  }
  return {
    byUuid,
    byFileName,
    byRankKey,
    rankingJson: JSON.stringify({ stations: ranking })
  };
}
function projectRankedStations(ranked, index2, operation) {
  return ranked.map((entry) => {
    const key = entry["uuid"];
    const row = typeof key === "string" ? index2.byRankKey.get(key) : void 0;
    if (row === void 0) {
      return failWeather(
        `Weather ranking returned an unknown station ${JSON.stringify(key)}`,
        502,
        operation
      );
    }
    const source = row;
    return {
      uuid: source["uuid"] ?? null,
      fileName: source["fileName"] ?? null,
      location_data: source["location_data"] ?? null
    };
  });
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
async function staticBytes(url, operation, request) {
  try {
    const answer = await fetchPublicBytes(url, { ...request, cap: MAX_STATIC_BYTES });
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
  async folderUrl(operation) {
    const cached = pointerCache.get(this.baseUrl);
    if (cached !== void 0 && Date.now() - cached.at < this.ttlMs) return cached.folderUrl;
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
        const pointer = decodeJsonObject(bytes, "Weather catalog pointer", pointerOperation);
        const path = pointer["path"];
        if (typeof path !== "string" || path === "") {
          failWeather("Weather catalog pointer carries no usable `path`", 502, operation);
        }
        return {
          folderUrl: `${this.baseUrl}/${path.replace(/^\/+|\/+$/g, "")}`,
          at: Date.now()
        };
      }
    );
    return loaded.folderUrl;
  }
  /** The catalog for the current generation, parsed at most once per ETag. */
  async catalog(operation) {
    const folderUrl = await this.folderUrl(operation);
    const catalogOperation = "fetchWeatherCatalog";
    const url = `${folderUrl}/catalog.json`;
    const cached = catalogCache.get(url);
    if (cached !== void 0) return { folderUrl, entry: cached };
    const entry = await loadOnce(catalogPending, CATALOG_CACHE_LIMIT, catalogCache, url, async () => {
      const { bytes } = await staticBytes(url, catalogOperation, this.request);
      const parsed = parseJsonObject(
        decodeUtf8(bytes, "Weather catalog", catalogOperation),
        "Weather catalog",
        catalogOperation
      );
      return indexStations(parsed, catalogOperation);
    });
    return { folderUrl, entry };
  }
  /** uuid or fileName to a catalog row, or the typed 404 (D40). */
  resolveStation(entry, identifier, operation) {
    const station = entry.byUuid.get(identifier) ?? entry.byFileName.get(identifier);
    if (station === void 0) {
      failWeather(
        `Weather station ${JSON.stringify(identifier)} is not in the public weather catalog. Private and custom-EPW weather files are no longer looked up by id: bring the EPW file itself as BYO weather instead (see MIGRATION.md). No other station is substituted for it.`,
        404,
        operation
      );
    }
    return station;
  }
  /** One station's data object as TEXT, gzip handled either way. */
  async stationText(folderUrl, uuid, operation) {
    const url = `${folderUrl}/stations/${encodeURIComponent(uuid)}.json`;
    const cached = stationCache.get(url);
    if (cached !== void 0) return cached;
    return loadOnce(stationPending, STATION_CACHE_LIMIT, stationCache, url, async () => {
      const { bytes } = await staticBytes(url, "fetchWeatherStation", this.request);
      const subject = `Weather station ${JSON.stringify(uuid)}`;
      return decodeUtf8(gunzipIfNeeded(bytes, uuid, operation), subject, operation);
    });
  }
  /** The nearest stations, ranked by the kernel. */
  async nearestStations(lat, lon, radiusKm) {
    const operation = "getWeatherFileFromLocation";
    const { entry } = await this.catalog(operation);
    let out;
    try {
      out = requireCore().weatherNearestStations(
        entry.rankingJson,
        lat,
        lon,
        radiusKm ?? DEFAULT_RADIUS_KM,
        STATION_LIMIT
      );
    } catch (error) {
      return failWeather(
        `local weatherNearestStations failed: ${error instanceof Error ? error.message : String(error)}`,
        500,
        operation
      );
    }
    return projectRankedStations(
      JSON.parse(out),
      entry,
      operation
    );
  }
  /** One station's full document, as the deleted route returned it. */
  async stationByIdentifier(identifier) {
    const operation = "getWeatherFileFromIdentifier";
    const { folderUrl, entry } = await this.catalog(operation);
    const station = this.resolveStation(entry, identifier, operation);
    const text = await this.stationText(folderUrl, station.uuid, operation);
    return parseJsonObject(text, `Weather station ${JSON.stringify(station.uuid)}`, operation);
  }
  /** The station's hourly arrays, filtered by the kernel. */
  async filterHours(identifier, timePeriodJson) {
    const operation = "filterWeatherData";
    const { folderUrl, entry } = await this.catalog(operation);
    const station = this.resolveStation(entry, identifier, operation);
    const stationJson = await this.stationText(folderUrl, station.uuid, operation);
    let out;
    try {
      out = requireCore().weatherFilterHours(stationJson, timePeriodJson);
    } catch (error) {
      return failWeather(
        `local weatherFilterHours failed: ${error instanceof Error ? error.message : String(error)}`,
        500,
        operation
      );
    }
    return JSON.parse(out);
  }
};

// src/weather.ts
var NUMERIC_WEATHER_FIELDS = /* @__PURE__ */ new Set([
  "dryBulbTemperature",
  "dewPointTemperature",
  "relativeHumidity",
  "atmosphericStationPressure",
  "extraterrestrialHorizontalRadiation",
  "extraterrestrialDirectNormalRadiation",
  "horizontalInfraredRadiationIntensity",
  "globalHorizontalRadiation",
  "directNormalRadiation",
  "diffuseHorizontalRadiation",
  "globalHorizontalIlluminance",
  "directNormalIlluminance",
  "diffuseHorizontalIlluminance",
  "zenithLuminance",
  "windDirection",
  "windSpeed",
  "totalSkyCover",
  "opaqueSkyCover",
  "visibility",
  "ceilingHeight",
  "presentWeatherObservation",
  "presentWeatherCodes",
  "precipitableWater",
  "aerosolOpticalDepth",
  "snowDepth",
  "daysSinceLastSnowfall",
  "albedo",
  "liquidPrecipitationDepth",
  "liquidPrecipitationQuantity"
]);
function weatherNumber(value, field) {
  if (value === null || value === void 0 || typeof value === "number") return value ?? null;
  if (typeof value !== "string") throw new TypeError(`${field} must be numeric`);
  const trimmed = value.trim();
  if (trimmed === "" || /^(null|none|na|n\/a|nan)$/i.test(trimmed)) return null;
  const parsed = Number.parseFloat(trimmed);
  if (Number.isNaN(parsed)) throw new TypeError(`${field} must be numeric`);
  return parsed;
}
function normalizeWeatherPoint(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("weather data point must be an object");
  }
  const output = { ...value };
  for (const field of NUMERIC_WEATHER_FIELDS) {
    if (Object.hasOwn(output, field)) output[field] = weatherNumber(output[field], field);
  }
  return output;
}
function rowsFromWeatherData(weatherData) {
  const columns = Object.entries(weatherData).filter(
    (entry) => Array.isArray(entry[1])
  );
  const rowCount = columns.reduce((most, [, values]) => Math.max(most, values.length), 0);
  const rows = [];
  for (let index2 = 0; index2 < rowCount; index2 += 1) {
    const record4 = {};
    for (const [field, values] of columns) {
      record4[field] = index2 < values.length ? values[index2] : null;
    }
    rows.push(normalizeWeatherPoint(record4));
  }
  return rows;
}
var WeatherService = class {
  reader;
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
   * `radius` is in KILOMETRES, as the deleted route's `radius` query
   * parameter was, and defaults to 100. At most ten stations come back,
   * nearest first — the same limit the route's `$geoNear` pipeline had.
   */
  async getWeatherFileFromLocation(lat, lon, radius) {
    const stations = await this.reader.nearestStations(lat, lon, radius);
    return stations.map((station) => {
      const uuid = station["uuid"];
      if (typeof uuid !== "string") throw new TypeError("weather location has no uuid");
      return { ...station, uuid, identifier: uuid };
    });
  }
  /** One station's full document, found by `uuid` or by `fileName`. */
  async getWeatherFileFromIdentifier(identifier) {
    return this.reader.stationByIdentifier(identifier);
  }
  /**
   * Read and validate one local `.epw` file's TEXT: the bring-your-own
   * weather entry point, and the only one for a file that is not in the
   * public catalog. Nothing is uploaded, nothing is registered and no
   * request leaves this process.
   *
   * Keep the returned document for the retry: its `identity` is what proves
   * a resumed run uses the same weather.
   */
  parseEpw(text, options) {
    return parseEpw(text, options);
  }
  /**
   * Hours inside the given period, one record per hour.
   *
   * `source` is a public catalog station — by `uuid` or by `fileName` — or a
   * {@link WeatherDocument} from {@link parseEpw}. The BYO document is
   * accepted everywhere a station id is, runs entirely in the bundled core
   * and makes no request at all; the window means the same for both.
   */
  async filterWeatherData(source, filters) {
    rejectRemovedOption(
      filters,
      "filter",
      "it was the deleted route's `hour-filter` body field and has no kernel twin; filter the returned records yourself"
    );
    if (source instanceof WeatherDocument) return source.filterHours(filters);
    const filtered = await this.reader.filterHours(source, weatherWindowJson(filters));
    const weatherData = filtered["weatherData"];
    if (weatherData === null || typeof weatherData !== "object" || Array.isArray(weatherData)) {
      return [];
    }
    return rowsFromWeatherData(weatherData);
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
function validateIndices(indices) {
  for (const index2 of indices) {
    if (typeof index2 !== "number" || !Number.isFinite(index2)) {
      throw new TypeError("indices must contain only finite numbers");
    }
  }
}
function packMesh(coordinates, indices) {
  validateCoordinates(coordinates);
  validateIndices(indices);
  const coordinateBuffer = coordinates instanceof Float64Array ? coordinates : new Float64Array(coordinates);
  return requireCore().packMesh(coordinateBuffer, indices);
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
function stopDetail2(error, deadline, timeoutMs) {
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
    throw new RegistryFetchError(stopDetail2(error, deadline, timeoutMs), { cause: error });
  } finally {
    deadline.close();
  }
  if (typeof document2 !== "object" || document2 === null) {
    throw new RegistryFetchError("colour registry document is not a JSON object");
  }
  const record4 = document2;
  const configurations = record4["visualConfigurations"];
  if (typeof configurations !== "object" || configurations === null) {
    throw new RegistryFetchError("colour registry has no `visualConfigurations` object");
  }
  const rawVersion = record4["version"];
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
function resolveVisualConfig(configurations, analysisType, selectors = {}) {
  const flat = flattenVisualConfigs(configurations);
  if (analysisType in flat) return flat[analysisType];
  const variant = selectors.criteria ?? selectors.subtype;
  if (variant !== void 0 && variant !== "") {
    const compound = `${analysisType}:${variant}`;
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
      return requireCore().renderGridRegistry(
        values,
        width,
        height,
        JSON.stringify(config),
        reverseRows,
        maxLongAxisPx
      );
    }
    return requireCore().gridToPng(
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

// src/ground-materials.ts
function cleanV3Local(layers, params) {
  const result = requireCore().groundCleanV3(
    JSON.stringify(layers),
    params.latitude,
    params.longitude,
    params.distance,
    params.defaultLayer,
    params.zStep
  );
  return JSON.parse(result);
}
var LocalCleaner = class {
  async cleanV3(layers, params) {
    return cleanV3Local(layers, params);
  }
};

// src/area/constants.ts
var CELL_SIZE_M = 1;
var TILE_SIZE_M = 512;
var TILE_SIZE_CELLS = TILE_SIZE_M / CELL_SIZE_M;

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
  if (raw.inputFormat !== "irbf" || raw.resultFormat !== "irbf" || raw.wireVersion !== 1) {
    throw new TypeError("invalid binary acknowledgement");
  }
  return {
    inputFormat: "irbf",
    resultFormat: "irbf",
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
var DOWNLOAD_RETRY_ATTEMPTS = 1;
var DOWNLOAD_RETRY_DELAY_MS = 250;
function isRetryableDownloadError(error) {
  if (!(error instanceof TransportError)) return false;
  if (error.status === void 0) return error.reason === "network";
  return error.status === 403 || error.status >= 500 && error.status < 600;
}
async function pauseBeforeRetry(signal) {
  try {
    await delay(DOWNLOAD_RETRY_DELAY_MS, signal ?? new AbortController().signal);
  } catch {
    throw new TransportError(
      "presigned download was aborted",
      "after-dispatch",
      "aborted",
      "GET"
    );
  }
}

// src/internal/link.ts
var TOKEN = /[!#$%&'*+\-.^_`|~0-9A-Za-z]/;
function splitLinkValues(header) {
  const values = [];
  let start = 0;
  let quoted = false;
  let escaped = false;
  let angled = false;
  for (let index2 = 0; index2 < header.length; index2 += 1) {
    const character = header[index2];
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
      const value = header.slice(start, index2).trim();
      if (value.length === 0) return void 0;
      values.push(value);
      start = index2 + 1;
    }
  }
  if (quoted || escaped || angled) return void 0;
  const last = header.slice(start).trim();
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
function parseResultsLink(header) {
  const values = header === null ? void 0 : splitLinkValues(header);
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
var INTERIOR_ANALYSES = /* @__PURE__ */ new Set([
  "daylight-factor",
  "energy-balance",
  "spatial-daylight-autonomy"
]);
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
  "sensorSurfaces",
  "sensor_surfaces",
  "surfaceGridSize",
  "surface_grid_size",
  "surfaceOffset",
  "surface_offset",
  "terrainAlignment",
  "terrain_alignment",
  "webhookEvents",
  "webhook_events",
  "webhookUrl",
  "webhook_url"
]);
function prepareSubmissionBody(analysisType, payload, options) {
  if (typeof analysisType !== "string" || analysisType.length === 0) {
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
  if (bodyType !== void 0 && bodyType !== analysisType) {
    throw new TypeError("payload analysis-type does not match analysisType");
  }
  if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
    throw new TypeError("unsupported option binaryResults; use transport instead");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "binary-results")) {
    throw new TypeError("unsupported payload field binary-results; use transport instead");
  }
  const hasAlignment = Object.prototype.hasOwnProperty.call(payload, "terrain-alignment");
  const body = { ...payload, "analysis-type": analysisType };
  validatePreparedAnalysisRequest(body, { enforceTerrainTriangleLimit: true });
  if (takesGradeDrop(analysisType)) delete body["terrain-alignment"];
  if (options.webhookUrl !== void 0) body["webhook-url"] = options.webhookUrl;
  if (options.webhookEvents !== void 0) body["webhook-events"] = [...options.webhookEvents];
  const suppliedScene = [
    "geometries",
    "context-geometry",
    "vegetation",
    "vegetation-instances"
  ].some((name) => groupHasContent(body[name]));
  if (!INTERIOR_ANALYSES.has(analysisType) && !hasAlignment && groupHasContent(body["ground-geometry"]) && suppliedScene) body["terrain-alignment"] = "as-is";
  return body;
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
  const deadline = new Deadline(options.signal, options.timeoutMs);
  let dispatched = false;
  try {
    const response = await deadline.wait(() => {
      dispatched = true;
      return options.fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/zip" },
        body: content,
        credentials: "omit",
        redirect: "manual",
        signal: deadline.controller.signal
      });
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
      stopped === "timeout" ? "presigned upload timed out" : stopped === "aborted" ? "presigned upload was aborted" : "presigned upload failed",
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
  constructor(acceptedJobIds2, status) {
    super(status === void 0 ? "job submission returned an invalid accepted response" : `job submission received HTTP ${status}; the job may already exist`);
    this.acceptedJobIds = acceptedJobIds2;
    this.status = status;
  }
  name = "SubmissionUncertainError";
  phase = "unknown-acceptance";
  /** Set when a sent POST got a 3xx or 5xx answer instead of an accept. */
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
    response = await options.gateway.requestBytesWithHeaders(options.endpointPath, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
      acceptHttpErrors: true,
      ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  } catch (error) {
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
    const result2 = await post(options, options.archive, "application/zip", false, true);
    if (result2.kind === "expired") throw new Error("unreachable inline reference state");
    if (result2.kind === "accepted") return result2.value;
  }
  let getUrl = await presignAndUpload(options);
  let envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
  let result = await post(options, envelope, "application/json", true, false);
  if (result.kind === "accepted") return result.value;
  getUrl = await presignAndUpload(options);
  envelope = new TextEncoder().encode(JSON.stringify({ $ref: getUrl }));
  result = await post(options, envelope, "application/json", false, false);
  if (result.kind !== "accepted") throw new Error("unreachable reference retry state");
  return result.value;
}

// src/internal/geometry-reuse/cache.ts
var MAX_PARTITIONS = 64;
var MAX_SCOPES = 256;
var MAX_DOCUMENTS = 256;
var MAX_IN_FLIGHT_FIRST_USES = 64;
var MAX_SCOPE_LOCKS = 64;
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
function liveCapability(value, now2) {
  if (value === void 0) return void 0;
  return value.expiresAt === void 0 || now2 < value.expiresAt ? value.outcome : void 0;
}
var GeometryReuseCache = class {
  constructor(now2 = Date.now) {
    this.now = now2;
  }
  partitions = /* @__PURE__ */ new Map();
  firstUses = /* @__PURE__ */ new Map();
  scopeLocks = /* @__PURE__ */ new Map();
  getCapability(partitionKey) {
    const partition = this.partitions.get(partitionKey);
    if (partition === void 0) return void 0;
    const outcome = liveCapability(partition.capability, this.now());
    if (outcome === void 0) delete partition.capability;
    return outcome;
  }
  setCapability(partitionKey, outcome) {
    const now2 = this.now();
    const partition = this.partition(partitionKey, now2);
    partition.capability = outcome === "supported" ? { outcome } : { outcome, expiresAt: now2 + UNSUPPORTED_TTL_MS };
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
    const now2 = this.now();
    const partition = this.partitions.get(partitionKey);
    const scope = partition?.scopes.get(scopeKey);
    if (scope === void 0) return cloneSnapshot(void 0);
    const documents = scope.state.documents.filter((item) => now2 / 1e3 < item.expires_at && scope.urls[item.key] !== void 0);
    if (documents.length !== scope.state.documents.length) {
      const keys = new Set(documents.map((item) => item.key));
      scope.state = { ...scope.state, documents };
      scope.urls = Object.fromEntries(Object.entries(scope.urls).filter(([key]) => keys.has(key)));
    }
    scope.touchedAt = now2;
    if (partition !== void 0) partition.touchedAt = now2;
    return cloneSnapshot(scope);
  }
  acknowledge(partitionKey, scopeKey, value) {
    const now2 = this.now();
    if (!Number.isFinite(value.expiresAt) || value.expiresAt <= now2) return;
    const partition = this.partition(partitionKey, now2);
    const prior = partition.scopes.get(scopeKey);
    const documents = (prior?.state.documents ?? []).filter((item) => item.key !== value.key);
    const document2 = {
      key: value.key,
      groups: { ...value.groups },
      acknowledged_at: now2 / 1e3,
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
      touchedAt: now2
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
  async withScope(partitionKey, scopeKey, task, signal) {
    const key = `${partitionKey}
${scopeKey}`;
    const prior = this.scopeLocks.get(key) ?? Promise.resolve();
    if (!this.scopeLocks.has(key) && this.scopeLocks.size >= MAX_SCOPE_LOCKS) {
      throw new GeometryReuseCapacityError("geometry reuse scope capacity is full");
    }
    let release3;
    const next = new Promise((resolve) => {
      release3 = resolve;
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
      release3();
      void tail.then(() => {
        if (this.scopeLocks.get(key) === tail) this.scopeLocks.delete(key);
      });
      throw error;
    }
    try {
      return await task();
    } finally {
      release3();
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
  partition(key, now2) {
    const found = this.partitions.get(key);
    if (found !== void 0) {
      found.touchedAt = now2;
      this.partitions.delete(key);
      this.partitions.set(key, found);
      return found;
    }
    const created = { scopes: /* @__PURE__ */ new Map(), touchedAt: now2 };
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
  acceptedJobIds;
  invalidReference = true;
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
function bound(options, partitionKey, signal, beforeDispatch) {
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
    ...beforeDispatch === void 0 ? {} : { beforeDispatch }
  };
}
async function submitBody(analysisType, body, transport3, groups = []) {
  const json = jsonWireBytes(body);
  if (json === void 0) throw new TypeError("request has no JSON wire form");
  return submitArchive({
    endpointPath: `/async/${encodeURIComponent(analysisType)}`,
    archive: requireCore().zipPayloadJson(json),
    gateway: transport3.gateway,
    uploadGateway: transport3.uploadGateway,
    fetch: transport3.fetch,
    thresholdBytes: transport3.thresholdBytes,
    timeoutMs: transport3.timeoutMs,
    ...transport3.beforeDispatch === void 0 ? {} : { beforeDispatch: transport3.beforeDispatch },
    parseAccepted: groups.length === 0 ? jobFromResponse : (value) => expectedAck(value, groups),
    ...transport3.signal === void 0 ? {} : { signal: transport3.signal }
  });
}
async function uploadGeometry(bytes, transport3) {
  return uploadArchive({
    archive: requireCore().zipPayloadJson(bytes),
    uploadGateway: transport3.uploadGateway,
    fetch: transport3.fetch,
    timeoutMs: transport3.timeoutMs,
    ...transport3.signal === void 0 ? {} : { signal: transport3.signal }
  });
}

// src/internal/geometry-reuse/expiry.ts
var DEFAULT_REF_TTL_MS = 24 * 60 * 60 * 1e3;
var EXPIRY_MARGIN_MS = 15 * 60 * 1e3;
function expiryFromUrl(value, now2 = Date.now()) {
  let signedAt = now2;
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

// src/internal/geometry-reuse/controller.ts
var DIRECT_SCOPE = "direct-v1";
var DEAD_REF_CODES = /* @__PURE__ */ new Set(["REF_EXPIRED", "REF_NOT_FOUND"]);
var INTERIOR_ANALYSES2 = /* @__PURE__ */ new Set([
  "daylight-factor",
  "energy-balance",
  "spatial-daylight-autonomy"
]);
function parsePlan(current, snapshot) {
  return JSON.parse(requireCore().planGeometryReuse(
    JSON.stringify(current),
    JSON.stringify(snapshot.state),
    Date.now() / 1e3
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
function unsafeCandidate(error) {
  if (error instanceof GeometryReferenceAcknowledgementError) throw error;
  if (error instanceof GeometryReferenceRejectedError) throw error;
  if (error instanceof TransportError && error.reason === "aborted") throw error;
  if (error instanceof SubmissionUncertainError) {
    throw new GeometryReferenceSubmissionError(
      error.acceptedJobIds,
      error.status === void 0 ? "accepted-response-invalid" : "endpoint-response-uncertain"
    );
  }
  if (error instanceof TransportError && error.phase === "unknown-acceptance") {
    throw new GeometryReferenceSubmissionError([], "endpoint-post-failed");
  }
  if (error instanceof TransportError && error.status !== void 0 && (error.status >= 300 && error.status < 400 || error.status >= 500)) {
    throw new GeometryReferenceSubmissionError([], "endpoint-response-uncertain");
  }
  throw error;
}
async function executePlan(prepared, analysisType, partitionKey, scopeKey, transport3, recover, logger) {
  const cache2 = getGeometryReuseCache();
  try {
    return await cache2.withScope(partitionKey, scopeKey, async () => {
      const snapshot = cache2.snapshot(partitionKey, scopeKey);
      let reference;
      try {
        reference = await referenceFromPlan(parsePlan(prepared.identities, snapshot), prepared, snapshot);
      } catch {
        safeLog(logger, "warn", "geometry_ref_fallback", "planning failed");
        return { kind: "prepost" };
      }
      if (reference === void 0) {
        cache2.observe(partitionKey, scopeKey, prepared.identities);
        return { kind: "prepost" };
      }
      if (reference.url === void 0) {
        try {
          reference = { ...reference, url: await uploadGeometry(joinParts(reference.parts), transport3) };
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
            analysisType,
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
          }
          if (!(error instanceof GeometryReferenceRejectedError)) unsafeCandidate(error);
          if (!recover) return { kind: "ref-rejected", code: error.code };
          if (reference.cached && !refreshed && DEAD_REF_CODES.has(error.code)) {
            cache2.invalidate(partitionKey, scopeKey, reference.key, referenceUrl);
            try {
              referenceUrl = await uploadGeometry(joinParts(reference.parts), transport3);
              reference = { ...reference, url: referenceUrl, cached: false };
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
async function tryGeometryReuse(preparedSubmission, options, signal, beforeDispatch) {
  if (INTERIOR_ANALYSES2.has(preparedSubmission.analysisType)) return void 0;
  const prepared = await prepareGeometryGroups(preparedSubmission.body);
  if (Object.keys(prepared.identities).length === 0) return void 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const headers = await options.auth();
    const partitionKey = await credentialPartition(options.baseUrl, headers);
    if (partitionKey === void 0) return void 0;
    const transport3 = bound(options, partitionKey, signal, beforeDispatch);
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
      options.logger
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
      options.logger
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
function buildGeometryReuseOptions(options, fetch2, thresholdBytes, timeoutMs) {
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
    }
  };
}

// src/internal/binary-artifact.ts
function bodyArtifact(body, boxTrees, limits) {
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 4294967295) {
      throw new RangeError(`${name} must be a non-negative uint32 integer`);
    }
  }
  const core2 = requireCore();
  const encoded = core2.geometryArtifact(
    JSON.stringify(body),
    boxTrees,
    BigInt(limits.maxGeometryBytes),
    limits.maxMetadataBytes,
    BigInt(limits.maxMeshes),
    BigInt(limits.maxInstances)
  );
  const counts = JSON.parse(encoded.treeBoxes);
  return {
    archive: encoded.archive,
    artifactDigest: encoded.artifactDigest,
    geometryContentDigest: encoded.contentDigest,
    encoding: encoded.encoding,
    ...counts === null ? {} : { treeBoxes: counts }
  };
}

// src/internal/facade-artifact-guard.ts
var FacadeArtifactMismatchError = class extends Error {
  constructor(analysisType, missing, unplanned) {
    super(
      `binary ${analysisType}: the facade artifact does not carry exactly the batch's planned target buildings (${missing.length} missing, ${unplanned.length} unplanned); refused before any paid submission`
    );
    this.analysisType = analysisType;
    this.missing = missing;
    this.unplanned = unplanned;
  }
  name = "FacadeArtifactMismatchError";
};
function isSurfaceBody(body) {
  return typeof body["analysis-surfaces"] === "string";
}
function checkFacadeArtifact(analysisType, body, artifact) {
  const geometries = body.geometries;
  const planned = geometries instanceof KernelGroup ? [...geometries.ids ?? []] : geometries !== null && typeof geometries === "object" && !Array.isArray(geometries) ? Object.keys(geometries) : [];
  const carried = artifact.targetIds;
  if (carried === void 0) throw new FacadeArtifactMismatchError(analysisType, planned, ["<unsplit tile>"]);
  const have = new Set(carried);
  const want = new Set(planned);
  const missing = planned.filter((id) => !have.has(id));
  const unplanned = carried.filter((id) => !want.has(id));
  if (missing.length > 0 || unplanned.length > 0 || have.size !== carried.length) {
    throw new FacadeArtifactMismatchError(analysisType, missing, unplanned);
  }
}

// src/internal/tree-boxes.ts
var BOXING_DECISIONS = [
  "capability-excludes-vegetation",
  "fallback-model-list"
];
function treeBoxDecision(model, geometryGroups2) {
  const groups = geometryGroups2 === void 0 ? null : [...geometryGroups2];
  return requireCore().vegetationTreeBoxDecision(
    model,
    JSON.stringify(groups)
  );
}
function decisionBoxesTrees(decision) {
  return BOXING_DECISIONS.includes(decision);
}
function treeBoxLogLine(record4) {
  return `binary ${record4.model}: ${record4.trees} tree(s) converted to ${record4.footprintM.toFixed(1)} m x ${record4.footprintM.toFixed(1)} m x ${record4.heightM.toFixed(1)} m boxes in the geometry layer (${record4.boxesSent} sent, ${record4.seatedOnTerrain} seated on terrain, ${record4.boxesSent - record4.seatedOnTerrain} on z=0); this model carries no vegetation group on the binary transport (${record4.decidedBy})`;
}
function treeBoxCollisionLine(record4) {
  const ids = record4.idCollisions;
  return `binary ${record4.model}: ${ids.length} tree id(s) already name a building in \`geometries\`; the building was kept and the box dropped (${ids.slice(0, 5).join(", ")})`;
}
function treeBoxOutOfTileLine(record4) {
  return `binary ${record4.model}: ${record4.outsideTile} of ${record4.boxesSent} tree box(es) fall outside the 512 m inference tile this payload describes and cannot affect its result. They are still sent \u2014 dropping geometry silently is worse \u2014 but a whole site's trees on one payload is usually a missing per-tile assignment; runArea does that for you.`;
}

// src/internal/binary-submission.ts
var MAX_CONTROL_METADATA_BYTES = 4194304;
var GEOMETRY_GROUPS = [
  "geometries",
  "context-geometry",
  "ground-geometry",
  "vegetation",
  "vegetation-instances",
  "ground-materials"
];
async function capability(gateway, signal) {
  const raw = await gateway.requestJson(
    "/binary/v1/capabilities",
    signal === void 0 ? {} : { signal }
  );
  const value = object(raw, "binary capability");
  if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1) {
    throw new TypeError("gateway has an incompatible binary wire format");
  }
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
  return { inputFormat: "irbf", resultFormat: "irbf", wireVersion: 1, models, limits: parsedLimits };
}
async function prepareBinary(prepared, supported) {
  const model = supported.models[prepared.analysisType];
  if (model === void 0 || !Array.isArray(model.geometryGroups) || !Array.isArray(model.resultFamilies) || model.resultFamilies.length === 0) {
    throw new TypeError(`model ${prepared.analysisType} does not support binary transport`);
  }
  const decision = treeBoxDecision(prepared.analysisType, model.geometryGroups);
  const trees = prepared.body.vegetation;
  const boxes = decisionBoxesTrees(decision) && trees !== void 0 && trees !== null;
  if (boxes && (typeof trees !== "object" || Array.isArray(trees))) {
    throw new TypeError(`binary ${prepared.analysisType}: vegetation must be an object keyed by tree id to be boxed into the geometry layer`);
  }
  const body = { ...prepared.body };
  if (boxes) delete body.vegetation;
  const present2 = GEOMETRY_GROUPS.filter((name) => {
    const value = body[name];
    return value !== void 0 && value !== null && typeof value === "object" && !Array.isArray(value);
  });
  for (const name of present2) if (!model.geometryGroups.includes(name)) {
    throw new TypeError(`model ${prepared.analysisType} does not support binary geometry group ${name}`);
  }
  const control = { ...body };
  for (const name of GEOMETRY_GROUPS) delete control[name];
  delete control["binary-results"];
  const controlJson = JSON.stringify(control);
  if (controlJson === void 0) throw new TypeError("binary control has no JSON wire form");
  canonicalJsonBytes2(controlJson, Math.min(
    supported.limits.maxMetadataBytes,
    MAX_CONTROL_METADATA_BYTES
  ), "binary control");
  const tile = prepared.artifact === void 0 ? bodyArtifact(prepared.body, boxes, supported.limits) : prepared.artifact(boxes, supported.limits);
  if (prepared.artifact !== void 0 && isSurfaceBody(prepared.body)) {
    checkFacadeArtifact(prepared.analysisType, prepared.body, tile);
  }
  const artifact = tile;
  const treeBoxes = tile.treeBoxes === void 0 ? void 0 : { ...tile.treeBoxes, model: prepared.analysisType, decidedBy: decision };
  return {
    artifact,
    control,
    limits: supported.limits,
    ...treeBoxes === void 0 ? {} : { treeBoxes }
  };
}
async function uploadGeometry2(uploadGateway, fetch2, prepared, timeoutMs, signal) {
  const response = await uploadGateway.requestJson("/uploads/presign", {
    method: "POST",
    body: { content_length: prepared.artifact.archive.byteLength },
    ...signal === void 0 ? {} : { signal }
  });
  const value = object(response, "presign response");
  const uploadUrl = https(value["upload-url"], "upload-url");
  const getUrl = https(value["get-url"], "get-url");
  await uploadPresignedZip(uploadUrl, prepared.artifact.archive, {
    fetch: fetch2,
    timeoutMs,
    ...signal === void 0 ? {} : { signal }
  });
  return getUrl;
}
function binarySubmission(binary, geometryUrl) {
  return { geometry: {
    url: geometryUrl,
    encoding: binary.artifact.encoding,
    artifactDigest: binary.artifact.artifactDigest,
    contentDigest: binary.artifact.geometryContentDigest,
    byteLength: binary.artifact.archive.byteLength
  }, control: binary.control, limits: binary.limits };
}
async function submitBinary(gateway, prepared, binary, parseJob2, signal, beforeDispatch) {
  const envelope = JSON.stringify({
    inputFormat: "irbf",
    resultFormat: "irbf",
    wireVersion: 1,
    geometry: binary.geometry,
    control: binary.control
  });
  const body = canonicalJsonBytes2(
    envelope,
    Math.min(
      binary.limits.maxMetadataBytes,
      MAX_CONTROL_METADATA_BYTES
    ) + 65536,
    "binary submission envelope"
  );
  let response;
  try {
    response = await gateway.requestBytesWithHeaders(
      `/binary/v1/async/${encodeURIComponent(prepared.analysisType)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        acceptHttpErrors: true,
        ...signal === void 0 ? {} : { signal },
        ...beforeDispatch === void 0 ? {} : { beforeDispatch }
      }
    );
  } catch (error) {
    if (error instanceof TransportError && error.phase !== "pre-dispatch") {
      throw new SubmissionUncertainError([]);
    }
    throw error;
  }
  let raw;
  try {
    raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(response.content));
  } catch {
    throw new SubmissionUncertainError([]);
  }
  if (response.status < 200 || response.status >= 300) {
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
  let record4;
  let job;
  try {
    record4 = object(raw, "binary accepted response");
    job = parseJob2(record4);
  } catch {
    throw new SubmissionUncertainError(jobIds(raw));
  }
  try {
    validateAck(record4.binary, binary.geometry);
  } catch {
    throw new SubmissionUncertainError([job.jobId]);
  }
  return job;
}
function preacceptRejection(status, raw) {
  if (![400, 401, 402, 404, 413, 415, 422, 429].includes(status) || raw === null || typeof raw !== "object" || Array.isArray(raw)) return false;
  const value = raw;
  return Object.keys(value).sort().join() === "code,detail,status,title,type" && value.status === status && value.code === "JOB_BINARY_REJECTED" && [value.type, value.title, value.detail].every((item) => typeof item === "string");
}
function validateAck(raw, geometry) {
  const value = object(raw, "binary acknowledgement");
  if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1 || value.artifactDigest !== geometry.artifactDigest || value.contentDigest !== geometry.contentDigest) {
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

// src/internal/binary-admission.ts
var limit = 2;
var active2 = 0;
var waiting3 = [];
async function withBinaryAdmission(operation, signal) {
  if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
  if (active2 < limit && waiting3.length === 0) active2 += 1;
  else await new Promise((resolve, reject) => {
    const waiter = { resolve, reject, ...signal === void 0 ? {} : { signal } };
    if (signal !== void 0) {
      const abort = () => {
        const index2 = waiting3.indexOf(waiter);
        if (index2 >= 0) waiting3.splice(index2, 1);
        reject(signal.reason ?? new DOMException("aborted", "AbortError"));
      };
      waiter.abort = abort;
      signal.addEventListener("abort", abort, { once: true });
    }
    waiting3.push(waiter);
  });
  try {
    if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
    return await operation();
  } finally {
    active2 -= 1;
    while (active2 < limit && waiting3.length > 0) {
      const waiter = waiting3.shift();
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
  constructor(enabled, now2 = Date.now) {
    this.enabled = enabled;
    this.now = now2;
  }
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
  set(key, url) {
    if (!this.enabled || url.length > MAX_URL_LENGTH) return;
    const expiresAt = reusableUntil(url, this.now());
    if (expiresAt === void 0 || expiresAt <= this.now()) return;
    entries2.delete(key);
    entries2.set(key, { url, expiresAt });
    while (entries2.size > MAX_ENTRIES) entries2.delete(entries2.keys().next().value);
  }
};
function reusableUntil(raw, now2) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return void 0;
  }
  const date = url.searchParams.get("X-Amz-Date");
  const seconds = url.searchParams.get("X-Amz-Expires");
  if (date === null && seconds === null) return now2 + FALLBACK_TTL_MS - SAFETY_MARGIN_MS;
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
  return Math.min(signedAt + ttl, now2 + FALLBACK_TTL_MS) - SAFETY_MARGIN_MS;
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
  return { statuses, unanswered, batched: answered > 0, lacking };
}

// src/internal/binary-submit-coordinator.ts
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
async function prepareUncached(options, fresh) {
  return withBinaryAdmission(async () => {
    try {
      const binary = await options.prepare(fresh);
      const geometryUrl = await uploadGeometry2(
        options.uploadGateway,
        options.fetch,
        binary,
        options.timeoutMs,
        options.signal
      );
      return binarySubmission(binary, geometryUrl);
    } finally {
      options.releasePrepared();
    }
  }, options.signal);
}
async function uncached(options, fresh) {
  const binary = await prepareUncached(options, fresh);
  return submitBinary(
    options.gateway,
    options.prepared,
    binary,
    options.parseJob,
    options.signal,
    options.beforeDispatch
  );
}
async function submitPreparedBinary(options) {
  if (!options.reuseEnabled) return uncached(options, false);
  const headers = await resolveAuth(options);
  const digest = await exactAuthHeadersDigest(headers);
  if (digest === void 0) return uncached(options, false);
  const strictAuth = boundAuth(headers, digest, options.auth);
  const gateway = transport(options.gateway.baseUrl, strictAuth, options);
  const uploadGateway = transport(options.uploadGateway.baseUrl, strictAuth, options);
  let paidDispatched = false;
  const beforeDispatch = () => {
    options.beforeDispatch?.();
    paidDispatched = true;
  };
  try {
    const binary = await withBinaryAdmission(async () => {
      try {
        const prepared = await options.prepare(false);
        const key = [
          gateway.baseUrl,
          uploadGateway.baseUrl,
          digest,
          prepared.artifact.encoding,
          prepared.artifact.artifactDigest
        ].join("\n");
        let url = options.urlCache.get(key);
        if (url === void 0) {
          url = await uploadGeometry2(
            uploadGateway,
            options.fetch,
            prepared,
            options.timeoutMs,
            options.signal
          );
          options.urlCache.set(key, url);
        }
        return binarySubmission(prepared, url);
      } finally {
        options.releasePrepared();
      }
    }, options.signal);
    return await submitBinary(
      gateway,
      options.prepared,
      binary,
      options.parseJob,
      options.signal,
      beforeDispatch
    );
  } catch (error) {
    if (!(error instanceof AuthPartitionChangedError)) throw error;
    if (paidDispatched) throw error;
    return uncached(options, true);
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
function decodeCompactGridDocument(document2, limits) {
  checkLimits(limits);
  const source = typeof SharedArrayBuffer !== "undefined" && document2.buffer instanceof SharedArrayBuffer ? document2.slice() : document2;
  const decoded = callCore("inspectBinaryResult", source, limits);
  if (decoded.family !== "numeric-grid" && decoded.family !== "categorical-grid") return void 0;
  const metadata = object2(JSON.parse(decoded.metadataJson), "binary result metadata");
  const sections = new Map(decoded.sections.map((section) => {
    const [offset, length] = section.byteRange;
    return [section.role, { ...section, bytes: source.subarray(offset, offset + length) }];
  }));
  const data = requireSection(sections, 1), validity = requireSection(sections, 2);
  const shape = metadata.shape;
  if (!Array.isArray(shape) || shape.length !== 2) throw new TypeError("grid shape is invalid");
  const rows = shape[0], columns = shape[1];
  if (!Number.isSafeInteger(rows) || !Number.isSafeInteger(columns)) {
    throw new TypeError("grid shape is invalid");
  }
  const bits2 = validity.bytes.slice();
  if (decoded.family === "categorical-grid") {
    if (data.dtype !== "u32") throw new TypeError("categorical grid data must use u32 codes");
    const raw = metadata.dictionary;
    if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string")) {
      throw new TypeError("categorical dictionary is missing");
    }
    return {
      route: "compact-grid",
      kind: "categorical",
      shape: [rows, columns],
      values: typed(data).slice(),
      validity: bits2,
      dictionary: Object.freeze(Array.from(raw))
    };
  }
  if (data.dtype === "f64") {
    return {
      route: "compact-grid",
      kind: "numeric",
      shape: [rows, columns],
      values: typed(data).slice(),
      validity: bits2
    };
  }
  const sourceValues = numericSource(data), divisor = valueDivisor(metadata, data);
  const values = new Float32Array(Number(data.elementCount));
  for (let index2 = 0; index2 < values.length; index2 += 1) {
    values[index2] = sourceValues.at(index2) / divisor;
  }
  return {
    route: "compact-grid",
    kind: "numeric",
    shape: [rows, columns],
    values,
    validity: bits2
  };
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
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk2 of chunks) {
    result.set(chunk2, offset);
    offset += chunk2.length;
  }
  return result;
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
  const result = finite(value, name);
  if (!Number.isSafeInteger(result) || result < 0 || result > 4294967295) {
    throw new TypeError(`${name} must be an unsigned 32-bit integer`);
  }
  return result;
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
  const cellTriangles2 = ownValue(entry, "cell-tris");
  if (trustedBulk) {
    if (cellTriangles2 !== void 0 && cellTriangles2 !== null && (!Array.isArray(cellTriangles2) || cellTriangles2.length !== expected)) {
      throw new TypeError(`surface ${key} cell-tris must contain exactly ${expected} cells`);
    }
  } else validateCellTriangles(cellTriangles2, expected, `surface ${key} cell-tris`);
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

// src/job-errors.ts
var JobFailedError = class extends Error {
  constructor(jobId, errorMessage) {
    super("job failed");
    this.jobId = jobId;
    this.errorMessage = errorMessage;
  }
  name = "JobFailedError";
};
var JobTimeoutError = class extends Error {
  constructor(jobId) {
    super("job polling timed out");
    this.jobId = jobId;
  }
  name = "JobTimeoutError";
};
var JobAbortedError = class extends Error {
  constructor(jobId) {
    super("job polling was aborted");
    this.jobId = jobId;
  }
  name = "JobAbortedError";
};
var JobNotCompletedError = class extends Error {
  constructor(jobId, status) {
    super("job is not completed");
    this.jobId = jobId;
    this.status = status;
  }
  name = "JobNotCompletedError";
};

// src/job-model.ts
var JobStatus = {
  Pending: "pending",
  Running: "running",
  Succeeded: "succeeded",
  Failed: "failed",
  Unknown: "unknown"
};
function withTreeBoxes(job, binary) {
  return binary?.treeBoxes === void 0 ? job : { ...job, treeBoxes: binary.treeBoxes };
}
function requireJobId(jobId) {
  if (typeof jobId !== "string" || jobId.length === 0) throw new TypeError("jobId must be a non-empty string");
  return jobId;
}

// src/area/facade-layout.ts
var MAX_WORD = 4294967295;
var LITTLE_ENDIAN = new Uint8Array(Uint32Array.of(1).buffer)[0] === 1;
function frames(raw) {
  if (!Array.isArray(raw)) throw new TypeError("kernel frames must be an array");
  return raw.map((frame) => {
    const bytes = frame.cells_u64_le;
    if (!(bytes instanceof Uint8Array) || bytes.byteLength % 8 !== 0) {
      throw new TypeError("kernel frame cells must be u64 LE bytes");
    }
    let words;
    if (LITTLE_ENDIAN && bytes.byteOffset % 4 === 0) {
      words = new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    } else {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      words = new Uint32Array(bytes.byteLength / 4);
      for (let index2 = 0; index2 < words.length; index2 += 1) words[index2] = view.getUint32(index2 * 4, true);
    }
    for (let index2 = 0; index2 < words.length; index2 += 2) {
      const high = words[index2 + 1];
      if (high !== 0 && (high !== MAX_WORD || words[index2] !== MAX_WORD)) {
        throw new RangeError("kernel frame cell index exceeds u32");
      }
    }
    return { key: frame.key, words };
  });
}
function frameViews(record4, frame, anchor) {
  const { words } = frame;
  const count2 = words.length / 2;
  let first;
  for (let index2 = 0; index2 < count2 && first === void 0; index2 += 1) {
    if (words[index2 * 2 + 1] === 0) first = words[index2 * 2];
  }
  if (first === void 0) {
    return {
      triangleValues: new Float32Array(),
      triangleOffsets: new Uint32Array(count2 + 1),
      triangleMask: new Uint8Array(count2),
      hasCellTris: true,
      triangleAnchor: anchor
    };
  }
  const base = record4.offsets[first];
  const offsets = new Uint32Array(count2 + 1);
  const mask = new Uint8Array(count2);
  let cursor = 0;
  let last = first;
  for (let index2 = 0; index2 < count2; index2 += 1) {
    if (words[index2 * 2 + 1] === 0) {
      const sensor = words[index2 * 2];
      if (record4.offsets[sensor] - base !== cursor) return void 0;
      cursor = record4.offsets[sensor + 1] - base;
      mask[index2] = 1;
      last = sensor;
    }
    offsets[index2 + 1] = cursor;
  }
  return {
    triangleValues: record4.cellTris.subarray(base, record4.offsets[last + 1]),
    triangleOffsets: offsets,
    triangleMask: mask,
    hasCellTris: true,
    triangleAnchor: anchor
  };
}
function layoutRecord(buffers, serverHash) {
  const cellTris = buffers.cell_tris, offsets = buffers.cell_tris_offsets;
  if (cellTris === null || offsets === null) {
    return { reason: "synth_error", detail: String(new TypeError("kernel returned no cell triangles")).slice(0, 200) };
  }
  if (buffers.sensor_layout_hash !== serverHash) return { reason: "hash_mismatch" };
  let list;
  try {
    list = frames(buffers.frames);
  } catch (error) {
    return { reason: "synth_error", detail: String(error).slice(0, 200) };
  }
  const frameBytes = list.reduce((sum, frame) => sum + frame.words.byteLength, 0);
  return { cellTris, offsets, frames: list, bytes: cellTris.byteLength + offsets.byteLength + frameBytes };
}

// src/area/facade-synthesis.ts
var ECHO_KEYS = [
  "mode",
  "grid-size",
  "offset",
  "max-sensors",
  "partial-cells",
  "min-coverage",
  "emit-cell-tris",
  "surfgrid-version"
];
var MODES = /* @__PURE__ */ new Set(["facades", "roofs", "all"]);
var DEFAULT_CACHE_BYTES = 256 * 1024 * 1024;
function echoFrom(raw) {
  if (raw === null || typeof raw !== "object") return void 0;
  const echo = raw;
  if (ECHO_KEYS.some((key) => !(key in echo))) return void 0;
  const mode = echo.mode;
  if (typeof mode !== "string" || !MODES.has(mode)) return void 0;
  const numbers2 = ["grid-size", "offset", "min-coverage"].map((key) => Number(echo[key]));
  if (numbers2.some((value) => !Number.isFinite(value))) return void 0;
  const maxSensors = Number(echo["max-sensors"]);
  if (!Number.isSafeInteger(maxSensors) || maxSensors < 0) return void 0;
  return {
    mode,
    gridSize: numbers2[0],
    offset: numbers2[1],
    minCoverage: numbers2[2],
    maxSensors: BigInt(maxSensors),
    partialCells: Boolean(echo["partial-cells"])
  };
}
var FacadeSynthesisStore = class {
  constructor(maxBytes = DEFAULT_CACHE_BYTES) {
    this.maxBytes = maxBytes;
  }
  inputs = /* @__PURE__ */ new Map();
  /** Insertion-ordered: a `Map` is an LRU once a hit re-inserts its key. */
  layouts = /* @__PURE__ */ new Map();
  retained = 0;
  hits = 0;
  misses = 0;
  /**
   * Retain one accepted job's inputs. Two places release them, and between
   * them they cover every accepted job: `take` on the merge that uses one, and
   * `forget` for the rest — the merge releases the whole schedule it finished
   * (its failed jobs included), and a submission that aborts releases what it
   * captured before the abort. A capture no release path reaches would be held
   * for the life of the client.
   */
  remember(jobId, input) {
    this.inputs.set(jobId, input);
  }
  take(jobId) {
    const input = this.inputs.get(jobId);
    this.inputs.delete(jobId);
    return input;
  }
  /** Release a capture no merge will ever consume. */
  forget(jobId) {
    this.inputs.delete(jobId);
  }
  get pendingCount() {
    return this.inputs.size;
  }
  get retainedBytes() {
    return this.retained;
  }
  /** Hits and misses since this client was built. A cache that never hits is
   * indistinguishable from one that was never built, so it is countable: the
   * F3 scene's layouts are 935 MB against the 256 MiB bound and score zero
   * (`docs/DEVIATIONS.md` D88). */
  get stats() {
    return { hits: this.hits, misses: this.misses };
  }
  /** A retained layout, counted as a hit (and made the most recent), or nothing. */
  lookup(key) {
    const record4 = this.layouts.get(key);
    if (record4 === void 0) return void 0;
    this.hits += 1;
    this.layouts.delete(key);
    this.layouts.set(key, record4);
    return record4;
  }
  /** Count one synthesized layout as a miss and retain it when it fits the bound. */
  retain(key, record4) {
    this.misses += 1;
    if (this.maxBytes <= 0 || record4.bytes > this.maxBytes) return;
    while (this.layouts.size > 0 && this.retained + record4.bytes > this.maxBytes) {
      const [oldest, evicted] = this.layouts.entries().next().value;
      this.layouts.delete(oldest);
      this.retained -= evicted.bytes;
    }
    this.layouts.set(key, record4);
    this.retained += record4.bytes;
  }
};
function identityProbe(response) {
  const probe = {
    surfaces: {},
    aggregates: { buildings: {} },
    "min-legend": 0,
    "max-legend": 0,
    "sensor-count": 0
  };
  for (const key of ["sensor-layout-hash", "geometry-hashes", "synth-params"]) {
    if (key in response) probe[key] = response[key];
  }
  return JSON.stringify(probe);
}
function withCellTrisFallback(result, fallbacks) {
  return fallbacks.size === 0 ? result : { ...result, cellTrisFallback: [...fallbacks].sort() };
}
function synthesizeSurfaceTriangles(store, jobs, logger, fallbacks) {
  const started = performance.now();
  const core2 = requireCore();
  const planned = [];
  const outcomes = /* @__PURE__ */ new Map();
  const needed = /* @__PURE__ */ new Map();
  for (const job of jobs) {
    const fell = (reason2, detail) => {
      if (reason2 !== "already_present") fallbacks?.add(reason2);
      logger.warn({
        event: "facade_synthesis",
        outcome: "fell_back",
        reason: reason2,
        jobId: job.jobId,
        elapsedMs: Math.round(performance.now() - started),
        ...detail === void 0 ? {} : { detail }
      });
      return void 0;
    };
    const input = store.take(job.jobId);
    if (input === void 0) continue;
    const surfaces2 = job.response.surfaces;
    if (surfaces2 === null || typeof surfaces2 !== "object") {
      fell("no_surfaces");
      continue;
    }
    if (Object.values(surfaces2).some(
      (grid) => grid["cell-tris"] != null
    )) {
      fell("already_present");
      continue;
    }
    let identity;
    try {
      identity = JSON.parse(core2.decodeSurfaceIdentity(identityProbe(job.response)));
    } catch (error) {
      fell("no_hash", String(error).slice(0, 200));
      continue;
    }
    const serverHash = identity["sensor-layout-hash"];
    if (typeof serverHash !== "string" || serverHash.length === 0) {
      fell("no_hash");
      continue;
    }
    const echo = echoFrom(identity["synth-params"]);
    if (echo === void 0) {
      fell("no_echo");
      continue;
    }
    if (!echo.partialCells) {
      fell("not_clipped");
      continue;
    }
    const keys = Object.keys(surfaces2);
    const cacheKey2 = `${serverHash}:${JSON.stringify([...keys].sort())}`;
    planned.push({ job, keys, cacheKey: cacheKey2, fell });
    if (outcomes.has(cacheKey2) || needed.has(cacheKey2)) continue;
    const hit = store.lookup(cacheKey2);
    if (hit !== void 0) outcomes.set(cacheKey2, hit);
    else needed.set(cacheKey2, { capture: input.capture, echo, serverHash });
  }
  synthesizeNeeded(store, needed, outcomes);
  const attached = /* @__PURE__ */ new Map();
  for (const { job, keys, cacheKey: cacheKey2, fell } of planned) {
    const views = attach(outcomes.get(cacheKey2), job, keys, fell);
    if (views === void 0) continue;
    for (const [key, view] of views) attached.set(key, view);
    logger.info({
      event: "facade_synthesis",
      outcome: "engaged",
      jobId: job.jobId,
      surfaces: views.size,
      elapsedMs: Math.round(performance.now() - started)
    });
  }
  return attached;
}
function synthesizeNeeded(store, needed, outcomes) {
  const groups = /* @__PURE__ */ new Map();
  for (const entry of needed) {
    const { echo } = entry[1];
    const group = [echo.mode, echo.gridSize, echo.offset, echo.maxSensors, echo.partialCells, echo.minCoverage].map(String).join("|");
    groups.set(group, [...groups.get(group) ?? [], entry]);
  }
  const core2 = requireCore();
  for (const entries3 of groups.values()) {
    const { echo } = entries3[0][1];
    try {
      core2.synthesizeSurfacesFromCaptures(entries3.map(([, need]) => need.capture), (index2, answer) => {
        const [cacheKey2, need] = entries3[index2];
        if (answer instanceof Error) {
          outcomes.set(cacheKey2, { reason: "synth_error", detail: String(answer).slice(0, 200) });
          return;
        }
        const record4 = layoutRecord(answer, need.serverHash);
        if ("cellTris" in record4) store.retain(cacheKey2, record4);
        outcomes.set(cacheKey2, record4);
      }, echo.mode, echo.gridSize, echo.offset, echo.maxSensors, echo.partialCells, echo.minCoverage, true, true);
    } catch (error) {
      for (const [cacheKey2] of entries3) {
        if (!outcomes.has(cacheKey2)) {
          outcomes.set(cacheKey2, { reason: "synth_error", detail: String(error).slice(0, 200) });
        }
      }
    }
  }
}
function attach(outcome, job, keys, fell) {
  if (!("cellTris" in outcome)) return fell(outcome.reason, outcome.detail);
  const surfaces2 = job.response.surfaces;
  const views = /* @__PURE__ */ new Map();
  for (const frame of outcome.frames) {
    if (!(frame.key in surfaces2)) return fell("frame_mismatch", frame.key);
    const view = frameViews(outcome, frame, job.anchor);
    if (view === void 0) return fell("frame_mismatch", frame.key);
    views.set(frame.key, view);
  }
  if (views.size !== keys.length) return fell("frame_mismatch");
  return views;
}

// src/jobs.ts
var DEFAULT_POLL_TIMEOUT_SECONDS = 300;
var BACKOFF_BASE_MS = 2e3;
var BACKOFF_FLOOR_MS = 500;
var BACKOFF_CAP_SECONDS = 10;
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
  capabilityPromise;
  /** `undefined` until the batched status route has been tried once. */
  batchedStatus;
  binaryPrepared = new BinaryRetention();
  geometryUrls;
  auth;
  binaryUrlReuse;
  /** Default `consoleLogger`, like every other service in this package. The
   * only line it can emit that an earlier SDK did not is the D70 substitution
   * report — and that is on a body an earlier SDK THREW on, so no working
   * caller starts seeing new output. */
  logger;
  /** Bodies whose substitution has already been reported. */
  loggedTreeBoxes = /* @__PURE__ */ new WeakSet();
  /**
   * This client's facade capture and layout cache (`area/facade-synthesis.ts`).
   * Per client, dies with it: no disk, no IndexedDB, no module-global map, and
   * nothing of it reaches an `AreaSchedule`.
   */
  facadeSynthesis = new FacadeSynthesisStore();
  constructor(options) {
    const fetcher = resolveFetch(options.fetch);
    if (typeof fetcher !== "function") throw new TypeError("a fetch implementation is required");
    this.fetch = fetcher;
    this.pollIntervalMs = options.pollIntervalMs;
    if (this.pollIntervalMs !== void 0) requireTimeout(this.pollIntervalMs);
    const backoffCapSeconds = options.backoffCapSeconds ?? BACKOFF_CAP_SECONDS;
    requireTimeout(backoffCapSeconds * 1e3);
    this.backoffCapMs = backoffCapSeconds * 1e3;
    this.downloadTimeoutMs = options.downloadTimeoutMs ?? 6e5;
    requireTimeout(this.downloadTimeoutMs);
    this.requestTimeoutMs = options.timeoutMs ?? 18e4;
    requireTimeout(this.requestTimeoutMs);
    this.bigPayloadThresholdBytes = options.bigPayloadThresholdBytes ?? BIG_PAYLOAD_THRESHOLD_BYTES;
    this.binaryUrlReuse = options.binaryUrlReuse !== false;
    this.logger = options.logger ?? consoleLogger;
    this.geometryUrls = new BinaryUrlCache(this.binaryUrlReuse);
    this.auth = options.auth;
    if (!Number.isSafeInteger(this.bigPayloadThresholdBytes) || this.bigPayloadThresholdBytes < 0) {
      throw new TypeError("bigPayloadThresholdBytes must be a non-negative safe integer");
    }
    this.gateway = new GatewayTransport(options);
    this.geometryReuseEnabled = options.geometryReuseEnabled ?? true;
    this.geometryReuseOptions = buildGeometryReuseOptions(
      options,
      this.fetch,
      this.bigPayloadThresholdBytes,
      this.requestTimeoutMs
    );
    this.uploadGateway = new GatewayTransport({
      ...options,
      baseUrl: options.gatewayBaseUrl ?? options.baseUrl
    });
  }
  /** Decompress and route an already downloaded result archive. */
  decompress(content, options) {
    return parseResultArchive(content, options);
  }
  async submit(analysisType, payload, options = {}) {
    const prepared = this.prepareSubmission(analysisType, payload, options);
    return this.submitPrepared(prepared, options.signal === void 0 ? {} : { signal: options.signal });
  }
  prepareSubmission(analysisType, payload, options = {}) {
    const transport3 = options.transport ?? "json";
    if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
      throw new TypeError("unsupported option binaryResults; use transport instead");
    }
    return {
      analysisType,
      transport: transport3,
      body: prepareSubmissionBody(analysisType, payload, options)
    };
  }
  async submitPrepared(prepared, options = {}) {
    if (prepared.transport === "binary") {
      let binary;
      const parseJob2 = (response) => withTreeBoxes(jobFromResponse(response), binary);
      return submitPreparedBinary({
        prepared,
        parseJob: parseJob2,
        prepare: async (fresh) => {
          if (!fresh) {
            const retained = this.binaryPrepared.get(prepared);
            if (retained !== void 0) {
              binary = retained;
              return retained;
            }
          }
          binary = await this.prepareBinaryValue(prepared, options.signal);
          return binary;
        },
        releasePrepared: () => this.binaryPrepared.release(prepared),
        gateway: this.gateway,
        uploadGateway: this.uploadGateway,
        auth: this.auth,
        fetch: this.fetch,
        timeoutMs: this.requestTimeoutMs,
        urlCache: this.geometryUrls,
        reuseEnabled: this.binaryUrlReuse,
        ...options.signal === void 0 ? {} : { signal: options.signal },
        ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch }
      });
    }
    if (this.geometryReuseEnabled) {
      const reused = await tryGeometryReuse(prepared, this.geometryReuseOptions, options.signal, options.beforeDispatch);
      if (reused !== void 0) return reused;
    }
    let json;
    try {
      const bytes = jsonWireBytes(prepared.body, (_key, value) => ArrayBuffer.isView(value) ? Array.from(value) : value);
      if (bytes === void 0) throw new TypeError("request has no JSON wire form");
      json = bytes;
    } catch {
      throw new TransportError("job request is not JSON serializable", "pre-dispatch", "validation", "POST");
    }
    const archive = requireCore().zipPayloadJson(json);
    return submitArchive({
      endpointPath: `/async/${encodeURIComponent(prepared.analysisType)}`,
      archive,
      gateway: this.gateway,
      uploadGateway: this.uploadGateway,
      fetch: this.fetch,
      thresholdBytes: this.bigPayloadThresholdBytes,
      timeoutMs: this.requestTimeoutMs,
      parseAccepted: jobFromResponse,
      ...options.beforeDispatch === void 0 ? {} : { beforeDispatch: options.beforeDispatch },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  }
  /**
   * Finish all binary validation and encoding before a paid submission.
   *
   * What it encodes is RETAINED, under this client's byte budget
   * (`internal/binary-retention.ts`), and `submitPrepared` sends exactly those
   * bytes instead of encoding the same body a second time. The submit frees the
   * artifact as soon as its upload has used it; a caller that preflights a
   * whole plan and then does NOT submit some of it must call
   * `releasePreflight` for those — `area/submission.ts` does.
   */
  async preflightPrepared(prepared, options = {}) {
    if (prepared.transport !== "binary" || this.binaryPrepared.get(prepared) !== void 0) return;
    const binary = await withBinaryAdmission(
      () => this.prepareBinaryValue(prepared, options.signal),
      options.signal
    );
    if (options.retain !== false) this.binaryPrepared.keep(prepared, binary);
  }
  /** Free what a preflight is holding for a submission that will not happen. */
  releasePreflight(prepared) {
    this.binaryPrepared.release(prepared);
  }
  async prepareBinaryValue(prepared, signal) {
    this.capabilityPromise ??= capability(this.gateway, signal).catch((error) => {
      this.capabilityPromise = void 0;
      throw error;
    });
    const binary = await prepareBinary(prepared, await this.capabilityPromise);
    if (binary.treeBoxes !== void 0 && !this.loggedTreeBoxes.has(prepared)) {
      this.loggedTreeBoxes.add(prepared);
      this.logger.info(treeBoxLogLine(binary.treeBoxes));
      if (binary.treeBoxes.idCollisions.length > 0) {
        this.logger.warn(treeBoxCollisionLine(binary.treeBoxes));
      }
      if (binary.treeBoxes.outsideTile > 0) {
        this.logger.warn(treeBoxOutOfTileLine(binary.treeBoxes));
      }
    }
    return binary;
  }
  async getStatusWithSignal(jobId, signal) {
    const id = requireJobId(jobId);
    const response = await this.gateway.requestJson(
      `/async/jobs/${encodeURIComponent(id)}`,
      signal === void 0 ? {} : { signal }
    );
    const job = jobFromResponse(response);
    if (job.jobId !== id) throw new Error("job response ID does not match requested jobId");
    return job;
  }
  async getStatus(jobId, options = {}) {
    return this.getStatusWithSignal(jobId, options.signal);
  }
  /** Whether the batched status route has answered this client at least once.
   *  `false` until it has, and `false` for ever once a gateway has shown it
   *  lacks the route — which is what the area poll reads to choose its
   *  interval (`internal/status-batch.ts`, `docs/DEVIATIONS.md` D121). */
  get batchedStatusSupported() {
    return this.batchedStatus === true;
  }
  /** Many job statuses in one request per 50 ids. Ids it could not settle
   *  come back in `unanswered` for the caller to ask about per job; it never
   *  throws for a gateway reason. A gateway that lacks the route is asked
   *  once and never again. */
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
  async notify(deadline, callback, job, attempt, elapsed, nextDelay) {
    if (callback === void 0) return void 0;
    try {
      return await deadline.wait(() => Promise.resolve(callback(job, attempt, elapsed, nextDelay)));
    } catch (error) {
      if (deadline.reason() !== void 0) throw error;
      return void 0;
    }
  }
  async waitForCompletion(jobId, options = {}) {
    const id = requireJobId(jobId);
    const timeoutSeconds = options.timeout ?? DEFAULT_POLL_TIMEOUT_SECONDS;
    requireTimeout(timeoutSeconds * 1e3);
    const deadline = new Deadline(options.signal, timeoutSeconds * 1e3);
    const startedAt = performance.now();
    let attempt = 0;
    try {
      while (true) {
        const job = await deadline.wait(() => this.getStatusWithSignal(id, deadline.controller.signal));
        const terminal2 = job.status === JobStatus.Succeeded || job.status === JobStatus.Failed;
        const elapsed = (performance.now() - startedAt) / 1e3;
        const delayMs = this.pollIntervalMs ?? Math.max(
          BACKOFF_FLOOR_MS,
          Math.random() * Math.min(this.backoffCapMs, BACKOFF_BASE_MS * 2 ** attempt)
        );
        const nextDelay = terminal2 ? 0 : delayMs / 1e3;
        const keepGoing = await this.notify(
          deadline,
          options.onPoll,
          job,
          attempt,
          elapsed,
          nextDelay
        );
        if (keepGoing === false) return job;
        if (job.status === JobStatus.Succeeded) return job;
        if (job.status === JobStatus.Failed) throw new JobFailedError(id, job.error ?? "");
        attempt += 1;
        await deadline.wait(() => delay(delayMs, deadline.controller.signal));
      }
    } catch (error) {
      const stopped = deadline.reason();
      if (stopped !== void 0) {
        throw stopped === "timeout" ? new JobTimeoutError(id) : new JobAbortedError(id);
      }
      throw error;
    } finally {
      deadline.close();
    }
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
  async downloadResults(jobId, options = {}) {
    const id = requireJobId(jobId);
    if (options.job !== void 0 && options.job.jobId !== id) {
      throw new TypeError("supplied job ID does not match requested jobId");
    }
    const job = options.job ?? await this.getStatusWithSignal(id, options.signal);
    if (job.status !== JobStatus.Succeeded) throw new JobNotCompletedError(id, job.status);
    for (let attempt = 0; ; attempt += 1) {
      const presignedUrl = await this.resultsUrl(id, options.signal);
      try {
        const downloaded = await this.download(presignedUrl, options.signal);
        return { ...downloaded, jobId: id, presignedUrl };
      } catch (error) {
        if (attempt >= DOWNLOAD_RETRY_ATTEMPTS || !isRetryableDownloadError(error)) throw error;
      }
      await pauseBeforeRetry(options.signal);
    }
  }
};

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
    ...schedule2.webhookEvents === void 0 ? {} : { webhookEvents: [...schedule2.webhookEvents] }
  };
}
function invalid(message) {
  throw new TypeError(`invalid area schedule: ${message}`);
}
function object3(value, name) {
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
  const raw = object3(value, `job ${key}`);
  if (raw.result !== void 0 || raw.lastJobSnapshot !== void 0) invalid(`job ${key} contains non-durable state`);
  const tileId = string(raw.tileId, `job ${key}.tileId`);
  if (tileId !== key) invalid(`job key ${key} does not match tileId ${tileId}`);
  if (typeof raw.status !== "string" || !STATUSES.has(raw.status)) invalid(`job ${key} has invalid status`);
  if (raw.jobId !== void 0 && (typeof raw.jobId !== "string" || raw.jobId.length === 0)) invalid(`job ${key} has invalid jobId`);
  if (raw.error !== void 0 && typeof raw.error !== "string") invalid(`job ${key} has invalid error`);
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
  const failed2 = uniqueReferences(failedSubmissions, "failedSubmissions");
  const uncertain = uniqueReferences(uncertainSubmissions, "uncertainSubmissions");
  const invalidReferences = uniqueReferences(
    invalidReferenceSubmissions,
    "invalidReferenceSubmissions"
  );
  for (const tileId of failed2) {
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
    if (failed2.has(tileId) || uncertain.has(tileId)) {
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
  const raw = object3(value, "root");
  if (!Array.isArray(raw.jobs)) invalid("jobs must be an array");
  const jobs = /* @__PURE__ */ new Map();
  for (const entry of raw.jobs) {
    if (!Array.isArray(entry) || entry.length !== 2) invalid("job entry must be a pair");
    const key = string(entry[0], "job key");
    if (jobs.has(key)) invalid(`duplicate job ${key}`);
    jobs.set(key, parseJob(key, entry[1]));
  }
  const polygon = object3(raw.polygon, "polygon");
  if (polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) invalid("polygon must be GeoJSON Polygon");
  if (!Array.isArray(raw.gridShape) || raw.gridShape.length !== 2) invalid("gridShape must contain two indexes");
  if (!Array.isArray(raw.tilePositions) || !Array.isArray(raw.failedSubmissions)) invalid("schedule arrays are missing");
  const tilePositions = raw.tilePositions.map((item, at) => {
    const position = object3(item, `tilePositions[${at}]`);
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
  if (raw.siteIdentity !== void 0 && (typeof raw.siteIdentity !== "string" || !/^sha256:[0-9a-f]{64}$/.test(raw.siteIdentity))) {
    invalid("siteIdentity must be a sha256: digest");
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
    ...Array.isArray(raw.webhookEvents) ? { webhookEvents: raw.webhookEvents.map((item) => string(item, "webhook event")) } : {}
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
  const raw = object3(value, `job ${key}.binary`);
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
  const raw = object3(value, name);
  const entries3 = [];
  for (const [key, items] of Object.entries(raw)) {
    if (!Array.isArray(items)) invalid(`${name}.${key} must be an array`);
    entries3.push([key, items.map((item) => string(item, `${name}.${key}`))]);
  }
  return Object.fromEntries(entries3);
}
function optionalPositiveIntegers(value, name) {
  if (value === void 0) return void 0;
  const raw = object3(value, name);
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
var failures = /* @__PURE__ */ new WeakMap();
var FAILURE_LIMIT = 5;
var FAILURE_MIN_SPAN_MS = 1e4;
function workerCount(value) {
  const count2 = value ?? 5;
  if (!Number.isSafeInteger(count2) || count2 < 1) throw new TypeError("maxWorkers must be a positive integer");
  return count2;
}
function applySnapshot(job, snapshot) {
  job.lastJobSnapshot = snapshot;
  if (snapshot.status === JobStatus.Succeeded) job.status = "completed";
  else if (snapshot.status === JobStatus.Failed) {
    job.status = "failed";
    job.error = snapshot.error ?? "job failed";
  } else if (snapshot.status === JobStatus.Running) job.status = "running";
  else job.status = "pending";
}
async function pollOne(service, job, signal) {
  if (job.invalidReference === true || !job.jobId || job.status === "completed" || job.status === "failed" || job.status === "skipped") return;
  if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
  try {
    const snapshot = await service.getStatus(job.jobId, signal === void 0 ? {} : { signal });
    failures.delete(job);
    applySnapshot(job, snapshot);
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? new DOMException("aborted", "AbortError");
    const now2 = performance.now();
    const previous = failures.get(job);
    const count2 = (previous?.count ?? 0) + 1;
    const sinceMs = previous?.sinceMs ?? now2;
    failures.set(job, { count: count2, sinceMs });
    if (count2 >= FAILURE_LIMIT && now2 - sinceMs >= FAILURE_MIN_SPAN_MS) {
      job.status = "skipped";
      job.error = error instanceof Error ? error.message : String(error);
    }
  }
}
function revivePolledOut(schedule2) {
  let revived = 0;
  for (const job of schedule2.jobs.values()) {
    if (job.status !== "skipped" || !job.jobId) continue;
    job.status = "pending";
    failures.delete(job);
    revived += 1;
  }
  return revived;
}
async function pollBatched(service, pending2, options) {
  const getStatusBatch = service.getStatusBatch;
  if (getStatusBatch === void 0) return pending2;
  const byId = /* @__PURE__ */ new Map();
  for (const job of pending2) if (job.jobId) byId.set(job.jobId, job);
  if (byId.size === 0) return pending2;
  let sweep;
  try {
    sweep = await getStatusBatch.call(service, [...byId.keys()], {
      ...options.signal === void 0 ? {} : { signal: options.signal },
      ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers }
    });
  } catch (error) {
    if (options.signal?.aborted === true) throw error;
    return pending2;
  }
  for (const [id, job] of byId) {
    const snapshot = sweep.statuses.get(id);
    if (snapshot === void 0) continue;
    failures.delete(job);
    applySnapshot(job, snapshot);
  }
  return sweep.unanswered.map((id) => byId.get(id)).filter((job) => job !== void 0);
}
var perJobRequests = /* @__PURE__ */ new WeakMap();
function lastPerJobRequests(schedule2) {
  return perJobRequests.get(schedule2) ?? 0;
}
async function checkAreaState(service, schedule2, options = {}) {
  const pending2 = [...schedule2.jobs.values()].filter((job) => Boolean(job.jobId) && job.status !== "completed" && job.status !== "failed" && job.status !== "skipped");
  const remaining = service.getStatusBatch === void 0 || pending2.length === 0 ? pending2 : await pollBatched(service, pending2, options);
  perJobRequests.set(schedule2, remaining.length);
  const count2 = Math.min(workerCount(options.maxWorkers), Math.max(1, remaining.length));
  let cursor = 0;
  await Promise.all(Array.from({ length: count2 }, async () => {
    while (cursor < remaining.length) {
      const job = remaining[cursor++];
      if (job) await pollOne(service, job, options.signal);
    }
  }));
  const state = computeAreaState(schedule2);
  try {
    options.onProgress?.(state);
  } catch {
  }
  return state;
}

// src/internal/submission-stopped.ts
var SubmissionStoppedError = class extends TransportError {
  constructor() {
    super("submission stopped after an invalid geometry reference", "pre-dispatch", "aborted", "POST");
  }
};

// src/area/submission.ts
function concurrency(value) {
  const count2 = value ?? 8;
  if (!Number.isSafeInteger(count2) || count2 < 1) throw new TypeError("maxWorkers must be a positive integer");
  return count2;
}
function effectiveOptions(options) {
  if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
    throw new TypeError("unsupported option binaryResults; use transport instead");
  }
  const transport3 = options.transport ?? options.retryFrom?.transport ?? "json";
  if (options.transport !== void 0 && options.retryFrom?.transport !== void 0 && options.transport !== options.retryFrom.transport) {
    throw new Error("retryFrom transport mismatch");
  }
  const margin = options.terrainContextMarginM ?? options.retryFrom?.terrainContextMarginM;
  if (margin !== void 0 && (!Number.isFinite(margin) || margin < 0)) {
    throw new TypeError("terrainContextMarginM must be a finite non-negative number");
  }
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
function tileStatus(job) {
  if (job.status === JobStatus.Succeeded) return "completed";
  if (job.status === JobStatus.Failed) return "failed";
  if (job.status === JobStatus.Running) return "running";
  return "pending";
}
function unknownAcceptance(error, posted) {
  return error instanceof SubmissionUncertainError || error instanceof TransportError && error.phase === "unknown-acceptance" && (error.reason !== "aborted" || posted);
}
function copyPriorJobs(schedule2) {
  const jobs = /* @__PURE__ */ new Map();
  if (!schedule2) return jobs;
  for (const [key, job] of schedule2.jobs) jobs.set(key, { ...job });
  return jobs;
}
function scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options) {
  const siteIdentity = options.retryFrom === void 0 ? plan.siteIdentity : options.retryFrom.siteIdentity;
  const sensorCap = options.maxSensorsPerJob ?? options.retryFrom?.maxSensorsPerJob;
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
    transport: options.transport ?? "json",
    ...options.transport === "binary" ? { wireVersion: 1 } : {},
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
    ...options.webhookEvents === void 0 ? {} : { webhookEvents: [...options.webhookEvents] }
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
function reportAccepted(options, jobId, tileKey) {
  if (jobId === void 0 || options.onAccepted === void 0) return;
  try {
    options.onAccepted(jobId, tileKey);
  } catch {
  }
}
function failed(entry, error) {
  return {
    tileId: entry.key,
    row: entry.row,
    col: entry.col,
    status: "failed",
    error: error instanceof Error ? error.message : String(error)
  };
}
function facadeCaptureFor(service, plan, entry) {
  if (service.facadeSynthesis === void 0 || plan.localCellTris !== true) return void 0;
  if (entry.capture === void 0) return void 0;
  const alignment = entry.prepared.body["terrain-alignment"];
  return entry.capture(typeof alignment === "string" ? alignment : null);
}
function rememberFacadeInputs(service, capture, jobId) {
  const store = service.facadeSynthesis;
  if (store === void 0 || jobId === void 0 || capture === void 0) return;
  store.remember(jobId, { capture });
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
  checkPaidRetrySiteIdentity(options.retryFrom, plan.siteIdentity, entries3.length > 0);
  const jobs = copyPriorJobs(options.retryFrom);
  const failedSubmissions = [];
  const uncertainSubmissions = [...options.retryFrom?.uncertainSubmissions ?? []];
  const invalidReferenceSubmissions = [
    ...options.retryFrom?.invalidReferenceSubmissions ?? []
  ];
  let submissionAbortStatus = null;
  let invalidReferenceAbort = false;
  const beforeDispatch = () => {
    if (invalidReferenceAbort) throw new SubmissionStoppedError();
  };
  let cursor = 0;
  const workers = Math.min(concurrency(options.maxWorkers), Math.max(1, entries3.length));
  try {
    if ((options.transport ?? "json") === "binary") {
      for (const entry of entries3) {
        await service.preflightPrepared(
          entry.prepared,
          options.signal === void 0 ? {} : { signal: options.signal }
        );
      }
    }
    await Promise.all(Array.from({ length: workers }, async () => {
      while (cursor < entries3.length) {
        const entry = entries3[cursor++];
        if (!entry) continue;
        if (invalidReferenceAbort) {
          jobs.set(entry.key, {
            tileId: entry.key,
            row: entry.row,
            col: entry.col,
            status: "skipped",
            error: "submission stopped after an invalid geometry reference"
          });
          continue;
        }
        if (submissionAbortStatus !== null || options.signal?.aborted) {
          failedSubmissions.push(entry.key);
          jobs.set(entry.key, failed(entry, options.signal?.reason ?? "submission stopped"));
          continue;
        }
        let posted = false;
        try {
          const capture = facadeCaptureFor(service, plan, entry);
          const job = await service.submitPrepared(
            entry.prepared,
            {
              beforeDispatch: () => {
                beforeDispatch();
                posted = true;
              },
              ...options.signal === void 0 ? {} : { signal: options.signal }
            }
          );
          rememberFacadeInputs(service, capture, job.jobId);
          jobs.set(entry.key, {
            tileId: entry.key,
            row: entry.row,
            col: entry.col,
            jobId: job.jobId,
            status: tileStatus(job),
            lastJobSnapshot: job,
            ...job.binary === void 0 ? {} : { binary: job.binary },
            ...job.treeBoxes === void 0 ? {} : { treeBoxes: job.treeBoxes },
            ...job.error === void 0 ? {} : { error: job.error }
          });
          reportAccepted(options, job.jobId, entry.key);
        } catch (error) {
          if (error instanceof SubmissionStoppedError) {
            jobs.set(entry.key, {
              tileId: entry.key,
              row: entry.row,
              col: entry.col,
              status: "skipped",
              error: error.message
            });
          } else if (error instanceof GeometryReferenceSubmissionError) {
            invalidReferenceAbort = true;
            invalidReferenceSubmissions.push(entry.key);
            const accepted = error.acceptedJobIds[0];
            jobs.set(entry.key, {
              tileId: entry.key,
              row: entry.row,
              col: entry.col,
              ...accepted === void 0 ? {} : { jobId: accepted },
              status: "failed",
              invalidReference: true,
              error: error.message
            });
            reportAccepted(options, accepted, entry.key);
          } else if (unknownAcceptance(error, posted)) {
            uncertainSubmissions.push(entry.key);
            const accepted = error instanceof SubmissionUncertainError ? error.acceptedJobIds[0] : void 0;
            jobs.set(entry.key, {
              tileId: entry.key,
              row: entry.row,
              col: entry.col,
              ...accepted === void 0 ? {} : { jobId: accepted },
              status: accepted === void 0 ? "skipped" : "pending",
              error: "submission outcome is unknown; do not resubmit automatically"
            });
            reportAccepted(options, accepted, entry.key);
          } else {
            if (error instanceof TransportError && error.status === 402) submissionAbortStatus = 402;
            failedSubmissions.push(entry.key);
            jobs.set(entry.key, failed(entry, error));
          }
        }
      }
    }));
  } finally {
    for (const entry of entries3) service.releasePreflight?.(entry.prepared);
  }
  const schedule2 = freezeAreaSchedule(scheduleFromPlan(
    plan,
    jobs,
    failedSubmissions,
    uncertainSubmissions,
    invalidReferenceSubmissions,
    submissionAbortStatus,
    options
  ));
  try {
    options.onProgress?.(computeAreaState(schedule2));
  } catch {
  }
  if (invalidReferenceSubmissions.length > 0) {
    for (const job of jobs.values()) {
      if (job.jobId !== void 0) service.facadeSynthesis?.forget(job.jobId);
    }
    const ids = [...jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== void 0 ? [job.jobId] : []);
    throw new AreaGeometryReferenceError(schedule2, ids);
  }
  return schedule2;
}
async function runArea(service, input, polygon, options = {}) {
  const effective = effectiveOptions(options);
  concurrency(effective.maxWorkers);
  const plan = await planAreaSubmission(service, input, polygon, effective);
  return submitAreaPlan(service, plan, effective);
}

// src/area/preview.ts
function gridTileCount(tilePositions) {
  return tilePositions.filter((position) => !position.tileId.includes("#batch")).length;
}
function sumSensorCounts(counts) {
  if (counts === void 0) return void 0;
  return Object.values(counts).reduce((total, count2) => total + count2, 0);
}
async function previewAreaBatches(service, input, polygon, options = {}) {
  const plan = await planAreaSubmission(service, input, polygon, options);
  const plannedJobCount = plan.plannedJobCount ?? plan.entries.length;
  const sensorCount = sumSensorCounts(plan.batchSensorCounts);
  return {
    tileCount: gridTileCount(plan.tilePositions),
    plannedJobCount,
    estimatedTimeS: plannedJobCount * ESTIMATED_SECONDS_PER_TILE,
    estimatedCostTokens: plannedJobCount * DEFAULT_TOKENS_PER_JOB,
    ...sensorCount === void 0 ? {} : { sensorCount }
  };
}

// src/area/schedule-types.ts
var TileFailurePhase = {
  Submit: "submit",
  Compute: "compute",
  Download: "download",
  Skipped: "skipped"
};

// src/area/compact-grid-tile.ts
function validAt2(bits2, index2) {
  return (bits2[index2 >> 3] & 1 << (index2 & 7)) !== 0;
}
function compactGridTile(parsed, cells) {
  if (parsed.shape[0] !== parsed.shape[1] || parsed.shape[0] * parsed.shape[1] !== cells) {
    throw new Error(`grid result must contain exactly ${cells} cells`);
  }
  if (parsed.kind === "categorical") {
    const category = {
      codes: parsed.values,
      validity: parsed.validity,
      dictionary: parsed.dictionary ?? []
    };
    const values2 = new Float32Array(cells).fill(Number.NaN);
    for (let cell = 0; cell < cells; cell += 1) {
      if (!validAt2(category.validity, cell)) continue;
      const label = category.dictionary[category.codes[cell]];
      const value = Number(label);
      if (label === void 0 || Number.isNaN(value)) return { compactCategory: category };
      values2[cell] = value;
    }
    return { values: values2 };
  }
  const values = parsed.values.slice();
  for (let cell = 0; cell < cells; cell += 1) {
    if (!validAt2(parsed.validity, cell)) values[cell] = Number.NaN;
  }
  return { values };
}
function compactCategoricalDense(sources, slots, cells) {
  const codes = new Uint32Array(slots * cells);
  const validity = new Uint8Array(Math.ceil(codes.length / 8));
  const legends = Array.from({ length: slots }, () => []);
  const put = (index2, cell, code) => {
    const at = index2 * cells + cell;
    codes[at] = code;
    validity[at >> 3] = validity[at >> 3] | 1 << (at & 7);
  };
  for (const { index: index2, category } of sources) {
    legends[index2] = Array.from(category.dictionary);
    for (let cell = 0; cell < cells; cell += 1) {
      if (validAt2(category.validity, cell)) put(index2, cell, category.codes[cell]);
    }
  }
  const normalized = requireCore().normalizeAreaCategoricalCompact(
    codes,
    validity,
    JSON.stringify(legends),
    cells
  );
  try {
    return { values: normalized.values, legend: Object.freeze(Array.from(normalized.legend, String)) };
  } finally {
    normalized.free();
  }
}
function numericCanvas(current, length, incoming) {
  if (current === void 0) {
    return incoming instanceof Float64Array ? new Float64Array(length).fill(Number.NaN) : new Float32Array(length).fill(Number.NaN);
  }
  return current instanceof Float32Array && incoming instanceof Float64Array ? new Float64Array(current) : current;
}

// src/area/merge-grid-data.ts
function positions(tiles) {
  const result = new Uint32Array(tiles.length * 2);
  tiles.forEach((tile, index2) => {
    if (tile === void 0) throw new Error(`grid tile ${index2} is missing a position`);
    result[index2 * 2] = tile.row;
    result[index2 * 2 + 1] = tile.col;
  });
  return result;
}
function flattenGridTile(row, col, parsed, tileCells) {
  if (parsed.ambiguousEmpty === true) {
    if (parsed.shape[0] !== parsed.shape[1] || parsed.shape[0] * parsed.shape[1] !== tileCells) {
      throw new Error(`grid result must contain exactly ${tileCells} cells`);
    }
    return { row, col };
  }
  return { row, col, ...compactGridTile(parsed, tileCells) };
}
var GridCanvas = class {
  constructor(slots, cells) {
    this.slots = slots;
    this.cells = cells;
    this.rows = Array.from({ length: slots });
  }
  values;
  categories = /* @__PURE__ */ new Map();
  rows;
  /** Place one flattened tile. Single-threaded, so the lazy alloc is safe. */
  place(index2, tile) {
    this.rows[index2] = { row: tile.row, col: tile.col };
    if (tile.compactCategory !== void 0) {
      this.categories.set(index2, tile.compactCategory);
      return;
    }
    if (tile.values === void 0) return;
    this.values = numericCanvas(this.values, this.slots * this.cells, tile.values);
    this.values.set(tile.values, index2 * this.cells);
  }
  /**
   * The kept tiles, closed up, with their positions — the shape
   * `denseGridTiles` used to build from a compacted list.
   */
  finish() {
    const kept = [];
    let target = 0;
    for (let index2 = 0; index2 < this.slots; index2 += 1) {
      const at = this.rows[index2];
      if (at === void 0) continue;
      if (this.values !== void 0 && target !== index2) {
        this.values.copyWithin(target * this.cells, index2 * this.cells, (index2 + 1) * this.cells);
      }
      const compactCategory = this.categories.get(index2);
      kept.push({
        row: at.row,
        col: at.col,
        ...compactCategory === void 0 ? {} : { compactCategory }
      });
      target += 1;
    }
    const values = this.values?.subarray(0, target * this.cells);
    this.values = void 0;
    this.categories.clear();
    return { tiles: kept, values };
  }
};
function denseGridTiles(tiles, tileCells, canvas) {
  const where = positions(tiles);
  const compactCategories = [];
  let filled = canvas;
  let numericCount = 0;
  for (let index2 = 0; index2 < tiles.length; index2 += 1) {
    const tile = tiles[index2];
    if (tile === void 0) continue;
    if (tile.compactCategory !== void 0) {
      compactCategories.push({ index: index2, category: tile.compactCategory });
    } else if (tile.values !== void 0) {
      filled = numericCanvas(filled, tiles.length * tileCells, tile.values);
      filled.set(tile.values, index2 * tileCells);
      numericCount += 1;
    } else if (canvas !== void 0) {
      numericCount += 1;
    }
    tiles[index2] = void 0;
  }
  if (compactCategories.length > 0 && numericCount > 0) {
    throw new Error("area results mix numeric and categorical grids");
  }
  if (compactCategories.length > 0) {
    return {
      ...compactCategoricalDense(compactCategories, where.length / 2, tileCells),
      positions: where
    };
  }
  return {
    values: filled ?? new Float64Array(where.length / 2 * tileCells).fill(Number.NaN),
    positions: where
  };
}
function gridWireConfig(analysisType) {
  const config = getTilingConfig(analysisType);
  return {
    inference_size_m: config.inferenceSizeM,
    inference_size_cells: config.inferenceSizeCells,
    context_size_m: config.contextSizeM,
    step_m: config.stepM,
    step_cells: config.stepCells,
    cell_size_m: config.cellSizeM
  };
}

// src/area/compact-grid-result.ts
var DECODE_LIMITS = {
  maxTotalBytes: 268435456,
  maxMetadataBytes: 4194304,
  maxCells: 16777216,
  maxTriangleValues: 67108864
};
function numericValues(data) {
  if (data.byteOffset % 8 === 0 && data.buffer instanceof ArrayBuffer) {
    return new Float64Array(data.buffer, data.byteOffset, data.byteLength / 8);
  }
  const copy = new Uint8Array(data.length);
  copy.set(data);
  return new Float64Array(copy.buffer, 0, copy.byteLength / 8);
}
function categoricalCodes(ordinals) {
  const codes = Uint32Array.from(ordinals);
  const validity = new Uint8Array(Math.ceil(ordinals.length / 8));
  for (let cell = 0; cell < ordinals.length; cell += 1) {
    if (ordinals[cell] !== 255) validity[cell >> 3] = validity[cell >> 3] | 1 << (cell & 7);
  }
  return { codes, validity };
}
function fromJsonDecode(decoded) {
  const shape = decoded.shape, data = decoded.data;
  const rows = shape[0], cols = shape[1];
  if (decoded.kind === "categorical") {
    const { codes, validity: validity2 } = categoricalCodes(data);
    return {
      route: "compact-grid",
      kind: "categorical",
      shape: [rows, cols],
      values: codes,
      validity: validity2,
      dictionary: decoded.legend ?? []
    };
  }
  const values = numericValues(data);
  const validity = new Uint8Array(Math.ceil(rows * cols / 8)).fill(255);
  const ambiguousEmpty = values.every((value) => !Number.isFinite(value));
  return {
    route: "compact-grid",
    kind: "numeric",
    shape: [rows, cols],
    values,
    validity,
    ...ambiguousEmpty ? { ambiguousEmpty } : {}
  };
}
function areaGridResult(content) {
  const decoded = requireCore().decodeResultArchive(content);
  if (decoded.route === "irbf") {
    const compact = decodeCompactGridDocument(decoded.document, DECODE_LIMITS);
    if (compact === void 0) throw new TypeError("area grid result has a non-grid IRBF family");
    return compact;
  }
  return fromJsonDecode(decoded);
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
  const named2 = missing.map((tile) => `${tile.tileId} (${tile.phase ?? "unknown"}: ${tile.error})`);
  const cause = missing.find((tile) => tile.exception !== void 0)?.exception;
  const uncertainNote = unreachable.length === 0 ? "" : ` ${unreachable.length} of them (${unreachable.map((tile) => tile.tileId).join(", ")}) had an UNKNOWN submission outcome: neither recovery reaches those, because the server may or may not hold a job for them. Resubmitting one can pay for it twice, so this SDK will not do it for you \u2014 check the account's jobs, or call runArea for just those tiles knowing the cost.`;
  const failedNote = failedAfterUncertain.length === 0 ? "" : ` ${failedAfterUncertain.length} of them (${failedAfterUncertain.map((tile) => tile.tileId).join(", ")}) had an uncertain submission that turned out to be ACCEPTED: the job ran and FAILED, so there is no result for mergeAreaJobs to fetch. This SDK will not resubmit it for you either, for the same reason \u2014 check the job's own error, or call runArea for just that tile knowing the cost.`;
  return new Error(
    `Area run is incomplete: ${missing.length} of ${schedule2.jobs.size} tiles did not contribute to the grid. Call mergeAreaJobs again with this schedule to fetch a result that is already computed, or runArea with retryFrom to resubmit a tile that was never accepted.${uncertainNote}${failedNote} Missing: ${named2.join("; ")}`,
    cause === void 0 ? {} : { cause }
  );
}

// src/area/merge-common.ts
var DEFAULT_MERGE_WORKERS = 8;
function workerCount2(value) {
  const count2 = value ?? DEFAULT_MERGE_WORKERS;
  if (!Number.isSafeInteger(count2) || count2 < 1) {
    throw new TypeError("maxWorkers must be a positive integer");
  }
  return count2;
}
async function parallel(values, maximum, task) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(maximum, Math.max(1, values.length)) }, async () => {
    while (cursor < values.length) {
      const value = values[cursor++];
      if (value !== void 0) await task(value);
    }
  }));
}
function throwable(error) {
  return error instanceof Error ? error : new Error(String(error));
}

// src/results/surface-analysis.ts
var ZERO_ANCHOR = [0, 0];
function cellTriangles(entry) {
  if (!entry.hasCellTris) return void 0;
  if (entry.triangleOffsets.length !== entry.triangleMask.length + 1 || entry.triangleOffsets[0] !== 0 || entry.triangleOffsets.at(-1) !== entry.triangleValues.length) {
    throw new Error(`surface merge returned invalid triangle offsets for ${entry.key}`);
  }
  const cells = [];
  const [anchorX, anchorY] = entry.triangleAnchor ?? ZERO_ANCHOR;
  for (let index2 = 0; index2 < entry.triangleMask.length; index2 += 1) {
    const start = entry.triangleOffsets[index2];
    const end = entry.triangleOffsets[index2 + 1];
    if (start > end || end > entry.triangleValues.length || (end - start) % 9 !== 0) {
      throw new Error(`surface merge returned invalid triangles for ${entry.key}`);
    }
    if (entry.triangleMask[index2] === 0) {
      cells.push(null);
      continue;
    }
    const coordinates = new Array(end - start);
    if (anchorX === 0 && anchorY === 0) {
      for (let at = start; at < end; at += 1) coordinates[at - start] = entry.triangleValues[at];
    } else {
      for (let at = start; at < end; at += 1) {
        const axis = (at - start) % 3;
        coordinates[at - start] = entry.triangleValues[at] + (axis === 0 ? anchorX : axis === 1 ? anchorY : 0);
      }
    }
    cells.push(coordinates);
  }
  return cells;
}
function mergeViewFromColumns(columns) {
  const { ids, idOffsets, values, valueOffsets, hasCellTris } = columns;
  const noValues = new Float64Array(0), noOffsets = new Uint32Array(0), noMask = new Uint8Array(0);
  const entries3 = [];
  for (let index2 = 0; index2 + 1 < valueOffsets.length; index2 += 1) {
    const start = valueOffsets[index2], end = valueOffsets[index2 + 1];
    const key = ids.slice(idOffsets[index2], idOffsets[index2 + 1]);
    if (hasCellTris[index2] !== 1) {
      entries3.push({
        key,
        values: values.slice(start, end),
        triangleValues: noValues,
        triangleOffsets: noOffsets,
        triangleMask: noMask,
        hasCellTris: false
      });
      continue;
    }
    const base = columns.triangleOffsets[start];
    const triangleOffsets = new Uint32Array(end - start + 1);
    for (let at = start; at <= end; at += 1) {
      triangleOffsets[at - start] = columns.triangleOffsets[at] - base;
    }
    entries3.push({
      key,
      values: values.slice(start, end),
      triangleValues: columns.triangleValues.slice(base, columns.triangleOffsets[end]),
      triangleOffsets,
      triangleMask: columns.triangleMask.slice(start, end),
      hasCellTris: true
    });
  }
  return { metadataJson: columns.metadataJson, entries: entries3 };
}
function record3(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value;
}
function number(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  return value;
}
function vector2(value, name) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "number")) {
    throw new TypeError(`${name} must be a number array`);
  }
  return value;
}
function surfaceAnalysisFromMergeView(view, hostFields) {
  const raw = record3(
    JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(view.metadataJson)),
    "surface merge metadata"
  );
  const rawSurfaces = record3(raw.surfaces, "surface merge surfaces");
  const entryMap = new Map(view.entries.map((entry) => [entry.key, entry]));
  const surfaces2 = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of Object.entries(rawSurfaces)) {
    const kernelFields = record3(value, `surface ${key}`);
    const host = hostFields?.get(key);
    if (hostFields !== void 0 && host === void 0) throw new Error(`surface merge returned unknown surface ${key}`);
    const fields = host === void 0 ? kernelFields : { ...host, ...kernelFields };
    const entry = entryMap.get(key);
    if (entry === void 0) throw new Error(`surface merge omitted values for ${key}`);
    const cellArea = fields["cell-area"];
    const cellTris = cellTriangles(entry);
    surfaces2[key] = {
      ...fields,
      origin: vector2(fields.origin, `surface ${key} origin`),
      uAxis: vector2(fields["u-axis"], `surface ${key} u-axis`),
      vAxis: vector2(fields["v-axis"], `surface ${key} v-axis`),
      gridSize: number(fields["grid-size"], `surface ${key} grid-size`),
      nu: number(fields.nu, `surface ${key} nu`),
      nv: number(fields.nv, `surface ${key} nv`),
      values: entry.values,
      area: number(fields.area, `surface ${key} area`),
      mean: number(fields.mean, `surface ${key} mean`),
      peak: number(fields.peak, `surface ${key} peak`),
      ...Array.isArray(cellArea) ? { cellArea } : {},
      ...cellTris === void 0 ? {} : { cellTris }
    };
    entryMap.delete(key);
  }
  if (entryMap.size !== 0) throw new Error("surface merge returned unknown value buffers");
  return {
    surfaces: surfaces2,
    aggregates: record3(raw.aggregates, "surface merge aggregates"),
    minLegend: number(raw["min-legend"], "surface merge min-legend"),
    maxLegend: number(raw["max-legend"], "surface merge max-legend"),
    sensorCount: number(raw["sensor-count"], "surface merge sensor-count")
  };
}
function hasCellGeometry(surface) {
  return surface.cellTris !== void 0;
}
function isVertical(surface) {
  const normalZ = surface.uAxis[0] * surface.vAxis[1] - surface.uAxis[1] * surface.vAxis[0];
  return Math.abs(normalZ) <= 0.5;
}
function surfaceTriangles(surface) {
  if (surface.cellTris === void 0) {
    throw new Error("cell-tris was not emitted for this surface");
  }
  return iterTriangles(surface.cellTris, surface.values);
}
function* iterTriangles(cells, values) {
  for (let cell = 0; cell < cells.length; cell += 1) {
    const coordinates = cells[cell];
    if (coordinates === null || coordinates === void 0) continue;
    const rawValue = values[cell];
    const value = rawValue === void 0 || Number.isNaN(rawValue) ? null : rawValue;
    for (let at = 0; at + 8 < coordinates.length; at += 9) {
      yield {
        value,
        vertices: [
          [coordinates[at], coordinates[at + 1], coordinates[at + 2]],
          [coordinates[at + 3], coordinates[at + 4], coordinates[at + 5]],
          [coordinates[at + 6], coordinates[at + 7], coordinates[at + 8]]
        ]
      };
    }
  }
}

// src/area/merge-surface-decode.ts
var ARRAY = 2;
function nullableCells(cells, start, end) {
  const out = new Array(end - start);
  for (let at = start; at < end; at += 1) {
    const value = cells[at];
    out[at - start] = Number.isNaN(value) ? null : value;
  }
  return out;
}
function decodeSurfaceJob(content) {
  const limits = RESULT_DECODE_LIMITS;
  const archive = requireCore().decodeSurfaceArchive(
    content,
    BigInt(limits.maxTotalBytes),
    limits.maxMetadataBytes,
    BigInt(limits.maxCells),
    BigInt(limits.maxTriangleValues)
  );
  if (archive.route !== "surface") {
    archive.free();
    return void 0;
  }
  try {
    const root = JSON.parse(archive.takeRootJson());
    const pairs = JSON.parse(archive.takeFieldsJson());
    const cellArea = archive.takeCellArea();
    const offsets = archive.valueOffsets;
    const areaState = archive.cellAreaState;
    const keys = [];
    const fields = [];
    pairs.forEach(([key, value], index2) => {
      if (areaState[index2] === ARRAY) {
        value["cell-area"] = nullableCells(cellArea, offsets[index2], offsets[index2 + 1]);
      }
      keys.push(key);
      fields.push(value);
    });
    return { archive, root, keys, fields, cellTrisState: archive.cellTrisState };
  } catch (error) {
    archive.free();
    throw error;
  }
}
function synthesisView(job) {
  const surfaces2 = /* @__PURE__ */ Object.create(null);
  job.keys.forEach((key, index2) => {
    const fields = job.fields[index2];
    Object.defineProperty(surfaces2, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: job.cellTrisState[index2] === ARRAY ? { ...fields, "cell-tris": true } : fields
    });
  });
  return { ...job.root, surfaces: surfaces2 };
}

// src/area/merge-surface.ts
async function mergeSurfaceAreaJobs(jobsService, schedule2, options = {}) {
  if (schedule2.surfaceFields !== true) throw new Error("Surface merge requires a surface schedule");
  if (schedule2.geometryProbeUncertain === true) {
    throw new Error("Area run contains an uncertain geometry capability probe");
  }
  if ((schedule2.invalidReferenceSubmissions?.length ?? 0) > 0 || [...schedule2.jobs.values()].some((job) => job.invalidReference === true)) {
    throw new Error("Area run contains an invalid geometry-reference acceptance");
  }
  revivePolledOut(schedule2);
  await checkAreaState(jobsService, schedule2, {
    ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  const recovered = (tileId) => {
    const job = schedule2.jobs.get(tileId);
    return job?.status === "completed" && Boolean(job.jobId);
  };
  const missing = [
    ...schedule2.failedSubmissions,
    ...(schedule2.uncertainSubmissions ?? []).filter((tileId) => !recovered(tileId))
  ];
  if (missing.length > 0) {
    throw new Error(`Cannot merge surface results with missing submissions: ${JSON.stringify(missing.sort())}`);
  }
  if (schedule2.jobs.size === 0) {
    return { surfaces: {}, aggregates: {}, minLegend: 0, maxLegend: 0, sensorCount: 0 };
  }
  const incomplete2 = [...schedule2.jobs.values()].filter((job) => job.status !== "completed" || !job.jobId);
  if (incomplete2.length > 0) {
    throw new Error(`Cannot merge surface results: jobs not succeeded: ${JSON.stringify(incomplete2.map((job) => job.jobId ?? job.tileId))}`);
  }
  const scheduled = [...schedule2.jobs.entries()];
  const decoded = Array(scheduled.length);
  const errors = Array(scheduled.length);
  try {
    await parallel(
      scheduled.map((entry, index2) => ({ entry, index: index2 })),
      workerCount2(options.maxWorkers),
      async ({ entry: [entryId, job], index: index2 }) => {
        try {
          const result = await jobsService.downloadResults(job.jobId, {
            ...job.lastJobSnapshot === void 0 ? {} : { job: job.lastJobSnapshot },
            ...options.signal === void 0 ? {} : { signal: options.signal }
          });
          const value = decodeSurfaceJob(result.content);
          if (value === void 0) {
            throw new Error(`surface entry ${entryId} returned a non-surface result`);
          }
          decoded[index2] = value;
        } catch (error) {
          errors[index2] = throwable(error);
        }
      }
    );
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException("aborted", "AbortError");
    }
    const failedAt = errors.findIndex((error) => error !== void 0);
    if (failedAt !== -1) {
      throw new Error(`Cannot merge surface results: download failed for ${scheduled[failedAt][0]}`, {
        cause: errors[failedAt]
      });
    }
    return unionDecoded(jobsService, schedule2, scheduled, decoded, options);
  } finally {
    for (const value of decoded) value?.archive.free();
  }
}
function unionDecoded(jobsService, schedule2, scheduled, decoded, options) {
  const positions2 = new Map(schedule2.tilePositions.map((position) => [position.tileId, position]));
  const core2 = requireCore();
  const merger = new core2.SurfaceAreaMerger();
  const synthesized = /* @__PURE__ */ new Map();
  const hostFields = /* @__PURE__ */ new Map();
  const store = jobsService.facadeSynthesis;
  const fallbacks = /* @__PURE__ */ new Set();
  let consumed = false;
  try {
    const anchors = scheduled.map(([entryId]) => {
      const position = positions2.get(entryId);
      if (position === void 0) throw new Error(`surface entry ${entryId} has no tile position`);
      const [swX, swY] = core2.tileSwOffset(position.row, position.col, schedule2.analysisType);
      return [swX, swY];
    });
    if (store !== void 0) {
      const jobs = scheduled.flatMap(([, job], index2) => job.jobId === void 0 ? [] : [{
        jobId: job.jobId,
        response: synthesisView(decoded[index2]),
        anchor: anchors[index2]
      }]);
      const views = synthesizeSurfaceTriangles(store, jobs, options.logger ?? consoleLogger, fallbacks);
      for (const [key, view2] of views) synthesized.set(key, view2);
    }
    scheduled.forEach(([entryId], index2) => {
      const value = decoded[index2];
      value.keys.forEach((key, at) => hostFields.set(key, value.fields[at]));
      const [swX, swY] = anchors[index2];
      decoded[index2] = void 0;
      merger.pushArchive(entryId, JSON.stringify(value.root), value.archive, swX, swY);
    });
    consumed = true;
    const view = mergeViewFromColumns(merger.finish());
    if (synthesized.size === 0) return withCellTrisFallback(surfaceAnalysisFromMergeView(view, hostFields), fallbacks);
    return withCellTrisFallback(surfaceAnalysisFromMergeView({
      metadataJson: view.metadataJson,
      entries: view.entries.map((entry) => {
        const views = synthesized.get(entry.key);
        return views === void 0 ? entry : { ...entry, ...views };
      })
    }, hostFields), fallbacks);
  } finally {
    if (!consumed) merger.free();
    if (store !== void 0) {
      for (const entry of schedule2.jobs.values()) {
        if (entry.jobId !== void 0) store.forget(entry.jobId);
      }
    }
  }
}

// src/area/merge.ts
function failure(tileId, row, col, error, phase, exception) {
  return { tileId, row, col, error, phase, ...exception === void 0 ? {} : { exception } };
}
async function mergeAreaJobs(jobsService, schedule2, options = {}) {
  const started = performance.now();
  if (schedule2.surfaceFields === true) {
    throw new Error("Grid merge does not apply to a surface schedule; call mergeSurfaceAreaJobs");
  }
  if (schedule2.geometryProbeUncertain === true) {
    throw new Error("Area run contains an uncertain geometry capability probe");
  }
  if ((schedule2.invalidReferenceSubmissions?.length ?? 0) > 0 || [...schedule2.jobs.values()].some((job) => job.invalidReference === true)) {
    throw new Error("Area run contains an invalid geometry-reference acceptance");
  }
  const strategy = options.strategy ?? "default";
  if (strategy !== "default" && schedule2.analysisType !== "wind-speed") {
    throw new Error(`strategy=${JSON.stringify(strategy)} is only valid for wind-speed analyses`);
  }
  if (strategy !== "default" && options.windDirectionDeg === void 0) {
    throw new Error("windDirectionDeg is required");
  }
  const revived = revivePolledOut(schedule2);
  await checkAreaState(jobsService, schedule2, {
    ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  if (revived > 0) {
    (options.logger ?? consoleLogger).info({
      event: "area_polled_out_revived",
      count: revived
    });
  }
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
      TileFailurePhase.Submit
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
      TileFailurePhase.Skipped
    ));
  }
  const complete = [...schedule2.jobs.values()].filter((job) => {
    if (job.status === "completed" && job.jobId) return true;
    if (job.status === "failed") {
      const item = failure(job.tileId, job.row, job.col, job.error ?? "job failed", TileFailurePhase.Compute);
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
    return false;
  });
  const config = gridWireConfig(schedule2.analysisType);
  const tileCells = config.inference_size_cells ** 2;
  const canvas = new GridCanvas(complete.length, tileCells);
  const downloadErrors = Array(complete.length);
  await parallel(complete.map((job, index2) => ({ job, index: index2 })), workerCount2(options.maxWorkers), async ({ job, index: index2 }) => {
    let parsed;
    try {
      const result = await jobsService.downloadResults(job.jobId, {
        ...job.lastJobSnapshot === void 0 ? {} : { job: job.lastJobSnapshot },
        ...options.signal === void 0 ? {} : { signal: options.signal }
      });
      parsed = areaGridResult(result.content);
    } catch (error) {
      downloadErrors[index2] = throwable(error);
      return;
    }
    canvas.place(index2, flattenGridTile(job.row, job.col, parsed, tileCells));
  });
  if (options.signal?.aborted) {
    throw options.signal.reason ?? new DOMException("aborted", "AbortError");
  }
  const logger = options.logger ?? consoleLogger;
  downloadErrors.forEach((exception, index2) => {
    if (exception === void 0) return;
    const job = complete[index2];
    skippedJobs.push(job.tileId);
    logger.warn({
      event: "area_tile_download_failed",
      tileId: job.tileId,
      row: job.row,
      col: job.col,
      jobId: job.jobId,
      error: exception.message
    });
    addFailure(failure(
      job.tileId,
      job.row,
      job.col,
      `download failed: ${exception.message}`,
      TileFailurePhase.Download,
      exception
    ));
  });
  if (failedTiles.length > 0) throw incomplete(schedule2, failedTiles);
  const { tiles: usable, values: filled } = canvas.finish();
  if (usable.length === 0) {
    return {
      mergedGrid: new Float64Array(0),
      gridShape: [0, 0],
      failedJobs,
      skippedJobs,
      failedTiles,
      executionTime: (performance.now() - started) / 1e3
    };
  }
  const dense = denseGridTiles(usable, tileCells, filled);
  const core2 = requireCore();
  const compactCore = core2;
  const configJson = JSON.stringify(config), polygonJson = JSON.stringify(schedule2.polygon);
  const merged = dense.values instanceof Float32Array && strategy === "default" ? compactCore.mergeAreaGridCompact(
    dense.values,
    dense.positions,
    schedule2.gridShape[0],
    schedule2.gridShape[1],
    configJson,
    polygonJson
  ) : dense.values instanceof Float32Array ? compactCore.mergeAreaGridCompactWind(
    dense.values,
    dense.positions,
    schedule2.gridShape[0],
    schedule2.gridShape[1],
    configJson,
    polygonJson,
    strategy,
    options.windDirectionDeg,
    options.block
  ) : core2.mergeAreaGridDenseF64(
    dense.values,
    dense.positions,
    schedule2.gridShape[0],
    schedule2.gridShape[1],
    configJson,
    polygonJson,
    strategy,
    options.windDirectionDeg,
    options.block
  );
  try {
    const shape = merged.shape;
    if (shape.length !== 2) throw new Error("area merge returned an invalid grid shape");
    const bounds = merged.bounds;
    return {
      mergedGrid: merged.values,
      gridShape: [shape[0], shape[1]],
      ...dense.legend === void 0 ? {} : { legend: dense.legend },
      failedJobs,
      skippedJobs,
      failedTiles,
      executionTime: (performance.now() - started) / 1e3,
      ...bounds === void 0 ? {} : {
        bounds: [bounds[0], bounds[1], bounds[2], bounds[3]]
      }
    };
  } finally {
    merged.free();
  }
}

// src/results/surface.ts
function parseSurfaceResult(document2, options = {}) {
  const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document2));
  return parseSurfaceRecord(raw, options);
}

// src/area/poll-schedule.ts
var POLL_BACKOFF_BASE_S = 15;
var POLL_BACKOFF_CAP_S = 75;
var POLL_BATCHED_INTERVAL_S = 2;
var POLL_BATCHED_FAST_INTERVAL_S = 1;
var POLL_BATCHED_FAST_WINDOW_S = 10;
var POLL_BATCHED_FAST_MAX_JOBS = 50;
var POLL_JITTER_MIN = 0.8;
function areaPollDelayS(attempt, batched, elapsedS, openJobs2) {
  const fast = elapsedS < POLL_BATCHED_FAST_WINDOW_S && openJobs2 <= POLL_BATCHED_FAST_MAX_JOBS;
  const batchedWindow = fast ? POLL_BATCHED_FAST_INTERVAL_S : POLL_BATCHED_INTERVAL_S;
  const window = batched ? batchedWindow : Math.min(POLL_BACKOFF_CAP_S, POLL_BACKOFF_BASE_S * 2 ** attempt);
  return window * (POLL_JITTER_MIN + (1 - POLL_JITTER_MIN) * Math.random());
}
function openJobs(state) {
  return state.pendingCount + state.runningCount;
}

// src/client.ts
var AreaTimeoutError = class extends Error {
  areaState;
  constructor(message, areaState) {
    super(message);
    this.name = "AreaTimeoutError";
    this.areaState = areaState;
  }
};
var DEFAULT_BASE_URL = "https://api.infrared.city/v2";
var DEFAULT_AREA_TIMEOUT_S = 3600;
function abortableSleep(milliseconds, signal) {
  if (signal?.aborted) return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
  return new Promise((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(finish, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("aborted", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}
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
var AnalysisService = class {
  constructor(jobs) {
    this.jobs = jobs;
  }
  /** Submit an already wire-keyed request. */
  execute(payload, options = {}) {
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      return Promise.reject(new TypeError("analysis payload must be an object"));
    }
    const analysisType = payload["analysis-type"];
    if (typeof analysisType !== "string" || analysisType.length === 0) {
      return Promise.reject(new TypeError("analysis payload requires analysis-type"));
    }
    return this.jobs.submit(analysisType, payload, options);
  }
};
var InfraredClient = class {
  baseUrl;
  apiKey;
  logger;
  jobs;
  analyses;
  weather;
  buildings;
  vegetation;
  groundMaterials;
  billing;
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
    const downloadTimeoutMs = options.downloadTimeoutMs ?? options.downloadTimeout;
    const geometryReuseEnabled = geometryReuseSetting(options.env);
    const jobsOptions = {
      baseUrl: this.baseUrl,
      auth,
      ...options.fetch === void 0 ? {} : { fetch: options.fetch },
      ...timeoutMs === void 0 ? {} : { timeoutMs },
      ...downloadTimeoutMs === void 0 ? {} : { downloadTimeoutMs },
      ...options.gatewayBaseUrl === void 0 ? {} : { gatewayBaseUrl: options.gatewayBaseUrl },
      ...options.bigPayloadThresholdBytes === void 0 ? {} : {
        bigPayloadThresholdBytes: options.bigPayloadThresholdBytes
      },
      geometryReuseEnabled,
      logger: this.logger,
      ...options.onGeometryReuseProbe === void 0 ? {} : {
        onGeometryReuseProbe: options.onGeometryReuseProbe
      }
    };
    this.jobs = new JobsService(jobsOptions);
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
  run(input, options = {}) {
    const payload = prepareAnalysisPayload(input);
    return this.analyses.execute(payload, options);
  }
  async runAndWait(input, options = {}) {
    const job = await this.run(input, options);
    const completed = await this.jobs.waitForCompletion(job.jobId, options);
    const download = await this.jobs.downloadResults(completed.jobId, {
      job: completed,
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
    return decompressResultValue(this.jobs, download.content);
  }
  runArea(input, polygon, options = {}) {
    return runArea(this.jobs, input, polygon, options);
  }
  checkAreaState(schedule2, options = {}) {
    return checkAreaState(this.jobs, schedule2, options);
  }
  mergeAreaJobs(schedule2, options = {}) {
    return mergeAreaJobs(this.jobs, schedule2, { logger: this.logger, ...options });
  }
  mergeSurfaceAreaJobs(schedule2, options = {}) {
    return mergeSurfaceAreaJobs(this.jobs, schedule2, { logger: this.logger, ...options });
  }
  async runAreaAndWait(input, polygon, options = {}) {
    const areaTimeout = options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S;
    if (typeof areaTimeout !== "number" || !Number.isFinite(areaTimeout) || areaTimeout <= 0) {
      throw new TypeError("areaTimeout must be a positive finite number");
    }
    const schedule2 = await this.runArea(input, polygon, options);
    const started = performance.now();
    const deadline = started + areaTimeout * 1e3;
    let attempt = 0;
    while (true) {
      const state = await this.checkAreaState(schedule2, {
        ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
        ...options.signal === void 0 ? {} : { signal: options.signal },
        ...options.onProgress === void 0 ? {} : { onProgress: options.onProgress }
      });
      if (state.isComplete) break;
      const remainingS = (deadline - performance.now()) / 1e3;
      if (remainingS <= 0) {
        throw new AreaTimeoutError(
          `Area analysis timed out after ${areaTimeout}s: ${state.completedCount}/${state.totalCount} completed, ${state.failedCount} failed, ${state.runningCount} running`,
          state
        );
      }
      const elapsedS = (performance.now() - started) / 1e3;
      const delayS = Math.min(
        remainingS,
        areaPollDelayS(
          attempt,
          this.jobs.batchedStatusSupported,
          elapsedS,
          // A sweep that also asked per job is not a one-request sweep.
          openJobs(state) + (lastPerJobRequests(schedule2) > 0 ? POLL_BATCHED_FAST_MAX_JOBS : 0)
        )
      );
      await abortableSleep(delayS * 1e3, options.signal);
      attempt += 1;
    }
    if (schedule2.surfaceFields === true) {
      return this.mergeSurfaceAreaJobs(schedule2, {
        ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
        ...options.signal === void 0 ? {} : { signal: options.signal }
      });
    }
    return this.mergeAreaJobs(schedule2, {
      ...options.strategy === void 0 ? {} : { strategy: options.strategy },
      ...options.windDirectionDeg === void 0 ? {} : { windDirectionDeg: options.windDirectionDeg },
      ...options.block === void 0 ? {} : { block: options.block },
      ...options.maxWorkers === void 0 ? {} : { maxWorkers: options.maxWorkers },
      ...options.signal === void 0 ? {} : { signal: options.signal }
    });
  }
  generateTiles(polygon, options = {}) {
    return generateTilesForPolygon(polygon, options);
  }
  previewArea(polygon, options = {}) {
    const tiles = this.generateTiles(polygon, options);
    const tileCount = tiles.flat().filter((tile) => !tile.empty).length;
    return {
      tileCount,
      estimatedTimeS: tileCount * ESTIMATED_SECONDS_PER_TILE,
      estimatedCostTokens: tileCount * DEFAULT_TOKENS_PER_JOB
    };
  }
  /** Facade-aware preview (WP-6): the same offline plan `runArea` builds,
   * read for its job count instead of submitted. Pass the SAME `input` a
   * `runArea` call would -- `previewArea` alone under-reports a facade
   * (`analysisSurfaces`) request's real job count. See `area/preview.ts`. */
  previewAreaBatches(input, polygon, options = {}) {
    return previewAreaBatches(this.jobs, input, polygon, options);
  }
  async previewAreaWithPricing(polygon, options) {
    const preview = this.previewArea(polygon, options);
    try {
      const pricing = await this.billing.getPublicPricing();
      const tokensPerJob = resolveTokensPerJob(pricing, options.analysisType);
      return {
        ...preview,
        estimatedCostTokens: preview.tileCount * tokensPerJob,
        tokensPerJob,
        pricingSource: "remote",
        ...pricing.version === void 0 ? {} : { pricingVersion: String(pricing.version) }
      };
    } catch (error) {
      this.logger.warn({
        event: "pricing_fetch_failed",
        message: `Failed to fetch gateway pricing; using ${DEFAULT_TOKENS_PER_JOB} tokens per job`,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        ...preview,
        tokensPerJob: DEFAULT_TOKENS_PER_JOB,
        pricingSource: "fallback"
      };
    }
  }
  /** Explicit legacy adapter. `jobs.decompress` remains route-aware. */
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
function initializeCore2(options = {}) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalysesName,
  AnalysisService,
  AreaGeometryProbeError,
  AreaGeometryReferenceError,
  AreaTimeoutError,
  BillingService,
  BuildingsService,
  CATALOG_TTL_MS,
  CELL_SIZE_M,
  ConfigHashPolicyError,
  CoreInitializationError,
  CoreNotReadyError,
  CoreTerminalError,
  CoreVersionSkewError,
  DEFAULT_MAX_LONG_AXIS_PX,
  DEFAULT_STATIC_BASE_URL,
  DEFAULT_TOKENS_PER_JOB,
  ESTIMATED_SECONDS_PER_TILE,
  EpwParseError,
  FacadeArtifactMismatchError,
  GeodataDependencyError,
  GeodataError,
  GeodataFetchError,
  GeodataRangeError,
  GeometryReferenceAcknowledgementError,
  GeometryReferenceSubmissionError,
  GridImageError,
  GroundMaterialsService,
  HostNotAllowedError,
  InfraredClient,
  InvalidOptionError,
  JobAbortedError,
  JobFailedError,
  JobNotCompletedError,
  JobStatus,
  JobTimeoutError,
  JobsService,
  LocalCleaner,
  MAX_REGISTRY_BYTES,
  MAX_STATIC_BYTES,
  OvertureFileLimitError,
  OvertureReadTooLargeError,
  PER_JOB_MODEL_KEYS,
  PHYSICS_TIERS,
  REGISTRY_URL,
  ReadMarginError,
  RegistryFetchError,
  SCHEDULE_CONTRACT_VERSION,
  SiteReadError,
  StaticWeatherReader,
  SubmissionUncertainError,
  THERMAL_CONTROLS,
  TILE_SIZE_CELLS,
  TILE_SIZE_M,
  TILING_SUPPORTED_TYPES,
  TileFailurePhase,
  VERSION,
  VegetationMeshError,
  VegetationService,
  WEATHER_BEARING_ANALYSES,
  WIDEST_READ_ANALYSIS_TYPE,
  WIND_ANALYSIS_TYPES,
  WeatherDocument,
  WeatherIdentityError,
  WeatherModelInputsError,
  WeatherService,
  WeatherServiceError,
  areaScheduleFromJSON,
  areaScheduleToJSON,
  buildAuthResolver,
  checkAreaState,
  cleanV3Local,
  clearRegistryCache,
  clearWeatherCatalogCache,
  composeTilePayloads,
  computeAreaState,
  consoleLogger,
  convertPointsToMeshesLocal,
  coreVersion,
  decompressResultArchive,
  decompressResultValue,
  deserializeToCamelCase,
  estimateWorkflowRunTokens,
  fetchVisualConfigurations,
  flattenVisualConfigs,
  freePreparedSites,
  freezeAreaSchedule,
  generateTilesForPolygon,
  getTilingConfig,
  gridImageSize,
  groundReadDistanceM,
  hasCellGeometry,
  initializeCore,
  isVertical,
  jobFromResponse,
  mergeAreaJobs,
  mergeSurfaceAreaJobs,
  normalizeGrid,
  packMesh,
  parseEpw,
  parseJobStatus,
  parseResultArchive,
  parseSurfaceResult,
  prepareAnalysisPayload,
  prepareAreaPayload,
  preparedWeatherIdentity,
  previewAreaBatches,
  readMarginM,
  renderGridPng,
  requiredMarginM,
  resolveBracketName,
  resolveReadAnalysisType,
  resolveTokensPerJob,
  resolveVisualConfig,
  runArea,
  serializeToKebab,
  setOwnKey,
  silentLogger,
  submitAreaPlan,
  surfaceTriangles,
  toCamelCase,
  toKebabCase,
  validatePolygon,
  vegetationRegistryDocument,
  windClassOrdinals
});
