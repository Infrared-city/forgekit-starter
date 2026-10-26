/** Detects the current realm without throwing in any host. */
export function detectCoreRealm() {
    const scope = globalThis;
    if (typeof scope.WorkerGlobalScope === "function" && globalThis instanceof scope.WorkerGlobalScope) {
        return "Web Worker";
    }
    if (typeof scope.process?.versions?.node === "string")
        return "Node";
    return "main thread";
}
/** The one text for "the core is not started": names the realm and the function. */
export function coreNotStartedMessage(realm, method) {
    return (`The Infrared core is not started in this ${realm}. ` +
        `Call \`await initializeCore()\` in this ${realm} before \`${method ?? "any core function"}\`. ` +
        "Each Web Worker needs its own call.");
}
/**
 * Thrown when a synchronous operation that needs the loaded core runs before
 * `initializeCore()` has completed.
 *
 * @category Errors
 */
export class CoreNotReadyError extends Error {
    name = "CoreNotReadyError";
    /** The JavaScript realm that has no started core. */
    realm;
    /** The public function that needed the core, when the caller knows it. */
    method;
    constructor(method) {
        const realm = detectCoreRealm();
        super(coreNotStartedMessage(realm, method));
        this.realm = realm;
        this.method = method;
    }
}
/**
 * Thrown when the core could not be initialised, for example because it could not be
 * fetched or compiled, or because the options passed to `initializeCore()` are invalid.
 *
 * @category Errors
 */
export class CoreInitializationError extends Error {
    name = "CoreInitializationError";
}
/**
 * Thrown when the core loaded but failed its capability or version check.
 *
 * This failure is final for the JavaScript realm (the page, worker or Node
 * process): every later `initializeCore` call rejects with the same error, so a
 * worker that sees it must end and a new worker must start. A plain
 * {@link CoreInitializationError} (a failed fetch or compile) can be retried in the
 * same realm. `terminal` lets a caller that only sees the error object tell the two
 * apart. `name` stays `"CoreInitializationError"`, so a check on the name still matches.
 *
 * @category Errors
 */
export class CoreTerminalError extends CoreInitializationError {
    terminal = true;
}
/**
 * Reports an initialised core that lacks a function the SDK needs.
 *
 * The SDK no longer throws this error: `initializeCore()` now refuses a mismatched
 * core build before any operation runs. The class remains exported so existing
 * `catch` and `instanceof` checks keep compiling.
 *
 * @category Errors
 */
// Maintainer note (not published): nothing in this package throws it any more:
// every kernel name this SDK calls is on `REQUIRED_FUNCTION_EXPORTS`, so
// `initializeCore()` refuses a mismatched build before any path runs. The class
// stays because it is a published export a caller may still catch, and removing
// it is a public-API change. It goes at the next major.
export class CoreVersionSkewError extends Error {
    name = "CoreVersionSkewError";
    constructor(missing) {
        super(`the Infrared core is initialized but lacks ${missing.join(", ")} — ` +
            "version skew, not a missing install");
    }
}
