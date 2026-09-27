/**
 * The retained facade layout: the kernel's triangle buffers and its compact
 * frames, and the views one frame's surface draws from them. Split out of
 * `facade-synthesis.ts` for the 400-line cap.
 */
const MAX_WORD = 0xffff_ffff;
/** Typed arrays use the platform's byte order; the kernel writes little-endian. */
const LITTLE_ENDIAN = new Uint8Array(Uint32Array.of(1).buffer)[0] === 1;
/**
 * The kernel's compact frames (`compactCells`): one u64 LE word for each
 * cell, so the kernel makes no JS value for each cell (Python reads the same
 * form). On a little-endian host the words are a view of the kernel's bytes,
 * not a copy. A cell index is a `u32` (the kernel counts sensors in `u32`),
 * so a word whose high half is neither 0 nor the missing marker is refused.
 */
export function frames(raw) {
    if (!Array.isArray(raw))
        throw new TypeError("kernel frames must be an array");
    return raw.map((frame) => {
        const bytes = frame.cells_u64_le;
        if (!(bytes instanceof Uint8Array) || bytes.byteLength % 8 !== 0) {
            throw new TypeError("kernel frame cells must be u64 LE bytes");
        }
        let words;
        if (LITTLE_ENDIAN && bytes.byteOffset % 4 === 0) {
            words = new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
        }
        else {
            const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            words = new Uint32Array(bytes.byteLength / 4);
            for (let index = 0; index < words.length; index += 1)
                words[index] = view.getUint32(index * 4, true);
        }
        for (let index = 0; index < words.length; index += 2) {
            const high = words[index + 1];
            if (high !== 0 && (high !== MAX_WORD || words[index] !== MAX_WORD)) {
                throw new RangeError("kernel frame cell index exceeds u32");
            }
        }
        return { key: frame.key, words };
    });
}
/**
 * Cut one frame's triangles out of the layout as VIEWS, never copies.
 *
 * A frame's sensors are one contiguous ascending index range
 * (`ir-geo/src/surfgrid/build.rs:106-119`), so its cells` triangle spans are
 * one contiguous slice of `cell_tris`. The running cursor CHECKS that rather
 * than assuming it: a layout that does not hold the property attaches nothing.
 */
export function frameViews(record, frame, anchor) {
    const { words } = frame;
    const count = words.length / 2;
    let first;
    for (let index = 0; index < count && first === undefined; index += 1) {
        if (words[index * 2 + 1] === 0)
            first = words[index * 2];
    }
    if (first === undefined) {
        return { triangleValues: new Float32Array(), triangleOffsets: new Uint32Array(count + 1),
            triangleMask: new Uint8Array(count), hasCellTris: true, triangleAnchor: anchor };
    }
    const base = record.offsets[first];
    const offsets = new Uint32Array(count + 1);
    const mask = new Uint8Array(count);
    let cursor = 0;
    let last = first;
    for (let index = 0; index < count; index += 1) {
        if (words[index * 2 + 1] === 0) {
            const sensor = words[index * 2];
            if (record.offsets[sensor] - base !== cursor)
                return undefined;
            cursor = record.offsets[sensor + 1] - base;
            mask[index] = 1;
            last = sensor;
        }
        offsets[index + 1] = cursor;
    }
    return {
        triangleValues: record.cellTris.subarray(base, record.offsets[last + 1]),
        triangleOffsets: offsets, triangleMask: mask,
        hasCellTris: true, triangleAnchor: anchor,
    };
}
/** A layout record from one kernel answer (`compactCells`), or the reason it is refused. */
export function layoutRecord(buffers, serverHash) {
    const cellTris = buffers.cell_tris, offsets = buffers.cell_tris_offsets;
    if (cellTris === null || offsets === null) {
        return { reason: "synth_error", detail: String(new TypeError("kernel returned no cell triangles")).slice(0, 200) };
    }
    if (buffers.sensor_layout_hash !== serverHash)
        return { reason: "hash_mismatch" };
    let list;
    try {
        list = frames(buffers.frames);
    }
    catch (error) {
        return { reason: "synth_error", detail: String(error).slice(0, 200) };
    }
    // The frames are retained too, and a city frame set is millions of cells.
    // Counting only the triangle arrays would let a record over the bound in
    // and make the bound a claim rather than a limit.
    const frameBytes = list.reduce((sum, frame) => sum + frame.words.byteLength, 0);
    return { cellTris, offsets, frames: list, bytes: cellTris.byteLength + offsets.byteLength + frameBytes };
}
