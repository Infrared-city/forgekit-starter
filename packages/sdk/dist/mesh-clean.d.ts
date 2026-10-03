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
/** What {@link cleanMesh} did to one mesh. */
export interface MeshCleanReport {
    /** Input vertices joined into an earlier one by the exact weld. */
    readonly verticesWelded: number;
    /** Triangles removed as degenerate (a repeated corner, or zero area). */
    readonly degenerateFacesRemoved: number;
    /** Triangles removed as exact duplicates of an earlier one. */
    readonly duplicateFacesRemoved: number;
    /** Kept triangles whose winding is the reverse of their input winding. */
    readonly facesFlipped: number;
    /** Closed parts (turned outward). */
    readonly closedComponents: number;
    /** Open parts (kept at their authored majority direction). */
    readonly openComponents: number;
    /** Edges shared by three or more triangles. */
    readonly nonManifoldEdges: number;
}
/** The result of {@link cleanMesh}. */
export interface CleanedMesh {
    /** Flat `[x, y, z, ...]`, in the input's precision. */
    readonly coordinates: Float32Array | Float64Array;
    /** Flat triangle indices. */
    readonly indices: Uint32Array;
    /** What was done; when nothing changed, the input arrays came back. */
    readonly report: MeshCleanReport;
}
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
export declare function cleanMesh(coordinates: Float32Array | Float64Array | ArrayLike<number>, indices: Uint32Array | ArrayLike<number>): CleanedMesh;
