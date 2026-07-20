import { z } from 'zod';
import { L as Latitude, g as Longitude, T as TimeFilters, W as WeatherDataPoint } from './types-ChcKqRt2.js';
import { A as AuthResolver } from './auth-D2CCPTLa.js';
import { L as Logger } from './logger-U3BDdomT.js';

/**
 * Weather location schema
 */
declare const WeatherLocationSchema: z.ZodPipe<z.ZodObject<{
    uuid: z.ZodString;
    fileName: z.ZodString;
    location_data: z.ZodObject<{
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        time_zone: z.ZodNumber;
        elevation: z.ZodNumber;
        station_id: z.ZodString;
        source: z.ZodString;
        type: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodTransform<{
    identifier: string;
    uuid: string;
    fileName: string;
    location_data: {
        city: string;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
        time_zone: number;
        elevation: number;
        station_id: string;
        source: string;
        type: string;
    };
}, {
    uuid: string;
    fileName: string;
    location_data: {
        city: string;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
        time_zone: number;
        elevation: number;
        station_id: string;
        source: string;
        type: string;
    };
}>>;
type WeatherLocation = z.infer<typeof WeatherLocationSchema>;
interface WeatherServiceConfig {
    /** Auth header resolver — supports apiKey + JWT (token / getToken). */
    getAuthHeaders: AuthResolver;
    baseUrl: string;
    logger: Logger;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Bare gateway URL for big-payload presign. Threaded from InfraredClient. */
    gatewayBaseUrl?: string;
    /** Lazy big-payload kill switch — re-resolved per call. */
    getBigPayloadEnabled?: () => boolean;
    /** Lazy big-payload threshold (bytes) — re-resolved per call. */
    getBigPayloadThresholdBytes?: () => number;
}
/**
 * Interface for dependency injection and testing.
 */
interface IWeatherService {
    getWeatherFileFromLocation(lat: Latitude, lon: Longitude, radius?: number): Promise<WeatherLocation[]>;
    getWeatherFileFromIdentifier(identifier: string): Promise<unknown>;
    filterWeatherData(identifier: string, filters: TimeFilters): Promise<WeatherDataPoint[]>;
    /**
     * Generate a layer/grid image from analysis output. POST `/analysis/generate-image`
     * with `Accept: image/png` and returns raw PNG bytes. Mirrors Python
     * `WeatherServiceClient.gen_grid_image`. Routed through the big-payload
     * `$ref` envelope above the threshold.
     */
    generateImage(payload: Record<string, unknown>): Promise<Uint8Array>;
}
/**
 * Utility service client for weather data operations
 */
declare class WeatherService implements IWeatherService {
    private httpClient;
    private logger;
    private readonly getAuthHeaders;
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly gatewayBaseUrl?;
    private readonly getBigPayloadEnabled;
    private readonly getBigPayloadThresholdBytes;
    constructor(config: WeatherServiceConfig);
    /**
     * Get weather file locations from geographic coordinates.
     *
     * @param lat - Latitude of the search center (-90 to 90).
     * @param lon - Longitude of the search center (-180 to 180).
     * @param radius - Search radius in meters (optional).
     * @returns Array of matching weather station locations.
     *
     * @example
     * ```ts
     * const stations = await client.weather.getWeatherFileFromLocation(52.52, 13.405, 50000)
     * console.log(stations[0].identifier)
     * ```
     */
    getWeatherFileFromLocation(lat: Latitude, lon: Longitude, radius?: number): Promise<WeatherLocation[]>;
    /**
     * Get weather file data by identifier.
     *
     * @param identifier - The weather file identifier (e.g., `"USA_NY_New.York..."`).
     * @returns The full weather file data (8760 hourly values per field).
     *
     * @example
     * ```ts
     * const data = await client.weather.getWeatherFileFromIdentifier(station.fileName)
     * ```
     */
    getWeatherFileFromIdentifier(identifier: string): Promise<any>;
    /**
     * Filter weather data by timeframe.
     *
     * @param identifier - The weather file identifier.
     * @param filters - Time filters with period and optional day/hour ranges.
     * @returns Filtered array of WeatherDataPoint matching the criteria.
     *
     * @example
     * ```ts
     * const filtered = await client.weather.filterWeatherData(station.fileName, {
     *   period: { start: { month: 6, day: 1, hour: 8 }, end: { month: 9, day: 30, hour: 18 } },
     *   filter: { hour: '9-17' },
     * })
     * ```
     */
    filterWeatherData(identifier: string, filters: TimeFilters): Promise<WeatherDataPoint[]>;
    /**
     * Generate a layer / grid image from an analysis result payload.
     *
     * POST `/analysis/generate-image`. Returns raw PNG bytes (`Uint8Array`).
     * Mirrors Python `WeatherServiceClient.gen_grid_image`, which sends
     * `Accept: image/png` and returns `response.content`. Routed through
     * the big-payload `$ref` envelope flow above threshold — analysis
     * grids commonly exceed 5 MiB raw JSON when high-resolution.
     *
     * Bypasses `HttpClient.post` because it (a) hardcodes JSON parsing on
     * the response and (b) cannot send `Accept: image/png`. Talks directly
     * to `postWithBigPayload` with a binary parser.
     *
     * @param payload - Server contract — analysis result + image render options.
     * @returns Raw PNG bytes.
     */
    generateImage(payload: Record<string, unknown>): Promise<Uint8Array>;
}

export { type IWeatherService, type WeatherLocation, WeatherLocationSchema, WeatherService, type WeatherServiceConfig };
