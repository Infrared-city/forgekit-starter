import type { AreaJobsService, RunAreaOptions } from "./run-options.js";
import type { Polygon } from "./types.js";
export type { AreaSubmissionPlan, SubmissionEntry } from "./plan-types.js";
import type { AreaSubmissionPlan } from "./plan-types.js";
/**
 * Complete and validate the whole grid plan before the first POST.
 *
 * COOPERATIVE since WP-3 (`infrared-core#237`, `docs/DEVIATIONS.md` D78):
 * every stage hands the thread back on a time slice and reads
 * `options.signal` at each boundary, so a host around this SDK stays
 * responsive and a stop is honoured during the plan rather than 24 s later.
 * The work, the order and the answer are unchanged.
 */
export declare function planAreaSubmission(service: AreaJobsService, input: Readonly<Record<string, unknown>>, polygonInput: Polygon, options?: RunAreaOptions): Promise<AreaSubmissionPlan>;
/** A resume refused because the saved identity was computed by an older SDK. */
export declare class ConfigHashPolicyError extends Error {
    constructor(message: string);
}
