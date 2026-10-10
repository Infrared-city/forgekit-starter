import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
import type { GroundMaterialCleaner, MaterialLayers } from "./ground-materials.js";
/**
 * The ground materials read for a polygon area, from
 * `GroundMaterialsService.getArea`. Pass it as `groundMaterials` to `runArea`.
 *
 * @category Ground materials
 */
export interface AreaGroundMaterials {
    /** The cleaned material layers, by layer name; empty when the polygon has no tiles to read. */
    readonly layers: MaterialLayers;
    /** The polygon the materials were read for. */
    readonly polygon: Polygon;
    /** The number of features across all layers. */
    readonly totalFeatures: number;
    /** How long the read took, in seconds. */
    readonly executionTime: number;
    /** Tiles that could not be read. Always empty: a site is read as a whole, so it succeeds or fails as one. */
    readonly failedTiles: readonly string[];
    /**
     * Half extent, in metres, of the rectangle every tile was read with: 363
     * for the wind analyses and 544 for the others. `runArea` refuses a run
     * whose analysis needs a larger margin than this.
     */
    readonly readMarginM: number;
    /** The analysis the read margin was taken from. */
    readonly analysisType: string;
    /**
     * Overture release this area was read from. The index pointer moves
     * daily, so a result without it is not reproducible; pass it back as
     * `overtureRelease` to pin the read.
     */
    readonly overtureRelease?: string;
}
/**
 * A cleaner of your own for the `cleaner` option of `getArea`: an object
 * implementing `GroundMaterialCleaner`. Leave the option unset to clean with
 * the SDK's built-in cleaner.
 *
 * @category Ground materials
 */
export type GroundMaterialsCleaner = GroundMaterialCleaner;
/**
 * Reads the ground materials (roads, water, parks and so on) around a point
 * or a polygon from the public data hosts. Available as
 * `InfraredClient.groundMaterials`.
 *
 * @category Ground materials
 */
export declare class GroundMaterialsService {
    private readonly request;
    private readonly logger;
    /** Creates the service from the client's transport settings (`fetch`, timeout and logger). */
    constructor(options: ServiceOptions);
    /** Base options for a direct read: the client's transport settings. */
    private directOptions;
    /**
     * Reads the material layers of one square tile around a point.
     *
     * @param lat - Centre latitude in degrees.
     * @param lon - Centre longitude in degrees.
     * @param distance - Half-width of the tile in metres.
     * @returns The layers, or `null` when the tile has no material at all.
     */
    getRaw(lat: number, lon: number, distance: number): Promise<MaterialLayers | null>;
    /**
     * Reads the material layers for a whole polygon area and cleans them, ready
     * to pass to `runArea` as `groundMaterials`. Which tiles are read, and how
     * far around each, follows the analysis (`options.analysisType`).
     *
     * @param polygon - The GeoJSON polygon to cover.
     * @param options - Read options; see each field.
     * @returns The `AreaGroundMaterials`, with empty layers when the polygon has no tiles to read.
     * @throws {InvalidOptionError} when the removed `acquisition` option is passed.
     */
    getArea(polygon: Polygon, options?: {
        /** The most data chunks read at the same time; it can lower the built-in limit, not raise it. */
        readonly maxWorkers?: number;
        /** Raises the limit on how many non-empty tiles the polygon may cover. */
        readonly maxTilesOverride?: number;
        /** The name of the background material layer; a built-in default when unset. */
        readonly defaultMaterial?: string;
        /** A cleaner of your own; unset uses the built-in cleaner. */
        readonly cleaner?: GroundMaterialsCleaner;
        /** The vertical step between stacked material layers, in metres. Default 0.05. */
        readonly zStep?: number;
        /** Pin the Overture release this read uses. */
        readonly overtureRelease?: string;
        /** Aborts the read. */
        readonly signal?: AbortSignal;
        /**
         * The analysis this read is for. It decides the tile grid and the read
         * margin: 363 m for the two wind analyses and 544 m for every other one,
         * which needs shadow casters further out. Omit it for the widest margin,
         * which is valid for every analysis.
         */
        readonly analysisType?: string;
    }): Promise<AreaGroundMaterials>;
}
