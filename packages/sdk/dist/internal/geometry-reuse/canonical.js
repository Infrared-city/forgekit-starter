const INVALID = Symbol("invalid JSON value");
const MAX_DEPTH = 512;
function plainObject(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
function own(target, key, value) {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}
function canonicalValue(value, ancestors, depth) {
    if (depth > MAX_DEPTH)
        return INVALID;
    if (value === null || typeof value === "string" || typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return Number.isFinite(value) ? value : INVALID;
    if (typeof value !== "object")
        return INVALID;
    if (ancestors.has(value))
        return INVALID;
    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            const output = [];
            for (const item of value) {
                const canonical = canonicalValue(item, ancestors, depth + 1);
                if (canonical === INVALID)
                    return INVALID;
                output.push(canonical);
            }
            return output;
        }
        if (!plainObject(value))
            return INVALID;
        const output = {};
        for (const key of Object.keys(value).sort()) {
            const canonical = canonicalValue(value[key], ancestors, depth + 1);
            if (canonical === INVALID)
                return INVALID;
            own(output, key, canonical);
        }
        return output;
    }
    finally {
        ancestors.delete(value);
    }
}
/** Return one owned canonical value and its exact JSON bytes. */
export function canonicalSnapshot(value) {
    try {
        const canonical = canonicalValue(value, new WeakSet(), 0);
        if (canonical === INVALID)
            return undefined;
        const text = JSON.stringify(canonical);
        return text === undefined ? undefined : {
            value: canonical,
            bytes: new TextEncoder().encode(text),
        };
    }
    catch {
        return undefined;
    }
}
/** Return stable JSON content bytes, or undefined when the value has no exact JSON form. */
export function canonicalJsonBytes(value) {
    return canonicalSnapshot(value)?.bytes;
}
let sha256Native;
/**
 * Install the runtime's own digest. Only the Node package entry points do
 * this (`node:crypto` `createHash`), so a browser bundle never imports it.
 * `undefined` removes it (tests of the browser shape).
 */
export function setSha256Native(value) {
    sha256Native = value;
}
/** Return a lowercase SHA-256 digest of `bytes`. */
export async function sha256Hex(bytes) {
    return sha256HexParts([bytes]);
}
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
export async function sha256HexParts(parts) {
    if (sha256Native !== undefined) {
        try {
            return sha256Native(parts);
        }
        catch {
            return undefined;
        }
    }
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.subtle === undefined)
        return undefined;
    try {
        const owned = parts.length === 1 ? parts[0].slice() : joinParts(parts);
        const digest = await cryptoApi.subtle.digest("SHA-256", owned);
        return Array.from(new Uint8Array(digest), (item) => item.toString(16).padStart(2, "0")).join("");
    }
    catch {
        return undefined;
    }
}
/** One new buffer with the bytes of `parts`, in order. */
export function joinParts(parts) {
    const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
    let at = 0;
    for (const part of parts) {
        out.set(part, at);
        at += part.length;
    }
    return out;
}
