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
export type { InitializeCoreOptions } from "../internal/options.js";
export { CoreInitializationError, CoreNotReadyError, CoreTerminalError, } from "../internal/errors.js";
export { ALLOWED_HOSTS, assertAllowedUrl, GEO_BASE_URL, geoUrlFor, isAllowedUrl, } from "./allowed-hosts.js";
export { GeodataDependencyError, GeodataError, GeodataFetchError, GeodataRangeError, HostNotAllowedError, OvertureFileLimitError, OvertureReadTooLargeError, SiteReadError, } from "./errors.js";
export type { SiteChunkFailure } from "./errors.js";
export { bboxIntersects, DATA_USER_AGENT, DEFAULT_PUBLIC_TIMEOUT_MS, fetchPublicBytes, fetchPublicJson, fetchPublicText, MAX_HTTP_200_BYTES, MAX_JSON_BYTES, MAX_RANGE_BYTES, pointToBbox, } from "./http.js";
export type { Bbox, PublicBytes, PublicBytesOptions, PublicRequestOptions, } from "./http.js";
export { groundReadDistanceM, readMarginM, ReadMarginError, requiredMarginM, resolveReadAnalysisType, WIDEST_READ_ANALYSIS_TYPE, } from "./read-margin.js";
export { bytesRangeTransport, httpRangeTransport } from "./range-transport.js";
export type { RangeReadOptions, RangeReadResult, RangeTransport, } from "./range-transport.js";
export { MAX_BACKOFF_MS, MAX_RANGE_ATTEMPTS, MIN_BACKOFF_MS, RangeRetry, } from "./retry.js";
export type { RetryReason } from "./retry.js";
export { featureCollectionJson, featuresArrayText, jsonArrayOf, jsonObjectOf, requireFeatureCollection, requireJsonArray, spliceJsonArrays, } from "./json-chain.js";
export { clearManifestCaches, fetchOvertureManifest, fetchSources, INDEXED_COLLECTIONS, resolveOverlayCity, selectOvertureFiles, SOURCES_TTL_MS, } from "./manifests.js";
export type { OverlayCity, OverlayResolution, OvertureManifestOptions, } from "./manifests.js";
export { clearFgbCache, readFgbBbox, readFgbBboxJson, readFgbBytes, } from "./fgb.js";
export type { ReadFgbOptions } from "./fgb.js";
export { HEADER_PREFIX_BYTES, KERNEL_FGB_EXPORTS, MAX_PLANNED_RANGE_BYTES, MAX_PLANNED_TOTAL_BYTES, } from "./fgb-kernel.js";
export { COLUMNS_BY_COLLECTION, LAND_COVER_MIN_MAX_ZOOM, overtureReaderAvailable, planRowGroups, readOvertureCollection, readOvertureCollectionJson, requireOvertureReader, } from "./overture.js";
export type { OvertureRead, ReadOvertureOptions } from "./overture.js";
export { clearOvertureMetadataCache } from "./overture-cache.js";
export { acquireTrees, acquireTreesJson, DEDUP_RADIUS_M, treesFeatureCollection, TREES_URL, } from "./trees.js";
export type { AcquireTreesOptions, DirectTreesJson, DirectTreesResult } from "./trees.js";
export { acquireGroundMaterials, acquireGroundMaterialsJson, GROUND_COLLECTIONS, roadsToIrFeatures, ROADS_URL, } from "./ground.js";
export type { AcquireGroundJson, AcquireGroundOptions, ComposeFrame, DirectGroundResult, GroundLayers, } from "./ground.js";
export { acquireGroundMaterialsArea } from "./ground-area.js";
export type { AcquireGroundAreaOptions, GroundAreaResult } from "./ground-area.js";
export { acquireBuildings, acquireBuildingsJson } from "./buildings.js";
export type { AcquireBuildingsOptions, DirectBuildingsJson, DirectBuildingsResult, } from "./buildings.js";
export { acquireBuildingsArea } from "./buildings-area.js";
export type { AcquireBuildingsAreaOptions, BuildingsAreaResult, } from "./buildings-area.js";
export { bboxAreaKm2, decompose, farEndErrorM, namePieces, SITE_CHUNK_EDGE_M, SITE_CHUNK_THRESHOLD_KM2, SITE_CHUNKS_IN_FLIGHT, SITE_EXTENT_WARNING_KM, siteChunks, siteRectangle, } from "./site-chunks.js";
export type { SiteChunk } from "./site-chunks.js";
export { bboxAreaM2, MAX_SLAB_TOLERANCE_DEG, SLAB_TOLERANCE_FACTOR, slabToleranceDeg, unionAreaM2, } from "./rect-union-metrics.js";
