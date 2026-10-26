import { GeodataError } from "./errors.js";
/**
 * String splicing for chained kernel calls.
 *
 * Bulk-data rule 1: one kernel operation's output string is the next one's
 * input. The host must not parse a full feature tree into JavaScript objects
 * only to serialize it again for the next call. Everything here works on the
 * JSON text, so a chain of kernel calls costs no host tree and no re-encode.
 *
 * Ownership (rule 5): every function takes strings the caller owns and
 * returns a new string; nothing here retains a reference to its input, and
 * no buffer outlives the call.
 */
/** The first non-whitespace character of a JSON document. */
function firstToken(json) {
    const match = /^\s*(.)/.exec(json);
    return match?.[1] ?? "";
}
/**
 * Check that a JSON text is an array, without parsing it.
 *
 * @param json - The JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns `json` unchanged.
 * @throws {GeodataError} when the text does not start with `[`.
 * @category Geodata
 */
// Maintainer note (not published): a shape change in a kernel export must fail
// loudly here rather than be papered over by a defensive parse — the two
// bindings are meant to agree.
export function requireJsonArray(json, origin) {
    if (firstToken(json) !== "[") {
        throw new GeodataError(`${origin} returned ${firstToken(json) === "{" ? "an object" : "a non-array"}; ` +
            "the chained readers expect a JSON array of features");
    }
    return json;
}
/**
 * Check that a JSON text is an object (a GeoJSON FeatureCollection), without
 * parsing it.
 *
 * @param json - The JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns `json` unchanged.
 * @throws {GeodataError} when the text does not start with `{`.
 * @category Geodata
 */
export function requireFeatureCollection(json, origin) {
    if (firstToken(json) !== "{") {
        throw new GeodataError(`${origin} returned ${firstToken(json) === "[" ? "an array" : "a non-object"}; ` +
            "the chained readers expect a FeatureCollection document");
    }
    return json;
}
/**
 * Extract the `features` array of a GeoJSON FeatureCollection text, as text.
 *
 * The document is scanned once, without building JavaScript objects, so large
 * collections are not parsed and re-encoded.
 *
 * @param featureCollectionText - The FeatureCollection JSON text.
 * @param origin - Name of the producer, used in the error message.
 * @returns The text of the `features` array, including its brackets.
 * @throws {GeodataError} when no readable `features` array is found.
 * @category Geodata
 */
// Maintainer note (not published): a scanner, not a parser: it walks the
// document once, tracking string literals, escapes and bracket depth, and
// returns the substring the array occupies. No JavaScript object tree is built,
// which is the point — the kernel emits FeatureCollections and `dedupTrees`
// takes a feature array, and bridging the two must not cost a parse and a
// re-encode of megabytes.
export function featuresArrayText(featureCollectionText, origin) {
    const key = /"features"\s*:\s*\[/g;
    let match = null;
    let candidate;
    while ((match = key.exec(featureCollectionText)) !== null) {
        // A `"features"` key inside a string literal cannot start an array here,
        // because the scan below would immediately fail on it; take the first
        // occurrence that scans to a balanced array.
        candidate = match.index + match[0].length - 1;
        const end = scanArray(featureCollectionText, candidate);
        if (end !== undefined)
            return featureCollectionText.slice(candidate, end + 1);
    }
    throw new GeodataError(`${origin} returned no readable features array`);
}
/** Index of the `]` closing the array that starts at `start`, if balanced. */
function scanArray(text, start) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
        const character = text[index];
        if (inString) {
            if (escaped)
                escaped = false;
            else if (character === "\\")
                escaped = true;
            else if (character === '"')
                inString = false;
            continue;
        }
        if (character === '"')
            inString = true;
        else if (character === "[" || character === "{")
            depth += 1;
        else if (character === "]" || character === "}") {
            depth -= 1;
            if (depth === 0)
                return character === "]" ? index : undefined;
            if (depth < 0)
                return undefined;
        }
    }
    return undefined;
}
/**
 * Concatenate JSON array texts into one array text, without parsing them.
 *
 * @param parts - JSON texts that each hold one array.
 * @returns One array text with the elements of all parts, in order.
 * @throws {GeodataError} when a part is not an array text.
 * @category Geodata
 */
export function spliceJsonArrays(parts) {
    const bodies = [];
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
            throw new GeodataError("only JSON array texts can be spliced");
        }
        const body = trimmed.slice(1, -1).trim();
        if (body.length > 0)
            bodies.push(body);
    }
    return `[${bodies.join(",")}]`;
}
/**
 * Wrap a JSON array text of features as a GeoJSON FeatureCollection text.
 *
 * @param featuresJson - JSON text of an array of features.
 * @returns The FeatureCollection JSON text.
 * @category Geodata
 */
export function featureCollectionJson(featuresJson) {
    return `{"type":"FeatureCollection","features":${featuresJson.trim()}}`;
}
/**
 * Build a JSON array text from element texts.
 *
 * @param elements - JSON texts of the elements; `undefined` becomes `null`.
 * @returns The array JSON text.
 * @category Geodata
 */
export function jsonArrayOf(elements) {
    return `[${elements.map((element) => element ?? "null").join(",")}]`;
}
/**
 * Wrap a JSON text as a single-entry object text, `{ "<key>": <value> }`.
 *
 * @param key - The object key.
 * @param valueJson - JSON text of the value.
 * @returns The object JSON text.
 * @category Geodata
 */
export function jsonObjectOf(key, valueJson) {
    return `{${JSON.stringify(key)}:${valueJson}}`;
}
