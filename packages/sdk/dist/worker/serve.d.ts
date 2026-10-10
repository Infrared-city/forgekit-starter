import type { GeometryUrlStore } from "../internal/geometry-url-store.js";
import type { FetchLike } from "../internal/transport.js";
/**
 * The worker global, or any object with the same two members.
 *
 * @category Worker
 */
export interface WorkerScope {
    /** Sends a message to the page, optionally transferring objects. */
    postMessage(message: unknown, transfer?: Transferable[]): void;
    /** Listens for messages from the page. */
    addEventListener(type: "message", listener: (event: MessageEvent) => void): void;
}
/**
 * Options for `serveSdkWorker`.
 *
 * @category Worker
 */
export interface ServeSdkWorkerOptions {
    /**
     * The `fetch` the SDK client uses in this worker, for example a proxy that
     * rewrites storage URLs. It must pass `init.signal` on to the request it
     * makes: the SDK aborts a request through that signal, and a fetch that
     * drops it keeps a cancelled request running.
     */
    readonly fetch?: FetchLike;
    /**
     * The `geometryUrlStore` of the SDK client in this worker (a function
     * cannot go through `postMessage`). Use a store that the next worker can
     * read too, for example IndexedDB.
     */
    readonly geometryUrlStore?: GeometryUrlStore;
    /** The worker global to listen on. Defaults to `self`. */
    readonly scope?: WorkerScope;
}
/**
 * Makes this worker serve the `createWorkerClient` on the page. Call it once, in the module
 * worker file.
 *
 * @example
 * ```ts
 * // sdk.worker.ts
 * import { serveSdkWorker } from "@infrared-city/infrared-sdk/worker";
 * serveSdkWorker();
 * ```
 *
 * @param options - A custom `fetch` for the SDK client, and the scope to listen on.
 * @category Worker
 */
export declare function serveSdkWorker(options?: ServeSdkWorkerOptions): void;
