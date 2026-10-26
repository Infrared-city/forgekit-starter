/**
 * The six GLOBAL thermal controls: the set, the models that read them, the
 * closed `physics` tier list, and the two guards `payload.ts` calls.
 *
 * One module because they are one concept — which fields, who reads them, and
 * what the conversion does when a caller aims them at a model that does not.
 * Splitting the guards from the list they guard is how the two drift.
 */
import type { AnyRecord } from "./payload-types.js";
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
export declare const THERMAL_CONTROLS: readonly ["physics", "wallAlbedo", "wallAbsorptivity", "canopyTransmissivity", "groundAlbedo", "groundDtMax"];
/**
 * Each thermal control as a pair of its two spellings: the camelCase name and the kebab-case
 * wire name (`[ "wallAlbedo", "wall-albedo" ]`).
 *
 * @category Requests
 */
export declare const THERMAL_CONTROL_SPELLINGS: readonly (readonly [string, string])[];
/**
 * Every thermal control key in both spellings, flat: the camelCase names and the kebab-case
 * wire names.
 *
 * @category Requests
 */
export declare const THERMAL_CONTROL_KEYS: readonly string[];
/**
 * The analysis types that read the thermal controls: `thermal-comfort-index` and
 * `thermal-comfort-statistics`. Every other analysis refuses them.
 *
 * @category Requests
 */
export declare const THERMAL_MODELS: ReadonlySet<string>;
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
export declare const PHYSICS_TIERS: readonly ["v1", "detail", "advanced", "advanced-moist"];
/**
 * One of the values in `PHYSICS_TIERS`.
 *
 * @category Requests
 */
export type PhysicsTier = (typeof PHYSICS_TIERS)[number];
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
export declare function rejectThermalControls(input: AnyRecord, type: string): void;
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
export declare function validatePhysics(input: AnyRecord): void;
/**
 * Applies the `physics` policy of an analysis type: refuses a rejected value and warns once
 * about a deprecated one. A model without a `physics` field, or an unset value, is left alone.
 *
 * @param input - The analysis input to check.
 * @param type - The analysis type of the input.
 * @throws {TypeError} when `physics` holds a value that `type` does not accept.
 * @category Requests
 */
export declare function enforcePhysicsPolicy(input: AnyRecord, type: string): void;
