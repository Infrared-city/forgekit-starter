/** Preserve an injected transport; bind only the browser's native method. */
export function resolveFetch(implementation) {
    if (implementation != null)
        return implementation;
    const native = globalThis.fetch;
    return typeof native === "function" ? native.bind(globalThis) : undefined;
}
