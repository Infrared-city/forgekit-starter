"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;

var _chunkP76CV7YNcjs = require('./chunk-P76CV7YN.cjs');

// src/billing/pricing.ts
var DEFAULT_TOKENS_PER_JOB = 10;
var ESTIMATED_SECONDS_PER_TILE = 10;
var PER_JOB_MODEL_KEYS = Object.freeze({
  "wind-speed": "wind_pix2pix",
  "pedestrian-wind-comfort": "wind_pix2pix",
  "thermal-comfort-index": "utci",
  "thermal-comfort-statistics": "utci",
  "daylight-availability": "daylight_availability",
  "direct-sun-hours": "dsh",
  "solar-radiation": "solar_radiation",
  "sky-view-factors": "svf"
});
function isValidTokens(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function resolveTokensPerJob(pricing, analysisType) {
  const analysisTypeTokens = _optionalChain([pricing, 'access', _ => _.analysisType, 'optionalAccess', _2 => _2[analysisType], 'optionalAccess', _3 => _3.tokens]);
  if (isValidTokens(analysisTypeTokens)) return analysisTypeTokens;
  const actionTokens = _optionalChain([pricing, 'access', _4 => _4.actionCatalog, 'optionalAccess', _5 => _5["run-analysis"], 'optionalAccess', _6 => _6.tokens]);
  if (isValidTokens(actionTokens)) return actionTokens;
  const modelKey = PER_JOB_MODEL_KEYS[analysisType];
  const modelTokens = modelKey ? _optionalChain([pricing, 'access', _7 => _7.perJob, 'optionalAccess', _8 => _8[modelKey], 'optionalAccess', _9 => _9.tokens]) : void 0;
  if (isValidTokens(modelTokens)) return modelTokens;
  const defaultTokens = _optionalChain([pricing, 'access', _10 => _10.perJob, 'optionalAccess', _11 => _11.default, 'optionalAccess', _12 => _12.tokens]);
  if (isValidTokens(defaultTokens)) return defaultTokens;
  return DEFAULT_TOKENS_PER_JOB;
}
function resolveBracketName(pricing, areaKm2) {
  const brackets = pricing.brackets;
  if (!brackets) return null;
  const tiers = Object.entries(brackets).map(([name, entry]) => ({ name, maxKm2: _optionalChain([entry, 'optionalAccess', _13 => _13.maxKm2]) })).filter(
    (t) => t.maxKm2 === null || isValidTokens(t.maxKm2)
  ).sort((a, b) => (_nullishCoalesce(a.maxKm2, () => ( Number.POSITIVE_INFINITY))) - (_nullishCoalesce(b.maxKm2, () => ( Number.POSITIVE_INFINITY))));
  for (const tier of tiers) {
    if (tier.maxKm2 === null || areaKm2 <= tier.maxKm2) return tier.name;
  }
  return null;
}
function estimateWorkflowRunTokens(pricing, workflowId, areaKm2) {
  const bracket = resolveBracketName(pricing, areaKm2);
  if (!bracket) return null;
  const tokens = _optionalChain([pricing, 'access', _14 => _14.workflows, 'optionalAccess', _15 => _15[workflowId], 'optionalAccess', _16 => _16[bracket]]);
  if (!isValidTokens(tokens)) return null;
  return { tokens, bracket };
}

// src/billing/service.ts
var DEFAULT_PRICING_CACHE_TTL_MS = 5 * 60 * 1e3;
var BillingService = (_class = class {
  
  
  
  __init() {this.cached = null}
  __init2() {this.cacheExpiresAt = 0}
  __init3() {this.inflight = null}
  constructor(config) {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);
    this.httpClient = new (0, _chunkP76CV7YNcjs.HttpClient)({
      // NO-OP resolver: /billing/pricing is public; sending credentials to a
      // public endpoint would leak them into gateway access logs needlessly.
      getAuthHeaders: async () => ({}),
      baseUrl: config.gatewayBaseUrl,
      logger: config.logger,
      timeout: config.timeout,
      maxRetries: config.maxRetries
    });
    this.logger = config.logger;
    this.cacheTtlMs = _nullishCoalesce(config.cacheTtlMs, () => ( DEFAULT_PRICING_CACHE_TTL_MS));
  }
  /**
   * Get the current public pricing document.
   *
   * Serves from a 5-minute TTL cache; concurrent callers share a single
   * in-flight fetch. `forceRefresh: true` bypasses both cache and dedupe.
   *
   * @throws On network / HTTP / malformed-body errors — no silent fallback.
   */
  async getPricing(opts) {
    const forceRefresh = _optionalChain([opts, 'optionalAccess', _17 => _17.forceRefresh]) === true;
    if (!forceRefresh) {
      if (this.cached !== null && Date.now() < this.cacheExpiresAt) {
        return this.cached;
      }
      if (this.inflight !== null) {
        return this.inflight;
      }
    }
    const fetchPromise = (async () => {
      try {
        const data = await this.httpClient.get("/billing/pricing");
        if (data === null || data === void 0 || typeof data !== "object") {
          throw new Error(
            `GET /billing/pricing returned a malformed body (expected object, got ${data === null ? "null" : typeof data})`
          );
        }
        this.cached = data;
        this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
        this.logger.debug({ event: "billing_pricing_fetched", version: data.version });
        return data;
      } finally {
        this.inflight = null;
      }
    })();
    this.inflight = fetchPromise;
    return fetchPromise;
  }
}, _class);









exports.DEFAULT_TOKENS_PER_JOB = DEFAULT_TOKENS_PER_JOB; exports.ESTIMATED_SECONDS_PER_TILE = ESTIMATED_SECONDS_PER_TILE; exports.PER_JOB_MODEL_KEYS = PER_JOB_MODEL_KEYS; exports.resolveTokensPerJob = resolveTokensPerJob; exports.resolveBracketName = resolveBracketName; exports.estimateWorkflowRunTokens = estimateWorkflowRunTokens; exports.BillingService = BillingService;
//# sourceMappingURL=chunk-X3M4BRMN.cjs.map