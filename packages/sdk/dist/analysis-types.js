/** Analysis names supported by the public gateway. */
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
export const WIND_ANALYSIS_TYPES = new Set([
    AnalysesName.WindSpeed,
    AnalysesName.PedestrianWindComfort,
]);
export const TILING_SUPPORTED_TYPES = new Set(Object.values(AnalysesName).filter((name) => name !== AnalysesName.DaylightFactor));
