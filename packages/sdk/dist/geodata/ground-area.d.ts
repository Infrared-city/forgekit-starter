import { type AcquireGroundOptions } from "./ground.js";
import { type OvertureAreaRead } from "./overture-area.js";
import { type SiteChunk } from "./site-chunks.js";
import type { Logger } from "../logger.js";
import type { Bbox } from "./http.js";
/**
 * Options for {@link acquireGroundMaterialsArea}.
 *
 * Extends {@link AcquireGroundOptions} with the site-level cleaning extent, the
 * simulation-tile rectangles and the number of chunks read at once.
 *
 * @category Geodata
 */
export interface AcquireGroundAreaOptions extends AcquireGroundOptions {
    /**
     * Maximum number of chunks whose road data is read at the same time. The
     * effective value is `min(maxWorkers, SITE_CHUNKS_IN_FLIGHT)`, so a caller can
     * lower concurrency but never raise it above the built-in ceiling that bounds
     * memory use.
     */
    readonly maxWorkers?: number;
    /**
     * The extent the merged layers are cleaned against: the site centre
     * (`latitude`, `longitude` in degrees) and its half-diagonal `distance` in
     * metres.
     */
    readonly cleaningExtent: {
        readonly latitude: number;
        readonly longitude: number;
        readonly distance: number;
    };
    /** Material used for the background layer; a built-in default when absent. */
    readonly defaultLayer?: string;
    /**
     * Vertical step, in metres, used to stack material layers; defaults to
     * 0.05 m when absent.
     */
    readonly zStep?: number;
    /**
     * The query rectangles of the simulation tiles. A read chunk that meets none
     * of them is not composed: for example the empty quadrant of an L-shaped
     * polygon is ground no simulation will read.
     */
    readonly tileRectangles?: readonly Bbox[];
    /** Where the site-size warning is written. Defaults to `consoleLogger`. */
    readonly logger?: Logger;
}
/**
 * The merged ground materials of one site, as returned by
 * {@link acquireGroundMaterialsArea}.
 *
 * @category Geodata
 */
export interface GroundAreaResult {
    /** The merged, cleaned layers as JSON text (material name to feature collection). */
    readonly layersJson: string;
    /** Overture release the base themes came from, for reproducibility. */
    readonly overtureRelease: string;
    /** The read chunks the site was split into, in the order they were composed. */
    readonly chunks: readonly SiteChunk[];
}
/**
 * Read, compose, merge and clean the ground materials of a whole site.
 *
 * The site is read in chunks of about 2 x 2 km (one rectangle below 4 km2), each
 * with its own road read and a shared Overture read of the site. The chunks are
 * then composed, merged and cleaned in a single step, so no per-tile documents
 * exist. If any chunk fails to read the whole call fails.
 *
 * @param site - The site's bounding box in WGS84 degrees.
 * @param options - Cleaning extent, optional tile rectangles and read options.
 * @returns The merged layers as JSON text, the Overture release and the chunks.
 * @throws {SiteReadError} when one or more chunks cannot be read; it names every
 *   failed chunk.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @category Ground materials
 */
export declare function acquireGroundMaterialsArea(site: Bbox, options: AcquireGroundAreaOptions): Promise<GroundAreaResult>;
export type { OvertureAreaRead };
