/** The kernel's `PoolTask` handle. */
export interface PoolTask {
    /** The byte address of the done word (0 running, 1 done) in the core's memory. */
    readonly flag: number;
    readonly done: boolean;
    free(): void;
}
/** Run `start` (a kernel `...Start` call), wait for its task without blocking, then `end` it. */
export declare function poolCall<T extends PoolTask, R>(start: () => T, end: (task: T) => R): Promise<R>;
/**
 * `poolCall`, but at once: this thread waits (`Atomics.wait`) for the pool. For a caller that must
 * answer synchronously (a JSON facade body). The serial core never waits here.
 */
export declare function poolCallSync<T extends PoolTask, R>(start: () => T, end: (task: T) => R): R;
