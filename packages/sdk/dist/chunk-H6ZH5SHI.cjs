"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/utils.ts
var _fflate = require('fflate');
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
  const compressed = _fflate.gzipSync.call(void 0, bytes);
  return uint8ArrayToBase64(compressed);
}
function gunzipAndDecode(data) {
  const compressed = base64ToUint8Array(data);
  const decompressed = _fflate.gunzipSync.call(void 0, compressed);
  return new TextDecoder().decode(decompressed);
}
function decompressString(base64String, fn) {
  const bytes = base64ToUint8Array(base64String);
  let content;
  try {
    const unzipped = _fflate.unzipSync.call(void 0, bytes);
    const fileNames = Object.keys(unzipped);
    if (fileNames.length === 0) {
      throw new Error("Empty ZIP archive");
    }
    content = new TextDecoder().decode(unzipped[fileNames[0]]);
  } catch (e) {
    const decompressed = _fflate.gunzipSync.call(void 0, bytes);
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
      _optionalChain([logger, 'optionalAccess', _ => _.debug, 'call', _2 => _2("Attempting to decompress result field...")]);
      const decompressed = decompressString(obj.result);
      _optionalChain([logger, 'optionalAccess', _3 => _3.debug, 'call', _4 => _4("Decompression successful")]);
      return { ...obj, result: decompressed };
    } catch (error) {
      _optionalChain([logger, 'optionalAccess', _5 => _5.error, 'call', _6 => _6(`Failed to decompress result field: ${error}`)]);
      _optionalChain([logger, 'optionalAccess', _7 => _7.debug, 'call', _8 => _8(`Result field preview: ${obj.result.substring(0, 100)}...`)]);
      return response;
    }
  }
  return response;
}
function createTimePeriodFromFilters(timeFilters) {
  const { period, filter } = timeFilters;
  let startHour = period.start.hour;
  let endHour = period.end.hour;
  if (_optionalChain([filter, 'optionalAccess', _9 => _9.hour])) {
    const [fStart, fEnd] = filter.hour.split("-").map(Number);
    if (Number.isFinite(fStart)) startHour = fStart;
    if (Number.isFinite(fEnd)) endHour = fEnd;
  }
  let startDay = period.start.day;
  let endDay = period.end.day;
  if (_optionalChain([filter, 'optionalAccess', _10 => _10.day])) {
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













exports.arrayMin = arrayMin; exports.arrayMax = arrayMax; exports.toCamelCase = toCamelCase; exports.toKebabCase = toKebabCase; exports.serializeToKebab = serializeToKebab; exports.deserializeToCamelCase = deserializeToCamelCase; exports.gzipAndEncode = gzipAndEncode; exports.gunzipAndDecode = gunzipAndDecode; exports.decompressString = decompressString; exports.decompressResultField = decompressResultField; exports.createTimePeriodFromFilters = createTimePeriodFromFilters;
//# sourceMappingURL=chunk-H6ZH5SHI.cjs.map