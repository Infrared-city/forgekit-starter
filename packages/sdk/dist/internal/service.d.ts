import type { AuthResolver } from "./auth.js";
import type { Logger } from "../logger.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
export interface ServiceOptions {
    readonly baseUrl: string | URL;
    readonly auth: AuthResolver;
    readonly fetch?: FetchLike;
    readonly timeoutMs?: number;
    /**
     * Where a service's own messages go.
     *
     * `InfraredClient` passes its `logger` here, so a caller who chose
     * `silentLogger` silences the SDK's warnings and a Node caller can capture
     * them. A service constructed on its own defaults to `consoleLogger`, which
     * is the behaviour the warnings had before they were routed.
     */
    readonly logger?: Logger;
}
/** A site-context option was given a value the SDK does not have. */
export declare class InvalidOptionError extends TypeError {
    readonly name = "InvalidOptionError";
}
/**
 * Refuse an option this SDK removed, and name what replaces it.
 *
 * A removed selector must not be ignored in silence: a caller that still
 * passes `acquisition: "service"` asked for the utilities service, and the
 * utilities service is gone. The error names the replacement so the caller
 * can act on the message alone. Kept for one minor version (MIGRATION.md).
 */
export declare function rejectRemovedOption(options: object | undefined, name: string, replacement: string): void;
export declare function serviceTransport(options: ServiceOptions, suffix?: string): GatewayTransport;
export declare function requireJson<T>(value: T | undefined, operation: string): T;
/**
 * Ordered concurrency, re-exported.
 *
 * The implementation moved to `map-limit.ts` so the credential-free geodata
 * layer can use it without importing this module's gateway transport.
 */
export { mapLimit } from "./map-limit.js";
