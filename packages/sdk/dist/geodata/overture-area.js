import { boxesMeet, readOvertureRows, } from "./overture-rows.js";
/** The smallest rectangle holding every tile rectangle. */
export function unionBbox(boxes) {
    const first = boxes[0];
    if (first === undefined)
        throw new TypeError("an area needs at least one tile rectangle");
    let { west, south, east, north } = first;
    for (const box of boxes) {
        west = Math.min(west, box.west);
        south = Math.min(south, box.south);
        east = Math.max(east, box.east);
        north = Math.max(north, box.north);
    }
    return { west, south, east, north };
}
/**
 * Read one Overture collection for a whole AOI, keeping each feature's bbox.
 *
 * The union rectangle is a superset of every tile rectangle, so the rows it
 * returns are a superset of every tile's rows; {@link tileFeaturesJson}
 * takes each tile's share back out. Reading the hull therefore costs the
 * rows between the tiles, never a second pass over a row group.
 */
export async function readOvertureArea(collection, bbox, options = {}) {
    const { rows, release } = await readOvertureRows(collection, bbox, options, (row) => row.box === undefined
        ? { json: JSON.stringify(row.feature) }
        : { json: JSON.stringify(row.feature), box: row.box });
    return { features: rows, release };
}
/**
 * One tile's features as JSON array text, in AOI read order.
 *
 * The order is the AOI's, and the AOI's is file-then-row-group-then-row
 * order over a file list that CONTAINS the tile's own list (a file holding a
 * feature that meets the tile also meets the AOI hull). A tile's slice of
 * that sequence is therefore the sequence its own read produced.
 */
export function tileFeaturesJson(features, bbox) {
    const parts = [];
    const meets = boxesMeet(features.map((feature) => feature.box), bbox);
    for (const [index, feature] of features.entries()) {
        if (meets[index] === 1)
            parts.push(feature.json);
    }
    return `[${parts.join(",")}]`;
}
