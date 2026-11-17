/**
 * `runArea`, the merges and the daylight-factor parts on the kernel
 * `RunEngine` (the TypeScript twin of Python `_engine_submit.py` and
 * `merge_on_engine`). One driver (`run-engine.ts`), one IO (`run-io.ts`):
 *
 * - `submitOnEngine`: send every entry (goal `sent`).
 * - `collectOnEngine`: ask every job and download the ready ones (goal
 *   `available`), or wait for them (goal `results`).
 *
 * The engine decides every POST, poll, download, retry and stop.
 */
import type { Logger } from "../logger.js";
import { type EngineFacts, type EngineOutcome } from "./run-engine.js";
import { type RunAnalysis, type RunService } from "./run-io.js";
import type { SurfaceFeed } from "./merge-surface.js";
import type { GridMerge } from "./grid-merge.js";
import type { SubmissionEntry } from "./plan-types.js";
import type { AreaJob, TileJobStatus } from "./schedule-types.js";
/** What a submit gives the schedule. */
export interface SubmitOutcome {
    readonly jobs: Map<string, AreaJob>;
    readonly failedSubmissions: string[];
    readonly uncertainSubmissions: string[];
    readonly invalidReferenceSubmissions: string[];
    readonly submissionAbortStatus: number | null;
    readonly runId: string;
    readonly attempts: Readonly<Record<string, number>>;
}
export interface SubmitOnEngineOptions {
    readonly runId: string;
    /** The attempt of each key (a retry); unset: attempt 1. */
    readonly attempts?: Readonly<Record<string, number>>;
    readonly signal?: AbortSignal;
    readonly onAccepted?: (jobId: string, tileKey: string) => void;
    /** Prior records (a `retryFrom`); the keys sent now replace theirs. */
    readonly priorJobs?: ReadonlyMap<string, AreaJob>;
    readonly priorUncertain?: readonly string[];
    readonly priorInvalidReference?: readonly string[];
    readonly capture?: RunAnalysis["capture"];
    readonly remember?: RunAnalysis["remember"];
    /** Receives the warning of a `remember` error (#835). Unset: the console. */
    readonly logger?: Logger;
}
/**
 * The job records of an analysis from the engine's facts: a key with no job
 * is `failed` (safe to send again) or `skipped` (uncertain, never sent again
 * by the SDK). Records of keys with a job are the IO's own.
 */
export declare function recordsFromFacts(an: RunAnalysis, facts: EngineFacts): void;
/** Send every entry once to the engine's end (goal `sent`). */
export declare function submitOnEngine(service: RunService, entries: readonly SubmissionEntry[], options: SubmitOnEngineOptions): Promise<SubmitOutcome>;
export interface CollectOptions {
    /** `status`: ask once; `available`: ask once, download the ready jobs; `results`: wait for every job. */
    readonly goal: "status" | "available" | "results";
    readonly signal?: AbortSignal;
    /** Goal `results`: how long the jobs may take on the server. */
    readonly timeoutS?: number;
    /** Goal `results`: after each status answer. */
    readonly onProgress?: () => void;
    /** Job id to status from the caller's own earlier checks: a terminal one is not asked again. */
    readonly known?: Readonly<Record<string, TileJobStatus>>;
}
/**
 * Ask the jobs of `jobs` (records by key) and download the succeeded ones
 * into `sink.grid`, `sink.surface` or `sink.archives` (by job id). A job record known to be
 * terminal is not asked again (D52). The records get the answers.
 */
export declare function collectOnEngine(service: RunService, jobs: ReadonlyMap<string, AreaJob>, sink: {
    readonly grid?: GridMerge;
    readonly surface?: SurfaceFeed;
    readonly archives?: Map<string, Uint8Array>;
}, options: CollectOptions): Promise<{
    readonly facts: EngineFacts;
    readonly outcome: EngineOutcome;
}>;
