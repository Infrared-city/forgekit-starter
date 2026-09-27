/**
 * Direct data acquisition: read the public data hosts in-process instead of
 * calling the utilities service.
 *
 * Rules this layer keeps:
 *
 * - only https URLs on the allow-list in `allowed-hosts.ts`, checked again
 *   for every URL a fetched manifest names;
 * - no credentials on public objects — these requests carry no API key;
 * - format I/O only in the host (`Range` reads, parquet decoding); every
 *   decision that shapes a result is a kernel call;
 * - caches are module state, so each realm (page, Worker, Node process)
 *   keeps its own and nothing is shared across a `postMessage` boundary.
 */
export { initializeCore } from "../internal/initialize.js";
export { CoreInitializationError, CoreNotReadyError, CoreTerminalError, } from "../internal/errors.js";
export { ALLOWED_HOSTS, assertAllowedUrl, GEO_BASE_URL, geoUrlFor, isAllowedUrl, } from "./allowed-hosts.js";
export { GeodataDependencyError, GeodataError, GeodataFetchError, GeodataRangeError, HostNotAllowedError, OvertureFileLimitError, OvertureReadTooLargeError, SiteReadError, } from "./errors.js";
export { bboxIntersects, DATA_USER_AGENT, DEFAULT_PUBLIC_TIMEOUT_MS, fetchPublicBytes, fetchPublicJson, fetchPublicText, MAX_HTTP_200_BYTES, MAX_JSON_BYTES, MAX_RANGE_BYTES, pointToBbox, } from "./http.js";
// The read-margin DERIVATIONS are here so a caller can size their own read;
// the refusal GATE is not. `checkReadMargin`, `LAYER_REQUIREMENT` and the
// `ReadMarginRecord` shape are how `runArea` refuses, not a call a caller
// makes — `runArea` performs the check itself — so they stay module-internal,
// as their Python twins do (FINAL-SANITY F8).
export { groundReadDistanceM, readMarginM, ReadMarginError, requiredMarginM, resolveReadAnalysisType, WIDEST_READ_ANALYSIS_TYPE, } from "./read-margin.js";
export { bytesRangeTransport, httpRangeTransport } from "./range-transport.js";
export { MAX_BACKOFF_MS, MAX_RANGE_ATTEMPTS, MIN_BACKOFF_MS, RangeRetry, } from "./retry.js";
export { featureCollectionJson, featuresArrayText, jsonArrayOf, jsonObjectOf, requireFeatureCollection, requireJsonArray, spliceJsonArrays, } from "./json-chain.js";
export { clearManifestCaches, fetchOvertureManifest, fetchSources, INDEXED_COLLECTIONS, resolveOverlayCity, selectOvertureFiles, SOURCES_TTL_MS, } from "./manifests.js";
export { clearFgbCache, readFgbBbox, readFgbBboxJson, readFgbBytes, } from "./fgb.js";
export { HEADER_PREFIX_BYTES, KERNEL_FGB_EXPORTS, MAX_PLANNED_RANGE_BYTES, MAX_PLANNED_TOTAL_BYTES, } from "./fgb-kernel.js";
export { COLUMNS_BY_COLLECTION, LAND_COVER_MIN_MAX_ZOOM, overtureReaderAvailable, planRowGroups, readOvertureCollection, readOvertureCollectionJson, requireOvertureReader, } from "./overture.js";
// The reader's internals — the membership predicate, the row-group planner,
// the byte budget and the concurrency constants — are NOT exported here. A
// published name is a name that cannot move, and no client needs them; the
// tests and the perf scripts reach them through their own modules.
export { clearOvertureMetadataCache } from "./overture-cache.js";
export { acquireTrees, acquireTreesJson, DEDUP_RADIUS_M, treesFeatureCollection, TREES_URL, } from "./trees.js";
export { acquireGroundMaterials, acquireGroundMaterialsJson, GROUND_COLLECTIONS, roadsToIrFeatures, ROADS_URL, } from "./ground.js";
export { acquireGroundMaterialsArea } from "./ground-area.js";
export { acquireBuildings, acquireBuildingsJson } from "./buildings.js";
export { acquireBuildingsArea } from "./buildings-area.js";
// The decomposition is PUBLIC on this host and `_internal` on the Python one,
// which is the pre-existing split: `/geodata` is this package's low-level
// acquisition surface and `siteChunks` has always been on it, so the pieces it
// now returns need the vocabulary to describe them. Every symbol of the module
// is exported, including `SLAB_TOLERANCE_FACTOR` — a partial export was the
// inconsistency, not the export (WP21 review m2). Recorded in MIGRATION.md.
// `decompose` now crosses into the kernel from `site-chunks.ts`; the other
// four moved to `rect-union-metrics.ts` when `rect-union.ts` was deleted
// (rect-union kernel port).
export { bboxAreaKm2, decompose, farEndErrorM, namePieces, SITE_CHUNK_EDGE_M, SITE_CHUNK_THRESHOLD_KM2, SITE_CHUNKS_IN_FLIGHT, SITE_EXTENT_WARNING_KM, siteChunks, siteRectangle, } from "./site-chunks.js";
export { bboxAreaM2, MAX_SLAB_TOLERANCE_DEG, SLAB_TOLERANCE_FACTOR, slabToleranceDeg, unionAreaM2, } from "./rect-union-metrics.js";
