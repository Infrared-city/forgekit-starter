import { TransportError } from "./transport.js";
/** The run stopped before this customer request reached Fetch. */
export class SubmissionStoppedError extends TransportError {
    constructor(message = "submission stopped after an invalid geometry reference") {
        super(message, "pre-dispatch", "aborted", "POST");
    }
}
