export { A as AnalysesName, E as ExecutionConfig, P as PwcCriteria, T as ThermalComfortStatisticsSubType } from './constants-qkmLe0Zv.cjs';
import { E as EPWData } from './service-CrT_01Kv.cjs';
export { A as AnalysisInput, a as AnalysisRequest, b as AnalysisResponse, c as AnalysisResponseMap, d as AnalysisService, e as AnalysisServiceConfig, B as BaseAnalysisPayload, f as BaseAnalysisPayloadSchema, g as BaseAnalysisResponse, h as BasePwcRequest, i as BasePwcRequestSchema, j as EPWDataSchema, I as IAnalysisService, k as InferAnalysisResponse, L as LOCATION_ANALYSIS_TYPES, l as Location, m as LocationSchema, P as PwcInput, n as PwcInputSchema, o as PwcRequest, p as PwcRequestSchema, q as PwcResponse, S as SolarAnalysisResponse, r as SolarModelInput, s as SolarModelInputSchema, t as SolarModelRequest, u as SolarModelRequestSchema, v as SolarRadiationInput, w as SolarRadiationModelInputSchema, x as SolarRadiationModelRequestSchema, y as SolarRadiationModelWeatherDataSchema, z as SolarRadiationRequest, C as SvfAnalysisResponse, D as SvfModelRequest, F as SvfModelRequestSchema, T as TCSModelInput, G as TCSModelInputSchema, H as TCSModelRequest, J as TCSModelRequestSchema, K as THERMAL_MODEL_WEATHER_FIELDS_MAPPING, M as THERMAL_WEATHER_FIELDS, N as TILING_SUPPORTED_TYPES, O as ThermalModelWeatherData, Q as ThermalModelWeatherDataSchema, U as UtciModelBaseRequest, R as UtciModelBaseRequestSchema, V as UtciModelInput, W as UtciModelInputSchema, X as UtciModelRequest, Y as UtciModelRequestSchema, Z as UtciResponse, _ as WeatherDataUnion, $ as WeatherDataUnionSchema, a0 as WindModelRequest, a1 as WindModelRequestSchema, a2 as WindSpeedResponse, a3 as configHash, a4 as extractWeatherFields, a5 as transformAnalysisInput } from './service-CrT_01Kv.cjs';
import { T as TimeFilters, W as WeatherDataPoint } from './types-ChcKqRt2.cjs';
export { a as WeatherDataPointSchema } from './types-ChcKqRt2.cjs';
import './types-DVfcTlO_.cjs';
import './logger-U3BDdomT.cjs';
import 'zod';

/**
 * Type guard to distinguish EPWData from WeatherDataPoint[].
 *
 * EPWData is an object with arrays (e.g., `{ month: number[], day: number[], ... }`).
 * WeatherDataPoint[] is an array of objects (e.g., `[{ dryBulbTemperature: 20 }, ...]`).
 *
 * @param data - The data to check.
 * @returns `true` if `data` is an EPWData object with the expected array fields.
 *
 * @example
 * ```ts
 * isEPWData({ month: [1, 2], day: [1, 2], hour: [0, 1], dryBulbTemperature: [20, 21] }) // true
 * isEPWData([{ dryBulbTemperature: 20 }]) // false
 * ```
 */
declare function isEPWData(data: unknown): data is EPWData;
/**
 * Filter EPW data by timeframe and optional day/hour ranges
 *
 * NOTE: Day filtering is currently DISABLED because the backend doesn't support
 * day filtering for sun_vector calculation yet. The logic is preserved (commented)
 * for future use when backend adds support.
 *
 * @param epw - Full EPW data structure with arrays
 * @param filters - Time filters with period and optional day/hour ranges
 * @returns Array of WeatherDataPoint matching the filter criteria
 */
declare function filterEPWData(epw: EPWData, filters: TimeFilters): WeatherDataPoint[];

export { EPWData, WeatherDataPoint, filterEPWData, isEPWData };
