// src/analyses/weather-data.ts
import { z } from "zod";
var coerceNumeric = z.preprocess((val) => {
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
}, z.number().nullable());
var WeatherDataPointSchema = z.object({
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

export {
  WeatherDataPointSchema
};
//# sourceMappingURL=chunk-ZYK3RM7N.js.map