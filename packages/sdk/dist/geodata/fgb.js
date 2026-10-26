import { assertAllowedUrl } from "./allowed-hosts.js";
import { readFgbBboxJsonWithKernel } from "./fgb-kernel.js";
import { bytesRangeTransport, httpRangeTransport, } from "./range-transport.js";
/**
 * Read a FlatGeobuf object's features inside `bbox` as GeoJSON
 * FeatureCollection text.
 *
 * The text carries the file's raw properties, unparsed and not normalised.
 * Use {@link readFgbBbox} for parsed feature objects.
 *
 * @param url - The FlatGeobuf object URL; it must be on the public data allow-list.
 * @param bbox - The area to read, in WGS84 degrees.
 * @param options - Request and transport options.
 * @returns The features as FeatureCollection text.
 * @throws {HostNotAllowedError} when `url` is not on the public data allow-list.
 * @throws {GeodataRangeError} when the object changes mid-read or a range
 *   limit is exceeded.
 * @category Geodata
 */
export async function readFgbBboxJson(url, bbox, options = {}) {
    const checked = assertAllowedUrl(url);
    const transport = options.transport ?? httpRangeTransport(options);
    return readFgbBboxJsonWithKernel(checked, bbox, transport);
}
/**
 * Read a FlatGeobuf object's features inside `bbox`, parsed into objects.
 *
 * The same read as {@link readFgbBboxJson}, parsed once.
 *
 * @param url - The FlatGeobuf object URL; it must be on the public data allow-list.
 * @param bbox - The area to read, in WGS84 degrees.
 * @param options - Request and transport options.
 * @returns The feature objects with their raw properties.
 * @throws {HostNotAllowedError} when `url` is not on the public data allow-list.
 * @throws {GeodataRangeError} when the object changes mid-read or a range
 *   limit is exceeded.
 * @category Geodata
 */
export async function readFgbBbox(url, bbox, options = {}) {
    return features(await readFgbBboxJson(assertAllowedUrl(url), bbox, options));
}
/**
 * Decode FlatGeobuf bytes already in memory, such as fixtures or cached
 * objects, and return the features inside `bbox`.
 *
 * The bytes are the caller's own, so no size cap is applied.
 *
 * @param bytes - The complete FlatGeobuf file.
 * @param bbox - The area to read, in WGS84 degrees.
 * @returns The feature objects with their raw properties.
 * @category Geodata
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
