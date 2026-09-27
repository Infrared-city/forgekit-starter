import { assertAllowedUrl } from "./allowed-hosts.js";
import { readFgbBboxJsonWithKernel } from "./fgb-kernel.js";
import { bytesRangeTransport, httpRangeTransport, } from "./range-transport.js";
/**
 * Read a FlatGeobuf object's features inside `bbox` as FeatureCollection
 * JSON text.
 *
 * `url` must be on the public data allow-list. The text carries the file's
 * raw properties — normalisation is the kernel's job, one call later.
 */
export async function readFgbBboxJson(url, bbox, options = {}) {
    const checked = assertAllowedUrl(url);
    const transport = options.transport ?? httpRangeTransport(options);
    return readFgbBboxJsonWithKernel(checked, bbox, transport);
}
/** The same read, parsed once for a caller that wants feature objects. */
export async function readFgbBbox(url, bbox, options = {}) {
    return features(await readFgbBboxJson(assertAllowedUrl(url), bbox, options));
}
/**
 * Decode FlatGeobuf bytes already in memory (fixtures, cached objects).
 *
 * This is the whole-object path: the bytes are the caller's, so the size cap
 * has already been decided by whoever produced them.
 */
export async function readFgbBytes(bytes, bbox) {
    const url = "https://geo.infrared.city/in-memory.fgb";
    return features(await readFgbBboxJsonWithKernel(url, bbox, bytesRangeTransport(bytes, url)));
}
function features(json) {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : (parsed.features ?? []);
}
export { clearFgbCache } from "./fgb-kernel.js";
