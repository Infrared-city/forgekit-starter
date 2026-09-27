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
    ["groundMaterials", "ground-materials"], ["pwcCriteria", "pwc-criteria"],
    ["sensorPoints", "sensor-points"], ["sensorNormals", "sensor-normals"],
    ["sensorSurfaces", "sensor-surfaces"], ["surfaceGridSize", "surface-grid-size"],
    ["surfaceOffset", "surface-offset"], ["terrainAlignment", "terrain-alignment"],
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
    "surfaceGridSize", "surfaceOffset", "emitCellTris",
];
export const TERRAIN = ["groundGeometry", "terrainAlignment"];
