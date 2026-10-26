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
import { requireCore } from "../internal/core.js";
import { registryModel } from "./field-registry.js";
/** The kernel's canonical sha256 of `fields` (used for composed identities). */
export function kernelConfigHash(fields) {
    return requireCore().configHash(JSON.stringify(fields));
}
/**
 * The first schedule contract version whose `configHash` is a `configHashV2`.
 *
 * It is the value the resume check reads first (`requireCurrentConfigHash` in
 * `planning.ts`); `SCHEDULE_CONTRACT_VERSION` (`weather-guard.ts`) is what a
 * new schedule writes, and is never below this. A schedule saved by SDK 0.13
 * or older holds a v1 hash (the host's own field list, group folds and
 * markers) that cannot equal a v2 hash of the same inputs.
 */
export const CONFIG_HASH_V2_CONTRACT_VERSION = 10;
/** The control body and the group hashes of one payload (see the module docs). */
export function hashInputs(model, payload, terrain) {
    const row = registryModel(model);
    if (row === undefined) {
        throw new Error(`the kernel field registry has no model ${JSON.stringify(model)}: its config hash cannot be built`);
    }
    const classes = new Map();
    for (const field of row.fields)
        classes.set(field.key, field.hash);
    const core = requireCore();
    // Inert keys are skipped here, before any value is touched; the kernel drops them too.
    const inert = new Set(core.inertKeys(model));
    const control = {};
    const groups = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined)
            continue;
        const hashClass = classes.get(key);
        if (hashClass === undefined) {
            if (!inert.has(key))
                control[key] = value;
            continue;
        }
        if (hashClass === "exclude")
            continue;
        if (hashClass === "value") {
            control[key] = value;
            continue;
        }
        // The handle hashes by the outdoor mesh rule; the interior models hash
        // their terrain as a document, so they go through `configGroupHash`.
        const known = key === "ground-geometry" && core.terrainHandleHashApplies(model) ? terrain?.groupHash : undefined;
        groups[key] = typeof known === "string" ? known : core.configGroupHash(model, key, JSON.stringify(value));
    }
    return { control, groups };
}
/**
 * The year the server uses for an energy-balance request that sets none: the
 * kernel rule, with the JavaScript clock (wasm has none). Hashed, never sent.
 */
function resolvedBalanceYear(control, now) {
    const series = control["dry-bulb-temperature"];
    // A typed array counts too (a caller may hand over a Float64Array).
    const rows = Array.isArray(series) || ArrayBuffer.isView(series) ? series.length : 0;
    return requireCore().energyBalanceYear(undefined, now.getUTCFullYear(), rows);
}
/** The kernel `configHashV2` of one prepared payload. */
export function scheduleConfigHash(model, payload, terrain, now = new Date()) {
    const { control, groups } = hashInputs(model, payload, terrain);
    if (model === "energy-balance" && control.year === undefined)
        control.year = resolvedBalanceYear(control, now);
    return requireCore().configHashV2(model, JSON.stringify(control), JSON.stringify(groups));
}
