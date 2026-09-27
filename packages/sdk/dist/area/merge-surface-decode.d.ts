/**
 * One downloaded surface result, decoded by the kernel (WP4).
 *
 * `decodeSurfaceArchive` inflates the archive, selects the route, parses,
 * validates and flattens a JSON or strict IRBF surface result in one call.
 * The values and the server's cell triangles STAY in WebAssembly memory in
 * the returned handle, and `SurfaceAreaMerger.pushArchive` moves them into
 * the merge; this host never holds them as JavaScript numbers.
 *
 * What the host takes out is what it builds public objects from:
 *
 * - the root fields without `surfaces`, as the response's own JSON text,
 *   parsed here with `JSON.parse` exactly as the whole response was before;
 * - each surface's fields without `values` and `cell-tris`, also the
 *   response's own text, so key order, duplicate keys, unknown fields and
 *   every number are what `JSON.parse` gave before;
 * - `cell-area`, rebuilt as the `(number | null)[]` it always was from the
 *   kernel's `f64` cells (NaN is `null`). A JSON number and its kernel
 *   `f64` are the same double: the kernel parses with `float_roundtrip`.
 *
 * This replaces, in this host, `parseResultArchive` + `parseSurfaceRecord`
 * + `surfaceParts` on the merge path: the inflate, the route probe, the
 * `JSON.parse` of the whole document, the per-cell checks and the flatten.
 */
import { type WasmCore } from "../internal/core.js";
/** The kernel's decode handle (`wasm/src/surface_archive.rs`). */
export type SurfaceArchiveHandle = ReturnType<WasmCore["decodeSurfaceArchive"]>;
export interface DecodedSurfaceJob {
    /** Handed to `pushArchive`, which consumes it. */
    readonly archive: SurfaceArchiveHandle;
    /** The response root without `surfaces`. */
    readonly root: Record<string, unknown>;
    /** Surface keys in the response's order (first position, last value). */
    readonly keys: readonly string[];
    /** Each surface's public fields without `values` and `cell-tris`. */
    readonly fields: readonly Record<string, unknown>[];
    /** One byte per surface: 2 when the server sent a `cell-tris` array. */
    readonly cellTrisState: Uint8Array;
}
/**
 * Decode one archive, or `undefined` when it holds a valid result that is
 * not a surface result (a grid, other JSON, another IRBF family).
 */
export declare function decodeSurfaceJob(content: Uint8Array): DecodedSurfaceJob | undefined;
/**
 * The response as `synthesizeSurfaceTriangles` reads it: the root fields and
 * a `surfaces` map of the host fields. A surface the server drew keeps a
 * non-null `cell-tris` marker, which is all that reader checks
 * (`already_present`); its coordinates stay in the kernel.
 */
export declare function synthesisView(job: DecodedSurfaceJob): Record<string, unknown>;
