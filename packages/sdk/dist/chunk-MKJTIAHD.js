// src/utils.ts
import { gunzipSync, gzipSync, unzipSync } from "fflate";
function arrayMin(arr) {
  let m = Number.POSITIVE_INFINITY;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v < m) m = v;
  }
  return m;
}
function arrayMax(arr) {
  let m = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v > m) m = v;
  }
  return m;
}
function toCamelCase(str) {
  const parts = str.split(/[-_]/);
  return parts[0] + parts.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
}
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}
function serializeToKebab(obj) {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeToKebab(item));
  }
  if (typeof obj === "object" && obj.constructor === Object) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === void 0) continue;
      result[toKebabCase(key)] = serializeToKebab(value);
    }
    return result;
  }
  return obj;
}
function deserializeToCamelCase(obj) {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deserializeToCamelCase(item));
  }
  if (typeof obj === "object" && obj.constructor === Object) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamelCase(key)] = deserializeToCamelCase(value);
    }
    return result;
  }
  return obj;
}
function gzipAndEncode(data) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const compressed = gzipSync(bytes);
  return uint8ArrayToBase64(compressed);
}
function gunzipAndDecode(data) {
  const compressed = base64ToUint8Array(data);
  const decompressed = gunzipSync(compressed);
  return new TextDecoder().decode(decompressed);
}
function decompressString(base64String, fn) {
  const bytes = base64ToUint8Array(base64String);
  let content;
  try {
    const unzipped = unzipSync(bytes);
    const fileNames = Object.keys(unzipped);
    if (fileNames.length === 0) {
      throw new Error("Empty ZIP archive");
    }
    content = new TextDecoder().decode(unzipped[fileNames[0]]);
  } catch {
    const decompressed = gunzipSync(bytes);
    content = new TextDecoder().decode(decompressed);
  }
  if (fn) {
    return fn(content);
  }
  const parsed = JSON.parse(content);
  if (Array.isArray(parsed)) {
    return { output: parsed };
  }
  return parsed;
}
function decompressResultField(response, logger) {
  if (!response || typeof response !== "object") return response;
  const obj = response;
  if (typeof obj.result === "string") {
    try {
      logger?.debug("Attempting to decompress result field...");
      const decompressed = decompressString(obj.result);
      logger?.debug("Decompression successful");
      return { ...obj, result: decompressed };
    } catch (error) {
      logger?.error(`Failed to decompress result field: ${error}`);
      logger?.debug(`Result field preview: ${obj.result.substring(0, 100)}...`);
      return response;
    }
  }
  return response;
}
function createTimePeriodFromFilters(timeFilters) {
  const { period, filter } = timeFilters;
  let startHour = period.start.hour;
  let endHour = period.end.hour;
  if (filter?.hour) {
    const [fStart, fEnd] = filter.hour.split("-").map(Number);
    if (Number.isFinite(fStart)) startHour = fStart;
    if (Number.isFinite(fEnd)) endHour = fEnd;
  }
  let startDay = period.start.day;
  let endDay = period.end.day;
  if (filter?.day) {
    const [fStart, fEnd] = filter.day.split("-").map(Number);
    if (Number.isFinite(fStart)) startDay = fStart;
    if (Number.isFinite(fEnd)) endDay = fEnd;
  }
  return {
    startMonth: period.start.month,
    startDay,
    startHour,
    endMonth: period.end.month,
    endDay,
    endHour
  };
}
function uint8ArrayToBase64(bytes) {
  const CHUNK_SIZE = 32768;
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    parts.push(String.fromCharCode(...chunk));
  }
  return btoa(parts.join(""));
}
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export {
  arrayMin,
  arrayMax,
  toCamelCase,
  toKebabCase,
  serializeToKebab,
  deserializeToCamelCase,
  gzipAndEncode,
  gunzipAndDecode,
  decompressString,
  decompressResultField,
  createTimePeriodFromFilters
};
//# sourceMappingURL=chunk-MKJTIAHD.js.map