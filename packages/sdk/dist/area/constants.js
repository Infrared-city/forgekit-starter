/**
 * Edge length of one analysis grid cell, in metres.
 *
 * @category Tiling
 */
// Maintainer note (not published): legacy public constant; the WASM kernel
// remains the tiling authority.
export const CELL_SIZE_M = 1;
/**
 * Edge length of one analysis tile, in metres.
 *
 * @category Tiling
 */
// Maintainer note (not published): legacy public constant; the WASM kernel
// remains the tiling authority.
export const TILE_SIZE_M = 512;
/**
 * Number of grid cells along one tile edge (`TILE_SIZE_M / CELL_SIZE_M`).
 *
 * @category Tiling
 */
export const TILE_SIZE_CELLS = TILE_SIZE_M / CELL_SIZE_M;
