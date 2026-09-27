import { requireCore } from "./internal/core.js";
import { mapLimit, rejectRemovedOption, } from "./internal/service.js";
import { generateTilesForPolygon } from "./area/tiling.js";
import { acquireTrees, acquireTreesJson, featureCollectionJson, groundReadDistanceM, httpRangeTransport, jsonArrayOf, pointToBbox, resolveReadAnalysisType, } from "./geodata/index.js";
import { convertPointsToMeshesLocal, VegetationMeshError, } from "./vegetation-mesh.js";
/**
 * Trees read straight from the public data hosts.
 *
 * The utilities-service route `GET /utils/gis/vegetation` is gone; the
 * direct path is the only path, so this class takes only the transport
 * settings of `ServiceOptions` (`fetch`, `timeoutMs`) and sends no API key
 * anywhere.
 */
export class VegetationService {
    request;
    constructor(options) {
        // The client's fetch and timeout reach the public hosts too.
        this.request = {
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
            // A retry of a public read reports through the client's logger.
            ...(options.logger === undefined ? {} : { logger: options.logger }),
        };
    }
    /**
     * One tile's trees, read straight from the public data hosts.
     *
     * Returns `null` for a genuinely empty tile.
     */
    async getGeoJson(lat, lon, distance) {
        const result = await acquireTrees(pointToBbox(lat, lon, distance), { ...this.request });
        if (result.features.length === 0)
            return null;
        return {
            type: "FeatureCollection",
            features: result.features,
            ...(result.warnings.length === 0 ? {} : { _warnings: [...result.warnings] }),
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
            throw new VegetationMeshError(`converter must be "local"; the TypeScript SDK has no remote convert route`);
        }
        return convertPointsToMeshesLocal(featureCollection, options.registryJson === undefined ? {} : { registryJson: options.registryJson });
    }
    /**
     * Trees over an area, tile by tile.
     */
    async getArea(polygon, options = {}) {
        rejectRemovedOption(options, "acquisition", "trees are read from the public data hosts only; remove the option");
        const started = performance.now();
        // The READ shape follows the analysis (D54): the kernel preset decides
        // the tile grid AND the query half extent.
        const analysisType = resolveReadAnalysisType(options.analysisType);
        const readDistanceM = groundReadDistanceM(analysisType);
        const tiles = generateTilesForPolygon(polygon, {
            analysisType,
            ...(options.maxTilesOverride === undefined
                ? {}
                : { maxTilesOverride: options.maxTilesOverride }),
        });
        const active = tiles.flat().filter((tile) => !tile.empty);
        const failedTiles = [];
        const workers = options.maxWorkers ?? 10;
        // Tiles stay as JSON text and are spliced into the deduplicator's input,
        // so no tile's features are ever built as host objects (bulk-data rule 1).
        // ONE transport for the whole area: it carries the object-size cache a
        // per-tile instance would throw away.
        const request = {
            ...this.request,
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        };
        const direct = { ...request, transport: httpRangeTransport(request) };
        // An abort is the caller's decision, not a failed tile.
        const stopIfAborted = () => {
            if (options.signal?.aborted === true) {
                throw options.signal.reason ?? new DOMException("aborted", "AbortError");
            }
        };
        const tilesJson = jsonArrayOf(await mapLimit(active, workers, async (tile) => {
            stopIfAborted();
            try {
                return await this.tileJsonDirect(tile.centroid.latitude, tile.centroid.longitude, readDistanceM, direct);
            }
            catch {
                stopIfAborted();
                failedTiles.push(tile.tileId);
                return undefined;
            }
        }));
        stopIfAborted();
        if (active.length > 0 && failedTiles.length === active.length) {
            throw new Error(`Vegetation fetch failed for all ${active.length} area tiles`);
        }
        const features = JSON.parse(requireCore().dedupVegetationFeatures(tilesJson));
        return {
            features,
            polygon,
            totalTrees: Object.keys(features).length,
            executionTime: (performance.now() - started) / 1_000,
            failedTiles,
            readMarginM: readDistanceM,
            analysisType,
        };
    }
}
