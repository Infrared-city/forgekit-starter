import { GeodataError, OvertureFileLimitError } from "./errors.js";
import { cachedOvertureMetadata } from "./overture-cache.js";
import { OVERTURE_HOST_CONCURRENCY, plannedBudget, plannedBytes, withHostSlot, } from "./overture-budget.js";
import { asyncBufferOf, loadParquet, oneTurnBuffer, } from "./overture-parquet.js";
import { meetingSpan } from "./overture-span.js";
import { keepRows } from "./overture-keep.js";
import { httpRangeTransport } from "./range-transport.js";
import { selectOvertureFiles } from "./manifests.js";
import { mapLimit } from "../internal/map-limit.js";
import { requireCore } from "../internal/core.js";
/**
 * The parquet half of the Overture reader: files in, decoded rows out.
 *
 * Split out of `overture.ts` so the per-tile read and the area-level read
 * (WP12 / D47) share ONE decoder. Everything that decides which bytes are
 * fetched lives here — file selection, row-group pruning, the exact row
 * filter — so the two readers cannot drift apart in what they return.
 *
 * `hyparquet` is used rather than the kernel because the Rust parquet stack
 * needs C zstd, which does not build for wasm32. The long-term fix is
 * publishing these layers as FlatGeobuf on `geo.infrared.city`, after which
 * this module and its dependency go away (D39).
 */
const BASE_COLUMNS = ["id", "geometry", "bbox", "names", "sources", "class", "subtype"];
export { isGeneralizedLandCover, LAND_COVER_MIN_MAX_ZOOM } from "./overture-keep.js";
/** Column projection per collection; the Python reader's `COLUMNS_BY_TYPE`. */
export const COLUMNS_BY_COLLECTION = Object.freeze({
    building: [
        ...BASE_COLUMNS,
        "height",
        "num_floors",
        "has_parts",
        "facade_material",
        "facade_color",
        "roof_shape",
        "roof_material",
        "roof_color",
    ],
    water: [...BASE_COLUMNS, "is_salt", "is_intermittent"],
    land_use: BASE_COLUMNS,
    land_cover: ["id", "geometry", "bbox", "sources", "subtype", "cartography"],
});
/**
 * Row groups decoded at once, across every file of one collection.
 *
 * A row-group read is a `Range` fetch and a decode; running a few together
 * hides the round trips without holding many megabytes of decoded rows. The
 * ORDER of the answer is unaffected: results are collected by index and
 * flattened in file-then-row-group order, exactly as a serial read produced.
 */
const OVERTURE_ROW_GROUP_CONCURRENCY = OVERTURE_HOST_CONCURRENCY > 6 ? 6 : 3;
/** Files whose footer is read at once. */
const OVERTURE_FILE_CONCURRENCY = 4;
function statisticsFor(group) {
    const out = {};
    for (const column of group.columns) {
        const path = column.meta_data?.path_in_schema.join(".");
        const statistics = column.meta_data?.statistics;
        if (path !== undefined && statistics !== undefined)
            out[path] = statistics;
    }
    return out;
}
/** Row-group ranges whose bbox statistics can hold a feature in the AOI. */
export function planRowGroups(metadata, bbox) {
    return selectRowGroups(metadata, bbox).map((group) => [group.start, group.end]);
}
/** The same selection, keeping each group's INDEX for the byte budget. */
export function selectRowGroups(metadata, bbox) {
    // Each group's bbox statistics as one feature box: the smallest xmin and
    // ymin, the largest xmax and ymax. No statistics means "cannot rule it
    // out" — read it, never skip blind — which the kernel rule answers for a
    // missing member.
    const boxes = metadata.row_groups.map((group) => {
        const statistics = statisticsFor(group);
        const box = {};
        const xmin = numeric(statistics["bbox.xmin"]?.min_value);
        const ymin = numeric(statistics["bbox.ymin"]?.min_value);
        const xmax = numeric(statistics["bbox.xmax"]?.max_value);
        const ymax = numeric(statistics["bbox.ymax"]?.max_value);
        if (xmin !== undefined)
            box.xmin = xmin;
        if (ymin !== undefined)
            box.ymin = ymin;
        if (xmax !== undefined)
            box.xmax = xmax;
        if (ymax !== undefined)
            box.ymax = ymax;
        return box;
    });
    const meets = boxesMeet(boxes, bbox);
    const kept = [];
    let start = 0;
    for (const [index, group] of metadata.row_groups.entries()) {
        const rows = Number(group.num_rows);
        if (meets[index] === 1 && rows > 0)
            kept.push({ index, start, end: start + rows });
        start += rows;
    }
    return kept;
}
function numeric(value) {
    if (typeof value === "number")
        return value;
    if (typeof value === "bigint")
        return Number(value);
    return undefined;
}
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
export function boxesMeet(boxes, bbox) {
    const rows = new Float64Array(boxes.length * 4);
    for (const [index, box] of boxes.entries()) {
        rows[index * 4] = member(box?.xmin);
        rows[index * 4 + 1] = member(box?.ymin);
        rows[index * 4 + 2] = member(box?.xmax);
        rows[index * 4 + 3] = member(box?.ymax);
    }
    return requireCore().bboxMeetsRows(rows, bbox.west, bbox.south, bbox.east, bbox.north);
}
function member(value) {
    return typeof value === "number" ? value : Number.NaN;
}
/** File selection, with the candidate buffer applied to files only. */
async function selectFiles(collection, bbox, options) {
    const buffer = options.candidateBufferDeg ?? 0;
    const fileBbox = buffer === 0
        ? bbox
        : {
            west: bbox.west - buffer,
            south: bbox.south - buffer,
            east: bbox.east + buffer,
            north: bbox.north + buffer,
        };
    const { urls, release } = await selectOvertureFiles(collection, fileBbox, options);
    // Reading the first N of a larger set drops features from EVERY tile of an
    // area, so the cap refuses instead of truncating in silence (D47).
    if (options.maxFiles !== undefined && urls.length > options.maxFiles) {
        throw new OvertureFileLimitError(collection, urls.length, options.maxFiles);
    }
    return { urls, release };
}
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
export async function readOvertureRows(collection, bbox, options, map) {
    const columns = COLUMNS_BY_COLLECTION[collection];
    if (columns === undefined) {
        throw new GeodataError(`${collection} has no published Overture file index`);
    }
    const { urls, release } = await selectFiles(collection, bbox, options);
    if (urls.length === 0)
        return { rows: [], release };
    const { parquet, compressors, geometry: raw } = await loadParquet();
    const transport = options.transport ?? httpRangeTransport(options);
    // The footer and the object size describe the FILE, not the query, and a
    // per-release file is immutable: read them once per realm (D47).
    const plans = await mapLimit(urls, OVERTURE_FILE_CONCURRENCY, async (url) => {
        const described = await cachedOvertureMetadata(release, url, async () => {
            const byteLength = await transport.byteLength(url);
            const metadata = await parquet.parquetMetadataAsync(asyncBufferOf(url, byteLength, transport));
            return { byteLength, metadata };
        });
        const available = new Set(described.metadata.schema.map((element) => element.name));
        const projected = columns.filter((name) => available.has(name));
        const groups = selectRowGroups(described.metadata, bbox);
        return {
            file: asyncBufferOf(url, described.byteLength, transport),
            columns: projected,
            groups,
            bytes: plannedBytes(described.metadata, groups, projected),
        };
    });
    // The footers say what the read would cost before a single row group is
    // fetched, so an area too large to decode fails here, once, with the
    // numbers and the rectangle in the message (D47).
    const tasks = plans.flatMap((plan) => plan.groups.map((group) => ({ plan, group })));
    const budget = options.budget ?? plannedBudget(options.maxPlannedBytes);
    budget.add(collection, bbox, plans.reduce((sum, plan) => sum + plan.bytes, 0), plans.length, tasks.length);
    const decoded = await mapLimit(tasks, OVERTURE_ROW_GROUP_CONCURRENCY, ({ plan, group }) => 
    // The per-host slot is shared by every type read in this wave, so three
    // concurrent themes cannot together exceed a browser's six connections.
    withHostSlot(async () => {
        // Decode only the rows that can meet the box (`overture-span.ts`), and
        // take their boxes from that first read.
        const span = plan.columns.includes("bbox")
            ? await meetingSpan(parquet, plan.file, compressors, group, bbox, boxesMeet)
            : { start: group.start, end: group.end, boxes: undefined };
        if (span === undefined)
            return [];
        const columns = span.boxes === undefined
            ? plan.columns
            : plan.columns.filter((name) => name !== "bbox");
        const rows = await parquet.parquetReadObjects({
            file: oneTurnBuffer(plan.file), compressors, rowStart: span.start, rowEnd: span.end,
            ...(raw === undefined ? {} : { parsers: raw.parsers }),
            ...(columns.length === 0 ? {} : { columns }),
        });
        if (span.boxes !== undefined && rows.length !== span.boxes.length) {
            throw new GeodataError(`${collection}: the span read gave ${span.boxes.length} ` +
                `boxes for ${rows.length} rows`);
        }
        const boxes = span.boxes ?? rows.map((row) => row["bbox"]);
        return keepRows(rows, boxes, boxesMeet(boxes, bbox), collection, raw, map);
    }));
    return { rows: decoded.flat(), release };
}
