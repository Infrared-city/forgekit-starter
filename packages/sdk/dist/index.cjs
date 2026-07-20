"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;



var _chunkYLCL74AUcjs = require('./chunk-YLCL74AU.cjs');
























var _chunk4GTYZTDZcjs = require('./chunk-4GTYZTDZ.cjs');












var _chunkVT2OD2EKcjs = require('./chunk-VT2OD2EK.cjs');


var _chunkF3IJONJ2cjs = require('./chunk-F3IJONJ2.cjs');
require('./chunk-6VD2RODP.cjs');






var _chunkA7OZZFK6cjs = require('./chunk-A7OZZFK6.cjs');









var _chunkLGQZVRPYcjs = require('./chunk-LGQZVRPY.cjs');








var _chunkX3M4BRMNcjs = require('./chunk-X3M4BRMN.cjs');




var _chunkP76CV7YNcjs = require('./chunk-P76CV7YN.cjs');











var _chunkH6ZH5SHIcjs = require('./chunk-H6ZH5SHI.cjs');




var _chunkRCUR3TGScjs = require('./chunk-RCUR3TGS.cjs');























var _chunkROJ27LGGcjs = require('./chunk-ROJ27LGG.cjs');

// src/buildings/service.ts
var TILE_STEP_M = _chunk4GTYZTDZcjs.WIND_TILING_CONFIG.stepM;
function mergeBuildings(buildingsMap) {
  const nonNull = Object.values(buildingsMap).filter(
    (v) => v !== null && v !== void 0
  );
  if (nonNull.length === 0) return {};
  if (nonNull.length === 1) return nonNull[0];
  const merged = {};
  for (const bld of nonNull) {
    for (const [key, value] of Object.entries(bld)) {
      if (Array.isArray(value) && Array.isArray(merged[key])) {
        merged[key] = merged[key].concat(value);
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
}
var BuildingsService = class {
  
  
  constructor(config) {
    this.httpClient = new (0, _chunkP76CV7YNcjs.HttpClient)({
      getAuthHeaders: config.getAuthHeaders,
      baseUrl: config.baseUrl,
      logger: config.logger,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      gatewayBaseUrl: config.gatewayBaseUrl,
      getBigPayloadEnabled: config.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: config.getBigPayloadThresholdBytes
    });
    this.logger = config.logger;
  }
  /**
   * Fetch 3D building data for a single tile.
   *
   * @param request - The buildings request with coordinates, size, and options.
   * @returns The buildings response with mesh data.
   *
   * @example
   * ```ts
   * const response = await client.buildings.getBuildings({
   *   coordinates: { latitude: 52.52, longitude: 13.405 },
   *   size: { x: 512, y: 512 },
   *   outputFormat: 'DotBim',
   * })
   * ```
   */
  async getBuildings(request) {
    try {
      this.logger.debug(
        `Fetching buildings for lat:${request.coordinates.latitude}, lon:${request.coordinates.longitude}`
      );
      return await this.httpClient.post("/buildings", request, {
        compress: request.compress,
        serializeNames: false,
        bigPayload: !request.compress
      });
    } catch (error) {
      this.logger.error(`Failed to fetch buildings: ${error}`);
      throw error;
    }
  }
  /**
   * Fetch and deduplicate buildings for a polygon area.
   *
   * Tiles the polygon, fetches buildings per tile in parallel via TileExecutor,
   * deduplicates by building key in deterministic grid order, and transforms
   * coordinates from tile-SW to polygon-bbox-SW frame.
   *
   * @param polygon - GeoJSON Polygon (validated internally).
   * @param config - Optional configuration for output format, compression, and progress.
   * @returns Deduplicated buildings with execution time.
   */
  async getBuildingsInArea(polygon, config) {
    const startTime = performance.now();
    const cfg = _nullishCoalesce(config, () => ( {}));
    if (cfg.outputFormat && cfg.outputFormat !== "DotBim") {
      throw new Error(
        `getBuildingsInArea only supports outputFormat 'DotBim', got '${cfg.outputFormat}'`
      );
    }
    const validated = _chunk4GTYZTDZcjs.validatePolygon.call(void 0, polygon);
    const tileSvc = new (0, _chunk4GTYZTDZcjs.TileService)({ polygon: validated });
    const tileGrid = tileSvc.generateTilesForPolygon();
    const nonEmptyTiles = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, tileGrid);
    this.logger.info(`getBuildingsInArea: ${nonEmptyTiles.length} non-empty tiles`);
    const jobs = nonEmptyTiles.map(({ row, col, tile }) => ({
      tileId: tile.tileId,
      row,
      col,
      execute: async (signal) => {
        const req = {
          coordinates: {
            latitude: tile.centroid.latitude,
            longitude: tile.centroid.longitude
          },
          size: { x: 512, y: 512 },
          returnBuildingIds: true,
          outputFormat: _nullishCoalesce(cfg.outputFormat, () => ( "DotBim")),
          compress: _nullishCoalesce(cfg.compress, () => ( false)),
          optimizations: cfg.optimizations
        };
        const resp = await this.httpClient.post("/buildings", req, {
          compress: req.compress,
          serializeNames: false,
          signal,
          bigPayload: !req.compress
        });
        if (!resp.success) {
          const errMsg = _nullishCoalesce(_optionalChain([resp, 'access', _2 => _2.error, 'optionalAccess', _3 => _3.message]), () => ( "Buildings API returned success=false"));
          throw new Error(errMsg);
        }
        return {
          buildings: _nullishCoalesce(resp.data.buildings, () => ( void 0)),
          buildingIds: _nullishCoalesce(resp.data.buildingIds, () => ( void 0)),
          success: resp.success
        };
      }
    }));
    const executor = new (0, _chunk4GTYZTDZcjs.TileExecutor)({
      onProgress: cfg.onProgress
    });
    const execResult = await executor.execute(jobs);
    if (execResult.failures.length > 0) {
      this.logger.warn(
        `getBuildingsInArea: ${execResult.failures.length} tile(s) failed, returning partial results`
      );
    }
    const resultsByTile = /* @__PURE__ */ new Map();
    for (const result of execResult.results) {
      resultsByTile.set(result.tileId, result);
    }
    const seenBuildingKeys = /* @__PURE__ */ new Set();
    const seenBuildingIds = /* @__PURE__ */ new Set();
    const dedupedBuildings = {};
    const dedupedBuildingIds = [];
    for (const { row, col, tile } of nonEmptyTiles) {
      const tileResult = resultsByTile.get(tile.tileId);
      if (!tileResult || !tileResult.success || !tileResult.result) {
        continue;
      }
      const tileBuildings = tileResult.result.buildings;
      const tileIds = tileResult.result.buildingIds;
      const offsetX = col * TILE_STEP_M - TILE_STEP_M / 2;
      const offsetY = row * TILE_STEP_M - TILE_STEP_M / 2;
      if (tileBuildings && typeof tileBuildings === "object") {
        for (const [bldgKey, bldgData] of Object.entries(tileBuildings)) {
          if (seenBuildingKeys.has(bldgKey)) {
            continue;
          }
          if (!bldgData || typeof bldgData !== "object") {
            this.logger.warn(`Skipping building ${bldgKey}: data is not an object`);
            continue;
          }
          const rawCoords = bldgData.coordinates;
          if (!rawCoords || !Array.isArray(rawCoords)) {
            this.logger.warn(`Skipping building ${bldgKey}: missing or non-array coordinates`);
            continue;
          }
          let transformed;
          if (rawCoords.length > 0 && rawCoords.length % 3 === 0) {
            transformed = transformBuildingCoordinates(rawCoords, -offsetX, -offsetY);
          } else {
            transformed = [...rawCoords];
          }
          dedupedBuildings[bldgKey] = {
            mesh_id: _nullishCoalesce(bldgData.mesh_id, () => ( 0)),
            coordinates: transformed,
            indices: bldgData.indices
          };
          seenBuildingKeys.add(bldgKey);
        }
      }
      if (tileIds) {
        for (const bid of tileIds) {
          if (!seenBuildingIds.has(bid)) {
            seenBuildingIds.add(bid);
            dedupedBuildingIds.push(bid);
          }
        }
      }
    }
    const elapsed = (performance.now() - startTime) / 1e3;
    return {
      buildings: dedupedBuildings,
      buildingIds: dedupedBuildingIds,
      totalBuildings: Object.keys(dedupedBuildings).length,
      executionTime: elapsed
    };
  }
  /**
   * Fetch buildings for each non-empty tile in a pre-generated grid.
   *
   * Returns a flat `{tileId: buildings_dict | null}` mapping suitable for
   * composable usage. A `null` value means the fetch failed for that tile.
   *
   * @param tiles - Tile grid produced by TileService.generateTilesForPolygon().
   * @param config - Optional configuration for output format, compression, and progress.
   * @returns Map from tile ID to buildings dict, or null for failed tiles.
   */
  async getBuildingsByTiles(tiles, config) {
    const cfg = _nullishCoalesce(config, () => ( {}));
    const nonEmptyTiles = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, tiles);
    this.logger.info(`getBuildingsByTiles: ${nonEmptyTiles.length} non-empty tiles`);
    const jobs = nonEmptyTiles.map(({ row, col, tile }) => ({
      tileId: tile.tileId,
      row,
      col,
      execute: async (signal) => {
        const req = {
          coordinates: {
            latitude: tile.centroid.latitude,
            longitude: tile.centroid.longitude
          },
          size: { x: 512, y: 512 },
          returnBuildingIds: true,
          outputFormat: _nullishCoalesce(cfg.outputFormat, () => ( "DotBim")),
          compress: _nullishCoalesce(cfg.compress, () => ( false)),
          optimizations: cfg.optimizations
        };
        const resp = await this.httpClient.post("/buildings", req, {
          compress: req.compress,
          serializeNames: false,
          signal,
          bigPayload: !req.compress
        });
        if (!resp.success) {
          const errMsg = _nullishCoalesce(_optionalChain([resp, 'access', _4 => _4.error, 'optionalAccess', _5 => _5.message]), () => ( "Buildings API returned success=false"));
          throw new Error(errMsg);
        }
        return {
          buildings: _nullishCoalesce(resp.data.buildings, () => ( void 0)),
          buildingIds: _nullishCoalesce(resp.data.buildingIds, () => ( void 0)),
          success: resp.success
        };
      }
    }));
    const executor = new (0, _chunk4GTYZTDZcjs.TileExecutor)({
      onProgress: cfg.onProgress
    });
    const execResult = await executor.execute(jobs);
    const output = {};
    for (const result of execResult.results) {
      if (result.success && result.result) {
        output[result.tileId] = _nullishCoalesce(result.result.buildings, () => ( null));
      } else {
        output[result.tileId] = null;
      }
    }
    for (const failure of execResult.failures) {
      output[failure.tileId] = null;
    }
    return output;
  }
};
function transformBuildingCoordinates(coordinates, offsetX, offsetY) {
  const result = [...coordinates];
  const numVertices = Math.floor(result.length / 3);
  for (let i = 0; i < numVertices; i++) {
    result[i * 3] -= offsetX;
    result[i * 3 + 1] -= offsetY;
  }
  return result;
}

// src/client.ts
var _plimit = require('p-limit'); var _plimit2 = _interopRequireDefault(_plimit);

// src/_area/layers.ts
function ringFromPolygon(polygon) {
  const p = polygon;
  return _nullishCoalesce(_optionalChain([p, 'optionalAccess', _6 => _6.coordinates, 'optionalAccess', _7 => _7[0]]), () => ( []));
}
function assignVegetationToTiles(features, tiles, polygon, config = _chunk4GTYZTDZcjs.WIND_TILING_CONFIG) {
  const result = {};
  for (const { tile } of tiles) result[tile.tileId] = {};
  const ring = ringFromPolygon(polygon);
  if (ring.length === 0) return result;
  const lons = ring.map((c) => c[0]);
  const lats = ring.map((c) => c[1]);
  const swLon = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lons);
  const swLat = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats);
  const margin = (config.contextSizeM - config.inferenceSizeM) / 2;
  const inf = config.inferenceSizeM;
  const tileBounds = [];
  for (const { row, col, tile } of tiles) {
    const [swX, swY] = _chunk4GTYZTDZcjs.tileSwOffset.call(void 0, row, col, config);
    tileBounds.push({
      tileId: tile.tileId,
      swX: swX - margin,
      swY: swY - margin,
      neX: swX + inf + margin,
      neY: swY + inf + margin
    });
  }
  for (const [featKey, feature] of Object.entries(features)) {
    const geom = feature.geometry;
    const coords = _optionalChain([geom, 'optionalAccess', _8 => _8.coordinates]);
    if (!coords || coords.length < 2) continue;
    const [featLon, featLat] = coords;
    const cosLat = Math.max(Math.cos(featLat * Math.PI / 180), 1e-6);
    const x = (featLon - swLon) * _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT * cosLat;
    const y = (featLat - swLat) * _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT;
    for (const tb of tileBounds) {
      if (x > tb.swX && x < tb.neX && y > tb.swY && y < tb.neY) {
        result[tb.tileId][featKey] = structuredClone(feature);
      }
    }
  }
  return result;
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var KNOWN_MATERIAL_NAMES = /* @__PURE__ */ new Set([
  "asphalt",
  "building",
  "concrete",
  "soil",
  "vegetation",
  "water"
]);
function validateGroundMaterialKeys(layers) {
  const keys = Object.keys(layers);
  const uuidKeys = keys.filter((k) => UUID_RE.test(k));
  if (uuidKeys.length > 0) {
    throw new Error(
      `groundMaterials keys must be material names (e.g. 'asphalt', 'vegetation', 'water', 'concrete', 'soil') \u2014 not UUIDs. UUID keys found: ${JSON.stringify(uuidKeys)}. Use layer names from areaGm.layers directly.`
    );
  }
  const unknown = keys.filter((k) => !KNOWN_MATERIAL_NAMES.has(k));
  if (unknown.length > 0) {
    const known = Array.from(KNOWN_MATERIAL_NAMES).sort();
    console.warn(
      `groundMaterials contains unrecognised material names: ${JSON.stringify(unknown)}. Known names are: ${JSON.stringify(known)}. Server-side emissivity may default to 0.97 if not registered.`
    );
  }
}
function assignGroundMaterialsToTiles(layers, tiles) {
  const result = {};
  for (const { tile } of tiles) result[tile.tileId] = {};
  const tileBounds = [];
  for (const { tile } of tiles) {
    const lat = tile.centroid.latitude;
    const lon = tile.centroid.longitude;
    const hlat = _chunk4GTYZTDZcjs.TILE_SIZE_M / 2 / _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT;
    const cosLat = Math.max(Math.cos(lat * Math.PI / 180), 1e-6);
    const hlon = _chunk4GTYZTDZcjs.TILE_SIZE_M / 2 / (_chunk4GTYZTDZcjs.METERS_PER_DEG_LAT * cosLat);
    tileBounds.push({
      tileId: tile.tileId,
      minLon: lon - hlon,
      minLat: lat - hlat,
      maxLon: lon + hlon,
      maxLat: lat + hlat
    });
  }
  for (const [layerName, fc] of Object.entries(layers)) {
    const features = _nullishCoalesce(fc.features, () => ( []));
    if (features.length === 0) continue;
    for (const feature of features) {
      const fbbox = featureBbox(feature);
      if (!fbbox) continue;
      const [fminLon, fminLat, fmaxLon, fmaxLat] = fbbox;
      for (const tb of tileBounds) {
        const overlaps = fmaxLon >= tb.minLon && fminLon <= tb.maxLon && fmaxLat >= tb.minLat && fminLat <= tb.maxLat;
        if (!overlaps) continue;
        const tileLayers = result[tb.tileId];
        if (!(layerName in tileLayers)) {
          tileLayers[layerName] = { type: "FeatureCollection", features: [] };
        }
        const props = _nullishCoalesce(feature.properties, () => ( {}));
        tileLayers[layerName].features.push({
          ...feature,
          properties: { ...props, material: layerName }
        });
      }
    }
  }
  return result;
}
function featureBbox(feature) {
  const geom = feature.geometry;
  if (!geom) return null;
  const coords = geom.coordinates;
  if (!coords) return null;
  let minLon = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  const visit = (v) => {
    if (Array.isArray(v)) {
      if (typeof v[0] === "number" && typeof v[1] === "number") {
        const [lon, lat] = v;
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
        return;
      }
      for (const child of v) visit(child);
    }
  };
  visit(coords);
  if (!Number.isFinite(minLon)) return null;
  return [minLon, minLat, maxLon, maxLat];
}
function resolveLayers(tileGrid, opts) {
  if (!tileGrid.config) {
    throw new Error(
      "resolveLayers: tileGrid.config is required (was the grid produced by TileService.generateTilesForPolygon()?). Without it, vegetation/ground-materials assignment falls back to wind config and silently corrupts solar/UTCI/daylight runs."
    );
  }
  const config = tileGrid.config;
  const nonEmpty = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, tileGrid).map(({ row, col, tile }) => ({
    row,
    col,
    tile
  }));
  const buildingsMap = {};
  for (const { tile } of nonEmpty) buildingsMap[tile.tileId] = {};
  if (opts.buildings) {
    for (const [tileId, val] of Object.entries(opts.buildings)) {
      if (tileId in buildingsMap) buildingsMap[tileId] = _nullishCoalesce(val, () => ( {}));
    }
  }
  const vegetationMap = opts.vegetation && Object.keys(opts.vegetation).length > 0 ? assignVegetationToTiles(opts.vegetation, nonEmpty, tileGrid.polygon, config) : Object.fromEntries(nonEmpty.map(({ tile }) => [tile.tileId, {}]));
  let groundMaterialsMap;
  if (opts.groundMaterials && Object.keys(opts.groundMaterials).length > 0) {
    validateGroundMaterialKeys(opts.groundMaterials);
    groundMaterialsMap = assignGroundMaterialsToTiles(opts.groundMaterials, nonEmpty);
  } else {
    groundMaterialsMap = Object.fromEntries(
      nonEmpty.map(({ tile }) => [tile.tileId, {}])
    );
  }
  return { buildingsMap, vegetationMap, groundMaterialsMap };
}

// src/auth.ts
function buildAuthResolver(opts) {
  if (opts.token !== void 0 && opts.getToken !== void 0) {
    throw new Error(
      "InfraredClient: `token` and `getToken` are mutually exclusive. Use `token` for static JWT, `getToken` for dynamic / refresh-aware tokens."
    );
  }
  if (!opts.apiKey && opts.token === void 0 && opts.getToken === void 0) {
    throw new Error(
      "InfraredClient: provide at least one of `apiKey`, `token`, or `getToken`."
    );
  }
  return async () => {
    const headers = {
      // Backend telemetry tag — server dashboards label TS calls "sdk".
      "x-infrared-application": "sdk"
    };
    if (opts.apiKey) headers["X-Api-Key"] = opts.apiKey;
    if (opts.getToken) {
      const tok = await opts.getToken();
      if (typeof tok !== "string" || !tok) {
        throw new Error("InfraredClient: `getToken` must return a non-empty string.");
      }
      headers.Authorization = `Bearer ${tok}`;
    } else if (opts.token) {
      headers.Authorization = `Bearer ${opts.token}`;
    }
    return headers;
  };
}

// src/logger.ts
function formatLogEntry(message) {
  if (typeof message === "string") return message;
  return JSON.stringify(message);
}
var consoleLogger = {
  debug: (message, ...args) => console.debug(formatLogEntry(message), ...args),
  info: (message, ...args) => console.info(formatLogEntry(message), ...args),
  warn: (message, ...args) => console.warn(formatLogEntry(message), ...args),
  error: (message, ...args) => console.error(formatLogEntry(message), ...args)
};
var silentLogger = {
  debug: () => {
  },
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  }
};

// src/tiling/bounds.ts
function computeGridBounds(polygon, numRows, numCols, config) {
  if (numRows <= 0 || numCols <= 0) return void 0;
  const ring = _optionalChain([polygon, 'optionalAccess', _9 => _9.coordinates, 'optionalAccess', _10 => _10[0]]);
  if (!ring || ring.length === 0) return void 0;
  const lngs = [];
  const lats = [];
  for (const pt of ring) {
    if (!pt || pt.length < 2) continue;
    lngs.push(pt[0]);
    lats.push(pt[1]);
  }
  if (lngs.length === 0 || lats.length === 0) return void 0;
  const minLng = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lngs);
  const minLat = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats);
  const maxLat = _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lats);
  const stepM = config.stepM;
  const centerLat = (minLat + maxLat) / 2;
  const mPerDegLng = _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT * Math.cos(centerLat * Math.PI / 180);
  const stepY = stepM / _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT;
  const stepX = mPerDegLng !== 0 ? stepM / mPerDegLng : stepM / _chunk4GTYZTDZcjs.METERS_PER_DEG_LAT;
  const gridMaxLng = minLng + numCols * stepX;
  const gridMaxLat = minLat + numRows * stepY;
  return [minLng, minLat, gridMaxLng, gridMaxLat];
}

// src/ground_materials/service.ts


// src/ground_materials/clean-v3-local.ts
var _polygonclipping = require('polygon-clipping'); var _polygonclipping2 = _interopRequireDefault(_polygonclipping);
var OSMNX_EARTH_RADIUS_M = 6371009;
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;
function bboxFromPoint(latitude, longitude, distance) {
  const lat = Math.min(Math.max(latitude, -89.9), 89.9);
  const deltaLat = distance / OSMNX_EARTH_RADIUS_M * RAD2DEG;
  const deltaLon = distance / OSMNX_EARTH_RADIUS_M * RAD2DEG / Math.cos(lat * DEG2RAD);
  return [longitude - deltaLon, lat - deltaLat, longitude + deltaLon, lat + deltaLat];
}
function collectPropertyKeys(features) {
  const seen = /* @__PURE__ */ new Set();
  const keys = [];
  for (const f of features) {
    const props = _optionalChain([f, 'optionalAccess', _11 => _11.properties]);
    if (props && typeof props === "object") {
      for (const k of Object.keys(props)) {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
    }
  }
  return keys;
}
function geometryWithinBbox(geometry, bbox) {
  const scan = (coords) => {
    if (!Array.isArray(coords)) return true;
    if (coords.length === 0) return true;
    if (typeof coords[0] === "number") {
      const x = coords[0];
      const y = coords[1];
      if (typeof x !== "number" || typeof y !== "number") return false;
      return x >= bbox[0] && x <= bbox[2] && y >= bbox[1] && y <= bbox[3];
    }
    return coords.every((c) => scan(c));
  };
  return geometry != null && "coordinates" in geometry && scan(geometry.coordinates);
}
function cropLayer(layerName, layer, bbox) {
  const features = _nullishCoalesce(_optionalChain([layer, 'optionalAccess', _12 => _12.features]), () => ( []));
  if (features.length === 0) return [];
  const propertyKeys = collectPropertyKeys(features);
  const out = [];
  features.forEach((feature, idx) => {
    if (feature.geometry === void 0) {
      throw new Error(`ground-material layer ${layerName}: feature ${idx} has no geometry`);
    }
    const clipped = clipGeometry(feature.geometry, bbox);
    if (clipped == null) return;
    const inProps = _nullishCoalesce(feature.properties, () => ( {}));
    const properties = {};
    for (const key of propertyKeys) {
      const has = Object.prototype.hasOwnProperty.call(inProps, key);
      Object.defineProperty(properties, key, {
        value: has ? inProps[key] : null,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    out.push({ id: String(idx), type: "Feature", properties, geometry: clipped });
  });
  return out;
}
function clipGeometry(geometry, bbox) {
  if (geometryWithinBbox(geometry, bbox)) return geometry;
  const gtype = _optionalChain([geometry, 'optionalAccess', _13 => _13.type]);
  const coords = _optionalChain([geometry, 'optionalAccess', _14 => _14.coordinates]);
  if (coords == null) return null;
  let subject;
  if (gtype === "Polygon") subject = [coords];
  else if (gtype === "MultiPolygon") subject = coords;
  else return null;
  const [west, south, east, north] = bbox;
  const rect = [
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south]
    ]
  ];
  let clipped;
  try {
    clipped = _polygonclipping2.default.intersection(subject, [rect]);
  } catch (e2) {
    return null;
  }
  const parts = clipped.filter((poly) => Array.isArray(poly[0]) && poly[0].length > 0);
  if (parts.length === 0) return null;
  if (parts.length === 1) return { type: "Polygon", coordinates: parts[0] };
  return { type: "MultiPolygon", coordinates: parts };
}
var DEFAULT_LAYER = "asphalt";
var DEFAULT_Z_STEP = 1e-5;
function stampCoords(coords, z) {
  if (!Array.isArray(coords) || coords.length === 0) return coords;
  if (typeof coords[0] === "number") {
    if (coords.length < 2 || typeof coords[1] !== "number") return coords;
    return [coords[0], coords[1], z];
  }
  return coords.map((c) => stampCoords(c, z));
}
function stampFeature(feature, z) {
  if (feature.geometry && "coordinates" in feature.geometry) {
    feature.geometry.coordinates = stampCoords(feature.geometry.coordinates, z);
  }
}
function bboxFeature(west, south, east, north) {
  return {
    type: "Feature",
    id: "default_bbox",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south]
        ]
      ]
    }
  };
}
function isPolygonal(feature) {
  const t = _optionalChain([feature, 'access', _15 => _15.geometry, 'optionalAccess', _16 => _16.type]);
  return t === "Polygon" || t === "MultiPolygon";
}
function featureCollection(features) {
  return { type: "FeatureCollection", features };
}
function cleanV3Local(layers, params) {
  const zStep = _nullishCoalesce(params.zStep, () => ( DEFAULT_Z_STEP));
  const defaultName = _nullishCoalesce(params.defaultLayer, () => ( DEFAULT_LAYER));
  const [west, south, east, north] = bboxFromPoint(
    params.latitude,
    params.longitude,
    params.distance
  );
  const bbox = [west, south, east, north];
  const entries = Object.entries(layers);
  const out = {};
  let defaultFeature = bboxFeature(west, south, east, north);
  entries.forEach(([name, layer], i) => {
    const z = (i + 1) * zStep;
    let features;
    try {
      features = cropLayer(name, layer, bbox);
    } catch (err) {
      throw new (0, _chunkROJ27LGGcjs.GroundMaterialsServiceError)(err instanceof Error ? err.message : String(err), {
        statusCode: 0,
        responseBody: "",
        operation: "cleanLocal"
      });
    }
    features = features.filter(isPolygonal);
    for (const f of features) stampFeature(f, z);
    if (name === defaultName && defaultFeature) {
      stampFeature(defaultFeature, z);
      features.unshift(defaultFeature);
      defaultFeature = null;
    }
    out[name] = featureCollection(features);
  });
  if (defaultFeature) {
    stampFeature(defaultFeature, 0);
    out[defaultName] = featureCollection([defaultFeature]);
  }
  return out;
}

// src/ground_materials/cleaner.ts
var LocalCleaner = class {
  cleanV3(layers, params) {
    return Promise.resolve(cleanV3Local(layers, params));
  }
};
var RemoteCleaner = class {
  constructor(deps) {
    this.deps = deps;
  }
  
  async cleanV3(layers, params) {
    const data = await this.deps.httpClient.post(
      "/ground-material/clean-v3",
      {
        latitude: params.latitude,
        longitude: params.longitude,
        distance: params.distance,
        layers,
        default: _nullishCoalesce(params.defaultLayer, () => ( "asphalt"))
      },
      { serializeNames: false, bigPayload: true }
    );
    if (!data) return {};
    if (data.error && data.traceback) {
      throw new (0, _chunkROJ27LGGcjs.GroundMaterialsServiceError)(
        `Ground materials clean error at (${params.latitude}, ${params.longitude}): ${data.error}`,
        { statusCode: 0, responseBody: _nullishCoalesce(data.traceback, () => ( "")), operation: "clean" }
      );
    }
    const { error: _e, traceback: _t, ...cleaned } = data;
    void _e;
    void _t;
    return cleaned;
  }
};
function resolveCleaner(sel, deps) {
  if (sel === "local") return new LocalCleaner();
  if (sel === "remote") return new RemoteCleaner(deps);
  if (!sel || typeof sel.cleanV3 !== "function") {
    throw new TypeError(
      "Invalid ground-materials cleaner: expected 'remote', 'local', or an object with a cleanV3(layers, params) method"
    );
  }
  return sel;
}

// src/ground_materials/service.ts
var TILE_FETCH_DISTANCE_M = Math.ceil(Math.sqrt(2) * 256);
var DEFAULT_MATERIAL = "asphalt";
var DEFAULT_SOURCE = "fgb";
var METERS_PER_DEG_LAT2 = 111320;
var GroundMaterialsService = class {
  
  
  constructor(config) {
    this.httpClient = new (0, _chunkP76CV7YNcjs.HttpClient)({
      getAuthHeaders: config.getAuthHeaders,
      baseUrl: config.baseUrl,
      logger: config.logger,
      timeout: _nullishCoalesce(config.timeout, () => ( 3e5)),
      gatewayBaseUrl: config.gatewayBaseUrl,
      getBigPayloadEnabled: config.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: config.getBigPayloadThresholdBytes
    });
    this.logger = config.logger;
  }
  async getRaw(lat, lon, distance, source = DEFAULT_SOURCE) {
    try {
      const data = await this.httpClient.get(
        "/ground-material/collect",
        { latitude: lat, longitude: lon, distance, source }
      );
      if (!data) return null;
      if (data.error && data.traceback) {
        throw new (0, _chunkROJ27LGGcjs.GroundMaterialsServiceError)(
          `Ground materials collect error at (${lat}, ${lon}): ${data.error}`,
          { statusCode: 0, responseBody: _nullishCoalesce(data.traceback, () => ( "")), operation: "getRaw" }
        );
      }
      const { error: _e, traceback: _t, ...layers } = data;
      void _e;
      void _t;
      return layers;
    } catch (err) {
      if (err instanceof _chunkROJ27LGGcjs.GroundMaterialsServiceError) throw err;
      throw new (0, _chunkROJ27LGGcjs.GroundMaterialsServiceError)(
        `Ground materials collect failed at (${lat}, ${lon}): ${err instanceof Error ? err.message : String(err)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, err),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, err),
          operation: "getRaw"
        }
      );
    }
  }
  async clean(layers, lat, lon, distance, defaultMaterial = DEFAULT_MATERIAL) {
    try {
      const cleaner = new RemoteCleaner({ httpClient: this.httpClient });
      return await cleaner.cleanV3(layers, {
        latitude: lat,
        longitude: lon,
        distance,
        defaultLayer: defaultMaterial
      });
    } catch (err) {
      if (err instanceof _chunkROJ27LGGcjs.GroundMaterialsServiceError) throw err;
      throw new (0, _chunkROJ27LGGcjs.GroundMaterialsServiceError)(
        `Ground materials clean failed at (${lat}, ${lon}): ${err instanceof Error ? err.message : String(err)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, err),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, err),
          operation: "clean"
        }
      );
    }
  }
  async getArea(polygon, opts = {}) {
    const t0 = performance.now();
    const maxWorkers = _nullishCoalesce(opts.maxWorkers, () => ( 10));
    const defaultMaterial = _nullishCoalesce(opts.defaultMaterial, () => ( DEFAULT_MATERIAL));
    const svc = new (0, _chunk4GTYZTDZcjs.TileService)({
      polygon,
      maxTilesOverride: opts.maxTilesOverride
    });
    const grid = svc.generateTilesForPolygon();
    const nonEmpty = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, grid);
    this.logger.info(
      `getArea: ${nonEmpty.length} non-empty tile(s); fetching Mapbox land-cover via /ground-material/collect (parallel, up to ${maxWorkers} workers)`
    );
    const limit = _plimit2.default.call(void 0, maxWorkers);
    const fetchTasks = nonEmpty.map(
      ({ tile }) => limit(async () => {
        try {
          return await this.getRaw(
            tile.centroid.latitude,
            tile.centroid.longitude,
            TILE_FETCH_DISTANCE_M
          );
        } catch (err) {
          this.logger.warn(
            `Ground-materials tile ${tile.tileId} failed: ${err instanceof Error ? err.message : "unknown"}`
          );
          return null;
        }
      })
    );
    const tileResults = await Promise.all(fetchTasks);
    let mergedLayers = mergeTileLayers(tileResults);
    this.logger.info(
      `merged ${Object.keys(mergedLayers).length} layer(s) across tiles; calling /ground-material/clean-v3`
    );
    if (Object.keys(mergedLayers).length === 0) {
      this.logger.info("No ground materials found in area");
      const elapsed2 = (performance.now() - t0) / 1e3;
      return {
        layers: {},
        polygon,
        totalFeatures: 0,
        executionTime: elapsed2
      };
    }
    const ring = _nullishCoalesce(_optionalChain([polygon, 'access', _17 => _17.coordinates, 'optionalAccess', _18 => _18[0]]), () => ( []));
    if (ring.length > 0) {
      const lons = ring.map((pt) => pt[0]);
      const lats = ring.map((pt) => pt[1]);
      const minLat = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats);
      const maxLat = _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lats);
      const minLon = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lons);
      const maxLon = _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lons);
      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;
      const latSpanM = (maxLat - minLat) * METERS_PER_DEG_LAT2;
      const lonSpanM = (maxLon - minLon) * METERS_PER_DEG_LAT2 * Math.cos(centerLat * Math.PI / 180);
      const approxDistance = Math.sqrt(latSpanM * latSpanM + lonSpanM * lonSpanM) / 2;
      const cleaner = resolveCleaner(_nullishCoalesce(opts.cleaner, () => ( "remote")), { httpClient: this.httpClient });
      try {
        const cleaned = await cleaner.cleanV3(mergedLayers, {
          latitude: centerLat,
          longitude: centerLon,
          distance: Math.max(approxDistance, TILE_FETCH_DISTANCE_M),
          defaultLayer: defaultMaterial,
          zStep: opts.zStep
        });
        if (cleaned && Object.keys(cleaned).length > 0) mergedLayers = cleaned;
      } catch (err) {
        if (err instanceof _chunkROJ27LGGcjs.BigPayloadError) throw err;
        this.logger.warn(
          `Ground-materials clean failed; returning uncleaned merged layers: ${err instanceof Error ? err.message : "unknown"}`
        );
      }
    }
    const totalFeatures = Object.values(mergedLayers).reduce(
      (sum, fc) => sum + (_nullishCoalesce(_optionalChain([fc, 'access', _19 => _19.features, 'optionalAccess', _20 => _20.length]), () => ( 0))),
      0
    );
    const elapsed = (performance.now() - t0) / 1e3;
    this.logger.info(
      `Ground materials pipeline: ${totalFeatures} features, ${Object.keys(mergedLayers).length} layers, ${nonEmpty.length} tiles, ${elapsed.toFixed(1)}s`
    );
    return {
      layers: mergedLayers,
      polygon,
      totalFeatures,
      executionTime: elapsed
    };
  }
};
function featureIdentity(feature) {
  const geom = _nullishCoalesce(feature.geometry, () => ( {}));
  return canonicalJson(geom);
}
function canonicalJson(value) {
  if (value === null || value === void 0) return JSON.stringify(value);
  if (typeof value !== "object" || Array.isArray(value)) return JSON.stringify(value);
  const obj = value;
  const keys = Object.keys(obj).sort();
  const inner = keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",");
  return `{${inner}}`;
}
function mergeTileLayers(tileResults) {
  const layerFeatures = {};
  for (const tileLayers of tileResults) {
    if (!tileLayers) continue;
    for (const [layerName, fc] of Object.entries(tileLayers)) {
      const features = _nullishCoalesce(_optionalChain([fc, 'optionalAccess', _21 => _21.features]), () => ( []));
      if (features.length === 0) continue;
      if (!(layerName in layerFeatures)) layerFeatures[layerName] = /* @__PURE__ */ new Map();
      const seen = layerFeatures[layerName];
      for (const feature of features) {
        const id = featureIdentity(feature);
        if (!seen.has(id)) seen.set(id, feature);
      }
    }
  }
  const out = {};
  for (const [layerName, seen] of Object.entries(layerFeatures)) {
    out[layerName] = {
      type: "FeatureCollection",
      features: Array.from(seen.values())
    };
  }
  return out;
}

// src/vegetation/service.ts

var TILE_FETCH_DISTANCE_M2 = Math.ceil(Math.sqrt(2) * 256);
var DEFAULT_SOURCE2 = "fgb";
var VegetationService = class {
  
  
  constructor(config) {
    this.httpClient = new (0, _chunkP76CV7YNcjs.HttpClient)({
      getAuthHeaders: config.getAuthHeaders,
      baseUrl: config.baseUrl,
      logger: config.logger,
      timeout: _nullishCoalesce(config.timeout, () => ( 3e5)),
      gatewayBaseUrl: config.gatewayBaseUrl,
      getBigPayloadEnabled: config.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: config.getBigPayloadThresholdBytes
    });
    this.logger = config.logger;
  }
  async getGeoJson(lat, lon, distance, source = DEFAULT_SOURCE2) {
    try {
      const data = await this.httpClient.get("/gis/vegetation", {
        latitude: lat,
        longitude: lon,
        distance,
        source
      });
      if (!data || !data.features || data.features.length === 0) return null;
      return data;
    } catch (err) {
      throw new (0, _chunkROJ27LGGcjs.VegetationServiceError)(
        `Vegetation fetch failed at (${lat}, ${lon}): ${err instanceof Error ? err.message : String(err)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, err),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, err),
          operation: "getGeoJson"
        }
      );
    }
  }
  async convertToMesh(featureCollection2) {
    const featureCount = (_nullishCoalesce(featureCollection2.features, () => ( []))).length;
    this.logger.debug(`POST /convert/geojson-to-mesh (${featureCount} features)`);
    try {
      const meshes = await this.httpClient.post(
        "/convert/geojson-to-mesh",
        featureCollection2,
        { gzip: true, serializeNames: false }
      );
      return Array.isArray(meshes) ? meshes : [];
    } catch (err) {
      throw new (0, _chunkROJ27LGGcjs.VegetationServiceError)(
        `geojson-to-mesh failed (${featureCount} features): ${err instanceof Error ? err.message : String(err)}`,
        {
          statusCode: _chunkP76CV7YNcjs.extractStatusCode.call(void 0, err),
          responseBody: _chunkP76CV7YNcjs.extractResponseBody.call(void 0, err),
          operation: "convertToMesh"
        }
      );
    }
  }
  async getArea(polygon, opts = {}) {
    const t0 = performance.now();
    const maxWorkers = _nullishCoalesce(opts.maxWorkers, () => ( 10));
    const svc = new (0, _chunk4GTYZTDZcjs.TileService)({
      polygon,
      maxTilesOverride: opts.maxTilesOverride
    });
    const grid = svc.generateTilesForPolygon();
    const nonEmpty = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, grid);
    this.logger.info(
      `getArea: ${nonEmpty.length} non-empty tile(s); fetching vegetation in parallel (up to ${maxWorkers} workers)`
    );
    const limit = _plimit2.default.call(void 0, maxWorkers);
    const failedTiles = [];
    const fetchTasks = nonEmpty.map(
      ({ tile }) => limit(async () => {
        try {
          return await this.getGeoJson(
            tile.centroid.latitude,
            tile.centroid.longitude,
            TILE_FETCH_DISTANCE_M2
          );
        } catch (err) {
          this.logger.warn(`Vegetation tile ${tile.tileId} failed: ${err}`);
          failedTiles.push(tile.tileId);
          return null;
        }
      })
    );
    const results = await Promise.all(fetchTasks);
    const dedup = dedupVegetationFeatures(results);
    const elapsed = (performance.now() - t0) / 1e3;
    this.logger.info(
      `Vegetation pipeline: ${Object.keys(dedup).length} unique trees, ${nonEmpty.length} tiles, ${elapsed.toFixed(1)}s`
    );
    return {
      features: dedup,
      polygon,
      totalTrees: Object.keys(dedup).length,
      executionTime: elapsed,
      failedTiles
    };
  }
};
function featureDedupKey(feature) {
  const fid = feature.id;
  if (fid !== void 0 && fid !== null) return String(fid);
  const props = _nullishCoalesce(feature.properties, () => ( {}));
  const osmid = _nullishCoalesce(props.osmid, () => ( props["@id"]));
  if (osmid !== void 0 && osmid !== null) return String(osmid);
  const geom = feature.geometry;
  const coords = _optionalChain([geom, 'optionalAccess', _22 => _22.coordinates]);
  if (coords && coords.length >= 2) {
    return `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;
  }
  return JSON.stringify(feature);
}
function dedupVegetationFeatures(results) {
  const out = {};
  for (const fc of results) {
    if (!fc || !fc.features) continue;
    for (const feature of fc.features) {
      const key = featureDedupKey(feature);
      if (!(key in out)) out[key] = feature;
    }
  }
  return out;
}

// src/client.ts
var POLL_BACKOFF_BASE = 2;
var POLL_BACKOFF_CAP = 10;
var POLL_BACKOFF_FLOOR = 0.5;
var DEFAULT_BASE_URL = "https://api.infrared.city/v2";
var MAX_PARALLEL_SUBMISSIONS = 8;
var STATUS_MAX_WORKERS = 5;
var STATUS_RETRY_MAX = 5;
var POLL_RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([429, 500, 502, 503, 504]);
var MAX_CONSECUTIVE_POLL_FAILURES = 5;
function isRetryablePollError(err) {
  if (!err || typeof err !== "object") return false;
  const e = err;
  if (e.name === "AbortError") return true;
  if (typeof e.statusCode === "number") {
    if (e.statusCode === 0) return true;
    return POLL_RETRYABLE_STATUS_CODES.has(e.statusCode);
  }
  return false;
}
function computePollRetryDelay(attempt, err) {
  const retryAfter = _optionalChain([err, 'optionalAccess', _23 => _23.retryAfter]);
  if (typeof retryAfter === "number" && Number.isFinite(retryAfter) && retryAfter >= 0) {
    return retryAfter;
  }
  const cap = Math.min(SUBMIT_BACKOFF_CAP, SUBMIT_BACKOFF_BASE * 2 ** attempt);
  return Math.max(SUBMIT_BACKOFF_FLOOR, Math.random() * cap);
}
var SUBMIT_MAX_ATTEMPTS = 3;
var SUBMIT_BACKOFF_BASE = 2;
var SUBMIT_BACKOFF_CAP = 10;
var SUBMIT_BACKOFF_FLOOR = 0.5;
async function submitWithRetry(fn, logger, tileId) {
  let lastError;
  for (let attempt = 0; attempt < SUBMIT_MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof _chunkROJ27LGGcjs.InsufficientCreditsError || err.statusCode === 402) {
        throw err instanceof _chunkROJ27LGGcjs.InsufficientCreditsError ? err : new (0, _chunkROJ27LGGcjs.InsufficientCreditsError)(
          err instanceof Error ? err.message : String(err),
          { responseBody: _nullishCoalesce(err.responseBody, () => ( "")) }
        );
      }
      lastError = err;
      if (attempt === SUBMIT_MAX_ATTEMPTS - 1) break;
      const cap = Math.min(SUBMIT_BACKOFF_CAP, SUBMIT_BACKOFF_BASE ** (attempt + 1));
      const delay = Math.max(SUBMIT_BACKOFF_FLOOR, Math.random() * cap);
      logger.warn(
        `submit retry ${attempt + 1}/${SUBMIT_MAX_ATTEMPTS - 1} for tile ${tileId} after ${delay.toFixed(2)}s: ${err}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay * 1e3));
    }
  }
  throw lastError;
}
function readEnvVar(env, key) {
  if (env && env[key]) return env[key];
  const proc = globalThis.process;
  return _optionalChain([proc, 'optionalAccess', _24 => _24.env, 'optionalAccess', _25 => _25[key]]);
}
var InfraredClient = (_class = class {
  /**
   * Resolved API key (if provided). `undefined` when the client was built
   * with JWT auth only. Exposed as `readonly` for consumers that need to
   * forward the key to non-SDK code paths.
   */
  
  
  
  
  
  
  
  
  /**
   * Per-job count of consecutive `checkAreaState` poll failures. When the
   * count exceeds `MAX_CONSECUTIVE_POLL_FAILURES`, the job is marked
   * `skipped` so the wait loop unblocks instead of hanging until timeout.
   */
  __init() {this.pollFailureCounts = /* @__PURE__ */ new Map()}
  
  /**
   * Public billing/pricing reads (`GET {gateway}/billing/pricing`, no auth).
   * Backs `previewAreaWithPricing()`; usable directly for raw pricing data.
   */
  
  /** Bare gateway URL for big-payload presign (`{gateway}/uploads/presign`). */
  
  /**
   * Live big-payload kill switch — re-resolves env / override on every
   * read. Use the getter form (`bigPayloadEnabled`) to observe current
   * state; the boolean property below is kept for back-compat, snapshots
   * the value at construction, and **does not** see env-var flips.
   */
  get bigPayloadEnabled() {
    return this.getBigPayloadEnabled();
  }
  /** Live big-payload threshold in bytes — re-resolves env / override per read. */
  get bigPayloadThresholdBytes() {
    return this.getBigPayloadThresholdBytes();
  }
  /** Live resolvers — closures over `env` + `override`. Re-read on each call. */
  
  
  
  
  constructor(config = {}) {;_class.prototype.__init.call(this);
    this.logger = _nullishCoalesce(config.logger, () => ( consoleLogger));
    const apiKey = _nullishCoalesce(config.apiKey, () => ( readEnvVar(config.env, "INFRARED_API_KEY")));
    this.apiKey = apiKey;
    this.getAuthHeaders = buildAuthResolver({
      apiKey,
      token: config.token,
      getToken: config.getToken
    });
    this.baseUrl = _nullishCoalesce(_nullishCoalesce(config.baseUrl, () => ( readEnvVar(config.env, "INFRARED_BASE_URL"))), () => ( DEFAULT_BASE_URL));
    const env = config.env;
    const enabledOverride = _optionalChain([config, 'access', _26 => _26.bigPayloads, 'optionalAccess', _27 => _27.enabled]);
    const thresholdOverride = _optionalChain([config, 'access', _28 => _28.bigPayloads, 'optionalAccess', _29 => _29.thresholdBytes]);
    this.getBigPayloadEnabled = () => _chunkRCUR3TGScjs.readEnabled.call(void 0, env, enabledOverride);
    this.getBigPayloadThresholdBytes = () => _chunkRCUR3TGScjs.readThresholdBytes.call(void 0, env, thresholdOverride);
    this.gatewayBaseUrl = _nullishCoalesce(config.gatewayBaseUrl, () => ( _chunkRCUR3TGScjs.deriveGatewayBaseUrl.call(void 0, this.baseUrl)));
    this.logger.debug({ event: "client_init", baseUrl: this.baseUrl });
    this.jobs = _nullishCoalesce(config.jobsService, () => ( new (0, _chunkA7OZZFK6cjs.JobsService)({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: this.baseUrl,
      logger: this.logger,
      timeout: config.timeout,
      downloadTimeout: config.downloadTimeout,
      gatewayBaseUrl: this.gatewayBaseUrl,
      getBigPayloadEnabled: this.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: this.getBigPayloadThresholdBytes
    })));
    this.analyses = _nullishCoalesce(config.analysisService, () => ( new (0, _chunkYLCL74AUcjs.AnalysisService)({
      logger: this.logger,
      jobsService: this.jobs
    })));
    this.weather = _nullishCoalesce(config.weatherService, () => ( new (0, _chunkF3IJONJ2cjs.WeatherService)({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: `${this.baseUrl}/utils`,
      logger: this.logger,
      timeout: config.timeout,
      gatewayBaseUrl: this.gatewayBaseUrl,
      getBigPayloadEnabled: this.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: this.getBigPayloadThresholdBytes
    })));
    this.vegetation = _nullishCoalesce(config.vegetationService, () => ( new VegetationService({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: `${this.baseUrl}/utils`,
      logger: this.logger,
      timeout: config.timeout,
      gatewayBaseUrl: this.gatewayBaseUrl,
      getBigPayloadEnabled: this.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: this.getBigPayloadThresholdBytes
    })));
    this.groundMaterials = _nullishCoalesce(config.groundMaterialsService, () => ( new GroundMaterialsService({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: `${this.baseUrl}/utils`,
      logger: this.logger,
      timeout: config.timeout,
      gatewayBaseUrl: this.gatewayBaseUrl,
      getBigPayloadEnabled: this.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: this.getBigPayloadThresholdBytes
    })));
    this.buildings = _nullishCoalesce(config.buildingsService, () => ( new BuildingsService({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: this.baseUrl,
      logger: this.logger,
      timeout: config.timeout,
      gatewayBaseUrl: this.gatewayBaseUrl,
      getBigPayloadEnabled: this.getBigPayloadEnabled,
      getBigPayloadThresholdBytes: this.getBigPayloadThresholdBytes
    })));
    this.webhooks = _nullishCoalesce(config.webhooksService, () => ( new (0, _chunkLGQZVRPYcjs.WebhooksService)({
      getAuthHeaders: this.getAuthHeaders,
      baseUrl: this.baseUrl,
      logger: this.logger,
      timeout: config.timeout
    })));
    this.billing = _nullishCoalesce(config.billingService, () => ( new (0, _chunkX3M4BRMNcjs.BillingService)({
      gatewayBaseUrl: this.gatewayBaseUrl,
      logger: this.logger,
      timeout: config.timeout
    })));
  }
  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------
  /**
   * Release owned resources. Safe to call multiple times.
   */
  close() {
    this.logger.debug({ event: "client_close" });
  }
  // -------------------------------------------------------------------------
  // Single-tile helpers (private)
  // -------------------------------------------------------------------------
  /**
   * Transform an AnalysisInput into a kebab-case payload ready for the API,
   * preserving camelCase for wind-data as the backend expects.
   */
  preparePayload(input) {
    const payload = _chunkYLCL74AUcjs.transformAnalysisInput.call(void 0, input);
    const analysisType = payload.analysisType;
    const serialized = _chunkH6ZH5SHIcjs.serializeToKebab.call(void 0, payload);
    if (serialized["wind-data"]) {
      serialized["wind-data"] = _chunkH6ZH5SHIcjs.deserializeToCamelCase.call(void 0, serialized["wind-data"]);
    }
    return { analysisType, serialized };
  }
  // -------------------------------------------------------------------------
  // run -- single-tile job submission
  // -------------------------------------------------------------------------
  /**
   * Submit a single-tile analysis job and return the Job handle.
   *
   * @param input - Analysis input configuration.
   * @param opts - Optional webhook configuration.
   * @returns The submitted job.
   */
  async run(input, opts) {
    return this.analyses.execute(input, opts);
  }
  // -------------------------------------------------------------------------
  // runAndWait -- single-tile, blocking
  // -------------------------------------------------------------------------
  /**
   * Submit a single-tile analysis, wait for completion, return decompressed results.
   *
   * Return type is inferred from `input.analysisType` via `InferAnalysisResponse<T>`,
   * so callers get a precisely-typed response (`WindSpeedResponse`,
   * `SolarAnalysisResponse`, etc.) without needing `as`.
   *
   * @param input - Analysis input configuration.
   * @param timeout - Timeout in seconds (default 300).
   * @param opts - Optional webhook configuration.
   */
  async runAndWait(input, timeout = 300, opts) {
    const job = await this.analyses.execute(input, opts);
    const completed = await this.jobs.waitForCompletion(job.jobId, { timeout });
    const download = await this.jobs.downloadResults(completed.jobId, { job: completed });
    return this.jobs.decompress(download.content);
  }
  // -------------------------------------------------------------------------
  // previewArea -- tile count preview
  // -------------------------------------------------------------------------
  /**
   * Preview tiling for a polygon without running any analyses.
   *
   * Uses TileService internally -- no API call, just tile grid calculation.
   * Wind analyses tile at 50% overlap (256m step); solar / UTCI / daylight /
   * SVF / TCS tile edge-to-edge (512m step) — so the SAME polygon produces
   * up to ~4× more wind tiles than solar tiles. `analysisType` is therefore
   * required: the tile count (and cost estimate) only matches what `runArea`
   * will submit — and what the gateway will charge — when it is the same
   * analysis type you pass to `runArea`.
   *
   * Cost semantics: the gateway charges a flat per-job token price at
   * submission time (`estimatedCostTokens = tileCount × tokensPerJob`).
   * Tiles whose submission FAILS are never charged, so the actual charge is
   * always ≤ the estimate. This method uses the offline fallback price
   * (`DEFAULT_TOKENS_PER_JOB`); use `previewAreaWithPricing()` for a quote
   * based on the gateway's live pricing document.
   *
   * @param polygon - A GeoJSON Polygon object.
   * @param opts.analysisType - Analysis type the preview should size for.
   *   Required at the type level. At runtime a missing value logs a warning
   *   and falls back to wind tiling (pre-0.12 behavior) — which OVERCOUNTS
   *   solar-family analyses ~4×.
   * @param opts.maxTilesOverride - Optional override for the non-empty tile cap.
   * @returns Preview with tile count, estimated time, and estimated cost.
   * @throws Error if `analysisType` is not supported for tiling (same guard
   *   as `runArea`).
   */
  previewArea(polygon, opts) {
    const validated = _chunk4GTYZTDZcjs.validatePolygon.call(void 0, polygon);
    const analysisType = _optionalChain([opts, 'optionalAccess', _30 => _30.analysisType]);
    if (analysisType === void 0) {
      this.logger.warn({
        event: "preview_area_no_analysis_type",
        message: "previewArea called without analysisType; defaulting to wind tiling (256 m step). Solar / daylight / thermal / SVF analyses tile at 512 m step, so this default OVERCOUNTS their tiles (and cost) ~4\xD7. Pass the same analysisType you will pass to runArea."
      });
    } else if (!_chunkVT2OD2EKcjs.TILING_SUPPORTED_TYPES.has(analysisType)) {
      throw new Error(
        `Analysis type '${analysisType}' is not supported for tiling. Supported types: ${[..._chunkVT2OD2EKcjs.TILING_SUPPORTED_TYPES].sort().join(", ")}`
      );
    }
    const tileSvc = new (0, _chunk4GTYZTDZcjs.TileService)({
      polygon: validated,
      analysisType,
      maxTilesOverride: _optionalChain([opts, 'optionalAccess', _31 => _31.maxTilesOverride])
    });
    const tileGrid = tileSvc.generateTilesForPolygon();
    const nonEmpty = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, tileGrid);
    return {
      tileCount: nonEmpty.length,
      estimatedTimeS: nonEmpty.length * _chunkX3M4BRMNcjs.ESTIMATED_SECONDS_PER_TILE,
      estimatedCostTokens: nonEmpty.length * _chunkX3M4BRMNcjs.DEFAULT_TOKENS_PER_JOB
    };
  }
  // -------------------------------------------------------------------------
  // previewAreaWithPricing -- tile count preview + live gateway pricing
  // -------------------------------------------------------------------------
  /**
   * Preview tiling for a polygon AND price it with the gateway's live public
   * pricing document (`GET /billing/pricing`).
   *
   * The tile count comes from the same local computation as `previewArea()`
   * (single source of truth); only the per-job token price is remote. When
   * the pricing fetch fails for ANY reason the method logs a warning and
   * falls back to the offline constant (`DEFAULT_TOKENS_PER_JOB`) with
   * `pricingSource: 'fallback'` — it never throws for pricing reasons.
   * Polygon-validation and unsupported-type errors still throw, exactly as
   * in `previewArea()`.
   *
   * @param polygon - A GeoJSON Polygon object.
   * @param opts.analysisType - Analysis type the preview should size for.
   * @param opts.maxTilesOverride - Optional override for the non-empty tile cap.
   * @param opts.forceRefresh - Bypass the 5-minute pricing cache.
   * @returns Preview with tile count, per-job token price, its source, and
   *   the pricing document version when resolved remotely.
   */
  async previewAreaWithPricing(polygon, opts) {
    const preview = this.previewArea(polygon, {
      analysisType: opts.analysisType,
      maxTilesOverride: opts.maxTilesOverride
    });
    try {
      const pricing = await this.billing.getPricing({ forceRefresh: opts.forceRefresh });
      const tokensPerJob = _chunkX3M4BRMNcjs.resolveTokensPerJob.call(void 0, pricing, opts.analysisType);
      return {
        ...preview,
        estimatedCostTokens: preview.tileCount * tokensPerJob,
        tokensPerJob,
        pricingSource: "remote",
        pricingVersion: pricing.version !== void 0 ? String(pricing.version) : void 0
      };
    } catch (error) {
      this.logger.warn({
        event: "pricing_fetch_failed",
        message: `Failed to fetch gateway pricing; using offline fallback of ${_chunkX3M4BRMNcjs.DEFAULT_TOKENS_PER_JOB} tokens/job`,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        ...preview,
        tokensPerJob: _chunkX3M4BRMNcjs.DEFAULT_TOKENS_PER_JOB,
        pricingSource: "fallback"
      };
    }
  }
  // -------------------------------------------------------------------------
  // runArea -- area-level job submission
  // -------------------------------------------------------------------------
  /**
   * Submit tiled analysis jobs over a polygon.
   *
   * Validates the polygon, generates tiles internally, optionally fetches
   * buildings per tile via the API, and submits jobs. Returns an AreaSchedule
   * for tracking and later merging.
   *
   * When `buildings` is provided (non-empty object), the SDK calls
   * `getBuildingsByTiles()` to retrieve per-tile building data from the
   * API with server-side spatial filtering. The `buildings` parameter
   * signals that building geometry context is needed for the analysis.
   *
   * @param input - Analysis input (template payload).
   * @param polygon - A GeoJSON Polygon object.
   * @param buildings - Building meshes keyed by identifier. When provided and non-empty,
   *   triggers per-tile building fetch via the API. Pass `undefined` to skip building injection.
   * @returns Schedule of submitted jobs.
   */
  async runArea(input, polygon, opts = {}) {
    const validated = _chunk4GTYZTDZcjs.validatePolygon.call(void 0, polygon);
    const { analysisType, serialized } = this.preparePayload(input);
    if (!_chunkVT2OD2EKcjs.TILING_SUPPORTED_TYPES.has(analysisType)) {
      throw new Error(
        `Analysis type '${analysisType}' is not supported for tiling. Supported types: ${[..._chunkVT2OD2EKcjs.TILING_SUPPORTED_TYPES].sort().join(", ")}`
      );
    }
    const tileSvc = new (0, _chunk4GTYZTDZcjs.TileService)({
      polygon: validated,
      analysisType,
      maxTilesOverride: opts.maxTilesOverride
    });
    const tileGrid = tileSvc.generateTilesForPolygon();
    const nonEmpty = _chunk4GTYZTDZcjs.getNonEmptyTiles.call(void 0, tileGrid);
    const gridShape = [tileGrid.numRows, tileGrid.numCols];
    this.logger.info(`runArea: ${nonEmpty.length} non-empty tiles for polygon`);
    let buildingsMap;
    if (opts.buildings && Object.keys(opts.buildings).length > 0) {
      let flat;
      if (Object.keys(opts.buildings).length === 1 && opts.buildings.fetch === true) {
        const area = await this.buildings.getBuildingsInArea(validated);
        flat = area.buildings;
      } else {
        flat = opts.buildings;
      }
      const assigned = _chunk4GTYZTDZcjs.assignBuildingsToTiles.call(void 0, 
        flat,
        nonEmpty,
        { config: tileGrid.config }
      );
      buildingsMap = assigned;
    } else if (serialized.geometries && typeof serialized.geometries === "object" && Object.keys(serialized.geometries).length > 0) {
      const flat = serialized.geometries;
      const assigned = _chunk4GTYZTDZcjs.assignBuildingsToTiles.call(void 0, flat, nonEmpty, {
        config: tileGrid.config
      });
      buildingsMap = assigned;
      serialized.geometries = {};
    }
    let effectiveGroundMaterials = opts.groundMaterials;
    const inlineGm = serialized["ground-materials"];
    if (inlineGm && Object.keys(inlineGm).length > 0) {
      if (!effectiveGroundMaterials) {
        effectiveGroundMaterials = inlineGm;
      }
      serialized["ground-materials"] = void 0;
    }
    const layers = resolveLayers(tileGrid, {
      vegetation: opts.vegetation,
      groundMaterials: effectiveGroundMaterials
    });
    const vegetationMap = layers.vegetationMap;
    const groundMaterialsMap = layers.groundMaterialsMap;
    const hash = await _chunkVT2OD2EKcjs.configHash.call(void 0, serialized);
    const jobs = /* @__PURE__ */ new Map();
    const tilePositions = [];
    const failedSubmissions = [];
    let submissionAbortStatus = null;
    const retryTileIds = opts.retryFrom ? new Set(opts.retryFrom.failedSubmissions) : null;
    const limit = _plimit2.default.call(void 0, _nullishCoalesce(opts.maxWorkers, () => ( MAX_PARALLEL_SUBMISSIONS)));
    for (const { row, col, tile } of nonEmpty) {
      tilePositions.push({ row, col, tileId: tile.tileId });
    }
    const submitTasks = nonEmpty.map(
      ({ row, col, tile }) => limit(async () => {
        if (submissionAbortStatus !== null) {
          failedSubmissions.push(tile.tileId);
          return;
        }
        if (retryTileIds && !retryTileIds.has(tile.tileId)) return;
        const cloned = _chunk4GTYZTDZcjs.clonePayloadForTile.call(void 0, serialized, tile, analysisType);
        if (buildingsMap && tile.tileId in buildingsMap && buildingsMap[tile.tileId] !== null) {
          cloned.geometries = buildingsMap[tile.tileId];
        }
        if (vegetationMap[tile.tileId] && Object.keys(vegetationMap[tile.tileId]).length > 0) {
          cloned.vegetation = vegetationMap[tile.tileId];
        }
        if (groundMaterialsMap[tile.tileId] && Object.keys(groundMaterialsMap[tile.tileId]).length > 0) {
          cloned["ground-materials"] = groundMaterialsMap[tile.tileId];
        }
        try {
          const job = await submitWithRetry(
            // Forward webhook config to every tile (#48). RunAreaOptions
            // advertises these; without this they were silently dropped and
            // webhooks never fired for any area run. jobs.submit only writes
            // the wire fields when defined, so passing undefined is a no-op.
            () => this.jobs.submit(analysisType, cloned, {
              webhookUrl: opts.webhookUrl,
              webhookEvents: opts.webhookEvents
            }),
            this.logger,
            tile.tileId
          );
          const initialStatus = job.status === _chunkA7OZZFK6cjs.JobStatus.Succeeded ? "completed" : job.status === _chunkA7OZZFK6cjs.JobStatus.Failed ? "failed" : job.status === _chunkA7OZZFK6cjs.JobStatus.Running ? "running" : "pending";
          jobs.set(tile.tileId, {
            tileId: tile.tileId,
            row,
            col,
            jobId: job.jobId,
            status: initialStatus,
            result: void 0,
            error: void 0
          });
        } catch (error) {
          if (error instanceof _chunkROJ27LGGcjs.InsufficientCreditsError) {
            submissionAbortStatus = 402;
            this.logger.warn(
              `runArea: insufficient credits (402); aborting remaining tile submissions`
            );
          } else {
            this.logger.warn(`runArea: failed to submit job for tile ${tile.tileId}: ${error}`);
          }
          failedSubmissions.push(tile.tileId);
          jobs.set(tile.tileId, {
            tileId: tile.tileId,
            row,
            col,
            status: "failed",
            error: error instanceof Error ? error.message : String(error)
          });
        }
      })
    );
    await Promise.all(submitTasks);
    return _chunk4GTYZTDZcjs.freezeAreaSchedule.call(void 0, {
      jobs,
      polygon: validated,
      configHash: hash,
      tilePositions,
      gridShape,
      analysisType,
      failedSubmissions,
      submissionAbortStatus
    });
  }
  // -------------------------------------------------------------------------
  // checkAreaState -- poll all job statuses
  // -------------------------------------------------------------------------
  /**
   * Query all job statuses in an area schedule and compute aggregate state.
   *
   * @param schedule - The schedule to check.
   * @returns Current area state with status counts.
   */
  async checkAreaState(schedule) {
    if (schedule.jobs.size === 0) {
      return _chunk4GTYZTDZcjs.computeAreaState.call(void 0, schedule);
    }
    const limit = _plimit2.default.call(void 0, STATUS_MAX_WORKERS);
    const tasks = [];
    for (const [_tileId, areaJob] of schedule.jobs) {
      const jobId = areaJob.jobId;
      if (!jobId) {
        continue;
      }
      if (areaJob.status === "completed" || areaJob.status === "failed" || areaJob.status === "skipped") {
        continue;
      }
      tasks.push(limit(() => this.pollOneJobStatus(jobId, areaJob)));
    }
    await Promise.all(tasks);
    return _chunk4GTYZTDZcjs.computeAreaState.call(void 0, schedule);
  }
  /**
   * Query one job's status with per-call retry. Mirrors Python
   * `_polling.py::query_one`: up to STATUS_RETRY_MAX retries on
   * retryable errors (429 / 5xx / timeout), honoring `Retry-After` when
   * present; on terminal failure increments the cross-round wedge
   * counter and may flip the tile to `skipped`.
   */
  async pollOneJobStatus(jobId, areaJob) {
    let lastError;
    for (let attempt = 0; attempt <= STATUS_RETRY_MAX; attempt++) {
      try {
        const job = await this.jobs.getStatus(jobId);
        this.pollFailureCounts.delete(jobId);
        areaJob.lastJobSnapshot = job;
        if (job.status === _chunkA7OZZFK6cjs.JobStatus.Succeeded) {
          areaJob.status = "completed";
        } else if (job.status === _chunkA7OZZFK6cjs.JobStatus.Failed) {
          areaJob.status = "failed";
          areaJob.error = _nullishCoalesce(job.error, () => ( "Job failed"));
        } else if (job.status === _chunkA7OZZFK6cjs.JobStatus.Running) {
          areaJob.status = "running";
        } else if (job.status === _chunkA7OZZFK6cjs.JobStatus.Pending) {
          areaJob.status = "pending";
        }
        return;
      } catch (err) {
        lastError = err;
        if (attempt < STATUS_RETRY_MAX && isRetryablePollError(err)) {
          const delay = computePollRetryDelay(attempt, err);
          this.logger.warn(
            `checkAreaState: job ${jobId} status query failed (attempt ${attempt + 1}/${STATUS_RETRY_MAX + 1}), retrying in ${delay.toFixed(2)}s: ${err instanceof Error ? err.message : String(err)}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay * 1e3));
          continue;
        }
        break;
      }
    }
    const count = (_nullishCoalesce(this.pollFailureCounts.get(jobId), () => ( 0))) + 1;
    this.pollFailureCounts.set(jobId, count);
    this.logger.warn(
      `checkAreaState: status query failed for job ${jobId} (${count}/${MAX_CONSECUTIVE_POLL_FAILURES}): ${lastError instanceof Error ? lastError.message : "unknown"}`
    );
    if (count >= MAX_CONSECUTIVE_POLL_FAILURES) {
      areaJob.status = "skipped";
      areaJob.error = `Status query failed ${count} consecutive times; assuming unrecoverable`;
      this.pollFailureCounts.delete(jobId);
    }
  }
  // -------------------------------------------------------------------------
  // mergeAreaJobs -- download and merge results
  // -------------------------------------------------------------------------
  /**
   * Download and merge results for succeeded jobs in a schedule.
   *
   * Can be called any time -- does NOT require all jobs to be terminal.
   * Uses stored tile positions and grid shape from the schedule.
   *
   * @param schedule - The schedule whose results to merge.
   * @returns Merged result with grid, failed_jobs, skipped_jobs.
   */
  async mergeAreaJobs(schedule, opts) {
    const startTime = performance.now();
    const [numRows, numCols] = schedule.gridShape;
    const strategy = _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _32 => _32.strategy]), () => ( "default"));
    const windDirectionDeg = _optionalChain([opts, 'optionalAccess', _33 => _33.windDirectionDeg]);
    if (strategy !== "default" && schedule.analysisType !== "wind-speed") {
      throw new Error(
        `strategy=${JSON.stringify(strategy)} is only valid for wind-speed analyses; got analysisType=${JSON.stringify(schedule.analysisType)}.`
      );
    }
    if (schedule.jobs.size === 0) {
      return {
        mergedGrid: new Float64Array(0),
        gridShape: [0, 0],
        failedJobs: [],
        skippedJobs: [],
        executionTime: 0,
        failedTiles: [],
        bounds: void 0
      };
    }
    await this.checkAreaState(schedule);
    const succeededJobs = [];
    const failedJobs = [];
    const skippedJobs = [];
    const failedJobIds = [];
    const skippedJobIds = [];
    const downloadFailures = [];
    const skippedTileRecords = [];
    for (const [tileId, areaJob] of schedule.jobs) {
      const jobId = areaJob.jobId;
      if (areaJob.status === "completed" && jobId) {
        succeededJobs.push({
          tileId,
          jobId,
          row: areaJob.row,
          col: areaJob.col,
          jobSnapshot: areaJob.lastJobSnapshot
        });
      } else if (areaJob.status === "failed") {
        failedJobs.push({
          tileId,
          row: areaJob.row,
          col: areaJob.col,
          error: _nullishCoalesce(areaJob.error, () => ( "Job failed"))
        });
        failedJobIds.push(_nullishCoalesce(jobId, () => ( tileId)));
      } else {
        skippedJobs.push(tileId);
        skippedJobIds.push(_nullishCoalesce(jobId, () => ( tileId)));
        skippedTileRecords.push({ tileId, row: areaJob.row, col: areaJob.col });
      }
    }
    const tilingConfig = _chunk4GTYZTDZcjs.getTilingConfig.call(void 0, schedule.analysisType);
    const inferenceCells = tilingConfig.inferenceSizeCells;
    const tileGrids = [];
    const downloadPromises = succeededJobs.map(async ({ tileId, jobId, row, col, jobSnapshot }) => {
      try {
        const download = await submitWithRetry(
          () => this.jobs.downloadResults(jobId, { job: jobSnapshot }),
          this.logger,
          `download:${tileId}`
        );
        const resultDict = this.jobs.decompress(download.content);
        const grid = _chunk4GTYZTDZcjs.extractGrid.call(void 0, resultDict);
        if (grid.length !== inferenceCells * inferenceCells) {
          this.logger.warn(
            `mergeAreaJobs: tile ${tileId} has unexpected grid size ${grid.length}, skipping`
          );
          skippedJobs.push(tileId);
          skippedJobIds.push(jobId);
          downloadFailures.push({
            tileId,
            row,
            col,
            error: `unexpected grid size ${grid.length}`
          });
          return;
        }
        tileGrids.push({ row, col, grid });
      } catch (error) {
        this.logger.warn(`mergeAreaJobs: download failed for succeeded job ${jobId}: ${error}`);
        skippedJobs.push(tileId);
        skippedJobIds.push(jobId);
        downloadFailures.push({
          tileId,
          row,
          col,
          error: `download failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    });
    await Promise.all(downloadPromises);
    if (tileGrids.length === 0 && (failedJobs.length > 0 || skippedJobs.length > 0) && schedule.jobs.size > 0) {
      throw new (0, _chunkROJ27LGGcjs.AreaRunError)(
        `Area run produced no usable tiles: ${failedJobs.length} failed, ${skippedJobs.length} skipped, 0 succeeded out of ${schedule.jobs.size}`,
        {
          // Server-issued job IDs (fallback to tileId for submission-stage
          // failures that never reached the server). Matches Python's
          // AreaRunError.failed_jobs contract.
          failedJobs: failedJobIds,
          skippedJobs: skippedJobIds,
          totalJobs: schedule.jobs.size
        }
      );
    }
    let mergedGrid;
    let gridShape;
    if (tileGrids.length > 0 && numRows > 0 && numCols > 0) {
      const entries = tileGrids.map(({ row, col, grid }) => ({
        row,
        col,
        grid
      }));
      const mergeResult = _chunk4GTYZTDZcjs.mergeTiles.call(void 0, entries, numRows, numCols, tilingConfig, {
        strategy,
        windDirectionDeg
      });
      mergedGrid = mergeResult.grid;
      gridShape = [mergeResult.height, mergeResult.width];
    } else {
      if (numRows > 0 && numCols > 0) {
        const [height, width] = _chunk4GTYZTDZcjs.mergedGridShape.call(void 0, numRows, numCols, tilingConfig);
        mergedGrid = new Float64Array(height * width);
        mergedGrid.fill(NaN);
        gridShape = [height, width];
      } else {
        mergedGrid = new Float64Array(0);
        gridShape = [0, 0];
      }
    }
    if (mergedGrid.length > 0) {
      const { polygonMeters } = _chunk4GTYZTDZcjs.projectPolygonToMeters.call(void 0, schedule.polygon);
      mergedGrid = _chunk4GTYZTDZcjs.clipToPolygon.call(void 0, 
        mergedGrid,
        gridShape[0],
        gridShape[1],
        polygonMeters,
        [0, 0],
        tilingConfig.cellSizeM
      );
    }
    const failedTiles = [];
    const seenFailedTiles = /* @__PURE__ */ new Set();
    const addFailedTile = (tileId, row, col, error, phase) => {
      if (seenFailedTiles.has(tileId)) return;
      seenFailedTiles.add(tileId);
      failedTiles.push({ tileId, row, col, error, phase });
    };
    for (const tileId of schedule.failedSubmissions) {
      const job = schedule.jobs.get(tileId);
      addFailedTile(
        tileId,
        _nullishCoalesce(_optionalChain([job, 'optionalAccess', _34 => _34.row]), () => ( -1)),
        _nullishCoalesce(_optionalChain([job, 'optionalAccess', _35 => _35.col]), () => ( -1)),
        _nullishCoalesce(_optionalChain([job, 'optionalAccess', _36 => _36.error]), () => ( "job submission failed")),
        _chunk4GTYZTDZcjs.TileFailurePhase.Submit
      );
    }
    for (const f of failedJobs) {
      addFailedTile(f.tileId, f.row, f.col, f.error, _chunk4GTYZTDZcjs.TileFailurePhase.Compute);
    }
    for (const d of downloadFailures) {
      addFailedTile(d.tileId, d.row, d.col, d.error, _chunk4GTYZTDZcjs.TileFailurePhase.Download);
    }
    for (const s of skippedTileRecords) {
      addFailedTile(
        s.tileId,
        s.row,
        s.col,
        "job did not reach a terminal state",
        _chunk4GTYZTDZcjs.TileFailurePhase.Skipped
      );
    }
    const bounds = computeGridBounds(schedule.polygon, numRows, numCols, tilingConfig);
    const elapsed = (performance.now() - startTime) / 1e3;
    return {
      mergedGrid,
      gridShape,
      failedJobs,
      skippedJobs,
      executionTime: elapsed,
      failedTiles,
      bounds
    };
  }
  // -------------------------------------------------------------------------
  // runAreaAndWait -- area-level, blocking
  // -------------------------------------------------------------------------
  /**
   * Submit area jobs, poll until complete, merge and return results.
   *
   * @param input - Analysis input (template payload).
   * @param polygon - A GeoJSON Polygon object.
   * @param buildings - Building meshes keyed by identifier. When provided and non-empty,
   *   triggers per-tile building fetch. Pass `undefined` to skip.
   * @param maxWorkers - Reserved for future concurrency control. Currently unused.
   * @param opts - Optional polling configuration.
   * @returns Merged area result.
   * @throws Error if areaTimeout is reached before all jobs complete.
   */
  async runAreaAndWait(input, polygon, opts = {}) {
    const areaTimeout = _nullishCoalesce(opts.areaTimeout, () => ( 3600));
    const onProgress = opts.onProgress;
    const schedule = await this.runArea(input, polygon, opts);
    const deadline = performance.now() + areaTimeout * 1e3;
    let attempt = 0;
    while (true) {
      const state = await this.checkAreaState(schedule);
      if (onProgress) {
        try {
          onProgress(state);
        } catch (e3) {
        }
      }
      if (state.isComplete) {
        break;
      }
      const remaining = (deadline - performance.now()) / 1e3;
      if (remaining <= 0) {
        throw new (0, _chunkROJ27LGGcjs.AreaTimeoutError)(
          `Area analysis timed out after ${areaTimeout}s. State: ${state.completedCount}/${state.totalCount} completed, ${state.failedCount} failed, ${state.runningCount} running`,
          { areaState: state }
        );
      }
      const rawDelay = Math.min(POLL_BACKOFF_CAP, POLL_BACKOFF_BASE * 2 ** attempt);
      let delay = Math.max(POLL_BACKOFF_FLOOR, Math.random() * rawDelay);
      delay = Math.min(delay, remaining);
      await sleep(delay * 1e3);
      attempt++;
    }
    return this.mergeAreaJobs(schedule, {
      strategy: opts.strategy,
      windDirectionDeg: opts.windDirectionDeg
    });
  }
}, _class);
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/preflight/sun-context.ts
var MONTH_FIRST_DOY = [0, 1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
var DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var SUN_CONTEXT_SEVERITY_LEVELS = [
  "info",
  "ok",
  "marginal",
  "warning",
  "critical"
];
function doy(month, day) {
  return MONTH_FIRST_DOY[month] + day - 1;
}
function solarElevationDeg(latDeg, dayOfYear, solarHour) {
  const declDeg = 23.45 * Math.sin(360 / 365 * (dayOfYear - 81) * Math.PI / 180);
  const decl = declDeg * Math.PI / 180;
  const lat = latDeg * Math.PI / 180;
  const hourAngle = 15 * (solarHour - 12) * Math.PI / 180;
  let sinAlt = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle);
  sinAlt = Math.max(-1, Math.min(1, sinAlt));
  return Math.asin(sinAlt) * 180 / Math.PI;
}
function requiredBufferM(buildingHeightM, sunElevationDeg) {
  if (sunElevationDeg <= 0) return Number.POSITIVE_INFINITY;
  return buildingHeightM / Math.tan(sunElevationDeg * Math.PI / 180);
}
function classifyPattern(lat, month, hour) {
  const hemisphere = lat >= 0 ? "Northern" : "Southern";
  let season;
  if (lat >= 0 && [11, 12, 1, 2].includes(month) || lat < 0 && [5, 6, 7, 8].includes(month)) {
    season = "winter";
  } else if (lat >= 0 && [5, 6, 7, 8].includes(month) || lat < 0 && [11, 12, 1, 2].includes(month)) {
    season = "summer";
  } else {
    season = "shoulder season";
  }
  let timeBand;
  if (hour < 9) timeBand = "early morning";
  else if (hour < 12) timeBand = "late morning";
  else if (hour < 14) timeBand = "midday";
  else if (hour < 17) timeBand = "afternoon";
  else timeBand = "late afternoon";
  return `${hemisphere} hemisphere, ${season}, ${timeBand}`;
}
function emptyResult(severity, message) {
  return {
    severity,
    message,
    minSunElevationDeg: null,
    minSunElevationMonth: null,
    minSunElevationDay: null,
    minSunElevationHour: null,
    pattern: null,
    bufferBreakevenHeightM: 0,
    shadowAtTypicalBuildingM: Number.POSITIVE_INFINITY,
    shadowAtMaxBuildingM: null
  };
}
function estimateSunContextLoss(input) {
  const {
    lat,
    lon = 0,
    timezoneOffsetH,
    startMonth,
    startDay,
    startHour,
    endMonth,
    endDay,
    endHour,
    bufferM = 77,
    typicalBuildingHeightM = 25,
    maxBuildingHeightM
  } = input;
  if (typicalBuildingHeightM <= 0) {
    return emptyResult(
      "info",
      "Cannot evaluate: typicalBuildingHeightM must be positive."
    );
  }
  const bounds = [
    ["startMonth", startMonth, 1, 12],
    ["endMonth", endMonth, 1, 12],
    ["startDay", startDay, 1, 31],
    ["endDay", endDay, 1, 31],
    ["startHour", startHour, 0, 23],
    ["endHour", endHour, 0, 23]
  ];
  for (const [label, value, lo, hi] of bounds) {
    if (!Number.isInteger(value) || value < lo || value > hi) {
      return emptyResult("info", `Cannot evaluate: ${label}=${value} out of range [${lo}, ${hi}].`);
    }
  }
  if (lat < -90 || lat > 90) {
    return emptyResult("info", `Cannot evaluate: lat=${lat} out of range [-90, 90].`);
  }
  if (lon < -180 || lon > 180) {
    return emptyResult("info", `Cannot evaluate: lon=${lon} out of range [-180, 180].`);
  }
  const months = startMonth <= endMonth ? Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i) : [
    ...Array.from({ length: 13 - startMonth }, (_, i) => startMonth + i),
    ...Array.from({ length: endMonth }, (_, i) => 1 + i)
  ];
  const tzOffset = _nullishCoalesce(timezoneOffsetH, () => ( Math.round(lon / 15)));
  const solarHourOffset = lon / 15 - tzOffset;
  const positiveAlts = [];
  let overallMin = [90, 0, 0, 0];
  let samples = 0;
  const nMonths = months.length;
  for (let idx = 0; idx < nMonths; idx++) {
    const m = months[idx];
    const isFirst = idx === 0;
    const isLast = idx === nMonths - 1;
    const dFirst = isFirst ? startDay : 1;
    const dLast = isLast ? endDay : DAYS_PER_MONTH[m - 1];
    const dStart = Math.max(1, Math.min(dFirst, DAYS_PER_MONTH[m - 1]));
    const dEnd = Math.max(0, Math.min(DAYS_PER_MONTH[m - 1], dLast));
    if (dEnd < dStart) continue;
    for (let d = dStart; d <= dEnd; d++) {
      const dayOfYear = doy(m, d);
      for (let h = startHour; h <= endHour; h++) {
        const solarH = h + solarHourOffset;
        const alt = solarElevationDeg(lat, dayOfYear, solarH);
        samples++;
        if (alt < overallMin[0]) overallMin = [alt, m, d, h];
        if (alt >= 1) positiveAlts.push([alt, m, d, h]);
      }
    }
  }
  if (samples === 0) {
    return emptyResult(
      "info",
      "Cannot evaluate: the supplied date range produced zero samples (startDay exceeds the maximum day for the only month sampled)."
    );
  }
  if (positiveAlts.length === 0) {
    return {
      severity: "info",
      message: `No useful direct sun in the window at lat ${lat.toFixed(2)}\xB0: every sampled hour is below the horizon. The context-buffer warning does not apply because direct sun hours will be approximately zero everywhere.`,
      minSunElevationDeg: overallMin[0],
      minSunElevationMonth: overallMin[1] || null,
      minSunElevationDay: overallMin[2] || null,
      minSunElevationHour: overallMin[3] || null,
      pattern: null,
      bufferBreakevenHeightM: 0,
      shadowAtTypicalBuildingM: Number.POSITIVE_INFINITY,
      shadowAtMaxBuildingM: maxBuildingHeightM !== void 0 ? Number.POSITIVE_INFINITY : null
    };
  }
  let minSample = positiveAlts[0];
  for (const s of positiveAlts) if (s[0] < minSample[0]) minSample = s;
  const [minAlt, mm, md, mh] = minSample;
  const tanAlt = Math.tan(minAlt * Math.PI / 180);
  const breakevenHeight = bufferM * tanAlt;
  const shadowTypical = typicalBuildingHeightM / tanAlt;
  const shadowMax = maxBuildingHeightM !== void 0 ? maxBuildingHeightM / tanAlt : null;
  const pattern = classifyPattern(lat, mm, mh);
  const when = `${String(mm).padStart(2, "0")}-${String(md).padStart(2, "0")} ${String(mh).padStart(2, "0")}:00`;
  const severityHeight = Math.max(typicalBuildingHeightM, _nullishCoalesce(maxBuildingHeightM, () => ( 0)));
  const heightLabel = `${typicalBuildingHeightM.toFixed(0)} m typical` + (maxBuildingHeightM !== void 0 ? ` / ${maxBuildingHeightM.toFixed(0)} m max` : "");
  const ratio = breakevenHeight / severityHeight;
  let severity;
  let message;
  if (ratio >= 1) {
    severity = "ok";
    message = `Context buffer is sufficient. The lowest sun elevation in this window is ${minAlt.toFixed(0)}\xB0 on ${when} (${pattern}); the ${bufferM.toFixed(0)} m buffer covers shadows from buildings up to ${breakevenHeight.toFixed(0)} m, exceeding the configured ${heightLabel}.`;
  } else if (ratio >= 0.5) {
    severity = "marginal";
    message = `Context buffer is borderline. At ${minAlt.toFixed(0)}\xB0 sun on ${when} (${pattern}) the ${bufferM.toFixed(0)} m buffer covers buildings up to ${breakevenHeight.toFixed(0)} m. Buildings taller than ${breakevenHeight.toFixed(0)} m within ${(shadowTypical - bufferM).toFixed(0)} m of a tile edge will lose some shadow context. Cell interiors are reliable; tile edges may show artefacts.`;
  } else if (ratio >= 0.2) {
    severity = "warning";
    message = `Context buffer is too small for the chosen sun angle. At ${minAlt.toFixed(0)}\xB0 on ${when} (${pattern}), ${heightLabel} buildings cast approximately ${shadowTypical.toFixed(0)} m shadows but the buffer is only ${bufferM.toFixed(0)} m. Shadows from buildings up to ${(shadowTypical - bufferM).toFixed(0)} m beyond each tile edge are not modelled. Consider using a 50% tile overlap or restricting the time window to higher-sun hours.`;
  } else {
    severity = "critical";
    message = `Context buffer is severely insufficient. Sun elevation reaches ${minAlt.toFixed(0)}\xB0 on ${when} (${pattern}). The ${bufferM.toFixed(0)} m buffer covers only buildings up to ${breakevenHeight.toFixed(1)} m, well below the configured ${heightLabel}. Most shadow context is missing at tile edges; results are reliable only deep in tile interiors. Recommend either restricting the time window above the horizon or increasing the geometry-context size.`;
  }
  return {
    severity,
    message,
    minSunElevationDeg: minAlt,
    minSunElevationMonth: mm,
    minSunElevationDay: md,
    minSunElevationHour: mh,
    pattern,
    bufferBreakevenHeightM: breakevenHeight,
    shadowAtTypicalBuildingM: shadowTypical,
    shadowAtMaxBuildingM: shadowMax
  };
}
var PreflightWarning = class extends Error {
  constructor(message) {
    super(message);
    this.name = "PreflightWarning";
  }
};

// src/index.ts
var VERSION = "0.12.3";


























































































exports.AnalysesName = _chunkVT2OD2EKcjs.AnalysesName; exports.AnalysisService = _chunkYLCL74AUcjs.AnalysisService; exports.AreaRunError = _chunkROJ27LGGcjs.AreaRunError; exports.AreaTimeoutError = _chunkROJ27LGGcjs.AreaTimeoutError; exports.BigPayloadError = _chunkROJ27LGGcjs.BigPayloadError; exports.BigPayloadFetchError = _chunkROJ27LGGcjs.BigPayloadFetchError; exports.BigPayloadPresignError = _chunkROJ27LGGcjs.BigPayloadPresignError; exports.BigPayloadUploadError = _chunkROJ27LGGcjs.BigPayloadUploadError; exports.BillingService = _chunkX3M4BRMNcjs.BillingService; exports.BuildingsService = BuildingsService; exports.BuildingsServiceError = _chunkROJ27LGGcjs.BuildingsServiceError; exports.DEFAULT_TOKENS_PER_JOB = _chunkX3M4BRMNcjs.DEFAULT_TOKENS_PER_JOB; exports.EPWDataSchema = _chunkVT2OD2EKcjs.EPWDataSchema; exports.ESTIMATED_SECONDS_PER_TILE = _chunkX3M4BRMNcjs.ESTIMATED_SECONDS_PER_TILE; exports.ExecutionConfig = _chunkVT2OD2EKcjs.ExecutionConfig; exports.GroundMaterialsService = GroundMaterialsService; exports.GroundMaterialsServiceError = _chunkROJ27LGGcjs.GroundMaterialsServiceError; exports.HttpClient = _chunkP76CV7YNcjs.HttpClient; exports.InfraredClient = InfraredClient; exports.InfraredError = _chunkROJ27LGGcjs.InfraredError; exports.InfraredJobError = _chunkROJ27LGGcjs.InfraredJobError; exports.InsufficientCreditsError = _chunkROJ27LGGcjs.InsufficientCreditsError; exports.JobFailedError = _chunkROJ27LGGcjs.JobFailedError; exports.JobNotCompletedError = _chunkROJ27LGGcjs.JobNotCompletedError; exports.JobPollError = _chunkROJ27LGGcjs.JobPollError; exports.JobStatus = _chunkA7OZZFK6cjs.JobStatus; exports.JobSubmitError = _chunkROJ27LGGcjs.JobSubmitError; exports.JobTimeoutError = _chunkROJ27LGGcjs.JobTimeoutError; exports.JobsService = _chunkA7OZZFK6cjs.JobsService; exports.LOCATION_ANALYSIS_TYPES = _chunkVT2OD2EKcjs.LOCATION_ANALYSIS_TYPES; exports.LocalCleaner = LocalCleaner; exports.PER_JOB_MODEL_KEYS = _chunkX3M4BRMNcjs.PER_JOB_MODEL_KEYS; exports.PolygonValidationError = _chunkROJ27LGGcjs.PolygonValidationError; exports.PreflightWarning = PreflightWarning; exports.PwcCriteria = _chunkVT2OD2EKcjs.PwcCriteria; exports.RefExpiredRetryExhausted = _chunkROJ27LGGcjs.RefExpiredRetryExhausted; exports.RemoteCleaner = RemoteCleaner; exports.ResultsDownloadError = _chunkROJ27LGGcjs.ResultsDownloadError; exports.SOLAR_TILING_CONFIG = _chunk4GTYZTDZcjs.SOLAR_TILING_CONFIG; exports.SUN_CONTEXT_SEVERITY_LEVELS = SUN_CONTEXT_SEVERITY_LEVELS; exports.TERMINAL_STATUSES = _chunkA7OZZFK6cjs.TERMINAL_STATUSES; exports.THERMAL_WEATHER_FIELDS = _chunkVT2OD2EKcjs.THERMAL_WEATHER_FIELDS; exports.TILING_SUPPORTED_TYPES = _chunkVT2OD2EKcjs.TILING_SUPPORTED_TYPES; exports.ThermalComfortStatisticsSubType = _chunkVT2OD2EKcjs.ThermalComfortStatisticsSubType; exports.TileFailurePhase = _chunk4GTYZTDZcjs.TileFailurePhase; exports.TiledRunError = _chunkROJ27LGGcjs.TiledRunError; exports.TimePeriodSchema = _chunkVT2OD2EKcjs.TimePeriodSchema; exports.VERSION = VERSION; exports.VegetationService = VegetationService; exports.VegetationServiceError = _chunkROJ27LGGcjs.VegetationServiceError; exports.WEBHOOK_EVENT_FAILED = _chunkLGQZVRPYcjs.WEBHOOK_EVENT_FAILED; exports.WEBHOOK_EVENT_RUNNING = _chunkLGQZVRPYcjs.WEBHOOK_EVENT_RUNNING; exports.WEBHOOK_EVENT_SUCCEEDED = _chunkLGQZVRPYcjs.WEBHOOK_EVENT_SUCCEEDED; exports.WIND_ANALYSIS_TYPES = _chunk4GTYZTDZcjs.WIND_ANALYSIS_TYPES; exports.WIND_TILING_CONFIG = _chunk4GTYZTDZcjs.WIND_TILING_CONFIG; exports.WeatherDataUnionSchema = _chunkVT2OD2EKcjs.WeatherDataUnionSchema; exports.WeatherService = _chunkF3IJONJ2cjs.WeatherService; exports.WeatherServiceError = _chunkROJ27LGGcjs.WeatherServiceError; exports.WebhookError = _chunkLGQZVRPYcjs.WebhookError; exports.WebhookNotFoundError = _chunkLGQZVRPYcjs.WebhookNotFoundError; exports.WebhookRegistrationError = _chunkLGQZVRPYcjs.WebhookRegistrationError; exports.WebhooksService = _chunkLGQZVRPYcjs.WebhooksService; exports.bboxFromPoint = bboxFromPoint; exports.buildAuthResolver = buildAuthResolver; exports.cleanV3Local = cleanV3Local; exports.configHash = _chunkVT2OD2EKcjs.configHash; exports.consoleLogger = consoleLogger; exports.contextMarginM = _chunk4GTYZTDZcjs.contextMarginM; exports.createTimePeriodFromFilters = _chunkH6ZH5SHIcjs.createTimePeriodFromFilters; exports.cropStartCells = _chunk4GTYZTDZcjs.cropStartCells; exports.decompressString = _chunkH6ZH5SHIcjs.decompressString; exports.estimateSunContextLoss = estimateSunContextLoss; exports.estimateWorkflowRunTokens = _chunkX3M4BRMNcjs.estimateWorkflowRunTokens; exports.extractWeatherFields = _chunkYLCL74AUcjs.extractWeatherFields; exports.getTilingConfig = _chunk4GTYZTDZcjs.getTilingConfig; exports.gunzipAndDecode = _chunkH6ZH5SHIcjs.gunzipAndDecode; exports.gzipAndEncode = _chunkH6ZH5SHIcjs.gzipAndEncode; exports.jobFromResponse = _chunkA7OZZFK6cjs.jobFromResponse; exports.mergeBuildings = mergeBuildings; exports.parseJobStatus = _chunkA7OZZFK6cjs.parseJobStatus; exports.requiredBufferM = requiredBufferM; exports.resolveBracketName = _chunkX3M4BRMNcjs.resolveBracketName; exports.resolveTokensPerJob = _chunkX3M4BRMNcjs.resolveTokensPerJob; exports.serializeToKebab = _chunkH6ZH5SHIcjs.serializeToKebab; exports.silentLogger = silentLogger; exports.solarElevationDeg = solarElevationDeg; exports.toCamelCase = _chunkH6ZH5SHIcjs.toCamelCase; exports.toKebabCase = _chunkH6ZH5SHIcjs.toKebabCase; exports.webhookEndpointFromResponse = _chunkLGQZVRPYcjs.webhookEndpointFromResponse;
//# sourceMappingURL=index.cjs.map