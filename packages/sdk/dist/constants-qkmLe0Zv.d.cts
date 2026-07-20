/**
 * Available analysis types in the Infrared API.
 *
 * @example
 * ```ts
 * import { AnalysesName } from '@infrared/sdk'
 *
 * const job = await client.run({
 *   analysisType: AnalysesName.WindSpeed,
 *   geometries: {},
 *   windSpeed: 10,
 *   windDirection: 180,
 * })
 * ```
 */
declare const AnalysesName: {
    readonly WindSpeed: "wind-speed";
    readonly DaylightAvailability: "daylight-availability";
    readonly DirectSunHours: "direct-sun-hours";
    readonly SkyViewFactors: "sky-view-factors";
    readonly SolarRadiation: "solar-radiation";
    readonly ThermalComfortIndex: "thermal-comfort-index";
    readonly PedestrianWindComfort: "pedestrian-wind-comfort";
    readonly ThermalComfortStatistics: "thermal-comfort-statistics";
};
type AnalysesName = (typeof AnalysesName)[keyof typeof AnalysesName];
/**
 * Pedestrian Wind Comfort criteria standards.
 *
 * @example
 * ```ts
 * import { PwcCriteria } from '@infrared/sdk'
 *
 * const job = await client.run({
 *   analysisType: AnalysesName.PedestrianWindComfort,
 *   criteria: PwcCriteria.Lawson2001,
 *   // ...
 * })
 * ```
 */
declare const PwcCriteria: {
    readonly VDI387: "vdi-387";
    readonly Lawson1970: "lawson-1970";
    readonly Lawson2001: "lawson-2001";
    readonly LawsonLDDC: "lawson-lddc";
    readonly Davenport: "davenport";
    readonly NEN8100Comfort: "nen-8100-comfort";
    readonly NEN8100Safety: "nen-8100-safety";
};
type PwcCriteria = (typeof PwcCriteria)[keyof typeof PwcCriteria];
/**
 * Thermal comfort statistics sub-types.
 *
 * @example
 * ```ts
 * import { ThermalComfortStatisticsSubType } from '@infrared/sdk'
 *
 * const job = await client.run({
 *   analysisType: AnalysesName.ThermalComfortStatistics,
 *   subtype: ThermalComfortStatisticsSubType.HeatStress,
 *   // ...
 * })
 * ```
 */
declare const ThermalComfortStatisticsSubType: {
    readonly ColdStress: "cold-stress";
    readonly ThermalComfort: "thermal-comfort";
    readonly HeatStress: "heat-stress";
};
type ThermalComfortStatisticsSubType = (typeof ThermalComfortStatisticsSubType)[keyof typeof ThermalComfortStatisticsSubType];
/**
 * Execution configuration for analysis.
 *
 * Async-only: the Sync mode has been removed. All analyses are submitted
 * as async jobs via JobsService.
 */
declare const ExecutionConfig: {
    readonly Async: "async";
};
type ExecutionConfig = (typeof ExecutionConfig)[keyof typeof ExecutionConfig];

export { AnalysesName as A, ExecutionConfig as E, PwcCriteria as P, ThermalComfortStatisticsSubType as T };
