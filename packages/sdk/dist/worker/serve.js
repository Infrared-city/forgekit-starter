// Maintainer note (not published): The worker half of the SDK worker helper. Call
// `serveSdkWorker()` once in a module worker file; `createWorkerClient` on the page drives it.
import { InfraredClient } from "../client.js";
import { loadPackagedCore } from "../internal/core.js";
import { initializeCore } from "../internal/initialize.js";
import { areaScheduleFromJSON, areaScheduleToJSON } from "../area/schedule.js";
import { adaptNodePort } from "./node-port.js";
import { serializeError, transferables, } from "./protocol.js";
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
export function serveSdkWorker(options = {}) {
    const scope = adaptNodePort((options.scope ?? globalThis));
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
        // `threads` (Node): the packaged threaded core, so the run uses the pool (D205).
        // No `module` (Node): the packaged core, with its default threads.
        if (message.module === undefined || (message.threads !== undefined && message.threads !== 1)) {
            await loadPackagedCore(message.threads);
        }
        else
            await initializeCore({ module: message.module });
        const created = new InfraredClient({
            ...message.config,
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(options.geometryUrlStore === undefined ? {} : { geometryUrlStore: options.geometryUrlStore }),
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
    // `runAreaStream`: the page took an item; the next one may cross.
    let taken = 0;
    let wakeTaken = () => { };
    port.addEventListener("message", (event) => {
        if (event.data?.type === "abort")
            abort.abort(new DOMException(event.data.reason, "AbortError"));
        if (event.data?.type === "taken")
            taken += 1;
        wakeTaken();
    });
    const pageTook = async () => {
        while (taken === 0 && !abort.signal.aborted)
            await new Promise((resolve) => { wakeTaken = resolve; });
        taken = Math.max(0, taken - 1);
    };
    port.start();
    const send = (reply, transfer = []) => port.postMessage(reply, transfer);
    try {
        if (client === undefined)
            throw new Error("the SDK worker received a call before init");
        const value = await dispatch(await client, message.op, message.args, abort.signal, send, pageTook);
        send({ type: "done", value }, transferables(value));
    }
    catch (error) {
        send({ type: "failed", error: serializeError(error) });
    }
    finally {
        port.close();
    }
}
async function dispatch(client, op, args, signal, send, pageTook) {
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
        return Array.isArray(schedule) ? schedule.map(areaScheduleToJSON) : areaScheduleToJSON(schedule);
    }
    if (op === "runAreaStream") {
        // Each analysis goes to the page as it finishes; its buffers are transferred, not copied.
        // The next one is pulled only when the page took this one: the engine's canvas limit
        // then bounds the page's memory too.
        for await (const item of client.runAreaStream(first, second, {
            ...third, signal,
            onProgress: (state) => send({ type: "progress", state }),
            onAccepted: (jobId, tileKey) => send({ type: "accepted", jobId, tileKey }),
        })) {
            const { index, analysisType } = item;
            if (item.error !== undefined)
                send({ type: "item", index, analysisType, error: serializeError(item.error) });
            else
                send({ type: "item", index, analysisType, result: item.result }, transferables(item.result));
            await pageTook();
        }
        return undefined;
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
