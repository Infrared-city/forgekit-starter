// Maintainer note (not published): The page half of the SDK worker helper: one SDK client
// in ONE dedicated worker. The helper has no pool, no worker count, no retry and no
// persistence; the application owns those. It never sends a call again.
import { areaScheduleFromJSON, areaScheduleToJSON } from "../area/schedule.js";
import { restoreError, } from "./protocol.js";
import { adaptNodeWorker } from "./node-port.js";
import { abortReason, observe, workerStream } from "./stream.js";
import { WorkerLostError } from "./lost-error.js";
export { WorkerLostError };
/** Workers that already serve a client: one client per worker, never two. */
const bound = new WeakSet();
/**
 * Creates an SDK client that runs in one dedicated worker.
 *
 * One worker serves one client; the helper has no pool, no retry and no persistence, and it
 * never sends a call again. The worker file must call `serveSdkWorker()`. Errors cross the
 * worker boundary as plain `Error` objects: check `error.name`, not `instanceof`.
 * `getToken` is called per request with no session binding, so use one worker per signed-in
 * session and dispose the client on sign-out.
 *
 * In Node, pass a `node:worker_threads` `Worker` (no adapter, no `module`) and `threads` for
 * the threaded core; the worker file calls `serveSdkWorker()`, which listens on `parentPort`.
 *
 * @example
 * ```ts
 * // sdk.worker.ts
 * import { serveSdkWorker } from "@infrared-city/infrared-sdk/worker";
 * serveSdkWorker();
 *
 * // page
 * import { createWorkerClient } from "@infrared-city/infrared-sdk/worker";
 * const sdk = createWorkerClient({
 *   worker: new Worker(new URL("./sdk.worker.ts", import.meta.url), { type: "module" }),
 *   module, // a WebAssembly.Module compiled once on the page
 *   getToken,
 * });
 * const schedule = await sdk.runArea(input, polygon, {
 *   onAccepted: (jobId, tileKey) => saveJobId(jobId, tileKey),
 * });
 * const result = await sdk.mergeAreaJobs(schedule);
 * sdk.dispose();
 * ```
 *
 * @param options - The worker, the compiled SDK core, the cloneable client config and an
 * optional token callback.
 * @returns The worker client.
 * @throws {TypeError} When the worker already serves a client.
 * @category Worker
 */
// Maintainer note (not published): See `docs/sdk-execution.md`.
export function createWorkerClient(options) {
    const { getToken } = options;
    const worker = adaptNodeWorker(options.worker);
    // A second client would answer the first one's token requests with its
    // own credentials: one worker serves one client (one signed-in session).
    if (bound.has(options.worker))
        throw new TypeError("this worker already serves an SDK worker client");
    bound.add(options.worker);
    const open = new Set();
    let ready = false;
    let closed = false;
    const end = (error) => {
        if (closed)
            return;
        closed = true;
        worker.terminate();
        for (const call of [...open])
            call.fail(error(call));
    };
    worker.addEventListener("error", (event) => {
        event.preventDefault();
        // Any accepted job proves the worker was working, whatever the order
        // of the two channels.
        const started = ready || [...open].some((call) => call.accepted.length > 0);
        end((call) => new WorkerLostError(started ? "lost" : "load", [...call.accepted]));
    });
    // A message that cannot be deserialized would leave a call open for ever:
    // treat it as a lost worker.
    const undeliverable = () => {
        end((call) => new WorkerLostError("lost", [...call.accepted], "an SDK worker message could not be read"));
    };
    worker.addEventListener("messageerror", undeliverable);
    worker.addEventListener("message", (event) => {
        const message = event.data;
        if (message?.type === "ready")
            ready = true;
        if (message?.type !== "token-request" || closed)
            return;
        const reply = (fields) => {
            if (!closed)
                worker.postMessage({ type: "token", id: message.id, ...fields });
        };
        if (getToken === undefined) {
            reply({ error: "createWorkerClient has no getToken" });
            return;
        }
        Promise.resolve()
            .then(getToken)
            .then((token) => reply({ token }), (error) => reply({ error: String(error) }));
    });
    worker.postMessage({
        type: "init", ...(options.module === undefined ? {} : { module: options.module }), config: options.config ?? {}, getToken: getToken !== undefined,
        ...(options.threads === undefined ? {} : { threads: options.threads }),
    });
    function call(op, args, hooks, decode) {
        if (closed)
            return Promise.reject(new Error("the SDK worker client is closed; create a new one"));
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const port = channel.port1;
            const signal = hooks.signal;
            const onAbort = () => port.postMessage({ type: "abort", reason: abortReason(signal) });
            const entry = {
                accepted: [],
                fail: (error) => finish(() => reject(error)),
            };
            const finish = (settle) => {
                if (!open.delete(entry))
                    return;
                signal?.removeEventListener("abort", onAbort);
                port.close();
                settle();
            };
            port.addEventListener("message", (event) => {
                const message = event.data;
                if (message.type === "progress") {
                    observe(() => hooks.onProgress?.(message.state));
                }
                else if (message.type === "accepted") {
                    entry.accepted.push(message.jobId);
                    observe(() => hooks.onAccepted?.(message.jobId, message.tileKey));
                }
                else if (message.type === "item") {
                    hooks.onItem?.(message, () => port.postMessage({ type: "taken" }));
                }
                else if (message.type === "done") {
                    finish(() => {
                        try {
                            resolve(decode(message.value));
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                }
                else if (message.type === "failed") {
                    finish(() => reject(restoreError(message.error)));
                }
            });
            port.addEventListener("messageerror", undeliverable);
            port.start();
            open.add(entry);
            try {
                worker.postMessage({ type: "call", op, args, port: channel.port2 }, [channel.port2]);
            }
            catch (error) {
                // For example a DataCloneError: an argument holds a function. Nothing was sent.
                entry.fail(error);
                return;
            }
            if (signal?.aborted)
                onAbort();
            else
                signal?.addEventListener("abort", onAbort, { once: true });
        });
    }
    const same = (value) => value;
    const plain = (value) => {
        const { signal, ...rest } = value ?? {};
        return { rest, hooks: { signal } };
    };
    return {
        runArea(input, polygon, runOptions = {}) {
            const { signal, onProgress, onAccepted, retryFrom, ...rest } = runOptions;
            const sent = { ...rest, ...(retryFrom === undefined ? {} : { retryFrom: areaScheduleToJSON(retryFrom) }) };
            return call("runArea", [input, polygon, sent], { signal, onProgress, onAccepted }, (value) => (Array.isArray(value) ? value.map((one) => areaScheduleFromJSON(one))
                : areaScheduleFromJSON(value)));
        },
        runAreaStream(inputs, polygon, streamOptions = {}) {
            if (streamOptions.retryFrom !== undefined)
                throw new TypeError("runAreaStream takes no retryFrom; use runArea");
            const { signal, onProgress, onAccepted, ...rest } = streamOptions;
            return workerStream((onItem, inner) => call("runAreaStream", [inputs, polygon, rest], { signal: inner, onProgress, onAccepted, onItem }, same), signal);
        },
        mergeAreaJobs(schedule, mergeOptions) {
            const { rest, hooks } = plain(mergeOptions);
            return call("mergeAreaJobs", [areaScheduleToJSON(schedule), rest], hooks, (same));
        },
        mergeSurfaceAreaJobs(schedule, mergeOptions) {
            const { rest, hooks } = plain(mergeOptions);
            return call("mergeSurfaceAreaJobs", [areaScheduleToJSON(schedule), rest], hooks, (same));
        },
        vegetation: {
            getArea(polygon, readOptions) {
                const { rest, hooks } = plain(readOptions);
                return call("vegetation.getArea", [polygon, rest], hooks, (same));
            },
        },
        groundMaterials: {
            getArea(polygon, readOptions) {
                const { rest, hooks } = plain(readOptions);
                return call("groundMaterials.getArea", [polygon, rest], hooks, (same));
            },
        },
        buildings: {
            getBuildingsInArea(polygon, readOptions) {
                const { rest, hooks } = plain(readOptions);
                return call("buildings.getBuildingsInArea", [polygon, rest], hooks, (same));
            },
        },
        dispose() {
            end((entry) => new WorkerLostError("lost", [...entry.accepted], "the SDK worker client was disposed"));
        },
    };
}
