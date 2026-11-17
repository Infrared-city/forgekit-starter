/**
 * Make `context-geometry` light: `weldMeshes` joins the corners an export
 * wrote once per triangle, `simplifyMeshes` makes a low-resolution copy, and
 * `exportMeshes` writes a geometry map as a dotbim, OBJ or SDK JSON file to
 * inspect and keep it. The results of weld and simplify go straight into a
 * request; no file is needed.
 */
/**
 * Limits for `simplifyMeshes`. Each one left out takes the core default.
 *
 * @category Buildings
 */
export interface SimplifyOptions {
    /**
     * Error limit in metres (default 1). A typical error, not a bound: single
     * points can be 2 to 3 times as far, and a thin part (a mast) becomes a
     * line. `Infinity`: only `targetRatio` limits the collapse.
     */
    readonly maxErrorM?: number;
    /** Kept share of the triangles, 0 to 1. Default: no count limit. */
    readonly targetRatio?: number;
    /**
     * Keep every open edge (default `true`), so a terrain rim still meets its
     * neighbour. Set `false` for buildings with an open base.
     */
    readonly lockBorder?: boolean;
}
/**
 * One mesh as flat arrays: `[x, y, z, ...]` in metres and triangle indices.
 *
 * @category Buildings
 */
export interface MeshArrays {
    readonly coordinates: ArrayLike<number>;
    readonly indices: ArrayLike<number>;
    /** dotbim element type for `exportMeshes` (default `"Context"`). */
    readonly type?: string;
}
/**
 * A geometry map, the form of `context-geometry`, `geometries` and
 * `ground-geometry`: `{ name: { coordinates, indices } }`.
 *
 * @category Buildings
 */
export type GeometryMap = Readonly<Record<string, MeshArrays>>;
/**
 * One mesh of a `weldMeshes` / `simplifyMeshes` result: views over the
 * returned buffers, no copy.
 *
 * @category Buildings
 */
export interface MeshBuffers {
    readonly coordinates: Float64Array;
    readonly indices: Uint32Array;
}
/**
 * What `weldMeshes` or `simplifyMeshes` did to one mesh.
 *
 * @category Buildings
 */
export interface MeshCounts {
    readonly trianglesIn: number;
    readonly trianglesOut: number;
    readonly verticesIn: number;
    readonly verticesOut: number;
    /** `simplifyMeshes` only: the simplifier's error estimate in metres. */
    readonly errorM?: number;
}
/**
 * The result of `weldMeshes` or `simplifyMeshes`: the geometry, ready to pass
 * straight on as `contextGeometry`, `geometries` or `groundGeometry`, and
 * the counts per mesh.
 *
 * @category Buildings
 */
export interface MeshesResult {
    readonly geometry: Record<string, MeshBuffers>;
    readonly report: Record<string, MeshCounts>;
}
/**
 * Joins the duplicate corners of every mesh of a geometry map, in one call.
 *
 * Many exports (Grasshopper, Rhino, and others) write each triangle with its
 * own three corners, and the copies of one corner are not always identical.
 * A vertex joins the first earlier vertex at most `toleranceM` away; the
 * triangles that become degenerate, and exact duplicates, are dropped. No
 * vertex moves, the winding is kept, and meshes never join each other.
 *
 * @param geometry - `{ name: { coordinates, indices } }`, in metres.
 * @param options - `toleranceM`: the largest distance between two copies of
 *   one corner, in metres (default 0: only identical positions join). Keep it
 *   well below the smallest real edge of the model.
 * @returns The geometry (typed arrays, ready for a request) and the counts.
 * @throws {Error} for a non-finite coordinate, an index out of range, or a
 *   negative tolerance.
 * @category Buildings
 */
export declare function weldMeshes(geometry: GeometryMap, options?: {
    readonly toleranceM?: number;
}): MeshesResult;
/**
 * Makes a low-resolution copy of every mesh of a geometry map, in one call.
 * Each mesh is simplified on its own (meshes never join, so the per-tile
 * context selection still sees each one); for one mesh, pass a map with one
 * entry. Each mesh is welded exactly first (call `weldMeshes` before it for a
 * tolerance), then edges collapse in the order of the smallest shape change
 * (quadric error) until a limit stops them. No vertex moves: the copy keeps a
 * subset of the input vertices.
 *
 * @param geometry - `{ name: { coordinates, indices } }`, for example
 *   `weldMeshes(...).geometry`.
 * @param options - The limits, for every mesh; see `SimplifyOptions`.
 * @returns The geometry (typed arrays, ready for `contextGeometry`) and the
 *   counts and error estimate per mesh. A mesh that collapses to no triangle
 *   (a thin box with `lockBorder: false`) is left out of both.
 * @throws {Error} for a non-finite coordinate, an index out of range, or a
 *   limit out of range.
 * @category Buildings
 */
export declare function simplifyMeshes(geometry: GeometryMap, options?: SimplifyOptions): MeshesResult;
/**
 * Writes a geometry map as text, to inspect or keep it.
 *
 * @param geometry - `{ name: { coordinates, indices } }`, for example
 *   `simplifyMeshes(...).geometry`. A mesh may carry `type`: the dotbim
 *   element type (default `"Context"`).
 * @param format - `"dotbim"` (default): the open JSON mesh format of the
 *   Grasshopper, Blender and Speckle plugins, one element per name; its
 *   `info` says metres, Z up and the site local frame. `"obj"`: Wavefront
 *   OBJ, one object per name; Rhino opens it without a plugin. `"json"`: the
 *   SDK geometry map; `JSON.parse` it and pass it as `contextGeometry`.
 * @returns The file text. Numbers are written so that they read back exactly.
 * @category Buildings
 */
export declare function exportMeshes(geometry: GeometryMap, format?: "dotbim" | "obj" | "json"): string;
