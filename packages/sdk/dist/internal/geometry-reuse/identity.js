import { requireCore } from "../core.js";
import { KernelGroup, groupHasContent } from "../kernel-group.js";
import { canonicalJsonBytes, canonicalSnapshot, sha256Hex } from "./canonical.js";
import { contentFingerprint } from "./fingerprint.js";
const IDENTITY_SPACE = "geometry-group-transport-v1";
function hasContent(value) {
    if (value instanceof KernelGroup)
        return groupHasContent(value);
    if (value === null || value === undefined)
        return false;
    if (Array.isArray(value))
        return value.length > 0;
    if (typeof value === "object")
        return Object.keys(value).length > 0;
    return true;
}
/** The `ggid1:` envelope over a group's canonical bytes and its kernel hash. */
async function envelopeIdentity(name, exact, kernelHash) {
    const contentDigest = await sha256Hex(exact);
    if (contentDigest === undefined)
        return undefined;
    const material = canonicalJsonBytes({
        content_digest: contentDigest,
        group: name,
        kernel_group_hash: kernelHash,
        namespace: IDENTITY_SPACE,
        version: 1,
    });
    if (material === undefined)
        return undefined;
    const digest = await sha256Hex(material);
    return digest === undefined ? undefined : `ggid1:${digest}`;
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
export async function identityFor(name, exact) {
    let kernelHash;
    try {
        kernelHash = requireCore().geometryGroupHash(name, new TextDecoder().decode(exact));
    }
    catch {
        return undefined;
    }
    if (typeof kernelHash !== "string" || kernelHash.length === 0)
        return undefined;
    return envelopeIdentity(name, exact, kernelHash);
}
async function groupIdentity(name, value) {
    const snapshot = canonicalSnapshot(value);
    if (snapshot === undefined)
        return undefined;
    return { value: snapshot.value, bytes: snapshot.bytes, identity: await identityFor(name, snapshot.bytes) };
}
/**
 * Memo by group OBJECT. The prepared site keeps a tile's group objects alive
 * across `runArea` calls (`area/prepared-site.ts`, D96), so a group's
 * canonical form and identity are computed once — and since D98 the compose
 * registers every group it parsed from the kernel's arena with the bytes and
 * the kernel hash the kernel wrote, so nothing is canonicalised or re-hashed
 * here: the entry stays the raw `ArenaGroup` until a run asks, then becomes
 * the identity's promise. Two runs of one family that reach the same tile at
 * once share the one entry. A group nothing holds any more takes its entry
 * with it.
 *
 * A CALLER's group object (a direct `submit` body) is not the SDK's: the
 * caller can change it in place between two submits. From its second sight
 * on, its entry keeps the content fingerprint (`fingerprint.ts`) it was
 * computed from, and a later submit uses the entry only when the fingerprint
 * is the same (D182). The first sight takes no fingerprint (D183).
 */
const memo = new WeakMap();
export function rememberGroup(name, value, bytes, hash) {
    memo.set(value, { name, bytes, hash });
}
async function arenaIdentity(value, group) {
    const identity = group.hash === undefined
        ? undefined
        : await envelopeIdentity(group.name, group.bytes, group.hash);
    return { value, bytes: group.bytes, identity };
}
/**
 * A kernel-written group (`internal/kernel-group.ts`): its bytes are the
 * canonical text and its hash the kernel group hash, so the identity is the
 * envelope over both, as for an arena group. The group itself stays the value:
 * `jsonWireBytes` writes it from the same bytes.
 */
async function kernelIdentity(name, value) {
    const { bytes, hash } = value.text();
    const identity = hash === undefined ? undefined : await envelopeIdentity(name, bytes, hash);
    return { value, bytes, identity };
}
function memoised(name, value) {
    if (value instanceof KernelGroup) {
        const entry = memo.get(value);
        if (entry instanceof Promise)
            return entry;
        const pending = kernelIdentity(name, value);
        memo.set(value, pending);
        return pending;
    }
    if (value === null || typeof value !== "object")
        return groupIdentity(name, value);
    const entry = memo.get(value);
    if (entry instanceof Promise)
        return entry;
    if (entry !== undefined && !("pending" in entry)) {
        const pending = arenaIdentity(value, entry);
        memo.set(value, pending);
        return pending;
    }
    // A first sight costs no fingerprint walk: most objects are seen once (a
    // worker gets a fresh clone for each call). The walk runs only when the
    // object comes back, and the entry is reused only from the third sight on.
    const fingerprint = entry === undefined ? undefined : contentFingerprint(value);
    if (fingerprint !== undefined && entry?.name === name && entry.fingerprint === fingerprint) {
        return entry.pending;
    }
    const pending = groupIdentity(name, value);
    memo.set(value, { name, fingerprint, pending });
    return pending;
}
/** Build exact identities from the final checked and packed request body. */
export async function prepareGeometryGroups(body) {
    let registry;
    try {
        registry = requireCore().geometryGroups();
    }
    catch {
        return { body, identities: {}, bytes: {} };
    }
    const ownedBody = { ...body };
    const identities = {};
    const bytes = {};
    for (const row of registry) {
        if (typeof row.name !== "string" || !hasContent(body[row.name]))
            continue;
        const group = await memoised(row.name, body[row.name]);
        if (group === undefined)
            continue;
        ownedBody[row.name] = group.value;
        bytes[row.name] = group.bytes;
        if (group.identity !== undefined)
            identities[row.name] = group.identity;
    }
    return { body: ownedBody, identities, bytes };
}
const encoder = new TextEncoder();
const OPEN = Uint8Array.of(0x7b);
const CLOSE = Uint8Array.of(0x7d);
/**
 * The reference document of the selected groups, as the parts that make it:
 * `{"a":<a>,"b":<b>}` with the names sorted, which is byte for byte what
 * `canonicalJsonBytes({a, b})` writes, since each value's bytes ARE its
 * canonical text. The group bytes are not copied: `gref1` is hashed over the
 * parts (`sha256HexParts`), and `joinParts` makes the one buffer only for an
 * upload. `undefined` when a selected group was not captured.
 */
export function selectedDocumentParts(prepared, groups) {
    const parts = [OPEN];
    for (const name of Object.keys(groups).sort()) {
        const value = prepared.bytes[name];
        if (value === undefined)
            return undefined;
        parts.push(encoder.encode(`${parts.length === 1 ? "" : ","}${JSON.stringify(name)}:`), value);
    }
    parts.push(CLOSE);
    return parts;
}
export function bodyWithReference(body, groups, url) {
    const output = {};
    for (const [name, value] of Object.entries(body)) {
        if (!Object.hasOwn(groups, name))
            Object.defineProperty(output, name, {
                configurable: true, enumerable: true, value, writable: true,
            });
    }
    Object.defineProperty(output, "geometry-$ref", {
        configurable: true, enumerable: true, value: url, writable: true,
    });
    return output;
}
