/**
 * Typed errors, decoding and indexing for the static weather reader.
 *
 * Split out of `weather-static.ts` to keep both files under the 400-line
 * cap, the same split the Python twin makes
 * (`layers/_static_decode.py`). This module is the ONE place the static
 * path builds a {@link WeatherServiceError}, so the reader and its
 * helpers report failures the same way.
 */
/**
 * A weather read that failed, with the status the deleted utilities route
 * would have answered. A malformed catalog, a body that is not JSON and a
 * refused answer are all `502`: the reader reached the host and the host's
 * answer was unusable.
 */
export declare class WeatherServiceError extends Error {
    readonly statusCode: number;
    readonly operation: string;
    readonly name = "WeatherServiceError";
    constructor(message: string, statusCode: number, operation: string);
}
/** One catalog row, as the export writes it. */
export interface WeatherStationRow extends Readonly<Record<string, unknown>> {
    readonly uuid: string;
    readonly fileName: string;
}
export declare function failWeather(message: string, statusCode: number, operation: string): never;
export declare function decodeUtf8(bytes: Uint8Array, subject: string, operation: string): string;
/** Parse TEXT as a JSON object, or raise the typed error (twin of D40). */
export declare function parseJsonObject(text: string, subject: string, operation: string): Record<string, unknown>;
/** Decode BYTES as a JSON object. */
export declare function decodeJsonObject(bytes: Uint8Array, subject: string, operation: string): Record<string, unknown>;
/**
 * The station bytes, decompressed.
 *
 * R2 serves `stations/{uuid}.json` with `Content-Encoding: gzip`, which
 * `fetch` decodes while the capped body streams — no manual step on the
 * normal path. The magic-number sniff here is the fallback for a host or
 * proxy that strips the header; a failed decode is the typed 502, never a
 * bare fflate error.
 */
export declare function gunzipIfNeeded(bytes: Uint8Array, uuid: string, operation: string): Uint8Array;
/**
 * The ranking index: `{stations: [{uuid, lat, lon}]}` as TEXT.
 *
 * `weatherNearestStations` reads three fields per row — `lat`, `lon` and the
 * key it ranks — and answers with `{uuid, fileName, location_data}` taken
 * from the row it chose. Handing it the WHOLE catalog copied 7.45 MB of text
 * across the wasm boundary and re-parsed it on EVERY lookup, 90-140 ms a
 * time (`FABLE-perf-audit.md` row 4a). This index is built once per catalog
 * and is about a fifth of the size.
 *
 * Order is the catalog's, because `nearest_stations` breaks equal distances
 * by catalog order and a reordered index would answer differently. `uuid` is
 * the join key back to the full row.
 *
 * **The candidate rule is shared with the Python host.** A catalog row is a
 * ranking candidate only when it has a non-empty `uuid`, a non-empty
 * `fileName` and finite numeric `lat` and `lon`. The kernel's own rule is
 * wider — it skips only rows without numeric `lat`/`lon` — but a row this
 * reader cannot NAME (no uuid) or cannot FETCH (no fileName) is not an answer
 * a caller can use, and the two SDKs must select the same stations for the
 * same catalog or one EPW file is chosen here and another there, which moves
 * every thermal, solar and UTCI result a user compares across hosts. The rule
 * is therefore the narrower of the two, on both hosts, and
 * `tests/weather-nearest-fixture.test.ts` pins one catalog to one answer here
 * while `public/python/tests/layers/test_weather_nearest_fixture.py` pins the
 * same catalog to the same answer there.
 */
export interface StationIndex {
    readonly byUuid: ReadonlyMap<string, WeatherStationRow>;
    readonly byFileName: ReadonlyMap<string, WeatherStationRow>;
    /** Candidate `uuid` to the full row it names — the ranking join key. */
    readonly byRankKey: ReadonlyMap<string, WeatherStationRow>;
    /** `{stations: [{uuid, lat, lon}]}` as text, for the kernel. */
    readonly rankingJson: string;
}
/** Index a parsed catalog by `uuid`, by `fileName` and for ranking. */
export declare function indexStations(catalog: Record<string, unknown>, operation: string): StationIndex;
/**
 * The kernel's own answer shape, rebuilt from the rows it ranked.
 *
 * `nearest_stations` returns `{uuid, fileName, location_data}` per station,
 * with `null` for a field the row does not carry. The ranking index carries
 * none of those three, so they are read back from the full row here — the
 * same three fields, in the same order, for the same rows in the same order.
 * The RANKING stays in the kernel; this is a projection, not logic.
 */
export declare function projectRankedStations(ranked: ReadonlyArray<Record<string, unknown>>, index: StationIndex, operation: string): Array<Record<string, unknown>>;
