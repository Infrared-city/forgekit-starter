// Maintainer note (not published): the per-cell triangles of a single facade job (ADR 0008,
// D-2026101113-spruce-hazel-bison). The request asks the server for none (the kernel pins
// `emit-cell-tris` false); the kernel draws them from the capture of the body that was sent,
// with the join an area run uses (`surfaceJobTriangles`), so Python attaches the same bytes.
import { requireCore } from "../internal/core.js";
import { preparedJsonBytes } from "../internal/prepared-json.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
/** The result key that names why requested triangles were not drawn (as Python's). */
const FALLBACK_KEY = "cell-tris-fallback";
/** The capture of the body `request` sends, when the caller asked for triangles and it has facade targets. */
export function cellTrisCapture(request) {
    if (request.cellTris !== true)
        return undefined;
    return requireCore().surfaceJobCapture(preparedJsonBytes(request.prepared)) ?? undefined;
}
/**
 * Attaches the kernel's triangles of job `jobId` to its parsed surface result `value`, in the
 * typed form of a facade layout: on each surface, `cellTris` (9 floats per triangle, a view on
 * one shared buffer) and `cellTrisOffsets` (`cells + 1`: cell `c` owns
 * `cellTris[cellTrisOffsets[c]..cellTrisOffsets[c + 1]]`; a cell with no geometry owns none).
 * A refusal attaches nothing and names its reasons under `cell-tris-fallback`.
 */
export function attachCellTris(value, archive, jobId, capture, logger) {
    const surfaces = value?.surfaces;
    if (surfaces === undefined)
        return;
    const core = requireCore();
    const store = new core.CaptureStore();
    let out;
    try {
        store.remember(jobId, capture);
        const limits = RESULT_DECODE_LIMITS;
        out = core.surfaceJobTriangles(archive, store, jobId, BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues));
    }
    finally {
        store.free();
    }
    if (out.fallbackReasons.length > 0) {
        value[FALLBACK_KEY] = [...out.fallbackReasons];
        logger.warn({ event: "cell_tris", outcome: "fell_back", jobId, reasons: out.fallbackReasons });
        return;
    }
    const tri = out.triangleOffsets;
    if (tri.length === 0)
        return;
    out.ids.forEach((id, row) => {
        const [first, last] = [out.cellOffsets[row], out.cellOffsets[row + 1]];
        const base = tri[first] * 9;
        const offsets = new Uint32Array(last - first + 1);
        for (let cell = first; cell <= last; cell += 1)
            offsets[cell - first] = tri[cell] * 9 - base;
        const entry = surfaces[id];
        entry.cellTris = out.positions.subarray(base, tri[last] * 9);
        entry.cellTrisOffsets = offsets;
    });
}
