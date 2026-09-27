import type { Job, JobStatus } from "../jobs.js";
export declare function parseJobStatus(value: string): JobStatus;
export declare function jobFromResponse(input: unknown): Job;
