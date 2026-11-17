/**
 * Thrown by every open call when the worker ends.
 *
 * - `load`: the worker failed before it was ready. No call started work,
 *   so nothing was sent.
 * - `lost`: every other case, including `dispose()` during a call. The jobs
 *   in `acceptedJobIds` were accepted (the ids that `onAccepted` reported
 *   for this call and the page received before the loss; an id still in
 *   flight can be missing). Every other tile of a `runArea` call is
 *   uncertain: its request may have reached the server. Do not send them again
 *   automatically.
 *
 * @category Worker
 */
export declare class WorkerLostError extends Error {
    /** Why the worker ended: `"load"` or `"lost"`. */
    readonly reason: "load" | "lost";
    /** Ids of the jobs accepted before the worker ended. */
    readonly acceptedJobIds: readonly string[];
    readonly name = "WorkerLostError";
    /**
     * @param reason - `"load"` or `"lost"`, as described above.
     * @param acceptedJobIds - Ids of the jobs the server accepted before the worker ended.
     * @param message - The error message; a default is given for each reason.
     */
    constructor(
    /** Why the worker ended: `"load"` or `"lost"`. */
    reason: "load" | "lost", 
    /** Ids of the jobs accepted before the worker ended. */
    acceptedJobIds: readonly string[], message?: string);
}
