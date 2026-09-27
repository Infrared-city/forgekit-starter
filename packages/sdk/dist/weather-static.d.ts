/**
 * The static weather catalog reader: the replacement for the deleted
 * utilities-service routes `GET /utils/weather/location`,
 * `POST /utils/weather/{id}/data` and `POST /utils/weather/{id}/data/filter`.
 *
 * Layout, export runbook and the catalog contract:
 * `docs/plans/2026-09-06-weather-static-catalog.md`. Known differences from
 * the deleted routes: `docs/DEVIATIONS.md` D40. The Python twin is
 * `public/python/src/infrared_sdk/layers/weather_static.py`; the constants,
 * the error semantics and the kernel calls below are the same on both hosts.
 *
 * The reader owns HTTP, the catalog cache, and nothing else. Ranking the
 * stations by distance and filtering the hours are LOGIC, so both run in the
 * bundled kernel — `weatherNearestStations` and `weatherFilterHours` — and
 * neither is re-implemented here.
 *
 * Reads go to a public, unauthenticated host through the geodata transport,
 * so they carry the allow-list check, `redirect: "error"`, the SDK
 * User-Agent, ONE deadline over the headers and the body, and a cap kept by
 * the streamed total rather than by a header. No API key ever reaches this
 * host.
 *
 * Private (custom-EPW) weather files are NOT in this catalog and never will
 * be: they are ownership-gated per request and carry no public identity, so
 * a static, cacheable object cannot enforce the check. There is no
 * by-identifier lookup for them any more. A historic private identifier is a
 * typed 404 that says so and points at the replacement workflow — bring the
 * EPW file itself (BYO weather); see MIGRATION.md. No station is ever
 * substituted for one.
 */
import { type PublicRequestOptions } from "./geodata/index.js";
export { WeatherServiceError, type WeatherStationRow, } from "./internal/weather-static-decode.js";
/** Where the catalog lives. Mirrors the Python `DEFAULT_STATIC_BASE_URL`. */
export declare const DEFAULT_STATIC_BASE_URL = "https://geo.infrared.city/weather";
/**
 * Largest single static object this reader holds in memory.
 *
 * The catalog is ~7.5 MB (16,757 stations, 2026-09-08 generation) and one
 * station file is under 1 MB compressed.
 * Twin of the Python `MAX_STATIC_BYTES`.
 */
export declare const MAX_STATIC_BYTES: number;
/** The pointer's refresh interval; the same 5 minutes the manifests use. */
export declare const CATALOG_TTL_MS = 300000;
/** Drop every cached pointer, catalog and station in this realm (tests, workers). */
export declare function clearWeatherCatalogCache(): void;
/** Options a {@link StaticWeatherReader} accepts. */
export interface StaticWeatherOptions extends PublicRequestOptions {
    /** Catalog root; defaults to {@link DEFAULT_STATIC_BASE_URL}. */
    readonly baseUrl?: string;
    /** Pointer refresh interval; defaults to {@link CATALOG_TTL_MS}. */
    readonly catalogTtlMs?: number;
}
/**
 * Reads the static catalog for one `WeatherService`.
 *
 * Worker rule: the caches above are module state in the realm that loads
 * this module. A Worker initialises its own SDK and gets its own reader and
 * its own caches; nothing falls back to the render thread.
 */
export declare class StaticWeatherReader {
    private readonly baseUrl;
    private readonly request;
    private readonly ttlMs;
    constructor(options?: StaticWeatherOptions);
    /** The generation folder the pointer names, re-read on the TTL. */
    private folderUrl;
    /** The catalog for the current generation, parsed at most once per ETag. */
    private catalog;
    /** uuid or fileName to a catalog row, or the typed 404 (D40). */
    private resolveStation;
    /** One station's data object as TEXT, gzip handled either way. */
    private stationText;
    /** The nearest stations, ranked by the kernel. */
    nearestStations(lat: number, lon: number, radiusKm?: number): Promise<Array<Record<string, unknown>>>;
    /** One station's full document, as the deleted route returned it. */
    stationByIdentifier(identifier: string): Promise<Record<string, unknown>>;
    /** The station's hourly arrays, filtered by the kernel. */
    filterHours(identifier: string, timePeriodJson: string): Promise<Record<string, unknown>>;
}
