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
     * Node only: the number of core threads. Omitted: on Node 22 or later, `min(4, cores)` (8 from 16 cores)
     * threads with the threaded core that ships in the package (one thread on Node 18 and
     * 20, on one core, or when the pool does not start); `1`: the single-threaded core;
     * above 1: that many threads (Node 22 or later). Results are identical for every count;
     * the pool decodes and merges result tiles, zips request bodies and prepares the site.
     * A count cannot be combined with `url`, `bytes` or `module`, and the browser and
     * worker entry points refuse a value above 1.
     *
     * With the threaded core, a core error on any thread is a thrown error. Running out of
     * WebAssembly memory near the 4 GiB limit cannot be caught: it ends the Node process
     * (SIGKILL) after writing one JSON line to stderr.
     */
    readonly threads?: number;
}
export declare function resolveCoreSource(options: InitializeCoreOptions): CoreSource | undefined;
