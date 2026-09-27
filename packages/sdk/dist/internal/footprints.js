/**
 * What a footprint without a height extrudes to. A site's frame origin is the
 * kernel's (`area/tile-frames.ts` `kernelPolygonOrigin`, D160).
 */
/**
 * The per-rectangle extrusion helper is GONE.
 *
 * `extrudeFootprints` wrapped `extrudeFootprintsToDotbim` for the per-tile
 * acquisition path. WP14-A replaced that path with one
 * `buildingsAssignAndExtrude` over the whole site, so the wrapper had no
 * caller left and is deleted rather than kept as a second way to extrude
 * (`docs/DEVIATIONS.md` D48). What the kernel guarantees about it — a mesh
 * keyed by its BUILDING id, never by position — is asserted through the site
 * path in `tests/area/buildings-frame.wasm.test.ts`.
 */
/**
 * Default extrusion height when a footprint carries none, in metres.
 *
 * The `prod-BUILDINGS` Lambda's value: a missing or non-positive `height`
 * extrudes 9 m, from z = 0. `min_height` is carried in the properties but is
 * NOT used for extrusion, because the Lambda ignores it.
 */
export const DEFAULT_HEIGHT_M = 9;
