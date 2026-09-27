/** Split out of `merge.ts` for the 400-line cap: what both area merges share. */
/**
 * Default width of the area result-download pool, the same as the Python
 * SDK's `DEFAULT_MERGE_WORKERS` (D176). Downloads are network-bound; the
 * Python sweep measured 1 worker too few and every width from 4 up the same,
 * and the 2026-09-26 staging runs found no gain from 16 or 20 on 16 tiles.
 */
export declare const DEFAULT_MERGE_WORKERS = 8;
export declare function workerCount(value: number | undefined): number;
export declare function parallel<T>(values: readonly T[], maximum: number, task: (value: T) => Promise<void>): Promise<void>;
export declare function throwable(error: unknown): Error;
