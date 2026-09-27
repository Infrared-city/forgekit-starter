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
 * undecidable and goes to every tile verbatim (D67).
 */
export function plainCoordinates(mesh) {
    if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh))
        return undefined;
    const coordinates = mesh.coordinates;
    if (!Array.isArray(coordinates))
        return undefined;
    if (coordinates.length === 0 || coordinates.length % 3 !== 0)
        return undefined;
    for (const value of coordinates) {
        if (typeof value !== "number" || !Number.isFinite(value))
            return undefined;
    }
    return coordinates;
}
/**
 * One group packed for the kernel: ids, one f64 buffer, element offsets, and
 * the group's document.
 *
 * `keepUnreadable` is the group's rule for a mesh this host cannot read.
 * Buildings SKIP it. `context-geometry` KEEPS it with a ZERO-LENGTH slot,
 * which the kernel reads as undecidable and sends to every tile (D67).
 */
export function pack(meshes, keepUnreadable) {
    const ids = [];
    const blocks = [];
    const offsets = [0];
    // No prototype: a mesh id such as `__proto__` is an own property here too.
    const stripped = Object.create(null);
    let total = 0;
    for (const [id, mesh] of Object.entries(meshes)) {
        const readable = plainCoordinates(mesh);
        if (readable === undefined && !keepUnreadable)
            continue;
        const block = readable ?? [];
        ids.push(id);
        blocks.push(block);
        total += block.length;
        offsets.push(total);
        stripped[id] = readable === undefined ? mesh : { ...mesh, coordinates: undefined };
    }
    // The kernel reads LITTLE-endian f64. `DataView` writes that order on every
    // engine, so there is no host-order branch to get wrong. Python packs the
    // same bytes the same way (`tiling/site_assign.py` `_pack`).
    const bytes = new Uint8Array(total * 8);
    const view = new DataView(bytes.buffer);
    let at = 0;
    for (const block of blocks) {
        for (const value of block) {
            view.setFloat64(at, value, true);
            at += 8;
        }
    }
    return { ids, bytes, offsets: Uint32Array.from(offsets), document: JSON.stringify(stripped) };
}
