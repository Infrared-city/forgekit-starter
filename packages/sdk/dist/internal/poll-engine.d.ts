import { TransportError } from "./transport.js";
/**
 * The one job-status poll engine (D213).
 *
 * Every wait in this SDK goes through {@link poll}: a single-job
 * `waitForCompletion` (and so `runAndWait` and every model that waits on one
 * job: interior daylight-factor, energy-balance, any single tile) and an area
 * run's `runAreaAndWait`. The Python twin is
 * `infrared_sdk/_internal/poll_engine.py`.
 *
 * The engine owns the TIMING only. The caller's sweep asks for the status of
 * every open job — an area run with one batched `GET /async/jobs?ids=` per 50
 * ids where the gateway has the route, a single-job wait with one
 * `GET /async/jobs/{id}`. The numbers come from the kernel
 * (`ir_geo::poll_schedule`): 1 s between sweeps for the first 10 s, then
 * 2 s, at most two status requests a second, and an error backoff with
 * `Retry-After` only after a sweep that failed with HTTP 429, a 5xx or a
 * network error. The default wait timeout is the kernel's
 * `pollDefaultTimeoutSeconds` (900 s): longer than the 600 s worker timeout,
 * so a client does not abandon a job that still runs and is billed.
 */
/** What one sweep learned. */
export interface SweepOutcome {
    /** Every job this wait is for is terminal: stop. */
    readonly done: boolean;
    /** Status requests the NEXT sweep sends (default 1). */
    readonly nextRequests?: number;
    /** The sweep failed with HTTP 429, a 5xx or a network error. */
    readonly failed?: boolean;
    /** The server's `Retry-After` for that failure, seconds. */
    readonly retryAfterS?: number | undefined;
}
export interface PollOptions {
    readonly timeoutS: number;
    /** The wait between sweeps; it rejects when the caller aborts. */
    readonly sleep: (ms: number) => Promise<void>;
    readonly onTimeout: (elapsedS: number) => Error;
    /** Runs after every sweep, the last included (`nextDelayS` is 0 then).
     * `false` stops the wait and returns that outcome. */
    readonly observe?: (outcome: SweepOutcome, attempt: number, elapsedS: number, nextDelayS: number) => Promise<boolean | void> | boolean | void;
    /** Legacy `pollIntervalMs`: a fixed healthy interval, seconds. */
    readonly fixedIntervalS?: number | undefined;
    /** Legacy `backoffCapSeconds`: caps the healthy interval only. */
    readonly maxIntervalS?: number | undefined;
    /** Nothing is in flight: sweep at once instead of after the first delay. */
    readonly firstSweepNow?: boolean;
    readonly now?: () => number;
    readonly random?: () => number;
}
/** The default wait timeout, seconds (kernel-owned, D213). */
export declare function defaultPollTimeoutS(): number;
/** A status request failure the engine backs off on: HTTP 429, a 5xx, or a
 * network failure or request timeout. Anything else is the caller's error. */
export declare function isTransientStatusError(error: unknown): error is TransportError;
/** Sweep until `sweep` says done, or throw `onTimeout(elapsedS)`. */
export declare function poll(sweep: () => Promise<SweepOutcome>, options: PollOptions): Promise<SweepOutcome>;
