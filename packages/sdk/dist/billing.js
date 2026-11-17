import { requireJson, serviceTransport } from "./internal/service.js";
import { requireCore } from "./internal/core.js";
import { consoleLogger } from "./logger.js";
import { PriceCache } from "./price-list.js";
export { PricingUnavailableError } from "./price-list.js";
export { resolveTokensPerJob } from "./legacy-pricing.js";
const PRICING_PATH = "/billing/pricing";
/**
 * Reads the API's public price list. Available as `InfraredClient.billing`.
 *
 * @category Billing
 */
export class BillingService {
    options;
    transport;
    prices;
    /** Creates the service from the client's base URL, credentials and transport settings. */
    constructor(options) {
        this.options = options;
    }
    // The price list is a public route at the API root, outside `/v2` (`pricingUrl`, a kernel
    // call, so it runs on first use: a client may be made before `initializeCore`).
    url() {
        return requireCore().pricingUrl(String(this.options.baseUrl));
    }
    /**
     * Fetches the current public price list.
     *
     * @returns The `PublicPricing` document.
     * @throws Error when the API returns an empty response, or the request fails.
     */
    async getPublicPricing() {
        this.transport ??= serviceTransport({
            ...this.options, baseUrl: this.url().slice(0, -PRICING_PATH.length),
        });
        return requireJson(await this.transport.requestJson(PRICING_PATH), "pricing lookup");
    }
    /**
     * The price of one job of an analysis, from the price list. The client
     * keeps the list for 20 minutes; `pricingSource` says whether the price is
     * `"live"`, `"cached"` or `"stale"` (the list could not be fetched again).
     *
     * @param analysisType - The analysis to price.
     * @throws {PricingUnavailableError} when the list cannot be fetched and the client has none.
     */
    quote(analysisType) {
        this.prices ??= new PriceCache(() => this.getPublicPricing(), this.url(), this.options.logger ?? consoleLogger);
        return this.prices.quote(analysisType);
    }
}
function validTokens(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
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
