import { requireCore } from "./core.js";
const BOXING_DECISIONS = [
    "capability-excludes-vegetation",
    "fallback-model-list",
];
/**
 * The kernel's verdict for `model`, given the groups its LIVE capability
 * advertises (or `undefined` when no document has been read).
 *
 * Asks the kernel rather than keeping a rule: the decision and the fallback
 * list live in `ir_simprep::vegetation_box`, so a third model joining the
 * substitution is one edit there and not three edits across two SDKs.
 */
export function treeBoxDecision(model, geometryGroups) {
    const groups = geometryGroups === undefined ? null : [...geometryGroups];
    return requireCore().vegetationTreeBoxDecision(model, JSON.stringify(groups));
}
/** True when `decision` is one of the two verdicts that box. */
export function decisionBoxesTrees(decision) {
    return BOXING_DECISIONS.includes(decision);
}
/**
 * The one INFO line a substitution writes, as text.
 *
 * Shared by the caller that logs it and the test that asserts it, so the two
 * cannot drift, and worded like the Python host's line so an operator reading
 * both SDKs' logs sees one message.
 */
export function treeBoxLogLine(record) {
    return (`binary ${record.model}: ${record.trees} tree(s) converted to ` +
        `${record.footprintM.toFixed(1)} m x ${record.footprintM.toFixed(1)} m x ` +
        `${record.heightM.toFixed(1)} m boxes in the geometry layer ` +
        `(${record.boxesSent} sent, ${record.seatedOnTerrain} seated on terrain, ` +
        `${record.boxesSent - record.seatedOnTerrain} on z=0); this model carries no ` +
        `vegetation group on the binary transport (${record.decidedBy})`);
}
/** The warning an id collision writes, as text. */
export function treeBoxCollisionLine(record) {
    const ids = record.idCollisions;
    return (`binary ${record.model}: ${ids.length} tree id(s) already name a building in ` +
        `\`geometries\`; the building was kept and the box dropped (${ids.slice(0, 5).join(", ")})`);
}
/** The warning an out-of-tile box writes, as text. */
export function treeBoxOutOfTileLine(record) {
    return (`binary ${record.model}: ${record.outsideTile} of ${record.boxesSent} tree box(es) fall ` +
        `outside the 512 m inference tile this payload describes and cannot affect its result. ` +
        `They are still sent — dropping geometry silently is worse — but a whole site's trees on ` +
        `one payload is usually a missing per-tile assignment; runArea does that for you.`);
}
