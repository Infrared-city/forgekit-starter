import { AcceptedResponseError } from "../submission.js";
/** A referenced customer submission can exist, but its scientific result is invalid. */
export declare class GeometryReferenceSubmissionError extends AcceptedResponseError {
    readonly reason: string;
    readonly name: string;
    readonly acceptedJobIds: readonly string[];
    readonly invalidReference = true;
    readonly nonRetryable = true;
    constructor(acceptedJobIds?: readonly string[], reason?: string, message?: string);
}
/** A customer job was accepted without the exact required acknowledgement. */
export declare class GeometryReferenceAcknowledgementError extends GeometryReferenceSubmissionError {
    readonly name: string;
    constructor(acceptedJobIds?: readonly string[], reason?: string);
}
