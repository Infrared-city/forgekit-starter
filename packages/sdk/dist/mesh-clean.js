/**
 * `cleanMesh`: per-entity mesh cleaning, with typed arrays in and out.
 *
 * It is not needed for correct results: analyses already clean every building
 * before they grid facades and roofs (unless a request sets
 * `meshCleaning: "off"`). Use it to see what the cleaning does to a mesh, or
 * to make an upload smaller: an unwelded export carries every shared corner
 * once per triangle.
 */
// Maintainer note (not published): the cleaning rules are the kernel's
// (`ir_geo::mesh_clean`, infrared-core #555, D208); this package has no copy
// of them. The Python (`infrared_sdk.geometry.clean_mesh`) and .NET
// (`MeshClean.Clean`) SDKs call the same code.
import { requireCore } from "./internal/core.js";
/**
 * Cleans one mesh the way analyses clean each building.
 *
 * Vertices at bit-identical positions are joined (`-0.0` equals `+0.0`, no
 * tolerance), degenerate and exact duplicate triangles are dropped, the winding
 * is made consistent (the authored majority wins), and closed parts are turned
 * outward. An open part keeps its authored direction.
 *
 * Clean each building on its own: two objects that touch must stay apart.
 *
 * @param coordinates - Flat vertex coordinates `[x, y, z, ...]`. A `Float64Array`
 *   stays double precision; any other input is converted to single precision.
 * @param indices - Flat triangle vertex indices.
 * @returns The cleaned coordinates and indices, and a report of what changed.
 * @throws {Error} for a non-finite coordinate or an index out of range.
 * @throws {RangeError} for an index that is not a whole number in `0..2**32-1`;
 *   an index is never truncated or wrapped into another triangle.
 * @category Buildings
 */
export function cleanMesh(coordinates, indices) {
    const coords = coordinates instanceof Float64Array || coordinates instanceof Float32Array
        ? coordinates
        : Float32Array.from(coordinates);
    const tris = indices instanceof Uint32Array ? indices : checkedIndices(indices);
    return requireCore().cleanMesh(coords, tris);
}
/** Indices as `Uint32Array`, refusing any value the conversion would change. */
function checkedIndices(indices) {
    const out = new Uint32Array(indices.length);
    for (let i = 0; i < indices.length; i++) {
        const value = indices[i];
        if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
            throw new RangeError(`indices[${i}] = ${String(value)} is not a whole number in 0..2**32-1`);
        }
        out[i] = value;
    }
    return out;
}
