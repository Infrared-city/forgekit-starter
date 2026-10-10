import type { CoreSource } from "./core.js";
/**
 * Options for `initializeCore()`.
 *
 * Pass at most one of `url`, `bytes` and `module` to choose where the core is loaded
 * from. The Node entry point loads the packaged core when none of them is given.
 *
 * @category Client
 */
export interface InitializeCoreOptions {
    /** URL to fetch the core WebAssembly file from. */
    readonly url?: string | URL;
    /** The bytes of the core WebAssembly file, when you have already loaded them. */
    readonly bytes?: BufferSource;
    /** An already compiled core WebAssembly module. */
    readonly module?: WebAssembly.Module;
    /**
     * Node 22 or later only: run the core on this many threads, using the threaded core that
     * ships in the package (loaded only when this is above 1). Omitted or `1` is the default
     * single-threaded core. Results are identical to the single-threaded core, and facade
     * merges are faster. It cannot be combined with `url`, `bytes` or `module`, and the
     * browser and worker entry points refuse a value above 1.
     *
     * With the threaded core, a failure inside the core on any thread ends the Node process
     * (killed with SIGKILL, which no handler can catch) after writing one JSON line to
     * stderr. The same happens when the core runs out of WebAssembly memory near the 4 GiB
     * limit. With the single-threaded core the same failure is a thrown error instead.
     */
    readonly threads?: number;
}
export declare function resolveCoreSource(options: InitializeCoreOptions): CoreSource | undefined;
