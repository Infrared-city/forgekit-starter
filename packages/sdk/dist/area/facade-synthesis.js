/**
 * Facade "pretty mode": the per-cell render geometry is SYNTHESIZED here, by
 * the kernel this SDK already bundles, instead of being downloaded (ADR 0008).
 *
 * `cell-tris` measured 12.6x the rest of a facade body (+214 MB on the 66-job
 * F3 scene, 18.4 MB -> 232 MB). The same `synthesizeSurfaces` the server runs
 * ships in the wasm bundle, so a client that still holds the geometry it
 * submitted can draw the identical shapes for free. The SDK therefore never
 * asks the server to render them (`area/payload.ts` pins `emit-cell-tris` to
 * false on every `analysis-surfaces` request) and a caller who asks for
 * triangles gets locally synthesized ones.
 *
 * It never trusts its own output. `sensor_layout_hash` names the sensor SET
 * AND ITS ORDER; the response carries the server`s. Equal => the values line
 * up cell for cell, attach. Different, missing, or an incomplete `synth-params`
 * echo => attach NOTHING and say so once. A silent mismatch would colour every
 * patch from a plausible neighbour with nothing anywhere to catch it, so
 * "draw nothing" is the only safe fallback; the request never changes shape.
 */
import { requireCore } from "../internal/core.js";
import { frameViews, layoutRecord } from "./facade-layout.js";
const ECHO_KEYS = [
    "mode", "grid-size", "offset", "max-sensors",
    "partial-cells", "min-coverage", "emit-cell-tris", "surfgrid-version",
];
const MODES = new Set(["facades", "roofs", "all"]);
/** Python's `cache.py` bound, kept for parity. See `docs/DEVIATIONS.md` D88. */
const DEFAULT_CACHE_BYTES = 256 * 1024 * 1024;
function echoFrom(raw) {
    if (raw === null || typeof raw !== "object")
        return undefined;
    const echo = raw;
    if (ECHO_KEYS.some((key) => !(key in echo)))
        return undefined;
    const mode = echo.mode;
    if (typeof mode !== "string" || !MODES.has(mode))
        return undefined;
    const numbers = ["grid-size", "offset", "min-coverage"].map((key) => Number(echo[key]));
    if (numbers.some((value) => !Number.isFinite(value)))
        return undefined;
    const maxSensors = Number(echo["max-sensors"]);
    if (!Number.isSafeInteger(maxSensors) || maxSensors < 0)
        return undefined;
    return {
        mode,
        gridSize: numbers[0], offset: numbers[1], minCoverage: numbers[2],
        maxSensors: BigInt(maxSensors),
        partialCells: Boolean(echo["partial-cells"]),
    };
}
/** One client's captured facade inputs and its synthesized layouts. */
export class FacadeSynthesisStore {
    maxBytes;
    inputs = new Map();
    /** Insertion-ordered: a `Map` is an LRU once a hit re-inserts its key. */
    layouts = new Map();
    retained = 0;
    hits = 0;
    misses = 0;
    constructor(maxBytes = DEFAULT_CACHE_BYTES) {
        this.maxBytes = maxBytes;
    }
    /**
     * Retain one accepted job's inputs. Two places release them, and between
     * them they cover every accepted job: `take` on the merge that uses one, and
     * `forget` for the rest — the merge releases the whole schedule it finished
     * (its failed jobs included), and a submission that aborts releases what it
     * captured before the abort. A capture no release path reaches would be held
     * for the life of the client.
     */
    remember(jobId, input) {
        this.inputs.set(jobId, input);
    }
    take(jobId) {
        const input = this.inputs.get(jobId);
        this.inputs.delete(jobId);
        return input;
    }
    /** Release a capture no merge will ever consume. */
    forget(jobId) {
        this.inputs.delete(jobId);
    }
    get pendingCount() { return this.inputs.size; }
    get retainedBytes() { return this.retained; }
    /** Hits and misses since this client was built. A cache that never hits is
     * indistinguishable from one that was never built, so it is countable: the
     * F3 scene's layouts are 935 MB against the 256 MiB bound and score zero
     * (`docs/DEVIATIONS.md` D88). */
    get stats() {
        return { hits: this.hits, misses: this.misses };
    }
    /** A retained layout, counted as a hit (and made the most recent), or nothing. */
    lookup(key) {
        const record = this.layouts.get(key);
        if (record === undefined)
            return undefined;
        this.hits += 1;
        this.layouts.delete(key);
        this.layouts.set(key, record);
        return record;
    }
    /** Count one synthesized layout as a miss and retain it when it fits the bound. */
    retain(key, record) {
        this.misses += 1;
        if (this.maxBytes <= 0 || record.bytes > this.maxBytes)
            return;
        while (this.layouts.size > 0 && this.retained + record.bytes > this.maxBytes) {
            const [oldest, evicted] = this.layouts.entries().next().value;
            this.layouts.delete(oldest);
            this.retained -= evicted.bytes;
        }
        this.layouts.set(key, record);
        this.retained += record.bytes;
    }
}
/** The response with its BULK removed, carrying the identity fields VERBATIM.
 *
 * `decodeSurfaceIdentity` deserialises a whole response to read three root
 * fields, and a facade response is megabytes of surfaces. Verbatim is the
 * point: whatever the server sent reaches the reader unaltered, so the
 * leniency contract is the one a full parse would have applied.
 */
function identityProbe(response) {
    const probe = {
        surfaces: {}, aggregates: { buildings: {} },
        "min-legend": 0, "max-legend": 0, "sensor-count": 0,
    };
    for (const key of ["sensor-layout-hash", "geometry-hashes", "synth-params"]) {
        if (key in response)
            probe[key] = response[key];
    }
    return JSON.stringify(probe);
}
/**
 * A surface result that says which requested triangles were not drawn, and
 * why. `fallbacks` holds the reasons `synthesizeSurfaceTriangles` refused.
 */
export function withCellTrisFallback(result, fallbacks) {
    return fallbacks.size === 0 ? result : { ...result, cellTrisFallback: [...fallbacks].sort() };
}
/**
 * Synthesize the `cell-tris` of every job of a merge and return them per
 * surface key. A job that fails any check gets nothing and says why, once.
 *
 * Every layout the retained cache does not hold comes from ONE kernel call
 * for each echoed parameter set (normally one per run):
 * `synthesizeSurfacesFromCaptures` reads the captures one at a time, shares
 * the terrain of consecutive captures of one tile, and hands each answer to
 * the callback, which keeps only the triangle buffers and the frames.
 *
 * Never throws: every failure is the untouched response, which is exactly the
 * behaviour that shipped before this module existed. `anchor` is the tile`s
 * SW offset — the triangles stay in the kernel's tile-local f64-safe frame and
 * carry it, rather than being narrowed onto global coordinates (root
 * `CLAUDE.md` rule 6; `docs/DEVIATIONS.md` D88).
 */
export function synthesizeSurfaceTriangles(store, jobs, logger, fallbacks) {
    const started = performance.now();
    const core = requireCore();
    const planned = [];
    const outcomes = new Map();
    const needed = new Map();
    for (const job of jobs) {
        // WARN, not info: every reason below means the caller asked for triangles
        // and is not getting them, which is degraded output an alert rule
        // selecting `warn` should see. The one case that is NOT a refusal —
        // nothing was captured, because this run never asked — says nothing at
        // all, or a default facade run would warn once per job about a feature it
        // declined.
        const fell = (reason, detail) => {
            // The server's own geometry is kept, so that one is not a refusal (as in Python).
            if (reason !== "already_present")
                fallbacks?.add(reason);
            logger.warn({ event: "facade_synthesis", outcome: "fell_back", reason, jobId: job.jobId,
                elapsedMs: Math.round(performance.now() - started), ...(detail === undefined ? {} : { detail }) });
            return undefined;
        };
        const input = store.take(job.jobId);
        if (input === undefined)
            continue;
        const surfaces = job.response.surfaces;
        if (surfaces === null || typeof surfaces !== "object") {
            fell("no_surfaces");
            continue;
        }
        if (Object.values(surfaces).some((grid) => grid["cell-tris"] != null)) {
            fell("already_present");
            continue;
        }
        let identity;
        try {
            identity = JSON.parse(core.decodeSurfaceIdentity(identityProbe(job.response)));
        }
        catch (error) {
            fell("no_hash", String(error).slice(0, 200));
            continue;
        }
        const serverHash = identity["sensor-layout-hash"];
        if (typeof serverHash !== "string" || serverHash.length === 0) {
            fell("no_hash");
            continue;
        }
        const echo = echoFrom(identity["synth-params"]);
        if (echo === undefined) {
            fell("no_echo");
            continue;
        }
        // No clipping ran, so no clipped geometry exists to reconstruct — the
        // server's own `cell-tris` would have been null too.
        if (!echo.partialCells) {
            fell("not_clipped");
            continue;
        }
        const keys = Object.keys(surfaces);
        const cacheKey = `${serverHash}:${JSON.stringify([...keys].sort())}`;
        planned.push({ job, keys, cacheKey, fell });
        if (outcomes.has(cacheKey) || needed.has(cacheKey))
            continue;
        const hit = store.lookup(cacheKey);
        if (hit !== undefined)
            outcomes.set(cacheKey, hit);
        else
            needed.set(cacheKey, { capture: input.capture, echo, serverHash });
    }
    synthesizeNeeded(store, needed, outcomes);
    const attached = new Map();
    for (const { job, keys, cacheKey, fell } of planned) {
        const views = attach(outcomes.get(cacheKey), job, keys, fell);
        if (views === undefined)
            continue;
        for (const [key, view] of views)
            attached.set(key, view);
        logger.info({ event: "facade_synthesis", outcome: "engaged", jobId: job.jobId,
            surfaces: views.size, elapsedMs: Math.round(performance.now() - started) });
    }
    return attached;
}
/** One kernel call for each echoed parameter set; each answer becomes an outcome. */
function synthesizeNeeded(store, needed, outcomes) {
    const groups = new Map();
    for (const entry of needed) {
        const { echo } = entry[1];
        const group = [echo.mode, echo.gridSize, echo.offset, echo.maxSensors, echo.partialCells, echo.minCoverage]
            .map(String).join("|");
        groups.set(group, [...(groups.get(group) ?? []), entry]);
    }
    const core = requireCore();
    for (const entries of groups.values()) {
        const { echo } = entries[0][1];
        try {
            // `emit_cell_tris` is forced ON whatever the server ran: it decides
            // whether triangles ride along, never which sensors exist or in what
            // order, which is why it is absent from `sensor_layout_hash`. The
            // kernel's capture reader decodes and merges the terrain (D20) and
            // seats the targets the way the server did, as for the Python host.
            core.synthesizeSurfacesFromCaptures(entries.map(([, need]) => need.capture), (index, answer) => {
                const [cacheKey, need] = entries[index];
                if (answer instanceof Error) {
                    outcomes.set(cacheKey, { reason: "synth_error", detail: String(answer).slice(0, 200) });
                    return;
                }
                const record = layoutRecord(answer, need.serverHash);
                if ("cellTris" in record)
                    store.retain(cacheKey, record);
                outcomes.set(cacheKey, record);
            }, echo.mode, echo.gridSize, echo.offset, echo.maxSensors, echo.partialCells, echo.minCoverage, true, true);
        }
        catch (error) {
            for (const [cacheKey] of entries) {
                if (!outcomes.has(cacheKey)) {
                    outcomes.set(cacheKey, { reason: "synth_error", detail: String(error).slice(0, 200) });
                }
            }
        }
    }
}
/** One job's views of its layout, or nothing (and why) when a frame does not fit. */
function attach(outcome, job, keys, fell) {
    if (!("cellTris" in outcome))
        return fell(outcome.reason, outcome.detail);
    const surfaces = job.response.surfaces;
    const views = new Map();
    for (const frame of outcome.frames) {
        if (!(frame.key in surfaces))
            return fell("frame_mismatch", frame.key);
        const view = frameViews(outcome, frame, job.anchor);
        if (view === undefined)
            return fell("frame_mismatch", frame.key);
        views.set(frame.key, view);
    }
    if (views.size !== keys.length)
        return fell("frame_mismatch");
    return views;
}
