/**
 * One colour configuration from the registry: the colours of a result and how to
 * step through them.
 *
 * @category Results and legend
 */
export interface VisualConfig {
    colors: number[][];
    steps?: Array<number | string> | null;
    colorInterpolation?: string;
    [key: string]: unknown;
}
/**
 * The registry's `visualConfigurations` object, with all variants included, keyed by
 * configuration name.
 *
 * @category Results and legend
 */
export type VisualConfigurations = Record<string, unknown>;
/**
 * Options for `fetchVisualConfigurations`.
 *
 * @category Results and legend
 */
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
/**
 * The public colour registry: the colour configurations used to draw results, and the
 * registry version they came from.
 *
 * @category Results and legend
 */
export interface RegistryDocument {
    /** The colour configurations, keyed by name. The object is frozen. */
    configurations: VisualConfigurations;
    /** The registry version, or `null` when the document does not state one. */
    version: string | null;
}
/**
 * The address of the public registry document that colour configurations are read from.
 * It is served over HTTPS and needs no credentials.
 *
 * @category Results and legend
 */
export declare const REGISTRY_URL = "https://registry.infrared.city/models/latest.json";
/**
 * The largest registry document, in bytes, that the SDK will read (8 MiB). A larger
 * answer is refused with a `RegistryFetchError`.
 *
 * @category Results and legend
 */
export declare const MAX_REGISTRY_BYTES: number;
/**
 * Thrown when the colour registry could not be fetched or its answer was not usable:
 * a URL that is not HTTPS on the registry host, a redirect, an HTTP error, a timeout or
 * abort, a body that is too large or not JSON, or a document without colour configurations.
 *
 * @category Errors
 */
export declare class RegistryFetchError extends Error {
    readonly name = "RegistryFetchError";
}
/**
 * Drop the cached registry document, so the next read fetches it again. Useful in tests,
 * or when you know a new registry release is out.
 *
 * @category Results and legend
 */
export declare function clearRegistryCache(): void;
/**
 * Fetch the colour configurations from the public registry.
 *
 * The answer is cached for `ttlMs` (15 minutes by default), and the returned object is
 * frozen. A custom `url` bypasses the cache, so a pinned document never replaces the
 * shared entry. No credentials are sent: the registry is public, and the request is a
 * plain `fetch`, not the SDK's authenticated connection. Redirects are refused.
 *
 * @param options - Optional URL, cache lifetime, `fetch` implementation, abort signal and
 *   timeout (30 seconds by default, covering the answer and its body).
 * @returns The colour configurations and the registry version.
 * @throws {RegistryFetchError} If the URL is not HTTPS on the registry host, the read
 *   fails, times out or is aborted, or the document is not usable.
 * @category Results and legend
 */
export declare function fetchVisualConfigurations(options?: FetchRegistryOptions): Promise<RegistryDocument>;
