// Maintainer note (not published): the public colour registry document: fetch,
// allow-list, cache. Split out of `images.ts` so the rendering module stays inside the
// 400-line rule. The network rules live in ONE place here: HTTPS on an allow-listed
// host, no credentials, redirects refused, and a declared body cap.
import { cancelBody, readCappedBody } from "./capped-body.js";
import { Deadline } from "./deadline.js";
import { resolveFetch } from "./fetch.js";
/**
 * The address of the public registry document that colour configurations are read from.
 * It is served over HTTPS and needs no credentials.
 *
 * @category Results and legend
 */
// Maintainer note (not published): this is the public R2 mirror of the models registry.
export const REGISTRY_URL = "https://registry.infrared.city/models/latest.json";
// Maintainer note (not published): hosts this module will fetch colour configuration
// from. A prefix check on `https://` is not a host check: `https://evil.example/`
// passes it. The `url` override exists for tests and for a pinned document, not for
// pointing the renderer at somebody else's server, so it goes through the same gate.
const ALLOWED_HOSTS = ["registry.infrared.city"];
// Registry documents change with a release, not per request: re-read after
// fifteen minutes (Python twin `layers/_registry.py` uses the same value).
const DEFAULT_TTL_MS = 15 * 60 * 1000;
// Maintainer note (not published): total time for one registry read, body included.
// The module had no timeout at all: a mirror that answered and then stalled held a
// render open with no end. One deadline covers the answer and the body, as the geodata
// reader does.
const DEFAULT_TIMEOUT_MS = 30_000;
/**
 * The largest registry document, in bytes, that the SDK will read (8 MiB). A larger
 * answer is refused with a `RegistryFetchError`.
 *
 * @category Results and legend
 */
// Maintainer note (not published): the live document is under 1 MB. The cap keeps a
// wrong or hostile answer from buffering an unbounded body in a browser tab.
export const MAX_REGISTRY_BYTES = 8 * 1024 * 1024;
/**
 * Thrown when the colour registry could not be fetched or its answer was not usable:
 * a URL that is not HTTPS on the registry host, a redirect, an HTTP error, a timeout or
 * abort, a body that is too large or not JSON, or a document without colour configurations.
 *
 * @category Errors
 */
export class RegistryFetchError extends Error {
    name = "RegistryFetchError";
}
// Maintainer note (not published): freeze a plain JSON tree in place. The cache hands
// the SAME object to every caller, so one caller mutating a config would silently
// change every later render in the process. Freezing is cheaper than copying per call
// and turns that into a visible failure.
function deepFreeze(value) {
    if (typeof value !== "object" || value === null || Object.isFrozen(value))
        return value;
    for (const inner of Object.values(value))
        deepFreeze(inner);
    return Object.freeze(value);
}
let cache;
/**
 * Drop the cached registry document, so the next read fetches it again. Useful in tests,
 * or when you know a new registry release is out.
 *
 * @category Results and legend
 */
export function clearRegistryCache() {
    cache = undefined;
}
// Maintainer note (not published): reject anything that is not HTTPS on an allow-listed host.
function assertAllowedRegistryUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new RegistryFetchError(`registry URL is not a URL: ${url}`);
    }
    if (parsed.protocol !== "https:") {
        throw new RegistryFetchError(`registry URL must be https, got ${parsed.protocol}`);
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        throw new RegistryFetchError(`registry host ${parsed.hostname} is not allow-listed ` +
            `(allowed: ${ALLOWED_HOSTS.join(", ")})`);
    }
}
function userAgent() {
    // Chromium drops this header, but WebKit can send it. The public mirror
    // must allow it in CORS as well as accepting Node and Worker requests.
    return "infrared-sdk-ts (+https://infrared.city) registry-colors";
}
// Maintainer note (not published): refuse a redirect before the body is read. A 3xx
// from an allow-listed host would carry the request to any host at all, which is what
// the allow-list exists to prevent; `redirect: "error"` stops the real transport, and
// this check stops a caller's own `fetch` that answers the redirect instead of refusing it.
function assertNotRedirect(response) {
    if (response.status >= 300 && response.status < 400) {
        cancelBody(response);
        throw new RegistryFetchError(`colour registry redirect refused (HTTP ${response.status})`);
    }
}
// Maintainer note (not published): read the document under `MAX_REGISTRY_BYTES`, then
// parse it. `response.json()` reads the whole body first and asks about its size after,
// which is no limit at all. The capped reader stops at the cap while the body arrives,
// so a wrong or hostile answer cannot fill a browser tab.
async function readDocument(response) {
    const bytes = await readCappedBody(response, {
        cap: MAX_REGISTRY_BYTES,
        fail: (detail) => new RegistryFetchError(`the colour registry document ${detail}`),
    });
    try {
        return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    }
    catch (error) {
        throw new RegistryFetchError(`colour registry document is not JSON: ${String(error)}`, { cause: error });
    }
}
// Maintainer note (not published): name the reason the read ended: the deadline knows it, the error does not.
function stopDetail(error, deadline, timeoutMs) {
    const stopped = deadline.reason();
    if (stopped === "timeout") {
        return `the colour registry did not answer within ${timeoutMs} ms`;
    }
    if (stopped === "aborted")
        return "the caller aborted the colour registry read";
    return `could not fetch the colour registry: ${String(error)}`;
}
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
export async function fetchVisualConfigurations(options = {}) {
    const url = options.url ?? REGISTRY_URL;
    const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const isDefault = url === REGISTRY_URL;
    if (isDefault && cache !== undefined && Date.now() - cache.fetchedAt < ttlMs) {
        return { configurations: cache.configurations, version: cache.version };
    }
    assertAllowedRegistryUrl(url);
    const call = resolveFetch(options.fetch);
    if (typeof call !== "function") {
        throw new RegistryFetchError("no fetch implementation is available");
    }
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const deadline = new Deadline(options.signal, timeoutMs);
    let document;
    try {
        const response = await deadline.wait(() => call(url, {
            headers: { Accept: "application/json", "User-Agent": userAgent() },
            redirect: "error",
            signal: deadline.controller.signal,
        }));
        assertNotRedirect(response);
        if (!response.ok) {
            cancelBody(response);
            throw new RegistryFetchError(`could not fetch the colour registry (HTTP ${response.status})`);
        }
        document = await deadline.wait(() => readDocument(response));
    }
    catch (error) {
        if (error instanceof RegistryFetchError)
            throw error;
        throw new RegistryFetchError(stopDetail(error, deadline, timeoutMs), { cause: error });
    }
    finally {
        // Clears the timer and removes the listener the caller's signal got.
        deadline.close();
    }
    if (typeof document !== "object" || document === null) {
        throw new RegistryFetchError("colour registry document is not a JSON object");
    }
    const record = document;
    const configurations = record["visualConfigurations"];
    if (typeof configurations !== "object" || configurations === null) {
        throw new RegistryFetchError("colour registry has no `visualConfigurations` object");
    }
    const rawVersion = record["version"];
    const resolved = deepFreeze({
        configurations: configurations,
        version: typeof rawVersion === "string" ? rawVersion : null,
    });
    if (isDefault)
        cache = { ...resolved, fetchedAt: Date.now() };
    return resolved;
}
