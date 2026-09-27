import type { AreaStatusService, CheckAreaStateOptions } from "./run-options.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/**
 * Give the poll circuit breaker's victims one more chance.
 *
 * `pollOne` retires a job to `"skipped"` after FAILURE_LIMIT consecutive
 * `getStatus` failures, and `checkAreaState` then never polls it again for the
 * life of the schedule. That is right INSIDE one run: a tile the gateway keeps
 * refusing must not hold the poll loop open forever.
 *
 * It is wrong when the caller comes back and explicitly asks for their results
 * again. The job exists, it is billed, and it very often SUCCEEDED while we
 * were being throttled — a live smoke test found 23 of 23 retired tiles had
 * already succeeded server-side, fetchable by `jobId` in under 50 ms
 * (`sdk-bench/reports/SMOKE-TS-A-2026-09-20`). Leaving them retired made
 * D110's "call mergeAreaJobs again" a promise the SDK could not keep.
 *
 * Only the breaker's victims are revived: a `"skipped"` job WITH a `jobId`.
 * A tile skipped by an aborted submission has no `jobId` and stays as it is.
 */
export declare function revivePolledOut(schedule: AreaSchedule): number;
export declare function lastPerJobRequests(schedule: AreaSchedule): number;
export declare function checkAreaState(service: AreaStatusService, schedule: AreaSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
