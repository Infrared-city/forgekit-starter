import type { AnyRecord } from "./payload-types.js";
/** The names of the pinned surface fields in one spelling of a request. */
export interface SurfaceFieldNames {
    readonly surfaces: string;
    readonly cellTris: string;
    readonly version: string;
    readonly cleaning: string;
}
/** The camelCase spelling of an analysis input. */
export declare const CAMEL_SURFACE_FIELDS: SurfaceFieldNames;
/** The wire spelling of a request body. */
export declare const WIRE_SURFACE_FIELDS: SurfaceFieldNames;
/**
 * Set the pinned surface fields of `target` to their wire values. The kernel
 * owns the rule (`surfaceWireFields`): triangles are never asked of the
 * server, a surface request names the bundled roof-gate version, a version
 * that is not the bundled one is refused, and cleaning `auto` is sent as
 * nothing.
 */
export declare function pinSurfaceFields(target: AnyRecord, names: SurfaceFieldNames): void;
