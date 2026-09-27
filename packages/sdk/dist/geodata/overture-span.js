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
/** The span of the rows that can meet `bbox`, or `undefined` for none. */
export async function meetingSpan(parquet, file, compressors, group, bbox, meet) {
    const rows = await parquet.parquetReadObjects({
        file,
        compressors,
        rowStart: group.start,
        rowEnd: group.end,
        columns: ["bbox"],
    });
    const boxes = rows.map((row) => row["bbox"]);
    const meets = meet(boxes, bbox);
    const first = meets.indexOf(1);
    if (first < 0)
        return undefined;
    const last = meets.lastIndexOf(1);
    return {
        start: group.start + first,
        end: group.start + last + 1,
        boxes: boxes.slice(first, last + 1),
    };
}
