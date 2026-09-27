/** Process-wide admission for large binary encode and upload buffers: two at
 * a time. Measured on the 49-tile site: 1 and 2 are equal, 8 is slower. */
const limit = 2;
let active = 0;
const waiting = [];
export async function withBinaryAdmission(operation, signal) {
    if (signal?.aborted)
        throw signal.reason ?? new DOMException("aborted", "AbortError");
    if (active < limit && waiting.length === 0)
        active += 1;
    else
        await new Promise((resolve, reject) => {
            const waiter = { resolve, reject, ...(signal === undefined ? {} : { signal }) };
            if (signal !== undefined) {
                const abort = () => {
                    const index = waiting.indexOf(waiter);
                    if (index >= 0)
                        waiting.splice(index, 1);
                    reject(signal.reason ?? new DOMException("aborted", "AbortError"));
                };
                waiter.abort = abort;
                signal.addEventListener("abort", abort, { once: true });
            }
            waiting.push(waiter);
        });
    try {
        if (signal?.aborted)
            throw signal.reason ?? new DOMException("aborted", "AbortError");
        return await operation();
    }
    finally {
        active -= 1;
        while (active < limit && waiting.length > 0) {
            const waiter = waiting.shift();
            if (waiter.signal !== undefined && waiter.abort !== undefined) {
                waiter.signal.removeEventListener("abort", waiter.abort);
            }
            // Reserve the permit before the waiting continuation can run.
            active += 1;
            waiter.resolve();
        }
    }
}
