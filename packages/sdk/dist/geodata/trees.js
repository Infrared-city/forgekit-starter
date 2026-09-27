import { geoUrlFor, GEO_BASE_URL } from "./allowed-hosts.js";
import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson, featuresArrayText, requireFeatureCollection, requireJsonArray, spliceJsonArrays, } from "./json-chain.js";
import { resolveOverlayCity } from "./manifests.js";
import { requireCore } from "../internal/core.js";
/**
 * Direct tree acquisition — the client-side twin of
 * `GET /utils/gis/vegetation?source=fgb`.
 *
 * Same shape as the service: the global OSM FlatGeobuf and, when the AOI
 * falls inside a registered city, that city's OGD overlay, read in parallel
 * and merged with the city winning near-duplicates. Attribute normalisation
 * and dedup are kernel calls, so the numbers match the service's.
 *
 * The chain read → normalise → dedup passes JSON text from one kernel call
 * to the next (bulk-data rule 1). Only `acquireTrees`, the object-returning
 * wrapper, parses — once, at the end.
 */
/** The global OSM tree layer on the public R2 mirror. */
export const TREES_URL = `${GEO_BASE_URL}/trees-world.fgb`;
/** Registry layer key naming a city's OGD tree overlay. */
const OVERLAY_LAYER_KEY = "trees_overlay";
/** Two trees closer than this are the same tree (`tree_dedup.DEFAULT_RADIUS_M`). */
export const DEDUP_RADIUS_M = 2.0;
/**
 * Dedup with the service's own rule: two trees of the SAME source are never
 * deduplicated against each other — only a city tree against a coincident
 * OSM one, which is what the `false` argument says.
 *
 * The kernel is matched at `initializeCore()`, so the four-argument shape is
 * the only one this package can meet.
 */
export function dedupWithServiceParity(featuresJson, preferred) {
    const out = requireCore().dedupTrees(featuresJson, DEDUP_RADIUS_M, preferred, false);
    // `dedupTrees` takes and returns a feature ARRAY. If a future kernel
    // returns a FeatureCollection instead, that must be a loud failure and a
    // contract fix — not something the scanner quietly papers over.
    return requireJsonArray(out, "dedupTrees");
}
/** Read trees for an AOI straight from the public hosts, as JSON text. */
export async function acquireTreesJson(bbox, options = {}) {
    // FeatureCollection in, FeatureCollection out (signature 5). `idPrefix` is
    // the registry CITY id, which the service passes as well
    // (`app/gis/trees.py` `id_prefix=city["id"]`): without it an overlay tree is
    // `city/<source_id>` instead of `vienna/<source_id>`, a different id
    // namespace than the service for every overlay tree.
    const normalize = (collectionJson, source, idPrefix) => requireFeatureCollection(requireCore().treesNormalize(collectionJson, source, idPrefix), "treesNormalize");
    const warnings = [];
    let overlayUrl;
    let sourceKey;
    let cityId;
    if (options.bestAvailable !== false) {
        const resolution = await resolveOverlayCity(bbox, options);
        warnings.push(...resolution.warnings);
        const key = resolution.city?.layers[OVERLAY_LAYER_KEY];
        if (key !== undefined && resolution.city !== undefined) {
            overlayUrl = geoUrlFor(key);
            sourceKey = resolution.city.sourceKey;
            cityId = resolution.city.id;
        }
    }
    // Both legs run together: a city AOI must not pay two sequential range
    // reads, and either leg may succeed while the other fails.
    const [osm, overlay] = await Promise.allSettled([
        readFgbBboxJson(TREES_URL, bbox, options),
        overlayUrl === undefined
            ? Promise.resolve(undefined)
            : readFgbBboxJson(overlayUrl, bbox, options),
    ]);
    if (osm.status === "rejected") {
        // No Overpass fallback here: the SDK will not reach a host outside the
        // allow-list, so a failed world read is an honest error (D39).
        throw osm.reason instanceof Error ? osm.reason : new Error(String(osm.reason));
    }
    const sources = ["osm"];
    let collection = normalize(osm.value, "osm");
    if (overlay.status === "rejected" && overlayUrl !== undefined) {
        // The CITY id, as the service and the Python host emit it (D39 item 3).
        warnings.push(`${cityId ?? "city"}_overlay_unavailable`);
    }
    if (overlay.status === "fulfilled" && overlay.value !== undefined && sourceKey !== undefined) {
        const overlayCollection = normalize(overlay.value, sourceKey, cityId);
        const overlayFeatures = featuresArrayText(overlayCollection, "treesNormalize");
        if (overlayFeatures.trim() !== "[]") {
            sources.push(sourceKey);
            // `dedupTrees` takes and returns a feature ARRAY, so the two
            // collections are bridged by scanning out their arrays — no parse.
            const deduped = dedupWithServiceParity(spliceJsonArrays([
                featuresArrayText(collection, "treesNormalize"),
                overlayFeatures,
            ]), [sourceKey]);
            collection = featureCollectionJson(deduped);
        }
    }
    return { featuresJson: featuresArrayText(collection, "treesNormalize"), sources, warnings };
}
/** The same read, parsed once for a caller that wants feature objects. */
export async function acquireTrees(bbox, options = {}) {
    const { featuresJson, sources, warnings } = await acquireTreesJson(bbox, options);
    return {
        features: JSON.parse(featuresJson),
        sources,
        warnings,
    };
}
/** The same result as a GeoJSON FeatureCollection. */
export function treesFeatureCollection(result) {
    return { type: "FeatureCollection", features: [...result.features] };
}
