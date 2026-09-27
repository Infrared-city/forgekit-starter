/**
 * The weather entry point.
 *
 * The subpath is still named `utilities` because it is a published export
 * name; nothing behind it calls the utilities service any more. See
 * `src/weather-static.ts`.
 */
export { CATALOG_TTL_MS, clearWeatherCatalogCache, DEFAULT_STATIC_BASE_URL, MAX_STATIC_BYTES, StaticWeatherReader, WeatherService, WeatherServiceError, } from "./weather.js";
export type { StaticWeatherOptions, TimeFilters, TimePoint, WeatherDataPoint, WeatherLocation, WeatherLocationData, WeatherServiceOptions, WeatherStationRow, } from "./weather.js";
