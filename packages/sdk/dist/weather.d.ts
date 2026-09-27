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
import { type ServiceOptions } from "./internal/service.js";
import { WeatherDocument, type ParseEpwOptions } from "./weather-epw.js";
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherServiceError, } from "./weather-static.js";
export type { StaticWeatherOptions, WeatherStationRow } from "./weather-static.js";
export interface WeatherLocationData {
    readonly city: string;
    readonly state: string;
    readonly country: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly time_zone: number;
    readonly elevation: number;
    readonly station_id: string;
    readonly source: string;
    readonly type: string;
    readonly [key: string]: unknown;
}
export interface WeatherLocation {
    readonly uuid: string;
    readonly identifier: string;
    readonly fileName: string;
    readonly location_data: WeatherLocationData;
    readonly [key: string]: unknown;
}
export interface TimePoint {
    readonly month: number;
    readonly day: number;
    readonly hour: number;
}
export interface TimeFilters {
    readonly period: {
        readonly start: TimePoint;
        readonly end: TimePoint;
    };
}
export type WeatherDataPoint = Readonly<Record<string, unknown>>;
export interface WeatherServiceOptions extends ServiceOptions {
    /** Catalog root; defaults to `DEFAULT_STATIC_BASE_URL`. */
    readonly staticBaseUrl?: string;
}
export declare class WeatherService {
    private readonly reader;
    constructor(options: WeatherServiceOptions);
    /**
     * The nearest catalog stations to a point.
     *
     * `radius` is in KILOMETRES, as the deleted route's `radius` query
     * parameter was, and defaults to 100. At most ten stations come back,
     * nearest first — the same limit the route's `$geoNear` pipeline had.
     */
    getWeatherFileFromLocation(lat: number, lon: number, radius?: number): Promise<WeatherLocation[]>;
    /** One station's full document, found by `uuid` or by `fileName`. */
    getWeatherFileFromIdentifier(identifier: string): Promise<Record<string, unknown>>;
    /**
     * Read and validate one local `.epw` file's TEXT: the bring-your-own
     * weather entry point, and the only one for a file that is not in the
     * public catalog. Nothing is uploaded, nothing is registered and no
     * request leaves this process.
     *
     * Keep the returned document for the retry: its `identity` is what proves
     * a resumed run uses the same weather.
     */
    parseEpw(text: string, options?: ParseEpwOptions): WeatherDocument;
    /**
     * Hours inside the given period, one record per hour.
     *
     * `source` is a public catalog station — by `uuid` or by `fileName` — or a
     * {@link WeatherDocument} from {@link parseEpw}. The BYO document is
     * accepted everywhere a station id is, runs entirely in the bundled core
     * and makes no request at all; the window means the same for both.
     */
    filterWeatherData(source: string | WeatherDocument, filters: TimeFilters): Promise<WeatherDataPoint[]>;
}
