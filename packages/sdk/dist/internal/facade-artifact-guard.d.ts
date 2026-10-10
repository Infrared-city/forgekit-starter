import type { TileArtifact } from "./binary-artifact.js";
export interface FacadeArtifact extends TileArtifact {
    readonly targetIds: readonly string[];
}
/**
 * Thrown when the binary artifact of a facade batch would make the server place
 * sensors on buildings that the run plan did not count.
 *
 * It is raised before any upload or paid request, so nothing has been billed.
 * `missing` lists planned target ids the artifact does not carry as targets, and
 * `unplanned` lists artifact target ids that the plan did not count.
 *
 * @category Errors
 */
export declare class FacadeArtifactMismatchError extends Error {
    readonly analysisType: string;
    /** Planned target ids that the artifact does not carry as targets. */
    readonly missing: readonly string[];
    /** Artifact target ids that the plan did not count. */
    readonly unplanned: readonly string[];
    readonly name = "FacadeArtifactMismatchError";
    constructor(analysisType: string, 
    /** Planned target ids that the artifact does not carry as targets. */
    missing: readonly string[], 
    /** Artifact target ids that the plan did not count. */
    unplanned: readonly string[]);
}
export declare function isSurfaceBody(body: Readonly<Record<string, unknown>>): boolean;
export declare function checkFacadeArtifact(analysisType: string, body: Readonly<Record<string, unknown>>, artifact: TileArtifact): void;
