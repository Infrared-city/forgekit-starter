import { requireJson, serviceTransport } from "./internal/service.js";
import { DEFAULT_TOKENS_PER_JOB } from "./pricing.js";
// The two prices live in a leaf module with no imports, so `area/tiling.ts` can
// quote the same number in a cap refusal without pulling the billing service
// into the lean `/tiling` entry point. Re-exported here because `./billing` is
// a published subpath and both names have always been part of it.
export { DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE } from "./pricing.js";
/**
 * Reads the API's public price list. Available as `InfraredClient.billing`.
 *
 * @category Billing
 */
export class BillingService {
    transport;
    /** Creates the service from the client's base URL, credentials and transport settings. */
    constructor(options) {
        this.transport = serviceTransport(options);
    }
    /**
     * Fetches the current public price list.
     *
     * @returns The `PublicPricing` document.
     * @throws Error when the API returns an empty response, or the request fails.
     */
    async getPublicPricing() {
        return requireJson(await this.transport.requestJson("/billing/pricing"), "pricing lookup");
    }
}
/**
 * For each analysis, the key of its entry in the older `perJob` section of
 * `PublicPricing`. Several analyses can share one key.
 *
 * @category Billing
 */
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
/**
 * The tokens one job of an analysis costs, according to a price list.
 *
 * The price listed for the analysis wins. When there is none, the
 * `run-analysis` action price is used, then the older `perJob` entries (the
 * analysis's own, then `default`), and finally `DEFAULT_TOKENS_PER_JOB`.
 * Entries that are not finite, non-negative numbers are skipped.
 *
 * @param pricing - The price list from `BillingService.getPublicPricing`.
 * @param analysisType - The analysis to price.
 * @returns Tokens for one job.
 *
 * @category Billing
 */
// Maintainer note (not published): resolve the actual gateway registry first,
// then documented legacy fallbacks.
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
/**
 * The name of the area bracket that an area falls in, according to a price
 * list. Brackets are checked from the smallest upper limit up, and a bracket
 * with no upper limit matches any area.
 *
 * @param pricing - The price list from `BillingService.getPublicPricing`.
 * @param areaKm2 - The area in square kilometres.
 * @returns The bracket name, or `null` when the price list has no bracket that fits.
 *
 * @category Billing
 */
export function resolveBracketName(pricing, areaKm2) {
    const tiers = Object.entries(pricing.brackets ?? {})
        .filter((entry) => entry[1]?.maxKm2 === null || validTokens(entry[1]?.maxKm2))
        .sort((a, b) => (a[1].maxKm2 ?? Number.POSITIVE_INFINITY) -
        (b[1].maxKm2 ?? Number.POSITIVE_INFINITY));
    return tiers.find(([, tier]) => tier.maxKm2 === null || areaKm2 <= tier.maxKm2)?.[0] ?? null;
}
/**
 * The tokens a workflow run over an area costs, according to a price list.
 *
 * @param pricing - The price list from `BillingService.getPublicPricing`.
 * @param workflowId - The workflow to price.
 * @param areaKm2 - The area in square kilometres.
 * @returns The token cost and the bracket it was priced in, or `null` when
 * no bracket fits the area or the workflow has no price for that bracket.
 *
 * @category Billing
 */
export function estimateWorkflowRunTokens(pricing, workflowId, areaKm2) {
    const bracket = resolveBracketName(pricing, areaKm2);
    if (bracket === null)
        return null;
    const tokens = pricing.workflows?.[workflowId]?.[bracket];
    return validTokens(tokens) ? { tokens, bracket } : null;
}
