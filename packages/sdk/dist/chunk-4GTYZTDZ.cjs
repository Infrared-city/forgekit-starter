"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;


var _chunkVT2OD2EKcjs = require('./chunk-VT2OD2EK.cjs');



var _chunkH6ZH5SHIcjs = require('./chunk-H6ZH5SHI.cjs');


var _chunkROJ27LGGcjs = require('./chunk-ROJ27LGG.cjs');

// src/tiling/config.ts
function cropStartCells(config) {
  return Math.floor((config.inferenceSizeCells - config.stepCells) / 2);
}
function contextMarginM(config) {
  return (config.contextSizeM - config.inferenceSizeM) / 2;
}
var WIND_TILING_CONFIG = Object.freeze({
  inferenceSizeM: 512,
  inferenceSizeCells: 512,
  contextSizeM: 512,
  stepM: 256,
  stepCells: 256,
  cellSizeM: 1
});
var SOLAR_TILING_CONFIG = Object.freeze({
  inferenceSizeM: 512,
  inferenceSizeCells: 512,
  contextSizeM: 666,
  stepM: 512,
  stepCells: 512,
  cellSizeM: 1
});
var WIND_ANALYSIS_TYPES = /* @__PURE__ */ new Set([
  _chunkVT2OD2EKcjs.AnalysesName.WindSpeed,
  _chunkVT2OD2EKcjs.AnalysesName.PedestrianWindComfort
]);
function getTilingConfig(analysisType) {
  if (analysisType && !WIND_ANALYSIS_TYPES.has(analysisType)) {
    return SOLAR_TILING_CONFIG;
  }
  return WIND_TILING_CONFIG;
}

// src/tiling/executor.ts
var _mitt = require('mitt'); var _mitt2 = _interopRequireDefault(_mitt);
var _plimit = require('p-limit'); var _plimit2 = _interopRequireDefault(_plimit);
var DEFAULT_MAX_WORKERS = 20;
var DEFAULT_MAX_RETRIES = 2;
var DEFAULT_TILE_TIMEOUT_MS = 18e4;
var DEFAULT_TOTAL_TIMEOUT_MS = 6e5;
var RETRY_BACKOFF_BASE_MS = 1e3;
var RETRY_BACKOFF_CAP_MS = 1e4;
var TileTimeoutError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TileTimeoutError";
  }
};
var TileExecutor = (_class = class {
  
  
  
  
  
  
  
  __init() {this.emitter = _mitt2.default.call(void 0, )}
  constructor(config = {}) {;_class.prototype.__init.call(this);
    const maxWorkers = _nullishCoalesce(config.maxWorkers, () => ( DEFAULT_MAX_WORKERS));
    const maxRetries = _nullishCoalesce(config.maxRetries, () => ( DEFAULT_MAX_RETRIES));
    const tileTimeoutMs = _nullishCoalesce(config.tileTimeoutMs, () => ( DEFAULT_TILE_TIMEOUT_MS));
    const totalTimeoutMs = _nullishCoalesce(config.totalTimeoutMs, () => ( DEFAULT_TOTAL_TIMEOUT_MS));
    if (maxWorkers < 1) {
      throw new Error(`maxWorkers must be >= 1, got ${maxWorkers}`);
    }
    if (maxRetries < 0) {
      throw new Error(`maxRetries must be >= 0, got ${maxRetries}`);
    }
    if (tileTimeoutMs <= 0) {
      throw new Error(`tileTimeoutMs must be > 0, got ${tileTimeoutMs}`);
    }
    if (totalTimeoutMs <= 0) {
      throw new Error(`totalTimeoutMs must be > 0, got ${totalTimeoutMs}`);
    }
    this.maxWorkers = maxWorkers;
    this.maxRetries = maxRetries;
    this.tileTimeoutMs = tileTimeoutMs;
    this.totalTimeoutMs = totalTimeoutMs;
    this.retryBackoffBaseMs = _nullishCoalesce(config.retryBackoffBaseMs, () => ( RETRY_BACKOFF_BASE_MS));
    this.retryBackoffCapMs = _nullishCoalesce(config.retryBackoffCapMs, () => ( RETRY_BACKOFF_CAP_MS));
    this.onProgress = config.onProgress;
  }
  /** Subscribe to tile execution events. */
  on(event, handler) {
    this.emitter.on(event, handler);
  }
  /** Unsubscribe from tile execution events. */
  off(event, handler) {
    this.emitter.off(event, handler);
  }
  /**
   * Execute all tile jobs concurrently with concurrency limiting.
   *
   * Each job is retried up to `maxRetries` times with exponential backoff.
   * Timeout errors are never retried (the hung job may still be running).
   *
   * If the total timeout elapses, remaining jobs are aborted and the
   * partial results collected so far are returned (with `timedOut: true`).
   * The returned result is a snapshot -- late-finishing jobs cannot mutate it
   * and no further events are emitted after execute() returns.
   *
   * @param jobs - Array of tile jobs to execute.
   * @returns Aggregated execution result. Check `timedOut` to detect partial results.
   */
  async execute(jobs) {
    const startTime = performance.now();
    const limit = _plimit2.default.call(void 0, this.maxWorkers);
    const totalCount = jobs.length;
    const ctx = {
      closed: false,
      completedCount: 0,
      failedCount: 0,
      collectedResults: []
    };
    const totalController = new AbortController();
    try {
      const promises = jobs.map(
        (job) => limit(() => this.executeWithRetry(job, totalController.signal, ctx, totalCount, startTime))
      );
      await raceTimeout(
        Promise.allSettled(promises),
        this.totalTimeoutMs,
        "Total execution timeout exceeded"
      );
      ctx.closed = true;
      return this.buildResult([...ctx.collectedResults], totalCount, startTime, false);
    } catch (error) {
      if (!(error instanceof TileTimeoutError)) {
        throw error;
      }
      ctx.closed = true;
      totalController.abort();
      const snapshot = [...ctx.collectedResults];
      const finishedTileIds = new Set(snapshot.map((r) => r.tileId));
      for (const job of jobs) {
        if (!finishedTileIds.has(job.tileId)) {
          snapshot.push({
            tileId: job.tileId,
            row: job.row,
            col: job.col,
            success: false,
            error: "Total timeout exceeded"
          });
        }
      }
      return this.buildResult(snapshot, totalCount, startTime, true);
    }
  }
  // -- Private helpers -------------------------------------------------------
  /** Build an ExecutionResult from the collected per-tile results. */
  buildResult(results, totalCount, startTime, timedOut) {
    const failures = [];
    for (const result of results) {
      if (!result.success) {
        failures.push({
          tileId: result.tileId,
          row: result.row,
          col: result.col,
          error: _nullishCoalesce(result.error, () => ( "Unknown error")),
          exception: result.exception
        });
      }
    }
    return {
      results,
      failures,
      completedCount: results.filter((r) => r.success).length,
      failedCount: failures.length,
      totalCount,
      executionTime: (performance.now() - startTime) / 1e3,
      timedOut
    };
  }
  /**
   * Execute a single tile job with retry and per-tile timeout.
   *
   * Per-tile timeout is enforced via `Promise.race` so that even jobs
   * ignoring the AbortSignal are guaranteed to time out.
   *
   * Timeout errors (`TileTimeoutError`) are never retried because the
   * hung job may still be running in the background, and retrying would
   * cause duplicate concurrent executions with potential side effects.
   *
   * All event emissions and progress callbacks are gated on `ctx.closed`
   * to prevent events after execute() has returned.
   */
  async executeWithRetry(job, totalSignal, ctx, totalCount, startTime) {
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (totalSignal.aborted || ctx.closed) {
        const result2 = {
          tileId: job.tileId,
          row: job.row,
          col: job.col,
          success: false,
          error: "Total timeout exceeded"
        };
        this.recordResult(ctx, result2, false, job, totalCount, startTime);
        return result2;
      }
      if (attempt === 0) {
        if (!ctx.closed) {
          this.safeEmit("tile.started", {
            tileId: job.tileId,
            row: job.row,
            col: job.col
          });
        }
      } else {
        const delay = this.computeRetryDelay(attempt);
        if (!ctx.closed) {
          this.safeEmit("tile.retrying", {
            tileId: job.tileId,
            row: job.row,
            col: job.col,
            attempt,
            delay
          });
        }
        await sleep(delay);
      }
      const tileController = new AbortController();
      const totalAbortHandler = () => tileController.abort();
      totalSignal.addEventListener("abort", totalAbortHandler, { once: true });
      try {
        const value = await raceTimeout(
          job.execute(tileController.signal),
          this.tileTimeoutMs,
          `Tile ${job.tileId} timed out after ${this.tileTimeoutMs}ms`
        );
        if (!ctx.closed) {
          this.safeEmit("tile.completed", {
            tileId: job.tileId,
            row: job.row,
            col: job.col,
            result: value
          });
        }
        const result2 = {
          tileId: job.tileId,
          row: job.row,
          col: job.col,
          success: true,
          result: value
        };
        this.recordResult(ctx, result2, true, job, totalCount, startTime);
        return result2;
      } catch (error) {
        if (error instanceof TileTimeoutError) {
          tileController.abort();
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        const isTimeout = error instanceof TileTimeoutError;
        if (!isTimeout && attempt < this.maxRetries) {
          continue;
        }
        if (!ctx.closed) {
          this.safeEmit("tile.failed", {
            tileId: job.tileId,
            row: job.row,
            col: job.col,
            error: lastError.message
          });
        }
        const result2 = {
          tileId: job.tileId,
          row: job.row,
          col: job.col,
          success: false,
          error: lastError.message,
          exception: lastError
        };
        this.recordResult(ctx, result2, false, job, totalCount, startTime);
        return result2;
      } finally {
        totalSignal.removeEventListener("abort", totalAbortHandler);
      }
    }
    const result = {
      tileId: job.tileId,
      row: job.row,
      col: job.col,
      success: false,
      error: _nullishCoalesce(_optionalChain([lastError, 'optionalAccess', _ => _.message]), () => ( "Unknown error")),
      exception: lastError
    };
    this.recordResult(ctx, result, false, job, totalCount, startTime);
    return result;
  }
  /**
   * Record a tile result into the execution context (if not closed).
   * Also emits progress callback.
   */
  recordResult(ctx, result, success, job, totalCount, startTime) {
    if (ctx.closed) return;
    if (success) {
      ctx.completedCount++;
    } else {
      ctx.failedCount++;
    }
    ctx.collectedResults.push(result);
    this.safeEmitProgress(
      job,
      success ? "completed" : "failed",
      ctx.completedCount,
      ctx.failedCount,
      totalCount,
      startTime
    );
  }
  /**
   * Compute retry delay with exponential backoff + jitter.
   *
   * delay = min(cap, base * 2^attempt) * random(0.5, 1.0)
   */
  computeRetryDelay(attempt) {
    const exponential = Math.min(this.retryBackoffCapMs, this.retryBackoffBaseMs * 2 ** attempt);
    const jitter = 0.5 + Math.random() * 0.5;
    return exponential * jitter;
  }
  /**
   * Emit a mitt event, catching any exceptions thrown by listeners.
   * Observer errors must not affect tile execution semantics.
   */
  safeEmit(event, data) {
    try {
      this.emitter.emit(event, data);
    } catch (e) {
    }
  }
  /**
   * Emit progress via callback (best-effort).
   *
   * `finishedCount` tracks how many tiles have reached a terminal state
   * (completed + failed), while `status` indicates the individual tile's outcome.
   *
   * Catches any exceptions thrown by the callback so observer errors
   * never change tile execution semantics.
   */
  safeEmitProgress(job, status, completed, failed, total, startTime) {
    if (!this.onProgress) return;
    try {
      const progress = {
        tileId: job.tileId,
        row: job.row,
        col: job.col,
        status,
        completedCount: completed,
        totalCount: total,
        finishedCount: completed + failed,
        elapsedTime: (performance.now() - startTime) / 1e3
      };
      this.onProgress(progress);
    } catch (e2) {
    }
  }
}, _class);
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function raceTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new TileTimeoutError(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

// src/tiling/types.ts
function getNonEmptyTiles(grid) {
  const result = [];
  for (let row = 0; row < grid.tiles.length; row++) {
    const rowTiles = grid.tiles[row];
    for (let col = 0; col < rowTiles.length; col++) {
      const tile = rowTiles[col];
      if (!tile.empty) {
        result.push({ row, col, tile });
      }
    }
  }
  return result;
}
var TileFailurePhase = {
  Submit: "submit",
  Compute: "compute",
  Download: "download",
  Skipped: "skipped"
};
var TILE_SIZE_M = 512;
var TILE_SIZE_CELLS = 512;
var CELL_SIZE_M = 1;
var MAX_NON_EMPTY_TILES = 100;
var METERS_PER_DEG_LAT = 111320;
function freezeScheduleJobs(input) {
  const map = new Map(input);
  const proxy = new Proxy(map, {
    get(target, prop) {
      if (prop === "set" || prop === "delete" || prop === "clear") {
        return () => {
          throw new TypeError(
            `AreaSchedule.jobs is frozen \u2014 cannot ${String(prop)}. Use runArea() to produce a new schedule.`
          );
        };
      }
      if (prop === "forEach") {
        return function(cb, thisArg) {
          target.forEach((v, k) => cb.call(thisArg, v, k, proxy));
        };
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    set() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    },
    deleteProperty() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    },
    defineProperty() {
      throw new TypeError("AreaSchedule.jobs is frozen");
    }
  });
  return proxy;
}
function freezeAreaSchedule(schedule) {
  if (Object.isFrozen(schedule)) return schedule;
  const frozenJobs = schedule.jobs instanceof Map ? freezeScheduleJobs(schedule.jobs) : schedule.jobs;
  return Object.freeze({
    ...schedule,
    jobs: frozenJobs
  });
}
function areaScheduleToJSON(schedule) {
  return {
    jobs: Array.from(schedule.jobs.entries()),
    polygon: schedule.polygon,
    configHash: schedule.configHash,
    tilePositions: schedule.tilePositions,
    gridShape: schedule.gridShape,
    analysisType: schedule.analysisType,
    failedSubmissions: schedule.failedSubmissions,
    submissionAbortStatus: schedule.submissionAbortStatus
  };
}
function areaScheduleFromJSON(json) {
  return freezeAreaSchedule({
    jobs: new Map(json.jobs),
    polygon: json.polygon,
    configHash: json.configHash,
    tilePositions: json.tilePositions,
    gridShape: json.gridShape,
    analysisType: json.analysisType,
    failedSubmissions: json.failedSubmissions,
    submissionAbortStatus: _nullishCoalesce(json.submissionAbortStatus, () => ( null))
  });
}
function computeAreaState(schedule) {
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  let pending = 0;
  let running = 0;
  for (const job of schedule.jobs.values()) {
    switch (job.status) {
      case "completed":
        completed++;
        break;
      case "failed":
        failed++;
        break;
      case "skipped":
        skipped++;
        break;
      case "pending":
        pending++;
        break;
      case "running":
        running++;
        break;
    }
  }
  const total = schedule.jobs.size;
  return {
    totalCount: total,
    completedCount: completed,
    failedCount: failed,
    skippedCount: skipped,
    pendingCount: pending,
    runningCount: running,
    isComplete: pending === 0 && running === 0
  };
}
function areaResultToJSON(result) {
  const [height, width] = result.gridShape;
  const expectedLength = height * width;
  if (result.mergedGrid.length < expectedLength) {
    throw new Error(
      `mergedGrid length ${result.mergedGrid.length} is less than gridShape ${height}x${width} = ${expectedLength}`
    );
  }
  const grid = [];
  for (let r = 0; r < height; r++) {
    const row = [];
    for (let c = 0; c < width; c++) {
      const val = result.mergedGrid[r * width + c];
      row.push(Number.isNaN(val) ? null : val);
    }
    grid.push(row);
  }
  return {
    mergedGrid: grid,
    gridShape: result.gridShape,
    failedJobs: result.failedJobs,
    skippedJobs: result.skippedJobs,
    executionTime: result.executionTime,
    failedTiles: result.failedTiles,
    bounds: result.bounds
  };
}
function areaResultFromJSON(json) {
  const [height, width] = json.gridShape;
  const grid = new Float64Array(height * width);
  for (let r = 0; r < height; r++) {
    const row = json.mergedGrid[r];
    for (let c = 0; c < width; c++) {
      const val = row[c];
      grid[r * width + c] = val === null ? NaN : val;
    }
  }
  return {
    mergedGrid: grid,
    gridShape: json.gridShape,
    failedJobs: json.failedJobs,
    skippedJobs: json.skippedJobs,
    executionTime: json.executionTime,
    // Legacy payloads predating #158 lack `failedTiles` → default to [] (mirrors
    // Python `from_dict`'s `data.get("failed_tiles", [])`). `bounds` stays
    // undefined when absent (Python's `None`).
    failedTiles: _nullishCoalesce(json.failedTiles, () => ( [])),
    bounds: json.bounds
  };
}
function areaResultToBinary(result) {
  const bytes = new Uint8Array(
    result.mergedGrid.buffer,
    result.mergedGrid.byteOffset,
    result.mergedGrid.byteLength
  );
  const CHUNK_SIZE = 8192;
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    const slice = bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, bytes.length));
    chunks.push(String.fromCharCode.apply(null, slice));
  }
  return btoa(chunks.join(""));
}
function areaResultFromBinary(base64, gridShape) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const expectedBytes = gridShape[0] * gridShape[1] * 8;
  if (bytes.length !== expectedBytes) {
    throw new Error(
      `Binary data size mismatch: expected ${expectedBytes} bytes for grid ${gridShape[0]}x${gridShape[1]}, got ${bytes.length} bytes`
    );
  }
  return new Float64Array(bytes.buffer);
}

// src/tiling/validation.ts
function validatePolygon(geojson) {
  if (typeof geojson !== "object" || geojson === null || Array.isArray(geojson)) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      `Polygon must be an object, got ${Array.isArray(geojson) ? "array" : typeof geojson}`
    );
  }
  const obj = geojson;
  if (!("type" in obj)) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)("Missing 'type' field in GeoJSON object");
  }
  if (!("coordinates" in obj)) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)("Missing 'coordinates' field in GeoJSON object");
  }
  if (obj.type !== "Polygon") {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      `Expected type 'Polygon', got '${String(obj.type)}'. MultiPolygon and other types are not supported.`
    );
  }
  const coordinates = obj.coordinates;
  if (!Array.isArray(coordinates)) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)("Coordinates must be a list of rings");
  }
  if (coordinates.length !== 1) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      `Only single-ring polygons are supported (no holes). Got ${coordinates.length} ring(s).`
    );
  }
  const ring = coordinates[0];
  if (!Array.isArray(ring)) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)("Ring must be a list of [lon, lat] positions");
  }
  if (ring.length < 4) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      `Ring must have at least 4 positions (3 unique vertices + closing vertex), got ${ring.length}`
    );
  }
  for (let i = 0; i < ring.length; i++) {
    const pos = ring[i];
    if (!Array.isArray(pos) || pos.length < 2) {
      throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
        `Position ${i} must be a [lon, lat] array, got ${JSON.stringify(pos)}`
      );
    }
  }
  const positions = ring;
  const first = positions[0];
  const last = positions[positions.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      `Ring is not closed: first position [${first[0]}, ${first[1]}] != last position [${last[0]}, ${last[1]}]`
    );
  }
  for (let i = 0; i < positions.length; i++) {
    const lon = positions[i][0];
    const lat = positions[i][1];
    if (lon < -180 || lon > 180) {
      throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(`Position ${i}: longitude ${lon} out of range [-180, 180]`);
    }
    if (lat < -90 || lat > 90) {
      throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(`Position ${i}: latitude ${lat} out of range [-90, 90]`);
    }
  }
  const edges = ringToEdges(positions);
  checkSelfIntersection(edges);
  const area = signedArea(positions);
  if (area === 0) {
    throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
      "Polygon has zero area (collinear or duplicate vertices)"
    );
  }
  if (area < 0) {
    const reversedRing = [...positions].reverse();
    return {
      type: "Polygon",
      coordinates: [reversedRing]
    };
  }
  return {
    type: "Polygon",
    coordinates: [positions]
  };
}
function ringToEdges(ring) {
  const n = ring.length - 1;
  const edges = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edges.push([
      [ring[i][0], ring[i][1]],
      [ring[j][0], ring[j][1]]
    ]);
  }
  return edges;
}
function checkSelfIntersection(edges) {
  const n = edges.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) {
        continue;
      }
      const [a, b] = edges[i];
      const [c, d] = edges[j];
      if (segmentsIntersectProper(a, b, c, d)) {
        throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
          `Polygon has self-intersection between edge ${i} ([${a}] -> [${b}]) and edge ${j} ([${c}] -> [${d}])`
        );
      }
    }
  }
}
function cross(ox, oy, ax, ay, bx, by) {
  return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
}
function onSegment(px, py, qx, qy, rx, ry) {
  return Math.min(px, rx) <= qx && qx <= Math.max(px, rx) && Math.min(py, ry) <= qy && qy <= Math.max(py, ry);
}
function segmentsIntersectProper(a, b, c, d) {
  const d1 = cross(a[0], a[1], b[0], b[1], c[0], c[1]);
  const d2 = cross(a[0], a[1], b[0], b[1], d[0], d[1]);
  const d3 = cross(c[0], c[1], d[0], d[1], a[0], a[1]);
  const d4 = cross(c[0], c[1], d[0], d[1], b[0], b[1]);
  if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) {
    return true;
  }
  if (d1 === 0 && onSegment(a[0], a[1], c[0], c[1], b[0], b[1])) return true;
  if (d2 === 0 && onSegment(a[0], a[1], d[0], d[1], b[0], b[1])) return true;
  if (d3 === 0 && onSegment(c[0], c[1], a[0], a[1], d[0], d[1])) return true;
  if (d4 === 0 && onSegment(c[0], c[1], b[0], b[1], d[0], d[1])) return true;
  return false;
}
function signedArea(ring) {
  const n = ring.length - 1;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    area += xi * yj - xj * yi;
  }
  return area / 2;
}

// src/tiling/tiles.ts
var _uuid = require('uuid');
var DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var TILE_NAMESPACE = _uuid.v5.call(void 0, "tiles.infrared.city", DNS_NAMESPACE);
var TileService = class {
  
  
  
  
  
  constructor(options) {
    this.polygon = validatePolygon(options.polygon);
    this.tileSize = { x: TILE_SIZE_M, y: TILE_SIZE_M };
    this.maxNonEmpty = _nullishCoalesce(options.maxTilesOverride, () => ( MAX_NON_EMPTY_TILES));
    this.tilingConfig = options.analysisType ? getTilingConfig(options.analysisType) : WIND_TILING_CONFIG;
    const ring = this.polygon.coordinates[0];
    this.points = ring.slice(0, -1).map((pos) => ({
      latitude: pos[1],
      longitude: pos[0]
    }));
  }
  /**
   * Generate a grid of tiles covering the polygon's bounding box.
   *
   * Returns a TileGrid where tiles[row][col] is a Tile.
   * Row 0 is the southernmost row; column 0 is the westernmost column.
   * Each tile is marked empty=true if it does not intersect the polygon.
   *
   * @throws PolygonValidationError if the number of non-empty tiles exceeds maxNonEmpty.
   */
  generateTilesForPolygon() {
    if (this.points.length === 0) {
      throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)("Polygon has no vertices.");
    }
    const tiles = generateTiles(this.points, this.tileSize, this.tilingConfig.stepM);
    let nonEmpty = 0;
    for (const row of tiles) {
      for (const tile of row) {
        if (!tile.empty) nonEmpty++;
      }
    }
    if (nonEmpty > this.maxNonEmpty) {
      throw new (0, _chunkROJ27LGGcjs.PolygonValidationError)(
        `Polygon produces ${nonEmpty} non-empty tiles, exceeding the limit of ${this.maxNonEmpty}. Use maxTilesOverride to increase the limit.`
      );
    }
    return {
      tiles,
      numRows: tiles.length,
      numCols: tiles.length > 0 ? tiles[0].length : 0,
      polygon: this.polygon,
      // Python parity (commits 00f5f97 / eef3917 on staging): the active
      // tiling config travels with the grid so downstream layer-assignment
      // (vegetation, ground-materials) uses the right stride for solar
      // analyses instead of silently falling back to the wind preset.
      config: this.tilingConfig
    };
  }
};
function pointInPolygon(lat, lng, polygon) {
  const n = polygon.length;
  if (n < 3) return false;
  let inside = false;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const yi = polygon[i].latitude;
    const xi = polygon[i].longitude;
    const yj = polygon[j].latitude;
    const xj = polygon[j].longitude;
    const intersect = yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi;
    if (intersect) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}
function pointInRect(lat, lng, minLat, maxLat, minLng, maxLng) {
  return minLat <= lat && lat <= maxLat && minLng <= lng && lng <= maxLng;
}
function segmentsIntersect(aLat, aLng, bLat, bLng, cLat, cLng, dLat, dLng) {
  function crossProduct(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
  }
  function direction(ax, ay, bx, by, cx, cy) {
    return crossProduct(cx - ax, cy - ay, bx - ax, by - ay);
  }
  const d1 = direction(aLng, aLat, bLng, bLat, cLng, cLat);
  const d2 = direction(aLng, aLat, bLng, bLat, dLng, dLat);
  const d3 = direction(cLng, cLat, dLng, dLat, aLng, aLat);
  const d4 = direction(cLng, cLat, dLng, dLat, bLng, bLat);
  if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) {
    return true;
  }
  function onSegment2(px, py, qx, qy, rx, ry) {
    return Math.min(px, rx) <= qx && qx <= Math.max(px, rx) && Math.min(py, ry) <= qy && qy <= Math.max(py, ry);
  }
  if (d1 === 0 && onSegment2(aLng, aLat, cLng, cLat, bLng, bLat)) return true;
  if (d2 === 0 && onSegment2(aLng, aLat, dLng, dLat, bLng, bLat)) return true;
  if (d3 === 0 && onSegment2(cLng, cLat, aLng, aLat, dLng, dLat)) return true;
  if (d4 === 0 && onSegment2(cLng, cLat, bLng, bLat, dLng, dLat)) return true;
  return false;
}
function rectIntersectsPolygon(minLat, maxLat, minLng, maxLng, polygon) {
  for (const p of polygon) {
    if (pointInRect(p.latitude, p.longitude, minLat, maxLat, minLng, maxLng)) {
      return true;
    }
  }
  const rectCorners = [
    [minLat, minLng],
    [minLat, maxLng],
    [maxLat, maxLng],
    [maxLat, minLng]
  ];
  for (const [lat, lng] of rectCorners) {
    if (pointInPolygon(lat, lng, polygon)) {
      return true;
    }
  }
  const rectEdges = [
    [
      [minLat, minLng],
      [minLat, maxLng]
    ],
    [
      [minLat, maxLng],
      [maxLat, maxLng]
    ],
    [
      [maxLat, maxLng],
      [maxLat, minLng]
    ],
    [
      [maxLat, minLng],
      [minLat, minLng]
    ]
  ];
  const n = polygon.length;
  if (n < 2) return false;
  for (let i = 0; i < n; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % n];
    for (const [r1, r2] of rectEdges) {
      if (segmentsIntersect(
        a.latitude,
        a.longitude,
        b.latitude,
        b.longitude,
        r1[0],
        r1[1],
        r2[0],
        r2[1]
      )) {
        return true;
      }
    }
  }
  return false;
}
function polygonFingerprint(polygon) {
  if (polygon.length === 0) return "";
  return polygon.map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`).join(";");
}
function generateTiles(polygon, tileSize, stepM = WIND_TILING_CONFIG.stepM) {
  const lats = polygon.map((p) => p.latitude);
  const lngs = polygon.map((p) => p.longitude);
  const minLat = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats);
  const maxLat = _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lats);
  const minLng = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lngs);
  const maxLng = _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lngs);
  const metersX = tileSize.x;
  const metersY = tileSize.y;
  if (metersX <= 0 || metersY <= 0) {
    throw new Error("tileSize.x and tileSize.y must be positive");
  }
  const centerLatForScale = (minLat + maxLat) / 2;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(centerLatForScale * Math.PI / 180);
  const stepY = stepM / METERS_PER_DEG_LAT;
  const stepX = metersPerDegLng !== 0 ? stepM / metersPerDegLng : stepM / METERS_PER_DEG_LAT;
  const halfTileY = metersY / 2 / METERS_PER_DEG_LAT;
  const halfTileX = metersPerDegLng !== 0 ? metersX / 2 / metersPerDegLng : metersX / 2 / METERS_PER_DEG_LAT;
  const numRows = Math.max(1, Math.ceil((maxLat - minLat) / stepY));
  const numCols = Math.max(1, Math.ceil((maxLng - minLng) / stepX));
  const fingerprint = polygonFingerprint(polygon);
  const tiles = [];
  for (let row = 0; row < numRows; row++) {
    const rowTiles = [];
    const centerLat = minLat + (row + 0.5) * stepY;
    for (let col = 0; col < numCols; col++) {
      const centerLng = minLng + (col + 0.5) * stepX;
      const centroid = { latitude: centerLat, longitude: centerLng };
      const isInside = pointInPolygon(centerLat, centerLng, polygon);
      let intersects;
      if (!isInside) {
        intersects = rectIntersectsPolygon(
          centerLat - halfTileY,
          centerLat + halfTileY,
          centerLng - halfTileX,
          centerLng + halfTileX,
          polygon
        );
      } else {
        intersects = true;
      }
      const tileId = _uuid.v5.call(void 0, `${fingerprint}:${row}:${col}`, TILE_NAMESPACE);
      rowTiles.push({
        tileId,
        empty: !intersects,
        centroid,
        size: tileSize
      });
    }
    tiles.push(rowTiles);
  }
  return tiles;
}

// src/tiling/transforms.ts
function tileSwOffset(row, col, config = WIND_TILING_CONFIG) {
  const offsetX = (col + 0.5) * config.stepM - config.inferenceSizeM / 2;
  const offsetY = (row + 0.5) * config.stepM - config.inferenceSizeM / 2;
  return [offsetX, offsetY];
}
function computeBuildingCentroid(coords) {
  const numVertices = Math.floor(coords.length / 3);
  if (numVertices === 0) return [0, 0];
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < numVertices; i++) {
    sumX += coords[i * 3];
    sumY += coords[i * 3 + 1];
  }
  return [sumX / numVertices, sumY / numVertices];
}
function computeBuildingBbox(coords) {
  if (coords.length === 0) {
    throw new Error("Cannot compute bbox of an empty coordinate array");
  }
  if (coords.length % 3 !== 0) {
    throw new Error(`Coordinate array length ${coords.length} is not a multiple of 3`);
  }
  let minX = coords[0];
  let minY = coords[1];
  let maxX = coords[0];
  let maxY = coords[1];
  const numVertices = coords.length / 3;
  for (let i = 1; i < numVertices; i++) {
    const x = coords[i * 3];
    const y = coords[i * 3 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}
function transformBuildingCoords(coords, offsetX, offsetY) {
  if (coords.length % 3 !== 0) {
    throw new Error(`Coordinate array length ${coords.length} is not a multiple of 3`);
  }
  const out = new Array(coords.length);
  const numVertices = coords.length / 3;
  for (let i = 0; i < numVertices; i++) {
    out[i * 3] = coords[i * 3] - offsetX;
    out[i * 3 + 1] = coords[i * 3 + 1] - offsetY;
    out[i * 3 + 2] = coords[i * 3 + 2];
  }
  return out;
}
function assignBuildingsToTiles(buildings, tiles, opts = {}) {
  const config = _nullishCoalesce(opts.config, () => ( WIND_TILING_CONFIG));
  const margin = (config.contextSizeM - config.inferenceSizeM) / 2;
  const tileBounds = tiles.map(({ row, col, tile }) => {
    const [swX, swY] = tileSwOffset(row, col, config);
    return {
      tileId: tile.tileId,
      ctxSwX: swX - margin,
      ctxSwY: swY - margin,
      ctxNeX: swX + config.inferenceSizeM + margin,
      ctxNeY: swY + config.inferenceSizeM + margin,
      infSwX: swX,
      infSwY: swY
    };
  });
  const result = {};
  for (const { tile } of tiles) result[tile.tileId] = {};
  for (const [bldgKey, bldgData] of Object.entries(buildings)) {
    const coords = _optionalChain([bldgData, 'optionalAccess', _2 => _2.coordinates]);
    if (!Array.isArray(coords) && !(coords instanceof Float64Array)) {
      const msg = `Building ${JSON.stringify(bldgKey)}: missing or non-sequence coordinates`;
      if (opts.strict) throw new Error(msg);
      continue;
    }
    if (coords.length === 0 || coords.length % 3 !== 0) {
      const msg = `Building ${JSON.stringify(bldgKey)}: empty or invalid coordinates`;
      if (opts.strict) throw new Error(msg);
      continue;
    }
    const [bMinX, bMinY, bMaxX, bMaxY] = computeBuildingBbox(coords);
    for (const tb of tileBounds) {
      if (bMinX < tb.ctxNeX && bMaxX > tb.ctxSwX && bMinY < tb.ctxNeY && bMaxY > tb.ctxSwY) {
        const entry = { ...bldgData };
        entry.coordinates = transformBuildingCoords(coords, tb.infSwX, tb.infSwY);
        result[tb.tileId][bldgKey] = entry;
      }
    }
  }
  return result;
}

// src/tiling/mergerSmart.ts
var DEFAULT_BLEND_PARAMS = {
  recoveryLengthCells: 96,
  handoffOffset: 0.3,
  radialInscribedRadius: 240,
  radialFalloffCells: 24
};
function makeParams(windDirectionDeg, overrides) {
  return {
    ...DEFAULT_BLEND_PARAMS,
    windDirectionDeg,
    ..._nullishCoalesce(overrides, () => ( {}))
  };
}
function windVector(compassDeg) {
  const theta = compassDeg * Math.PI / 180;
  return [-Math.sin(theta), -Math.cos(theta)];
}
function sigmoid(x) {
  if (x >= 0) {
    return 1 / (1 + Math.exp(-x));
  }
  const ex = Math.exp(x);
  return ex / (1 + ex);
}
function baseUpstreamExtent(ts, params) {
  const [wx, wy] = windVector(params.windDirectionDeg);
  const ux = -wx;
  const uy = -wy;
  const out = new Float32Array(ts * ts);
  const eps = 1e-6;
  const fallback = ts * 2;
  for (let r = 0; r < ts; r++) {
    const y = r + 0.5;
    let ty;
    if (Math.abs(uy) < eps) ty = fallback;
    else if (uy > 0) ty = (ts - y) / uy;
    else ty = -y / uy;
    for (let c = 0; c < ts; c++) {
      const x = c + 0.5;
      let tx;
      if (Math.abs(ux) < eps) tx = fallback;
      else if (ux > 0) tx = (ts - x) / ux;
      else tx = -x / ux;
      const t = Math.max(Math.min(tx, ty), 0);
      out[r * ts + c] = t;
    }
  }
  return out;
}
function tileReliabilityMask(ts, params) {
  const tUp = baseUpstreamExtent(ts, params);
  const sigmoidMid = params.handoffOffset * ts;
  const out = new Float32Array(ts * ts);
  const useRadial = params.radialInscribedRadius > 0 && params.radialFalloffCells > 0;
  const half = ts / 2;
  for (let r = 0; r < ts; r++) {
    const dy = r - half;
    for (let c = 0; c < ts; c++) {
      const idx = r * ts + c;
      let w = sigmoid((tUp[idx] - sigmoidMid) / params.recoveryLengthCells);
      w = 0.01 + 0.99 * w;
      if (useRadial) {
        const dx = c - half;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.min(
          1,
          Math.max(
            0,
            (params.radialInscribedRadius - radius) / params.radialFalloffCells
          )
        );
        w *= falloff;
      }
      out[idx] = w;
    }
  }
  return out;
}
function mergeDirectional(tileGrids, numRows, numCols, config, params) {
  const ts = config.inferenceSizeCells;
  const step = config.stepCells;
  const height = numRows * step + (ts - step);
  const width = numCols * step + (ts - step);
  const bestWeight = new Float32Array(height * width);
  bestWeight.fill(-Infinity);
  const out = new Float64Array(height * width);
  out.fill(NaN);
  const tileW = tileReliabilityMask(ts, params);
  for (const entry of tileGrids) {
    const { row, col, grid } = entry;
    if (grid.length !== ts * ts) {
      throw new Error(
        `Tile (${row}, ${col}) grid length ${grid.length} != ${ts * ts} (expected ${ts}\xD7${ts})`
      );
    }
    const r0 = row * step;
    const c0 = col * step;
    for (let i = 0; i < ts; i++) {
      const outRowBase = (r0 + i) * width + c0;
      const tileRowBase = i * ts;
      for (let j = 0; j < ts; j++) {
        const v = grid[tileRowBase + j];
        if (!Number.isFinite(v)) continue;
        const w = tileW[tileRowBase + j];
        const dst = outRowBase + j;
        if (w > bestWeight[dst]) {
          bestWeight[dst] = w;
          out[dst] = v;
        }
      }
    }
  }
  return { grid: out, height, width };
}
function nextPow2(n) {
  if (n <= 1) return 1;
  return 2 ** Math.ceil(Math.log2(n));
}
function fft1d(re, im, inverse) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; (j & bit) !== 0; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      const ti = im[i];
      re[i] = re[j];
      im[i] = im[j];
      re[j] = tr;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = (inverse ? 2 : -2) * Math.PI / len;
    const wlRe = Math.cos(angle);
    const wlIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let k = 0; k < half; k++) {
        const idx1 = i + k;
        const idx2 = idx1 + half;
        const tRe = wRe * re[idx2] - wIm * im[idx2];
        const tIm = wRe * im[idx2] + wIm * re[idx2];
        re[idx2] = re[idx1] - tRe;
        im[idx2] = im[idx1] - tIm;
        re[idx1] += tRe;
        im[idx1] += tIm;
        const newWRe = wRe * wlRe - wIm * wlIm;
        wIm = wRe * wlIm + wIm * wlRe;
        wRe = newWRe;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}
function fft2d(re, im, H, W, inverse) {
  const rowRe = new Float64Array(W);
  const rowIm = new Float64Array(W);
  for (let r = 0; r < H; r++) {
    const base = r * W;
    for (let c = 0; c < W; c++) {
      rowRe[c] = re[base + c];
      rowIm[c] = im[base + c];
    }
    fft1d(rowRe, rowIm, inverse);
    for (let c = 0; c < W; c++) {
      re[base + c] = rowRe[c];
      im[base + c] = rowIm[c];
    }
  }
  const colRe = new Float64Array(H);
  const colIm = new Float64Array(H);
  for (let c = 0; c < W; c++) {
    for (let r = 0; r < H; r++) {
      colRe[r] = re[r * W + c];
      colIm[r] = im[r * W + c];
    }
    fft1d(colRe, colIm, inverse);
    for (let r = 0; r < H; r++) {
      re[r * W + c] = colRe[r];
      im[r * W + c] = colIm[r];
    }
  }
}
function fftConvolveSame(a, aH, aW, b, bH, bW) {
  const fullH = aH + bH - 1;
  const fullW = aW + bW - 1;
  const padH = nextPow2(fullH);
  const padW = nextPow2(fullW);
  const N = padH * padW;
  const aRe = new Float64Array(N);
  const aIm = new Float64Array(N);
  for (let r = 0; r < aH; r++) {
    const src = r * aW;
    const dst = r * padW;
    for (let c = 0; c < aW; c++) aRe[dst + c] = a[src + c];
  }
  fft2d(aRe, aIm, padH, padW, false);
  const bRe = new Float64Array(N);
  const bIm = new Float64Array(N);
  for (let r = 0; r < bH; r++) {
    const src = r * bW;
    const dst = r * padW;
    for (let c = 0; c < bW; c++) bRe[dst + c] = b[src + c];
  }
  fft2d(bRe, bIm, padH, padW, false);
  for (let i = 0; i < N; i++) {
    const re = aRe[i] * bRe[i] - aIm[i] * bIm[i];
    const im = aRe[i] * bIm[i] + aIm[i] * bRe[i];
    aRe[i] = re;
    aIm[i] = im;
  }
  fft2d(aRe, aIm, padH, padW, true);
  const rowStart = Math.floor((fullH - aH) / 2);
  const colStart = Math.floor((fullW - aW) / 2);
  const out = new Float64Array(aH * aW);
  for (let r = 0; r < aH; r++) {
    const src = (rowStart + r) * padW + colStart;
    const dst = r * aW;
    for (let c = 0; c < aW; c++) out[dst + c] = aRe[src + c];
  }
  return out;
}
function l1DistanceToFalse(mask, height, width) {
  const far = height + width + 1;
  const dist = new Float64Array(height * width);
  for (let i = 0; i < mask.length; i++) dist[i] = mask[i] ? far : 0;
  for (let r = 0; r < height; r++) {
    const base = r * width;
    for (let c = 1; c < width; c++) {
      const d = dist[base + c - 1] + 1;
      if (d < dist[base + c]) dist[base + c] = d;
    }
  }
  for (let r = 0; r < height; r++) {
    const base = r * width;
    for (let c = width - 2; c >= 0; c--) {
      const d = dist[base + c + 1] + 1;
      if (d < dist[base + c]) dist[base + c] = d;
    }
  }
  for (let r = 1; r < height; r++) {
    const base = r * width;
    const prev = (r - 1) * width;
    for (let c = 0; c < width; c++) {
      const d = dist[prev + c] + 1;
      if (d < dist[base + c]) dist[base + c] = d;
    }
  }
  for (let r = height - 2; r >= 0; r--) {
    const base = r * width;
    const next = (r + 1) * width;
    for (let c = 0; c < width; c++) {
      const d = dist[next + c] + 1;
      if (d < dist[base + c]) dist[base + c] = d;
    }
  }
  return dist;
}
var DEFAULT_SMOOTH = {
  sigmaStreamwise: 8,
  sigmaCrosswind: 2,
  upstreamShift: 6,
  kernelLength: 24
};
function buildUpstreamKernel(windDirectionDeg, opts) {
  const [wx, wy] = windVector(windDirectionDeg);
  const ux = -wx;
  const uy = -wy;
  const px = -uy;
  const py = ux;
  const K = opts.kernelLength;
  const size = 2 * K + 1;
  const kernel = new Float64Array(size * size);
  let total = 0;
  for (let r = 0; r < size; r++) {
    const yy = r - K;
    for (let c = 0; c < size; c++) {
      const xx = c - K;
      const s = xx * ux + yy * uy;
      const n = xx * px + yy * py;
      const val = Math.exp(
        -((s + opts.upstreamShift) ** 2) / (2 * opts.sigmaStreamwise ** 2) - n * n / (2 * opts.sigmaCrosswind ** 2)
      );
      kernel[r * size + c] = val;
      total += val;
    }
  }
  if (total > 0) for (let i = 0; i < kernel.length; i++) kernel[i] /= total;
  return { kernel, size };
}
function upstreamBiasedSmooth(canvas, H, W, windDirectionDeg, opts = DEFAULT_SMOOTH) {
  const { kernel, size } = buildUpstreamKernel(windDirectionDeg, opts);
  const filled = new Float64Array(H * W);
  const finite = new Float64Array(H * W);
  const isFin = new Uint8Array(H * W);
  for (let i = 0; i < H * W; i++) {
    if (Number.isFinite(canvas[i])) {
      filled[i] = canvas[i];
      finite[i] = 1;
      isFin[i] = 1;
    }
  }
  const num = fftConvolveSame(filled, H, W, kernel, size, size);
  const den = fftConvolveSame(finite, H, W, kernel, size, size);
  const out = new Float64Array(H * W);
  for (let i = 0; i < H * W; i++) {
    if (!isFin[i]) {
      out[i] = NaN;
      continue;
    }
    const d = den[i];
    out[i] = d > 1e-9 ? num[i] / Math.max(d, 1e-9) : NaN;
  }
  return out;
}
function streamingSpread(tileGrids, ts, step, H, W) {
  const tmax = new Float64Array(H * W);
  tmax.fill(-Infinity);
  const tmin = new Float64Array(H * W);
  tmin.fill(Infinity);
  const covered = new Uint8Array(H * W);
  for (const entry of tileGrids) {
    const { row, col, grid } = entry;
    if (grid.length !== ts * ts) continue;
    const r0 = row * step;
    const c0 = col * step;
    let anyFinite = false;
    for (let i = 0; i < ts; i++) {
      const dstBase = (r0 + i) * W + c0;
      const srcBase = i * ts;
      for (let j = 0; j < ts; j++) {
        const v = grid[srcBase + j];
        if (!Number.isFinite(v)) continue;
        anyFinite = true;
        const dst = dstBase + j;
        if (v > tmax[dst]) tmax[dst] = v;
        if (v < tmin[dst]) tmin[dst] = v;
        covered[dst] = 1;
      }
    }
    if (!anyFinite) continue;
  }
  const spread = new Float64Array(H * W);
  for (let i = 0; i < H * W; i++) {
    spread[i] = covered[i] ? tmax[i] - tmin[i] : 0;
  }
  return spread;
}
function mergeTilesSmart(tileGrids, numRows, numCols, config, opts) {
  const ts = config.inferenceSizeCells;
  const step = config.stepCells;
  const finalH = numRows * step;
  const finalW = numCols * step;
  if (tileGrids.length === 0) {
    const empty = new Float64Array(finalH * finalW);
    empty.fill(NaN);
    return { grid: empty, height: finalH, width: finalW };
  }
  const params = makeParams(opts.windDirectionDeg);
  const H = numRows * step + (ts - step);
  const W = numCols * step + (ts - step);
  const spread = streamingSpread(tileGrids, ts, step, H, W);
  const rawFull = mergeDirectional(tileGrids, numRows, numCols, config, params).grid;
  const smooth = upstreamBiasedSmooth(rawFull, H, W, opts.windDirectionDeg, {
    sigmaStreamwise: _nullishCoalesce(opts.sigmaStreamwise, () => ( DEFAULT_SMOOTH.sigmaStreamwise)),
    sigmaCrosswind: _nullishCoalesce(opts.sigmaCrosswind, () => ( DEFAULT_SMOOTH.sigmaCrosswind)),
    upstreamShift: _nullishCoalesce(opts.upstreamShift, () => ( DEFAULT_SMOOTH.upstreamShift)),
    kernelLength: _nullishCoalesce(opts.kernelLength, () => ( DEFAULT_SMOOTH.kernelLength))
  });
  const finiteMask = new Uint8Array(H * W);
  for (let i = 0; i < H * W; i++) {
    finiteMask[i] = Number.isFinite(rawFull[i]) ? 1 : 0;
  }
  const distNan = l1DistanceToFalse(finiteMask, H, W);
  const keepOut = _nullishCoalesce(opts.buildingKeepOut, () => ( 3));
  const threshold = _nullishCoalesce(opts.threshold, () => ( 0.5));
  const thrSafe = Math.max(threshold, 1e-6);
  const keepOutDenom = Math.max(keepOut, 1);
  const out = new Float64Array(finalH * finalW);
  const offset = Math.floor((ts - step) / 2);
  for (let r = 0; r < finalH; r++) {
    const srcR = (offset + r) * W;
    const dstR = r * finalW;
    for (let c = 0; c < finalW; c++) {
      const srcIdx = srcR + offset + c;
      const raw = rawFull[srcIdx];
      if (!Number.isFinite(raw)) {
        out[dstR + c] = raw;
        continue;
      }
      const sm = smooth[srcIdx];
      if (!Number.isFinite(sm)) {
        out[dstR + c] = raw;
        continue;
      }
      const keepOutW = Math.min(
        1,
        Math.max(0, (distNan[srcIdx] - keepOut) / keepOutDenom)
      );
      const disagreeW = Math.min(1, Math.max(0, spread[srcIdx] / thrSafe));
      const w = disagreeW * keepOutW;
      out[dstR + c] = (1 - w) * raw + w * sm;
    }
  }
  return { grid: out, height: finalH, width: finalW };
}

// src/tiling/merger.ts
function mergedGridShape(numRows, numCols, config = WIND_TILING_CONFIG) {
  if (numRows < 1 || numCols < 1) {
    throw new Error(`numRows and numCols must be >= 1, got (${numRows}, ${numCols})`);
  }
  return [numRows * config.stepCells, numCols * config.stepCells];
}
function tileToGridOffset(row, col, config = WIND_TILING_CONFIG) {
  return [row * config.stepCells, col * config.stepCells];
}
function mergeTiles(tileGrids, numRows, numCols, config, opts) {
  const strategy = _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _3 => _3.strategy]), () => ( "default"));
  const windDirectionDeg = _optionalChain([opts, 'optionalAccess', _4 => _4.windDirectionDeg]);
  if (strategy === "directional" || strategy === "directional_blend") {
    if (windDirectionDeg === void 0 || windDirectionDeg === null) {
      throw new Error(`strategy=${JSON.stringify(strategy)} requires windDirectionDeg`);
    }
    if (config === void 0 || config === null) {
      throw new Error(
        `strategy=${JSON.stringify(strategy)} requires an explicit config; pass WIND_TILING_CONFIG for wind-speed analyses.`
      );
    }
    if (strategy === "directional") {
      const ts = config.inferenceSizeCells;
      const step2 = config.stepCells;
      const full = mergeDirectional(tileGrids, numRows, numCols, config, {
        windDirectionDeg,
        recoveryLengthCells: 96,
        handoffOffset: 0.3,
        radialInscribedRadius: 240,
        radialFalloffCells: 24
      });
      const offset = Math.floor((ts - step2) / 2);
      const finalH = numRows * step2;
      const finalW = numCols * step2;
      const out = new Float64Array(finalH * finalW);
      for (let r = 0; r < finalH; r++) {
        const src = (offset + r) * full.width + offset;
        const dst = r * finalW;
        for (let c = 0; c < finalW; c++) out[dst + c] = full.grid[src + c];
      }
      return { grid: out, height: finalH, width: finalW };
    }
    return mergeTilesSmart(tileGrids, numRows, numCols, config, { windDirectionDeg });
  }
  if (strategy !== "default") {
    throw new Error(
      `Unknown merge strategy ${JSON.stringify(strategy)}. Valid values: 'default', 'directional', 'directional_blend'.`
    );
  }
  const cfg = _nullishCoalesce(config, () => ( WIND_TILING_CONFIG));
  const [height, width] = mergedGridShape(numRows, numCols, cfg);
  const merged = new Float64Array(height * width);
  merged.fill(NaN);
  const cropStart = cropStartCells(cfg);
  const step = cfg.stepCells;
  const inferenceSize = cfg.inferenceSizeCells;
  const expectedSize = inferenceSize * inferenceSize;
  for (const entry of tileGrids) {
    const { row, col, grid } = entry;
    if (grid.length !== expectedSize) {
      throw new Error(
        `Tile (${row}, ${col}) grid length ${grid.length} != ${expectedSize} (expected ${inferenceSize}\xD7${inferenceSize})`
      );
    }
    const rStart = row * step;
    const cStart = col * step;
    for (let r = 0; r < step; r++) {
      const tileRow = cropStart + r;
      const mergedRow = rStart + r;
      for (let c = 0; c < step; c++) {
        const tileCol = cropStart + c;
        const value = grid[tileRow * inferenceSize + tileCol];
        if (!Number.isNaN(value)) {
          merged[mergedRow * width + (cStart + c)] = value;
        }
      }
    }
  }
  return { grid: merged, height, width };
}
function clipToPolygon(grid, height, width, polygonMeters, gridOrigin = [0, 0], cellSizeM = 1) {
  const [originX, originY] = gridOrigin;
  const n = polygonMeters.length;
  if (n < 3) {
    grid.fill(NaN);
    return grid;
  }
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  let minY = Infinity;
  let maxY = -Infinity;
  for (let k = 0; k < n; k++) {
    xs[k] = polygonMeters[k][0];
    const y = polygonMeters[k][1];
    ys[k] = y;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const crossings = new Float64Array(n);
  for (let r = 0; r < height; r++) {
    const cy = originY + (r + 0.5) * cellSizeM;
    const rowBase = r * width;
    if (cy < minY || cy > maxY) {
      for (let c = 0; c < width; c++) grid[rowBase + c] = NaN;
      continue;
    }
    let m = 0;
    let j = n - 1;
    for (let i = 0; i < n; i++) {
      const yi = ys[i];
      const yj = ys[j];
      if (yi > cy !== yj > cy) {
        crossings[m++] = (xs[j] - xs[i]) * (cy - yi) / (yj - yi + 1e-12) + xs[i];
      }
      j = i;
    }
    if (m === 0) {
      for (let c = 0; c < width; c++) grid[rowBase + c] = NaN;
      continue;
    }
    for (let c = 0; c < width; c++) {
      const cx = originX + (c + 0.5) * cellSizeM;
      let count = 0;
      for (let k = 0; k < m; k++) {
        if (cx < crossings[k]) count++;
      }
      if ((count & 1) === 0) grid[rowBase + c] = NaN;
    }
  }
  return grid;
}
function projectPolygonToMeters(geojsonPolygon) {
  const ring = geojsonPolygon.coordinates[0];
  let vertices;
  if (ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
    vertices = ring.slice(0, -1);
  } else {
    vertices = ring;
  }
  const lons = vertices.map((v) => v[0]);
  const lats = vertices.map((v) => v[1]);
  const originLon = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lons);
  const originLat = _chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats);
  const centerLat = (_chunkH6ZH5SHIcjs.arrayMin.call(void 0, lats) + _chunkH6ZH5SHIcjs.arrayMax.call(void 0, lats)) / 2;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(centerLat * Math.PI / 180);
  const polygonMeters = vertices.map((v) => [
    (v[0] - originLon) * metersPerDegLng,
    (v[1] - originLat) * METERS_PER_DEG_LAT
  ]);
  return { polygonMeters, originLon, originLat };
}
function gridToList(grid, height, width) {
  const result = new Array(height);
  for (let r = 0; r < height; r++) {
    const base = r * width;
    const row = new Array(width);
    for (let c = 0; c < width; c++) {
      const val = grid[base + c];
      row[c] = val === val ? val : null;
    }
    result[r] = row;
  }
  return result;
}

// src/tiling/orchestrator.ts
function clonePayloadForTile(payload, tile, analysisType) {
  const cloned = typeof structuredClone === "function" ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));
  if (_chunkVT2OD2EKcjs.LOCATION_ANALYSIS_TYPES.includes(analysisType)) {
    cloned.latitude = tile.centroid.latitude;
    cloned.longitude = tile.centroid.longitude;
  }
  return cloned;
}
function extractGrid(result) {
  const expectedSize = TILE_SIZE_CELLS * TILE_SIZE_CELLS;
  const grid = new Float64Array(expectedSize);
  grid.fill(NaN);
  const rawGrid = findGridData(result);
  if (rawGrid === null) {
    throw new Error(
      `No grid data found in analysis result. Expected one of: output, matrix, data. Got keys: ${Object.keys(result).join(", ")}`
    );
  }
  const uniqueCats = /* @__PURE__ */ new Set();
  let needsCategoricalMap = false;
  for (const row of rawGrid) {
    if (!Array.isArray(row)) continue;
    for (const val of row) {
      if (val === null || val === void 0 || val === "") continue;
      if (typeof val === "string" && Number.isNaN(Number(val))) {
        needsCategoricalMap = true;
        uniqueCats.add(val);
      }
    }
  }
  const catMap = needsCategoricalMap ? new Map([...uniqueCats].sort().map((c, i) => [c, i])) : null;
  for (let r = 0; r < rawGrid.length && r < TILE_SIZE_CELLS; r++) {
    const row = rawGrid[r];
    for (let c = 0; c < row.length && c < TILE_SIZE_CELLS; c++) {
      const val = row[c];
      if (val === null || val === void 0 || val === "") continue;
      const mapped = _optionalChain([catMap, 'optionalAccess', _5 => _5.get, 'call', _6 => _6(val)]);
      if (mapped !== void 0) {
        grid[r * TILE_SIZE_CELLS + c] = mapped;
        continue;
      }
      const num = Number(val);
      if (!Number.isNaN(num)) {
        grid[r * TILE_SIZE_CELLS + c] = num;
      }
    }
  }
  return grid;
}
function findGridData(result) {
  const keys = ["output", "matrix", "data"];
  for (const key of keys) {
    const value = result[key];
    if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
      return value;
    }
  }
  return null;
}









































exports.cropStartCells = cropStartCells; exports.contextMarginM = contextMarginM; exports.WIND_TILING_CONFIG = WIND_TILING_CONFIG; exports.SOLAR_TILING_CONFIG = SOLAR_TILING_CONFIG; exports.WIND_ANALYSIS_TYPES = WIND_ANALYSIS_TYPES; exports.getTilingConfig = getTilingConfig; exports.TileExecutor = TileExecutor; exports.getNonEmptyTiles = getNonEmptyTiles; exports.TileFailurePhase = TileFailurePhase; exports.TILE_SIZE_M = TILE_SIZE_M; exports.TILE_SIZE_CELLS = TILE_SIZE_CELLS; exports.CELL_SIZE_M = CELL_SIZE_M; exports.MAX_NON_EMPTY_TILES = MAX_NON_EMPTY_TILES; exports.METERS_PER_DEG_LAT = METERS_PER_DEG_LAT; exports.freezeAreaSchedule = freezeAreaSchedule; exports.areaScheduleToJSON = areaScheduleToJSON; exports.areaScheduleFromJSON = areaScheduleFromJSON; exports.computeAreaState = computeAreaState; exports.areaResultToJSON = areaResultToJSON; exports.areaResultFromJSON = areaResultFromJSON; exports.areaResultToBinary = areaResultToBinary; exports.areaResultFromBinary = areaResultFromBinary; exports.validatePolygon = validatePolygon; exports.TILE_NAMESPACE = TILE_NAMESPACE; exports.TileService = TileService; exports.polygonFingerprint = polygonFingerprint; exports.tileSwOffset = tileSwOffset; exports.computeBuildingCentroid = computeBuildingCentroid; exports.computeBuildingBbox = computeBuildingBbox; exports.transformBuildingCoords = transformBuildingCoords; exports.assignBuildingsToTiles = assignBuildingsToTiles; exports.mergedGridShape = mergedGridShape; exports.tileToGridOffset = tileToGridOffset; exports.mergeTiles = mergeTiles; exports.clipToPolygon = clipToPolygon; exports.projectPolygonToMeters = projectPolygonToMeters; exports.gridToList = gridToList; exports.clonePayloadForTile = clonePayloadForTile; exports.extractGrid = extractGrid;
//# sourceMappingURL=chunk-4GTYZTDZ.cjs.map