import { type AcquireBuildingsOptions } from "./buildings.js";
import type { Bbox } from "./http.js";
/**
 * Options for {@link acquireBuildingsArea}.
 *
 * Extends {@link AcquireBuildingsOptions}. The whole site is read once and
 * extruded in one local frame, so there is no concurrency option.
 *
 * @category Buildings
 */
export interface AcquireBuildingsAreaOptions extends AcquireBuildingsOptions {
    /** Default extrusion height, in metres, for a footprint that carries none. */
    readonly defaultHeightM: number;
    /**
     * The simulation-tile query rectangles whose union is the site rectangle.
     *
     * They decide two things: whether the site has one building source (a site
     * whose rectangles resolve to different sources is read rectangle by
     * rectangle), and which parts of the site are extruded, so a long, narrow
     * site does not extrude the empty corners of its bounding box. When
     * omitted, the site rectangle stands for itself.
     */
    readonly rectangles?: readonly Bbox[];
}
/**
 * Footprints read for a whole site and extruded into one frame.
 *
 * @category Buildings
 */
export interface BuildingsAreaResult {
    /** Building meshes keyed by building id, in the site frame, extruded once. */
    readonly buildings: Record<string, Record<string, unknown>>;
    /** The frame the meshes are in: the site rectangle's south-west corner, `[lon, lat]`. */
    readonly origin: readonly [number, number];
    /** Which source answered for the site; several sources are joined with `+`. */
    readonly source: string;
    /** Degradations the caller should surface, such as an unavailable city overlay. */
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, or `""` when Overture was not read. */
    readonly overtureRelease: string;
}
/**
 * Read and extrude every building footprint of one site, in one frame.
 *
 * A registered city overlay is used when one covers the site, otherwise the
 * global Overture building layer. The site is read once and extruded once, so
 * every mesh shares the origin in {@link BuildingsAreaResult.origin}.
 *
 * @param site - The site rectangle, in WGS84 degrees.
 * @param options - Read options; `defaultHeightM` is required.
 * @returns The building meshes keyed by id, the frame origin, the source and
 *   any warnings.
 * @throws {OvertureReadTooLargeError} when the planned Overture read exceeds
 *   the byte limit.
 * @throws {GeodataDependencyError} when Overture must be read and the optional
 *   parquet packages are not installed.
 * @category Buildings
 */
export declare function acquireBuildingsArea(site: Bbox, options: AcquireBuildingsAreaOptions): Promise<BuildingsAreaResult>;
