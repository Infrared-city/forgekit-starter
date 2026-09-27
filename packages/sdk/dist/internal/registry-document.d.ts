/**
 * The public colour registry document: fetch, allow-list, cache.
 *
 * Split out of `images.ts` so the rendering module stays inside the 400-line
 * rule. The network rules live in ONE place here: HTTPS on an allow-listed
 * host, no credentials, redirects refused, and a declared body cap.
 */
/** One `visualConfigurations` entry. */
export interface VisualConfig {
    colors: number[][];
    steps?: Array<number | string> | null;
    colorInterpolation?: string;
    [key: string]: unknown;
}
/** The registry's `visualConfigurations` object, variants included. */
export type VisualConfigurations = Record<string, unknown>;
export interface FetchRegistryOptions {
    /** Defaults to {@link REGISTRY_URL}. A custom URL bypasses the cache. */
    url?: string;
    /** Cache lifetime in ms. Defaults to 15 minutes. */
    ttlMs?: number;
    /** Injectable `fetch`, for tests and for hosts with a custom transport. */
    fetch?: typeof globalThis.fetch;
    /** The caller's own stop signal. Honoured together with `timeoutMs`. */
    signal?: AbortSignal;
    /** Total time for the answer AND its body, in ms. Defaults to 30 seconds. */
    timeoutMs?: number;
}
export interface RegistryDocument {
    configurations: VisualConfigurations;
    version: string | null;
}
/** The public R2 mirror of the models registry. HTTPS, no credentials. */
export declare const REGISTRY_URL = "https://registry.infrared.city/models/latest.json";
/**
 * Largest registry document this module will read.
 *
 * The live document is under 1 MB. The cap keeps a wrong or hostile answer
 * from buffering an unbounded body in a browser tab.
 */
export declare const MAX_REGISTRY_BYTES: number;
/** The colour registry could not be fetched or was not usable. */
export declare class RegistryFetchError extends Error {
    readonly name = "RegistryFetchError";
}
/** Drop the cached registry document. For tests and for a known new release. */
export declare function clearRegistryCache(): void;
/**
 * Fetch `visualConfigurations` from the public registry mirror.
 *
 * Cached in-module for `ttlMs`. A non-default `url` bypasses the cache
 * entirely, so a staging pin never poisons the shared entry. No credentials are
 * sent: the registry is a public object and this is a bare `fetch`, not the
 * SDK's authenticated transport.
 */
export declare function fetchVisualConfigurations(options?: FetchRegistryOptions): Promise<RegistryDocument>;
