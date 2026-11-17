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
export declare function plainCoordinates(mesh: unknown): ArrayLike<number> | undefined;
export interface Packed {
    readonly ids: string[];
    /** The f64 coordinates of every mesh, one buffer. */
    readonly coordinates: Float64Array;
    /** The same memory as little-endian bytes, as the kernel `Site` reads it. */
    readonly bytes: Uint8Array;
    readonly offsets: Uint32Array;
    /**
     * The index buffer and its element offsets, for a group that keeps its
     * unreadable meshes (the context). The kernel reads them in place of the
     * group's indices as JSON.
     */
    readonly indices: Uint32Array;
    readonly indexOffsets: Uint32Array;
    /**
     * The group as JSON text for the kernel: a mesh this host packed crosses
     * WITHOUT its `coordinates` (the kernel writes them from the packed
     * buffer). Empty for a group that keeps its unreadable meshes: the kernel
     * reads that group from the buffers and no text is written.
     */
    readonly document: string;
}
/**
 * One group packed for the kernel: ids, one f64 buffer, element offsets, and
 * the group's document.
 *
 * `keepUnreadable` is the group's rule for a mesh this host cannot read.
 * Buildings SKIP it. `context-geometry` KEEPS it with a ZERO-LENGTH slot,
 * which the kernel refuses by name (D293), and also packs its indices.
 */
export declare function pack(meshes: Readonly<Record<string, unknown>>, keepUnreadable: boolean): Packed;
