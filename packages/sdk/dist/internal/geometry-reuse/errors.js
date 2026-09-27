import { AcceptedResponseError } from "../submission.js";
function unique(ids) {
    return Object.freeze([...new Set(ids.filter((value) => typeof value === "string" && value.length > 0))]);
}
/** A referenced customer submission can exist, but its scientific result is invalid. */
export class GeometryReferenceSubmissionError extends AcceptedResponseError {
    reason;
    name = "GeometryReferenceSubmissionError";
    acceptedJobIds;
    invalidReference = true;
    nonRetryable = true;
    constructor(acceptedJobIds = [], reason = "geometry-reference-outcome-uncertain", message = "geometry-reference submission cannot be used or retried safely") {
        super(message);
        this.reason = reason;
        this.acceptedJobIds = unique(acceptedJobIds);
    }
}
/** A customer job was accepted without the exact required acknowledgement. */
export class GeometryReferenceAcknowledgementError extends GeometryReferenceSubmissionError {
    name = "GeometryReferenceAcknowledgementError";
    constructor(acceptedJobIds = [], reason = "invalid-geometry-acknowledgement") {
        super(acceptedJobIds, reason, "accepted geometry-reference submission had no valid acknowledgement");
    }
}
