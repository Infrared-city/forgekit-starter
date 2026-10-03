/**
 * The default transport (D196): binary is the DEFAULT.
 *
 * A caller who passes no `transport` gets the strict binary route;
 * `transport: "json"` selects JSON. The one exception is an analysis with no
 * binary route at all (`daylight-factor`, `energy-balance`), which uses JSON.
 * That is the kernel's static rule (`ir_geo::transport_choice`), a property of
 * the analysis type: no server document is read to decide it. A binary
 * request the server refuses surfaces the server's error; it is never
 * resubmitted as JSON (that would be a second paid submission). The Python
 * host asks the same rule (`_internal/representation.py`).
 */
import { requireCore } from "./core.js";
/** The transport for `analysisType` when the caller names none. */
export function defaultTransport(analysisType) {
    return requireCore().defaultTransport(analysisType) === "json" ? "json" : "binary";
}
/** An area run's transport: the caller's, else a retry's saved one (a saved
 * schedule with no transport field was written by a JSON-only SDK), else the
 * default. The ONE resolution `runArea`, `planAreaSubmission` and
 * `submitAreaPlan` share, so a saved JSON schedule never retries as binary. */
export function areaTransport(options, analysisType) {
    if (options.transport !== undefined)
        return options.transport;
    if (options.retryFrom !== undefined)
        return options.retryFrom.transport ?? "json";
    return defaultTransport(analysisType);
}
