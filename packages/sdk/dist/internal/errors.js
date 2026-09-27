export class CoreNotReadyError extends Error {
    name = "CoreNotReadyError";
    constructor() {
        super("initializeCore() must complete before synchronous core operations");
    }
}
export class CoreInitializationError extends Error {
    name = "CoreInitializationError";
}
/**
 * The core loaded but failed its capability or version check.
 *
 * This failure is final for the realm: every later `initializeCore` call
 * rejects with the same error, so a worker that sees it must end and a new
 * worker must start. A plain {@link CoreInitializationError} (a failed fetch
 * or compile) can be retried in the same realm. `terminal` lets a caller
 * that only sees the error object tell the two apart. `name` stays
 * `"CoreInitializationError"`, so a check on the name still matches.
 */
export class CoreTerminalError extends CoreInitializationError {
    terminal = true;
}
/**
 * The core is initialized but lacks an export a local path needs.
 *
 * Nothing in this package throws it any more: every kernel name this SDK
 * calls is on `REQUIRED_FUNCTION_EXPORTS`, so `initializeCore()` refuses a
 * mismatched build before any path runs. The class stays because it is a
 * published export a caller may still catch, and removing it is a public-API
 * change. It goes at the next major.
 */
export class CoreVersionSkewError extends Error {
    name = "CoreVersionSkewError";
    constructor(missing) {
        super(`the Infrared core is initialized but lacks ${missing.join(", ")} — ` +
            "version skew, not a missing install");
    }
}
