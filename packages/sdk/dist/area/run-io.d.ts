import { type JobsService } from "../jobs.js";
import { type Logger } from "../logger.js";
import type { GridMerge } from "./grid-merge.js";
import type { SurfaceFeed } from "./merge-surface.js";
import type { CaptureHold } from "./facade-captures.js";
import type { AreaMergeJobsService } from "./merge.js";
import type { SubmissionEntry } from "./plan-types.js";
import type { AreaJobsService, AreaStatusService } from "./run-options.js";
import { type EngineAction, type EngineEvent } from "./run-engine.js";
import { rawAnswer } from "./raw-answer.js";
export { rawAnswer };
import type { AreaJob } from "./schedule-types.js";
/** The client service a run needs; `InfraredClient.jobs` satisfies it. */
export type RunService = AreaJobsService & AreaStatusService & AreaMergeJobsService & Partial<Pick<JobsService, "downloadResultsOnce" | "prepareBatchItem" | "postBatch" | "batchSubmit" | "binaryCapability">>;
/** One analysis of a run, by its engine index: the IO side of its keys. */
export interface RunAnalysis {
    readonly entries: ReadonlyMap<string, SubmissionEntry>;
    /** Every job record, by key. */
    readonly jobs: Map<string, AreaJob>;
    /** The merger of a grid analysis. */
    readonly grid?: GridMerge;
    /** The kernel join of a surface analysis: each download goes in as it lands (D-2026101011-slate-aspen-pine). */
    readonly surface?: SurfaceFeed;
    /** The archives of any other download (daylight-factor parts), by job id. */
    readonly archives?: Map<string, Uint8Array>;
    /** Before the POST of one entry (a facade capture); its value goes to `remember`. */
    readonly capture?: (entry: SubmissionEntry) => Promise<CaptureHold | Uint8Array | undefined>;
    readonly remember?: (capture: CaptureHold | Uint8Array | undefined, jobId: string) => void;
}
export interface RunIo {
    readonly service: RunService;
    readonly analyses: readonly RunAnalysis[];
    /** Job id → engine index and key. */
    readonly byJob: Map<string, {
        readonly a: number;
        readonly key: string;
    }>;
    readonly onAccepted?: (jobId: string, tileKey: string) => void;
    /** An invalid geometry-reference acceptance: the caller stops the run. */
    readonly onInvalidReference?: () => void;
    /** True once the run stopped: no POST leaves after it. */
    readonly stopped?: () => boolean;
    /** Receives the warning of a `remember` error. Unset: the console. */
    readonly logger?: Logger;
}
/** A batch submit accepted a prepared key (no IO): what an accepted POST records. */
export declare function acceptedAction(io: RunIo, act: Extract<EngineAction, {
    kind: "accepted";
}>): void;
/** The run is over: release the captures of keys no batch accepted. */
export declare function freePreparedCaptures(io: RunIo): void;
/** Do the IO of one action; the raw answer as one event. A rejection is a `host_error`. */
export declare function runAction(io: RunIo, act: Exclude<EngineAction, {
    kind: "finish" | "accepted";
}>, signal: AbortSignal): Promise<EngineEvent>;
/** The engine config of a run that sends `entries`: batch submit when one is binary and the API offers it. */
export declare function batchConfig(service: RunService, binary: boolean, signal: AbortSignal): Promise<{
    batch_submit?: unknown;
}>;
