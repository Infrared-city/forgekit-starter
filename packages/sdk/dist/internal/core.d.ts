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
export declare function requireCore(): WasmCore;
