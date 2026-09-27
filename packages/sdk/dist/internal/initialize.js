import { initializeCoreSource } from "./core.js";
import { resolveCoreSource } from "./options.js";
/** Initialise the ESM core shared by the public entry points. */
export function initializeCore(options = {}) {
    return initializeCoreSource(resolveCoreSource(options));
}
