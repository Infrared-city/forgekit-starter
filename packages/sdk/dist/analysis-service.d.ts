import type { Job, JobsService, SubmitOptions } from "./jobs.js";
import type { WireAnalysisRequest } from "./client-types.js";
/**
 * Submits requests already written with the API's own keys; available as
 * `InfraredClient.analyses`.
 *
 * @category Run an analysis
 */
export declare class AnalysisService {
    private readonly jobs;
    /** @param jobs - The jobs service that sends the request. */
    constructor(jobs: JobsService);
    /**
     * Submits a request that already uses the API's own keys; does not wait.
     * Returns the accepted `Job`, or rejects with a `TypeError` when the payload
     * is not an object or has no `"analysis-type"`.
     */
    execute(payload: WireAnalysisRequest, options?: SubmitOptions): Promise<Job>;
}
