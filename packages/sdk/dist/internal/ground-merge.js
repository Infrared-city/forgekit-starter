import { requireCore } from "./core.js";
import { InvalidOptionError } from "./service.js";
/**
 * Merging and cleaning per-tile ground-material layers.
 *
 * Split out of the service so the kernel it talks to is an argument: a test
 * can hand it a core that exports the fused call and prove an injected
 * cleaner never reaches it.
 */
/**
 * Which cleaner an area call uses.
 *
 * The bundled kernel cleans by default: the layers were composed in-process
 * from public data, and posting that scene back to a service to be cleaned
 * would send data the caller deliberately kept off the network. A caller's
 * own {@link GroundMaterialCleaner} object still wins.
 *
 * The string selectors are gone. `"remote"` named the deleted
 * utilities-service route and `"local"` is now the default, so either
 * string is a typed error that names the replacement rather than a silent
 * change of path.
 */
export function resolveCleaner(requested) {
    if (requested === undefined)
        return "local";
    if (typeof requested === "string") {
        throw new InvalidOptionError(`cleaner ${JSON.stringify(requested)} was removed; leave cleaner unset for the ` +
            "bundled kernel cleaner, or pass a GroundMaterialCleaner object");
    }
    return requested;
}
/**
 * The circle clean-v3 works in: the centre of the AOI's bounding box and
 * half its projected diagonal, never under the READ half extent.
 *
 * It is the SOURCE polygon's bounds, not the tile grid's: an irregular AOI
 * would otherwise be cleaned against a circle that leaves part of it out.
 *
 * `fetchDistanceM` is the floor, and it is the read half extent the caller
 * fetched with — `ceil(sqrt(2) * margin)`, 363 m on the wind preset and 544 m
 * on the solar one (`docs/DEVIATIONS.md` D54). It was a hard-coded 363 here,
 * which meant a small area read at the WP16 default cleaned to a 544 m circle
 * on the Python host and a 363 m one here: two callers, one polygon, two
 * ground scenes, and nothing downstream able to see it. It is REQUIRED, with
 * no default, for the same reason D54 gives for the margin itself: a default
 * here is a host constant, and the number belongs to the read the caller
 * actually made. The Python twin `cleaning_extent(polygon, *, fetch_distance)`
 * requires it too.
 *
 * The projected diagonal comes from the kernel (`projectPolygonToMeters`, the
 * canonical `LocalFrame` of D1), which is now also what the Python host uses.
 */
export function cleaningExtent(polygon, fetchDistanceM) {
    const ring = polygon.coordinates[0];
    if (!ring || ring.length === 0)
        throw new TypeError("polygon exterior ring is empty");
    let minLatitude = Number.POSITIVE_INFINITY;
    let maxLatitude = Number.NEGATIVE_INFINITY;
    let minLongitude = Number.POSITIVE_INFINITY;
    let maxLongitude = Number.NEGATIVE_INFINITY;
    for (const point of ring) {
        minLongitude = Math.min(minLongitude, point[0]);
        maxLongitude = Math.max(maxLongitude, point[0]);
        minLatitude = Math.min(minLatitude, point[1]);
        maxLatitude = Math.max(maxLatitude, point[1]);
    }
    const projected = JSON.parse(requireCore().projectPolygonToMeters(JSON.stringify(polygon)));
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const [x, y] of projected.polygon_meters) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return {
        latitude: (minLatitude + maxLatitude) / 2,
        longitude: (minLongitude + maxLongitude) / 2,
        distance: Math.max(fetchDistanceM, Math.hypot(maxX - minX, maxY - minY) / 2),
    };
}
/**
 * The host no longer merges or cleans ground layers.
 *
 * Up to 0.12 this module held `MergeCore`, `mergeTileLayers` and
 * `cleanMergedLayers`: the per-simulation-tile documents came back from the
 * acquisition path and the host merged them, then cleaned the merge. WP14-A
 * moved all three into ONE kernel call over the whole site —
 * `groundMaterialsComposeAndMergeBytes` composes, merges and cleans — so the
 * host functions had no caller left and are gone rather than kept as a second
 * way to do it (`docs/DEVIATIONS.md` D48).
 *
 * What stays here is what the SERVICE still decides: the cleaning extent, and
 * which cleaner runs. A caller's own {@link GroundMaterialCleaner} still
 * receives the merged, kernel-cleaned layers and may replace them; that is an
 * extension seam, not a service selector.
 */
