import { SubmissionUncertainError } from "../internal/submission.js";
import { SubmissionStoppedError } from "../internal/submission-stopped.js";
import { TransportError } from "../internal/transport.js";
import { GeometryReferenceSubmissionError } from "../internal/geometry-reuse/errors.js";
import { JobStatus } from "../jobs.js";
import { planAreaSubmission } from "./planning.js";
import { computeAreaState, freezeAreaSchedule } from "./schedule.js";
import { checkPaidRetrySiteIdentity } from "./site-identity-guard.js";
import { SCHEDULE_CONTRACT_VERSION } from "./weather-guard.js";
function concurrency(value) {
    const count = value ?? 8;
    if (!Number.isSafeInteger(count) || count < 1)
        throw new TypeError("maxWorkers must be a positive integer");
    return count;
}
function effectiveOptions(options) {
    if (Object.prototype.hasOwnProperty.call(options, "binaryResults")) {
        throw new TypeError("unsupported option binaryResults; use transport instead");
    }
    const transport = options.transport ?? options.retryFrom?.transport ?? "json";
    if (options.transport !== undefined && options.retryFrom?.transport !== undefined
        && options.transport !== options.retryFrom.transport) {
        throw new Error("retryFrom transport mismatch");
    }
    const margin = options.terrainContextMarginM ?? options.retryFrom?.terrainContextMarginM;
    if (margin !== undefined && (!Number.isFinite(margin) || margin < 0)) {
        throw new TypeError("terrainContextMarginM must be a finite non-negative number");
    }
    if (options.terrainContextMarginM !== undefined && options.retryFrom?.terrainContextMarginM !== undefined &&
        options.terrainContextMarginM !== options.retryFrom.terrainContextMarginM) {
        throw new Error("retryFrom terrainContextMarginM mismatch");
    }
    return {
        ...options,
        transport,
        ...(margin === undefined ? {} : { terrainContextMarginM: margin }),
        ...(options.webhookUrl !== undefined || options.retryFrom?.webhookUrl === undefined
            ? {} : { webhookUrl: options.retryFrom.webhookUrl }),
        ...(options.webhookEvents !== undefined || options.retryFrom?.webhookEvents === undefined
            ? {} : { webhookEvents: [...options.retryFrom.webhookEvents] }),
    };
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
function copyPriorJobs(schedule) {
    const jobs = new Map();
    if (!schedule)
        return jobs;
    for (const [key, job] of schedule.jobs)
        jobs.set(key, { ...job });
    return jobs;
}
function scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options) {
    const siteIdentity = options.retryFrom === undefined
        ? plan.siteIdentity : options.retryFrom.siteIdentity;
    const sensorCap = options.maxSensorsPerJob ?? options.retryFrom?.maxSensorsPerJob;
    return {
        jobs, polygon: plan.polygon, configHash: plan.configHash,
        ...(siteIdentity === undefined ? {} : { siteIdentity }),
        tilePositions: plan.tilePositions, gridShape: plan.gridShape,
        analysisType: plan.analysisType, failedSubmissions, uncertainSubmissions,
        invalidReferenceSubmissions,
        transport: options.transport ?? "json",
        ...(options.transport === "binary" ? { wireVersion: 1 } : {}),
        submissionAbortStatus, surfaceFields: plan.surfaceFields,
        terrainContextMarginM: plan.terrainContextMarginM,
        // A retry that omits the cap replays a plan made under the saved one.
        ...(sensorCap === undefined ? {} : { maxSensorsPerJob: sensorCap }),
        // Stamped on every schedule this SDK writes, whether or not the weather
        // is provable: the VERSION is what tells a schedule that recorded no
        // identity from one written before the field existed, and only the first
        // can be resumed once the caller brings a parsed file.
        scheduleContractVersion: SCHEDULE_CONTRACT_VERSION,
        ...(plan.weatherIdentity === undefined ? {} : { weatherIdentity: plan.weatherIdentity }),
        ...(plan.batchingPolicyVersion === undefined ? {} : { batchingPolicyVersion: plan.batchingPolicyVersion }),
        ...(plan.batchMembership === undefined ? {} : { batchMembership: plan.batchMembership }),
        ...(plan.batchSensorCounts === undefined ? {} : { batchSensorCounts: plan.batchSensorCounts }),
        ...(options.webhookUrl === undefined ? {} : { webhookUrl: options.webhookUrl }),
        ...(options.webhookEvents === undefined ? {} : { webhookEvents: [...options.webhookEvents] }),
    };
}
export class AreaGeometryReferenceError extends Error {
    areaSchedule;
    acceptedJobIds;
    name = "AreaGeometryReferenceError";
    constructor(areaSchedule, acceptedJobIds) {
        super("area submission stopped after an invalid geometry-reference acceptance");
        this.areaSchedule = areaSchedule;
        this.acceptedJobIds = acceptedJobIds;
    }
}
/**
 * A LEGACY schedule recorded an uncertain capability probe, and resuming it
 * would repeat work whose billing state is unknown. No SDK submits a probe job
 * any more (D71), so nothing written from here on can raise this.
 */
export class AreaGeometryProbeError extends Error {
    areaSchedule;
    acceptedProbeJobIds;
    name = "AreaGeometryProbeError";
    constructor(areaSchedule, acceptedProbeJobIds) {
        super("area submission stopped after an uncertain geometry-reference capability probe");
        this.areaSchedule = areaSchedule;
        this.acceptedProbeJobIds = acceptedProbeJobIds;
    }
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
function failed(entry, error) {
    return {
        tileId: entry.key, row: entry.row, col: entry.col, status: "failed",
        error: error instanceof Error ? error.message : String(error),
    };
}
/**
 * One facade job's capture for the local `cell-tris` synthesis
 * (`facade-synthesis.ts`, ADR 0008), or `undefined` when the run does not
 * synthesize locally. Written BEFORE the job's paid POST: a refusal or an
 * out-of-memory here fails the job while no request was sent, so a retry is
 * safe. After an accepted POST no host step may turn the job into a failed one.
 */
export function facadeCaptureFor(service, plan, entry) {
    if (service.facadeSynthesis === undefined || plan.localCellTris !== true)
        return undefined;
    // A facade job's capture is the kernel's: the batch's targets and the tile's
    // terrain from the prepared site (`Site.facadeFrames`, the Python host's
    // `facade_frames`). The mode is not kept — the response echoes the one that
    // ran.
    if (entry.capture === undefined)
        return undefined;
    const alignment = entry.prepared.body["terrain-alignment"];
    // Verbatim, `null` when unsent: the kernel seats the targets on terrain by
    // the server's rule for this value (the server seats before it synthesizes).
    return entry.capture(typeof alignment === "string" ? alignment : null);
}
/**
 * Retain one accepted facade job's capture ({@link facadeCaptureFor}) so the
 * merge can synthesize its `cell-tris` locally. Per CLIENT, on the jobs
 * service: never module-global, and never in the `AreaSchedule`, which is
 * serialised, resumed and handed between processes.
 */
export function rememberFacadeInputs(service, capture, jobId) {
    const store = service.facadeSynthesis;
    if (store === undefined || jobId === undefined || capture === undefined)
        return;
    store.remember(jobId, { capture });
}
/** Submit an already validated plan once per entry. Unknown POSTs are not retried. */
export async function submitAreaPlan(service, plan, options = {}) {
    const entries = plan.entries;
    if ((options.retryFrom?.invalidReferenceSubmissions?.length ?? 0) > 0) {
        const ids = [...options.retryFrom.jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== undefined ? [job.jobId] : []);
        throw new AreaGeometryReferenceError(options.retryFrom, ids);
    }
    // Legacy schedules only: no SDK from D71 onward submits a probe job, but one
    // saved before it can still record an uncertain probe, and that schedule is
    // no safer to resume now than it was then.
    if (options.retryFrom?.geometryProbeUncertain === true) {
        throw new AreaGeometryProbeError(options.retryFrom, options.retryFrom.geometryProbeJobIds ?? []);
    }
    checkPaidRetrySiteIdentity(options.retryFrom, plan.siteIdentity, entries.length > 0);
    const jobs = copyPriorJobs(options.retryFrom);
    const failedSubmissions = [];
    const uncertainSubmissions = [...(options.retryFrom?.uncertainSubmissions ?? [])];
    const invalidReferenceSubmissions = [
        ...(options.retryFrom?.invalidReferenceSubmissions ?? []),
    ];
    let submissionAbortStatus = null;
    let invalidReferenceAbort = false;
    const beforeDispatch = () => {
        if (invalidReferenceAbort)
            throw new SubmissionStoppedError();
    };
    let cursor = 0;
    const workers = Math.min(concurrency(options.maxWorkers), Math.max(1, entries.length));
    // No paid POST starts until every selected tile passes binary validation.
    // What the preflight encodes it KEEPS, under the client's byte budget, and
    // the worker that submits that tile sends those bytes instead of encoding the
    // same body again. The submit frees each artifact as its upload consumes it;
    // the `finally` frees every tile that never got that far — a preflight that
    // threw on a later tile, an abort, a 402, an invalid geometry reference.
    try {
        if ((options.transport ?? "json") === "binary") {
            for (const entry of entries) {
                await service.preflightPrepared(entry.prepared, options.signal === undefined ? {} : { signal: options.signal });
            }
        }
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
                    const capture = facadeCaptureFor(service, plan, entry);
                    const job = await service.submitPrepared(entry.prepared, {
                        beforeDispatch: () => { beforeDispatch(); posted = true; },
                        ...(options.signal === undefined ? {} : { signal: options.signal }),
                    });
                    rememberFacadeInputs(service, capture, job.jobId);
                    jobs.set(entry.key, {
                        tileId: entry.key, row: entry.row, col: entry.col, jobId: job.jobId,
                        status: tileStatus(job), lastJobSnapshot: job,
                        ...(job.binary === undefined ? {} : { binary: job.binary }),
                        ...(job.treeBoxes === undefined ? {} : { treeBoxes: job.treeBoxes }),
                        ...(job.error === undefined ? {} : { error: job.error }),
                    });
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
                        const accepted = error.acceptedJobIds[0];
                        jobs.set(entry.key, {
                            tileId: entry.key, row: entry.row, col: entry.col,
                            ...(accepted === undefined ? {} : { jobId: accepted }),
                            status: "failed", invalidReference: true, error: error.message,
                        });
                        reportAccepted(options, accepted, entry.key);
                    }
                    else if (unknownAcceptance(error, posted)) {
                        uncertainSubmissions.push(entry.key);
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
                        failedSubmissions.push(entry.key);
                        jobs.set(entry.key, failed(entry, error));
                    }
                }
            }
        }));
    }
    finally {
        // Idempotent: the submit already released every tile it uploaded.
        for (const entry of entries)
            service.releasePreflight?.(entry.prepared);
    }
    const schedule = freezeAreaSchedule(scheduleFromPlan(plan, jobs, failedSubmissions, uncertainSubmissions, invalidReferenceSubmissions, submissionAbortStatus, options));
    try {
        options.onProgress?.(computeAreaState(schedule));
    }
    catch {
        // Observer failures must not hide accepted job IDs in the returned schedule.
    }
    if (invalidReferenceSubmissions.length > 0) {
        // This call throws instead of returning a schedule, so no merge will come
        // for what it already captured. Release it here or hold it for the life of
        // the client.
        for (const job of jobs.values()) {
            if (job.jobId !== undefined)
                service.facadeSynthesis?.forget(job.jobId);
        }
        const ids = [...jobs.values()].flatMap((job) => job.invalidReference === true && job.jobId !== undefined ? [job.jobId] : []);
        throw new AreaGeometryReferenceError(schedule, ids);
    }
    return schedule;
}
export async function runArea(service, input, polygon, options = {}) {
    const effective = effectiveOptions(options);
    concurrency(effective.maxWorkers);
    const plan = await planAreaSubmission(service, input, polygon, effective);
    return submitAreaPlan(service, plan, effective);
}
