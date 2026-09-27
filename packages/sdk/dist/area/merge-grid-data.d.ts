import type { CompactGridResult } from "../internal/binary-result.js";
import { type CompactCategory } from "./compact-grid-tile.js";
/**
 * One tile, already flattened out of its decoded JSON.
 *
 * The merge flattens each tile as it ARRIVES, inside the download task, so
 * the decoded grid — a 512 x 512 tile is 262,144 boxed JavaScript numbers in
 * 512 arrays — is collectable the moment it has been copied into a typed
 * array, instead of being held until every download has finished. Neither
 * field set means the tile was empty: it contributes NaN, as it always did.
 */
export interface FlatGridTile {
    readonly row: number;
    readonly col: number;
    readonly values?: Float32Array | Float64Array;
    readonly compactCategory?: CompactCategory;
}
/**
 * A slot the merge hands over and lets go of.
 *
 * The caller owns an array of these and the accumulator CLEARS each one as
 * it consumes it. At 81 tiles the decoded grids are the largest thing in the
 * process — a 512 x 512 tile is 262,144 boxed JavaScript numbers inside 512
 * arrays, and holding all of them while the flat canvas is allocated on top
 * doubles the peak for no reason (`FABLE-perf-audit.md` row 3c, P0-6).
 */
export type GridTileSlot = FlatGridTile | undefined;
export interface DenseGridTiles {
    readonly values: Float32Array | Float64Array;
    readonly positions: Uint32Array;
    /** Sorted observed labels indexed by categorical value ordinals. */
    readonly legend?: readonly string[];
}
/**
 * Flatten ONE downloaded tile, releasing its decoded buffers to the caller.
 *
 * Called from inside the download task, so the decoded grid lives only as
 * long as the copy takes. The kernel's `decodeResultArchive` (D107) already
 * flattens a JSON grid onto this same `CompactGridResult` shape, so both the
 * JSON and the strict-IRBF route land here identically — `areaGridResult`
 * (`compact-grid-result.ts`) is the ONE place the two routes still differ. It
 * THROWS on a wrong cell count, exactly where `denseGridTiles` used to — the
 * caller must let that propagate rather than fold it into a per-tile download
 * failure, which would report a malformed result as a network problem.
 */
export declare function flattenGridTile(row: number, col: number, parsed: CompactGridResult, tileCells: number): FlatGridTile;
/**
 * A canvas the download tasks fill directly, then compact IN PLACE.
 *
 * Holding one buffer per tile and a canvas on top means the same numbers live
 * twice: 162 MiB of buffers under a 162 MiB canvas at 81 tiles of 512 x 512.
 * Writing each tile into its slot as it arrives, and closing the gaps the
 * failed tiles left with `copyWithin` afterwards, retains only the canvas and
 * the tile currently being copied. It does not retain a second full tile bank.
 */
export declare class GridCanvas {
    private readonly slots;
    private readonly cells;
    private values;
    private readonly categories;
    private readonly rows;
    constructor(slots: number, cells: number);
    /** Place one flattened tile. Single-threaded, so the lazy alloc is safe. */
    place(index: number, tile: FlatGridTile): void;
    /**
     * The kept tiles, closed up, with their positions — the shape
     * `denseGridTiles` used to build from a compacted list.
     */
    finish(): {
        tiles: GridTileSlot[];
        values: Float32Array | Float64Array | undefined;
    };
}
/**
 * Assemble the flattened tiles into the canvas the kernel merge takes.
 *
 * `tiles` is CONSUMED: each slot is cleared as it is read, so a tile's buffer
 * is collectable while the canvas is still filling. The caller must hold no
 * other reference to them (`merge.ts` does not).
 *
 * JSON and legacy F64 tiles keep Float64 precision. Compact IRBF tiles stay
 * Float32 when every numeric tile supports it. A mixed run promotes the canvas
 * once to Float64, so download order cannot narrow a JSON or legacy F64 value.
 */
export declare function denseGridTiles(tiles: GridTileSlot[], tileCells: number, canvas?: Float32Array | Float64Array): DenseGridTiles;
/** The tiling numbers the kernel grid merge takes, in its own spelling. */
export interface GridWireConfig {
    inference_size_m: number;
    inference_size_cells: number;
    context_size_m: number;
    step_m: number;
    step_cells: number;
    cell_size_m: number;
}
/** The analysis type's tiling configuration, as the kernel merge reads it. */
export declare function gridWireConfig(analysisType: string): GridWireConfig;
