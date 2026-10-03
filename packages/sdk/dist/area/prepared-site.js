import { sha256Hex } from "../internal/geometry-reuse/canonical.js";
import { contentFingerprint } from "../internal/geometry-reuse/fingerprint.js";
import { spliceJsonBytes } from "../internal/wire-json.js";
import { dropSiteToGrade } from "../to-grade.js";
import { composeTiles, geometryGroups, GROUP_KEYS, rejectFullyDroppedTargets } from "./plan-layers.js";
import { acquiredBuildings } from "./reanchor.js";
import { areaTransport } from "../internal/transport-choice.js";
/**
 * How many sites the realm holds. Measured on the 3.5 km, 49-tile Hong Kong
 * fixture: a family's site is 45–105 MB of heap (wind, solar, thermal), so
 * the three families of a six-analysis run take about 240 MB and a fourth
 * site of that size stays under 350 MB
 * (`reports/OPT-client-run-path-2026-09-18/REPORT.md`).
 */
const MAX_SITES = 4;
const encoder = new TextEncoder();
/**
 * Memo by source OBJECT: the digest of a payload group or an acquired
 * `buildings` / `vegetation` / `groundMaterials` object, keyed on the
 * object's identity (`docs/DEVIATIONS.md` D104). The prepared site keeps
 * these objects alive across `runArea` calls (D96), so six calls that share
 * one group object hash it once instead of six times. The caller can change a
 * source object in place between two calls, so each entry keeps the content
 * fingerprint (`internal/geometry-reuse/fingerprint.ts`) of the text it
 * hashed, from the object's second sight on, and a later call uses the digest
 * only when the fingerprint is the same (D182, D183). A NEW map: this digest is over the raw `JSON.stringify` text,
 * not the identity memo's envelope, so the two never share an entry.
 */
const groupDigestMemo = new WeakMap();
/**
 * The UTF-8 of `JSON.stringify(source)`. When `source` is an acquisition
 * result, the inner document (`inner`) is written once, recorded in `texts`
 * for the constructor, and spliced into the outer text, so the bytes are
 * those of `JSON.stringify(source)`.
 */
function sourceBytes(source, inner, texts) {
    if (texts === undefined)
        return encoder.encode(JSON.stringify(source));
    const record = source;
    const document = inner === undefined ? undefined : record[inner];
    if (document === null || typeof document !== "object" || Array.isArray(source)) {
        const text = JSON.stringify(source);
        texts.set(source, text);
        return encoder.encode(text);
    }
    let innerBytes;
    const bytes = spliceJsonBytes(record, (value) => {
        if (value !== document)
            return undefined;
        const text = JSON.stringify(document);
        texts.set(document, text);
        innerBytes ??= encoder.encode(text);
        return innerBytes;
    });
    return bytes ?? encoder.encode(JSON.stringify(source));
}
async function sourceDigest(source, inner, texts) {
    if (source === null || typeof source !== "object") {
        return sha256Hex(encoder.encode(JSON.stringify(source)));
    }
    // No fingerprint walk on a first sight (D183): the walk runs only for an
    // object seen before, so a fresh object costs what it cost before D182.
    const cached = groupDigestMemo.get(source);
    const fingerprint = cached === undefined ? undefined : contentFingerprint(source);
    if (fingerprint !== undefined && cached?.fingerprint === fingerprint)
        return cached.digest;
    const digest = await sha256Hex(sourceBytes(source, inner, texts));
    if (digest === undefined)
        groupDigestMemo.delete(source);
    else
        groupDigestMemo.set(source, { fingerprint, digest });
    return digest;
}
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
 * The content key of a site: the digest of every geometry source, plus the
 * tiling family.
 *
 * Each source — a payload group, or an acquired `buildings` / `vegetation` /
 * `groundMaterials` object — is hashed from its JSON text, exactly as it will
 * be read, so two runs handed the same content share a site, while a NEW
 * input map with different content does not, and neither does a map the
 * caller changed in place (the memo checks a content fingerprint). An
 * acquisition result contributes its site content only
 * ({@link acquisitionContent}), so a second fetch of the same site gives the
 * same key and the same `siteIdentity` (D187). The
 * family is the polygon, the preset's three metre scalars, the terrain
 * margin, the tile cap and the wind datum: everything `composeTiles` and the drop to grade read. `undefined` when the
 * realm has no SHA-256 (the same runtimes that get no geometry reuse), in
 * which case the site is built uncached.
 *
 * `legacy` gives the key of 0.12.13-next.17 and older, which hashed each
 * acquisition result WHOLE, per-fetch fields included. Only a retry of a
 * schedule those versions saved asks for it (`planning.ts`).
 */
export async function preparedSiteKey(inputs, texts, legacy = false) {
    const { payload, options, polygon, config } = inputs;
    // The third field names the inner document an acquisition result hands to
    // the site (`plan-layers.ts` `acquiredLayer`); it changes only which text is
    // kept for the constructor, never the key.
    const sources = [
        ...GROUP_KEYS.map((key) => [key, payload[key], undefined]),
        ["buildings", options.buildings, undefined],
        ["vegetation", options.vegetation, "features"],
        ["groundMaterials", options.groundMaterials, "layers"],
    ];
    const parts = [legacy ? "prepared-site-v1" : "prepared-site-v2"];
    for (const [name, given, inner] of sources) {
        if (given === undefined)
            continue;
        const content = legacy ? undefined : acquisitionContent(name, given, inner);
        // Buildings reach the site re-anchored and packed, never as this text.
        const keep = name === "buildings" || name === "geometries" || name === "context-geometry"
            ? undefined : texts;
        const digest = content === undefined
            ? await sourceDigest(given, inner, keep)
            : await sourceDigest(content.document, undefined, keep);
        if (digest === undefined)
            return undefined;
        parts.push(`${name}=${digest}`);
        if (content !== undefined)
            parts.push(`${name}:meta=${content.meta}`);
    }
    parts.push(JSON.stringify(polygon), String(config.inferenceSizeM), String(config.contextSizeM), String(config.stepM), String(inputs.terrainContextMarginM), String(options.maxTilesOverride), String(inputs.grade));
    return parts.join("\n");
}
/** The site stage of `planAreaSubmission`: layers, compose, checks. */
export async function buildPreparedSite(inputs, analysisType, tiles, slice, texts, terrain) {
    const { payload, options, polygon } = inputs;
    // D91: the wind family's datum, applied before the compose cuts the site
    // into tiles, so no tile ever runs the pass.
    const groups = dropSiteToGrade(geometryGroups(payload, options, polygon, [analysisType]), inputs.grade);
    const { composed, site } = await composeTiles(groups, tiles, polygon, {
        analysisType, terrainContextMarginM: inputs.terrainContextMarginM,
        // A binary run encodes artifacts from the kernel site (WS2, D136); a
        // facade run plans its batches and writes its bodies from it
        // (`area/site-facade.ts`).
        keepKernelSite: areaTransport(options, analysisType) === "binary"
            || payload["analysis-surfaces"] != null,
        ...(texts === undefined ? {} : { texts }),
        ...(terrain === undefined ? {} : { terrain }),
    }, slice);
    rejectFullyDroppedTargets(groups, site);
    return { composed, answers: site };
}
function abortReason(signal) {
    return signal.reason ?? new DOMException("aborted", "AbortError");
}
/** Bounded, realm-local, single-flight. */
export class PreparedSiteCache {
    maxSites;
    sites = new Map();
    constructor(maxSites = MAX_SITES) {
        this.maxSites = maxSites;
    }
    /**
     * The site under `key`, built by `build` when no caller has built it yet.
     *
     * A caller that arrives while a build is in flight awaits that build. If the
     * build fails, the failure is the builder's own — its stop signal, or an
     * input it alone reported — so a waiter that was not itself stopped builds
     * for itself rather than inherit it.
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
/** The realm's prepared sites. */
export function preparedSites() {
    return shared;
}
/**
 * Release every prepared site this realm holds; returns how many it held.
 *
 * A long-lived process that has finished with a site can drop tens of
 * megabytes here instead of waiting for the byte bound to evict them. The
 * next `runArea` on that site prepares it again.
 */
export function freePreparedSites() {
    return shared.clear();
}
