import { beginCompose } from "./composition.js";
import { checkReadMargin } from "../geodata/read-margin.js";
import { siteFrameBuildings } from "./reanchor.js";
import { validateGroundMaterials } from "../request-validation.js";
/**
 * The LAYER stage of `planAreaSubmission`: which geometry groups the run
 * carries, and the kernel compose that cuts them into tiles.
 *
 * Split out of `planning.ts` for the 400-line file cap (root `CLAUDE.md`
 * rule 8) when WP-3 made the stage cooperative. Nothing else calls it.
 */
export const GROUP_KEYS = [
    "geometries", "context-geometry", "ground-geometry", "vegetation", "ground-materials",
];
/**
 * The inner map of an acquired layer, after its read margin is checked.
 *
 * An acquisition result RECORDS the margin it was read with; a bare map
 * records nothing, makes no claim and is passed through unchanged. A run whose
 * analysis needs a WIDER margin is refused here, before any job is submitted,
 * because the alternative succeeds with the outermost band of context missing
 * and nothing downstream can see that (D54).
 */
function acquiredLayer(value, attribute, layer, analysisTypes) {
    checkReadMargin(value, layer, analysisTypes);
    const record = value;
    const inner = record[attribute];
    return typeof record.readMarginM === "number" && inner !== undefined ? inner : value;
}
export function geometryGroups(payload, options, polygon, analysisTypes) {
    if (options.buildings?.fetch === true) {
        throw new TypeError("buildings: {fetch: true} requires the AOI buildings service");
    }
    const groups = {};
    for (const key of GROUP_KEYS) {
        const value = payload[key];
        if (value !== undefined)
            groups[key] = value;
    }
    // An ACQUIRED buildings object names the frame it is in; the payload path
    // works in the polygon's site frame and the kernel assigns by site-frame
    // coordinates, so it is moved once, here, before anything reads it.
    if (options.buildings !== undefined) {
        checkReadMargin(options.buildings, "buildings", analysisTypes);
        groups.geometries = siteFrameBuildings(options.buildings, polygon);
    }
    if (options.vegetation !== undefined) {
        groups.vegetation = acquiredLayer(options.vegetation, "features", "trees", analysisTypes);
    }
    if (options.groundMaterials !== undefined) {
        groups["ground-materials"] = acquiredLayer(options.groundMaterials, "layers", "ground materials", analysisTypes);
    }
    // WP20/D56 — refuse an unknown material name HERE, before the grid is
    // planned and long before the first POST. `prepareSubmissionBody` asks the
    // same kernel op of every tile body, so this is the earlier and friendlier
    // of two checks, never the only one.
    validateGroundMaterials(groups["ground-materials"]);
    return groups;
}
export function indexed(grid) {
    const tiles = [];
    const byId = new Map();
    for (let row = 0; row < grid.length; row += 1) {
        const line = grid[row] ?? [];
        for (let col = 0; col < line.length; col += 1) {
            const tile = line[col];
            if (!tile || tile.empty)
                continue;
            tiles.push({ row, col, tileId: tile.tileId });
            byId.set(tile.tileId, tile);
        }
    }
    return { tiles, byId };
}
/**
 * The LAYER stage, one tile at a time, yielding between them.
 *
 * Cutting this stage into parts was tried in WP-3 and reverted: the compose
 * re-read the WHOLE site geometry on every call, so the cost was per CALL, not
 * per tile — 49 tiles cost about 3.5 s warm in one call and 59.9 s in
 * forty-nine, about 1.2 s of fixed cost each (`scripts/perf/facade-planning.mjs`).
 * D90 removed the fixed cost: the site is read ONCE into a `SiteAssignment`
 * before the loop, and since D98 a tile costs one `JSON.parse` per group of
 * the kernel's arena, so the natural yield point is the tile boundary and
 * slicing is free.
 *
 * Returns the composed payloads and the site pass beside them — the facade
 * split reads its `core`, `shrink_band` and `demoted` rather than asking the
 * kernel a second time per tile (D63).
 */
export async function composeTiles(groups, tiles, polygon, options, slice) {
    // NO short circuit for an empty `groups`. A facade request may carry
    // `analysis-surfaces` and no geometry at all, and the tile loop reads one
    // site answer PER TILE: handing it an empty list makes every tile's answer
    // missing rather than empty, and the plan dies on a run that used to submit
    // empty bodies. An empty site costs one `SiteAssignment` over nothing.
    await slice.pause();
    const run = beginCompose(groups, tiles, polygon, {
        analysisType: options.analysisType,
        terrainContext: { margin_m: options.terrainContextMarginM },
    }, options.keepKernelSite ?? false, options.texts, true, options.terrain);
    let parsed;
    const composed = (tileSlice) => parsed ??= (async () => {
        for (let index = 0; index < tiles.length; index += 1) {
            await tileSlice.tick();
            run.tile(index);
        }
        return run.payloads;
    })().catch((error) => {
        parsed = undefined;
        throw error;
    });
    return { composed, site: run.site };
}
export function rejectFullyDroppedTargets(groups, site) {
    const requested = groups.geometries;
    if (requested === undefined || Object.keys(requested).length === 0)
        return;
    // A tile's `members` are the ids its `geometries` body carries.
    if (!site.tiles.some((tile) => tile.members.length > 0)) {
        throw new TypeError("all requested target geometries are malformed or outside the area");
    }
}
