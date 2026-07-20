/**
 * Logger interface for the SDK with structured logging support.
 *
 * Supports both simple string messages and structured JSON events.
 */
/** Structured log event with an event name and arbitrary metadata. */
interface LogEvent {
    event: string;
    [key: string]: unknown;
}
/**
 * Logger interface for the SDK.
 *
 * Each method accepts either a plain string message or a structured LogEvent.
 */
interface Logger {
    debug(message: string | LogEvent, ...args: unknown[]): void;
    info(message: string | LogEvent, ...args: unknown[]): void;
    warn(message: string | LogEvent, ...args: unknown[]): void;
    error(message: string | LogEvent, ...args: unknown[]): void;
}
/**
 * Default console-based logger implementation.
 * Structured LogEvent objects are serialized to JSON strings.
 *
 * @example
 * ```ts
 * const client = new InfraredClient({
 *   apiKey: 'key',
 *   baseUrl: 'https://api.example.com',
 *   logger: consoleLogger,
 * })
 * ```
 */
declare const consoleLogger: Logger;
/**
 * Silent logger that discards all output. Useful for testing.
 *
 * @example
 * ```ts
 * const client = new InfraredClient({
 *   apiKey: 'key',
 *   baseUrl: 'https://api.example.com',
 *   logger: silentLogger,
 * })
 * ```
 */
declare const silentLogger: Logger;

export { type Logger as L, type LogEvent as a, consoleLogger as c, silentLogger as s };
