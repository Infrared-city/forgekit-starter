import { requireCore } from "./internal/core.js";
import { plainCoordinates } from "./area/site-pack.js";
import { WIND_ANALYSIS_TYPES } from "./analysis-types.js";
/** The option value that asks for the drop; the default for the wind family. */
export const TO_GROUND = "to-ground";
/** `true` for the two models this option exists on, and no other. */
export function takesGradeDrop(analysisType) {
    return typeof analysisType === "string" &&
        WIND_ANALYSIS_TYPES.has(analysisType);
}
/**
 * One geometry group with every mesh dropped to grade.
 *
 * Returns the caller's own object BY IDENTITY when nothing moved. That identity
 * is the contract: it is what lets a flat-base site submit an unchanged body.
 *
 * A mesh this host cannot read as a flat `[x, y, z, ...]` array is left alone —
 * the same predicate the tile assignment reads it with, so this pass never
 * moves a mesh membership would have skipped.
 */
export function dropMeshesToGrade(meshes) {
    const ids = Object.keys(meshes);
    if (ids.length === 0)
        return meshes;
    const blocks = ids.map((id) => plainCoordinates(meshes[id]) ?? []);
    const offsets = new Uint32Array(ids.length + 1);
    let total = 0;
    for (let slot = 0; slot < blocks.length; slot += 1) {
        total += blocks[slot].length;
        offsets[slot + 1] = total;
    }
    // The kernel reads LITTLE-endian f64 and `DataView` writes that order on
    // every engine, so there is no host-order branch to get wrong. Python packs
    // the same bytes the same way.
    const bytes = new Uint8Array(total * 8);
    const view = new DataView(bytes.buffer);
    let at = 0;
    for (const block of blocks) {
        for (const value of block) {
            view.setFloat64(at, value, true);
            at += 8;
        }
    }
    const { coordinates, removed } = requireCore().dropToGrade(bytes, offsets);
    if (!removed.some((value) => value !== 0))
        return meshes;
    // `slice()` copies into a fresh, 8-byte-aligned buffer: a `Float64Array` view
    // onto the wasm-returned bytes is only legal when they happen to be aligned.
    const values = new Float64Array(coordinates.slice().buffer);
    const out = { ...meshes };
    for (let slot = 0; slot < ids.length; slot += 1) {
        if (removed[slot] === 0)
            continue;
        const id = ids[slot];
        const mesh = meshes[id];
        out[id] = {
            ...mesh,
            coordinates: Array.from(values.subarray(offsets[slot], offsets[slot + 1])),
        };
    }
    return out;
}
/**
 * The PLAN seam, in two halves: read the option and consume it, then apply it
 * to the site. `planAreaSubmission` calls them separately, because the CHOICE
 * is part of the prepared site's identity (`area/prepared-site.ts`) and the
 * DROP runs only when that site is built — once per site, never per run.
 *
 * Called once per plan, before the compose cuts the site into tiles — never per
 * tile, and never after the geometry has been sliced. The option is REMOVED
 * from the payload because the wire has no such key: the worker takes no
 * terrain and would not know what to do with it, and leaving it in would change
 * every wind body and every configuration hash for a field the server ignores.
 */
export function resolveGradeDrop(payload, groups) {
    return dropSiteToGrade(groups, consumeGradeOption(payload));
}
/**
 * The option's value, taken OFF the payload: `"to-ground"` (the wind family's
 * default) or `"as-is"`; `undefined` on a model that has no such option.
 */
export function consumeGradeOption(payload) {
    if (!takesGradeDrop(payload["analysis-type"]))
        return undefined;
    const chosen = payload["terrain-alignment"] ?? TO_GROUND;
    delete payload["terrain-alignment"];
    return chosen;
}
/** The site with every building at grade when `chosen` asks for it. */
export function dropSiteToGrade(groups, chosen) {
    if (chosen !== TO_GROUND)
        return groups;
    const meshes = groups.geometries;
    if (meshes === null || typeof meshes !== "object" || Array.isArray(meshes))
        return groups;
    const dropped = dropMeshesToGrade(meshes);
    return dropped === meshes ? groups : { ...groups, geometries: dropped };
}
