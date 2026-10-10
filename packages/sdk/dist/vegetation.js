import { ensureCore, requireCore } from "./internal/core.js";
import { mapLimit, rejectRemovedOption, } from "./internal/service.js";
import { generateTilesForPolygon } from "./area/tiling.js";
import { acquireTrees, acquireTreesJson, featureCollectionJson, groundReadDistanceM, httpRangeTransport, jsonArrayOf, pointToBbox, resolveReadAnalysisType, } from "./geodata/index.js";
import { convertPointsToMeshesLocal, VegetationMeshError, } from "./vegetation-mesh.js";
/**
 * Reads tree locations from the public data hosts and converts them to meshes.
 *
 * The service takes only the transport settings of `ServiceOptions` (`fetch`,
 * `timeoutMs`, `logger`) and sends no API key anywhere.
 *
 * @category Vegetation
 */
// Maintainer note (not published): the utilities-service route
// `GET /utils/gis/vegetation` is gone; the direct path is the only path.
export class VegetationService {
    request;
    /**
     * @param options - Transport settings: `fetch`, `timeoutMs` and `logger` are
     *   used for the public reads; `baseUrl` and `auth` are accepted but not used.
     */
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
     * Reads the trees around one point.
     *
     * @param lat - Centre latitude in degrees.
     * @param lon - Centre longitude in degrees.
     * @param distance - Half-width of the square to read, in metres.
     * @returns A feature collection, or `null` when there are no trees there. Any
     *   read warnings are listed under `_warnings`.
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
            throw new VegetationMeshError(`converter must be "local"; the TypeScript SDK has no remote convert route`);
        }
        return convertPointsToMeshesLocal(featureCollection, options.registryJson === undefined ? {} : { registryJson: options.registryJson });
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
        rejectRemovedOption(options, "acquisition", "trees are read from the public data hosts only; remove the option");
        await ensureCore("vegetation.getArea");
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
