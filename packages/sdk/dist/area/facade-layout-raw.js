/**
 * The wire shape {@link synthesizeFacadeLayout}/`fromBytes` get back from the
 * kernel, and the conversion into `./facade-layout.js`'s public types. Split
 * out of that file for the 400-line cap (root `CLAUDE.md` rule 8).
 */
/**
 * `raw` crosses a wasm/JSON boundary (`fromBytes` always; a fresh synthesis
 * normally returns real typed arrays already, but nothing in the `JsValue`
 * type system guarantees it). Both paths go through here so the TYPE this
 * module promises (`Float64Array`/`Float32Array`/`Uint32Array`, `.subarray`
 * usable) is also the type callers actually get -- #709 review (2026-10-04,
 * P2): never a plain `number[]` silently standing in for one.
 */
function asFloat64(values) {
    return values instanceof Float64Array ? values : Float64Array.from(values);
}
function asFloat32(values) {
    return values instanceof Float32Array ? values : Float32Array.from(values);
}
function asUint32(values) {
    return values instanceof Uint32Array ? values : Uint32Array.from(values);
}
/**
 * `true` when `view`'s backing buffer is no longer the core's CURRENT
 * `memory.buffer` (perf/ts-facade-layout-views): `points`/`normals`/
 * `cell_area`/`cell_tris`/`cell_tris_offsets` on a fresh `RawJobBuffers` are
 * zero-copy VIEWS onto the wasm-held `FacadeLayoutHandle`'s own buffers
 * (`facade_layout.rs` `buffers_to_js_view`) -- sound only until wasm linear
 * memory GROWS, which detaches the `ArrayBuffer` a view was built against
 * (js-sys `TypedArray::view`'s own safety note). A detached view's `.buffer`
 * is a DIFFERENT object from the live `memory.buffer`, which is what this
 * checks; it does not need the view's `byteLength` (0 on a detached buffer,
 * but also 0 for an ordinary empty job, so length alone cannot tell them
 * apart).
 */
function isStaleView(view, memory) {
    return view !== null && view.buffer !== memory.buffer;
}
/** `true` when ANY job in `fields` holds a view invalidated by a wasm memory
 * grow since `fields` was captured -- `FacadeLayout`'s `jobs` getter calls
 * `handle.fields()` again to get fresh views when this is `true`. */
export function rawFieldsStale(fields, memory) {
    return fields.jobs.some((job) => isStaleView(job.points, memory) ||
        isStaleView(job.normals, memory) ||
        isStaleView(job.cell_area, memory) ||
        isStaleView(job.cell_tris, memory) ||
        isStaleView(job.cell_tris_offsets, memory));
}
/**
 * Snapshot one job's buffers into independent copies (`.slice()`), breaking
 * every alias onto the wasm-held handle's memory. `FacadeLayout.free()`
 * calls this (via {@link materializeFields}) on every job BEFORE releasing
 * the handle: the handle's buffers are zero-copy views
 * (perf/ts-facade-layout-views), so reading them after the handle is freed
 * would read deallocated-and-possibly-reused wasm memory. After this call
 * the job no longer depends on the handle at all.
 */
function materializeJob(job) {
    return {
        ...job,
        points: job.points.slice(),
        normals: job.normals.slice(),
        cell_area: job.cell_area === null ? null : job.cell_area.slice(),
        cell_tris: job.cell_tris === null ? null : job.cell_tris.slice(),
        cell_tris_offsets: job.cell_tris_offsets === null ? null : job.cell_tris_offsets.slice(),
    };
}
/** {@link materializeJob}, over every job in `fields`. */
export function materializeFields(fields) {
    return { ...fields, jobs: fields.jobs.map(materializeJob) };
}
export function jobFromRaw(raw) {
    return {
        jobId: raw.job_id,
        hasTerrain: raw.has_terrain,
        sensorLayoutHash: raw.sensor_layout_hash,
        entityHashes: raw.entity_hashes,
        warnings: raw.warnings,
        culledBelowTerrain: raw.culled_below_terrain,
        points: asFloat64(raw.points),
        normals: asFloat64(raw.normals),
        ...(raw.cell_area === null ? {} : { cellArea: asFloat32(raw.cell_area) }),
        ...(raw.cell_tris === null ? {} : { cellTris: asFloat32(raw.cell_tris) }),
        ...(raw.cell_tris_offsets === null ? {} : { cellTrisOffsets: asUint32(raw.cell_tris_offsets) }),
        frames: raw.frames.map((f) => ({
            key: f.key,
            origin: [f.origin[0], f.origin[1], f.origin[2]],
            uAxis: [f.u_axis[0], f.u_axis[1], f.u_axis[2]],
            vAxis: [f.v_axis[0], f.v_axis[1], f.v_axis[2]],
            gridSize: f.grid_size,
            nu: f.nu,
            nv: f.nv,
            cells: f.cells,
        })),
    };
}
