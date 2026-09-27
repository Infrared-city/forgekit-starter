/** Remember `bytes` as the exact JSON text of `value`, parsed from them. */
export declare function rememberWireText(value: object, bytes: Uint8Array): void;
/** True when the text has a key made only of digits. */
export declare function hasDigitKey(bytes: Uint8Array): boolean;
type Replacer = (this: unknown, key: string, value: unknown) => unknown;
/**
 * `TextEncoder().encode(JSON.stringify(body, replacer))`, byte for byte, with
 * each remembered top-level value written from its remembered text.
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
