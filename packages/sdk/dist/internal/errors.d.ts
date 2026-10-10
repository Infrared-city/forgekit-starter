/** The JavaScript realm kinds that each need their own `initializeCore()` call. */
export type CoreRealm = "main thread" | "Web Worker" | "Node";
/** Detects the current realm without throwing in any host. */
export declare function detectCoreRealm(): CoreRealm;
/** The one text for "the core is not started": names the realm and the function. */
export declare function coreNotStartedMessage(realm: CoreRealm, method?: string): string;
/**
 * Thrown when a synchronous operation that needs the loaded core runs before
 * `initializeCore()` has completed.
 *
 * @category Errors
 */
export declare class CoreNotReadyError extends Error {
    readonly name = "CoreNotReadyError";
    /** The JavaScript realm that has no started core. */
    readonly realm: "main thread" | "Web Worker" | "Node";
    /** The public function that needed the core, when the caller knows it. */
    readonly method: string | undefined;
    constructor(method?: string);
}
/**
 * Thrown when the core could not be initialised, for example because it could not be
 * fetched or compiled, or because the options passed to `initializeCore()` are invalid.
 *
 * @category Errors
 */
export declare class CoreInitializationError extends Error {
    readonly name = "CoreInitializationError";
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
export declare class CoreTerminalError extends CoreInitializationError {
    readonly terminal = true;
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
export declare class CoreVersionSkewError extends Error {
    readonly name = "CoreVersionSkewError";
    constructor(missing: readonly string[]);
}
