import { HostNotAllowedError } from "./errors.js";
/**
 * The public data hosts the direct-acquisition paths may read.
 *
 * Program rule: public data URLs come from an allow-list and never carry an
 * API key. Two of these entries are Infrared's own public R2 mirrors and the
 * third is the anonymous Overture bucket. A manifest read from one of them
 * names the object URLs the readers then fetch, so every such URL is checked
 * again here before a request goes out — a compromised or stale manifest
 * cannot redirect a range read at an arbitrary host.
 */
export const ALLOWED_HOSTS = Object.freeze([
    "geo.infrared.city",
    "registry.infrared.city",
    "overturemaps-us-west-2.s3.us-west-2.amazonaws.com",
]);
/** The public R2 mirror the sources registry and the world FGBs live on. */
export const GEO_BASE_URL = "https://geo.infrared.city";
/** True when `url` is https and its host is on the allow-list. */
export function isAllowedUrl(url) {
    let parsed;
    try {
        parsed = url instanceof URL ? url : new URL(url);
    }
    catch {
        return false;
    }
    return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
}
/** Return `url` as a string, or throw when it is not a permitted data URL. */
export function assertAllowedUrl(url) {
    if (!isAllowedUrl(url))
        throw new HostNotAllowedError(String(url));
    return String(url);
}
/**
 * Resolve a registry value (`"vienna-trees-only.fgb"`) to a full URL.
 *
 * Mirrors the utilities-service `registry.r2_url_for`: an absolute URL is
 * kept, a relative key is joined onto the public R2 base. The result is
 * allow-list checked either way.
 */
export function geoUrlFor(key) {
    const url = /^https?:/i.test(key) ? key : `${GEO_BASE_URL}/${key.replace(/^\/+/, "")}`;
    return assertAllowedUrl(url);
}
