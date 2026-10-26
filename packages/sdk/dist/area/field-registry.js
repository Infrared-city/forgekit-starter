/**
 * The kernel field registry, read once per core (`fieldRegistryJson`).
 *
 * The registry (`ir-schemas` `FIELD_META`) names every request field of every
 * model: wire key, hash class, server default, enum and range. This package
 * reads it instead of keeping field lists of its own: which models take a
 * field (request validation), which keys a model's body may carry (the pick
 * lists in `payload.ts`), the closed value sets, and which fields the
 * schedule hash drops or hashes as a group (`config-hash.ts`).
 *
 * The parsed document is cached per core object, so a second initialised core
 * (a test, a reload) never reads the first one's rows.
 */
import { requireCore } from "../internal/core.js";
let cached;
/** Every model of the registry, by wire name. */
export function registryModels() {
    const core = requireCore();
    if (cached?.core === core)
        return cached.models;
    const document = JSON.parse(core.fieldRegistryJson());
    const models = new Map();
    for (const [name, row] of Object.entries(document.models)) {
        models.set(name, { fields: row.fields, byKey: new Map(row.fields.map((f) => [f.key, f])) });
    }
    cached = { core, models };
    return models;
}
/** The registry row of `model`, or `undefined` for a model it does not name. */
export function registryModel(model) {
    return registryModels().get(model);
}
/** The wire names of the models whose registry row lists `key`. */
export function modelsWithField(key) {
    const names = new Set();
    for (const [name, row] of registryModels())
        if (row.byKey.has(key))
            names.add(name);
    return names;
}
/** The closed value set of `model`'s `key`, or `undefined` when it has none. */
export function fieldEnum(model, key) {
    return registryModel(model)?.byKey.get(key)?.enum;
}
/**
 * Every value the registry knows for a field of one or more models: the enum,
 * the deprecated values and the values the server refuses. A deprecated value
 * still runs; a value a model refuses is the caller's mistake and the
 * server's to report.
 */
export function knownValues(models, key) {
    const values = new Set();
    for (const model of models) {
        const field = registryModel(model)?.byKey.get(key);
        if (field === undefined)
            continue;
        for (const value of field.enum ?? [])
            values.add(String(value));
        for (const value of Object.keys(field.deprecatedValues ?? {}))
            values.add(value);
        for (const value of Object.keys(field.rejectedValues ?? {}))
            values.add(value);
    }
    return [...values];
}
/** The lower bound of `model`'s numeric `key`, if the registry states one. */
export function fieldMinimum(model, key) {
    return registryModel(model)?.byKey.get(key)?.minimum;
}
/** Forget the parsed registry. For tests that stand in another document. */
export function clearFieldRegistryCache() {
    cached = undefined;
}
