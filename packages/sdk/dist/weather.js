/**
 * Public weather lookups: find weather stations near a point, read a station's data
 * and filter it to a period. Reads need no API key.
 */
// Maintainer note (not published): `WeatherService` keeps its three method names and its
// return shapes. What changed is underneath: the deleted utilities-service routes
// (`GET /utils/weather/location`, `POST /utils/weather/{id}/data`,
// `POST /utils/weather/{id}/data/filter`) are replaced by a public, unauthenticated
// catalog read plus two kernel calls. See `src/weather-static.ts` for the transport and
// cache rules, and `docs/DEVIATIONS.md` D40 for the differences from the deleted routes.
import { rejectRemovedOption } from "./internal/service.js";
import { weatherWindowJson } from "./internal/weather-window.js";
import { parseEpw, WeatherDocument } from "./weather-epw.js";
import { StaticWeatherReader } from "./weather-static.js";
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherServiceError, } from "./weather-static.js";
/**
 * Look up public weather stations, read their data and filter it to a period, or
 * validate your own `.epw` file.
 *
 * Lookups read a public catalog and send no credentials. The authentication and
 * `baseUrl` of the options are not used; `fetch`, `timeoutMs` and `staticBaseUrl`
 * are.
 *
 * @category Weather
 */
export class WeatherService {
    reader;
    /**
     * @param options - Service options; `staticBaseUrl`, `fetch` and `timeoutMs` apply.
     */
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
     * At most ten stations come back, nearest first.
     *
     * @param lat - Latitude of the point, in degrees.
     * @param lon - Longitude of the point, in degrees.
     * @param radius - Search radius in kilometres. Defaults to 100.
     * @returns The stations within the radius, nearest first.
     * @throws {WeatherServiceError} when the catalog cannot be read.
     */
    // Maintainer note (not published): `radius` is in KILOMETRES, as the deleted route's
    // `radius` query parameter was, and defaults to 100. The limit of ten is the same one
    // the route's `$geoNear` pipeline had.
    async getWeatherFileFromLocation(lat, lon, radius) {
        const stations = await this.reader.nearestStations(lat, lon, radius);
        return stations.map((station) => {
            const uuid = station["uuid"];
            if (typeof uuid !== "string")
                throw new TypeError("weather location has no uuid");
            return { ...station, uuid, identifier: uuid };
        });
    }
    /**
     * One station's full document, found by `uuid` or by `fileName`.
     *
     * @param identifier - The station's `uuid` or `fileName`.
     * @returns The station's document, including its hourly data.
     * @throws {WeatherServiceError} when the station is not in the public catalog (status
     * 404) or the catalog cannot be read.
     */
    async getWeatherFileFromIdentifier(identifier) {
        return this.reader.stationByIdentifier(identifier);
    }
    /**
     * Read and validate the text of one local `.epw` file. This is the way to use your
     * own weather, and the only way for a file that is not in the public catalog.
     * Nothing is uploaded or registered, and no request leaves this process.
     *
     * Keep the returned document for the retry: its `identity` is what proves a
     * resumed run uses the same weather.
     *
     * @param text - The contents of the `.epw` file.
     * @param options - Optional tighter limits on file size and row count.
     * @returns The validated weather document.
     * @throws {EpwParseError} when the file is not a valid EPW file.
     */
    parseEpw(text, options) {
        return parseEpw(text, options);
    }
    /**
     * Hours inside the given period, one record per hour.
     *
     * `source` is a public catalog station, given by `uuid` or by `fileName`, or a
     * `WeatherDocument` from `parseEpw`. A document is accepted everywhere a station id
     * is, is filtered locally and makes no request; the period means the same for both.
     *
     * @param source - A station `uuid` or `fileName`, or a `WeatherDocument`.
     * @param filters - The period to keep.
     * @returns One record per hour inside the period; empty when nothing matches.
     * @throws {TypeError} when the period is malformed (a month outside 1-12, an hour
     * outside 0-23, a day outside its month) or ends earlier in the year than it starts.
     * @throws {WeatherServiceError} when the station is not in the public catalog or the
     * catalog cannot be read.
     */
    async filterWeatherData(source, filters) {
        rejectRemovedOption(filters, "filter", "it was the deleted route's `hour-filter` body field and has no kernel twin; " +
            "filter the returned records yourself");
        if (source instanceof WeatherDocument)
            return source.filterHours(filters);
        return this.reader.filterHours(source, weatherWindowJson(filters));
    }
}
