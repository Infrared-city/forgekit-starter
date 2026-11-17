import { requireCore } from "../internal/core.js";
import { consoleLogger } from "../logger.js";
/**
 * The context options of a run as the site key names them (D293). The kernel
 * resolves them, so an omitted option and its explicit default give one key.
 */
export function contextKey(options) {
    return requireCore().contextKey(siteOptionsJson(options));
}
/**
 * The kernel `SiteOptions` document: snake_case keys, `undefined` left out
 * (the kernel default), `null` kept (every tile / as given).
 */
export function siteOptionsJson(options) {
    // JSON has no NaN or infinity (`JSON.stringify` writes null, which means "every tile" for the
    // reach): such a number goes as its text, and the kernel refuses it by name.
    const value = (v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : v);
    return JSON.stringify({
        terrain_margin_m: value(options.terrainMarginM), context_reach_m: value(options.contextReachM),
        context_buffer_m: value(options.contextBufferM),
    });
}
/** The context options the compose passes on, only those the caller set. */
export function contextOptions(options) {
    return {
        ...(options.contextReachM === undefined ? {} : { contextReachM: options.contextReachM }),
        ...(options.contextBufferM === undefined ? {} : { contextBufferM: options.contextBufferM }),
    };
}
/** The kernel's ONE warning for the context the hole removed (D293). */
export function warnContextHole(warning, logger) {
    if (warning !== undefined)
        (logger ?? consoleLogger).warn(warning);
}
