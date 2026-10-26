import type { AreaSchedule } from "./schedule-types.js";
/** The event name of the one-time legacy-schedule warning (as Python). */
export declare const LEGACY_SCHEDULE_EVENT = "area.resume.site_identity_missing";
/**
 * Check site inputs on every `retryFrom` that comes with inputs.
 *
 * A round that resubmits a tile needs a provable identity (stricter than
 * Python). A round that resubmits nothing, such as a complete schedule, follows
 * Python's `check_site_resume`: a recorded identity must match the current
 * one, and a schedule without a recorded identity is not checked.
 */
export declare function checkPaidRetrySiteIdentity(prior: AreaSchedule | undefined, current: string | undefined, willSubmit: boolean): void;
