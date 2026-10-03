import type { Job, PreparedSubmission } from "../jobs.js";
import { type UploadArtifact } from "./binary-artifact.js";
import { GatewayTransport, type FetchLike } from "./transport.js";
import { type TreeBoxSubstitution } from "./tree-boxes.js";
type JsonObject = Record<string, unknown>;
export interface BinaryLimits {
    maxGeometryBytes: number;
    maxMetadataBytes: number;
    maxMeshes: number;
    maxInstances: number;
    maxResultBytes: number;
    maxResultCells: number;
    maxTriangleValues: number;
}
export interface BinaryCapability {
    inputFormat: "irbf";
    resultFormat: "irbf";
    wireVersion: 1;
    models: Record<string, {
        geometryGroups: string[];
        resultFamilies: string[];
    }>;
    limits: BinaryLimits;
    /** The geometry document schemas the server reads (D206); absent = `[1]`. */
    geometrySchemas?: readonly number[];
    /** The server reads a job's `targets` range (#602); absent = per-job frames. */
    facadeTargets?: number;
}
export interface PreparedBinary {
    readonly artifact: UploadArtifact;
    readonly control: JsonObject;
    readonly limits: BinaryLimits;
    /** Set when this model's live capability made the SDK box the body's trees. */
    readonly treeBoxes?: TreeBoxSubstitution;
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
export declare function prepareBinary(prepared: PreparedSubmission, supported: BinaryCapability): Promise<PreparedBinary>;
export declare function uploadGeometry(uploadGateway: GatewayTransport, fetch: FetchLike, prepared: PreparedBinary, timeoutMs: number, signal?: AbortSignal): Promise<string>;
export declare function binarySubmission(binary: PreparedBinary, geometryUrl: string, resultFormat?: "irbf" | "json"): BinarySubmission;
export declare function submitBinary(gateway: GatewayTransport, prepared: PreparedSubmission, binary: BinarySubmission, parseJob: (value: unknown) => Job, signal?: AbortSignal, beforeDispatch?: () => void, idempotencyKey?: string): Promise<Job>;
export {};
