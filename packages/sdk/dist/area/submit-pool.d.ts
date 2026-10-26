/**
 * The paid submit pool: one POST per entry, `maxWorkers` at a time, with the
 * rules that keep a paid job from being sent twice. Split out of
 * `submission.ts` so the area run and the daylight-factor parts (`parts/`,
 * D221) submit through ONE pool.
 *
 * - An uncertain POST (it may have been accepted) is recorded, never retried
 *   (#197, D59).
 * - A 402 stops the rest: the entries not yet sent fail as submissions, and a
 *   `retryFrom` sends them later.
 * - An invalid geometry-reference acceptance stops the rest as `skipped`.
 *
 * Two stages, each with `maxWorkers` slots (T4): a worker holds its slot
 * through the encode and the upload only, then takes the next entry; the
 * paid POST runs in a separate POST slot. So a POST that waits for an upload
 * never holds a slot an upload needs. A submit without an upload (JSON
 * transport) holds the worker slot until it ends, as before.
 */
import { type Logger } from "../logger.js";
import type { SubmissionEntry } from "./plan-types.js";
import type { AreaJobsService } from "./run-options.js";
import type { AreaJob } from "./schedule-types.js";
export declare function concurrency(value: number | undefined): number;
export interface SubmitPoolOptions {
    readonly maxWorkers?: number;
    readonly signal?: AbortSignal;
    readonly onAccepted?: (jobId: string, tileKey: string) => void;
    /** Prior records (a `retryFrom`), copied; the pool overwrites the entries it sends. */
    readonly priorJobs?: ReadonlyMap<string, AreaJob>;
    readonly priorUncertain?: readonly string[];
    readonly priorInvalidReference?: readonly string[];
    /** Before the paid POST of one entry; its answer is passed to `afterAccepted`. */
    readonly beforeSubmit?: (entry: SubmissionEntry) => Uint8Array | undefined;
    /** After the job is accepted and recorded. An error here is logged; the job stays accepted (#835). */
    readonly afterAccepted?: (capture: Uint8Array | undefined, jobId: string | undefined) => void;
    /** Receives the warning of an `afterAccepted` error. Unset: the console. */
    readonly logger?: Logger;
}
export interface SubmitPoolOutcome {
    readonly jobs: Map<string, AreaJob>;
    readonly failedSubmissions: string[];
    readonly uncertainSubmissions: string[];
    readonly invalidReferenceSubmissions: string[];
    readonly submissionAbortStatus: number | null;
}
/** Submit each entry once. Unknown POSTs are not retried. */
export declare function submitEntries(service: AreaJobsService, entries: readonly SubmissionEntry[], options?: SubmitPoolOptions): Promise<SubmitPoolOutcome>;
