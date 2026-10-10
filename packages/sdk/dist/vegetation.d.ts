import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
import { type ToMeshesOptions, type VegetationMesh } from "./vegetation-mesh.js";
/**
 * A GeoJSON feature collection: `type` is `"FeatureCollection"` and `features`
 * holds the features.
 *
 * @category Vegetation
 */
export type GeoJsonFeatureCollection = Readonly<Record<string, unknown>> & {
    readonly type?: string;
    readonly features?: ReadonlyArray<Readonly<Record<string, unknown>>>;
};
/**
 * Trees read for an area.
 *
 * @category Vegetation
 */
export interface AreaVegetation {
    /** The tree features, keyed by tree id, after duplicates between tiles are removed. */
    readonly features: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    /** The polygon that was read. */
    readonly polygon: Polygon;
    /** Number of trees in `features`. */
    readonly totalTrees: number;
    /** Time the read took, in seconds. */
    readonly executionTime: number;
    /** Ids of the tiles whose read failed; their trees are missing from `features`. */
    readonly failedTiles: readonly string[];
    /**
     * Half extent, in metres, of the read rectangle every tile was fetched with:
     * 363 for the wind analyses and 544 for the others. `runArea` refuses a run
     * whose analysis needs more than this.
     */
    readonly readMarginM: number;
    /** The analysis type the read margin was taken from. */
    readonly analysisType: string;
}
/**
 * Reads tree locations from the public data hosts and converts them to meshes.
 *
 * The service takes only the transport settings of `ServiceOptions` (`fetch`,
 * `timeoutMs`, `logger`) and sends no API key anywhere.
 *
 * @category Vegetation
 */
export declare class VegetationService {
    private readonly request;
    /**
     * @param options - Transport settings: `fetch`, `timeoutMs` and `logger` are
     *   used for the public reads; `baseUrl` and `auth` are accepted but not used.
     */
    constructor(options: ServiceOptions);
    /**
     * Reads the trees around one point.
     *
     * @param lat - Centre latitude in degrees.
     * @param lon - Centre longitude in degrees.
     * @param distance - Half-width of the square to read, in metres.
     * @returns A feature collection, or `null` when there are no trees there. Any
     *   read warnings are listed under `_warnings`.
     */
    getGeoJson(lat: number, lon: number, distance: number): Promise<GeoJsonFeatureCollection | null>;
    private tileJsonDirect;
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
    toMeshes(featureCollection: GeoJsonFeatureCollection, options?: ToMeshesOptions): VegetationMesh[];
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
    getArea(polygon: Polygon, options?: {
        /** Number of tiles read at once. Default 10. */
        readonly maxWorkers?: number;
        /** Raises the cap on non-empty tiles (100 by default); a larger area is refused without it. */
        readonly maxTilesOverride?: number;
        /**
         * The analysis this read is for. It decides the tile grid and the read
         * margin: 363 m for the two wind analyses and 544 m for every other one.
         * Omit it for the widest margin, which is valid for every analysis.
         */
        readonly analysisType?: string;
        /** Stops the read: requests in flight abort, and no tile starts after it. */
        readonly signal?: AbortSignal;
    }): Promise<AreaVegetation>;
}
