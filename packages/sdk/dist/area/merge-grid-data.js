import { getTilingConfig } from "./tiling.js";
import { compactGridTile, compactCategoricalDense, numericCanvas } from "./compact-grid-tile.js";
function positions(tiles) {
    const result = new Uint32Array(tiles.length * 2);
    tiles.forEach((tile, index) => {
        // Read BEFORE anything is released, and strict: an empty slot on entry
        // would place a tile at row 0, col 0 and silently corrupt the merge.
        if (tile === undefined)
            throw new Error(`grid tile ${index} is missing a position`);
        result[index * 2] = tile.row;
        result[index * 2 + 1] = tile.col;
    });
    return result;
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
export function flattenGridTile(row, col, parsed, tileCells) {
    // Neither numeric nor categorical: contributes NaN without joining either
    // count (`denseGridTiles`' mixed-domain check), exactly as an all-null
    // JSON tile always has. The shape check still applies — ambiguity about
    // the DOMAIN is not license to skip the cell-count check every other tile
    // gets.
    if (parsed.ambiguousEmpty === true) {
        if (parsed.shape[0] !== parsed.shape[1] || parsed.shape[0] * parsed.shape[1] !== tileCells) {
            throw new Error(`grid result must contain exactly ${tileCells} cells`);
        }
        return { row, col };
    }
    return { row, col, ...compactGridTile(parsed, tileCells) };
}
/**
 * A canvas the download tasks fill directly, then compact IN PLACE.
 *
 * Holding one buffer per tile and a canvas on top means the same numbers live
 * twice: 162 MiB of buffers under a 162 MiB canvas at 81 tiles of 512 x 512.
 * Writing each tile into its slot as it arrives, and closing the gaps the
 * failed tiles left with `copyWithin` afterwards, retains only the canvas and
 * the tile currently being copied. It does not retain a second full tile bank.
 */
export class GridCanvas {
    slots;
    cells;
    values;
    categories = new Map();
    rows;
    constructor(slots, cells) {
        this.slots = slots;
        this.cells = cells;
        this.rows = Array.from({ length: slots });
    }
    /** Place one flattened tile. Single-threaded, so the lazy alloc is safe. */
    place(index, tile) {
        this.rows[index] = { row: tile.row, col: tile.col };
        if (tile.compactCategory !== undefined) {
            this.categories.set(index, tile.compactCategory);
            return;
        }
        if (tile.values === undefined)
            return;
        // A categorical area never allocates the canvas at all.
        this.values = numericCanvas(this.values, this.slots * this.cells, tile.values);
        this.values.set(tile.values, index * this.cells);
    }
    /**
     * The kept tiles, closed up, with their positions — the shape
     * `denseGridTiles` used to build from a compacted list.
     */
    finish() {
        const kept = [];
        let target = 0;
        for (let index = 0; index < this.slots; index += 1) {
            const at = this.rows[index];
            if (at === undefined)
                continue;
            if (this.values !== undefined && target !== index) {
                // Moves DOWN only (target <= index), so no kept block is overwritten.
                this.values.copyWithin(target * this.cells, index * this.cells, (index + 1) * this.cells);
            }
            const compactCategory = this.categories.get(index);
            kept.push({ row: at.row, col: at.col,
                ...(compactCategory === undefined ? {} : { compactCategory }) });
            target += 1;
        }
        const values = this.values?.subarray(0, target * this.cells);
        this.values = undefined;
        this.categories.clear();
        return { tiles: kept, values };
    }
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
export function denseGridTiles(tiles, tileCells, canvas) {
    const where = positions(tiles);
    const compactCategories = [];
    let filled = canvas;
    let numericCount = 0;
    for (let index = 0; index < tiles.length; index += 1) {
        const tile = tiles[index];
        if (tile === undefined)
            continue;
        if (tile.compactCategory !== undefined) {
            compactCategories.push({ index, category: tile.compactCategory });
        }
        else if (tile.values !== undefined) {
            // Only when the caller did not fill a canvas itself.
            filled = numericCanvas(filled, tiles.length * tileCells, tile.values);
            filled.set(tile.values, index * tileCells);
            numericCount += 1;
        }
        else if (canvas !== undefined) {
            // A pre-filled canvas already holds this tile's NaN slot.
            numericCount += 1;
        }
        // Released here, not after the loop: this is the whole point.
        tiles[index] = undefined;
    }
    if (compactCategories.length > 0 && numericCount > 0) {
        throw new Error("area results mix numeric and categorical grids");
    }
    if (compactCategories.length > 0) {
        return { ...compactCategoricalDense(compactCategories, where.length / 2, tileCells),
            positions: where };
    }
    return {
        values: filled ?? new Float64Array(where.length / 2 * tileCells).fill(Number.NaN),
        positions: where,
    };
}
/** The analysis type's tiling configuration, as the kernel merge reads it. */
export function gridWireConfig(analysisType) {
    const config = getTilingConfig(analysisType);
    return {
        inference_size_m: config.inferenceSizeM,
        inference_size_cells: config.inferenceSizeCells,
        context_size_m: config.contextSizeM,
        step_m: config.stepM,
        step_cells: config.stepCells,
        cell_size_m: config.cellSizeM,
    };
}
