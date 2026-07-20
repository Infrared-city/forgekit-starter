import {
  WeatherDataPointSchema
} from "./chunk-ZYK3RM7N.js";
import {
  HttpClient,
  extractResponseBody,
  extractRetryAfter,
  extractStatusCode,
  parseRetryAfter
} from "./chunk-HHRINQ6B.js";
import {
  postWithBigPayload
} from "./chunk-4RPI3KBZ.js";
import {
  WeatherServiceError
} from "./chunk-GOADVAJS.js";

// src/utilities/service.ts
import { z } from "zod";
var WeatherLocationSchema = z.object({
  uuid: z.string(),
  fileName: z.string(),
  location_data: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    time_zone: z.number(),
    elevation: z.number(),
    station_id: z.string(),
    source: z.string(),
    type: z.string()
  })
}).transform((data) => ({
  ...data,
  identifier: data.uuid
}));
var WeatherService = class {
  httpClient;
  logger;
  // generateImage bypasses HttpClient.post (binary response + Accept header).
  // It needs the same big-payload context as the JSON path, so we hold it
  // alongside. Auth headers + big-payload knobs are lazy so JWT/env-var
  // changes propagate without rebuilding the service.
  getAuthHeaders;
  baseUrl;
  timeoutMs;
  gatewayBaseUrl;
  getBigPayloadEnabled;
  getBigPayloadThresholdBytes;
  constructor(config) {
    this.httpClient = new HttpClient({
      getAuthHeaders: config.getAuthHeaders,
      baseUrl: config.baseUrl,
      logger: config.logger,
      timeout: config.timeout,
      gatewayBaseUrl: config.gatewayBaseUrl,
      getBigPayloadEnabled: config.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: config.getBigPayloadThresholdBytes
    });
    this.logger = config.logger;
    this.getAuthHeaders = config.getAuthHeaders;
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeout ?? 18e4;
    this.gatewayBaseUrl = config.gatewayBaseUrl;
    this.getBigPayloadEnabled = config.getBigPayloadEnabled ?? (() => true);
    this.getBigPayloadThresholdBytes = config.getBigPayloadThresholdBytes ?? (() => 5 * 1024 * 1024);
  }
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
  async getWeatherFileFromLocation(lat, lon, radius) {
    const params = {
      latitude: lat,
      longitude: lon
    };
    if (radius !== void 0) {
      params.radius = radius;
    }
    try {
      const response = await this.httpClient.get(
        "/weather/location",
        params
      );
      return response?.data?.locations ?? [];
    } catch (error) {
      this.logger.error(`Error getting weather file from location: ${error}`);
      throw new WeatherServiceError(
        `Error getting weather file from location: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: extractStatusCode(error),
          responseBody: extractResponseBody(error),
          operation: "getWeatherFileFromLocation",
          retryAfter: extractRetryAfter(error),
          cause: error
        }
      );
    }
  }
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
  async getWeatherFileFromIdentifier(identifier) {
    try {
      const response = await this.httpClient.post(`/weather/${identifier}/data`, {});
      return response?.data ?? null;
    } catch (error) {
      this.logger.error(`Error getting weather file ${identifier}: ${error}`);
      throw new WeatherServiceError(
        `Error getting weather file ${identifier}: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: extractStatusCode(error),
          responseBody: extractResponseBody(error),
          operation: "getWeatherFileFromIdentifier",
          retryAfter: extractRetryAfter(error),
          cause: error
        }
      );
    }
  }
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
  async filterWeatherData(identifier, filters) {
    this.logger.debug(`POST /weather/${identifier}/data/filter`);
    this.logger.debug("filters:", filters);
    const p = filters.period;
    const body = {
      "time-period": {
        "start-month": p.start.month,
        "start-day": p.start.day,
        "start-hour": p.start.hour,
        "end-month": p.end.month,
        "end-day": p.end.day,
        "end-hour": p.end.hour
      }
    };
    if (filters.filter) body["hour-filter"] = filters.filter;
    try {
      const response = await this.httpClient.post(
        `/weather/${identifier}/data/filter`,
        body,
        { serializeNames: false, bigPayload: true }
      );
      const data = response?.data?.data ?? [];
      const result = [];
      for (const item of data) {
        const parsed = WeatherDataPointSchema.parse(item);
        result.push(parsed);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error filtering weather file ${identifier}: ${error}`);
      throw new WeatherServiceError(
        `Error filtering weather file ${identifier}: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: extractStatusCode(error),
          responseBody: extractResponseBody(error),
          operation: "filterWeatherData",
          retryAfter: extractRetryAfter(error),
          cause: error
        }
      );
    }
  }
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
  async generateImage(payload) {
    const url = `${this.baseUrl}/analysis/generate-image`;
    this.logger.debug(`POST ${url}`);
    const authHeaders = await this.getAuthHeaders();
    const acceptHeaders = { Accept: "image/png" };
    return postWithBigPayload({
      url,
      body: payload,
      authHeaders,
      extraHeaders: acceptHeaders,
      gatewayBaseUrl: this.gatewayBaseUrl ?? "",
      thresholdBytes: this.getBigPayloadThresholdBytes(),
      enabled: this.getBigPayloadEnabled() && !!this.gatewayBaseUrl,
      envelopeTimeoutMs: this.timeoutMs,
      logger: this.logger,
      // Binary response: success drains `arrayBuffer()` straight into
      // `bodyBytes`, no text re-encoding round-trip. Errors still drain
      // text so REF_* classification works.
      responseKind: "binary",
      inline: async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            ...authHeaders,
            ...acceptHeaders,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new WeatherServiceError(`Error ${response.status} generating grid image`, {
            statusCode: response.status,
            responseBody: body,
            operation: "generateImage",
            retryAfter: parseRetryAfter(response.headers.get("Retry-After"))
          });
        }
        return new Uint8Array(await response.arrayBuffer());
      },
      parseEnvelope: (resp) => {
        if (!resp.ok) {
          throw new WeatherServiceError(
            `Error ${resp.status} generating grid image (envelope)`,
            {
              statusCode: resp.status,
              responseBody: resp.bodyText,
              operation: "generateImage"
            }
          );
        }
        if (!resp.bodyBytes) {
          throw new WeatherServiceError(
            "generateImage envelope returned no body bytes",
            { statusCode: resp.status, responseBody: "", operation: "generateImage" }
          );
        }
        return resp.bodyBytes;
      }
    });
  }
};

export {
  WeatherLocationSchema,
  WeatherService
};
//# sourceMappingURL=chunk-7IYUPNX4.js.map