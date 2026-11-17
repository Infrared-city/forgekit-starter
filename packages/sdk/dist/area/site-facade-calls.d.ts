import type { PoolTask } from "../internal/pool-task.js";
import type { FacadeFrame, FacadeFrameParts } from "./site-assign.js";
import type { KernelSite } from "./site-kernel.js";
/** The parts of every batch of tile `index` (see `SiteAnswer.facadeFrames`). */
export declare function facadeFramesCall(withKernel: <T>(use: (site: KernelSite) => T) => T, index: number, batches: readonly (readonly string[])[], parts: FacadeFrameParts): {
    readonly start: () => PoolTask;
    readonly end: (task: PoolTask) => FacadeFrame[];
};
