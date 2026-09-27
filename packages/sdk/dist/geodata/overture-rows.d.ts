import { type Bbox, type PublicRequestOptions } from "./http.js";
import { type PlannedBudget, type SelectedGroup } from "./overture-budget.js";
import { type ParquetMetadata } from "./overture-parquet.js";
import { type RangeTransport } from "./range-transport.js";
export { isGeneralizedLandCover, LAND_COVER_MIN_MAX_ZOOM } from "./overture-keep.js";
/** Column projection per collection; the Python reader's `COLUMNS_BY_TYPE`. */
export declare const COLUMNS_BY_COLLECTION: Readonly<Record<string, readonly string[]>>;
/** The Overture `bbox` column of one row, when the file carries it. */
export interface FeatureBox {
    xmin?: number;
    xmax?: number;
    ymin?: number;
    ymax?: number;
}
/** One decoded feature and the row bbox that decides which tiles hold it. */
export interface OvertureRow {
    readonly feature: Record<string, unknown>;
    readonly box?: FeatureBox;
}
export interface ReadOvertureOptions extends PublicRequestOptions {
    /** Pass ONE instance for a whole area; it carries the size cache. */
    readonly transport?: RangeTransport;
    /** Cap on the parquet files read; a guard for very large AOIs. */
    readonly maxFiles?: number;
    /**
     * Widens the box used to CHOOSE files, never the box rows are filtered by.
     *
     * The `prod-BUILDINGS` Lambda buffers its candidate search by 0.002 deg, so
     * a file whose recorded bbox stops just short of the query still gets
     * considered. The row-level filter stays EXACT, so the buffer costs at most
     * one extra file read and never an extra feature — the same split the
     * Python SDK makes (`_internal/geodata/overture.py`).
     */
    readonly candidateBufferDeg?: number;
    /**
     * Pin the Overture release, e.g. `"2026-08-19.0"`.
     *
     * The index pointer is refreshed daily, so the same polygon read on two
     * days can otherwise return different ground layers with no signal. A
     * per-release manifest is immutable, so a pin is reproducible.
     */
    readonly overtureRelease?: string;
    /**
     * Compressed bytes this read may plan, when it makes its own budget.
     * Defaults to the runtime's ceiling.
     */
    readonly maxPlannedBytes?: number;
    /**
     * The byte budget of the CALL this read belongs to.
     *
     * An area read of three ground themes passes ONE budget to all three, so
     * the ceiling covers what the process holds at once rather than what one
     * theme holds. A read with no budget makes its own.
     */
    readonly budget?: PlannedBudget;
}
/** Row-group ranges whose bbox statistics can hold a feature in the AOI. */
export declare function planRowGroups(metadata: ParquetMetadata, bbox: Bbox): Array<[number, number]>;
/** The same selection, keeping each group's INDEX for the byte budget. */
export declare function selectRowGroups(metadata: ParquetMetadata, bbox: Bbox): SelectedGroup[];
/**
 * One byte per box (`1`: the box meets `bbox`), by the kernel's rule
 * (`ir-geodata` `bbox_meets`, D160): closed intervals, so a feature that
 * only TOUCHES the rectangle is kept, and a box with a missing member is in
 * every rectangle (fail-open). The Python host asks the same rule.
 *
 * The SINGLE HOME of tile membership on this host: the per-tile reader
 * applies it to the tile's own rectangle while decoding, and the area reader
 * applies it afterwards to each tile's rectangle, over the features it read
 * once. This function only packs the boxes; a missing member is packed as
 * NaN, never as a stand-in value.
 */
export declare function boxesMeet(boxes: ReadonlyArray<FeatureBox | undefined>, bbox: Bbox): Uint8Array;
/**
 * Read one Overture collection for a rectangle, as decoded rows.
 *
 * The rows come back in file, then row-group, then row order — the order a
 * strictly serial read produced, whatever the concurrency did.
 *
 * `map` runs while the row group is still the only decoded data in hand, so
 * a caller that keeps only text (the area reader) never holds the decoded
 * objects of the whole AOI as well.
 */
export declare function readOvertureRows<T>(collection: string, bbox: Bbox, options: ReadOvertureOptions, map: (row: OvertureRow) => T): Promise<{
    rows: T[];
    release: string;
}>;
