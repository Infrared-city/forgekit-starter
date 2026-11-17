import { kernelSite, release } from "./site-kernel.js";
import { requireCore } from "../internal/core.js";
import { poolCall, poolCallSync } from "../internal/pool-task.js";
import { facadeFramesCall } from "./site-facade-calls.js";
import { mapFacadeScenes } from "./site-facade-scene.js";
/** The arena's slot order: the five wire groups a tile body can carry. */
export const ARENA_GROUPS = [
    "geometries", "context-geometry", "ground-geometry", "vegetation", "ground-materials",
];
/** The site, answered for every tile, held as plain JavaScript. */
export class SiteAssignment {
    tiles;
    arena;
    present;
    carried;
    inner;
    inputs;
    artifacts = new Map();
    /** The kernel's warning for the context hole (D293). */ contextWarning;
    /** Point trees without z when the site has terrain, else 0. */ treesWithoutZ = 0;
    constructor(tiles, 
    /** Every tile's bodies; read on the first ask when the kernel site is kept. */
    arena, present, 
    /** The groups the run carries, in the caller's order (the body's order). */
    carried, 
    /** The kept kernel site, or `undefined` where the realm cannot free it later. */
    inner, 
    /** What to read the site from again, only when no kernel site is kept. */
    inputs) {
        this.tiles = tiles;
        this.arena = arena;
        this.present = present;
        this.carried = carried;
        this.inner = inner;
        this.inputs = inputs;
    }
    /**
     * Keep the kernel site from now on, reading it once more when a JSON run
     * built this answer without it. A facade run asks the kept site for its
     * batches and its selected bodies (`area/site-facade.ts`).
     */
    keepKernel() {
        if (this.inner !== undefined)
            return true;
        if (release === undefined || this.inputs === undefined)
            return false;
        this.inner = kernelSite(this.inputs);
        release.register(this, this.inner);
        this.inputs = undefined;
        return true;
    }
    shareFacadeParts(analyses) { this.inner?.shareFacadeParts(analyses); }
    /** Run `use` on the kept kernel site, or on a fresh read that is freed after. */
    withKernel(use) {
        const inner = this.inner ?? kernelSite(this.inputs);
        try {
            return use(inner);
        }
        finally {
            if (this.inner === undefined)
                inner.free();
        }
    }
    /**
     * Read the site once: the kernel prepares every layer in one crossing and
     * answers the membership and the bodies from them.
     *
     * `keepKernelSite`: a BINARY run keeps the kernel site for the artifacts it will encode at
     * submit time, and a FACADE run for its batches and bodies (`area/site-facade.ts`), freed
     * with this object. A grid JSON run frees it before this returns — a run that never encodes
     * holds no wasm memory. A realm without `FinalizationRegistry` always frees it here.
     */
    static read(groups, tiles, polygon, analysisType, terrainContextMarginM, keepKernelSite = false, texts, terrain, contextReachM, contextBufferM) {
        // The plan's own terrain handle (D200) stays with the inputs, so a later
        // re-read of this site reads the same terrain.
        const inputs = {
            groups, tiles, polygon, analysisType, terrainContextMarginM, contextReachM, contextBufferM,
            ...(terrain === undefined ? {} : { terrain }),
        };
        // `texts` is used for this read only; `inputs`, kept for a later re-read,
        // never holds it.
        const inner = kernelSite(inputs, texts);
        let kept = false;
        try {
            const answers = JSON.parse(inner.allTileIds()).map((ids) => ({
                members: ids.members, core: ids.core, shrinkBand: ids.shrink_band,
                demoted: ids.demoted, context: ids.context,
            }));
            const present = new Set(ARENA_GROUPS.filter((group) => groups[group] !== undefined));
            const carried = Object.keys(groups).filter((group) => present.has(group));
            const keep = keepKernelSite && release !== undefined;
            // A kept site writes the bodies when a tile's group is first asked for:
            // a facade run never asks (`area/site-facade.ts`).
            const site = keep
                ? new SiteAssignment(answers, undefined, present, carried, inner, undefined)
                : new SiteAssignment(answers, inner.bodies(0, tiles.length), present, carried, undefined, inputs);
            site.contextWarning = inner.contextWarning();
            site.treesWithoutZ = inner.treesWithoutZ();
            if (keep && release !== undefined) {
                release.register(site, inner);
                kept = true;
            }
            return site;
        }
        finally {
            if (!kept)
                inner.free();
        }
    }
    /** One tile's group, or `undefined` when the run does not carry it. */
    group(tile, name) {
        if (!this.present.has(name))
            return undefined;
        const arena = this.arena ??= this.withKernel((inner) => inner.bodies(0, this.tiles.length));
        const slot = tile * ARENA_GROUPS.length + ARENA_GROUPS.indexOf(name);
        const hash = arena.hashes[slot];
        return {
            bytes: arena.bytes.subarray(arena.offsets[slot], arena.offsets[slot + 1]),
            hash: hash === "" ? undefined : hash,
        };
    }
    /**
     * Every tile's presence mask (bit `i` for `ARENA_GROUPS[i]`: carried AND not
     * empty) and its `geometries` / `context-geometry` group hashes, two per
     * tile, `""` for none, without writing a body. Read once and kept.
     */
    identity() {
        return this.#identity ??= this.withKernel((inner) => inner.identity(0, this.tiles.length));
    }
    #identity;
    /**
     * One tile's artifact (D101), encoded on the first ask for THAT tile and
     * kept: one kernel crossing per tile (#816, D277), so the first job uploads
     * after its own encode, not after the encode of every tile. Never a facade
     * batch's (D156).
     */
    tileArtifact(index, limits) {
        if (!Number.isSafeInteger(index) || index < 0 || index >= this.tiles.length) {
            throw new RangeError(`tile index ${index} is outside the site`);
        }
        const key = [limits.maxGeometryBytes, limits.maxMetadataBytes,
            limits.maxMeshes, limits.maxInstances].join("\n");
        let tiles = this.artifacts.get(key);
        if (tiles === undefined) {
            tiles = new Map();
            this.artifacts.set(key, tiles);
        }
        let artifact = tiles.get(index);
        if (artifact === undefined) {
            const encoding = this.encode(index, limits);
            artifact = encoding;
            tiles.set(index, encoding);
            // A failed encode is not kept: the next ask encodes again, as before.
            encoding.catch(() => { if (tiles.get(index) === encoding)
                tiles.delete(index); });
        }
        return artifact;
    }
    /**
     * The parts of every facade batch of tile `index`, from ONE kernel call
     * that builds the tile once (`Site.facadeFrames`, WP3): the batch's targets
     * in `geometries`, the rest of the tile in `context-geometry` (D156).
     * Nothing is kept here — `area/site-facade.ts` hands each part out once.
     */
    facadeFrames(index, batches, parts) {
        const call = facadeFramesCall((use) => this.withKernel(use), index, batches, parts);
        return poolCall(call.start, call.end);
    }
    /** The bodies of `batches`, now: a JSON body is read synchronously (blocks in the threaded core). */
    facadeBodies(index, batches) {
        const call = facadeFramesCall((use) => this.withKernel(use), index, batches, { body: true });
        return poolCallSync(call.start, call.end);
    }
    /**
     * One tile's facade scenes (#602): one shared frame for every batch of
     * `batches`, and each batch's job as a range into it, or its own frame.
     * `site-facade-scene.ts` shapes the kernel's raw answer.
     */
    async facadeScenes(index, batches, limits) {
        const raw = await poolCall(() => this.withKernel((inner) => inner.facadeScenesStart(Uint32Array.from(batches, () => index), Uint32Array.from(batches, (ids) => ids.length), batches.flatMap((ids) => [...ids]), BigInt(limits.maxGeometryBytes), limits.maxMetadataBytes, BigInt(limits.maxMeshes), BigInt(limits.maxInstances))), (task) => requireCore().Site.facadeScenesEnd(task));
        return mapFacadeScenes(raw);
    }
    async encode(index, limits) {
        const encoded = await poolCall(() => this.withKernel((inner) => inner.artifactsStart(index, index + 1, BigInt(limits.maxGeometryBytes), limits.maxMetadataBytes, BigInt(limits.maxMeshes), BigInt(limits.maxInstances))), (task) => requireCore().Site.artifactsEnd(task));
        return {
            archive: encoded.bytes.subarray(encoded.offsets[0], encoded.offsets[1]),
            artifactDigest: encoded.artifactDigests[0],
            geometryContentDigest: encoded.contentDigests[0],
            encoding: encoded.encodings[0],
        };
    }
}
