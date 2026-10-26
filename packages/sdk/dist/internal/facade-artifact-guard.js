import { KernelGroup } from "./kernel-group.js";
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
export class FacadeArtifactMismatchError extends Error {
    analysisType;
    missing;
    unplanned;
    name = "FacadeArtifactMismatchError";
    constructor(analysisType, 
    /** Planned target ids that the artifact does not carry as targets. */
    missing, 
    /** Artifact target ids that the plan did not count. */
    unplanned) {
        super(`binary ${analysisType}: the facade artifact does not carry exactly the batch's planned ` +
            `target buildings (${missing.length} missing, ${unplanned.length} unplanned); ` +
            "refused before any paid submission");
        this.analysisType = analysisType;
        this.missing = missing;
        this.unplanned = unplanned;
    }
}
// Maintainer note (not published): true when a wire body asks the server to
// synthesize surface sensors.
export function isSurfaceBody(body) {
    return typeof body["analysis-surfaces"] === "string";
}
// Maintainer note (not published): refuse a surface body whose area artifact does
// not carry EXACTLY the body's planned targets. A direct `submit` encodes its own
// body (`bodyArtifact`) and is correct by construction, so it has no `artifact`
// here and is not checked.
export function checkFacadeArtifact(analysisType, body, artifact) {
    const geometries = body.geometries;
    const planned = geometries instanceof KernelGroup
        ? [...(geometries.ids ?? [])]
        : geometries !== null && typeof geometries === "object" && !Array.isArray(geometries)
            ? Object.keys(geometries) : [];
    // A tile artifact reports no targets: it is the unsplit tile, never a batch.
    const carried = artifact.targetIds;
    if (carried === undefined)
        throw new FacadeArtifactMismatchError(analysisType, planned, ["<unsplit tile>"]);
    const have = new Set(carried);
    const want = new Set(planned);
    const missing = planned.filter((id) => !have.has(id));
    const unplanned = carried.filter((id) => !want.has(id));
    if (missing.length > 0 || unplanned.length > 0 || have.size !== carried.length) {
        throw new FacadeArtifactMismatchError(analysisType, missing, unplanned);
    }
}
