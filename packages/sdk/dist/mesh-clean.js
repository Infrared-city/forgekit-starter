/**
 * `cleanMesh`: the kernel's per-entity mesh cleaning (`ir_geo::mesh_clean`,
 * infrared-core #555, D208), with typed arrays in and out.
 *
 * This package has no copy of the rules: the kernel owns them, and the Python
 * (`infrared_sdk.geometry.clean_mesh`) and .NET (`MeshClean.Clean`) SDKs call
 * the same code. It is not needed for correct results — the kernel already
 * cleans every building before it grids facades and roofs (unless a request
 * sets `meshCleaning: "off"`). Use it to see what the cleaning does to a mesh,
 * or to make an upload smaller: an unwelded export carries every shared corner
 * once per triangle.
 */
import { requireCore } from "./internal/core.js";
/**
 * Clean ONE mesh the way the kernel cleans each building: join vertices at
 * bit-identical positions (`-0.0` equals `+0.0`, no tolerance), drop
 * degenerate and exact duplicate triangles, make the winding consistent (the
 * authored majority wins), and turn CLOSED parts outward. An open part keeps
 * its authored direction.
 *
 * A `Float64Array` stays `f64`; any other input is `f32` (the wire precision).
 * Clean each building on its own: two objects that touch must stay apart.
 * Throws for a non-finite coordinate, an index out of range, or an index that
 * is not a whole number in `0..2**32-1` (it is never truncated or wrapped into
 * another triangle).
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
