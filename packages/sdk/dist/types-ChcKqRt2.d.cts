import { z } from 'zod';

/**
 * Weather data point schema with all EPW fields
 * All fields are optional and support coercion from strings
 */
declare const WeatherDataPointSchema: z.ZodObject<{
    dryBulbTemperature: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    dewPointTemperature: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    relativeHumidity: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    atmosphericStationPressure: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    extraterrestrialHorizontalRadiation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    extraterrestrialDirectNormalRadiation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    horizontalInfraredRadiationIntensity: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    globalHorizontalRadiation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    directNormalRadiation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    diffuseHorizontalRadiation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    globalHorizontalIlluminance: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    directNormalIlluminance: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    diffuseHorizontalIlluminance: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    zenithLuminance: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    windDirection: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    windSpeed: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    totalSkyCover: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    opaqueSkyCover: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    visibility: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    ceilingHeight: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    presentWeatherObservation: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    presentWeatherCodes: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    precipitableWater: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    aerosolOpticalDepth: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    snowDepth: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    daysSinceLastSnowfall: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    albedo: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    liquidPrecipitationDepth: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
    liquidPrecipitationQuantity: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodNumber>>>;
}, z.core.$strip>;
type WeatherDataPoint = z.infer<typeof WeatherDataPointSchema>;

/**
 * Latitude constrained to -90 to 90 degrees
 */
declare const LatitudeSchema: z.ZodNumber;
type Latitude = z.infer<typeof LatitudeSchema>;
/**
 * Longitude constrained to -180 to 180 degrees
 */
declare const LongitudeSchema: z.ZodNumber;
type Longitude = z.infer<typeof LongitudeSchema>;
/**
 * Hour constrained to 0-23
 */
declare const HourSchema: z.ZodNumber;
type Hour = z.infer<typeof HourSchema>;
/**
 * Month constrained to 1-12
 */
declare const MonthSchema: z.ZodNumber;
type Month = z.infer<typeof MonthSchema>;
/**
 * Day constrained to 1-31
 */
declare const DaySchema: z.ZodNumber;
type Day = z.infer<typeof DaySchema>;
/**
 * Array of 2 hours [start, end]
 */
declare const HourRangeSchema: z.ZodArray<z.ZodNumber>;
type HourRange = z.infer<typeof HourRangeSchema>;
/**
 * Array of 1-2 months [start] or [start, end]
 */
declare const MonthRangeSchema: z.ZodArray<z.ZodNumber>;
type MonthRange = z.infer<typeof MonthRangeSchema>;
/**
 * Array of 2 days [start, end]
 */
declare const DayRangeSchema: z.ZodArray<z.ZodNumber>;
type DayRange = z.infer<typeof DayRangeSchema>;
/**
 * Array of floats with minimum length of 1
 */
declare const DataListSchema: z.ZodArray<z.ZodNumber>;
type DataList = z.infer<typeof DataListSchema>;
/**
 * Time filter stamp
 */
declare const TimeFilterStampSchema: z.ZodObject<{
    month: z.ZodNumber;
    day: z.ZodNumber;
    hour: z.ZodNumber;
}, z.core.$strip>;
type TimeFilterStamp = z.infer<typeof TimeFilterStampSchema>;
/**
 * Time filter period (start and end)
 */
declare const TimeFilterPeriodSchema: z.ZodObject<{
    start: z.ZodObject<{
        month: z.ZodNumber;
        day: z.ZodNumber;
        hour: z.ZodNumber;
    }, z.core.$strip>;
    end: z.ZodObject<{
        month: z.ZodNumber;
        day: z.ZodNumber;
        hour: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
type TimeFilterPeriod = z.infer<typeof TimeFilterPeriodSchema>;
/**
 * Time filter (optional day/hour ranges as strings)
 */
declare const TimeFilterSchema: z.ZodObject<{
    day: z.ZodOptional<z.ZodString>;
    hour: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type TimeFilter = z.infer<typeof TimeFilterSchema>;
/**
 * Timeframe filters for weather data API (legacy, kept for backward compatibility)
 */
declare const TimeFiltersSchema: z.ZodObject<{
    period: z.ZodObject<{
        start: z.ZodObject<{
            month: z.ZodNumber;
            day: z.ZodNumber;
            hour: z.ZodNumber;
        }, z.core.$strip>;
        end: z.ZodObject<{
            month: z.ZodNumber;
            day: z.ZodNumber;
            hour: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    filter: z.ZodOptional<z.ZodObject<{
        day: z.ZodOptional<z.ZodString>;
        hour: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type TimeFilters = z.infer<typeof TimeFiltersSchema>;
/**
 * Time period for analysis requests, matching Python SDK's `TimePeriod`.
 * Serialized to kebab-case via `serializeToKebab` at the HTTP layer
 * (`time-period: { start-month, start-day, start-hour, end-month, end-day, end-hour }`).
 *
 * Cross-field validation matches Python's `_validate_calendar_window`:
 * rejects out-of-range days (e.g. April 31), rejects zero-length and
 * end-before-start windows.
 */
declare const TimePeriodSchema: z.ZodObject<{
    startMonth: z.ZodNumber;
    startDay: z.ZodNumber;
    startHour: z.ZodNumber;
    endMonth: z.ZodNumber;
    endDay: z.ZodNumber;
    endHour: z.ZodNumber;
}, z.core.$strip>;
type TimePeriod = z.infer<typeof TimePeriodSchema>;
/**
 * Dotbim schema
 */
declare const DotBimMeshSchema: z.ZodObject<{
    mesh_id: z.ZodNumber;
    coordinates: z.ZodArray<z.ZodNumber>;
    indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
type DotBimMesh = z.infer<typeof DotBimMeshSchema>;

export { type DotBimMesh as D, type Hour as H, type Latitude as L, type Month as M, type TimeFilters as T, type WeatherDataPoint as W, WeatherDataPointSchema as a, type TimePeriod as b, type DataList as c, type Day as d, type DayRange as e, type HourRange as f, type Longitude as g, type MonthRange as h, type TimeFilter as i, type TimeFilterPeriod as j, type TimeFilterStamp as k, TimePeriodSchema as l };
