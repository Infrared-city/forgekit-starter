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
export type HashClass = "value" | "group" | "exclude";
/** One row of a model's field table, as the registry writes it. */
export interface RegistryField {
    readonly key: string;
    readonly type: string;
    readonly hash: HashClass;
    readonly group?: string;
    readonly internal?: boolean;
    readonly enum?: readonly unknown[];
    readonly minimum?: number;
    readonly maximum?: number;
    readonly exclusiveMinimum?: number;
    readonly serverDefault?: unknown;
    readonly deprecatedValues?: Readonly<Record<string, string>>;
    readonly rejectedValues?: Readonly<Record<string, string>>;
}
export interface RegistryModel {
    readonly fields: readonly RegistryField[];
    /** `key -> field`, built once. */
    readonly byKey: ReadonlyMap<string, RegistryField>;
}
/** Every model of the registry, by wire name. */
export declare function registryModels(): ReadonlyMap<string, RegistryModel>;
/** The registry row of `model`, or `undefined` for a model it does not name. */
export declare function registryModel(model: string): RegistryModel | undefined;
/** The wire names of the models whose registry row lists `key`. */
export declare function modelsWithField(key: string): ReadonlySet<string>;
/** The closed value set of `model`'s `key`, or `undefined` when it has none. */
export declare function fieldEnum(model: string, key: string): readonly string[] | undefined;
/**
 * Every value the registry knows for a field of one or more models: the enum,
 * the deprecated values and the values the server refuses. A deprecated value
 * still runs; a value a model refuses is the caller's mistake and the
 * server's to report.
 */
export declare function knownValues(models: readonly string[], key: string): string[];
/** The lower bound of `model`'s numeric `key`, if the registry states one. */
export declare function fieldMinimum(model: string, key: string): number | undefined;
/** Forget the parsed registry. For tests that stand in another document. */
export declare function clearFieldRegistryCache(): void;
