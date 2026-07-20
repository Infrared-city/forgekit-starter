import { W as WeatherDataPoint } from './types-ChcKqRt2.cjs';
import { J as Job, I as IJobsService } from './types-DVfcTlO_.cjs';
import { L as Logger } from './logger-U3BDdomT.cjs';
import { z } from 'zod';
import { A as AnalysesName, P as PwcCriteria } from './constants-qkmLe0Zv.cjs';

/**
 * Full EPW weather data structure with arrays of 8760 hourly values
 * This represents the complete weather file data before filtering
 */
declare const EPWDataSchema: z.ZodObject<{
    year: z.ZodArray<z.ZodNumber>;
    month: z.ZodArray<z.ZodNumber>;
    day: z.ZodArray<z.ZodNumber>;
    hour: z.ZodArray<z.ZodNumber>;
    minute: z.ZodArray<z.ZodNumber>;
    dryBulbTemperature: z.ZodArray<z.ZodNumber>;
    dewPointTemperature: z.ZodArray<z.ZodNumber>;
    relativeHumidity: z.ZodArray<z.ZodNumber>;
    atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
    extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
    horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
    globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    directNormalRadiation: z.ZodArray<z.ZodNumber>;
    diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
    directNormalIlluminance: z.ZodArray<z.ZodNumber>;
    diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
    zenithLuminance: z.ZodArray<z.ZodNumber>;
    windDirection: z.ZodArray<z.ZodNumber>;
    windSpeed: z.ZodArray<z.ZodNumber>;
    totalSkyCover: z.ZodArray<z.ZodNumber>;
    opaqueSkyCover: z.ZodArray<z.ZodNumber>;
    visibility: z.ZodArray<z.ZodNumber>;
    ceilingHeight: z.ZodArray<z.ZodNumber>;
    presentWeatherObservation: z.ZodArray<z.ZodNumber>;
    presentWeatherCodes: z.ZodArray<z.ZodNumber>;
    precipitableWater: z.ZodArray<z.ZodNumber>;
    aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
    snowDepth: z.ZodArray<z.ZodNumber>;
    daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
    albedo: z.ZodArray<z.ZodNumber>;
    liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
    liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
}, z.core.$strip>;
type EPWData = z.infer<typeof EPWDataSchema>;
/**
 * Union type for weather data - accepts either:
 * - WeatherDataPoint[] (pre-filtered array of individual data points)
 * - EPWData (full EPW data structure with arrays, to be filtered by SDK)
 */
declare const WeatherDataUnionSchema: z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
}, z.core.$strip>>, z.ZodObject<{
    year: z.ZodArray<z.ZodNumber>;
    month: z.ZodArray<z.ZodNumber>;
    day: z.ZodArray<z.ZodNumber>;
    hour: z.ZodArray<z.ZodNumber>;
    minute: z.ZodArray<z.ZodNumber>;
    dryBulbTemperature: z.ZodArray<z.ZodNumber>;
    dewPointTemperature: z.ZodArray<z.ZodNumber>;
    relativeHumidity: z.ZodArray<z.ZodNumber>;
    atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
    extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
    horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
    globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    directNormalRadiation: z.ZodArray<z.ZodNumber>;
    diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
    globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
    directNormalIlluminance: z.ZodArray<z.ZodNumber>;
    diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
    zenithLuminance: z.ZodArray<z.ZodNumber>;
    windDirection: z.ZodArray<z.ZodNumber>;
    windSpeed: z.ZodArray<z.ZodNumber>;
    totalSkyCover: z.ZodArray<z.ZodNumber>;
    opaqueSkyCover: z.ZodArray<z.ZodNumber>;
    visibility: z.ZodArray<z.ZodNumber>;
    ceilingHeight: z.ZodArray<z.ZodNumber>;
    presentWeatherObservation: z.ZodArray<z.ZodNumber>;
    presentWeatherCodes: z.ZodArray<z.ZodNumber>;
    precipitableWater: z.ZodArray<z.ZodNumber>;
    aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
    snowDepth: z.ZodArray<z.ZodNumber>;
    daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
    albedo: z.ZodArray<z.ZodNumber>;
    liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
    liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
}, z.core.$strip>]>;
type WeatherDataUnion = z.infer<typeof WeatherDataUnionSchema>;
/**
 * Location schema
 */
declare const LocationSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, z.core.$strip>;
type Location = z.infer<typeof LocationSchema>;
/**
 * Base analysis payload schema.
 * `groundMaterials` is an opaque `Record<string, unknown>` passthrough -- the SDK
 * does not validate, transform, or process it; it is just serialized into the API
 * request as kebab-case `ground-materials` at the wire layer.
 */
declare const BaseAnalysisPayloadSchema: z.ZodObject<{
    analysisType: z.ZodEnum<{
        [x: string]: string;
    }>;
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
type BaseAnalysisPayload = z.infer<typeof BaseAnalysisPayloadSchema>;
/**
 * Solar model request (direct-sun-hours, daylight-availability)
 */
declare const SolarModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    timePeriod: z.ZodObject<{
        startMonth: z.ZodNumber;
        startDay: z.ZodNumber;
        startHour: z.ZodNumber;
        endMonth: z.ZodNumber;
        endDay: z.ZodNumber;
        endHour: z.ZodNumber;
    }, z.core.$strip>;
    analysisType: z.ZodEnum<{
        "daylight-availability": "daylight-availability";
        "direct-sun-hours": "direct-sun-hours";
    }>;
}, z.core.$strip>;
type SolarModelRequest = z.infer<typeof SolarModelRequestSchema>;
/**
 * Wind model request (wind-speed). Optional latitude/longitude — the
 * area orchestrator injects tile centroid per-tile so the server-side
 * vegetation-conversion endpoint can build its referencePoint. Mirrors
 * Python `WindModelRequest`.
 */
declare const WindModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"wind-speed">;
    windSpeed: z.ZodNumber;
    windDirection: z.ZodNumber;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type WindModelRequest = z.infer<typeof WindModelRequestSchema>;
/**
 * SVF model request (sky-view-factors). Optional latitude/longitude —
 * the area orchestrator injects tile centroid per-tile so the server-side
 * vegetation-conversion endpoint can build its referencePoint. Without
 * it, SVF runs with vegetation injection 400 with
 * "latitude and longitude are required for vegetation conversion".
 * Mirrors Python `SvfModelRequest`.
 */
declare const SvfModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"sky-view-factors">;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type SvfModelRequest = z.infer<typeof SvfModelRequestSchema>;
/**
 * Thermal model weather data mixin
 */
declare const ThermalModelWeatherDataSchema: z.ZodObject<{
    horizontalInfraredRadiationIntensity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    diffuseHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    directNormalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    globalHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    dryBulbTemperature: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    windSpeed: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    relativeHumidity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
type ThermalModelWeatherData = z.infer<typeof ThermalModelWeatherDataSchema>;
/**
 * TCI model base request (without weather data)
 */
declare const UtciModelBaseRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"thermal-comfort-index">;
}, z.core.$strip>;
type UtciModelBaseRequest = z.infer<typeof UtciModelBaseRequestSchema>;
/**
 * TCI model request (thermal-comfort-index, aka UTCI in Python SDK)
 */
declare const UtciModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    horizontalInfraredRadiationIntensity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    diffuseHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    directNormalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    globalHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    dryBulbTemperature: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    windSpeed: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    relativeHumidity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    timePeriod: z.ZodObject<{
        startMonth: z.ZodNumber;
        startDay: z.ZodNumber;
        startHour: z.ZodNumber;
        endMonth: z.ZodNumber;
        endDay: z.ZodNumber;
        endHour: z.ZodNumber;
    }, z.core.$strip>;
    analysisType: z.ZodLiteral<"thermal-comfort-index">;
}, z.core.$strip>;
type UtciModelRequest = z.infer<typeof UtciModelRequestSchema>;
/**
 * TC Statistics model request (thermal-comfort-statistics)
 */
declare const TCSModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    horizontalInfraredRadiationIntensity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    diffuseHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    directNormalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    globalHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    dryBulbTemperature: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    windSpeed: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    relativeHumidity: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    timePeriod: z.ZodObject<{
        startMonth: z.ZodNumber;
        startDay: z.ZodNumber;
        startHour: z.ZodNumber;
        endMonth: z.ZodNumber;
        endDay: z.ZodNumber;
        endHour: z.ZodNumber;
    }, z.core.$strip>;
    analysisType: z.ZodLiteral<"thermal-comfort-statistics">;
    subtype: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
type TCSModelRequest = z.infer<typeof TCSModelRequestSchema>;
/**
 * Base PWC request (without weather data)
 */
declare const BasePwcRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"pedestrian-wind-comfort">;
    criteria: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
type BasePwcRequest = z.infer<typeof BasePwcRequestSchema>;
/**
 * PWC request (pedestrian-wind-comfort).
 * Wind arrays are TOP-LEVEL fields, matching Python SDK's PwcModelRequest:
 * server expects `wind-speed` and `wind-direction` at the request root,
 * NOT nested under `wind-data`.
 */
declare const PwcRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"pedestrian-wind-comfort">;
    criteria: z.ZodEnum<{
        [x: string]: string;
    }>;
    windSpeed: z.ZodArray<z.ZodNumber>;
    windDirection: z.ZodArray<z.ZodNumber>;
}, z.core.$strip>;
type PwcRequest = z.infer<typeof PwcRequestSchema>;
declare const SolarRadiationModelWeatherDataSchema: z.ZodObject<{
    directNormalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    diffuseHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
/**
 * Solar radiation model input (solar-radiation)
 */
declare const SolarRadiationModelRequestSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    directNormalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    diffuseHorizontalRadiation: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    timePeriod: z.ZodObject<{
        startMonth: z.ZodNumber;
        startDay: z.ZodNumber;
        startHour: z.ZodNumber;
        endMonth: z.ZodNumber;
        endDay: z.ZodNumber;
        endHour: z.ZodNumber;
    }, z.core.$strip>;
    analysisType: z.ZodLiteral<"solar-radiation">;
}, z.core.$strip>;
type SolarRadiationRequest = z.infer<typeof SolarRadiationModelRequestSchema>;
/**
 * Union of all analysis request types
 */
type AnalysisRequest = SolarModelRequest | WindModelRequest | SvfModelRequest | UtciModelRequest | PwcRequest | SolarRadiationRequest | TCSModelRequest;
/**
 * PWC input (pedestrian-wind-comfort)
 * weatherData accepts either WeatherDataPoint[] or EPWData (SDK will filter if EPWData)
 */
declare const PwcInputSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    analysisType: z.ZodLiteral<"pedestrian-wind-comfort">;
    criteria: z.ZodEnum<{
        [x: string]: string;
    }>;
    dateFilters: z.ZodObject<{
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
    weatherData: z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>, z.ZodObject<{
        year: z.ZodArray<z.ZodNumber>;
        month: z.ZodArray<z.ZodNumber>;
        day: z.ZodArray<z.ZodNumber>;
        hour: z.ZodArray<z.ZodNumber>;
        minute: z.ZodArray<z.ZodNumber>;
        dryBulbTemperature: z.ZodArray<z.ZodNumber>;
        dewPointTemperature: z.ZodArray<z.ZodNumber>;
        relativeHumidity: z.ZodArray<z.ZodNumber>;
        atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
        extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
        horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
        globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        directNormalRadiation: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        directNormalIlluminance: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        zenithLuminance: z.ZodArray<z.ZodNumber>;
        windDirection: z.ZodArray<z.ZodNumber>;
        windSpeed: z.ZodArray<z.ZodNumber>;
        totalSkyCover: z.ZodArray<z.ZodNumber>;
        opaqueSkyCover: z.ZodArray<z.ZodNumber>;
        visibility: z.ZodArray<z.ZodNumber>;
        ceilingHeight: z.ZodArray<z.ZodNumber>;
        presentWeatherObservation: z.ZodArray<z.ZodNumber>;
        presentWeatherCodes: z.ZodArray<z.ZodNumber>;
        precipitableWater: z.ZodArray<z.ZodNumber>;
        aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
        snowDepth: z.ZodArray<z.ZodNumber>;
        daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
        albedo: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>]>;
}, z.core.$strip>;
type PwcInput = z.infer<typeof PwcInputSchema>;
/**
 * Solar model input (uses dateFilters instead of TimeStamps)
 */
declare const SolarModelInputSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    analysisType: z.ZodEnum<{
        "daylight-availability": "daylight-availability";
        "direct-sun-hours": "direct-sun-hours";
    }>;
    dateFilters: z.ZodObject<{
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
}, z.core.$strip>;
type SolarModelInput = z.infer<typeof SolarModelInputSchema>;
/**
 * TCI model input (uses dateFilters instead of TimeStamps)
 * weatherData accepts either WeatherDataPoint[] or EPWData (SDK will filter if EPWData)
 */
declare const UtciModelInputSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    analysisType: z.ZodLiteral<"thermal-comfort-index">;
    dateFilters: z.ZodObject<{
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
    weatherData: z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>, z.ZodObject<{
        year: z.ZodArray<z.ZodNumber>;
        month: z.ZodArray<z.ZodNumber>;
        day: z.ZodArray<z.ZodNumber>;
        hour: z.ZodArray<z.ZodNumber>;
        minute: z.ZodArray<z.ZodNumber>;
        dryBulbTemperature: z.ZodArray<z.ZodNumber>;
        dewPointTemperature: z.ZodArray<z.ZodNumber>;
        relativeHumidity: z.ZodArray<z.ZodNumber>;
        atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
        extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
        horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
        globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        directNormalRadiation: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        directNormalIlluminance: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        zenithLuminance: z.ZodArray<z.ZodNumber>;
        windDirection: z.ZodArray<z.ZodNumber>;
        windSpeed: z.ZodArray<z.ZodNumber>;
        totalSkyCover: z.ZodArray<z.ZodNumber>;
        opaqueSkyCover: z.ZodArray<z.ZodNumber>;
        visibility: z.ZodArray<z.ZodNumber>;
        ceilingHeight: z.ZodArray<z.ZodNumber>;
        presentWeatherObservation: z.ZodArray<z.ZodNumber>;
        presentWeatherCodes: z.ZodArray<z.ZodNumber>;
        precipitableWater: z.ZodArray<z.ZodNumber>;
        aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
        snowDepth: z.ZodArray<z.ZodNumber>;
        daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
        albedo: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>]>;
}, z.core.$strip>;
type UtciModelInput = z.infer<typeof UtciModelInputSchema>;
/**
 * TCS model input (uses dateFilters instead of TimeStamps)
 * weatherData accepts either WeatherDataPoint[] or EPWData (SDK will filter if EPWData)
 */
declare const TCSModelInputSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    analysisType: z.ZodLiteral<"thermal-comfort-statistics">;
    dateFilters: z.ZodObject<{
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
    weatherData: z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>, z.ZodObject<{
        year: z.ZodArray<z.ZodNumber>;
        month: z.ZodArray<z.ZodNumber>;
        day: z.ZodArray<z.ZodNumber>;
        hour: z.ZodArray<z.ZodNumber>;
        minute: z.ZodArray<z.ZodNumber>;
        dryBulbTemperature: z.ZodArray<z.ZodNumber>;
        dewPointTemperature: z.ZodArray<z.ZodNumber>;
        relativeHumidity: z.ZodArray<z.ZodNumber>;
        atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
        extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
        horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
        globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        directNormalRadiation: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        directNormalIlluminance: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        zenithLuminance: z.ZodArray<z.ZodNumber>;
        windDirection: z.ZodArray<z.ZodNumber>;
        windSpeed: z.ZodArray<z.ZodNumber>;
        totalSkyCover: z.ZodArray<z.ZodNumber>;
        opaqueSkyCover: z.ZodArray<z.ZodNumber>;
        visibility: z.ZodArray<z.ZodNumber>;
        ceilingHeight: z.ZodArray<z.ZodNumber>;
        presentWeatherObservation: z.ZodArray<z.ZodNumber>;
        presentWeatherCodes: z.ZodArray<z.ZodNumber>;
        precipitableWater: z.ZodArray<z.ZodNumber>;
        aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
        snowDepth: z.ZodArray<z.ZodNumber>;
        daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
        albedo: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>]>;
    subtype: z.ZodEnum<{
        [x: string]: string;
    }>;
}, z.core.$strip>;
type TCSModelInput = z.infer<typeof TCSModelInputSchema>;
/**
 * Solar radiation model input (solar-radiation)
 * weatherData accepts either WeatherDataPoint[] or EPWData (SDK will filter if EPWData)
 */
declare const SolarRadiationModelInputSchema: z.ZodObject<{
    geometries: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        mesh_id: z.ZodNumber;
        coordinates: z.ZodArray<z.ZodNumber>;
        indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>>>;
    vegetation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    groundMaterials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    analysisType: z.ZodLiteral<"solar-radiation">;
    dateFilters: z.ZodObject<{
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
    weatherData: z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>, z.ZodObject<{
        year: z.ZodArray<z.ZodNumber>;
        month: z.ZodArray<z.ZodNumber>;
        day: z.ZodArray<z.ZodNumber>;
        hour: z.ZodArray<z.ZodNumber>;
        minute: z.ZodArray<z.ZodNumber>;
        dryBulbTemperature: z.ZodArray<z.ZodNumber>;
        dewPointTemperature: z.ZodArray<z.ZodNumber>;
        relativeHumidity: z.ZodArray<z.ZodNumber>;
        atmosphericStationPressure: z.ZodArray<z.ZodNumber>;
        extraterrestrialHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        extraterrestrialDirectNormalRadiation: z.ZodArray<z.ZodNumber>;
        horizontalInfraredRadiationIntensity: z.ZodArray<z.ZodNumber>;
        globalHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        directNormalRadiation: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalRadiation: z.ZodArray<z.ZodNumber>;
        globalHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        directNormalIlluminance: z.ZodArray<z.ZodNumber>;
        diffuseHorizontalIlluminance: z.ZodArray<z.ZodNumber>;
        zenithLuminance: z.ZodArray<z.ZodNumber>;
        windDirection: z.ZodArray<z.ZodNumber>;
        windSpeed: z.ZodArray<z.ZodNumber>;
        totalSkyCover: z.ZodArray<z.ZodNumber>;
        opaqueSkyCover: z.ZodArray<z.ZodNumber>;
        visibility: z.ZodArray<z.ZodNumber>;
        ceilingHeight: z.ZodArray<z.ZodNumber>;
        presentWeatherObservation: z.ZodArray<z.ZodNumber>;
        presentWeatherCodes: z.ZodArray<z.ZodNumber>;
        precipitableWater: z.ZodArray<z.ZodNumber>;
        aerosolOpticalDepth: z.ZodArray<z.ZodNumber>;
        snowDepth: z.ZodArray<z.ZodNumber>;
        daysSinceLastSnowfall: z.ZodArray<z.ZodNumber>;
        albedo: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationDepth: z.ZodArray<z.ZodNumber>;
        liquidPrecipitationQuantity: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>]>;
}, z.core.$strip>;
type SolarRadiationInput = z.infer<typeof SolarRadiationModelInputSchema>;
/**
 * Union of all analysis input types (with dateFilters)
 */
type AnalysisInput = SolarModelInput | WindModelRequest | SvfModelRequest | UtciModelInput | PwcInput | SolarRadiationInput | TCSModelInput;
/**
 * Thermal model weather field names (camelCase).
 * Used by extractWeatherFields and factory functions.
 */
declare const THERMAL_WEATHER_FIELDS: readonly string[];
/**
 * Field mapping for thermal model weather data (camelCase -> snake_case)
 */
declare const THERMAL_MODEL_WEATHER_FIELDS_MAPPING: Record<string, string>;
/**
 * Analysis types that include location fields (latitude/longitude).
 * Used by tiling to determine which payloads need per-tile location override.
 *
 * SVF and Wind have *optional* latitude/longitude — the orchestrator still
 * needs to inject tile centroid because the server-side vegetation-conversion
 * endpoint requires lat/lon to build its referencePoint. Without injection,
 * SVF/Wind with vegetation 400s with
 * "latitude and longitude are required for vegetation conversion".
 * Matches Python's `_area/_submission.py` behaviour (the optional schema
 * fields are populated per-tile by the orchestrator there too).
 */
declare const LOCATION_ANALYSIS_TYPES: readonly string[];
/**
 * Analysis types supported for grid-based tiling.
 */
declare const TILING_SUPPORTED_TYPES: ReadonlySet<string>;
/**
 * Analysis Response Types
 */
/**
 * Base analysis response fields (common to all analysis types)
 */
interface BaseAnalysisResponse {
    /** Minimum value for legend/color scale (from API) */
    minLegend?: number;
    /** Maximum value for legend/color scale (from API) */
    maxLegend?: number;
}
/**
 * Solar analysis response (direct-sun-hours, daylight-availability)
 */
interface SolarAnalysisResponse extends BaseAnalysisResponse {
    analysisType: typeof AnalysesName.DirectSunHours | typeof AnalysesName.DaylightAvailability;
    matrix: number[][];
    metadata?: {
        unit: string;
        description: string;
    };
}
/**
 * SVF analysis response (sky-view-factors)
 */
interface SvfAnalysisResponse extends BaseAnalysisResponse {
    analysisType: typeof AnalysesName.SkyViewFactors;
    matrix: number[][];
    metadata?: {
        unit: string;
        description: string;
    };
}
/**
 * Wind speed analysis response
 */
interface WindSpeedResponse extends BaseAnalysisResponse {
    analysisType: typeof AnalysesName.WindSpeed;
    matrix: number[][];
    metadata?: {
        unit: string;
        windSpeed: number;
        windDirection: number;
    };
}
/**
 * Thermal comfort index response
 */
interface UtciResponse extends BaseAnalysisResponse {
    analysisType: typeof AnalysesName.ThermalComfortIndex;
    matrix: number[][];
    metadata?: {
        unit: string;
        description: string;
    };
}
/**
 * Pedestrian wind comfort response
 */
interface PwcResponse extends BaseAnalysisResponse {
    analysisType: typeof AnalysesName.PedestrianWindComfort;
    matrix: number[][];
    metadata?: {
        criteria: PwcCriteria;
        unit: string;
    };
}
/**
 * Union of all analysis response types
 */
type AnalysisResponse = SolarAnalysisResponse | SvfAnalysisResponse | WindSpeedResponse | UtciResponse | PwcResponse;
/**
 * Type mapping from input to response
 */
type AnalysisResponseMap = {
    [AnalysesName.DirectSunHours]: SolarAnalysisResponse;
    [AnalysesName.DaylightAvailability]: SolarAnalysisResponse;
    [AnalysesName.SkyViewFactors]: SvfAnalysisResponse;
    [AnalysesName.WindSpeed]: WindSpeedResponse;
    [AnalysesName.ThermalComfortIndex]: UtciResponse;
    [AnalysesName.PedestrianWindComfort]: PwcResponse;
    [AnalysesName.ThermalComfortStatistics]: UtciResponse;
};
/**
 * Infer response type from input
 */
type InferAnalysisResponse<T extends AnalysisInput> = T extends {
    analysisType: infer A;
} ? A extends keyof AnalysisResponseMap ? AnalysisResponseMap[A] : AnalysisResponse : AnalysisResponse;
/**
 * Compute a deterministic SHA-256 hex digest from config fields.
 *
 * Floats are rounded to 6 decimal places before serialisation.
 * Keys are recursively sorted at every nesting level for canonical
 * ordering. Uses `crypto.subtle` for isomorphic compatibility
 * (browser + Node + CF Workers).
 *
 * @param fields - Key-value pairs representing the config-relevant fields.
 * @returns Hex-encoded SHA-256 hash string.
 *
 * @example
 * ```ts
 * const hash = await configHash({ analysis_type: 'wind-speed', wind_speed: 10 })
 * // '3a7f2c...' (64 hex chars)
 * ```
 */
declare function configHash(fields: Record<string, unknown>): Promise<string>;

/**
 * Extract specified fields from weather data points into flat lists.
 *
 * Matches Python SDK's `extract_weather_fields()` behaviour:
 * - Takes a list of WeatherDataPoint instances and a list of camelCase field names
 * - Returns a dict mapping **snake_case** keys to lists of float values
 * - Null/undefined values are skipped
 *
 * Note: Returns snake_case keys (e.g. `diffuse_horizontal_radiation`) to match the
 * Python SDK's `_camel_to_snake()` convention. The SDK's `serializeToKebab()` handles
 * the final camelCase/snake_case -> kebab-case conversion at the HTTP serialization layer.
 *
 * @param weatherData - List of WeatherDataPoint instances
 * @param fields - camelCase attribute names from WeatherDataPoint
 *   (e.g. `["diffuseHorizontalRadiation", "directNormalRadiation"]`)
 * @returns Record mapping snake_case keys to arrays of numbers. Null values are skipped.
 */
declare function extractWeatherFields(weatherData: WeatherDataPoint[], fields: readonly string[]): Record<string, number[]>;
/**
 * Transform AnalysisInput (with dateFilters) to AnalysisRequest (with TimeStamps).
 *
 * Converts user-friendly input format (using `dateFilters`) into the API-ready
 * request format (using `TimeStamps`). Automatically filters EPWData to
 * WeatherDataPoint[] if full EPW data is provided.
 *
 * @param input - The analysis input with dateFilters and optional EPW weather data.
 * @returns The API-ready analysis request with TimeStamps and extracted weather arrays.
 *
 * @example
 * ```ts
 * const request = transformAnalysisInput({
 *   analysisType: AnalysesName.DirectSunHours,
 *   geometries: {},
 *   latitude: 52.52,
 *   longitude: 13.405,
 *   dateFilters: {
 *     period: { start: { month: 6, day: 1, hour: 8 }, end: { month: 9, day: 30, hour: 18 } },
 *   },
 * })
 * ```
 */
declare function transformAnalysisInput(input: AnalysisInput): AnalysisRequest;

interface AnalysisServiceConfig {
    logger: Logger;
    /** Pre-configured jobs service for async execution. */
    jobsService?: IJobsService;
}
/**
 * Interface for dependency injection and testing.
 */
interface IAnalysisService {
    execute(input: AnalysisInput, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<Job>;
}
/**
 * Analysis service client for running environmental analysis models.
 *
 * Async-only execution: all analyses are submitted as async jobs via
 * JobsService. The `execute` method submits the job and returns a Job
 * handle. Consumers use `JobsService.waitForCompletion` and
 * `JobsService.downloadResults` to poll and retrieve results.
 */
declare class AnalysisService implements IAnalysisService {
    private readonly logger;
    private readonly jobsService;
    constructor(config: AnalysisServiceConfig);
    /**
     * Submit an analysis for async execution.
     *
     * Transforms the input (dateFilters -> TimeStamps, weather data filtering),
     * serializes to kebab-case for the API, and delegates to JobsService.submit.
     *
     * @param input - Analysis input configuration
     * @param opts - Optional webhook configuration
     * @returns Job handle for tracking execution
     *
     * @throws Error if no jobsService was provided
     */
    execute(input: AnalysisInput, opts?: {
        webhookUrl?: string;
        webhookEvents?: string[];
    }): Promise<Job>;
}

export { WeatherDataUnionSchema as $, type AnalysisInput as A, type BaseAnalysisPayload as B, type SvfAnalysisResponse as C, type SvfModelRequest as D, type EPWData as E, SvfModelRequestSchema as F, TCSModelInputSchema as G, type TCSModelRequest as H, type IAnalysisService as I, TCSModelRequestSchema as J, THERMAL_MODEL_WEATHER_FIELDS_MAPPING as K, LOCATION_ANALYSIS_TYPES as L, THERMAL_WEATHER_FIELDS as M, TILING_SUPPORTED_TYPES as N, type ThermalModelWeatherData as O, type PwcInput as P, ThermalModelWeatherDataSchema as Q, UtciModelBaseRequestSchema as R, type SolarAnalysisResponse as S, type TCSModelInput as T, type UtciModelBaseRequest as U, type UtciModelInput as V, UtciModelInputSchema as W, type UtciModelRequest as X, UtciModelRequestSchema as Y, type UtciResponse as Z, type WeatherDataUnion as _, type AnalysisRequest as a, type WindModelRequest as a0, WindModelRequestSchema as a1, type WindSpeedResponse as a2, configHash as a3, extractWeatherFields as a4, transformAnalysisInput as a5, type AnalysisResponse as b, type AnalysisResponseMap as c, AnalysisService as d, type AnalysisServiceConfig as e, BaseAnalysisPayloadSchema as f, type BaseAnalysisResponse as g, type BasePwcRequest as h, BasePwcRequestSchema as i, EPWDataSchema as j, type InferAnalysisResponse as k, type Location as l, LocationSchema as m, PwcInputSchema as n, type PwcRequest as o, PwcRequestSchema as p, type PwcResponse as q, type SolarModelInput as r, SolarModelInputSchema as s, type SolarModelRequest as t, SolarModelRequestSchema as u, type SolarRadiationInput as v, SolarRadiationModelInputSchema as w, SolarRadiationModelRequestSchema as x, SolarRadiationModelWeatherDataSchema as y, type SolarRadiationRequest as z };
