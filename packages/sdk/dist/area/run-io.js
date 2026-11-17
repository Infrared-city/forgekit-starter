import { GeometryReferenceSubmissionError } from "../internal/geometry-reuse/errors.js";
import { SubmissionStoppedError } from "../internal/submission-stopped.js";
import { TransportError } from "../internal/transport.js";
import { jobFromResponse, JobStatus } from "../jobs.js";
import { consoleLogger } from "../logger.js";
import { us } from "./run-engine.js";
import { rawAnswer } from "./raw-answer.js";
export { rawAnswer };
/** The raw facts of a failed submit. `sent`: the paid POST left the client. */
function postFacts(error, sent) {
    if (error instanceof SubmissionStoppedError)
        return { phase: "before_send" };
    // The geometry upload (PUT) failed, or an abort came before the POST: the paid POST never left.
    if (error instanceof TransportError && (error.method === "PUT" || !sent && error.reason === "aborted")) {
        return { phase: "before_send" };
    }
    if (!sent)
        return rawAnswer(error);
    try {
        return rawAnswer(error);
    }
    catch {
        // An error the transport did not classify, after the POST left: cannot tell.
        return { phase: "unknown" };
    }
}
function status(job) {
    return job.status === JobStatus.Succeeded ? "completed" : job.status === JobStatus.Failed ? "failed"
        : job.status === JobStatus.Running ? "running" : "pending";
}
/** #835: the server accepted and billed this job and it is recorded. A capture error must not
 * make it a failed key: the engine would send it again with a new key and bill it twice. */
function rememberAccepted(io, an, capture, jobId, tileId) {
    try {
        an.remember?.(capture, jobId);
    }
    catch (error) {
        try {
            (io.logger ?? consoleLogger).warn({ event: "facade_capture_not_kept", tileId, jobId,
                reason: error instanceof Error ? error.message : String(error) });
        }
        catch { /* a logger error must not change the accepted job either */ }
    }
}
/** The bookkeeping of an accepted job: its record, its job id, the observer and the facade capture. */
function recordAccepted(io, a, key, job, capture) {
    const an = io.analyses[a];
    const entry = an.entries.get(key);
    an.jobs.set(key, { tileId: entry.key, row: entry.row, col: entry.col, jobId: job.jobId,
        status: status(job), lastJobSnapshot: job, ...(job.binary === undefined ? {} : { binary: job.binary }) });
    io.byJob.set(job.jobId, { a, key });
    try {
        io.onAccepted?.(job.jobId, key);
    }
    catch { /* an observer never changes the run */ }
    rememberAccepted(io, an, capture, job.jobId, entry.key);
}
async function post(io, act, signal) {
    const an = io.analyses[act.a];
    const entry = an.entries.get(act.key);
    const reply = { kind: "post_answer", a: act.a, key: act.key };
    let sent = false;
    let capture;
    try {
        capture = await an.capture?.(entry);
        const job = await io.service.submitPrepared(entry.prepared, { signal, idempotencyKey: act.idempotency_key, beforeDispatch: () => {
                // A POST that waited (an upload) does not go out after the run stopped.
                if (io.stopped?.() === true)
                    throw new SubmissionStoppedError();
                sent = true;
            } });
        recordAccepted(io, act.a, act.key, job, capture);
        return { ...reply, answer: { status: 202 }, job_id: job.jobId };
    }
    catch (error) {
        if (error instanceof GeometryReferenceSubmissionError) {
            // An accepted job with an invalid geometry reference: the run stops (the host error).
            const accepted = error.acceptedJobIds[0];
            an.jobs.set(act.key, { tileId: entry.key, row: entry.row, col: entry.col, status: "failed",
                invalidReference: true, error: error.message, ...(accepted === undefined ? {} : { jobId: accepted }) });
            io.onInvalidReference?.();
            throw error;
        }
        return failedPost(act, error, sent);
    }
    finally {
        // Bound or not: an unbound hold releases its capture.
        free(capture);
    }
}
function free(capture) {
    if (capture !== undefined && !(capture instanceof Uint8Array))
        capture.free();
}
function failedPost(act, error, sent) {
    return { kind: "post_answer", a: act.a, key: act.key, answer: postFacts(error, sent),
        ...us(error.retryAfterS),
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
}
/** The facade capture of each prepared key, until a batch submit accepts it. */
const preparedCaptures = new WeakMap();
/** Batch submit: upload one key and make its request, no POST. A key with no batch form is POSTed alone. */
async function prepare(io, act, signal) {
    const an = io.analyses[act.a];
    const entry = an.entries.get(act.key);
    let request;
    try {
        request = await io.service.prepareBatchItem?.(entry.prepared, { signal });
    }
    catch (error) {
        return failedPost(act, error, false);
    }
    if (request === undefined)
        return post(io, { ...act, kind: "post" }, signal);
    let captures = preparedCaptures.get(an);
    if (captures === undefined)
        preparedCaptures.set(an, captures = new Map());
    const capture = await an.capture?.(entry);
    free(captures.get(act.key)); // a key prepared again (a new attempt)
    captures.set(act.key, capture);
    return { kind: "prepared", a: act.a, key: act.key, model: entry.prepared.analysisType,
        request: new TextDecoder().decode(request) };
}
/** The ONE POST of a batch body the engine wrote; its raw answer. */
async function postBatch(io, act, signal) {
    let sent = false;
    try {
        const response = await io.service.postBatch(act.body, { signal, beforeDispatch: () => {
                if (io.stopped?.() === true)
                    throw new SubmissionStoppedError();
                sent = true;
            } });
        const ok = response.status >= 200 && response.status < 300;
        const after = Number(response.headers.get("Retry-After") ?? Number.NaN);
        return { kind: "batch_answer", batch: act.batch, answer: { status: response.status },
            ...(ok ? { body: new TextDecoder().decode(response.content) } : {}), ...us(after) };
    }
    catch (error) {
        return { kind: "batch_answer", batch: act.batch, answer: postFacts(error, sent),
            ...us(error.retryAfterS),
            error: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
    }
}
/** A batch submit accepted a prepared key (no IO): what an accepted POST records. */
export function acceptedAction(io, act) {
    const an = io.analyses[act.a];
    const captures = preparedCaptures.get(an);
    const capture = captures?.get(act.key);
    captures?.delete(act.key);
    let job;
    try {
        job = jobFromResponse(act.body);
    }
    catch {
        // The engine checked the job id: the job is billed and must be recorded.
        job = { jobId: act.job_id, status: JobStatus.Pending };
    }
    recordAccepted(io, act.a, act.key, job, capture);
    free(capture);
}
/** The run is over: release the captures of keys no batch accepted. */
export function freePreparedCaptures(io) {
    for (const an of io.analyses) {
        for (const capture of preparedCaptures.get(an)?.values() ?? [])
            free(capture);
        preparedCaptures.delete(an);
    }
}
/** ONE status request: the batched route for the ids, or one per-job GET. */
async function poll(io, act, signal) {
    const statuses = new Map();
    try {
        if (act.batched) {
            const sweep = await io.service.getStatusBatch?.(act.job_ids, { signal });
            // No batched route (or only the account listing): the engine goes per job.
            if (sweep === undefined || sweep.lacking) {
                return { kind: "sweep", answer: { status: 404 }, job_ids: act.job_ids, status: [] };
            }
            // A chunk refused for good (401, 403, ...): its status, so the kernel ends the run.
            if (sweep.refusedStatus !== undefined) {
                return { kind: "sweep", answer: { status: sweep.refusedStatus }, job_ids: act.job_ids, status: [] };
            }
            // A request that failed (429/5xx, or no answer at all) is "after_send".
            if (sweep.failedIds !== undefined || !sweep.batched) {
                return { kind: "sweep", answer: "after_send", ...us(sweep.retryAfterS), job_ids: act.job_ids, status: [] };
            }
            for (const [job, value] of sweep.statuses)
                statuses.set(job, value);
        }
        else {
            statuses.set(act.job_ids[0], await io.service.getStatus(act.job_ids[0], { signal }));
        }
    }
    catch (error) {
        return { kind: "sweep", answer: rawAnswer(error), ...us(error.retryAfterS),
            job_ids: act.job_ids, status: [] };
    }
    const jobIds = [];
    const texts = [];
    // The server's error text of a failed job (the kernel asks per job when a batched answer has none).
    const errors = {};
    for (const [id, job] of statuses) {
        if (job.status === JobStatus.Failed && job.error)
            errors[id] = job.error;
        const where = io.byJob.get(id);
        const record = where === undefined ? undefined : io.analyses[where.a].jobs.get(where.key);
        if (record !== undefined) {
            record.lastJobSnapshot = job;
            record.status = status(job);
            if (job.error !== undefined)
                record.error = job.error;
        }
        jobIds.push(id);
        texts.push(job.status);
    }
    return { kind: "sweep", answer: { status: 200 }, job_ids: jobIds, status: texts,
        ...(Object.keys(errors).length === 0 ? {} : { errors }) };
}
async function download(io, act, signal) {
    const an = io.analyses[act.a];
    const key = io.byJob.get(act.job).key;
    const job = an.jobs.get(key);
    let archive;
    try {
        const once = io.service.downloadResultsOnce?.bind(io.service) ?? io.service.downloadResults.bind(io.service);
        archive = (await once(act.job, { signal, ...(job.lastJobSnapshot === undefined ? {} : { job: job.lastJobSnapshot }) })).content;
    }
    catch (error) {
        return { kind: "download_failed", job: act.job, answer: rawAnswer(error),
            ...us(error.retryAfterS) };
    }
    if (signal.aborted)
        throw signal.reason; // the run is over: never merge into a freed merger
    // Merged with the other downloads of this turn (one kernel call, D299).
    const refused = an.grid !== undefined ? await an.grid.push(job, archive)
        : an.surface !== undefined ? await an.surface.push(act.job, key, archive)
            : void an.archives?.set(act.job, archive);
    if (refused !== undefined)
        return { kind: "download_failed", job: act.job, answer: "unreadable_2xx" };
    return { kind: "download_done", job: act.job };
}
/** Do the IO of one action; the raw answer as one event. A rejection is a `host_error`. */
export function runAction(io, act, signal) {
    if (act.kind === "post")
        return post(io, act, signal);
    if (act.kind === "prepare")
        return prepare(io, act, signal);
    if (act.kind === "post_batch")
        return postBatch(io, act, signal);
    if (act.kind === "poll")
        return poll(io, act, signal);
    return download(io, act, signal);
}
/** The engine config of a run that sends `entries`: batch submit when one is binary and the API offers it. */
export async function batchConfig(service, binary, signal) {
    if (!binary || service.batchSubmit !== true || service.binaryCapability === undefined
        || service.postBatch === undefined)
        return {};
    try {
        const batch = (await service.binaryCapability(signal)).batchSubmit;
        return batch === undefined ? {} : { batch_submit: batch };
    }
    catch {
        return {}; // the first POST reads the capability again and reports its error
    }
}
