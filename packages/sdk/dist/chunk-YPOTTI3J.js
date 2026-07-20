import {
  WeatherDataPointSchema
} from "./chunk-ZYK3RM7N.js";

// src/analyses/constants.ts
var AnalysesName = {
  WindSpeed: "wind-speed",
  DaylightAvailability: "daylight-availability",
  DirectSunHours: "direct-sun-hours",
  SkyViewFactors: "sky-view-factors",
  SolarRadiation: "solar-radiation",
  ThermalComfortIndex: "thermal-comfort-index",
  PedestrianWindComfort: "pedestrian-wind-comfort",
  ThermalComfortStatistics: "thermal-comfort-statistics"
};
var PwcCriteria = {
  VDI387: "vdi-387",
  Lawson1970: "lawson-1970",
  Lawson2001: "lawson-2001",
  LawsonLDDC: "lawson-lddc",
  Davenport: "davenport",
  NEN8100Comfort: "nen-8100-comfort",
  NEN8100Safety: "nen-8100-safety"
};
var ThermalComfortStatisticsSubType = {
  ColdStress: "cold-stress",
  ThermalComfort: "thermal-comfort",
  HeatStress: "heat-stress"
};
var ExecutionConfig = {
  Async: "async"
};

// src/types.ts
import { z } from "zod";
var LatitudeSchema = z.number().gte(-90).lte(90);
var LongitudeSchema = z.number().gte(-180).lte(180);
var HourSchema = z.number().int().gte(0).lte(23);
var MonthSchema = z.number().int().gte(1).lte(12);
var DaySchema = z.number().int().gte(1).lte(31);
var HourRangeSchema = z.array(HourSchema).length(2);
var MonthRangeSchema = z.array(MonthSchema).min(1).max(2);
var DayRangeSchema = z.array(DaySchema).length(2);
var DataListSchema = z.array(z.number()).min(1);
var TimeFilterStampSchema = z.object({
  month: MonthSchema,
  day: DaySchema,
  hour: HourSchema
});
var TimeFilterPeriodSchema = z.object({
  start: TimeFilterStampSchema,
  end: TimeFilterStampSchema
});
var TimeFilterSchema = z.object({
  day: z.string().optional(),
  hour: z.string().optional()
});
var DateFiltersSchema = z.object({
  period: TimeFilterPeriodSchema,
  filter: TimeFilterSchema.optional()
});
var TimeFiltersSchema = z.object({
  period: TimeFilterPeriodSchema,
  filter: TimeFilterSchema.optional()
});
var DateFiltersWrapperSchema = z.object({
  dateFilters: DateFiltersSchema
});
var MAX_DAY_PER_MONTH = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31
};
var TimePeriodSchema = z.object({
  startMonth: MonthSchema,
  startDay: DaySchema,
  startHour: HourSchema,
  endMonth: MonthSchema,
  endDay: DaySchema,
  endHour: HourSchema
}).superRefine((tp, ctx) => {
  if (tp.startDay > MAX_DAY_PER_MONTH[tp.startMonth]) {
    ctx.addIssue({
      code: "custom",
      message: `startDay=${tp.startDay} is invalid for startMonth=${tp.startMonth}`,
      path: ["startDay"]
    });
  }
  if (tp.endDay > MAX_DAY_PER_MONTH[tp.endMonth]) {
    ctx.addIssue({
      code: "custom",
      message: `endDay=${tp.endDay} is invalid for endMonth=${tp.endMonth}`,
      path: ["endDay"]
    });
  }
  const start = [tp.startMonth, tp.startDay, tp.startHour];
  const end = [tp.endMonth, tp.endDay, tp.endHour];
  const cmp = (a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] !== b[1] ? a[1] - b[1] : a[2] - b[2];
  const c = cmp(start, end);
  if (c > 0) {
    ctx.addIssue({
      code: "custom",
      message: `TimePeriod end (${end.join("/")}) is before start (${start.join("/")})`,
      path: ["endMonth"]
    });
  } else if (c === 0) {
    ctx.addIssue({
      code: "custom",
      message: `TimePeriod is zero-length (start == end)`,
      path: ["endHour"]
    });
  }
});
var DotBimMeshSchema = z.object({
  mesh_id: z.number(),
  coordinates: z.array(z.number()),
  indices: z.array(z.number()).optional()
});

// src/analyses/schemas.ts
import { z as z2 } from "zod";
var EPWDataSchema = z2.object({
  year: z2.array(z2.number()),
  month: z2.array(z2.number()),
  day: z2.array(z2.number()),
  hour: z2.array(z2.number()),
  minute: z2.array(z2.number()),
  dryBulbTemperature: z2.array(z2.number()),
  dewPointTemperature: z2.array(z2.number()),
  relativeHumidity: z2.array(z2.number()),
  atmosphericStationPressure: z2.array(z2.number()),
  extraterrestrialHorizontalRadiation: z2.array(z2.number()),
  extraterrestrialDirectNormalRadiation: z2.array(z2.number()),
  horizontalInfraredRadiationIntensity: z2.array(z2.number()),
  globalHorizontalRadiation: z2.array(z2.number()),
  directNormalRadiation: z2.array(z2.number()),
  diffuseHorizontalRadiation: z2.array(z2.number()),
  globalHorizontalIlluminance: z2.array(z2.number()),
  directNormalIlluminance: z2.array(z2.number()),
  diffuseHorizontalIlluminance: z2.array(z2.number()),
  zenithLuminance: z2.array(z2.number()),
  windDirection: z2.array(z2.number()),
  windSpeed: z2.array(z2.number()),
  totalSkyCover: z2.array(z2.number()),
  opaqueSkyCover: z2.array(z2.number()),
  visibility: z2.array(z2.number()),
  ceilingHeight: z2.array(z2.number()),
  presentWeatherObservation: z2.array(z2.number()),
  presentWeatherCodes: z2.array(z2.number()),
  precipitableWater: z2.array(z2.number()),
  aerosolOpticalDepth: z2.array(z2.number()),
  snowDepth: z2.array(z2.number()),
  daysSinceLastSnowfall: z2.array(z2.number()),
  albedo: z2.array(z2.number()),
  liquidPrecipitationDepth: z2.array(z2.number()),
  liquidPrecipitationQuantity: z2.array(z2.number())
});
var WeatherDataUnionSchema = z2.union([z2.array(WeatherDataPointSchema), EPWDataSchema]);
var LocationSchema = z2.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema
});
var BaseAnalysisPayloadSchema = z2.object({
  analysisType: z2.enum(Object.values(AnalysesName)),
  geometries: z2.record(z2.string(), DotBimMeshSchema).optional().default({}),
  vegetation: z2.record(z2.string(), z2.any()).optional(),
  groundMaterials: z2.record(z2.string(), z2.unknown()).optional()
});
var SolarModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: z2.enum([AnalysesName.DirectSunHours, AnalysesName.DaylightAvailability])
});
var WindModelRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: z2.literal(AnalysesName.WindSpeed),
  windSpeed: z2.number().int().gt(0).lte(100),
  windDirection: z2.number().int().gte(0).lte(360),
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional()
});
var SvfModelRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: z2.literal(AnalysesName.SkyViewFactors),
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional()
});
var OptionalDataListSchema = z2.array(z2.number()).default([]);
var ThermalModelWeatherDataSchema = z2.object({
  horizontalInfraredRadiationIntensity: OptionalDataListSchema,
  diffuseHorizontalRadiation: OptionalDataListSchema,
  directNormalRadiation: OptionalDataListSchema,
  globalHorizontalRadiation: OptionalDataListSchema,
  dryBulbTemperature: OptionalDataListSchema,
  windSpeed: OptionalDataListSchema,
  relativeHumidity: OptionalDataListSchema
});
var UtciModelBaseRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: z2.literal(AnalysesName.ThermalComfortIndex)
});
var UtciModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend(ThermalModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: z2.literal(AnalysesName.ThermalComfortIndex)
});
var TCSModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend(ThermalModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: z2.literal(AnalysesName.ThermalComfortStatistics),
  subtype: z2.enum(Object.values(ThermalComfortStatisticsSubType))
});
var BasePwcRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: z2.literal(AnalysesName.PedestrianWindComfort),
  criteria: z2.enum(Object.values(PwcCriteria))
});
var PwcRequestSchema = BasePwcRequestSchema.extend({
  windSpeed: DataListSchema,
  windDirection: DataListSchema
});
var SolarRadiationModelWeatherDataSchema = z2.object({
  directNormalRadiation: OptionalDataListSchema,
  diffuseHorizontalRadiation: OptionalDataListSchema
});
var SolarRadiationModelRequestSchema = BaseAnalysisPayloadSchema.extend(
  LocationSchema.shape
).extend(SolarRadiationModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: z2.literal(AnalysesName.SolarRadiation)
});
var PwcInputSchema = BasePwcRequestSchema.extend({
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema
});
var SolarModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: z2.enum([AnalysesName.DirectSunHours, AnalysesName.DaylightAvailability]),
  dateFilters: DateFiltersSchema
});
var UtciModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: z2.literal(AnalysesName.ThermalComfortIndex),
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema
});
var TCSModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: z2.literal(AnalysesName.ThermalComfortStatistics),
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema,
  subtype: z2.enum(Object.values(ThermalComfortStatisticsSubType))
});
var SolarRadiationModelInputSchema = BaseAnalysisPayloadSchema.extend(
  LocationSchema.shape
).extend({
  analysisType: z2.literal(AnalysesName.SolarRadiation),
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema
});
var THERMAL_WEATHER_FIELDS = [
  "horizontalInfraredRadiationIntensity",
  "diffuseHorizontalRadiation",
  "directNormalRadiation",
  "globalHorizontalRadiation",
  "dryBulbTemperature",
  "windSpeed",
  "relativeHumidity"
];
var THERMAL_MODEL_WEATHER_FIELDS_MAPPING = {
  horizontalInfraredRadiationIntensity: "horizontal_infrared_radiation_intensity",
  diffuseHorizontalRadiation: "diffuse_horizontal_radiation",
  directNormalRadiation: "direct_normal_radiation",
  globalHorizontalRadiation: "global_horizontal_radiation",
  dryBulbTemperature: "dry_bulb_temperature",
  windSpeed: "wind_speed",
  relativeHumidity: "relative_humidity"
};
var LOCATION_ANALYSIS_TYPES = [
  AnalysesName.DirectSunHours,
  AnalysesName.DaylightAvailability,
  AnalysesName.SolarRadiation,
  AnalysesName.ThermalComfortIndex,
  AnalysesName.ThermalComfortStatistics,
  AnalysesName.SkyViewFactors,
  AnalysesName.WindSpeed
];
var TILING_SUPPORTED_TYPES = /* @__PURE__ */ new Set([
  AnalysesName.WindSpeed,
  AnalysesName.PedestrianWindComfort,
  AnalysesName.DaylightAvailability,
  AnalysesName.DirectSunHours,
  AnalysesName.SkyViewFactors,
  AnalysesName.SolarRadiation,
  AnalysesName.ThermalComfortIndex,
  AnalysesName.ThermalComfortStatistics
]);
function bankersRound6(v) {
  if (!Number.isFinite(v)) return v;
  if (Number.isInteger(v)) return v;
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const fixed = abs.toFixed(20);
  const dot = fixed.indexOf(".");
  if (dot === -1) return v;
  const intPart = fixed.slice(0, dot);
  const fracPart = fixed.slice(dot + 1);
  if (fracPart.length <= 6) return v;
  const keep = fracPart.slice(0, 6);
  const tail = fracPart.slice(6);
  const seventh = tail[0];
  const restNonZero = /[^0]/.test(tail.slice(1));
  let roundUp;
  if (seventh < "5") roundUp = false;
  else if (seventh > "5" || restNonZero) roundUp = true;
  else {
    const last = Number(keep[keep.length - 1]);
    roundUp = last % 2 !== 0;
  }
  if (!roundUp) {
    return Number.parseFloat(`${sign}${intPart}.${keep}`);
  }
  const incremented = (BigInt(keep) + 1n).toString().padStart(6, "0");
  if (incremented.length > 6) {
    const carriedInt = (BigInt(intPart) + 1n).toString();
    return Number.parseFloat(`${sign}${carriedInt}.${incremented.slice(1)}`);
  }
  return Number.parseFloat(`${sign}${intPart}.${incremented}`);
}
function normaliseValue(v) {
  if (typeof v === "number") {
    return Number.isInteger(v) ? v : bankersRound6(v);
  }
  if (Array.isArray(v)) {
    return v.map(normaliseValue);
  }
  if (v !== null && typeof v === "object") {
    const obj = v;
    const result = {};
    for (const key of Object.keys(obj).sort()) {
      result[key] = normaliseValue(obj[key]);
    }
    return result;
  }
  return v;
}
async function configHash(fields) {
  const normalised = normaliseValue(fields);
  const canonical = JSON.stringify(normalised);
  const encoded = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export {
  AnalysesName,
  PwcCriteria,
  ThermalComfortStatisticsSubType,
  ExecutionConfig,
  TimePeriodSchema,
  EPWDataSchema,
  WeatherDataUnionSchema,
  LocationSchema,
  BaseAnalysisPayloadSchema,
  SolarModelRequestSchema,
  WindModelRequestSchema,
  SvfModelRequestSchema,
  ThermalModelWeatherDataSchema,
  UtciModelBaseRequestSchema,
  UtciModelRequestSchema,
  TCSModelRequestSchema,
  BasePwcRequestSchema,
  PwcRequestSchema,
  SolarRadiationModelWeatherDataSchema,
  SolarRadiationModelRequestSchema,
  PwcInputSchema,
  SolarModelInputSchema,
  UtciModelInputSchema,
  TCSModelInputSchema,
  SolarRadiationModelInputSchema,
  THERMAL_WEATHER_FIELDS,
  THERMAL_MODEL_WEATHER_FIELDS_MAPPING,
  LOCATION_ANALYSIS_TYPES,
  TILING_SUPPORTED_TYPES,
  configHash
};
//# sourceMappingURL=chunk-YPOTTI3J.js.map