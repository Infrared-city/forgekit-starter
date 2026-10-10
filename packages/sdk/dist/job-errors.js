/**
 * Thrown when a job finished with status `failed`.
 *
 * @category Errors
 */
export class JobFailedError extends Error {
    jobId;
    errorMessage;
    name = "JobFailedError";
    /**
     * @param jobId - Id of the job that failed.
     * @param errorMessage - The failure message reported for the job; may be empty.
     */
    constructor(jobId, errorMessage) {
        super("job failed");
        this.jobId = jobId;
        this.errorMessage = errorMessage;
    }
}
/**
 * Thrown when waiting for a job ran past its timeout before the job finished.
 *
 * @category Errors
 */
export class JobTimeoutError extends Error {
    jobId;
    name = "JobTimeoutError";
    /** @param jobId - Id of the job that was being waited on. */
    constructor(jobId) {
        super("job polling timed out");
        this.jobId = jobId;
    }
}
/**
 * Thrown when waiting for a job was cancelled through its `AbortSignal`.
 *
 * @category Errors
 */
export class JobAbortedError extends Error {
    jobId;
    name = "JobAbortedError";
    /** @param jobId - Id of the job that was being waited on. */
    constructor(jobId) {
        super("job polling was aborted");
        this.jobId = jobId;
    }
}
/**
 * Thrown when results are requested for a job that has not completed.
 *
 * @category Errors
 */
export class JobNotCompletedError extends Error {
    jobId;
    status;
    name = "JobNotCompletedError";
    /**
     * @param jobId - Id of the job.
     * @param status - The status the job had when results were requested.
     */
    constructor(jobId, status) {
        super("job is not completed");
        this.jobId = jobId;
        this.status = status;
    }
}
