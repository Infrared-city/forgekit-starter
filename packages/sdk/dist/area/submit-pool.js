/**
 * The paid submit pool: one POST per entry, `maxWorkers` at a time, with the
 * rules that keep a paid job from being sent twice. Split out of
 * `submission.ts` so the area run and the daylight-factor parts (`parts/`,
 * D221) submit through ONE pool.
 *
 * - An uncertain POST (it may have been accepted) is recorded, never retried
 *   (#197, D59).
 * - A 402 stops the rest: the entries not yet sent fail as submissions, and a
 *   `retryFrom` sends them later.
 * - An invalid geometry-reference acceptance stops the rest as `skipped`.
 */
import { SubmissionUncertainError } from "../internal/submission.js";
import { SubmissionStoppedError } from "../internal/submission-stopped.js";
import { TransportError } from "../internal/transport.js";
import { GeometryReferenceSubmissionError } from "../internal/geometry-reuse/errors.js";
import { JobStatus } from "../jobs.js";
export function concurrency(value) {
    const count = value ?? 8;
    if (!Number.isSafeInteger(count) || count < 1)
        throw new TypeError("maxWorkers must be a positive integer");
    return count;
}
function tileStatus(job) {
    if (job.status === JobStatus.Succeeded)
        return "completed";
    if (job.status === JobStatus.Failed)
        return "failed";
    if (job.status === JobStatus.Running)
        return "running";
    return "pending";
}
/**
 * A POST whose outcome is unknown. An abort BEFORE the paid POST was sent
 * (#347, for example during the geometry upload) is not that: the tile goes
 * to `failedSubmissions` and `retryFrom` resubmits it. An abort AFTER the paid
 * POST was sent is: the server may have accepted and billed the job, so the
 * tile is uncertain and never resubmitted automatically (#197).
 */
function unknownAcceptance(error, posted) {
    return error instanceof SubmissionUncertainError ||
        (error instanceof TransportError && error.phase === "unknown-acceptance" &&
            (error.reason !== "aborted" || posted));
}
function failed(entry, error) {
    return {
        tileId: entry.key, row: entry.row, col: entry.col, status: "failed",
        error: error instanceof Error ? error.message : String(error),
    };
}
/** Report one recorded job id. Read-only: an observer error never reaches the run. */
function reportAccepted(options, jobId, tileKey) {
    if (jobId === undefined || options.onAccepted === undefined)
        return;
    try {
        options.onAccepted(jobId, tileKey);
    }
    catch {
        // The job id is in the schedule; an observer failure must not change it.
    }
}
/** Submit each entry once. Unknown POSTs are not retried. */
export async function submitEntries(service, entries, options = {}) {
    const jobs = new Map();
    for (const [key, job] of options.priorJobs ?? [])
        jobs.set(key, { ...job });
    const failedSubmissions = [];
    // Seeded from the prior schedule; a key this round RESOLVES (success,
    // failure, or a definite rejection) is removed below -- a key that gets a
    // job is no longer uncertain, carried forward or not (D224 carry-forward).
    const uncertainSubmissions = new Set(options.priorUncertain ?? []);
    const invalidReferenceSubmissions = [...(options.priorInvalidReference ?? [])];
    let submissionAbortStatus = null;
    let invalidReferenceAbort = false;
    const beforeDispatch = () => {
        if (invalidReferenceAbort)
            throw new SubmissionStoppedError();
    };
    let cursor = 0;
    const workers = Math.min(concurrency(options.maxWorkers), Math.max(1, entries.length));
    // ONE upload map for this run (#602, D218): the jobs of a facade tile share
    // one scene upload. One run uses one auth throughout.
    const uploads = new Map();
    await Promise.all(Array.from({ length: workers }, async () => {
        while (cursor < entries.length) {
            const entry = entries[cursor++];
            if (!entry)
                continue;
            if (invalidReferenceAbort) {
                jobs.set(entry.key, {
                    tileId: entry.key, row: entry.row, col: entry.col, status: "skipped",
                    error: "submission stopped after an invalid geometry reference",
                });
                continue;
            }
            if (submissionAbortStatus !== null || options.signal?.aborted) {
                failedSubmissions.push(entry.key);
                jobs.set(entry.key, failed(entry, options.signal?.reason ?? "submission stopped"));
                continue;
            }
            let posted = false;
            try {
                const capture = options.beforeSubmit?.(entry);
                const job = await service.submitPrepared(entry.prepared, {
                    beforeDispatch: () => { beforeDispatch(); posted = true; },
                    uploads,
                    ...(options.signal === undefined ? {} : { signal: options.signal }),
                    ...(entry.idempotencyKey === undefined ? {} : { idempotencyKey: entry.idempotencyKey }),
                });
                options.afterAccepted?.(capture, job.jobId);
                jobs.set(entry.key, {
                    tileId: entry.key, row: entry.row, col: entry.col, jobId: job.jobId,
                    status: tileStatus(job), lastJobSnapshot: job,
                    ...(job.binary === undefined ? {} : { binary: job.binary }),
                    ...(job.treeBoxes === undefined ? {} : { treeBoxes: job.treeBoxes }),
                    ...(job.error === undefined ? {} : { error: job.error }),
                });
                uncertainSubmissions.delete(entry.key);
                reportAccepted(options, job.jobId, entry.key);
            }
            catch (error) {
                if (error instanceof SubmissionStoppedError) {
                    jobs.set(entry.key, { tileId: entry.key, row: entry.row, col: entry.col,
                        status: "skipped", error: error.message });
                }
                else if (error instanceof GeometryReferenceSubmissionError) {
                    invalidReferenceAbort = true;
                    invalidReferenceSubmissions.push(entry.key);
                    uncertainSubmissions.delete(entry.key);
                    const accepted = error.acceptedJobIds[0];
                    jobs.set(entry.key, {
                        tileId: entry.key, row: entry.row, col: entry.col,
                        ...(accepted === undefined ? {} : { jobId: accepted }),
                        status: "failed", invalidReference: true, error: error.message,
                    });
                    reportAccepted(options, accepted, entry.key);
                }
                else if (unknownAcceptance(error, posted)) {
                    uncertainSubmissions.add(entry.key);
                    const accepted = error instanceof SubmissionUncertainError ? error.acceptedJobIds[0] : undefined;
                    jobs.set(entry.key, {
                        tileId: entry.key, row: entry.row, col: entry.col,
                        ...(accepted === undefined ? {} : { jobId: accepted }),
                        status: accepted === undefined ? "skipped" : "pending",
                        error: "submission outcome is unknown; do not resubmit automatically",
                    });
                    reportAccepted(options, accepted, entry.key);
                }
                else {
                    if (error instanceof TransportError && error.status === 402)
                        submissionAbortStatus = 402;
                    uncertainSubmissions.delete(entry.key);
                    failedSubmissions.push(entry.key);
                    jobs.set(entry.key, failed(entry, error));
                }
            }
        }
    }));
    return { jobs, failedSubmissions, uncertainSubmissions: [...uncertainSubmissions],
        invalidReferenceSubmissions, submissionAbortStatus };
}
