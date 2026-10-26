import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
/**
 * One building mesh in dotbim form: flat vertex coordinates plus triangle indices.
 *
 * Coordinates are in metres in the frame returned as `AreaBuildings.origin`.
 *
 * @category Buildings
 */
export interface DotBimMesh extends Readonly<Record<string, unknown>> {
    /** Identifier of the mesh within its building. */
    readonly mesh_id: number;
    /** Flat vertex coordinates `[x, y, z, ...]`, in metres. */
    readonly coordinates: readonly number[];
    /** Flat triangle vertex indices. */
    readonly indices?: readonly number[];
}
/**
 * Options for `BuildingsService.getBuildingsInArea`.
 *
 * @category Buildings
 */
export interface BuildingsConfig {
    /** Pin the Overture release this read uses. */
    readonly overtureRelease?: string;
    /** Raises the cap on non-empty tiles (100 by default); a larger area is refused without it. */
    readonly maxTilesOverride?: number;
    /**
     * Accepted for compatibility; it changes nothing.
     *
     * The site's footprints are fetched in one read, so there is no per-tile
     * fan-out left for it to bound. Passing it is neither refused nor
     * honoured: the call keeps working and returns the same answer.
     */
    readonly maxWorkers?: number;
    /** Aborts the whole site read, not just one request. */
    readonly signal?: AbortSignal;
    /**
     * The analysis this read is for. It decides the tile grid and the read
     * margin: 256 m for the two wind analyses and 384 m for every other one,
     * which needs the shadow casters further out. Omit it for the widest
     * margin, which is valid for every analysis.
     */
    readonly analysisType?: string;
}
/**
 * Buildings read for an area, as dotbim meshes keyed by building.
 *
 * @category Buildings
 */
export interface AreaBuildings {
    /** The building meshes, keyed by building id. */
    readonly buildings: Readonly<Record<string, DotBimMesh>>;
    /** Always an empty array: the public sources this service reads carry no building ids. */
    readonly buildingIds: readonly number[];
    /** Number of buildings in `buildings`. */
    readonly totalBuildings: number;
    /** Time the read took, in seconds. */
    readonly executionTime: number;
    /** Always empty: the site is read as one request, which succeeds or fails as a whole. */
    readonly failedTiles: readonly string[];
    /**
     * `[lon, lat]` the meshes are framed around: the polygon's south-west corner.
     *
     * The whole area is extruded once, in this one frame, so the meshes render
     * as one consistent site. When you submit them in a run, each simulation
     * tile receives them re-anchored into its own frame.
     */
    readonly origin: readonly [number, number];
    /**
     * Half extent, in metres, of the read rectangle every tile was fetched with:
     * 256 for the wind analyses and 384 for the others. `runArea` refuses a run
     * whose analysis needs more than this.
     */
    readonly readMarginM: number;
    /** The analysis type the read margin was taken from. */
    readonly analysisType: string;
    /**
     * Overture release this read used, absent when a city overlay supplied
     * the footprints.
     */
    readonly overtureRelease?: string;
    /**
     * What the read degraded, as human-readable warnings. Empty when nothing
     * degraded.
     *
     * `<city>_overlay_unavailable` means a registered city's high-fidelity
     * footprints could not be read and the whole site fell back to Overture, a
     * visible drop in building quality for the whole area. A city registry that
     * could not be reached adds its own warning the same way.
     *
     * The same warnings are also sent to the client's `logger.warn`, so a caller
     * who does not read this field is still told.
     */
    readonly warnings: readonly string[];
    /**
     * Footprints that could not be extruded, with their geometry type. A
     * non-empty list means those buildings are missing from `buildings`.
     */
    readonly skippedFootprints?: ReadonlyArray<{
        readonly id: string;
        readonly geometryType: string;
    }>;
}
/**
 * Reads building footprints for an area from the public data hosts and extrudes
 * them locally into dotbim meshes.
 *
 * The service takes only the transport settings of `ServiceOptions` (`fetch`,
 * `timeoutMs`, `logger`) and sends no API key anywhere. `buildingIds` is always
 * an empty array, because the public sources carry no building ids.
 *
 * @category Buildings
 */
export declare class BuildingsService {
    private readonly request;
    /** The client's logger: an overlay degrade is reported through it. */
    private readonly logger;
    /**
     * @param options - Transport settings: `fetch`, `timeoutMs` and `logger` are
     *   used for the public reads; `baseUrl` and `auth` are accepted but not used.
     */
    constructor(options: ServiceOptions);
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
    getBuildingsInArea(polygon: Polygon, options?: BuildingsConfig): Promise<AreaBuildings>;
    private directArea;
}
