import type { AreaState } from "./schedule-types.js";
/** The area poll schedule — the SAME schedule the Python SDK polls on
 * (`_area/_polling.py`). Both hosts are pinned to each other, so these
 * numbers move together or not at all.
 *
 * There are two schedules because there are two request costs, and the cost
 * is what the interval is derived from.
 *
 * ## The fallback schedule (no batched status route)
 *
 * A sweep costs ONE `GET /jobs/{id}` per non-terminal job, and an area is 81
 * jobs at 5 km2 — so the sweep interval, not the per-request cost, decides
 * the load. Up to 0.12 the delay was `random() * min(60, 2 * 2^n)` with `n`
 * from 0 and a 1 s floor: about seven sweeps in the first minute and a sweep
 * every ~30 s after, measured at 650-810 GETs in minute one and ~160/min
 * steady (`FABLE-perf-audit.md` row 3a).
 *
 * Since D52: `min(75, 15 * 2^n)` from `n = 0`, scaled by a jitter in
 * [0.8, 1.0]. The jitter only ever SHORTENS the wait, so the worst case for
 * the request budget is every draw at 0.8 — cumulative sweep times 0, 12, 36,
 * 84 s, which is **three sweeps in the first minute** (243 GETs for 81 jobs).
 * The 75 s cap is what makes the STEADY state safe too: its shortest interval
 * is 60 s, so the rate cannot exceed one sweep a minute (81 GETs/min for 81
 * jobs). A 60 s cap would allow a 48 s interval and 101 GETs/min.
 *
 * This is what production gets, and it is unchanged.
 *
 * ## The batched schedule (D121)
 *
 * With `GET /async/jobs?ids=` a sweep is `ceil(jobs / 50)` requests instead
 * of one per job. At the same reference area of 81 jobs a sweep is **2
 * requests**, so the interval is set from D52's own steady-state budget of 81
 * status requests a minute, held at the WORST jitter draw:
 *
 *     worst interval  = 2 s x 0.8       = 1.6 s
 *     sweeps a minute = 60 / 1.6        = 37.5
 *     requests/minute = 37.5 x 2        = 75      (budget: 81)
 *
 * Two seconds is the shortest whole second that fits. One second would be
 * 120 requests a minute, over budget; three would leave a second of pure
 * waiting on the table for nothing. The first minute costs **75 requests
 * where the ladder costs 243**, and the first re-check of a job that finishes
 * in eight seconds happens at two seconds rather than fifteen.
 *
 * There is no ladder in the batched schedule because there is nothing for a
 * ladder to protect: the cost of a sweep does not grow with how long the run
 * has been going.
 *
 * ## The fast start (D176)
 *
 * For the first 10 s of polling the batched interval is 1 s, then 2 s, but
 * only while a sweep is ONE request (at most 50 open jobs, and the last
 * sweep sent no per-job request for ids the batch left unanswered). A tile job often
 * ends in 1-4 s, so the first sweeps are where a shorter interval pays: on
 * staging (2026-09-26, 1-tile and 16-tile solar runs) 1 s gave the results
 * 0.8-1.5 s sooner than 2 s, and 5 s gave them 2.5-3 s later. One client in
 * its fast start sends at most 1.25 requests a second, whatever the size of
 * its run; a larger run polls at 2 s from the start. The steady rate is
 * unchanged.
 */
/** The fallback schedule's first window, in seconds. */
export declare const POLL_BACKOFF_BASE_S = 15;
/** The fallback schedule's cap, in seconds. */
export declare const POLL_BACKOFF_CAP_S = 75;
/** The batched schedule's steady interval, in seconds. */
export declare const POLL_BATCHED_INTERVAL_S = 2;
/** The batched schedule's fast-start interval, in seconds (D176). */
export declare const POLL_BATCHED_FAST_INTERVAL_S = 1;
/** How long the fast start lasts, in seconds of polling (D176). */
export declare const POLL_BATCHED_FAST_WINDOW_S = 10;
/** The most open jobs a fast-start sweep may ask about: one batched request. */
export declare const POLL_BATCHED_FAST_MAX_JOBS = 50;
/** Jitter multiplier range: it may only shorten the wait, never lengthen it. */
export declare const POLL_JITTER_MIN = 0.8;
/**
 * How long to wait before the next sweep.
 *
 * `batched` is what the LAST sweep actually cost, discovered at runtime —
 * not a setting. A gateway without the route never reports `true`, so a
 * released SDK run against production polls on exactly the schedule it
 * always did. `elapsedS` (time since the first sweep) and `openJobs` (jobs
 * not yet terminal) select the batched fast start.
 */
export declare function areaPollDelayS(attempt: number, batched: boolean, elapsedS: number, openJobs: number): number;
/** Jobs a sweep still asks about: those not yet terminal. */
export declare function openJobs(state: AreaState): number;
