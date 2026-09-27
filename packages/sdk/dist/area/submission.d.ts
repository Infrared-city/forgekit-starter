import { type AreaSubmissionPlan, type SubmissionEntry } from "./planning.js";
import type { AreaJobsService, RunAreaInput, RunAreaOptions } from "./run-options.js";
import type { AreaSchedule } from "./schedule-types.js";
import type { Polygon } from "./types.js";
export declare class AreaGeometryReferenceError extends Error {
    readonly areaSchedule: AreaSchedule;
    readonly acceptedJobIds: readonly string[];
    readonly name = "AreaGeometryReferenceError";
    constructor(areaSchedule: AreaSchedule, acceptedJobIds: readonly string[]);
}
/**
 * A LEGACY schedule recorded an uncertain capability probe, and resuming it
 * would repeat work whose billing state is unknown. No SDK submits a probe job
 * any more (D71), so nothing written from here on can raise this.
 */
export declare class AreaGeometryProbeError extends Error {
    readonly areaSchedule: AreaSchedule;
    readonly acceptedProbeJobIds: readonly string[];
    readonly name = "AreaGeometryProbeError";
    constructor(areaSchedule: AreaSchedule, acceptedProbeJobIds: readonly string[]);
}
/**
 * One facade job's capture for the local `cell-tris` synthesis
 * (`facade-synthesis.ts`, ADR 0008), or `undefined` when the run does not
 * synthesize locally. Written BEFORE the job's paid POST: a refusal or an
 * out-of-memory here fails the job while no request was sent, so a retry is
 * safe. After an accepted POST no host step may turn the job into a failed one.
 */
export declare function facadeCaptureFor(service: AreaJobsService, plan: AreaSubmissionPlan, entry: SubmissionEntry): Uint8Array | undefined;
/**
 * Retain one accepted facade job's capture ({@link facadeCaptureFor}) so the
 * merge can synthesize its `cell-tris` locally. Per CLIENT, on the jobs
 * service: never module-global, and never in the `AreaSchedule`, which is
 * serialised, resumed and handed between processes.
 */
export declare function rememberFacadeInputs(service: AreaJobsService, capture: Uint8Array | undefined, jobId: string | undefined): void;
/** Submit an already validated plan once per entry. Unknown POSTs are not retried. */
export declare function submitAreaPlan(service: AreaJobsService, plan: AreaSubmissionPlan, options?: RunAreaOptions): Promise<AreaSchedule>;
export declare function runArea(service: AreaJobsService, input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule>;
