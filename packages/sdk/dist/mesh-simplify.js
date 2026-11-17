/**
 * Make `context-geometry` light: `weldMeshes` joins the corners an export
 * wrote once per triangle, `simplifyMeshes` makes a low-resolution copy, and
 * `exportMeshes` writes a geometry map as a dotbim, OBJ or SDK JSON file to
 * inspect and keep it. The results of weld and simplify go straight into a
 * request; no file is needed.
 */
// Maintainer note (not published): the rules and every default are the
// kernel's (`ir_geo::mesh_clean::weld_meshes`, `ir_geo::mesh_simplify`,
// `ir_geo::mesh_export`, D294); an option left out is passed as `undefined`.
// The results are typed-array views over the buffers the binding returns.
// The Python twins are `infrared_sdk.geometry.weld_meshes`, `simplify_meshes`
// and `export_meshes`; .NET follows (Daniel).
import { requireCore } from "./internal/core.js";
/**
 * The batch layout of a geometry map. One mesh that already holds a
 * `Float64Array` and a `Uint32Array` goes in as it is (no pack copy); any
 * other input is copied once into new arrays.
 */
function pack(geometry) {
    const names = Object.keys(geometry);
    const only = names.length === 1 ? geometry[names[0]] : undefined;
    if (only !== undefined && only.coordinates instanceof Float64Array && only.indices instanceof Uint32Array) {
        return {
            names,
            coordinates: only.coordinates,
            vertOffsets: Uint32Array.of(0, only.coordinates.length / 3),
            indices: only.indices,
            faceOffsets: Uint32Array.of(0, only.indices.length / 3),
        };
    }
    const vertOffsets = new Uint32Array(names.length + 1);
    const faceOffsets = new Uint32Array(names.length + 1);
    names.forEach((n, k) => {
        vertOffsets[k + 1] = vertOffsets[k] + geometry[n].coordinates.length / 3;
        faceOffsets[k + 1] = faceOffsets[k] + geometry[n].indices.length / 3;
    });
    const coordinates = new Float64Array(3 * vertOffsets[names.length]);
    const indices = new Uint32Array(3 * faceOffsets[names.length]);
    names.forEach((n, k) => {
        coordinates.set(geometry[n].coordinates, 3 * vertOffsets[k]);
        indices.set(geometry[n].indices, 3 * faceOffsets[k]);
    });
    return { names, coordinates, vertOffsets, indices, faceOffsets };
}
/**
 * The view, with a `toJSON` that writes it as the plain array it holds: every
 * request writer (`JSON.stringify`) then writes the same text, and the same
 * geometry hash, as for the same mesh given as `number[]`.
 */
function jsonAsArray(view) {
    return Object.defineProperty(view, "toJSON", {
        value() {
            return Array.from(this);
        },
    });
}
/** `kept`: the input index of each output mesh (undefined: every mesh, in order). */
function result(p, out, errors, kept) {
    const geometry = {};
    const report = {};
    (kept === undefined ? p.names.map((_, e) => e) : Array.from(kept)).forEach((e, k) => {
        const name = p.names[e];
        const [v0, v1, f0, f1] = [out.vertOffsets[k], out.vertOffsets[k + 1], out.faceOffsets[k], out.faceOffsets[k + 1]];
        geometry[name] = {
            coordinates: jsonAsArray(out.coordinates.subarray(3 * v0, 3 * v1)),
            indices: jsonAsArray(out.indices.subarray(3 * f0, 3 * f1)),
        };
        report[name] = {
            trianglesIn: p.faceOffsets[e + 1] - p.faceOffsets[e],
            trianglesOut: f1 - f0,
            verticesIn: p.vertOffsets[e + 1] - p.vertOffsets[e],
            verticesOut: v1 - v0,
            ...(errors === undefined ? {} : { errorM: errors[k] }),
        };
    });
    return { geometry, report };
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
export function weldMeshes(geometry, options = {}) {
    const p = pack(geometry);
    const out = requireCore().weldMeshes(p.coordinates, p.vertOffsets, p.indices, p.faceOffsets, options.toleranceM);
    return result(p, out);
}
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
export function simplifyMeshes(geometry, options = {}) {
    const p = pack(geometry);
    const out = requireCore().simplifyMeshes(p.coordinates, p.vertOffsets, p.indices, p.faceOffsets, options.targetRatio, options.maxErrorM, options.lockBorder);
    return result(p, out, out.errorsM, out.kept);
}
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
export function exportMeshes(geometry, format = "dotbim") {
    const p = pack(geometry);
    return requireCore().exportMeshes(p.names, p.coordinates, p.vertOffsets, p.indices, p.faceOffsets, format, p.names.map((n) => geometry[n].type ?? ""));
}
