import type { AreaSchedule } from "./schedule-types.js";
/**
 * The version of the schedule record format this SDK writes into new schedules
 * (`AreaSchedule.scheduleContractVersion`).
 *
 * It is raised whenever a field a retry guard depends on is added or changes meaning. A retry
 * of a schedule written under an older version may be refused by name, with guidance to start
 * a fresh run.
 *
 * @category Run an analysis
 */
export declare const SCHEDULE_CONTRACT_VERSION = 11;
/**
 * The schedule record version from which `AreaSchedule.weatherIdentity` names the weather a run
 * submitted. A weather-bearing schedule written under a lower version is refused on retry.
 *
 * @category Run an analysis
 */
export declare const WEATHER_IDENTITY_CONTRACT_VERSION = 4;
/**
 * Thrown when a retry is refused because its weather cannot be shown to be the weather the
 * original run used, or because a weather-bearing payload cannot be identified at all.
 *
 * Start a fresh run, or build the retry payload from the same weather: the same file, catalog
 * window or arrays.
 *
 * @category Errors
 */
export declare class WeatherIdentityError extends Error {
    constructor(message: string);
}
/**
 * The weather identity of a prepared payload: the value `runArea` records on the schedule,
 * computed without submitting anything.
 *
 * Pass the output of `prepareAnalysisPayload` or `prepareAreaPayload`, not a `runArea` input.
 * The prepared payload holds the weather arrays whichever source produced them: a parsed file,
 * the public catalog's records or your own arrays.
 *
 * @param payload - A prepared analysis payload.
 * @returns The identity string of the weather the payload submits.
 * @throws {WeatherIdentityError} when the payload carries no location, no time window or no
 * weather column.
 * @category Run an analysis
 */
export declare function preparedWeatherIdentity(payload: Readonly<Record<string, unknown>>): string;
/**
 * Whether an analysis type reads weather arrays.
 *
 * @param analysisType - The analysis type, for example `"solar-radiation"`.
 * @returns `true` for thermal comfort index, thermal comfort statistics, solar radiation and
 * energy balance analyses.
 * @category Run an analysis
 */
export declare function isWeatherBearing(analysisType: string): boolean;
/**
 * Admit or refuse a retry of a weather-bearing schedule, before anything is submitted. Does
 * nothing for a schedule of an analysis that reads no weather.
 *
 * Every refusal carries guidance on how to proceed.
 *
 * @param retryFrom - The saved schedule being retried, if any.
 * @param currentIdentity - The weather identity of the retry's prepared payload, if it has one.
 * @throws {WeatherIdentityError} when the schedule predates the weather run identity, records
 * no identity, or records one that differs from the retry's weather.
 * @category Run an analysis
 */
export declare function checkResumeWeather(retryFrom: AreaSchedule | undefined, currentIdentity: string | undefined): void;
