/**
 * Wait until every job of a schedule is terminal, on the SDK's one poll
 * engine (D213). Moved out of `client.ts`: `runAreaAndWait` and the
 * daylight-factor parts (`parts/`, D221) wait the same way.
 */
import { poll } from "../internal/poll-engine.js";
import { checkAreaState, lastSweepRecord } from "./poll.js";
import { nextSweepRequests } from "./poll-schedule.js";
export function abortableSleep(milliseconds, signal) {
    if (signal?.aborted)
        return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    return new Promise((resolve, reject) => {
        const finish = () => {
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const timer = setTimeout(finish, milliseconds);
        const abort = () => {
            clearTimeout(timer);
            reject(signal?.reason ?? new DOMException("aborted", "AbortError"));
        };
        signal?.addEventListener("abort", abort, { once: true });
    });
}
export async function waitForSchedule(service, schedule, options) {
    let state;
    await poll(async () => {
        const sweep = {
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
            ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
        };
        state = options.check === undefined
            ? await checkAreaState(service, schedule, sweep)
            : await options.check(sweep);
        const record = lastSweepRecord(schedule);
        return {
            done: state.isComplete,
            nextRequests: nextSweepRequests(state, service.batchedStatusSupported === true, record.perJob),
            failed: record.failures > 0,
            retryAfterS: record.retryAfterS,
        };
    }, {
        timeoutS: options.timeoutS,
        // Nothing submitted (every tile uncertain or skipped): no first delay.
        firstSweepNow: ![...schedule.jobs.values()].some((job) => Boolean(job.jobId)),
        sleep: (ms) => abortableSleep(ms, options.signal),
        onTimeout: () => options.onTimeout(state),
    });
    return state;
}
