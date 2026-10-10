/**
 * The wire shape {@link synthesizeFacadeLayout}/`fromBytes` get back from the
 * kernel, and the conversion into `./facade-layout.js`'s public types. Split
 * out of that file for the 400-line cap (root `CLAUDE.md` rule 8).
 */
import type { FacadeLayoutJob, FacadeLayoutSynthParams } from "./facade-layout.js";
export interface RawFrame {
    key: string;
    origin: number[];
    u_axis: number[];
    v_axis: number[];
    grid_size: number;
    nu: number;
    nv: number;
    cells: Array<number | null>;
}
export interface RawJobBuffers {
    job_id: string;
    has_terrain: boolean;
    points: Float64Array;
    normals: Float64Array;
    cell_area: Float32Array | null;
    cell_tris: Float32Array | null;
    cell_tris_offsets: Uint32Array | null;
    frames: RawFrame[];
    entity_hashes: string[];
    sensor_layout_hash: string;
    warnings: string[];
    culled_below_terrain: number;
}
export interface RawFields {
    layoutKey: string;
    surfgridVersion: number;
    coreVersion: string;
    synthParams: FacadeLayoutSynthParams;
    jobs: RawJobBuffers[];
}
/** `true` when ANY job in `fields` holds a view invalidated by a wasm memory
 * grow since `fields` was captured -- `FacadeLayout`'s `jobs` getter calls
 * `handle.fields()` again to get fresh views when this is `true`. */
export declare function rawFieldsStale(fields: RawFields, memory: WebAssembly.Memory): boolean;
/** {@link materializeJob}, over every job in `fields`. */
export declare function materializeFields(fields: RawFields): RawFields;
export declare function jobFromRaw(raw: RawJobBuffers): FacadeLayoutJob;
