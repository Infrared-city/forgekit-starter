import type { PreparedBinary } from "./internal/binary-submission.js";
import type { ArtifactLimits, TileArtifact } from "./internal/binary-artifact.js";
import type { BinaryAcknowledgement } from "./job-options.js";
/**
 * The states a job can be in: `pending`, `running`, `succeeded`, `failed`, or
 * `unknown` when the service reports a status the SDK does not recognise.
 *
 * @category Run an analysis
 */
export declare const JobStatus: {
    readonly Pending: "pending";
    readonly Running: "running";
    readonly Succeeded: "succeeded";
    readonly Failed: "failed";
    readonly Unknown: "unknown";
};
/**
 * One of the `JobStatus` values: `"pending"`, `"running"`, `"succeeded"`,
 * `"failed"` or `"unknown"`.
 *
 * @category Run an analysis
 */
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
/**
 * A submitted analysis job, as reported by the service.
 *
 * @category Run an analysis
 */
export interface Job {
    /** The job's unique id. */
    readonly jobId: string;
    /** The analysis the job runs; an empty string when the service did not report it. */
    readonly modelName: string;
    /** Current status of the job. */
    readonly status: JobStatus;
    /** When the job was requested, as reported by the service; empty when not reported. */
    readonly requestedAt: string;
    /** When the job started running, when reported. */
    readonly startedAt?: string;
    /** When the job finished, when reported. */
    readonly finishedAt?: string;
    /** Link to download the results from, when the service reports one. */
    readonly resultsUrl?: string;
    /** The failure message, when the job failed. */
    readonly error?: string;
    /** The service's acknowledgement, when the job was submitted over the binary transport. */
    readonly binary?: BinaryAcknowledgement;
}
/**
 * A validated, mesh-packed request body that is ready to be submitted.
 *
 * @category Run an analysis
 */
export interface PreparedSubmission {
    /** The analysis the body is for, e.g. `"wind-speed"`. */
    readonly analysisType: string;
    /** The request body that will be sent. */
    readonly body: Readonly<Record<string, unknown>>;
    /** Scope under which compatible geometry from earlier submissions can be reused. */
    readonly reuseScope?: string;
    /** How the body is sent: as JSON or as a compact binary upload. */
    readonly transport: "json" | "binary";
    /**
     * Builds the tile's binary upload, for a body that an area plan produced. A direct
     * submission has none.
     */
    readonly artifact?: (limits: ArtifactLimits) => TileArtifact;
    /**
     * The exact JSON bytes of `body`, when they were already written once. The JSON
     * route sends these bytes instead of serializing `body` again. A direct submission
     * has none.
     */
    readonly json?: () => Uint8Array;
    /**
     * A prepared binary upload for one part of an interior (daylight-factor) analysis.
     * Absent on every other submission.
     */
    readonly interiorBinary?: PreparedBinary;
    /** The result format an interior binary part asks for; unset means `"json"`. */
    readonly interiorResultFormat?: "irbf" | "json";
}
/**
 * Check that a job id is a non-empty string and return it.
 *
 * @param jobId - The job id to check.
 * @returns The same `jobId`.
 * @throws {TypeError} when `jobId` is not a non-empty string.
 *
 * @category Run an analysis
 */
export declare function requireJobId(jobId: string): string;
