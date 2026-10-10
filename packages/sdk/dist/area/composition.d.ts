import type { KernelTerrain } from "./site-terrain.js";
import { SiteAssignment } from "./site-assign.js";
import type { AreaGeometryGroups, ComposeOptions, IndexedTile, Polygon, TilePayloads } from "./types.js";
/**
 * A compose in progress: the site pass is done and tiles are composed one at a time.
 *
 * @category Tiling
 */
export interface ComposeRun {
    /** Membership, ownership and the shrink band, per tile. */
    readonly site: SiteAssignment;
    /**
     * Composes one tile's payload into `payloads`.
     *
     * @param index - The tile's position in the `tiles` array given to the compose.
     * @throws {RangeError} when `index` is outside the array.
     */
    tile(index: number): void;
    /** The payloads composed so far, keyed by tile id and then by geometry group. */
    readonly payloads: Record<string, Record<string, unknown>>;
}
/**
 * Assigns supported geometry groups to the non-empty tiles of a grid.
 *
 * Each tile's payload comes back finished: every group is already in the tile's own local
 * frame, with the terrain policy applied, so it can be sent as it is. Compact
 * `vegetation-instances` has no tiling policy yet and is rejected.
 *
 * @param groups - The geometry groups to cut into tiles.
 * @param tiles - The tiles to compose, with their grid positions.
 * @param polygon - The area polygon the tiles cover.
 * @param options - The analysis type, and `terrainContext` (required with `ground-geometry`).
 * @returns The payload of each tile, keyed by tile id.
 * @throws {TypeError} when a group is unknown or has no tiling policy, a mesh uses packed binary
 *   coordinates, `ground-geometry` is given without `terrainContext`, or a tile row or column is
 *   not an integer from 0 through 4,294,967,295.
 * @category Tiling
 */
export declare function composeTilePayloads(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, options?: ComposeOptions): TilePayloads;
/**
 * Like `composeTilePayloads`, but one tile at a time, keeping the site pass.
 *
 * Call `tile(index)` on the returned run for each tile, yielding between tiles if needed.
 * Each tile costs one JSON parse per group.
 *
 * @param groups - The geometry groups to cut into tiles.
 * @param tiles - The tiles to compose, with their grid positions.
 * @param polygon - The area polygon the tiles cover.
 * @param options - The analysis type, and `terrainContext` (required with `ground-geometry`).
 * @param keepKernelSite - Keeps the site pass on the run for later steps that read it.
 * @param texts - The JSON text of group documents already serialised, to avoid writing them again.
 * @param rememberWire - Remembers each group's serialised text for later reuse; only for group
 *   objects the SDK owns.
 * @param terrain - The terrain read once for `groups["ground-geometry"]`.
 * @returns The compose run.
 * @throws {TypeError} as `composeTilePayloads`.
 * @category Tiling
 */
export declare function beginCompose(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, options?: ComposeOptions, keepKernelSite?: boolean, texts?: ReadonlyMap<object, string>, rememberWire?: boolean, terrain?: KernelTerrain): ComposeRun;
