import { AuthPartitionChangedError } from "./auth.js";
import { withBinaryAdmission } from "./binary-admission.js";
import { binarySubmission, submitBinary, uploadGeometry, } from "./binary-submission.js";
import { storeKey } from "./geometry-url-store.js";
import { Deadline } from "./deadline.js";
import { exactAuthHeadersDigest, normalizeAuthHeaders, } from "./geometry-reuse/credentials.js";
import { GatewayTransport, TransportError } from "./transport.js";
/** `promise`, or a rejection the moment `signal` aborts — whichever is first.
 * `promise` itself keeps running for any other waiter; only THIS wait ends. */
function awaitAbortable(promise, signal) {
    if (signal === undefined)
        return promise;
    if (signal.aborted)
        return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    return new Promise((resolve, reject) => {
        const onAbort = () => { reject(signal.reason ?? new DOMException("aborted", "AbortError")); };
        signal.addEventListener("abort", onAbort, { once: true });
        promise.then((value) => { signal.removeEventListener("abort", onAbort); resolve(value); }, (error) => { signal.removeEventListener("abort", onAbort); reject(error); });
    });
}
/**
 * One archive, uploaded once per client for every submit that asks for it
 * while the upload runs (#602, T4): the jobs of a facade tile, and the same
 * tile of several area runs at the same time. The in-flight map lives on the
 * client's `urlCache`, keyed by `urlCacheKey` (gateway pair + auth digest),
 * so two auth partitions never share one upload.
 *
 * The upload itself carries NO caller's `signal` (only its `timeoutMs`
 * budget): one caller's abort never kills the upload for a sibling. Each
 * caller races the SHARED promise against its OWN `signal`. A rejected
 * upload rejects every waiter; the normal job retry covers it.
 */
async function sharedUpload(options, key, uploadGateway, prepared, keep, refresh = false) {
    const inFlight = options.urlCache.inFlight;
    let upload = inFlight.get(key);
    if (upload !== undefined) {
        // Another submit does this PUT: free the upload slot at once.
        options.stages?.uploaded();
        return awaitAbortable(upload, options.signal);
    }
    upload = (keep ? storedOrUploaded(options, key, uploadGateway, prepared, refresh)
        : uploadGeometry(uploadGateway, options.fetch, prepared, options.timeoutMs, undefined)
            .then((url) => ({ url, reused: false })))
        .finally(() => { inFlight.delete(key); });
    inFlight.set(key, upload);
    // The PUT may fail after every waiter stopped (an abort): mark it handled.
    upload.catch(() => undefined);
    try {
        return await awaitAbortable(upload, options.signal);
    }
    finally {
        options.stages?.uploaded();
    }
}
/**
 * The caller's `geometryUrlStore` first (not on a `refresh`), then the PUT. It
 * runs once per key: every other submit for the key waits on the same
 * in-flight promise. A URL is kept in the client's memory before the in-flight
 * entry goes, so a later submit finds one or the other; a new URL also goes to
 * the store (and overwrites a dead entry). `reused`: no PUT ran.
 */
async function storedOrUploaded(options, key, uploadGateway, prepared, refresh) {
    const cache = options.urlCache;
    const tagged = storeKey("irbf", key);
    const stored = refresh ? undefined : await cache.store?.get(tagged);
    if (stored !== undefined) {
        cache.set(key, stored.url, stored.expiresAt);
        return { url: stored.url, reused: true };
    }
    const url = await uploadGeometry(uploadGateway, options.fetch, prepared, options.timeoutMs, undefined);
    cache.set(key, url);
    cache.store?.set(tagged, url);
    return { url, reused: false };
}
/** A definite pre-accept refusal (no job exists) that a dead or expired
 * geometry URL can cause: 400, 404, 410 or 422. */
function refusedGeometry(error) {
    return error instanceof TransportError && error.phase === "response"
        && error.status !== undefined && [400, 404, 410, 422].includes(error.status);
}
/**
 * The server refused a REUSED URL (from memory or the store) before any job
 * (#816): forget it, upload again without the store, overwrite the entry.
 * Once per submit. Correctness does not depend on the expiry check.
 */
async function refreshedSubmission(options, key, uploadGateway, deadUrl) {
    options.urlCache.drop(key, deadUrl);
    try {
        const prepared = await encodeAdmitted(options, true);
        const known = options.urlCache.get(key);
        const url = known !== undefined && known !== deadUrl ? known
            : (await sharedUpload(options, key, uploadGateway, prepared, true, true)).url;
        return binarySubmission(prepared, url, options.resultFormat);
    }
    finally {
        options.releasePrepared();
    }
}
/** The client-level URL key: the gateway pair and the auth partition, so a
 * URL from one caller never reaches a submission in a different auth
 * partition, plus the encoding and the archive's own digest. */
function urlCacheKey(uploadBaseUrl, gatewayBaseUrl, digest, encoding, artifactDigest) {
    return [gatewayBaseUrl, uploadBaseUrl, digest ?? "", encoding, artifactDigest].join("\n");
}
/** The paid POST, in a POST slot of the area run when there is one. */
function post(options, send) {
    return options.stages === undefined ? send() : options.stages.post(send);
}
function boundAuth(headers, expected, auth) {
    return async () => {
        const current = await auth();
        if (await exactAuthHeadersDigest(current) !== expected) {
            throw new AuthPartitionChangedError();
        }
        return headers;
    };
}
async function resolveAuth(options) {
    const deadline = new Deadline(options.signal, options.timeoutMs);
    try {
        const headers = await deadline.wait(() => options.auth());
        return normalizeAuthHeaders(headers);
    }
    catch {
        const stopped = deadline.reason();
        throw new TransportError(stopped === "timeout" ? "gateway request timed out before dispatch" :
            stopped === "aborted" ? "gateway request was aborted before dispatch" :
                "gateway request authentication failed", "pre-dispatch", stopped ?? "auth", "POST");
    }
    finally {
        deadline.close();
    }
}
function transport(baseUrl, auth, options) {
    return new GatewayTransport({ baseUrl, auth, fetch: options.fetch, timeoutMs: options.timeoutMs });
}
/**
 * Encode one artifact under the process-wide admission (#816, D277). The
 * permit covers the CPU encode ONLY: the presign, the S3 PUT and the paid POST
 * run outside it, at the caller's worker count.
 */
function encodeAdmitted(options, fresh) {
    return withBinaryAdmission(() => options.prepare(fresh), options.signal);
}
async function prepareUncached(options, fresh) {
    try {
        const binary = await encodeAdmitted(options, fresh);
        const digest = await exactAuthHeadersDigest(await resolveAuth(options));
        const key = urlCacheKey(options.uploadGateway.baseUrl, options.gateway.baseUrl, digest, binary.artifact.encoding, binary.artifact.artifactDigest);
        const { url: geometryUrl } = await sharedUpload(options, key, options.uploadGateway, binary, false);
        return binarySubmission(binary, geometryUrl, options.resultFormat);
    }
    finally {
        options.releasePrepared();
    }
}
async function uncached(options, fresh) {
    const binary = await prepareUncached(options, fresh);
    return post(options, () => submitBinary(options.gateway, options.prepared, binary, options.parseJob, options.signal, options.beforeDispatch, options.idempotencyKey));
}
/** Coordinate strict shared-URL reuse with one safe, uncached compatibility fallback. */
export async function submitPreparedBinary(options) {
    if (!options.reuseEnabled)
        return uncached(options, false);
    const headers = await resolveAuth(options);
    const digest = await exactAuthHeadersDigest(headers);
    if (digest === undefined)
        return uncached(options, false);
    const strictAuth = boundAuth(headers, digest, options.auth);
    const gateway = transport(options.gateway.baseUrl, strictAuth, options);
    const uploadGateway = transport(options.uploadGateway.baseUrl, strictAuth, options);
    let paidDispatched = false;
    const beforeDispatch = () => {
        options.beforeDispatch?.();
        paidDispatched = true;
    };
    const send = (binary) => post(options, () => submitBinary(gateway, options.prepared, binary, options.parseJob, options.signal, beforeDispatch, options.idempotencyKey));
    try {
        let binary;
        let cacheKey;
        let url;
        let reused = true;
        try {
            const prepared = await encodeAdmitted(options, false);
            cacheKey = urlCacheKey(uploadGateway.baseUrl, gateway.baseUrl, digest, prepared.artifact.encoding, prepared.artifact.artifactDigest);
            url = options.urlCache.get(cacheKey);
            if (url === undefined)
                ({ url, reused } = await sharedUpload(options, cacheKey, uploadGateway, prepared, true));
            else
                options.stages?.uploaded();
            binary = binarySubmission(prepared, url, options.resultFormat);
        }
        finally {
            options.releasePrepared();
        }
        try {
            return await send(binary);
        }
        catch (error) {
            if (!reused || !refusedGeometry(error))
                throw error;
            return await send(await refreshedSubmission(options, cacheKey, uploadGateway, url));
        }
    }
    catch (error) {
        if (!(error instanceof AuthPartitionChangedError))
            throw error;
        if (paidDispatched)
            throw error;
        return uncached(options, true);
    }
}
