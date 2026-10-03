/**
 * The D224 retry fields of an `AreaSchedule` (run id, per-key attempts):
 * freeze, JSON round-trip, and parse. Split out of `schedule.ts` for the
 * 400-line cap (root `CLAUDE.md` rule 8).
 *
 * Reading an OLD schedule, written before this field set existed, must keep
 * working: every field here is optional, and a missing one means exactly
 * what the kernel's `RetryPlanInput` already treats a missing value as
 * (`docs/sdk-data-flow.md` -> "Area retry and the idempotency key").
 *
 * An OLDER schedule may also still carry `maxAttempts` or
 * `exhaustedSubmissions`: SDK versions before the per-key cap became one
 * kernel constant (D224 review) wrote them. `parseRetryFields` IGNORES both
 * by name -- read, dropped, never validated -- so that schedule still loads.
 */
import type { AreaSchedule, AreaScheduleJSON } from "./schedule-types.js";
export type RetryFields = Pick<AreaSchedule, "runId" | "attempts">;
export declare function freezeRetryFields(schedule: RetryFields): RetryFields;
export declare function retryFieldsToJSON(schedule: RetryFields): Pick<AreaScheduleJSON, "runId" | "attempts">;
/**
 * Read the retry fields off a parsed schedule document. `invalid` is the
 * caller's refusal (throws); this never throws on its own.
 *
 * `raw.maxAttempts` and `raw.exhaustedSubmissions` are read by name and
 * dropped -- a legacy field from an older SDK, never validated, never
 * carried into the parsed `AreaSchedule` (CUT 4, D224 review).
 */
export declare function parseRetryFields(raw: Record<string, unknown>, invalid: (message: string) => never): RetryFields;
