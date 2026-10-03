import { type Job } from "../job-model.js";
import type { WaitForCompletionOptions } from "../job-options.js";
export interface WaitJobDeps {
    /** One status read (`GET /async/jobs/{id}`). It throws a transient
     * `TransportError` for the engine to back off on. */
    readonly status: (id: string, signal: AbortSignal) => Promise<Job>;
    /** Legacy `pollIntervalMs`, seconds. */
    readonly fixedIntervalS: number | undefined;
    /** Legacy `backoffCapSeconds`, seconds: caps the healthy interval. */
    readonly maxIntervalS: number | undefined;
}
/**
 * Wait for one job on the SDK's one poll engine (`poll-engine.ts`, D213) —
 * the same engine an area run uses. `onPoll` sees every status read, the
 * terminal one included, before a `Failed` job throws; `false` stops the wait
 * and returns the job as it is. The default timeout is the kernel's 900 s.
 */
export declare function waitForJob(id: string, options: WaitForCompletionOptions, deps: WaitJobDeps): Promise<Job>;
