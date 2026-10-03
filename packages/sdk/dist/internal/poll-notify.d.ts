import type { Deadline } from "./deadline.js";
import type { OnPollCallback } from "../job-options.js";
import type { Job } from "../job-model.js";
/** Run the caller's poll observer inside the deadline. An observer failure
 * does not stop polling (the legacy callback contract); a stop does. */
export declare function notifyPoll(deadline: Deadline, callback: OnPollCallback | undefined, job: Job, attempt: number, elapsed: number, nextDelay: number): Promise<boolean | void>;
