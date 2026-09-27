/**
 * Trees as boxes on the binary wind routes — the host's share of D70.
 *
 * The server's `/binary/v1/capabilities` document lists only `geometries` and
 * `ground-geometry` for `wind-speed` and `pedestrian-wind-comfort`, so a
 * binary wind or PWC body that carries trees has nowhere to put them and this
 * SDK used to throw before any HTTP. It no longer throws: each tree becomes a
 * solid box in the geometry (buildings) layer, which is what callers do by
 * hand today (infrared-core#243).
 *
 * **The capability document decides, not the model name.** The substitution
 * exists because the server cannot carry trees on those routes, and #243 names
 * "ask the backend to add `vegetation` to the capability document" as the
 * alternative fix. On the day that ships, boxing trees would throw the real
 * geometry away on every paid run with no error and no warning, and nothing
 * client-side would notice. So the decision is only ever taken with the LIVE
 * `geometryGroups` in hand (`prepareBinary`, after the capability fetch), and
 * the kernel's model list is the fallback for the case where there is no
 * document to ask.
 *
 * Everything geometric is the KERNEL's (`ir_simprep::vegetation_box`), and
 * since D101 so is the substitution itself: the kernel boxes a tile's trees
 * inside `SiteAssignment.artifacts` and a direct body's inside
 * `geometryArtifact`, and reports the counts. This module is the decision,
 * the record a caller reads back, and the log lines. The Python host does the
 * same through the same kernel calls (`_internal/tree_boxes.py`).
 *
 * The JSON transport is untouched: it carries `vegetation` natively and the
 * server meshes the trees properly there.
 */
/** What a substitution did, as `Job.treeBoxes` and `AreaJob.treeBoxes` carry it.
 *
 * Every count is of boxes ACTUALLY SENT — the kernel resolves the id
 * collisions and counts what it emitted, so this host does no arithmetic and a
 * record can never describe boxes nobody received.
 */
export interface TreeBoxSubstitution {
    /** Trees the group carried. */
    readonly trees: number;
    /** Boxes actually added to the geometry group. */
    readonly boxesSent: number;
    /** How many of those were seated on a terrain sample rather than on z = 0. */
    readonly seatedOnTerrain: number;
    /** How many of those fall outside the 512 m inference tile. */
    readonly outsideTile: number;
    /** Tree ids that already named an existing geometry, so no box was sent. */
    readonly idCollisions: readonly string[];
    /** The box footprint actually used, metres — the kernel's own constant. */
    readonly footprintM: number;
    /** The box height actually used, metres — the kernel's own constant. */
    readonly heightM: number;
    /** The route this happened on. */
    readonly model: string;
    /** Which half answered: the live capability, or the kernel's fallback list. */
    readonly decidedBy: TreeBoxDecision;
}
/** The kernel's verdict tags. The first and third box; the others do not. */
export type TreeBoxDecision = "capability-excludes-vegetation" | "capability-lists-vegetation" | "fallback-model-list" | "model-not-boxed";
/**
 * The kernel's verdict for `model`, given the groups its LIVE capability
 * advertises (or `undefined` when no document has been read).
 *
 * Asks the kernel rather than keeping a rule: the decision and the fallback
 * list live in `ir_simprep::vegetation_box`, so a third model joining the
 * substitution is one edit there and not three edits across two SDKs.
 */
export declare function treeBoxDecision(model: string, geometryGroups: readonly string[] | undefined): TreeBoxDecision;
/** True when `decision` is one of the two verdicts that box. */
export declare function decisionBoxesTrees(decision: TreeBoxDecision): boolean;
/**
 * The one INFO line a substitution writes, as text.
 *
 * Shared by the caller that logs it and the test that asserts it, so the two
 * cannot drift, and worded like the Python host's line so an operator reading
 * both SDKs' logs sees one message.
 */
export declare function treeBoxLogLine(record: TreeBoxSubstitution): string;
/** The warning an id collision writes, as text. */
export declare function treeBoxCollisionLine(record: TreeBoxSubstitution): string;
/** The warning an out-of-tile box writes, as text. */
export declare function treeBoxOutOfTileLine(record: TreeBoxSubstitution): string;
