type Replacer = (this: unknown, key: string, value: unknown) => unknown;
/**
 * A `JSON.stringify` replacer that writes a typed array (a caller's
 * `Float64Array` coordinates or `Uint32Array` indices) as the plain array it
 * holds, as the mesh utilities' views write themselves (D294).
 */
export declare function typedAsArray(_key: string, value: unknown): unknown;
/**
 * `TextEncoder().encode(JSON.stringify(body, replacer))`, with each top-level
 * kernel group written from its own bytes.
 *
 * `undefined` where `JSON.stringify` gives `undefined`. A throw from
 * `JSON.stringify` (a cycle, a BigInt) is thrown here too.
 */
export declare function jsonWireBytes(body: Readonly<Record<string, unknown>>, replacer?: Replacer): Uint8Array | undefined;
/**
 * `TextEncoder().encode(JSON.stringify(body, replacer))`, with each top-level
 * value for which `known` answers written from that answer instead.
 *
 * `known(value)` must be exactly the UTF-8 of `JSON.stringify(value)` as it
 * is written INSIDE `body`: no `toJSON` on the value and no replacer that
 * would change it. A value with a `toJSON` method is never asked about. A
 * `KernelGroup` is always written from its own kernel text.
 */
export declare function spliceJsonBytes(body: Readonly<Record<string, unknown>>, known: (value: unknown) => Uint8Array | undefined, replacer?: Replacer): Uint8Array | undefined;
export {};
