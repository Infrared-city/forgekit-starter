/**
 * Where the SDK sends its own messages. Pass one to the client to capture or
 * silence them.
 *
 * @category Client
 */
export interface Logger {
    /** Log a debug message. */
    readonly debug: (...args: unknown[]) => void;
    /** Log an informational message. */
    readonly info: (...args: unknown[]) => void;
    /** Log a warning. */
    readonly warn: (...args: unknown[]) => void;
    /** Log an error. */
    readonly error: (...args: unknown[]) => void;
}
/**
 * A `Logger` that discards every message.
 *
 * @category Client
 */
export declare const silentLogger: Logger;
/**
 * A `Logger` that writes to the global `console`.
 *
 * @category Client
 */
export declare const consoleLogger: Logger;
