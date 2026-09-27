/**
 * The worker half of the SDK worker helper. Call `serveSdkWorker()` once in a
 * module worker file; `createWorkerClient` on the page drives it.
 */
import type { FetchLike } from "../internal/transport.js";
/** The worker global, or any port with the same two members (tests). */
export interface WorkerScope {
    postMessage(message: unknown, transfer?: Transferable[]): void;
    addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
}
export interface ServeSdkWorkerOptions {
    /**
     * The `fetch` the SDK client uses in this worker, for example a proxy that
     * rewrites storage URLs. It MUST pass `init.signal` on to the request it
     * makes: the SDK aborts a request through that signal, and a fetch that
     * drops it keeps a cancelled request running.
     */
    readonly fetch?: FetchLike;
    /** Defaults to the worker global (`self`). */
    readonly scope?: WorkerScope;
}
/** Make this worker serve one `createWorkerClient` on the page. */
export declare function serveSdkWorker(options?: ServeSdkWorkerOptions): void;
