import type { Job } from "../job-model.js";
import type { WaitForCompletionOptions } from "../job-options.js";
export interface WaitJobDeps {
    /** One status read (`GET /async/jobs/{id}`). */
    readonly status: (id: string, signal: AbortSignal) => Promise<Job>;
    /** Legacy `pollIntervalMs`, microseconds: a fixed healthy interval. */
    readonly intervalUs: number | undefined;
    /** Legacy `backoffCapSeconds`, microseconds: caps the healthy interval. */
    readonly intervalCapUs: number | undefined;
}
/**
 * Wait for one job on the kernel `JobWait`: the kernel decides every status
 * request, sleep and stop; this loop does one `GET /async/jobs/{id}` per `get`
 * step and sleeps the `sleep` step. `onPoll` sees every status read, the
 * terminal one included, before a `Failed` job throws; `false` stops the wait
 * and returns the job as it is. The default timeout is the kernel's 900 s.
 */
export declare function waitForJob(id: string, options: WaitForCompletionOptions, deps: WaitJobDeps): Promise<Job>;
