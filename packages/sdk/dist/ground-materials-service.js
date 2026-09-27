import { cleaningExtent, resolveCleaner, } from "./internal/ground-merge.js";
import { kernelPolygonOrigin } from "./area/tile-frames.js";
import { rejectRemovedOption } from "./internal/service.js";
import { consoleLogger } from "./logger.js";
import { generateTilesForPolygon } from "./area/tiling.js";
import { acquireGroundMaterials, acquireGroundMaterialsArea, groundReadDistanceM, httpRangeTransport, pointToBbox, resolveReadAnalysisType, siteRectangle, } from "./geodata/index.js";
export class GroundMaterialsService {
    request;
    /** The client's logger: the 20 km2 site warning goes through it (D48). */
    logger;
    constructor(options) {
        // The client's fetch and timeout reach the public hosts too: a Worker
        // that injected a fetch must not have the direct path fall back to a
        // global one.
        this.request = {
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
            // A retry of a public read reports through the client's logger.
            ...(options.logger === undefined ? {} : { logger: options.logger }),
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
            ...this.directOptions(),
        });
        const empty = Object.values(layers).every((collection) => (collection.features?.length ?? 0) === 0);
        return empty ? null : layers;
    }
    async getArea(polygon, options = {}) {
        rejectRemovedOption(options, "acquisition", "ground materials are composed from the public data hosts only; remove the option");
        const cleaner = resolveCleaner(options.cleaner);
        const started = performance.now();
        // The READ shape follows the analysis (D54): the kernel preset decides
        // the tile grid the rectangles are centred on AND their half extent.
        const analysisType = resolveReadAnalysisType(options.analysisType);
        const tileQueryHalfM = groundReadDistanceM(analysisType);
        const grid = generateTilesForPolygon(polygon, {
            analysisType,
            ...(options.maxTilesOverride === undefined
                ? {}
                : { maxTilesOverride: options.maxTilesOverride }),
        });
        const active = grid.flat().filter((tile) => !tile.empty);
        // The clean circle's FLOOR is the read half extent, so it can never fall
        // inside what was fetched — and so both hosts clean one polygon to one
        // circle (D54). A hard-coded 363 here cleaned a small solar-default area
        // to a smaller circle than the Python host did.
        const extent = active.length > 0 ? cleaningExtent(polygon, tileQueryHalfM) : undefined;
        if (active.length === 0 || extent === undefined) {
            return {
                layers: {}, polygon, totalFeatures: 0,
                executionTime: (performance.now() - started) / 1_000, failedTiles: [],
                readMarginM: tileQueryHalfM, analysisType,
            };
        }
        // ONE transport for the whole site: it carries the object-size cache and
        // the entity tag that keeps a multi-request read consistent, both of
        // which a per-chunk instance would throw away.
        const transport = httpRangeTransport({
            ...this.directOptions(),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
        // The site rectangle is the union of the rectangles the per-tile reads
        // asked for, so the FEATURE set is unchanged; what changes is that the
        // composition is one clip against it instead of 81 clips against the
        // simulation tiles (D48).
        const rectangles = active.map((tile) => pointToBbox(tile.centroid.latitude, tile.centroid.longitude, tileQueryHalfM));
        const site = siteRectangle(rectangles);
        const origin = kernelPolygonOrigin(polygon);
        const direct = {
            ...this.directOptions(),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            transport,
            // The same frame origin for every chunk, so one road buffers to one
            // polygon whichever chunk sees it (D39).
            frameOrigin: [origin.lon, origin.lat],
            cleaningExtent: extent,
            // The rectangles the simulation actually reads: a chunk meeting none of
            // them is not composed (an L-shaped polygon's empty quadrant).
            tileRectangles: rectangles,
            logger: this.logger,
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
            ...(options.defaultMaterial === undefined ? {} : { defaultLayer: options.defaultMaterial }),
            ...(options.zStep === undefined ? {} : { zStep: options.zStep }),
            ...(options.overtureRelease === undefined
                ? {}
                : { overtureRelease: options.overtureRelease }),
        };
        const area = await acquireGroundMaterialsArea(site, direct);
        const overtureRelease = area.overtureRelease === "" ? undefined : area.overtureRelease;
        // The kernel composed, merged AND cleaned in one call, so the text it
        // returned is the answer. A caller's own cleaner still gets the merged
        // layers — it is an extension seam, and the kernel's clean is what an
        // unset `cleaner` means.
        let layers = JSON.parse(area.layersJson);
        if (cleaner !== "local" && Object.keys(layers).length > 0) {
            layers = await cleaner.cleanV3(layers, {
                latitude: extent.latitude,
                longitude: extent.longitude,
                distance: extent.distance,
                ...(options.defaultMaterial === undefined ? {} : { defaultLayer: options.defaultMaterial }),
                ...(options.zStep === undefined ? {} : { zStep: options.zStep }),
            });
        }
        const totalFeatures = Object.values(layers).reduce((sum, collection) => sum + (collection.features?.length ?? 0), 0);
        return {
            layers,
            polygon,
            totalFeatures,
            executionTime: (performance.now() - started) / 1_000,
            // A site-level read succeeds or fails as one. A partial ground set is
            // not a degraded answer. It is an emptier city that nobody can see (D48).
            failedTiles: [],
            readMarginM: tileQueryHalfM,
            analysisType,
            ...(overtureRelease === undefined ? {} : { overtureRelease }),
        };
    }
}
