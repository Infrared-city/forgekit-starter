/** Split out of `merge.ts` for the 400-line cap: what both area merges share. */
/**
 * Default width of the area result-download pool, the same as the Python
 * SDK's `DEFAULT_MERGE_WORKERS` (D176). Downloads are network-bound; the
 * Python sweep measured 1 worker too few and every width from 4 up the same,
 * and the 2026-09-26 staging runs found no gain from 16 or 20 on 16 tiles.
 */
export const DEFAULT_MERGE_WORKERS = 8;
export function workerCount(value) {
    const count = value ?? DEFAULT_MERGE_WORKERS;
    if (!Number.isSafeInteger(count) || count < 1) {
        throw new TypeError("maxWorkers must be a positive integer");
    }
    return count;
}
export async function parallel(values, maximum, task) {
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(maximum, Math.max(1, values.length)) }, async () => {
        while (cursor < values.length) {
            const value = values[cursor++];
            if (value !== undefined)
                await task(value);
        }
    }));
}
export function throwable(error) {
    return error instanceof Error ? error : new Error(String(error));
}
