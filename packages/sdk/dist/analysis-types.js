/**
 * The analysis names the API accepts, as the value of a request's
 * `analysisType`: `AnalysesName.WindSpeed` is `"wind-speed"`, and so on for
 * each analysis.
 *
 * @category Requests
 */
export const AnalysesName = {
    WindSpeed: "wind-speed",
    DaylightAvailability: "daylight-availability",
    DirectSunHours: "direct-sun-hours",
    SkyViewFactors: "sky-view-factors",
    SolarRadiation: "solar-radiation",
    ThermalComfortIndex: "thermal-comfort-index",
    PedestrianWindComfort: "pedestrian-wind-comfort",
    ThermalComfortStatistics: "thermal-comfort-statistics",
    DaylightFactor: "daylight-factor",
};
/**
 * The wind analyses: `wind-speed` and `pedestrian-wind-comfort`.
 *
 * @category Requests
 */
export const WIND_ANALYSIS_TYPES = new Set([
    AnalysesName.WindSpeed,
    AnalysesName.PedestrianWindComfort,
]);
/**
 * The analyses that can be run over a polygon area, split into tiles: every
 * analysis name except `daylight-factor`.
 *
 * @category Tiling
 */
export const TILING_SUPPORTED_TYPES = new Set(Object.values(AnalysesName).filter((name) => name !== AnalysesName.DaylightFactor));
