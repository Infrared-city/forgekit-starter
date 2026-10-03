import { CoreInitializationError, CoreNotReadyError, CoreTerminalError } from "./errors.js";
// The required-export list lives in `core-exports.ts` now (D224 CUT 6, the
// 400-line cap); imported for `requireCapabilities()` below and re-exported
// so `tests/required-exports.wasm.test.ts` and every other caller that
// imported it from `core.ts` keep working.
import { REQUIRED_FUNCTION_EXPORTS } from "./core-exports.js";
export { REQUIRED_FUNCTION_EXPORTS } from "./core-exports.js";
let core;
let pending;
let sourceIdentity;
let terminalFailure;
let threadCount = 1;
/** The kernel's thread count: 1 for the serial core, else its pool size (D205). */
export function coreThreads() {
    return threadCount;
}
function terminal(error, message) {
    const failure = new CoreTerminalError(error instanceof CoreInitializationError ? error.message : message, { cause: error });
    terminalFailure = failure;
    return failure;
}
async function compileSource(source) {
    if (source instanceof WebAssembly.Module)
        return source;
    if (typeof source === "string" || source instanceof URL) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new CoreInitializationError(`could not load the Infrared core (HTTP ${response.status})`);
        }
        return WebAssembly.compile(await response.arrayBuffer());
    }
    return WebAssembly.compile(source);
}
function requireCapabilities(output) {
    if (!(output.memory instanceof WebAssembly.Memory)) {
        throw new CoreInitializationError("the Infrared core has no compatible memory export");
    }
    if (!(output.__wbindgen_externrefs instanceof WebAssembly.Table)) {
        throw new CoreInitializationError("the Infrared core has no compatible reference table");
    }
    for (const name of REQUIRED_FUNCTION_EXPORTS) {
        if (typeof output[name] !== "function") {
            throw new CoreInitializationError(`the Infrared core is missing required export ${name}`);
        }
    }
}
async function loadCore(source) {
    const compiled = await compileSource(source.source);
    const module = (source.threaded === undefined
        ? await import("../../generated/infrared-core.js")
        : await source.threaded.glue());
    let output;
    try {
        output = await module.default({ module_or_path: compiled });
    }
    catch (error) {
        throw terminal(error, "the loaded Infrared core failed during initialization");
    }
    try {
        requireCapabilities(output);
        if (module.coreVersion() !== "0.4.0") {
            throw new CoreInitializationError(`incompatible Infrared core version ${module.coreVersion()}`);
        }
    }
    catch (error) {
        throw terminal(error, "the loaded Infrared core failed its capability check");
    }
    if (source.threaded !== undefined)
        await startPool(module, source.threaded.threads);
    core = module;
}
/** Start the threaded core's worker pool; nothing may call the core before. */
async function startPool(module, threads) {
    const threaded = module;
    const init = threaded.initThreadPool;
    const abortOnPanic = threaded.installPanicAbort;
    try {
        if (typeof init !== "function" || typeof abortOnPanic !== "function") {
            throw new CoreInitializationError("the threaded Infrared core has no initThreadPool or installPanicAbort export");
        }
        // A panic on ANY thread, the main one included, ends the process (D205):
        // the threaded core must never be used again after one.
        abortOnPanic();
        await init(threads);
    }
    catch (error) {
        // Not terminal: the threaded core is never used, so the realm may still
        // load the serial core (`initializeCore()`) or try again.
        throw new CoreInitializationError("the threaded Infrared core could not start its worker threads", { cause: error });
    }
    threadCount = threads;
}
export function initializeCoreSource(source) {
    if (terminalFailure !== undefined) {
        return Promise.reject(terminalFailure);
    }
    // A realm holds ONE core. Once it is loaded and has passed the version and
    // capability checks, a later call is satisfied whatever source it names:
    // any other source would have to pass the same checks to be accepted. A
    // worker that serves a second request gets a NEW `WebAssembly.Module`
    // object from every `postMessage`, so an identity check refused a correct
    // second call ("already initialized from another source"). A compiled
    // module is still checked for the exports this SDK calls, which costs no
    // instantiation, so a module of another build is refused, not ignored.
    if (core !== undefined) {
        // A realm holds ONE core, so a thread count other than the loaded one
        // cannot be honoured; say so rather than run on a different count.
        if (source?.threaded !== undefined && source.threaded.threads !== threadCount) {
            return Promise.reject(new CoreInitializationError(`the Infrared core is already initialized with ${threadCount} thread(s)`));
        }
        if (source?.source instanceof WebAssembly.Module && source.identity !== sourceIdentity) {
            const names = new Set(WebAssembly.Module.exports(source.source).map((entry) => entry.name));
            const missing = REQUIRED_FUNCTION_EXPORTS.find((name) => !names.has(name));
            if (missing !== undefined) {
                return Promise.reject(new CoreInitializationError(`the Infrared core is already initialized; the other module is missing export ${missing}`));
            }
        }
        // A URL or byte source is NOT compiled again to check it: the generated
        // glue and its wasm ship as one pair, and the loaded core already passed
        // the pinned version check, so resolving is safe and costs nothing.
        return Promise.resolve();
    }
    if (source === undefined) {
        return Promise.reject(new CoreInitializationError("a URL, byte buffer, or compiled module is required"));
    }
    if (pending !== undefined) {
        if (source.identity === sourceIdentity)
            return pending;
        // Wait for the load in progress, then run this caller's source through
        // the same rules: the post-load check on success, its own load on failure.
        return pending.then(() => initializeCoreSource(source), () => initializeCoreSource(source));
    }
    sourceIdentity = source.identity;
    pending = loadCore(source).catch((error) => {
        if (terminalFailure === undefined) {
            pending = undefined;
            sourceIdentity = undefined;
        }
        throw error;
    });
    return pending;
}
export function requireCore() {
    if (core === undefined)
        throw new CoreNotReadyError();
    return core;
}
