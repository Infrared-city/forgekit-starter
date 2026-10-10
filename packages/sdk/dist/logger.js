const discard = (..._args) => undefined;
/**
 * A `Logger` that discards every message.
 *
 * @category Client
 */
export const silentLogger = Object.freeze({
    debug: discard,
    info: discard,
    warn: discard,
    error: discard,
});
/**
 * A `Logger` that writes to the global `console`.
 *
 * @category Client
 */
export const consoleLogger = console;
