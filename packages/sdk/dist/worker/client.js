/**
 * The page half of the SDK worker helper: one SDK client in ONE dedicated
 * worker. The helper has no pool, no worker count, no retry and no
 * persistence; the application owns those. It never sends a call again.
 */
import { areaScheduleFromJSON, areaScheduleToJSON } from "../area/schedule.js";
import { restoreError, } from "./protocol.js";
/** Workers that already serve a client: one client per worker, never two. */
const bound = new WeakSet();
/**
 * The worker ended while calls were open.
 *
 * - `load`: the worker failed before it was ready. No call started work,
 *   so nothing was sent.
 * - `lost`: every other case, including `dispose()` during a call. The jobs
 *   in `acceptedJobIds` were accepted (the ids that `onAccepted` reported
 *   for this call and the page received before the loss; an id still in
 *   flight can be missing). Every other tile of a `runArea` call is
 *   UNCERTAIN: its POST may have reached the server. Do not send them again
 *   automatically.
 */
export class WorkerLostError extends Error {
    reason;
    acceptedJobIds;
    name = "WorkerLostError";
    constructor(reason, acceptedJobIds, message = reason === "load" ? "the SDK worker failed to load" : "the SDK worker ended during a call") {
        super(message);
        this.reason = reason;
        this.acceptedJobIds = acceptedJobIds;
    }
}
function observe(callback) {
    try {
        callback();
    }
    catch {
        // An observer error must not end the call: the worker still owns the run.
    }
}
function abortReason(signal) {
    const reason = signal.reason;
    return typeof reason?.message === "string" ? reason.message : "aborted";
}
/** Serve one SDK client from a dedicated worker. See `docs/sdk-execution.md`. */
export function createWorkerClient(options) {
    const { worker, getToken } = options;
    // A second client would answer the first one's token requests with its
    // own credentials: one worker serves one client (one signed-in session).
    if (bound.has(worker))
        throw new TypeError("this worker already serves an SDK worker client");
    bound.add(worker);
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
        type: "init", module: options.module, config: options.config ?? {}, getToken: getToken !== undefined,
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
            return call("runArea", [input, polygon, sent], { signal, onProgress, onAccepted }, (value) => areaScheduleFromJSON(value));
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
