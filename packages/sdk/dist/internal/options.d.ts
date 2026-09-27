import type { CoreSource } from "./core.js";
export interface InitializeCoreOptions {
    readonly url?: string | URL;
    readonly bytes?: BufferSource;
    readonly module?: WebAssembly.Module;
}
export declare function resolveCoreSource(options: InitializeCoreOptions): CoreSource | undefined;
