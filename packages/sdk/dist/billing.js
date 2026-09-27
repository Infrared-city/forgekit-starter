import { requireJson, serviceTransport } from "./internal/service.js";
import { DEFAULT_TOKENS_PER_JOB } from "./pricing.js";
// The two prices live in a leaf module with no imports, so `area/tiling.ts` can
// quote the same number in a cap refusal without pulling the billing service
// into the lean `/tiling` entry point. Re-exported here because `./billing` is
// a published subpath and both names have always been part of it.
export { DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE } from "./pricing.js";
export class BillingService {
    transport;
    constructor(options) {
        this.transport = serviceTransport(options);
    }
    async getPublicPricing() {
        return requireJson(await this.transport.requestJson("/billing/pricing"), "pricing lookup");
    }
}
export const PER_JOB_MODEL_KEYS = Object.freeze({
    "wind-speed": "wind_pix2pix",
    "pedestrian-wind-comfort": "wind_pix2pix",
    "thermal-comfort-index": "utci",
    "thermal-comfort-statistics": "utci",
    "daylight-availability": "daylight_availability",
    "direct-sun-hours": "dsh",
    "solar-radiation": "solar_radiation",
    "sky-view-factors": "svf",
    "daylight-factor": "daylight_factor",
});
function validTokens(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
/** Resolve the actual gateway registry first, then documented legacy fallbacks. */
export function resolveTokensPerJob(pricing, analysisType) {
    const current = pricing.analysisType?.[analysisType]?.tokens;
    if (validTokens(current))
        return current;
    const action = pricing.actionCatalog?.["run-analysis"]?.tokens;
    if (validTokens(action))
        return action;
    const legacy = pricing.perJob?.[PER_JOB_MODEL_KEYS[analysisType]]?.tokens;
    if (validTokens(legacy))
        return legacy;
    const fallback = pricing.perJob?.default?.tokens;
    return validTokens(fallback) ? fallback : DEFAULT_TOKENS_PER_JOB;
}
export function resolveBracketName(pricing, areaKm2) {
    const tiers = Object.entries(pricing.brackets ?? {})
        .filter((entry) => entry[1]?.maxKm2 === null || validTokens(entry[1]?.maxKm2))
        .sort((a, b) => (a[1].maxKm2 ?? Number.POSITIVE_INFINITY) -
        (b[1].maxKm2 ?? Number.POSITIVE_INFINITY));
    return tiers.find(([, tier]) => tier.maxKm2 === null || areaKm2 <= tier.maxKm2)?.[0] ?? null;
}
export function estimateWorkflowRunTokens(pricing, workflowId, areaKm2) {
    const bracket = resolveBracketName(pricing, areaKm2);
    if (bracket === null)
        return null;
    const tokens = pricing.workflows?.[workflowId]?.[bracket];
    return validTokens(tokens) ? { tokens, bracket } : null;
}
