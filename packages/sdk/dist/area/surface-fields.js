import { requireCore } from "../internal/core.js";
/** The camelCase spelling of an analysis input. */
export const CAMEL_SURFACE_FIELDS = {
    surfaces: "analysisSurfaces", cellTris: "emitCellTris", version: "surfgridVersion", cleaning: "meshCleaning",
};
/** The wire spelling of a request body. */
export const WIRE_SURFACE_FIELDS = {
    surfaces: "analysis-surfaces", cellTris: "emit-cell-tris", version: "surfgrid-version", cleaning: "mesh-cleaning",
};
/**
 * Set the pinned surface fields of `target` to their wire values. The kernel
 * owns the rule (`surfaceWireFields`): triangles are never asked of the
 * server, a surface request names the bundled roof-gate version, a version
 * that is not the bundled one is refused, and cleaning `auto` is sent as
 * nothing.
 */
export function pinSurfaceFields(target, names) {
    // A request that names none of the four fields has nothing to pin.
    if (Object.values(names).every((key) => target[key] == null))
        return;
    const wire = JSON.parse(requireCore().surfaceWireFields(JSON.stringify({
        analysis_surfaces: target[names.surfaces] != null,
        emit_cell_tris: target[names.cellTris],
        surfgrid_version: target[names.version],
        mesh_cleaning: target[names.cleaning],
    })));
    const values = [
        [names.cellTris, wire.emit_cell_tris], [names.version, wire.surfgrid_version],
        [names.cleaning, wire.mesh_cleaning],
    ];
    for (const [key, value] of values) {
        if (value !== null && value !== undefined)
            target[key] = value;
        else if (target[key] !== null)
            delete target[key];
    }
}
