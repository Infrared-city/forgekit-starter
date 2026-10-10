import type { AuthResolver } from "./auth.js";
import type { Logger } from "../logger.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
/**
 * Options shared by the SDK's service classes.
 *
 * @category Client
 */
export interface ServiceOptions {
    /** Base URL of the API the service calls. */
    readonly baseUrl: string | URL;
    /** Supplies the authentication headers for each request. */
    readonly auth: AuthResolver;
    /** A `fetch` implementation to use instead of the global one. */
    readonly fetch?: FetchLike;
    /** Time limit for one request, in milliseconds. */
    readonly timeoutMs?: number;
    /**
     * Where the service's own messages, such as warnings, go.
     *
     * `InfraredClient` passes its `logger` here, so choosing `silentLogger` silences the
     * SDK's warnings, and a Node caller can capture them. A service created on its own
     * defaults to `consoleLogger`.
     */
    readonly logger?: Logger;
}
/**
 * Thrown when an option is given a value the SDK does not support, or a removed option is
 * passed. The message names what to use instead.
 *
 * @category Errors
 */
export declare class InvalidOptionError extends TypeError {
    readonly name = "InvalidOptionError";
}
export declare function rejectRemovedOption(options: object | undefined, name: string, replacement: string): void;
export declare function serviceTransport(options: ServiceOptions, suffix?: string): GatewayTransport;
export declare function requireJson<T>(value: T | undefined, operation: string): T;
export { mapLimit } from "./map-limit.js";
