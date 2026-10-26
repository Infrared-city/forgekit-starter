/**
 * Public weather lookups: find weather stations near a point, read a station's data
 * and filter it to a period. Reads need no API key.
 */
import { type ServiceOptions } from "./internal/service.js";
import { WeatherDocument, type ParseEpwOptions } from "./weather-epw.js";
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherServiceError, } from "./weather-static.js";
export type { StaticWeatherOptions, WeatherStationRow } from "./weather-static.js";
/**
 * Where a weather station is and what it is called.
 *
 * @category Weather
 */
export interface WeatherLocationData {
    /** City the station is in. */
    readonly city: string;
    /** State or region. */
    readonly state: string;
    /** Country. */
    readonly country: string;
    /** Latitude, in degrees. */
    readonly latitude: number;
    /** Longitude, in degrees. */
    readonly longitude: number;
    /** Time zone, as recorded in the weather file. */
    readonly time_zone: number;
    /** Elevation, as recorded in the weather file. */
    readonly elevation: number;
    /** The station's id in its source dataset. */
    readonly station_id: string;
    /** The dataset the station comes from. */
    readonly source: string;
    /** The kind of weather file. */
    readonly type: string;
    readonly [key: string]: unknown;
}
/**
 * A weather station in the public catalog.
 *
 * @category Weather
 */
export interface WeatherLocation {
    /** The station's unique id. */
    readonly uuid: string;
    /** The same value as `uuid`; accepted wherever a station identifier is. */
    readonly identifier: string;
    /** The station's weather file name; also accepted as a station identifier. */
    readonly fileName: string;
    /** Where the station is. */
    readonly location_data: WeatherLocationData;
    readonly [key: string]: unknown;
}
/**
 * A month, day and hour of the year, with no year attached.
 *
 * @category Weather
 */
export interface TimePoint {
    /** Month, `1` to `12`. */
    readonly month: number;
    /** Day of the month, `1` up to the length of that month (`29` for February). */
    readonly day: number;
    /** Hour of the day, `0` to `23`, in the weather file's local standard time. */
    readonly hour: number;
}
/**
 * The period to keep when filtering weather data.
 *
 * The period is a span of dates with a daily hour range: from `1 March 08:00` to
 * `30 September 18:00` selects hours 08 to 18 of every day between those dates. The
 * end must not fall earlier in the year than the start.
 *
 * @category Weather
 */
export interface TimeFilters {
    /** The first and last point of the period, both inclusive. */
    readonly period: {
        readonly start: TimePoint;
        readonly end: TimePoint;
    };
}
/**
 * One hour of weather data: field name (such as `dryBulbTemperature` or
 * `windSpeed`) to value. Numeric fields are numbers, or `null` when missing.
 *
 * @category Weather
 */
export type WeatherDataPoint = Readonly<Record<string, unknown>>;
/**
 * Options for `WeatherService`.
 *
 * @category Weather
 */
export interface WeatherServiceOptions extends ServiceOptions {
    /** Root URL of the public weather catalog; defaults to `DEFAULT_STATIC_BASE_URL`. */
    readonly staticBaseUrl?: string;
}
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
export declare class WeatherService {
    private readonly reader;
    /**
     * @param options - Service options; `staticBaseUrl`, `fetch` and `timeoutMs` apply.
     */
    constructor(options: WeatherServiceOptions);
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
    getWeatherFileFromLocation(lat: number, lon: number, radius?: number): Promise<WeatherLocation[]>;
    /**
     * One station's full document, found by `uuid` or by `fileName`.
     *
     * @param identifier - The station's `uuid` or `fileName`.
     * @returns The station's document, including its hourly data.
     * @throws {WeatherServiceError} when the station is not in the public catalog (status
     * 404) or the catalog cannot be read.
     */
    getWeatherFileFromIdentifier(identifier: string): Promise<Record<string, unknown>>;
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
    parseEpw(text: string, options?: ParseEpwOptions): WeatherDocument;
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
    filterWeatherData(source: string | WeatherDocument, filters: TimeFilters): Promise<WeatherDataPoint[]>;
}
