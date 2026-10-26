/**
 * A GeoJSON position: `[longitude, latitude]` in degrees, with an optional
 * third value (elevation).
 *
 * @category Tiling
 */
export type Position = readonly [number, number] | readonly [number, number, number];
/**
 * A GeoJSON `Polygon` for an area run: one ring, no holes, closed (first and last position
 * equal) and not self-intersecting. Positions are `[longitude, latitude]`.
 *
 * @category Tiling
 */
export interface Polygon {
    /** Always `"Polygon"`. */
    readonly type: "Polygon";
    /** The rings of the polygon; an area run takes exactly one. */
    readonly coordinates: readonly (readonly Position[])[];
}
/**
 * A geographic point.
 *
 * @category Tiling
 */
export interface Point {
    /** Latitude in degrees (-90 to 90). */
    readonly latitude: number;
    /** Longitude in degrees (-180 to 180). */
    readonly longitude: number;
}
/**
 * One tile of the grid that covers an area polygon. `generateTilesForPolygon` returns them
 * as `Tile[row][col]`, with row 0 at the south and column 0 at the west.
 *
 * @category Tiling
 */
export interface Tile {
    /** Identifier of the tile; it is the key of the tile in schedules and tile payloads. */
    readonly tileId: string;
    /** `true` when the tile's analysed square does not touch the polygon, so no job runs for it. */
    readonly empty: boolean;
    /** Centre of the tile. */
    readonly centroid: Point;
    /** Edge lengths of the analysed square, in metres. */
    readonly size: {
        readonly x: number;
        readonly y: number;
    };
}
/**
 * A tile with its position in the grid.
 *
 * @category Tiling
 */
export interface IndexedTile {
    /** Row in the tile grid; row 0 is the southernmost. */
    readonly row: number;
    /** Column in the tile grid; column 0 is the westernmost. */
    readonly col: number;
    /** The identifier of the tile at this position. */
    readonly tileId: string;
}
/**
 * The tiling parameters of an analysis family (wind, or solar and thermal), as returned by
 * `getTilingConfig`.
 *
 * @category Tiling
 */
export interface TilingConfig {
    /** Edge length of the square a tile analyses, in metres. */
    readonly inferenceSizeM: number;
    /** Number of grid cells along one edge of a tile's result. */
    readonly inferenceSizeCells: number;
    /** Edge length of the square read for surrounding geometry, in metres. */
    readonly contextSizeM: number;
    /** Distance between neighbouring tile centres, in metres. */
    readonly stepM: number;
    /** `stepM` expressed in grid cells. */
    readonly stepCells: number;
    /** Size of one grid cell, in metres. */
    readonly cellSizeM: number;
}
/**
 * How far beyond a tile terrain is read: the caller's reach in metres, never less than the
 * analysis family's own context margin (it is a floor, not an addition to it).
 *
 * @category Tiling
 */
export type TerrainContext = {
    readonly margin_m: number;
};
/**
 * The geometry groups an area run can tile.
 *
 * @category Tiling
 */
export type SupportedAreaGroup = "geometries" | "context-geometry" | "ground-geometry" | "vegetation" | "ground-materials";
/**
 * A mesh given as flat JSON arrays of numbers: `coordinates` for the vertices and `indices`
 * for the triangles. Packed binary arrays (`coordinates_bin`, `indices_bin`) are not accepted
 * for area tiling.
 *
 * @category Tiling
 */
export type JsonTilingMesh = Readonly<Record<string, unknown>> & {
    readonly coordinates?: readonly number[];
    readonly indices?: readonly number[];
    readonly coordinates_bin?: never;
    readonly indices_bin?: never;
};
/**
 * The geometry groups to cut into tiles.
 *
 * @category Tiling
 */
export interface AreaGeometryGroups {
    /** Buildings and near neighbours to analyse; each mesh is cut per tile. */
    readonly geometries?: Readonly<Record<string, JsonTilingMesh>>;
    /**
     * Distant occluders for shading only. Keep them low-poly (guide: below
     * about 50,000 triangles for the whole site). A context mesh is not cut:
     * it goes whole into every tile job whose context box (the tile plus a border of up to 128 m, depending on the analysis) it
     * touches, and its triangles cost upload bytes and memory once per tile.
     * Analysed buildings and near neighbours go in `geometries`, which is cut
     * per tile. See the README, "Bring your own geometry".
     */
    readonly "context-geometry"?: Readonly<Record<string, JsonTilingMesh>>;
    /** Terrain meshes. Needs `terrainContext` in `ComposeOptions`. */
    readonly "ground-geometry"?: Readonly<Record<string, JsonTilingMesh>>;
    /** Vegetation group. */
    readonly vegetation?: Readonly<Record<string, unknown>>;
    /** Ground-material layers. */
    readonly "ground-materials"?: Readonly<Record<string, unknown>>;
}
/**
 * Options for `composeTilePayloads`.
 *
 * @category Tiling
 */
export interface ComposeOptions {
    /** The analysis type, which selects the tiling parameters; unset uses the wind preset. */
    readonly analysisType?: string | null;
    /** Required when `ground-geometry` is present. */
    readonly terrainContext?: TerrainContext;
}
/**
 * The payload of each tile, as `{ [tileId]: { [group]: data } }`, every group in the tile's
 * own local frame.
 *
 * @category Tiling
 */
export type TilePayloads = Record<string, Record<string, unknown>>;
