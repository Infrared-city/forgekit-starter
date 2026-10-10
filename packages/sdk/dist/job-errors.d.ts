import type { JobStatus } from "./jobs.js";
/**
 * Thrown when a job finished with status `failed`.
 *
 * @category Errors
 */
export declare class JobFailedError extends Error {
    readonly jobId: string;
    readonly errorMessage: string;
    readonly name = "JobFailedError";
    /**
     * @param jobId - Id of the job that failed.
     * @param errorMessage - The failure message reported for the job; may be empty.
     */
    constructor(jobId: string, errorMessage: string);
}
/**
 * Thrown when waiting for a job ran past its timeout before the job finished.
 *
 * @category Errors
 */
export declare class JobTimeoutError extends Error {
    readonly jobId: string;
    readonly name = "JobTimeoutError";
    /** @param jobId - Id of the job that was being waited on. */
    constructor(jobId: string);
}
/**
 * Thrown when waiting for a job was cancelled through its `AbortSignal`.
 *
 * @category Errors
 */
export declare class JobAbortedError extends Error {
    readonly jobId: string;
    readonly name = "JobAbortedError";
    /** @param jobId - Id of the job that was being waited on. */
    constructor(jobId: string);
}
/**
 * Thrown when results are requested for a job that has not completed.
 *
 * @category Errors
 */
export declare class JobNotCompletedError extends Error {
    readonly jobId: string;
    readonly status: JobStatus;
    readonly name = "JobNotCompletedError";
    /**
     * @param jobId - Id of the job.
     * @param status - The status the job had when results were requested.
     */
    constructor(jobId: string, status: JobStatus);
}
