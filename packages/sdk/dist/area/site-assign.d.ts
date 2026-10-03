import type { KernelTerrain } from "./site-terrain.js";
import type { FacadeArtifact } from "../internal/facade-artifact-guard.js";
import { type FacadeSceneAnswer } from "./site-facade-scene.js";
import type { ArtifactLimits, TileArtifact } from "../internal/binary-artifact.js";
import type { AreaGeometryGroups, IndexedTile, Polygon, SupportedAreaGroup } from "./types.js";
/**
 * The site, read by the kernel ONCE, answered for every tile in ONE crossing
 * (`docs/DEVIATIONS.md` D84, D90, D98, D101, WS2).
 *
 * The kernel `Site` prepares every layer of the site in one crossing and
 * keeps them. `SiteAssignment.arena` slices the kernel's one byte arena of
 * canonical JSON per tile group; a tile artifact or facade job reads the SAME
 * kept site, so a run never sends the site to the kernel twice.
 *
 * The binary transport takes every tile's IRBF artifact from this site
 * (`tileArtifact`, D101): the kernel packs, describes, frames, zips and
 * digests each tile, boxing its trees where the capability carries no
 * `vegetation` (D70). A facade BATCH takes its own selection instead
 * (`facadeFrames`, D156), or a shared scene and a target range (`facadeScenes`,
 * #602): the unsplit tile would make the server synthesize sensors on every
 * member of the tile.
 *
 * A binary or facade run keeps the kernel copy and frees it when this object
 * is unreachable (`FinalizationRegistry`); a JSON run, or a realm without the
 * registry, frees it before `read` returns, and a later artifact or facade
 * request reads the site again.
 */
/** One tile's share of the site, by id. */
export interface TileAnswer {
    /** The tile's `geometries`, in the site map's own key order. */
    readonly members: readonly string[];
    /** What the tile ANALYSES, after the whole-grid duplicate resolution. */
    readonly core: readonly string[];
    /** Members the nominal box kept and the re-anchored box gave up (D63). */
    readonly shrinkBand: readonly string[];
    /** Members this tile's core held that an EARLIER tile already owned. */
    readonly demoted: readonly string[];
    /** `context-geometry` ids this tile receives (D67), in site order. */
    readonly context: readonly string[];
}
/** What the plan reads: ordinary JavaScript. */
export interface SiteAnswer {
    /** Membership, ownership and the shrink band, per tile, in tile order. */
    readonly tiles: readonly TileAnswer[];
    /** Ids the shrink band gave up that NO tile's core took (D63). */
    readonly unowned: readonly string[];
    /**
     * One tile's binary artifact from the site (D101), when the answer holds
     * the site: every tile's is encoded on the first ask and kept.
     */
    tileArtifact?(index: number, boxTrees: boolean, limits: ArtifactLimits): TileArtifact;
    /**
     * The parts of every facade BATCH of one tile, from one kernel call that
     * builds the tile once (`Site.facadeFrames`, WP3): each batch's targets in
     * `geometries`, every other member of the tile in `context-geometry` (D156).
     */
    facadeFrames?(index: number, batches: readonly (readonly string[])[], parts: FacadeFrameParts): FacadeFrame[];
    /** One tile's facade SCENE (#602): a shared frame for `batches` plus each
     * batch's job as a range into it, or its own frame (WP3, per-tile). */
    facadeScenes?(index: number, batches: readonly (readonly string[])[], boxTrees: boolean, limits: ArtifactLimits): FacadeSceneAnswer;
    /** One tile's group as the kernel wrote it, when the answer holds the arena. */
    group?(tile: number, name: SupportedAreaGroup): TileGroup | undefined;
    /**
     * Keep the kernel site for the life of this answer, so facade planning and
     * the facade bodies read it without reading the site again. `false` where
     * the realm cannot free it later.
     */
    keepKernel?(): boolean;
    /** Run `use` on the kernel site: the kept one, or a fresh read freed after. */
    withKernel?<T>(use: (site: KernelSite) => T): T;
    /** Every tile's presence and mesh group hashes, with no body written. */
    identity?(): TileIdentity;
    /** The groups the run carries, in the caller's order. */
    readonly carried?: readonly SupportedAreaGroup[];
}
/** Which parts {@link SiteAnswer.facadeFrames} writes for every batch. */
export interface FacadeFrameParts {
    /** The canonical five-group body. */
    readonly body?: boolean;
    /** The pretty capture with the request's `terrain-alignment` (`null`: unsent). */
    readonly capture?: {
        readonly alignment: string | null;
    };
    /** The binary artifact under the capability answer. */
    readonly artifact?: {
        readonly boxTrees: boolean;
        readonly limits: ArtifactLimits;
    };
}
/** One facade batch's parts; `error` is the kernel's refusal of this batch alone. */
export interface FacadeFrame {
    readonly error?: string;
    readonly body?: FacadeBodyArena;
    readonly capture?: Uint8Array;
    readonly artifact?: FacadeArtifact;
}
/** A batch's five-group body: the arena of `bodies(tile, tile + 1)`. */
export interface FacadeBodyArena {
    readonly bytes: Uint8Array;
    readonly offsets: Uint32Array;
    readonly hashes: readonly string[];
}
/** Every tile's presence mask and mesh group hashes (`Site.identity`). */
export interface TileIdentity {
    readonly present: Uint8Array;
    readonly meshGroupHashes: readonly string[];
}
/** The arena's slot order: the five wire groups a tile body can carry. */
export declare const ARENA_GROUPS: readonly SupportedAreaGroup[];
/** One tile's group, as the kernel wrote it. */
export interface TileGroup {
    /** The canonical JSON bytes: a view into the arena, never a copy. */
    readonly bytes: Uint8Array;
    /**
     * The kernel group hash — `geometryGroupHash` over the parsed body — or
     * `undefined` when the group has none (vegetation; an unreadable occluder).
     */
    readonly hash: string | undefined;
}
/** The kernel's `Site` handle (WS2): the site read once, answered per range. */
export interface KernelSite {
    allTileIds(): string;
    unowned(): string[];
    bodies(start: number, end: number): unknown;
    artifacts(start: number, end: number, boxTrees: boolean, maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): unknown;
    facadeBatches(start: number, end: number, requestJson: string): string;
    facadeFrames(tiles: Uint32Array, idCounts: Uint32Array, ids: string[], body: boolean, identity: boolean, capture: boolean, alignment: string | undefined, artifact: boolean, boxTrees: boolean, maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): unknown[];
    /** One scene frame per tile and a target range per job (#602). */
    facadeScenes(tiles: Uint32Array, idCounts: Uint32Array, ids: string[], boxTrees: boolean, maxTotalBytes: bigint, maxMetadataBytes: number, maxMeshes: bigint, maxInstances: bigint): unknown;
    checkTerrain(start: number, end: number): void;
    identity(start: number, end: number): unknown;
    free(): void;
}
/** The site, answered for every tile, held as plain JavaScript. */
export declare class SiteAssignment implements SiteAnswer {
    #private;
    readonly tiles: readonly TileAnswer[];
    readonly unowned: readonly string[];
    /** Every tile's bodies; read on the first ask when the kernel site is kept. */
    private arena;
    private readonly present;
    /** The groups the run carries, in the caller's order (the body's order). */
    readonly carried: readonly SupportedAreaGroup[];
    /** The kept kernel site, or `undefined` where the realm cannot free it later. */
    private inner;
    /** What to read the site from again, only when no kernel site is kept. */
    private inputs;
    private readonly artifacts;
    private constructor();
    /**
     * Keep the kernel site from now on, reading it once more when a JSON run
     * built this answer without it. A facade run asks the kept site for its
     * batches and its selected bodies (`area/site-facade.ts`).
     */
    keepKernel(): boolean;
    /** Run `use` on the kept kernel site, or on a fresh read that is freed after. */
    withKernel<T>(use: (site: KernelSite) => T): T;
    /**
     * Read the site once: the kernel prepares every layer in one crossing and
     * answers the membership and the bodies from them.
     *
     * `keepKernelSite`: a BINARY run keeps the kernel site for the artifacts it
     * will encode at submit time, and a FACADE run for its batches and bodies
     * (`area/site-facade.ts`), freed with this object. A grid JSON run frees it
     * before this returns — a run that never encodes holds no wasm memory. A
     * realm without `FinalizationRegistry` always frees it here.
     */
    static read(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, analysisType: string | undefined, terrainContextMarginM: number | undefined, keepKernelSite?: boolean, texts?: ReadonlyMap<object, string>, terrain?: KernelTerrain): SiteAssignment;
    /** One tile's group, or `undefined` when the run does not carry it. */
    group(tile: number, name: SupportedAreaGroup): TileGroup | undefined;
    /**
     * Every tile's presence mask (bit `i` for `ARENA_GROUPS[i]`, set when the
     * tile carries the group AND it holds something) and its `geometries` /
     * `context-geometry` group hashes, two per tile, `""` for none — without
     * writing a body. Read once and kept.
     */
    identity(): TileIdentity;
    /**
     * One tile's artifact (D101): the first ask under a capability answer
     * encodes every tile in one crossing and keeps the archives. Never a
     * facade batch's (D156).
     */
    tileArtifact(index: number, boxTrees: boolean, limits: ArtifactLimits): TileArtifact;
    /**
     * The parts of every facade batch of tile `index`, from ONE kernel call
     * that builds the tile once (`Site.facadeFrames`, WP3): the batch's targets
     * in `geometries`, the rest of the tile in `context-geometry` (D156).
     * Nothing is kept here — `area/site-facade.ts` hands each part out once.
     */
    facadeFrames(index: number, batches: readonly (readonly string[])[], parts: FacadeFrameParts): FacadeFrame[];
    /**
     * One tile's facade scenes (#602): one shared frame for every batch of
     * `batches`, and each batch's job as a range into it, or its own frame.
     * `site-facade-scene.ts` shapes the kernel's raw answer.
     */
    facadeScenes(index: number, batches: readonly (readonly string[])[], boxTrees: boolean, limits: ArtifactLimits): FacadeSceneAnswer;
    private encode;
}
