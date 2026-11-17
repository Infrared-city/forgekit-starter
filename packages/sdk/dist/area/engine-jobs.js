/**
 * `runArea`, the merges and the daylight-factor parts on the kernel
 * `RunEngine` (the TypeScript twin of Python `_engine_submit.py` and
 * `merge_on_engine`). One driver (`run-engine.ts`), one IO (`run-io.ts`):
 *
 * - `submitOnEngine`: send every entry (goal `sent`).
 * - `collectOnEngine`: ask every job and download the ready ones (goal
 *   `available`), or wait for them (goal `results`).
 *
 * The engine decides every POST, poll, download, retry and stop.
 */
import { EngineDriver } from "./run-engine.js";
import { acceptedAction, batchConfig, freePreparedCaptures, runAction, } from "./run-io.js";
/**
 * The job records of an analysis from the engine's facts: a key with no job
 * is `failed` (safe to send again) or `skipped` (uncertain, never sent again
 * by the SDK). Records of keys with a job are the IO's own.
 */
export function recordsFromFacts(an, facts) {
    const state = { succeeded: "completed", failed: "failed" };
    for (const [key, jobId] of Object.entries(facts.jobs)) {
        const job = an.jobs.get(key);
        // A running job keeps the status the IO read last (pending or running).
        const last = facts.job_state[jobId];
        if (job !== undefined && job.jobId === jobId && last !== undefined && last !== "running")
            job.status = state[last];
        // The server's error text of a failed job.
        if (job !== undefined && job.jobId === jobId && last === "failed" && facts.errors?.[key] !== undefined) {
            job.error = facts.errors[key];
        }
    }
    for (const key of [...facts.failed, ...facts.uncertain]) {
        if (an.jobs.get(key)?.invalidReference === true)
            continue; // that record stays
        const entry = an.entries.get(key);
        an.jobs.set(key, { tileId: key, row: entry.row, col: entry.col,
            status: facts.failed.includes(key) ? "failed" : "skipped",
            error: facts.failed.includes(key) ? facts.errors?.[key] ?? "job submission failed"
                : "submission outcome is unknown; do not resubmit automatically" });
    }
    applyFailures(an.jobs, facts);
}
/** The engine's failure kind and HTTP status of each key, onto its record (issue #613). */
function applyFailures(jobs, facts) {
    for (const [key, failure] of Object.entries(facts.failures ?? {})) {
        const job = jobs.get(key);
        if (job === undefined)
            continue;
        job.failureKind = failure.kind;
        if (failure.status === undefined)
            delete job.failureStatus;
        else
            job.failureStatus = failure.status;
    }
}
/** Send every entry once to the engine's end (goal `sent`). */
export async function submitOnEngine(service, entries, options) {
    const jobs = new Map();
    for (const [key, job] of options.priorJobs ?? [])
        jobs.set(key, { ...job });
    const an = { entries: new Map(entries.map((e) => [e.key, e])), jobs,
        ...(options.capture === undefined ? {} : { capture: options.capture }),
        ...(options.remember === undefined ? {} : { remember: options.remember }) };
    const sent = new Set(entries.map((e) => e.key));
    const attempts = Object.fromEntries(Object.entries(options.attempts ?? {}).filter(([k]) => sent.has(k)));
    const signal = options.signal ?? new AbortController().signal;
    const binary = entries.some((e) => e.prepared.transport === "binary");
    const driver = new EngineDriver({ retries: 0,
        area_timeout_us: 3_600_000_000, goal: "sent", ...await batchConfig(service, binary, signal) });
    let invalid = false;
    const io = { service, analyses: [an], byJob: new Map(),
        ...(options.onAccepted === undefined ? {} : { onAccepted: options.onAccepted }),
        ...(options.logger === undefined ? {} : { logger: options.logger }),
        // No new POST after an invalid geometry-reference acceptance; the POSTs in flight keep their jobs.
        onInvalidReference: () => { invalid = true; driver.stop(); },
        stopped: () => invalid };
    driver.onAccepted = (act) => acceptedAction(io, act);
    const [facts] = await driver.run([{ keys: [...sent], run_id: options.runId, attempts }], signal, (act, own) => runAction(io, act, own), () => { }).finally(() => freePreparedCaptures(io));
    recordsFromFacts(an, facts);
    const invalidKeys = [...jobs.values()].filter((j) => j.invalidReference === true && sent.has(j.tileId))
        .map((j) => j.tileId);
    const uncertain = new Set((options.priorUncertain ?? []).filter((k) => !sent.has(k)));
    for (const key of facts.uncertain)
        if (!invalidKeys.includes(key))
            uncertain.add(key);
    return {
        jobs,
        failedSubmissions: facts.failed.filter((k) => !invalidKeys.includes(k)),
        uncertainSubmissions: [...uncertain],
        invalidReferenceSubmissions: [...(options.priorInvalidReference ?? []), ...(invalid ? invalidKeys : [])],
        submissionAbortStatus: facts.payment_stopped ? 402 : null,
        runId: facts.run_id,
        attempts: { ...options.attempts, ...facts.attempts },
    };
}
/**
 * Ask the jobs of `jobs` (records by key) and download the succeeded ones
 * into `sink.grid`, `sink.surface` or `sink.archives` (by job id). A job record known to be
 * terminal is not asked again (D52). The records get the answers.
 */
export async function collectOnEngine(service, jobs, sink, options) {
    const known = {};
    const withJob = {};
    const byJob = new Map();
    for (const [key, job] of jobs) {
        if (!job.jobId || job.invalidReference === true)
            continue; // an invalid reference is never asked
        withJob[key] = job.jobId;
        byJob.set(job.jobId, { a: 0, key });
        const status = options.known?.[job.jobId] ?? job.status;
        if (status === "completed")
            known[job.jobId] = "succeeded";
        else if (status === "failed")
            known[job.jobId] = "failed";
    }
    // No POST here, so no record is added: the status answers update the records in place.
    const an = { entries: new Map(), jobs: jobs,
        ...(sink.grid === undefined ? {} : { grid: sink.grid }),
        ...(sink.surface === undefined ? {} : { surface: sink.surface }),
        ...(sink.archives === undefined ? {} : { archives: sink.archives }) };
    const io = { service, analyses: [an], byJob };
    const signal = options.signal ?? new AbortController().signal;
    const driver = new EngineDriver({ retries: 0,
        area_timeout_us: Math.round((options.timeoutS ?? 3_600) * 1e6), goal: options.goal });
    let outcome = "incomplete";
    const [facts] = await driver.run([{ keys: Object.keys(withJob), run_id: "", jobs: withJob, states: known }], signal, (act, own) => runAction(io, act, own), (act) => { outcome = act.outcome; }, options.onProgress);
    if (options.signal?.aborted)
        throw options.signal.reason ?? new DOMException("aborted", "AbortError");
    applyFailures(jobs, facts);
    return { facts: facts, outcome };
}
