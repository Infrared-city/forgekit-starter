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
export declare function plainCoordinates(mesh: unknown): number[] | undefined;
export interface Packed {
    readonly ids: string[];
    readonly bytes: Uint8Array;
    readonly offsets: Uint32Array;
    /**
     * The group as JSON text for the kernel: a mesh this host packed crosses
     * WITHOUT its `coordinates` (the kernel writes them from the packed
     * buffer); one it could not pack crosses whole, for the verbatim write.
     */
    readonly document: string;
}
/**
 * One group packed for the kernel: ids, one f64 buffer, element offsets, and
 * the group's document.
 *
 * `keepUnreadable` is the group's rule for a mesh this host cannot read.
 * Buildings SKIP it. `context-geometry` KEEPS it with a ZERO-LENGTH slot,
 * which the kernel reads as undecidable and sends to every tile (D67).
 */
export declare function pack(meshes: Readonly<Record<string, unknown>>, keepUnreadable: boolean): Packed;
