/**
 * `runAreaAndWait`'s wait-then-retry rounds (D224). Split out of `client.ts`
 * for the 400-line cap (root `CLAUDE.md` rule 8): the client keeps the
 * public method, this file keeps the loop.
 */
import { waitForSchedule } from "./wait-schedule.js";
import { buildRetryContext } from "./retry-context.js";
/**
 * Run, wait, and (D224) retry: wait for `schedule0` to complete, then ask
 * for up to `retries` more rounds (default 1) when the kernel plan finds
 * something left to fix. Returns the final, complete schedule.
 *
 * Each round asks for the kernel plan (`buildRetryContext`) and stops when it
 * resubmits nothing (never `failedSubmissions.length`). `runArea` builds its
 * own plan from `retryFrom`; the extra pure kernel call is cheap.
 *
 * `checkAreaState` is the CALLER's method (`client.ts`'s `this.checkAreaState`),
 * not the free function, so an override or a spy on it still reaches this wait.
 */
export async function runAreaAndWaitRounds(jobs, runArea, checkAreaState, input, polygon, options, schedule0) {
    let schedule = schedule0;
    const waitRound = () => waitForSchedule(jobs, schedule, {
        timeoutS: options.areaTimeout,
        check: (sweep) => checkAreaState(schedule, sweep),
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
        onTimeout: options.onTimeout,
    });
    await waitRound();
    const retries = options.retries ?? 1;
    for (let round = 0; round < retries; round += 1) {
        // Never retry after a 402: `submissionAbortStatus` is the one round-stop
        // this loop checks before the kernel, so an aborted schedule costs no
        // extra poll.
        if (schedule.submissionAbortStatus !== null)
            break;
        const ctx = await buildRetryContext(jobs, schedule, {
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
        if (ctx.resubmitKeys.size === 0)
            break;
        schedule = await runArea(input, polygon, { ...options, retryFrom: schedule });
        await waitRound();
    }
    return schedule;
}
