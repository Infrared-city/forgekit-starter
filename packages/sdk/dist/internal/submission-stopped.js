import { TransportError } from "./transport.js";
/** The run stopped before this customer request reached Fetch. */
export class SubmissionStoppedError extends TransportError {
    constructor() {
        super("submission stopped after an invalid geometry reference", "pre-dispatch", "aborted", "POST");
    }
}
