import { GEO_BASE_URL } from "./allowed-hosts.js";
import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson, spliceJsonArrays } from "./json-chain.js";
import { readOvertureCollectionJson } from "./overture.js";
import { requireCore } from "../internal/core.js";
/**
 * Direct ground-material acquisition — the client-side twin of
 * `GET /utils/ground-material/collect?source=fgb`.
 *
 * The host fetches two things: OSM road centrelines from the world
 * FlatGeobuf and the Overture base themes from the public parquet bucket.
 * Everything that decides a material — the half-width table, the buffering,
 * the land_cover / land_use tables, the carve — is one kernel call, so the
 * layers match the service's.
 */
/** OSM road centrelines with a surface tag, on the public R2 mirror. */
export const ROADS_URL = `${GEO_BASE_URL}/roads-surface-world.fgb`;
/** Overture base themes the composer reads. */
export const GROUND_COLLECTIONS = Object.freeze([
    "land_cover",
    "land_use",
    "water",
]);
/**
 * Normalise road FlatGeobuf features to the composer's input shape.
 *
 * A thin wrapper over the shared kernel operation `roadsNormalize`, kept as
 * a public export for callers that hold feature OBJECTS. The acquisition
 * chain does not use it: it hands the kernel the FlatGeobuf TEXT, because
 * rebuilding every road as host objects between two kernel calls is what
 * bulk-data rule 1 forbids.
 *
 * The rules are the kernel's, not this host's, and stay bug-for-bug with
 * the deleted service per the D39 ruling: the id comes from `@id` only, and
 * `surface`/`lanes` are read from the feature's own properties, where the
 * world file does not put them (they live in the `other_tags` HSTORE), so
 * every road composes as asphalt. Both are DATA findings recorded in D39.
 */
export function roadsToIrFeatures(features) {
    const collection = featureCollectionJson(`[${features.map((feature) => JSON.stringify(feature)).join(",")}]`);
    return requireFeatureArray(requireCore().roadsNormalize(collection));
}
function requireFeatureArray(json) {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : (parsed.features ?? []);
}
/**
 * Read and compose ground materials for an AOI, as JSON text.
 *
 * The composer's answer is handed on unparsed so a caller can merge and
 * clean tiles with further kernel calls (bulk-data rule 1). The kernel is
 * given the tile bbox and clips the Overture features to it, and drops the
 * coarse land_cover band; the host does not clip.
 */
export async function acquireGroundMaterialsJson(bbox, options = {}) {
    const [roads, ...themes] = await Promise.all([
        readFgbBboxJson(ROADS_URL, bbox, options),
        ...GROUND_COLLECTIONS.map((name) => readOvertureCollectionJson(name, bbox, options)),
    ]);
    // The kernel normalises the road text; there is no host fallback, because
    // a build without `roadsNormalize` cannot initialise at all.
    const roadsFc = requireCore().roadsNormalize(roads);
    const origin = options.frameOrigin ?? [bbox.west, bbox.south];
    const json = requireCore().groundMaterialsCompose(roadsFc, featureCollectionJson(spliceJsonArrays(themes.map((theme) => theme.json))), origin[0], origin[1], bbox.west, bbox.south, bbox.east, bbox.north);
    return { json, overtureRelease: themes[0]?.release ?? "" };
}
/** The same composition, parsed once for a caller that wants objects. */
export async function acquireGroundMaterials(bbox, options = {}) {
    const { json, overtureRelease } = await acquireGroundMaterialsJson(bbox, options);
    const layers = JSON.parse(json);
    return {
        layers,
        featureCount: Object.values(layers).reduce((sum, value) => sum + (value.features?.length ?? 0), 0),
        overtureRelease,
    };
}
