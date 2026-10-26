/**
 * Which request keys a model's body may carry, read from the kernel field
 * registry.
 *
 * `payload.ts` builds each model's body with an ORDERED list: the order of
 * that list is the order of the keys on the wire, and a wire body must not
 * move by one byte. The lists in `payload-aliases.ts` therefore stay the
 * ORDER; the registry decides WHICH keys join them. A field the registry adds
 * for a model reaches the body (after the ordered ones) with no host edit,
 * unless this host names it in {@link NOT_OFFERED}.
 *
 * Both functions need the initialised core and throw `CoreNotReadyError`
 * before it (`registryModels`): the result would otherwise depend on whether
 * the core happened to be ready.
 *
 * Never joined: internal (research) fields, weather columns and the keys the
 * transform assigns itself (`analysis-type`, `time-period`, the wind pair).
 */
import { registryModel, registryModels } from "./field-registry.js";
import { TOP_LEVEL_ALIASES } from "./payload-aliases.js";
/**
 * Registry fields this host does not offer on a model yet (the "missing" half
 * of `public/schemas/conformance/field-registry-host-gaps.json`; the drift
 * test keeps the two equal). A caller's value for one of these is dropped, as
 * it always was.
 */
const NOT_OFFERED = {
    "direct-sun-hours": ["min-coverage", "partial-cells", "vegetation-instances", "representative-days"],
    "daylight-availability": ["min-coverage", "partial-cells", "vegetation-instances", "representative-days"],
    "solar-radiation": ["min-coverage", "partial-cells", "vegetation-instances"],
    "thermal-comfort-index": [
        "annual-clusters", "annual-mode", "context-geometry", "leaf-state", "utci-output", "vegetation-instances",
    ],
    "thermal-comfort-statistics": [
        "annual-clusters", "annual-mode", "context-geometry", "leaf-state", "utci-output", "vegetation-instances",
        "comfort-stats-method",
    ],
    // The pair is built from the weather rows; the host writes no location here.
    "pedestrian-wind-comfort": ["latitude", "longitude", "wind-data", "wind-speed", "wind-direction"],
};
/** Keys the transform sets itself after the pick. */
const ASSIGNED = new Set(["analysis-type", "time-period"]);
const KEBAB = /-([a-z])/g;
/** The camelCase spelling of a wire key. */
export function camelOf(wire) {
    for (const [camel, alias] of TOP_LEVEL_ALIASES)
        if (alias === wire)
            return camel;
    return wire.replace(KEBAB, (_, letter) => letter.toUpperCase());
}
const aliasTables = new WeakMap();
/** The wire spelling of a camelCase key that a registry field of a pick model has. */
export function registryAlias(key) {
    if (!/[A-Z]/.test(key))
        return undefined;
    // Before `initialize` this throws `CoreNotReadyError`: no silent fallback to
    // a smaller table.
    const models = registryModels();
    let table = aliasTables.get(models);
    if (table === undefined) {
        const built = new Map();
        for (const model of PICK_MODELS) {
            for (const field of models.get(model)?.fields ?? []) {
                if (field.internal !== true && field.key.includes("-"))
                    built.set(camelOf(field.key), field.key);
            }
        }
        aliasTables.set(models, built);
        table = built;
    }
    return table.get(key);
}
const PICK_MODELS = [
    "direct-sun-hours", "daylight-availability", "solar-radiation", "thermal-comfort-index",
    "thermal-comfort-statistics", "pedestrian-wind-comfort",
];
/**
 * `ordered` (the host's ordered list for the branch) followed by the registry
 * fields of `model` that list does not name and the host offers.
 */
export function pickKeys(model, ordered) {
    // Throws `CoreNotReadyError` before `initialize`, never a silent fallback.
    const row = registryModel(model);
    if (row === undefined)
        return [...ordered];
    const named = new Set(ordered.map((key) => TOP_LEVEL_ALIASES.get(key) ?? key));
    const refused = new Set(NOT_OFFERED[model] ?? []);
    const joined = [];
    for (const field of row.fields) {
        if (field.internal === true || field.group === "weather" || ASSIGNED.has(field.key))
            continue;
        if (named.has(field.key) || refused.has(field.key))
            continue;
        joined.push(camelOf(field.key));
    }
    return [...ordered, ...joined];
}
