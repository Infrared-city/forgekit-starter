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
}
export declare function capability(gateway: GatewayTransport, signal?: AbortSignal): Promise<BinaryCapability>;
export declare function prepareBinary(prepared: PreparedSubmission, supported: BinaryCapability): Promise<PreparedBinary>;
export declare function uploadGeometry(uploadGateway: GatewayTransport, fetch: FetchLike, prepared: PreparedBinary, timeoutMs: number, signal?: AbortSignal): Promise<string>;
export declare function binarySubmission(binary: PreparedBinary, geometryUrl: string): BinarySubmission;
export declare function submitBinary(gateway: GatewayTransport, prepared: PreparedSubmission, binary: BinarySubmission, parseJob: (value: unknown) => Job, signal?: AbortSignal, beforeDispatch?: () => void): Promise<Job>;
export {};
