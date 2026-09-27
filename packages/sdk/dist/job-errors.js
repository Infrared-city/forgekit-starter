export class JobFailedError extends Error {
    jobId;
    errorMessage;
    name = "JobFailedError";
    constructor(jobId, errorMessage) {
        super("job failed");
        this.jobId = jobId;
        this.errorMessage = errorMessage;
    }
}
export class JobTimeoutError extends Error {
    jobId;
    name = "JobTimeoutError";
    constructor(jobId) {
        super("job polling timed out");
        this.jobId = jobId;
    }
}
export class JobAbortedError extends Error {
    jobId;
    name = "JobAbortedError";
    constructor(jobId) {
        super("job polling was aborted");
        this.jobId = jobId;
    }
}
export class JobNotCompletedError extends Error {
    jobId;
    status;
    name = "JobNotCompletedError";
    constructor(jobId, status) {
        super("job is not completed");
        this.jobId = jobId;
        this.status = status;
    }
}
