/**
 * One extra attempt for a result download, and the pause before it.
 *
 * A benchmark run on staging (`sdk-bench` B2-ts, 2026-09-14; D62, #236) lost
 * 22 of 1,176 PAID tiles to a single network-level `fetch failed` on the
 * presigned GET.
 * Downloading a completed result is idempotent and cheap while the job behind
 * it is already paid for, so one retry buys back the tile for the price of one
 * extra request. It stays at ONE on purpose: a persistent outage must surface
 * as a failure the caller sees, not as a merge that holds every tile hostage.
 */
export declare const DOWNLOAD_RETRY_ATTEMPTS = 1;
export declare const DOWNLOAD_RETRY_DELAY_MS = 250;
/**
 * Retry only what a second attempt can plausibly fix.
 *
 * - `403` — the presign expired; the next attempt mints a fresh one.
 * - `5xx` — the object store failed this request, not the request itself.
 * - no status at all — `internal/download.ts` classifies a rejected `fetch`
 *   as a `TransportError` with `reason: "network"` and no status, which is
 *   the exact shape the 22 dropped tiles carried.
 *
 * A timeout is NOT retried: it already spent the whole download deadline.
 * An abort is the caller's own decision. Any other 4xx is a real answer.
 */
export declare function isRetryableDownloadError(error: unknown): boolean;
/**
 * Wait before the next attempt, and report a caller's abort the way every
 * other stopped download reports it. `delay` rejects with a bare `Error`,
 * which would reach the caller as neither a `TransportError` nor an abort.
 */
export declare function pauseBeforeRetry(signal?: AbortSignal): Promise<void>;
