import { KernelGroup } from "./kernel-group.js";
/**
 * JSON wire text with each kernel group (`internal/kernel-group.ts`) written
 * from the kernel's own bytes instead of `JSON.stringify` of a parsed copy.
 *
 * An area tile's groups are the kernel's site arena bytes (`area/composition.ts`,
 * D98): canonical JSON, the same bytes the Python host sends. They are never
 * parsed on the plan path. Everything else in a body is `JSON.stringify`.
 */
function hasToJson(value) {
    return value !== null && typeof value === "object" &&
        typeof value.toJSON === "function";
}
const encoder = new TextEncoder();
let sequence = 0;
/**
 * A `JSON.stringify` replacer that writes a typed array (a caller's
 * `Float64Array` coordinates or `Uint32Array` indices) as the plain array it
 * holds, as the mesh utilities' views write themselves (D294).
 */
export function typedAsArray(_key, value) {
    return ArrayBuffer.isView(value) && !(value instanceof DataView)
        ? Array.from(value)
        : value;
}
/**
 * `TextEncoder().encode(JSON.stringify(body, replacer))`, with each top-level
 * kernel group written from its own bytes.
 *
 * `undefined` where `JSON.stringify` gives `undefined`. A throw from
 * `JSON.stringify` (a cycle, a BigInt) is thrown here too.
 */
export function jsonWireBytes(body, replacer) {
    return spliceJsonBytes(body, () => undefined, replacer);
}
/**
 * `TextEncoder().encode(JSON.stringify(body, replacer))`, with each top-level
 * value for which `known` answers written from that answer instead.
 *
 * `known(value)` must be exactly the UTF-8 of `JSON.stringify(value)` as it
 * is written INSIDE `body`: no `toJSON` on the value and no replacer that
 * would change it. A value with a `toJSON` method is never asked about. A
 * `KernelGroup` is always written from its own kernel text.
 */
export function spliceJsonBytes(body, known, replacer) {
    const plain = () => {
        const text = JSON.stringify(body, replacer);
        return text === undefined ? undefined : encoder.encode(text);
    };
    if (body === null || typeof body !== "object" || Array.isArray(body))
        return plain();
    if (hasToJson(body))
        return plain();
    // The order `JSON.stringify` writes: own enumerable string keys.
    const entries = Object.entries(body);
    const texts = [];
    const stand = {};
    sequence = (sequence + 1) % Number.MAX_SAFE_INTEGER;
    const tag = `\u0000ir-wire-${sequence}-${Math.random().toString(36).slice(2)}-`;
    for (const [key, value] of entries) {
        // A kernel group's bytes ARE its wire text (`internal/kernel-group.ts`).
        const text = value instanceof KernelGroup
            ? value.text().bytes
            : hasToJson(value) ? undefined : known(value);
        let written = value;
        if (text !== undefined) {
            written = `${tag}${texts.length}`;
            texts.push(text);
        }
        Object.defineProperty(stand, key, {
            value: written, enumerable: true, writable: true, configurable: true,
        });
    }
    if (texts.length === 0)
        return plain();
    const outer = JSON.stringify(stand, replacer);
    if (outer === undefined)
        return plain();
    // Cut the outer text at each stand-in. Each one is written exactly once,
    // in order; anything else (a replacer that rewrote it) takes the old path.
    const pieces = [];
    let from = 0;
    for (let index = 0; index < texts.length; index += 1) {
        const marker = JSON.stringify(`${tag}${index}`);
        const at = outer.indexOf(marker, from);
        if (at === -1 || outer.indexOf(marker, at + marker.length) !== -1)
            return plain();
        pieces.push(encoder.encode(outer.slice(from, at)), texts[index]);
        from = at + marker.length;
    }
    // The tag as `JSON.stringify` escapes it: no stand-in may be left over.
    if (outer.indexOf(JSON.stringify(tag).slice(1, -1), from) !== -1)
        return plain();
    pieces.push(encoder.encode(outer.slice(from)));
    let total = 0;
    for (const piece of pieces)
        total += piece.byteLength;
    const out = new Uint8Array(total);
    let at = 0;
    for (const piece of pieces) {
        out.set(piece, at);
        at += piece.byteLength;
    }
    return out;
}
