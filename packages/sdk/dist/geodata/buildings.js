import { geoUrlFor } from "./allowed-hosts.js";
import { readFgbBboxJson } from "./fgb.js";
import { featureCollectionJson, requireFeatureCollection } from "./json-chain.js";
import { resolveOverlayCity } from "./manifests.js";
import { readOvertureCollectionJson } from "./overture.js";
import { requireCore } from "../internal/core.js";
/**
 * Direct building acquisition — footprints straight from the public hosts.
 *
 * Precedence is the `prod-BUILDINGS` Lambda's
 * (`backend-lambdas/services/buildings/lib/cityOverlay.ts`): fetch
 * `sources.json`, and when the tile's query rectangle intersects a
 * registered city outline that publishes a `buildings` layer, range-read
 * that city FlatGeobuf; otherwise read Overture's building theme through the
 * R2 index, with a small candidate buffer around the rectangle. Height and
 * id normalisation is a kernel call.
 */
/** Registry layer key naming a city's building overlay. */
export const OVERLAY_LAYER_KEY = "buildings";
/**
 * Candidate buffer around the query rectangle for the Overture leg, in
 * degrees — the Lambda's, so the same edge buildings are considered.
 */
export const OVERTURE_CANDIDATE_BUFFER_DEG = 0.002;
/**
 * Read building footprints for an AOI straight from the public hosts, as
 * JSON text.
 *
 * Read → normalise is one chain of kernel-facing strings; the caller decides
 * whether to parse or to pass the text into the extruder (bulk-data rule 1).
 */
export async function acquireBuildingsJson(bbox, options = {}) {
    const warnings = [];
    let collectionJson;
    let source = "overture";
    if (options.bestAvailable !== false) {
        const resolution = await resolveOverlayCity(bbox, options);
        warnings.push(...resolution.warnings);
        const key = resolution.city?.layers[OVERLAY_LAYER_KEY];
        if (key !== undefined && resolution.city !== undefined) {
            try {
                collectionJson = await readFgbBboxJson(geoUrlFor(key), bbox, options);
                source = resolution.city.sourceKey;
            }
            catch {
                // Degrade to the global layer, but say so: a silent downgrade would
                // hide a city's higher-fidelity footprints going missing.
                // The CITY id, as the service and the Python host emit it (D39 item 3).
                warnings.push(`${resolution.city.id}_overlay_unavailable`);
                collectionJson = undefined;
            }
        }
    }
    let overtureRelease = "";
    if (collectionJson === undefined) {
        // The Lambda widens the rectangle before selecting candidate FILES, so a
        // building whose footprint reaches into the tile is not missed by a file
        // bbox that only just clears it. Rows are still filtered by the TILE
        // bbox: a footprint that intersects the tile is kept WHOLE (the Lambda
        // filters by intersection, it does not clip), and overlapping tiles dedup
        // on the building key. See DEVIATIONS D38/D39.
        const read = await readOvertureCollectionJson("building", bbox, {
            ...options,
            candidateBufferDeg: OVERTURE_CANDIDATE_BUFFER_DEG,
        });
        collectionJson = featureCollectionJson(read.json);
        overtureRelease = read.release;
    }
    return {
        collectionJson: requireFeatureCollection(requireCore().buildingsNormalize(collectionJson, source), "buildingsNormalize"),
        source,
        warnings,
        overtureRelease,
    };
}
/** The same read, parsed once for a caller that wants feature objects. */
export async function acquireBuildings(bbox, options = {}) {
    const { collectionJson, source, warnings, overtureRelease } = await acquireBuildingsJson(bbox, options);
    const parsed = JSON.parse(collectionJson);
    return { features: parsed.features ?? [], source, warnings, overtureRelease };
}
