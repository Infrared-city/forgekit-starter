import type { KernelTerrain } from "./site-terrain.js";
import type { Slice } from "./cooperative.js";
import type { SiteAnswer, SiteAssignment } from "./site-assign.js";
import type { RunAreaOptions } from "./run-options.js";
import type { AreaGeometryGroups, IndexedTile, Polygon, Tile } from "./types.js";
/**
 * The LAYER stage of `planAreaSubmission`: which geometry groups the run
 * carries, and the kernel compose that cuts them into tiles.
 *
 * Split out of `planning.ts` for the 400-line file cap (root `CLAUDE.md`
 * rule 8) when WP-3 made the stage cooperative. Nothing else calls it.
 */
export declare const GROUP_KEYS: readonly ["geometries", "context-geometry", "ground-geometry", "vegetation", "ground-materials"];
export declare function geometryGroups(payload: Record<string, unknown>, options: RunAreaOptions, polygon: Polygon, analysisTypes: readonly string[]): AreaGeometryGroups;
export declare function indexed(grid: readonly (readonly Tile[])[]): {
    tiles: IndexedTile[];
    byId: Map<string, Tile>;
};
/**
 * The LAYER stage, one tile at a time, yielding between them.
 *
 * Cutting this stage into parts was tried in WP-3 and reverted: the compose
 * re-read the WHOLE site geometry on every call, so the cost was per CALL, not
 * per tile — 49 tiles cost about 3.5 s warm in one call and 59.9 s in
 * forty-nine, about 1.2 s of fixed cost each (`scripts/perf/facade-planning.mjs`).
 * D90 removed the fixed cost: the site is read ONCE into a `SiteAssignment`
 * before the loop, and since D98 a tile costs one `JSON.parse` per group of
 * the kernel's arena, so the natural yield point is the tile boundary and
 * slicing is free.
 *
 * Returns the composed payloads and the site pass beside them — the facade
 * split reads its `core`, `shrink_band` and `demoted` rather than asking the
 * kernel a second time per tile (D63).
 */
export declare function composeTiles(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, options: {
    analysisType: string;
    terrainContextMarginM: number;
    keepKernelSite?: boolean;
    /** Group texts the site key already wrote (`prepared-site.ts`). */
    texts?: ReadonlyMap<object, string>;
    /** The terrain read once for this plan (D200). */
    terrain?: KernelTerrain;
}, slice: Slice): Promise<{
    /** Every tile's groups, parsed on the first ask: a GRID run asks, a facade run never does. */
    composed: (slice: Slice) => Promise<Record<string, Record<string, unknown>>>;
    site: SiteAssignment;
}>;
export declare function rejectFullyDroppedTargets(groups: AreaGeometryGroups, site: SiteAnswer): void;
