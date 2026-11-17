/**
 * The stage at which a tile failed or was skipped: `Submit`, `Compute`, `Download` or
 * `Skipped`.
 *
 * @category Errors
 */
export const TileFailurePhase = {
    Submit: "submit",
    Compute: "compute",
    Download: "download",
    Skipped: "skipped",
};
/**
 * Why a tile has no result: the kinds of the SDK core. `retryPolicy().failureAdvice[kind]`
 * says what to do.
 *
 * @category Errors
 */
export const TILE_FAILURE_KINDS = [
    "send_refused",
    "host_refused",
    "rate_limited",
    "payment_required",
    "uncertain",
    "server_failed",
    "download_failed",
    "timeout",
];
