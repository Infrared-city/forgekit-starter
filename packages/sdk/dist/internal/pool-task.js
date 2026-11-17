/**
 * Kernel calls that do not block the JavaScript thread (D-2026101117-heron-otter-fox).
 *
 * A heavy kernel call is a `...Start` / `...End` pair: the start copies its
 * inputs into the kernel and gives the work to the threaded core's rayon pool,
 * then returns a `PoolTask` at once; the end reads the result. Between the
 * two, this thread waits with `Atomics.waitAsync` on the task's done word in
 * the core's shared memory, so timers, sockets and the other analyses of a run
 * go on. The serial core (`threads: 1`, a browser, a worker) runs the work
 * inside the start: the task is done at once and the end runs in the same
 * turn, as a plain call did.
 */
import { requireCoreMemory } from "./core.js";
/** Resolves when `task` is done. */
async function settled(task) {
    if (task.done)
        return;
    const words = new Int32Array(requireCoreMemory().buffer);
    // A pending `waitAsync` does not keep Node running: a timer does, until the task is done.
    const alive = setInterval(() => { }, 1 << 30);
    try {
        while (!task.done) {
            const wait = Atomics.waitAsync(words, task.flag >>> 2, 0);
            if (wait.async)
                await wait.value;
        }
    }
    finally {
        clearInterval(alive);
    }
}
/**
 * Pool tasks in flight at once. Each task maps over the whole pool already. A second task at once
 * was faster but over the memory and CPU gate (prod, warm medians of 3, interleaved with the
 * blocking calls before: Hong Kong 1 m, 4 facade analyses, 1 task 12.7 s / 22.0 CPU-s / 1.28 GB,
 * 2 tasks 11.3 s / 24.7 / 1.40 GB, before 13.1 s / 22.4 / 1.32 GB; Vienna 2 m, 8 analyses, 1 task
 * 5.9 s / 7.5 / 823 MB, 2 tasks 5.3 s / 8.4 / 833 MB, before 6.5 s / 7.8 / 855 MB). The others
 * wait in order; the JS thread is free either way.
 */
const MAX_IN_FLIGHT = 1;
let inFlight = 0;
const waiting = [];
/** Run `start` (a kernel `...Start` call), wait for its task without blocking, then `end` it. */
export async function poolCall(start, end) {
    if (inFlight >= MAX_IN_FLIGHT)
        await new Promise((resolve) => waiting.push(resolve));
    inFlight += 1;
    try {
        const task = start();
        try {
            await settled(task);
            return end(task);
        }
        finally {
            task.free();
        }
    }
    finally {
        inFlight -= 1;
        waiting.shift()?.();
    }
}
/**
 * `poolCall`, but at once: this thread waits (`Atomics.wait`) for the pool. For a caller that must
 * answer synchronously (a JSON facade body). The serial core never waits here.
 */
export function poolCallSync(start, end) {
    const task = start();
    try {
        if (!task.done) {
            const words = new Int32Array(requireCoreMemory().buffer);
            while (!task.done)
                Atomics.wait(words, task.flag >>> 2, 0);
        }
        return end(task);
    }
    finally {
        task.free();
    }
}
