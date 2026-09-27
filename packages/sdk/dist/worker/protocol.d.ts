/**
 * The messages between `createWorkerClient` (page) and `serveSdkWorker`
 * (worker), the error copy and the transfer list. Internal to the worker
 * entry; the message shapes are not public API.
 *
 * Channels:
 * - The worker's own port carries `init`, `call` and the token bridge.
 *   The SDK client lives for the life of the worker, so a token request is
 *   not bound to one call.
 * - Each call has its own `MessageChannel`. The worker sends `progress`,
 *   `accepted`, then `done` or `failed` on it; the page sends `abort`.
 *   One port keeps these in order, so every `accepted` arrives before the
 *   result of its call.
 */
import type { InfraredClientConfig } from "../client.js";
import type { AreaScheduleJSON } from "../area/schedule-types.js";
export type WorkerOperation = "runArea" | "mergeAreaJobs" | "mergeSurfaceAreaJobs" | "vegetation.getArea" | "groundMaterials.getArea" | "buildings.getBuildingsInArea";
/**
 * The part of `InfraredClientConfig` that can cross to a worker: no
 * functions. Give `getToken` to `createWorkerClient` and `fetch` to
 * `serveSdkWorker`; a logger stays the worker's default.
 */
export type WorkerClientConfig = Omit<InfraredClientConfig, "getToken" | "auth" | "fetch" | "logger" | "onGeometryReuseProbe">;
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
export type WorkerMessage = {
    readonly type: "ready";
} | {
    readonly type: "token-request";
    readonly id: number;
};
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
/** What the page sends on a call port. */
export interface AbortMessage {
    readonly type: "abort";
    readonly reason: string;
}
/**
 * An SDK error as it crosses the worker boundary: the name, the message and
 * a FIXED list of fields. The page gets a plain `Error` with these fields,
 * not the SDK class, so check `error.name`, never `instanceof`, across a
 * worker. `terminal` is on the list because `CoreTerminalError` keeps the
 * name `CoreInitializationError`; it is the only way to see that the worker
 * must be replaced.
 */
export interface SerializedError {
    readonly name: string;
    readonly message: string;
    readonly status?: number;
    readonly acceptedJobIds?: readonly string[];
    readonly areaSchedule?: AreaScheduleJSON;
    readonly terminal?: boolean;
}
export declare function serializeError(error: unknown): SerializedError;
export declare function restoreError(detail: SerializedError): Error;
/**
 * The buffers to TRANSFER with a result: every `ArrayBuffer` that one typed
 * array covers from its first to its last byte. A view on part of a buffer
 * (for example on WebAssembly memory) is cloned instead, because a transfer
 * would detach the whole buffer for its other users.
 */
export declare function transferables(value: unknown): ArrayBuffer[];
