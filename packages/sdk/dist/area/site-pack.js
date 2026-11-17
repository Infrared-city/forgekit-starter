import { typedAsArray } from "../internal/wire-json.js";
/**
 * The site's coordinate packing for the kernel `Site` (WS2). Split out of
 * `site-assign.ts` for the 400-line file cap (root `CLAUDE.md` rule 8).
 */
/**
 * A mesh's `coordinates` when they are a flat `[x, y, z, ...]` this host can
 * hand over as f64, and `undefined` otherwise.
 *
 * The test is the kernel's own, read back: a value that is not a finite JSON
 * number, or a length that is not a multiple of three, makes the kernel skip
 * the mesh. A building it rejects reaches no tile; an occluder it rejects is
 * refused by the kernel by name (D293).
 */
export function plainCoordinates(mesh) {
    if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh))
        return undefined;
    const coordinates = mesh.coordinates;
    // A typed array (the mesh utilities return `Float64Array` views, D294) is
    // read in place, like a plain array.
    const flat = Array.isArray(coordinates) || coordinates instanceof Float64Array || coordinates instanceof Float32Array
        ? coordinates
        : undefined;
    if (flat === undefined)
        return undefined;
    // The kernel checks every value (finite numbers) and skips or refuses the mesh by name.
    if (flat.length === 0 || flat.length % 3 !== 0)
        return undefined;
    return flat;
}
function words(value) {
    return Array.isArray(value) || value instanceof Uint32Array ? value : undefined;
}
/**
 * One group packed for the kernel: ids, one f64 buffer, element offsets, and
 * the group's document.
 *
 * `keepUnreadable` is the group's rule for a mesh this host cannot read.
 * Buildings SKIP it. `context-geometry` KEEPS it with a ZERO-LENGTH slot,
 * which the kernel refuses by name (D293), and also packs its indices.
 */
export function pack(meshes, keepUnreadable) {
    const ids = [];
    const blocks = [];
    const triangles = [];
    const offsets = [0];
    const indexOffsets = [0];
    // No prototype: a mesh id such as `__proto__` is an own property here too.
    const stripped = Object.create(null);
    let total = 0;
    let indexTotal = 0;
    for (const [id, mesh] of Object.entries(meshes)) {
        const coordinates = plainCoordinates(mesh);
        const triangle = keepUnreadable ? words(mesh?.indices) : [];
        const readable = coordinates !== undefined && triangle !== undefined;
        if (!readable && !keepUnreadable)
            continue;
        const block = readable ? coordinates : [];
        ids.push(id);
        blocks.push(block);
        triangles.push(readable ? triangle : []);
        total += block.length;
        indexTotal += readable ? triangle.length : 0;
        offsets.push(total);
        indexOffsets.push(indexTotal);
        if (!keepUnreadable)
            stripped[id] = { ...mesh, coordinates: undefined };
    }
    // The kernel reads LITTLE-endian f64; every engine this SDK runs on is
    // little-endian, and Python hands the kernel the same bytes.
    const coordinates = new Float64Array(total);
    const indices = new Uint32Array(indexTotal);
    blocks.forEach((block, mesh) => {
        coordinates.set(block, offsets[mesh]);
        indices.set(triangles[mesh], indexOffsets[mesh]);
    });
    return {
        ids, coordinates, bytes: new Uint8Array(coordinates.buffer), offsets: Uint32Array.from(offsets),
        indices, indexOffsets: Uint32Array.from(indexOffsets),
        document: keepUnreadable ? "" : JSON.stringify(stripped, typedAsArray),
    };
}
