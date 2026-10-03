export interface PreparedGeometryGroups {
    readonly body: Readonly<Record<string, unknown>>;
    readonly identities: Readonly<Record<string, string>>;
    /** Each captured group's exact canonical JSON bytes, by group name. */
    readonly bytes: Readonly<Record<string, Uint8Array>>;
}
/**
 * The identity of one group from its canonical bytes: the kernel group hash,
 * the content digest, and the digest of the envelope naming both.
 *
 * The kernel's site arena supplies the bytes and the kernel hash of every
 * group of every tile (D98); the two digests are taken here, natively, when
 * the reuse path first asks for a group. This is the whole formula for a body
 * that did not come through the arena — a direct `submit` — and what
 * `tests/area/arena-parity.wasm.test.ts` holds the arena path to.
 */
export declare function identityFor(name: string, exact: Uint8Array): Promise<string | undefined>;
export declare function rememberGroup(name: string, value: object, bytes: Uint8Array, hash: string | undefined): void;
/** Build exact identities from the final checked and packed request body. */
export declare function prepareGeometryGroups(body: Readonly<Record<string, unknown>>): Promise<PreparedGeometryGroups>;
/**
 * The reference document of the selected groups, as the parts that make it:
 * `{"a":<a>,"b":<b>}` with the names sorted, which is byte for byte what
 * `canonicalJsonBytes({a, b})` writes, since each value's bytes ARE its
 * canonical text. The group bytes are not copied: `gref1` is hashed over the
 * parts (`sha256HexParts`), and `joinParts` makes the one buffer only for an
 * upload. `undefined` when a selected group was not captured.
 */
export declare function selectedDocumentParts(prepared: PreparedGeometryGroups, groups: Readonly<Record<string, string>>): readonly Uint8Array[] | undefined;
/** The request field that declares the referenced groups. */
export declare const GROUPS_FIELD = "geometry-$ref-groups";
export declare function bodyWithReference(body: Readonly<Record<string, unknown>>, groups: Readonly<Record<string, string>>, url: string): Record<string, unknown>;
