import { requireCore } from "./internal/core.js";
/**
 * The tokens one job of an analysis costs, from a price list you already hold.
 *
 * @deprecated Use `await client.billing.quote(analysisType)`, which reads and
 * keeps the price list itself. Removed in 2.0.
 * @param pricing - The price list from `BillingService.getPublicPricing`.
 * @param analysisType - The analysis to price.
 * @returns The tokens for one job, from `analysisType.<name>.tokens`.
 * @throws Error when the list has no price for the analysis. The 1.0.x call
 * returned 10 here; the SDK has no built-in price now.
 * @category Billing
 */
export function resolveTokensPerJob(pricing, analysisType) {
    return JSON.parse(requireCore().tokensPerJob(JSON.stringify(pricing), analysisType)).tokens_per_job;
}
/**
 * @deprecated Use `client.previewArea(polygon, { analysisType })`; it is priced
 * with the same price list. Removed in 2.0.
 */
export async function previewAreaWithPricing(client, polygon, options) {
    const { forceRefresh: _ignored, ...previewOptions } = options;
    const { pricingSource: _source, ...preview } = await client.previewArea(polygon, previewOptions);
    return { ...preview, pricingSource: "remote" };
}
