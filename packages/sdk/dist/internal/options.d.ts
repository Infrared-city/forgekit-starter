import type { CoreSource } from "./core.js";
export interface InitializeCoreOptions {
    readonly url?: string | URL;
    readonly bytes?: BufferSource;
    readonly module?: WebAssembly.Module;
    /**
     * Node 22 or later only (D205): run the kernel on this many threads, from
     * the packaged threaded core (`generated-threads/`, loaded only when this
     * is above 1). Absent or `1` is the default serial core. A threaded result
     * is byte-identical to the serial one; a facade merge is faster. It takes
     * no `url`, `bytes` or `module`, and the browser and worker entries refuse
     * a value above 1.
     *
     * A kernel failure on a pool thread ENDS THE PROCESS (SIGKILL, which no handler can
     * catch) with one JSON line on stderr: the threaded build aborts on a
     * panic, and the main thread, blocked in the kernel call, could otherwise
     * only hang. The same holds for a panic on the main thread during a kernel
     * call, and for running out of WebAssembly memory near the 4 GiB limit on
     * any thread. On the serial core the same failure is a thrown error.
     */
    readonly threads?: number;
}
export declare function resolveCoreSource(options: InitializeCoreOptions): CoreSource | undefined;
