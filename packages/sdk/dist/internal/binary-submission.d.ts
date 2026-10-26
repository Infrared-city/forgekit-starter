import type { Job, PreparedSubmission } from "../jobs.js";
import { type UploadArtifact } from "./binary-artifact.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
type JsonObject = Record<string, unknown>;
/**
 * The size limits the service sets for a binary request and its result.
 *
 * @category Requests
 */
export interface BinaryLimits {
    maxGeometryBytes: number;
    maxMetadataBytes: number;
    maxMeshes: number;
    maxInstances: number;
    maxResultBytes: number;
    maxResultCells: number;
    maxTriangleValues: number;
}
/**
 * What the service accepts on its binary route: formats, models and limits.
 *
 * @category Requests
 */
export interface BinaryCapability {
    inputFormat: "irbf";
    resultFormat: "irbf";
    wireVersion: 1;
    models: Record<string, {
        geometryGroups: string[];
        resultFamilies: string[];
    }>;
    limits: BinaryLimits;
    /** The geometry document versions the service reads; when absent, only `1`. */
    geometrySchemas?: readonly number[];
    /** Present when the service reads a job's `targets` range; when absent, each job has its own frame. */
    facadeTargets?: number;
}
export interface PreparedBinary {
    readonly artifact: UploadArtifact;
    readonly control: JsonObject;
    readonly limits: BinaryLimits;
}
export interface BinarySubmission {
    readonly geometry: JsonObject;
    readonly control: JsonObject;
    readonly limits: BinaryLimits;
    /** The job's range in the uploaded scene (#602), when the artifact carries one. */
    readonly targets?: {
        readonly start: number;
        readonly count: number;
    };
    /**
     * The RESULT family this submission asks for (D228): `"irbf"` for the
     * outdoor/facade binary route (every caller before D228), `"json"` for an
     * interior binary part, whose result is the JSON route's own result (the
     * existing `daylightMerge` reads it unchanged). The envelope's
     * `inputFormat` is always `"irbf"` — only the geometry archive changes
     * format; this field is the OTHER side of the request.
     */
    readonly resultFormat: "irbf" | "json";
}
export declare function capability(gateway: GatewayTransport, signal?: AbortSignal): Promise<BinaryCapability>;
/**
 * The checks of a binary route that hold for every job of a run: the geometry
 * schema and the model's binary route. An area run makes them once, before
 * its first paid POST (#816, D277); each job makes them again here.
 */
export declare function checkBinaryRoute(analysisType: string, supported: BinaryCapability): BinaryCapability["models"][string];
export declare function prepareBinary(prepared: PreparedSubmission, supported: BinaryCapability): Promise<PreparedBinary>;
export declare function uploadGeometry(uploadGateway: GatewayTransport, fetch: FetchLike, prepared: PreparedBinary, timeoutMs: number, signal?: AbortSignal): Promise<string>;
export declare function binarySubmission(binary: PreparedBinary, geometryUrl: string, resultFormat?: "irbf" | "json"): BinarySubmission;
export declare function submitBinary(gateway: GatewayTransport, prepared: PreparedSubmission, binary: BinarySubmission, parseJob: (value: unknown) => Job, signal?: AbortSignal, beforeDispatch?: () => void, idempotencyKey?: string): Promise<Job>;
export {};
