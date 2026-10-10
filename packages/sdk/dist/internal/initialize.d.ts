import { type InitializeCoreOptions } from "./options.js";
/**
 * Load and initialise the Infrared core (a WebAssembly module) used by the SDK's
 * local computation.
 *
 * Wait for it to finish before using operations that run in the core. Once it has
 * succeeded, later calls resolve immediately. This entry point needs one core source
 * (`url`, `bytes` or `module`); the Node entry point can also load the packaged core
 * when none is given.
 *
 * @param options - Where to load the core from; see `InitializeCoreOptions`.
 * @returns A promise that resolves when the core is ready.
 * @throws {CoreInitializationError} If the core cannot be loaded or the options are invalid.
 * @throws {CoreTerminalError} If the core loaded but failed its version check.
 * @category Client
 */
export declare function initializeCore(options?: InitializeCoreOptions): Promise<void>;
