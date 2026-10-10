import { requireCore } from "./core.js";
import { groupHasContent } from "./kernel-group.js";
/**
 * The `terrain-alignment` an unset field means for a supplied scene.
 *
 * A request that brings its own terrain AND its own buildings, context or
 * trees, and names no alignment, is sent as `"as-is"`: the caller's solids
 * already sit on their terrain. The server default (`auto-align`) is a
 * different run, so the schedule hash must see the same value the wire
 * carries. ONE function: `prepareSubmissionBody` writes it, and the schedule
 * hash (`area/planning.ts`) resolves the payload with it before hashing.
 *
 * Returns `"as-is"` when the rule applies, else `undefined` (leave as is).
 */
export function suppliedSceneAlignment(analysisType, body) {
    const suppliedScene = [
        "geometries", "context-geometry", "vegetation", "vegetation-instances",
    ].some((name) => groupHasContent(body[name]));
    // The rule is the kernel's (`resolveTerrainAlignment`, `ir-geo`
    // `terrain_alignment`); this host only says what counts as content.
    return requireCore().resolveTerrainAlignment(analysisType, Object.prototype.hasOwnProperty.call(body, "terrain-alignment"), groupHasContent(body["ground-geometry"]), suppliedScene);
}
