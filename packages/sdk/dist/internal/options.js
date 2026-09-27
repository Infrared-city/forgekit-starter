import { CoreInitializationError } from "./errors.js";
export function resolveCoreSource(options) {
    const supplied = [options.url, options.bytes, options.module].filter((value) => value !== undefined);
    if (supplied.length > 1) {
        throw new CoreInitializationError("initializeCore accepts exactly one core source");
    }
    if (options.url !== undefined) {
        const value = options.url instanceof URL ? options.url : new URL(options.url);
        return { source: value, identity: value.href };
    }
    if (options.bytes !== undefined) {
        return { source: options.bytes, identity: options.bytes };
    }
    if (options.module !== undefined) {
        return { source: options.module, identity: options.module };
    }
    return undefined;
}
