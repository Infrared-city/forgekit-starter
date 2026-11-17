// Maintainer note (not published): The Node half of the worker helper (#923 follow-up). A
// `node:worker_threads` `Worker` and `parentPort` listen with `on`, not
// `addEventListener`. These two functions give them the shape the helper uses. Objects that
// already have `addEventListener` (browser workers, `MessagePort`) pass through unchanged.
const isNodeStyle = (value) => typeof value.addEventListener !== "function"
    && typeof value.on === "function";
/** The page side: a Node `Worker` as a `WorkerLike`. */
export function adaptNodeWorker(worker) {
    if (!isNodeStyle(worker))
        return worker;
    const node = worker;
    return {
        postMessage: (message, transfer) => node.postMessage(message, transfer),
        addEventListener(type, listener) {
            // A worker can end with no `error` event (`process.exit()`, `terminate()`): Node only
            // emits `exit`. The helper takes that as a lost worker, like an `error`.
            if (type === "error") {
                node.on("exit", (() => listener({ error: new Error("the SDK worker exited"), preventDefault() { } })));
            }
            node.on(type, ((value) => {
                // Node passes the message itself, or the Error; the helper reads `event.data`
                // and calls `event.preventDefault()`.
                listener((type === "message"
                    ? { data: value }
                    : { error: value, preventDefault() { } }));
            }));
        },
        terminate: () => { void node.terminate(); },
    };
}
/** The worker side: Node's `parentPort` as a `WorkerScope`. */
export function adaptNodePort(port) {
    if (!isNodeStyle(port))
        return port;
    const node = port;
    return {
        postMessage: (message, transfer) => node.postMessage(message, transfer),
        addEventListener(_type, listener) {
            node.on("message", ((data) => listener({ data })));
        },
    };
}
