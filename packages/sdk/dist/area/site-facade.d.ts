import type { ArtifactLimits } from "../internal/binary-artifact.js";
import type { FacadeArtifact } from "../internal/facade-artifact-guard.js";
import type { Slice } from "./cooperative.js";
import type { SiteAnswer, TileAnswer } from "./site-assign.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { IndexedTile } from "./types.js";
/**
 * Facade batches from the kernel `Site`, the path the Python host takes
 * (`_area/_submission_plan.py`, `Site.facade_batches` / `facade_frames`).
 *
 * The kernel selects each tile's targets (the whole-grid core, or the owner a
 * saved schedule recorded), counts their sensors and splits them into exact
 * (policy 2) batches, all from the site it already holds. Before this, the
 * host wrote every tile's owned buildings back to JSON text for
 * `planExactSurfaceBatchesCapped`, which parsed it again — once for the
 * preview and once more for the run. The request carries policy knobs and
 * saved ids only, never geometry.
 *
 * Each batch's body groups are the kernel's too: `Site.facadeFrames` writes
 * the batch's targets, the rest of the tile as context and the tile's
 * terrain, trees and ground materials as canonical JSON with their group
 * hashes, when a job of the tile is submitted (`internal/kernel-group.ts`).
 * The host never composes, moves, canonicalises or hashes a mesh map of a
 * facade job. A binary job uploads its artifact and a pretty job replays its
 * capture from the same call. One call answers every batch of a tile and
 * builds the tile once (WP3); this host does not thread it. What stays here
 * is the host's half: the request, the job keys and the order of the body's
 * fields.
 */
/** One batch as the kernel answers it, with the job key the kernel wrote. */
export interface FacadeRecord {
    readonly tile_index: number;
    readonly active_ids: readonly string[];
    readonly sensor_count: number | null;
    readonly saved_key: string | null;
    readonly key: string;
}
/** One facade job: its key, its body and what it analyses. */
export interface FacadeBatch {
    readonly key: string;
    readonly payload: Record<string, unknown>;
    readonly buildingIds: readonly string[];
    readonly sensorCount: number;
    /** The kernel's pretty capture for the body's `terrain-alignment` (`null`: unsent). */
    readonly capture: (alignment: string | null) => Uint8Array;
    /** The batch's binary artifact (D156), when the site answers artifacts. */
    readonly artifact?: (boxTrees: boolean, limits: ArtifactLimits) => FacadeArtifact;
}
/**
 * The kernel request for this run: only what the caller set, and a retry's
 * saved batches. The kernel parser owns every default and type check (D160),
 * the same rule the Python host sends to (`_area/_native_facade_plan.py`).
 */
export declare function facadeRequest(payload: Readonly<Record<string, unknown>>, tiles: readonly IndexedTile[], retryFrom: AreaSchedule | undefined, maxSensorsPerJob: number | undefined): Record<string, unknown>;
/**
 * Every tile's batches in `selected`, one kernel call per tile with the
 * thread handed back between them. A fresh plan (no saved batches) is a pure
 * function of the site and the request, so it is kept on the site answer and
 * a run after its preview does not count the sensors a second time.
 */
export declare function planFacadeRecords(site: SiteAnswer, tileCount: number, selected: ReadonlySet<number>, request: Readonly<Record<string, unknown>>, slice: Slice): Promise<ReadonlyMap<number, readonly FacadeRecord[]>>;
/** The body order: the payload's fields, the carried groups, the location. */
export declare function facadeTileBase(base: Readonly<Record<string, unknown>>, carried: readonly string[], location: {
    readonly latitude: number;
    readonly longitude: number;
} | undefined): Record<string, unknown>;
/**
 * One tile's facade jobs from the kernel's records: the key, the targets, the
 * sensor count, and a body whose groups the kernel writes when it is sent.
 *
 * `value` is {@link facadeTileBase}. `present` is the tile's mask from
 * `Site.identity` (bit `i` for `ARENA_GROUPS[i]`): which tile-level groups
 * hold anything, known without writing a body.
 */
export declare function facadeBatchesForTile(value: Readonly<Record<string, unknown>>, tileId: string, tileIndex: number, records: readonly FacadeRecord[], site: SiteAnswer, answer: TileAnswer, present: number, 
/** Whether the plan submits a batch; a retry submits only some. */
submits?: (record: FacadeRecord) => boolean): FacadeBatch[];
