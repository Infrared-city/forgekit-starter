import { requireCore } from "../internal/core.js";
import { siteOptionsJson } from "./context-options.js";
import { typedAsArray } from "../internal/wire-json.js";
import { getTilingConfig } from "./tiling.js";
import { kernelPolygonOrigin } from "./tile-frames.js";
import { pack } from "./site-pack.js";
import { liveTerrain } from "./site-terrain.js";
/**
 * A group document's JSON text. `texts` holds the text the site key already
 * wrote for the same object in this plan (`prepared-site.ts`), so the
 * constructor does not write it a second time.
 */
function document(value, texts) {
    if (value === undefined)
        return undefined;
    const known = value !== null && typeof value === "object" ? texts?.get(value) : undefined;
    return known ?? JSON.stringify(value, typedAsArray);
}
const NO_BUFFER = new Uint32Array(0);
/** The site read into the kernel ONCE: the packed groups, their documents, the layers. */
export function kernelSite(inputs, texts) {
    const { groups, tiles, polygon } = inputs;
    const buildings = pack(asMap(groups.geometries), false);
    const context = pack(asMap(groups["context-geometry"]), true);
    // The context mesh crosses as buffers, never as JSON text; empty offsets = no context group.
    const contextIndices = groups["context-geometry"] === undefined ? NO_BUFFER : context.indices;
    const contextIndexOffsets = groups["context-geometry"] === undefined ? NO_BUFFER : context.indexOffsets;
    const config = getTilingConfig(inputs.analysisType);
    const origin = kernelPolygonOrigin(polygon);
    // The terrain read once for this group (D200): the site takes the handle in
    // place of the text, so a building edit reads no terrain.
    // A handle the bound freed since the plan took it reads the text instead.
    const terrain = liveTerrain(inputs.terrain);
    if (terrain !== undefined) {
        return requireCore().Site.withTerrain(buildings.ids, buildings.bytes, buildings.offsets, context.ids, context.bytes, context.offsets, Uint32Array.from(tiles, (tile) => tile.row), Uint32Array.from(tiles, (tile) => tile.col), tiles.map((tile) => tile.tileId), config.inferenceSizeM, config.contextSizeM, config.stepM, origin.lon, origin.lat, groups.geometries === undefined ? undefined : buildings.document, undefined, document(groups.vegetation, texts), document(groups["ground-materials"], texts), JSON.stringify(polygon), terrain, contextIndices, contextIndexOffsets, siteOptions(inputs));
    }
    return new (requireCore().Site)(buildings.ids, buildings.bytes, buildings.offsets, context.ids, context.bytes, context.offsets, Uint32Array.from(tiles, (tile) => tile.row), Uint32Array.from(tiles, (tile) => tile.col), tiles.map((tile) => tile.tileId), config.inferenceSizeM, config.contextSizeM, config.stepM, origin.lon, origin.lat, groups.geometries === undefined ? undefined : buildings.document, undefined, document(groups["ground-geometry"], texts), document(groups.vegetation, texts), document(groups["ground-materials"], texts), JSON.stringify(polygon), contextIndices, contextIndexOffsets, siteOptions(inputs));
}
/** The kernel Site's options document (`SiteOptions`): a key left out takes the kernel default. */
function siteOptions(inputs) {
    return siteOptionsJson({
        terrainMarginM: inputs.terrainContextMarginM, contextReachM: inputs.contextReachM,
        contextBufferM: inputs.contextBufferM,
    });
}
/**
 * Frees a kept kernel site once its {@link SiteAssignment} is unreachable.
 * JavaScript never frees wasm memory by itself, and a prepared site outlives
 * the plan that built it: the realm cache keeps it for later runs, and a
 * planned tile's artifact is encoded at SUBMIT time. Freeing on cache
 * eviction would pull the site from under a run that still holds it, so the
 * site is freed when the last holder lets go — the rule the Python binding
 * gets from reference counting. A realm without `FinalizationRegistry` keeps
 * no kernel site at all (see {@link SiteAssignment.read}).
 */
export const release = typeof FinalizationRegistry === "function"
    ? new FinalizationRegistry((inner) => inner.free())
    : undefined;
/** `{}` for an absent group, the caller's map otherwise. */
function asMap(value) {
    if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return value;
}
