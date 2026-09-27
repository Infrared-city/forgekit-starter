/**
 * The worker half of the SDK worker helper. Call `serveSdkWorker()` once in a
 * module worker file; `createWorkerClient` on the page drives it.
 */
import { InfraredClient } from "../client.js";
import { initializeCore } from "../internal/initialize.js";
import { areaScheduleFromJSON, areaScheduleToJSON } from "../area/schedule.js";
import { serializeError, transferables, } from "./protocol.js";
/** Make this worker serve one `createWorkerClient` on the page. */
export function serveSdkWorker(options = {}) {
    const scope = options.scope ?? globalThis;
    let client;
    let nextToken = 1;
    const tokens = new Map();
    const requestToken = () => new Promise((resolve, reject) => {
        const id = nextToken++;
        tokens.set(id, { resolve, reject });
        scope.postMessage({ type: "token-request", id });
    });
    const init = async (message) => {
        // Idempotent in one realm since #445: a second call with a module of the
        // same build is accepted. A `CoreTerminalError` means: end this worker.
        await initializeCore({ module: message.module });
        const created = new InfraredClient({
            ...message.config,
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(message.getToken ? { getToken: requestToken } : {}),
        });
        scope.postMessage({ type: "ready" });
        return created;
    };
    scope.addEventListener("message", (event) => {
        const message = event.data;
        if (message?.type === "init") {
            client ??= init(message);
            client.catch(() => undefined); // each call reports the failure
        }
        else if (message?.type === "call") {
            void serveCall(message, client);
        }
        else if (message?.type === "token") {
            const waiter = tokens.get(message.id);
            if (waiter === undefined)
                return;
            tokens.delete(message.id);
            if (message.token !== undefined)
                waiter.resolve(message.token);
            else
                waiter.reject(new Error(message.error ?? "getToken failed on the page"));
        }
    });
}
async function serveCall(message, client) {
    const port = message.port;
    const abort = new AbortController();
    port.addEventListener("message", (event) => {
        if (event.data?.type === "abort")
            abort.abort(new DOMException(event.data.reason, "AbortError"));
    });
    port.start();
    const send = (reply, transfer = []) => port.postMessage(reply, transfer);
    try {
        if (client === undefined)
            throw new Error("the SDK worker received a call before init");
        const value = await dispatch(await client, message.op, message.args, abort.signal, send);
        send({ type: "done", value }, transferables(value));
    }
    catch (error) {
        send({ type: "failed", error: serializeError(error) });
    }
    finally {
        port.close();
    }
}
async function dispatch(client, op, args, signal, send) {
    const [first, second, third] = args;
    if (op === "runArea") {
        const { retryFrom, ...options } = third ?? {};
        const schedule = await client.runArea(first, second, {
            ...options,
            ...(retryFrom === undefined ? {} : { retryFrom: areaScheduleFromJSON(retryFrom) }),
            signal,
            onProgress: (state) => send({ type: "progress", state }),
            onAccepted: (jobId, tileKey) => send({ type: "accepted", jobId, tileKey }),
        });
        return areaScheduleToJSON(schedule);
    }
    const options = { ...second, signal };
    if (op === "mergeAreaJobs") {
        return client.mergeAreaJobs(areaScheduleFromJSON(first), options);
    }
    if (op === "mergeSurfaceAreaJobs") {
        return client.mergeSurfaceAreaJobs(areaScheduleFromJSON(first), options);
    }
    if (op === "vegetation.getArea")
        return client.vegetation.getArea(first, options);
    if (op === "groundMaterials.getArea")
        return client.groundMaterials.getArea(first, options);
    if (op === "buildings.getBuildingsInArea")
        return client.buildings.getBuildingsInArea(first, options);
    throw new Error(`unknown SDK worker operation ${String(op)}`);
}
