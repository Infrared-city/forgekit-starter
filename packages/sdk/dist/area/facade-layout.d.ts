import { type WasmFacadeLayoutHandle } from "./facade-layout-free.js";
import type { SurfaceColumns } from "../results/surface-columns.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { FrameOrigin } from "./tile-frames.js";
/**
 * A triangle mesh as the `geometries` and `ground` documents carry it. Typed arrays are
 * accepted as they are.
 *
 * @category Facade layout
 */
export interface FacadeLayoutMesh {
    /** Flat vertex coordinates: x, y, z for each vertex. */
    readonly coordinates: ArrayLike<number>;
    /** Flat triangle vertex indices: three per triangle. */
    readonly indices: ArrayLike<number>;
}
/**
 * One job to rebuild a layout for, as named in `SynthesizeFacadeLayoutInput.jobs`.
 *
 * @category Facade layout
 */
export interface FacadeLayoutJobSpec {
    /** Identifier of the job, as it appears on the rebuilt `FacadeLayoutJob`. */
    readonly jobId: string;
    /** Ids of the buildings this job covers. Omit for every building. */
    readonly activeIds?: readonly string[];
    /** The reference point (longitude and latitude) of the tile this job ran for, so the layout
     * is rebuilt in that tile's own frame. Required alongside
     * `SynthesizeFacadeLayoutInput.siteOrigin`; omit both for an untiled run. */
    readonly tileOrigin?: FrameOrigin;
}
/**
 * The input to `synthesizeFacadeLayout`: the original scene and the sensor
 * settings of the facade or roof run to rebuild.
 *
 * @category Facade layout
 */
export interface SynthesizeFacadeLayoutInput {
    /** The buildings of the run, by id. */
    readonly buildings: Readonly<Record<string, FacadeLayoutMesh>>;
    /** Ground meshes of the run, by id. Omit when the run had none. */
    readonly ground?: Readonly<Record<string, FacadeLayoutMesh>>;
    /** The terrain alignment setting of the run, passed as the run used it. */
    readonly terrainAlignment?: string;
    /** Which surfaces carry sensors: `"facades"`, `"roofs"` or `"all"`. */
    readonly analysisSurfaces: "facades" | "roofs" | "all";
    /** The sensor grid size of the run, in metres. */
    readonly surfaceGridSize: number;
    /** Offset of the sensors from the surface, in metres. Default 0.1 (as a live run); set only
     * to rebuild a layout that used another value. */
    readonly surfaceOffset?: number;
    /** Whether cells partly covered by a surface get sensors. Default `true`. */
    readonly partialCells?: boolean;
    /** Minimum covered fraction a partial cell needs to keep a sensor. Default 0.05. */
    readonly minCoverage?: number;
    /** Mesh cleaning before synthesis: `"auto"` (default) or `"off"`. */
    readonly meshCleaning?: "auto" | "off";
    /** Maximum number of sensors in one job. Default 262144. */
    readonly maxSensorsPerJob?: number;
    /**
     * Whether the layout keeps the clipped triangles of every cell (`FacadeLayoutJob.cellTris`).
     * Default `false`. Set `true` only to draw the old per-cell mesh or to export the geometry of
     * each cell. Do not set it to draw with `surfaceRenderBuffers`: that needs only the frames,
     * the cells and the outline, which every layout holds. The triangles make the layout about
     * three times larger. Sensors and hashes do not change.
     */
    readonly emitCellTris?: boolean;
    /**
     * The sensor-layout version to rebuild at. Omit for the bundled engine's current version,
     * echoed back on `FacadeLayout.surfgridVersion`. A version that cannot be built is refused,
     * never mapped to the nearest one.
     */
    readonly surfgridVersion?: number;
    /** Reproduce a saved run's job split. Omit for one job over every building. */
    readonly jobs?: readonly FacadeLayoutJobSpec[];
    /** The reference point (longitude and latitude) that the coordinates of `buildings` and
     * `ground` are expressed around. Required alongside a job's `tileOrigin`. */
    readonly siteOrigin?: FrameOrigin;
    /** The `AreaSchedule` of a tiled `runArea()` call; derives `siteOrigin` and `jobs` from it.
     * Mutually exclusive with passing either explicitly. */
    readonly schedule?: AreaSchedule;
}
/**
 * One coplanar surface region and its sensor cells, in canonical cell order
 * (`cells[i * nu + j]`).
 *
 * @category Facade layout
 */
export interface FacadeLayoutFrame {
    /** Identifier of this surface region. */
    readonly key: string;
    /** Position of the grid origin, as x, y, z. */
    readonly origin: readonly [number, number, number];
    /** Direction of the grid's first axis (cell index `j`). */
    readonly uAxis: readonly [number, number, number];
    /** Direction of the grid's second axis (cell index `i`). */
    readonly vAxis: readonly [number, number, number];
    /** Edge length of one cell. */
    readonly gridSize: number;
    /** Number of cells along `uAxis`. */
    readonly nu: number;
    /** Number of cells along `vAxis`. */
    readonly nv: number;
    /** Per-cell index into this job's flat sensor arrays, `null` outside the surface. */
    readonly cells: ReadonlyArray<number | null>;
}
/**
 * One job's rebuilt sensor layout.
 *
 * @category Facade layout
 */
export interface FacadeLayoutJob {
    /** Identifier of the job. */
    readonly jobId: string;
    /** Whether the layout was built against terrain. */
    readonly hasTerrain: boolean;
    /** Identical to the server's hash for the same inputs and settings. */
    readonly sensorLayoutHash: string;
    /** Content hashes of the buildings that went into this job's layout. */
    readonly entityHashes: readonly string[];
    /** Warnings raised while building the layout. */
    readonly warnings: readonly string[];
    /** Number of sensors dropped for lying below the terrain. */
    readonly culledBelowTerrain: number;
    /** Interleaved xyz, one triple per sensor. */
    readonly points: Float64Array;
    /** Interleaved surface normals (x, y, z), one triple per sensor. */
    readonly normals: Float64Array;
    /** Area of each sensor's cell, one value per sensor, when available. */
    readonly cellArea?: Float32Array;
    /** Flat triangle floats (9 per triangle), `undefined` without triangles. */
    readonly cellTris?: Float32Array;
    /** `sensorCount + 1`: sensor `s` owns `cellTris[cellTrisOffsets[s]..cellTrisOffsets[s+1]]`. */
    readonly cellTrisOffsets?: Uint32Array;
    /** The coplanar surface regions the sensors were laid out on. */
    readonly frames: readonly FacadeLayoutFrame[];
}
/**
 * The sensor settings a layout was built with, echoed back.
 *
 * @category Facade layout
 */
export interface FacadeLayoutSynthParams {
    /** Which surfaces carry sensors. */
    readonly mode: "facades" | "roofs" | "all";
    /** Sensor grid size, in metres. */
    readonly gridSize: number;
    /** Offset of the sensors from the surface, in metres. */
    readonly offset: number;
    /** Maximum number of sensors in one job. */
    readonly maxSensors: number;
    /** Whether partly covered cells got sensors. */
    readonly partialCells: boolean;
    /** Minimum covered fraction a partial cell needed. */
    readonly minCoverage: number;
    /** The mesh cleaning mode used. */
    readonly meshCleaning: "auto" | "off";
    /** Whether the layout keeps the clipped triangles of every cell. */
    readonly emitCellTris: boolean;
}
/**
 * A rebuilt (or reloaded) facade or roof sensor layout.
 *
 * Build one with `synthesizeFacadeLayout` or reload one with
 * `FacadeLayout.fromBytes`. Call `free()` when finished with it in a
 * long-running process, or declare it with `using`.
 *
 * @category Facade layout
 */
export declare class FacadeLayout {
    private readonly handle;
    private fields;
    private readonly siteShiftByJobId?;
    private bytes;
    private readonly guard;
    private constructor();
    /**
     * Release the memory this layout holds. Safe to call more than once. Every other member keeps
     * working after `free()`, except `toBytes()`: call it before `free()`, unless its result was
     * already cached by an earlier `toBytes()` call.
     *
     * `jobs` also keeps returning correct data after `free()`: its arrays are copied out of the
     * held memory once, at that moment. Arrays you already took from an earlier read of `jobs`
     * are independent and unaffected.
     */
    free(): void;
    /** Lets `using layout = synthesizeFacadeLayout(...)` call `free()` at the end of its scope. */
    [Symbol.dispose](): void;
    /**
     * Load a layout from the format `FacadeLayout.toBytes` produces.
     *
     * @param bytes - The bytes returned by `toBytes()`.
     * @param options - Pass `schedule`, the saved tiled run, when the bytes were exported from a
     * layout built from a `schedule`; the reloaded layout is then shifted into the site frame
     * exactly as the original was.
     * @returns The reloaded layout.
     */
    static fromBytes(bytes: Uint8Array, options?: {
        readonly schedule?: AreaSchedule;
    }): FacadeLayout;
    /**
     * The compact export of this layout: no full-cell triangles, compressed. It never rebuilds
     * the layout, and is computed once and cached.
     *
     * @returns The bytes to store and reload with `FacadeLayout.fromBytes`.
     * @throws {Error} when the layout was already freed and its bytes were never cached.
     */
    toBytes(): Uint8Array;
    /** Identifier of this layout. Store it with your results and check it on reload. */
    get layoutKey(): string;
    /** The sensor-layout version this layout was built at. */
    get surfgridVersion(): number;
    /** Version of the bundled geometry engine that built this layout. */
    get coreVersion(): string;
    _surfaceRenderBuffers(columns: SurfaceColumns): unknown;
    /** The sensor settings this layout was built with. */
    get synthParams(): FacadeLayoutSynthParams;
    /** The rebuilt layout of each job. */
    get jobs(): readonly FacadeLayoutJob[];
    /**
     * Re-reads `handle.fields()` when THIS layout's cached views were
     * detached by a wasm memory grow that happened elsewhere (another
     * `synthesizeFacadeLayout`/`fromBytes` call, any other core call that
     * allocates) since they were captured -- `rawFieldsStale` compares each
     * view's `.buffer` against the core's current one
     * (perf/ts-facade-layout-views). A no-op once `free()` has already run:
     * `free()` replaces `this.fields` with real copies that never go stale.
     */
    private refreshFieldsIfStale;
    /** @internal */
    static _fromHandle(handle: WasmFacadeLayoutHandle, siteShiftByJobId?: ReadonlyMap<string, readonly [number, number]>): FacadeLayout;
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
export declare function synthesizeFacadeLayout(input: SynthesizeFacadeLayoutInput): FacadeLayout;
export { attachValues, type AttachValuesOptions } from "./facade-layout-attach.js";
