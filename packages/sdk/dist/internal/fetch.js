const defaults = new WeakSet();
/** Preserve an injected transport; bind only the browser's native method. */
export function resolveFetch(implementation) {
    if (implementation != null)
        return implementation;
    const native = globalThis.fetch;
    if (typeof native !== "function")
        return undefined;
    const bound = native.bind(globalThis);
    defaults.add(bound);
    return bound;
}
/**
 * True for a `fetch` this module bound, not one a caller passed in. A body
 * request from the SDK's own default goes through the runtime's
 * progress-reporting sender (`body-sender.ts`); a caller's `fetch` is used
 * as given.
 */
export function isDefaultFetch(fetcher) {
    return defaults.has(fetcher);
}
