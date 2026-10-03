import { KernelGroup } from "../internal/kernel-group.js";
import { ARENA_GROUPS } from "./site-assign.js";
import { pickSceneArtifact } from "./site-facade-scene-frames.js";
/**
 * A retry's saved batches, every tile's, so ownership is seeded from all. In
 * the schedule's own order: the kernel puts them in their one order and
 * refuses a key outside the `<tile>` / `<tile>#batch<n>` format (D160).
 */
function savedBatches(schedule, tiles) {
    const index = new Map(tiles.map((tile, position) => [tile.tileId, position]));
    const records = [];
    for (const [key, activeIds] of Object.entries(schedule.batchMembership ?? {})) {
        const tileId = key.split("#batch")[0] ?? key;
        const tileIndex = index.get(tileId);
        if (tileIndex === undefined)
            throw new Error(`retry schedule batch ${key} names no tile of this grid`);
        const count = schedule.batchSensorCounts?.[key];
        records.push({
            tile_index: tileIndex, key, active_ids: [...activeIds],
            ...(count === undefined ? {} : { sensor_count: count }),
        });
    }
    return records;
}
/** The wire fields the caller may set, and the kernel request key of each. */
const CALLER_FIELDS = [
    ["surface-grid-size", "grid_size"],
    ["surface-offset", "offset"],
    ["partial-cells", "partial_cells"],
    ["min-coverage", "min_coverage"],
    // #555: the plan counts with the same cleaning the server runs.
    ["mesh-cleaning", "mesh_cleaning"],
];
/**
 * The kernel request for this run: only what the caller set, and a retry's
 * saved batches. The kernel parser owns every default and type check (D160),
 * the same rule the Python host sends to (`_area/_native_facade_plan.py`).
 */
export function facadeRequest(payload, tiles, retryFrom, maxSensorsPerJob) {
    const request = {
        policy_version: 2,
        mode: payload["analysis-surfaces"],
        auto_align: payload["terrain-alignment"] === "auto-align",
    };
    for (const [wire, key] of CALLER_FIELDS) {
        if (payload[wire] !== undefined && payload[wire] !== null)
            request[key] = payload[wire];
    }
    request.saved = retryFrom === undefined ? null : savedBatches(retryFrom, tiles);
    if (maxSensorsPerJob !== undefined)
        request.max_sensors_per_job = maxSensorsPerJob;
    return request;
}
/** Fresh plans by request, per site answer: the preview's plan serves the run. */
const plans = new WeakMap();
const MAX_PLANS = 4;
function kernelOf(site) {
    if (site.withKernel === undefined)
        throw new Error("facade planning needs the kernel site");
    site.keepKernel?.();
    return site;
}
/**
 * Every tile's batches in `selected`, one kernel call per tile with the
 * thread handed back between them. A fresh plan (no saved batches) is a pure
 * function of the site and the request, so it is kept on the site answer and
 * a run after its preview does not count the sensors a second time.
 */
export async function planFacadeRecords(site, tileCount, selected, request, slice) {
    const text = JSON.stringify(request);
    const fresh = request.saved === null;
    const byRequest = plans.get(site) ?? new Map();
    const kept = fresh ? byRequest.get(text) : undefined;
    const out = new Map();
    if (kept !== undefined) {
        for (const index of selected)
            out.set(index, kept[index] ?? []);
        return out;
    }
    const kernel = kernelOf(site);
    const all = [];
    const every = fresh && selected.size === tileCount;
    for (let index = 0; index < tileCount; index += 1) {
        if (!selected.has(index))
            continue;
        await slice.tick();
        const records = JSON.parse(kernel.withKernel((inner) => inner.facadeBatches(index, index + 1, text)));
        out.set(index, records);
        all[index] = records;
    }
    if (every) {
        byRequest.set(text, all);
        for (const key of byRequest.keys()) {
            if (byRequest.size <= MAX_PLANS)
                break;
            if (key !== text)
                byRequest.delete(key);
        }
        plans.set(site, byRequest);
    }
    return out;
}
const TARGET_GROUPS = new Set(["geometries", "context-geometry"]);
/**
 * One tile's facade batches, answered by the kernel in ONE call per part
 * (`Site.facadeFrames`): the call builds the tile once for all of its
 * batches. The first ask of a part writes that part for every batch of the
 * tile.
 *
 * Bodies are kept: a job's body is read again by the reuse path. The tile's
 * terrain, trees and ground materials are the same in every batch of the
 * tile, so they are kept once. A capture or an artifact is handed out once
 * and dropped; a second ask for the same batch writes it again, alone.
 */
class TileFrames {
    site;
    tile;
    records;
    shared = new Map();
    written;
    handed = new Map();
    /** Scene-mode (#602) answers, by limits key, handed out once like `handed`. */
    scenes = new Map();
    /** Keys `scenes` already fetched the full `wanted` list for once (#602 review). */
    scenesFetched = new Set();
    /** The batches the plan submits, by index: only these are written ahead. */
    wanted;
    constructor(site, tile, records, submits) {
        this.site = site;
        this.tile = tile;
        this.records = records;
        this.wanted = records.flatMap((record, at) => (submits(record) ? [at] : []));
    }
    batch(index, group) {
        if (this.written?.[index] !== undefined)
            return this.read(index, group);
        // Every body the plan submits, in one call; a batch outside the plan
        // (asked for its tile groups only) is written alone.
        const indices = this.wanted.includes(index) ? this.wanted : [index];
        const answered = this.frames(indices, { body: true });
        this.written ??= [];
        for (const [at, frame] of answered.entries()) {
            if (this.written[indices[at]] !== undefined)
                continue;
            this.written[indices[at]] = this.texts(frame);
        }
        return this.read(index, group);
    }
    read(index, group) {
        const texts = this.written[index];
        if (texts instanceof Error)
            throw texts;
        if (TARGET_GROUPS.has(group))
            return texts.get(group);
        return this.shared.get(group);
    }
    texts(frame) {
        if (frame.error !== undefined)
            return new Error(frame.error);
        const arena = frame.body;
        const texts = new Map();
        for (const [slot, name] of ARENA_GROUPS.entries()) {
            const start = arena.offsets[slot];
            const end = arena.offsets[slot + 1];
            if (!TARGET_GROUPS.has(name) && this.shared.has(name))
                continue;
            const hash = arena.hashes[slot];
            const text = end > start
                ? { bytes: arena.bytes.slice(start, end), hash: hash === "" ? undefined : hash }
                : { bytes: new TextEncoder().encode("{}"), hash: undefined };
            if (TARGET_GROUPS.has(name))
                texts.set(name, text);
            else
                this.shared.set(name, text);
        }
        return texts;
    }
    tileGroup(group) {
        if (!this.shared.has(group))
            this.batch(this.wanted[0] ?? 0, group);
        return this.shared.get(group);
    }
    capture(index, alignment) {
        return this.once(index, `capture\n${alignment}`, { capture: { alignment } }).capture;
    }
    /**
     * The batch's binary artifact. With `limits.facadeTargets` (#602), scene
     * mode: the tile's jobs share ONE uploaded scene and each carries its own
     * target range. Without it (an old server, no `facadeTargets`), one
     * artifact per batch, as before.
     */
    artifact(index, boxTrees, limits) {
        if ((limits.facadeTargets ?? 0) >= 1)
            return this.sceneArtifact(index, boxTrees, limits);
        const key = ["artifact", boxTrees, limits.maxGeometryBytes, limits.maxMetadataBytes,
            limits.maxMeshes, limits.maxInstances].join("\n");
        return this.once(index, key, { artifact: { boxTrees, limits } }).artifact;
    }
    /** Batch `index`'s facade-scene artifact (#602); the cache logic is
     * {@link pickSceneArtifact} (`site-facade-scene-frames.ts`). */
    sceneArtifact(index, boxTrees, limits) {
        const key = ["scene", boxTrees, limits.maxGeometryBytes, limits.maxMetadataBytes,
            limits.maxMeshes, limits.maxInstances].join("\n");
        return pickSceneArtifact(this.scenes, this.scenesFetched, key, this.wanted, index, (indices) => this.scenesFor(indices, boxTrees, limits));
    }
    /** One `facadeScenes` call over `indices`, mapped to this batch's artifact.
     * A tile answer is uniform (D218): every job `targets` (scene), every job
     * `artifact` (boxed trees, D70), or every job `error` (a refusal). The
     * first job's shape decides which of the three this answer is. */
    scenesFor(indices, boxTrees, limits) {
        if (this.site.facadeScenes === undefined)
            throw new Error("facade scenes need the kernel site");
        const active = indices.map((at) => this.records[at].active_ids);
        const answer = this.site.facadeScenes(this.tile, active, boxTrees, limits);
        const out = new Map();
        if (answer.jobs[0]?.error !== undefined) {
            indices.forEach((at, position) => out.set(at, new Error(answer.jobs[position].error)));
            return out;
        }
        if (answer.jobs[0]?.targets !== undefined) {
            const scene = answer.scenes[0];
            indices.forEach((at, position) => {
                const job = answer.jobs[position];
                out.set(at, {
                    archive: scene.archive, artifactDigest: scene.artifactDigest,
                    geometryContentDigest: scene.geometryContentDigest, encoding: scene.encoding,
                    targetIds: job.targetIds ?? [], targets: { start: job.targets.start, count: job.targets.count },
                    ...(scene.treeBoxes === undefined ? {} : { treeBoxes: scene.treeBoxes }),
                });
            });
            return out;
        }
        indices.forEach((at, position) => out.set(at, answer.jobs[position].artifact));
        return out;
    }
    /**
     * Batch `index`'s part under `key`. The first ask writes it for every
     * batch of the tile that the plan submits (a retry's other batches are not
     * written); each is handed out once and then dropped, so an artifact or a
     * capture is not kept after its job took it. What a stopped run leaves is
     * at most the untaken parts of the tiles it had started.
     */
    once(index, key, parts) {
        let ready = this.handed.get(key);
        if (ready === undefined && this.wanted.includes(index)) {
            const wanted = this.wanted;
            ready = new Map(this.frames(wanted, parts).map((frame, at) => [wanted[at], frame]));
            this.handed.set(key, ready);
        }
        let frame = ready?.get(index);
        if (frame === undefined)
            frame = this.frames([index], parts)[0];
        ready?.delete(index);
        if (ready?.size === 0)
            this.handed.delete(key);
        if (frame.error !== undefined)
            throw new Error(frame.error);
        return frame;
    }
    frames(indices, parts) {
        if (this.site.facadeFrames === undefined)
            throw new Error("facade jobs need the kernel site");
        return this.site.facadeFrames(this.tile, indices.map((at) => this.records[at].active_ids), parts);
    }
}
/** The body order: the payload's fields, the carried groups, the location. */
export function facadeTileBase(base, carried, location) {
    const value = { ...base };
    // A placeholder keeps each carried group at its place in the key order; every
    // batch sets it.
    for (const group of carried)
        value[group] = undefined;
    if (location !== undefined) {
        value.latitude = location.latitude;
        value.longitude = location.longitude;
    }
    return value;
}
/**
 * One tile's facade jobs from the kernel's records: the key, the targets, the
 * sensor count, and a body whose groups the kernel writes when it is sent.
 *
 * `value` is {@link facadeTileBase}. `present` is the tile's mask from
 * `Site.identity` (bit `i` for `ARENA_GROUPS[i]`): which tile-level groups
 * hold anything, known without writing a body.
 */
export function facadeBatchesForTile(value, tileId, tileIndex, records, site, answer, present, 
/** Whether the plan submits a batch; a retry submits only some. */
submits = () => true) {
    if (records.length === 0)
        return [];
    // The per-request terrain cap, before any job exists: the body that would
    // carry it is written only at submission.
    site.withKernel((inner) => inner.checkTerrain(tileIndex, tileIndex + 1));
    const bodies = new TileFrames(site, tileIndex, records, submits);
    const carried = site.carried ?? [];
    const tileGroups = new Map();
    for (const [slot, group] of ARENA_GROUPS.entries()) {
        if (TARGET_GROUPS.has(group) || !carried.includes(group))
            continue;
        tileGroups.set(group, new KernelGroup(() => bodies.tileGroup(group), (present & (1 << slot)) === 0));
    }
    return records.map((record, index) => {
        const count = record.sensor_count;
        if (count === null || !Number.isSafeInteger(count) || count < 1)
            throw new Error("invalid exact sensor count");
        if (record.active_ids.length === 0)
            throw new Error(`exact batch membership does not match tile ${tileId}`);
        const payload = { ...value };
        for (const [group, kernel] of tileGroups)
            payload[group] = kernel;
        payload.geometries = new KernelGroup(() => bodies.batch(index, "geometries"), false, record.active_ids);
        // Context: the tile's occluders and every member this batch does not analyse.
        const moved = answer.members.length > record.active_ids.length;
        payload["context-geometry"] = new KernelGroup(() => bodies.batch(index, "context-geometry"), !(answer.context.length > 0 || moved));
        return {
            key: record.key,
            buildingIds: [...record.active_ids], sensorCount: count, payload,
            capture: (alignment) => bodies.capture(index, alignment),
            ...(site.facadeFrames === undefined ? {} : {
                artifact: (boxTrees, limits) => bodies.artifact(index, boxTrees, limits),
            }),
        };
    });
}
