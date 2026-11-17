/**
 * A mesh group as the buffers the kernel hashes: one coordinate buffer, one
 * index buffer and the per-mesh offsets. A typed array is copied once into
 * the group buffer (`set`, no per-number loop); a plain array is read once.
 * The group is never written as JSON text.
 */
export interface MeshBuffers {
    readonly ids: string[];
    readonly coordinates: Float32Array | Float64Array;
    readonly coordinateOffsets: Uint32Array;
    readonly indices: Uint32Array;
    readonly indexOffsets: Uint32Array;
}
/**
 * The buffers of `group`, or `undefined` when a mesh is not a plain
 * `coordinates` + `indices` pair of numbers (a binary arm, a missing array):
 * the caller then hashes the group as JSON text.
 */
export declare function packMeshGroup(group: unknown): MeshBuffers | undefined;
