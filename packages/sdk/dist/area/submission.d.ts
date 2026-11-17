import { type AreaSubmissionPlan, type SubmissionEntry } from "./planning.js";
import type { AreaJobsService, RunAreaInput, RunAreaOptions } from "./run-options.js";
import type { AreaJob, AreaSchedule } from "./schedule-types.js";
import type { Polygon } from "./types.js";
import type { CaptureHold } from "./facade-captures.js";
import type { SiteAnswer } from "./site-assign.js";
export declare function effectiveOptions(options: RunAreaOptions, analysisType: string): RunAreaOptions;
export declare function scheduleFromPlan(plan: AreaSubmissionPlan, jobs: ReadonlyMap<string, AreaJob>, failedSubmissions: readonly string[], uncertainSubmissions: readonly string[], invalidReferenceSubmissions: readonly string[], submissionAbortStatus: number | null, options: RunAreaOptions): AreaSchedule;
/**
 * Thrown when the API accepted a job whose geometry reference turned out to be invalid. The
 * accepted jobs cannot produce a trusted result, so the run stops.
 *
 * `areaSchedule` is the schedule recorded so far and `acceptedJobIds` lists the jobs the API
 * accepted with the invalid reference, so you can find them for billing or support.
 *
 * @category Errors
 */
export declare class AreaGeometryReferenceError extends Error {
    readonly areaSchedule: AreaSchedule;
    readonly acceptedJobIds: readonly string[];
    readonly name = "AreaGeometryReferenceError";
    constructor(areaSchedule: AreaSchedule, acceptedJobIds: readonly string[]);
}
/**
 * Thrown when resuming a saved schedule from an older SDK version that recorded a capability
 * probe with an unknown outcome. Resuming would repeat work whose billing state is unknown.
 * This SDK no longer submits probe jobs, so schedules it writes never raise this.
 *
 * `areaSchedule` is the saved schedule and `acceptedProbeJobIds` the probe job ids it recorded.
 *
 * @category Errors
 */
export declare class AreaGeometryProbeError extends Error {
    readonly areaSchedule: AreaSchedule;
    readonly acceptedProbeJobIds: readonly string[];
    readonly name = "AreaGeometryProbeError";
    constructor(areaSchedule: AreaSchedule, acceptedProbeJobIds: readonly string[]);
}
/**
 * Captures what is needed to draw one facade job's cell triangles locally after the merge, or
 * returns `undefined` when the run does not synthesize them locally.
 *
 * The capture is taken before the job's paid request is sent, so a failure here fails the job
 * while nothing was sent and a retry is safe.
 *
 * @param service - The jobs service of the run.
 * @param plan - The submission plan.
 * @param entry - The submission entry (one job) to capture.
 * @returns The capture, held in the client's store (D-2026101110-iris-nectar-maple), or `undefined`.
 * @category Run an analysis
 */
export declare function facadeCaptureFor(service: AreaJobsService, plan: AreaSubmissionPlan, entry: SubmissionEntry): Promise<CaptureHold | undefined>;
/**
 * Keeps the capture of one accepted facade job (see `facadeCaptureFor`) so the merge can draw its
 * cell triangles locally. The capture is held per client, on the jobs service; it is never part
 * of the schedule, which is saved and handed between processes.
 *
 * @param service - The jobs service of the run.
 * @param capture - The capture, or `undefined` for nothing to keep.
 * @param jobId - The id of the accepted job, or `undefined` for nothing to keep.
 * @category Run an analysis
 */
export declare function rememberFacadeInputs(service: AreaJobsService, capture: Uint8Array | CaptureHold | undefined, jobId: string | undefined, cellTris?: boolean): void;
/**
 * Submits an already validated plan, one job per entry, and returns the schedule of the run.
 *
 * A request whose outcome is unknown is sent again with the same idempotency key a few times;
 * after that it is recorded in the schedule as uncertain so you can decide. Failed submissions are recorded too. Pass `options.retryFrom` to continue a
 * saved schedule.
 *
 * @param service - The jobs service that sends the jobs, for example `client.jobs`.
 * @param plan - The submission plan from `planAreaSubmission`.
 * @param options - The run options: `signal`, `onAccepted`, `onProgress`, `retryFrom`.
 * @returns The frozen schedule of the run.
 * @throws {AreaGeometryReferenceError} when the API accepted a job with an invalid geometry
 *   reference, or `retryFrom` records one.
 * @throws {AreaGeometryProbeError} when `retryFrom` is a legacy schedule with an uncertain
 *   capability probe.
 * @category Run an analysis
 */
export declare function submitAreaPlan(service: AreaJobsService, plan: AreaSubmissionPlan, options?: RunAreaOptions): Promise<AreaSchedule>;
/**
 * Plans an area run for a polygon and submits it: tiles the polygon, builds each tile's request
 * and sends one job per tile (or per batch of facade sensors).
 *
 * Returns as soon as the jobs are submitted; poll the jobs with `checkAreaState` and merge the
 * results with `mergeAreaJobs`, or use `InfraredClient.runAreaAndWait` to do all three. Every
 * tile is a billed job, so size the run first with `previewAreaBatches`.
 *
 * @param service - The jobs service that sends the jobs, for example `client.jobs`.
 * @param input - The analysis request: `analysisType` plus the analysis's own parameters.
 * @param polygon - The GeoJSON `Polygon` to analyse.
 * @param options - The run options (see `RunAreaOptions`).
 * @returns The frozen schedule of the run, to poll, merge or save.
 * @throws {TypeError} when the unsupported `binaryResults` option is passed.
 * @throws {Error} when `terrainContextMarginM` is not a finite non-negative number.
 * @throws {Error} when `retryFrom` was saved with a different transport or terrain margin.
 * @throws {AreaGeometryReferenceError} when the API accepted a job with an invalid geometry
 *   reference.
 * @category Run an analysis
 */
export declare function runArea(service: AreaJobsService, input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule>;
/**
 * Share each prepared site's facade parts between the facade analyses of one call that plan the
 * same jobs (`Site.shareFacadeParts`): the kernel makes each tile's groups, captures and scenes
 * once and drops them when the last analysis took them. A site whose analyses plan different
 * jobs shares nothing. Returns the release, for the end of the call.
 */
export declare function shareFacadeSites(facadeSites: ReadonlyMap<SiteAnswer, readonly string[]>): () => void;
/**
 * `runArea` of a list: plans every analysis on one shared site (the mesh groups packed and
 * hashed once, the facade parts shared), submits them together and returns one schedule per
 * input, in input order. `retryFrom` describes one analysis's run, so a list refuses it (as
 * Python's `run_area` does): retry each analysis alone. When a submit throws, the first error in
 * input order is thrown; `onAccepted` has reported every accepted job.
 */
export declare function runAreaMany(service: AreaJobsService, inputs: readonly RunAreaInput[], polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule[]>;
