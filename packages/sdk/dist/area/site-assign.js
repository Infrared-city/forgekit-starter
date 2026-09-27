import { kernelSite, release } from "./site-kernel.js";
/** The arena's slot order: the five wire groups a tile body can carry. */
export const ARENA_GROUPS = [
    "geometries", "context-geometry", "ground-geometry", "vegetation", "ground-materials",
];
/** The site, answered for every tile, held as plain JavaScript. */
export class SiteAssignment {
    tiles;
    unowned;
    arena;
    present;
    carried;
    inner;
    inputs;
    artifacts = new Map();
    constructor(tiles, unowned, 
    /** Every tile's bodies; read on the first ask when the kernel site is kept. */
    arena, present, 
    /** The groups the run carries, in the caller's order (the body's order). */
    carried, 
    /** The kept kernel site, or `undefined` where the realm cannot free it later. */
    inner, 
    /** What to read the site from again, only when no kernel site is kept. */
    inputs) {
        this.tiles = tiles;
        this.unowned = unowned;
        this.arena = arena;
        this.present = present;
        this.carried = carried;
        this.inner = inner;
        this.inputs = inputs;
    }
    /**
     * Keep the kernel site from now on, reading it once more when a JSON run
     * built this answer without it. A facade run asks the kept site for its
     * batches and its selected bodies (`area/site-facade.ts`), as the Python
     * host does.
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
     * `keepKernelSite`: a BINARY run keeps the kernel site for the artifacts
     * it will encode at submit time, and a FACADE run for its batches and
     * bodies (`area/site-facade.ts`), freed with this object. A grid JSON run
     * frees it before this returns — its bodies are JavaScript-owned copies
     * already — so a run that never encodes holds no wasm memory, as before
     * WS2; a later binary or facade run on the same prepared site reads the
     * site again. A realm without
     * `FinalizationRegistry` always takes that second path.
     */
    static read(groups, tiles, polygon, analysisType, terrainContextMarginM, keepKernelSite = false, texts) {
        const inputs = { groups, tiles, polygon, analysisType, terrainContextMarginM };
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
                ? new SiteAssignment(answers, inner.unowned(), undefined, present, carried, inner, undefined)
                : new SiteAssignment(answers, inner.unowned(), inner.bodies(0, tiles.length), present, carried, undefined, inputs);
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
     * Every tile's presence mask (bit `i` for `ARENA_GROUPS[i]`, set when the
     * tile carries the group AND it holds something) and its `geometries` /
     * `context-geometry` group hashes, two per tile, `""` for none — without
     * writing a body. Read once and kept.
     */
    identity() {
        return this.#identity ??= this.withKernel((inner) => inner.identity(0, this.tiles.length));
    }
    #identity;
    /**
     * One tile's artifact (D101). The first ask under a given capability answer
     * — whether the trees are boxed, and the four limits — encodes every tile in
     * one crossing from the kept kernel site; the archives are kept, so the
     * tiles of a family's repeat run share them. Never a facade batch's (D156).
     */
    tileArtifact(index, boxTrees, limits) {
        const key = [boxTrees, limits.maxGeometryBytes, limits.maxMetadataBytes,
            limits.maxMeshes, limits.maxInstances].join("\n");
        let tiles = this.artifacts.get(key);
        if (tiles === undefined) {
            tiles = this.encode(boxTrees, limits);
            this.artifacts.set(key, tiles);
        }
        const artifact = tiles[index];
        if (artifact === undefined)
            throw new RangeError(`tile index ${index} is outside the site`);
        return artifact;
    }
    /**
     * The parts of every facade batch of tile `index`, from ONE kernel call
     * that builds the tile once (`Site.facadeFrames`, WP3). The artifact is the
     * SAME kernel selection the Python host uploads (D156): the batch's targets
     * in `geometries`, the rest of the tile in `context-geometry`. Nothing is
     * kept here — `area/site-facade.ts` hands each part out once.
     */
    facadeFrames(index, batches, parts) {
        const limits = parts.artifact?.limits;
        const raw = this.withKernel((inner) => inner.facadeFrames(Uint32Array.from(batches, () => index), Uint32Array.from(batches, (ids) => ids.length), batches.flatMap((ids) => [...ids]), parts.body === true, false, parts.capture !== undefined, parts.capture?.alignment ?? undefined, parts.artifact !== undefined, parts.artifact?.boxTrees ?? false, BigInt(limits?.maxGeometryBytes ?? 0), limits?.maxMetadataBytes ?? 0, BigInt(limits?.maxMeshes ?? 0), BigInt(limits?.maxInstances ?? 0)));
        return raw.map((frame) => {
            if (frame.error !== undefined)
                return { error: frame.error };
            const { body, capture, artifact } = frame;
            const counts = artifact === undefined ? null : JSON.parse(artifact.treeBoxes);
            return {
                ...(body === undefined ? {} : { body }),
                ...(capture === undefined ? {} : { capture }),
                ...(artifact === undefined ? {} : {
                    artifact: {
                        archive: artifact.archive, artifactDigest: artifact.artifactDigest,
                        geometryContentDigest: artifact.contentDigest, encoding: artifact.encoding,
                        targetIds: artifact.targetIds,
                        ...(counts === null ? {} : { treeBoxes: counts }),
                    },
                }),
            };
        });
    }
    encode(boxTrees, limits) {
        const encoded = this.withKernel((inner) => inner.artifacts(0, this.tiles.length, boxTrees, BigInt(limits.maxGeometryBytes), limits.maxMetadataBytes, BigInt(limits.maxMeshes), BigInt(limits.maxInstances)));
        const boxes = JSON.parse(encoded.treeBoxes);
        return encoded.artifactDigests.map((artifactDigest, index) => {
            const counts = boxes[index];
            return {
                archive: encoded.bytes.subarray(encoded.offsets[index], encoded.offsets[index + 1]),
                artifactDigest,
                geometryContentDigest: encoded.contentDigests[index],
                encoding: encoded.encodings[index],
                ...(counts === null || counts === undefined ? {} : { treeBoxes: counts }),
            };
        });
    }
}
