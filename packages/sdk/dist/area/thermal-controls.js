/**
 * The six GLOBAL thermal controls: the set, the models that read them, the
 * closed `physics` tier list, and the two guards `payload.ts` calls.
 *
 * One module because they are one concept — which fields, who reads them, and
 * what the conversion does when a caller aims them at a model that does not.
 * Splitting the guards from the list they guard is how the two drift.
 */
import { knownValues, registryModel } from "./field-registry.js";
/**
 * The six global thermal controls: `physics`, `wallAlbedo`, `wallAbsorptivity`,
 * `canopyTransmissivity`, `groundAlbedo` and `groundDtMax`.
 *
 * They are valid only on `thermal-comfort-index` and `thermal-comfort-statistics`, and are
 * top-level request fields, at the same level as `subtype` and `analysis-type`, not nested
 * under any sub-object. Passing one to any other analysis is refused.
 *
 * @category Requests
 */
// Maintainer note (not published): top-level because the models read them straight off the
// request map: `physics` at `lambda-models rust/solar-models/src/tci.rs:117` (and
// `tcs.rs:187`/`:201`), the five material overrides at
// `rust/solar-models/src/material_overrides_prepared.rs` :70 / :72 / :41 / :103 / :105.
// NOT added to `SURFACE` or to the solar branches: `solar-radiation`, `direct-sun-hours` and
// `daylight-availability` never read them, and those branches `pick` a fixed list, so a control
// passed there is dropped exactly as any other unknown key on that branch is. See
// `docs/DEVIATIONS.md` D53.
export const THERMAL_CONTROLS = [
    "physics", "wallAlbedo", "wallAbsorptivity", "canopyTransmissivity",
    "groundAlbedo", "groundDtMax",
];
/**
 * Each thermal control as a pair of its two spellings: the camelCase name and the kebab-case
 * wire name (`[ "wallAlbedo", "wall-albedo" ]`).
 *
 * @category Requests
 */
// Maintainer note (not published): the guards read both. `normalizeTopLevel` copies an unaliased
// key straight through, and nothing on the camelCase path forbids mixing the two forms, so a
// caller who writes `{ analysisType: "solar-radiation", "wall-albedo": 0.3 }` would otherwise
// slip past a camelCase-only check and have the control dropped by `pick` -- exactly the silent
// loss this guard exists to stop. Python accepts either spelling too (`populate_by_name`) and
// refuses the unknown one.
export const THERMAL_CONTROL_SPELLINGS = [
    ["physics", "physics"],
    ["wallAlbedo", "wall-albedo"],
    ["wallAbsorptivity", "wall-absorptivity"],
    ["canopyTransmissivity", "canopy-transmissivity"],
    ["groundAlbedo", "ground-albedo"],
    ["groundDtMax", "ground-dt-max"],
];
/**
 * Every thermal control key in both spellings, flat: the camelCase names and the kebab-case
 * wire names.
 *
 * @category Requests
 */
// Maintainer note (not published): what the thermal branches `pick` with. The pick lists are
// camelCase because that is the input form they convert, but a caller may mix the two, and a
// `pick` that names only camelCase DROPS a kebab-spelt control on the very models that read it.
// Keeping both means the conversion carries whichever the caller wrote; `normalizeTopLevel` maps
// the camelCase one onto its wire name, passes the wire one through unchanged, and raises
// `conflicting aliases` if both are given at once.
export const THERMAL_CONTROL_KEYS = [
    ...THERMAL_CONTROLS,
    ...THERMAL_CONTROL_SPELLINGS.filter(([camel, wire]) => camel !== wire).map(([, wire]) => wire),
];
/**
 * The analysis types that read the thermal controls: `thermal-comfort-index` and
 * `thermal-comfort-statistics`. Every other analysis refuses them.
 *
 * @category Requests
 */
export const THERMAL_MODELS = new Set([
    "thermal-comfort-index", "thermal-comfort-statistics",
]);
/**
 * The accepted values of `physics`, the sky and mean-radiant-temperature formulation of a
 * thermal run. The set is closed: any other value is refused before the request is sent.
 *
 * Leave `physics` unset to get the model's own default, `advanced-moist`. On
 * `thermal-comfort-index`, `"v1"` and `"detail"` are deprecated: they still run, with one
 * warning per value per process. On `thermal-comfort-statistics`, `"detail"` is rejected before
 * submit. New code should leave `physics` unset or use `"advanced"` or `"advanced-moist"`. A
 * later release will remove `"v1"` and `"detail"`.
 *
 * @category Requests
 */
// Maintainer note (not published): the two thermal models disagree about what an unknown value
// means, and only one of them refuses it. `tci.rs:117` matches the string EXACTLY and answers 422
// for a value it does not know, so a typo on `thermal-comfort-index` costs nothing.
// `tcs.rs:187`/`:201` only ask whether the value IS `"v1"`: on `thermal-comfort-statistics` a
// misspelt `"advnaced"` therefore selects the advanced engine, returns 200 and is FULLY BILLED
// while the caller believes they picked a tier. The conversion refuses the typo rather than
// letting one model's leniency hide it. An ABSENT value is not a member -- it means the model's
// own default, `advanced-moist` on both. The public constant mirrors the kernel field registry's
// `physics` rows (`validatePhysics` reads the registry itself); the deprecated values stay in
// this set because removing them would turn a working request into a hard error.
export const PHYSICS_TIERS = ["v1", "detail", "advanced", "advanced-moist"];
/**
 * Refuses a thermal-only control on an analysis that does not read it.
 *
 * Without this check, such a control would be dropped silently and the run billed at the
 * model's defaults. The error names the field to remove.
 *
 * @param input - The analysis input to check.
 * @param type - The analysis type of the input.
 * @throws {TypeError} when `input` sets one of the six thermal controls (either spelling).
 * @category Requests
 */
// Maintainer note (not published): `solar-radiation`, `direct-sun-hours` and
// `daylight-availability` read none of the six (no `material_overrides_prepared` call, no
// `"physics"` read outside `tci.rs`/`tcs.rs`). Their branches `pick` a fixed list, so before this
// guard a control passed there was DROPPED in silence and the run billed at the model's defaults
// -- the same silent loss WP15 exists to end, and the one answer Python already gives
// (`extra="forbid"`). Named per field. `docs/DEVIATIONS.md` D53.
export function rejectThermalControls(input, type) {
    for (const [camel, wire] of THERMAL_CONTROL_SPELLINGS) {
        const key = input[camel] !== undefined && input[camel] !== null
            ? camel
            : (input[wire] !== undefined && input[wire] !== null ? wire : undefined);
        if (key === undefined)
            continue;
        throw new TypeError(`${key} is not read by ${type}: the six global thermal controls ` +
            `(${THERMAL_CONTROLS.join(", ")}) are inputs to ` +
            `thermal-comfort-index and thermal-comfort-statistics only. Remove it, ` +
            "or run one of those two.");
    }
}
/**
 * Checks that `physics` is one of the accepted tiers, before any request is sent.
 *
 * An unset or `null` value passes. `"v1"` and `"detail"` are deprecated on
 * `thermal-comfort-index` (one warning per value per process), and `"detail"` is rejected on
 * `thermal-comfort-statistics`. Leave `physics` unset, or use `"advanced"` or `"advanced-moist"`.
 *
 * @param input - The analysis input to check.
 * @throws {TypeError} when `physics` is set to anything other than an accepted tier.
 * @category Requests
 */
// Maintainer note (not published): `tci.rs:117` answers 422 for an unknown tier, so a typo on
// `thermal-comfort-index` costs nothing -- but `tcs.rs:187`/`:201` only ask whether the value IS
// `"v1"`, so on `thermal-comfort-statistics` a misspelt tier silently takes the advanced engine,
// returns 200 and is fully billed. Both lists come from the registry.
export function validatePhysics(input) {
    // `physics` is spelled the same either way; the other five are not, which is
    // why the guards read both columns of THERMAL_CONTROL_SPELLINGS.
    const value = input.physics;
    if (value === undefined || value === null)
        return;
    // The closed set is the registry's (both thermal models, deprecated and
    // refused values included); `PHYSICS_TIERS` below is the public mirror of
    // it, pinned equal by a test.
    const tiers = knownValues([...THERMAL_MODELS], "physics");
    if (typeof value !== "string" || !tiers.includes(value)) {
        throw new TypeError(`physics must be one of ${tiers.join(", ")} (got ` +
            `${JSON.stringify(value)}). thermal-comfort-statistics does not reject ` +
            "an unknown tier server-side — it runs the advanced engine and bills " +
            "for it — so the spelling is checked here.");
    }
}
/**
 * Applies the `physics` policy of an analysis type: refuses a rejected value and warns once
 * about a deprecated one. A model without a `physics` field, or an unset value, is left alone.
 *
 * @param input - The analysis input to check.
 * @param type - The analysis type of the input.
 * @throws {TypeError} when `physics` holds a value that `type` does not accept.
 * @category Requests
 */
// Maintainer note (not published): `validatePreparedAnalysisRequest` calls it, so every path
// (area input, wire body, `JobsService.submit`) runs it.
export function enforcePhysicsPolicy(input, type) {
    const value = input.physics;
    if (typeof value !== "string")
        return;
    const field = registryModel(type)?.byKey.get("physics");
    const refused = field?.rejectedValues?.[value];
    if (refused !== undefined) {
        throw new TypeError(`physics ${JSON.stringify(value)} is not accepted by ${type}: ${refused} ` +
            `Use one of ${(field?.enum ?? []).join(", ")}, or leave physics unset.`);
    }
    if (field?.deprecatedValues?.[value] !== undefined)
        warnPhysicsDeprecated(value);
}
/** The deprecated values already announced in this process. */
const physicsWarned = new Set();
/**
 * Print the deprecation notice for one `physics` value, once per process.
 *
 * A deprecated value still runs and bills the same: this warns only. Uses
 * Node's own deprecation-warning channel (`process.emitWarning`, type
 * `DeprecationWarning`) and falls back to `console.warn` where `process` does
 * not exist (browser build).
 */
function warnPhysicsDeprecated(value) {
    if (physicsWarned.has(value))
        return;
    physicsWarned.add(value);
    const message = `The '${value}' physics tier is deprecated. Use the default tier (leave ` +
        `'physics' unset). A later release will remove '${value}'.`;
    if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
        process.emitWarning(message, "DeprecationWarning");
    }
    else {
        console.warn(`DeprecationWarning: ${message}`);
    }
}
