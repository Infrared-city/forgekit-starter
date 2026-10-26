import type { AreaJob, AreaState } from "../area/schedule-types.js";
import type { DaylightResultFormat } from "./result-format.js";
/**
 * One part of a parts plan: a job that covers some of the request's floors.
 *
 * @category Run an analysis
 */
export interface KernelPart {
    /** Key of the part, unique within the plan. */
    readonly key: string;
    /** The part's `floors` selectors; `null` for a request sent as one part. */
    readonly floors: readonly unknown[] | null;
    /** Keys of the floors the part covers. */
    readonly floor_keys: readonly string[];
    /** Number of sensors in the part. */
    readonly sensors: number;
}
/**
 * The plan that splits a daylight-factor request into parts, parsed.
 *
 * @category Run an analysis
 */
export interface KernelPartsPlan {
    /** The request tier the plan was made for, for example `"floors"` or `"buildings"`. */
    readonly tier: string;
    /** The target the plan was made for. */
    readonly target: number;
    /** Sensors of the whole request. */
    readonly total_sensors: number;
    /** The parts, in plan order. */
    readonly parts: readonly KernelPart[];
    /** Why the request was sent as one part, when it was; otherwise `null`. */
    readonly unsplit_reason: string | null;
    /** Notes on inputs the analysis accepts silently. */
    readonly notes: readonly string[];
}
/**
 * A submitted parts run.
 *
 * Like an `AreaSchedule`, its job records are updated in place while the run is polled.
 * Keep it to merge the run later or to retry the failed parts.
 *
 * @category Run an analysis
 */
export interface PartsSchedule {
    /** The analysis type of the run. */
    readonly analysisType: string;
    /**
     * `sha256:` digest of the request's JSON bytes; a `retryFrom` must match it. Absent when
     * the runtime has no SHA-256; such a schedule cannot be retried.
     */
    readonly requestDigest?: string;
    /** The plan of the run, as text. Merging reads it. */
    readonly plan: string;
    /** Part keys, in plan order. */
    readonly partKeys: readonly string[];
    /** The job of each part, by part key. */
    readonly jobs: ReadonlyMap<string, AreaJob>;
    /** Parts whose submission failed. */
    readonly failedSubmissions: readonly string[];
    /** Parts whose submission may have been accepted. Never resubmitted automatically. */
    readonly uncertainSubmissions: readonly string[];
    /** HTTP status that stopped the submission early, or `null` when it was not stopped. */
    readonly submissionAbortStatus: number | null;
    /**
     * The daylight-factor result format the run chose. `mergeParts` uses it when the caller
     * names none. Absent on an older schedule.
     */
    readonly resultFormat?: DaylightResultFormat;
}
/**
 * The offline answer of `previewParts`: what a run would submit and bill.
 *
 * @category Run an analysis
 */
export interface PartsPreview {
    /** The analysis type of the request. */
    readonly analysisType: string;
    /** Jobs the run submits: 1 when the request does not split. */
    readonly partCount: number;
    /** Exact sensors of the request (the worker's own grid); 0 when not planned. */
    readonly totalSensors: number;
    /** The parts of the plan; empty when the request is not planned into parts. */
    readonly parts: readonly {
        /** Key of the part. */
        readonly key: string;
        /** Keys of the floors the part covers. */
        readonly floorKeys: readonly string[];
        /** Number of sensors in the part. */
        readonly sensors: number;
    }[];
    /** Tokens billed per job. */
    readonly tokensPerJob: number;
    /** Estimated cost of the run in tokens: `partCount` times `tokensPerJob`. */
    readonly estimatedCostTokens: number;
    /** Why the request is sent as one part, when it is. */
    readonly unsplitReason?: string;
    /** Notes on inputs the analysis accepts silently. */
    readonly notes: readonly string[];
}
/**
 * Options for submitting a request as parts.
 *
 * @category Run an analysis
 */
export interface PartsOptions {
    /**
     * The most jobs the run may submit. `1` turns splitting off: the request is
     * sent as one job, exactly as `analyses.execute` sends it. A plan with more
     * parts than a larger value is refused before any request. Default: no
     * limit.
     */
    readonly maxParts?: number;
    /** Width of the submit and download pools (default 8). */
    readonly maxWorkers?: number;
    /** A URL the API calls when a job reaches one of `webhookEvents`. */
    readonly webhookUrl?: string;
    /** The job events that trigger `webhookUrl`. */
    readonly webhookEvents?: readonly string[];
    /**
     * How the parts are sent, as for `analyses.execute`. Unset (the default) picks the route
     * automatically from what the server supports: the binary route, where the scene is
     * uploaded once, or JSON. `"json"` keeps every part on JSON; `"binary"` sends the request
     * as a single job and never splits it.
     */
    readonly transport?: "json" | "binary";
    /**
     * The format of a daylight-factor result. `"irbf"`: a `DaylightFactorResult` (typed-array
     * views, with `toJson()` on demand); parts ask the server for binary results when it
     * offers them, else JSON, which is converted into the same frame. `"json"`: the JSON
     * value. Unset: `DEFAULT_DAYLIGHT_RESULT_FORMAT`. Other analyses ignore it.
     */
    readonly resultFormat?: DaylightResultFormat;
    /** Aborts the run. */
    readonly signal?: AbortSignal;
    /**
     * A schedule from an earlier run of the same request (its `requestDigest` must match).
     * Only the parts that failed (a failed submission or a failed job) are sent again; a
     * part whose submission outcome is unknown never is.
     */
    readonly retryFrom?: PartsSchedule;
    /**
     * Called with the job id and part key of each part the server accepts. An observer only:
     * use it to store job ids before the run returns.
     */
    readonly onAccepted?: (jobId: string, partKey: string) => void;
    /** Called with the progress of the run each time the parts are polled. */
    readonly onProgress?: (state: AreaState) => void;
}
/**
 * Options for running parts and waiting for them to finish.
 *
 * @category Run an analysis
 */
export interface PartsWaitOptions extends PartsOptions {
    /**
     * Seconds to wait for every part. Default 900, the same as for one job. Checked before
     * any request is sent.
     */
    readonly timeout?: number;
}
/**
 * A parts run that cannot be joined because a part did not produce a result.
 *
 * `failedParts` names them; `runParts(input, { retryFrom: error.schedule })`
 * (or `runAndWait` with the same option) sends only those parts again.
 *
 * @category Errors
 */
export declare class AnalysisPartsError extends Error {
    /** Parts a `retryFrom` sends again; empty when every part has a result. */
    readonly failedParts: readonly string[];
    /** The run, with its accepted jobs. */
    readonly schedule: PartsSchedule;
    /** Parts whose result is on the server but did not download. */
    readonly downloadFailedParts: readonly string[];
    readonly name = "AnalysisPartsError";
    /**
     * @param message - What went wrong.
     * @param failedParts - Parts a `retryFrom` sends again; empty when every part has a result.
     * @param schedule - The run, with its accepted jobs.
     * @param downloadFailedParts - Parts whose result is on the server but did not download:
     * `mergeParts(schedule)` (or a `retryFrom`, which then sends nothing) downloads them again.
     * @param options - Standard error options, such as `cause`.
     */
    constructor(message: string, 
    /** Parts a `retryFrom` sends again; empty when every part has a result. */
    failedParts: readonly string[], 
    /** The run, with its accepted jobs. */
    schedule: PartsSchedule, 
    /** Parts whose result is on the server but did not download. */
    downloadFailedParts?: readonly string[], options?: ErrorOptions);
}
