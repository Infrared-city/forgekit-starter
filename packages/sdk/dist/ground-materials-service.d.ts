import { type ServiceOptions } from "./internal/service.js";
import type { Polygon } from "./area/types.js";
import type { GroundMaterialCleaner, MaterialLayers } from "./ground-materials.js";
export interface AreaGroundMaterials {
    readonly layers: MaterialLayers;
    readonly polygon: Polygon;
    readonly totalFeatures: number;
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
    /**
     * Overture release this area was read from. The index pointer moves
     * daily, so a result without it is not reproducible; pass it back as
     * `overtureRelease` to pin the read.
     */
    readonly overtureRelease?: string;
}
/**
 * A caller's own cleaner.
 *
 * The string selectors `"remote"` and `"local"` are gone: `"remote"` named
 * the utilities-service route, and local cleaning in the bundled kernel is
 * now what an unset `cleaner` does. An object implementing
 * {@link GroundMaterialCleaner} is still accepted — it is an extension
 * seam, not a service selector.
 */
export type GroundMaterialsCleaner = GroundMaterialCleaner;
export declare class GroundMaterialsService {
    private readonly request;
    /** The client's logger: the 20 km2 site warning goes through it (D48). */
    private readonly logger;
    constructor(options: ServiceOptions);
    /** Base options for a direct read: the client's transport settings. */
    private directOptions;
    /**
     * One tile's layers composed in-process from the public data hosts.
     *
     * Returns `null` for a tile with no material at all.
     */
    getRaw(lat: number, lon: number, distance: number): Promise<MaterialLayers | null>;
    getArea(polygon: Polygon, options?: {
        readonly maxWorkers?: number;
        readonly maxTilesOverride?: number;
        readonly defaultMaterial?: string;
        readonly cleaner?: GroundMaterialsCleaner;
        readonly zStep?: number;
        /** Pin the Overture release this read uses. */
        readonly overtureRelease?: string;
        readonly signal?: AbortSignal;
        /**
         * The analysis this acquisition is for. It decides the tile grid and
         * the READ MARGIN — `ceil(sqrt(2) * contextSizeM / 2)` of the kernel
         * preset, 363 m for the two wind analyses and 544 m for every other
         * one, which needs the shadow casters further out. Omit it for the
         * WIDEST margin, valid for every analysis (D54).
         */
        readonly analysisType?: string;
    }): Promise<AreaGroundMaterials>;
}
