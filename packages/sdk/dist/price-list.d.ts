import type { Logger } from "./logger.js";
/**
 * Thrown when the API price list cannot be fetched and the client has no
 * earlier copy of it. A cost estimate needs a real price, so none is made up.
 * The message names the URL and the cause.
 *
 * @category Errors
 */
export declare class PricingUnavailableError extends Error {
    readonly url: string;
    readonly name = "PricingUnavailableError";
    /**
     * @param url - The price list URL that was fetched.
     * @param cause - Why the fetch failed.
     */
    constructor(url: string, cause: unknown);
}
/**
 * Where a price came from: `"live"` (just fetched), `"cached"` (fetched less
 * than 20 minutes ago) or `"stale"` (older, because the fetch failed).
 *
 * @category Billing
 */
export type PricingSource = "live" | "cached" | "stale";
/**
 * One job's price for an analysis, with where the price came from.
 *
 * @category Billing
 */
export interface PriceQuote {
    /** The tokens charged for one job of the analysis. */
    readonly tokensPerJob: number;
    /** The version of the price list, when it has one. */
    readonly pricingVersion?: string;
    /** Where the price came from. */
    readonly pricingSource: PricingSource;
}
/**
 * The cost and time estimate of a planned run, with the price it used.
 *
 * @category Billing
 */
export interface RunEstimate extends PriceQuote {
    readonly estimatedCostTokens: number;
    readonly estimatedTimeS: number;
}
/** The estimate of `plannedJobs` jobs at `quote`'s price: the kernel's formula. */
export declare function estimateRun(plannedJobs: number, quote: PriceQuote): RunEstimate;
/**
 * The price list of one client: fetched, kept for 20 minutes (the kernel's
 * `priceCacheTtlSeconds`), then fetched again. When a new fetch fails the
 * last list is used and marked `"stale"`; with no list at all the fetch error
 * becomes a `PricingUnavailableError`. No price is built into the SDK.
 */
export declare class PriceCache {
    private readonly fetchList;
    private readonly url;
    private readonly logger;
    private readonly nowMs;
    private list;
    constructor(fetchList: () => Promise<unknown>, url: string, logger: Logger, nowMs?: () => number);
    /** The price of one job of `analysisType`. */
    quote(analysisType: string): Promise<PriceQuote>;
}
