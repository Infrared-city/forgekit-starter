/** Preserve an injected transport; bind only the browser's native method. */
export declare function resolveFetch(implementation?: typeof fetch): typeof fetch | undefined;
/**
 * True for a `fetch` this module bound, not one a caller passed in. A body
 * request from the SDK's own default goes through the runtime's
 * progress-reporting sender (`body-sender.ts`); a caller's `fetch` is used
 * as given.
 */
export declare function isDefaultFetch(fetcher: typeof fetch): boolean;
