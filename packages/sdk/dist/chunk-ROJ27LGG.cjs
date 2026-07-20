"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/errors.ts
var InfraredError = class extends Error {
  
  
  constructor(message, opts) {
    super(message, _optionalChain([opts, 'optionalAccess', _ => _.cause]) !== void 0 ? { cause: opts.cause } : void 0);
    this.name = "InfraredError";
    this.statusCode = _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _2 => _2.statusCode]), () => ( 0));
    this.responseBody = _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _3 => _3.responseBody]), () => ( ""));
  }
};
var JobSubmitError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, opts);
    this.name = "JobSubmitError";
    this.retryAfter = _nullishCoalesce(opts.retryAfter, () => ( null));
  }
};
var InsufficientCreditsError = class extends JobSubmitError {
  constructor(message, opts) {
    super(message, { statusCode: 402, responseBody: opts.responseBody, retryAfter: _nullishCoalesce(opts.retryAfter, () => ( null)) });
    this.name = "InsufficientCreditsError";
  }
};
var JobPollError = class extends InfraredError {
  
  
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "JobPollError";
    this.jobId = opts.jobId;
    this.retryAfter = _nullishCoalesce(opts.retryAfter, () => ( null));
  }
};
var JobFailedError = class extends InfraredError {
  
  
  constructor(message, opts) {
    super(message, { statusCode: _nullishCoalesce(opts.statusCode, () => ( 0)), responseBody: _nullishCoalesce(opts.responseBody, () => ( "")) });
    this.name = "JobFailedError";
    this.jobId = opts.jobId;
    this.errorMessage = opts.errorMessage;
  }
};
var JobTimeoutError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, { statusCode: _nullishCoalesce(opts.statusCode, () => ( 0)), responseBody: _nullishCoalesce(opts.responseBody, () => ( "")) });
    this.name = "JobTimeoutError";
    this.jobId = opts.jobId;
  }
};
var ResultsDownloadError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, opts);
    this.name = "ResultsDownloadError";
    this.retryAfter = _nullishCoalesce(opts.retryAfter, () => ( null));
  }
};
var JobNotCompletedError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, { statusCode: _nullishCoalesce(opts.statusCode, () => ( 0)), responseBody: _nullishCoalesce(opts.responseBody, () => ( "")) });
    this.name = "JobNotCompletedError";
    this.jobId = opts.jobId;
  }
};
var PolygonValidationError = class extends InfraredError {
  constructor(message, opts) {
    super(message, { statusCode: _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _4 => _4.statusCode]), () => ( 0)), responseBody: _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _5 => _5.responseBody]), () => ( "")) });
    this.name = "PolygonValidationError";
  }
};
var InfraredJobError = class extends InfraredError {
  constructor(message, opts) {
    super(message, opts);
    this.name = "InfraredJobError";
  }
};
for (const Cls of [
  JobSubmitError,
  JobPollError,
  JobFailedError,
  JobTimeoutError,
  JobNotCompletedError,
  ResultsDownloadError
]) {
  Object.setPrototypeOf(Cls.prototype, InfraredJobError.prototype);
}
var AreaRunError = class extends InfraredError {
  
  
  
  constructor(message, opts) {
    super(message);
    this.name = "AreaRunError";
    this.failedJobs = opts.failedJobs;
    this.skippedJobs = opts.skippedJobs;
    this.totalJobs = opts.totalJobs;
  }
};
var AreaTimeoutError = class extends InfraredError {
  // Typed as `unknown` here to avoid a circular import with tiling/types;
  // callers should narrow to `AreaState`.
  
  constructor(message, opts) {
    super(message);
    this.name = "AreaTimeoutError";
    this.areaState = opts.areaState;
  }
};
var TiledRunError = class extends InfraredError {
  
  
  constructor(message, opts) {
    super(message);
    this.name = "TiledRunError";
    this.tileId = opts.tileId;
    this.cause = opts.cause;
  }
};
var WeatherServiceError = class extends InfraredError {
  
  
  constructor(message, opts) {
    super(message, {
      statusCode: opts.statusCode,
      responseBody: opts.responseBody,
      cause: opts.cause
    });
    this.name = "WeatherServiceError";
    this.operation = opts.operation;
    this.retryAfter = _nullishCoalesce(opts.retryAfter, () => ( null));
  }
};
var BuildingsServiceError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "BuildingsServiceError";
    this.operation = opts.operation;
  }
};
var VegetationServiceError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "VegetationServiceError";
    this.operation = opts.operation;
  }
};
var GroundMaterialsServiceError = class extends InfraredError {
  
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "GroundMaterialsServiceError";
    this.operation = opts.operation;
  }
};
var BigPayloadError = class extends InfraredError {
  constructor(message, opts) {
    super(message, opts);
    this.name = "BigPayloadError";
  }
};
var BigPayloadPresignError = class extends BigPayloadError {
  constructor(message, opts) {
    super(message, opts);
    this.name = "BigPayloadPresignError";
  }
};
var BigPayloadUploadError = class extends BigPayloadError {
  constructor(message, opts) {
    super(message, opts);
    this.name = "BigPayloadUploadError";
  }
};
var BigPayloadFetchError = class extends BigPayloadError {
  
  constructor(code, message, opts) {
    super(message, opts);
    this.name = "BigPayloadFetchError";
    this.code = code;
  }
};
var RefExpiredRetryExhausted = class extends BigPayloadFetchError {
  constructor(message, opts) {
    super("REF_EXPIRED", message, opts);
    this.name = "RefExpiredRetryExhausted";
  }
};
























exports.InfraredError = InfraredError; exports.JobSubmitError = JobSubmitError; exports.InsufficientCreditsError = InsufficientCreditsError; exports.JobPollError = JobPollError; exports.JobFailedError = JobFailedError; exports.JobTimeoutError = JobTimeoutError; exports.ResultsDownloadError = ResultsDownloadError; exports.JobNotCompletedError = JobNotCompletedError; exports.PolygonValidationError = PolygonValidationError; exports.InfraredJobError = InfraredJobError; exports.AreaRunError = AreaRunError; exports.AreaTimeoutError = AreaTimeoutError; exports.TiledRunError = TiledRunError; exports.WeatherServiceError = WeatherServiceError; exports.BuildingsServiceError = BuildingsServiceError; exports.VegetationServiceError = VegetationServiceError; exports.GroundMaterialsServiceError = GroundMaterialsServiceError; exports.BigPayloadError = BigPayloadError; exports.BigPayloadPresignError = BigPayloadPresignError; exports.BigPayloadUploadError = BigPayloadUploadError; exports.BigPayloadFetchError = BigPayloadFetchError; exports.RefExpiredRetryExhausted = RefExpiredRetryExhausted;
//# sourceMappingURL=chunk-ROJ27LGG.cjs.map