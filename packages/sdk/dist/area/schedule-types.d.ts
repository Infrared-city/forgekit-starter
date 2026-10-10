import type { BinaryAcknowledgement, Job } from "../jobs.js";
import type { Polygon } from "./types.js";
import type { AreaGridDtype } from "./area-grid.js";
/**
 * The state of one tile's job: `"pending"`, `"running"`, `"completed"`, `"failed"`, or
 * `"skipped"` (not run, or no longer polled).
 *
 * @category Run an analysis
 */
export type TileJobStatus = "pending" | "running" | "completed" | "failed" | "skipped";
/**
 * The job record of one tile inside an area schedule. The schedule's structure is fixed, but the
 * job values are updated as polling proceeds.
 *
 * @category Run an analysis
 */
export interface AreaJob {
    /** Identifier of the tile this job covers. */
    readonly tileId: string;
    /** Row of the tile in the tile grid. */
    readonly row: number;
    /** Column of the tile in the tile grid. */
    readonly col: number;
    /** The job id assigned by the service, once the submission was accepted. */
    jobId?: string;
    /** Current state of the job. */
    status: TileJobStatus;
    /** The job's stored result, when one was kept. */
    result?: Record<string, unknown>;
    /** Why the job failed or was skipped, when it did. */
    error?: string;
    /** The most recent status the service reported for the job. */
    lastJobSnapshot?: Job;
    /** True when this accepted reference cannot produce a trusted result. */
    invalidReference?: boolean;
    /** The service's acknowledgement of a binary submission, when one was used. */
    binary?: BinaryAcknowledgement;
}
/**
 * Where one tile sits in the tile grid.
 *
 * @category Run an analysis
 */
export interface TilePosition {
    /** Row of the tile in the tile grid. */
    readonly row: number;
    /** Column of the tile in the tile grid. */
    readonly col: number;
    /** Identifier of the tile. */
    readonly tileId: string;
}
/**
 * Everything needed to follow, merge or retry an area run: its jobs, polygon and the identity
 * values that guard a retry. It can be saved with `areaScheduleToJSON` and restored with
 * `areaScheduleFromJSON`. Job values stay mutable so polling can update them.
 *
 * @category Run an analysis
 */
export interface AreaSchedule {
    /** The job record of each tile, by tile id. */
    readonly jobs: ReadonlyMap<string, AreaJob>;
    /** The polygon the run covers. */
    readonly polygon: Polygon;
    /** Hash of the run's configuration. A retry must produce the same value. */
    readonly configHash: string;
    /** Digest of the prepared site inputs; absent on older schedules or without SHA-256. */
    readonly siteIdentity?: string;
    /** The position of each tile in the grid. */
    readonly tilePositions: readonly TilePosition[];
    /** The tile grid size as `[rows, columns]`. */
    readonly gridShape: readonly [number, number];
    /** The analysis type of the run. */
    readonly analysisType: string;
    /** How requests were sent: `"json"` or `"binary"`. */
    readonly transport?: "json" | "binary";
    /** Version of the binary wire format; present only with the binary transport. */
    readonly wireVersion?: 1;
    /** Ids of the tiles whose submission failed. */
    readonly failedSubmissions: readonly string[];
    /** Entries whose POST may have been accepted. Never retry these automatically. */
    readonly uncertainSubmissions?: readonly string[];
    /** Referenced jobs retained for billing and support, never polled or merged. */
    readonly invalidReferenceSubmissions?: readonly string[];
    /**
     * Job ids of capability-probe jobs written by older SDK versions. This SDK submits none. A
     * schedule saved by an older version still loads, but cannot be resumed.
     */
    readonly geometryProbeJobIds?: readonly string[];
    /** Set by older SDK versions when a capability probe had an unknown outcome. */
    readonly geometryProbeUncertain?: boolean;
    /**
     * The HTTP status that stopped submission early (for example 402), or `null` when
     * submission was not aborted.
     */
    readonly submissionAbortStatus: number | null;
    /** True for a facade or roof run. */
    readonly surfaceFields?: boolean;
    /** Margin of terrain context around each tile, in metres. */
    readonly terrainContextMarginM?: number;
    /** Maximum number of sensors in one job of a facade run. */
    readonly maxSensorsPerJob?: number;
    /**
     * Identity of the weather these tiles were computed against: the submitted weather columns,
     * the location and the time window. Absent for an analysis that reads no weather.
     *
     * A retry compares it with the weather it would submit, so a resume cannot combine tiles
     * computed against different weather into one grid. It is kept on the client and never sent.
     */
    readonly weatherIdentity?: string;
    /**
     * Version of the schedule record format, used to refuse a retry of a schedule that an older
     * SDK wrote. Absent on a schedule written before the field existed.
     */
    readonly scheduleContractVersion?: number;
    /** Version of the facade batching policy; set on facade runs. */
    readonly batchingPolicyVersion?: number;
    /** The building ids in each facade batch, by batch key. */
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    /** The number of sensors in each facade batch, by batch key. */
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    /** The URL the API calls when a job reaches one of `webhookEvents`. */
    readonly webhookUrl?: string;
    /** The job events that trigger `webhookUrl`. */
    readonly webhookEvents?: readonly string[];
    /**
     * Identifier of the run, made once per schedule and kept across every `retryFrom`. Absent
     * on a schedule written before this field existed; a retry of one then gets a fresh id.
     */
    readonly runId?: string;
    /**
     * The attempt number of the current job or submission of each tile key. A missing key is
     * attempt 1.
     */
    readonly attempts?: Readonly<Record<string, number>>;
}
/**
 * The JSON form of an `AreaSchedule`, as written by `areaScheduleToJSON`. Its fields match
 * `AreaSchedule`, with `jobs` stored as an array of `[tileId, job]` pairs.
 *
 * @category Run an analysis
 */
export interface AreaScheduleJSON {
    /** The job record of each tile, as `[tileId, job]` pairs. */
    readonly jobs: Array<[string, AreaJob]>;
    /** See `AreaSchedule.polygon`. */
    readonly polygon: Polygon;
    /** See `AreaSchedule.configHash`. */
    readonly configHash: string;
    /** See `AreaSchedule.siteIdentity`. */
    readonly siteIdentity?: string;
    /** See `AreaSchedule.tilePositions`. */
    readonly tilePositions: readonly TilePosition[];
    /** See `AreaSchedule.gridShape`. */
    readonly gridShape: readonly [number, number];
    /** See `AreaSchedule.analysisType`. */
    readonly analysisType: string;
    /** See `AreaSchedule.transport`. */
    readonly transport?: "json" | "binary";
    /** See `AreaSchedule.wireVersion`. */
    readonly wireVersion?: 1;
    /** See `AreaSchedule.failedSubmissions`. */
    readonly failedSubmissions: readonly string[];
    /** See `AreaSchedule.uncertainSubmissions`. */
    readonly uncertainSubmissions?: readonly string[];
    /** See `AreaSchedule.invalidReferenceSubmissions`. */
    readonly invalidReferenceSubmissions?: readonly string[];
    /** See `AreaSchedule.geometryProbeJobIds`. */
    readonly geometryProbeJobIds?: readonly string[];
    /** See `AreaSchedule.geometryProbeUncertain`. */
    readonly geometryProbeUncertain?: boolean;
    /** See `AreaSchedule.submissionAbortStatus`. */
    readonly submissionAbortStatus: number | null;
    /** See `AreaSchedule.surfaceFields`. */
    readonly surfaceFields?: boolean;
    /** See `AreaSchedule.terrainContextMarginM`. */
    readonly terrainContextMarginM?: number;
    /** See `AreaSchedule.maxSensorsPerJob`. */
    readonly maxSensorsPerJob?: number;
    /** See `AreaSchedule.weatherIdentity`. */
    readonly weatherIdentity?: string;
    /** See `AreaSchedule.scheduleContractVersion`. */
    readonly scheduleContractVersion?: number;
    /** See `AreaSchedule.batchingPolicyVersion`. */
    readonly batchingPolicyVersion?: number;
    /** See `AreaSchedule.batchMembership`. */
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    /** See `AreaSchedule.batchSensorCounts`. */
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    /** See `AreaSchedule.webhookUrl`. */
    readonly webhookUrl?: string;
    /** See `AreaSchedule.webhookEvents`. */
    readonly webhookEvents?: readonly string[];
    /** See `AreaSchedule.runId`. */
    readonly runId?: string;
    /** See `AreaSchedule.attempts`. */
    readonly attempts?: Readonly<Record<string, number>>;
}
/**
 * Progress of an area run: how many of its jobs are in each state.
 *
 * @category Run an analysis
 */
export interface AreaState {
    /** Total number of jobs. */
    readonly totalCount: number;
    /** Jobs that completed. */
    readonly completedCount: number;
    /** Jobs that failed. */
    readonly failedCount: number;
    /** Jobs that were skipped or are no longer polled. */
    readonly skippedCount: number;
    /** Jobs not yet running. */
    readonly pendingCount: number;
    /** Jobs currently running. */
    readonly runningCount: number;
    /** True when no job is pending or running. */
    readonly isComplete: boolean;
}
/**
 * A progress report for one tile, passed to a progress callback as a run proceeds.
 *
 * @category Run an analysis
 */
export interface TileProgress {
    /** Identifier of the tile. */
    readonly tileId: string;
    /** Row of the tile in the tile grid. */
    readonly row: number;
    /** Column of the tile in the tile grid. */
    readonly col: number;
    /** State of the tile when reported. */
    readonly status: "running" | "completed" | "failed" | "skipped";
    /** Number of tiles completed so far. */
    readonly completedCount: number;
    /** Total number of tiles in the run. */
    readonly totalCount: number;
    /** Number of tiles that have finished so far. */
    readonly finishedCount: number;
    /** Time since the run started, in seconds. */
    readonly elapsedTime: number;
}
/**
 * The stage at which a tile failed or was skipped: `Submit`, `Compute`, `Download` or
 * `Skipped`.
 *
 * @category Errors
 */
export declare const TileFailurePhase: {
    readonly Submit: "submit";
    readonly Compute: "compute";
    readonly Download: "download";
    readonly Skipped: "skipped";
};
/**
 * The stage at which a tile failed or was skipped.
 *
 * @category Errors
 */
export type TileFailurePhase = (typeof TileFailurePhase)[keyof typeof TileFailurePhase];
/**
 * A tile that did not contribute to the merged grid, and why.
 *
 * @category Errors
 */
export interface TileFailure {
    /** Identifier of the tile. */
    readonly tileId: string;
    /** Row of the tile in the tile grid. */
    readonly row: number;
    /** Column of the tile in the tile grid. */
    readonly col: number;
    /** A description of what went wrong. */
    readonly error: string;
    /** The underlying error, when there was one. */
    readonly exception?: Error;
    /** The stage at which the tile failed. */
    readonly phase?: TileFailurePhase;
}
/**
 * The merged grid of an area run, with its shape, legend range, geographic bounds and the
 * tiles that did not contribute.
 *
 * @category Results and legend
 */
export interface AreaResult {
    /**
     * The merged values as one flat row-major array, laid out as described by `gridShape`, in
     * the type the server stored (`valueDtype`): a `Uint16Array` of half-precision bits
     * (`"f16"`), a `Float32Array`, an `Int16Array` of stored integers (`"i16"`, thermal comfort
     * index) or a `Float64Array` (a run that mixes types). Read physical values with
     * `areaGridValuesF32` and test a cell with `areaGridHasValue`. **An `"i16"` UTCI grid read
     * without `valueDivisor` is 10 times too large.**
     */
    readonly mergedGrid: Uint16Array | Float32Array | Int16Array | Float64Array;
    /** The type of `mergedGrid`. */
    readonly valueDtype: AreaGridDtype;
    /** `"i16"` only: physical value = stored value / `valueDivisor`. `1` for the other types. */
    readonly valueDivisor: number;
    /**
     * `"i16"` only: one bit per cell of `mergedGrid` (least significant bit first), set when the
     * cell has a value. The float types use NaN for no value.
     */
    readonly valid?: Uint8Array;
    /** The grid size as `[rows, columns]`. */
    readonly gridShape: readonly [number, number];
    /** Sorted observed labels indexed by categorical `mergedGrid` ordinals. */
    readonly legend?: readonly string[];
    /**
     * Lower end of the colour-scale range: the exact minimum of the finite cells of the finished
     * grid. Absent when no cell is finite, and for a categorical result (`legend`), whose grid
     * holds class codes rather than measurements. Other display ranges (trimmed, fixed, shared
     * across results) are available through `legendRange` and `sharedLegendRange`.
     */
    readonly minLegend?: number;
    /** Upper end of the colour-scale range; set exactly when `minLegend` is. */
    readonly maxLegend?: number;
    /** The tiles whose job failed. */
    readonly failedJobs: readonly TileFailure[];
    /** Ids of the tiles that were skipped. */
    readonly skippedJobs: readonly string[];
    /** Time the merge took, in seconds. */
    readonly executionTime: number;
    /** Every tile that did not contribute. Empty when all tiles did. */
    readonly failedTiles?: readonly TileFailure[];
    /** Geographic bounds of the grid as four numbers, when known. */
    readonly bounds?: readonly [number, number, number, number];
}
