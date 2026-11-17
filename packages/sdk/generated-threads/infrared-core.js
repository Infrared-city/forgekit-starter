/* @ts-self-types="./infrared-core.d.ts" */
import { infraredAbortProcess } from './snippets/infrared-core-wasm-2ae142e530b240d1/inline0.js';
import { startWorkers } from './snippets/wasm-bindgen-rayon-38edf6e439f6d70d/src/workerHelpers.js';


/**
 * The incremental merge of one area run's grid tiles.
 */
export class AreaGridMerger {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AreaGridMergerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_areagridmerger_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Finish the merge: `{ values, valuesDtype, valueDivisor, valid?, shape,
     * bounds?, legend?, minLegend?, maxLegend? }`. `valid` is set for
     * `"i16"` only; `legend` for a categorical run (the values are then
     * `f32` class codes); `minLegend`/`maxLegend` are the exact range of a
     * numeric run.
     * @returns {any}
     */
    finish() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.areagridmerger_finish(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * `strategy` is `"default"`, `"directional"` or `"directional_blend"`;
     * the directional ones need `windDirectionDeg`. `block` is 1 to 928.
     * @param {number} num_rows
     * @param {number} num_cols
     * @param {string} config_json
     * @param {string} polygon_json
     * @param {string | null} [strategy]
     * @param {number | null} [wind_direction_deg]
     * @param {number | null} [block]
     */
    constructor(num_rows, num_cols, config_json, polygon_json, strategy, wind_direction_deg, block) {
        const ptr0 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(strategy) ? 0 : passStringToWasm0(strategy, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.areagridmerger_new(num_rows, num_cols, ptr0, len0, ptr1, len1, ptr2, len2, !isLikeNone(wind_direction_deg), isLikeNone(wind_direction_deg) ? 0 : wind_direction_deg, isLikeNone(block) ? Number.MAX_SAFE_INTEGER : (block) >>> 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        AreaGridMergerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Place the decoded tiles `tiles[indices[i]]` at tile positions
     * `(rows[i], cols[i])`, in this order; each tile is taken (a second
     * take is an error). One entry per tile: `undefined` when the tile is
     * merged, else the reason it is not usable (an archive that does not
     * decode, a wrong shape, an IRBF family that is not a grid). Throws for
     * a run error (numeric and categorical tiles mixed, a position outside
     * the layout); the tiles before it stay placed.
     * @param {GridTiles} tiles
     * @param {Uint32Array} indices
     * @param {Uint32Array} rows
     * @param {Uint32Array} cols
     * @returns {Array<any>}
     */
    pushMany(tiles, indices, rows, cols) {
        _assertClass(tiles, GridTiles);
        const ptr0 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(rows, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(cols, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.areagridmerger_pushMany(this.__wbg_ptr, tiles.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) AreaGridMerger.prototype[Symbol.dispose] = AreaGridMerger.prototype.free;

/**
 * A capture the kernel put in a `CaptureStore` before its job was accepted
 * (`Site.facadeCaptures`, D-2026101110-iris-nectar-maple). `bind(jobId)`
 * gives it to the accepted job; freed unbound, it is released.
 */
export class CaptureHold {
    static __wrap(ptr) {
        const obj = Object.create(CaptureHold.prototype);
        obj.__wbg_ptr = ptr;
        CaptureHoldFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CaptureHoldFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_capturehold_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Job `jobId` takes the capture. Only the first call does something.
     * @param {string} job_id
     */
    bind(job_id) {
        const ptr0 = passStringToWasm0(job_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.capturehold_bind(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * The content key (64 hex characters).
     * @returns {string}
     */
    get key() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.capturehold_key(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
}
if (Symbol.dispose) CaptureHold.prototype[Symbol.dispose] = CaptureHold.prototype.free;

/**
 * See the module documentation.
 */
export class CaptureStore {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CaptureStoreFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_capturestore_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Drop everything, as `free()` would, but keep the handle.
     */
    clear() {
        __wbg_call_guard();
        try {
            wasm.capturestore_clear(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * Drop job `jobId`'s reference. An unknown id does nothing.
     * @param {string} job_id
     */
    forget(job_id) {
        const ptr0 = passStringToWasm0(job_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        __wbg_call_guard();
        try {
            wasm.capturestore_forget(this.__wbg_ptr, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * The bytes held: the distinct captures and the syntheses cached for them.
     * @returns {number}
     */
    get heldBytes() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.capturestore_heldBytes(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * The jobs that hold a capture.
     * @returns {number}
     */
    get jobCount() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.capturestore_jobCount(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * An empty store.
     */
    constructor() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.capturestore_new();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        CaptureStoreFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Keep `capture` for job `jobId` and return its content key (64 hex
     * characters). A job that is remembered again is replaced.
     * @param {string} job_id
     * @param {Uint8Array} capture
     * @returns {string}
     */
    remember(job_id, capture) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(job_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(capture, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.capturestore_remember(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
}
if (Symbol.dispose) CaptureStore.prototype[Symbol.dispose] = CaptureStore.prototype.free;

/**
 * JS-owned canonical categorical values and their sorted observed legend.
 */
export class CategoricalAreaDense {
    static __wrap(ptr) {
        const obj = Object.create(CategoricalAreaDense.prototype);
        obj.__wbg_ptr = ptr;
        CategoricalAreaDenseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CategoricalAreaDenseFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_categoricalareadense_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {Array<any>}
     */
    get legend() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.categoricalareadense_legend(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {Float64Array}
     */
    get values() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.categoricalareadense_values(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
}
if (Symbol.dispose) CategoricalAreaDense.prototype[Symbol.dispose] = CategoricalAreaDense.prototype.free;

/**
 * A rebuilt layout, held on the wasm side so `toBytes()` can export the
 * SAME layout later without a second synthesis pass (see the module docs).
 * `fields()` and `toBytes()` both read `self.0`; nothing here
 * re-synthesizes. Free with the generated `.free()` (or let the JS
 * `FinalizationRegistry` wasm-bindgen installs do it) once a caller is
 * done with a result, the same as any other wasm-bindgen class.
 */
export class FacadeLayoutHandle {
    static __wrap(ptr) {
        const obj = Object.create(FacadeLayoutHandle.prototype);
        obj.__wbg_ptr = ptr;
        FacadeLayoutHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FacadeLayoutHandleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_facadelayouthandle_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * This layout as typed fields (no export bytes): `layoutKey`,
     * `surfgridVersion`, `coreVersion`, `synthParams`, and `jobs` (each the
     * SAME shape `synthesizeSurfaces(..., returnBuffers: true)` gives --
     * `points`, `normals`, `cellArea`, `cellTris`/`cellTrisOffsets`,
     * `frames`, `sensorLayoutHash`, `entityHashes`, `warnings` -- plus
     * `jobId` and `hasTerrain`).
     *
     * `points`/`normals`/`cellArea`/`cellTris`/`cellTrisOffsets` are
     * zero-copy VIEWS onto this handle's own buffers (`buffers_to_js_view`,
     * perf/ts-facade-layout-views) -- valid only while this handle is not
     * freed and wasm linear memory has not grown since; see the module docs.
     *
     * Refuses an oversize layout with the same `MAX_LAYOUT_CELLS_WASM`
     * cap `toBytes()` enforces, BEFORE allocating the JS typed arrays --
     * a `fromBytes()` -> `fields()` call on an oversize layout hit this
     * exact allocation as an un-catchable wasm `unreachable` otherwise
     * (TS stress test 2026-10-05, HK Mid-Levels 817 buildings, grid 1 m).
     * @returns {any}
     */
    fields() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.facadelayouthandle_fields(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} columns
     * @returns {any}
     */
    surfaceRenderBuffers(columns) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.facadelayouthandle_surfaceRenderBuffers(this.__wbg_ptr, columns);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The compact export (`crate::facade_layout_export::to_bytes`) of THIS
     * held layout -- never re-synthesizes. Call only when the host
     * actually wants to save the layout; `fields()` alone is enough to show
     * one.
     *
     * Refuses a layout too large for wasm's fixed linear memory with a
     * plain `Err` BEFORE allocating the export buffers, rather than letting
     * a huge `Vec` allocation fail -- in wasm that is an un-catchable abort
     * (`unreachable`), not a `Result` a caller could handle (issue #707
     * "toBytes() crash -- root cause", 2026-10-04). A caller with a site
     * this large should pass per-tile `activeIds` (`docs/UPGRADING.md`,
     * "Show facade results after a reload") so each job's export fits.
     * @returns {Uint8Array}
     */
    toBytes() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.facadelayouthandle_toBytes(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) FacadeLayoutHandle.prototype[Symbol.dispose] = FacadeLayoutHandle.prototype.free;

export class GridDecode {
    static __wrap(ptr) {
        const obj = Object.create(GridDecode.prototype);
        obj.__wbg_ptr = ptr;
        GridDecodeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GridDecodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_griddecode_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {Uint8Array}
     */
    get data() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.griddecode_data(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {string}
     */
    get dtype() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.griddecode_dtype(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string}
     */
    get kind() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.griddecode_kind(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {string[] | undefined}
     */
    get legend() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.griddecode_legend(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    get shape() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.griddecode_shape(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
}
if (Symbol.dispose) GridDecode.prototype[Symbol.dispose] = GridDecode.prototype.free;

export class GridDocumentDecode {
    static __wrap(ptr) {
        const obj = Object.create(GridDocumentDecode.prototype);
        obj.__wbg_ptr = ptr;
        GridDocumentDecodeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GridDocumentDecodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_griddocumentdecode_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {boolean | undefined}
     */
    get finiteNumbersValidated() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.griddocumentdecode_finiteNumbersValidated(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
     * @returns {string}
     */
    get route() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.griddocumentdecode_route(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
}
if (Symbol.dispose) GridDocumentDecode.prototype[Symbol.dispose] = GridDocumentDecode.prototype.free;

/**
 * Decoded tile archives, held in the kernel until `AreaGridMerger.pushMany`
 * takes them. Call `free()` when done.
 */
export class GridTiles {
    static __wrap(ptr) {
        const obj = Object.create(GridTiles.prototype);
        obj.__wbg_ptr = ptr;
        GridTilesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GridTilesFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_gridtiles_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
}
if (Symbol.dispose) GridTiles.prototype[Symbol.dispose] = GridTiles.prototype.free;

/**
 * The wait for ONE job (`ir_geo::run_engine::JobWait`): the host does the
 * status GET and the sleep the step names, nothing else.
 */
export class JobWait {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JobWaitFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_jobwait_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Times in whole microseconds (numbers, no BigInt).
     * @param {string} job
     * @param {number} timeout_us
     * @param {number} seed
     * @param {number | null} [interval_us]
     * @param {number | null} [interval_cap_us]
     */
    constructor(job, timeout_us, seed, interval_us, interval_cap_us) {
        const ptr0 = passStringToWasm0(job, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.jobwait_new(ptr0, len0, timeout_us, seed, !isLikeNone(interval_us), isLikeNone(interval_us) ? 0 : interval_us, !isLikeNone(interval_cap_us), isLikeNone(interval_cap_us) ? 0 : interval_cap_us);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        JobWaitFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * `answer`: the last GET's answer as JSON, or `""`; returns the step as JSON.
     * @param {number} now_us
     * @param {string} answer
     * @returns {string}
     */
    next(now_us, answer) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(answer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.jobwait_next(this.__wbg_ptr, now_us, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
}
if (Symbol.dispose) JobWait.prototype[Symbol.dispose] = JobWait.prototype.free;

/**
 * One kernel call in flight on the pool; see the module documentation.
 */
export class PoolTask {
    static __wrap(ptr) {
        const obj = Object.create(PoolTask.prototype);
        obj.__wbg_ptr = ptr;
        PoolTaskFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PoolTaskFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_pooltask_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Whether the work is done (its result can be taken).
     * @returns {boolean}
     */
    get done() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pooltask_done(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret !== 0;
    }
    /**
     * The byte address of the task's `i32` done word in the core's memory
     * (a multiple of 4): 0 while it runs, 1 when it is done.
     * @returns {number}
     */
    get flag() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pooltask_flag(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
}
if (Symbol.dispose) PoolTask.prototype[Symbol.dispose] = PoolTask.prototype.free;

/**
 * One downloaded AREA result archive, decoded in one crossing. `route` is
 * `"json"` (read `shape`/`kind`/`dtype`/`data`/`legend`: `data` is `f64`
 * little-endian for `kind === "numeric"` — NOT narrowed to f32, unlike
 * [`GridDecode`], because the JSON transport promises full double-precision
 * round-tripping — or one `u8` ordinal per cell (`0xFF` missing) into the
 * PER-TILE `legend` for `kind === "categorical"`, an open label set, unlike
 * the strict-IRBF wire's closed Lawson family) or `"irbf"` (read `document`
 * and hand it to
 * `decodeCompactGridDocument` — the archive held a strict IRBF document,
 * which already has its own buffer-native decoder).
 */
export class ResultArchiveDecode {
    static __wrap(ptr) {
        const obj = Object.create(ResultArchiveDecode.prototype);
        obj.__wbg_ptr = ptr;
        ResultArchiveDecodeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ResultArchiveDecodeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_resultarchivedecode_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * @returns {Uint8Array | undefined}
     */
    get data() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_data(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {Uint8Array | undefined}
     */
    get document() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_document(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
    /**
     * @returns {string | undefined}
     */
    get dtype() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_dtype(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get kind() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_kind(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string[] | undefined}
     */
    get legend() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_legend(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {string}
     */
    get route() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.resultarchivedecode_route(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * @returns {Uint32Array | undefined}
     */
    get shape() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.resultarchivedecode_shape(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret;
    }
}
if (Symbol.dispose) ResultArchiveDecode.prototype[Symbol.dispose] = ResultArchiveDecode.prototype.free;

/**
 * Every send, poll, download and hand-over decision of an area run.
 */
export class RunEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RunEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_runengine_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * The facts of analysis `analysis` now (JSON).
     * @param {number} analysis
     * @returns {string}
     */
    facts(analysis) {
        let deferred2_0;
        let deferred2_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.runengine_facts(this.__wbg_ptr, analysis);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * `config`: the engine `Config` as JSON.
     * @param {string} config
     */
    constructor(config) {
        const ptr0 = passStringToWasm0(config, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.runengine_new(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        RunEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * `now_us`: whole microseconds (a number, no BigInt); `events`: a JSON
     * list of events. Returns the `Step` as JSON.
     * @param {number} now_us
     * @param {string} events
     * @returns {string}
     */
    step(now_us, events) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(events, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.runengine_step(this.__wbg_ptr, now_us, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
}
if (Symbol.dispose) RunEngine.prototype[Symbol.dispose] = RunEngine.prototype.free;

/**
 * One area site, read once, answering per tile range.
 */
export class Site {
    static __wrap(ptr) {
        const obj = Object.create(Site.prototype);
        obj.__wbg_ptr = ptr;
        SiteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SiteFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_site_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * Every tile's membership and ownership answer, as ONE JSON array of the
     * `tileIds` documents, in tile order (as `SiteAssignment.allTileIds`).
     * @returns {string}
     */
    allTileIds() {
        let deferred2_0;
        let deferred2_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.site_allTileIds(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * The artifacts of an `artifactsStart` task (see there).
     * @param {PoolTask} task
     * @returns {any}
     */
    static artifactsEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_artifactsEnd(task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Tiles `start..end`'s IRBF geometry artifacts: `SiteAssignment.artifacts`'
     * object for the range (offsets from 0 for tile `start`), plus `present`
     * (`Uint8Array`, one mask per tile) and `meshGroupHashes` (`string[]`,
     * two per tile), as `identity` answers them. Four additive per-tile
     * fact buffers report checked frame bytes, metadata bytes, mesh count
     * and instance count without changing the existing archive fields.
     *
     * D249: the TypeScript host never boxes trees; the kernel still carries
     * the `box_trees` parameter for the .NET binding, so this calls it with
     * `false`. Returns a `PoolTask` at once (`pool_task`); `artifactsEnd`
     * gives the object.
     * @param {number} start
     * @param {number} end
     * @param {bigint} max_total_bytes
     * @param {number} max_metadata_bytes
     * @param {bigint} max_meshes
     * @param {bigint} max_instances
     * @returns {PoolTask}
     */
    artifactsStart(start, end, max_total_bytes, max_metadata_bytes, max_meshes, max_instances) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_artifactsStart(this.__wbg_ptr, start, end, max_total_bytes, max_metadata_bytes, max_meshes, max_instances);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return PoolTask.__wrap(ret);
    }
    /**
     * Tiles `start..end`'s wire bodies and kernel group hashes, as
     * `SiteAssignment.arena` answers the whole grid: `{bytes: Uint8Array,
     * offsets: Uint32Array, hashes: string[]}`, five slots per tile, offsets
     * starting at 0 for tile `start`.
     *
     * Each tile's bytes are copied straight into the JavaScript array and
     * dropped: the joined bytes never exist in wasm memory, which never
     * shrinks (a 2 km site: about 100 MiB less heap at this call).
     * @param {number} start
     * @param {number} end
     * @returns {any}
     */
    bodies(start, end) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_bodies(this.__wbg_ptr, start, end);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Refuse tiles `start..end` whose terrain is over the per-request cap,
     * the check a selected facade body makes, without writing one.
     * @param {number} start
     * @param {number} end
     */
    checkTerrain(start, end) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_checkTerrain(this.__wbg_ptr, start, end);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * The one warning of the context hole (D293), or `undefined` when it
     * removed no context triangle. The host logs it as it is.
     * @returns {string | undefined}
     */
    contextWarning() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_contextWarning(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * The records of a `facadeBatchesStart` task (see there).
     * @param {PoolTask} task
     * @returns {string}
     */
    static facadeBatchesEnd(task) {
        let deferred2_0;
        let deferred2_1;
        try {
            _assertClass(task, PoolTask);
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.site_facadeBatchesEnd(task.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Geometry-free facade policy and saved records in; selected batch ID
     * records out (JSON text). The shared core parses both policy versions.
     * Returns a `PoolTask` at once (the sensor counts run on the pool);
     * `facadeBatchesEnd` gives the text.
     * @param {number} start
     * @param {number} end
     * @param {string} request_json
     * @returns {PoolTask}
     */
    facadeBatchesStart(start, end, request_json) {
        const ptr0 = passStringToWasm0(request_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeBatchesStart(this.__wbg_ptr, start, end, ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return PoolTask.__wrap(ret);
    }
    /**
     * The holds of a `facadeCapturesStart` task (see there).
     * @param {PoolTask} task
     * @returns {Array<any>}
     */
    static facadeCapturesEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeCapturesEnd(task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * The captures of many facade jobs (given as for `facadeFrames`, with
     * the request's `alignment`), put straight into `store`. Returns a
     * `PoolTask` at once; `facadeCapturesEnd` gives one `CaptureHold` per
     * job, or `{error}` for a job the kernel refuses
     * (D-2026101110-iris-nectar-maple). No capture is copied to JavaScript;
     * the keys are hashed on the pool in the threaded core.
     * @param {Uint32Array} tiles
     * @param {Uint32Array} id_counts
     * @param {string[]} ids
     * @param {string | null | undefined} alignment
     * @param {CaptureStore} store
     * @returns {PoolTask}
     */
    facadeCapturesStart(tiles, id_counts, ids, alignment, store) {
        const ptr0 = passArray32ToWasm0(tiles, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(id_counts, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(alignment) ? 0 : passStringToWasm0(alignment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertClass(store, CaptureStore);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeCapturesStart(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, store.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PoolTask.__wrap(ret[0]);
    }
    /**
     * The jobs of a `facadeFramesStart` task (see there).
     * @param {PoolTask} task
     * @returns {Array<any>}
     */
    static facadeFramesEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeFramesEnd(task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Many facade jobs in one call (WP3). Job `j` is tile `tiles[j]` with the
     * next `idCounts[j]` ids of `ids` as its targets. Returns a `PoolTask`
     * at once; `facadeFramesEnd` gives, for each job, in job order, an
     * object with the parts asked for: `body` (`{bytes, offsets, hashes}`,
     * the five-group arena of `bodies(tile, tile + 1)`), `identity`
     * (`{present, meshGroupHashes}`), `capture` (the pretty capture with the
     * request's `terrain-alignment`: `alignment`, or `undefined` when the
     * request does not send it) and `artifact` (`{targetIds, archive,
     * artifactDigest, contentDigest, encoding, frameByteLength,
     * metadataByteLength, meshCount, instanceCount}`). A job the kernel
     * refuses is `{error}`; the other jobs are kept. The kernel builds each
     * tile once for all of its jobs.
     *
     * D249: the TypeScript host never boxes trees; the kernel still carries
     * the `box_trees` parameter for the .NET binding, so this calls it with
     * `false`.
     * @param {Uint32Array} tiles
     * @param {Uint32Array} id_counts
     * @param {string[]} ids
     * @param {boolean} body
     * @param {boolean} identity
     * @param {boolean} capture
     * @param {string | null | undefined} alignment
     * @param {boolean} artifact
     * @param {bigint} max_total_bytes
     * @param {number} max_metadata_bytes
     * @param {bigint} max_meshes
     * @param {bigint} max_instances
     * @returns {PoolTask}
     */
    facadeFramesStart(tiles, id_counts, ids, body, identity, capture, alignment, artifact, max_total_bytes, max_metadata_bytes, max_meshes, max_instances) {
        const ptr0 = passArray32ToWasm0(tiles, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(id_counts, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(alignment) ? 0 : passStringToWasm0(alignment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeFramesStart(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, body, identity, capture, ptr3, len3, artifact, max_total_bytes, max_metadata_bytes, max_meshes, max_instances);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PoolTask.__wrap(ret[0]);
    }
    /**
     * The scenes and jobs of a `facadeScenesStart` task (see there).
     * @param {PoolTask} task
     * @returns {object}
     */
    static facadeScenesEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeScenesEnd(task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * One scene frame per tile and a target range per job (#602). The jobs
     * are given as for `facadeFrames`; give every job of a tile in one call.
     * Returns a `PoolTask` at once; `facadeScenesEnd` gives `{scenes, jobs}`:
     * a scene is `{tile, archive, artifactDigest, contentDigest, encoding,
     * frameByteLength, metadataByteLength, meshCount, instanceCount}`; a job
     * is `{targets: {scene, start, count}, targetIds}` (a range of
     * `scenes[scene]`'s `geometries`), `{artifact}` (its own frame, as
     * `facadeFrames` answers it) or `{error}`.
     *
     * D249: the TypeScript host never boxes trees; the kernel still carries
     * the `box_trees` parameter for the .NET binding, so this calls it with
     * `false`.
     * @param {Uint32Array} tiles
     * @param {Uint32Array} id_counts
     * @param {string[]} ids
     * @param {bigint} max_total_bytes
     * @param {number} max_metadata_bytes
     * @param {bigint} max_meshes
     * @param {bigint} max_instances
     * @returns {PoolTask}
     */
    facadeScenesStart(tiles, id_counts, ids, max_total_bytes, max_metadata_bytes, max_meshes, max_instances) {
        const ptr0 = passArray32ToWasm0(tiles, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(id_counts, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_facadeScenesStart(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, max_total_bytes, max_metadata_bytes, max_meshes, max_instances);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PoolTask.__wrap(ret[0]);
    }
    /**
     * Tiles `start..end`'s presence masks (`present`: one byte per tile, bit
     * `i` for group `i` in `arenaGroups()` order) and `geometries` /
     * `context-geometry` group hashes (`meshGroupHashes`: two per tile, `""`
     * for none), with no body written and no archive encoded.
     * @param {number} start
     * @param {number} end
     * @returns {any}
     */
    identity(start, end) {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_identity(this.__wbg_ptr, start, end);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Read the site once and prepare its layers over EVERY tile.
     *
     * The first fourteen arguments are `SiteAssignment`'s. Then the five
     * group documents as JSON text (`geometries`, `context-geometry`,
     * `ground-geometry`, `vegetation`, `ground-materials`; `undefined` for a
     * group the run does not carry), which must name the meshes the packed
     * site holds; `polygonJson`, the source polygon the tree and
     * ground-material assigners project with; `terrainMarginM`, the caller's
     * extra terrain reach; `contextReachM`, how far outside a tile core a
     * `context-geometry` mesh still reaches that tile (`undefined` = the
     * kernel default, `null` = every tile); `contextIndices` and
     * `contextIndexOffsets`, the context group's index buffer in place of its
     * `context-geometry` document (empty offsets = send the document);
     * `contextBufferM`, the hole round
     * each tile's detailed area (`null` = no hole). The tile list is always the whole grid.
     * @param {string[]} building_ids
     * @param {Uint8Array} building_coordinates
     * @param {Uint32Array} building_offsets
     * @param {string[]} context_ids
     * @param {Uint8Array} context_coordinates
     * @param {Uint32Array} context_offsets
     * @param {Uint32Array} rows
     * @param {Uint32Array} cols
     * @param {string[]} tile_ids
     * @param {number} inference_size_m
     * @param {number} context_size_m
     * @param {number} step_m
     * @param {number} site_lon
     * @param {number} site_lat
     * @param {string | null | undefined} geometries
     * @param {string | null | undefined} context_geometry
     * @param {string | null | undefined} ground_geometry
     * @param {string | null | undefined} vegetation
     * @param {string | null | undefined} ground_materials
     * @param {string} polygon_json
     * @param {Uint32Array} context_indices
     * @param {Uint32Array} context_index_offsets
     * @param {string | null} [options]
     */
    constructor(building_ids, building_coordinates, building_offsets, context_ids, context_coordinates, context_offsets, rows, cols, tile_ids, inference_size_m, context_size_m, step_m, site_lon, site_lat, geometries, context_geometry, ground_geometry, vegetation, ground_materials, polygon_json, context_indices, context_index_offsets, options) {
        const ptr0 = passArrayJsValueToWasm0(building_ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(building_coordinates, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(building_offsets, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayJsValueToWasm0(context_ids, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray8ToWasm0(context_coordinates, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArray32ToWasm0(context_offsets, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArray32ToWasm0(rows, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArray32ToWasm0(cols, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayJsValueToWasm0(tile_ids, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        var ptr9 = isLikeNone(geometries) ? 0 : passStringToWasm0(geometries, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len9 = WASM_VECTOR_LEN;
        var ptr10 = isLikeNone(context_geometry) ? 0 : passStringToWasm0(context_geometry, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len10 = WASM_VECTOR_LEN;
        var ptr11 = isLikeNone(ground_geometry) ? 0 : passStringToWasm0(ground_geometry, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len11 = WASM_VECTOR_LEN;
        var ptr12 = isLikeNone(vegetation) ? 0 : passStringToWasm0(vegetation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len12 = WASM_VECTOR_LEN;
        var ptr13 = isLikeNone(ground_materials) ? 0 : passStringToWasm0(ground_materials, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len13 = WASM_VECTOR_LEN;
        const ptr14 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len14 = WASM_VECTOR_LEN;
        const ptr15 = passArray32ToWasm0(context_indices, wasm.__wbindgen_malloc);
        const len15 = WASM_VECTOR_LEN;
        const ptr16 = passArray32ToWasm0(context_index_offsets, wasm.__wbindgen_malloc);
        const len16 = WASM_VECTOR_LEN;
        var ptr17 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len17 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, inference_size_m, context_size_m, step_m, site_lon, site_lat, ptr9, len9, ptr10, len10, ptr11, len11, ptr12, len12, ptr13, len13, ptr14, len14, ptr15, len15, ptr16, len16, ptr17, len17);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        SiteFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Share the facade parts between the `analyses` facade analyses of one
     * run (`Site::share_facade_parts`); `0` at the end of the run.
     * @param {number} analyses
     */
    shareFacadeParts(analyses) {
        __wbg_call_guard();
        try {
            wasm.site_shareFacadeParts(this.__wbg_ptr, analyses);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * How many tiles the site has; every range is within `0..tileCount()`.
     * @returns {number}
     */
    tileCount() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_tileCount(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * Point trees without z when the site has terrain, else 0: the count
     * `treeZWarning` takes.
     * @returns {number}
     */
    treesWithoutZ() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_treesWithoutZ(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * The constructor with the site's terrain read once (`SiteTerrain`, WP1)
     * in place of the `ground-geometry` document: the same arguments less
     * that one, then the handle, then the site options JSON. A building edit reads
     * no terrain.
     * @param {string[]} building_ids
     * @param {Uint8Array} building_coordinates
     * @param {Uint32Array} building_offsets
     * @param {string[]} context_ids
     * @param {Uint8Array} context_coordinates
     * @param {Uint32Array} context_offsets
     * @param {Uint32Array} rows
     * @param {Uint32Array} cols
     * @param {string[]} tile_ids
     * @param {number} inference_size_m
     * @param {number} context_size_m
     * @param {number} step_m
     * @param {number} site_lon
     * @param {number} site_lat
     * @param {string | null | undefined} geometries
     * @param {string | null | undefined} context_geometry
     * @param {string | null | undefined} vegetation
     * @param {string | null | undefined} ground_materials
     * @param {string} polygon_json
     * @param {SiteTerrain} terrain
     * @param {Uint32Array} context_indices
     * @param {Uint32Array} context_index_offsets
     * @param {string | null} [options]
     * @returns {Site}
     */
    static withTerrain(building_ids, building_coordinates, building_offsets, context_ids, context_coordinates, context_offsets, rows, cols, tile_ids, inference_size_m, context_size_m, step_m, site_lon, site_lat, geometries, context_geometry, vegetation, ground_materials, polygon_json, terrain, context_indices, context_index_offsets, options) {
        const ptr0 = passArrayJsValueToWasm0(building_ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(building_coordinates, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(building_offsets, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayJsValueToWasm0(context_ids, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray8ToWasm0(context_coordinates, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passArray32ToWasm0(context_offsets, wasm.__wbindgen_malloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArray32ToWasm0(rows, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArray32ToWasm0(cols, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArrayJsValueToWasm0(tile_ids, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        var ptr9 = isLikeNone(geometries) ? 0 : passStringToWasm0(geometries, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len9 = WASM_VECTOR_LEN;
        var ptr10 = isLikeNone(context_geometry) ? 0 : passStringToWasm0(context_geometry, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len10 = WASM_VECTOR_LEN;
        var ptr11 = isLikeNone(vegetation) ? 0 : passStringToWasm0(vegetation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len11 = WASM_VECTOR_LEN;
        var ptr12 = isLikeNone(ground_materials) ? 0 : passStringToWasm0(ground_materials, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len12 = WASM_VECTOR_LEN;
        const ptr13 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len13 = WASM_VECTOR_LEN;
        _assertClass(terrain, SiteTerrain);
        const ptr14 = passArray32ToWasm0(context_indices, wasm.__wbindgen_malloc);
        const len14 = WASM_VECTOR_LEN;
        const ptr15 = passArray32ToWasm0(context_index_offsets, wasm.__wbindgen_malloc);
        const len15 = WASM_VECTOR_LEN;
        var ptr16 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len16 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.site_withTerrain(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, inference_size_m, context_size_m, step_m, site_lon, site_lat, ptr9, len9, ptr10, len10, ptr11, len11, ptr12, len12, ptr13, len13, terrain.__wbg_ptr, ptr14, len14, ptr15, len15, ptr16, len16);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Site.__wrap(ret[0]);
    }
}
if (Symbol.dispose) Site.prototype[Symbol.dispose] = Site.prototype.free;

/**
 * One site terrain, read once.
 */
export class SiteTerrain {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SiteTerrainFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_siteterrain_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * SHA-256 hex of the document text this handle was read from: the
     * terrain's content key. The host writes the document once.
     * @returns {string}
     */
    get contentKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.siteterrain_contentKey(this.__wbg_ptr);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * The kernel group hash of the whole terrain (`geometryGroupHash` of
     * `ground-geometry` over the document), or `undefined` when a mesh cannot
     * be read for the hash.
     * @returns {string | undefined}
     */
    get groupHash() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.siteterrain_groupHash(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Read one `ground-geometry` document (`{mesh_key: mesh}` JSON text).
     * Only a document that is not a JSON object is refused here; a bad mesh
     * is refused by the `Site` built on it, with the document path's text.
     * @param {string} document
     */
    constructor(document) {
        const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.siteterrain_new(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        SiteTerrainFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) SiteTerrain.prototype[Symbol.dispose] = SiteTerrain.prototype.free;

/**
 * Decoded surface archives, held in the kernel until
 * `SurfaceJoinStream.pushMany` takes them. Call `free()` when done.
 */
export class SurfaceJobs {
    static __wrap(ptr) {
        const obj = Object.create(SurfaceJobs.prototype);
        obj.__wbg_ptr = ptr;
        SurfaceJobsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SurfaceJobsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_surfacejobs_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
}
if (Symbol.dispose) SurfaceJobs.prototype[Symbol.dispose] = SurfaceJobs.prototype.free;

/**
 * One analysis's join, fed per engine turn (see the module documentation).
 */
export class SurfaceJoinStream {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SurfaceJoinStreamFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_surfacejoinstream_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * The columns of a `finishStart` task, with `jobIds` (the capture id of
     * each argument job, in arrival order).
     * @param {PoolTask} task
     * @returns {any}
     */
    finishEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfacejoinstream_finishEnd(this.__wbg_ptr, task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Join every pushed job on the pool; returns a `PoolTask` at once. The
     * stream is empty afterwards. `finishEnd` gives the columns.
     * @param {CaptureStore} store
     * @param {boolean} emit_cell_tris
     * @returns {PoolTask}
     */
    finishStart(store, emit_cell_tris) {
        _assertClass(store, CaptureStore);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfacejoinstream_finishStart(this.__wbg_ptr, store.__wbg_ptr, emit_cell_tris);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PoolTask.__wrap(ret[0]);
    }
    constructor() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfacejoinstream_new();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        this.__wbg_ptr = ret;
        SurfaceJoinStreamFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Keep the jobs of a `pushManyStart` task; one item per argument job:
     * `undefined`, or the reason the join refuses it.
     * @param {PoolTask} task
     * @returns {Array<any>}
     */
    pushManyEnd(task) {
        _assertClass(task, PoolTask);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfacejoinstream_pushManyEnd(this.__wbg_ptr, task.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Take the decoded jobs `indices` of `jobs` (one `decodeSurfaceJobs`
     * batch): job `k` is schedule entry `entryIds[k]`, tile SW offset
     * `anchors[2k]`, `anchors[2k + 1]`, capture id `jobIds[k]` in `store`
     * (`undefined`: none); `emitCellTris`: the run asked for triangles.
     * Builds their layouts in ONE synthesis call (the jobs of a tile share
     * their ground) on the pool, and returns a `PoolTask` at once.
     * `pushManyEnd` keeps the jobs for the join and returns one item per job:
     * `undefined`, or the reason the join refuses it (that job is not kept).
     * @param {SurfaceJobs} jobs
     * @param {Uint32Array} indices
     * @param {string[]} entry_ids
     * @param {Float64Array} anchors
     * @param {CaptureStore} store
     * @param {Array<any>} job_ids
     * @param {boolean} emit_cell_tris
     * @returns {PoolTask}
     */
    pushManyStart(jobs, indices, entry_ids, anchors, store, job_ids, emit_cell_tris) {
        _assertClass(jobs, SurfaceJobs);
        const ptr0 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(entry_ids, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(anchors, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        _assertClass(store, CaptureStore);
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfacejoinstream_pushManyStart(this.__wbg_ptr, jobs.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, store.__wbg_ptr, job_ids, emit_cell_tris);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PoolTask.__wrap(ret[0]);
    }
}
if (Symbol.dispose) SurfaceJoinStream.prototype[Symbol.dispose] = SurfaceJoinStream.prototype.free;

/**
 * One weather catalog, read once.
 */
export class WeatherCatalog {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WeatherCatalogFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_weathercatalog_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    /**
     * One station by `uuid`, else by `fileName`, as a JSON
     * `{uuid, fileName, location_data}`. Throws the not-in-the-catalog text
     * when there is none; that is its only failure.
     * @param {string} identifier
     * @returns {string}
     */
    find(identifier) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.weathercatalog_find(this.__wbg_ptr, ptr0, len0);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * The stations within `radiusKm` of `(lat, lon)`, nearest first, at most
     * `limit`, as a JSON array of `{uuid, fileName, location_data}`. Equal
     * distances keep catalog order.
     * @param {number} lat
     * @param {number} lon
     * @param {number} radius_km
     * @param {number} limit
     * @returns {string}
     */
    nearest(lat, lon, radius_km, limit) {
        let deferred1_0;
        let deferred1_1;
        try {
            let ret;
            __wbg_call_guard();
            try {
                ret = wasm.weathercatalog_nearest(this.__wbg_ptr, lat, lon, radius_km, limit);
            } catch(e) {
                __wbg_handle_catch(e);
            }
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            __wbg_call_guard();
            try {
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            } catch(e) {
                __wbg_handle_catch(e);
            }
        }
    }
    /**
     * Read the catalog (`{"stations": [...]}` as UTF-8 bytes). Throws when it
     * is not JSON, not an object, or its `stations` member is not a list.
     * @param {Uint8Array} catalog
     */
    constructor(catalog) {
        const ptr0 = passArray8ToWasm0(catalog, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weathercatalog_new(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        WeatherCatalogFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) WeatherCatalog.prototype[Symbol.dispose] = WeatherCatalog.prototype.free;

/**
 * Read a gbXML document into the analytical building model v1 (JSON).
 *
 * `data` is the gbXML file as bytes (UTF-8, or UTF-16 with a byte-order
 * mark). Returns the model as a JSON string: SI units, +Y = true north,
 * every geometry default and export defect as a counted line in
 * `warnings`. Throws only when `data` is not a gbXML document.
 * @param {Uint8Array} data
 * @returns {string}
 */
export function analyticalFromGbxml(data) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.analyticalFromGbxml(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The one sentence for a refused API key (HTTP 401 or 403): the text of a
 * refused key in a run error, for a host error that has no run around it.
 * @param {number} status
 * @returns {string}
 */
export function apiKeyRefusedMessage(status) {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.apiKeyRefusedMessage(status);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The 4 built-in low-poly tree templates → `{registry_id: {coordinates,
 * indices, height, crown_diameter, crown_base_fraction}}`. Instance these with
 * `instancesFromPoints` so the frontend shows the archetype geometry + dims.
 * @returns {string}
 */
export function archetypeMeshes() {
    let deferred2_0;
    let deferred2_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.archetypeMeshes();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The estimate of a run, as JSON. `plannedJobs` is a safe integer.
 * @param {number} planned_jobs
 * @param {number} tokens_per_job
 * @returns {string}
 */
export function areaEstimate(planned_jobs, tokens_per_job) {
    let deferred2_0;
    let deferred2_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.areaEstimate(planned_jobs, tokens_per_job);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The error of an analysis that finished with `outcome`, as JSON, or
 * `undefined` for `ok`.
 * @param {string} outcome
 * @param {string} facts
 * @param {string} analysis_type
 * @param {number} area_timeout_s
 * @returns {string | undefined}
 */
export function areaFinalError(outcome, facts, analysis_type, area_timeout_s) {
    const ptr0 = passStringToWasm0(outcome, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(facts, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.areaFinalError(ptr0, len0, ptr1, len1, ptr2, len2, area_timeout_s);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    let v4;
    if (ret[0] !== 0) {
        v4 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v4;
}

/**
 * The `Idempotency-Key` header value of one tile submit (D224). See
 * `ir_geo::area_retry`.
 * @param {string} run_id
 * @param {string} job_key
 * @param {number} attempt
 * @returns {string}
 */
export function areaIdempotencyKey(run_id, job_key, attempt) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(job_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.areaIdempotencyKey(ptr0, len0, ptr1, len1, attempt);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The per-key attempt cap of an area retry, the first attempt included
 * (D224). One kernel constant; a schedule does not store it.
 * @returns {number}
 */
export function areaRetryMaxAttempts() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.areaRetryMaxAttempts();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * `infrared_sdk.tiling.transforms.assign_buildings_to_tiles` port. Buildings
 * (`{key:{coordinates:[x,y,z,...],...}}`, polygon-bbox-SW meters) + non-empty
 * tiles → `{tileId:{key:building_with_tile_local_coords}}`.
 * @param {string} buildings_json
 * @param {string} tiles_json
 * @param {string | null | undefined} analysis_type
 * @param {boolean} strict
 * @returns {string}
 */
export function assignBuildingsToTiles(buildings_json, tiles_json, analysis_type, strict) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(buildings_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.assignBuildingsToTiles(ptr0, len0, ptr1, len1, ptr2, len2, strict);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `ground_materials.dedup.assign_ground_materials_to_tiles` port. Layers
 * (`{layer_name: FeatureCollection}`, WGS84) + tiles + polygon →
 * `{tileId:{layer_name:FeatureCollection}}` with `properties.material` injected.
 * @param {string} layers_json
 * @param {string} tiles_json
 * @param {string} polygon_json
 * @param {string | null} [analysis_type]
 * @returns {string}
 */
export function assignGroundMaterialsToTiles(layers_json, tiles_json, polygon_json, analysis_type) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.assignGroundMaterialsToTiles(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `vegetation.dedup.assign_vegetation_to_tiles` port. Vegetation
 * (`{key:{geometry:{...}},...}` — Point/Polygon/MultiPolygon, D27) + tiles +
 * source polygon → `{tileId:{key:feature}}` (LocalFrame D1; payload
 * preserved verbatim).
 *
 * # Errors
 *
 * Throws if a feature's geometry cannot be reduced to a single seating
 * position — see [`ir_geo::tiling::vegetation::VegetationGeometryError`].
 * Previously an unsupported geometry type was skipped silently; D27 made
 * this a hard error on both bindings.
 * @param {string} vegetation_json
 * @param {string} tiles_json
 * @param {string} polygon_json
 * @param {string | null} [analysis_type]
 * @returns {string}
 */
export function assignVegetationToTiles(vegetation_json, tiles_json, polygon_json, analysis_type) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(vegetation_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.assignVegetationToTiles(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Building-batching manifest for parallel raytracing. `{key:{coordinates,
 * indices?}}` (tile-local meters) → `{batches:[[key...]], occluder_sets:
 * null|[[key...]]}`. `halo_radius_m = undefined` → Full context.
 * @param {string} buildings_json
 * @param {number} batch_size
 * @param {number | null} [halo_radius_m]
 * @returns {string}
 */
export function batchBuildings(buildings_json, batch_size, halo_radius_m) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(buildings_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.batchBuildings(ptr0, len0, batch_size, !isLikeNone(halo_radius_m), isLikeNone(halo_radius_m) ? 0 : halo_radius_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * One byte per row (`1` meets): `rows` holds four values per row (`west,
 * south, east, north`), NaN for a missing member. Closed intervals; a row
 * with a missing member meets every rectangle.
 * @param {Float64Array} rows
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 * @returns {Uint8Array}
 */
export function bboxMeetsRows(rows, west, south, east, north) {
    const ptr0 = passArrayF64ToWasm0(rows, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.bboxMeetsRows(ptr0, len0, west, south, east, north);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * The body fields a binary geometry document carries: every geometry group
 * plus the BYO `sensor-points` / `sensor-normals`. A host sends every other
 * body field as control.
 * @returns {Array<any>}
 */
export function binaryGeometryFields() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.binaryGeometryFields();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * `ir_geo::tiling::categorical::build_cat_map` binding. JSON array of category
 * strings in → `{category: index}` JSON out (unique, non-empty, sorted, 0-based
 * f64 indices). The legend for `encodeCategoricalGrid`.
 * @param {string} categories_json
 * @returns {string}
 */
export function buildCatMap(categories_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(categories_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.buildCatMap(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Normalise an area of footprints ONCE, assign them to tiles and extrude
 * each tile's set in that tile's frame.
 *
 * The tiled twin of `buildingsNormalize` followed by
 * `extrudeFootprintsToDotbim`. A footprint goes to EVERY tile whose rectangle
 * its envelope meets, not only the first — that is the duplication the
 * per-tile reads produced, and the host's grid-order first-seen dedup removes
 * it. Each tile is extruded with its own south-west corner as the origin, so
 * `mesh_id` counts from zero WITHIN each tile, exactly as before (it was
 * never an identifier — D36).
 *
 * **`chunk` is read and IGNORED here.** `tiles` is parsed by the one shared
 * reader, so a rectangle may carry the member — but this operation has no
 * per-chunk input to resolve through it. Roads are not its concern: what a
 * footprint is extruded into depends on the RECTANGLE alone (its own frame, its
 * own `mesh_id` numbering), so a chunk name cannot change the answer. It is
 * accepted rather than refused because a host may hand ONE rectangle list to the
 * ground and buildings operations, and refusing the member would force it to
 * build two lists that must then be kept identical by hand.
 *
 * One AOI-sized rectangle is a valid list: the footprints are normalised once
 * and extruded once, in the AOI frame. That is NOT bit-identical to today's
 * per-tile extrusion offset into the grid, and cannot be — `LocalFrame` fixes
 * the east-west scale at the frame's ORIGIN latitude (D1), so the two frames
 * disagree by `R * dlon * (cos lat_tile - cos lat_AOI)`, measured at up to
 * 8.9 mm on the Vienna capture, with identical indices and vertex counts. The
 * host records the move in `docs/DEVIATIONS.md` D48 (host adoption).
 *
 * Returns the JSON of `{tileId: {buildingId: {mesh_id, coordinates,
 * indices}}}`, one entry per tile in the given order, `{}` for a tile no
 * footprint meets.
 * @param {string} fc
 * @param {string} source
 * @param {string} tiles
 * @param {number} default_height
 * @returns {string}
 */
export function buildingsAssignAndExtrude(fc, source, tiles, default_height) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(tiles, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.buildingsAssignAndExtrude(ptr0, len0, ptr1, len1, ptr2, len2, default_height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`buildings_assign_and_extrude`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 * @param {Uint8Array} fc
 * @param {string} source
 * @param {Uint8Array} tiles
 * @param {number} default_height
 * @returns {Uint8Array}
 */
export function buildingsAssignAndExtrudeBytes(fc, source, tiles, default_height) {
    const ptr0 = passArray8ToWasm0(fc, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(tiles, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.buildingsAssignAndExtrudeBytes(ptr0, len0, ptr1, len1, ptr2, len2, default_height);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * [`buildings_assign_and_extrude`] keeping the attributes extrusion drops.
 *
 * Same normalisation, same assignment, same frames: each tile's answer is
 * `{"meshes": {buildingId: {mesh_id, coordinates, indices}}, "attributes":
 * {buildingId: {height, min_height, num_floors, source_id}}}` instead of the
 * mesh map alone. The two maps of a tile carry exactly the same ids — a row
 * is written in the same loop iteration that writes its mesh, after the same
 * eligibility test.
 * @param {string} fc
 * @param {string} source
 * @param {string} tiles
 * @param {number} default_height
 * @returns {string}
 */
export function buildingsAssignAndExtrudeWithAttributes(fc, source, tiles, default_height) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(tiles, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.buildingsAssignAndExtrudeWithAttributes(ptr0, len0, ptr1, len1, ptr2, len2, default_height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`buildings_assign_and_extrude_with_attributes`] with every document
 * crossing as a `Uint8Array` (WP14-D). Same operation, same bytes.
 * @param {Uint8Array} fc
 * @param {string} source
 * @param {Uint8Array} tiles
 * @param {number} default_height
 * @returns {Uint8Array}
 */
export function buildingsAssignAndExtrudeWithAttributesBytes(fc, source, tiles, default_height) {
    const ptr0 = passArray8ToWasm0(fc, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(tiles, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.buildingsAssignAndExtrudeWithAttributesBytes(ptr0, len0, ptr1, len1, ptr2, len2, default_height);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Building footprint normalisation — utilities-service `app/gis/buildings.py`
 * and the `POST /buildings` Lambda, whose height fallbacks it shares.
 *
 * `source` is a global provider (`"mapbox"`, `"overture"` or `"bigquery"`)
 * or a city overlay's registry `source_key` (for example `"vienna_ogd"`)
 * when the host range-read a city FlatGeobuf. Any non-empty label is
 * accepted; an empty one is an error.
 * @param {string} fc_json
 * @param {string} source
 * @returns {string}
 */
export function buildingsNormalize(fc_json, source) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(fc_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.buildingsNormalize(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return the exact bounded metadata bytes used by the server.
 * @param {string} metadata_json
 * @param {number} max_bytes
 * @param {number} max_depth
 * @returns {Uint8Array}
 */
export function canonicalMetadataJson(metadata_json, max_bytes, max_depth) {
    const ptr0 = passStringToWasm0(metadata_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.canonicalMetadataJson(ptr0, len0, max_bytes, max_depth);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Refuse a pedestrian wind comfort pair the worker cannot fit.
 * @param {Float64Array} speeds
 * @param {Float64Array} directions
 */
export function checkPwcWind(speeds, directions) {
    const ptr0 = passArrayF64ToWasm0(speeds, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(directions, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.checkPwcWind(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * The `maxSensorsPerJob` rule of a fresh run or a retry; throws.
 * @param {number | null} [requested]
 * @param {boolean | null} [retry]
 * @param {number | null} [saved]
 */
export function checkSensorCap(requested, retry, saved) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.checkSensorCap(!isLikeNone(requested), isLikeNone(requested) ? 0 : requested, isLikeNone(retry) ? 0xFFFFFF : retry ? 1 : 0, !isLikeNone(saved), isLikeNone(saved) ? 0 : saved);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Clean ONE mesh: weld bit-identical positions, drop degenerate and exact
 * duplicate triangles, make the winding consistent (the authored majority
 * wins), and turn closed components outward.
 *
 * Returns `{ coordinates, indices, report }`. When nothing changed, the
 * INPUT arrays come back as they are.
 * @param {any} coordinates
 * @param {Uint32Array} indices
 * @returns {object}
 */
export function cleanMesh(coordinates, indices) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.cleanMesh(coordinates, indices);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Clean many meshes, each on its own. `vertOffsets` / `faceOffsets` hold
 * `entities + 1` starts (in vertices and in triangles); each entity's indices
 * are local to its own vertices. Returns
 * `{ coordinates, vertOffsets, indices, faceOffsets, reports }`.
 * @param {any} coordinates
 * @param {Uint32Array} vert_offsets
 * @param {Uint32Array} indices
 * @param {Uint32Array} face_offsets
 * @returns {object}
 */
export function cleanMeshes(coordinates, vert_offsets, indices, face_offsets) {
    const ptr0 = passArray32ToWasm0(vert_offsets, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(face_offsets, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.cleanMeshes(coordinates, ptr0, len0, ptr1, len1, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `infrared_sdk.tiling.merger.clip_to_polygon` port. base64-f32 grid in/out;
 * cells whose centre is outside `polygon_meters` (`[[x,y],...]`) become NaN.
 * @param {string} grid_bin
 * @param {number} rows
 * @param {number} cols
 * @param {string} polygon_meters_json
 * @param {number} origin_x
 * @param {number} origin_y
 * @param {number} cell_size_m
 * @returns {string}
 */
export function clipToPolygon(grid_bin, rows, cols, polygon_meters_json, origin_x, origin_y, cell_size_m) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(grid_bin, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(polygon_meters_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.clipToPolygon(ptr0, len0, rows, cols, ptr1, len1, origin_x, origin_y, cell_size_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Roll child hashes up one level of the Merkle tree. `level` ∈
 * {`"tile"`, `"layer"`}; `"tile"` yields the `tile_geo_hash` that keys the
 * result cache.
 *
 * Order-independent (children are sorted), but NOT a set — duplicates count.
 * An empty array is valid: a buildingless tile is a real tile. Throws on any
 * child that is not 64 lowercase hex chars.
 * @param {string[]} child_hashes
 * @param {string | null} [level]
 * @returns {string}
 */
export function composeHash(child_hashes, level) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(child_hashes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(level) ? 0 : passStringToWasm0(level, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.composeHash(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `resolve_layers` analogue: the `compose_tile_payloads` driver. Assigns every
 * category into per-tile payloads by its policy. `categories_json` =
 * `[{key, kind, data, strict?, ctx?}]` (kind ∈ {"buildings","vegetation",
 * "ground-materials","terrain","context"}). Returns `{tileId:{key:data}}` JSON.
 * @param {string} categories_json
 * @param {string} tiles_json
 * @param {string} polygon_json
 * @param {string | null} [analysis_type]
 * @returns {string}
 */
export function composeTilePayloads(categories_json, tiles_json, polygon_json, analysis_type) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(categories_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.composeTilePayloads(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.tiling.merger.compute_grid_bounds` port. GeoJSON Polygon +
 * `num_rows × num_cols` tile grid + config JSON → `{min_lon, min_lat, max_lon,
 * max_lat}` JSON (the grid's geographic bbox, SW-anchored, NE extent via the
 * canonical LocalFrame; D1). Throws on an empty grid or a polygon with no
 * usable exterior ring.
 * @param {string} polygon_json
 * @param {number} num_rows
 * @param {number} num_cols
 * @param {string} config_json
 * @returns {string}
 */
export function computeGridBounds(polygon_json, num_rows, num_cols, config_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.computeGridBounds(ptr0, len0, num_rows, num_cols, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Hash of one geometry group for `configHashV2`'s `groupHashesJson`: the
 * registry rule when the kernel has one, else the document hash. Throws on a
 * malformed group.
 * @param {string} model
 * @param {string} name
 * @param {string} group_json
 * @returns {string}
 */
export function configGroupHash(model, name, group_json) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(group_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.configGroupHash(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Hash of one mesh group in buffers, for `configHashV2`'s group hashes: the
 * same value `configGroupHash` gives for the group as JSON. Mesh `i` owns
 * `coordinates[coordinateOffsets[i]..coordinateOffsets[i+1]]` and
 * `indices[indexOffsets[i]..indexOffsets[i+1]]`. `coordinates` is a
 * `Float64Array` or a `Float32Array`. A group with no mesh gives the empty
 * marker `""`; a group with no mesh rule on `model` gives `undefined` (hash
 * it as JSON with `configGroupHash`).
 * @param {string} model
 * @param {string} name
 * @param {string[]} ids
 * @param {any} coordinates
 * @param {Uint32Array} coordinate_offsets
 * @param {Uint32Array} indices
 * @param {Uint32Array} index_offsets
 * @returns {string | undefined}
 */
export function configGroupHashBuffers(model, name, ids, coordinates, coordinate_offsets, indices, index_offsets) {
    const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(coordinate_offsets, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passArray32ToWasm0(index_offsets, wasm.__wbindgen_malloc);
    const len5 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.configGroupHashBuffers(ptr0, len0, ptr1, len1, ptr2, len2, coordinates, ptr3, len3, ptr4, len4, ptr5, len5);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    let v7;
    if (ret[0] !== 0) {
        v7 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v7;
}

/**
 * sha256 (lowercase hex) of a simulation-parameters JSON document — the
 * `configHash` term of the result-cache key ("how it's run", alongside
 * `tileGeoHash`'s "what is there").
 *
 * The kernel canonicalises and hashes whatever it is given (sorted keys, 6dp
 * half-away rounding then integral collapse); the FIELD SET is a documented
 * SDK-side contract (plan §14e), NOT enforced here. Pass the same JSON the
 * server would resolve for the run.
 *
 * THROWS on invalid JSON or a non-object — deliberately, via a Rust panic.
 * An error here is a caller bug, and a binding that returned a hashable error
 * value (an empty string, say) would mint a plausible-looking cache key for
 * an input no client should ever send. Fail loud or not at all.
 * @param {string} config_json
 * @returns {string}
 */
export function configHash(config_json) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.configHash(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Schedule hash of one request: lowercase hex sha256.
 *
 * `controlJson` is the pre-tile request body as JSON text, wire keys, with no
 * geometry groups. `groupHashesJson` is `{key: hash}` for the groups the
 * request holds. The kernel picks the fields from the field registry, hashes
 * an unset field as its server default and refuses a key the registry does
 * not list for `model`. Throws on any refusal.
 * @param {string} model
 * @param {string} control_json
 * @param {string} group_hashes_json
 * @returns {string}
 */
export function configHashV2(model, control_json, group_hashes_json) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(control_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(group_hashes_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.configHashV2(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Seat bring-your-own solids + drape sensor points onto a terrain mesh
 * (`ir_simprep::conform::conform_scene`). TRACK-2 §A datum alignment — the
 * TS-SDK counterpart of the Python wheel's `conform_scene`, identical JSON.
 *
 * `solidsJson`: `{uuid: {coordinates, indices}}` (tile-local meters, same shape
 * as `synthesizeSurfaces` / ground). `sensorPoints`: a FLAT `[x0,y0,z0, …]`
 * buffer (length a multiple of 3). `terrainCoordinates`/`terrainIndices`: a
 * flat triangle mesh in the SAME tile-local frame (like `groundCleanV3OnTerrain`).
 * `mode` ∈ {auto, force, passthrough} (pass `undefined` for `auto`); `edgeRule`
 * ∈ {clamp, skip} (pass `undefined` for `clamp`). `skirtDepthM`/`epsilonM`
 * default (when `undefined`) to the kernel consts.
 *
 * Returns JSON `{solids: {uuid:{coordinates,indices}}, sensor_points:
 * [[x,y,z],…], report: {seated, passthrough, skipped_off_terrain,
 * skipped_non_finite, max_lift_m}}`.
 * Throws on malformed solid/terrain geometry or a bad mode/edge_rule.
 * @param {string} solids_json
 * @param {Float64Array} sensor_points
 * @param {Float64Array} terrain_coordinates
 * @param {Uint32Array} terrain_indices
 * @param {string | null} [mode]
 * @param {number | null} [skirt_depth_m]
 * @param {number | null} [epsilon_m]
 * @param {string | null} [edge_rule]
 * @returns {string}
 */
export function conformScene(solids_json, sensor_points, terrain_coordinates, terrain_indices, mode, skirt_depth_m, epsilon_m, edge_rule) {
    let deferred8_0;
    let deferred8_1;
    try {
        const ptr0 = passStringToWasm0(solids_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(sensor_points, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(terrain_coordinates, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(terrain_indices, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(mode) ? 0 : passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(edge_rule) ? 0 : passStringToWasm0(edge_rule, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len5 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.conformScene(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, !isLikeNone(skirt_depth_m), isLikeNone(skirt_depth_m) ? 0 : skirt_depth_m, !isLikeNone(epsilon_m), isLikeNone(epsilon_m) ? 0 : epsilon_m, ptr5, len5);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr7 = ret[0];
        var len7 = ret[1];
        if (ret[3]) {
            ptr7 = 0; len7 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred8_0 = ptr7;
        deferred8_1 = len7;
        return getStringFromWasm0(ptr7, len7);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred8_0, deferred8_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The context options as the site key names them, resolved by the kernel:
 * an omitted option and its explicit default give the same text (D293).
 * @param {string | null} [options]
 * @returns {string}
 */
export function contextKey(options) {
    let deferred3_0;
    let deferred3_1;
    try {
        var ptr0 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.contextKey(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @returns {string}
 */
export function coreVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.coreVersion();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Count retained façade/roof sensors at the requested grid size without
 * constructing synthesis output arrays. The count never coarsens and a valid
 * zero-survivor scene returns `0n`.
 *
 * `workBudget` limits the region grid cells the count walks, not the
 * retained count (#603). JavaScript receives the `u64` result as a lossless
 * `BigInt`.
 * @param {string} geometries_json
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} work_budget
 * @param {Float64Array | null} [terrain_coordinates]
 * @param {Uint32Array | null} [terrain_indices]
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {string | null} [mesh_cleaning]
 * @returns {bigint}
 */
export function countSurfaces(geometries_json, mode, grid_size, offset, work_budget, terrain_coordinates, terrain_indices, partial_cells, min_coverage, mesh_cleaning) {
    const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(terrain_coordinates) ? 0 : passArrayF64ToWasm0(terrain_coordinates, wasm.__wbindgen_malloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(terrain_indices) ? 0 : passArray32ToWasm0(terrain_indices, wasm.__wbindgen_malloc);
    var len3 = WASM_VECTOR_LEN;
    var ptr4 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.countSurfaces(ptr0, len0, ptr1, len1, grid_size, offset, work_budget, ptr2, len2, ptr3, len3, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, ptr4, len4);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
}

/**
 * The daylight-points frame of a worker JSON result. Throws when the result
 * has no exact frame.
 * @param {Uint8Array} result
 * @returns {Uint8Array}
 */
export function daylightFrameFromJson(result) {
    const ptr0 = passArray8ToWasm0(result, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.daylightFrameFromJson(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * The worker's JSON bytes of a daylight-points frame, byte for byte.
 * @param {Uint8Array} frame
 * @returns {Uint8Array}
 */
export function daylightJsonFromFrame(frame) {
    const ptr0 = passArray8ToWasm0(frame, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.daylightJsonFromFrame(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Join the part results (unzipped JSON bytes, in plan order) into the bytes
 * of the single-request result. Throws when they do not join.
 * @param {string} plan
 * @param {Uint8Array[]} results
 * @returns {Uint8Array}
 */
export function daylightMerge(plan, results) {
    const ptr0 = passStringToWasm0(plan, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(results, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.daylightMerge(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Join the part results (each a daylight-points frame or the worker's JSON
 * bytes, in plan order; `plan` as JSON) into the frame of the
 * single-request result. Throws when they do not join or have no exact
 * frame.
 * @param {string} plan
 * @param {Uint8Array[]} parts
 * @returns {Uint8Array}
 */
export function daylightMergeBinary(plan, parts) {
    const ptr0 = passStringToWasm0(plan, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(parts, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.daylightMergeBinary(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * The request body of one part (`part`: one entry of the plan's `parts`,
 * JSON): the request with only `floors` changed.
 * @param {Uint8Array} request
 * @param {string} part
 * @returns {Uint8Array}
 */
export function daylightPartBody(request, part) {
    const ptr0 = passArray8ToWasm0(request, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(part, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.daylightPartBody(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Pack a request's floors into parts of whole floors of at most `target`
 * sensors (default 300 000, `PART_SENSOR_TARGET`): the plan as JSON `{tier, target,
 * total_sensors, parts: [{key, floors, floor_keys, sensors, range?}],
 * unsplit_reason}`.
 * @param {Uint8Array} request
 * @param {number | null} [target]
 * @returns {string}
 */
export function daylightParts(request, target) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(request, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.daylightParts(ptr0, len0, isLikeNone(target) ? Number.MAX_SAFE_INTEGER : (target) >>> 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The exact sensors per floor of a daylight-factor request body, as the
 * worker makes them: JSON `{tier, floors: [{key, selector, sensors,
 * sensors_sha256}], total}`. Throws the worker's 422 text for a floor the
 * worker would refuse.
 * @param {Uint8Array} request
 * @returns {string}
 */
export function daylightSensorCounts(request) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(request, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.daylightSensorCounts(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Validate a result frame and return independent owned section byte arrays.
 *
 * Input length is checked before copying into WASM. Family validation finishes
 * before any output array is allocated. Output sections do not retain input.
 * @param {Uint8Array} buffer
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {number} max_sections
 * @param {bigint} max_elements_per_section
 * @param {number} max_metadata_depth
 * @param {bigint} max_cells
 * @param {bigint} max_triangle_values
 * @returns {any}
 */
export function decodeBinaryResult(buffer, max_total_bytes, max_metadata_bytes, max_sections, max_elements_per_section, max_metadata_depth, max_cells, max_triangle_values) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeBinaryResult(buffer, max_total_bytes, max_metadata_bytes, max_sections, max_elements_per_section, max_metadata_depth, max_cells, max_triangle_values);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Validate a daylight-points frame and describe it: `{schema_version,
 * layout, sensor_count, legend, sections, groups, rooms, buildings,
 * warnings, chunk}` (snake_case keys, as the Python binding). `sections`
 * gives each per-sensor column's `{offset, count, dtype}` inside `frame`:
 * copy the frame once into a fresh `Uint8Array` and build
 * `new Float64Array(u8.buffer, u8.byteOffset + offset, count)` views.
 * @param {Uint8Array} frame
 * @returns {any}
 */
export function decodeDaylightResult(frame) {
    const ptr0 = passArray8ToWasm0(frame, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeDaylightResult(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} response_bytes
 * @param {string | null} [expected_kind]
 * @returns {GridDocumentDecode}
 */
export function decodeGridDocument(response_bytes, expected_kind) {
    const ptr0 = passArray8ToWasm0(response_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(expected_kind) ? 0 : passStringToWasm0(expected_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeGridDocument(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return GridDocumentDecode.__wrap(ret[0]);
}

/**
 * @param {string} response_json
 * @param {string | null} [expected_kind]
 * @returns {GridDecode}
 */
export function decodeGridResponse(response_json, expected_kind) {
    const ptr0 = passStringToWasm0(response_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(expected_kind) ? 0 : passStringToWasm0(expected_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeGridResponse(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return GridDecode.__wrap(ret[0]);
}

/**
 * The decoded tiles of a `decodeGridTilesStart` task.
 * @param {PoolTask} task
 * @returns {GridTiles}
 */
export function decodeGridTilesEnd(task) {
    _assertClass(task, PoolTask);
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeGridTilesEnd(task.__wbg_ptr);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return GridTiles.__wrap(ret[0]);
}

/**
 * Decode many grid tile archives (ZIP or GZIP, JSON or strict IRBF) in ONE
 * call: on the rayon pool in the threaded core, one after the other in the
 * serial core. The result is the same. An archive that does not decode is
 * not an error here: `pushMany` gives its reason. `...Start` returns a
 * `PoolTask` at once; `decodeGridTilesEnd` takes the decoded tiles.
 * @param {Uint8Array[]} archives
 * @returns {PoolTask}
 */
export function decodeGridTilesStart(archives) {
    const ptr0 = passArrayJsValueToWasm0(archives, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeGridTilesStart(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return PoolTask.__wrap(ret);
}

/**
 * Decode one downloaded AREA result archive (ZIP or GZIP, one entry):
 * inflate, then either flatten a JSON grid or hand back a strict IRBF
 * document undecoded. Replaces the host's own inflate + `JSON.parse` +
 * per-cell flatten for the JSON route (ADR 0006).
 * @param {Uint8Array} archive
 * @returns {ResultArchiveDecode}
 */
export function decodeResultArchive(archive) {
    const ptr0 = passArray8ToWasm0(archive, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeResultArchive(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ResultArchiveDecode.__wrap(ret[0]);
}

/**
 * @param {string} response_json
 * @returns {string}
 */
export function decodeSurfaceIdentity(response_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(response_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.decodeSurfaceIdentity(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The decoded jobs of a `decodeSurfaceJobsStart` task.
 * @param {PoolTask} task
 * @returns {SurfaceJobs}
 */
export function decodeSurfaceJobsEnd(task) {
    _assertClass(task, PoolTask);
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeSurfaceJobsEnd(task.__wbg_ptr);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return SurfaceJobs.__wrap(ret[0]);
}

/**
 * Decode many surface archives (ZIP or GZIP, JSON or IRBF) in ONE call: on
 * the rayon pool in the threaded core, one after the other in the serial
 * core. The result is the same. An archive that does not decode is not an
 * error here: `pushMany` gives its reason. The limits are those of
 * `SurfaceJoinStream`'s constructor. Returns a `PoolTask` at once
 * (`pool_task`); `decodeSurfaceJobsEnd` takes the decoded jobs.
 * @param {Uint8Array[]} archives
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {bigint} max_cells
 * @param {bigint} max_triangle_values
 * @returns {PoolTask}
 */
export function decodeSurfaceJobsStart(archives, max_total_bytes, max_metadata_bytes, max_cells, max_triangle_values) {
    const ptr0 = passArrayJsValueToWasm0(archives, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.decodeSurfaceJobsStart(ptr0, len0, max_total_bytes, max_metadata_bytes, max_cells, max_triangle_values);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return PoolTask.__wrap(ret);
}

/**
 * Tree dedup across sources (city-OGD wins). features JSON in/out.
 * @param {string} features_json
 * @param {number} radius_m
 * @param {string[]} preferred_sources
 * @param {boolean | null} [same_source_dedup]
 * @returns {string}
 */
export function dedupTrees(features_json, radius_m, preferred_sources, same_source_dedup) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(features_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(preferred_sources, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.dedupTrees(ptr0, len0, radius_m, ptr1, len1, isLikeNone(same_source_dedup) ? 0xFFFFFF : same_source_dedup ? 1 : 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The area tree dedup. JSON array of per-tile FeatureCollections (or `null`)
 * → `{dedup_key: feature}` JSON (first-seen); each feature keeps its own text.
 * @param {string} tile_results_json
 * @returns {string}
 */
export function dedupVegetationFeatures(tile_results_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(tile_results_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.dedupVegetationFeatures(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The automatic ground-material order, weakest first.
 * @returns {any[]}
 */
export function defaultPrecedence() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.defaultPrecedence();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * The transport for `analysisType` when the caller names none (D196):
 * `"binary"`, or `"json"` for an analysis with no binary route. See
 * `ir_geo::transport_choice`.
 * @param {string} analysis_type
 * @returns {string}
 */
export function defaultTransport(analysis_type) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.defaultTransport(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Drop each mesh of a packed geometry group so its own lowest point is z = 0.
 *
 * `coordinates` is every mesh's flat `[x, y, z, ...]` array, concatenated, as
 * little-endian f64 bytes; `offsets` names where each starts and where the
 * last ends, counting ELEMENTS, so it holds one more entry than there are
 * meshes. A ZERO-LENGTH slot is a mesh the host could not read and is left
 * alone.
 *
 * Returns `{ coordinates: Uint8Array, removed: Float64Array }`: the dropped
 * buffer in the same packing, and one value per mesh — the z that was
 * subtracted, exactly `0` for a mesh this pass left untouched. The host writes
 * back only the meshes that moved, so an already-at-grade site keeps the
 * caller's own coordinate arrays and goes on the wire byte-for-byte as before.
 * @param {Uint8Array} coordinates
 * @param {Uint32Array} offsets
 * @returns {object}
 */
export function dropToGrade(coordinates, offsets) {
    const ptr0 = passArray8ToWasm0(coordinates, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(offsets, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.dropToGrade(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * `ir_geo::tiling::categorical::encode_categorical_grid` binding. A 2-D JSON
 * grid of category cells (`[[str|null,...],...]`, must be rectangular) + a
 * `cat_map` JSON (`{category: index}`) → a base64(f32 LE) grid `{rows, cols,
 * data_bin}`. Cells that are null / empty / absent from the map become NaN.
 * Rides the same f32 grid wire as `mergeTiles` so PWC categorical layers
 * compose uniformly.
 * @param {string} grid_json
 * @param {string} cat_map_json
 * @returns {string}
 */
export function encodeCategoricalGrid(grid_json, cat_map_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(grid_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(cat_map_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.encodeCategoricalGrid(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The surface schema 2 IRBF frame of one surface result archive (ZIP or
 * GZIP, one entry, JSON or strict IRBF), written by the kernel's surface
 * writer with `f64` sections. For tests and for converting stored results.
 * @param {Uint8Array} archive
 * @returns {Uint8Array}
 */
export function encodeSurfaceArchive(archive) {
    const ptr0 = passArray8ToWasm0(archive, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.encodeSurfaceArchive(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * The year the server uses for an energy-balance request. `year` undefined:
 * `nowYear`, or the year before in a leap year with 8760 rows. The host
 * passes the clock.
 * @param {number | null | undefined} year
 * @param {number} now_year
 * @param {number} rows
 * @returns {number}
 */
export function energyBalanceYear(year, now_year, rows) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.energyBalanceYear(isLikeNone(year) ? Number.MAX_SAFE_INTEGER : (year) >> 0, now_year, rows);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * What an error of `RunEngine.step` means: `{"kind", "status"?, "message"}`.
 * @param {string} message
 * @returns {string}
 */
export function engineStop(message) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.engineStop(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * sha256 (lowercase hex) of ONE ground-material layer — a material NAME plus
 * the polygons carrying it (D25).
 *
 * `collectionJson` is the GeoJSON FeatureCollection the wire carries for this
 * material. Only Polygon and MultiPolygon features are hashed: clean-v3 drops
 * the rest, so they are not simulated. Feature `id` and `properties` are NOT
 * hashed — lambda-models strips both before clean-v3, so hashing them would
 * guarantee the client's value never matched the server's.
 *
 * Coordinates are WGS84 DEGREES and are hashed as f64, never narrowed to f32
 * the way `entityHashMesh` narrows tile-local meters — the f32 ULP at
 * longitude 16.37 is about 20 cm on the ground.
 *
 * The material name is in the preimage: the thermal models simulate
 * materials, so the same footprint under `"asphalt"` and `"water"` is
 * different ground. An empty layer is valid. Throws on structural garbage or
 * a non-finite coordinate.
 * @param {string} material
 * @param {string} collection_json
 * @returns {string}
 */
export function entityHashGroundLayer(material, collection_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(material, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(collection_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.entityHashGroundLayer(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * sha256 (lowercase hex) of ONE instanced-vegetation group (trees) — the tree
 * equivalent of `entityHashMesh`.
 *
 * `tuples` is the flat `[scale_xy, scale_z, tx, ty]` × n that `instances_bin`
 * carries, as f64. NOT narrowed (unlike coordinates): `instances_bin` is
 * `base64(f64 LE)` and the vegetation parity contract is f64 end-to-end, so
 * every difference counts however small — and there is only one transport, since
 * no plain-JSON `instances` array exists.
 *
 * `registryVersion` and `template` are REQUIRED and hashed: expansion hard-fails
 * on registry skew ("never places wrong-sized trees"), so the same tuples under
 * a different registry are different geometry. Tree ids are NOT hashed (labels,
 * not shape) but their order is, because the tuples are parallel to them.
 *
 * Throws if `tuples` is not a whole number of trees (a multiple of 4) or holds a
 * non-finite value. An empty group is valid.
 * @param {string} template
 * @param {Float64Array} tuples
 * @param {string} registry_version
 * @returns {string}
 */
export function entityHashInstances(template, tuples, registry_version) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(template, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(tuples, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(registry_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.entityHashInstances(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * sha256 (lowercase hex) of ONE triangle-mesh entity — a building, a terrain
 * patch: the Merkle leaf.
 *
 * Hashes the canonical `coordinates_bin`/`indices_bin` packing bytes, so a
 * mesh sent as JSON and the same mesh sent binary share one hash. Coordinates
 * must already be tile-local (`|coord| < 1e5`, rule 6) — throws otherwise
 * rather than hashing a silently-narrowed value.
 * @param {Float64Array} coordinates
 * @param {Uint32Array} indices
 * @returns {string}
 */
export function entityHashMesh(coordinates, indices) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passArrayF64ToWasm0(coordinates, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.entityHashMesh(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.preflight.estimate_sun_context_loss` port — direct-sun-hours
 * context-buffer diagnostic. Returns the JSON `SunContextResult` (severity,
 * message, numeric fields). Never throws. Optional args mirror the Python
 * wheel's defaults: `lon=0`, `buffer_m=128`, `typical_building_height_m=25`;
 * `timezone_offset_h`/`max_building_height_m` default to `None` (undefined).
 * @param {number} lat
 * @param {bigint} start_month
 * @param {bigint} start_day
 * @param {bigint} start_hour
 * @param {bigint} end_month
 * @param {bigint} end_day
 * @param {bigint} end_hour
 * @param {number | null} [lon]
 * @param {number | null} [timezone_offset_h]
 * @param {number | null} [buffer_m]
 * @param {number | null} [typical_building_height_m]
 * @param {number | null} [max_building_height_m]
 * @returns {string}
 */
export function estimateSunContextLoss(lat, start_month, start_day, start_hour, end_month, end_day, end_hour, lon, timezone_offset_h, buffer_m, typical_building_height_m, max_building_height_m) {
    let deferred2_0;
    let deferred2_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.estimateSunContextLoss(lat, start_month, start_day, start_hour, end_month, end_day, end_hour, !isLikeNone(lon), isLikeNone(lon) ? 0 : lon, !isLikeNone(timezone_offset_h), isLikeNone(timezone_offset_h) ? 0 : timezone_offset_h, !isLikeNone(buffer_m), isLikeNone(buffer_m) ? 0 : buffer_m, !isLikeNone(typical_building_height_m), isLikeNone(typical_building_height_m) ? 0 : typical_building_height_m, !isLikeNone(max_building_height_m), isLikeNone(max_building_height_m) ? 0 : max_building_height_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `VegetationInstances` JSON → `{id: mesh}` JSON (bit-identical to
 * `vegetationPointsToMeshes`). `expectedRegistryVersion` skew errors loudly.
 * @param {string} instances_json
 * @param {string} registry_json
 * @param {string} expected_registry_version
 * @returns {string}
 */
export function expandInstances(instances_json, registry_json, expected_registry_version) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(instances_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(registry_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(expected_registry_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.expandInstances(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Write a named mesh batch as text: `format` `"dotbim"` (the open JSON mesh
 * format), `"obj"` (Wavefront OBJ) or `"json"` (the SDK geometry dict, the
 * form `context-geometry` takes). `types` is the dotbim element type per
 * name (empty or `""` = `"Context"`).
 * @param {string[]} names
 * @param {any} coordinates
 * @param {Uint32Array} vert_offsets
 * @param {Uint32Array} indices
 * @param {Uint32Array} face_offsets
 * @param {string} format
 * @param {string[] | null} [types]
 * @returns {string}
 */
export function exportMeshes(names, coordinates, vert_offsets, indices, face_offsets, format, types) {
    let deferred8_0;
    let deferred8_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(names, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(vert_offsets, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(face_offsets, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(types) ? 0 : passArrayJsValueToWasm0(types, wasm.__wbindgen_malloc);
        var len5 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.exportMeshes(ptr0, len0, coordinates, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr7 = ret[0];
        var len7 = ret[1];
        if (ret[3]) {
            ptr7 = 0; len7 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred8_0 = ptr7;
        deferred8_1 = len7;
        return getStringFromWasm0(ptr7, len7);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred8_0, deferred8_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Extrude normalised footprints into dotbim meshes — the geometry operation
 * the direct buildings path was missing.
 *
 * `geojsonLayersToDotbim` triangulates FLAT at z = 0 and reads no height
 * property (extrusion is utils#83), so it cannot serve this path. This is
 * caps plus walls from z = 0 to `height` (or `defaultHeight` when the
 * footprint has none); `min_height` is carried by the normaliser and
 * deliberately not read (the Lambda extrudes from ground). Non-positive
 * extrusions are skipped, and features sharing a building id merge into one
 * mesh. Coordinates are local metres in the explicit origin frame. Returns
 * `{building_id: {mesh_id, coordinates, indices}}`, the shape
 * `POST /buildings` returns.
 *
 * Features whose geometry is not a Polygon/MultiPolygon are skipped and
 * absent from the output; a host detects them by diffing input ids against
 * output keys.
 * @param {string} fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {number} default_height
 * @returns {string}
 */
export function extrudeFootprintsToDotbim(fc, origin_lon, origin_lat, default_height) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.extrudeFootprintsToDotbim(ptr0, len0, origin_lon, origin_lat, default_height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `extrudeFootprintsToDotbim` plus the attributes a mesh cannot carry.
 *
 * Returns `{meshes, attributes}` from ONE walk, so an attribute row exists
 * exactly where its mesh does. `height` is the height the mesh was built to.
 * @param {string} fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {number} default_height
 * @returns {string}
 */
export function extrudeFootprintsWithAttributes(fc, origin_lon, origin_lat, default_height) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.extrudeFootprintsWithAttributes(ptr0, len0, origin_lon, origin_lat, default_height);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Load a facade layout's export bytes back into the same held shape
 * `synthesize_facade_layout` gives (`fields()`/`toBytes()` both work; a
 * `toBytes()` right back is a cheap re-compression of what was just
 * decompressed, not a synthesis). Every elided (derivable) cell has
 * already been regenerated.
 * @param {Uint8Array} bytes
 * @returns {FacadeLayoutHandle}
 */
export function facadeLayoutFromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.facadeLayoutFromBytes(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return FacadeLayoutHandle.__wrap(ret[0]);
}

/**
 * Phase 3: decode the fetched feature ranges.
 *
 * `header` is the first `12 + header_len` bytes; `featuresBytes` the fetched
 * `features` range bodies concatenated IN ORDER. The bbox re-applies the
 * envelope filter, because merged ranges deliberately carry features nobody
 * asked for.
 * @param {Uint8Array} header
 * @param {Uint8Array} features_bytes
 * @param {number} min_lon
 * @param {number} min_lat
 * @param {number} max_lon
 * @param {number} max_lat
 * @returns {string}
 */
export function fgbDecodeRangeFeatures(header, features_bytes, min_lon, min_lat, max_lon, max_lat) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(features_bytes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.fgbDecodeRangeFeatures(ptr0, len0, ptr1, len1, min_lon, min_lat, max_lon, max_lat);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Phase 2: one step of the stateless packed-R-tree walk.
 *
 * `header` is the first `12 + header_len` bytes. `fileSize` is MANDATORY —
 * it closes the last feature's range, which the index cannot. `fetchedNodes`
 * is an array of `{offset, bytes}` for every index range fetched so far.
 *
 * Returns `{need: [[offset, length], ...], features: [[offset, length],
 * ...]}`. While `need` is non-empty, fetch those ranges, append them to
 * `fetchedNodes` and call again; when it is empty, fetch the `features`
 * ranges, concatenate the bodies IN ORDER, and hand them to
 * [`fgb_decode_range_features`]. A host that already holds the WHOLE index
 * passes it as one entry and finishes in a single step — a convenience for
 * SMALL files only, since a world-sized index is hundreds of megabytes and
 * the whole point of the walk is never to read it.
 *
 * `mergeGapBytes` overrides the 256 KiB gap budget the `features` ranges are
 * merged on; omit it for the default the Python twin also uses.
 * @param {Uint8Array} header
 * @param {number} min_lon
 * @param {number} min_lat
 * @param {number} max_lon
 * @param {number} max_lat
 * @param {number} file_size
 * @param {Array<any>} fetched_nodes
 * @param {number | null} [merge_gap_bytes]
 * @returns {object}
 */
export function fgbIndexSearchStep(header, min_lon, min_lat, max_lon, max_lat, file_size, fetched_nodes, merge_gap_bytes) {
    const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.fgbIndexSearchStep(ptr0, len0, min_lon, min_lat, max_lon, max_lat, file_size, fetched_nodes, !isLikeNone(merge_gap_bytes), isLikeNone(merge_gap_bytes) ? 0 : merge_gap_bytes);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Phase 1 of a FlatGeobuf range read: where the file's sections are.
 *
 * `prefix` is the first bytes of the file (16 KiB covers the files we
 * publish). Returns an object with `header_len` and `required_prefix_len`
 * always, and — once the prefix reaches the whole header — `index_len`,
 * `features_offset`, `features_count` and `index_node_size`. A short prefix
 * leaves those four `null` and `required_prefix_len` names the length to
 * fetch, rather than throwing.
 * @param {Uint8Array} prefix
 * @returns {object}
 */
export function fgbLayout(prefix) {
    const ptr0 = passArray8ToWasm0(prefix, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.fgbLayout(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * FlatGeobuf bytes -> GeoJSON features JSON (whole file).
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function fgbToFeatures(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.fgbToFeatures(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * FlatGeobuf bytes -> GeoJSON features JSON within a bbox (spatial index).
 * @param {Uint8Array} bytes
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 * @returns {string}
 */
export function fgbToFeaturesBbox(bytes, west, south, east, north) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.fgbToFeaturesBbox(ptr0, len0, west, south, east, north);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The field registry: one JSON document with, for each routed model, every
 * request field (wire key, JSON type, enum, range, doc, hash class and
 * server default). It is the committed document of `ir-schemas`.
 * @returns {string}
 */
export function fieldRegistryJson() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.fieldRegistryJson();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The buildings fingerprint (version 4): the per-tile kernel group hashes,
 * sorted, and the optional attributes hash, folded to `v4:<sha256>`.
 * @param {string[]} hashes
 * @param {string | null} [attributes_hash]
 * @returns {string}
 */
export function foldBuildingsFingerprint(hashes, attributes_hash) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(hashes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(attributes_hash) ? 0 : passStringToWasm0(attributes_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.foldBuildingsFingerprint(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Re-anchor every metre-frame coordinate of a document from one local frame
 * into another, EXACTLY.
 *
 * The SDK extrudes buildings and composes ground ONCE in the SITE frame (the
 * `LocalFrame` at the AOI south-west corner, `DEVIATIONS.md` D1); the
 * simulation server projects EACH TILE at that tile's own reference point.
 * This is the map between the two, and it is not a translation — `LocalFrame`
 * fixes the east-west scale at the frame's ORIGIN latitude:
 *
 * ```text
 * x' = x * cos(lat1)/cos(lat0) + dx        y' = y + dy        z' = z
 * ```
 *
 * with `(dx, dy)` the frame-0 origin expressed in frame 1. The scale is the
 * TARGET cosine over the SOURCE cosine; a constant offset leaves it behind
 * (8.9 mm across one 512 m tile, of order a metre across a 5 km² site).
 *
 * `document` is a JSON OBJECT whose every entry is a mesh
 * (`{meshId, coordinates: [x, y, z, ...], indices}`), a GeoJSON
 * FeatureCollection in LOCAL METRES, or `null` (which passes through, as
 * `groundMaterialsComposeTiles` emits for a rectangle that composed
 * nothing). Anything else throws: a document half of which is still in the
 * old frame is the failure this operation removes. A stale `bbox` member is
 * REMOVED rather than left describing the old frame.
 *
 * **Coordinates must be METRES.** A document in WGS84 degrees carries no
 * frame and cannot be told apart — `groundCleanV3` output is degrees (with
 * the Z in metres) and must NOT be passed here.
 * @param {string} document
 * @param {number} lon0
 * @param {number} lat0
 * @param {number} lon1
 * @param {number} lat1
 * @returns {string}
 */
export function frameReanchor(document, lon0, lat0, lon1, lat1) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.frameReanchor(ptr0, len0, lon0, lat0, lon1, lat1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`frame_reanchor`] with the document crossing as a `Uint8Array` in and
 * out — the same operation and the same bytes, without the JS string
 * traversal in either direction (WP14-D).
 * @param {Uint8Array} document
 * @param {number} lon0
 * @param {number} lat0
 * @param {number} lon1
 * @param {number} lat1
 * @returns {Uint8Array}
 */
export function frameReanchorBytes(document, lon0, lat0, lon1, lat1) {
    const ptr0 = passArray8ToWasm0(document, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.frameReanchorBytes(ptr0, len0, lon0, lat0, lon1, lat1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * `infrared_sdk.tiling.tiles.generate_tiles_for_polygon` port. JSON Polygon in
 * → JSON VERDICT out (canonical LocalFrame stepping, DEVIATIONS D1):
 *
 * * ok:    `{"ok": true, "tiles": [[{tileId,empty,centroid,size}]]}`
 * * error: `{"ok": false, "kind": "bbox_too_large" | "too_many_non_empty", …}`
 *
 * A tile CAP is a verdict the caller acts on, not a failed call, so it comes
 * back as a value — the same shape the python and dotnet bindings already use
 * for this function (ADR 0010). The TS SDK composes the sentence, because only
 * it knows the knob is spelled `maxTilesOverride` there and `max_tiles_override`
 * in Python; a `JsError` carrying the kernel's own text could not say either.
 * Everything else — a malformed polygon, a ring with no vertices — is still a
 * `JsError`, which is the binding-wide convention for "the call itself failed".
 * @param {string} polygon_json
 * @param {string | null} [analysis_type]
 * @param {number | null} [max_tiles_override]
 * @returns {string}
 */
export function generateTilesForPolygon(polygon_json, analysis_type, max_tiles_override) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.generateTilesForPolygon(ptr0, len0, ptr1, len1, isLikeNone(max_tiles_override) ? Number.MAX_SAFE_INTEGER : (max_tiles_override) >>> 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * utilities-service `POST /geometries/geojson-to-dotbim` port: JSON string
 * `{layerId: FeatureCollection}` → JSON string `{layerId: [flat mesh]}`.
 * @param {string} layers_json
 * @returns {string}
 */
export function geojsonLayersToDotbim(layers_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.geojsonLayersToDotbim(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * One body's IRBF geometry artifact (D101): the geometry groups of
 * `bodyJson` as given — packed, framed, zipped and digested in the kernel.
 * The direct `submit` path; an area run takes `SiteAssignment.artifacts`.
 *
 * Returns `{archive: Uint8Array, artifactDigest, contentDigest, encoding}`.
 * @param {string} body_json
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {bigint} max_meshes
 * @param {bigint} max_instances
 * @returns {any}
 */
export function geometryArtifact(body_json, max_total_bytes, max_metadata_bytes, max_meshes, max_instances) {
    const ptr0 = passStringToWasm0(body_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.geometryArtifact(ptr0, len0, max_total_bytes, max_metadata_bytes, max_meshes, max_instances);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decode a geometry frame (schema 1 or 2) and return its content as JSON
 * text: `{"metadata": <the schema 1 shape>, "sensors": {"points", "normals"}
 * | null}`. For tests and diagnostics; the upload path never decodes.
 * @param {Uint8Array} frame
 * @returns {string}
 */
export function geometryDocumentJson(frame) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(frame, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.geometryDocumentJson(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Hash one S1 geometry group from its wire JSON.
 *
 * Uses the registry's `HashKind` and existing leaf preimages. Returns null
 * when the registry says the group has no hash rule. Throws for an unknown
 * name, invalid JSON, or a malformed hashable group.
 * @param {string} group_name
 * @param {string} group_json
 * @returns {any}
 */
export function geometryGroupHash(group_name, group_json) {
    const ptr0 = passStringToWasm0(group_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(group_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.geometryGroupHash(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Return plain records so JavaScript hosts need no Rust-specific wrapper type.
 * @returns {Array<any>}
 */
export function geometryGroups() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.geometryGroups();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * The geometry schema this kernel writes. A host submits binary geometry
 * only to a server whose capability document lists it.
 * @returns {number}
 */
export function geometrySchemaVersion() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.geometrySchemaVersion();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * Return the kernel-owned tiling preset for an analysis type as JSON.
 * @param {string | null} [analysis_type]
 * @returns {string}
 */
export function getTilingConfig(analysis_type) {
    let deferred3_0;
    let deferred3_1;
    try {
        var ptr0 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.getTilingConfig(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Colormap a 2-D grid of f32 (row-major, NaN = no-data) to PNG bytes
 * (`Uint8Array`). Mirror of the Python wheel's `grid_to_png` — gives the
 * webapp local image rendering. `vmin`/`vmax`: explicit range; pass both as
 * `undefined` for auto. `colors`: a flat 256×3 RGB buffer (768 bytes) for a
 * registry LUT, or `undefined` for magma_r. `alpha` + `bad_*` apply to a
 * custom LUT (magma_r carries its own); all OPTIONAL and default to the
 * Python wheel's values (alpha 255, bad = opaque white) so an omitted/
 * `undefined` arg can't silently render everything transparent.
 *
 * `maxLongAxisPx` caps the LONG axis of the image, 960 px when it is omitted
 * — the same default the wheel ships. A grid at or below the cap renders
 * 1:1, byte for byte as before; a larger one is sampled nearest-neighbour on
 * the VALUES before colouring, keeping its aspect ratio and its no-data cells
 * (DEVIATIONS D9). **Pass `0` for the uncapped 1:1 image**: JavaScript cannot
 * tell an omitted argument from an explicit `undefined`, so `0` is the
 * opt-out here where the wheel also accepts `None`.
 *
 * `reverseRows` is OPTIONAL and defaults to `false`, which emits grid row 0
 * as the TOP PNG row. `true` is for a caller whose grid is already bottom-up.
 * The flip is on the OUTPUT rows, AFTER the cap has sampled the grid — the
 * same rule `renderGridRegistry` follows, so the two paths place a row
 * identically at any cap. A host must never pre-flip the grid instead: a
 * nearest-neighbour map is not symmetric for every size pair, and the two
 * answers differ by up to one grid row above the cap.
 * @param {Float32Array} values
 * @param {number} width
 * @param {number} height
 * @param {number | null} [vmin]
 * @param {number | null} [vmax]
 * @param {Uint8Array | null} [colors]
 * @param {number | null} [alpha]
 * @param {number | null} [bad_r]
 * @param {number | null} [bad_g]
 * @param {number | null} [bad_b]
 * @param {number | null} [bad_a]
 * @param {number | null} [max_long_axis_px]
 * @param {boolean | null} [reverse_rows]
 * @returns {Uint8Array}
 */
export function gridToPng(values, width, height, vmin, vmax, colors, alpha, bad_r, bad_g, bad_b, bad_a, max_long_axis_px, reverse_rows) {
    const ptr0 = passArrayF32ToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(colors) ? 0 : passArray8ToWasm0(colors, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.gridToPng(ptr0, len0, width, height, !isLikeNone(vmin), isLikeNone(vmin) ? 0 : vmin, !isLikeNone(vmax), isLikeNone(vmax) ? 0 : vmax, ptr1, len1, isLikeNone(alpha) ? 0xFFFFFF : alpha, isLikeNone(bad_r) ? 0xFFFFFF : bad_r, isLikeNone(bad_g) ? 0xFFFFFF : bad_g, isLikeNone(bad_b) ? 0xFFFFFF : bad_b, isLikeNone(bad_a) ? 0xFFFFFF : bad_a, isLikeNone(max_long_axis_px) ? Number.MAX_SAFE_INTEGER : (max_long_axis_px) >>> 0, isLikeNone(reverse_rows) ? 0xFFFFFF : reverse_rows ? 1 : 0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * utilities-service `POST /ground-material/clean-v3` port. JSON-in/out.
 * Pass `z_step = undefined` for the fixed default (0.05, DEVIATIONS.md D5).
 * @param {string} layers_json
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {string}
 */
export function groundCleanV3(layers_json, latitude, longitude, distance, default_layer, z_step) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundCleanV3(ptr0, len0, latitude, longitude, distance, ptr1, len1, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * clean-v3 with the material layers DRAPED onto a terrain mesh (TRACK-2 §A).
 *
 * `terrainCoordinates`/`terrainIndices` are a flat triangle mesh in LOCAL
 * METERS; `frameOriginLon`/`frameOriginLat` pin the WGS84→local projection so
 * the material layers (WGS84 degrees) sample the right surface. Points outside
 * the mesh fall back to a flat base of 0. Pass `z_step = undefined` for the
 * fixed default (0.05, DEVIATIONS.md D5). An empty terrain mesh is equivalent
 * to `groundCleanV3`.
 * @param {string} layers_json
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {Float64Array} terrain_coordinates
 * @param {Uint32Array} terrain_indices
 * @param {number} frame_origin_lon
 * @param {number} frame_origin_lat
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {string}
 */
export function groundCleanV3OnTerrain(layers_json, latitude, longitude, distance, terrain_coordinates, terrain_indices, frame_origin_lon, frame_origin_lat, default_layer, z_step) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(terrain_coordinates, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(terrain_indices, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundCleanV3OnTerrain(ptr0, len0, latitude, longitude, distance, ptr1, len1, ptr2, len2, frame_origin_lon, frame_origin_lat, ptr3, len3, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The per-material leaves of a whole `ground-materials` object, sorted by
 * material name — what a producer folds into `composed`.
 *
 * `layersJson` is the wire object itself (`{"asphalt": {...}, ...}`). The
 * returned ORDER is a convenience only: every fold that consumes these sorts.
 * @param {string} layers_json
 * @returns {string[]}
 */
export function groundMaterialLeaves(layers_json) {
    const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.groundMaterialLeaves(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * Ground-material layers from direct sources — utilities-service
 * `GET /ground-material/collect?source=fgb`.
 *
 * `roadsFc` is a FeatureCollection of road centrelines as
 * [`roads_normalize`] emits them; `overtureFc` one of Overture `water` /
 * `land_cover` / `land_use` features.
 *
 * **`originLon` / `originLat` is the AOI-level frame origin — the tiling
 * polygon-bbox south-west corner — and must be the SAME for every tile of
 * one area**, or overlapping tiles buffer the same road to two different
 * vertex sets and every duplicate survives the tile-layer merge.
 * `minLon`..`maxLat` is the TILE query bbox; Overture features are clipped
 * to it, as the reference clips them at fetch time.
 *
 * Returns the JSON `{asphalt, concrete, water, soil, vegetation}` in that
 * canonical z order, ready for `groundCleanV3`. See DEVIATIONS D35.
 * @param {string} roads_fc
 * @param {string} overture_fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {number} min_lon
 * @param {number} min_lat
 * @param {number} max_lon
 * @param {number} max_lat
 * @returns {string}
 */
export function groundMaterialsCompose(roads_fc, overture_fc, origin_lon, origin_lat, min_lon, min_lat, max_lon, max_lat) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(roads_fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(overture_fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundMaterialsCompose(ptr0, len0, ptr1, len1, origin_lon, origin_lat, min_lon, min_lat, max_lon, max_lat);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Compose every tile AND merge and clean them, in ONE kernel call.
 *
 * The fused operation `getArea` calls: `groundMaterialsComposeTiles` followed
 * by `mergeAndCleanTileLayers`, with the intermediate array never built. Tile
 * *i*'s document is composed, merged and dropped before tile *i + 1* is
 * composed, so neither the host nor the kernel holds N per-tile documents.
 *
 * A fused operation takes and returns the SAME opaque documents its parts do
 * (`docs/sdk-data-flow.md`), so running the two steps by hand gives the same
 * bytes.
 *
 * The first five arguments are `groundMaterialsComposeTiles`'s; the last five
 * are `mergeAndCleanTileLayers`'s, unchanged (`defaultLayer` omitted → the
 * clean step's own `asphalt`; `zStep` omitted → 0.05 m, DEVIATIONS D5).
 *
 * An area that composed nothing returns `{}` WITHOUT cleaning.
 * @param {string} roads_by_tile
 * @param {string} overture_fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {string} tiles
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {string}
 */
export function groundMaterialsComposeAndMerge(roads_by_tile, overture_fc, origin_lon, origin_lat, tiles, latitude, longitude, distance, default_layer, z_step) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(roads_by_tile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(overture_fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(tiles, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundMaterialsComposeAndMerge(ptr0, len0, ptr1, len1, origin_lon, origin_lat, ptr2, len2, latitude, longitude, distance, ptr3, len3, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`ground_materials_compose_and_merge`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 * @param {Uint8Array} roads_by_tile
 * @param {Uint8Array} overture_fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {Uint8Array} tiles
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {Uint8Array}
 */
export function groundMaterialsComposeAndMergeBytes(roads_by_tile, overture_fc, origin_lon, origin_lat, tiles, latitude, longitude, distance, default_layer, z_step) {
    const ptr0 = passArray8ToWasm0(roads_by_tile, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(overture_fc, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(tiles, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.groundMaterialsComposeAndMergeBytes(ptr0, len0, ptr1, len1, origin_lon, origin_lat, ptr2, len2, latitude, longitude, distance, ptr3, len3, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Ground-material layers for EVERY tile of an area, in one call.
 *
 * The tiled twin of `groundMaterialsCompose`: the same clip, the same
 * classification and the same carve per tile, with the area's Overture set
 * parsed once instead of once per tile.
 *
 * `roadsByTile` is `{key: roads FeatureCollection}`, where the key is a
 * rectangle's `chunk` when the entry names one and its own `id` otherwise.
 * Roads are read per READ CHUNK by the host, so a chunk cut into several
 * compose pieces hands its roads over ONCE (D57). A key that matches no
 * rectangle is an error, because a mis-spelled id would silently drop that
 * ground's streets, and a rectangle that names a chunk never falls back to its
 * own id's entry. `overtureFc` is the AREA-level FeatureCollection.
 * `originLon`/`originLat` is the AOI-level frame origin, the SAME for every
 * tile.
 *
 * **The rectangle list is the CALLER'S, and the fetch tiling is not the
 * simulation tiling.** One rectangle covering the whole site is a valid list
 * and is where the hosts are going (fetch once, assign to simulation tiles at
 * payload time); so is a short list of large chunks. Two lists over the same
 * area do NOT give the same geometry — one clip against one rectangle is not
 * the union of four clips against four rectangles, so a feature crossing a
 * former tile seam comes back whole site-level and in pieces grid-level. The
 * operation is deterministic for a given list; the choice of list is the
 * host's, and the host records the change in `docs/DEVIATIONS.md` D48 (host adoption).
 *
 * Returns the JSON of an ARRAY with one entry per tile, in the given order:
 * the tile's `{material: FeatureCollection}` document, or `null` where the
 * tile composed no features. `null` is what the per-tile host path produced
 * for such a tile, so the array feeds `mergeAndCleanTileLayers` unchanged.
 * @param {string} roads_by_tile
 * @param {string} overture_fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {string} tiles
 * @returns {string}
 */
export function groundMaterialsComposeTiles(roads_by_tile, overture_fc, origin_lon, origin_lat, tiles) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(roads_by_tile, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(overture_fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(tiles, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundMaterialsComposeTiles(ptr0, len0, ptr1, len1, origin_lon, origin_lat, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`ground_materials_compose_tiles`] with every document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes; the area document is
 * viewed once instead of traversed into a JS string and back.
 * @param {Uint8Array} roads_by_tile
 * @param {Uint8Array} overture_fc
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {Uint8Array} tiles
 * @returns {Uint8Array}
 */
export function groundMaterialsComposeTilesBytes(roads_by_tile, overture_fc, origin_lon, origin_lat, tiles) {
    const ptr0 = passArray8ToWasm0(roads_by_tile, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(overture_fc, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(tiles, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.groundMaterialsComposeTilesBytes(ptr0, len0, ptr1, len1, origin_lon, origin_lat, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * The `geometry-hashes["ground-materials"]` layer value: `composeHash` over
 * every per-material leaf at level `"tile"`, like every other layer (D25).
 *
 * THE supported derivation — material KEY ORDER is irrelevant by construction
 * (the compose sorts), which matters more in JS than anywhere else: engines
 * reorder integer-like object keys and re-serializing proxies change order in
 * transit. Hand-rolling the fold is the footgun this deletes.
 * @param {string} layers_json
 * @returns {string}
 */
export function groundMaterialsLayerHash(layers_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.groundMaterialsLayerHash(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The wait in seconds before the next try of a host request outside a run
 * (`request`: `capability`, `upload` or `public_get`), or `undefined`: give
 * up. `phase` and `status` are the raw facts of the failure; `tries` counts
 * the tries made, the failed one included.
 * `ir_geo::run_engine::host_retry_wait_seconds`.
 * @param {string} request
 * @param {string} phase
 * @param {number | null | undefined} status
 * @param {number} tries
 * @param {number} jitter
 * @param {number | null} [retry_after_s]
 * @returns {number | undefined}
 */
export function hostRetryWaitSeconds(request, phase, status, tries, jitter, retry_after_s) {
    const ptr0 = passStringToWasm0(request, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(phase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.hostRetryWaitSeconds(ptr0, len0, ptr1, len1, isLikeNone(status) ? 0xFFFFFF : status, tries, jitter, !isLikeNone(retry_after_s), isLikeNone(retry_after_s) ? 0 : retry_after_s);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    return ret[0] === 0 ? undefined : ret[1];
}

/**
 * The wire keys a host class carries on `model` that the server ignores; the
 * kernel drops them from the hash. Skip them before serialising.
 * @param {string} model
 * @returns {string[]}
 */
export function inertKeys(model) {
    const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.inertKeys(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * @param {number} num_threads
 * @returns {Promise<any>}
 */
export function initThreadPool(num_threads) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.initThreadPool(num_threads);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * Validate a result and return section ranges into the caller's input bytes.
 *
 * The ranges describe the original input layout. They never expose WASM memory.
 * @param {Uint8Array} buffer
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {number} max_sections
 * @param {bigint} max_elements_per_section
 * @param {number} max_metadata_depth
 * @param {bigint} max_cells
 * @param {bigint} max_triangle_values
 * @returns {any}
 */
export function inspectBinaryResult(buffer, max_total_bytes, max_metadata_bytes, max_sections, max_elements_per_section, max_metadata_depth, max_cells, max_triangle_values) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.inspectBinaryResult(buffer, max_total_bytes, max_metadata_bytes, max_sections, max_elements_per_section, max_metadata_depth, max_cells, max_triangle_values);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Make an allocation failure, on any thread, end the process. The SDK calls
 * it once, before `initThreadPool`; the hook is shared by all threads.
 */
export function installOomAbort() {
    __wbg_call_guard();
    try {
        wasm.installOomAbort();
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * Tree Point features → compact `VegetationInstances` JSON (trees grouped by
 * archetype, per-tree transforms from `height`/`crownDiameter` in
 * `instances_bin`). Render with `archetypeMeshes` instead of a mesh per tree.
 * @param {string} features_json
 * @param {number} reference_lon
 * @param {number} reference_lat
 * @param {string} registry_json
 * @param {string} registry_version
 * @returns {string}
 */
export function instancesFromPoints(features_json, reference_lon, reference_lat, registry_json, registry_version) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(features_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(registry_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(registry_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.instancesFromPoints(ptr0, len0, reference_lon, reference_lat, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * An interior request on the binary route (D228): the scene as ONE IRBF
 * geometry archive, every other top-level value as control (raw bytes, the
 * request's order). Every part of a split request uploads this one archive
 * and sends `daylightPartBody(control, part)` as its control. Throws when the
 * frame cannot carry the request exactly (a deferred field such as
 * `buildings` or `vegetation`, a mesh with one arm, a coordinate over the
 * frame limit): the caller then sends the request as JSON.
 *
 * The limits are the capability document's (`maxGeometryBytes`,
 * `maxMetadataBytes`, `maxMeshes`, `maxInstances`); a frame over one of them
 * throws before any upload.
 *
 * Returns `{archive: Uint8Array, artifactDigest, contentDigest, encoding,
 * frameByteLength, control: Uint8Array}`.
 * @param {Uint8Array} request
 * @param {string} model
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {bigint} max_meshes
 * @param {bigint} max_instances
 * @returns {any}
 */
export function interiorArtifact(request, model, max_total_bytes, max_metadata_bytes, max_meshes, max_instances) {
    const ptr0 = passArray8ToWasm0(request, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.interiorArtifact(ptr0, len0, ptr1, len1, max_total_bytes, max_metadata_bytes, max_meshes, max_instances);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Land-use classification — utilities-service
 * `app/maps/overture/landuse.py::fetch_landuse`.
 *
 * Collapses Overture's free-text `class` / `subtype` spellings into the
 * fixed Infrared vocabulary, consulting `class` first and falling back to
 * `subtype`. Features with no geometry are dropped, so `totalFeatures`
 * and `categorized` differing is the signal that input was discarded.
 *
 * Classification ONLY: the reference also projects to UTM and writes
 * `area_m2`, which this does not — see the kernel module docs.
 *
 * Returns `{"features": FeatureCollection, "metadata": {...}}`.
 * @param {string} fc
 * @returns {string}
 */
export function landuseClassify(fc) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.landuseClassify(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @returns {string[]}
 */
export function lawsonLabels() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.lawsonLabels();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Measures the colour-scale range of one grid's FINITE cells (issue #390).
 * Mirror of the Python wheel's `legend_range`.
 *
 * `values`: a `Float32Array` or a `Float64Array`. NaN and ±infinity cells
 * are skipped; an empty or all-non-finite grid returns `undefined`.
 * `mode` (default `"exact"`) is the true min/max; `"trimmed"` is the exact
 * 2nd/98th percentile (numpy `linear`), falling back to `"exact"` when the
 * trimmed ends collapse while the true extremes differ; `"fixed"` returns
 * `[fixedMin, fixedMax]` WITHOUT reading `values` (both REQUIRED, finite,
 * `min < max`). Returns `[min, max]` as a `Float64Array`.
 *
 * A grid in its wire dtype (D273) is read cell by cell, with no widened
 * copy: a `Uint16Array` is `f16` bits; an `Int16Array` is scaled integers
 * (physical value = stored / `divisor`) and needs its `valid` bitmap (least
 * significant bit first).
 * @param {any} values
 * @param {string | null} [mode]
 * @param {number | null} [fixed_min]
 * @param {number | null} [fixed_max]
 * @param {number | null} [divisor]
 * @param {Uint8Array | null} [valid]
 * @returns {Float64Array | undefined}
 */
export function legendRange(values, mode, fixed_min, fixed_max, divisor, valid) {
    var ptr0 = isLikeNone(mode) ? 0 : passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(valid) ? 0 : passArray8ToWasm0(valid, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.legendRange(values, ptr0, len0, !isLikeNone(fixed_min), isLikeNone(fixed_min) ? 0 : fixed_min, !isLikeNone(fixed_max), isLikeNone(fixed_max) ? 0 : fixed_max, isLikeNone(divisor) ? Number.MAX_SAFE_INTEGER : (divisor) >>> 0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Identity of the prettify mask that surface synthesis produces from the
 * geometry behind `geoHash` under these params — the key to cache a mask (or a
 * result carrying one) against.
 *
 * `terrainHash` identifies the terrain the scene was draped onto; pass
 * `undefined`/`null` for no terrain. NOT optional detail: terrain-aware
 * synthesis culls sub-grade sensors, so the same geometry and params produce a
 * different mask with a terrain than without. Hash the terrain's patches with
 * `entityHashMesh` and roll them up with `composeHash`.
 *
 * The three optional synthesis knobs accept `undefined` and fall back to the
 * SAME kernel constants the Python binding defaults to (`surfgridDefaults()`
 * exposes them), so a TS caller never has to hardcode a literal that could
 * drift from the server's value.
 *
 * Mixes in `surfgridVersion()`, so a kernel synthesis change invalidates every
 * cached mask instead of silently serving a stale one. Pass the SAME param
 * values the server resolved (§12f: the 7-tuple is an echoed contract, never
 * mirrored constants). Throws on a malformed hash, an unknown `mode`, a
 * non-finite float param, or a `maxSensors` above 2**32-1.
 * @param {string} geo_hash
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} max_sensors
 * @param {string | null} [terrain_hash]
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {boolean | null} [emit_cell_tris]
 * @param {string | null} [mesh_cleaning]
 * @returns {string}
 */
export function maskHash(geo_hash, mode, grid_size, offset, max_sensors, terrain_hash, partial_cells, min_coverage, emit_cell_tris, mesh_cleaning) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(geo_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(terrain_hash) ? 0 : passStringToWasm0(terrain_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.maskHash(ptr0, len0, ptr1, len1, grid_size, offset, max_sensors, ptr2, len2, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, isLikeNone(emit_cell_tris) ? 0xFFFFFF : emit_cell_tris ? 1 : 0, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return the automatic precedence rank for one material name.
 * @param {string} name
 * @returns {number}
 */
export function materialRank(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.materialRank(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * The most sensors one surface job computes, BYO or synthesized
 * (`ir_geo::consts::MAX_SENSORS_PER_JOB`).
 * @returns {number}
 */
export function maxSensorsPerJob() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.maxSensorsPerJob();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * Merge per-tile material layers and clean the result, in ONE kernel call —
 * the wasm twin of the wheel's `merge_and_clean_tile_layers`.
 *
 * Opaque-document contract: this operation takes an opaque JSON document and
 * returns one. The host parses exactly once, at its own public boundary. A
 * fused operation is an optimisation over a measured chain of such
 * operations — it takes and returns the SAME opaque documents its parts do,
 * so a caller can still run the chain step by step and get the same answer.
 * Parsed handles across the boundary are a later step, not this one.
 *
 * `tileLayersJson` is the same input `mergeTileLayers` takes. The merge
 * (`ir_geo::tiling::ground_merge::merge_tile_layers`) and the clean
 * (`ir_simprep::ground_clean::clean_v3`) both run in Rust, so the host never
 * materializes the merged layer tree between the two steps (bulk-data rule 1).
 * Pass `defaultLayer = undefined` for the clean step's own default
 * (`asphalt`) and `zStep = undefined` for the fixed default (0.05,
 * DEVIATIONS.md D5).
 *
 * An EMPTY merge returns `{}` WITHOUT cleaning, so a host that fetched no
 * features still reports "no ground materials" instead of receiving a default
 * backdrop over an empty area.
 * @param {string} tile_layers_json
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {string}
 */
export function mergeAndCleanTileLayers(tile_layers_json, latitude, longitude, distance, default_layer, z_step) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(tile_layers_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeAndCleanTileLayers(ptr0, len0, latitude, longitude, distance, ptr1, len1, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`merge_and_clean_tile_layers`] with the document crossing as a
 * `Uint8Array` (WP14-D). Same operation, same bytes.
 * @param {Uint8Array} tile_layers
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} distance
 * @param {string | null} [default_layer]
 * @param {number | null} [z_step]
 * @returns {Uint8Array}
 */
export function mergeAndCleanTileLayersBytes(tile_layers, latitude, longitude, distance, default_layer, z_step) {
    const ptr0 = passArray8ToWasm0(tile_layers, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(default_layer) ? 0 : passStringToWasm0(default_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.mergeAndCleanTileLayersBytes(ptr0, len0, latitude, longitude, distance, ptr1, len1, !isLikeNone(z_step), isLikeNone(z_step) ? 0 : z_step);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Canonical terrain merge → the layout hash's terrain term (D20).
 *
 * `entries_json` = the `ground-geometry` map's VALUES as a JSON list of
 * `{"coordinates": [...], "indices": [...]}` meshes, in ANY order — entries
 * are sorted by their own `entityHashMesh` leaf before the concat, so every
 * derivation path (map iteration order, JS key reordering, re-serializing
 * proxies) converges. THE supported client derivation; hand-rolling the
 * concat is the documented footgun this deletes. Errors on an empty list
 * (terrain-less = absence, never an empty merge).
 * @param {string} entries_json
 * @returns {string}
 */
export function mergeTerrainLeaf(entries_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(entries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTerrainLeaf(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The canonical merged terrain MESH itself (D20) — same sort/concat/rebase
 * as [`merge_terrain_leaf`]; returns a JSON string
 * `{"coordinates": [...], "indices": [...]}` (conform.rs convention).
 * Parity twin of the wheel's `merge_terrain_mesh`.
 * @param {string} entries_json
 * @returns {string}
 */
export function mergeTerrainMesh(entries_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(entries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTerrainMesh(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The ground tile-layer merge. JSON array of per-tile
 * `{layer: FeatureCollection}` (or `null`) → merged+deduped `{layer: FC}` JSON.
 * @param {string} tile_results_json
 * @returns {string}
 */
export function mergeTileLayers(tile_results_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(tile_results_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTileLayers(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`merge_tile_layers`] with the document crossing as a `Uint8Array`
 * (WP14-D). Same operation, same bytes: a run merges the per-tile array
 * once per area, and the array is the largest document the host holds.
 * @param {Uint8Array} tile_results
 * @returns {Uint8Array}
 */
export function mergeTileLayersBytes(tile_results) {
    const ptr0 = passArray8ToWasm0(tile_results, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.mergeTileLayersBytes(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * `infrared_sdk.tiling.merger.merge_tiles` (default centre-crop) port.
 * `tiles_json` = `[{row,col,rows,cols,data_bin}]` (base64-f32); out =
 * `{rows,cols,data_bin}`.
 * @param {string} tiles_json
 * @param {number} num_rows
 * @param {number} num_cols
 * @param {string} config_json
 * @returns {string}
 */
export function mergeTiles(tiles_json, num_rows, num_cols, config_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTiles(ptr0, len0, num_rows, num_cols, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.tiling.merger.merge_tiles(strategy="directional")` port — the
 * directional argmax merge with NO Gaussian blend (the sharper sibling of
 * `mergeTilesSmart`). base64-f32 wire like `mergeTiles`. WIND-SPEED ONLY
 * (reliability argmax; f64 mask vs the SDK's f32, within the 1e-5 contract).
 * @param {string} tiles_json
 * @param {number} num_rows
 * @param {number} num_cols
 * @param {string} config_json
 * @param {number} wind_direction_deg
 * @returns {string}
 */
export function mergeTilesDirectional(tiles_json, num_rows, num_cols, config_json, wind_direction_deg) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTilesDirectional(ptr0, len0, num_rows, num_cols, ptr1, len1, wind_direction_deg);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.tiling.merger_smart.merge_tiles_smart` (`directional_blend`)
 * port — streaming overlap-save FFT blend (DEVIATIONS D11). WIND-SPEED ONLY.
 * base64-f32 wire like `mergeTiles`: the blend is f64 internally, narrowed to
 * f32 on the wire (within the 1e-5 contract at wind magnitudes). `block`
 * (`undefined` → 928) is a perf/memory knob only — the result is identical for
 * any value.
 * @param {string} tiles_json
 * @param {number} num_rows
 * @param {number} num_cols
 * @param {string} config_json
 * @param {number} wind_direction_deg
 * @param {number | null} [block]
 * @returns {string}
 */
export function mergeTilesSmart(tiles_json, num_rows, num_cols, config_json, wind_direction_deg, block) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.mergeTilesSmart(ptr0, len0, num_rows, num_cols, ptr1, len1, wind_direction_deg, isLikeNone(block) ? Number.MAX_SAFE_INTEGER : (block) >>> 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Normalize u8 tile indices through one sorted, observed category mapping.
 * @param {Uint8Array} values
 * @param {string} legends_json
 * @param {number} tile_cells
 * @returns {CategoricalAreaDense}
 */
export function normalizeAreaCategoricalDense(values, legends_json, tile_cells) {
    const ptr0 = passArray8ToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(legends_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.normalizeAreaCategoricalDense(ptr0, len0, ptr1, len1, tile_cells);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return CategoricalAreaDense.__wrap(ret[0]);
}

/**
 * Normalize JSON category labels through the same canonical mapping.
 * @param {string} tiles_json
 * @param {number} tile_cells
 * @returns {CategoricalAreaDense}
 */
export function normalizeAreaCategoricalLabels(tiles_json, tile_cells) {
    const ptr0 = passStringToWasm0(tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.normalizeAreaCategoricalLabels(ptr0, len0, tile_cells);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return CategoricalAreaDense.__wrap(ret[0]);
}

/**
 * Normalize mixed binary and JSON categorical tiles in source tile order.
 * @param {Uint8Array} dense_values
 * @param {string} dense_legends_json
 * @param {Uint32Array} dense_indices
 * @param {string} label_tiles_json
 * @param {Uint32Array} label_indices
 * @param {number} tile_count
 * @param {number} tile_cells
 * @returns {CategoricalAreaDense}
 */
export function normalizeAreaCategoricalMixed(dense_values, dense_legends_json, dense_indices, label_tiles_json, label_indices, tile_count, tile_cells) {
    const ptr0 = passArray8ToWasm0(dense_values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(dense_legends_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(dense_indices, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(label_tiles_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passArray32ToWasm0(label_indices, wasm.__wbindgen_malloc);
    const len4 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.normalizeAreaCategoricalMixed(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, tile_count, tile_cells);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return CategoricalAreaDense.__wrap(ret[0]);
}

/**
 * Stage 2 (precise gate): does the AOI bbox intersect the city polygon?
 * `polygon_geojson` is the consumer-fetched city outline (Geometry / Feature /
 * FeatureCollection of Polygon/MultiPolygon).
 * @param {string} polygon_geojson
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 * @returns {boolean}
 */
export function overlayAoiIntersectsPolygon(polygon_geojson, west, south, east, north) {
    const ptr0 = passStringToWasm0(polygon_geojson, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.overlayAoiIntersectsPolygon(ptr0, len0, west, south, east, north);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Stage 1 (cheap prefilter): parse `sources.json` and return the cities whose
 * bbox intersects the AOI bbox, as a JSON array of `{id, bbox, polygon_url,
 * layers}`. Never under-includes a city the precise polygon gate would accept.
 * @param {string} sources_json
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 * @returns {string}
 */
export function overlayBboxCandidates(sources_json, west, south, east, north) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(sources_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.overlayBboxCandidates(ptr0, len0, west, south, east, north);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Convenience point-in-polygon (degenerate AOI). Boundary-exclusive, matching
 * shapely `.contains(Point)`.
 * @param {string} polygon_geojson
 * @param {number} lon
 * @param {number} lat
 * @returns {boolean}
 */
export function overlayPointInPolygon(polygon_geojson, lon, lat) {
    const ptr0 = passStringToWasm0(polygon_geojson, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.overlayPointInPolygon(ptr0, len0, lon, lat);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * The planned-bytes limit of one Overture read in `runtime`.
 * @param {string} runtime
 * @returns {number}
 */
export function overturePlannedBytesLimit(runtime) {
    const ptr0 = passStringToWasm0(runtime, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.overturePlannedBytesLimit(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * Overture R2 file-index: manifest JSON + bbox -> intersecting file URLs.
 * @param {string} manifest_json
 * @param {number} west
 * @param {number} south
 * @param {number} east
 * @param {number} north
 * @returns {string[]}
 */
export function overtureSelectFiles(manifest_json, west, south, east, north) {
    const ptr0 = passStringToWasm0(manifest_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.overtureSelectFiles(ptr0, len0, west, south, east, north);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * base64(f32 LE) encode of interleaved xyz f64 coordinates (must be 3n), RAW.
 * Throws on non-finite or non-tile-local values (|coord| >= 1e5, §2.4).
 * @param {Float64Array} coordinates
 * @returns {string}
 */
export function packCoordinates(coordinates) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArrayF64ToWasm0(coordinates, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.packCoordinates(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * base64(i32 LE) encode of triangle indices, RAW. Throws on any index >= 2^31
 * — the §2.1 producer bound that keeps the blob readable by signed 32-bit
 * decoders (C#, Java).
 * @param {Uint32Array} indices
 * @returns {string}
 */
export function packIndices(indices) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.packIndices(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Pack one valid, representable mesh as raw input blobs.
 *
 * Returns `{coordinates_bin, indices_bin}` or `{not_representable: reason}`.
 * Malformed input throws. The regular JavaScript array keeps element types
 * visible until the shared strict wire-index rule validates them.
 * @param {Float64Array} coordinates
 * @param {any} indices
 * @returns {any}
 */
export function packMesh(coordinates, indices) {
    const ptr0 = passArrayF64ToWasm0(coordinates, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.packMesh(ptr0, len0, indices);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Pack explicit typed arrays. Inputs are copied into WASM and never retained.
 * Returned typed arrays own JavaScript storage and do not view WASM memory.
 * @param {Float64Array} coordinates
 * @param {Uint32Array} indices
 * @param {Uint32Array} spans
 * @param {number} max_meshes
 * @param {number} max_coordinate_values
 * @param {number} max_indices
 * @param {number} max_output_bytes
 * @returns {any}
 */
export function packMeshBatch(coordinates, indices, spans, max_meshes, max_coordinate_values, max_indices, max_output_bytes) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.packMeshBatch(coordinates, indices, spans, max_meshes, max_coordinate_values, max_indices, max_output_bytes);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Pack ordinary arrays with strict index validation before numeric narrowing.
 * @param {any} coordinates
 * @param {any} indices
 * @param {Uint32Array} spans
 * @param {number} max_meshes
 * @param {number} max_coordinate_values
 * @param {number} max_indices
 * @param {number} max_output_bytes
 * @returns {any}
 */
export function packMeshBatchArrays(coordinates, indices, spans, max_meshes, max_coordinate_values, max_indices, max_output_bytes) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.packMeshBatchArrays(coordinates, indices, spans, max_meshes, max_coordinate_values, max_indices, max_output_bytes);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Element count of a raw packed index blob without decoding it.
 * @param {string} indices_bin
 * @returns {number}
 */
export function packedIndexCount(indices_bin) {
    const ptr0 = passStringToWasm0(indices_bin, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.packedIndexCount(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
}

/**
 * TEST ONLY: a parallel map over `items` whose item `at` panics on a pool
 * thread, or, with `at >= items`, a panic on the CALLING thread before the
 * map (the main thread in Node: rayon runs a pool map on the pool's own
 * workers, so this is how the main thread panics). Both come back to the
 * caller as a thrown error. `tests/area/threaded-panic`.
 * @param {number} items
 * @param {number} at
 * @returns {number}
 */
export function panicInPoolForTest(items, at) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.panicInPoolForTest(items, at);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * Who owns what, by id, with no geometry moved.
 *
 * Takes the `{id: mesh}` map itself, not the whole payload, and answers
 * `{"core": [...], "context": [...], "shrink_band": [...], "packed": [...]}`.
 * A host that already holds the meshes calls this rather than
 * `splitFacadeCoreContextReport`: it gets the DECISION and moves its own
 * objects, so no mesh is serialised back out of the kernel.
 *
 * The box is given DIRECTLY here, both axes, rather than as one
 * `inference_size_m` with optional overrides: the older exports carry that
 * shape so a pre-D63 two-argument call keeps meaning what it meant, and a new
 * function need not inherit it. `nominal_*` default to `core_*`, which is the
 * pre-D63 box and reports an empty shrink band.
 *
 * `packed` names the ids decided from `coordinates_bin`. The SDK hosts refuse
 * a tile payload carrying any of them (`docs/DEVIATIONS.md` D63) — a packed
 * mesh on that path was never re-anchored, so its metres are site-frame.
 * @param {string} geometries_json
 * @param {number} core_x_m
 * @param {number} core_y_m
 * @param {number | null} [nominal_x_m]
 * @param {number | null} [nominal_y_m]
 * @returns {string}
 */
export function partitionFacadeCoreContext(geometries_json, core_x_m, core_y_m, nominal_x_m, nominal_y_m) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.partitionFacadeCoreContext(ptr0, len0, core_x_m, core_y_m, !isLikeNone(nominal_x_m), isLikeNone(nominal_x_m) ? 0 : nominal_x_m, !isLikeNone(nominal_y_m), isLikeNone(nominal_y_m) ? 0 : nominal_y_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`partition_facade_core_context`] from f64 coordinate BUFFERS.
 *
 * `coordinates` is every mesh's flat `[x, y, z, ...]` array, concatenated, as
 * little-endian f64 bytes; `offsets` names where each starts and where the
 * last ends, counting ELEMENTS, so it holds one more entry than `ids`.
 *
 * This is the bulk path: a host with meshes in its own memory reaches the
 * rule without first WRITING a JSON document of them (root `CLAUDE.md`: "do
 * not create host objects only to serialize them back into Rust"). On the
 * Python SDK's F3 facade run that is 0.14 s of packing instead of 2.7 s of
 * `json.dumps` over 121 MB.
 *
 * It carries exactly the meshes whose JSON `coordinates` a host could pack.
 * Anything else — absent, empty or non-numeric coordinates, or geometry in a
 * `coordinates_bin` blob — goes to ``partitionFacadeCoreContext``, which
 * can read the whole mesh; `packed` here is therefore always empty. Choosing
 * a route is an ENCODING decision, never an ownership one, and
 * `crates/ir-geo/tests/facade_ownership.rs` pins the two routes equal.
 * @param {string[]} ids
 * @param {Uint8Array} coordinates
 * @param {Uint32Array} offsets
 * @param {number} core_x_m
 * @param {number} core_y_m
 * @param {number | null} [nominal_x_m]
 * @param {number | null} [nominal_y_m]
 * @returns {string}
 */
export function partitionFacadeCoreContextF64(ids, coordinates, offsets, core_x_m, core_y_m, nominal_x_m, nominal_y_m) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(coordinates, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(offsets, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.partitionFacadeCoreContextF64(ptr0, len0, ptr1, len1, ptr2, len2, core_x_m, core_y_m, !isLikeNone(nominal_x_m), isLikeNone(nominal_x_m) ? 0 : nominal_x_m, !isLikeNone(nominal_y_m), isLikeNone(nominal_y_m) ? 0 : nominal_y_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The retry plan of an area schedule (D224): a `RetryPlanInput` JSON
 * document in, a `RetryPlan` JSON document out. Throws on a bad input.
 * @param {string} input
 * @returns {string}
 */
export function planAreaRetry(input) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.planAreaRetry(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return verified exact surface batches as JSON records.
 * @param {string} geometries_json
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} work_budget
 * @param {string | null | undefined} ground_geometry_json
 * @param {boolean} auto_align
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {string | null} [mesh_cleaning]
 * @returns {string}
 */
export function planExactSurfaceBatches(geometries_json, mode, grid_size, offset, work_budget, ground_geometry_json, auto_align, partial_cells, min_coverage, mesh_cleaning) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(ground_geometry_json) ? 0 : passStringToWasm0(ground_geometry_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.planExactSurfaceBatches(ptr0, len0, ptr1, len1, grid_size, offset, work_budget, ptr2, len2, auto_align, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`plan_exact_surface_batches`] under a caller's per-job sensor cap in
 * retained sensors. `undefined` is the default plan exactly.
 * @param {string} geometries_json
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} work_budget
 * @param {string | null | undefined} ground_geometry_json
 * @param {boolean} auto_align
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {number | null} [max_sensors_per_job]
 * @param {string | null} [mesh_cleaning]
 * @returns {string}
 */
export function planExactSurfaceBatchesCapped(geometries_json, mode, grid_size, offset, work_budget, ground_geometry_json, auto_align, partial_cells, min_coverage, max_sensors_per_job, mesh_cleaning) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(ground_geometry_json) ? 0 : passStringToWasm0(ground_geometry_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.planExactSurfaceBatchesCapped(ptr0, len0, ptr1, len1, grid_size, offset, work_budget, ptr2, len2, auto_align, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, !isLikeNone(max_sensors_per_job), isLikeNone(max_sensors_per_job) ? 0 : max_sensors_per_job, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return one kernel reuse plan as JSON.
 * @param {string} current_json
 * @param {string} state_json
 * @param {number} now
 * @param {string | null} [sizes_json]
 * @returns {string}
 */
export function planGeometryReuse(current_json, state_json, now, sizes_json) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(current_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(state_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(sizes_json) ? 0 : passStringToWasm0(sizes_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.planGeometryReuse(ptr0, len0, ptr1, len1, now, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The default time a client waits for a job or an area run, seconds (D213).
 * @returns {number}
 */
export function pollDefaultTimeoutSeconds() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.pollDefaultTimeoutSeconds();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * The wait before the next status sweep after a sweep that failed (HTTP 429,
 * 5xx, network), seconds. See `ir_geo::poll_schedule` (D213).
 * @param {number} consecutive_errors
 * @param {number} jitter_unit
 * @param {number | null} [retry_after_s]
 * @returns {number}
 */
export function pollErrorDelaySeconds(consecutive_errors, jitter_unit, retry_after_s) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.pollErrorDelaySeconds(consecutive_errors, jitter_unit, !isLikeNone(retry_after_s), isLikeNone(retry_after_s) ? 0 : retry_after_s);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * The wait before the first status sweep of a wait, seconds (D213).
 * @returns {number}
 */
export function pollFirstDelaySeconds() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.pollFirstDelaySeconds();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * The wait before the next status sweep after a sweep that answered,
 * seconds. See `ir_geo::poll_schedule` (D213).
 * @param {number} elapsed_s
 * @param {number} sweep_requests
 * @returns {number}
 */
export function pollIntervalSeconds(elapsed_s, sweep_requests) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.pollIntervalSeconds(elapsed_s, sweep_requests);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * TEST ONLY: the sum of a `poolSumStart` task.
 * @param {PoolTask} task
 * @returns {number}
 */
export function poolSumEnd(task) {
    _assertClass(task, PoolTask);
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.poolSumEnd(task.__wbg_ptr);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * TEST ONLY: a pool task that sums `0..n` in parallel after a busy spin of
 * `spin_ms` milliseconds on the pool (`panic_at < n`: item `panic_at`
 * panics). `poolSumEnd` takes the sum. `tests/pool-task`.
 * @param {number} n
 * @param {number} spin_ms
 * @param {number} panic_at
 * @returns {PoolTask}
 */
export function poolSumStart(n, spin_ms, panic_at) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.poolSumStart(n, spin_ms, panic_at);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return PoolTask.__wrap(ret);
}

/**
 * How long a fetched price list is used, seconds (20 minutes).
 * @returns {number}
 */
export function priceCacheTtlSeconds() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.priceCacheTtlSeconds();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * Where a price came from: `"live"`, `"cached"` or `"stale"`.
 * @param {boolean} fetched
 * @param {number} age_s
 * @returns {string}
 */
export function priceSource(fetched, age_s) {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.priceSource(fetched, age_s);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The price list URL for the client's API base URL.
 * @param {string} base_url
 * @returns {string}
 */
export function pricingUrl(base_url) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.pricingUrl(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.tiling.merger.project_polygon_to_meters` port. GeoJSON Polygon
 * in → `{polygon_meters: [[x,y],...], origin_lon, origin_lat}` JSON (canonical
 * LocalFrame, D1; origin = bbox SW corner). The `polygon_meters` feed
 * `clipToPolygon`. Throws on an invalid polygon (< 2 ring vertices).
 * @param {string} polygon_json
 * @returns {string}
 */
export function projectPolygonToMeters(polygon_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.projectPolygonToMeters(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The kernel's decision for one byte-range read event; JSON in, JSON out
 * (`ir_geodata::range_read::range_read_step`).
 * @param {string} request
 * @returns {string}
 */
export function rangeReadStep(request) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(request, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.rangeReadStep(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Recenter coordinates about their centroid; returns the centroid (xyz)
 * followed by the recentered f32 values widened back to f64, flattened:
 * `[cx, cy, cz, x0, y0, z0, ...]` (wasm-bindgen lacks tuple returns).
 * @param {Float64Array} coordinates
 * @returns {Float64Array}
 */
export function recenterF32(coordinates) {
    const ptr0 = passArrayF64ToWasm0(coordinates, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.recenterF32(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * `clip ∩ union(rectangles)` as disjoint pieces, x-major then y.
 *
 * `clip` is `[west, south, east, north]`; `rectangles` is the same four
 * fields per rectangle, concatenated flat (length a multiple of 4). Returns
 * the pieces in the same flat shape, one quadruple per piece, in emission
 * order.
 * @param {Float64Array} clip
 * @param {Float64Array} rectangles
 * @returns {Float64Array}
 */
export function rectUnionDecompose(clip, rectangles) {
    const ptr0 = passArrayF64ToWasm0(clip, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(rectangles, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.rectUnionDecompose(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The fusion tolerance a rectangle set earns, in degrees — see
 * `ir_geo::rect_union` for the derivation.
 * @param {Float64Array} rectangles
 * @returns {number}
 */
export function rectUnionSlabToleranceDeg(rectangles) {
    const ptr0 = passArrayF64ToWasm0(rectangles, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.rectUnionSlabToleranceDeg(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * The fixed colour-scale range one registry `visualConfigurations` entry
 * declares, for `legendRange(values, "fixed", min, max)`. Mirror of the
 * Python wheel's `registry_fixed_range`.
 *
 * `configJson`: one already-resolved entry — the host owns the registry
 * fetch and key resolution, the same contract as `renderGridRegistry`. A
 * numeric `steps` list gives `[steps[0], steps[-1]]`; a string
 * (categorical) or an absent/empty `steps` gives `undefined`. Throws on
 * malformed JSON or a non-increasing numeric range.
 * @param {string} config_json
 * @returns {Float64Array | undefined}
 */
export function registryFixedRange(config_json) {
    const ptr0 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.registryFixedRange(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Colormap a 2-D grid of f32 (row-major, NaN = no-data) to registry-coloured
 * PNG bytes (`Uint8Array`). Mirror of the Python wheel's
 * `render_grid_registry`.
 *
 * `configJson` is ONE already-resolved `visualConfigurations` entry
 * (`{"colors": [[r, g, b], ..], "steps": .., "colorInterpolation": ..}`) — the
 * host owns the registry fetch and the `process_id` /
 * `process_id:{criteria or subtype}` key resolution, so the kernel stays
 * I/O-free.
 *
 * `reverseRows` is OPTIONAL and defaults to `false`, the same default the
 * Python wheel ships (signature table row 10). `false` emits grid row 0 as
 * the TOP PNG row — what the deployed utilities-service route produces (its
 * `grid[::-1]` and its `imshow(origin="lower")` cancel).
 *
 * The image is 1:1 cell→pixel up to the long-axis cap (DEVIATIONS D9); alpha
 * is 200 for a valid cell and 0 for a no-data one (DEVIATIONS D37).
 *
 * `maxLongAxisPx` is that cap, 960 px when it is omitted — the same default
 * the wheel ships. Above it the grid is sampled nearest-neighbour on the
 * VALUES before colouring, aspect ratio and no-data cells kept. **Pass `0`
 * for the uncapped 1:1 image**: JavaScript cannot tell an omitted argument
 * from an explicit `undefined`, so `0` is the opt-out here where the wheel
 * also accepts `None`.
 * @param {Float32Array} values
 * @param {number} width
 * @param {number} height
 * @param {string} config_json
 * @param {boolean | null} [reverse_rows]
 * @param {number | null} [max_long_axis_px]
 * @returns {Uint8Array}
 */
export function renderGridRegistry(values, width, height, config_json, reverse_rows, max_long_axis_px) {
    const ptr0 = passArrayF32ToWasm0(values, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.renderGridRegistry(ptr0, len0, width, height, ptr1, len1, isLikeNone(reverse_rows) ? 0xFFFFFF : reverse_rows ? 1 : 0, isLikeNone(max_long_axis_px) ? Number.MAX_SAFE_INTEGER : (max_long_axis_px) >>> 0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * The default `terrain-alignment` for a request with a supplied scene on
 * terrain: `"as-is"`, or undefined when the SDK leaves the request as built.
 * @param {string} model
 * @param {boolean} alignment_set
 * @param {boolean} has_terrain
 * @param {boolean} has_scene
 * @returns {string | undefined}
 */
export function resolveTerrainAlignment(model, alignment_set, has_terrain, has_scene) {
    const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.resolveTerrainAlignment(ptr0, len0, alignment_set, has_terrain, has_scene);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * The engine's retry and resend limits as JSON (read-only, issue #873):
 * `ir_geo::run_engine::retry_policy`.
 * @returns {string}
 */
export function retryPolicy() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.retryPolicy();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Road-surface normalisation — utilities-service
 * `app/gis/surfaces.py::_to_ir_features`.
 *
 * Takes the RAW FlatGeobuf features and emits the `surface` / `highway` /
 * `name` / `lanes` shape [`ground_materials_compose`] consumes. Ported
 * bug-for-bug: the world file keeps `surface` inside its HSTORE `other_tags`
 * column and exposes no `@id`, so every road comes out `surface: null` and
 * `id: "way/0"` — exactly what the deployed service returns. See DEVIATIONS
 * D36.
 * @param {string} fc
 * @returns {string}
 */
export function roadsNormalize(fc) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(fc, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.roadsNormalize(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @param {number} lon0
 * @param {number} lat0
 * @param {number} lon1
 * @param {number} lat1
 * @returns {Float64Array}
 */
export function scalarFrameAffine(lon0, lat0, lon1, lat1) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.scalarFrameAffine(lon0, lat0, lon1, lat1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {Uint8Array} positions
 * @returns {Float64Array}
 */
export function scalarPolygonOriginF64(positions) {
    const ptr0 = passArray8ToWasm0(positions, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.scalarPolygonOriginF64(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * @param {Uint8Array} coordinates
 * @param {Float64Array} affine
 * @returns {Uint8Array}
 */
export function scalarReanchorF64(coordinates, affine) {
    const ptr0 = passArray8ToWasm0(coordinates, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(affine, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.scalarReanchorF64(ptr0, len0, ptr1, len1);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * @param {number} row
 * @param {number} col
 * @param {number} step_m
 * @param {number} inference_size_m
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @returns {Float64Array}
 */
export function scalarSiteToTileAffine(row, col, step_m, inference_size_m, origin_lon, origin_lat) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.scalarSiteToTileAffine(row, col, step_m, inference_size_m, origin_lon, origin_lat);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {number} x
 * @param {number} y
 * @returns {Float64Array}
 */
export function scalarUnproject(origin_lon, origin_lat, x, y) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.scalarUnproject(origin_lon, origin_lat, x, y);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * The total time allowed to send `byteLength` bytes of request body,
 * seconds. See `ir_geo::send_budget`. A JavaScript byte length is a safe
 * integer, so it is taken as `f64` and refused when it is not one.
 * @param {number} byte_length
 * @returns {number}
 */
export function sendBudgetSeconds(byte_length) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.sendBudgetSeconds(byte_length);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * The longest time no body byte may move before a send stops, seconds.
 * @returns {number}
 */
export function sendStallSeconds() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.sendStallSeconds();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret;
}

/**
 * Identity of the sensor LAYOUT — the set AND its order — for reusing a
 * prettify mask across analyses.
 *
 * `entityHashes` are the per-entity leaf hashes (`entityHashMesh`) **in
 * synthesis WALK order** — since SURFGRID_VERSION 2 that is the canonical
 * `(entity_hash, uuid)` order, NOT your map's insertion order. Take the list
 * verbatim from `synthesizeSurfaces(...).entity_hashes`; never rebuild it by
 * hand. Folded IN THAT ORDER and never sorted: sensors are concatenated in
 * walk order, so two differently-ordered leaf lists describe genuinely
 * different layouts. Passing a sorted or `composeHash`-composed value here
 * defeats the purpose — `composeHash` is order-INdependent by design.
 *
 * Takes no `emitCellTris`: that flag decides whether render triangles ride
 * along, never which sensors exist or in what order. Two runs sharing this
 * hash return `values` that align INDEX FOR INDEX, so a cheap
 * `emitCellTris: false` run can be drawn with `cellTris` kept from an earlier
 * `true` run — synthesize the pretty mask once, run N analyses on it.
 *
 * Use `maskHash` instead to identify the mask AS SHIPPED. An EMPTY
 * `entityHashes` is valid: a buildingless tile is a real tile. The optional
 * knobs fall back to the same kernel constants `surfgridDefaults()` exposes.
 * Mixes in `surfgridVersion()`. Throws on a malformed hash, an unknown `mode`,
 * a non-finite float, or a `maxSensors` above 2**32-1.
 * @param {string[]} entity_hashes
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} max_sensors
 * @param {string | null} [terrain_hash]
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {string | null} [mesh_cleaning]
 * @returns {string}
 */
export function sensorLayoutHash(entity_hashes, mode, grid_size, offset, max_sensors, terrain_hash, partial_cells, min_coverage, mesh_cleaning) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passArrayJsValueToWasm0(entity_hashes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(terrain_hash) ? 0 : passStringToWasm0(terrain_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.sensorLayoutHash(ptr0, len0, ptr1, len1, grid_size, offset, max_sensors, ptr2, len2, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, ptr3, len3);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Measures ONE colour-scale range pooled across several grids' finite cells
 * (issue #390): every grid's finite cells are pooled and `mode` is applied
 * once, so `"trimmed"` is the percentile of the POOLED data, never a union
 * of per-grid percentiles. Mirror of the Python wheel's
 * `shared_legend_range`; same `mode`/`fixedMin`/`fixedMax` rules as
 * `legendRange`.
 *
 * `grids`: an array of `Float32Array` / `Float64Array` (they may be mixed).
 * Each `Float32Array` is widened to f64 HERE, exactly, because the kernel's
 * pooling entry point takes f64 only — marshalling, not a second copy of the
 * rule. `undefined` when `grids` is empty or no cell anywhere is finite.
 * @param {any[]} grids
 * @param {string | null} [mode]
 * @param {number | null} [fixed_min]
 * @param {number | null} [fixed_max]
 * @returns {Float64Array | undefined}
 */
export function sharedLegendRange(grids, mode, fixed_min, fixed_max) {
    const ptr0 = passArrayJsValueToWasm0(grids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(mode) ? 0 : passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.sharedLegendRange(ptr0, len0, ptr1, len1, !isLikeNone(fixed_min), isLikeNone(fixed_min) ? 0 : fixed_min, !isLikeNone(fixed_max), isLikeNone(fixed_max) ? 0 : fixed_max);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Simplify many meshes in one call, each on its own: exact weld, then
 * quadric edge collapse. The kept vertices are input vertices with their
 * input values. Every `undefined` takes the kernel default.
 *
 * `targetRatio`: kept triangle share (`undefined` = no count limit).
 * `maxErrorM`: error limit in metres, the simplifier's estimate, not a bound
 * (`Infinity` = no limit). `lockBorder` keeps every open edge.
 * Returns `{ coordinates, vertOffsets, indices, faceOffsets, errorsM, kept }`:
 * `kept` is the input index of each output mesh; a mesh that collapses to no
 * triangle is left out.
 * @param {any} coordinates
 * @param {Uint32Array} vert_offsets
 * @param {Uint32Array} indices
 * @param {Uint32Array} face_offsets
 * @param {number | null} [target_ratio]
 * @param {number | null} [max_error_m]
 * @param {boolean | null} [lock_border]
 * @returns {object}
 */
export function simplifyMeshes(coordinates, vert_offsets, indices, face_offsets, target_ratio, max_error_m, lock_border) {
    const ptr0 = passArray32ToWasm0(vert_offsets, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(face_offsets, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.simplifyMeshes(coordinates, ptr0, len0, ptr1, len1, ptr2, len2, !isLikeNone(target_ratio), isLikeNone(target_ratio) ? 0 : target_ratio, !isLikeNone(max_error_m), isLikeNone(max_error_m) ? 0 : max_error_m, isLikeNone(lock_border) ? 0xFFFFFF : lock_border ? 1 : 0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The read chunks of `site` (`[west, south, east, north]`), each with its
 * compose pieces over the flat tile `rectangles`,
 * as JSON `[{"id", "bbox", "pieces": [{"id", "bbox"}]}]`
 * (`ir_geodata::site_chunks`).
 * @param {Float64Array} site
 * @param {Float64Array} rectangles
 * @returns {string}
 */
export function siteChunks(site, rectangles) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passArrayF64ToWasm0(site, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(rectangles, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.siteChunks(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The one-frame warnings `site` earns, in order (area, then extent), as a
 * JSON string array; `[]` for a site one local frame covers.
 * @param {Float64Array} site
 * @returns {string}
 */
export function siteFrameWarnings(site) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArrayF64ToWasm0(site, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.siteFrameWarnings(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The site key over the packed site: the layout of the .NET `SiteKey.cs` plus
 * group indices and a trailing `family` text. The coordinates are `Float64Array`s; the five
 * documents are JSON text or `undefined` (a mesh group's document holds no
 * coordinates). Lowercase hex sha256.
 * @param {string} building_ids_json
 * @param {Float64Array} building_coordinates
 * @param {Uint32Array} building_offsets
 * @param {Uint32Array} building_indices
 * @param {Uint32Array} building_index_offsets
 * @param {string} context_ids_json
 * @param {Float64Array} context_coordinates
 * @param {Uint32Array} context_offsets
 * @param {Uint32Array} context_indices
 * @param {Uint32Array} context_index_offsets
 * @param {string | null | undefined} geometries
 * @param {string | null | undefined} context_geometry
 * @param {string | null | undefined} ground_geometry
 * @param {string | null | undefined} vegetation
 * @param {string | null | undefined} ground_materials
 * @param {Uint32Array} rows
 * @param {Uint32Array} cols
 * @param {string} tile_ids_json
 * @param {Float64Array} scalars
 * @param {string} polygon
 * @param {string} family
 * @returns {string}
 */
export function siteKey(building_ids_json, building_coordinates, building_offsets, building_indices, building_index_offsets, context_ids_json, context_coordinates, context_offsets, context_indices, context_index_offsets, geometries, context_geometry, ground_geometry, vegetation, ground_materials, rows, cols, tile_ids_json, scalars, polygon, family) {
    let deferred22_0;
    let deferred22_1;
    try {
        const ptr0 = passStringToWasm0(building_ids_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(building_coordinates, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(building_offsets, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(building_indices, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passArray32ToWasm0(building_index_offsets, wasm.__wbindgen_malloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(context_ids_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passArrayF64ToWasm0(context_coordinates, wasm.__wbindgen_malloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passArray32ToWasm0(context_offsets, wasm.__wbindgen_malloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passArray32ToWasm0(context_indices, wasm.__wbindgen_malloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passArray32ToWasm0(context_index_offsets, wasm.__wbindgen_malloc);
        const len9 = WASM_VECTOR_LEN;
        var ptr10 = isLikeNone(geometries) ? 0 : passStringToWasm0(geometries, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len10 = WASM_VECTOR_LEN;
        var ptr11 = isLikeNone(context_geometry) ? 0 : passStringToWasm0(context_geometry, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len11 = WASM_VECTOR_LEN;
        var ptr12 = isLikeNone(ground_geometry) ? 0 : passStringToWasm0(ground_geometry, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len12 = WASM_VECTOR_LEN;
        var ptr13 = isLikeNone(vegetation) ? 0 : passStringToWasm0(vegetation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len13 = WASM_VECTOR_LEN;
        var ptr14 = isLikeNone(ground_materials) ? 0 : passStringToWasm0(ground_materials, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len14 = WASM_VECTOR_LEN;
        const ptr15 = passArray32ToWasm0(rows, wasm.__wbindgen_malloc);
        const len15 = WASM_VECTOR_LEN;
        const ptr16 = passArray32ToWasm0(cols, wasm.__wbindgen_malloc);
        const len16 = WASM_VECTOR_LEN;
        const ptr17 = passStringToWasm0(tile_ids_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len17 = WASM_VECTOR_LEN;
        const ptr18 = passArrayF64ToWasm0(scalars, wasm.__wbindgen_malloc);
        const len18 = WASM_VECTOR_LEN;
        const ptr19 = passStringToWasm0(polygon, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len19 = WASM_VECTOR_LEN;
        const ptr20 = passStringToWasm0(family, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len20 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.siteKey(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10, ptr11, len11, ptr12, len12, ptr13, len13, ptr14, len14, ptr15, len15, ptr16, len16, ptr17, len17, ptr18, len18, ptr19, len19, ptr20, len20);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred22_0 = ret[0];
        deferred22_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred22_0, deferred22_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Move non-owned buildings from `geometries` into `context-geometry`.
 *
 * `coreXM` / `coreYM` are the tile's RE-ANCHORED core extent (D48/D63);
 * omitted, both fall back to `inferenceSizeM` and the call behaves exactly
 * as it did before D63.
 * @param {string} payload_json
 * @param {number} inference_size_m
 * @param {number | null} [core_x_m]
 * @param {number | null} [core_y_m]
 * @returns {string}
 */
export function splitFacadeCoreContext(payload_json, inference_size_m, core_x_m, core_y_m) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(payload_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.splitFacadeCoreContext(ptr0, len0, inference_size_m, !isLikeNone(core_x_m), isLikeNone(core_x_m) ? 0 : core_x_m, !isLikeNone(core_y_m), isLikeNone(core_y_m) ? 0 : core_y_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * [`split_facade_core_context`] returning `{"payload": ..., "shrink_band": [...]}`.
 *
 * `shrink_band` names the buildings the nominal `inferenceSizeM` box would
 * have kept and the re-anchored box hands to the tile east. The host asserts
 * that some tile claimed each of them (D63).
 * @param {string} payload_json
 * @param {number} inference_size_m
 * @param {number | null} [core_x_m]
 * @param {number | null} [core_y_m]
 * @returns {string}
 */
export function splitFacadeCoreContextReport(payload_json, inference_size_m, core_x_m, core_y_m) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(payload_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.splitFacadeCoreContextReport(ptr0, len0, inference_size_m, !isLikeNone(core_x_m), isLikeNone(core_x_m) ? 0 : core_x_m, !isLikeNone(core_y_m), isLikeNone(core_y_m) ? 0 : core_y_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The columns of a blob, in the shape `SurfaceJoinStream.finish` returns, plus
 * `layoutKey` (absent when the blob has none). Refuses a blob the kernel
 * cannot read, an unknown version included.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function surfaceColumnsFromBytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceColumnsFromBytes(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The blob of `columns` (a `SurfaceColumns`), made for the layout `layoutKey`.
 * @param {any} columns
 * @param {string | null} [layout_key]
 * @returns {Uint8Array}
 */
export function surfaceColumnsToBytes(columns, layout_key) {
    var ptr0 = isLikeNone(layout_key) ? 0 : passStringToWasm0(layout_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceColumnsToBytes(columns, ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * The capture of a one-job surface request `body` (its JSON wire bytes), or
 * `undefined` when the body has nothing to synthesize.
 * @param {Uint8Array} body
 * @returns {Uint8Array | undefined}
 */
export function surfaceJobCapture(body) {
    const ptr0 = passArray8ToWasm0(body, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceJobCapture(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * The per-cell triangles of job `jobId`'s downloaded `archive`, drawn from
 * its capture in `store` (released): `{ ids, cellOffsets, triangleOffsets,
 * drawn, positions, fallbackReasons }` (`triangleOffsets` is empty without
 * triangles; `positions` holds 9 per triangle).
 * @param {Uint8Array} archive
 * @param {CaptureStore} store
 * @param {string} job_id
 * @param {bigint} max_total_bytes
 * @param {number} max_metadata_bytes
 * @param {bigint} max_cells
 * @param {bigint} max_triangle_values
 * @returns {any}
 */
export function surfaceJobTriangles(archive, store, job_id, max_total_bytes, max_metadata_bytes, max_cells, max_triangle_values) {
    const ptr0 = passArray8ToWasm0(archive, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(store, CaptureStore);
    const ptr1 = passStringToWasm0(job_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceJobTriangles(ptr0, len0, store.__wbg_ptr, ptr1, len1, max_total_bytes, max_metadata_bytes, max_cells, max_triangle_values);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Build the render buffers of a run from its surface columns. Returns
 * `anchor` (`Float64Array` 3), `frames` (`Float32Array`), `dims`
 * (`Uint32Array`), `outline` (`Float32Array`), `outlineOffsets`
 * (`Uint32Array`), `values` (`Uint16Array` of half bits when `valueDtype` is
 * `"f16"`, else `Float32Array`), `valueDtype` (`"f16"` or `"f32"`),
 * `validity` (`Uint8Array`), `valueMin`, `valueMax` and `anyValid`.
 *
 * `columns` needs `origin`, `uAxis`, `vAxis`, `gridSize`, `nu`, `nv`,
 * `cellOffsets`, `values` with `valueDtype` (and for `"i16"` `valueDivisor`
 * and `valid`). The outline comes from `layout` (a saved or rebuilt layout,
 * found by surface id with `ids` and `idOffsets`) when it is given, else from
 * the columns `outline` and `outlineOffsets`. Fails with the kernel's reason
 * on any input the contract refuses.
 * @param {any} columns
 * @returns {any}
 */
export function surfaceRenderBuffers(columns) {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceRenderBuffers(columns);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Cells `start..end` of a value column as physical `f32`, NaN for a cell
 * without a value. `bytes` are the column's little-endian bytes (the bytes of
 * the typed array), `dtype` its `valuesDtype`, `divisor` its `valueDivisor`
 * and `valid` its `valuesValid` bitmap (`i16` only).
 * @param {Uint8Array} bytes
 * @param {string} dtype
 * @param {number} divisor
 * @param {Uint8Array | null | undefined} valid
 * @param {number} start
 * @param {number} end
 * @returns {Float32Array}
 */
export function surfaceValuesF32(bytes, dtype, divisor, valid, start, end) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(dtype, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(valid) ? 0 : passArray8ToWasm0(valid, wasm.__wbindgen_malloc);
    var len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfaceValuesF32(ptr0, len0, ptr1, len1, divisor, ptr2, len2, start, end);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v4;
}

/**
 * The wire values of the pinned surface fields (JSON in and out).
 * @param {string} fields
 * @returns {string}
 */
export function surfaceWireFields(fields) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(fields, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.surfaceWireFields(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The canonical defaults for the three optional synthesis knobs, so a TS caller
 * can import them instead of hardcoding literals that could drift from the
 * kernel. Returns `[partialCells, minCoverage, emitCellTris]`.
 * @returns {any[]}
 */
export function surfgridDefaults() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfgridDefaults();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Behavioural version of surface synthesis, as mixed into `maskHash`. A
 * consumer caching masks should store this alongside them.
 * @returns {number}
 */
export function surfgridVersion() {
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.surfgridVersion();
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret >>> 0;
}

/**
 * Rebuild a facade/roof layout offline from the original inputs and hold it
 * for later reading (`FacadeLayoutHandle::fields`) and/or export
 * (`FacadeLayoutHandle::toBytes`).
 * @param {string} request_json
 * @returns {FacadeLayoutHandle}
 */
export function synthesizeFacadeLayoutHandle(request_json) {
    const ptr0 = passStringToWasm0(request_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.synthesizeFacadeLayoutHandle(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return FacadeLayoutHandle.__wrap(ret[0]);
}

/**
 * ir-geo::surfgrid façade/roof sensor synthesis (issue #37). geometries map
 * (`{uuid:{coordinates,indices}}`, tile-local meters) → JSON
 * `{points, normals, cell_area, cell_tris, frames:[{key,origin,u_axis,v_axis,grid_size,nu,nv,cells}], warnings, entity_hashes}`.
 * `mode` ∈ {"facades","roofs","all"}.
 *
 * Entities are walked in CANONICAL `(entity_hash, uuid)` order (SURFGRID
 * v2), not map insertion order, so any two holders of the same geometry get
 * byte-identical arrays. `entity_hashes` carries the per-entity leaf hashes
 * in that walk order — pass it verbatim to `sensorLayoutHash`.
 *
 * `partialCells` (default **true**, `ir_geo::surfgrid::DEFAULT_PARTIAL_CELLS`):
 * clip each boundary cell to the surface (Sutherland–Hodgman), keep it when its
 * in-surface area fraction exceeds `minCoverage` (default 0.05), and place the
 * sensor at the clipped centroid. `cell_area` then carries one fraction in
 * `(0,1]` per sensor (× `grid_size²` for patch area); `null` when false (cheap
 * centre keep/drop). Holes (courtyard voids, windows) are respected for free.
 * Pass `false` for the cheap centre path (fewer/shifted sensors → billing).
 *
 * `emitCellTris` (default **true**, requires `partialCells`): `cell_tris`
 * carries one entry per sensor — the clipped cell as a FLAT world-3D
 * triangle-vertex list (len a multiple of 9: 3 verts × xyz, coplanar with the
 * sensor) — so consumers render the true clipped cell, not a square. `null`
 * when off.
 *
 * `maxSensors` is a PER-BUILDING cap: a building that would exceed it is
 * COARSENED (its grid doubled, up to 6×) until it fits — never an error, never
 * dropped. Any coarsening is reported as a string in the `warnings` array.
 *
 * Throws on bad mode / no matching surface.
 * `returnBuffers` is additive and defaults to false. False returns the exact
 * legacy JSON string. True returns the owned typed-array record described by
 * `SurfaceSynthesisBuffers` in the generated TypeScript declarations.
 * `compactCells` is opt-in and replaces each frame's `cells` array with
 * owned little-endian u64 bytes. The full u32 index range remains valid.
 * @param {string} geometries_json
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} max_sensors
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {boolean | null} [emit_cell_tris]
 * @param {boolean | null} [return_buffers]
 * @param {boolean | null} [compact_cells]
 * @param {string | null} [mesh_cleaning]
 * @returns {any}
 */
export function synthesizeSurfaces(geometries_json, mode, grid_size, offset, max_sensors, partial_cells, min_coverage, emit_cell_tris, return_buffers, compact_cells, mesh_cleaning) {
    const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.synthesizeSurfaces(ptr0, len0, ptr1, len1, grid_size, offset, max_sensors, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, isLikeNone(emit_cell_tris) ? 0xFFFFFF : emit_cell_tris ? 1 : 0, isLikeNone(return_buffers) ? 0xFFFFFF : return_buffers ? 1 : 0, isLikeNone(compact_cells) ? 0xFFFFFF : compact_cells ? 1 : 0, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Rebuild one accepted facade sensor layout from the submitted batch bytes.
 * The default result keeps the existing `SurfaceSynthesisResult` shape.
 * `compactCells` opts into owned u64 cell-index bytes. A `Uint8Array` input
 * is copied once into wasm memory; no host geometry tree is needed.
 * @param {Uint8Array} capture
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} max_sensors
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {boolean | null} [emit_cell_tris]
 * @param {boolean | null} [return_buffers]
 * @param {boolean | null} [compact_cells]
 * @param {string | null} [mesh_cleaning]
 * @returns {any}
 */
export function synthesizeSurfacesFromCapture(capture, mode, grid_size, offset, max_sensors, partial_cells, min_coverage, emit_cell_tris, return_buffers, compact_cells, mesh_cleaning) {
    const ptr0 = passArray8ToWasm0(capture, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.synthesizeSurfacesFromCapture(ptr0, len0, ptr1, len1, grid_size, offset, max_sensors, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, isLikeNone(emit_cell_tris) ? 0xFFFFFF : emit_cell_tris ? 1 : 0, isLikeNone(return_buffers) ? 0xFFFFFF : return_buffers ? 1 : 0, isLikeNone(compact_cells) ? 0xFFFFFF : compact_cells ? 1 : 0, ptr2, len2);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Terrain-aware façade/roof sensor synthesis: `synthesizeSurfaces` plus a
 * terrain mesh that CULLS sub-grade sensors (within `ir_geo::surfgrid::CLIP_EPS`
 * of the sampled terrain). Identical surface contract + defaults to
 * `synthesizeSurfaces`, with the extra `terrainCoordinates`/`terrainIndices`
 * (flat mesh, tile-local frame, like `groundCleanV3OnTerrain`). Sensors outside
 * the terrain extent are kept. An empty terrain mesh throws (use the
 * terrain-free `synthesizeSurfaces` for no-terrain synthesis).
 * `returnBuffers` defaults to false. `compactCells` is an opt-in buffer form.
 * @param {string} geometries_json
 * @param {string} mode
 * @param {number} grid_size
 * @param {number} offset
 * @param {bigint} max_sensors
 * @param {Float64Array} terrain_coordinates
 * @param {Uint32Array} terrain_indices
 * @param {boolean | null} [partial_cells]
 * @param {number | null} [min_coverage]
 * @param {boolean | null} [emit_cell_tris]
 * @param {boolean | null} [return_buffers]
 * @param {boolean | null} [compact_cells]
 * @param {string | null} [mesh_cleaning]
 * @returns {any}
 */
export function synthesizeSurfacesOnTerrain(geometries_json, mode, grid_size, offset, max_sensors, terrain_coordinates, terrain_indices, partial_cells, min_coverage, emit_cell_tris, return_buffers, compact_cells, mesh_cleaning) {
    const ptr0 = passStringToWasm0(geometries_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayF64ToWasm0(terrain_coordinates, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArray32ToWasm0(terrain_indices, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    var ptr4 = isLikeNone(mesh_cleaning) ? 0 : passStringToWasm0(mesh_cleaning, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.synthesizeSurfacesOnTerrain(ptr0, len0, ptr1, len1, grid_size, offset, max_sensors, ptr2, len2, ptr3, len3, isLikeNone(partial_cells) ? 0xFFFFFF : partial_cells ? 1 : 0, !isLikeNone(min_coverage), isLikeNone(min_coverage) ? 0 : min_coverage, isLikeNone(emit_cell_tris) ? 0xFFFFFF : emit_cell_tris ? 1 : 0, isLikeNone(return_buffers) ? 0xFFFFFF : return_buffers ? 1 : 0, isLikeNone(compact_cells) ? 0xFFFFFF : compact_cells ? 1 : 0, ptr4, len4);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The content key a terrain document would have (SHA-256 hex of its UTF-8
 * bytes): what `SiteTerrain.contentKey` gives after a read.
 * @param {string} document
 * @returns {string}
 */
export function terrainContentKey(document) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.terrainContentKey(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * True when a host may take a terrain group hash from its `SiteTerrain`
 * handle for `model` (false for the interior models, which hash every group
 * as a document).
 * @param {string} model
 * @returns {boolean}
 */
export function terrainHandleHashApplies(model) {
    const ptr0 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.terrainHandleHashApplies(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * The terrain margin of a run: `{"requested_m", "effective_m"}` as JSON.
 * `marginM` undefined is the kernel default (0 m).
 * @param {string | null} [analysis_type]
 * @param {number | null} [margin_m]
 * @returns {string}
 */
export function terrainMargin(analysis_type, margin_m) {
    let deferred3_0;
    let deferred3_1;
    try {
        var ptr0 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.terrainMargin(ptr0, len0, !isLikeNone(margin_m), isLikeNone(margin_m) ? 0 : margin_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * JSON facts for Uint32Array lengths; a JavaScript array cannot exceed
 * its u32 index space. Python accepts platform-sized `len` values instead.
 * @param {Uint32Array} index_lengths
 * @returns {string}
 */
export function terrainTriangleCap(index_lengths) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ptr0 = passArray32ToWasm0(index_lengths, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.terrainTriangleCap(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred2_0 = ret[0];
        deferred2_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `(lon, lat)` of a tile's own frame origin, as the site arena anchors that
 * tile (`ir_geo::tiling::scalar_port::tile_frame_origin`): what a facade
 * layout rebuild needs for a job's `tileOrigin`. Not the host's scalar
 * inverse, which differs in the last place.
 * @param {number} row
 * @param {number} col
 * @param {string | null | undefined} analysis_type
 * @param {number} site_lon
 * @param {number} site_lat
 * @returns {Float64Array}
 */
export function tileFrameOrigin(row, col, analysis_type, site_lon, site_lat) {
    var ptr0 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.tileFrameOrigin(row, col, ptr0, len0, site_lon, site_lat);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * True when a tile payload of `analysisType` carries the tile centroid as
 * its `latitude` / `longitude`.
 * @param {string} analysis_type
 * @returns {boolean}
 */
export function tileLocationApplies(analysis_type) {
    const ptr0 = passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.tileLocationApplies(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret !== 0;
}

/**
 * `infrared_sdk.tiling.transforms.tile_sw_offset` port. `(row, col)` + analysis
 * type → `[offset_x, offset_y]` (meters, relative to the polygon-bbox SW
 * corner; `analysisType` undefined → wind preset). Returned as a length-2
 * Float64Array — the buildings reverse path negates it.
 * @param {number} row
 * @param {number} col
 * @param {string | null} [analysis_type]
 * @returns {Float64Array}
 */
export function tileSwOffset(row, col, analysis_type) {
    var ptr0 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.tileSwOffset(row, col, ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * One job's price for `analysisType` in the price list (JSON); throws when
 * the list has none.
 * @param {string} pricing
 * @param {string} analysis_type
 * @returns {string}
 */
export function tokensPerJob(pricing, analysis_type) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(pricing, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.tokensPerJob(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * `infrared_sdk.tiling.transforms.transform_building_coords` port. Shift a flat
 * `[x,y,z,...]` array (Float64Array) by subtracting `offsetX` from x and
 * `offsetY` from y (z untouched). Throws when the length is not a multiple of 3.
 * @param {Float64Array} coordinates
 * @param {number} offset_x
 * @param {number} offset_y
 * @returns {Float64Array}
 */
export function transformBuildingCoords(coordinates, offset_x, offset_y) {
    const ptr0 = passArrayF64ToWasm0(coordinates, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.transformBuildingCoords(ptr0, len0, offset_x, offset_y);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * utilities-service `POST /geometry/transform` port (JSON in/out).
 * @param {string} meshes_json
 * @param {number} origin_x
 * @param {number} origin_y
 * @param {number} destination_x
 * @param {number} destination_y
 * @returns {string}
 */
export function translateMeshes(meshes_json, origin_x, origin_y, destination_x, destination_y) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(meshes_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.translateMeshes(ptr0, len0, origin_x, origin_y, destination_x, destination_y);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The one tree z warning of a run, or undefined: `treesWithoutZ` (the
 * site's count) is not zero and `terrainAlignment` is `"as-is"`.
 * @param {number} trees_without_z
 * @param {string | null} [terrain_alignment]
 * @returns {string | undefined}
 */
export function treeZWarning(trees_without_z, terrain_alignment) {
    var ptr0 = isLikeNone(terrain_alignment) ? 0 : passStringToWasm0(terrain_alignment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.treeZWarning(trees_without_z, ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    let v2;
    if (ret[0] !== 0) {
        v2 = getStringFromWasm0(ret[0], ret[1]);
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
}

/**
 * Tree attribute normalisation — utilities-service
 * `app/gis/tree_attributes.py`.
 *
 * `source` is `"osm"` for the world FlatGeobuf / Overpass shape, or a city
 * overlay's registry source key. `idPrefix` namespaces overlay ids and
 * defaults to the reference's own fallback, `"city"`.
 * @param {string} fc_json
 * @param {string} source
 * @param {string | null} [id_prefix]
 * @returns {string}
 */
export function treesNormalize(fc_json, source, id_prefix) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(fc_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(id_prefix) ? 0 : passStringToWasm0(id_prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.treesNormalize(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Inverse of `packCoordinates`: decode a RAW base64(f32 LE) `coordinates_bin`
 * blob back to a flat interleaved xyz coordinate array (§2.4 wire). Throws
 * on malformed base64 or a byte length that is not a whole number of 4-byte
 * f32 lanes — a decoder never guesses at truncated blobs.
 * @param {string} coordinates_bin
 * @returns {Float32Array}
 */
export function unpackCoordinates(coordinates_bin) {
    const ptr0 = passStringToWasm0(coordinates_bin, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.unpackCoordinates(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * Inverse of `packIndices`: decode a RAW base64(i32 LE) `indices_bin` blob back
 * to a triangle-index array (§2.1 wire). Throws on malformed base64 or a
 * byte length that is not a whole number of 4-byte i32 lanes.
 * @param {string} indices_bin
 * @returns {Uint32Array}
 */
export function unpackIndices(indices_bin) {
    const ptr0 = passStringToWasm0(indices_bin, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.unpackIndices(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * Refuse a ground-materials document whose layer keys are not material names
 * the simulation knows (D56, issue #217).
 *
 * `document` is the `{material_name: FeatureCollection}` object as JSON text;
 * the values are never read. Throws with the offending key and the five
 * accepted names — and, for a registry-UUID key, the extra sentence that
 * points at `features[].properties.material`, because the remedy is
 * different. Returns nothing: there is nothing to report when the document is
 * acceptable.
 *
 * This REPLACES `validateGroundMaterialKeys`, which returned unknown names for
 * the host to warn about. A warning let a job run and bill with an unknown
 * material, which is the failure this closes.
 * @param {string} document
 */
export function validateGroundLayers(document) {
    const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.validateGroundLayers(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Validate a complete JSON triangle-index array without coercing its values.
 * One call checks every element and returns a flat copy of the indices.
 * @param {string} indices_json
 * @param {number} vertex_count
 * @returns {Uint32Array}
 */
export function validateMeshIndices(indices_json, vertex_count) {
    const ptr0 = passStringToWasm0(indices_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.validateMeshIndices(ptr0, len0, vertex_count);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
}

/**
 * `infrared_sdk.tiling.validation.validate_polygon` port. JSON GeoJSON Polygon
 * in → validated + winding-normalized JSON Polygon out.
 * @param {string} polygon_json
 * @returns {string}
 */
export function validatePolygon(polygon_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(polygon_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.validatePolygon(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Read-only scene alignment check (NO mutation) — the worker/scheduler reject
 * gate (`ir_simprep::conform::validate_scene_alignment`). Same geometry inputs
 * as `conformScene` (minus seating opts). `skirtDepthM`/`epsilonM` MUST match
 * the `conformScene` opts the scene was (or would be) seated with; default
 * (when `undefined`) to the kernel consts. Returns a JSON array of
 * `{index, kind, base_z, terrain_z, residual_m}` for every misaligned object
 * (`terrain_z`/`residual_m` are `null` off-terrain). Empty array ⇒ aligned.
 * @param {string} solids_json
 * @param {Float64Array} sensor_points
 * @param {Float64Array} terrain_coordinates
 * @param {Uint32Array} terrain_indices
 * @param {number | null} [skirt_depth_m]
 * @param {number | null} [epsilon_m]
 * @returns {string}
 */
export function validateSceneAlignment(solids_json, sensor_points, terrain_coordinates, terrain_indices, skirt_depth_m, epsilon_m) {
    let deferred6_0;
    let deferred6_1;
    try {
        const ptr0 = passStringToWasm0(solids_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(sensor_points, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(terrain_coordinates, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArray32ToWasm0(terrain_indices, wasm.__wbindgen_malloc);
        const len3 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.validateSceneAlignment(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, !isLikeNone(skirt_depth_m), isLikeNone(skirt_depth_m) ? 0 : skirt_depth_m, !isLikeNone(epsilon_m), isLikeNone(epsilon_m) ? 0 : epsilon_m);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr5 = ret[0];
        var len5 = ret[1];
        if (ret[3]) {
            ptr5 = 0; len5 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred6_0 = ptr5;
        deferred6_1 = len5;
        return getStringFromWasm0(ptr5, len5);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred6_0, deferred6_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Check one analysis window (JSON) and return it; throws.
 * @param {string} window
 * @param {string | null} [analysis_type]
 * @returns {string}
 */
export function validateTimeWindow(window, analysis_type) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(window, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(analysis_type) ? 0 : passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.validateTimeWindow(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * @returns {string}
 */
export function vegetationDimensionKeys() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.vegetationDimensionKeys();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * lambda-models in-process vegetation meshing port: Point features +
 * caller-fetched registry JSON -> dotbim meshes (JSON strings throughout).
 * @param {string} features_json
 * @param {number} reference_lon
 * @param {number} reference_lat
 * @param {string} registry_json
 * @returns {string}
 */
export function vegetationPointsToMeshes(features_json, reference_lon, reference_lat, registry_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(features_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(registry_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.vegetationPointsToMeshes(ptr0, len0, reference_lon, reference_lat, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The baked production vegetation registry (bare `clientModels` map, 8
 * species, first entry = default) as JSON — feed it to
 * `vegetationPointsToMeshes` / `instancesFromPoints` / `expandInstances` when
 * no fresher registry is at hand. Published with the kernel (2026-07-10
 * decision: the tree models are not secret).
 * @returns {string}
 */
export function vegetationRegistry() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.vegetationRegistry();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The composite production registry document (v1.3.0): four archetypes
 * first, then the legacy species. Untagged trees use the first archetype.
 * @returns {string}
 */
export function vegetationRegistryDocument() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.vegetationRegistryDocument();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Registry version of `vegetationRegistry` — pass as `registryVersion` to the
 * instancing round-trip (its version-skew guard refuses mismatches).
 * @returns {string}
 */
export function vegetationRegistryVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.vegetationRegistryVersion();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Return the kernel's tagged acknowledgement verdict as JSON.
 * @param {string} accept_body_json
 * @param {string[]} expected_groups
 * @returns {string}
 */
export function verifyGeometryAck(accept_body_json, expected_groups) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(accept_body_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(expected_groups, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.verifyGeometryAck(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Build a pedestrian walk graph from Overture segments and connectors.
 *
 * `segments` and `connectors` are the FeatureCollections the host has
 * already read. The graph is placed in the frame at (`originLon`,
 * `originLat`) — pass the same origin the rest of the scene uses.
 *
 * Returns `{"nodes": {id: {x, y}}, "edges": [{from, to, length, travelTime
 * as travel_time, road_class, surface, coordinates}], "metadata": {…}}`.
 * Lengths are local-frame metres, NOT the reference's UTM metres
 * (`docs/DEVIATIONS.md` D137).
 *
 * Every cut is returned. `metadata.distinct_pairs` is what a
 * `networkx.Graph` would collapse `edges` to.
 * @param {string} segments
 * @param {string} connectors
 * @param {number} origin_lon
 * @param {number} origin_lat
 * @param {number} walk_speed_kph
 * @returns {string}
 */
export function walkGraphBuild(segments, connectors, origin_lon, origin_lat, walk_speed_kph) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(segments, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(connectors, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.walkGraphBuild(ptr0, len0, ptr1, len1, origin_lon, origin_lat, walk_speed_kph);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

export class wbg_rayon_PoolBuilder {
    static __wrap(ptr) {
        const obj = Object.create(wbg_rayon_PoolBuilder.prototype);
        obj.__wbg_ptr = ptr;
        wbg_rayon_PoolBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        wbg_rayon_PoolBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        __wbg_call_guard();
        try {
            wasm.__wbg_wbg_rayon_poolbuilder_free(ptr, 0);
        } catch(e) {
            __wbg_handle_catch(e);
        }

    }
    build() {
        __wbg_call_guard();
        try {
            wasm.wbg_rayon_poolbuilder_build(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
    /**
     * @returns {number}
     */
    numThreads() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.wbg_rayon_poolbuilder_numThreads(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    receiver() {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.wbg_rayon_poolbuilder_receiver(this.__wbg_ptr);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        return ret >>> 0;
    }
}
if (Symbol.dispose) wbg_rayon_PoolBuilder.prototype[Symbol.dispose] = wbg_rayon_PoolBuilder.prototype.free;

/**
 * @param {number} receiver
 */
export function wbg_rayon_start_worker(receiver) {
    __wbg_call_guard();
    try {
        wasm.wbg_rayon_start_worker(receiver);
    } catch(e) {
        __wbg_handle_catch(e);
    }
}

/**
 * The weather arrays `analysisType` reads, by request name, from catalog
 * weather (JSON), as JSON; throws on a gap, a bad window or a bad wind pair.
 * @param {string} weather
 * @param {string} analysis_type
 * @param {string | null} [time_period]
 * @returns {string}
 */
export function weatherColumns(weather, analysis_type, time_period) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(weather, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(analysis_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(time_period) ? 0 : passStringToWasm0(time_period, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherColumns(ptr0, len0, ptr1, len1, ptr2, len2);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Filter a station `data` object's hourly arrays to the indices matching
 * `time_period_json` (verbatim `_matches_time_range` semantics: month/hour
 * wrap-around, equality when `start == end`, an inclusive day range with
 * no wrap, EPW hours 1-24 normalised to 0-23 before comparison).
 * `time_period_json` fields are snake_case: `start_month`, `start_day`,
 * `start_hour`, `end_month`, `end_day`, `end_hour`.
 * @param {string} station_json
 * @param {string} time_period_json
 * @returns {string}
 */
export function weatherFilterHours(station_json, time_period_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(station_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(time_period_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherFilterHours(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The versioned identity of a `weather_document`: `sha256:<hex>` over the
 * framed input of contract section 9 — proof that two runs used the same
 * weather.
 *
 * It hashes the validated VALUES, the location, the calendar columns and
 * the hour basis; never the file name, the raw text or a station id, so
 * two files with the same readings and different spacing share one
 * identity. A document that cannot supply one throws, rather than being
 * given the current file's weather.
 * @param {string} document
 * @returns {string}
 */
export function weatherIdentity(document) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherIdentity(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Select the snake_case weather arrays one model needs from a
 * `weather_document` (contract sections 7 and 10).
 *
 * `requestJson` carries `analysis_type`, the optional `subtype`, the
 * `time_period` window and the optional `solar_model`. `solar_model`
 * belongs to `energy-balance`, the one analysis whose worker reads it;
 * elsewhere it is refused, never ignored. The window is
 * applied first, then the required fields are checked ON THE FILTERED
 * ROWS, then the period rule — so a gap outside the window is harmless, a
 * gap inside it throws, and a model that needs a full year throws when the
 * window is shorter. Every one of those reaches the caller BEFORE a
 * request is submitted.
 * @param {string} document
 * @param {string} request_json
 * @returns {string}
 */
export function weatherModelInputs(document, request_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(document, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(request_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherModelInputs(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Parse one EPW file's text into a `weather_document` (contract sections
 * 3-8): the location, the period, the 34 hour-indexed arrays with a `null`
 * for every gap, the gap row indexes, and the document's own identity.
 *
 * `text` is the whole file — the HOST reads the file and the kernel parses
 * text (root `CLAUDE.md` rule 1). `optionsJson` is the options object,
 * `"null"` or `"{}"` for the defaults; `max_bytes` and `max_rows` may only
 * be TIGHTENED, and an unknown option throws rather than being ignored.
 *
 * **This side takes a JavaScript string only.** The wheel's twin also
 * accepts `bytes`, and with them the whole-input Latin-1 fallback for the
 * older files whose station names are not UTF-8. A TypeScript host must
 * therefore decode the file itself; `TextDecoder("windows-1252")` is the
 * equivalent of that fallback. The kernel's behaviour is identical once
 * the text arrives — only the accepted INPUT set differs, because
 * wasm-bindgen strings are already UTF-8 by the time they reach Rust.
 *
 * Throws with a message that names the row or the field for every
 * rejection, so a caller learns what is wrong with their file before a
 * request is submitted.
 * @param {string} text
 * @param {string} options_json
 * @returns {string}
 */
export function weatherParseEpw(text, options_json) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(options_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherParseEpw(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The generation folder URL a catalog pointer (`latest.json` bytes) names
 * under `baseUrl` (no trailing slash). Throws when the pointer is not a JSON
 * object with a usable `path`.
 * @param {string} base_url
 * @param {Uint8Array} pointer
 * @returns {string}
 */
export function weatherPointerFolder(base_url, pointer) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(pointer, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherPointerFolder(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The records of a `weatherFilterHours` answer: a JSON array with one
 * `{field: value | null}` object per hour. See `ir_geodata::weather::rows`.
 * Throws naming a measurement cell that is not numeric.
 * @param {string} filtered_json
 * @returns {string}
 */
export function weatherRows(filtered_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(filtered_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherRows(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The versioned identity of one RUN's weather: `sha256:<hex>` over the
 * framed input of contract section 9.1 — proof that two runs SUBMITTED the
 * same weather, whatever source it came from.
 *
 * `inputsJson` is one object: `latitude`, `longitude`, the six-integer
 * `window` (`start_month` .. `end_hour`) and `columns`, a map of
 * snake_case column name to an array of finite numbers. It hashes what a
 * request carries — never a file, a station or a row outside the window —
 * so a catalog run, a hand-built run and a bring-your-own-file run all get
 * one identity of one shape.
 *
 * Call it ONCE PER RUN, over the arrays the prepared payload holds, never
 * per tile. Throws when a member is missing or a value is not finite.
 * @param {string} inputs_json
 * @returns {string}
 */
export function weatherRunIdentity(inputs_json) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(inputs_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.weatherRunIdentity(ptr0, len0);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * Weld many meshes in one call, each on its own: join vertices at most
 * `toleranceM` apart (metres; `undefined` = the kernel default, 0 =
 * bit-identical only) to
 * the first earlier one, then drop the triangles that became degenerate and
 * exact duplicates. No vertex moves; the winding is kept. Returns
 * `{ coordinates, vertOffsets, indices, faceOffsets, verticesWelded }`.
 * @param {any} coordinates
 * @param {Uint32Array} vert_offsets
 * @param {Uint32Array} indices
 * @param {Uint32Array} face_offsets
 * @param {number | null} [tolerance_m]
 * @returns {object}
 */
export function weldMeshes(coordinates, vert_offsets, indices, face_offsets, tolerance_m) {
    const ptr0 = passArray32ToWasm0(vert_offsets, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(indices, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(face_offsets, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.weldMeshes(coordinates, ptr0, len0, ptr1, len1, ptr2, len2, !isLikeNone(tolerance_m), isLikeNone(tolerance_m) ? 0 : tolerance_m);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * The ordinal for one wind-comfort class label, or `undefined` when the
 * reference does not know it (which makes the cell no-data).
 * @param {string} label
 * @returns {number | undefined}
 */
export function windClassOrdinal(label) {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.windClassOrdinal(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return ret === Number.MAX_SAFE_INTEGER ? undefined : ret;
}

/**
 * The wind-comfort class table as a JSON object, e.g.
 * `{"A":0.0,..,"S":5.0,"S15":5.0,"S20":6.0}`.
 *
 * The host maps class strings to these ordinals before calling
 * `renderGridRegistry`; a label outside the table is no-data (NaN), never a
 * clamped class. Byte-identical to the Python wheel's `wind_class_ordinals`.
 * @returns {string}
 */
export function windClassOrdinals() {
    let deferred1_0;
    let deferred1_1;
    try {
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.windClassOrdinals();
        } catch(e) {
            __wbg_handle_catch(e);
        }
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * utilities-service `POST /convert/mesh-to-file` port. `guid` is
 * caller-provided (no RNG in the kernel).
 * @param {string} mesh_json
 * @param {string} guid
 * @returns {string}
 */
export function wrapMeshToBimFile(mesh_json, guid) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(mesh_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(guid, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        let ret;
        __wbg_call_guard();
        try {
            ret = wasm.wrapMeshToBimFile(ptr0, len0, ptr1, len1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        __wbg_call_guard();
        try {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        } catch(e) {
            __wbg_handle_catch(e);
        }
    }
}

/**
 * The archives of a `zipPayloadJsonManyStart` task, in payload order.
 * @param {PoolTask} task
 * @returns {Uint8Array[]}
 */
export function zipPayloadJsonManyEnd(task) {
    _assertClass(task, PoolTask);
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.zipPayloadJsonManyEnd(task.__wbg_ptr);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Deflate each payload into the one-entry `payload.json` ZIP archive every
 * json submit body and geometry-reference document uses: the same
 * deterministic, fixed-timestamp writer as the D101 tile artifacts
 * (`ir_simprep::site_artifacts::zip_payload_json`), always DEFLATE. ONE call
 * for all the bodies a host has ready (D299): on the rayon pool in the
 * threaded core, one after the other in the serial core; the bytes are the
 * same.
 *
 * `...Start` gives the work to the pool and returns at once (a
 * [`PoolTask`]); `zipPayloadJsonManyEnd` takes the archives.
 * @param {Uint8Array[]} payloads
 * @returns {PoolTask}
 */
export function zipPayloadJsonManyStart(payloads) {
    const ptr0 = passArrayJsValueToWasm0(payloads, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    let ret;
    __wbg_call_guard();
    try {
        ret = wasm.zipPayloadJsonManyStart(ptr0, len0);
    } catch(e) {
        __wbg_handle_catch(e);
    }
    return PoolTask.__wrap(ret);
}
function __wbg_get_imports(memory) {
    const import0 = {
        __proto__: null,
        __wbg_Error_30c8987f7c2ed4e2: function() { return wrapError(function (arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg___wbindgen_boolean_get_5b446f51afd21013: function() { return wrapError(function (arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        }, arguments); },
        __wbg___wbindgen_debug_string_4687d8d8c2017d52: function() { return wrapError(function (arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg___wbindgen_is_string_90b56bc79aad6f6c: function() { return wrapError(function (arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        }, arguments); },
        __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function() { return wrapError(function (arg0) {
            const ret = arg0 === undefined;
            return ret;
        }, arguments); },
        __wbg___wbindgen_memory_caa4a6165639c8b5: function() { return wrapError(function () {
            const ret = wasm.memory;
            return ret;
        }, arguments); },
        __wbg___wbindgen_module_7115fb14045f9891: function() { return wrapError(function () {
            const ret = wasmModule;
            return ret;
        }, arguments); },
        __wbg___wbindgen_number_get_2e0e7dee9f701a71: function() { return wrapError(function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        }, arguments); },
        __wbg___wbindgen_panic_error_1da2bf9da04e868c: function() { return wrapError(function (arg0) {
            const ret = new PanicError(arg0);
            return ret;
        }, arguments); },
        __wbg___wbindgen_rethrow_cb2e88c6b2a16733: function() { return wrapError(function (arg0) {
            throw new WebAssembly.Exception(__wbindgen_wrapped_jstag, [arg0]);
        }, arguments); },
        __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function() { return wrapError(function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg___wbindgen_throw_41e9ee4f547fc59a: function() { return wrapError(function (arg0, arg1) {
            throw new WebAssembly.Exception(__wbindgen_wrapped_jstag, [new Error(getStringFromWasm0(arg0, arg1))]);
        }, arguments); },
        __wbg_capturehold_new: function() { return wrapError(function (arg0) {
            const ret = CaptureHold.__wrap(arg0);
            return ret;
        }, arguments); },
        __wbg_from_296ca31f8d0f1c52: function() { return wrapError(function (arg0) {
            const ret = Array.from(arg0);
            return ret;
        }, arguments); },
        __wbg_get_31af05bd4842a84f: function() { return wrapError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_6c896e0571ddae51: function() { return wrapError(function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        }, arguments); },
        __wbg_get_unchecked_288889d017702237: function() { return wrapError(function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        }, arguments); },
        __wbg_infraredAbortProcess_7fe4534a4822df5f: function() { return wrapError(function (arg0, arg1, arg2, arg3) {
            infraredAbortProcess(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        }, arguments); },
        __wbg_instanceof_Float32Array_595afb0f28b828c9: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Float32Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Float64Array_8a59377f9eec1b8b: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Float64Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Int16Array_dc79388a406d1748: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Int16Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Uint16Array_eff85aa31096af44: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Uint16Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Uint32Array_53a4facaf04b8a8b: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Uint32Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Uint8Array_828cef2aaacafc31: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_instanceof_Window_82d71df4eddf88bc: function() { return wrapError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        }, arguments); },
        __wbg_isArray_e15a2ff68ffdbef2: function() { return wrapError(function (arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        }, arguments); },
        __wbg_length_3035e53132b7a991: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_511b1f84719d3462: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_58572db4c38f3c3e: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_7f3c00c40364105e: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_b5f0008bbf60cf59: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_d4bdea10311bd9cf: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_length_e5fdd54468b9e6ed: function() { return wrapError(function (arg0) {
            const ret = arg0.length;
            return ret;
        }, arguments); },
        __wbg_new_617a8cdb8bb1130e: function() { return wrapError(function () {
            const ret = new Object();
            return ret;
        }, arguments); },
        __wbg_new_ee2291f50781bf1d: function() { return wrapError(function () {
            const ret = new Array();
            return ret;
        }, arguments); },
        __wbg_new_from_slice_23f60f47cde8d664: function() { return wrapError(function (arg0, arg1) {
            const ret = new Uint16Array(getArrayU16FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_from_slice_2443ca2017fac0fd: function() { return wrapError(function (arg0, arg1) {
            const ret = new Int16Array(getArrayI16FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_from_slice_37a3c3a194266cb8: function() { return wrapError(function (arg0, arg1) {
            const ret = new Uint32Array(getArrayU32FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_from_slice_9a868026ffa4208a: function() { return wrapError(function (arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_from_slice_ca6ad97db1f4779a: function() { return wrapError(function (arg0, arg1) {
            const ret = new Float32Array(getArrayF32FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_from_slice_f545fd22ddc142b8: function() { return wrapError(function (arg0, arg1) {
            const ret = new Float64Array(getArrayF64FromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_new_with_length_3da0ad195f6f63ba: function() { return wrapError(function (arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        }, arguments); },
        __wbg_new_with_length_469fcc27bd71672e: function() { return wrapError(function (arg0) {
            const ret = new Array(arg0 >>> 0);
            return ret;
        }, arguments); },
        __wbg_new_with_length_cc0362bfe8499e5a: function() { return wrapError(function (arg0) {
            const ret = new Float32Array(arg0 >>> 0);
            return ret;
        }, arguments); },
        __wbg_of_20798cb14708764f: function() { return wrapError(function (arg0, arg1) {
            const ret = Array.of(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_parse_0fc53dead14b3b42: function() { return wrapError(function (arg0, arg1) {
            const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_prototypesetcall_06eb15da165dee8f: function() { return wrapError(function (arg0, arg1, arg2) {
            Uint32Array.prototype.set.call(getArrayU32FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_prototypesetcall_2ee09b855e324444: function() { return wrapError(function (arg0, arg1, arg2) {
            Uint16Array.prototype.set.call(getArrayU16FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_prototypesetcall_8b03c01e2c0f8066: function() { return wrapError(function (arg0, arg1, arg2) {
            Float32Array.prototype.set.call(getArrayF32FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_prototypesetcall_bc27214492979395: function() { return wrapError(function (arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_prototypesetcall_d49a4fab5ca427bc: function() { return wrapError(function (arg0, arg1, arg2) {
            Float64Array.prototype.set.call(getArrayF64FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_prototypesetcall_f8d32a400a944612: function() { return wrapError(function (arg0, arg1, arg2) {
            Int16Array.prototype.set.call(getArrayI16FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_push_2baf45db356cf468: function() { return wrapError(function (arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        }, arguments); },
        __wbg_set_145a351398b48c65: function() { return wrapError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_575d3ddb70fe831d: function() { return wrapError(function (arg0, arg1, arg2) {
            arg0.set(getArrayU8FromWasm0(arg1, arg2));
        }, arguments); },
        __wbg_set_bea140a88be9b277: function() { return wrapError(function (arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        }, arguments); },
        __wbg_slice_3b71d4886a340363: function() { return wrapError(function (arg0, arg1, arg2) {
            const ret = arg0.slice(arg1 >>> 0, arg2 >>> 0);
            return ret;
        }, arguments); },
        __wbg_startWorkers_8b582d57e92bd2d4: function() { return wrapError(function (arg0, arg1, arg2) {
            const ret = startWorkers(arg0, arg1, wbg_rayon_PoolBuilder.__wrap(arg2));
            return ret;
        }, arguments); },
        __wbg_static_accessor_GLOBAL_266715b9d96ba635: function() { return wrapError(function () {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179: function() { return wrapError(function () {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_static_accessor_SELF_0b583911f537483a: function() { return wrapError(function () {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_static_accessor_WINDOW_d7f903d1508cbdc4: function() { return wrapError(function () {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        }, arguments); },
        __wbg_stringify_52ff602c1cc4fbb6: function() { return wrapError(function (arg0) {
            const ret = JSON.stringify(arg0);
            return ret;
        }, arguments); },
        __wbg_subarray_002b94d5e13d1411: function() { return wrapError(function (arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000001: function() { return wrapError(function (arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000002: function() { return wrapError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(F32)) -> NamedExternref("Float32Array")`.
            const ret = getArrayF32FromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000003: function() { return wrapError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(F64)) -> NamedExternref("Float64Array")`.
            const ret = getArrayF64FromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000004: function() { return wrapError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U32)) -> NamedExternref("Uint32Array")`.
            const ret = getArrayU32FromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000005: function() { return wrapError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_generic_0000000000000006: function() { return wrapError(function (arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        }, arguments); },
        __wbindgen_init_externref_table: function() { return wrapError(function () {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        }, arguments); },
        __wbindgen_jstag: __wbindgen_jstag_polyfill,
        __wbindgen_wrapped_jstag: __wbindgen_wrapped_jstag,
        memory: memory || new WebAssembly.Memory({initial:28,maximum:65536,shared:true}),
    };
    return {
        __proto__: null,
        "./infrared-core_bg.js": import0,
    };
}

const __wbindgen_jstag_polyfill = new WebAssembly.Tag({ parameters: ['externref'] });


const __wbindgen_wrapped_jstag = new WebAssembly.Tag({ parameters: ['externref'] });


let __wbg_terminated_addr;
let __wbg_called_abort = false;
function __wbg_call_abort_hook() {
    __wbg_called_abort = true;
    try {
        const idx = getInt32ArrayMemory0()[wasm.__abort_handler.value / 4];
        if (idx) wasm.__wbindgen_export.get(idx)();
    } catch(_) {}
}

function __wbg_handle_catch(e) {
    if (e instanceof WebAssembly.Exception && e.is(__wbindgen_wrapped_jstag)) {
        throw e.getArg(__wbindgen_wrapped_jstag, 0);
    }
    getInt32ArrayMemory0()[__wbg_terminated_addr] = 1;
    __wbg_call_abort_hook();
    throw e;
}


function __wbg_call_guard() {
    __wbg_terminated_addr ??= wasm.__instance_terminated.value / 4;
    const flag = getInt32ArrayMemory0()[__wbg_terminated_addr];
    if (flag) {
        if (!__wbg_called_abort) {
            __wbg_call_abort_hook();
        }throw new Error('Module terminated');
    }
}
const AreaGridMergerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_areagridmerger_free(ptr, 1));
const CaptureHoldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_capturehold_free(ptr, 1));
const CaptureStoreFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_capturestore_free(ptr, 1));
const CategoricalAreaDenseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_categoricalareadense_free(ptr, 1));
const FacadeLayoutHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_facadelayouthandle_free(ptr, 1));
const GridDecodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_griddecode_free(ptr, 1));
const GridDocumentDecodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_griddocumentdecode_free(ptr, 1));
const GridTilesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gridtiles_free(ptr, 1));
const JobWaitFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jobwait_free(ptr, 1));
const PoolTaskFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pooltask_free(ptr, 1));
const ResultArchiveDecodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_resultarchivedecode_free(ptr, 1));
const RunEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_runengine_free(ptr, 1));
const SiteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_site_free(ptr, 1));
const SiteTerrainFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_siteterrain_free(ptr, 1));
const SurfaceJobsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_surfacejobs_free(ptr, 1));
const SurfaceJoinStreamFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_surfacejoinstream_free(ptr, 1));
const WeatherCatalogFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_weathercatalog_free(ptr, 1));
const wbg_rayon_PoolBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wbg_rayon_poolbuilder_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayI16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

let cachedInt16ArrayMemory0 = null;
function getInt16ArrayMemory0() {
    if (cachedInt16ArrayMemory0 === null || cachedInt16ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedInt16ArrayMemory0 = new Int16Array(wasm.memory.buffer);
    }
    return cachedInt16ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint16ArrayMemory0 = null;
function getUint16ArrayMemory0() {
    if (cachedUint16ArrayMemory0 === null || cachedUint16ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedUint16ArrayMemory0 = new Uint16Array(wasm.memory.buffer);
    }
    return cachedUint16ArrayMemory0;
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.buffer !== wasm.memory.buffer) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

class PanicError extends Error {}
Object.defineProperty(PanicError.prototype, 'name', {
    value: 'PanicError',
});

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : undefined);
if (cachedTextDecoder) cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().slice(ptr, ptr + len));
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder() : undefined);

if (cachedTextEncoder) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

function wrapError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        if (e instanceof WebAssembly.Exception) throw e;
        throw new WebAssembly.Exception(__wbindgen_jstag_polyfill, [e], { traceStack: true });
    }
}

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module, thread_stack_size) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedInt16ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedUint16ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    if (typeof thread_stack_size !== 'undefined' && (typeof thread_stack_size !== 'number' || thread_stack_size === 0 || thread_stack_size % 65536 !== 0)) {
        throw new Error('invalid stack size');
    }

    wasm.__wbindgen_start(thread_stack_size);
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module, memory) {
    if (wasm !== undefined) return wasm;

    let thread_stack_size
    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module, memory, thread_stack_size} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports(memory);
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module, thread_stack_size);
}

async function __wbg_init(module_or_path, memory) {
    if (wasm !== undefined) return wasm;

    let thread_stack_size
    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path, memory, thread_stack_size} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('infrared-core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports(memory);

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module, thread_stack_size);
}

export { initSync, __wbg_init as default };
