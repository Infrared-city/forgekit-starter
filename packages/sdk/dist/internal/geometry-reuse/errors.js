import { AcceptedResponseError } from "../submission.js";
function unique(ids) {
    return Object.freeze([...new Set(ids.filter((value) => typeof value === "string" && value.length > 0))]);
}
/**
 * Thrown when a submission that refers to previously uploaded geometry may have
 * created a job, but its outcome cannot be used.
 *
 * It is not safe to retry. `acceptedJobIds` lists any jobs the API reported as
 * accepted, so they can be reconciled against billing, and `reason` is a short
 * machine-readable code for why the submission was refused.
 *
 * @category Errors
 */
export class GeometryReferenceSubmissionError extends AcceptedResponseError {
    reason;
    name = "GeometryReferenceSubmissionError";
    /** Ids of the jobs the API reported as accepted, without duplicates. */
    acceptedJobIds;
    /** Always `true`: the reference or its outcome cannot be used. */
    invalidReference = true;
    /** Always `true`: repeating the submission is not safe. */
    nonRetryable = true;
    constructor(acceptedJobIds = [], reason = "geometry-reference-outcome-uncertain", message = "geometry-reference submission cannot be used or retried safely") {
        super(message);
        this.reason = reason;
        this.acceptedJobIds = unique(acceptedJobIds);
    }
}
/**
 * Thrown when the API accepted a job that refers to previously uploaded geometry but
 * did not return the acknowledgement that confirms the geometry was resolved.
 *
 * It is not safe to retry; see {@link GeometryReferenceSubmissionError}.
 *
 * @category Errors
 */
export class GeometryReferenceAcknowledgementError extends GeometryReferenceSubmissionError {
    name = "GeometryReferenceAcknowledgementError";
    constructor(acceptedJobIds = [], reason = "invalid-geometry-acknowledgement") {
        super(acceptedJobIds, reason, "accepted geometry-reference submission had no valid acknowledgement");
    }
}
