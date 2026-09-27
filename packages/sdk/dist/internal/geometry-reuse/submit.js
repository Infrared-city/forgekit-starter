/** The transports and the two POSTs the geometry-reuse controller makes.
 *
 * Split out of `controller.ts` under the 400-line rule: this module is the
 * wire plumbing — bind a partition, submit a body, upload a document — and the
 * controller above it is the policy: plan, reference, verdict.
 */
import { AuthPartitionChangedError } from "../auth.js";
import { requireCore } from "../core.js";
import { submitArchive, uploadArchive } from "../submission.js";
import { GatewayTransport } from "../transport.js";
import { jsonWireBytes } from "../wire-json.js";
import { jobFromResponse } from "../../jobs.js";
import { credentialPartition } from "./credentials.js";
import { GeometryReferenceAcknowledgementError } from "./errors.js";
function expectedAck(value, groups) {
    const job = jobFromResponse(value);
    let acknowledged = false;
    let reason = "geometry acknowledgement verifier failed";
    try {
        const verdict = JSON.parse(requireCore().verifyGeometryAck(JSON.stringify(value), [...groups]));
        acknowledged = verdict.status === "acknowledged";
        if (typeof verdict.reason === "string")
            reason = verdict.reason;
    }
    catch {
        // The accepted job stays invalid when the verifier is unavailable.
    }
    if (!acknowledged)
        throw new GeometryReferenceAcknowledgementError([job.jobId], reason);
    return job;
}
/** Bind one partition's transports, refusing a mid-run credential swap. */
export function bound(options, partitionKey, signal, beforeDispatch) {
    const auth = async () => {
        const headers = await options.auth();
        if (await credentialPartition(options.baseUrl, headers) !== partitionKey) {
            throw new AuthPartitionChangedError();
        }
        return headers;
    };
    return {
        gateway: new GatewayTransport({ baseUrl: options.baseUrl, auth, fetch: options.fetch, timeoutMs: options.timeoutMs }),
        uploadGateway: new GatewayTransport({
            baseUrl: options.gatewayBaseUrl, auth, fetch: options.fetch, timeoutMs: options.timeoutMs,
        }),
        fetch: options.fetch,
        thresholdBytes: options.thresholdBytes,
        timeoutMs: options.timeoutMs,
        ...(signal === undefined ? {} : { signal }),
        ...(beforeDispatch === undefined ? {} : { beforeDispatch }),
    };
}
/** POST one body, verifying the acknowledgement when groups were referenced. */
export async function submitBody(analysisType, body, transport, groups = []) {
    // Byte for byte `JSON.stringify(body)`, with an area tile's groups written
    // from the kernel arena's own bytes (`internal/wire-json.ts`).
    const json = jsonWireBytes(body);
    if (json === undefined)
        throw new TypeError("request has no JSON wire form");
    return submitArchive({
        endpointPath: `/async/${encodeURIComponent(analysisType)}`,
        archive: requireCore().zipPayloadJson(json),
        gateway: transport.gateway,
        uploadGateway: transport.uploadGateway,
        fetch: transport.fetch,
        thresholdBytes: transport.thresholdBytes,
        timeoutMs: transport.timeoutMs,
        ...(transport.beforeDispatch === undefined ? {} : { beforeDispatch: transport.beforeDispatch }),
        parseAccepted: groups.length === 0
            ? jobFromResponse
            : (value) => expectedAck(value, groups),
        ...(transport.signal === undefined ? {} : { signal: transport.signal }),
    });
}
/** Upload one geometry document and return its presigned GET URL. */
export async function uploadGeometry(bytes, transport) {
    return uploadArchive({
        archive: requireCore().zipPayloadJson(bytes),
        uploadGateway: transport.uploadGateway,
        fetch: transport.fetch,
        timeoutMs: transport.timeoutMs,
        ...(transport.signal === undefined ? {} : { signal: transport.signal }),
    });
}
