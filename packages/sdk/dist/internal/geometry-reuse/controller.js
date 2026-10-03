import { AuthPartitionChangedError } from "../auth.js";
import { requireCore } from "../core.js";
import { GeometryReferenceRejectedError, SubmissionUncertainError } from "../submission.js";
import { TransportError } from "../transport.js";
import { GeometryReuseCapacityError, getGeometryReuseCache } from "./cache.js";
import { joinParts, sha256HexParts } from "./canonical.js";
import { credentialPartition } from "./credentials.js";
import { GeometryReferenceAcknowledgementError, GeometryReferenceSubmissionError, } from "./errors.js";
import { bodyWithReference, prepareGeometryGroups, selectedDocumentParts, } from "./identity.js";
import { notifyCapability, safeLog } from "./observer.js";
import { bound, submitBody, uploadGeometry } from "./submit.js";
import { expiryFromUrl } from "./expiry.js";
const DIRECT_SCOPE = "direct-v1";
const DEAD_REF_CODES = new Set(["REF_EXPIRED", "REF_NOT_FOUND"]);
const INTERIOR_ANALYSES = new Set([
    "daylight-factor", "energy-balance", "spatial-daylight-autonomy",
]);
/**
 * Plan with each group's size, so a small group stays inline (D201). The
 * mechanism tests send a few triangles on purpose and turn it off; production
 * never does.
 */
export const planning = { withSizes: true };
function parsePlan(prepared, snapshot) {
    const sizes = {};
    for (const name of Object.keys(prepared.identities)) {
        const bytes = prepared.bytes[name];
        if (bytes !== undefined)
            sizes[name] = bytes.byteLength;
    }
    return JSON.parse(requireCore().planGeometryReuse(JSON.stringify(prepared.identities), JSON.stringify(snapshot.state), Date.now() / 1_000, planning.withSizes ? JSON.stringify(sizes) : undefined));
}
async function referenceFromPlan(planValue, prepared, snapshot) {
    if (planValue === null || typeof planValue !== "object" || Array.isArray(planValue))
        return undefined;
    const plan = planValue;
    if (typeof plan.reference === "string") {
        const matches = snapshot.state.documents.filter((item) => item.key === plan.reference);
        if (matches.length !== 1)
            return undefined;
        const document = matches[0];
        const url = snapshot.urls[document.key];
        if (Object.entries(document.groups).some(([name, identity]) => prepared.identities[name] !== identity))
            return undefined;
        const parts = selectedDocumentParts(prepared, document.groups);
        if (url === undefined || parts === undefined)
            return undefined;
        return { key: document.key, groups: document.groups, parts, url, cached: true };
    }
    if (plan.upload === null || typeof plan.upload !== "object" || Array.isArray(plan.upload))
        return undefined;
    const groups = plan.upload.groups;
    if (groups === null || typeof groups !== "object" || Array.isArray(groups) || Object.keys(groups).length === 0) {
        return undefined;
    }
    const selected = groups;
    if (Object.entries(selected).some(([name, identity]) => prepared.identities[name] !== identity))
        return undefined;
    const parts = selectedDocumentParts(prepared, selected);
    if (parts === undefined)
        return undefined;
    const digest = await sha256HexParts(parts);
    return digest === undefined ? undefined : { key: `gref1:${digest}`, groups: selected, parts, cached: false };
}
function unsafeCandidate(error) {
    if (error instanceof GeometryReferenceAcknowledgementError)
        throw error;
    if (error instanceof GeometryReferenceRejectedError)
        throw error;
    // An abort is an abort (#347). The caller stopped this run; calling that an
    // invalid geometry reference marks the schedule permanently unresumable and
    // closes `retryFrom`, which is the one recovery an interrupted run needs.
    if (error instanceof TransportError && error.reason === "aborted")
        throw error;
    if (error instanceof SubmissionUncertainError) {
        throw new GeometryReferenceSubmissionError(error.acceptedJobIds, error.status === undefined ? "accepted-response-invalid" : "endpoint-response-uncertain");
    }
    if (error instanceof TransportError && error.phase === "unknown-acceptance") {
        throw new GeometryReferenceSubmissionError([], "endpoint-post-failed");
    }
    if (error instanceof TransportError && error.status !== undefined &&
        ((error.status >= 300 && error.status < 400) || error.status >= 500)) {
        throw new GeometryReferenceSubmissionError([], "endpoint-response-uncertain");
    }
    throw error;
}
async function executePlan(prepared, analysisType, partitionKey, scopeKey, transport, recover, logger) {
    const cache = getGeometryReuseCache();
    try {
        return await cache.withScope(partitionKey, scopeKey, async () => {
            const snapshot = cache.snapshot(partitionKey, scopeKey);
            let reference;
            try {
                reference = await referenceFromPlan(parsePlan(prepared, snapshot), prepared, snapshot);
            }
            catch {
                safeLog(logger, "warn", "geometry_ref_fallback", "planning failed");
                return { kind: "prepost" };
            }
            if (reference === undefined) {
                cache.observe(partitionKey, scopeKey, prepared.identities);
                return { kind: "prepost" };
            }
            // The document is named by its content (D201): the partition uploads it
            // once for every job that sends it. A URL this call did not PUT is
            // `cached`, so a dead-reference answer refreshes it.
            const shared = async (planned) => {
                const { url, fresh } = await cache.sharedUpload(partitionKey, planned.key, () => uploadGeometry(joinParts(planned.parts), transport), transport.signal);
                return { ...planned, url, cached: !fresh };
            };
            if (reference.url === undefined) {
                try {
                    reference = await shared(reference);
                }
                catch {
                    safeLog(logger, "warn", "geometry_ref_fallback", "geometry upload failed");
                    return { kind: "prepost" };
                }
            }
            let referenceUrl = reference.url;
            if (referenceUrl === undefined)
                return { kind: "prepost" };
            let refreshed = false;
            while (true) {
                try {
                    const job = await submitBody(analysisType, bodyWithReference(prepared.body, reference.groups, referenceUrl), transport, Object.keys(reference.groups).sort());
                    try {
                        cache.acknowledge(partitionKey, scopeKey, {
                            key: reference.key, groups: reference.groups, url: referenceUrl,
                            current: prepared.identities, expiresAt: expiryFromUrl(referenceUrl),
                        });
                    }
                    catch {
                        safeLog(logger, "warn", "geometry_ref_state", "accepted state could not be saved");
                    }
                    return { kind: "job", job };
                }
                catch (error) {
                    if (error instanceof GeometryReferenceAcknowledgementError) {
                        // §5's first verb: the document the server refused to acknowledge
                        // must not stay in the reuse map with its URL.
                        cache.invalidate(partitionKey, scopeKey, reference.key, referenceUrl);
                        await cache.dropUpload(partitionKey, reference.key, referenceUrl);
                    }
                    if (!(error instanceof GeometryReferenceRejectedError))
                        unsafeCandidate(error);
                    if (!recover)
                        return { kind: "ref-rejected", code: error.code };
                    if (reference.cached && !refreshed && DEAD_REF_CODES.has(error.code)) {
                        cache.invalidate(partitionKey, scopeKey, reference.key, referenceUrl);
                        await cache.dropUpload(partitionKey, reference.key, referenceUrl);
                        try {
                            reference = await shared(reference);
                            referenceUrl = reference.url;
                            refreshed = true;
                            continue;
                        }
                        catch {
                            safeLog(logger, "warn", "geometry_ref_fallback", "geometry refresh failed");
                            return { kind: "prepost" };
                        }
                    }
                    safeLog(logger, "warn", "geometry_ref_fallback", `server rejected ${error.code}`);
                    return { kind: "ref-rejected", code: error.code };
                }
            }
        }, transport.signal);
    }
    catch (error) {
        if (!(error instanceof GeometryReuseCapacityError))
            throw error;
        safeLog(logger, "warn", "geometry_ref_fallback", "scope capacity is full");
        return { kind: "prepost" };
    }
}
/** Return undefined only when the caller must use the unchanged inline path. */
export async function tryGeometryReuse(preparedSubmission, options, signal, beforeDispatch, idempotencyKey) {
    if (INTERIOR_ANALYSES.has(preparedSubmission.analysisType))
        return undefined;
    const prepared = await prepareGeometryGroups(preparedSubmission.body);
    if (Object.keys(prepared.identities).length === 0)
        return undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const headers = await options.auth();
        const partitionKey = await credentialPartition(options.baseUrl, headers);
        if (partitionKey === undefined)
            return undefined;
        const transport = bound(options, partitionKey, signal, beforeDispatch, idempotencyKey);
        try {
            return await submitInPartition(preparedSubmission, prepared, partitionKey, transport, options);
        }
        catch (error) {
            if (!(error instanceof AuthPartitionChangedError) || attempt === 1)
                throw error;
        }
    }
    throw new Error("unreachable credential partition state");
}
async function submitInPartition(preparedSubmission, prepared, partitionKey, transport, options) {
    const cache = getGeometryReuseCache();
    if (cache.getCapability(partitionKey) === undefined) {
        const first = await cache.firstUse(partitionKey, () => establish(preparedSubmission, prepared, partitionKey, transport, options), transport.signal);
        if (first.owned)
            return first.value;
        // This caller was parked on a first use that has just answered: it reads
        // the verdict below and goes inline when the field is unsupported.
    }
    if (cache.getCapability(partitionKey) !== "supported") {
        return submitBody(preparedSubmission.analysisType, prepared.body, transport);
    }
    return referenced(preparedSubmission, prepared, partitionKey, transport, options);
}
/**
 * The FIRST reference-carrying submission of a partition, which also settles
 * the capability verdict. There is no separate billed probe job (D71).
 *
 * The job returned is the caller's own real, billed job. A verdict is recorded
 * only from an ACCEPTED answer — an exact acknowledgement, or a missing one.
 * Anything else teaches nothing about the deployment and records no verdict;
 * the next submission asks again.
 */
async function establish(preparedSubmission, prepared, partitionKey, transport, options) {
    const cache = getGeometryReuseCache();
    try {
        const outcome = await executePlan(prepared, preparedSubmission.analysisType, partitionKey, preparedSubmission.reuseScope ?? DIRECT_SCOPE, transport, true, options.logger);
        if (outcome.kind === "job") {
            cache.setCapability(partitionKey, "supported");
            notifyCapability(options, "supported", [outcome.job.jobId]);
            return outcome.job;
        }
        // Nothing was accepted: a `REF_*` rejection and an upload failure both
        // happen before a job exists, so one inline submission is the whole cost.
        return await submitBody(preparedSubmission.analysisType, prepared.body, transport);
    }
    catch (error) {
        if (error instanceof GeometryReferenceAcknowledgementError) {
            cache.setCapability(partitionKey, "unsupported");
            notifyCapability(options, "unsupported", error.acceptedJobIds);
            throw error;
        }
        if (error instanceof AuthPartitionChangedError)
            throw error;
        // A plain 400/422 on the referencing body is a CONFIRMED pre-accept
        // failure — no job exists — and §5 permits one automatic inline fallback
        // for exactly that. Reachable since the default flip: a deployment whose
        // accept schema rejects the unknown field outright answers this way
        // instead of ignoring it or naming a `REF_*` code.
        if (error instanceof TransportError && (error.status === 400 || error.status === 422)) {
            safeLog(options.logger, "warn", "geometry_ref_fallback", `server rejected ${error.status}`);
            return await submitBody(preparedSubmission.analysisType, prepared.body, transport);
        }
        throw error;
    }
}
/** Submit against a partition already known to resolve the field. */
async function referenced(preparedSubmission, prepared, partitionKey, transport, options) {
    const cache = getGeometryReuseCache();
    try {
        const outcome = await executePlan(prepared, preparedSubmission.analysisType, partitionKey, preparedSubmission.reuseScope ?? DIRECT_SCOPE, transport, true, options.logger);
        if (outcome.kind === "job")
            return outcome.job;
        return submitBody(preparedSubmission.analysisType, prepared.body, transport);
    }
    catch (error) {
        if (error instanceof GeometryReferenceAcknowledgementError) {
            cache.setCapability(partitionKey, "unsupported");
            notifyCapability(options, "unsupported", error.acceptedJobIds);
        }
        throw error;
    }
}
