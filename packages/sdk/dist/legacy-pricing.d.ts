import type { AnalysesName } from "./analysis-types.js";
import type { PublicPricing } from "./billing.js";
import type { AreaPreview } from "./client-types.js";
import type { Polygon } from "./area/types.js";
/**
 * An `AreaPreview` priced with the API's price list, from
 * `InfraredClient.previewAreaWithPricing`.
 *
 * @deprecated Use `AreaPreview`: `InfraredClient.previewArea` returns the same
 * fields (`tokensPerJob`, `pricingVersion`) and a `pricingSource` of `"live"`,
 * `"cached"` or `"stale"`. Removed in 2.0.
 * @category Run an analysis
 */
export interface AreaPreviewWithPricing extends Omit<AreaPreview, "pricingSource"> {
    /** The tokens charged for one job of the previewed analysis. */
    readonly tokensPerJob: number;
    /** `"remote"`: the price came from the API. `"fallback"` is never returned now: with no price list the call throws `PricingUnavailableError`. */
    readonly pricingSource: "remote" | "fallback";
    /** The version of the price list used, when the list has one. */
    readonly pricingVersion?: string;
}
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
export declare function resolveTokensPerJob(pricing: PublicPricing, analysisType: AnalysesName): number;
/** What `previewAreaWithPricing` needs from the client: the current `previewArea`. */
export interface PreviewsArea {
    previewArea(polygon: Polygon, options: {
        readonly analysisType: string;
        readonly maxTilesOverride?: number;
    }): Promise<AreaPreview>;
}
/**
 * @deprecated Use `client.previewArea(polygon, { analysisType })`; it is priced
 * with the same price list. Removed in 2.0.
 */
export declare function previewAreaWithPricing(client: PreviewsArea, polygon: unknown, options: {
    readonly analysisType: AnalysesName;
    readonly maxTilesOverride?: number;
    /** No effect: the client keeps the price list for 20 minutes. */
    readonly forceRefresh?: boolean;
}): Promise<AreaPreviewWithPricing>;
