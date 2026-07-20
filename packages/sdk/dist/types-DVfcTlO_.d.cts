/**
 * Types for the async job execution pipeline.
 *
 * Ported from Python SDK `analyses/jobs.py`.
 */
/**
 * Job status values.
 *
 * The API returns PascalCase status strings. The historical typo
 * 'Succeded' (single 'e') is normalised to 'succeeded'.
 */
declare const JobStatus: {
    readonly Pending: "pending";
    readonly Running: "running";
    readonly Succeeded: "succeeded";
    readonly Failed: "failed";
    readonly Unknown: "unknown";
};
type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
/**
 * Parse a raw status string from the API into a JobStatus.
 *
 * Handles the historical 'Succeded' (single 'e') typo by normalising
 * it to `JobStatus.Succeeded`.
 *
 * @param raw - The raw PascalCase status string from the API.
 * @returns The normalised JobStatus value.
 *
 * @example
 * ```ts
 * parseJobStatus('Succeeded') // 'succeeded'
 * parseJobStatus('Succeded')  // 'succeeded' (normalised typo)
 * parseJobStatus('Unknown')   // 'unknown'
 * ```
 */
declare function parseJobStatus(raw: string): JobStatus;
/** Terminal job statuses (no further state transitions). */
declare const TERMINAL_STATUSES: ReadonlySet<JobStatus>;
/** Immutable snapshot of a job returned by the API. */
interface Job {
    readonly jobId: string;
    readonly modelName: string;
    readonly status: JobStatus;
    readonly requestedAt: string;
    readonly startedAt?: string;
    readonly finishedAt?: string;
    readonly resultsUrl?: string;
    readonly error?: string;
}
declare function jobFromResponse(data: Record<string, unknown>): Job;
/** Result of downloading job output from the presigned URL. */
interface DownloadResult {
    readonly content: Uint8Array;
    readonly presignedUrl: string;
    readonly jobId: string;
    readonly contentType: string;
}
/**
 * Callback fired on each poll iteration.
 *
 * @param job - Current job snapshot
 * @param attempt - Zero-based attempt index
 * @param elapsed - Seconds elapsed since polling started
 * @param nextDelay - Seconds until next poll (0 for terminal states)
 * @returns Return `false` to stop polling early; any other value continues.
 */
type OnPollCallback = (job: Job, attempt: number, elapsed: number, nextDelay: number) => boolean | void | Promise<boolean | void>;
/** Interface for dependency injection and testing. */
interface IJobsService {
    submit(analysisType: string, payload: Record<string, unknown>, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<Job>;
    getStatus(jobId: string): Promise<Job>;
    waitForCompletion(jobId: string, opts?: {
        timeout?: number;
        onPoll?: OnPollCallback;
    }): Promise<Job>;
    downloadResults(jobId: string, opts?: {
        job?: Job;
    }): Promise<DownloadResult>;
    decompress(content: Uint8Array): Record<string, unknown>;
}

export { type DownloadResult as D, type IJobsService as I, type Job as J, type OnPollCallback as O, TERMINAL_STATUSES as T, JobStatus as a, jobFromResponse as j, parseJobStatus as p };
