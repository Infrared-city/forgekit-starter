// Maintainer note (not published): bring-your-own weather, the HOST half of
// the EPW path.
//
// Contract: `docs/plans/2026-09-07-byo-weather-epw-contract.md` (sections
// 3-10). Intended differences from the deleted service: `docs/DEVIATIONS.md`
// D44 (kernel) and D45 (host). The Python twin is
// `public/python/src/infrared_sdk/layers/weather_epw.py`; the two files call
// the same three kernel operations with the same arguments, so one file
// cannot mean two different things in two SDKs.
//
// What this module does, and what it must not do. It hands text to the
// kernel and shapes what comes back. It does not parse EPW text, does not
// decide which arrays a model needs, does not filter a window and does not
// compute a digest. All four are `infrared-core`'s.
//
// Reading the FILE is the caller's, not this module's: a browser has no file
// system and Node's does not belong in a package that runs in both. Pass the
// text (`await file.text()`, `readFileSync(path, "utf8")`).
//
// There is no registration, no upload and no private weather database.
import { requireCore } from "./internal/core.js";
import { weatherWindow, weatherWindowJson } from "./internal/weather-window.js";
/**
 * The analyses that read weather data: `thermal-comfort-index`,
 * `thermal-comfort-statistics`, `solar-radiation` and `energy-balance`.
 *
 * `energy-balance` also reads the request field `solar-model`: omitted or
 * `"legacy-flat"` it uses dry-bulb temperature and global horizontal
 * radiation, and `"irradiance"` adds the direct and diffuse series and needs
 * a full year. Wind, pedestrian wind comfort, sky view factors, daylight, sun
 * hours and daylight factor take no weather data.
 *
 * @category Weather
 */
// Maintainer note (not published): the kernel's own set
// (`ir_geodata::weather::model_inputs`). `energy-balance` is the interior
// model and the ONE analysis whose worker reads `solar-model`
// (`lambda-models` `interior/solar_input.rs`). Neither SDK can submit an
// energy-balance AREA run today (the name is not in `AnalysesName`), so
// listing it here changes no resume guard; it keeps the host's statement of
// what reads weather equal to the kernel's.
export const WEATHER_BEARING_ANALYSES = new Set([
    "thermal-comfort-index",
    "thermal-comfort-statistics",
    "solar-radiation",
    "energy-balance",
]);
/**
 * Thrown by `parseEpw` for an EPW file that cannot be used; the message gives
 * the reason, and the original error is kept as `cause`.
 *
 * @category Errors
 */
export class EpwParseError extends Error {
    /**
     * @param message - The reason the file was refused.
     * @param options - `cause` is the underlying error.
     */
    constructor(message, options) {
        super(message, options);
        this.name = "EpwParseError";
    }
}
/**
 * Thrown when a weather document cannot supply what the requested analysis
 * needs for the requested time window; the message gives the reason, and the
 * original error is kept as `cause`.
 *
 * @category Errors
 */
export class WeatherModelInputsError extends Error {
    /**
     * @param message - The reason the document cannot serve the request.
     * @param options - `cause` is the underlying error.
     */
    constructor(message, options) {
        super(message, options);
        this.name = "WeatherModelInputsError";
    }
}
function reason(error) {
    return error instanceof Error ? error.message : String(error);
}
/**
 * One validated EPW file, as returned by `parseEpw`.
 *
 * Build a request from it and keep it for any retry: its `identity` proves
 * that a resumed run uses the same weather as the run it resumes. The
 * identity is computed on every read, so editing `document` after submitting
 * makes a retry be refused instead of passing as unchanged weather.
 *
 * @category Weather
 */
// Maintainer note (not published): the kernel's `weather_document`; contract
// section 9. The identity is never cached: `document` is plain data a caller
// can reach and change, and a caller who edits it after submitting must be
// REFUSED on the retry rather than served a stale digest that says the
// weather is unchanged.
export class WeatherDocument {
    document;
    /**
     * @param document - The validated document, as a JSON object.
     * @throws {TypeError} when `document` is not an object.
     */
    constructor(document) {
        this.document = document;
        if (document === null || typeof document !== "object" || Array.isArray(document)) {
            throw new TypeError("a weather document is a JSON object");
        }
    }
    /**
     * The versioned weather identity, `"sha256:<hex>"`.
     *
     * It covers the validated values, their order, the location, the calendar
     * columns and the hour basis, but never the file name, a station id or the
     * raw text, so two differently formatted files with the same readings
     * share one identity.
     *
     * @throws {EpwParseError} when the document has no computable identity.
     */
    get identity() {
        try {
            return requireCore().weatherIdentity(JSON.stringify(this.document));
        }
        catch (error) {
            throw new EpwParseError(`this weather document has no computable identity: ${reason(error)}`, { cause: error });
        }
    }
    /** The EPW `LOCATION` header, as the document records it. Empty when the document has none. */
    get location() {
        return (this.document.location ?? {});
    }
    /** Row count, records per hour, and whether the data is a leap year or a full year. */
    get period() {
        return (this.document.period ?? {});
    }
    /** Data rows in the file, before any window is applied. */
    get rows() {
        const rows = this.period.rows;
        return typeof rows === "number" ? rows : 0;
    }
    /**
     * The snake_case arrays one analysis reads, for one time window.
     *
     * The window is applied first, then the required fields are checked on the
     * selected rows and then the period rule. A gap outside the window is
     * harmless, a gap inside it is refused, and an analysis that needs a full
     * year refuses a shorter one. Every refusal happens before a request is
     * submitted, so nothing is billed.
     *
     * `solarModel` applies to `analysisType: "energy-balance"` only; on any
     * other analysis it is refused. `"irradiance"` selects the irradiance input
     * set, which needs a full year; omitted, or `"legacy-flat"`, selects the
     * two climate arrays that model reads.
     *
     * @param request - The analysis, time window and options.
     * @returns The arrays, by field name.
     * @throws {WeatherModelInputsError} when the document cannot serve the request.
     */
    modelInputs(request) {
        const wire = {
            analysis_type: request.analysisType,
            time_period: weatherWindow(request.timePeriod),
        };
        if (request.subtype !== undefined)
            wire.subtype = request.subtype;
        if (request.solarModel !== undefined)
            wire.solar_model = request.solarModel;
        try {
            return JSON.parse(requireCore().weatherModelInputs(JSON.stringify(this.document), JSON.stringify(wire)));
        }
        catch (error) {
            throw new WeatherModelInputsError(`the weather file cannot serve ${request.analysisType} for this window: ${reason(error)}`, { cause: error });
        }
    }
    /**
     * The file's hours inside `filters`, one record per hour: the same shape
     * `WeatherService.filterWeatherData` returns for a public station, from a
     * local file and with no network call.
     *
     * @param filters - The time window.
     * @returns One record per selected hour.
     * @throws {WeatherModelInputsError} when the file cannot be filtered to that window.
     */
    filterHours(filters) {
        let out;
        try {
            out = requireCore().weatherFilterHours(JSON.stringify({ weatherData: this.document.values ?? {} }), weatherWindowJson(filters));
        }
        catch (error) {
            throw new WeatherModelInputsError(`this weather file cannot be filtered to that window: ${reason(error)}`, { cause: error });
        }
        const filtered = JSON.parse(out).weatherData;
        if (filtered === null || typeof filtered !== "object" || Array.isArray(filtered))
            return [];
        return rowsFromColumns(filtered);
    }
}
/** Column arrays to one record per row. Pure shaping; a gap stays a gap. */
function rowsFromColumns(columns) {
    const arrays = Object.entries(columns).filter((entry) => Array.isArray(entry[1]));
    const rowCount = arrays.reduce((most, [, values]) => Math.max(most, values.length), 0);
    const rows = [];
    for (let index = 0; index < rowCount; index += 1) {
        const record = {};
        for (const [field, values] of arrays) {
            record[field] = index < values.length ? values[index] : null;
        }
        rows.push(record);
    }
    return rows;
}
/**
 * Validates the text of an `.epw` weather file and returns its document.
 *
 * You read the file yourself and pass its text (`await file.text()` in a
 * browser, `readFileSync(path, "utf8")` in Node), because this package also
 * runs where there is no file system.
 *
 * @param text - The whole file.
 * @param options - Optional lower limits on file size and row count.
 * @returns The validated `WeatherDocument`.
 * @throws {TypeError} when `text` is not a string.
 * @throws {EpwParseError} when the file is not usable: no `LOCATION` header,
 * a location number out of range, sub-hourly data, a row shorter than 22
 * columns, an hour outside 1-24, a calendar cell that is not a number, or a
 * file over the size or row limit. The message names the row or the field.
 *
 * @category Weather
 */
export function parseEpw(text, options = {}) {
    if (typeof text !== "string") {
        throw new TypeError("parseEpw takes the EPW file's text; read the file first");
    }
    const wire = {};
    if (options.maxBytes !== undefined)
        wire.max_bytes = options.maxBytes;
    if (options.maxRows !== undefined)
        wire.max_rows = options.maxRows;
    try {
        return new WeatherDocument(JSON.parse(requireCore().weatherParseEpw(text, Object.keys(wire).length === 0 ? "null" : JSON.stringify(wire))));
    }
    catch (error) {
        if (error instanceof EpwParseError)
            throw error;
        throw new EpwParseError(`this is not a usable EPW file: ${reason(error)}`, {
            cause: error,
        });
    }
}
