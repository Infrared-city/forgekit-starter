/**
 * Bring-your-own weather: the HOST half of the EPW path.
 *
 * Contract: `docs/plans/2026-09-07-byo-weather-epw-contract.md` (sections
 * 3-10). Intended differences from the deleted service: `docs/DEVIATIONS.md`
 * D44 (kernel) and D45 (host). The Python twin is
 * `public/python/src/infrared_sdk/layers/weather_epw.py`; the two files call
 * the same three kernel operations with the same arguments, so one file
 * cannot mean two different things in two SDKs.
 *
 * **What this module does, and what it must not do.** It hands text to the
 * kernel and shapes what comes back. It does not parse EPW text, does not
 * decide which arrays a model needs, does not filter a window and does not
 * compute a digest. All four are `infrared-core`'s.
 *
 * Reading the FILE is the caller's, not this module's: a browser has no file
 * system and Node's does not belong in a package that runs in both. Pass the
 * text (`await file.text()`, `readFileSync(path, "utf8")`).
 *
 * There is no registration, no upload and no private weather database.
 */
import { requireCore } from "./internal/core.js";
import { weatherWindow, weatherWindowJson } from "./internal/weather-window.js";
/**
 * The analyses that READ weather arrays, and so the ones a weather identity
 * is meaningful for. The kernel's own set
 * (`ir_geodata::weather::model_inputs`).
 *
 * `energy-balance` is the interior model, and the ONE analysis whose worker
 * reads the request field `solar-model` (`lambda-models`
 * `interior/solar_input.rs`): omitted or `"legacy-flat"` it reads dry-bulb
 * temperature and global horizontal radiation, `"irradiance"` it reads those
 * two plus the direct and diffuse series and needs a full year. Neither SDK
 * can submit an energy-balance AREA run today — the name is not in
 * `AnalysesName` — so listing it here changes no resume guard; it keeps the
 * host's statement of what reads weather equal to the kernel's.
 *
 * Wind, pedestrian wind comfort, sky view factors, daylight, sun hours and
 * daylight factor take no weather array at all.
 */
export const WEATHER_BEARING_ANALYSES = new Set([
    "thermal-comfort-index",
    "thermal-comfort-statistics",
    "solar-radiation",
    "energy-balance",
]);
/** An EPW file the kernel refuses, carrying the kernel's own reason. */
export class EpwParseError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = "EpwParseError";
    }
}
/** The document cannot supply what the requested model needs. */
export class WeatherModelInputsError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = "WeatherModelInputsError";
    }
}
function reason(error) {
    return error instanceof Error ? error.message : String(error);
}
/**
 * One validated EPW file, as the kernel's `weather_document`.
 *
 * Hold it, build a payload from it, and keep it for the retry: its
 * `identity` is what proves a resumed run uses the same weather as the run
 * it resumes (contract section 9).
 *
 * **The identity is computed on every read, never cached.** `document` is
 * plain data a caller can reach and change, and a caller who edits it after
 * submitting must be REFUSED on the retry rather than served a stale digest
 * that says the weather is unchanged.
 */
export class WeatherDocument {
    document;
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
     * columns and the hour basis — never the file name, a station id or the
     * raw text, so two differently formatted files with the same readings
     * share one identity.
     */
    get identity() {
        try {
            return requireCore().weatherIdentity(JSON.stringify(this.document));
        }
        catch (error) {
            throw new EpwParseError(`this weather document has no computable identity: ${reason(error)}`, { cause: error });
        }
    }
    /** The EPW `LOCATION` header, as the document records it. */
    get location() {
        return (this.document.location ?? {});
    }
    /** Row count, records per hour, leap-year and full-year verdicts. */
    get period() {
        return (this.document.period ?? {});
    }
    /** Data rows in the file, before any window is applied. */
    get rows() {
        const rows = this.period.rows;
        return typeof rows === "number" ? rows : 0;
    }
    /**
     * The snake_case arrays one model reads, for one window.
     *
     * The kernel applies the window first, then checks the required fields on
     * the FILTERED rows, then the period rule — so a gap outside the window is
     * harmless, a gap inside it raises, and a model that needs a full year
     * raises on a shorter one. Every rejection reaches the caller BEFORE a
     * request is submitted, and therefore before anything is billed.
     *
     * `solarModel` belongs to `analysisType: "energy-balance"`, the one
     * analysis whose worker reads it; on any other analysis it raises,
     * because nothing in the fleet would read it there. `"irradiance"`
     * selects the interior-irradiance input set and its full-year rule;
     * omitted, or `"legacy-flat"`, selects the two climate arrays that model
     * reads.
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
     * The file's hours inside `filters`, one record per hour — the same shape
     * `WeatherService.filterWeatherData` returns for a public station, from a
     * local file and with no network call.
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
 * Validate one `.epw` file's TEXT and return its document.
 *
 * `text` is the whole file. The caller reads it — this package runs in a
 * browser too, where there is no file system.
 *
 * Throws {@link EpwParseError} for every file the kernel refuses: no
 * `LOCATION` header, a location number out of range, sub-hourly data, a row
 * shorter than 22 columns, an hour outside 1-24, a calendar cell that is not
 * a number, or a file over the size or row bound. The message names the row
 * or the field.
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
