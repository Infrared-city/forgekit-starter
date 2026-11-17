/**
 * `JobsService.downloadResults` (1.0.0 behaviour): the kernel run engine's
 * download rule for ONE job -- the same tries, waits and 403-means-a-fresh-link
 * rule as an area run's downloads (D290). The host only does the IO.
 */
import { EngineDriver, us } from "../area/run-engine.js";
import { rawAnswer } from "../area/raw-answer.js";
import { TransportError } from "./transport.js";
/** Download `jobId` with `once` (one try, a fresh presigned link) until the engine stops. */
export async function downloadWithRetries(jobId, once, signal) {
    const own = signal ?? new AbortController().signal;
    let result;
    let last;
    const driver = new EngineDriver({ retries: 0, area_timeout_us: 3_600_000_000, goal: "available" });
    await driver.run([{ keys: ["k"], run_id: "", jobs: { k: jobId }, states: { [jobId]: "succeeded" } }], own, async (act, request) => {
        if (act.kind !== "download")
            throw new Error(`unexpected engine action ${act.kind}`);
        try {
            result = { value: await once(request) };
            return { kind: "download_done", job: jobId };
        }
        catch (error) {
            last = error;
            // A timeout spent the whole download deadline and an abort is the caller's: no retry
            // (1.0.0). Thrown, the engine takes it as a host error and gives the result up.
            if (error instanceof TransportError && (error.reason === "timeout" || error.reason === "aborted")) {
                throw error;
            }
            return { kind: "download_failed", job: jobId, answer: rawAnswer(error),
                ...us(error.retryAfterS) };
        }
    }, () => { });
    if (result !== undefined)
        return result.value;
    throw last ?? new TransportError("presigned download was aborted", "after-dispatch", "aborted", "GET");
}
