/**
 * The rows of one Overture row group that can meet the read box.
 *
 * A row group holds 10-20 thousand features and spans far more ground than a
 * site, and decoding it turns every geometry into a JavaScript object. A
 * 600 m Vienna read decoded about 174 000 rows to keep about 1 000: 1.7 GB of
 * heap in Node, 2.19 GB in a browser worker. Overture files carry no page
 * index, so the parquet reader cannot skip pages by itself.
 *
 * This reads ONLY the small `bbox` column of the group first and returns the
 * one row span, first meeting row to last meeting row, that the full read
 * must decode. Overture sorts each file spatially, so the meeting rows are
 * close together. The reader skips the geometry pages before the span without
 * decompressing them, and stops after it. The full read keeps its per-row
 * check (`keepRows`), so the answer does not change: only rows that cannot
 * meet the box are no longer decoded.
 */
import type { Bbox } from "./http.js";
import type { AsyncBuffer, ParquetModule } from "./overture-parquet.js";
/** One feature box as the `bbox` column holds it. */
type Box = {
    xmin?: number;
    xmax?: number;
    ymin?: number;
    ymax?: number;
} | undefined;
/** The absolute rows `[start, end)` to decode, and the box of each of them. */
export interface MeetingSpan {
    readonly start: number;
    readonly end: number;
    /**
     * `boxes[i]` is the `bbox` value of row `start + i`. The full read uses
     * these and does not decode the `bbox` column a second time: a nested
     * column is decoded for the WHOLE row group, whatever the span.
     */
    readonly boxes: readonly Box[];
}
/** The span of the rows that can meet `bbox`, or `undefined` for none. */
export declare function meetingSpan(parquet: ParquetModule, file: AsyncBuffer, compressors: unknown, group: {
    readonly start: number;
    readonly end: number;
}, bbox: Bbox, meet: (boxes: readonly Box[], bbox: Bbox) => Uint8Array): Promise<MeetingSpan | undefined>;
export {};
