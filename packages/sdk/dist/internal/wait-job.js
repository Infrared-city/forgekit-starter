import { engineStopError } from "../area/run-errors.js";
import { rawAnswer } from "../area/raw-answer.js";
import { requireCore } from "./core.js";
import { Deadline, delay, requireTimeout } from "./deadline.js";
import { notifyPoll } from "./poll-notify.js";
import { TransportError } from "./transport.js";
import { JobAbortedError, JobFailedError, JobTimeoutError } from "../job-errors.js";
/** The answer to one status read, as the kernel `JobWait` takes it. */
function statusAnswer(job) {
    return JSON.stringify({ status: { status: job.status, error: job.error || null } });
}
function failureAnswer(error) {
    // The wait ends and the host throws `error` itself.
    if (!(error instanceof TransportError))
        return JSON.stringify({ host_error: { message: "host error" } });
    const after = error.retryAfterS;
    return JSON.stringify({ failure: {
            failure: rawAnswer(error),
            retry_after_us: after === undefined || !Number.isFinite(after) ? null : Math.round(after * 1e6),
        } });
}
/**
 * Wait for one job on the kernel `JobWait`: the kernel decides every status
 * request, sleep and stop; this loop does one `GET /async/jobs/{id}` per `get`
 * step and sleeps the `sleep` step. `onPoll` sees every status read, the
 * terminal one included, before a `Failed` job throws; `false` stops the wait
 * and returns the job as it is. The default timeout is the kernel's 900 s.
 */
export async function waitForJob(id, options, deps) {
    const timeoutSeconds = options.timeout ?? requireCore().pollDefaultTimeoutSeconds();
    requireTimeout(timeoutSeconds * 1_000);
    const deadline = new Deadline(options.signal, timeoutSeconds * 1_000);
    const wait = new (requireCore().JobWait)(id, Math.round(timeoutSeconds * 1e6), Math.floor(Math.random() * 2 ** 32) >>> 0, deps.intervalUs, deps.intervalCapUs);
    const t0 = performance.now();
    const clockUs = () => Math.round((performance.now() - t0) * 1_000);
    let job;
    let failure;
    let answer = "";
    let attempt = -1;
    try {
        for (;;) {
            let step;
            try {
                step = JSON.parse(wait.next(clockUs(), answer));
            }
            catch (error) {
                throw engineStopError(error, failure);
            }
            if (step.notify === true && job !== undefined) {
                const nextS = step.kind === "sleep" ? step.us / 1e6 : 0;
                if (await notifyPoll(deadline, options.onPoll, job, attempt, clockUs() / 1e6, nextS) === false)
                    return job;
            }
            answer = "";
            if (step.kind === "sleep") {
                await deadline.wait(() => delay(step.us / 1_000, deadline.controller.signal));
            }
            else if (step.kind === "get") {
                attempt += 1;
                failure = undefined;
                try {
                    job = await deadline.wait(() => deps.status(id, deadline.controller.signal));
                    answer = statusAnswer(job);
                }
                catch (error) {
                    if (deadline.reason() !== undefined)
                        throw error;
                    failure = { error };
                    answer = failureAnswer(error);
                }
            }
            else if (step.outcome === "timeout") {
                throw new JobTimeoutError(id);
            }
            else if (step.outcome === "failed") {
                throw new JobFailedError(id, job?.error ?? "");
            }
            else {
                return job;
            }
        }
    }
    catch (error) {
        const reason = deadline.reason();
        if (reason !== undefined)
            throw reason === "timeout" ? new JobTimeoutError(id) : new JobAbortedError(id);
        throw error;
    }
    finally {
        deadline.close();
        wait.free();
    }
}
