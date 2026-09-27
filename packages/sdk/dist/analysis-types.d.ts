/** Analysis names supported by the public gateway. */
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
export type AnalysesName = (typeof AnalysesName)[keyof typeof AnalysesName];
export declare const WIND_ANALYSIS_TYPES: ReadonlySet<AnalysesName>;
export declare const TILING_SUPPORTED_TYPES: ReadonlySet<AnalysesName>;
