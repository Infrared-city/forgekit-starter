/** Legacy public grid cell size. The WASM kernel remains the tiling authority. */
export const CELL_SIZE_M = 1;
/** Legacy public tile edge size. The WASM kernel remains the tiling authority. */
export const TILE_SIZE_M = 512;
export const TILE_SIZE_CELLS = TILE_SIZE_M / CELL_SIZE_M;
