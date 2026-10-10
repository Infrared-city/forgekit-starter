// Maintainer note (not published): Daylight-factor floor parts (plan
// `docs/plans/2026-09-30-daylight-batching-tiles-floors.md`, D221): the shapes a caller sees.
//
// The kernel (`daylightParts`, `daylightPartBody`, `daylightMerge`) plans the
// parts, writes each part body and joins the part results. This package only
// submits, polls, downloads and retries. The request itself stays a
// wire-keyed body (D109: no per-model types in this SDK).
/**
 * A parts run that cannot be joined because a part did not produce a result.
 *
 * `failedParts` names them; `runParts(input, { retryFrom: error.schedule })`
 * (or `runAndWait` with the same option) sends only those parts again.
 *
 * @category Errors
 */
export class AnalysisPartsError extends Error {
    failedParts;
    schedule;
    downloadFailedParts;
    name = "AnalysisPartsError";
    /**
     * @param message - What went wrong.
     * @param failedParts - Parts a `retryFrom` sends again; empty when every part has a result.
     * @param schedule - The run, with its accepted jobs.
     * @param downloadFailedParts - Parts whose result is on the server but did not download:
     * `mergeParts(schedule)` (or a `retryFrom`, which then sends nothing) downloads them again.
     * @param options - Standard error options, such as `cause`.
     */
    constructor(message, 
    /** Parts a `retryFrom` sends again; empty when every part has a result. */
    failedParts, 
    /** The run, with its accepted jobs. */
    schedule, 
    /** Parts whose result is on the server but did not download. */
    downloadFailedParts = [], options) {
        super(message, options);
        this.failedParts = failedParts;
        this.schedule = schedule;
        this.downloadFailedParts = downloadFailedParts;
    }
}
