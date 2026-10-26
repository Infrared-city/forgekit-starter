/**
 * Submits requests already written with the API's own keys; available as
 * `InfraredClient.analyses`.
 *
 * @category Run an analysis
 */
export class AnalysisService {
    jobs;
    /** @param jobs - The jobs service that sends the request. */
    constructor(jobs) {
        this.jobs = jobs;
    }
    /**
     * Submits a request that already uses the API's own keys; does not wait.
     * Returns the accepted `Job`, or rejects with a `TypeError` when the payload
     * is not an object or has no `"analysis-type"`.
     */
    execute(payload, options = {}) {
        if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
            return Promise.reject(new TypeError("analysis payload must be an object"));
        }
        const analysisType = payload["analysis-type"];
        if (typeof analysisType !== "string" || analysisType.length === 0) {
            return Promise.reject(new TypeError("analysis payload requires analysis-type"));
        }
        return this.jobs.submit(analysisType, payload, options);
    }
}
