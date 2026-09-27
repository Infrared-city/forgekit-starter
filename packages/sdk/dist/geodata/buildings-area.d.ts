import { type AcquireBuildingsOptions } from "./buildings.js";
import type { Bbox } from "./http.js";
/**
 * Building footprints for a whole SITE: one read, one normalisation, one
 * extrusion, one frame (WP14-A, `docs/DEVIATIONS.md` D48).
 *
 * WP12 read the Overture theme once for the union of the tile rectangles and
 * then normalised and EXTRUDED per tile, each tile in its own rectangle's
 * frame, with the host shifting the bodies into the site frame afterwards.
 * That mixed two frames — `LocalFrame` fixes the east-west scale at the
 * frame's origin latitude (D1), so a per-tile frame and the site frame
 * disagree by a term no constant offset absorbs.
 *
 * Now the site is read ONCE — not per chunk: a parquet row group is the
 * smallest unit the reader can fetch and it spans far more ground than a
 * chunk, so a per-chunk read re-fetches the same bytes and gains nothing
 * (measured on the ground themes at 59-66 s against 10-17 s). The features are
 * handed to `buildingsAssignAndExtrude` with ONE rectangle — the site
 * rectangle — and the bodies come back normalised once and extruded once, in
 * the site rectangle's frame. The payload path re-anchors them per simulation
 * tile with the exact affine (`area/reanchor.ts`).
 *
 * The chunk grid therefore bounds nothing on THIS leg. What bounds the bytes
 * here is the planned-bytes ceiling the read already carries.
 *
 * The city-overlay decision is the SITE's when — and only when — every
 * simulation-tile rectangle resolves to the SAME source. The rule itself is
 * unchanged: a rectangle that intersects a registered city outline publishing
 * a `buildings` layer takes that city's FlatGeobuf.
 *
 * A site whose rectangles DISAGREE — a polygon straddling a registered city's
 * outline — cannot be read at site level. The city FlatGeobuf covers the city
 * only, so one read over the whole site rectangle would return the city and
 * NOTHING outside it, with no failure and no warning: "a thinner city that
 * nobody can see". Such a site falls back to the per-rectangle read, each
 * rectangle with its own source, each extruded in its own frame and
 * re-anchored into the site frame with the exact affine — the same shape the
 * Python host's `site_source_or_none` picks (review M3, D48).
 */
export interface AcquireBuildingsAreaOptions extends AcquireBuildingsOptions {
    /** Default extrusion height for a footprint that carries none, in metres. */
    readonly defaultHeightM: number;
    /**
     * The simulation-tile query rectangles the site rectangle is the union of.
     *
     * They decide TWO things: whether the site has one source (the overlay is
     * resolved for each of them, and a site whose rectangles disagree takes the
     * per-rectangle read), and the EXTRUSION rectangles — the compose list is
     * `site ∩ union(rectangles)`, so a long, narrow site does not extrude the
     * empty corners of its bounding box (D57). Omitted, the site rectangle
     * stands for itself, which is the single-AOI shape a direct caller asks
     * for.
     */
    readonly rectangles?: readonly Bbox[];
}
export interface BuildingsAreaResult {
    /** `{building_id: dotbim mesh}` in the SITE frame, extruded once. */
    readonly buildings: Record<string, Record<string, unknown>>;
    /** The frame the bodies are in: the site rectangle's south-west corner. */
    readonly origin: readonly [number, number];
    /** Which source answered for the site. */
    readonly source: string;
    readonly warnings: readonly string[];
    /** Overture release the footprints came from, when Overture was read. */
    readonly overtureRelease: string;
}
/** Read and extrude every footprint of one site, in one frame. */
export declare function acquireBuildingsArea(site: Bbox, options: AcquireBuildingsAreaOptions): Promise<BuildingsAreaResult>;
