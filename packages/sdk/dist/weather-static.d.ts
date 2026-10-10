/** Public weather catalog reader: nearest stations, station data and period filtering. */
import { type PublicRequestOptions } from "./geodata/index.js";
export { WeatherServiceError, type WeatherStationRow, } from "./internal/weather-static-decode.js";
/**
 * Root URL of the public weather catalog (`https://geo.infrared.city/weather`).
 *
 * @category Weather
 */
export declare const DEFAULT_STATIC_BASE_URL = "https://geo.infrared.city/weather";
/**
 * Largest single catalog object the reader will download, in bytes (64 MiB).
 *
 * @category Weather
 */
export declare const MAX_STATIC_BYTES: number;
/**
 * How long, in milliseconds, the catalog's "latest" pointer is trusted (5 minutes).
 *
 * @category Weather
 */
export declare const CATALOG_TTL_MS = 300000;
/**
 * Forget all cached catalog data in this page, Worker or Node process.
 *
 * @category Weather
 */
export declare function clearWeatherCatalogCache(): void;
/**
 * Options for `StaticWeatherReader`, on top of the shared request options.
 *
 * @category Weather
 */
export interface StaticWeatherOptions extends PublicRequestOptions {
    /** Catalog root; defaults to {@link DEFAULT_STATIC_BASE_URL}. */
    readonly baseUrl?: string;
    /** Pointer refresh interval; defaults to {@link CATALOG_TTL_MS}. */
    readonly catalogTtlMs?: number;
}
/**
 * Reads the public weather catalog, caching what it downloads per page, Worker or
 * Node process. `WeatherService` uses it for you.
 *
 * @category Weather
 */
export declare class StaticWeatherReader {
    private readonly baseUrl;
    private readonly request;
    private readonly ttlMs;
    /** Create a reader; every option is optional. */
    constructor(options?: StaticWeatherOptions);
    /** The generation folder the pointer names, re-read on the TTL. */
    private folderUrl;
    /** The catalog for the current generation, parsed at most once per ETag. */
    private catalog;
    /** uuid or fileName to a catalog row, or the typed 404 (D40). */
    private resolveStation;
    /** One station's data object as TEXT, gzip handled either way. */
    private stationText;
    /**
     * The nearest stations to a point (`lat`, `lon` in degrees), nearest first, at most
     * ten. `radiusKm` defaults to 100.
     *
     * @throws {WeatherServiceError} when the catalog cannot be read or ranked.
     */
    nearestStations(lat: number, lon: number, radiusKm?: number): Promise<Array<Record<string, unknown>>>;
    /**
     * One station's full document, found by `uuid` or `fileName`.
     *
     * @throws {WeatherServiceError} when the station is unknown (404) or the catalog is unreadable.
     */
    stationByIdentifier(identifier: string): Promise<Record<string, unknown>>;
    /**
     * A station's hourly arrays (under `weatherData`), filtered to a period given as JSON
     * text built from `TimeFilters`.
     *
     * @throws {WeatherServiceError} when the station is unknown, the catalog is unreadable or the
     * period is rejected.
     */
    filterHours(identifier: string, timePeriodJson: string): Promise<Record<string, unknown>>;
}
