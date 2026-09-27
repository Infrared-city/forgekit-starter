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
 * Assert that a kernel answer is a JSON array, without parsing it.
 *
 * A shape change in a kernel export must fail loudly here rather than be
 * papered over by a defensive parse — the two bindings are meant to agree.
 */
export function requireJsonArray(json, origin) {
    if (firstToken(json) !== "[") {
        throw new GeodataError(`${origin} returned ${firstToken(json) === "{" ? "an object" : "a non-array"}; ` +
            "the chained readers expect a JSON array of features");
    }
    return json;
}
/** Assert that a kernel answer is a JSON object (a FeatureCollection). */
export function requireFeatureCollection(json, origin) {
    if (firstToken(json) !== "{") {
        throw new GeodataError(`${origin} returned ${firstToken(json) === "[" ? "an array" : "a non-object"}; ` +
            "the chained readers expect a FeatureCollection document");
    }
    return json;
}
/**
 * The `features` array of a FeatureCollection text, as text.
 *
 * A scanner, not a parser: it walks the document once, tracking string
 * literals, escapes and bracket depth, and returns the substring the array
 * occupies. No JavaScript object tree is built, which is the point — the
 * kernel emits FeatureCollections and `dedupTrees` takes a feature array,
 * and bridging the two must not cost a parse and a re-encode of megabytes.
 */
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
/** Concatenate JSON array texts into one array text, without parsing. */
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
/** Wrap a JSON array text of features as a FeatureCollection text. */
export function featureCollectionJson(featuresJson) {
    return `{"type":"FeatureCollection","features":${featuresJson.trim()}}`;
}
/** Build a JSON array text from element texts (`null` for a missing one). */
export function jsonArrayOf(elements) {
    return `[${elements.map((element) => element ?? "null").join(",")}]`;
}
/** Wrap a layers object text as a single-entry `{layerId: value}` text. */
export function jsonObjectOf(key, valueJson) {
    return `{${JSON.stringify(key)}:${valueJson}}`;
}
