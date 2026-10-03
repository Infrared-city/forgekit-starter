import { TransportError } from "./transport.js";
import { jsonWireBytes } from "./wire-json.js";
/**
 * The JSON wire bytes of one prepared submission: the text it carries
 * (`PreparedSubmission.json`), or `JSON.stringify` of its body (area groups
 * from the arena, `wire-json.ts`). The ONE writer of the JSON route: the
 * submit sends these bytes, and the daylight-factor parts plan (`parts/`,
 * D221) reads the same bytes, so a one-part request sends what it always sent.
 */
export function preparedJsonBytes(prepared) {
    if (prepared.json !== undefined)
        return prepared.json();
    try {
        const bytes = jsonWireBytes(prepared.body, (_key, value) => ArrayBuffer.isView(value) ? Array.from(value) : value);
        if (bytes === undefined)
            throw new TypeError("request has no JSON wire form");
        return bytes;
    }
    catch {
        throw new TransportError("job request is not JSON serializable", "pre-dispatch", "validation", "POST");
    }
}
