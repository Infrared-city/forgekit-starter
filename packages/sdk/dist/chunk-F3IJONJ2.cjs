"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunk6VD2RODPcjs = require('./chunk-6VD2RODP.cjs');






var _chunkP76CV7YNcjs = require('./chunk-P76CV7YN.cjs');


var _chunkRCUR3TGScjs = require('./chunk-RCUR3TGS.cjs');


var _chunkROJ27LGGcjs = require('./chunk-ROJ27LGG.cjs');

// src/utilities/service.ts
var _zod = require('zod');
var WeatherLocationSchema = _zod.z.object({
  uuid: _zod.z.string(),
  fileName: _zod.z.string(),
  location_data: _zod.z.object({
    city: _zod.z.string(),
    state: _zod.z.string(),
    country: _zod.z.string(),
    latitude: _zod.z.number(),
    longitude: _zod.z.number(),
    time_zone: _zod.z.number(),
    elevation: _zod.z.number(),
    station_id: _zod.z.string(),
    source: _zod.z.string(),
    type: _zod.z.string()
  })
}).transform((data) => ({
  ...data,
  identifier: data.uuid
}));
var WeatherService = class {
  
  
  // generateImage bypasses HttpClient.post (binary response + Accept header).
  // It needs the same big-payload context as the JSON path, so we hold it
  // alongside. Auth headers + big-payload knobs are lazy so JWT/env-var
  // changes propagate without rebuilding the service.
  
  
  
  
  
  
  constructor(config) {
    this.httpClient = new (0, _chunkP76CV7YNcjs.HttpClient)({
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
    this.timeoutMs = _nullishCoalesce(config.timeout, () => ( 18e4));
    this.gatewayBaseUrl = config.gatewayBaseUrl;
    this.getBigPayloadEnabled = _nullishCoalesce(config.getBigPayloadEnabled, () => ( (() => true)));
    this.getBigPayloadThresholdBytes = _nullishCoalesce(config.getBigPayloadThresholdBytes, () => ( (() => 5 * 1024 * 1024)));
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
      return _nullishCoalesce(_optionalChain([response, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.locations]), () => ( []));
    } catch (error) {
      this.logger.error(`Error getting weather file from location: ${error}`);
      throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(
        `Error getting weather file from location: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, error),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, error),
          operation: "getWeatherFileFromLocation",
          retryAfter: _chunkP76CV7YNcjs.extractRetryAfter.call(void 0, error),
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
      return _nullishCoalesce(_optionalChain([response, 'optionalAccess', _3 => _3.data]), () => ( null));
    } catch (error) {
      this.logger.error(`Error getting weather file ${identifier}: ${error}`);
      throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(
        `Error getting weather file ${identifier}: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, error),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, error),
          operation: "getWeatherFileFromIdentifier",
          retryAfter: _chunkP76CV7YNcjs.extractRetryAfter.call(void 0, error),
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
      const data = _nullishCoalesce(_optionalChain([response, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.data]), () => ( []));
      const result = [];
      for (const item of data) {
        const parsed = _chunk6VD2RODPcjs.WeatherDataPointSchema.parse(item);
        result.push(parsed);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error filtering weather file ${identifier}: ${error}`);
      throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(
        `Error filtering weather file ${identifier}: ${error instanceof Error ? error.message : String(error)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, error),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, error),
          operation: "filterWeatherData",
          retryAfter: _chunkP76CV7YNcjs.extractRetryAfter.call(void 0, error),
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
    return _chunkRCUR3TGScjs.postWithBigPayload.call(void 0, {
      url,
      body: payload,
      authHeaders,
      extraHeaders: acceptHeaders,
      gatewayBaseUrl: _nullishCoalesce(this.gatewayBaseUrl, () => ( "")),
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
          throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(`Error ${response.status} generating grid image`, {
            statusCode: response.status,
            responseBody: body,
            operation: "generateImage",
            retryAfter: _chunkP76CV7YNcjs.parseRetryAfter.call(void 0, response.headers.get("Retry-After"))
          });
        }
        return new Uint8Array(await response.arrayBuffer());
      },
      parseEnvelope: (resp) => {
        if (!resp.ok) {
          throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(
            `Error ${resp.status} generating grid image (envelope)`,
            {
              statusCode: resp.status,
              responseBody: resp.bodyText,
              operation: "generateImage"
            }
          );
        }
        if (!resp.bodyBytes) {
          throw new (0, _chunkROJ27LGGcjs.WeatherServiceError)(
            "generateImage envelope returned no body bytes",
            { statusCode: resp.status, responseBody: "", operation: "generateImage" }
          );
        }
        return resp.bodyBytes;
      }
    });
  }
};




exports.WeatherLocationSchema = WeatherLocationSchema; exports.WeatherService = WeatherService;
//# sourceMappingURL=chunk-F3IJONJ2.cjs.map