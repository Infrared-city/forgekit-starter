/**
 * `cleanMesh`: per-entity mesh cleaning, with typed arrays in and out.
 *
 * It is not needed for correct results: analyses already clean every building
 * before they grid facades and roofs (unless a request sets
 * `meshCleaning: "off"`). Use it to see what the cleaning does to a mesh, or
 * to make an upload smaller: an unwelded export carries every shared corner
 * once per triangle.
 */
/**
 * What `cleanMesh` did to one mesh.
 *
 * @category Buildings
 */
export interface MeshCleanReport {
    /** Input vertices joined into an earlier one by the exact weld. */
    readonly verticesWelded: number;
    /** Triangles removed as degenerate (a repeated corner, or zero area). */
    readonly degenerateFacesRemoved: number;
    /** Triangles removed as exact duplicates of an earlier one. */
    readonly duplicateFacesRemoved: number;
    /** Kept triangles whose winding is the reverse of their input winding. */
    readonly facesFlipped: number;
    /** Closed parts (watertight pieces, turned outward). */
    readonly closedComponents: number;
    /** Open parts (kept at their authored majority direction). */
    readonly openComponents: number;
    /** Edges shared by three or more triangles. */
    readonly nonManifoldEdges: number;
}
/**
 * The result of `cleanMesh`.
 *
 * @category Buildings
 */
export interface CleanedMesh {
    /** Flat `[x, y, z, ...]`, in the input's precision. */
    readonly coordinates: Float32Array | Float64Array;
    /** Flat triangle indices. */
    readonly indices: Uint32Array;
    /** What was done. When nothing changed, the input arrays are returned as they are. */
    readonly report: MeshCleanReport;
}
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
export declare function cleanMesh(coordinates: Float32Array | Float64Array | ArrayLike<number>, indices: Uint32Array | ArrayLike<number>): CleanedMesh;
