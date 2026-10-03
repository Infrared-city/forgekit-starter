/**
 * Daylight-factor floor parts (plan `docs/plans/2026-09-30-daylight-batching-
 * tiles-floors.md`, D221): the shapes a caller sees.
 *
 * The kernel (`daylightParts`, `daylightPartBody`, `daylightMerge`) plans the
 * parts, writes each part body and joins the part results. This package only
 * submits, polls, downloads and retries. The request itself stays a
 * wire-keyed body (D109: no per-model types in this SDK).
 */
import type { AreaJob, AreaState } from "../area/schedule-types.js";
import type { DaylightResultFormat } from "./result-format.js";
/** One part of the kernel plan, as the kernel writes it. */
export interface KernelPart {
    readonly key: string;
    /** The part's `floors` selectors; `null` for a request sent as one part. */
    readonly floors: readonly unknown[] | null;
    readonly floor_keys: readonly string[];
    readonly sensors: number;
}
/** The kernel plan (`daylightParts`), parsed. */
export interface KernelPartsPlan {
    readonly tier: string;
    readonly target: number;
    readonly total_sensors: number;
    readonly parts: readonly KernelPart[];
    readonly unsplit_reason: string | null;
    readonly notes: readonly string[];
}
/**
 * A submitted parts run. Like an `AreaSchedule`, its job records are mutable
 * for polling; `checkPartsState` updates them.
 */
export interface PartsSchedule {
    readonly analysisType: string;
    /** `sha256:` of the request's JSON wire bytes; a `retryFrom` must match it.
     * Absent when the runtime has no SHA-256; such a schedule cannot be retried. */
    readonly requestDigest?: string;
    /** The kernel plan, verbatim: the join reads it. */
    readonly plan: string;
    /** Part keys, in plan order. */
    readonly partKeys: readonly string[];
    readonly jobs: ReadonlyMap<string, AreaJob>;
    readonly failedSubmissions: readonly string[];
    /** Parts whose POST may have been accepted. Never resubmitted automatically. */
    readonly uncertainSubmissions: readonly string[];
    readonly submissionAbortStatus: number | null;
    /** The daylight-factor result format the run chose (D234); `mergeParts`
     * uses it when the caller names none. Absent on an older schedule. */
    readonly resultFormat?: DaylightResultFormat;
}
/** The offline answer of `previewParts`: what a run would submit and bill. */
export interface PartsPreview {
    readonly analysisType: string;
    /** Jobs the run submits: 1 when the request does not split. */
    readonly partCount: number;
    /** Exact sensors of the request (the worker's own grid); 0 when not planned. */
    readonly totalSensors: number;
    readonly parts: readonly {
        readonly key: string;
        readonly floorKeys: readonly string[];
        readonly sensors: number;
    }[];
    readonly tokensPerJob: number;
    readonly estimatedCostTokens: number;
    /** Why the kernel sent the request as one part, when it did. */
    readonly unsplitReason?: string;
    /** The kernel's notes on inputs the worker accepts silently. */
    readonly notes: readonly string[];
}
export interface PartsOptions {
    /**
     * The most jobs the run may submit. `1` turns splitting off: the request is
     * sent as ONE job, exactly as `analyses.execute` sends it. A plan with more
     * parts than a larger value is refused before any request. Default: no
     * limit.
     */
    readonly maxParts?: number;
    /** Width of the submit and download pools (default 8). */
    readonly maxWorkers?: number;
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
    /**
     * As `analyses.execute`. Unset (the default) auto-routes the PARTS: the
     * live capability's daylight-factor row decides between the interior
     * binary route (D228, the scene uploaded once) and JSON, byte-identical
     * to before D228. `"json"` keeps every part on JSON; `"binary"` is
     * unchanged pre-D228 behavior — a single job, never a parts split.
     */
    readonly transport?: "json" | "binary";
    /**
     * The daylight-factor result (D234). `"irbf"`: a `DaylightFactorResult`
     * (TypedArray views, `toJson()` on demand); the parts ask the server for
     * binary results when its capability lists them, else JSON, which the
     * kernel turns into the same frame. `"json"`: the JSON value, as before.
     * Unset: `DEFAULT_DAYLIGHT_RESULT_FORMAT`. Other analyses ignore it.
     */
    readonly resultFormat?: DaylightResultFormat;
    readonly signal?: AbortSignal;
    /**
     * A schedule from an earlier run of the SAME request (its `requestDigest`
     * must match). Only the parts that failed — a failed POST or a failed job —
     * are sent again; a part whose POST outcome is unknown never is.
     */
    readonly retryFrom?: PartsSchedule;
    readonly onAccepted?: (jobId: string, partKey: string) => void;
    readonly onProgress?: (state: AreaState) => void;
}
export interface PartsWaitOptions extends PartsOptions {
    /** Seconds to wait for every part (default: the kernel poll timeout, 900 s,
     * the same as one job). Checked before any request. */
    readonly timeout?: number;
}
/**
 * A parts run that cannot be joined because a part did not produce a result.
 * `failedParts` names them; `runParts(input, { retryFrom: error.schedule })`
 * (or `runAndWait` with the same option) sends only those parts again.
 */
export declare class AnalysisPartsError extends Error {
    /** Parts a `retryFrom` sends again; empty when every part has a result. */
    readonly failedParts: readonly string[];
    readonly schedule: PartsSchedule;
    /** Parts whose result is on the server but did not download: `mergeParts(schedule)`
     * (or a `retryFrom`, which then sends nothing) downloads them again. */
    readonly downloadFailedParts: readonly string[];
    readonly name = "AnalysisPartsError";
    constructor(message: string, 
    /** Parts a `retryFrom` sends again; empty when every part has a result. */
    failedParts: readonly string[], schedule: PartsSchedule, 
    /** Parts whose result is on the server but did not download: `mergeParts(schedule)`
     * (or a `retryFrom`, which then sends nothing) downloads them again. */
    downloadFailedParts?: readonly string[], options?: ErrorOptions);
}
