const discard = (..._args) => undefined;
export const silentLogger = Object.freeze({
    debug: discard,
    info: discard,
    warn: discard,
    error: discard,
});
export const consoleLogger = console;
