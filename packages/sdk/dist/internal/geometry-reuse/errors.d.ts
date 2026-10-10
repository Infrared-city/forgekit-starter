import { AcceptedResponseError } from "../submission.js";
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
export declare class GeometryReferenceSubmissionError extends AcceptedResponseError {
    readonly reason: string;
    readonly name: string;
    /** Ids of the jobs the API reported as accepted, without duplicates. */
    readonly acceptedJobIds: readonly string[];
    /** Always `true`: the reference or its outcome cannot be used. */
    readonly invalidReference = true;
    /** Always `true`: repeating the submission is not safe. */
    readonly nonRetryable = true;
    constructor(acceptedJobIds?: readonly string[], reason?: string, message?: string);
}
/**
 * Thrown when the API accepted a job that refers to previously uploaded geometry but
 * did not return the acknowledgement that confirms the geometry was resolved.
 *
 * It is not safe to retry; see {@link GeometryReferenceSubmissionError}.
 *
 * @category Errors
 */
export declare class GeometryReferenceAcknowledgementError extends GeometryReferenceSubmissionError {
    readonly name: string;
    constructor(acceptedJobIds?: readonly string[], reason?: string);
}
