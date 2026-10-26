/**
 * The saved-schedule identity (`configHash`): the kernel's `configHashV2`.
 *
 * The field rule is the kernel's (`ir-geo` `config_hash_v2`, over the field
 * registry): which fields enter the hash, which are dropped, which take their
 * server default when unset, and which keys are refused. This module only
 * builds the two inputs, as the Python host does (`analyses/_config_hash.py`):
 *
 * - the CONTROL body: the prepared payload as the submit path writes it (wire
 *   keys, before tiling rewrites the location and slices the groups) without
 *   the geometry groups, `null` and `undefined`;
 * - the GROUP hashes: one per non-empty geometry group the payload holds.
 *   Terrain uses the kernel handle's hash; every other group goes through the
 *   kernel `configGroupHash`, which owns the rule.
 *
 * A key the registry does not list for the model is the kernel's call: it
 * drops the inert host keys (fields the host class carries for every model
 * although the server ignores them on some) and refuses any other key, before
 * any request. A group with nothing in it hashes to the kernel's empty marker
 * and the kernel leaves it out, so this module never tests for emptiness.
 *
 * `FOLDED_HASH_GROUPS`, `foldHashFields` and the `terrain_slicing` /
 * `tile_location_policy` markers of the v1 hash are gone: the registry
 * decides, and the contract version below refuses every schedule that holds
 * a v1 hash.
 */
/** The kernel's canonical sha256 of `fields` (used for composed identities). */
export declare function kernelConfigHash(fields: Readonly<Record<string, unknown>>): string;
/**
 * The first schedule contract version whose `configHash` is a `configHashV2`.
 *
 * It is the value the resume check reads first (`requireCurrentConfigHash` in
 * `planning.ts`); `SCHEDULE_CONTRACT_VERSION` (`weather-guard.ts`) is what a
 * new schedule writes, and is never below this. A schedule saved by SDK 0.13
 * or older holds a v1 hash (the host's own field list, group folds and
 * markers) that cannot equal a v2 hash of the same inputs.
 */
export declare const CONFIG_HASH_V2_CONTRACT_VERSION = 10;
/** The kernel terrain handle's hash, when the handle is still held. */
export interface TerrainHash {
    readonly groupHash: string | undefined;
}
/** The control body and the group hashes of one payload (see the module docs). */
export declare function hashInputs(model: string, payload: Readonly<Record<string, unknown>>, terrain?: TerrainHash): {
    readonly control: Record<string, unknown>;
    readonly groups: Record<string, string>;
};
/** The kernel `configHashV2` of one prepared payload. */
export declare function scheduleConfigHash(model: string, payload: Readonly<Record<string, unknown>>, terrain?: TerrainHash, now?: Date): string;
