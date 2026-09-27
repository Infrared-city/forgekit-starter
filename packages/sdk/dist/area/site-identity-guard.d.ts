import type { AreaSchedule } from "./schedule-types.js";
/** Check site inputs before a retry can submit another paid job. */
export declare function checkPaidRetrySiteIdentity(prior: AreaSchedule | undefined, current: string | undefined, willSubmit: boolean): void;
