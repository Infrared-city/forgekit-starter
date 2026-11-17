// Maintainer note (not published): typed errors and decoding for the static
// weather reader. Split out of `weather-static.ts` to keep both files under the 400-line
// cap, the same split the Python twin makes (`layers/_static_decode.py`). This module is
// the ONE place the static path builds a `WeatherServiceError`, so the reader and its
// helpers report failures the same way.
import { gunzipSync } from "fflate";
/**
 * Thrown when a weather read fails.
 *
 * `statusCode` is an HTTP-style status and `operation` names the call that failed. A
 * malformed catalog, a body that is not JSON and a refused answer are all `502`: the
 * weather host was reached but its answer was unusable.
 *
 * @category Errors
 */
// Maintainer note (not published): `statusCode` is the status the deleted utilities
// route would have answered.
export class WeatherServiceError extends Error {
    statusCode;
    operation;
    name = "WeatherServiceError";
    constructor(message, statusCode, operation) {
        super(message);
        this.statusCode = statusCode;
        this.operation = operation;
    }
}
// Maintainer note (not published): gzip magic number, sniffed only as a fallback (D40).
const GZIP_MAGIC = [0x1f, 0x8b];
export function failWeather(message, statusCode, operation) {
    throw new WeatherServiceError(message, statusCode, operation);
}
export function decodeUtf8(bytes, subject, operation) {
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
    catch {
        return failWeather(`${subject} payload was not UTF-8 text`, 502, operation);
    }
}
// Maintainer note (not published): parse TEXT as a JSON object, or raise the typed error (twin of D40).
export function parseJsonObject(text, subject, operation) {
    let value;
    try {
        value = JSON.parse(text);
    }
    catch (error) {
        return failWeather(`${subject} payload was not JSON: ${error instanceof Error ? error.message : String(error)}`, 502, operation);
    }
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        return failWeather(`${subject} payload was not a JSON object`, 502, operation);
    }
    return value;
}
// Maintainer note (not published): the station bytes, decompressed. R2 serves
// `stations/{uuid}.json` with `Content-Encoding: gzip`, which `fetch` decodes while the
// capped body streams, so there is no manual step on the normal path. The magic-number
// sniff here is the fallback for a host or proxy that strips the header; a failed decode
// is the typed 502, never a bare fflate error.
export function gunzipIfNeeded(bytes, uuid, operation) {
    if (bytes.length < 2 || bytes[0] !== GZIP_MAGIC[0] || bytes[1] !== GZIP_MAGIC[1])
        return bytes;
    try {
        return gunzipSync(bytes);
    }
    catch (error) {
        return failWeather(`Weather station ${JSON.stringify(uuid)} payload sniffs as gzip but failed to ` +
            `decompress: ${error instanceof Error ? error.message : String(error)}`, 502, operation);
    }
}
