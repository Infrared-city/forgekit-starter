export { REQUIRED_FUNCTION_EXPORTS } from "./core-exports.js";
export type WasmCore = typeof import("../../generated/infrared-core.js");
export interface CoreSource {
    readonly source: string | URL | BufferSource | WebAssembly.Module;
    readonly identity: object | string;
    /**
     * The threaded Node core (D205): its own glue module, and the size of
     * the pool to start before the core is used. Absent for the serial core.
     */
    readonly threaded?: {
        readonly glue: () => Promise<unknown>;
        readonly threads: number;
    };
}
/** The kernel's thread count: 1 for the serial core, else its pool size (D205). */
export declare function coreThreads(): number;
export declare function initializeCoreSource(source?: CoreSource): Promise<void>;
export declare function requireCore(method?: string): WasmCore;
/** The core's own `WebAssembly.Memory` (perf/ts-facade-layout-views): lets a
 * caller holding a zero-copy typed-array view onto the core's buffers detect
 * a wasm memory GROW (`view.buffer !== requireCoreMemory().buffer`) and
 * re-fetch a fresh view instead of reading a detached `ArrayBuffer`. */
export declare function requireCoreMemory(): WebAssembly.Memory;
/** Called once by the Node entry point; see {@link ensureCore}. */
export declare function registerPackagedCoreLoader(load: () => Promise<void>): void;
/**
 * Loads the core for a caller that does not already hold one ready, so a
 * geodata read works without a prior `initializeCore()` call in Node, the
 * one realm with a packaged core to fall back to.
 *
 * A browser or worker realm has no packaged core, so this throws a clear
 * instruction instead: a page cannot guess its own core's URL, and a worker
 * does not share the main thread's core.
 */
export declare function ensureCore(method: string): Promise<void>;
