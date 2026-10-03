import { freezeRetryFields, parseRetryFields, retryFieldsToJSON } from "./schedule-retry-fields.js";
const STATUSES = new Set([
    "pending", "running", "completed", "failed", "skipped",
]);
function frozenMap(source) {
    const map = new Map(source);
    let proxy;
    proxy = new Proxy(map, {
        get(target, property) {
            if (property === "set" || property === "delete" || property === "clear") {
                return () => { throw new TypeError("AreaSchedule.jobs is frozen"); };
            }
            if (property === "forEach") {
                return (callback, thisArg) => target.forEach((value, key) => callback.call(thisArg, value, key, proxy));
            }
            const value = Reflect.get(target, property, target);
            return typeof value === "function" ? value.bind(target) : value;
        },
        set() { throw new TypeError("AreaSchedule.jobs is frozen"); },
        deleteProperty() { throw new TypeError("AreaSchedule.jobs is frozen"); },
        defineProperty() { throw new TypeError("AreaSchedule.jobs is frozen"); },
    });
    return proxy;
}
export function freezeAreaSchedule(schedule) {
    const membership = schedule.batchMembership === undefined ? undefined : Object.freeze(Object.fromEntries(Object.entries(schedule.batchMembership).map(([key, ids]) => [key, Object.freeze([...ids])])));
    const counts = schedule.batchSensorCounts === undefined
        ? undefined : Object.freeze({ ...schedule.batchSensorCounts });
    const polygon = Object.freeze({
        ...schedule.polygon,
        coordinates: Object.freeze(schedule.polygon.coordinates.map((ring) => Object.freeze(ring.map((position) => Object.freeze([...position]))))),
    });
    const tilePositions = Object.freeze(schedule.tilePositions.map((position) => Object.freeze({ ...position })));
    return Object.freeze({
        ...schedule,
        jobs: frozenMap(schedule.jobs),
        polygon,
        tilePositions,
        gridShape: Object.freeze([...schedule.gridShape]),
        failedSubmissions: Object.freeze([...schedule.failedSubmissions]),
        ...freezeRetryFields(schedule),
        ...(schedule.uncertainSubmissions === undefined ? {} : {
            uncertainSubmissions: Object.freeze([...schedule.uncertainSubmissions]),
        }),
        ...(schedule.invalidReferenceSubmissions === undefined ? {} : {
            invalidReferenceSubmissions: Object.freeze([...schedule.invalidReferenceSubmissions]),
        }),
        ...(schedule.geometryProbeJobIds === undefined ? {} : {
            geometryProbeJobIds: Object.freeze([...schedule.geometryProbeJobIds]),
        }),
        ...(schedule.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {}),
        ...(membership === undefined ? {} : { batchMembership: membership }),
        ...(counts === undefined ? {} : { batchSensorCounts: counts }),
        ...(schedule.webhookEvents === undefined ? {} : {
            webhookEvents: Object.freeze([...schedule.webhookEvents]),
        }),
    });
}
function jsonJob(job) {
    const copy = {
        tileId: job.tileId, row: job.row, col: job.col, status: job.status,
        ...(job.jobId === undefined ? {} : { jobId: job.jobId }),
        ...(job.error === undefined ? {} : { error: job.error }),
        ...(job.invalidReference === true ? { invalidReference: true } : {}),
        ...(job.binary === undefined ? {} : { binary: { ...job.binary } }),
    };
    return copy;
}
export function areaScheduleToJSON(schedule) {
    return {
        jobs: [...schedule.jobs].map(([key, job]) => [key, jsonJob(job)]),
        polygon: schedule.polygon,
        configHash: schedule.configHash,
        ...(schedule.siteIdentity === undefined ? {} : { siteIdentity: schedule.siteIdentity }),
        tilePositions: schedule.tilePositions.map((position) => ({ ...position })),
        gridShape: [...schedule.gridShape],
        analysisType: schedule.analysisType,
        transport: schedule.transport ?? "json",
        ...(schedule.wireVersion === undefined ? {} : { wireVersion: schedule.wireVersion }),
        failedSubmissions: [...schedule.failedSubmissions],
        ...(schedule.uncertainSubmissions === undefined ? {} : { uncertainSubmissions: [...schedule.uncertainSubmissions] }),
        ...(schedule.invalidReferenceSubmissions === undefined ? {} : {
            invalidReferenceSubmissions: [...schedule.invalidReferenceSubmissions],
        }),
        ...(schedule.geometryProbeJobIds === undefined ? {} : {
            geometryProbeJobIds: [...schedule.geometryProbeJobIds],
        }),
        ...(schedule.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {}),
        submissionAbortStatus: schedule.submissionAbortStatus,
        surfaceFields: schedule.surfaceFields ?? false,
        ...(schedule.terrainContextMarginM === undefined ? {} : { terrainContextMarginM: schedule.terrainContextMarginM }),
        ...(schedule.maxSensorsPerJob === undefined ? {} : { maxSensorsPerJob: schedule.maxSensorsPerJob }),
        ...(schedule.weatherIdentity === undefined ? {} : { weatherIdentity: schedule.weatherIdentity }),
        ...(schedule.scheduleContractVersion === undefined
            ? {} : { scheduleContractVersion: schedule.scheduleContractVersion }),
        ...(schedule.batchingPolicyVersion === undefined ? {} : { batchingPolicyVersion: schedule.batchingPolicyVersion }),
        ...(schedule.batchMembership === undefined ? {} : { batchMembership: structuredClone(schedule.batchMembership) }),
        ...(schedule.batchSensorCounts === undefined ? {} : { batchSensorCounts: { ...schedule.batchSensorCounts } }),
        ...(schedule.webhookUrl === undefined ? {} : { webhookUrl: schedule.webhookUrl }),
        ...(schedule.webhookEvents === undefined ? {} : { webhookEvents: [...schedule.webhookEvents] }),
        ...retryFieldsToJSON(schedule),
    };
}
function invalid(message) {
    throw new TypeError(`invalid area schedule: ${message}`);
}
function object(value, name) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        invalid(`${name} must be an object`);
    return value;
}
function string(value, name) {
    if (typeof value !== "string" || value.length === 0)
        invalid(`${name} must be a non-empty string`);
    return value;
}
function index(value, name) {
    if (!Number.isSafeInteger(value) || value < 0)
        invalid(`${name} must be a non-negative integer`);
    return value;
}
function parseJob(key, value) {
    const raw = object(value, `job ${key}`);
    if (raw.result !== undefined || raw.lastJobSnapshot !== undefined)
        invalid(`job ${key} contains non-durable state`);
    const tileId = string(raw.tileId, `job ${key}.tileId`);
    if (tileId !== key)
        invalid(`job key ${key} does not match tileId ${tileId}`);
    if (typeof raw.status !== "string" || !STATUSES.has(raw.status))
        invalid(`job ${key} has invalid status`);
    if (raw.jobId !== undefined && (typeof raw.jobId !== "string" || raw.jobId.length === 0))
        invalid(`job ${key} has invalid jobId`);
    if (raw.error !== undefined && typeof raw.error !== "string")
        invalid(`job ${key} has invalid error`);
    if (raw.invalidReference !== undefined && raw.invalidReference !== true) {
        invalid(`job ${key} has invalid invalidReference marker`);
    }
    const binary = parseBinary(raw.binary, key);
    return {
        tileId, row: index(raw.row, `job ${key}.row`), col: index(raw.col, `job ${key}.col`),
        status: raw.status,
        ...(raw.jobId === undefined ? {} : { jobId: raw.jobId }),
        ...(raw.error === undefined ? {} : { error: raw.error }),
        ...(raw.invalidReference === true ? { invalidReference: true } : {}),
        ...(binary === undefined ? {} : { binary }),
    };
}
function uniqueReferences(items, name) {
    const unique = new Set(items);
    if (unique.size !== items.length)
        invalid(`${name} must not contain duplicates`);
    return unique;
}
function validateSubmissionReferences(jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions) {
    const failed = uniqueReferences(failedSubmissions, "failedSubmissions");
    const uncertain = uniqueReferences(uncertainSubmissions, "uncertainSubmissions");
    const invalidReferences = uniqueReferences(invalidReferenceSubmissions, "invalidReferenceSubmissions");
    for (const tileId of failed) {
        const job = jobs.get(tileId);
        if (!job)
            invalid(`failed submission ${tileId} has no job`);
        if (job.status !== "failed" || job.jobId !== undefined) {
            invalid(`failed submission ${tileId} must be a failed job without a jobId`);
        }
        if (uncertain.has(tileId))
            invalid(`submission ${tileId} is both failed and uncertain`);
    }
    for (const tileId of uncertain) {
        const job = jobs.get(tileId);
        if (!job)
            invalid(`uncertain submission ${tileId} has no job`);
        if (job.jobId === undefined && job.status !== "skipped") {
            invalid(`uncertain submission ${tileId} without a jobId must be skipped`);
        }
    }
    for (const tileId of invalidReferences) {
        const job = jobs.get(tileId);
        if (!job || job.status !== "failed" || job.invalidReference !== true) {
            invalid(`invalid reference submission ${tileId} must remain a failed invalid-reference job`);
        }
        if (failed.has(tileId) || uncertain.has(tileId)) {
            invalid(`invalid reference submission ${tileId} is in another submission outcome list`);
        }
    }
    for (const [tileId, job] of jobs) {
        if (job.invalidReference === true && !invalidReferences.has(tileId)) {
            invalid(`invalid-reference job ${tileId} is absent from invalidReferenceSubmissions`);
        }
    }
}
export function areaScheduleFromJSON(value) {
    const raw = object(value, "root");
    if (!Array.isArray(raw.jobs))
        invalid("jobs must be an array");
    const jobs = new Map();
    for (const entry of raw.jobs) {
        if (!Array.isArray(entry) || entry.length !== 2)
            invalid("job entry must be a pair");
        const key = string(entry[0], "job key");
        if (jobs.has(key))
            invalid(`duplicate job ${key}`);
        jobs.set(key, parseJob(key, entry[1]));
    }
    const polygon = object(raw.polygon, "polygon");
    if (polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates))
        invalid("polygon must be GeoJSON Polygon");
    if (!Array.isArray(raw.gridShape) || raw.gridShape.length !== 2)
        invalid("gridShape must contain two indexes");
    if (!Array.isArray(raw.tilePositions) || !Array.isArray(raw.failedSubmissions))
        invalid("schedule arrays are missing");
    const tilePositions = raw.tilePositions.map((item, at) => {
        const position = object(item, `tilePositions[${at}]`);
        return { row: index(position.row, "tile row"), col: index(position.col, "tile col"), tileId: string(position.tileId, "tileId") };
    });
    const failedSubmissions = raw.failedSubmissions.map((item) => string(item, "failed submission"));
    if (raw.uncertainSubmissions !== undefined && !Array.isArray(raw.uncertainSubmissions))
        invalid("uncertainSubmissions must be an array");
    const uncertainSubmissions = raw.uncertainSubmissions
        ?.map((item) => string(item, "uncertain submission"));
    if (raw.invalidReferenceSubmissions !== undefined && !Array.isArray(raw.invalidReferenceSubmissions)) {
        invalid("invalidReferenceSubmissions must be an array");
    }
    const invalidReferenceSubmissions = raw.invalidReferenceSubmissions
        ?.map((item) => string(item, "invalid reference submission"));
    if (raw.geometryProbeJobIds !== undefined && !Array.isArray(raw.geometryProbeJobIds)) {
        invalid("geometryProbeJobIds must be an array");
    }
    const geometryProbeJobIds = raw.geometryProbeJobIds
        ?.map((item) => string(item, "geometry probe job ID"));
    if (geometryProbeJobIds !== undefined)
        uniqueReferences(geometryProbeJobIds, "geometryProbeJobIds");
    if (raw.geometryProbeUncertain !== undefined && raw.geometryProbeUncertain !== true) {
        invalid("geometryProbeUncertain must be true when present");
    }
    // Both fields are legacy (schedule-types.ts): only an older SDK wrote them,
    // and it wrote the IDs only alongside the uncertain marker. The pairing is
    // still checked so a hand-edited schedule cannot invent probe IDs.
    if ((geometryProbeJobIds?.length ?? 0) > 0 && raw.geometryProbeUncertain !== true) {
        invalid("geometry probe job IDs require an uncertain-probe marker");
    }
    validateSubmissionReferences(jobs, failedSubmissions, uncertainSubmissions ?? [], invalidReferenceSubmissions ?? []);
    const abort = raw.submissionAbortStatus ?? null;
    if (abort !== null && !Number.isSafeInteger(abort))
        invalid("submissionAbortStatus must be an integer or null");
    if (raw.surfaceFields !== undefined && typeof raw.surfaceFields !== "boolean")
        invalid("surfaceFields must be Boolean");
    if (raw.terrainContextMarginM !== undefined &&
        (typeof raw.terrainContextMarginM !== "number" || !Number.isFinite(raw.terrainContextMarginM) || raw.terrainContextMarginM < 0)) {
        invalid("terrainContextMarginM must be a finite non-negative number");
    }
    if (raw.maxSensorsPerJob !== undefined &&
        (!Number.isSafeInteger(raw.maxSensorsPerJob) || raw.maxSensorsPerJob < 1)) {
        invalid("maxSensorsPerJob must be a positive integer");
    }
    if (raw.batchingPolicyVersion !== undefined && raw.batchingPolicyVersion !== 2) {
        invalid("batchingPolicyVersion must be 2");
    }
    if (raw.weatherIdentity !== undefined &&
        (typeof raw.weatherIdentity !== "string" || !raw.weatherIdentity.startsWith("sha256:"))) {
        invalid("weatherIdentity must be a sha256: digest");
    }
    if (raw.siteIdentity !== undefined &&
        (typeof raw.siteIdentity !== "string" || !/^sha256:[0-9a-f]{64}$/.test(raw.siteIdentity))) {
        invalid("siteIdentity must be a sha256: digest");
    }
    if (raw.scheduleContractVersion !== undefined &&
        (!Number.isSafeInteger(raw.scheduleContractVersion) ||
            raw.scheduleContractVersion < 1)) {
        invalid("scheduleContractVersion must be a positive integer");
    }
    const membership = optionalStringArrays(raw.batchMembership, "batchMembership");
    const counts = optionalPositiveIntegers(raw.batchSensorCounts, "batchSensorCounts");
    if ((membership === undefined) !== (counts === undefined))
        invalid("exact batch records must be present together");
    if ((raw.batchingPolicyVersion === 2) !== (membership !== undefined)) {
        invalid("exact batch policy and records must be present together");
    }
    if (raw.webhookEvents !== undefined && !Array.isArray(raw.webhookEvents))
        invalid("webhookEvents must be an array");
    if (raw.webhookUrl !== undefined && (typeof raw.webhookUrl !== "string" || raw.webhookUrl.length === 0)) {
        invalid("webhookUrl must be a non-empty string");
    }
    const retryFields = parseRetryFields(raw, invalid);
    const schedule = {
        jobs, polygon: polygon,
        configHash: string(raw.configHash, "configHash"), tilePositions,
        ...(raw.siteIdentity === undefined ? {} : { siteIdentity: raw.siteIdentity }),
        gridShape: [index(raw.gridShape[0], "grid rows"), index(raw.gridShape[1], "grid cols")],
        analysisType: string(raw.analysisType, "analysisType"), failedSubmissions,
        transport: raw.transport === undefined ? "json" : transport(raw.transport),
        ...(raw.wireVersion === undefined ? {} : { wireVersion: wireVersion(raw.wireVersion) }),
        ...(uncertainSubmissions === undefined ? {} : { uncertainSubmissions }),
        ...(invalidReferenceSubmissions === undefined ? {} : { invalidReferenceSubmissions }),
        ...(geometryProbeJobIds === undefined ? {} : { geometryProbeJobIds }),
        ...(raw.geometryProbeUncertain === true ? { geometryProbeUncertain: true } : {}),
        submissionAbortStatus: abort,
        surfaceFields: raw.surfaceFields === true,
        ...(raw.terrainContextMarginM === undefined ? {} : { terrainContextMarginM: raw.terrainContextMarginM }),
        ...(raw.maxSensorsPerJob === undefined ? {} : { maxSensorsPerJob: raw.maxSensorsPerJob }),
        ...(raw.weatherIdentity === undefined ? {} : { weatherIdentity: raw.weatherIdentity }),
        ...(raw.scheduleContractVersion === undefined
            ? {} : { scheduleContractVersion: raw.scheduleContractVersion }),
        ...(raw.batchingPolicyVersion === undefined ? {} : { batchingPolicyVersion: 2 }),
        ...(membership === undefined ? {} : { batchMembership: membership, batchSensorCounts: counts }),
        ...(raw.webhookUrl === undefined ? {} : { webhookUrl: raw.webhookUrl }),
        ...(Array.isArray(raw.webhookEvents) ? { webhookEvents: raw.webhookEvents.map((item) => string(item, "webhook event")) } : {}),
        ...retryFields,
    };
    if (schedule.transport === "binary" && schedule.wireVersion !== 1) {
        invalid("binary transport requires wireVersion 1");
    }
    if (schedule.transport === "json" && schedule.wireVersion !== undefined) {
        invalid("JSON transport must not contain wireVersion");
    }
    for (const [key, job] of schedule.jobs) {
        if (schedule.transport === "json" && job.binary !== undefined) {
            invalid(`JSON job ${key} contains a binary acknowledgement`);
        }
    }
    return freezeAreaSchedule(schedule);
}
function parseBinary(value, key) {
    if (value === undefined)
        return undefined;
    const raw = object(value, `job ${key}.binary`);
    if (raw.inputFormat !== "irbf" || raw.resultFormat !== "irbf" || raw.wireVersion !== 1) {
        invalid(`job ${key} has an incompatible binary acknowledgement`);
    }
    return { inputFormat: "irbf", resultFormat: "irbf", wireVersion: 1,
        artifactDigest: string(raw.artifactDigest, `job ${key} artifactDigest`),
        contentDigest: string(raw.contentDigest, `job ${key} contentDigest`) };
}
function transport(value) {
    if (value !== "json" && value !== "binary")
        invalid("transport must be json or binary");
    return value;
}
function wireVersion(value) {
    if (value !== 1)
        invalid("wireVersion must be 1");
    return 1;
}
function optionalStringArrays(value, name) {
    if (value === undefined)
        return undefined;
    const raw = object(value, name);
    const entries = [];
    for (const [key, items] of Object.entries(raw)) {
        if (!Array.isArray(items))
            invalid(`${name}.${key} must be an array`);
        entries.push([key, items.map((item) => string(item, `${name}.${key}`))]);
    }
    return Object.fromEntries(entries);
}
function optionalPositiveIntegers(value, name) {
    if (value === undefined)
        return undefined;
    const raw = object(value, name);
    const entries = [];
    for (const [key, item] of Object.entries(raw)) {
        if (!Number.isSafeInteger(item) || item < 1)
            invalid(`${name}.${key} must be positive`);
        entries.push([key, item]);
    }
    return Object.fromEntries(entries);
}
export function computeAreaState(schedule) {
    let completedCount = 0, failedCount = 0, skippedCount = 0, pendingCount = 0, runningCount = 0;
    for (const job of schedule.jobs.values()) {
        if (job.status === "completed")
            completedCount += 1;
        else if (job.status === "failed")
            failedCount += 1;
        else if (job.status === "skipped")
            skippedCount += 1;
        else if (job.status === "pending")
            pendingCount += 1;
        else
            runningCount += 1;
    }
    return { totalCount: schedule.jobs.size, completedCount, failedCount, skippedCount, pendingCount, runningCount,
        isComplete: pendingCount === 0 && runningCount === 0 };
}
