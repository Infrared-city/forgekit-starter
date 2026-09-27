/** The batched job-status read, and the fallback that makes it safe to ship.
 *
 * `GET /async/jobs?ids=a,b,c` answers for many jobs in one request
 * (gateway-service#309, `infrared-async-inference-stack` PR #46). A 5 km2
 * area is 81 jobs, so a sweep that cost 81 requests costs 2 — which is what
 * lets the poll interval drop from D52's 15 s ladder to a flat 2 s
 * (`docs/DEVIATIONS.md` D121).
 *
 * THE FALLBACK IS THE POINT. Production does not have this route and will
 * not for a while, so a released SDK must behave exactly as it did before
 * against a gateway that lacks it. There are two ways a gateway can lack it
 * and this module distinguishes them:
 *
 *   * It REJECTS the form (400/404/405/501). Nothing was learned; the caller
 *     asks per job.
 *   * It IGNORES the `ids` parameter and returns the account's whole job
 *     LISTING — a JSON array, which is what `GET /async/jobs` has always
 *     meant. That array is not what we asked for, but it does contain the
 *     jobs we asked about, so we read the answer out of it instead of
 *     throwing the bytes away.
 *
 * Either way the gateway is marked as lacking the route and no further
 * batched request is made for the life of the client, so the fat listing is
 * fetched at most once.
 *
 * A TRANSIENT failure (timeout, 429, 5xx, network) is NOT a verdict about
 * the route: those ids are simply left unanswered for the caller to ask
 * about per job, and the next sweep tries the batched form again.
 */
import { jobFromResponse } from "./job-response.js";
import { TransportError } from "./transport.js";
/**
 * Ids per request. It is the cap the endpoint documents and enforces, so it
 * is not ours to raise: `MaxBatchJobIDs` in
 * `infrared-async-inference-stack/internal/jobs_server/handlers_batch.go`.
 * DynamoDB's BatchGetItem takes 100 keys, so 50 keeps one chunk at one store
 * call with room for its UnprocessedKeys retry.
 */
export const STATUS_BATCH_LIMIT = 50;
/** HTTP statuses that mean "this gateway does not have the batched form". */
function rejectsTheForm(error) {
    if (!(error instanceof TransportError) || error.status === undefined)
        return false;
    return error.status === 400 || error.status === 404 || error.status === 405 || error.status === 501;
}
function chunk(ids) {
    const chunks = [];
    for (let start = 0; start < ids.length; start += STATUS_BATCH_LIMIT) {
        chunks.push(ids.slice(start, start + STATUS_BATCH_LIMIT));
    }
    return chunks;
}
/** Read the per-job objects out of either response shape. */
function readJobs(payload) {
    if (Array.isArray(payload))
        return { jobs: payload, batched: false };
    if (payload !== null && typeof payload === "object") {
        const jobs = payload.jobs;
        if (Array.isArray(jobs))
            return { jobs, batched: true };
    }
    return undefined;
}
async function fetchChunk(gateway, ids, signal) {
    const query = ids.map((id) => encodeURIComponent(id)).join(",");
    let payload;
    try {
        payload = await gateway.requestJson(`/async/jobs?ids=${query}`, signal === undefined ? {} : { signal });
    }
    catch (error) {
        if (rejectsTheForm(error))
            return "unsupported";
        throw error;
    }
    const read = readJobs(payload);
    // A 200 whose body is neither shape is a gateway we do not understand.
    // Treated as "does not have it" rather than retried: the body will not
    // become a different shape on the next sweep.
    if (read === undefined)
        return "unsupported";
    const statuses = new Map();
    for (const entry of read.jobs) {
        let job;
        try {
            job = jobFromResponse(entry);
        }
        catch {
            // One unparseable entry leaves its id unanswered; it must not cost the
            // other 49 their answer.
            continue;
        }
        statuses.set(job.jobId, job);
    }
    return { statuses, batched: read.batched };
}
/**
 * Ask for many job statuses at once.
 *
 * Never throws for a gateway reason: every id it could not settle comes back
 * in `unanswered`. `signal` aborts are re-thrown, because an aborted run must
 * stop rather than degrade into a per-job sweep.
 */
export async function fetchStatusBatch(gateway, jobIds, options = {}) {
    const statuses = new Map();
    const unanswered = [];
    // Neither proven nor disproven until a chunk answers. A sweep whose every
    // chunk failed transiently must leave the verdict where it found it.
    let answered = 0;
    let lacking = false;
    if (jobIds.length === 0)
        return { statuses, unanswered, batched: false, lacking: false };
    const chunks = chunk(jobIds);
    const workers = Math.max(1, Math.min(options.maxWorkers ?? 5, chunks.length));
    let cursor = 0;
    await Promise.all(Array.from({ length: workers }, async () => {
        while (cursor < chunks.length) {
            const ids = chunks[cursor++];
            if (ids === undefined)
                return;
            let answer;
            try {
                answer = await fetchChunk(gateway, ids, options.signal);
            }
            catch (error) {
                if (options.signal?.aborted === true)
                    throw error;
                unanswered.push(...ids);
                continue;
            }
            if (answer === "unsupported") {
                lacking = true;
                unanswered.push(...ids);
                continue;
            }
            if (answer.batched)
                answered += 1;
            else
                lacking = true;
            for (const id of ids) {
                const job = answer.statuses.get(id);
                // The listing shape answers for the whole account, so an id missing
                // from it is genuinely unknown; the batched shape names its unknown
                // ids separately and they are simply absent here. Both land in
                // `unanswered`, which re-asks per job — the same treatment, and the
                // same failure counting, a 404 has always had.
                if (job === undefined)
                    unanswered.push(id);
                else
                    statuses.set(id, job);
            }
        }
    }));
    return { statuses, unanswered, batched: answered > 0, lacking };
}
