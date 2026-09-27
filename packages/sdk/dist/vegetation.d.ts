import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
import { type ToMeshesOptions, type VegetationMesh } from "./vegetation-mesh.js";
export type GeoJsonFeatureCollection = Readonly<Record<string, unknown>> & {
    readonly type?: string;
    readonly features?: ReadonlyArray<Readonly<Record<string, unknown>>>;
};
export interface AreaVegetation {
    readonly features: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    readonly polygon: Polygon;
    readonly totalTrees: number;
    readonly executionTime: number;
    readonly failedTiles: readonly string[];
    /**
     * Half extent, in metres, of the read rectangle every tile was fetched
     * with — `ceil(sqrt(2) * contextSizeM / 2)` for {@link analysisType}, so
     * 363 on the wind preset and 544 on the solar one. `runArea` refuses a run
     * whose analysis needs MORE than this (`docs/DEVIATIONS.md` D54).
     */
    readonly readMarginM: number;
    /** The analysis type the read margin was taken from. */
    readonly analysisType: string;
}
/**
 * Trees read straight from the public data hosts.
 *
 * The utilities-service route `GET /utils/gis/vegetation` is gone; the
 * direct path is the only path, so this class takes only the transport
 * settings of `ServiceOptions` (`fetch`, `timeoutMs`) and sends no API key
 * anywhere.
 */
export declare class VegetationService {
    private readonly request;
    constructor(options: ServiceOptions);
    /**
     * One tile's trees, read straight from the public data hosts.
     *
     * Returns `null` for a genuinely empty tile.
     */
    getGeoJson(lat: number, lon: number, distance: number): Promise<GeoJsonFeatureCollection | null>;
    /**
     * One tile's trees as FeatureCollection JSON text.
     *
     * The area path uses this rather than the object form: the per-tile texts
     * are spliced into the array the deduplicator takes, so no tile's features
     * are ever built as host objects (bulk-data rule 1).
     */
    private tileJsonDirect;
    /**
     * Convert tree Point features to dotbim meshes in the local WASM kernel.
     *
     * `converter` accepts only `"local"`: the TypeScript SDK has no remote
     * convert route, so a remote value is a typed error rather than a silent
     * local run (D39). Mirrors Python
     * `VegetationServiceClient.convert_to_mesh(converter="local")`.
     */
    toMeshes(featureCollection: GeoJsonFeatureCollection, options?: ToMeshesOptions): VegetationMesh[];
    /**
     * Trees over an area, tile by tile.
     */
    getArea(polygon: Polygon, options?: {
        readonly maxWorkers?: number;
        readonly maxTilesOverride?: number;
        /**
         * The analysis this acquisition is for. It decides the tile grid and
         * the READ MARGIN — `ceil(sqrt(2) * contextSizeM / 2)` of the kernel
         * preset, 363 m for the two wind analyses and 544 m for every other
         * one. Omit it for the WIDEST margin, valid for every analysis (D54).
         */
        readonly analysisType?: string;
        /** Stops the read: requests in flight abort, and no tile starts after it. */
        readonly signal?: AbortSignal;
    }): Promise<AreaVegetation>;
}
