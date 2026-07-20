"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/analyses/weather-data.ts
var _zod = require('zod');
var coerceNumeric = _zod.z.preprocess((val) => {
  if (val === null || val === void 0) {
    return null;
  }
  if (typeof val === "number") {
    return val;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") {
      return null;
    }
    const lower = trimmed.toLowerCase();
    if (["null", "none", "na", "n/a", "nan"].includes(lower)) {
      return null;
    }
    const parsed = parseFloat(trimmed);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid numeric value: ${val}`);
    }
    return parsed;
  }
  return val;
}, _zod.z.number().nullable());
var WeatherDataPointSchema = _zod.z.object({
  dryBulbTemperature: coerceNumeric.optional(),
  dewPointTemperature: coerceNumeric.optional(),
  relativeHumidity: coerceNumeric.optional(),
  atmosphericStationPressure: coerceNumeric.optional(),
  extraterrestrialHorizontalRadiation: coerceNumeric.optional(),
  extraterrestrialDirectNormalRadiation: coerceNumeric.optional(),
  horizontalInfraredRadiationIntensity: coerceNumeric.optional(),
  globalHorizontalRadiation: coerceNumeric.optional(),
  directNormalRadiation: coerceNumeric.optional(),
  diffuseHorizontalRadiation: coerceNumeric.optional(),
  globalHorizontalIlluminance: coerceNumeric.optional(),
  directNormalIlluminance: coerceNumeric.optional(),
  diffuseHorizontalIlluminance: coerceNumeric.optional(),
  zenithLuminance: coerceNumeric.optional(),
  windDirection: coerceNumeric.optional(),
  windSpeed: coerceNumeric.optional(),
  totalSkyCover: coerceNumeric.optional(),
  opaqueSkyCover: coerceNumeric.optional(),
  visibility: coerceNumeric.optional(),
  ceilingHeight: coerceNumeric.optional(),
  presentWeatherObservation: coerceNumeric.optional(),
  presentWeatherCodes: coerceNumeric.optional(),
  precipitableWater: coerceNumeric.optional(),
  aerosolOpticalDepth: coerceNumeric.optional(),
  snowDepth: coerceNumeric.optional(),
  daysSinceLastSnowfall: coerceNumeric.optional(),
  albedo: coerceNumeric.optional(),
  liquidPrecipitationDepth: coerceNumeric.optional(),
  liquidPrecipitationQuantity: coerceNumeric.optional()
});



exports.WeatherDataPointSchema = WeatherDataPointSchema;
//# sourceMappingURL=chunk-6VD2RODP.cjs.map