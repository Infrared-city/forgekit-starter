import { Deadline, delay, requireTimeout } from "./deadline.js";
import { notifyPoll } from "./poll-notify.js";
import { defaultPollTimeoutS, isTransientStatusError, poll } from "./poll-engine.js";
import { JobAbortedError, JobFailedError, JobTimeoutError } from "../job-errors.js";
import { JobStatus } from "../job-model.js";
/**
 * Wait for one job on the SDK's one poll engine (`poll-engine.ts`, D213) —
 * the same engine an area run uses. `onPoll` sees every status read, the
 * terminal one included, before a `Failed` job throws; `false` stops the wait
 * and returns the job as it is. The default timeout is the kernel's 900 s.
 */
export async function waitForJob(id, options, deps) {
    const timeoutSeconds = options.timeout ?? defaultPollTimeoutS();
    requireTimeout(timeoutSeconds * 1_000);
    const deadline = new Deadline(options.signal, timeoutSeconds * 1_000);
    let last;
    let stopped = false;
    try {
        await poll(async () => {
            try {
                last = await deadline.wait(() => deps.status(id, deadline.controller.signal));
            }
            catch (error) {
                if (deadline.reason() === undefined && isTransientStatusError(error)) {
                    return { done: false, failed: true, retryAfterS: error.retryAfterS };
                }
                throw error;
            }
            return { done: last.status === JobStatus.Succeeded || last.status === JobStatus.Failed };
        }, {
            timeoutS: timeoutSeconds,
            sleep: (ms) => deadline.wait(() => delay(ms, deadline.controller.signal)),
            onTimeout: () => new JobTimeoutError(id),
            observe: async (outcome, attempt, elapsed, nextDelay) => {
                if (outcome.failed === true || last === undefined)
                    return true;
                const keepGoing = await notifyPoll(deadline, options.onPoll, last, attempt, elapsed, nextDelay);
                if (keepGoing === false)
                    stopped = true;
                return keepGoing !== false;
            },
            fixedIntervalS: deps.fixedIntervalS,
            maxIntervalS: deps.maxIntervalS,
        });
    }
    catch (error) {
        const reason = deadline.reason();
        if (reason !== undefined) {
            throw reason === "timeout" ? new JobTimeoutError(id) : new JobAbortedError(id);
        }
        throw error;
    }
    finally {
        deadline.close();
    }
    const job = last;
    if (!stopped && job.status === JobStatus.Failed)
        throw new JobFailedError(id, job.error ?? "");
    return job;
}
