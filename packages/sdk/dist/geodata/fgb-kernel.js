import { GeodataError, GeodataRangeError } from "./errors.js";
import { requireCore } from "../internal/core.js";
/**
 * Kernel-backed FlatGeobuf reading: the host does `fetch` with `Range`
 * headers and nothing else.
 *
 * The reader is the sans-I/O mirror of `PackedRTree::http_stream_search`,
 * because the whole packed index of the world files is 1.4-1.7 GB and must
 * never be downloaded:
 *
 * 1. read a small prefix and ask the kernel for the file's layout
 *    (`fgbLayout`), which also says how many bytes the full header needs;
 * 2. loop: hand the kernel the header, the AOI, the file size and every
 *    index node fetched so far (`fgbIndexSearchStep`); it answers with the
 *    node ranges it still needs (`need`) or, once it has descended the tree,
 *    the feature ranges (`features`);
 * 3. fetch those feature ranges in order and decode them
 *    (`fgbDecodeRangeFeatures`).
 *
 * Every kernel call is pure and stateless, so the host can await between
 * steps — which is what makes this work in a browser, where `fetch` cannot
 * be blocked on.
 *
 * Consistency: the first answer's entity tag is sent as `If-Match` on every
 * follow-up range, so a quarterly file replacement mid-read fails typed
 * instead of decoding two halves of two different files. The header and the
 * top index levels are cached per realm, keyed by `(url, ETag)`.
 *
 * The export names live in one constant so a rename is a one-line change.
 */
/** The kernel exports this backend needs, in call order. */
export const KERNEL_FGB_EXPORTS = Object.freeze({
    layout: "fgbLayout",
    indexSearchStep: "fgbIndexSearchStep",
    decodeRangeFeatures: "fgbDecodeRangeFeatures",
});
/** First read: enough for the header of any FlatGeobuf we publish. */
export const HEADER_PREFIX_BYTES = 8_192;
/** Guard on a kernel-reported header size (the header is not the index). */
const MAX_HEADER_BYTES = 16 * 1024 * 1024;
/** Guard against a loop that never converges on a malformed index. */
const MAX_SEARCH_STEPS = 32;
/**
 * Caps on what the kernel may ask the host to fetch.
 *
 * The host trusts the kernel's plan, and the objects behind it are 5.4 GB
 * and 14.4 GB, so "the kernel would not do that" is not a bound. A single
 * planned range and the sum of one read's ranges are both capped, and a
 * breach is a typed error rather than an allocation.
 */
export const MAX_PLANNED_RANGE_BYTES = 64 * 1024 * 1024;
export const MAX_PLANNED_TOTAL_BYTES = 256 * 1024 * 1024;
const objectCache = new Map();
/** Drop the cached FlatGeobuf headers and index levels in this realm. */
export function clearFgbCache() {
    objectCache.clear();
}
function cacheKey(url, etag) {
    return `${url} ${etag ?? ""}`;
}
function concat(chunks) {
    const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return out;
}
/** A running total, so one read's ranges are bounded as well as each range. */
class RangeBudget {
    url;
    spent = 0;
    constructor(url) {
        this.url = url;
    }
    take(length) {
        if (length > MAX_PLANNED_RANGE_BYTES) {
            throw new GeodataRangeError(this.url, `the kernel planned a ${length}-byte range, over the ` +
                `${MAX_PLANNED_RANGE_BYTES}-byte per-range cap`);
        }
        this.spent += length;
        if (this.spent > MAX_PLANNED_TOTAL_BYTES) {
            throw new GeodataRangeError(this.url, `the kernel planned ${this.spent} bytes for one read, over the ` +
                `${MAX_PLANNED_TOTAL_BYTES}-byte total cap`);
        }
    }
}
function checkedRange(url, range, fileSize, budget) {
    const start = Number(range[0]);
    const length = Number(range[1]);
    if (!Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length <= 0) {
        throw new GeodataError(`${url}: the kernel planned an unusable range [${String(range[0])}, ${String(range[1])}]`);
    }
    // The byte caps come BEFORE the bounds check: they are the memory guard,
    // and an over-cap range must report the cap it broke, not merely that it
    // ran past the end of the file.
    budget.take(length);
    if (start + length > fileSize) {
        throw new GeodataError(`${url}: the kernel planned a range past the end of the file ` +
            `([${start}, ${length}] of ${fileSize} bytes)`);
    }
    return [start, length];
}
/** Read the header and file size, from the realm cache when possible. */
async function openObject(url, transport, layout) {
    const first = await transport.read(url, 0, HEADER_PREFIX_BYTES);
    const key = cacheKey(url, first.etag);
    const cached = objectCache.get(key);
    if (cached !== undefined)
        return cached;
    const fileSize = first.totalSize ?? (await transport.byteLength(url));
    const shape = layout(first.bytes);
    const required = Number(shape.required_prefix_len ?? shape.header_len);
    if (!Number.isInteger(required) || required <= 0 || required > MAX_HEADER_BYTES) {
        throw new GeodataError(`${url}: the kernel reported an unusable header size ${required}`);
    }
    const header = required <= first.bytes.byteLength
        ? first.bytes.subarray(0, required)
        : (await transport.read(url, 0, required, {
            ...(first.etag === undefined ? {} : { ifMatch: first.etag }),
        })).bytes;
    const entry = { etag: first.etag, fileSize, header, topNodes: [] };
    objectCache.set(key, entry);
    return entry;
}
/**
 * Read one FlatGeobuf object inside `bbox` via the kernel, as JSON text.
 *
 * The kernel's answer is handed on unparsed: the next kernel call in the
 * chain takes the same string (bulk-data rule 1). Buffers: each range read
 * is a fresh `Uint8Array` owned by this call; the header and the top index
 * levels are owned by the realm cache and only borrowed here; nothing else
 * outlives the read.
 */
export async function readFgbBboxJsonWithKernel(url, bbox, transport) {
    const core = requireCore();
    return readWithFunctions(core[KERNEL_FGB_EXPORTS.layout], core[KERNEL_FGB_EXPORTS.indexSearchStep], core[KERNEL_FGB_EXPORTS.decodeRangeFeatures], url, bbox, transport);
}
/**
 * The same read against a caller-supplied set of kernel functions.
 *
 * The core module namespace cannot be patched, so this is the host's own
 * seam for a test to supply a fake `layout` / `indexSearchStep` /
 * `decodeRangeFeatures` set and exercise the range budget, the header-size
 * check and the convergence limit without a built core that has the reader.
 * Exported for that one caller (`tests/geodata/fgb-kernel.wasm.test.ts`); the
 * per-core-object adapter lives in the test itself.
 */
export async function readWithFunctions(layout, searchStep, decodeRangeFeatures, url, bbox, transport) {
    const cache = await openObject(url, transport, layout);
    // `If-Match` is omitted when the host sent no entity tag: R2 and S3 both
    // send one, so this is the degraded case, and a read without it can only
    // be as consistent as the host makes it.
    const ifMatch = cache.etag === undefined ? {} : { ifMatch: cache.etag };
    const budget = new RangeBudget(url);
    // The cached root levels are every AOI's first descent, so a second read
    // of the same object starts one round trip further down.
    const fetchedNodes = [...cache.topNodes];
    let step;
    for (let attempt = 0; attempt < MAX_SEARCH_STEPS; attempt += 1) {
        step = searchStep(cache.header, bbox.west, bbox.south, bbox.east, bbox.north, cache.fileSize, fetchedNodes);
        if (step.need.length === 0)
            break;
        for (const range of step.need) {
            const [start, length] = checkedRange(url, range, cache.fileSize, budget);
            const answer = await transport.read(url, start, start + length, ifMatch);
            fetchedNodes.push({ offset: start, bytes: answer.bytes });
        }
        if (attempt === 0 && cache.topNodes.length === 0) {
            // The first descent is the root levels: keep them for the next AOI.
            cache.topNodes = [...fetchedNodes];
        }
    }
    if (step === undefined || step.need.length > 0) {
        throw new GeodataError(`${url}: the index search did not converge`);
    }
    if (step.features.length === 0)
        return '{"type":"FeatureCollection","features":[]}';
    const chunks = [];
    for (const range of step.features) {
        const [start, length] = checkedRange(url, range, cache.fileSize, budget);
        chunks.push((await transport.read(url, start, start + length, ifMatch)).bytes);
    }
    return decodeRangeFeatures(cache.header, concat(chunks), bbox.west, bbox.south, bbox.east, bbox.north);
}
