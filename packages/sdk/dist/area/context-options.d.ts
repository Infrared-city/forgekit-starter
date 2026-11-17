import { type Logger } from "../logger.js";
import type { RunAreaOptions } from "./run-options.js";
/**
 * The context options of a run as the site key names them (D293). The kernel
 * resolves them, so an omitted option and its explicit default give one key.
 */
export declare function contextKey(options: RunAreaOptions): string;
/**
 * The kernel `SiteOptions` document: snake_case keys, `undefined` left out
 * (the kernel default), `null` kept (every tile / as given).
 */
export declare function siteOptionsJson(options: {
    readonly terrainMarginM?: number | undefined;
    readonly contextReachM?: number | null | undefined;
    readonly contextBufferM?: number | undefined;
}): string;
/** The context options the compose passes on, only those the caller set. */
export declare function contextOptions(options: RunAreaOptions): {
    contextReachM?: number | null;
    contextBufferM?: number;
};
/** The kernel's ONE warning for the context the hole removed (D293). */
export declare function warnContextHole(warning: string | undefined, logger: Logger | undefined): void;
