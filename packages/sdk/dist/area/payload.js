import { validatePreparedAnalysisRequest } from "../request-validation.js";
import { requireCore } from "../internal/core.js";
import { CoreNotReadyError } from "../internal/errors.js";
import { weatherWindow, weatherWindowJson } from "../internal/weather-window.js";
import { WeatherDocument } from "../weather-epw.js";
import { BASE, LOCATION, MODEL_INPUT_NAMES, PERIOD_ALIASES, SURFACE, TERRAIN, TOP_LEVEL_ALIASES, } from "./payload-aliases.js";
import { THERMAL_CONTROL_KEYS, THERMAL_MODELS, rejectThermalControls, validatePhysics, } from "./thermal-controls.js";
function define(target, key, value) {
    Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}
function record(value, name) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`${name} must be an object`);
    }
    return value;
}
function numeric(value, name) {
    const result = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(result))
        throw new TypeError(`${name} must be numeric`);
    return result;
}
function range(value) {
    if (typeof value !== "string" || value.length === 0)
        return undefined;
    const parts = value.split("-").map(Number);
    if (parts.length === 1 && Number.isFinite(parts[0]))
        return [parts[0], parts[0]];
    if (parts.length === 2 && parts.every(Number.isFinite))
        return [parts[0], parts[1]];
    return undefined;
}
function timePeriod(filtersValue) {
    const filters = record(filtersValue, "dateFilters");
    const period = record(filters.period, "dateFilters.period");
    const start = record(period.start, "dateFilters.period.start");
    const end = record(period.end, "dateFilters.period.end");
    const filter = filters.filter === undefined ? {} : record(filters.filter, "dateFilters.filter");
    const hours = range(filter.hour);
    const days = range(filter.day);
    const resolved = {
        startMonth: numeric(start.month, "start month"),
        startDay: days?.[0] ?? numeric(start.day, "start day"),
        startHour: hours?.[0] ?? numeric(start.hour, "start hour"),
        endMonth: numeric(end.month, "end month"),
        endDay: days?.[1] ?? numeric(end.day, "end day"),
        endHour: hours?.[1] ?? numeric(end.hour, "end hour"),
    };
    // Refuse a MALFORMED window here, before it is submitted — a month outside
    // 1-12, an hour outside 0-23, a day outside its own month's length. A
    // window that wraps the year end and a single-hour window are both valid
    // and reach the model unchanged (`internal/weather-window.ts`, D45). This
    // package validated nothing here up to 0.9, so this is a narrowing, and it
    // narrows only what no model could have read.
    weatherWindow(windowOf(resolved));
    return resolved;
}
function weatherRows(value, period) {
    if (Array.isArray(value))
        return value.map((row, index) => record(row, `weatherData[${index}]`));
    const columns = record(value, "weatherData");
    if (!Array.isArray(columns.month) || !Array.isArray(columns.day) || !Array.isArray(columns.hour)) {
        throw new TypeError("weatherData must be rows or an EPW column object");
    }
    // Column-form weather is a station document's hourly arrays: the KERNEL
    // selects the RESOLVED window (`timePeriod()` — period with the `filter`
    // day/hour shorthand folded in, the same `time-period` the model receives)
    // with the `filter_hours` the deleted service ran: month AND day AND hour,
    // EPW hours 1-24 on a 0-23 basis. Up to 0.12 this package selected by month.
    let filtered;
    try {
        filtered = requireCore().weatherFilterHours(JSON.stringify({ weatherData: columns }), weatherWindowJson(windowOf(period)));
    }
    catch (error) {
        if (error instanceof CoreNotReadyError)
            throw error;
        throw new TypeError(`weatherData could not be filtered to dateFilters.period: ${error instanceof Error ? error.message : String(error)}`);
    }
    const kept = record(record(JSON.parse(filtered), "weatherData").weatherData, "weatherData");
    const hours = Array.isArray(kept.hour) ? kept.hour : [];
    const output = [];
    for (let index = 0; index < hours.length; index += 1) {
        const row = {};
        for (const [key, column] of Object.entries(kept)) {
            if (Array.isArray(column))
                row[key] = column[index];
        }
        output.push(row);
    }
    return output;
}
/**
 * One column of a model's weather input, kept in step with its siblings.
 *
 * A gap is a REJECTION, not a shortened column. Dropping the row here left
 * this column one shorter than every other array, so every hour after the
 * gap reached the model as the next hour's reading — silently, and after the
 * charge (`docs/DEVIATIONS.md` D44 rule 1, D45). Substituting a value is
 * refused for the same reason: it would change a billed result. The twin is
 * the Python `analyses.types._rows_to_columns`.
 */
function series(rows, key) {
    const output = [];
    for (const [index, row] of rows.entries()) {
        const value = row[key];
        if (value === null || value === undefined) {
            throw new TypeError(`weather column ${key} has no reading at row ${index} of ${rows.length} in ` +
                "the selected window. A gap in a required column is refused, never " +
                "filled in: substituting a value would change a billed result. " +
                "Choose a window without the gap, or bring a file that covers it.");
        }
        output.push(numeric(value, `weatherData.${key}`));
    }
    return output;
}
function pairedWind(rows) {
    const windSpeed = [];
    const windDirection = [];
    for (const row of rows) {
        if (row.windSpeed === null || row.windSpeed === undefined ||
            row.windDirection === null || row.windDirection === undefined)
            continue;
        windSpeed.push(numeric(row.windSpeed, "weatherData.windSpeed"));
        windDirection.push(numeric(row.windDirection, "weatherData.windDirection"));
    }
    return { windSpeed, windDirection };
}
function pick(input, keys) {
    const output = {};
    for (const key of keys) {
        if (input[key] !== undefined)
            output[key] = input[key];
    }
    return output;
}
/** The window the wire carries, as the shape the weather kernel takes. */
function windowOf(period) {
    return {
        period: {
            start: {
                month: period.startMonth,
                day: period.startDay,
                hour: period.startHour,
            },
            end: {
                month: period.endMonth,
                day: period.endDay,
                hour: period.endHour,
            },
        },
    };
}
/**
 * Bring-your-own weather: the KERNEL selects this model's arrays.
 *
 * It applies the window, checks the required columns on the filtered rows
 * and checks the period rule, so an unusable file raises here rather than
 * after the charge.
 *
 * No `solarModel` is passed. A request can only select the models it has a
 * field for, so validating a file against interior irradiance here would
 * check it against a model this request cannot ask for. That selector stays
 * on `WeatherDocument.modelInputs`, where the caller is asking the kernel a
 * question rather than building a request (`docs/DEVIATIONS.md` D45 §6).
 */
function kernelWeather(output, document, type, period, subtype) {
    const columns = document.modelInputs({
        analysisType: type,
        timePeriod: windowOf(period),
        ...(subtype === undefined ? {} : { subtype }),
    });
    for (const [snake, value] of Object.entries(columns)) {
        const camel = MODEL_INPUT_NAMES[snake];
        if (camel === undefined)
            throw new TypeError(`unexpected weather column ${snake}`);
        output[camel] = value;
    }
}
function modelTransform(input) {
    // A parsed EPW document must reach the wire as the kernel's SELECTED
    // arrays or not at all. `normalizeTopLevel` copies through any key it has
    // no alias for and `validatePreparedAnalysisRequest` rejects no unknown
    // key, so on any path that returns before the BYO branch below the whole
    // document — up to 8760 rows of every column — would be serialised into
    // the request body: an upload in all but name, which is the one thing BYO
    // weather must never do. Worse, the identity would still be read from the
    // input and stamped on the schedule, asserting a weather the run did not
    // use. Each of those paths therefore REFUSES the document and names what
    // is missing; stripping the key silently would hide the caller's mistake
    // and still leave the identity unearned.
    const byoWeather = input.weather instanceof WeatherDocument ? input.weather : undefined;
    if (input.analysisType === undefined && typeof input["analysis-type"] === "string") {
        if (byoWeather !== undefined) {
            throw new TypeError("weather (a parsed EPW document) needs the camelCase input form: the " +
                "wire-shaped `analysis-type` input is passed through untransformed, " +
                "so no weather arrays are selected. Pass analysisType and " +
                "dateFilters, or select the arrays yourself with " +
                "document.modelInputs(...).");
        }
        // The one field this pass-through DOES narrow, and for the same reason the
        // camelCase path does below: the server's `cell-tris` arm is 12.6x the body
        // for a picture this SDK's kernel draws for free, so no request this SDK
        // builds asks for it (D88).
        const raw = { ...input };
        if (raw["analysis-surfaces"] != null)
            raw["emit-cell-tris"] = false;
        return raw;
    }
    const type = input.analysisType ?? input["analysis-type"];
    if (typeof type !== "string" || type.length === 0)
        throw new TypeError("area input requires analysisType");
    // Before any branch picks: on the two thermal models the tier spelling is
    // checked, on every other model a control is REFUSED rather than dropped.
    // The wire-shaped path above returned already — it is a deliberate
    // pass-through and narrows nothing, for any field, on any model.
    if (THERMAL_MODELS.has(type))
        validatePhysics(input);
    else
        rejectThermalControls(input, type);
    let output = { ...input };
    // PINNED false, not defaulted: the server's `cell-tris` arm is 12.6x the
    // response body (+214 MB on the 66-job F3 scene) for a picture this SDK's
    // own kernel draws for free. A caller asking `emitCellTris: true` is asking
    // for the TRIANGLES, not for the server to render them, and gets them
    // synthesized locally after the merge -- `area/facade-synthesis.ts`,
    // ADR 0008, `docs/DEVIATIONS.md` D88. The wire-shaped `analysis-type` path
    // above returns before this and still passes the field through untouched.
    if (output.analysisSurfaces != null)
        output.emitCellTris = false;
    if (output.dateFilters === undefined) {
        if (byoWeather !== undefined) {
            throw new TypeError("weather (a parsed EPW document) requires dateFilters: the window is " +
                "what selects the hours a model reads, and without it no arrays can " +
                "be built from the file.");
        }
        return output;
    }
    const filters = record(output.dateFilters, "dateFilters");
    const period = timePeriod(filters);
    if (type === "direct-sun-hours" || type === "daylight-availability") {
        if (byoWeather !== undefined) {
            throw new TypeError(`${type} takes no weather arrays; a parsed EPW document is only an ` +
                "input to solar-radiation, thermal-comfort-index and " +
                "thermal-comfort-statistics");
        }
        output = pick(output, [...BASE, ...LOCATION, "accuracy", ...SURFACE, ...TERRAIN]);
        output.timePeriod = period;
        return output;
    }
    if (byoWeather !== undefined) {
        // A parsed EPW file. `weather` never reaches the wire: the `pick` in
        // each branch below keeps only the model's own fields, and the SELECTED
        // arrays are what the request carries, exactly as before. Every path
        // that returns before this point refuses a document (above).
        if (output.weatherData !== undefined) {
            throw new TypeError("pass either weather (a parsed EPW document) or weatherData (catalog " +
                "records), never both: the SDK does not choose which weather was meant");
        }
        if (output.solarModel !== undefined) {
            // The request carries no `solar-model` field, so this selector could
            // only validate the file against a model the request cannot ask for —
            // a caller would believe they ran interior irradiance and get ordinary
            // solar radiation. Refused rather than dropped: TypeScript passes an
            // unknown key straight through, so silence here is the defect.
            throw new TypeError("solarModel is not an area-request field: this SDK cannot submit an " +
                "interior-irradiance run yet. To VALIDATE a file against that " +
                "model's required set and its full-year rule, call " +
                "document.modelInputs({ analysisType, timePeriod, solarModel }) " +
                "directly.");
        }
        // Read `subtype` BEFORE `pick` drops it: it survives only on the thermal
        // branch, and the kernel takes it as part of the frozen request shape.
        const subtype = typeof output.subtype === "string" ? output.subtype : undefined;
        if (type === "solar-radiation") {
            output = pick(output, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]);
        }
        else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
            output = pick(output, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS]);
        }
        else {
            // Every other analysis reads no weather array at all — a wind rose is
            // not weather input, and sky view factors, daylight, sun hours and
            // daylight factor take none. Guessing a set would build a paid request
            // out of the wrong arrays.
            throw new TypeError(`${type} takes no weather arrays; a parsed EPW document is only an ` +
                "input to solar-radiation, thermal-comfort-index and " +
                "thermal-comfort-statistics");
        }
        output.timePeriod = period;
        kernelWeather(output, byoWeather, type, period, subtype);
        return output;
    }
    if (output.weatherData === undefined)
        throw new TypeError(`${type} requires weatherData`);
    const rows = weatherRows(output.weatherData, period);
    if (type === "pedestrian-wind-comfort") {
        output = pick(output, [...BASE, "criteria"]);
        const wind = pairedWind(rows);
        if (wind.windSpeed.length === 0)
            throw new TypeError("pedestrian-wind-comfort needs paired wind data");
        Object.assign(output, wind);
    }
    else if (type === "solar-radiation") {
        output = pick(output, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]);
        output.timePeriod = period;
        output.directNormalRadiation = series(rows, "directNormalRadiation");
        output.diffuseHorizontalRadiation = series(rows, "diffuseHorizontalRadiation");
    }
    else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
        output = pick(output, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS]);
        output.timePeriod = period;
        for (const key of [
            "horizontalInfraredRadiationIntensity", "diffuseHorizontalRadiation",
            "directNormalRadiation", "globalHorizontalRadiation", "dryBulbTemperature",
            "windSpeed", "relativeHumidity",
        ])
            output[key] = series(rows, key);
    }
    else {
        throw new TypeError(`unsupported analysis type ${type}`);
    }
    return output;
}
function wirePeriod(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return value;
    const output = {};
    for (const [key, item] of Object.entries(value))
        define(output, PERIOD_ALIASES.get(key) ?? key, item);
    return output;
}
function normalizeTopLevel(input, preserveNullish) {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
        if (!preserveNullish && (value === null || value === undefined))
            continue;
        const target = TOP_LEVEL_ALIASES.get(key) ?? key;
        if (Object.hasOwn(output, target))
            throw new TypeError(`conflicting aliases for ${target}`);
        define(output, target, target === "time-period" ? wirePeriod(value) : value);
    }
    return output;
}
/** Prepare used model inputs while preserving opaque entity and metadata maps. */
export function prepareAnalysisPayload(input) {
    const source = record(input, "analysis input");
    validatePreparedAnalysisRequest(normalizeTopLevel(source, true));
    const explicitWire = source.analysisType === undefined && typeof source["analysis-type"] === "string";
    const transformed = modelTransform(source);
    const output = normalizeTopLevel(transformed, explicitWire);
    validatePreparedAnalysisRequest(output);
    return output;
}
export const prepareAreaPayload = prepareAnalysisPayload;
