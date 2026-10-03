/**
 * Turn a `retryFrom` schedule into the kernel's area retry plan (D224): the
 * keys to resend, each with its attempt and `Idempotency-Key`, the keys over
 * the cap, and the keys still held uncertain. `planning.ts` reads this to
 * pick which tiles `buildEntries` rebuilds and to guard a paid retry on
 * `resubmitKeys.size > 0`; `submission.ts` reads it to stamp the new schedule's run id
 * and attempts; `run-and-wait-retry.ts` reads it to decide a retry round.
 *
 * Kernel-first (root `CLAUDE.md`): the set arithmetic, the merge of several
 * records for one key, and the key derivation live in `ir_geo::area_retry`,
 * never here. This module gathers the RAW schedule state -- one entry per
 * `jobs` value, one per failed submit key, one per uncertain key, no host
 * filtering -- and calls the kernel, which merges them itself.
 */
import { checkAreaState } from "./poll.js";
import { freshRunId, planAreaRetry } from "./retry-plan.js";
/** One `KeyState` per `schedule.jobs` value, RAW: every job in the map
 * reports `submit: "accepted"` (a record exists for it), with the job's
 * terminal status only when it has a `jobId` and that status is `completed`
 * or `failed`. Plus one `"failed"` entry per `failedSubmissions` key and one
 * `"uncertain"` entry per `uncertainSubmissions` key. The kernel merges
 * several entries for the same key itself (uncertain > failed > accepted,
 * the highest attempt, the first job status given) -- this function filters
 * nothing. */
function scheduleKeyStates(schedule) {
    const attempt = (key) => schedule.attempts?.[key];
    const states = [];
    for (const job of schedule.jobs.values()) {
        const jobStatus = job.jobId !== undefined && (job.status === "completed" || job.status === "failed")
            ? job.status : undefined;
        states.push({ key: job.tileId, submit: "accepted", jobStatus, attempt: attempt(job.tileId) });
    }
    for (const key of schedule.failedSubmissions)
        states.push({ key, submit: "failed", attempt: attempt(key) });
    for (const key of schedule.uncertainSubmissions ?? []) {
        states.push({ key, submit: "uncertain", attempt: attempt(key) });
    }
    return states;
}
export async function buildRetryContext(service, retryFrom, options = {}) {
    // Refresh every still-open job before asking for the plan (item 3 of the
    // host spec): the kernel needs the CURRENT terminal status of a key, not a
    // stale one. One sweep, the same poll machinery `checkAreaState` always
    // runs; no second poller, no `known` short-circuit map.
    await checkAreaState(service, retryFrom, {
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
    });
    const plan = planAreaRetry({
        ...(retryFrom.runId === undefined ? { freshRunId: freshRunId() } : { runId: retryFrom.runId }),
        keys: scheduleKeyStates(retryFrom),
    });
    return {
        runId: plan.runId,
        attempts: plan.attempts,
        resubmitKeys: new Set(plan.resubmit.map((entry) => entry.key)),
        idempotencyKeys: new Map(plan.resubmit.map((entry) => [entry.key, entry.idempotencyKey])),
        carryUncertain: plan.heldUncertain,
    };
}
