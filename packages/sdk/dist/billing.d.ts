import { type ServiceOptions } from "./internal/service.js";
import { type PriceQuote } from "./price-list.js";
export { PricingUnavailableError } from "./price-list.js";
export type { PriceQuote, PricingSource, RunEstimate } from "./price-list.js";
export { resolveTokensPerJob } from "./legacy-pricing.js";
/**
 * The price list the API publishes, as returned by
 * `BillingService.getPublicPricing`. Every section is optional, and any
 * further fields the API adds are kept under their own names.
 *
 * @category Billing
 */
export interface PublicPricing {
    /** The version of this price list. */
    readonly version?: string | number;
    /** Tokens charged for one job, by analysis name. */
    readonly analysisType?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    /** Tokens charged for a whole workflow run, by workflow id and then by bracket name. */
    readonly workflows?: Readonly<Record<string, Readonly<Record<string, number>>>>;
    /**
     * The area brackets used to price workflow runs, by bracket name. `maxKm2`
     * is the largest area in square kilometres the bracket covers; `null`
     * means no upper limit.
     */
    readonly brackets?: Readonly<Record<string, {
        readonly maxKm2: number | null;
    }>>;
    /** Older per-job prices, keyed by model, with an optional `default`. */
    readonly perJob?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    /** Tokens charged per action, by action name; `run-analysis` is the price of one analysis job. */
    readonly actionCatalog?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    /** When this price list takes effect. */
    readonly effectiveFrom?: string;
    readonly [extra: string]: unknown;
}
/**
 * Reads the API's public price list. Available as `InfraredClient.billing`.
 *
 * @category Billing
 */
export declare class BillingService {
    private readonly options;
    private transport;
    private prices;
    /** Creates the service from the client's base URL, credentials and transport settings. */
    constructor(options: ServiceOptions);
    private url;
    /**
     * Fetches the current public price list.
     *
     * @returns The `PublicPricing` document.
     * @throws Error when the API returns an empty response, or the request fails.
     */
    getPublicPricing(): Promise<PublicPricing>;
    /**
     * The price of one job of an analysis, from the price list. The client
     * keeps the list for 20 minutes; `pricingSource` says whether the price is
     * `"live"`, `"cached"` or `"stale"` (the list could not be fetched again).
     *
     * @param analysisType - The analysis to price.
     * @throws {PricingUnavailableError} when the list cannot be fetched and the client has none.
     */
    quote(analysisType: string): Promise<PriceQuote>;
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
export declare function resolveBracketName(pricing: PublicPricing, areaKm2: number): string | null;
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
export declare function estimateWorkflowRunTokens(pricing: PublicPricing, workflowId: string, areaKm2: number): {
    readonly tokens: number;
    readonly bracket: string;
} | null;
