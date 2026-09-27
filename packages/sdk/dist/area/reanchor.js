import { requireCore } from "../internal/core.js";
import { kernelPolygonOrigin } from "./tile-frames.js";
/**
 * The payload-time frame re-anchor (`docs/DEVIATIONS.md` D48).
 *
 * A building body reaches the payload path in the SITE frame — one frame for
 * the whole area, extruded once. The server projects each TILE at its own
 * reference point, so the body has to arrive in the tile's frame. The kernel's
 * area tiling policy moves it there with a constant offset
 * (`tile_sw_offset`), which is exact in y and wrong in x: `LocalFrame` fixes
 * the east-west scale at the frame's ORIGIN latitude (D1), so the site frame
 * and a tile frame disagree by `x * tan(lat) * dlat` — 0.70 m measured at
 * 2 km east / 2 km north of a Vienna origin.
 *
 * `frameReanchorBytes` applies the exact affine instead:
 *
 * ```text
 * x' = x * cos(lat1)/cos(lat0) + dx      y' = y + dy      z' = z
 * ```
 *
 * TARGET cosine over SOURCE cosine, with `(dx, dy)` the source origin
 * expressed in the target frame. It reproduces the shipped
 * `extrudeFootprintsToDotbim` at the tile origin to 2.4e-14 relative, where
 * the constant offset is 11.1 mm out on the same capture
 * (`WP14-kernel-report.md` §2).
 *
 * **Only metre-frame geometry may be re-anchored.** Ground-material layers are
 * WGS84 DEGREES with the Z in metres (`ir_simprep::ground_clean`'s wire
 * contract), so they carry no frame and must not be touched. Vegetation is
 * projected per tile by the kernel from the polygon, so it never enters the
 * payload in the site frame at all.
 */
/** The bytes twin: one traversal of the document instead of two. */
const encoder = new TextEncoder();
const decoder = new TextDecoder();
/**
 * Move one group's METRE-frame entries from `source` into `target`.
 *
 * `entries` is a `{key: mesh}` map in the source frame; the answer is the same
 * map, same keys, same order, with `coordinates` re-anchored and `indices`,
 * `mesh_id` and every other member passed through. The kernel refuses an entry it cannot place, and it names that entry. This is
 * the failure the operation exists to remove: half a payload still in the site
 * frame.
 */
export function reanchorEntries(entries, source, target) {
    const document = encoder.encode(JSON.stringify(entries));
    const moved = requireCore().frameReanchorBytes(document, source.lon, source.lat, target.lon, target.lat);
    return JSON.parse(decoder.decode(moved));
}
/**
 * The site-frame entries a tile was assigned, ready to re-anchor.
 *
 * The ASSIGNMENT is the kernel's — `composeTilePayloads` decides which bodies
 * a tile's context rectangle meets, and this reads that decision back as a key
 * list. Only the COORDINATES come from the site-frame source, because the
 * kernel's copy has already been shifted by the constant offset this replaces.
 * Key order is the kernel's, so the payload's insertion order does not move.
 */
export function siteEntriesFor(assigned, siteGroup) {
    const out = {};
    for (const key of Object.keys(assigned)) {
        const entry = siteGroup[key];
        if (entry === undefined) {
            // The kernel assigned a key the source does not hold, which would mean
            // the assignment and the geometry disagree about the area.
            throw new Error(`tile geometry ${JSON.stringify(key)} is not in the site-frame group`);
        }
        Object.defineProperty(out, key, {
            value: entry, enumerable: true, writable: true, configurable: true,
        });
    }
    return out;
}
/**
 * Is this an `AreaBuildings`, or a bare `{buildingId: mesh}` map?
 *
 * The discriminator is `origin`: a two-element array of finite numbers. A
 * mesh is an OBJECT, so a bare map can never put an array under one of its
 * building keys and still compose — `composeTilePayloads` refuses an entry
 * that is not a mesh. `buildings` must be a plain object beside it.
 */
export function acquiredBuildings(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    const candidate = value;
    const origin = candidate["origin"];
    const buildings = candidate["buildings"];
    if (!Array.isArray(origin) || origin.length !== 2)
        return undefined;
    const [lon, lat] = origin;
    if (typeof lon !== "number" || !Number.isFinite(lon))
        return undefined;
    if (typeof lat !== "number" || !Number.isFinite(lat))
        return undefined;
    if (buildings === null || typeof buildings !== "object" || Array.isArray(buildings)) {
        return undefined;
    }
    return { buildings: buildings, origin: [lon, lat] };
}
/**
 * The caller's buildings, in the frame the payload path works in (D48).
 *
 * `runArea` composes and re-anchors in the POLYGON's site frame, and the
 * kernel ASSIGNS a body to a tile by its site-frame coordinates. An
 * `AreaBuildings` acquired for a DIFFERENT polygon is anchored at that
 * polygon's south-west corner, so passing it through unchanged would both
 * assign the bodies to the wrong tiles and put the whole city on the wire
 * translated by the difference between the two corners — silently, because
 * `rejectFullyDroppedTargets` fires only when EVERY tile ends up empty. One
 * exact affine over the map, once, removes it.
 *
 * A recorded origin that differs from this run's site origin is USED, not
 * refused: acquiring once for a large area and running several sub-areas is a
 * supported workflow now that acquisition is a site-level call. A BARE map
 * carries no frame, so it is passed through and keeps today's behaviour — it
 * is assumed to be in this polygon's frame already.
 */
export function siteFrameBuildings(value, polygon) {
    const acquired = acquiredBuildings(value);
    if (acquired === undefined)
        return value;
    const target = kernelPolygonOrigin(polygon);
    const source = { lon: acquired.origin[0], lat: acquired.origin[1] };
    if (source.lon === target.lon && source.lat === target.lat)
        return acquired.buildings;
    if (Object.keys(acquired.buildings).length === 0)
        return acquired.buildings;
    return reanchorEntries(acquired.buildings, source, target);
}
