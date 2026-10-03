import { requireCore } from "../internal/core.js";
import { rememberGroup } from "../internal/geometry-reuse/identity.js";
import { rememberWireText } from "../internal/wire-json.js";
import { SiteAssignment } from "./site-assign.js";
const WASM_USIZE_MAX = 0xffff_ffff;
/** Every group this host has an area tiling policy for. */
const SUPPORTED = [
    "geometries", "context-geometry", "ground-geometry", "vegetation", "ground-materials",
];
const BINARY_MESH_FIELDS = [
    "coordinates_bin",
    "coordinates_bin_encoding",
    "indices_bin",
    "indices_bin_encoding",
];
function rejectBinaryMeshes(key, data) {
    if (key !== "geometries" && key !== "context-geometry" && key !== "ground-geometry")
        return;
    if (data === null || typeof data !== "object" || Array.isArray(data))
        return;
    for (const mesh of Object.values(data)) {
        if (mesh === null || typeof mesh !== "object" || Array.isArray(mesh))
            continue;
        for (const field of BINARY_MESH_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(mesh, field)) {
                throw new TypeError(`${key} must use JSON mesh coordinates for area tiling`);
            }
        }
    }
}
function checkedIndex(value, field) {
    if (!Number.isSafeInteger(value) || value < 0 || value > WASM_USIZE_MAX) {
        throw new TypeError(`${field} must be an integer from 0 through ${WASM_USIZE_MAX}`);
    }
    return value;
}
function registeredNames() {
    const records = Array.from(requireCore().geometryGroups());
    return new Set(records.map((record) => record.name).filter((name) => typeof name === "string"));
}
/**
 * Assign supported wire geometry groups to non-empty tiles.
 *
 * The shared kernel owns projection, assignment, ownership, the terrain
 * policy, the exact re-anchor into each tile's frame (D48) and, since D98, the
 * canonical bytes of every group and their kernel hashes. Compact
 * `vegetation-instances` has no shared tiling policy yet and is rejected.
 *
 * The answer is FINISHED: every group is in the tile's own frame, so there is
 * no second step between this and the wire.
 */
export function composeTilePayloads(groups, tiles, polygon, options = {}) {
    const run = beginCompose(groups, tiles, polygon, options);
    for (let index = 0; index < tiles.length; index += 1)
        run.tile(index);
    return run.payloads;
}
const decoder = new TextDecoder();
/**
 * {@link composeTilePayloads}, one tile at a time, with the site pass kept.
 *
 * `planAreaSubmission` drives THIS one: it yields the thread between tiles
 * (D78) and the facade split reads the kernel's `core`, `shrink_band` and
 * `demoted` off `site` instead of asking the kernel a second time per tile
 * (D63, D90). A tile costs one `JSON.parse` per group of the kernel's own
 * bytes, and each parsed group is remembered with those bytes and its kernel
 * hash, so the reuse path never canonicalises or re-hashes it and digests an
 * identity only when asked.
 */
export function beginCompose(groups, tiles, polygon, options = {}, keepKernelSite = false, texts, 
/**
 * Remember each group's arena bytes as its wire text (`internal/wire-json.ts`).
 * ONLY the plan path sets this: its group objects are SDK-owned (the
 * prepared site, D96). `composeTilePayloads` hands its payloads to the
 * caller, who may change them before a submit, so it never remembers.
 */
rememberWire = false, 
/** The terrain read once for `groups["ground-geometry"]` (D200). */
terrain) {
    const tileInput = tiles.map((tile) => ({
        row: checkedIndex(tile.row, "tile row"),
        col: checkedIndex(tile.col, "tile col"),
        tileId: tile.tileId,
    }));
    const registered = registeredNames();
    const present = [];
    for (const [key, data] of Object.entries(groups)) {
        if (!registered.has(key))
            throw new TypeError(`unknown geometry group '${key}'`);
        if (!SUPPORTED.includes(key)) {
            throw new TypeError(`geometry group '${key}' has no area tiling policy`);
        }
        rejectBinaryMeshes(key, data);
        present.push(key);
    }
    if (groups["ground-geometry"] !== undefined && options.terrainContext === undefined) {
        throw new TypeError("terrainContext is required for ground-geometry");
    }
    const site = SiteAssignment.read(groups, tileInput, polygon, options.analysisType ?? undefined, options.terrainContext?.margin_m, keepKernelSite, texts, terrain);
    const payloads = {};
    return {
        site,
        payloads,
        tile(index) {
            const tile = tiles[index];
            if (tile === undefined)
                throw new RangeError(`tile index ${index} is outside the grid`);
            const payload = {};
            // The caller's own group order.
            for (const group of present) {
                const written = site.group(index, group);
                if (written === undefined)
                    continue;
                const value = JSON.parse(decoder.decode(written.bytes));
                rememberGroup(group, value, written.bytes, written.hash);
                if (rememberWire)
                    rememberWireText(value, written.bytes);
                payload[group] = value;
            }
            payloads[tile.tileId] = payload;
        },
    };
}
