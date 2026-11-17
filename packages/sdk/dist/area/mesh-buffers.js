/**
 * The buffers of `group`, or `undefined` when a mesh is not a plain
 * `coordinates` + `indices` pair of numbers (a binary arm, a missing array):
 * the caller then hashes the group as JSON text.
 */
export function packMeshGroup(group) {
    if (group === null || typeof group !== "object" || Array.isArray(group))
        return undefined;
    const meshes = Object.entries(group);
    const ids = [];
    const points = [];
    const triangles = [];
    const coordinateOffsets = new Uint32Array(meshes.length + 1);
    const indexOffsets = new Uint32Array(meshes.length + 1);
    let narrow = meshes.length > 0;
    for (const [id, mesh] of meshes) {
        if (mesh === null || typeof mesh !== "object")
            return undefined;
        const { coordinates, indices, coordinates_bin: cb, indices_bin: ib } = mesh;
        if (cb !== undefined || ib !== undefined)
            return undefined;
        const plain = (value) => Array.isArray(value) || ArrayBuffer.isView(value);
        if (!plain(coordinates) || !plain(indices))
            return undefined;
        if (!(coordinates instanceof Float32Array))
            narrow = false;
        ids.push(id);
        points.push(coordinates);
        triangles.push(indices);
        coordinateOffsets[ids.length] = coordinateOffsets[ids.length - 1] + coordinates.length;
        indexOffsets[ids.length] = indexOffsets[ids.length - 1] + indices.length;
    }
    const flat = narrow
        ? new Float32Array(coordinateOffsets[ids.length])
        : new Float64Array(coordinateOffsets[ids.length]);
    const words = new Uint32Array(indexOffsets[ids.length]);
    for (let mesh = 0; mesh < ids.length; mesh++) {
        const block = points[mesh];
        flat.set(block, coordinateOffsets[mesh]);
        words.set(triangles[mesh], indexOffsets[mesh]);
    }
    return { ids, coordinates: flat, coordinateOffsets, indices: words, indexOffsets };
}
