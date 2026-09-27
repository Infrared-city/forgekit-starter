export type Position = readonly [number, number] | readonly [number, number, number];
export interface Polygon {
    readonly type: "Polygon";
    readonly coordinates: readonly (readonly Position[])[];
}
export interface Point {
    readonly latitude: number;
    readonly longitude: number;
}
export interface Tile {
    readonly tileId: string;
    readonly empty: boolean;
    readonly centroid: Point;
    readonly size: {
        readonly x: number;
        readonly y: number;
    };
}
export interface IndexedTile {
    readonly row: number;
    readonly col: number;
    readonly tileId: string;
}
export interface TilingConfig {
    readonly inferenceSizeM: number;
    readonly inferenceSizeCells: number;
    readonly contextSizeM: number;
    readonly stepM: number;
    readonly stepCells: number;
    readonly cellSizeM: number;
}
/**
 * The terrain option the kernel reads: the caller's extra reach in metres,
 * FLOORED at the family's context margin — never added to it.
 *
 * The three modes it replaces (`clip` / `buffer` / `whole`) are gone. `buffer`
 * was the only one this SDK ever sent, and the kernel ADDED its `radius_m` to
 * the context margin, so a solar run reached 128 + 128 = 256 m past the tile
 * while Python and .NET reached 148 m. There is one rule now (DEVIATIONS D86);
 * a mode key that is still present is refused rather than ignored.
 */
export type TerrainContext = {
    readonly margin_m: number;
};
export type SupportedAreaGroup = "geometries" | "context-geometry" | "ground-geometry" | "vegetation" | "ground-materials";
/** A flat JSON mesh accepted by the current area tiling binding. */
export type JsonTilingMesh = Readonly<Record<string, unknown>> & {
    readonly coordinates?: readonly number[];
    readonly indices?: readonly number[];
    readonly coordinates_bin?: never;
    readonly indices_bin?: never;
};
export interface AreaGeometryGroups {
    readonly geometries?: Readonly<Record<string, JsonTilingMesh>>;
    readonly "context-geometry"?: Readonly<Record<string, JsonTilingMesh>>;
    readonly "ground-geometry"?: Readonly<Record<string, JsonTilingMesh>>;
    readonly vegetation?: Readonly<Record<string, unknown>>;
    readonly "ground-materials"?: Readonly<Record<string, unknown>>;
}
export interface ComposeOptions {
    readonly analysisType?: string | null;
    /** Required when `ground-geometry` is present. */
    readonly terrainContext?: TerrainContext;
}
export type TilePayloads = Record<string, Record<string, unknown>>;
