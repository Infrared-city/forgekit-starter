/** Public weather catalog reader: nearest stations, station data and period filtering. */
// Maintainer note (not published): replaces the deleted utilities-service routes
// `GET /utils/weather/location`, `POST /utils/weather/{id}/data` and
// `POST /utils/weather/{id}/data/filter`. Layout, export runbook and catalog contract:
// `docs/plans/2026-09-06-weather-static-catalog.md`; differences from the routes:
// `docs/DEVIATIONS.md` D40. The Python twin is
// `public/python/src/infrared_sdk/layers/weather_static.py`; the constants, error semantics
// and kernel calls are the same on both hosts.
//
// The reader owns HTTP and the cache of kernel handles, nothing else. The catalog rules (which
// rows count, ranking by distance, a station by uuid or fileName, the pointer to the generation
// folder) and the hour filter are LOGIC and run in the bundled kernel (`WeatherCatalog`,
// `weatherPointerFolder`, `weatherFilterHours`, D-2026101012-heron-quartz-maple). Reads go to a public, unauthenticated host through the geodata
// transport: allow-list check, `redirect: "error"`, the SDK User-Agent, ONE deadline over
// headers and body, and a cap kept by the streamed total rather than by a header.
//
// Private (custom-EPW) weather files are NOT in this catalog and never will be: they are
// ownership-gated per request and carry no public identity, so a static, cacheable object
// cannot enforce the check. A historic private identifier is a typed 404 that points at the
// replacement workflow - bring the EPW file itself (BYO weather); see MIGRATION.md. No
// station is ever substituted for one. `DEFAULT_STATIC_BASE_URL` mirrors the Python constant.
import { decodeUtf8, failWeather, gunzipIfNeeded, parseJsonObject, } from "./internal/weather-static-decode.js";
import { BoundedCache, CATALOG_CACHE_LIMIT, POINTER_CACHE_LIMIT, STATION_CACHE_LIMIT, } from "./internal/weather-static-cache.js";
import { requireCore } from "./internal/core.js";
import { withHostRetry } from "./internal/host-retry.js";
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
 * Catalog handles, keyed by the generation folder URL. A generation folder is
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
function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
/** GET one static object's bytes, or raise the typed weather error. */
async function staticBytes(url, operation, request) {
    try {
        const answer = await withHostRetry("public_get", () => fetchPublicBytes(url, { ...request, cap: MAX_STATIC_BYTES }), request);
        return { bytes: answer.bytes, etag: answer.etag };
    }
    catch (error) {
        if (error instanceof GeodataError) {
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
    async folderUrl() {
        const cached = pointerCache.get(this.baseUrl);
        if (cached !== undefined && Date.now() - cached.at < this.ttlMs)
            return cached.folderUrl;
        const loaded = await loadOnce(pointerPending, POINTER_CACHE_LIMIT, pointerCache, this.baseUrl, async () => {
            const pointerOperation = "fetchWeatherCatalogPointer";
            const { bytes } = await staticBytes(`${this.baseUrl}/latest.json`, pointerOperation, this.request);
            // A CDN answering an HTML error page, or a pointer without a usable
            // `path`, is a typed 502 - never a raw decode error escaping the
            // public method the caller invoked (D40, D-2026101012-heron-quartz-maple).
            try {
                return {
                    folderUrl: requireCore().weatherPointerFolder(this.baseUrl, bytes),
                    at: Date.now(),
                };
            }
            catch (error) {
                return failWeather(errorMessage(error), 502, pointerOperation);
            }
        });
        return loaded.folderUrl;
    }
    /** The catalog handle for the current generation, read at most once per generation. */
    async catalog() {
        const folderUrl = await this.folderUrl();
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
            try {
                return new (requireCore().WeatherCatalog)(bytes);
            }
            catch (error) {
                return failWeather(errorMessage(error), 502, catalogOperation);
            }
        });
        return { folderUrl, entry };
    }
    /** uuid or fileName to the catalog's uuid, or the typed 404 (D40). The rule and its text are the kernel's. */
    stationUuid(entry, identifier, operation) {
        let row;
        try {
            row = entry.find(identifier);
        }
        catch (error) {
            return failWeather(errorMessage(error), 404, operation);
        }
        return JSON.parse(row).uuid;
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
        const { entry } = await this.catalog();
        try {
            return JSON.parse(entry.nearest(lat, lon, radiusKm ?? DEFAULT_RADIUS_KM, STATION_LIMIT));
        }
        catch (error) {
            return failWeather(`local weather catalog nearest failed: ${errorMessage(error)}`, 500, operation);
        }
    }
    /**
     * One station's full document, found by `uuid` or `fileName`.
     *
     * @throws {WeatherServiceError} when the station is unknown (404) or the catalog is unreadable.
     */
    async stationByIdentifier(identifier) {
        const operation = "getWeatherFileFromIdentifier";
        const { folderUrl, entry } = await this.catalog();
        const uuid = this.stationUuid(entry, identifier, operation);
        const text = await this.stationText(folderUrl, uuid, operation);
        return parseJsonObject(text, `Weather station ${JSON.stringify(uuid)}`, operation);
    }
    /**
     * A station's hours inside a period given as JSON text built from `TimeFilters`, one
     * record per hour.
     *
     * @throws {WeatherServiceError} when the station is unknown, the catalog is unreadable or the
     * period is rejected.
     */
    async filterHours(identifier, timePeriodJson) {
        const operation = "filterWeatherData";
        const { folderUrl, entry } = await this.catalog();
        const uuid = this.stationUuid(entry, identifier, operation);
        const stationJson = await this.stationText(folderUrl, uuid, operation);
        const core = requireCore();
        try {
            return JSON.parse(core.weatherRows(core.weatherFilterHours(stationJson, timePeriodJson)));
        }
        catch (error) {
            return failWeather(`local weatherFilterHours failed: ${errorMessage(error)}`, 500, operation);
        }
    }
}
