/**
 * Submit the parts of a planned request through the area submit pool
 * (`area/submit-pool.ts`): the same POST rules as an area run (an uncertain
 * POST is never sent again, a 402 stops the rest), and the same retry: only
 * the parts that failed.
 */
import { submitEntries } from "../area/submit-pool.js";
import { computeAreaState } from "../area/schedule.js";
import { sha256Hex } from "../internal/geometry-reuse/canonical.js";
import { silentLogger } from "../logger.js";
import { planInteriorRoute } from "./interior-binary.js";
import { partEntries } from "./plan.js";
import { resolveResultFormat } from "./result-format.js";
/**
 * The parts a retry sends again: a failed POST, a failed job, or a part never
 * sent (a stopped run). Never a part whose POST outcome is unknown, and never
 * a job the poll gave up on (it has a job id; a merge asks about it again).
 */
export function retryableParts(schedule) {
    const uncertain = new Set(schedule.uncertainSubmissions);
    return schedule.partKeys.filter((key) => {
        if (uncertain.has(key))
            return false;
        const job = schedule.jobs.get(key);
        return job === undefined || job.status === "failed" || (job.status === "skipped" && !job.jobId);
    });
}
function checkRetry(prior, request, digest) {
    // No digest (no SHA-256 in this runtime, now or when the schedule was
    // written): the retry cannot prove it is the same request, and parts of two
    // requests would join silently. Refused before any POST.
    if (digest === undefined || prior.requestDigest === undefined) {
        throw new Error("retryFrom needs a SHA-256 digest of the request, and this runtime or the saved schedule has none; start a fresh run");
    }
    if (prior.analysisType !== request.analysisType || prior.requestDigest !== digest) {
        throw new Error("retryFrom is a run of a different request; retry with the same request or start a fresh run");
    }
    if (prior.plan !== request.planText) {
        throw new Error("retryFrom plan mismatch: the kernel plans this request differently now; start a fresh run");
    }
}
export async function submitParts(service, request, options = {}, logger = silentLogger) {
    const { plan, planText, bytes } = request;
    if (plan === undefined || planText === undefined || bytes === undefined) {
        throw new Error("the request has no parts plan");
    }
    const hex = await sha256Hex(bytes);
    const requestDigest = hex === undefined ? undefined : `sha256:${hex}`;
    const prior = options.retryFrom;
    if (prior !== undefined)
        checkRetry(prior, request, requestDigest);
    // D228: the interior binary route, only when the caller left `transport`
    // unset and the live capability supports it; every fallback (explicit
    // transport, no capability support, a deferred field) keeps the parts on
    // JSON, byte-identical to before D228.
    // A plan of one part is one job on JSON, as `execute` sends it.
    const interior = plan.parts.length > 1
        ? await planInteriorRoute(service, request.analysisType, bytes, options, logger, resolveResultFormat(options.resultFormat))
        : undefined;
    const entries = partEntries(request, prior === undefined ? undefined : new Set(retryableParts(prior)), interior);
    const outcome = await submitEntries(service, entries, {
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.onAccepted === undefined ? {} : { onAccepted: options.onAccepted }),
        ...(prior === undefined ? {} : { priorJobs: prior.jobs, priorUncertain: prior.uncertainSubmissions }),
    });
    const schedule = Object.freeze({
        analysisType: request.analysisType,
        ...(requestDigest === undefined ? {} : { requestDigest }),
        plan: planText,
        partKeys: Object.freeze(plan.parts.map((part) => part.key)),
        jobs: outcome.jobs,
        failedSubmissions: Object.freeze(outcome.failedSubmissions),
        uncertainSubmissions: Object.freeze(outcome.uncertainSubmissions),
        submissionAbortStatus: outcome.submissionAbortStatus,
        resultFormat: resolveResultFormat(options.resultFormat),
    });
    try {
        options.onProgress?.(computeAreaState(schedule));
    }
    catch {
        // Observer failures must not hide accepted job IDs in the returned schedule.
    }
    return schedule;
}
