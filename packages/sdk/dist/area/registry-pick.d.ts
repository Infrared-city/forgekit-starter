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
/** The camelCase spelling of a wire key. */
export declare function camelOf(wire: string): string;
/** The wire spelling of a camelCase key that a registry field of a pick model has. */
export declare function registryAlias(key: string): string | undefined;
/**
 * `ordered` (the host's ordered list for the branch) followed by the registry
 * fields of `model` that list does not name and the host offers.
 */
export declare function pickKeys(model: string, ordered: readonly string[]): string[];
