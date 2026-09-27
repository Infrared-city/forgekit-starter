/**
 * A cheap content fingerprint of a plain JSON value: a 64-bit hash (two
 * 32-bit lanes) over every key, string, number and array length, in the order
 * `JSON.stringify` writes them.
 *
 * It guards the memos keyed on a caller's object (the group identity memo,
 * `identity.ts`, and the prepared-site digest memo, `area/prepared-site.ts`,
 * D104). A caller can change such an object in place between two calls; the
 * memo then compares the fingerprint and computes the value again when the
 * content changed. The fingerprint is NOT an identity and is never sent: it
 * only decides whether a memoised value is still the value of the current
 * content. On F3 the walk takes about a fifth of the time of
 * `JSON.stringify` and SHA-256 of the same value (D182).
 *
 * `undefined` when the value is not plain JSON (a class instance, a `toJSON`,
 * a getter, a function, a cycle): the caller then must not use the memo.
 * An accessor at an ARRAY index is not checked: one descriptor read per
 * element makes the walk as slow as no memo (565 against 160 ms a warm F3
 * site key). Such an array is not JSON data, and the area path reads each
 * input more than once with or without this memo, so a value that changes
 * between reads is not a supported input (D182). The same holds for a Proxy
 * whose traps answer two reads differently: there is no trust boundary here,
 * because the caller who writes such a Proxy also writes the payload.
 */
export function contentFingerprint(value) {
    // The hash state is local to this walk: a Proxy the walk reads can call
    // this function again without a change to the outer lanes.
    const numberView = new Float64Array(1);
    const numberWords = new Uint32Array(numberView.buffer);
    let lane1 = 0x811c9dc5;
    let lane2 = 0x9747b28c;
    /** One 32-bit word into both lanes. Each step is a bijection of the lane. */
    const mix = (word) => {
        lane1 = Math.imul(lane1 ^ word, 0x85ebca6b);
        lane1 ^= lane1 >>> 13;
        lane2 = Math.imul(lane2 ^ word, 0xc2b2ae35);
        lane2 ^= lane2 >>> 16;
        lane2 = (lane2 + lane1) | 0;
    };
    const mixString = (text) => {
        mix(text.length);
        for (let index = 0; index < text.length; index += 1)
            mix(text.charCodeAt(index));
    };
    const walk = (item) => {
        if (typeof item === "number") {
            numberView[0] = item;
            mix(1);
            mix(numberWords[0]);
            mix(numberWords[1]);
            return true;
        }
        if (typeof item === "string") {
            mix(2);
            mixString(item);
            return true;
        }
        if (item === null) {
            mix(3);
            return true;
        }
        if (typeof item === "boolean") {
            mix(item ? 4 : 5);
            return true;
        }
        if (item === undefined) {
            mix(6);
            return true;
        }
        if (typeof item !== "object" || "toJSON" in item)
            return false;
        if (Array.isArray(item)) {
            if (Object.getPrototypeOf(item) !== Array.prototype)
                return false;
            mix(7);
            mix(item.length);
            for (let index = 0; index < item.length; index += 1) {
                if (!walk(item[index]))
                    return false;
            }
            return true;
        }
        const prototype = Object.getPrototypeOf(item);
        if (prototype !== Object.prototype && prototype !== null)
            return false;
        mix(8);
        const record = item;
        for (const key in record) {
            // A getter can answer this walk and JSON.stringify differently, so a
            // value with one has no fingerprint (no memo).
            const field = Object.getOwnPropertyDescriptor(record, key);
            if (field === undefined || !("value" in field))
                return false;
            mixString(key);
            // Read through [[Get]], as JSON.stringify does, not from the descriptor.
            if (!walk(record[key]))
                return false;
        }
        mix(9);
        return true;
    };
    try {
        if (!walk(value))
            return undefined;
    }
    catch {
        return undefined;
    }
    return `${(lane1 >>> 0).toString(16)}:${(lane2 >>> 0).toString(16)}`;
}
