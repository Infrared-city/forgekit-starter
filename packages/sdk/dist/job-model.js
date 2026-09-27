export const JobStatus = {
    Pending: "pending",
    Running: "running",
    Succeeded: "succeeded",
    Failed: "failed",
    Unknown: "unknown",
};
/** Attach the substitution record to a job the binary route just accepted.
 *
 * Client-side only (D70): the server neither sends nor reads it, so it is
 * merged in here rather than parsed out of the acknowledgement. The record
 * lives on the PREPARED BINARY, because that is the object built after the
 * capability document decided whether to box at all.
 */
export function withTreeBoxes(job, binary) {
    return binary?.treeBoxes === undefined ? job : { ...job, treeBoxes: binary.treeBoxes };
}
export function requireJobId(jobId) {
    if (typeof jobId !== "string" || jobId.length === 0)
        throw new TypeError("jobId must be a non-empty string");
    return jobId;
}
