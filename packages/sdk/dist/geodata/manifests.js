import { assertAllowedUrl, geoUrlFor, GEO_BASE_URL } from "./allowed-hosts.js";
import { GeodataError } from "./errors.js";
import { fetchPublicJson, fetchPublicText, } from "./http.js";
import { requireCore } from "../internal/core.js";
/**
 * Public manifests: the city-overlay registry and the Overture file index.
 *
 * Fetching is the host's job and the selection logic is the kernel's, exactly
 * as in `app/sources/registry.py` and `app/maps/overture/fetcher_s3.py`. The
 * caches below are module state, so each realm (page, Web Worker, Node
 * process) keeps its own — a Worker never shares a cache with the main
 * thread, which matches the SDK's one-core-per-realm rule.
 */
/** `sources.json` refresh interval; matches the service's 5-minute TTL. */
export const SOURCES_TTL_MS = 300_000;
const OVERTURE_INDEX_BASE = `${GEO_BASE_URL}/overture-index`;
/** Collections the R2 index publishes a manifest for. */
export const INDEXED_COLLECTIONS = Object.freeze([
    "building",
    "land_cover",
    "water",
    "land_use",
]);
let sourcesCache;
const overtureCache = new Map();
const polygonCache = new Map();
/** Drop every cached manifest in this realm (tests, long-lived workers). */
export function clearManifestCaches() {
    sourcesCache = undefined;
    overtureCache.clear();
    polygonCache.clear();
}
/** Fetch `sources.json`, re-using the cached copy inside the TTL. */
export async function fetchSources(options = {}) {
    return (await fetchSourcesEntry(options)).document;
}
/** The same fetch, keeping the text the kernel is handed unchanged. */
async function fetchSourcesEntry(options = {}) {
    const now = options.now ?? Date.now();
    if (sourcesCache !== undefined && now - sourcesCache.fetchedAt < SOURCES_TTL_MS) {
        return sourcesCache;
    }
    const text = await fetchPublicText(`${GEO_BASE_URL}/sources.json`, options);
    const document = JSON.parse(text);
    sourcesCache = { fetchedAt: now, document, text };
    return sourcesCache;
}
function sourceKeyFor(document, id) {
    const cities = document["cities"];
    if (Array.isArray(cities)) {
        for (const entry of cities) {
            if (entry !== null &&
                typeof entry === "object" &&
                entry["id"] === id) {
                const key = entry["source_key"];
                if (typeof key === "string" && key.length > 0)
                    return key;
            }
        }
    }
    return `${id}_ogd`;
}
async function cityPolygon(polygonUrl, options) {
    const url = geoUrlFor(polygonUrl);
    const cached = polygonCache.get(url);
    if (cached !== undefined)
        return cached;
    const document = await fetchPublicJson(url, options);
    const text = JSON.stringify(document);
    polygonCache.set(url, text);
    return text;
}
/**
 * Resolve the city overlay for an AOI, or nothing.
 *
 * Two stages, as the kernel documents them: a cheap bbox prefilter over
 * `sources.json`, then the precise polygon gate on each candidate. Fetch
 * failures degrade to "no overlay" with a warning — the utilities service
 * behaves the same way, so a registry outage keeps the default world sources
 * working instead of failing the whole acquisition.
 */
export async function resolveOverlayCity(bbox, options = {}) {
    const warnings = [];
    let entry;
    try {
        entry = await fetchSourcesEntry(options);
    }
    catch {
        return { warnings: ["sources_registry_unavailable"] };
    }
    const document = entry.document;
    // The registry text goes to the kernel as fetched: re-encoding the parsed
    // document per call would be a host round trip for nothing.
    const candidates = requireCore().overlayBboxCandidates(entry.text, bbox.west, bbox.south, bbox.east, bbox.north);
    const parsed = JSON.parse(candidates);
    const intersects = requireCore().overlayAoiIntersectsPolygon;
    for (const candidate of parsed) {
        let polygon;
        try {
            polygon = await cityPolygon(candidate.polygon_url, options);
        }
        catch {
            warnings.push(`${candidate.id}_polygon_unavailable`);
            continue;
        }
        if (!intersects(polygon, bbox.west, bbox.south, bbox.east, bbox.north))
            continue;
        const layers = {};
        for (const [name, key] of Object.entries(candidate.layers)) {
            if (typeof key === "string" && key.length > 0)
                layers[name] = key;
        }
        return {
            city: { id: candidate.id, sourceKey: sourceKeyFor(document, candidate.id), layers },
            warnings,
        };
    }
    return { warnings };
}
function pointerKey(collection) {
    // `building` keeps the legacy pointer name; base themes are suffixed.
    return collection === "building" ? "latest.json" : `latest-${collection}.json`;
}
/**
 * Fetch the immutable Overture file manifest for a collection.
 *
 * The pointer is read every call (it is edge-cached with a 5-minute
 * max-age); the manifest itself is re-fetched only when the release changes,
 * as in the Python reader.
 */
export async function fetchOvertureManifest(collection, options = {}) {
    const pinned = options.overtureRelease;
    const cached = overtureCache.get(collection);
    if (pinned !== undefined && cached?.release === pinned) {
        return { manifestJson: cached.manifestJson, release: cached.release };
    }
    const pointer = await fetchPublicJson(`${OVERTURE_INDEX_BASE}/${pointerKey(collection)}`, options);
    const release = pinned ?? pointer.release;
    if (cached !== undefined && cached.release === release) {
        return { manifestJson: cached.manifestJson, release };
    }
    // A per-release manifest is immutable, so a pin is a substitution in the
    // pointer's own key: the collection is spelled differently there
    // (`buildings-` for the `building` collection), which is why the key is
    // not rebuilt from the collection name.
    const pointerPath = pointer.manifest_key.split("/").slice(1).join("/") || pointer.manifest_key;
    const key = pinned === undefined ? pointerPath : pointerPath.replace(pointer.release, pinned);
    if (pinned !== undefined && key === pointerPath && pinned !== pointer.release) {
        // The substitution did not apply, so this key names the CURRENT manifest
        // while `release` reports the pin. Reading it would report a release the
        // data did not come from.
        throw new GeodataError(`cannot pin ${collection} to Overture release ${pinned}: the pointer key ` +
            `${pointer.manifest_key} does not carry release ${pointer.release}`);
    }
    const manifestJson = await fetchPublicText(`${OVERTURE_INDEX_BASE}/${key}`, options);
    overtureCache.set(collection, { release, manifestJson });
    return { manifestJson, release };
}
/** Parquet URLs whose file bbox meets the AOI, chosen by the kernel. */
export async function selectOvertureFiles(collection, bbox, options = {}) {
    if (!INDEXED_COLLECTIONS.includes(collection)) {
        return { urls: [], release: options.overtureRelease ?? "" };
    }
    const { manifestJson, release } = await fetchOvertureManifest(collection, options);
    const urls = requireCore().overtureSelectFiles(manifestJson, bbox.west, bbox.south, bbox.east, bbox.north);
    // The manifest is public data, so its URLs are checked like any other.
    return { urls: urls.map((url) => assertAllowedUrl(url)), release };
}
