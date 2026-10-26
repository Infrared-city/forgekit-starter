import type { AreaJobsService, RunAreaOptions } from "./run-options.js";
import type { Polygon } from "./types.js";
export type { AreaSubmissionPlan, SubmissionEntry } from "./plan-types.js";
import type { AreaSubmissionPlan } from "./plan-types.js";
/**
 * Build and validate the whole submission plan for an area run, before any job is submitted.
 *
 * It makes no billed request. The plan lists every job to submit, the tile grid, the
 * configuration hash and, for a facade run, the planned batches. The work yields the thread
 * regularly and checks `options.signal` at each stage, so a stop is honoured during planning.
 *
 * @param service - The jobs service the plan is prepared against, for example `client.jobs`.
 * @param input - The analysis request fields.
 * @param polygonInput - The area to analyse.
 * @param options - Run options such as `retryFrom`, `signal` and `maxTilesOverride`.
 * @returns The validated submission plan.
 * @throws {TypeError} when the input carries `vegetation-instances` or `sensor-points`,
 * which area runs do not support.
 * @throws {ConfigHashPolicyError} when `retryFrom` was saved by an older SDK whose
 * configuration hash cannot be compared.
 * @throws {FacadeCountContractError} when `retryFrom` is a facade schedule counted under
 * an older sensor-counting rule.
 * @throws {WeatherIdentityError} when the weather of a retry cannot be shown to be the
 * weather of the schedule it resumes.
 * @throws {Error} when `retryFrom` does not match this input (polygon, analysis type,
 * grid shape, tile positions or configuration hash).
 * @category Run an analysis
 */
export declare function planAreaSubmission(service: AreaJobsService, input: Readonly<Record<string, unknown>>, polygonInput: Polygon, options?: RunAreaOptions): Promise<AreaSubmissionPlan>;
/**
 * Thrown when a resume is refused because the saved schedule's configuration hash was
 * computed by an older SDK and cannot be compared with this one.
 *
 * Start a fresh run with the same inputs; tiles that already succeeded are unaffected.
 *
 * @category Errors
 */
export declare class ConfigHashPolicyError extends Error {
    constructor(message: string);
}
