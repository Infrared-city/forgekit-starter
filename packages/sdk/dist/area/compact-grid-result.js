import { decodeCompactGridDocument, } from "../internal/binary-result.js";
import { requireCore } from "../internal/core.js";
const DECODE_LIMITS = {
    maxTotalBytes: 268_435_456,
    maxMetadataBytes: 4_194_304,
    maxCells: 16_777_216,
    maxTriangleValues: 67_108_864,
};
/** The JSON transport keeps full `f64` precision (unlike the strict-IRBF
 * route's `f32` wire), so the kernel hands this back as `f64` little-endian
 * bytes, not `GridDecode`'s `f32`. */
function numericValues(data) {
    // The kernel hands out a freshly allocated `Uint8Array` (byte offset 0),
    // but a defensive copy keeps this correct even if that ever changes.
    if (data.byteOffset % 8 === 0 && data.buffer instanceof ArrayBuffer) {
        return new Float64Array(data.buffer, data.byteOffset, data.byteLength / 8);
    }
    const copy = new Uint8Array(data.length);
    copy.set(data);
    return new Float64Array(copy.buffer, 0, copy.byteLength / 8);
}
/** `[rows, cols]` codes plus a validity bitmask from the §3.4c `0xFF`
 * missing sentinel — the same shape `decodeCompactGridDocument` already
 * produces for a strict-IRBF categorical tile. */
function categoricalCodes(ordinals) {
    const codes = Uint32Array.from(ordinals);
    const validity = new Uint8Array(Math.ceil(ordinals.length / 8));
    for (let cell = 0; cell < ordinals.length; cell += 1) {
        if (ordinals[cell] !== 0xff)
            validity[cell >> 3] = validity[cell >> 3] | (1 << (cell & 7));
    }
    return { codes, validity };
}
/** Adapt the kernel's flattened JSON grid onto the `CompactGridResult` shape
 * `compactGridTile` already knows how to finish — one downstream reader for
 * both the JSON and the strict-IRBF route. */
function fromJsonDecode(decoded) {
    const shape = decoded.shape, data = decoded.data;
    const rows = shape[0], cols = shape[1];
    if (decoded.kind === "categorical") {
        const { codes, validity } = categoricalCodes(data);
        return {
            route: "compact-grid", kind: "categorical", shape: [rows, cols],
            values: codes, validity, dictionary: decoded.legend ?? [],
        };
    }
    const values = numericValues(data);
    // §3.5: a non-finite lane IS the missing cell, so every position is
    // already valid — `compactGridTile`'s NaN-fill loop becomes a no-op.
    const validity = new Uint8Array(Math.ceil((rows * cols) / 8)).fill(0xff);
    // A JSON grid with no string cell defaults to "numeric" (`decode_json_grid_f64`
    // has no third domain to fall back to) — but an ALL-null tile carries no
    // evidence for that guess either, exactly `flattenJson`'s old ambiguity.
    const ambiguousEmpty = values.every((value) => !Number.isFinite(value));
    return {
        route: "compact-grid", kind: "numeric", shape: [rows, cols], values, validity,
        ...(ambiguousEmpty ? { ambiguousEmpty } : {}),
    };
}
/**
 * Decode an area grid tile in one kernel crossing: inflate the downloaded
 * archive, then either flatten a JSON grid or hand a strict IRBF document to
 * its existing decoder (D107). Replaces this host's own inflate +
 * `JSON.parse` + per-cell flatten for the JSON route (ADR 0006).
 *
 * Throws on a malformed archive — `merge.ts` already treats any exception
 * from this call as that tile's download failure, so there is no separate
 * fallback decoder to keep in sync with this one.
 */
export function areaGridResult(content) {
    const decoded = requireCore().decodeResultArchive(content);
    if (decoded.route === "irbf") {
        const compact = decodeCompactGridDocument(decoded.document, DECODE_LIMITS);
        if (compact === undefined)
            throw new TypeError("area grid result has a non-grid IRBF family");
        return compact;
    }
    return fromJsonDecode(decoded);
}
