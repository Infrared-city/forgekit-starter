import {
  AnalysesName
} from "./chunk-YPOTTI3J.js";
import {
  createTimePeriodFromFilters,
  deserializeToCamelCase,
  serializeToKebab
} from "./chunk-MKJTIAHD.js";

// src/analyses/weather-filter.ts
function isEPWData(data) {
  if (!data || typeof data !== "object") return false;
  if (Array.isArray(data)) return false;
  const obj = data;
  return Array.isArray(obj.month) && Array.isArray(obj.day) && Array.isArray(obj.hour) && Array.isArray(obj.dryBulbTemperature);
}
function parseRange(rangeStr) {
  if (!rangeStr) return null;
  const parts = rangeStr.split("-").map(Number);
  if (parts.length === 1 && !Number.isNaN(parts[0])) {
    return { start: parts[0], end: parts[0] };
  }
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return { start: parts[0], end: parts[1] };
}
function isMonthInPeriod(month, startMonth, endMonth) {
  if (startMonth <= endMonth) {
    return month >= startMonth && month <= endMonth;
  } else {
    return month >= startMonth || month <= endMonth;
  }
}
function filterEPWData(epw, filters) {
  const { period, filter } = filters;
  const startMonth = period.start.month;
  const endMonth = period.end.month;
  const hourRange = parseRange(filter?.hour);
  const result = [];
  for (let i = 0; i < epw.month.length; i++) {
    const month = epw.month[i];
    const hour = epw.hour[i];
    if (!isMonthInPeriod(month, startMonth, endMonth)) {
      continue;
    }
    if (hourRange && (hour < hourRange.start || hour > hourRange.end)) {
      continue;
    }
    result.push({
      dryBulbTemperature: epw.dryBulbTemperature[i] ?? null,
      dewPointTemperature: epw.dewPointTemperature[i] ?? null,
      relativeHumidity: epw.relativeHumidity[i] ?? null,
      atmosphericStationPressure: epw.atmosphericStationPressure[i] ?? null,
      extraterrestrialHorizontalRadiation: epw.extraterrestrialHorizontalRadiation[i] ?? null,
      extraterrestrialDirectNormalRadiation: epw.extraterrestrialDirectNormalRadiation[i] ?? null,
      horizontalInfraredRadiationIntensity: epw.horizontalInfraredRadiationIntensity[i] ?? null,
      globalHorizontalRadiation: epw.globalHorizontalRadiation[i] ?? null,
      directNormalRadiation: epw.directNormalRadiation[i] ?? null,
      diffuseHorizontalRadiation: epw.diffuseHorizontalRadiation[i] ?? null,
      globalHorizontalIlluminance: epw.globalHorizontalIlluminance[i] ?? null,
      directNormalIlluminance: epw.directNormalIlluminance[i] ?? null,
      diffuseHorizontalIlluminance: epw.diffuseHorizontalIlluminance[i] ?? null,
      zenithLuminance: epw.zenithLuminance[i] ?? null,
      windDirection: epw.windDirection[i] ?? null,
      windSpeed: epw.windSpeed[i] ?? null,
      totalSkyCover: epw.totalSkyCover[i] ?? null,
      opaqueSkyCover: epw.opaqueSkyCover[i] ?? null,
      visibility: epw.visibility[i] ?? null,
      ceilingHeight: epw.ceilingHeight[i] ?? null,
      presentWeatherObservation: epw.presentWeatherObservation[i] ?? null,
      presentWeatherCodes: epw.presentWeatherCodes[i] ?? null,
      precipitableWater: epw.precipitableWater[i] ?? null,
      aerosolOpticalDepth: epw.aerosolOpticalDepth[i] ?? null,
      snowDepth: epw.snowDepth[i] ?? null,
      daysSinceLastSnowfall: epw.daysSinceLastSnowfall[i] ?? null,
      albedo: epw.albedo[i] ?? null,
      liquidPrecipitationDepth: epw.liquidPrecipitationDepth[i] ?? null,
      liquidPrecipitationQuantity: epw.liquidPrecipitationQuantity[i] ?? null
    });
  }
  return result;
}

// src/analyses/factories.ts
function camelToSnake(name) {
  const chars = [];
  for (const ch of name) {
    if (ch >= "A" && ch <= "Z" && chars.length > 0) {
      chars.push("_");
    }
    chars.push(ch.toLowerCase());
  }
  return chars.join("");
}
function extractWeatherFields(weatherData, fields) {
  const result = {};
  for (const f of fields) {
    result[camelToSnake(f)] = [];
  }
  for (const point of weatherData) {
    for (const field of fields) {
      const value = point[field];
      if (value !== null && value !== void 0) {
        result[camelToSnake(field)].push(Number(value));
      }
    }
  }
  return result;
}
function extractThermalWeatherData(weatherData) {
  const accum = {
    horizontalInfraredRadiationIntensity: [],
    diffuseHorizontalRadiation: [],
    directNormalRadiation: [],
    globalHorizontalRadiation: [],
    dryBulbTemperature: [],
    windSpeed: [],
    relativeHumidity: []
  };
  for (const point of weatherData) {
    if (point.horizontalInfraredRadiationIntensity !== null && point.horizontalInfraredRadiationIntensity !== void 0) {
      accum.horizontalInfraredRadiationIntensity.push(point.horizontalInfraredRadiationIntensity);
    }
    if (point.diffuseHorizontalRadiation !== null && point.diffuseHorizontalRadiation !== void 0) {
      accum.diffuseHorizontalRadiation.push(point.diffuseHorizontalRadiation);
    }
    if (point.directNormalRadiation !== null && point.directNormalRadiation !== void 0) {
      accum.directNormalRadiation.push(point.directNormalRadiation);
    }
    if (point.globalHorizontalRadiation !== null && point.globalHorizontalRadiation !== void 0) {
      accum.globalHorizontalRadiation.push(point.globalHorizontalRadiation);
    }
    if (point.dryBulbTemperature !== null && point.dryBulbTemperature !== void 0) {
      accum.dryBulbTemperature.push(point.dryBulbTemperature);
    }
    if (point.windSpeed !== null && point.windSpeed !== void 0) {
      accum.windSpeed.push(point.windSpeed);
    }
    if (point.relativeHumidity !== null && point.relativeHumidity !== void 0) {
      accum.relativeHumidity.push(point.relativeHumidity);
    }
  }
  return accum;
}
function extractWindData(weatherData) {
  const windSpeed = [];
  const windDirection = [];
  for (const point of weatherData) {
    if (point.windSpeed !== null && point.windSpeed !== void 0 && point.windDirection !== null && point.windDirection !== void 0) {
      windSpeed.push(point.windSpeed);
      windDirection.push(point.windDirection);
    }
  }
  return { windSpeed, windDirection };
}
function extractSolarRadiationData(weatherData) {
  const directNormalRadiation = [];
  const diffuseHorizontalRadiation = [];
  for (const point of weatherData) {
    if (point.directNormalRadiation !== null && point.directNormalRadiation !== void 0) {
      directNormalRadiation.push(point.directNormalRadiation);
    }
    if (point.diffuseHorizontalRadiation !== null && point.diffuseHorizontalRadiation !== void 0) {
      diffuseHorizontalRadiation.push(point.diffuseHorizontalRadiation);
    }
  }
  return { directNormalRadiation, diffuseHorizontalRadiation };
}
function normalizeWeatherData(weatherData, dateFilters) {
  if (isEPWData(weatherData)) {
    return filterEPWData(weatherData, dateFilters);
  }
  return weatherData;
}
function transformAnalysisInput(input) {
  if (input.analysisType === AnalysesName.WindSpeed) {
    return input;
  }
  if (input.analysisType === AnalysesName.SkyViewFactors) {
    return input;
  }
  if ("dateFilters" in input) {
    const timeFilters = input.dateFilters;
    const timePeriod = createTimePeriodFromFilters(timeFilters);
    if (input.analysisType === AnalysesName.DirectSunHours || input.analysisType === AnalysesName.DaylightAvailability) {
      const solarInput = input;
      const solarRequest = {
        analysisType: solarInput.analysisType,
        geometries: solarInput.geometries,
        vegetation: solarInput.vegetation,
        groundMaterials: solarInput.groundMaterials,
        latitude: solarInput.latitude,
        longitude: solarInput.longitude,
        timePeriod
      };
      return solarRequest;
    }
    if (input.analysisType === AnalysesName.ThermalComfortIndex) {
      const tciInput = input;
      const normalizedWeatherData = normalizeWeatherData(tciInput.weatherData, timeFilters);
      const weatherArrays = extractThermalWeatherData(normalizedWeatherData);
      const tciRequest = {
        analysisType: tciInput.analysisType,
        geometries: tciInput.geometries,
        vegetation: tciInput.vegetation,
        groundMaterials: tciInput.groundMaterials,
        latitude: tciInput.latitude,
        longitude: tciInput.longitude,
        timePeriod,
        horizontalInfraredRadiationIntensity: weatherArrays.horizontalInfraredRadiationIntensity,
        diffuseHorizontalRadiation: weatherArrays.diffuseHorizontalRadiation,
        directNormalRadiation: weatherArrays.directNormalRadiation,
        globalHorizontalRadiation: weatherArrays.globalHorizontalRadiation,
        dryBulbTemperature: weatherArrays.dryBulbTemperature,
        windSpeed: weatherArrays.windSpeed,
        relativeHumidity: weatherArrays.relativeHumidity
      };
      return tciRequest;
    }
    if (input.analysisType === AnalysesName.ThermalComfortStatistics) {
      const tcsInput = input;
      const normalizedWeatherData = normalizeWeatherData(tcsInput.weatherData, timeFilters);
      const weatherArrays = extractThermalWeatherData(normalizedWeatherData);
      const tcsRequest = {
        analysisType: tcsInput.analysisType,
        geometries: tcsInput.geometries,
        vegetation: tcsInput.vegetation,
        subtype: tcsInput.subtype,
        groundMaterials: tcsInput.groundMaterials,
        latitude: tcsInput.latitude,
        longitude: tcsInput.longitude,
        timePeriod,
        horizontalInfraredRadiationIntensity: weatherArrays.horizontalInfraredRadiationIntensity,
        diffuseHorizontalRadiation: weatherArrays.diffuseHorizontalRadiation,
        directNormalRadiation: weatherArrays.directNormalRadiation,
        globalHorizontalRadiation: weatherArrays.globalHorizontalRadiation,
        dryBulbTemperature: weatherArrays.dryBulbTemperature,
        windSpeed: weatherArrays.windSpeed,
        relativeHumidity: weatherArrays.relativeHumidity
      };
      return tcsRequest;
    }
    if (input.analysisType === AnalysesName.PedestrianWindComfort) {
      const pwcInput = input;
      const normalizedWeatherData = normalizeWeatherData(pwcInput.weatherData, timeFilters);
      const windData = extractWindData(normalizedWeatherData);
      const pwcRequest = {
        analysisType: pwcInput.analysisType,
        criteria: pwcInput.criteria,
        geometries: pwcInput.geometries,
        vegetation: pwcInput.vegetation,
        groundMaterials: pwcInput.groundMaterials,
        windSpeed: windData.windSpeed,
        windDirection: windData.windDirection
      };
      return pwcRequest;
    }
    if (input.analysisType === AnalysesName.SolarRadiation) {
      const solarRadInput = input;
      const normalizedWeatherData = normalizeWeatherData(solarRadInput.weatherData, timeFilters);
      const radiationData = extractSolarRadiationData(normalizedWeatherData);
      const solarRadRequest = {
        analysisType: solarRadInput.analysisType,
        geometries: solarRadInput.geometries,
        vegetation: solarRadInput.vegetation,
        groundMaterials: solarRadInput.groundMaterials,
        latitude: solarRadInput.latitude,
        longitude: solarRadInput.longitude,
        timePeriod,
        directNormalRadiation: radiationData.directNormalRadiation,
        diffuseHorizontalRadiation: radiationData.diffuseHorizontalRadiation
      };
      return solarRadRequest;
    }
  }
  throw new Error(`Unsupported analysis type: ${input.analysisType}`);
}

// src/analyses/service.ts
var AnalysisService = class {
  logger;
  jobsService;
  constructor(config) {
    this.logger = config.logger;
    this.jobsService = config.jobsService;
  }
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
  async execute(input, opts) {
    if (!this.jobsService) {
      throw new Error(
        "Cannot execute: no jobsService was provided. Pass an IJobsService instance when constructing AnalysisService."
      );
    }
    const payload = transformAnalysisInput(input);
    const analysisType = payload.analysisType;
    this.logger.debug(`Async model execution: ${analysisType}`);
    const serialized = serializeToKebab(payload);
    if (serialized["wind-data"]) {
      serialized["wind-data"] = deserializeToCamelCase(serialized["wind-data"]);
    }
    return this.jobsService.submit(analysisType, serialized, opts);
  }
};

export {
  isEPWData,
  filterEPWData,
  extractWeatherFields,
  transformAnalysisInput,
  AnalysisService
};
//# sourceMappingURL=chunk-UEVYS7JT.js.map