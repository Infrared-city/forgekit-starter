import type { KernelTerrain } from "./site-terrain.js";
import { SiteAssignment } from "./site-assign.js";
import type { AreaGeometryGroups, ComposeOptions, IndexedTile, Polygon, TilePayloads } from "./types.js";
/** The compose: the site pass, then one tile at a time. */
export interface ComposeRun {
    /** Membership, ownership and the shrink band, per tile (D63, D84). */
    readonly site: SiteAssignment;
    /** Compose one tile's payload into {@link ComposeRun.payloads}. */
    tile(index: number): void;
    readonly payloads: Record<string, Record<string, unknown>>;
}
/**
 * Assign supported wire geometry groups to non-empty tiles.
 *
 * The shared kernel owns projection, assignment, ownership, the terrain
 * policy, the exact re-anchor into each tile's frame (D48) and, since D98, the
 * canonical bytes of every group and their kernel hashes. Compact
 * `vegetation-instances` has no shared tiling policy yet and is rejected.
 *
 * The answer is FINISHED: every group is in the tile's own frame, so there is
 * no second step between this and the wire.
 */
export declare function composeTilePayloads(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, options?: ComposeOptions): TilePayloads;
/**
 * {@link composeTilePayloads}, one tile at a time, with the site pass kept.
 *
 * `planAreaSubmission` drives THIS one: it yields the thread between tiles
 * (D78) and the facade split reads the kernel's `core`, `shrink_band` and
 * `demoted` off `site` instead of asking the kernel a second time per tile
 * (D63, D90). A tile costs one `JSON.parse` per group of the kernel's own
 * bytes, and each parsed group is remembered with those bytes and its kernel
 * hash, so the reuse path never canonicalises or re-hashes it and digests an
 * identity only when asked.
 */
export declare function beginCompose(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, options?: ComposeOptions, keepKernelSite?: boolean, texts?: ReadonlyMap<object, string>, 
/**
 * Remember each group's arena bytes as its wire text (`internal/wire-json.ts`).
 * ONLY the plan path sets this: its group objects are SDK-owned (the
 * prepared site, D96). `composeTilePayloads` hands its payloads to the
 * caller, who may change them before a submit, so it never remembers.
 */
rememberWire?: boolean, 
/** The terrain read once for `groups["ground-geometry"]` (D200). */
terrain?: KernelTerrain): ComposeRun;
