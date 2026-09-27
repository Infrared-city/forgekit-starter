import { type Bbox } from "./http.js";
import { type FeatureBox, type ReadOvertureOptions } from "./overture-rows.js";
/**
 * Area-level Overture reading: read the AOI once, assign to tiles after.
 *
 * A tiled area used to read every Overture collection once PER TILE, so N
 * tiles meant N parquet scans over largely the same row groups — the whole
 * cost of ground materials at 4 km2 (WP12). The rows a tile needs are
 * exactly the rows whose bbox meets that tile's query rectangle, and that
 * test is the same one the per-tile reader applied while decoding
 * (`boxesMeet`). So reading the union rectangle once and applying the
 * test per tile afterwards returns each tile the identical feature set, in
 * the identical order, for one read instead of N (D47).
 *
 * Features are held as TEXT here. Each feature is serialized once for the
 * whole area and a tile that shares it shares the string, so overlapping
 * tiles cost one copy, not N (bulk-data rule 1).
 */
/** One AOI feature: its text, and the bbox that decides which tiles hold it. */
export interface OvertureAreaFeature {
    readonly json: string;
    /** Absent when the file carries no bbox column: then it is in every tile. */
    readonly box?: FeatureBox;
}
export interface OvertureAreaRead {
    readonly features: readonly OvertureAreaFeature[];
    readonly release: string;
}
/** The smallest rectangle holding every tile rectangle. */
export declare function unionBbox(boxes: readonly Bbox[]): Bbox;
/**
 * Read one Overture collection for a whole AOI, keeping each feature's bbox.
 *
 * The union rectangle is a superset of every tile rectangle, so the rows it
 * returns are a superset of every tile's rows; {@link tileFeaturesJson}
 * takes each tile's share back out. Reading the hull therefore costs the
 * rows between the tiles, never a second pass over a row group.
 */
export declare function readOvertureArea(collection: string, bbox: Bbox, options?: ReadOvertureOptions): Promise<OvertureAreaRead>;
/**
 * One tile's features as JSON array text, in AOI read order.
 *
 * The order is the AOI's, and the AOI's is file-then-row-group-then-row
 * order over a file list that CONTAINS the tile's own list (a file holding a
 * feature that meets the tile also meets the AOI hull). A tile's slice of
 * that sequence is therefore the sequence its own read produced.
 */
export declare function tileFeaturesJson(features: readonly OvertureAreaFeature[], bbox: Bbox): string;
