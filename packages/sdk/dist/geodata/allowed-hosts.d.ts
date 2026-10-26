/**
 * The public data hosts the geodata readers may fetch from.
 *
 * Public data URLs come from this allow-list and never carry an API key. Two
 * entries are Infrared's public data mirrors and the third is the anonymous
 * Overture Maps bucket. A manifest read from one of them names the object URLs
 * the readers then fetch, so every such URL is checked against this list again
 * before a request goes out; a stale or tampered manifest cannot redirect a
 * range read to an arbitrary host.
 *
 * @category Geodata
 */
export declare const ALLOWED_HOSTS: readonly string[];
/**
 * Base URL of the public Infrared data mirror that hosts the sources registry
 * and the world FlatGeobuf files.
 *
 * @category Geodata
 */
export declare const GEO_BASE_URL = "https://geo.infrared.city";
/**
 * Report whether a URL may be fetched: it must use `https` and its host must be
 * on {@link ALLOWED_HOSTS}.
 *
 * @param url - The URL, as a string or a `URL`.
 * @returns `true` when the URL is allowed; `false` otherwise, including when the
 *   string cannot be parsed as a URL.
 * @category Geodata
 */
export declare function isAllowedUrl(url: string | URL): boolean;
/**
 * Return a URL as a string, or throw when it is not a permitted data URL.
 *
 * @param url - The URL, as a string or a `URL`.
 * @returns The URL as a string.
 * @throws {HostNotAllowedError} when the URL is not `https` or its host is not
 *   in {@link ALLOWED_HOSTS}.
 * @category Geodata
 */
export declare function assertAllowedUrl(url: string | URL): string;
/**
 * Resolve a registry value (`"vienna-trees-only.fgb"`) to a full URL.
 *
 * An absolute URL is kept as given; a relative key is joined onto
 * {@link GEO_BASE_URL}. The result is checked against the allow-list either way.
 *
 * @param key - A relative object key or an absolute URL.
 * @returns The full, allowed URL.
 * @throws {HostNotAllowedError} when the resulting URL is not allowed.
 * @category Geodata
 */
export declare function geoUrlFor(key: string): string;
