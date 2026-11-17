import { validatePreparedAnalysisRequest } from "../request-validation.js";
import { requireCore } from "../internal/core.js";
import { CoreNotReadyError } from "../internal/errors.js";
import { weatherWindow, weatherWindowJson } from "../internal/weather-window.js";
import { WeatherDocument } from "../weather-epw.js";
import { BASE, FAST, LOCATION, MODEL_INPUT_NAMES, PERIOD_ALIASES, SURFACE, TERRAIN, TOP_LEVEL_ALIASES, } from "./payload-aliases.js";
import { THERMAL_CONTROL_KEYS, THERMAL_MODELS, rejectThermalControls, validatePhysics, } from "./thermal-controls.js";
import { pickKeys, registryAlias } from "./registry-pick.js";
import { CAMEL_SURFACE_FIELDS, WIRE_SURFACE_FIELDS, pinSurfaceFields } from "./surface-fields.js";
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
function timePeriod(filtersValue, type) {
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
    // The kernel refuses a window the server would refuse, before anything is submitted
    // (`internal/weather-window.ts`). A year-wrap window and a single-hour window are valid.
    weatherWindow(windowOf(resolved), type);
    return resolved;
}
/**
 * The arrays a model reads from catalog weather, by request name. The KERNEL
 * selects them (`weatherColumns`): column weather is cut to the RESOLVED
 * window (`timePeriod()`, the `filter` shorthand folded in), a gap in a
 * required column is refused, never filled in (D44), and pedestrian wind
 * comfort needs a speed and a direction in every row and two speeds above zero.
 */
function weatherColumns(value, type, period) {
    let text;
    try {
        text = requireCore("prepareAnalysisPayload").weatherColumns(JSON.stringify(value), type, period === undefined ? undefined : weatherWindowJson(windowOf(period), type));
    }
    catch (error) {
        if (error instanceof CoreNotReadyError)
            throw error;
        throw new TypeError(`weatherData: ${error instanceof Error ? error.message : String(error)}`);
    }
    const output = {};
    for (const [snake, column] of Object.entries(JSON.parse(text))) {
        const camel = MODEL_INPUT_NAMES[snake];
        if (camel === undefined)
            throw new TypeError(`unexpected weather column ${snake}`);
        output[camel] = column;
    }
    return output;
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
    // A parsed EPW document must reach the wire as the kernel's SELECTED arrays or not at all.
    // `normalizeTopLevel` copies through any key it has no alias for and
    // `validatePreparedAnalysisRequest` rejects no unknown key, so on any path that returns before
    // the BYO branch below the whole document — up to 8760 rows of every column — would be serialised
    // into the request body: an upload in all but name, which is the one thing BYO weather must never
    // do. Worse, the identity would still be read from the input and stamped on the schedule,
    // asserting a weather the run did not use. Each of those paths therefore REFUSES the document and
    // names what is missing; stripping the key silently would hide the caller's mistake and still
    // leave the identity unearned.
    const byoWeather = input.weather instanceof WeatherDocument ? input.weather : undefined;
    if (input.analysisType === undefined && typeof input["analysis-type"] === "string") {
        if (byoWeather !== undefined) {
            throw new TypeError("weather (a parsed EPW document) needs the camelCase input form: the " +
                "wire-shaped `analysis-type` input is passed through untransformed, " +
                "so no weather arrays are selected. Pass analysisType and " +
                "dateFilters, or select the arrays yourself with " +
                "document.modelInputs(...).");
        }
        // The surface fields are pinned by the kernel rule (`pinSurfaceFields`).
        const raw = { ...input };
        pinSurfaceFields(raw, WIRE_SURFACE_FIELDS);
        return raw;
    }
    const type = input.analysisType ?? input["analysis-type"];
    if (typeof type !== "string" || type.length === 0)
        throw new TypeError("area input requires analysisType");
    // Before any branch picks: on the two thermal models the tier spelling is checked, on every other
    // model a control is REFUSED rather than dropped. The wire-shaped path above returned already —
    // it is a deliberate pass-through and narrows nothing, for any field, on any model.
    if (THERMAL_MODELS.has(type))
        validatePhysics(input);
    else
        rejectThermalControls(input, type);
    let output = { ...input };
    // The pinned surface fields (`emitCellTris` is never asked of the server, ADR 0008, D88): the kernel rule.
    pinSurfaceFields(output, CAMEL_SURFACE_FIELDS);
    if (output.dateFilters === undefined) {
        if (byoWeather !== undefined) {
            throw new TypeError("weather (a parsed EPW document) requires dateFilters: the window is " +
                "what selects the hours a model reads, and without it no arrays can " +
                "be built from the file.");
        }
        return output;
    }
    const filters = record(output.dateFilters, "dateFilters");
    const period = timePeriod(filters, type);
    if (type === "direct-sun-hours" || type === "daylight-availability") {
        if (byoWeather !== undefined) {
            throw new TypeError(`${type} takes no weather arrays; a parsed EPW document is only an ` +
                "input to solar-radiation, thermal-comfort-index and " +
                "thermal-comfort-statistics");
        }
        output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "accuracy", ...SURFACE, ...TERRAIN, ...FAST]));
        output.timePeriod = period;
        return output;
    }
    if (byoWeather !== undefined) {
        // A parsed EPW file. `weather` never reaches the wire: the `pick` in each branch below keeps
        // only the model's own fields, and the SELECTED arrays are what the request carries, exactly as
        // before. Every path that returns before this point refuses a document (above).
        if (output.weatherData !== undefined) {
            throw new TypeError("pass either weather (a parsed EPW document) or weatherData (catalog " +
                "records), never both: the SDK does not choose which weather was meant");
        }
        if (output.solarModel !== undefined) {
            // The request carries no `solar-model` field, so this selector could only validate the file
            // against a model the request cannot ask for — a caller would believe they ran interior
            // irradiance and get ordinary solar radiation. Refused rather than dropped: TypeScript passes
            // an unknown key straight through, so silence here is the defect.
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
            output = pick(output, pickKeys(type, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]));
        }
        else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
            output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS, ...FAST]));
        }
        else {
            // Every other analysis reads no weather array at all — a wind rose is not weather input, and
            // sky view factors, daylight, sun hours and daylight factor take none. Guessing a set would
            // build a paid request out of the wrong arrays.
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
    const weather = output.weatherData;
    if (type === "pedestrian-wind-comfort") {
        output = pick(output, pickKeys(type, [...BASE, "criteria"]));
    }
    else if (type === "solar-radiation") {
        output = pick(output, pickKeys(type, [...BASE, ...LOCATION, ...SURFACE, ...TERRAIN]));
        output.timePeriod = period;
    }
    else if (type === "thermal-comfort-index" || type === "thermal-comfort-statistics") {
        output = pick(output, pickKeys(type, [...BASE, ...LOCATION, "subtype", ...TERRAIN, ...THERMAL_CONTROL_KEYS, ...FAST]));
        output.timePeriod = period;
    }
    else {
        throw new TypeError(`unsupported analysis type ${type}`);
    }
    Object.assign(output, weatherColumns(weather, type, period));
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
        const target = TOP_LEVEL_ALIASES.get(key) ?? registryAlias(key) ?? key;
        if (Object.hasOwn(output, target))
            throw new TypeError(`conflicting aliases for ${target}`);
        // A typed array (a weather column) becomes a plain array once, so the hash and the wire body
        // see the same JSON array (JSON.stringify writes a typed array as an object).
        const plain = ArrayBuffer.isView(value) && !(value instanceof DataView) ? Array.from(value) : value;
        define(output, target, target === "time-period" ? wirePeriod(plain) : plain);
    }
    return output;
}
/**
 * Turns an analysis input into the request body for one analysis, with wire field names.
 * Entity and metadata maps pass through unchanged.
 *
 * @param input - The analysis input, with `analysisType` (or the wire key `analysis-type`).
 * @returns The request body.
 * @throws {TypeError} when the input is invalid for its analysis type.
 * @category Run an analysis
 */
export function prepareAnalysisPayload(input) {
    const source = record(input, "analysis input");
    validatePreparedAnalysisRequest(normalizeTopLevel(source, true));
    const explicitWire = source.analysisType === undefined && typeof source["analysis-type"] === "string";
    const transformed = modelTransform(source);
    const output = normalizeTopLevel(transformed, explicitWire);
    validatePreparedAnalysisRequest(output);
    return output;
}
/**
 * Alias of `prepareAnalysisPayload`.
 * @category Run an analysis
 */
export const prepareAreaPayload = prepareAnalysisPayload;
