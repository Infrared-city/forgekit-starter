/**
 * Public weather lookups, read from the static catalog.
 *
 * `WeatherService` keeps its three method names and its return shapes. What
 * changed is underneath: the deleted utilities-service routes
 * (`GET /utils/weather/location`, `POST /utils/weather/{id}/data`,
 * `POST /utils/weather/{id}/data/filter`) are replaced by a public,
 * unauthenticated catalog read plus two kernel calls. See
 * `src/weather-static.ts` for the transport and cache rules, and
 * `docs/DEVIATIONS.md` D40 for the differences from the deleted routes.
 */
import { rejectRemovedOption } from "./internal/service.js";
import { weatherWindowJson } from "./internal/weather-window.js";
import { parseEpw, WeatherDocument } from "./weather-epw.js";
import { StaticWeatherReader } from "./weather-static.js";
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherServiceError, } from "./weather-static.js";
const NUMERIC_WEATHER_FIELDS = new Set([
    "dryBulbTemperature", "dewPointTemperature", "relativeHumidity",
    "atmosphericStationPressure", "extraterrestrialHorizontalRadiation",
    "extraterrestrialDirectNormalRadiation", "horizontalInfraredRadiationIntensity",
    "globalHorizontalRadiation", "directNormalRadiation", "diffuseHorizontalRadiation",
    "globalHorizontalIlluminance", "directNormalIlluminance", "diffuseHorizontalIlluminance",
    "zenithLuminance", "windDirection", "windSpeed", "totalSkyCover", "opaqueSkyCover",
    "visibility", "ceilingHeight", "presentWeatherObservation", "presentWeatherCodes",
    "precipitableWater", "aerosolOpticalDepth", "snowDepth", "daysSinceLastSnowfall",
    "albedo", "liquidPrecipitationDepth", "liquidPrecipitationQuantity",
]);
function weatherNumber(value, field) {
    if (value === null || value === undefined || typeof value === "number")
        return value ?? null;
    if (typeof value !== "string")
        throw new TypeError(`${field} must be numeric`);
    const trimmed = value.trim();
    if (trimmed === "" || /^(null|none|na|n\/a|nan)$/i.test(trimmed))
        return null;
    const parsed = Number.parseFloat(trimmed);
    if (Number.isNaN(parsed))
        throw new TypeError(`${field} must be numeric`);
    return parsed;
}
function normalizeWeatherPoint(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("weather data point must be an object");
    }
    const output = { ...value };
    for (const field of NUMERIC_WEATHER_FIELDS) {
        if (Object.hasOwn(output, field))
            output[field] = weatherNumber(output[field], field);
    }
    return output;
}
/**
 * The kernel's filtered `weatherData` — one array per field — as one record
 * per hour. Pure shaping; the filtering itself was the kernel's job. Twin of
 * the Python `records_from_weather_data`.
 */
function rowsFromWeatherData(weatherData) {
    const columns = Object.entries(weatherData).filter((entry) => Array.isArray(entry[1]));
    const rowCount = columns.reduce((most, [, values]) => Math.max(most, values.length), 0);
    const rows = [];
    for (let index = 0; index < rowCount; index += 1) {
        const record = {};
        for (const [field, values] of columns) {
            record[field] = index < values.length ? values[index] : null;
        }
        rows.push(normalizeWeatherPoint(record));
    }
    return rows;
}
export class WeatherService {
    reader;
    constructor(options) {
        // Only the transport settings reach the public catalog host: it takes no
        // credentials, so `baseUrl` and `auth` are unused here.
        this.reader = new StaticWeatherReader({
            ...(options.staticBaseUrl === undefined ? {} : { baseUrl: options.staticBaseUrl }),
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
        });
    }
    /**
     * The nearest catalog stations to a point.
     *
     * `radius` is in KILOMETRES, as the deleted route's `radius` query
     * parameter was, and defaults to 100. At most ten stations come back,
     * nearest first — the same limit the route's `$geoNear` pipeline had.
     */
    async getWeatherFileFromLocation(lat, lon, radius) {
        const stations = await this.reader.nearestStations(lat, lon, radius);
        return stations.map((station) => {
            const uuid = station["uuid"];
            if (typeof uuid !== "string")
                throw new TypeError("weather location has no uuid");
            return { ...station, uuid, identifier: uuid };
        });
    }
    /** One station's full document, found by `uuid` or by `fileName`. */
    async getWeatherFileFromIdentifier(identifier) {
        return this.reader.stationByIdentifier(identifier);
    }
    /**
     * Read and validate one local `.epw` file's TEXT: the bring-your-own
     * weather entry point, and the only one for a file that is not in the
     * public catalog. Nothing is uploaded, nothing is registered and no
     * request leaves this process.
     *
     * Keep the returned document for the retry: its `identity` is what proves
     * a resumed run uses the same weather.
     */
    parseEpw(text, options) {
        return parseEpw(text, options);
    }
    /**
     * Hours inside the given period, one record per hour.
     *
     * `source` is a public catalog station — by `uuid` or by `fileName` — or a
     * {@link WeatherDocument} from {@link parseEpw}. The BYO document is
     * accepted everywhere a station id is, runs entirely in the bundled core
     * and makes no request at all; the window means the same for both.
     */
    async filterWeatherData(source, filters) {
        rejectRemovedOption(filters, "filter", "it was the deleted route's `hour-filter` body field and has no kernel twin; " +
            "filter the returned records yourself");
        if (source instanceof WeatherDocument)
            return source.filterHours(filters);
        const filtered = await this.reader.filterHours(source, weatherWindowJson(filters));
        const weatherData = filtered["weatherData"];
        if (weatherData === null || typeof weatherData !== "object" || Array.isArray(weatherData)) {
            return [];
        }
        return rowsFromWeatherData(weatherData);
    }
}
