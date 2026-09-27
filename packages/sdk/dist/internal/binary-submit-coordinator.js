import { AuthPartitionChangedError } from "./auth.js";
import { withBinaryAdmission } from "./binary-admission.js";
import { binarySubmission, submitBinary, uploadGeometry, } from "./binary-submission.js";
import { Deadline } from "./deadline.js";
import { exactAuthHeadersDigest, normalizeAuthHeaders, } from "./geometry-reuse/credentials.js";
import { GatewayTransport, TransportError } from "./transport.js";
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
            const geometryUrl = await uploadGeometry(options.uploadGateway, options.fetch, binary, options.timeoutMs, options.signal);
            return binarySubmission(binary, geometryUrl);
        }
        finally {
            options.releasePrepared();
        }
    }, options.signal);
}
async function uncached(options, fresh) {
    const binary = await prepareUncached(options, fresh);
    return submitBinary(options.gateway, options.prepared, binary, options.parseJob, options.signal, options.beforeDispatch);
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
                const key = [gateway.baseUrl, uploadGateway.baseUrl, digest,
                    prepared.artifact.encoding, prepared.artifact.artifactDigest].join("\n");
                let url = options.urlCache.get(key);
                if (url === undefined) {
                    url = await uploadGeometry(uploadGateway, options.fetch, prepared, options.timeoutMs, options.signal);
                    options.urlCache.set(key, url);
                }
                return binarySubmission(prepared, url);
            }
            finally {
                options.releasePrepared();
            }
        }, options.signal);
        return await submitBinary(gateway, options.prepared, binary, options.parseJob, options.signal, beforeDispatch);
    }
    catch (error) {
        if (!(error instanceof AuthPartitionChangedError))
            throw error;
        if (paidDispatched)
            throw error;
        return uncached(options, true);
    }
}
