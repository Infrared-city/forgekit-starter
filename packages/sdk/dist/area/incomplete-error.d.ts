import type { AreaSchedule, TileFailure } from "./schedule-types.js";
/**
 * A grid the caller PAID for and did not get (#342, D110). The recovery is in
 * the message, not a field: the caller already holds the schedule both halves
 * of it read. `cause` is the FIRST underlying failure in tile order, as
 * `SiteReadError` does for a chunked site read (D48).
 *
 * An uncertain submission WITH NO JOB is named separately, because neither of
 * the two recoveries reaches it and saying otherwise was a lie the first
 * version of this message told: there is no job for `mergeAreaJobs` to fetch,
 * and `retryFrom` carries `uncertainSubmissions` forward untouched on purpose
 * (#197, D59), since resubmitting a POST the server may already have accepted
 * can pay for the tile twice. The tile's own entry already says "do not
 * resubmit automatically". Whether to pay again is the caller's call, so the
 * message states the position and stops there.
 *
 * An uncertain submission that DID return an accepted `jobId` and later
 * SUCCEEDED is not named: it polls and downloads like any other tile, so a
 * second `mergeAreaJobs` call fetches it for free, and calling it unreachable
 * would push the caller into a paid resubmission they do not need.
 *
 * A THIRD case (2026-09-21 review, extends D115): an accepted `jobId` whose
 * job later ended FAILED. Neither blanket recovery reaches this one either —
 * the job ran, so there is no result to fetch, and `retryFrom` still will not
 * resubmit an uncertain-submission tile (#197, D59) — so it gets its own note.
 */
export declare function incomplete(schedule: AreaSchedule, missing: readonly TileFailure[]): Error;
