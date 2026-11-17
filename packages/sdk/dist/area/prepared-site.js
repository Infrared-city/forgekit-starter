import { terrainKey } from "./site-terrain.js";
import { kernelGroupHashOnce } from "./config-hash.js";
import { pack } from "./site-pack.js";
import { requireCore } from "../internal/core.js";
import { typedAsArray } from "../internal/wire-json.js";
import { dropSiteToGrade } from "../to-grade.js";
import { contextKey, contextOptions, warnContextHole } from "./context-options.js";
import { composeTiles, geometryGroups, rejectFullyDroppedTargets } from "./plan-layers.js";
import { acquiredBuildings } from "./reanchor.js";
import { areaTransport } from "../internal/transport-choice.js";
/**
 * How many sites the realm holds. Measured on the 3.5 km, 49-tile dense-city
 * fixture: a family's site is 45–105 MB of heap (wind, solar, thermal), so
 * the three families of a six-analysis run take about 240 MB and a fourth
 * site of that size stays under 350 MB
 * (`reports/OPT-client-run-path-2026-09-18/REPORT.md`).
 */
const MAX_SITES = 4;
/**
 * The site content of an ACQUISITION result (`AreaBuildings`,
 * `AreaVegetation`, `AreaGroundMaterials`): the inner document the site
 * reads, and the fields that name its frame and read margin. The per-fetch
 * fields (`executionTime`, `failedTiles`, `warnings`, the counts) are not
 * site content: two fetches of one site must give one key (D187). A bare map
 * returns `undefined` and is hashed as given.
 */
function acquisitionContent(name, value, inner) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    const record = value;
    const margin = [record.readMarginM ?? null, record.analysisType ?? null];
    if (name === "buildings") {
        const acquired = acquiredBuildings(value);
        return acquired === undefined ? undefined
            : { document: acquired.buildings, meta: JSON.stringify([acquired.origin, ...margin]) };
    }
    // The test `acquiredLayer` (`plan-layers.ts`) uses to read the inner document.
    const document = inner === undefined ? undefined : record[inner];
    if (typeof record.readMarginM !== "number" || document === null || typeof document !== "object") {
        return undefined;
    }
    return { document, meta: JSON.stringify(margin) };
}
/**
 * Computes the content key of a site: the kernel `siteKey` (SHA-256) over the sources as the
 * site reads them, plus the tiling family.
 *
 * The buildings and the context geometry cross as the packed buffers the site is built from,
 * never as JSON text. The terrain crosses as its kernel content key. The vegetation and ground
 * materials cross as JSON text. Two runs given the same content share a site; a new input map
 * with different content does not, and neither does a map changed in place. An acquisition
 * result contributes its site content only, so a second fetch of the same site gives the same
 * key and the same `siteIdentity`. The tiling family is the polygon, the preset's three metre
 * sizes, the terrain margin, the tile cap, the wind datum and the context key.
 *
 * @param inputs - What the site stage reads.
 * @param texts - Collects the JSON text of each group written for the key, to reuse it when
 *   the site is built.
 * @param ground - The terrain's content key ({@link terrainKey}); read from the payload when
 *   omitted.
 * @param memo - Per-call digests of the mesh groups ({@link SiteKeyMemo}).
 * @returns The key.
 * @category Run an analysis
 */
// Maintainer note (not published): the acquisition-result rule is D187. The key is a hash, so
// it differs from the text keys of 0.12.13-next.x and older: a schedule saved by those versions
// may need a rerun (D297).
export function preparedSiteKey(inputs, texts, ground = terrainKey(inputs.payload["ground-geometry"], texts), memo) {
    const { payload, options, polygon, config } = inputs;
    // Each layer is the one the site reads: an option wins over the payload group
    // (`plan-layers.ts` `geometryGroups`). The meta of an acquisition result is part of the family.
    const meta = [];
    const layer = (name, given, inner) => {
        if (given === undefined)
            return undefined;
        const content = acquisitionContent(name, given, inner);
        if (content !== undefined)
            meta.push(content.meta);
        const document = content?.document ?? given;
        const text = JSON.stringify(document, typedAsArray);
        if (document !== null && typeof document === "object")
            texts?.set(document, text);
        return text;
    };
    // The buildings as the site packs them: coordinates as one f64 buffer, the
    // rest of each mesh as text. No JSON text of the coordinates is written.
    let source = payload.geometries;
    if (options.buildings !== undefined) {
        const acquired = acquisitionContent("buildings", options.buildings, undefined);
        if (acquired !== undefined)
            meta.push(acquired.meta);
        source = acquired?.document ?? options.buildings;
    }
    const vegetation = layer("vegetation", options.vegetation ?? payload.vegetation, "features");
    const materials = layer("groundMaterials", options.groundMaterials ?? payload["ground-materials"], "layers");
    const family = JSON.stringify([
        config.inferenceSizeM, config.contextSizeM, config.stepM, inputs.terrainContextMarginM,
        options.maxTilesOverride ?? null, inputs.grade ?? null, meta,
        payload["context-geometry"] === undefined ? null : contextKey(options), // D293
    ]);
    const groups = [meshDigest(source, memo?.meshes), contextDigest(payload, memo?.groups)];
    return requireCore().siteKey("[]", NO_F64, ZERO, NO_U32, ZERO, "[]", NO_F64, ZERO, NO_U32, ZERO, JSON.stringify(groups), undefined, ground, vegetation, materials, NO_U32, NO_U32, "[]", NO_F64, JSON.stringify(polygon), family);
}
/** A new, empty {@link SiteKeyMemo}. */
export function siteKeyMemo() {
    return { meshes: new WeakMap(), groups: new WeakMap() };
}
/**
 * The context's term of the site key: its kernel group hash (the one the
 * schedule hash takes, so the context is hashed once) and its mesh ids.
 */
function contextDigest(payload, memo) {
    const context = payload["context-geometry"];
    if (context === null || typeof context !== "object" || Array.isArray(context))
        return null;
    return `${kernelGroupHashOnce(String(payload["analysis-type"]), "context-geometry", context, memo)}:${JSON.stringify(Object.keys(context))}`;
}
const NO_F64 = new Float64Array(0);
const NO_U32 = new Uint32Array(0);
const ZERO = Uint32Array.of(0);
/** The kernel digest of the buildings as the site packs them; `null` for none. */
function meshDigest(source, memo) {
    if (source === null || typeof source !== "object" || Array.isArray(source))
        return null;
    const known = memo?.get(source);
    if (known !== undefined)
        return known;
    const group = pack(source, false);
    const digest = requireCore().siteKey(JSON.stringify(group.ids), group.coordinates, group.offsets, NO_U32, ZERO, "[]", NO_F64, ZERO, NO_U32, ZERO, group.document, undefined, undefined, undefined, undefined, NO_U32, NO_U32, "[]", NO_F64, "null", "buildings");
    memo?.set(source, digest);
    return digest;
}
/**
 * Builds the prepared site: assembles the geometry layers, composes every tile and checks that
 * no analysis target is dropped entirely.
 *
 * @param inputs - What the site stage reads.
 * @param analysisType - The analysis type, which selects the tiling parameters.
 * @param tiles - The tiles of the grid.
 * @param slice - Lets the work yield the thread between tiles.
 * @param texts - Group texts already written for the site key.
 * @param terrain - The terrain, read once.
 * @returns The prepared site.
 * @category Run an analysis
 */
export async function buildPreparedSite(inputs, analysisType, tiles, slice, texts, terrain) {
    const { payload, options, polygon } = inputs;
    // D91: the wind datum is applied before the compose cuts the site into tiles.
    const groups = dropSiteToGrade(geometryGroups(payload, options, polygon, [analysisType]), inputs.grade);
    const { composed, site } = await composeTiles(groups, tiles, polygon, {
        analysisType, terrainContextMarginM: inputs.terrainContextMarginM, ...contextOptions(options),
        // A binary run encodes artifacts from the kernel site (WS2, D136); a facade
        // run plans its batches and writes its bodies from it (`area/site-facade.ts`).
        keepKernelSite: areaTransport(options, analysisType) === "binary"
            || payload["analysis-surfaces"] != null,
        ...(texts === undefined ? {} : { texts }),
        ...(terrain === undefined ? {} : { terrain }),
    }, slice);
    rejectFullyDroppedTargets(groups, site);
    warnContextHole(site.contextWarning, options.logger);
    return { composed, answers: site };
}
function abortReason(signal) {
    return signal.reason ?? new DOMException("aborted", "AbortError");
}
/**
 * The cache of prepared sites: bounded (least recently used out first), local to the process,
 * and single-flight (concurrent requests for one key share one build).
 *
 * @category Run an analysis
 */
export class PreparedSiteCache {
    maxSites;
    sites = new Map();
    /** @param maxSites - How many sites to keep; default 4. */
    constructor(maxSites = MAX_SITES) {
        this.maxSites = maxSites;
    }
    /**
     * Returns the site under `key`, built by `build` when no caller has built it yet.
     *
     * With an undefined `key` the site is built every time and not kept. A caller that arrives
     * while a build is in flight awaits that build. If the build fails, the failure is the
     * builder's own (its stop signal, or an input it alone reported), so a waiter that was not
     * itself stopped builds for itself rather than inherit it.
     *
     * @param key - The content key (see `preparedSiteKey`), or `undefined` to build without caching.
     * @param build - Builds the site.
     * @param signal - Cancels a caller that is waiting on another caller's build.
     * @returns The prepared site.
     */
    async get(key, build, signal) {
        if (key === undefined)
            return build();
        for (;;) {
            const pending = this.sites.get(key);
            if (pending === undefined)
                return this.build(key, build);
            try {
                const site = await pending;
                // Touch: most recently used goes last. An entry the bound evicted
                // while this caller waited stays evicted.
                if (this.sites.get(key) === pending) {
                    this.sites.delete(key);
                    this.sites.set(key, pending);
                }
                return site;
            }
            catch {
                if (signal?.aborted)
                    throw abortReason(signal);
            }
        }
    }
    /** How many sites are held. */
    get size() {
        return this.sites.size;
    }
    /** Release every prepared site; returns how many were held. */
    clear() {
        const count = this.sites.size;
        this.sites.clear();
        return count;
    }
    async build(key, build) {
        const pending = build();
        this.sites.set(key, pending);
        try {
            return await pending;
        }
        catch (error) {
            if (this.sites.get(key) === pending)
                this.sites.delete(key);
            throw error;
        }
        finally {
            // Least recently used first; never the one just built.
            for (const other of this.sites.keys()) {
                if (this.sites.size <= this.maxSites)
                    break;
                if (this.sites.get(other) !== pending)
                    this.sites.delete(other);
            }
        }
    }
}
const shared = new PreparedSiteCache();
/**
 * Returns the cache of prepared sites that `runArea` uses in this process.
 *
 * @category Run an analysis
 */
export function preparedSites() {
    return shared;
}
/**
 * Release every prepared site this realm holds; returns how many it held.
 *
 * A long-lived process that has finished with a site can drop tens of
 * megabytes here instead of waiting for the byte bound to evict them. The
 * next `runArea` on that site prepares it again.
 *
 * @returns The number of sites that were held.
 * @category Run an analysis
 */
export function freePreparedSites() {
    return shared.clear();
}
