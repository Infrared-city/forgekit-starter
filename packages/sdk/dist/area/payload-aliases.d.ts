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
export declare const SURFACE: readonly ["analysisSurfaces", "sensorPoints", "sensorNormals", "contextGeometry", "surfaceGridSize", "surfaceOffset", "emitCellTris", "meshCleaning", "surfgridVersion"];
export declare const TERRAIN: readonly ["groundGeometry", "terrainAlignment"];
/**
 * Server-side fast mode for a long time window (lambda-models #489). Spelled
 * the same on both sides (no alias row needed, like `physics`). Valid ONLY on
 * `direct-sun-hours`, `daylight-availability`, `thermal-comfort-index` and
 * `thermal-comfort-statistics` (`FAST_TYPES` in `request-validation.ts`), so
 * it is its own list rather than folded into `SURFACE` (shared with
 * `sky-view-factors` and `solar-radiation`, which do not read it) or
 * `THERMAL_CONTROL_KEYS`.
 *
 * Default `true` on the server for windows longer than 1 week (a fixed
 * sun-direction grid; at least 99% of cells within +/-0.5 degC of the exact
 * run) on `thermal-comfort-index` / `thermal-comfort-statistics` — a
 * lambda-models PR IN PROGRESS, not yet merged. `false` runs the exact
 * computation. `direct-sun-hours` / `daylight-availability` server support
 * comes LATER. Until the respective server change lands, the server ignores
 * this key; the two `pick` branches that add it (`payload.ts`, the solar and
 * thermal branches) only let it reach the wire so client code is ready ahead
 * of that release.
 *
 * KNOWN, TRACKED GAP (reviewed 2026-10-02, not fixed here by design): an
 * UNSET `fast` never reaches `configHash` (the whole prepared payload,
 * `area/planning.ts`'s `hashFields`), so it cannot protect a resume across
 * the moment the SERVER's own default changes. The day lambda-models #489
 * activates, a schedule saved before it with `fast` unset and resumed after
 * can submit retried tiles that now compute in fast mode, merging with
 * exact-mode tiles already on disk under the SAME hash. Hashing "unset" now
 * would move the hash of every existing request before the server reads this
 * key at all, and there is no effective mode yet to version against. The
 * fix — a version marker in the hash input, the same pattern as
 * `terrain_slicing` / `tile_location_policy` above — belongs to the PR that
 * actually flips the server's default, not to this prep change. See the
 * Python SDK twin (`analyses/types.py`'s `_EXTRA_CONFIG_HASH_FIELDS`
 * comment) for the full note.
 */
export declare const FAST: readonly ["fast"];
