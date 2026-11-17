import { type WasmCore } from "../internal/core.js";
import type { PoolTask } from "../internal/pool-task.js";
import { type KernelTerrain } from "./site-terrain.js";
import type { AreaGeometryGroups, IndexedTile, Polygon } from "./types.js";
/**
 * The kernel `Site` handle and the one read of the site into it, split out of
 * `site-assign.ts` for the 400-line rule (root `CLAUDE.md` rule 8).
 * `SiteAssignment` is the only reader.
 */
export interface KernelTileIds {
    readonly members: string[];
    readonly core: string[];
    readonly shrink_band: string[];
    readonly demoted: string[];
    readonly context: string[];
}
/** What the kernel is asked with. */
export interface SiteInputs {
    readonly groups: AreaGeometryGroups;
    readonly tiles: readonly IndexedTile[];
    readonly polygon: Polygon;
    readonly analysisType: string | undefined;
    readonly terrainContextMarginM: number | undefined;
    /** `undefined` = the kernel default reach; `null` = every tile. */
    readonly contextReachM?: number | null | undefined;
    /** `undefined` = the kernel default hole buffer; 0 = no extra buffer. */
    readonly contextBufferM?: number | undefined;
    /** `undefined` = the kernel default simplification; `null` = as given. */
    /** The terrain read once for `groups["ground-geometry"]` (D200). */
    readonly terrain?: KernelTerrain;
}
/** The site read into the kernel ONCE: the packed groups, their documents, the layers. */
export declare function kernelSite(inputs: SiteInputs, texts?: ReadonlyMap<object, string>): KernelSite;
/**
 * Frees a kept kernel site once its {@link SiteAssignment} is unreachable.
 * JavaScript never frees wasm memory by itself, and a prepared site outlives
 * the plan that built it: the realm cache keeps it for later runs, and a
 * planned tile's artifact is encoded at SUBMIT time. Freeing on cache
 * eviction would pull the site from under a run that still holds it, so the
 * site is freed when the last holder lets go — the rule the Python binding
 * gets from reference counting. A realm without `FinalizationRegistry` keeps
 * no kernel site at all (see {@link SiteAssignment.read}).
 */
export declare const release: FinalizationRegistry<KernelSite> | undefined;
/** The kernel's `Site` handle (WS2): the site read once, answered per range. */
export interface KernelSite {
    allTileIds(): string;
    bodies(start: number, end: number): unknown;
    /** A pool task (`internal/pool-task.ts`); `Site.artifactsEnd` reads it. */
    artifactsStart(start: number, end: number, maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): PoolTask;
    /** The facade batch records of tiles `start..end`, as a pool task; `Site.facadeBatchesEnd` reads it. */
    facadeBatchesStart(start: number, end: number, requestJson: string): PoolTask;
    /** Many facade jobs (WP3), as a pool task; `Site.facadeFramesEnd` reads it. */
    facadeFramesStart(tiles: Uint32Array, idCounts: Uint32Array, ids: string[], body: boolean, identity: boolean, capture: boolean, alignment: string | undefined, artifact: boolean, maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): PoolTask;
    /** The captures of many facade jobs, put straight into `store` (D-2026101110-iris-nectar-maple),
     * as a pool task; `Site.facadeCapturesEnd` reads it. */
    facadeCapturesStart(tiles: Uint32Array, idCounts: Uint32Array, ids: string[], alignment: string | undefined, store: InstanceType<WasmCore["CaptureStore"]>): PoolTask;
    /** One scene frame per tile and a target range per job (#602), as a pool task;
     * `Site.facadeScenesEnd` reads it. */
    facadeScenesStart(tiles: Uint32Array, idCounts: Uint32Array, ids: string[], maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): PoolTask;
    checkTerrain(start: number, end: number): void;
    shareFacadeParts(analyses: number): void;
    identity(start: number, end: number): unknown;
    contextWarning(): string | undefined;
    /** Point trees without z when the site has terrain, else 0. */
    treesWithoutZ(): number;
    free(): void;
}
