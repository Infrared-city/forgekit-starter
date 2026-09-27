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
import type { Logger } from "../logger.js";
import { type LayoutRecord, type SurfaceTriangleViews } from "./facade-layout.js";
export type { SurfaceTriangleViews } from "./facade-layout.js";
/** What one accepted facade job needs to be reproduced. Owned, never shared.
 *
 * No `mode`: the synthesis runs on the SERVER's echoed one, never the request's,
 * so a captured copy would be a second source for a value only one of them may
 * decide (the Python host reads the echo for the same reason).
 */
export interface FacadeSynthesisInput {
    /**
     * The kernel's v1 capture of the submitted job (`Site.facadeFrames`):
     * the batch's targets, the tile's terrain and the body's `terrain-alignment`.
     * On terrain the server SEATS the targets before synthesis for `auto-align`
     * and for an unsent field; the kernel's capture reader replays that rule.
     */
    readonly capture: Uint8Array;
}
/** One client's captured facade inputs and its synthesized layouts. */
export declare class FacadeSynthesisStore {
    private readonly maxBytes;
    private readonly inputs;
    /** Insertion-ordered: a `Map` is an LRU once a hit re-inserts its key. */
    private readonly layouts;
    private retained;
    private hits;
    private misses;
    constructor(maxBytes?: number);
    /**
     * Retain one accepted job's inputs. Two places release them, and between
     * them they cover every accepted job: `take` on the merge that uses one, and
     * `forget` for the rest — the merge releases the whole schedule it finished
     * (its failed jobs included), and a submission that aborts releases what it
     * captured before the abort. A capture no release path reaches would be held
     * for the life of the client.
     */
    remember(jobId: string, input: FacadeSynthesisInput): void;
    take(jobId: string): FacadeSynthesisInput | undefined;
    /** Release a capture no merge will ever consume. */
    forget(jobId: string): void;
    get pendingCount(): number;
    get retainedBytes(): number;
    /** Hits and misses since this client was built. A cache that never hits is
     * indistinguishable from one that was never built, so it is countable: the
     * F3 scene's layouts are 935 MB against the 256 MiB bound and score zero
     * (`docs/DEVIATIONS.md` D88). */
    get stats(): {
        readonly hits: number;
        readonly misses: number;
    };
    /** A retained layout, counted as a hit (and made the most recent), or nothing. */
    lookup(key: string): LayoutRecord | undefined;
    /** Count one synthesized layout as a miss and retain it when it fits the bound. */
    retain(key: string, record: LayoutRecord): void;
}
/**
 * A surface result that says which requested triangles were not drawn, and
 * why. `fallbacks` holds the reasons `synthesizeSurfaceTriangles` refused.
 */
export declare function withCellTrisFallback<T extends object>(result: T, fallbacks: ReadonlySet<string>): T & {
    readonly cellTrisFallback?: readonly string[];
};
/** One accepted facade job whose response may get local `cell-tris`. */
export interface SurfaceSynthesisJob {
    readonly jobId: string;
    /** The job's decoded response (`synthesisView`). */
    readonly response: Readonly<Record<string, unknown>>;
    /** The tile's SW offset the triangles are drawn at. */
    readonly anchor: readonly [number, number];
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
export declare function synthesizeSurfaceTriangles(store: FacadeSynthesisStore, jobs: readonly SurfaceSynthesisJob[], logger: Logger, fallbacks?: Set<string>): Map<string, SurfaceTriangleViews>;
