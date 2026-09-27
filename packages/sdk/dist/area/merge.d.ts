import type { JobsService } from "../jobs.js";
import { type Logger } from "../logger.js";
import { type AreaResult, type AreaSchedule } from "./schedule-types.js";
import type { FacadeSynthesisStore } from "./facade-synthesis.js";
export { mergeSurfaceAreaJobs } from "./merge-surface.js";
export type AreaMergeJobsService = Pick<JobsService, "getStatus" | "downloadResults"> & {
    /**
     * OPTIONAL: the client's own facade capture + layout cache. Absent on a
     * hand-rolled or mocked service, which simply means no job inputs were
     * captured and no triangles are synthesized.
     */
    readonly facadeSynthesis?: FacadeSynthesisStore;
};
export interface AreaMergeOptions {
    readonly strategy?: "default" | "directional" | "directional_blend";
    readonly windDirectionDeg?: number;
    readonly block?: number;
    readonly maxWorkers?: number;
    readonly signal?: AbortSignal;
    /** `InfraredClient` passes its own; a dropped tile is warned through it. */
    readonly logger?: Logger;
}
/** Poll once, download completed grid jobs, and merge them in the shared core. */
export declare function mergeAreaJobs(jobsService: AreaMergeJobsService, schedule: AreaSchedule, options?: AreaMergeOptions): Promise<AreaResult>;
