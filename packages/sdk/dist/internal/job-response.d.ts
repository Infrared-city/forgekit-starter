import type { Job, JobStatus } from "../jobs.js";
/**
 * Convert the status text of a job response into a {@link JobStatus}.
 *
 * Matching ignores case. Any text that is not a known status gives `"unknown"`.
 *
 * @param value - The status text from the API.
 * @returns The matching status.
 * @category Requests
 */
export declare function parseJobStatus(value: string): JobStatus;
/**
 * Convert a job object returned by the API into a {@link Job}.
 *
 * @param input - The parsed JSON of one job response.
 * @returns The job, with optional fields present only when the API sent them.
 * @throws {TypeError} If `input` is not an object, has no `jobId`, or carries an invalid
 *   binary acknowledgement.
 * @category Requests
 */
export declare function jobFromResponse(input: unknown): Job;
