/**
 * Typed errors, decoding and indexing for the static weather reader.
 *
 * Split out of `weather-static.ts` to keep both files under the 400-line
 * cap, the same split the Python twin makes
 * (`layers/_static_decode.py`). This module is the ONE place the static
 * path builds a {@link WeatherServiceError}, so the reader and its
 * helpers report failures the same way.
 */
import { gunzipSync } from "fflate";
/**
 * A weather read that failed, with the status the deleted utilities route
 * would have answered. A malformed catalog, a body that is not JSON and a
 * refused answer are all `502`: the reader reached the host and the host's
 * answer was unusable.
 */
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
/** gzip magic number, sniffed only as a fallback (D40). */
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
/** Parse TEXT as a JSON object, or raise the typed error (twin of D40). */
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
/** Decode BYTES as a JSON object. */
export function decodeJsonObject(bytes, subject, operation) {
    return parseJsonObject(decodeUtf8(bytes, subject, operation), subject, operation);
}
/**
 * The station bytes, decompressed.
 *
 * R2 serves `stations/{uuid}.json` with `Content-Encoding: gzip`, which
 * `fetch` decodes while the capped body streams — no manual step on the
 * normal path. The magic-number sniff here is the fallback for a host or
 * proxy that strips the header; a failed decode is the typed 502, never a
 * bare fflate error.
 */
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
/** Index a parsed catalog by `uuid`, by `fileName` and for ranking. */
export function indexStations(catalog, operation) {
    const stations = catalog["stations"] ?? [];
    if (!Array.isArray(stations)) {
        failWeather("Weather catalog `stations` is not a list", 502, operation);
    }
    const byUuid = new Map();
    const byFileName = new Map();
    const byRankKey = new Map();
    const ranking = [];
    for (const station of stations) {
        if (station === null || typeof station !== "object" || Array.isArray(station))
            continue;
        const row = station;
        const uuid = row["uuid"];
        const fileName = row["fileName"];
        const typed = row;
        // A row without both keys could not have validated as the deleted
        // route's own `PartialWeather` model. Drop it rather than index it
        // half-usably or fail the whole catalog on it.
        if (typeof uuid !== "string" || uuid === "")
            continue;
        if (typeof fileName !== "string" || fileName === "")
            continue;
        byUuid.set(uuid, typed);
        byFileName.set(fileName, typed);
        // THE SHARED CANDIDATE RULE, above. A named, fetchable row with a usable
        // position is a candidate; anything else is not, on either host.
        const lat = row["lat"];
        const lon = row["lon"];
        if (typeof lat !== "number" || !Number.isFinite(lat))
            continue;
        if (typeof lon !== "number" || !Number.isFinite(lon))
            continue;
        // FIRST-SEEN on a repeated uuid: the join back would be ambiguous, and
        // ranking one station twice would spend two of the ten answers on it.
        // The `byUuid`/`byFileName` lookups above keep the LAST row instead —
        // pre-existing, and the deleted route's own behaviour — so a catalog that
        // repeats a uuid can name two different rows through the two paths. The
        // published catalog does not repeat one; nothing here makes it safe to.
        if (byRankKey.has(uuid))
            continue;
        byRankKey.set(uuid, typed);
        ranking.push({ uuid, lat, lon });
    }
    return {
        byUuid,
        byFileName,
        byRankKey,
        rankingJson: JSON.stringify({ stations: ranking }),
    };
}
/**
 * The kernel's own answer shape, rebuilt from the rows it ranked.
 *
 * `nearest_stations` returns `{uuid, fileName, location_data}` per station,
 * with `null` for a field the row does not carry. The ranking index carries
 * none of those three, so they are read back from the full row here — the
 * same three fields, in the same order, for the same rows in the same order.
 * The RANKING stays in the kernel; this is a projection, not logic.
 */
export function projectRankedStations(ranked, index, operation) {
    return ranked.map((entry) => {
        const key = entry["uuid"];
        const row = typeof key === "string" ? index.byRankKey.get(key) : undefined;
        if (row === undefined) {
            // Only reachable if the kernel answered with a key the index did not
            // give it, which would mean the two disagree about the catalog.
            return failWeather(`Weather ranking returned an unknown station ${JSON.stringify(key)}`, 502, operation);
        }
        const source = row;
        return {
            uuid: source["uuid"] ?? null,
            fileName: source["fileName"] ?? null,
            location_data: source["location_data"] ?? null,
        };
    });
}
