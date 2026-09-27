import { type AcquireGroundOptions } from "./ground.js";
import { type OvertureAreaRead } from "./overture-area.js";
import { type SiteChunk } from "./site-chunks.js";
import type { Logger } from "../logger.js";
import type { Bbox } from "./http.js";
/**
 * Ground materials for a whole SITE: one read per chunk, ONE compose, ONE
 * merge and clean (WP14-A, `docs/DEVIATIONS.md` D48).
 *
 * WP12 read the Overture themes once for the union of the simulation tiles
 * and then composed PER TILE — 81 kernel calls at 5 km2, ~12 s of the ground
 * pass — and the host merged and cleaned the 81 documents afterwards. The
 * composition is a clip against a rectangle, and one clip against one
 * rectangle is not the union of 81 clips against 81 overlapping ones, so the
 * geometry at the former tile seams moves. That is the intended difference
 * D48 records, and it is what makes the site-level call possible.
 *
 * Now: the site is read in ~2x2 km chunks (one rectangle below 4 km2), each
 * chunk with its own Overture read and its own roads FlatGeobuf, at most two in
 * flight; then ONE
 * `groundMaterialsComposeAndMergeBytes` over the chunks' COMPOSE PIECES, at
 * the SITE frame origin, returns the merged and cleaned layers. There is no
 * per-tile document, no host merge and no host clean.
 *
 * **The compose list is `chunk ∩ union(tile rectangles)`, not the chunk**
 * (WP21, D57). The READ stays per chunk — a parquet row group and a
 * FlatGeobuf range both span more ground than a piece — so only the COMPOSE
 * shrinks, to the footprint a simulation will actually read. A compact site
 * decomposes to one piece per chunk and its document does not move at all.
 */
export interface AcquireGroundAreaOptions extends AcquireGroundOptions {
    /**
     * Chunks in flight for the road reads. Honoured as
     * `min(maxWorkers, SITE_CHUNKS_IN_FLIGHT)` — the ceiling is what bounds the
     * bytes held, and a caller asking for less must still get less.
     */
    readonly maxWorkers?: number;
    /** The clean-v3 extent: the site centre and its half-diagonal in metres. */
    readonly cleaningExtent: {
        readonly latitude: number;
        readonly longitude: number;
        readonly distance: number;
    };
    /** clean-v3's backdrop material; the kernel default when absent. */
    readonly defaultLayer?: string;
    /** clean-v3's z step; the kernel default (0.05 m, D5) when absent. */
    readonly zStep?: number;
    /**
     * The simulation-tile query rectangles. A read chunk that meets none of them
     * is not composed: an L-shaped polygon's empty quadrant is ground no
     * simulation will read.
     */
    readonly tileRectangles?: readonly Bbox[];
    /**
     * Where the site-size warning goes. `consoleLogger` when absent, which is
     * what a direct `/geodata` caller had before it was routed.
     */
    readonly logger?: Logger;
}
export interface GroundAreaResult {
    /** The merged, cleaned layers as TEXT, exactly as the kernel wrote them. */
    readonly layersJson: string;
    /** Overture release the base themes came from, for reproducibility. */
    readonly overtureRelease: string;
    /** The read chunks, in the order the kernel received them. */
    readonly chunks: readonly SiteChunk[];
}
/** Compose, merge and clean the ground materials of one site. */
export declare function acquireGroundMaterialsArea(site: Bbox, options: AcquireGroundAreaOptions): Promise<GroundAreaResult>;
/** Kept for the type re-export; the read itself is chunk-level now. */
export type { OvertureAreaRead };
