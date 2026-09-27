/**
 * The six GLOBAL thermal controls: the set, the models that read them, the
 * closed `physics` tier list, and the two guards `payload.ts` calls.
 *
 * One module because they are one concept — which fields, who reads them, and
 * what the conversion does when a caller aims them at a model that does not.
 * Splitting the guards from the list they guard is how the two drift.
 */
/**
 * The six GLOBAL thermal controls, valid ONLY on `thermal-comfort-index` and
 * `thermal-comfort-statistics`.
 *
 * They are top-level request fields — the same tier as `subtype` and
 * `analysis-type`, not nested under any sub-object — because the models read
 * them straight off the request map: `physics` at
 * `lambda-models rust/solar-models/src/tci.rs:117` (and `tcs.rs:187`/`:201`),
 * the five material overrides at
 * `rust/solar-models/src/material_overrides_prepared.rs` :70 / :72 / :41 /
 * :103 / :105.
 *
 * NOT added to `SURFACE` or to the solar branches: `solar-radiation`,
 * `direct-sun-hours` and `daylight-availability` never read them, and those
 * branches `pick` a fixed list, so a control passed there is dropped exactly
 * as any other unknown key on that branch is. See `docs/DEVIATIONS.md` D53.
 */
export const THERMAL_CONTROLS = [
    "physics", "wallAlbedo", "wallAbsorptivity", "canopyTransmissivity",
    "groundAlbedo", "groundDtMax",
];
/**
 * Each control as BOTH spellings a caller may reach for: the camelCase name
 * the conversion documents, and the kebab wire name.
 *
 * The guards read both. `normalizeTopLevel` copies an unaliased key straight
 * through, and nothing on the camelCase path forbids mixing the two forms, so a
 * caller who writes `{ analysisType: "solar-radiation", "wall-albedo": 0.3 }`
 * would otherwise slip past a camelCase-only check and have the control dropped
 * by `pick` — exactly the silent loss this guard exists to stop. Python accepts
 * either spelling too (`populate_by_name`) and refuses the unknown one.
 */
export const THERMAL_CONTROL_SPELLINGS = [
    ["physics", "physics"],
    ["wallAlbedo", "wall-albedo"],
    ["wallAbsorptivity", "wall-absorptivity"],
    ["canopyTransmissivity", "canopy-transmissivity"],
    ["groundAlbedo", "ground-albedo"],
    ["groundDtMax", "ground-dt-max"],
];
/**
 * Both spellings, flat — what the thermal branches `pick` with.
 *
 * The pick lists are camelCase because that is the input form they convert,
 * but a caller may mix the two, and a `pick` that names only camelCase DROPS a
 * kebab-spelt control on the very models that read it. Keeping both means the
 * conversion carries whichever the caller wrote; `normalizeTopLevel` maps the
 * camelCase one onto its wire name, passes the wire one through unchanged, and
 * raises `conflicting aliases` if both are given at once.
 */
export const THERMAL_CONTROL_KEYS = [
    ...THERMAL_CONTROLS,
    ...THERMAL_CONTROL_SPELLINGS.filter(([camel, wire]) => camel !== wire).map(([, wire]) => wire),
];
/** The models that read {@link THERMAL_CONTROLS}. Every other one refuses them. */
export const THERMAL_MODELS = new Set([
    "thermal-comfort-index", "thermal-comfort-statistics",
]);
/**
 * The sky/MRT formulation a thermal run selects — a CLOSED set.
 *
 * The two thermal models disagree about what an unknown value means, and only
 * one of them refuses it. `tci.rs:117` matches the string EXACTLY and answers
 * 422 for a value it does not know, so a typo on `thermal-comfort-index` costs
 * nothing. `tcs.rs:187`/`:201` only ask whether the value IS `"v1"`: on
 * `thermal-comfort-statistics` a misspelt `"advnaced"` therefore selects the
 * advanced engine, returns 200 and is FULLY BILLED while the caller believes
 * they picked a tier. The conversion refuses the typo rather than letting one
 * model's leniency hide it. An ABSENT value is not a member — it means the
 * model's own default, `advanced-moist` on both.
 */
export const PHYSICS_TIERS = ["v1", "detail", "advanced", "advanced-moist"];
/**
 * Refuse a thermal-only control on a model that does not read it.
 *
 * `solar-radiation`, `direct-sun-hours` and `daylight-availability` read none
 * of the six (no `material_overrides_prepared` call, no `"physics"` read
 * outside `tci.rs`/`tcs.rs`). Their branches `pick` a fixed list, so before
 * this guard a control passed there was DROPPED in silence and the run billed
 * at the model's defaults — the same silent loss WP15 exists to end, and the
 * one answer Python already gives (`extra="forbid"`). Named per field, so the
 * message says which one to remove. `docs/DEVIATIONS.md` D53.
 */
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
 * `physics` is a CLOSED set, checked here rather than left to the server.
 *
 * `tci.rs:117` answers 422 for an unknown tier, so a typo on
 * `thermal-comfort-index` costs nothing — but `tcs.rs:187`/`:201` only ask
 * whether the value IS `"v1"`, so on `thermal-comfort-statistics` a misspelt
 * tier silently takes the advanced engine, returns 200 and is fully billed.
 */
export function validatePhysics(input) {
    // `physics` is spelled the same either way; the other five are not, which is
    // why the guards read both columns of THERMAL_CONTROL_SPELLINGS.
    const value = input.physics;
    if (value === undefined || value === null)
        return;
    if (typeof value !== "string" || !PHYSICS_TIERS.includes(value)) {
        throw new TypeError(`physics must be one of ${PHYSICS_TIERS.join(", ")} (got ` +
            `${JSON.stringify(value)}). thermal-comfort-statistics does not reject ` +
            "an unknown tier server-side — it runs the advanced engine and bills " +
            "for it — so the spelling is checked here.");
    }
}
