/** Preserve an injected transport; bind only the browser's native method. */
export declare function resolveFetch(implementation?: typeof fetch): typeof fetch | undefined;
