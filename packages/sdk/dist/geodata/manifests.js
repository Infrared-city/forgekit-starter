import { assertAllowedUrl, geoUrlFor, GEO_BASE_URL } from "./allowed-hosts.js";
import { GeodataError } from "./errors.js";
import { fetchPublicJson, fetchPublicText, } from "./http.js";
import { requireCore } from "../internal/core.js";
// Maintainer note (not published): Public manifests: the city-overlay registry
// and the Overture file index. Fetching is the host's job and the selection
// logic is the kernel's, exactly as in `app/sources/registry.py` and
// `app/maps/overture/fetcher_s3.py`. The caches below are module state, so
// each realm (page, Web Worker, Node process) keeps its own: a Worker never
// shares a cache with the main thread, which matches the SDK's one-core-per-
// realm rule.
/**
 * How long, in milliseconds (`300000`, five minutes), the city-overlay
 * registry (`sources.json`) is cached before it is fetched again.
 *
 * @category Geodata
 */
// Maintainer note (not published): matches the service's 5-minute TTL.
export const SOURCES_TTL_MS = 300_000;
const OVERTURE_INDEX_BASE = `${GEO_BASE_URL}/overture-index`;
/**
 * The Overture collections that have a published file index:
 * `building`, `land_cover`, `water` and `land_use`.
 *
 * @category Geodata
 */
export const INDEXED_COLLECTIONS = Object.freeze([
    "building",
    "land_cover",
    "water",
    "land_use",
]);
let sourcesCache;
const overtureCache = new Map();
const polygonCache = new Map();
/**
 * Drop every cached manifest held by this runtime. Useful in tests and
 * long-lived workers.
 *
 * @category Geodata
 */
export function clearManifestCaches() {
    sourcesCache = undefined;
    overtureCache.clear();
    polygonCache.clear();
}
/**
 * Fetch the city-overlay registry (`sources.json`), reusing the cached copy
 * while it is younger than {@link SOURCES_TTL_MS}.
 *
 * @param options - Request options; `now` overrides the clock, in
 *   milliseconds since the epoch.
 * @returns The parsed registry document.
 * @category Geodata
 */
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
 * Find the registered city overlay that covers an area, if any.
 *
 * A quick bounding-box check over the registry picks candidate cities, then
 * the city outline decides. If the registry or a city outline cannot be
 * fetched, the result has no city and carries a warning, so a registry outage
 * falls back to the global sources instead of failing the whole read.
 *
 * @param bbox - The area, in WGS84 degrees.
 * @param options - Request options; `now` overrides the clock, in
 *   milliseconds since the epoch.
 * @returns The matching city, if any, and any warnings.
 * @category Geodata
 */
// Maintainer note (not published): Two stages, as the kernel documents them.
// The utilities service degrades the same way on a fetch failure.
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
 * Fetch the Overture file manifest for a collection.
 *
 * The latest-release pointer is read on every call; the manifest itself is
 * fetched again only when the release changes.
 *
 * @param collection - An Overture collection such as `"building"`.
 * @param options - Request options; `overtureRelease` pins a release.
 * @returns The manifest text and the release it belongs to.
 * @throws {GeodataError} when the requested release cannot be pinned for the collection.
 * @category Geodata
 */
// Maintainer note (not published): The pointer is edge-cached with a
// 5-minute max-age; the manifest is re-fetched only when the release changes,
// as in the Python reader.
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
/**
 * List the Overture parquet files whose bounding box meets an area.
 *
 * Returns an empty list for a collection that has no published index.
 *
 * @param collection - An Overture collection such as `"building"`.
 * @param bbox - The area, in WGS84 degrees.
 * @param options - Request options; `overtureRelease` pins a release.
 * @returns The file URLs and the release they belong to.
 * @category Geodata
 */
export async function selectOvertureFiles(collection, bbox, options = {}) {
    if (!INDEXED_COLLECTIONS.includes(collection)) {
        return { urls: [], release: options.overtureRelease ?? "" };
    }
    const { manifestJson, release } = await fetchOvertureManifest(collection, options);
    const urls = requireCore().overtureSelectFiles(manifestJson, bbox.west, bbox.south, bbox.east, bbox.north);
    // The manifest is public data, so its URLs are checked like any other.
    return { urls: urls.map((url) => assertAllowedUrl(url)), release };
}
