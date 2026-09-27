/** Compile-time contract for the generated surfgrid option overloads. */
type Core = typeof import("../../generated/infrared-core.js");
declare function checkSurfaceBufferTypes(core: Core, optionalCompact: boolean, nullableCompact: true | null | undefined): void;
export type SurfgridTypeCheck = typeof checkSurfaceBufferTypes;
export {};
