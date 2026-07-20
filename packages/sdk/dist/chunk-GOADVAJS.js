// src/errors.ts
var InfraredError = class extends Error {
  statusCode;
  responseBody;
  constructor(message, opts) {
    super(message, opts?.cause !== void 0 ? { cause: opts.cause } : void 0);
    this.name = "InfraredError";
    this.statusCode = opts?.statusCode ?? 0;
    this.responseBody = opts?.responseBody ?? "";
  }
};
var JobSubmitError = class extends InfraredError {
  retryAfter;
  constructor(message, opts) {
    super(message, opts);
    this.name = "JobSubmitError";
    this.retryAfter = opts.retryAfter ?? null;
  }
};
var InsufficientCreditsError = class extends JobSubmitError {
  constructor(message, opts) {
    super(message, { statusCode: 402, responseBody: opts.responseBody, retryAfter: opts.retryAfter ?? null });
    this.name = "InsufficientCreditsError";
  }
};
var JobPollError = class extends InfraredError {
  jobId;
  retryAfter;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "JobPollError";
    this.jobId = opts.jobId;
    this.retryAfter = opts.retryAfter ?? null;
  }
};
var JobFailedError = class extends InfraredError {
  jobId;
  errorMessage;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode ?? 0, responseBody: opts.responseBody ?? "" });
    this.name = "JobFailedError";
    this.jobId = opts.jobId;
    this.errorMessage = opts.errorMessage;
  }
};
var JobTimeoutError = class extends InfraredError {
  jobId;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode ?? 0, responseBody: opts.responseBody ?? "" });
    this.name = "JobTimeoutError";
    this.jobId = opts.jobId;
  }
};
var ResultsDownloadError = class extends InfraredError {
  retryAfter;
  constructor(message, opts) {
    super(message, opts);
    this.name = "ResultsDownloadError";
    this.retryAfter = opts.retryAfter ?? null;
  }
};
var JobNotCompletedError = class extends InfraredError {
  jobId;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode ?? 0, responseBody: opts.responseBody ?? "" });
    this.name = "JobNotCompletedError";
    this.jobId = opts.jobId;
  }
};
var PolygonValidationError = class extends InfraredError {
  constructor(message, opts) {
    super(message, { statusCode: opts?.statusCode ?? 0, responseBody: opts?.responseBody ?? "" });
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
  failedJobs;
  skippedJobs;
  totalJobs;
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
  areaState;
  constructor(message, opts) {
    super(message);
    this.name = "AreaTimeoutError";
    this.areaState = opts.areaState;
  }
};
var TiledRunError = class extends InfraredError {
  tileId;
  cause;
  constructor(message, opts) {
    super(message);
    this.name = "TiledRunError";
    this.tileId = opts.tileId;
    this.cause = opts.cause;
  }
};
var WeatherServiceError = class extends InfraredError {
  operation;
  retryAfter;
  constructor(message, opts) {
    super(message, {
      statusCode: opts.statusCode,
      responseBody: opts.responseBody,
      cause: opts.cause
    });
    this.name = "WeatherServiceError";
    this.operation = opts.operation;
    this.retryAfter = opts.retryAfter ?? null;
  }
};
var BuildingsServiceError = class extends InfraredError {
  operation;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "BuildingsServiceError";
    this.operation = opts.operation;
  }
};
var VegetationServiceError = class extends InfraredError {
  operation;
  constructor(message, opts) {
    super(message, { statusCode: opts.statusCode, responseBody: opts.responseBody });
    this.name = "VegetationServiceError";
    this.operation = opts.operation;
  }
};
var GroundMaterialsServiceError = class extends InfraredError {
  operation;
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
  code;
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

export {
  InfraredError,
  JobSubmitError,
  InsufficientCreditsError,
  JobPollError,
  JobFailedError,
  JobTimeoutError,
  ResultsDownloadError,
  JobNotCompletedError,
  PolygonValidationError,
  InfraredJobError,
  AreaRunError,
  AreaTimeoutError,
  TiledRunError,
  WeatherServiceError,
  BuildingsServiceError,
  VegetationServiceError,
  GroundMaterialsServiceError,
  BigPayloadError,
  BigPayloadPresignError,
  BigPayloadUploadError,
  BigPayloadFetchError,
  RefExpiredRetryExhausted
};
//# sourceMappingURL=chunk-GOADVAJS.js.map