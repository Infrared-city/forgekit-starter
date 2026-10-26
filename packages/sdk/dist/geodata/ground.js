import { GEO_BASE_URL } from "./allowed-hosts.js";
import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson, spliceJsonArrays } from "./json-chain.js";
import { readOvertureCollectionJson } from "./overture.js";
import { requireCore } from "../internal/core.js";
/**
 * URL of the OSM road centrelines (with a surface tag) on the public Infrared
 * data mirror.
 *
 * @category Geodata
 */
// Maintainer note (not published): direct ground-material acquisition — the
// client-side twin of `GET /utils/ground-material/collect?source=fgb`.
//
// The host fetches two things: OSM road centrelines from the world
// FlatGeobuf and the Overture base themes from the public parquet bucket.
// Everything that decides a material — the half-width table, the buffering,
// the land_cover / land_use tables, the carve — is one kernel call, so the
// layers match the service's.
export const ROADS_URL = `${GEO_BASE_URL}/roads-surface-world.fgb`;
/**
 * The Overture Maps base themes read to compose ground materials: `land_cover`,
 * `land_use` and `water`.
 *
 * @category Geodata
 */
export const GROUND_COLLECTIONS = Object.freeze([
    "land_cover",
    "land_use",
    "water",
]);
/**
 * Normalise road features read from the FlatGeobuf file into the shape the
 * ground composer takes as input.
 *
 * Use this when you already hold feature objects. The acquisition functions do
 * not call it; they pass the road data on as text.
 *
 * The id of a road comes from its `@id` property only. `surface` and `lanes`
 * are read from the feature's own properties, where the world file does not
 * carry them, so every road composes as asphalt.
 *
 * @param features - Road features as read from the world FlatGeobuf file.
 * @returns The normalised road features.
 * @category Ground materials
 */
// Maintainer note (not published): a thin wrapper over the shared kernel
// operation `roadsNormalize`, kept as a public export for callers that hold
// feature OBJECTS. The acquisition chain does not use it: it hands the kernel
// the FlatGeobuf TEXT, because rebuilding every road as host objects between
// two kernel calls is what bulk-data rule 1 forbids.
//
// The rules are the kernel's, not this host's, and stay bug-for-bug with
// the deleted service per the D39 ruling: the id comes from `@id` only, and
// `surface`/`lanes` are read from the feature's own properties, where the
// world file does not put them (they live in the `other_tags` HSTORE), so
// every road composes as asphalt. Both are DATA findings recorded in D39.
export function roadsToIrFeatures(features) {
    const collection = featureCollectionJson(`[${features.map((feature) => JSON.stringify(feature)).join(",")}]`);
    return requireFeatureArray(requireCore().roadsNormalize(collection));
}
function requireFeatureArray(json) {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : (parsed.features ?? []);
}
/**
 * Read and compose ground materials for an area, returning JSON text.
 *
 * Reads OSM roads and the Overture base themes for the bounding box and
 * composes them into material layers, clipped to the box. The result is left
 * unparsed so it can be passed on without building objects.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read and frame options.
 * @returns The composed `{material: FeatureCollection}` JSON text and the
 *   Overture release it came from.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Ground materials
 */
// Maintainer note (not published): the composer's answer is handed on
// unparsed so a caller can merge and clean tiles with further kernel calls
// (bulk-data rule 1). The kernel is given the tile bbox and clips the Overture
// features to it, and drops the coarse land_cover band; the host does not clip.
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
/**
 * Read and compose ground materials for an area, returning parsed layers.
 *
 * The same composition as {@link acquireGroundMaterialsJson}, parsed once for a
 * caller that wants objects.
 *
 * @param bbox - The area's bounding box in WGS84 degrees.
 * @param options - Read and frame options.
 * @returns The layers, the total feature count and the Overture release.
 * @throws {GeodataDependencyError} when the optional parquet reader packages are
 *   not installed.
 * @throws {HostNotAllowedError} when a data URL is not on the allow-list.
 * @category Ground materials
 */
export async function acquireGroundMaterials(bbox, options = {}) {
    const { json, overtureRelease } = await acquireGroundMaterialsJson(bbox, options);
    const layers = JSON.parse(json);
    return {
        layers,
        featureCount: Object.values(layers).reduce((sum, value) => sum + (value.features?.length ?? 0), 0),
        overtureRelease,
    };
}
