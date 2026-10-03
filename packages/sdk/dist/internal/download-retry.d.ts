/**
 * Result download retry (D224). The kernel decides, with the same rule as a
 * keyed submit: a 429 is retried with no limit, a 403 (expired presign), a 5xx
 * or a network failure inside the kernel's send budget, each with the kernel's
 * delay. A GET is idempotent, so a spent budget is a plain failure.
 *
 * A timeout is NOT retried: it already spent the whole download deadline.
 * An abort is the caller's own decision. Any other 4xx is a real answer.
 */
export declare function isRetryableDownloadError(error: unknown): boolean;
/** True when the kernel says send the download again. */
export declare function shouldRetryDownload(error: unknown, sendsDone: number): boolean;
/**
 * Wait before the next attempt, and report a caller's abort the way every
 * other stopped download reports it. `delay` rejects with a bare `Error`,
 * which would reach the caller as neither a `TransportError` nor an abort.
 */
export declare function pauseBeforeRetry(sendsDone: number, error: unknown, signal?: AbortSignal): Promise<void>;
