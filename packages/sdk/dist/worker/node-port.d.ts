/**
 * A `node:worker_threads` `Worker`, or any object with the same members.
 *
 * @category Worker
 */
export interface NodeWorkerLike {
    /** Sends a message to the worker, optionally transferring objects. */
    postMessage(message: unknown, transfer?: readonly never[] | readonly unknown[]): void;
    /** Listens for the worker's `message`, `messageerror`, `error` and `exit` events. */
    on(type: "message" | "messageerror" | "error" | "exit", listener: (value: never) => void): unknown;
    /** Ends the worker. */
    terminate(): unknown;
}
/**
 * The `node:worker_threads` `parentPort`, or any object with the same members.
 *
 * @category Worker
 */
export interface NodePortLike {
    /** Sends a message to the page, optionally transferring objects. */
    postMessage(message: unknown, transfer?: readonly never[] | readonly unknown[]): void;
    /** Listens for messages from the page. */
    on(type: "message", listener: (value: never) => void): unknown;
}
/** The page side: a Node `Worker` as a `WorkerLike`. */
export declare function adaptNodeWorker<T extends object>(worker: T): T;
/** The worker side: Node's `parentPort` as a `WorkerScope`. */
export declare function adaptNodePort<T extends object>(port: T): T;
