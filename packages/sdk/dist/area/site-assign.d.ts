import type { FacadeArtifact } from "../internal/facade-artifact-guard.js";
import type { ArtifactLimits, TileArtifact } from "../internal/binary-artifact.js";
import type { AreaGeometryGroups, IndexedTile, Polygon, SupportedAreaGroup } from "./types.js";
/**
 * The site, read by the kernel ONCE, answered for every tile in ONE crossing
 * (`docs/DEVIATIONS.md` D84, D90, D98, D101).
 *
 * Before D98 this host asked the kernel 98 times per site pass (`tileIds` and
 * `tileCoordinates` per tile), unboxed every coordinate into a JavaScript
 * number, re-anchored the occluders through a JSON round trip per tile, drove
 * the other groups through a second JSON round trip, and then canonicalised
 * and digested every group of every tile again in the submit loop. The kernel
 * now does all of it in `SiteAssignment.arena`: every tile's group bodies come
 * back as one byte arena of canonical JSON — sorted keys, JavaScript number
 * text, the exact bytes the wire carries and the reuse path digests — with an
 * offset table and each group's kernel hash beside it. This host slices the
 * arena and parses a group when it needs the object; it never copies or
 * re-anchors a group again, and the reuse identity is two native SHA-256 over
 * bytes and hash the kernel already produced, taken only when a run asks for
 * it — a binary-transport run never does.
 *
 * The binary transport takes every tile's IRBF artifact from the same site
 * (`artifacts`, D101): the kernel packs, describes, frames, zips and digests
 * each tile — and boxes its trees on a route whose capability carries no
 * `vegetation` (D70) — so nothing here encodes geometry. A facade BATCH takes
 * its own selection instead (`facadeFrames`, D156): the unsplit tile would
 * make the server synthesize sensors on every member of the tile.
 *
 * The site crosses ONCE (WS2): the packed coordinate buffers (`pack`) — what
 * the kernel assigns and re-anchors from, exact f64, and what `dropToGrade`
 * reads — and the group documents as JSON text, so the kernel can write every
 * other member of a mesh (a packed mesh crosses without its coordinates, the
 * bulk of the text). The kernel `Site` prepares every layer in that crossing
 * and KEEPS them: the arena and, on a binary run, every artifact come from
 * the same copy, and nothing reads the site into the kernel a second time.
 * A binary run keeps the kernel copy and frees it when this object is
 * unreachable (`FinalizationRegistry`); a JSON run, or a realm without the
 * registry, frees it before `read` returns and a later artifact request
 * reads the site again, as before WS2.
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
     * `geometries`, every other member of the tile in `context-geometry`
     * (D156). One answer per batch, in batch order.
     */
    facadeFrames?(index: number, batches: readonly (readonly string[])[], parts: FacadeFrameParts): FacadeFrame[];
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
     * batches and its selected bodies (`area/site-facade.ts`), as the Python
     * host does.
     */
    keepKernel(): boolean;
    /** Run `use` on the kept kernel site, or on a fresh read that is freed after. */
    withKernel<T>(use: (site: KernelSite) => T): T;
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
    static read(groups: AreaGeometryGroups, tiles: readonly IndexedTile[], polygon: Polygon, analysisType: string | undefined, terrainContextMarginM: number | undefined, keepKernelSite?: boolean, texts?: ReadonlyMap<object, string>): SiteAssignment;
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
     * One tile's artifact (D101). The first ask under a given capability answer
     * — whether the trees are boxed, and the four limits — encodes every tile in
     * one crossing from the kept kernel site; the archives are kept, so the
     * tiles of a family's repeat run share them. Never a facade batch's (D156).
     */
    tileArtifact(index: number, boxTrees: boolean, limits: ArtifactLimits): TileArtifact;
    /**
     * The parts of every facade batch of tile `index`, from ONE kernel call
     * that builds the tile once (`Site.facadeFrames`, WP3). The artifact is the
     * SAME kernel selection the Python host uploads (D156): the batch's targets
     * in `geometries`, the rest of the tile in `context-geometry`. Nothing is
     * kept here — `area/site-facade.ts` hands each part out once.
     */
    facadeFrames(index: number, batches: readonly (readonly string[])[], parts: FacadeFrameParts): FacadeFrame[];
    private encode;
}
