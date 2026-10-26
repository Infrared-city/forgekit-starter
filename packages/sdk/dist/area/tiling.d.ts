import type { Polygon, Tile, TilingConfig } from "./types.js";
/**
 * Checks a GeoJSON polygon and returns it with counter-clockwise winding.
 *
 * The polygon must be a single ring with no holes, at least four positions (three distinct
 * vertices and the closing one), `[longitude, latitude]` positions in range, a closed ring,
 * no self-intersection and a non-zero area. A clockwise ring is reversed; positions are
 * otherwise returned as given.
 *
 * @param polygon - The GeoJSON `Polygon` to check.
 * @returns The validated polygon, wound counter-clockwise.
 * @throws when the polygon breaks any of the rules above; the message names the problem.
 * @category Tiling
 */
export declare function validatePolygon(polygon: Polygon): Polygon;
/**
 * Covers a polygon with tiles and returns the grid as `tiles[row][col]`, with row 0 at the
 * south and column 0 at the west.
 *
 * The grid is deterministic for a polygon and analysis type, and includes tiles that do not
 * touch the polygon (`empty: true`); only non-empty tiles are billed jobs. A run is refused
 * when it would need more than 100 non-empty tiles, unless `maxTilesOverride` raises that cap.
 *
 * @param polygon - The GeoJSON `Polygon` to cover; it is validated first (see `validatePolygon`).
 * @param options.analysisType - Selects the tile size and spacing (wind, or solar and
 *   thermal); unset uses the wind preset.
 * @param options.maxTilesOverride - Raises the cap on non-empty tiles; an integer from 0
 *   through 4,294,967,295.
 * @returns The tile grid.
 * @throws {Error} when the polygon is invalid, or when it would need too many tiles; the
 *   message gives the counts and the `maxTilesOverride` that would allow the run.
 * @throws {TypeError} when `maxTilesOverride` is not a valid integer.
 * @category Tiling
 */
export declare function generateTilesForPolygon(polygon: Polygon, options?: {
    readonly analysisType?: string | null;
    readonly maxTilesOverride?: number;
}): Tile[][];
/**
 * Returns the tiling parameters for an analysis type.
 *
 * Wind analyses (`wind-speed`, `pedestrian-wind-comfort`) and an unset or empty type use
 * the wind preset; any other analysis name uses the solar preset.
 *
 * @param analysisType - The analysis type, or unset for the wind preset.
 * @returns The tile size, context size, step and cell size for that family.
 * @category Tiling
 */
export declare function getTilingConfig(analysisType?: string | null): TilingConfig;
