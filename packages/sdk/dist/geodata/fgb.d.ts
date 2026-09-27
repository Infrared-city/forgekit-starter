import { type Bbox, type PublicRequestOptions } from "./http.js";
import { type RangeTransport } from "./range-transport.js";
/**
 * The single seam every FlatGeobuf read goes through.
 *
 * ONE backend sits behind it: the host does only `fetch` with `Range`
 * headers and the kernel plans and decodes, so the reading logic is shared
 * by every SDK. The `flatgeobuf` npm package was a second, fallback backend
 * until the kernel two-phase reader shipped in both bindings; it is gone,
 * with its optional dependency.
 *
 * The JSON-text form is the primary one: a read that feeds another kernel
 * call hands the text straight on (bulk-data rule 1). `readFgbBbox` is the
 * convenience wrapper that parses it once, for a caller that wants objects.
 */
export interface ReadFgbOptions extends PublicRequestOptions {
    /**
     * Byte reader; defaults to HTTP ranges. Tests serve bytes from memory.
     *
     * Pass ONE instance for a whole area: it carries the object-size cache,
     * and a fresh one per tile re-learns every object's size.
     */
    readonly transport?: RangeTransport;
}
/**
 * Read a FlatGeobuf object's features inside `bbox` as FeatureCollection
 * JSON text.
 *
 * `url` must be on the public data allow-list. The text carries the file's
 * raw properties — normalisation is the kernel's job, one call later.
 */
export declare function readFgbBboxJson(url: string, bbox: Bbox, options?: ReadFgbOptions): Promise<string>;
/** The same read, parsed once for a caller that wants feature objects. */
export declare function readFgbBbox(url: string, bbox: Bbox, options?: ReadFgbOptions): Promise<Array<Record<string, unknown>>>;
/**
 * Decode FlatGeobuf bytes already in memory (fixtures, cached objects).
 *
 * This is the whole-object path: the bytes are the caller's, so the size cap
 * has already been decided by whoever produced them.
 */
export declare function readFgbBytes(bytes: Uint8Array, bbox: Bbox): Promise<Array<Record<string, unknown>>>;
export { clearFgbCache } from "./fgb-kernel.js";
