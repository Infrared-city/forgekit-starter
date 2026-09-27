export interface CanonicalSnapshot {
    readonly value: unknown;
    readonly bytes: Uint8Array;
}
/** Return one owned canonical value and its exact JSON bytes. */
export declare function canonicalSnapshot(value: unknown): CanonicalSnapshot | undefined;
/** Return stable JSON content bytes, or undefined when the value has no exact JSON form. */
export declare function canonicalJsonBytes(value: unknown): Uint8Array | undefined;
/** A lowercase hex SHA-256 over the concatenation of `parts`, fed in order. */
type Sha256Native = (parts: readonly Uint8Array[]) => string;
/**
 * Install the runtime's own digest. Only the Node package entry points do
 * this (`node:crypto` `createHash`), so a browser bundle never imports it.
 * `undefined` removes it (tests of the browser shape).
 */
export declare function setSha256Native(value: Sha256Native | undefined): void;
/** Return a lowercase SHA-256 digest of `bytes`. */
export declare function sha256Hex(bytes: Uint8Array): Promise<string | undefined>;
/**
 * Return the lowercase SHA-256 digest of the concatenation of `parts`.
 *
 * The native digest comes first when a Node entry installed it: it hashes the
 * parts in place with no copy and no concatenation, and it is faster than
 * WebCrypto on Node (measured on Node 22: 1,483 against 720 MB/s, and 2.6
 * against 17 us for each 2 KB call). Node 19 and later also has
 * `globalThis.crypto`, so this order is what makes the adapter used at all.
 * Other runtimes use WebCrypto, which takes one owned buffer. The digest is
 * the same on every path.
 */
export declare function sha256HexParts(parts: readonly Uint8Array[]): Promise<string | undefined>;
/** One new buffer with the bytes of `parts`, in order. */
export declare function joinParts(parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer>;
export {};
