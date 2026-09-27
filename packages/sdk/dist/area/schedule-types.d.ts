import type { BinaryAcknowledgement, Job } from "../jobs.js";
import type { TreeBoxSubstitution } from "../internal/tree-boxes.js";
import type { Polygon } from "./types.js";
export type TileJobStatus = "pending" | "running" | "completed" | "failed" | "skipped";
/** One mutable job record inside a structurally immutable area schedule. */
export interface AreaJob {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    jobId?: string;
    status: TileJobStatus;
    result?: Record<string, unknown>;
    error?: string;
    lastJobSnapshot?: Job;
    /** True when this accepted reference cannot produce a trusted result. */
    invalidReference?: boolean;
    binary?: BinaryAcknowledgement;
    /**
     * What the tree -> box substitution did for this tile, or absent when it did
     * nothing (D70). Present only on a binary `wind-speed` /
     * `pedestrian-wind-comfort` tile whose payload carried vegetation: the
     * transport has no vegetation group for those two models, so each tree was
     * sent as a box in the geometry layer instead. Client-side only, never sent,
     * and never guarded on retry or merge — it records what was sent, not what a
     * tile computes.
     */
    treeBoxes?: TreeBoxSubstitution;
}
export interface TilePosition {
    readonly row: number;
    readonly col: number;
    readonly tileId: string;
}
/** Durable SDK 0.12 schedule shape. Job values remain mutable for polling. */
export interface AreaSchedule {
    readonly jobs: ReadonlyMap<string, AreaJob>;
    readonly polygon: Polygon;
    readonly configHash: string;
    /** Prepared-site input digest; absent on older schedules or without SHA-256. */
    readonly siteIdentity?: string;
    readonly tilePositions: readonly TilePosition[];
    readonly gridShape: readonly [number, number];
    readonly analysisType: string;
    readonly transport?: "json" | "binary";
    readonly wireVersion?: 1;
    readonly failedSubmissions: readonly string[];
    /** Entries whose POST may have been accepted. Never retry these automatically. */
    readonly uncertainSubmissions?: readonly string[];
    /** Referenced jobs retained for billing/support, never polling or merge. */
    readonly invalidReferenceSubmissions?: readonly string[];
    /**
     * LEGACY. Billed capability-probe job IDs, written only by SDK versions
     * that submitted a dedicated probe job. This SDK submits none: the
     * `geometry-$ref` verdict comes from the first REAL submission, whose job
     * ID is already a tile in `jobs` (D71). A schedule saved by an older
     * version still loads, and still refuses to resume.
     */
    readonly geometryProbeJobIds?: readonly string[];
    /** LEGACY, as above: a capability probe had an unknown outcome. */
    readonly geometryProbeUncertain?: boolean;
    readonly submissionAbortStatus: number | null;
    readonly surfaceFields?: boolean;
    readonly terrainContextMarginM?: number;
    readonly maxSensorsPerJob?: number;
    /**
     * The weather these tiles were computed against — the submitted columns,
     * the payload latitude and longitude and the window, under
     * `ir.weather.run-identity/1` — or absent for an analysis that reads no
     * weather array.
     *
     * The Python SDK's `configHash` covers none of that, so this is the one
     * value both hosts share and the only thing that tells two runs of the
     * same window against different weather apart. Without it a resume
     * submitted the failed tiles against one climate and carried the
     * succeeded tiles forward against another: one grid, two climates, no
     * error, after the charge. Guarded on retry (`area/planning.ts`).
     * Client-side only; never sent.
     */
    readonly weatherIdentity?: string;
    /**
     * Version of this client-side record; 4 is the RUN identity above.
     * Versions 2 and 3 recorded the identity of an EPW FILE instead, which is
     * a different preimage under a different tag and can never compare equal.
     * Absent on a schedule written before the field existed. Every value
     * below 4 is refused on a weather-bearing resume, by NAME.
     */
    readonly scheduleContractVersion?: number;
    /** Exact facade batching policy and durable batch identities. */
    readonly batchingPolicyVersion?: number;
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
}
export interface AreaScheduleJSON {
    readonly jobs: Array<[string, AreaJob]>;
    readonly polygon: Polygon;
    readonly configHash: string;
    readonly siteIdentity?: string;
    readonly tilePositions: readonly TilePosition[];
    readonly gridShape: readonly [number, number];
    readonly analysisType: string;
    readonly transport?: "json" | "binary";
    readonly wireVersion?: 1;
    readonly failedSubmissions: readonly string[];
    readonly uncertainSubmissions?: readonly string[];
    readonly invalidReferenceSubmissions?: readonly string[];
    readonly geometryProbeJobIds?: readonly string[];
    readonly geometryProbeUncertain?: boolean;
    readonly submissionAbortStatus: number | null;
    readonly surfaceFields?: boolean;
    readonly terrainContextMarginM?: number;
    readonly maxSensorsPerJob?: number;
    readonly weatherIdentity?: string;
    readonly scheduleContractVersion?: number;
    readonly batchingPolicyVersion?: number;
    readonly batchMembership?: Readonly<Record<string, readonly string[]>>;
    readonly batchSensorCounts?: Readonly<Record<string, number>>;
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
}
export interface AreaState {
    readonly totalCount: number;
    readonly completedCount: number;
    readonly failedCount: number;
    readonly skippedCount: number;
    readonly pendingCount: number;
    readonly runningCount: number;
    readonly isComplete: boolean;
}
export interface TileProgress {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly status: "running" | "completed" | "failed" | "skipped";
    readonly completedCount: number;
    readonly totalCount: number;
    readonly finishedCount: number;
    readonly elapsedTime: number;
}
export declare const TileFailurePhase: {
    readonly Submit: "submit";
    readonly Compute: "compute";
    readonly Download: "download";
    readonly Skipped: "skipped";
};
export type TileFailurePhase = (typeof TileFailurePhase)[keyof typeof TileFailurePhase];
export interface TileFailure {
    readonly tileId: string;
    readonly row: number;
    readonly col: number;
    readonly error: string;
    readonly exception?: Error;
    readonly phase?: TileFailurePhase;
}
export interface AreaResult {
    readonly mergedGrid: Float32Array | Float64Array;
    readonly gridShape: readonly [number, number];
    /** Sorted observed labels indexed by categorical `mergedGrid` ordinals. */
    readonly legend?: readonly string[];
    readonly failedJobs: readonly TileFailure[];
    readonly skippedJobs: readonly string[];
    readonly executionTime: number;
    /**
     * Every tile that did not contribute. The merge ALWAYS sets it, empty
     * included; it stays optional in the type because making it required
     * breaks every consumer that builds an `AreaResult` literal of its own.
     */
    readonly failedTiles?: readonly TileFailure[];
    readonly bounds?: readonly [number, number, number, number];
}
