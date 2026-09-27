import { requireCore } from "./internal/core.js";
export { initializeCore } from "./internal/initialize.js";
export { CoreInitializationError, CoreNotReadyError, CoreTerminalError, } from "./internal/errors.js";
export { VERSION } from "./version.js";
export { consoleLogger, silentLogger } from "./logger.js";
export { AnalysesName, TILING_SUPPORTED_TYPES, WIND_ANALYSIS_TYPES } from "./analysis-types.js";
export { BillingService, DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE, estimateWorkflowRunTokens, PER_JOB_MODEL_KEYS, resolveBracketName, resolveTokensPerJob, } from "./billing.js";
export { BuildingsService } from "./buildings.js";
// D51 tells callers to expect this by type, so it has to be nameable. It is
// on `/tiling` as well, beside the `runArea` that throws it.
export { ConfigHashPolicyError } from "./area/planning.js";
// The typed geodata failures. MIGRATION and D48-TS both tell a caller to catch
// these from `getArea` / `getBuildingsInArea`, and until now they were only on
// the ESM-ONLY `/geodata` subpath — so the root import a caller already has
// could not name them, and a CommonJS caller could not reach them at all and
// had to match on `error.name`. The classes are declared once, in
// `geodata/errors.ts`; this is the same class object under a second name.
export { GeodataDependencyError, GeodataError, GeodataFetchError, GeodataRangeError, HostNotAllowedError, OvertureFileLimitError, OvertureReadTooLargeError, SiteReadError, } from "./geodata/errors.js";
// The read-margin rule and its refusal (D54). `runArea` throws
// `ReadMarginError` when an acquired layer was read with a narrower margin
// than the run's analysis needs, so a caller has to be able to name it; the
// two derivations are exported so a caller can size their own read.
export { ReadMarginError, WIDEST_READ_ANALYSIS_TYPE, groundReadDistanceM, readMarginM, requiredMarginM, resolveReadAnalysisType, } from "./geodata/read-margin.js";
export { VegetationService } from "./vegetation.js";
export { convertPointsToMeshesLocal, CoreVersionSkewError, VegetationMeshError, vegetationRegistryDocument, } from "./vegetation-mesh.js";
export { GroundMaterialsService } from "./ground-materials-service.js";
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherService, WeatherServiceError, } from "./weather.js";
// Bring-your-own weather: a local EPW file, validated in the bundled core.
// No registration, no upload, no private weather database.
export { EpwParseError, parseEpw, WEATHER_BEARING_ANALYSES, WeatherDocument, WeatherModelInputsError, } from "./weather-epw.js";
// Read-only: the weather identity of a payload, without submitting it.
export { preparedWeatherIdentity } from "./area/weather-guard.js";
export { decompressResultValue } from "./compat.js";
export { deserializeToCamelCase, serializeToKebab, setOwnKey, toCamelCase, toKebabCase, } from "./serialization.js";
export { packMesh } from "./mesh.js";
export { clearRegistryCache, DEFAULT_MAX_LONG_AXIS_PX, fetchVisualConfigurations, flattenVisualConfigs, gridImageSize, GridImageError, MAX_REGISTRY_BYTES, normalizeGrid, REGISTRY_URL, RegistryFetchError, renderGridPng, resolveVisualConfig, windClassOrdinals, } from "./images.js";
// `Local` names outlived their remote twins (the service paths are gone); kept
// because they are published API. Same for `convertPointsToMeshesLocal` above.
export { cleanV3Local, LocalCleaner } from "./ground-materials.js";
export * from "./area/index.js";
export * from "./results/index.js";
export { JobStatus, JobsService, jobFromResponse, parseJobStatus } from "./jobs.js";
export { JobAbortedError, JobFailedError, JobNotCompletedError, JobTimeoutError, } from "./jobs.js";
export { SubmissionUncertainError } from "./internal/submission.js";
export { FacadeArtifactMismatchError } from "./internal/facade-artifact-guard.js";
export { GeometryReferenceAcknowledgementError, GeometryReferenceSubmissionError, } from "./internal/geometry-reuse/errors.js";
export { AnalysisService, AreaTimeoutError, InfraredClient } from "./client.js";
export { InvalidOptionError } from "./internal/service.js";
export { buildAuthResolver } from "./internal/auth.js";
export function coreVersion() {
    return requireCore().coreVersion();
}
