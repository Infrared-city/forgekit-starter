// Maintainer note (not published): `synthesizeFacadeLayout`: rebuild a facade/roof sensor layout
// OFFLINE from the original inputs (#707) -- the same frames, canonical cell order and per-cell
// triangles a live area run's merge attaches today with `emitCellTris: true`, with
// `surfgridVersion` PINNED by the caller. Pure, no HTTP, no billing: it calls the same kernel
// bundled for everything else this SDK does offline (`cleanMesh`, `synthesizeSurfaces`).
//
// `FacadeLayout.toBytes()` / `FacadeLayout.fromBytes()` save and reload a layout WITHOUT the
// geometry (`docs/UPGRADING.md`, "Show facade results after a reload"): a full (unclipped)
// cell's triangles are a pure function of its frame, so they are never stored. `toBytes()`
// exports the SAME layout this object already holds -- it never re-synthesizes (issue #707
// "toBytes() crash", D254: a second synthesis just to export was the crash's root cause). Every
// path moves bulk numeric data as typed buffers (`Float64Array`/`Float32Array`/`Uint32Array`),
// never a JSON round trip -- see `docs/DEVIATIONS.md` D252/D254 for measured numbers.
//
// Scope (D252/D254): one job is the common, untiled case (every building in `buildings`, one
// job). A caller that tiled its own run either names each job's building ids and `tileOrigin` by
// hand in `jobs`, or -- infrared-core#725 -- passes that run's saved `AreaSchedule` as
// `schedule` and lets `facade-layout-schedule.ts` derive both from it.
import { requireCore, requireCoreMemory } from "../internal/core.js";
import { HandleGuard } from "./facade-layout-free.js";
import { jobSiteShifts, jobsFromSchedule, shiftJobToSiteFrame } from "./facade-layout-schedule.js";
import { buildRequest } from "./facade-layout-request.js";
import { jobFromRaw, materializeFields, rawFieldsStale } from "./facade-layout-raw.js";
/**
 * A rebuilt (or reloaded) facade or roof sensor layout.
 *
 * Build one with `synthesizeFacadeLayout` or reload one with
 * `FacadeLayout.fromBytes`. Call `free()` when finished with it in a
 * long-running process, or declare it with `using`.
 *
 * @category Facade layout
 */
// Maintainer note (not published): see the notes at the top of this file, and
// `facade-layout-free.ts` for the wasm handle's release (`free()`).
export class FacadeLayout {
    handle;
    fields;
    siteShiftByJobId;
    bytes;
    guard;
    constructor(handle, 
    // Read ONCE from `handle.fields()` by the caller (`fromBytes`/
    // `_fromHandle` below); every getter past this point (`jobs`,
    // `synthParams`, ...) reads `this.fields`, never `this.handle` directly
    // (`toBytes()` is the one exception -- see its own docs). Its bulk
    // numeric arrays (`points`, `normals`, `cellArea`, `cellTris`,
    // `cellTrisOffsets`) are zero-copy VIEWS onto the handle's own wasm
    // buffers (perf/ts-facade-layout-views), not independent copies, so
    // `this.fields` is reassigned twice more in this class's life: by
    // `refreshFieldsIfStale()` if a wasm memory grow detaches a view before
    // `free()`, and by `free()` itself, which snapshots real copies into it
    // right before releasing the handle so every getter keeps returning
    // correct data afterward (see `free()`'s docs).
    fields, bytes, 
    // Per-jobId SITE-frame anchor (infrared-core#725): applied lazily in
    // the `jobs` getter, never on `toBytes()` (always the kernel's own
    // held TILE-frame layout).
    siteShiftByJobId) {
        this.handle = handle;
        this.fields = fields;
        this.siteShiftByJobId = siteShiftByJobId;
        this.bytes = bytes;
        this.guard = new HandleGuard(this, handle);
    }
    /**
     * Release the memory this layout holds. Safe to call more than once. Every other member keeps
     * working after `free()`, except `toBytes()`: call it before `free()`, unless its result was
     * already cached by an earlier `toBytes()` call.
     *
     * `jobs` also keeps returning correct data after `free()`: its arrays are copied out of the
     * held memory once, at that moment. Arrays you already took from an earlier read of `jobs`
     * are independent and unaffected.
     */
    // Maintainer note (not published): releases the wasm handle (`docs/UPGRADING.md`, "Call
    // free() in long-running servers"); see the constructor's comments.
    // `jobs`' bulk arrays are zero-copy views onto the handle until this call
    // (perf/ts-facade-layout-views): `free()` snapshots (copies) every job's
    // `points`/`normals`/`cellArea`/`cellTris`/`cellTrisOffsets` into
    // independent arrays FIRST, then releases the handle -- so `jobs` keeps
    // returning correct data after `free()`, same as before this change, at
    // the cost of one copy made exactly once, here, instead of one made
    // eagerly at construction whether or not a caller ever reads `jobs`
    // again. A typed array a caller already extracted from an EARLIER `jobs`
    // read and is still holding is unaffected either way (it was already an
    // independent reference once returned -- only a live VIEW inside
    // `this.fields` needs this snapshot). The GC backstop
    // (`facade-layout-free.ts`) does NOT run this snapshot -- it frees the
    // handle directly, because nothing can still be reading `this.fields`
    // once this object itself is unreachable.
    free() {
        if (!this.guard.isFreed)
            this.fields = materializeFields(this.fields);
        this.guard.free();
    }
    /** Lets `using layout = synthesizeFacadeLayout(...)` call `free()` at the end of its scope. */
    // Maintainer note (not published): TS `esnext.disposable`, this package's own `lib` setting.
    [Symbol.dispose]() {
        this.free();
    }
    /**
     * Load a layout from the format `FacadeLayout.toBytes` produces.
     *
     * @param bytes - The bytes returned by `toBytes()`.
     * @param options - Pass `schedule`, the saved tiled run, when the bytes were exported from a
     * layout built from a `schedule`; the reloaded layout is then shifted into the site frame
     * exactly as the original was.
     * @returns The reloaded layout.
     */
    // Maintainer note (not published): `toBytes` round-trips the kernel's held TILE-frame layout
    // verbatim, so `options.schedule` applies the SAME per-job shift
    // `jobSiteShifts`/`shiftJobToSiteFrame` do (infrared-core#725 follow-up), or `attachValues`
    // refuses a reloaded tiled layout.
    static fromBytes(bytes, options) {
        const handle = requireCore("FacadeLayout.fromBytes").facadeLayoutFromBytes(bytes);
        const siteShiftByJobId = options?.schedule === undefined ? undefined : jobSiteShifts(options.schedule);
        return new FacadeLayout(handle, handle.fields(), bytes, siteShiftByJobId);
    }
    /**
     * The compact export of this layout: no full-cell triangles, compressed. It never rebuilds
     * the layout, and is computed once and cached.
     *
     * @returns The bytes to store and reload with `FacadeLayout.fromBytes`.
     * @throws {Error} when the layout was already freed and its bytes were never cached.
     */
    // Maintainer note (not published): zlib-deflated; throws instead of touching the now-freed
    // wasm handle.
    toBytes() {
        if (this.bytes !== undefined)
            return this.bytes;
        if (this.guard.isFreed) {
            throw new Error("FacadeLayout.toBytes(): this layout was already freed and its bytes were not cached -- " +
                "call toBytes() before free() (or do not free a layout you still need to export)");
        }
        this.bytes = this.handle.toBytes();
        return this.bytes;
    }
    /** Identifier of this layout. Store it with your results and check it on reload. */
    get layoutKey() { return this.fields.layoutKey; }
    /** The sensor-layout version this layout was built at. */
    get surfgridVersion() { return this.fields.surfgridVersion; }
    /** Version of the bundled geometry engine that built this layout. */
    get coreVersion() { return this.fields.coreVersion; }
    // Maintainer note (not published): used by `surfaceRenderBuffers`; the kernel reads the
    // outline of this held layout.
    _surfaceRenderBuffers(columns) {
        if (this.guard.isFreed)
            throw new Error("this FacadeLayout was freed; build or load it again");
        return this.handle.surfaceRenderBuffers(columns);
    }
    /** The sensor settings this layout was built with. */
    get synthParams() { return this.fields.synthParams; }
    /** The rebuilt layout of each job. */
    get jobs() {
        this.refreshFieldsIfStale();
        const built = this.fields.jobs.map(jobFromRaw);
        if (this.siteShiftByJobId === undefined)
            return built;
        return built.map((job) => shiftJobToSiteFrame(job, this.siteShiftByJobId.get(job.jobId)));
    }
    /**
     * Re-reads `handle.fields()` when THIS layout's cached views were
     * detached by a wasm memory grow that happened elsewhere (another
     * `synthesizeFacadeLayout`/`fromBytes` call, any other core call that
     * allocates) since they were captured -- `rawFieldsStale` compares each
     * view's `.buffer` against the core's current one
     * (perf/ts-facade-layout-views). A no-op once `free()` has already run:
     * `free()` replaces `this.fields` with real copies that never go stale.
     */
    refreshFieldsIfStale() {
        if (this.guard.isFreed)
            return;
        if (!rawFieldsStale(this.fields, requireCoreMemory()))
            return;
        this.fields = this.handle.fields();
    }
    /** @internal */
    static _fromHandle(handle, siteShiftByJobId) {
        return new FacadeLayout(handle, handle.fields(), undefined, siteShiftByJobId);
    }
}
/** Resolve a `schedule` input into `siteOrigin`/`jobs`; refuses one passed
 * alongside either explicit field (ambiguous: which one wins is a caller
 * mistake, not a default this function should silently pick). */
function resolveSchedule(input) {
    if (input.schedule === undefined)
        return input;
    if (input.siteOrigin !== undefined || input.jobs !== undefined) {
        throw new Error("synthesizeFacadeLayout: pass either `schedule` or explicit `siteOrigin`/`jobs`, not both");
    }
    const { siteOrigin, jobs } = jobsFromSchedule(input.schedule);
    return { ...input, siteOrigin, jobs };
}
/**
 * Rebuild a facade or roof sensor layout offline from the original inputs. It makes no network
 * request and costs nothing. It does not compute the export bytes; call `FacadeLayout.toBytes`.
 *
 * @param input - The original scene and sensor settings of the run.
 * @returns The rebuilt layout.
 * @throws {Error} when `schedule` is passed together with `siteOrigin` or
 * `jobs`, or when the requested layout version cannot be built.
 * @category Facade layout
 */
export function synthesizeFacadeLayout(input) {
    const handle = requireCore("synthesizeFacadeLayout").synthesizeFacadeLayoutHandle(buildRequest(resolveSchedule(input)));
    const siteShiftByJobId = input.schedule === undefined ? undefined : jobSiteShifts(input.schedule);
    return FacadeLayout._fromHandle(handle, siteShiftByJobId);
}
// `attachValues` (and `AttachValuesOptions`) moved to `facade-layout-attach.ts`
// (D224 CUT 6, the 400-line cap); re-exported below for existing callers.
export { attachValues } from "./facade-layout-attach.js";
