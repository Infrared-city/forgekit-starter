let warned = false;
/** Say once per process, through the client's logger, that `pollIntervalMs` is deprecated. */
export function warnPollIntervalDeprecated(logger) {
    if (warned)
        return;
    warned = true;
    logger.warn("DeprecationWarning: pollIntervalMs is deprecated and will be removed in 2.0. The SDK sets the poll interval.");
}
