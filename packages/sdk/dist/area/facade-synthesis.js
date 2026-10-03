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
/** One client's captured facade inputs, by job id. */
export class FacadeSynthesisStore {
    inputs = new Map();
    /**
     * Retain one accepted job's inputs. Two places release them, and between
     * them they cover every accepted job: `take` on the merge that uses one, and
     * `forget` for the rest — the merge releases the whole schedule it finished
     * (its failed jobs included), and a submission that aborts releases what it
     * captured before the abort. A capture no release path reaches would be held
     * for the life of the client.
     */
    remember(jobId, input) {
        this.inputs.set(jobId, input);
    }
    take(jobId) {
        const input = this.inputs.get(jobId);
        this.inputs.delete(jobId);
        return input;
    }
    /** Release a capture no merge will ever consume. */
    forget(jobId) {
        this.inputs.delete(jobId);
    }
    get pendingCount() { return this.inputs.size; }
}
