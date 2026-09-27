import type { TileArtifact } from "./binary-artifact.js";
/**
 * The binary facade safety net (D156).
 *
 * A facade job's sensors are synthesized by the SERVER on every mesh in the
 * uploaded artifact's `geometries` group. The plan priced and counted the
 * sensors of ONE batch — its planned target buildings — so an artifact whose
 * `geometries` holds anything else makes the server synthesize sensors the
 * plan never counted: a wrong result with no error, or a 422 over the sensor
 * cap AFTER the job was billed (0.12.13-next.10, where every batch of a tile
 * uploaded the whole tile).
 *
 * The check runs in `prepareBinary`, which the area run calls for EVERY entry
 * before its first paid POST, so a mismatch stops the whole run unbilled.
 */
/** A facade batch's artifact, with the target ids its frame really carries. */
export interface FacadeArtifact extends TileArtifact {
    /**
     * Ids of the frame's `geometries` group, in frame order, as the kernel
     * encoder wrote them (`Site.facadeFrames`, D160). No host code parses
     * the frame header.
     */
    readonly targetIds: readonly string[];
}
/**
 * The binary artifact of a facade body would make the server synthesize
 * sensors on buildings the plan did not count. Raised before any upload or
 * paid POST; nothing was billed.
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
/** True when a wire body asks the server to synthesize surface sensors. */
export declare function isSurfaceBody(body: Readonly<Record<string, unknown>>): boolean;
/**
 * Refuse a surface body whose area artifact does not carry EXACTLY the body's
 * planned targets. A direct `submit` encodes its own body (`bodyArtifact`) and
 * is correct by construction, so it has no `artifact` here and is not checked.
 */
export declare function checkFacadeArtifact(analysisType: string, body: Readonly<Record<string, unknown>>, artifact: TileArtifact): void;
