/**
 * The analysis names the API accepts, as the value of a request's
 * `analysisType`: `AnalysesName.WindSpeed` is `"wind-speed"`, and so on for
 * each analysis.
 *
 * @category Requests
 */
export declare const AnalysesName: {
    readonly WindSpeed: "wind-speed";
    readonly DaylightAvailability: "daylight-availability";
    readonly DirectSunHours: "direct-sun-hours";
    readonly SkyViewFactors: "sky-view-factors";
    readonly SolarRadiation: "solar-radiation";
    readonly ThermalComfortIndex: "thermal-comfort-index";
    readonly PedestrianWindComfort: "pedestrian-wind-comfort";
    readonly ThermalComfortStatistics: "thermal-comfort-statistics";
    readonly DaylightFactor: "daylight-factor";
};
/**
 * The union of the analysis name strings in the `AnalysesName` constant, for
 * example `"wind-speed"` or `"daylight-factor"`.
 *
 * @category Requests
 */
export type AnalysesName = (typeof AnalysesName)[keyof typeof AnalysesName];
/**
 * The wind analyses: `wind-speed` and `pedestrian-wind-comfort`.
 *
 * @category Requests
 */
export declare const WIND_ANALYSIS_TYPES: ReadonlySet<AnalysesName>;
/**
 * The analyses that can be run over a polygon area, split into tiles: every
 * analysis name except `daylight-factor`.
 *
 * @category Tiling
 */
export declare const TILING_SUPPORTED_TYPES: ReadonlySet<AnalysesName>;
