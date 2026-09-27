import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
export interface DotBimMesh extends Readonly<Record<string, unknown>> {
    readonly mesh_id: number;
    readonly coordinates: readonly number[];
    readonly indices?: readonly number[];
}
export interface BuildingsConfig {
    /** Pin the Overture release this read uses. */
    readonly overtureRelease?: string;
    readonly maxTilesOverride?: number;
    /**
     * Accepted for compatibility; the buildings leg is one read, so it changes
     * nothing.
     *
     * It bounded a per-tile read fan-out that no longer exists. There is no
     * chunk loop on this leg to bound — a parquet row group spans far more
     * ground than a chunk, so the site's footprints are fetched in ONE read
     * (D48) — and it is neither refused nor quietly honoured: a call that passes
     * it keeps working and gets the same answer. The GROUND service does chunk,
     * and honours it as `min(maxWorkers, 2)`. So does the Python buildings host,
     * which chunks its own read.
     */
    readonly maxWorkers?: number;
    /** Abort the whole site read, not just one request. */
    readonly signal?: AbortSignal;
    /**
     * The analysis this acquisition is for. It decides the tile grid and the
     * READ MARGIN — the kernel preset's `contextSizeM / 2`, 256 m for the two
     * wind analyses and 384 m for every other one, which needs the shadow
     * casters further out. Omit it for the WIDEST margin, valid for every
     * analysis (`docs/DEVIATIONS.md` D54).
     */
    readonly analysisType?: string;
}
export interface AreaBuildings {
    readonly buildings: Readonly<Record<string, DotBimMesh>>;
    readonly buildingIds: readonly number[];
    readonly totalBuildings: number;
    readonly executionTime: number;
    readonly failedTiles: readonly string[];
    /**
     * `[lon, lat]` the extrusion was framed around — the polygon's south-west
     * corner, the canonical site frame (D1).
     *
     * PRESENT since 0.13: the area is extruded ONCE, in one frame, instead of
     * per tile in each tile's own frame and then offset (D48). The payload path
     * re-anchors each simulation tile's bodies into that tile's frame with the
     * exact affine, so a caller who submits these bodies gets the server's own
     * frame per tile; a caller who renders them gets one consistent site frame.
     */
    readonly origin: readonly [number, number];
    /**
     * Half extent, in metres, of the read rectangle every tile was fetched
     * with — the kernel preset's `contextSizeM / 2` for {@link analysisType},
     * so 256 on the wind preset and 384 on the solar one. `runArea` refuses a
     * run whose analysis needs MORE than this (D54).
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
     * What the acquisition degraded, in the kernel's own words.
     *
     * `<city>_overlay_unavailable` means a registered city's high-fidelity
     * footprints could not be read and the SITE fell back to Overture — a
     * visible drop in building quality for the whole area, which D47 says the
     * caller keeps. A registry that could not be reached adds its own warning
     * the same way. Empty when nothing degraded.
     *
     * The same list also goes to the client's `logger.warn`, so a caller who
     * does not read the field is still told. `VegetationService` surfaces the
     * same class of warning as `_warnings`.
     */
    readonly warnings: readonly string[];
    /**
     * Footprints the local extruder could not render, with the reason. A
     * non-empty list means those buildings are missing from `buildings` and
     * the caller must see it (D39).
     */
    readonly skippedFootprints?: ReadonlyArray<{
        readonly id: string;
        readonly geometryType: string;
    }>;
}
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
export declare class BuildingsService {
    private readonly request;
    /** The client's logger: an overlay degrade is reported through it. */
    private readonly logger;
    constructor(options: ServiceOptions);
    getBuildingsInArea(polygon: Polygon, options?: BuildingsConfig): Promise<AreaBuildings>;
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
    private directArea;
}
