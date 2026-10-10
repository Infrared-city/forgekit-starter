import { bodyArtifact } from "./binary-artifact.js";
import { SubmissionUncertainError } from "./submission.js";
import { checkFacadeArtifact, isSurfaceBody } from "./facade-artifact-guard.js";
import { dispatchKeyed } from "./idempotent-dispatch.js";
import { TransportError } from "./transport.js";
import { uploadPresignedZip } from "./upload.js";
import { requireCore } from "./core.js";
import { delay } from "./deadline.js";
// Control travels in the API request, not in the uploaded geometry file.
const MAX_CONTROL_METADATA_BYTES = 4_194_304;
/**
 * The body fields the geometry document carries (kernel-owned, D206): every
 * geometry group plus the BYO `sensor-points` / `sensor-normals`. Every other
 * body field is control, which stays small and fixed in size.
 */
function geometryFields() {
    return Array.from(requireCore().binaryGeometryFields());
}
export async function capability(gateway, signal) {
    const raw = await gateway.requestJson("/binary/v1/capabilities", signal === undefined ? {} : { signal });
    const value = object(raw, "binary capability");
    if (value.inputFormat !== "irbf" || value.resultFormat !== "irbf" || value.wireVersion !== 1) {
        throw new TypeError("gateway has an incompatible binary wire format");
    }
    // The geometry document schemas this server reads (D206); a server that
    // lists none is older and reads schema 1 only. Checked in `prepareBinary`.
    const geometrySchemas = Array.isArray(value.geometrySchemas)
        ? value.geometrySchemas : [1];
    const limits = object(value.limits, "binary limits");
    const parsedLimits = {
        maxGeometryBytes: positive(limits.maxGeometryBytes, 67_108_864, "maxGeometryBytes"),
        // Ground polygons and point vegetation share this bounded input metadata budget.
        maxMetadataBytes: positive(limits.maxMetadataBytes, 8_388_608, "maxMetadataBytes"),
        maxMeshes: positive(limits.maxMeshes, 100_000, "maxMeshes"),
        maxInstances: positive(limits.maxInstances, 100_000, "maxInstances"),
        maxResultBytes: positive(limits.maxResultBytes, 268_435_456, "maxResultBytes"),
        maxResultCells: positive(limits.maxResultCells, 16_777_216, "maxResultCells"),
        maxTriangleValues: positive(limits.maxTriangleValues, 67_108_864, "maxTriangleValues"),
    };
    const models = object(value.models, "binary capability models");
    for (const [name, raw] of Object.entries(models)) {
        const model = object(raw, `binary model ${name}`);
        if (!Array.isArray(model.geometryGroups) || !model.geometryGroups.every((item) => typeof item === "string")
            || !Array.isArray(model.resultFamilies) || !model.resultFamilies.every((item) => typeof item === "string")) {
            throw new TypeError(`binary model ${name} is invalid`);
        }
    }
    // #602: a positive safe integer means the server reads `targets`; anything
    // else (absent, zero, negative, not an integer) means an older server.
    const facadeTargets = Number.isSafeInteger(value.facadeTargets) && value.facadeTargets > 0
        ? value.facadeTargets : undefined;
    return { inputFormat: "irbf", resultFormat: "irbf", wireVersion: 1, geometrySchemas, models,
        limits: parsedLimits, ...(facadeTargets === undefined ? {} : { facadeTargets }) };
}
/**
 * The checks of a binary route that hold for every job of a run: the geometry
 * schema and the model's binary route. An area run makes them once, before
 * its first paid POST (#816, D277); each job makes them again here.
 */
export function checkBinaryRoute(analysisType, supported) {
    // Geometry schema 2 (D206): this SDK writes the schema its kernel writes,
    // and only to a server that reads it; refuse before any upload or charge.
    const schema = requireCore().geometrySchemaVersion();
    const schemas = supported.geometrySchemas ?? [1];
    if (!schemas.includes(schema)) {
        throw new TypeError(`this endpoint reads binary geometry schema(s) ${JSON.stringify(schemas)}; `
            + `this SDK writes schema ${schema}. The server needs the geometry schema ${schema} update.`);
    }
    const model = supported.models[analysisType];
    if (model === undefined || !Array.isArray(model.geometryGroups)
        || !Array.isArray(model.resultFamilies) || model.resultFamilies.length === 0) {
        throw new TypeError(`model ${analysisType} does not support binary transport`);
    }
    return model;
}
export async function prepareBinary(prepared, supported) {
    const model = checkBinaryRoute(prepared.analysisType, supported);
    // Trees travel as the `vegetation` group on every outdoor binary route,
    // wind and PWC included (D249): the wind worker boxes them server-side.
    const body = { ...prepared.body };
    const fields = geometryFields();
    const present = fields.filter((name) => {
        const value = body[name];
        return value !== undefined && value !== null && typeof value === "object";
    });
    for (const name of present)
        if (!model.geometryGroups.includes(name)) {
            throw new TypeError(`model ${prepared.analysisType} does not support binary geometry group ${name}`);
        }
    const control = { ...body };
    for (const name of fields)
        delete control[name];
    delete control["binary-results"];
    const controlJson = JSON.stringify(control);
    if (controlJson === undefined)
        throw new TypeError("binary control has no JSON wire form");
    canonicalJsonBytes(controlJson, Math.min(supported.limits.maxMetadataBytes, MAX_CONTROL_METADATA_BYTES), "binary control");
    // The control is bounded BEFORE anything is encoded: an oversized control
    // fails here, unbilled, and pays for no artifact.
    const tile = prepared.artifact === undefined
        ? bodyArtifact(prepared.body, supported.limits)
        // #602: only the facade artifact getter reads `facadeTargets` (scene
        // mode); `bodyArtifact` never sees it.
        : prepared.artifact({ ...supported.limits, facadeTargets: supported.facadeTargets ?? 0 });
    // D156: an area facade batch must upload exactly its planned targets, or
    // the server synthesizes (and bills) sensors the plan never counted.
    if (prepared.artifact !== undefined && isSurfaceBody(prepared.body)) {
        checkFacadeArtifact(prepared.analysisType, prepared.body, tile);
    }
    const artifact = tile;
    return { artifact, control, limits: supported.limits };
}
export async function uploadGeometry(uploadGateway, fetch, prepared, timeoutMs, signal) {
    const response = await resending(() => uploadGateway.requestJson("/uploads/presign", {
        method: "POST", body: { content_length: prepared.artifact.archive.byteLength },
        ...(signal === undefined ? {} : { signal }),
    }), signal);
    const value = object(response, "presign response");
    const uploadUrl = https(value["upload-url"], "upload-url");
    const getUrl = https(value["get-url"], "get-url");
    await resending(() => uploadPresignedZip(uploadUrl, prepared.artifact.archive, { fetch, timeoutMs,
        ...(signal === undefined ? {} : { signal }) }), signal);
    return getUrl;
}
/** The presign and S3 PUT answer that is sent again after a short wait. */
const RATE_LIMITED = 429;
/** Attempts for one presign or one PUT, the first one included. */
const UPLOAD_ATTEMPTS = 5;
/**
 * Send again on a rate-limit (429) answer, with jittered backoff (at most
 * 4 s), as the Python host does (#816, D276/D277). Both calls are safe to
 * send again: a presign makes a new signed URL, and a PUT of the same bytes
 * to the same URL writes the same object. No paid request is sent here. A
 * 5xx still fails the upload at once (#602 simplify); the job retry covers it.
 */
async function resending(send, signal) {
    for (let attempt = 1;; attempt += 1) {
        try {
            return await send();
        }
        catch (error) {
            if (attempt >= UPLOAD_ATTEMPTS || !(error instanceof TransportError) || error.reason !== "http"
                || error.status !== RATE_LIMITED)
                throw error;
            try {
                await delay(Math.min(4_000, 250 * 2 ** (attempt - 1)) * (0.5 + Math.random()), signal ?? new AbortController().signal);
            }
            catch {
                throw new TransportError("upload was aborted while waiting to send again", "pre-dispatch", "aborted", error.method);
            }
        }
    }
}
export function binarySubmission(binary, geometryUrl, resultFormat = "irbf") {
    return { geometry: { url: geometryUrl, encoding: binary.artifact.encoding,
            artifactDigest: binary.artifact.artifactDigest,
            contentDigest: binary.artifact.geometryContentDigest,
            byteLength: binary.artifact.archive.byteLength }, control: binary.control, limits: binary.limits,
        resultFormat,
        ...(binary.artifact.targets === undefined ? {} : { targets: binary.artifact.targets }) };
}
export async function submitBinary(gateway, prepared, binary, parseJob, signal, beforeDispatch, idempotencyKey) {
    const envelope = JSON.stringify({ inputFormat: "irbf", resultFormat: binary.resultFormat,
        wireVersion: 1, geometry: binary.geometry, control: binary.control,
        ...(binary.targets === undefined ? {} : { targets: binary.targets }) });
    const body = canonicalJsonBytes(envelope, Math.min(binary.limits.maxMetadataBytes, MAX_CONTROL_METADATA_BYTES) + 65_536, "binary submission envelope");
    const endpointPath = `/binary/v1/async/${encodeURIComponent(prepared.analysisType)}`;
    const headers = { "Content-Type": "application/json",
        ...(idempotencyKey === undefined ? {} : { "Idempotency-Key": idempotencyKey }) };
    let response;
    // One keyed POST, resent with the SAME key up to the kernel's resend
    // budget (D224); see `internal/idempotent-dispatch.ts`'s `dispatchKeyed`,
    // the ONE resend loop both transports call.
    try {
        response = await dispatchKeyed({
            gateway, endpointPath, body, headers,
            ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
            ...(beforeDispatch === undefined ? {} : { beforeDispatch }),
            ...(signal === undefined ? {} : { signal }),
        });
    }
    catch (error) {
        if (error instanceof SubmissionUncertainError)
            throw error;
        if (error instanceof TransportError && error.phase !== "pre-dispatch") {
            throw new SubmissionUncertainError([]);
        }
        throw error;
    }
    const rejected = response.status < 200 || response.status >= 300;
    // A KEYED call returns a non-2xx only when the kernel said `definite_fail`:
    // the submit failed, and the kernel already decided (no uncertain here).
    if (rejected && idempotencyKey !== undefined) {
        throw new TransportError(`binary submission received HTTP ${response.status}`, "response", "http", "POST", response.status);
    }
    let raw;
    try {
        raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(response.content));
    }
    catch {
        throw new SubmissionUncertainError([]);
    }
    if (rejected) {
        if (!preacceptRejection(response.status, raw)) {
            throw new SubmissionUncertainError(jobIds(raw));
        }
        throw new TransportError(`binary submission received HTTP ${response.status}`, "response", "http", "POST", response.status);
    }
    let record;
    let job;
    try {
        record = object(raw, "binary accepted response");
        job = parseJob(record);
    }
    catch {
        throw new SubmissionUncertainError(jobIds(raw));
    }
    try {
        validateAck(record.binary, binary.geometry, binary.resultFormat);
    }
    catch {
        throw new SubmissionUncertainError([job.jobId]);
    }
    return job;
}
function preacceptRejection(status, raw) {
    if (![400, 401, 402, 404, 413, 415, 422, 429].includes(status)
        || raw === null || typeof raw !== "object" || Array.isArray(raw))
        return false;
    const value = raw;
    return Object.keys(value).sort().join() === "code,detail,status,title,type"
        && value.status === status && value.code === "JOB_BINARY_REJECTED"
        && [value.type, value.title, value.detail].every((item) => typeof item === "string");
}
function validateAck(raw, geometry, resultFormat) {
    const value = object(raw, "binary acknowledgement");
    if (value.inputFormat !== "irbf" || value.resultFormat !== resultFormat || value.wireVersion !== 1
        || value.artifactDigest !== geometry.artifactDigest || value.contentDigest !== geometry.contentDigest) {
        throw new TypeError("binary acknowledgement does not match the submitted artifact");
    }
}
function positive(value, cap, name) { if (!Number.isSafeInteger(value) || value <= 0 || value > cap)
    throw new TypeError(`binary ${name} is invalid`); return value; }
function object(value, name) { if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(`${name} must be an object`); return value; }
function https(value, name) { if (typeof value !== "string")
    throw new TypeError(`presign response has no ${name}`); const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password || url.hash)
    throw new TypeError(`presign response ${name} is invalid`); return url.href; }
function jobIds(value) { if (value === null || typeof value !== "object" || Array.isArray(value))
    return []; const id = value.jobId; return typeof id === "string" && id ? [id] : []; }
function canonicalJsonBytes(value, maxBytes, name) {
    try {
        return requireCore().canonicalMetadataJson(value, maxBytes, 32);
    }
    catch (error) {
        if (error instanceof Error && /byte limit/i.test(error.message)) {
            throw new RangeError(`${name} exceeds its byte limit`);
        }
        throw error;
    }
}
