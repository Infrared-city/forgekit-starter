"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk6VD2RODPcjs = require('./chunk-6VD2RODP.cjs');

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
var _zod = require('zod');
var LatitudeSchema = _zod.z.number().gte(-90).lte(90);
var LongitudeSchema = _zod.z.number().gte(-180).lte(180);
var HourSchema = _zod.z.number().int().gte(0).lte(23);
var MonthSchema = _zod.z.number().int().gte(1).lte(12);
var DaySchema = _zod.z.number().int().gte(1).lte(31);
var HourRangeSchema = _zod.z.array(HourSchema).length(2);
var MonthRangeSchema = _zod.z.array(MonthSchema).min(1).max(2);
var DayRangeSchema = _zod.z.array(DaySchema).length(2);
var DataListSchema = _zod.z.array(_zod.z.number()).min(1);
var TimeFilterStampSchema = _zod.z.object({
  month: MonthSchema,
  day: DaySchema,
  hour: HourSchema
});
var TimeFilterPeriodSchema = _zod.z.object({
  start: TimeFilterStampSchema,
  end: TimeFilterStampSchema
});
var TimeFilterSchema = _zod.z.object({
  day: _zod.z.string().optional(),
  hour: _zod.z.string().optional()
});
var DateFiltersSchema = _zod.z.object({
  period: TimeFilterPeriodSchema,
  filter: TimeFilterSchema.optional()
});
var TimeFiltersSchema = _zod.z.object({
  period: TimeFilterPeriodSchema,
  filter: TimeFilterSchema.optional()
});
var DateFiltersWrapperSchema = _zod.z.object({
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
var TimePeriodSchema = _zod.z.object({
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
var DotBimMeshSchema = _zod.z.object({
  mesh_id: _zod.z.number(),
  coordinates: _zod.z.array(_zod.z.number()),
  indices: _zod.z.array(_zod.z.number()).optional()
});

// src/analyses/schemas.ts

var EPWDataSchema = _zod.z.object({
  year: _zod.z.array(_zod.z.number()),
  month: _zod.z.array(_zod.z.number()),
  day: _zod.z.array(_zod.z.number()),
  hour: _zod.z.array(_zod.z.number()),
  minute: _zod.z.array(_zod.z.number()),
  dryBulbTemperature: _zod.z.array(_zod.z.number()),
  dewPointTemperature: _zod.z.array(_zod.z.number()),
  relativeHumidity: _zod.z.array(_zod.z.number()),
  atmosphericStationPressure: _zod.z.array(_zod.z.number()),
  extraterrestrialHorizontalRadiation: _zod.z.array(_zod.z.number()),
  extraterrestrialDirectNormalRadiation: _zod.z.array(_zod.z.number()),
  horizontalInfraredRadiationIntensity: _zod.z.array(_zod.z.number()),
  globalHorizontalRadiation: _zod.z.array(_zod.z.number()),
  directNormalRadiation: _zod.z.array(_zod.z.number()),
  diffuseHorizontalRadiation: _zod.z.array(_zod.z.number()),
  globalHorizontalIlluminance: _zod.z.array(_zod.z.number()),
  directNormalIlluminance: _zod.z.array(_zod.z.number()),
  diffuseHorizontalIlluminance: _zod.z.array(_zod.z.number()),
  zenithLuminance: _zod.z.array(_zod.z.number()),
  windDirection: _zod.z.array(_zod.z.number()),
  windSpeed: _zod.z.array(_zod.z.number()),
  totalSkyCover: _zod.z.array(_zod.z.number()),
  opaqueSkyCover: _zod.z.array(_zod.z.number()),
  visibility: _zod.z.array(_zod.z.number()),
  ceilingHeight: _zod.z.array(_zod.z.number()),
  presentWeatherObservation: _zod.z.array(_zod.z.number()),
  presentWeatherCodes: _zod.z.array(_zod.z.number()),
  precipitableWater: _zod.z.array(_zod.z.number()),
  aerosolOpticalDepth: _zod.z.array(_zod.z.number()),
  snowDepth: _zod.z.array(_zod.z.number()),
  daysSinceLastSnowfall: _zod.z.array(_zod.z.number()),
  albedo: _zod.z.array(_zod.z.number()),
  liquidPrecipitationDepth: _zod.z.array(_zod.z.number()),
  liquidPrecipitationQuantity: _zod.z.array(_zod.z.number())
});
var WeatherDataUnionSchema = _zod.z.union([_zod.z.array(_chunk6VD2RODPcjs.WeatherDataPointSchema), EPWDataSchema]);
var LocationSchema = _zod.z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema
});
var BaseAnalysisPayloadSchema = _zod.z.object({
  analysisType: _zod.z.enum(Object.values(AnalysesName)),
  geometries: _zod.z.record(_zod.z.string(), DotBimMeshSchema).optional().default({}),
  vegetation: _zod.z.record(_zod.z.string(), _zod.z.any()).optional(),
  groundMaterials: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional()
});
var SolarModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: _zod.z.enum([AnalysesName.DirectSunHours, AnalysesName.DaylightAvailability])
});
var WindModelRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: _zod.z.literal(AnalysesName.WindSpeed),
  windSpeed: _zod.z.number().int().gt(0).lte(100),
  windDirection: _zod.z.number().int().gte(0).lte(360),
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional()
});
var SvfModelRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: _zod.z.literal(AnalysesName.SkyViewFactors),
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional()
});
var OptionalDataListSchema = _zod.z.array(_zod.z.number()).default([]);
var ThermalModelWeatherDataSchema = _zod.z.object({
  horizontalInfraredRadiationIntensity: OptionalDataListSchema,
  diffuseHorizontalRadiation: OptionalDataListSchema,
  directNormalRadiation: OptionalDataListSchema,
  globalHorizontalRadiation: OptionalDataListSchema,
  dryBulbTemperature: OptionalDataListSchema,
  windSpeed: OptionalDataListSchema,
  relativeHumidity: OptionalDataListSchema
});
var UtciModelBaseRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: _zod.z.literal(AnalysesName.ThermalComfortIndex)
});
var UtciModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend(ThermalModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: _zod.z.literal(AnalysesName.ThermalComfortIndex)
});
var TCSModelRequestSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend(ThermalModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: _zod.z.literal(AnalysesName.ThermalComfortStatistics),
  subtype: _zod.z.enum(Object.values(ThermalComfortStatisticsSubType))
});
var BasePwcRequestSchema = BaseAnalysisPayloadSchema.extend({
  analysisType: _zod.z.literal(AnalysesName.PedestrianWindComfort),
  criteria: _zod.z.enum(Object.values(PwcCriteria))
});
var PwcRequestSchema = BasePwcRequestSchema.extend({
  windSpeed: DataListSchema,
  windDirection: DataListSchema
});
var SolarRadiationModelWeatherDataSchema = _zod.z.object({
  directNormalRadiation: OptionalDataListSchema,
  diffuseHorizontalRadiation: OptionalDataListSchema
});
var SolarRadiationModelRequestSchema = BaseAnalysisPayloadSchema.extend(
  LocationSchema.shape
).extend(SolarRadiationModelWeatherDataSchema.shape).extend({
  timePeriod: TimePeriodSchema,
  analysisType: _zod.z.literal(AnalysesName.SolarRadiation)
});
var PwcInputSchema = BasePwcRequestSchema.extend({
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema
});
var SolarModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: _zod.z.enum([AnalysesName.DirectSunHours, AnalysesName.DaylightAvailability]),
  dateFilters: DateFiltersSchema
});
var UtciModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: _zod.z.literal(AnalysesName.ThermalComfortIndex),
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema
});
var TCSModelInputSchema = BaseAnalysisPayloadSchema.extend(LocationSchema.shape).extend({
  analysisType: _zod.z.literal(AnalysesName.ThermalComfortStatistics),
  dateFilters: DateFiltersSchema,
  weatherData: WeatherDataUnionSchema,
  subtype: _zod.z.enum(Object.values(ThermalComfortStatisticsSubType))
});
var SolarRadiationModelInputSchema = BaseAnalysisPayloadSchema.extend(
  LocationSchema.shape
).extend({
  analysisType: _zod.z.literal(AnalysesName.SolarRadiation),
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
































exports.AnalysesName = AnalysesName; exports.PwcCriteria = PwcCriteria; exports.ThermalComfortStatisticsSubType = ThermalComfortStatisticsSubType; exports.ExecutionConfig = ExecutionConfig; exports.TimePeriodSchema = TimePeriodSchema; exports.EPWDataSchema = EPWDataSchema; exports.WeatherDataUnionSchema = WeatherDataUnionSchema; exports.LocationSchema = LocationSchema; exports.BaseAnalysisPayloadSchema = BaseAnalysisPayloadSchema; exports.SolarModelRequestSchema = SolarModelRequestSchema; exports.WindModelRequestSchema = WindModelRequestSchema; exports.SvfModelRequestSchema = SvfModelRequestSchema; exports.ThermalModelWeatherDataSchema = ThermalModelWeatherDataSchema; exports.UtciModelBaseRequestSchema = UtciModelBaseRequestSchema; exports.UtciModelRequestSchema = UtciModelRequestSchema; exports.TCSModelRequestSchema = TCSModelRequestSchema; exports.BasePwcRequestSchema = BasePwcRequestSchema; exports.PwcRequestSchema = PwcRequestSchema; exports.SolarRadiationModelWeatherDataSchema = SolarRadiationModelWeatherDataSchema; exports.SolarRadiationModelRequestSchema = SolarRadiationModelRequestSchema; exports.PwcInputSchema = PwcInputSchema; exports.SolarModelInputSchema = SolarModelInputSchema; exports.UtciModelInputSchema = UtciModelInputSchema; exports.TCSModelInputSchema = TCSModelInputSchema; exports.SolarRadiationModelInputSchema = SolarRadiationModelInputSchema; exports.THERMAL_WEATHER_FIELDS = THERMAL_WEATHER_FIELDS; exports.THERMAL_MODEL_WEATHER_FIELDS_MAPPING = THERMAL_MODEL_WEATHER_FIELDS_MAPPING; exports.LOCATION_ANALYSIS_TYPES = LOCATION_ANALYSIS_TYPES; exports.TILING_SUPPORTED_TYPES = TILING_SUPPORTED_TYPES; exports.configHash = configHash;
//# sourceMappingURL=chunk-VT2OD2EK.cjs.map