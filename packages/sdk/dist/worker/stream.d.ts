import type { AreaStreamItem } from "../area/stream.js";
import { type CallMessage } from "./protocol.js";
/** An `item` message of a `runAreaStream` call. */
export type ItemMessage = Extract<CallMessage, {
    readonly type: "item";
}>;
/** Run a page observer; its error never ends the call (the worker owns the run). */
export declare function observe(callback: () => void): void;
/** The message of an abort reason, as it crosses to the worker. */
export declare function abortReason(signal: AbortSignal): string;
/**
 * The items of a worker `runAreaStream` call, in the order the worker sends them. `start`
 * makes the call with an item hook and a signal; the hook's `took` tells the worker the
 * caller took the item, and only then does the worker send the next one. Leaving the loop
 * early (`break`) or `outer` aborts the call, and the abort crosses to the worker.
 */
export declare function workerStream(start: (onItem: (message: ItemMessage, took: () => void) => void, signal: AbortSignal) => Promise<unknown>, outer?: AbortSignal): AsyncGenerator<AreaStreamItem, void, undefined>;
