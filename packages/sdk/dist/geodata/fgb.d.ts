import { type Bbox, type PublicRequestOptions } from "./http.js";
import { type RangeTransport } from "./range-transport.js";
/**
 * Options for reading FlatGeobuf data.
 *
 * Extends the public-request options (timeout, abort signal, fetch
 * implementation).
 *
 * @category Geodata
 */
export interface ReadFgbOptions extends PublicRequestOptions {
    /**
     * Byte reader; defaults to HTTP range requests. Tests can serve bytes from
     * memory.
     *
     * Pass one instance for a whole area: it carries the object-size cache, and
     * a fresh one per tile re-learns every object's size.
     */
    readonly transport?: RangeTransport;
}
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
export declare function readFgbBboxJson(url: string, bbox: Bbox, options?: ReadFgbOptions): Promise<string>;
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
export declare function readFgbBbox(url: string, bbox: Bbox, options?: ReadFgbOptions): Promise<Array<Record<string, unknown>>>;
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
export declare function readFgbBytes(bytes: Uint8Array, bbox: Bbox): Promise<Array<Record<string, unknown>>>;
export { clearFgbCache } from "./fgb-kernel.js";
