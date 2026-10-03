/**
 * One downloaded surface result, decoded by the kernel as it arrives.
 *
 * `decodeSurfaceArchive` inflates the archive, selects the route, parses,
 * validates and flattens a JSON or strict IRBF surface result in one call and
 * keeps it in WebAssembly memory as a handle. The merge hands every handle
 * to `joinSurfaceJobs` (D197), which consumes it; this host reads nothing out
 * of it.
 */
import { requireCore } from "../internal/core.js";
import { RESULT_DECODE_LIMITS } from "../results/router.js";
/**
 * Decode one archive, or `undefined` when it holds a valid result that is
 * not a surface result (a grid, other JSON, another IRBF family).
 */
export function decodeSurfaceHandle(content) {
    const limits = RESULT_DECODE_LIMITS;
    const archive = requireCore().decodeSurfaceArchive(content, BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues));
    if (archive.route !== "surface") {
        archive.free();
        return undefined;
    }
    return archive;
}
/**
 * The threaded core (D205): decode archives `indices` in ONE kernel call, so
 * the kernel decodes them on its pool. `decoded[i]` takes the handle of
 * `contents[i]`, whose bytes are dropped (the caller frees what the join
 * does not take). The routes are checked later, by `checkSurfaceBatch`.
 */
export function decodeSurfaceChunk(indices, contents, decoded) {
    if (indices.length === 0)
        return;
    const limits = RESULT_DECODE_LIMITS;
    const handles = requireCore().decodeSurfaceArchives(indices.map((index) => contents[index]), BigInt(limits.maxTotalBytes), limits.maxMetadataBytes, BigInt(limits.maxCells), BigInt(limits.maxTriangleValues));
    indices.forEach((index, at) => {
        contents[index] = undefined;
        decoded[index] = handles[at];
    });
}
/**
 * An archive the kernel refused, or one that is not a surface result,
 * throws the same error the per-download decode gives, naming its entry.
 */
export function checkSurfaceBatch(entryIds, decoded) {
    const refused = decoded.findIndex((handle) => handle?.route !== "surface");
    if (refused === -1)
        return;
    const handle = decoded[refused];
    const entryId = entryIds[refused];
    throw new Error(`Cannot merge surface results: download failed for ${entryId}`, {
        cause: new Error(handle.route === "error" ? handle.error : `surface entry ${entryId} returned a non-surface result`),
    });
}
