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
import { areaScheduleFromJSON, areaScheduleToJSON } from "../area/schedule.js";
function stringList(value) {
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? [...value] : undefined;
}
export function serializeError(error) {
    const fields = (typeof error === "object" && error !== null ? error : {});
    const name = typeof fields.name === "string" ? fields.name : "Error";
    const message = typeof fields.message === "string" ? fields.message : String(error);
    const acceptedJobIds = stringList(fields.acceptedJobIds);
    let areaSchedule;
    try {
        if (fields.areaSchedule !== undefined)
            areaSchedule = areaScheduleToJSON(fields.areaSchedule);
    }
    catch {
        // Not a schedule this SDK wrote; the name and message still cross.
    }
    return {
        name, message,
        ...(typeof fields.status === "number" ? { status: fields.status } : {}),
        ...(acceptedJobIds === undefined ? {} : { acceptedJobIds }),
        ...(areaSchedule === undefined ? {} : { areaSchedule }),
        ...(fields.terminal === true ? { terminal: true } : {}),
    };
}
export function restoreError(detail) {
    const error = new Error(detail.message);
    error.name = detail.name;
    const fields = {};
    if (detail.status !== undefined)
        fields.status = detail.status;
    if (detail.acceptedJobIds !== undefined)
        fields.acceptedJobIds = detail.acceptedJobIds;
    if (detail.areaSchedule !== undefined)
        fields.areaSchedule = areaScheduleFromJSON(detail.areaSchedule);
    if (detail.terminal === true)
        fields.terminal = true;
    return Object.assign(error, fields);
}
/**
 * The buffers to TRANSFER with a result: every `ArrayBuffer` that one typed
 * array covers from its first to its last byte. A view on part of a buffer
 * (for example on WebAssembly memory) is cloned instead, because a transfer
 * would detach the whole buffer for its other users.
 */
export function transferables(value) {
    const found = new Set();
    const seen = new Set();
    const visit = (item) => {
        if (typeof item !== "object" || item === null || seen.has(item))
            return;
        seen.add(item);
        if (ArrayBuffer.isView(item)) {
            const buffer = item.buffer;
            if (buffer instanceof ArrayBuffer && item.byteOffset === 0 && item.byteLength === buffer.byteLength) {
                found.add(buffer);
            }
            return;
        }
        if (Array.isArray(item)) {
            for (const child of item)
                visit(child);
            return;
        }
        for (const child of Object.values(item))
            visit(child);
    };
    visit(value);
    return [...found];
}
