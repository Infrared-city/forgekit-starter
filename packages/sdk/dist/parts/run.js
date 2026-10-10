// Maintainer note (not published): `runAndWait` for an analysis the kernel splits into
// parts (daylight-factor, D221): plan, submit the parts, wait, join. A request of one part
// takes the one-job path and sends the bytes it always sent.
import { waitForSchedule } from "../area/wait-schedule.js";
import { decompressResultValue } from "../compat.js";
import { requireCore } from "../internal/core.js";
import { requireTimeout } from "../internal/deadline.js";
import { defaultPollTimeoutS } from "../internal/poll-engine.js";
import { DEFAULT_TOKENS_PER_JOB } from "../pricing.js";
import { checkArchiveOptions, decompressResultArchive } from "../results/archive.js";
import { parseResultDocument } from "../results/router.js";
import { DaylightFactorResult, isDaylightFrame } from "./daylight-result.js";
import { mergeFormat, mergePartsDocument } from "./merge.js";
import { planRequest, splitsAnalysis } from "./plan.js";
import { resolveResultFormat } from "./result-format.js";
import { submitParts } from "./submit.js";
import { AnalysisPartsError } from "./types.js";
/**
 * Thrown when the parts of a run do not all finish within the timeout.
 *
 * The parts are already submitted and billed. `schedule` holds the accepted jobs, so the
 * run can be merged again later or passed as `retryFrom`.
 *
 * @category Errors
 */
export class PartsTimeoutError extends Error {
    schedule;
    name = "PartsTimeoutError";
    /**
     * @param message - What timed out and how many parts had finished.
     * @param schedule - The submitted parts run, with its accepted jobs.
     */
    constructor(message, schedule) {
        super(message);
        this.schedule = schedule;
    }
}
/**
 * Logs the `warnings` of a result once, at `warn` level, on the client logger.
 *
 * @param value - The result value; anything without warnings is ignored.
 * @param analysisType - The analysis type, added to the log entry.
 * @param logger - The logger to write to.
 * @category Run an analysis
 */
export function logWarnings(value, analysisType, logger) {
    if (value === null || typeof value !== "object")
        return;
    if (value instanceof DaylightFactorResult) {
        if (value.warnings.length > 0)
            logger.warn({ event: "analysis_warnings", analysisType, warnings: value.warnings });
        return;
    }
    const warnings = value.warnings;
    if (!Array.isArray(warnings) || warnings.length === 0)
        return;
    logger.warn({ event: "analysis_warnings", analysisType, warnings });
}
function splits(request) {
    return request.plan !== undefined && request.plan.parts.length > 1;
}
/**
 * Turns one daylight-factor result document into a value in the requested format.
 *
 * A binary frame is viewed in place. With `"irbf"`, a JSON document (from an older server,
 * or a result that could not be written as a frame) is converted to a frame; when it has no
 * exact frame, the parsed JSON value is returned and the fallback is logged.
 *
 * @param document - The decompressed result document.
 * @param format - `"irbf"` for a `DaylightFactorResult`, `"json"` for the JSON value.
 * @param logger - Where a JSON fallback is logged.
 * @returns A `DaylightFactorResult` or the parsed JSON value.
 * @category Results and legend
 */
// Maintainer note (not published): D234. The conversion to a frame is the kernel's
// (`daylightFrameFromJson`).
export function daylightValue(document, format, logger) {
    if (isDaylightFrame(document)) {
        const result = new DaylightFactorResult(document);
        return format === "irbf" ? result : result.toJson();
    }
    if (format === "irbf") {
        try {
            const core = requireCore();
            return new DaylightFactorResult(core.daylightFrameFromJson(document));
        }
        catch (error) {
            logger.info({
                event: "daylight_result", outcome: "json", message: "the result has no exact binary frame",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    // The worker's JSON as it is: a `sensor-surfaces` result also has a
    // `surfaces` key, but it is not a facade surface record.
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(document));
}
/**
 * Submits a planned request, waits for it and returns the result.
 *
 * A request of one part runs as one job. A request of several parts submits every part,
 * waits for all of them and joins the results. From the moment parts are submitted, every
 * error leaves with the run's schedule so nothing has to be paid for twice.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param request - The planned request.
 * @param options - Timeout, progress callbacks, result format, retry schedule and so on.
 * @returns The analysis result: a `DaylightFactorResult` or a JSON value.
 * @throws {PartsTimeoutError} When the parts do not finish within `options.timeout`.
 * @throws {AnalysisPartsError} When a part fails or the results cannot be joined.
 * @category Run an analysis
 */
export async function runPlannedAndWait(jobs, logger, request, options = {}) {
    // Checked before any POST: a bad timeout must not bill parts and lose them.
    // The default is the kernel's wait timeout (900 s) on both paths, as today.
    const timeoutS = options.timeout ?? defaultPollTimeoutS();
    requireTimeout(timeoutS * 1_000);
    // The archive limits too: a bad one must fail before the job is paid.
    if (options.archive !== undefined)
        checkArchiveOptions(options.archive);
    if (!splits(request)) {
        if (options.retryFrom !== undefined) {
            throw new Error("retryFrom needs a request that plans into more than one part");
        }
        const signal = options.signal === undefined ? {} : { signal: options.signal };
        const daylight = splitsAnalysis(request.analysisType);
        const format = resolveResultFormat(options.resultFormat);
        // One part is one JSON job, as Python sends it: its control can carry the
        // whole `sensor-points` list, which the binary envelope does not take.
        // The kernel turns the JSON result into the frame (`daylightValue`).
        const job = await jobs.submitPrepared(request.prepared, signal);
        const completed = await jobs.waitForCompletion(job.jobId, {
            ...signal,
            ...(options.timeout === undefined ? {} : { timeout: options.timeout }),
            ...(options.onPoll === undefined ? {} : { onPoll: options.onPoll }),
        });
        const download = await jobs.downloadResults(completed.jobId, { job: completed, ...signal });
        const archive = options.archive;
        if (!daylight)
            return decompressResultValue(jobs, download.content, archive === undefined ? undefined : { archive });
        const value = daylightValue(decompressResultArchive(download.content, archive), format, logger);
        logWarnings(value, request.analysisType, logger);
        return value;
    }
    // `onPoll` reports ONE job's status; a parts run polls a schedule, so it is
    // not called here. `onProgress` reports the parts (README).
    const schedule = await submitParts(jobs, request, options, logger);
    // From here the parts are paid: every error leaves with the schedule, so the
    // caller can merge again or retry the failed parts instead of paying again.
    try {
        return await waitAndJoin(jobs, logger, request, schedule, timeoutS, options);
    }
    catch (error) {
        throw withSchedule(error, schedule);
    }
}
/** The error as it is when it already carries this schedule, else an
 * `AnalysisPartsError` with the schedule and the error as its `cause`. */
function withSchedule(error, schedule) {
    if (error !== null && typeof error === "object" && error.schedule === schedule) {
        return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new AnalysisPartsError(`${schedule.analysisType} parts stopped after submission: ${message}. ` +
        "This error's schedule holds the accepted jobs: merge it again, or pass it as retryFrom.", [], schedule, [], { cause: error });
}
async function waitAndJoin(jobs, logger, request, schedule, timeoutS, options) {
    await waitForSchedule(jobs, schedule, {
        timeoutS,
        ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
        onTimeout: (last) => new PartsTimeoutError(`${request.analysisType} parts timed out after ${timeoutS}s: ` +
            `${last.completedCount}/${last.totalCount} completed, ${last.failedCount} failed`, schedule),
    });
    const format = mergeFormat(schedule, options);
    const document = await mergePartsDocument(jobs, schedule, { ...options, resultFormat: format, logger });
    const value = daylightValue(document, format, logger);
    logWarnings(value, request.analysisType, logger);
    return value;
}
/**
 * Plans a request, submits it (as parts when it splits), waits and returns the result.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - Timeout, progress callbacks, result format, retry schedule and so on.
 * @returns The analysis result: a `DaylightFactorResult` or a JSON value.
 * @throws {PartsTimeoutError} When the parts do not finish within `options.timeout`.
 * @throws {AnalysisPartsError} When a part fails or the results cannot be joined.
 * @category Run an analysis
 */
export async function runAndWaitParts(jobs, logger, input, options = {}) {
    return runPlannedAndWait(jobs, logger, planRequest(jobs, input, options, logger), options);
}
/**
 * Submits a request as parts and returns the schedule without waiting.
 *
 * A request that is one job is refused here; submit it with `run` or `analyses.execute`.
 *
 * @param jobs - The job service.
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - Part limits, workers, webhook, transport, result format and retry schedule.
 * @returns The schedule of the submitted parts.
 * @throws {Error} When the request is one job.
 * @category Run an analysis
 */
export async function runParts(jobs, logger, input, options = {}) {
    const request = planRequest(jobs, input, options, logger);
    if (!splits(request)) {
        throw new Error(`the ${request.analysisType} request is one job; submit it with run or analyses.execute`);
    }
    return submitParts(jobs, request, options, logger);
}
/**
 * Previews what a run of `input` would submit and bill, offline: no request is sent.
 *
 * @param jobs - The job service (only used to prepare the submission).
 * @param logger - The client logger.
 * @param input - The wire-keyed analysis request.
 * @param options - The same options as the run.
 * @param target - Optional planning target for the split.
 * @returns The part count, sensors per part and estimated cost in tokens.
 * @category Run an analysis
 */
export function previewParts(jobs, logger, input, options = {}, target) {
    const { analysisType, plan } = planRequest(jobs, input, options, logger, target);
    const parts = plan === undefined ? [] : plan.parts.map((part) => ({
        key: part.key, floorKeys: [...part.floor_keys], sensors: part.sensors,
    }));
    const partCount = Math.max(1, parts.length);
    return {
        analysisType, partCount, totalSensors: plan?.total_sensors ?? 0, parts,
        tokensPerJob: DEFAULT_TOKENS_PER_JOB,
        estimatedCostTokens: partCount * DEFAULT_TOKENS_PER_JOB,
        ...(plan?.unsplit_reason == null ? {} : { unsplitReason: plan.unsplit_reason }),
        notes: plan?.notes ?? [],
    };
}
/**
 * Joins the finished parts of a run into one result value.
 *
 * Only a daylight-factor run has the binary result; any other analysis keeps its JSON value.
 *
 * @param jobs - The job service used to poll and download.
 * @param logger - The client logger.
 * @param schedule - The submitted parts run.
 * @param options - Worker count, abort signal and result format.
 * @returns The joined result value.
 * @throws {AnalysisPartsError} When a part has no result, is not finished, or fails to
 * download.
 * @category Run an analysis
 */
export async function mergePartsValue(jobs, logger, schedule, options = {}) {
    const format = mergeFormat(schedule, options);
    const document = await mergePartsDocument(jobs, schedule, { ...options, resultFormat: format, logger });
    const value = splitsAnalysis(schedule.analysisType)
        ? daylightValue(document, format, logger) : parseResultDocument(document).value;
    logWarnings(value, schedule.analysisType, logger);
    return value;
}
