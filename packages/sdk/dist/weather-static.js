/** Public weather catalog reader: nearest stations, station data and period filtering. */
// Maintainer note (not published): replaces the deleted utilities-service routes
// `GET /utils/weather/location`, `POST /utils/weather/{id}/data` and
// `POST /utils/weather/{id}/data/filter`. Layout, export runbook and catalog contract:
// `docs/plans/2026-09-06-weather-static-catalog.md`; differences from the routes:
// `docs/DEVIATIONS.md` D40. The Python twin is
// `public/python/src/infrared_sdk/layers/weather_static.py`; the constants, error semantics
// and kernel calls are the same on both hosts.
//
// The reader owns HTTP and the catalog cache, nothing else. Ranking stations by distance and
// filtering hours are LOGIC and run in the bundled kernel (`weatherNearestStations`,
// `weatherFilterHours`). Reads go to a public, unauthenticated host through the geodata
// transport: allow-list check, `redirect: "error"`, the SDK User-Agent, ONE deadline over
// headers and body, and a cap kept by the streamed total rather than by a header.
//
// Private (custom-EPW) weather files are NOT in this catalog and never will be: they are
// ownership-gated per request and carry no public identity, so a static, cacheable object
// cannot enforce the check. A historic private identifier is a typed 404 that points at the
// replacement workflow - bring the EPW file itself (BYO weather); see MIGRATION.md. No
// station is ever substituted for one. `DEFAULT_STATIC_BASE_URL` mirrors the Python constant.
import { decodeJsonObject, decodeUtf8, failWeather, gunzipIfNeeded, indexStations, parseJsonObject, projectRankedStations, } from "./internal/weather-static-decode.js";
import { BoundedCache, CATALOG_CACHE_LIMIT, POINTER_CACHE_LIMIT, STATION_CACHE_LIMIT, } from "./internal/weather-static-cache.js";
import { requireCore } from "./internal/core.js";
import { fetchPublicBytes, GeodataError, } from "./geodata/index.js";
import { trimTrailingSlashes } from "./internal/url-trim.js";
export { WeatherServiceError, } from "./internal/weather-static-decode.js";
/**
 * Root URL of the public weather catalog (`https://geo.infrared.city/weather`).
 *
 * @category Weather
 */
export const DEFAULT_STATIC_BASE_URL = "https://geo.infrared.city/weather";
/**
 * Largest single catalog object the reader will download, in bytes (64 MiB).
 *
 * @category Weather
 */
// Maintainer note (not published): catalog ~7.5 MB (16,757 stations, 2026-09-08); a station < 1 MB gz.
export const MAX_STATIC_BYTES = 64 * 1024 * 1024;
/** `FindWeatherRequest.radius`'s default in the deleted route. */
const DEFAULT_RADIUS_KM = 100;
/** The `$geoNear` pipeline's `limit: 10`. */
const STATION_LIMIT = 10;
/**
 * How long, in milliseconds, the catalog's "latest" pointer is trusted (5 minutes).
 *
 * @category Weather
 */
// Maintainer note (not published): the same 5 minutes the manifests use.
export const CATALOG_TTL_MS = 300_000;
/**
 * Parsed catalogs, keyed by the generation folder URL. A generation folder is
 * dated and immutable, so the URL identifies the bytes; a re-export publishes
 * a new folder and so a new key. BOUNDED at
 * {@link CATALOG_CACHE_LIMIT}: the cache used to be an unbounded `Map`, so a
 * process that outlived a few generations kept every one of them. Module
 * state, so each realm (page, Worker, Node process) keeps its own — a Worker
 * never shares a cache across a `postMessage` boundary, and the bound is
 * therefore per realm.
 */
const catalogCache = new BoundedCache(CATALOG_CACHE_LIMIT);
const catalogPending = new Map();
/** The last pointer answer per base URL, refreshed on {@link CATALOG_TTL_MS}. */
const pointerCache = new BoundedCache(POINTER_CACHE_LIMIT);
const pointerPending = new Map();
/**
 * Station documents, keyed by their own URL.
 *
 * A station file is immutable within a generation, and the two public methods
 * that read one — `stationByIdentifier` and `filterHours` — are routinely
 * called about the same station. Up to 0.12 nothing was cached here and each
 * call re-downloaded ~1.5 MB.
 */
const stationCache = new BoundedCache(STATION_CACHE_LIMIT);
const stationPending = new Map();
/** Share one bounded first load, then keep its value in the existing LRU. */
function loadOnce(pendingCache, limit, readyCache, key, load) {
    const current = pendingCache.get(key);
    if (current !== undefined) {
        pendingCache.delete(key);
        pendingCache.set(key, current);
        return current;
    }
    let pending;
    pending = Promise.resolve().then(load).then((value) => {
        if (pendingCache.get(key) === pending) {
            pendingCache.delete(key);
            readyCache.set(key, value);
        }
        return value;
    }, (error) => {
        if (pendingCache.get(key) === pending)
            pendingCache.delete(key);
        throw error;
    });
    pendingCache.set(key, pending);
    while (pendingCache.size > limit) {
        const oldest = pendingCache.keys().next();
        if (oldest.done === true)
            break;
        pendingCache.delete(oldest.value);
    }
    return pending;
}
/**
 * Forget all cached catalog data in this page, Worker or Node process.
 *
 * @category Weather
 */
export function clearWeatherCatalogCache() {
    catalogCache.clear();
    catalogPending.clear();
    pointerCache.clear();
    pointerPending.clear();
    stationCache.clear();
    stationPending.clear();
}
/** GET one static object's bytes, or raise the typed weather error. */
async function staticBytes(url, operation, request) {
    try {
        const answer = await fetchPublicBytes(url, { ...request, cap: MAX_STATIC_BYTES });
        return { bytes: answer.bytes, etag: answer.etag };
    }
    catch (error) {
        if (error instanceof GeodataError) {
            // A refused redirect, a URL off the allow-list, an over-cap body or a
            // non-200 answer is a wrong answer from a reachable host.
            failWeather(`${operation} refused the answer: ${error.message}`, 502, operation);
        }
        throw error;
    }
}
/**
 * Reads the public weather catalog, caching what it downloads per page, Worker or
 * Node process. `WeatherService` uses it for you.
 *
 * @category Weather
 */
// Maintainer note (not published): Worker rule: the caches above are module state in the realm
// that loads this module. A Worker initialises its own SDK, reader and caches; nothing falls
// back to the render thread.
export class StaticWeatherReader {
    baseUrl;
    request;
    ttlMs;
    /** Create a reader; every option is optional. */
    constructor(options = {}) {
        this.baseUrl = trimTrailingSlashes(options.baseUrl ?? DEFAULT_STATIC_BASE_URL);
        this.ttlMs = options.catalogTtlMs ?? CATALOG_TTL_MS;
        this.request = {
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
        };
    }
    /** The generation folder the pointer names, re-read on the TTL. */
    async folderUrl(operation) {
        const cached = pointerCache.get(this.baseUrl);
        if (cached !== undefined && Date.now() - cached.at < this.ttlMs)
            return cached.folderUrl;
        const loaded = await loadOnce(pointerPending, POINTER_CACHE_LIMIT, pointerCache, this.baseUrl, async () => {
            const pointerOperation = "fetchWeatherCatalogPointer";
            const { bytes } = await staticBytes(`${this.baseUrl}/latest.json`, pointerOperation, this.request);
            const pointer = decodeJsonObject(bytes, "Weather catalog pointer", pointerOperation);
            const path = pointer["path"];
            if (typeof path !== "string" || path === "") {
                // A CDN answering an HTML error page, or a pointer without a usable
                // `path`, is a typed 502 — never a raw decode error escaping the
                // public method the caller invoked (D40).
                failWeather("Weather catalog pointer carries no usable `path`", 502, operation);
            }
            return {
                folderUrl: `${this.baseUrl}/${path.replace(/^\/+|\/+$/g, "")}`,
                at: Date.now(),
            };
        });
        return loaded.folderUrl;
    }
    /** The catalog for the current generation, parsed at most once per ETag. */
    async catalog(operation) {
        const folderUrl = await this.folderUrl(operation);
        const catalogOperation = "fetchWeatherCatalog";
        const url = `${folderUrl}/catalog.json`;
        // A generation folder is dated and immutable (the exporter never rewrites
        // an object), so the folder URL identifies the catalog bytes: return the
        // parsed entry BEFORE any fetch. One ~7.5 MB download per generation per
        // realm, the Python twin's shape; the pointer TTL decides when to re-ask.
        const cached = catalogCache.get(url);
        if (cached !== undefined)
            return { folderUrl, entry: cached };
        const entry = await loadOnce(catalogPending, CATALOG_CACHE_LIMIT, catalogCache, url, async () => {
            const { bytes } = await staticBytes(url, catalogOperation, this.request);
            // The host parses ONCE, here, and keeps the indices — including the slim
            // `{uuid, lat, lon}` ranking document. The catalog TEXT is NOT kept.
            const parsed = parseJsonObject(decodeUtf8(bytes, "Weather catalog", catalogOperation), "Weather catalog", catalogOperation);
            return indexStations(parsed, catalogOperation);
        });
        return { folderUrl, entry };
    }
    /** uuid or fileName to a catalog row, or the typed 404 (D40). */
    resolveStation(entry, identifier, operation) {
        const station = entry.byUuid.get(identifier) ?? entry.byFileName.get(identifier);
        if (station === undefined) {
            failWeather(`Weather station ${JSON.stringify(identifier)} is not in the public weather ` +
                "catalog. Private and custom-EPW weather files are no longer looked up by id: " +
                "bring the EPW file itself as BYO weather instead (see MIGRATION.md). No other " +
                "station is substituted for it.", 404, operation);
        }
        return station;
    }
    /** One station's data object as TEXT, gzip handled either way. */
    async stationText(folderUrl, uuid, operation) {
        const url = `${folderUrl}/stations/${encodeURIComponent(uuid)}.json`;
        const cached = stationCache.get(url);
        if (cached !== undefined)
            return cached;
        return loadOnce(stationPending, STATION_CACHE_LIMIT, stationCache, url, async () => {
            const { bytes } = await staticBytes(url, "fetchWeatherStation", this.request);
            const subject = `Weather station ${JSON.stringify(uuid)}`;
            return decodeUtf8(gunzipIfNeeded(bytes, uuid, operation), subject, operation);
        });
    }
    /**
     * The nearest stations to a point (`lat`, `lon` in degrees), nearest first, at most
     * ten. `radiusKm` defaults to 100.
     *
     * @throws {WeatherServiceError} when the catalog cannot be read or ranked.
     */
    async nearestStations(lat, lon, radiusKm) {
        const operation = "getWeatherFileFromLocation";
        const { entry } = await this.catalog(operation);
        let out;
        try {
            out = requireCore().weatherNearestStations(entry.rankingJson, lat, lon, radiusKm ?? DEFAULT_RADIUS_KM, STATION_LIMIT);
        }
        catch (error) {
            return failWeather(`local weatherNearestStations failed: ${error instanceof Error ? error.message : String(error)}`, 500, operation);
        }
        // The kernel ranked a slim index, so the three fields it answers with
        // come back from the full rows here — the same fields, the same rows, the
        // same order.
        return projectRankedStations(JSON.parse(out), entry, operation);
    }
    /**
     * One station's full document, found by `uuid` or `fileName`.
     *
     * @throws {WeatherServiceError} when the station is unknown (404) or the catalog is unreadable.
     */
    async stationByIdentifier(identifier) {
        const operation = "getWeatherFileFromIdentifier";
        const { folderUrl, entry } = await this.catalog(operation);
        const station = this.resolveStation(entry, identifier, operation);
        const text = await this.stationText(folderUrl, station.uuid, operation);
        return parseJsonObject(text, `Weather station ${JSON.stringify(station.uuid)}`, operation);
    }
    /**
     * A station's hourly arrays (under `weatherData`), filtered to a period given as JSON
     * text built from `TimeFilters`.
     *
     * @throws {WeatherServiceError} when the station is unknown, the catalog is unreadable or the
     * period is rejected.
     */
    async filterHours(identifier, timePeriodJson) {
        const operation = "filterWeatherData";
        const { folderUrl, entry } = await this.catalog(operation);
        const station = this.resolveStation(entry, identifier, operation);
        const stationJson = await this.stationText(folderUrl, station.uuid, operation);
        let out;
        try {
            out = requireCore().weatherFilterHours(stationJson, timePeriodJson);
        }
        catch (error) {
            return failWeather(`local weatherFilterHours failed: ${error instanceof Error ? error.message : String(error)}`, 500, operation);
        }
        return JSON.parse(out);
    }
}
