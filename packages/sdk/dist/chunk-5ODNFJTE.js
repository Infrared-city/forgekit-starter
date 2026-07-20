import {
  HttpClient
} from "./chunk-HHRINQ6B.js";

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
  const analysisTypeTokens = pricing.analysisType?.[analysisType]?.tokens;
  if (isValidTokens(analysisTypeTokens)) return analysisTypeTokens;
  const actionTokens = pricing.actionCatalog?.["run-analysis"]?.tokens;
  if (isValidTokens(actionTokens)) return actionTokens;
  const modelKey = PER_JOB_MODEL_KEYS[analysisType];
  const modelTokens = modelKey ? pricing.perJob?.[modelKey]?.tokens : void 0;
  if (isValidTokens(modelTokens)) return modelTokens;
  const defaultTokens = pricing.perJob?.default?.tokens;
  if (isValidTokens(defaultTokens)) return defaultTokens;
  return DEFAULT_TOKENS_PER_JOB;
}
function resolveBracketName(pricing, areaKm2) {
  const brackets = pricing.brackets;
  if (!brackets) return null;
  const tiers = Object.entries(brackets).map(([name, entry]) => ({ name, maxKm2: entry?.maxKm2 })).filter(
    (t) => t.maxKm2 === null || isValidTokens(t.maxKm2)
  ).sort((a, b) => (a.maxKm2 ?? Number.POSITIVE_INFINITY) - (b.maxKm2 ?? Number.POSITIVE_INFINITY));
  for (const tier of tiers) {
    if (tier.maxKm2 === null || areaKm2 <= tier.maxKm2) return tier.name;
  }
  return null;
}
function estimateWorkflowRunTokens(pricing, workflowId, areaKm2) {
  const bracket = resolveBracketName(pricing, areaKm2);
  if (!bracket) return null;
  const tokens = pricing.workflows?.[workflowId]?.[bracket];
  if (!isValidTokens(tokens)) return null;
  return { tokens, bracket };
}

// src/billing/service.ts
var DEFAULT_PRICING_CACHE_TTL_MS = 5 * 60 * 1e3;
var BillingService = class {
  httpClient;
  logger;
  cacheTtlMs;
  cached = null;
  cacheExpiresAt = 0;
  inflight = null;
  constructor(config) {
    this.httpClient = new HttpClient({
      // NO-OP resolver: /billing/pricing is public; sending credentials to a
      // public endpoint would leak them into gateway access logs needlessly.
      getAuthHeaders: async () => ({}),
      baseUrl: config.gatewayBaseUrl,
      logger: config.logger,
      timeout: config.timeout,
      maxRetries: config.maxRetries
    });
    this.logger = config.logger;
    this.cacheTtlMs = config.cacheTtlMs ?? DEFAULT_PRICING_CACHE_TTL_MS;
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
    const forceRefresh = opts?.forceRefresh === true;
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
};

export {
  DEFAULT_TOKENS_PER_JOB,
  ESTIMATED_SECONDS_PER_TILE,
  PER_JOB_MODEL_KEYS,
  resolveTokensPerJob,
  resolveBracketName,
  estimateWorkflowRunTokens,
  BillingService
};
//# sourceMappingURL=chunk-5ODNFJTE.js.map