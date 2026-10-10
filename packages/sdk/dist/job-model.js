/**
 * The states a job can be in: `pending`, `running`, `succeeded`, `failed`, or
 * `unknown` when the service reports a status the SDK does not recognise.
 *
 * @category Run an analysis
 */
export const JobStatus = {
    Pending: "pending",
    Running: "running",
    Succeeded: "succeeded",
    Failed: "failed",
    Unknown: "unknown",
};
/**
 * Check that a job id is a non-empty string and return it.
 *
 * @param jobId - The job id to check.
 * @returns The same `jobId`.
 * @throws {TypeError} when `jobId` is not a non-empty string.
 *
 * @category Run an analysis
 */
export function requireJobId(jobId) {
    if (typeof jobId !== "string" || jobId.length === 0)
        throw new TypeError("jobId must be a non-empty string");
    return jobId;
}
