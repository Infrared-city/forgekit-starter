import { AuthPartitionChangedError } from "./auth.js";
import { withBinaryAdmission } from "./binary-admission.js";
import { binarySubmission, submitBinary, uploadGeometry, } from "./binary-submission.js";
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
 * One archive, uploaded once for every caller that shares `key` in
 * `uploads` right now (#602). The upload itself carries NO caller's
 * `signal` — only its `timeoutMs` budget — so one caller's abort can never
 * kill the upload for a sibling still waiting on it; each caller (the one
 * that started the upload included) races the SHARED promise against its
 * OWN `signal` here.
 *
 * A rejected shared upload rejects every waiter, owner included; there is
 * no per-waiter retry (#602 simplify). The normal job retry covers it.
 */
async function sharedUpload(uploads, key, uploadGateway, fetch, prepared, timeoutMs, signal) {
    let upload = uploads.get(key);
    if (upload === undefined) {
        upload = uploadGeometry(uploadGateway, fetch, prepared, timeoutMs, undefined)
            .finally(() => { uploads.delete(key); });
        uploads.set(key, upload);
    }
    return awaitAbortable(upload, signal);
}
/** The in-flight upload key within one run: one run shares one auth, so the
 * key only needs to tell archives apart (#602 simplify). */
function uploadsKey(encoding, artifactDigest) {
    return `${encoding}\n${artifactDigest}`;
}
/** The persistent URL-cache key (unchanged by #602 simplify): the gateway
 * pair and the auth partition, so a cached URL from one caller never
 * reaches a submission in a different auth partition, plus the encoding
 * and the archive's own digest. */
function urlCacheKey(uploadBaseUrl, gatewayBaseUrl, digest, encoding, artifactDigest) {
    return [gatewayBaseUrl, uploadBaseUrl, digest ?? "", encoding, artifactDigest].join("\n");
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
async function prepareUncached(options, fresh) {
    return withBinaryAdmission(async () => {
        try {
            const binary = await options.prepare(fresh);
            // No `uploads` map: a direct, single submit. One upload, no sharing.
            if (options.uploads === undefined) {
                const geometryUrl = await uploadGeometry(options.uploadGateway, options.fetch, binary, options.timeoutMs, options.signal);
                return binarySubmission(binary, geometryUrl, options.resultFormat);
            }
            const key = uploadsKey(binary.artifact.encoding, binary.artifact.artifactDigest);
            const geometryUrl = await sharedUpload(options.uploads, key, options.uploadGateway, options.fetch, binary, options.timeoutMs, options.signal);
            return binarySubmission(binary, geometryUrl, options.resultFormat);
        }
        finally {
            options.releasePrepared();
        }
    }, options.signal);
}
async function uncached(options, fresh) {
    const binary = await prepareUncached(options, fresh);
    return submitBinary(options.gateway, options.prepared, binary, options.parseJob, options.signal, options.beforeDispatch, options.idempotencyKey);
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
    try {
        const binary = await withBinaryAdmission(async () => {
            try {
                const prepared = await options.prepare(false);
                const cacheKey = urlCacheKey(uploadGateway.baseUrl, gateway.baseUrl, digest, prepared.artifact.encoding, prepared.artifact.artifactDigest);
                let url = options.urlCache.get(cacheKey);
                if (url === undefined) {
                    if (options.uploads === undefined) {
                        url = await uploadGeometry(uploadGateway, options.fetch, prepared, options.timeoutMs, options.signal);
                    }
                    else {
                        const key = uploadsKey(prepared.artifact.encoding, prepared.artifact.artifactDigest);
                        url = await sharedUpload(options.uploads, key, uploadGateway, options.fetch, prepared, options.timeoutMs, options.signal);
                    }
                    options.urlCache.set(cacheKey, url);
                }
                return binarySubmission(prepared, url, options.resultFormat);
            }
            finally {
                options.releasePrepared();
            }
        }, options.signal);
        return await submitBinary(gateway, options.prepared, binary, options.parseJob, options.signal, beforeDispatch, options.idempotencyKey);
    }
    catch (error) {
        if (!(error instanceof AuthPartitionChangedError))
            throw error;
        if (paidDispatched)
            throw error;
        return uncached(options, true);
    }
}
