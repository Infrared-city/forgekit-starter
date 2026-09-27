import { GeodataDependencyError } from "./errors.js";
let parquetModule;
/** The decoder and its codecs, imported once per realm. */
export async function loadParquet() {
    if (parquetModule === undefined) {
        parquetModule = (async () => {
            let parquet;
            try {
                parquet = (await import(/* @vite-ignore */ "hyparquet"));
            }
            catch (error) {
                throw new GeodataDependencyError("hyparquet", error);
            }
            let compressors;
            try {
                // Overture files are zstd-compressed, which hyparquet delegates.
                const module = (await import(/* @vite-ignore */ "hyparquet-compressors"));
                compressors = module.compressors;
            }
            catch (error) {
                throw new GeodataDependencyError("hyparquet-compressors", error);
            }
            const geometry = await loadRawGeometry();
            return geometry === undefined ? { parquet, compressors } : { parquet, compressors, geometry };
        })().catch((error) => {
            parquetModule = undefined;
            throw error;
        });
    }
    return parquetModule;
}
async function loadRawGeometry() {
    try {
        const [convert, wkb] = (await Promise.all([
            import(/* @vite-ignore */ "hyparquet/src/convert.js"),
            import(/* @vite-ignore */ "hyparquet/src/wkb.js"),
        ]));
        const { DEFAULT_PARSERS: defaults } = convert;
        const { wkbToGeojson } = wkb;
        if (defaults === undefined || typeof wkbToGeojson !== "function")
            return undefined;
        const keep = (bytes) => bytes;
        return {
            // hyparquet takes the parser set as given, so it must be complete.
            parsers: { ...defaults, geometryFromBytes: keep, geographyFromBytes: keep },
            toGeojson: (bytes) => wkbToGeojson({ view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), offset: 0 }),
        };
    }
    catch {
        return undefined;
    }
}
/**
 * A parquet file window served by the range transport.
 *
 * The LENGTH is a parameter rather than a fetch: it belongs to the file, not
 * to the read, so a caller that already knows it (from the footer cache)
 * builds a buffer without touching the network at all (D47).
 */
export function asyncBufferOf(url, byteLength, transport) {
    return {
        byteLength,
        async slice(start, end) {
            const { bytes } = await transport.read(url, start, end);
            return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        },
    };
}
/**
 * The same file, but the slices asked in one synchronous turn resolve together.
 *
 * `hyparquet` asks for every column chunk of a row group at once, one range
 * each, and decodes a chunk as soon as its range arrives. The small chunks
 * arrive first, so each row group in flight held its decoded nested columns
 * (`sources`, `names`, `bbox`: the WHOLE group, not only the span) while it
 * waited for its large geometry chunk. With six row groups in flight per theme
 * that was most of the peak heap.
 *
 * Released together, the chunks of one row group decode and are filtered in
 * one run of microtasks (the zstd codec is synchronous), so no other row group
 * decodes between them. This is not a lock across groups: two groups whose last
 * ranges complete in the SAME event-loop task decode in the same run. Ranges
 * of two groups arrive on two requests, so that is rare, and the measured live
 * set of a 600 m ground read fell from 611 MB to 127 MB. The ranges, the
 * requests and their concurrency do not change: only the compressed bytes wait.
 */
export function oneTurnBuffer(file) {
    let pending;
    let gate = Promise.resolve();
    return {
        byteLength: file.byteLength,
        slice(start, end) {
            if (pending === undefined) {
                const batch = [];
                pending = batch;
                gate = new Promise((resolve) => queueMicrotask(resolve)).then(() => {
                    pending = undefined;
                    return Promise.all(batch);
                });
            }
            const read = file.slice(start, end);
            pending.push(read);
            return gate.then(() => read);
        },
    };
}
