import type { JobStatus } from "./jobs.js";
export declare class JobFailedError extends Error {
    readonly jobId: string;
    readonly errorMessage: string;
    readonly name = "JobFailedError";
    constructor(jobId: string, errorMessage: string);
}
export declare class JobTimeoutError extends Error {
    readonly jobId: string;
    readonly name = "JobTimeoutError";
    constructor(jobId: string);
}
export declare class JobAbortedError extends Error {
    readonly jobId: string;
    readonly name = "JobAbortedError";
    constructor(jobId: string);
}
export declare class JobNotCompletedError extends Error {
    readonly jobId: string;
    readonly status: JobStatus;
    readonly name = "JobNotCompletedError";
    constructor(jobId: string, status: JobStatus);
}
