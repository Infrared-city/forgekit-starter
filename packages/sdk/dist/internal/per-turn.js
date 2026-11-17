/**
 * One kernel call per event-loop turn (D299). The items asked for in the
 * same turn (the downloads or request bodies that became ready together) go
 * to `flush` as ONE batch, after the turn, so the threaded core can spread
 * the batch over its pool; the serial core runs it one item after the other.
 * A batch holds at most `limit()` items, and each batch runs in its own turn:
 * one call blocks the thread for a short time only, so timers and sockets
 * keep moving (a long block stalled request bodies past their 10 s idle
 * limit). `flush` is a kernel pool task (`pool-task.ts`): it does not block
 * the thread at all, and the next batch can start while it runs.
 */
/** After the current turn: `setImmediate` in Node, a zero timer in a browser or worker. */
const later = typeof setImmediate === "function"
    ? (run) => { setImmediate(run); }
    : (run) => { setTimeout(run, 0); };
/**
 * Make `flush(items) -> results` (one result per item, same order) into a
 * per-item call. An error of `flush` rejects every item of its batch.
 */
export function perTurn(flush, limit = () => Number.POSITIVE_INFINITY) {
    const queue = [];
    const run = () => {
        const batch = queue.splice(0, Math.max(1, limit()));
        if (queue.length > 0)
            later(run);
        flush(batch.map((waiting) => waiting.item)).then((results) => {
            for (const [index, waiting] of batch.entries())
                waiting.resolve(results[index]);
        }, (error) => { for (const waiting of batch)
            waiting.reject(error); });
    };
    return (item) => new Promise((resolve, reject) => {
        if (queue.length === 0)
            later(run);
        queue.push({ item, resolve, reject });
    });
}
