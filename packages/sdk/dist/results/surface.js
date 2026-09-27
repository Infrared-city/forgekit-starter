import { parseSurfaceRecord } from "./surface-record.js";
/** Parse and validate one ordinary JSON surface response. */
export function parseSurfaceResult(document, options = {}) {
    const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document));
    return parseSurfaceRecord(raw, options);
}
