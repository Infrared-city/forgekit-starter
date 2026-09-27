import type { FrameOrigin } from "./tile-frames.js";
import type { Polygon } from "./types.js";
/**
 * Move one group's METRE-frame entries from `source` into `target`.
 *
 * `entries` is a `{key: mesh}` map in the source frame; the answer is the same
 * map, same keys, same order, with `coordinates` re-anchored and `indices`,
 * `mesh_id` and every other member passed through. The kernel refuses an entry it cannot place, and it names that entry. This is
 * the failure the operation exists to remove: half a payload still in the site
 * frame.
 */
export declare function reanchorEntries(entries: Readonly<Record<string, unknown>>, source: FrameOrigin, target: FrameOrigin): Record<string, unknown>;
/**
 * The site-frame entries a tile was assigned, ready to re-anchor.
 *
 * The ASSIGNMENT is the kernel's — `composeTilePayloads` decides which bodies
 * a tile's context rectangle meets, and this reads that decision back as a key
 * list. Only the COORDINATES come from the site-frame source, because the
 * kernel's copy has already been shifted by the constant offset this replaces.
 * Key order is the kernel's, so the payload's insertion order does not move.
 */
export declare function siteEntriesFor(assigned: Readonly<Record<string, unknown>>, siteGroup: Readonly<Record<string, unknown>>): Record<string, unknown>;
/**
 * What an ACQUIRED buildings object carries: the map, and the frame it is in.
 *
 * `BuildingsService.getBuildingsInArea` returns `AreaBuildings`, whose
 * `origin` names the `LocalFrame` its bodies are expressed in (D1). A bare
 * `{buildingId: mesh}` map carries no frame at all.
 */
interface AcquiredBuildings {
    readonly buildings: Readonly<Record<string, unknown>>;
    readonly origin: readonly [number, number];
}
/**
 * Is this an `AreaBuildings`, or a bare `{buildingId: mesh}` map?
 *
 * The discriminator is `origin`: a two-element array of finite numbers. A
 * mesh is an OBJECT, so a bare map can never put an array under one of its
 * building keys and still compose — `composeTilePayloads` refuses an entry
 * that is not a mesh. `buildings` must be a plain object beside it.
 */
export declare function acquiredBuildings(value: unknown): AcquiredBuildings | undefined;
/**
 * The caller's buildings, in the frame the payload path works in (D48).
 *
 * `runArea` composes and re-anchors in the POLYGON's site frame, and the
 * kernel ASSIGNS a body to a tile by its site-frame coordinates. An
 * `AreaBuildings` acquired for a DIFFERENT polygon is anchored at that
 * polygon's south-west corner, so passing it through unchanged would both
 * assign the bodies to the wrong tiles and put the whole city on the wire
 * translated by the difference between the two corners — silently, because
 * `rejectFullyDroppedTargets` fires only when EVERY tile ends up empty. One
 * exact affine over the map, once, removes it.
 *
 * A recorded origin that differs from this run's site origin is USED, not
 * refused: acquiring once for a large area and running several sub-areas is a
 * supported workflow now that acquisition is a site-level call. A BARE map
 * carries no frame, so it is passed through and keeps today's behaviour — it
 * is assumed to be in this polygon's frame already.
 */
export declare function siteFrameBuildings(value: Readonly<Record<string, unknown>>, polygon: Polygon): Readonly<Record<string, unknown>>;
export {};
