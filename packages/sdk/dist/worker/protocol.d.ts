import type { InfraredClientConfig } from "../client.js";
import type { AreaScheduleJSON } from "../area/schedule-types.js";
/**
 * The name of an operation the page can ask the worker to run.
 *
 * @category Worker
 */
export type WorkerOperation = "runArea" | "mergeAreaJobs" | "mergeSurfaceAreaJobs" | "vegetation.getArea" | "groundMaterials.getArea" | "buildings.getBuildingsInArea";
/**
 * The part of `InfraredClientConfig` that can cross to a worker: no
 * functions. Give `getToken` to `createWorkerClient` and `fetch` to
 * `serveSdkWorker`; a logger stays the worker's default.
 *
 * @category Worker
 */
export type WorkerClientConfig = Omit<InfraredClientConfig, "getToken" | "auth" | "fetch" | "logger" | "onGeometryReuseProbe">;
/**
 * A message from the page to the worker: `init`, `call` or `token`.
 *
 * @category Worker
 */
export type PageMessage = {
    readonly type: "init";
    readonly module: WebAssembly.Module;
    readonly config: WorkerClientConfig;
    readonly getToken: boolean;
} | {
    readonly type: "call";
    readonly op: WorkerOperation;
    readonly args: unknown[];
    readonly port: MessagePort;
} | {
    readonly type: "token";
    readonly id: number;
    readonly token?: string;
    readonly error?: string;
};
/**
 * A message from the worker to the page: `ready` or `token-request`.
 *
 * @category Worker
 */
export type WorkerMessage = {
    readonly type: "ready";
} | {
    readonly type: "token-request";
    readonly id: number;
};
/**
 * A message from the worker on a call's own channel: `progress`, `accepted`, `done` or
 * `failed`.
 *
 * @category Worker
 */
export type CallMessage = {
    readonly type: "progress";
    readonly state: unknown;
} | {
    readonly type: "accepted";
    readonly jobId: string;
    readonly tileKey: string;
} | {
    readonly type: "done";
    readonly value: unknown;
} | {
    readonly type: "failed";
    readonly error: SerializedError;
};
/**
 * The message the page sends on a call's channel to abort that call.
 *
 * @category Worker
 */
export interface AbortMessage {
    /** Always `"abort"`. */
    readonly type: "abort";
    /** The abort reason's message. */
    readonly reason: string;
}
/**
 * An SDK error as it crosses the worker boundary: the name, the message and a fixed list of
 * fields. The page gets a plain `Error` with these fields, not the SDK class, so check
 * `error.name`, never `instanceof`, across a worker. `terminal` is `true` when the worker
 * must be replaced.
 *
 * @category Worker
 */
export interface SerializedError {
    /** The error's `name`. */
    readonly name: string;
    /** The error's `message`. */
    readonly message: string;
    /** The HTTP status, when the error carried one. */
    readonly status?: number;
    /** Ids of the jobs accepted before the error, when the error carried them. */
    readonly acceptedJobIds?: readonly string[];
    /** The area schedule the error carried, in its JSON form. */
    readonly areaSchedule?: AreaScheduleJSON;
    /** True when the worker can no longer be used and must be replaced. */
    readonly terminal?: boolean;
}
/**
 * Copies an error into the form that crosses the worker boundary.
 *
 * @param error - Any thrown value.
 * @returns The error's name, message and the fixed list of fields.
 * @category Worker
 */
export declare function serializeError(error: unknown): SerializedError;
/**
 * Rebuilds a plain `Error` from its serialized form, with the same name and fields.
 *
 * @param detail - A serialized error.
 * @returns A plain `Error`, not the SDK class.
 * @category Worker
 */
export declare function restoreError(detail: SerializedError): Error;
/**
 * Finds the buffers to transfer with a result: every `ArrayBuffer` that one typed
 * array covers from its first to its last byte. A view on part of a buffer
 * (for example on WebAssembly memory) is cloned instead, because a transfer
 * would detach the whole buffer for its other users.
 *
 * @param value - The result to search, including nested objects and arrays.
 * @returns The buffers to put in the transfer list.
 * @category Worker
 */
export declare function transferables(value: unknown): ArrayBuffer[];
