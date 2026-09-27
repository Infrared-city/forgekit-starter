import { Gunzip, Unzip, UnzipInflate } from "fflate";
const DEFAULT_MAX_COMPRESSED_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_EXPANDED_BYTES = 512 * 1024 * 1024;
const INPUT_CHUNK_BYTES = 8 * 1024;
function limit(value, fallback, name) {
    const resolved = value === undefined ? fallback : value;
    if (!Number.isSafeInteger(resolved) || resolved <= 0) {
        throw new TypeError(`${name} must be a positive safe integer`);
    }
    return resolved;
}
function join(chunks, length) {
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}
function feed(content, push) {
    for (let offset = 0; offset < content.length; offset += INPUT_CHUNK_BYTES) {
        const end = Math.min(offset + INPUT_CHUNK_BYTES, content.length);
        push(content.subarray(offset, end), false);
    }
    push(new Uint8Array(), true);
}
function expandGzip(content, maximum) {
    const chunks = [];
    let length = 0;
    let complete = false;
    let lastMemberOffset = 0;
    const stream = new Gunzip((chunk, final) => {
        if (chunk.length > maximum - length) {
            throw new Error("result archive exceeds the expanded byte limit");
        }
        if (chunk.length > 0)
            chunks.push(chunk);
        length += chunk.length;
        complete ||= final;
    });
    stream.onmember = (offset) => {
        lastMemberOffset = offset;
        complete = false;
    };
    feed(content, (chunk, final) => stream.push(chunk, final));
    // A GZIP member needs its fixed header and eight-byte trailer even when its
    // DEFLATE payload is empty. fflate reports later member offsets but does not
    // validate the trailer in its streaming API.
    if (content.length - lastMemberOffset < 18) {
        throw new Error("result GZIP archive is truncated");
    }
    if (!complete)
        throw new Error("result GZIP archive is truncated");
    return join(chunks, length);
}
function expandZip(content, maximum) {
    const chunks = [];
    let length = 0;
    let selected = false;
    let complete = false;
    const stream = new Unzip((file) => {
        if (selected || file.name.endsWith("/"))
            return;
        selected = true;
        file.ondata = (error, chunk, final) => {
            if (error !== null)
                throw error;
            if (chunk.length > maximum - length) {
                throw new Error("result archive exceeds the expanded byte limit");
            }
            if (chunk.length > 0)
                chunks.push(chunk);
            length += chunk.length;
            complete ||= final;
        };
        file.start();
    });
    stream.register(UnzipInflate);
    feed(content, (chunk, final) => stream.push(chunk, final));
    if (!selected)
        throw new Error("result ZIP archive is empty");
    if (!complete)
        throw new Error("result ZIP archive is truncated");
    return join(chunks, length);
}
/**
 * Expand one server result archive with bounded retained output.
 * Raw JSON is not an archive contract.
 *
 * The limits bound the already-downloaded compressed bytes and the expanded
 * document. They do not bound the later JSON object graph. Joining bounded
 * output chunks also needs a temporary destination buffer.
 */
export function decompressResultArchive(content, options = {}) {
    const compressed = limit(options.maxCompressedBytes, DEFAULT_MAX_COMPRESSED_BYTES, "maxCompressedBytes");
    const expanded = limit(options.maxExpandedBytes, DEFAULT_MAX_EXPANDED_BYTES, "maxExpandedBytes");
    if (content.length > compressed) {
        throw new Error("result archive exceeds the compressed byte limit");
    }
    if (content[0] === 0x50 && content[1] === 0x4b) {
        return expandZip(content, expanded);
    }
    if (content[0] === 0x1f && content[1] === 0x8b) {
        return expandGzip(content, expanded);
    }
    throw new Error("result content is not a ZIP or GZIP archive");
}
