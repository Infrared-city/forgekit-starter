import { DEFAULT_HEIGHT_M } from "./internal/footprints.js";
import { rejectRemovedOption } from "./internal/service.js";
import { consoleLogger } from "./logger.js";
import { generateTilesForPolygon } from "./area/tiling.js";
import { reanchorEntries } from "./area/reanchor.js";
import { kernelPolygonOrigin } from "./area/tile-frames.js";
import { acquireBuildingsArea, httpRangeTransport, pointToBbox, readMarginM, resolveReadAnalysisType, siteRectangle, } from "./geodata/index.js";
/**
 * Buildings read straight from the public data hosts and extruded locally.
 *
 * The gateway route `POST /buildings` is gone. That Lambda read the same R2
 * city overlays and the same Overture data this class now reads itself, so
 * it added one server round trip per tile and returned no `buildingIds` for
 * any non-Mapbox source. The class therefore takes only the transport
 * settings of `ServiceOptions` (`fetch`, `timeoutMs`) and sends no API key
 * anywhere; `buildingIds` is always an empty array.
 */
export class BuildingsService {
    request;
    /** The client's logger: an overlay degrade is reported through it. */
    logger;
    constructor(options) {
        // The client's fetch and timeout reach the public hosts too.
        this.request = {
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
            // A retry of a public read reports through the client's logger.
            ...(options.logger === undefined ? {} : { logger: options.logger }),
        };
        this.logger = options.logger ?? consoleLogger;
    }
    async getBuildingsInArea(polygon, options = {}) {
        rejectRemovedOption(options, "acquisition", "footprints are read from the public data hosts only; remove the option");
        for (const name of ["compress", "optimizations", "outputFormat"]) {
            rejectRemovedOption(options, name, "it shaped the deleted POST /buildings request; the extrusion is local and " +
                "always returns dotbim meshes");
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
        // The READ shape follows the analysis (D54): the kernel preset decides
        // the tile grid the rectangles are centred on AND their half extent.
        const analysisType = resolveReadAnalysisType(options.analysisType);
        const halfExtentM = readMarginM(analysisType);
        const grid = generateTilesForPolygon(polygon, {
            analysisType,
            ...(options.maxTilesOverride === undefined
                ? {}
                : { maxTilesOverride: options.maxTilesOverride }),
        });
        const active = grid.flat().filter((tile) => !tile.empty);
        // The site rectangle is the union of the rectangles the per-tile reads
        // asked for: the context bodies beyond the polygon edge this analysis
        // simulates with, and no others.
        const rectangles = active.map((tile) => pointToBbox(tile.centroid.latitude, tile.centroid.longitude, halfExtentM));
        if (rectangles.length === 0) {
            const empty = kernelPolygonOrigin(polygon);
            return {
                buildings: {}, buildingIds: [], totalBuildings: 0,
                executionTime: (performance.now() - started) / 1_000,
                failedTiles: [], warnings: [], origin: [empty.lon, empty.lat],
                readMarginM: halfExtentM, analysisType,
            };
        }
        const site = siteRectangle(rectangles);
        // ONE transport for the whole site: it carries the object-size cache a
        // per-chunk instance would throw away.
        const request = {
            ...this.request,
            ...(options.signal === undefined ? {} : { signal: options.signal }),
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
            ...(options.overtureRelease === undefined
                ? {}
                : { overtureRelease: options.overtureRelease }),
        };
        const area = await acquireBuildingsArea(site, direct);
        const overtureRelease = area.overtureRelease === "" ? undefined : area.overtureRelease;
        // The extrusion frame is the site RECTANGLE's south-west corner; the
        // payload path, the tile grid and every other kernel operation use the
        // POLYGON's (D1). One exact re-anchor puts the whole map in that frame —
        // one kernel call over the area, not one per body.
        const polygonOrigin = kernelPolygonOrigin(polygon);
        const buildings = Object.keys(area.buildings).length === 0
            ? {}
            : reanchorEntries(area.buildings, { lon: area.origin[0], lat: area.origin[1] }, polygonOrigin);
        // A degrade from a city's high-fidelity footprints to Overture changes the
        // building quality of the WHOLE site. It reached nobody before: the
        // warnings were built and dropped. They are returned AND logged, so a
        // caller who reads neither the field nor the log is not the only case.
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
            executionTime: (performance.now() - started) / 1_000,
            // A site-level read succeeds or fails as one. A partial answer is a
            // thinner city that nobody can see (D48).
            failedTiles: [],
            readMarginM: halfExtentM,
            analysisType,
            ...(overtureRelease === undefined ? {} : { overtureRelease }),
        };
    }
}
