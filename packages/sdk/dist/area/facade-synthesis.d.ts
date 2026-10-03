/**
 * Facade "pretty mode": the per-cell render geometry is SYNTHESIZED by the
 * kernel this SDK already bundles instead of being downloaded (ADR 0008).
 *
 * `cell-tris` measured 12.6x the rest of a facade body (+214 MB on the 66-job
 * F3 scene, 18.4 MB -> 232 MB). The SDK therefore never asks the server to
 * render them (`area/payload.ts` pins `emit-cell-tris` to false on every
 * `analysis-surfaces` request), and a caller who asks for triangles gets
 * locally synthesized ones: the submission keeps each accepted job's capture
 * here, and the merge hands them to the kernel's one-call join (D197), which
 * checks the server's layout hash and echo and attaches nothing it cannot
 * prove lines up.
 *
 * The layout cache this store held is gone (D198): it never hit at city
 * scale (935 MB of layouts against its 256 MiB bound, D88).
 */
/** What one accepted facade job needs to be reproduced. Owned, never shared.
 *
 * No `mode`: the synthesis runs on the SERVER's echoed one, never the request's.
 */
export interface FacadeSynthesisInput {
    /**
     * The kernel's v1 capture of the submitted job (`Site.facadeFrames`):
     * the batch's targets, the tile's terrain and the body's `terrain-alignment`.
     */
    readonly capture: Uint8Array;
}
/** One client's captured facade inputs, by job id. */
export declare class FacadeSynthesisStore {
    private readonly inputs;
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
}
