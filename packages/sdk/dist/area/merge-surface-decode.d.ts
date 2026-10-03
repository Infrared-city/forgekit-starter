/**
 * One downloaded surface result, decoded by the kernel as it arrives.
 *
 * `decodeSurfaceArchive` inflates the archive, selects the route, parses,
 * validates and flattens a JSON or strict IRBF surface result in one call and
 * keeps it in WebAssembly memory as a handle. The merge hands every handle
 * to `joinSurfaceJobs` (D197), which consumes it; this host reads nothing out
 * of it.
 */
import { type WasmCore } from "../internal/core.js";
/** The kernel's decode handle (`wasm/src/surface_archive.rs`). */
export type SurfaceArchiveHandle = ReturnType<WasmCore["decodeSurfaceArchive"]>;
/**
 * Decode one archive, or `undefined` when it holds a valid result that is
 * not a surface result (a grid, other JSON, another IRBF family).
 */
export declare function decodeSurfaceHandle(content: Uint8Array): SurfaceArchiveHandle | undefined;
/**
 * The threaded core (D205): decode archives `indices` in ONE kernel call, so
 * the kernel decodes them on its pool. `decoded[i]` takes the handle of
 * `contents[i]`, whose bytes are dropped (the caller frees what the join
 * does not take). The routes are checked later, by `checkSurfaceBatch`.
 */
export declare function decodeSurfaceChunk(indices: readonly number[], contents: Array<Uint8Array | undefined>, decoded: Array<SurfaceArchiveHandle | undefined>): void;
/**
 * An archive the kernel refused, or one that is not a surface result,
 * throws the same error the per-download decode gives, naming its entry.
 */
export declare function checkSurfaceBatch(entryIds: readonly string[], decoded: ReadonlyArray<SurfaceArchiveHandle | undefined>): void;
