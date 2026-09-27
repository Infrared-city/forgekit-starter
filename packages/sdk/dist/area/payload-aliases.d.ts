/**
 * The wire-name tables and the per-model field lists `payload.ts` picks with.
 *
 * Split out of `payload.ts` for the 400-line cap, not for reuse: these are
 * DATA, one entry per wire field, and they grow every time a model gains a
 * field, while the transform beside them does not. Keeping them here means a
 * new field is a one-line change in a table rather than a reason to split the
 * transform itself.
 */
export declare const TOP_LEVEL_ALIASES: Map<string, string>;
export declare const PERIOD_ALIASES: Map<string, string>;
/**
 * The kernel's snake_case model-input names, and this package's camelCase
 * spelling of each. One table, so the two cannot drift.
 */
export declare const MODEL_INPUT_NAMES: Readonly<Record<string, string>>;
export declare const BASE: readonly ["analysisType", "geometries", "vegetation", "groundMaterials"];
export declare const LOCATION: readonly ["latitude", "longitude"];
export declare const SURFACE: readonly ["analysisSurfaces", "sensorPoints", "sensorNormals", "contextGeometry", "surfaceGridSize", "surfaceOffset", "emitCellTris"];
export declare const TERRAIN: readonly ["groundGeometry", "terrainAlignment"];
