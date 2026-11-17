/**
 * Submit the parts of a planned request on the kernel run engine
 * (`area/engine-jobs.ts`): the same POST rules as an area run, and the same
 * retry: only the parts that failed.
 */
import type { AreaJobsService } from "../area/run-options.js";
import { type Logger } from "../logger.js";
import { type PlannedRequest } from "./plan.js";
import type { PartsOptions, PartsSchedule } from "./types.js";
/**
 * The parts a retry sends again: a failed POST, a failed job, or a part never
 * sent (a stopped run). Never a part whose POST outcome is unknown, and never
 * a job the poll gave up on (it has a job id; a merge asks about it again).
 */
export declare function retryableParts(schedule: PartsSchedule): string[];
export declare function submitParts(service: AreaJobsService, request: PlannedRequest, options?: PartsOptions, logger?: Logger): Promise<PartsSchedule>;
