/**
 * A mesh packed into the compact transfer form.
 *
 * @category Buildings
 */
export interface PackedMesh {
    /** The vertex coordinates, packed and base64-encoded. */
    readonly coordinates_bin: string;
    /** The triangle indices, packed and base64-encoded. */
    readonly indices_bin: string;
}
/**
 * Returned instead of a `PackedMesh` when the mesh cannot be expressed in the
 * compact form.
 *
 * @category Buildings
 */
export interface MeshNotRepresentable {
    /** Why the mesh cannot be packed. */
    readonly not_representable: string;
}
/**
 * The outcome of `packMesh`: either a `PackedMesh` or a `MeshNotRepresentable`.
 *
 * @category Buildings
 */
export type MeshPackVerdict = PackedMesh | MeshNotRepresentable;
/**
 * Pack a triangle mesh into the compact form used for request bodies.
 *
 * `initializeCore()` must have completed. Check the result for a
 * `not_representable` field before using it as a `PackedMesh`.
 *
 * @param coordinates - Flat vertex coordinates (`x, y, z, x, y, z, ...`).
 * @param indices - Flat triangle vertex indices, three per triangle.
 * @returns The packed mesh, or a verdict saying why the mesh cannot be packed.
 * @throws {TypeError} when `coordinates` or `indices` contains a non-finite number.
 *
 * @category Buildings
 */
export declare function packMesh(coordinates: readonly number[] | Float64Array, indices: readonly number[]): MeshPackVerdict;
