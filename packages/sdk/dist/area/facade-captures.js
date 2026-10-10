// Maintainer note (not published): the facade captures of this client's runs. The captures live
// in ONE kernel `CaptureStore` (equal captures of many analyses share one copy, the syntheses are
// made once; `docs/surface-render-buffers.md`). This holder only creates the kernel store on first
// use (the kernel is not ready when the client is built) and remembers which jobs asked for the
// per-cell triangles (`emitCellTris`), a flag the join takes for the whole run.
//
// `cell-tris` measured 12.6x the rest of a facade body, so the SDK never asks the server for them
// (`area/payload.ts` pins `emit-cell-tris` to false); the join makes the outline (and, on request,
// the triangles) from the capture the submission keeps here.
import { requireCore } from "../internal/core.js";
/**
 * The facade captures of one client, in one capture store.
 *
 * @category Facade layout
 */
export class FacadeCaptures {
    kernel;
    asked = new Set();
    // Accepted jobs whose capture was not kept (#835): the merge names them.
    lost = new Set();
    // Maintainer note (not published): the kernel store, created on first use.
    get store() {
        return (this.kernel ??= new (requireCore().CaptureStore)());
    }
    /** The number of jobs that hold a capture. */
    get jobCount() { return this.kernel?.jobCount ?? 0; }
    /** The bytes held: the distinct captures and the syntheses made from them. */
    get heldBytes() { return this.kernel?.heldBytes ?? 0; }
    /** Keep the capture of an accepted job. `cellTris`: the run asked for the per-cell triangles. */
    remember(jobId, capture, cellTris) {
        try {
            this.store.remember(jobId, capture);
        }
        catch (error) {
            this.lost.add(jobId);
            throw error;
        }
        if (cellTris)
            this.asked.add(jobId);
    }
    /** Release a job's capture that no merge will use. */
    forget(jobId) {
        this.kernel?.forget(jobId);
        this.asked.delete(jobId);
        this.lost.delete(jobId);
    }
    /** Whether the capture of this accepted job was not kept (the store refused it). */
    lostCapture(jobId) { return this.lost.has(jobId); }
    /** Release every capture of a schedule you will not merge. */
    forgetSchedule(schedule) {
        for (const job of schedule.jobs.values()) {
            if (job.jobId !== undefined)
                this.forget(job.jobId);
        }
    }
    /** Whether any of these jobs asked for the per-cell triangles. */
    wantsCellTris(jobIds) {
        return jobIds.some((id) => id !== undefined && this.asked.has(id));
    }
    /** Free the held captures. Call it when you are done with the client. */
    free() {
        this.kernel?.free();
        this.kernel = undefined;
        this.asked.clear();
        this.lost.clear();
    }
}
