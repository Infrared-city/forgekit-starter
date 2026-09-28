import { GatewayTransport } from "./transport.js";
import { trimTrailingSlashes } from "./url-trim.js";
/** A site-context option was given a value the SDK does not have. */
export class InvalidOptionError extends TypeError {
    name = "InvalidOptionError";
}
/**
 * Refuse an option this SDK removed, and name what replaces it.
 *
 * A removed selector must not be ignored in silence: a caller that still
 * passes `acquisition: "service"` asked for the utilities service, and the
 * utilities service is gone. The error names the replacement so the caller
 * can act on the message alone. Kept for one minor version (MIGRATION.md).
 */
export function rejectRemovedOption(options, name, replacement) {
    if (options === undefined)
        return;
    const value = options[name];
    if (value === undefined)
        return;
    throw new InvalidOptionError(`${name} was removed; ${replacement}`);
}
export function serviceTransport(options, suffix = "") {
    const base = trimTrailingSlashes(String(options.baseUrl));
    return new GatewayTransport({
        baseUrl: `${base}${suffix}`,
        auth: options.auth,
        ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
        ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    });
}
export function requireJson(value, operation) {
    if (value === undefined)
        throw new Error(`${operation} returned an empty response`);
    return value;
}
/**
 * Ordered concurrency, re-exported.
 *
 * The implementation moved to `map-limit.ts` so the credential-free geodata
 * layer can use it without importing this module's gateway transport.
 */
export { mapLimit } from "./map-limit.js";
