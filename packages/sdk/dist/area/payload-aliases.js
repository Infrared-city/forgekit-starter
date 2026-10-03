/**
 * The wire-name tables and the per-model field lists `payload.ts` picks with.
 *
 * Split out of `payload.ts` for the 400-line cap, not for reuse: these are
 * DATA, one entry per wire field, and they grow every time a model gains a
 * field, while the transform beside them does not. Keeping them here means a
 * new field is a one-line change in a table rather than a reason to split the
 * transform itself.
 */
export const TOP_LEVEL_ALIASES = new Map([
    ["analysisType", "analysis-type"], ["analysisSurfaces", "analysis-surfaces"],
    ["binaryResults", "binary-results"], ["contextGeometry", "context-geometry"],
    ["emitCellTris", "emit-cell-tris"], ["groundGeometry", "ground-geometry"],
    ["groundMaterials", "ground-materials"], ["meshCleaning", "mesh-cleaning"],
    ["pwcCriteria", "pwc-criteria"],
    ["sensorPoints", "sensor-points"], ["sensorNormals", "sensor-normals"],
    ["sensorSurfaces", "sensor-surfaces"], ["surfaceGridSize", "surface-grid-size"],
    ["surfaceOffset", "surface-offset"], ["surfgridVersion", "surfgrid-version"],
    ["terrainAlignment", "terrain-alignment"],
    ["timePeriod", "time-period"], ["weatherFile", "weather-file"],
    ["vegetationInstances", "vegetation-instances"],
    ["windData", "wind-data"], ["windDirection", "wind-direction"],
    ["windSpeed", "wind-speed"],
    ["horizontalInfraredRadiationIntensity", "horizontal-infrared-radiation-intensity"],
    ["diffuseHorizontalRadiation", "diffuse-horizontal-radiation"],
    ["directNormalRadiation", "direct-normal-radiation"],
    ["globalHorizontalRadiation", "global-horizontal-radiation"],
    ["dryBulbTemperature", "dry-bulb-temperature"],
    ["relativeHumidity", "relative-humidity"],
    // Five of the six global thermal controls (WP15 / D53). `physics` is
    // deliberately absent: it is already the wire spelling, `normalizeTopLevel`
    // passes an unaliased key through unchanged, and this table has no other
    // identity row — one would read as a rule with an effect it does not have.
    // `THERMAL_CONTROLS` below is the one place the SET is written down.
    ["wallAlbedo", "wall-albedo"], ["wallAbsorptivity", "wall-absorptivity"],
    ["canopyTransmissivity", "canopy-transmissivity"],
    ["groundAlbedo", "ground-albedo"], ["groundDtMax", "ground-dt-max"],
]);
export const PERIOD_ALIASES = new Map([
    ["startMonth", "start-month"], ["startDay", "start-day"],
    ["startHour", "start-hour"], ["endMonth", "end-month"],
    ["endDay", "end-day"], ["endHour", "end-hour"],
]);
/**
 * The kernel's snake_case model-input names, and this package's camelCase
 * spelling of each. One table, so the two cannot drift.
 */
export const MODEL_INPUT_NAMES = {
    horizontal_infrared_radiation_intensity: "horizontalInfraredRadiationIntensity",
    diffuse_horizontal_radiation: "diffuseHorizontalRadiation",
    direct_normal_radiation: "directNormalRadiation",
    global_horizontal_radiation: "globalHorizontalRadiation",
    dry_bulb_temperature: "dryBulbTemperature",
    wind_speed: "windSpeed",
    relative_humidity: "relativeHumidity",
};
export const BASE = ["analysisType", "geometries", "vegetation", "groundMaterials"];
export const LOCATION = ["latitude", "longitude"];
export const SURFACE = [
    "analysisSurfaces", "sensorPoints", "sensorNormals", "contextGeometry",
    "surfaceGridSize", "surfaceOffset", "emitCellTris", "meshCleaning", "surfgridVersion",
];
export const TERRAIN = ["groundGeometry", "terrainAlignment"];
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
export const FAST = ["fast"];
