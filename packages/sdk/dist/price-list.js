import { requireCore } from "./internal/core.js";
/**
 * Thrown when the API price list cannot be fetched and the client has no
 * earlier copy of it. A cost estimate needs a real price, so none is made up.
 * The message names the URL and the cause.
 *
 * @category Errors
 */
export class PricingUnavailableError extends Error {
    url;
    name = "PricingUnavailableError";
    /**
     * @param url - The price list URL that was fetched.
     * @param cause - Why the fetch failed.
     */
    constructor(url, cause) {
        super(`the price list at ${url} cannot be fetched: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
        this.url = url;
    }
}
/** The estimate of `plannedJobs` jobs at `quote`'s price: the kernel's formula. */
export function estimateRun(plannedJobs, quote) {
    const estimate = JSON.parse(requireCore().areaEstimate(plannedJobs, quote.tokensPerJob));
    return {
        ...quote, estimatedCostTokens: estimate.estimated_cost_tokens, estimatedTimeS: estimate.estimated_time_s,
    };
}
/**
 * The price list of one client: fetched, kept for 20 minutes (the kernel's
 * `priceCacheTtlSeconds`), then fetched again. When a new fetch fails the
 * last list is used and marked `"stale"`; with no list at all the fetch error
 * becomes a `PricingUnavailableError`. No price is built into the SDK.
 */
export class PriceCache {
    fetchList;
    url;
    logger;
    nowMs;
    list;
    constructor(fetchList, url, logger, nowMs = Date.now) {
        this.fetchList = fetchList;
        this.url = url;
        this.logger = logger;
        this.nowMs = nowMs;
    }
    /** The price of one job of `analysisType`. */
    async quote(analysisType) {
        const core = requireCore();
        const ageS = this.list === undefined ? undefined : (this.nowMs() - this.list.fetchedAtMs) / 1000;
        let source = ageS === undefined ? undefined : core.priceSource(false, ageS);
        if (source !== "cached") {
            try {
                this.list = { body: await this.fetchList(), fetchedAtMs: this.nowMs() };
                source = core.priceSource(true, 0);
            }
            catch (error) {
                if (this.list === undefined || ageS === undefined)
                    throw new PricingUnavailableError(this.url, error);
                this.logger.warn({
                    event: "pricing_fetch_failed",
                    message: "the price list cannot be fetched; using the last list the client fetched",
                    url: this.url,
                    error: error instanceof Error ? error.message : String(error),
                });
                source = core.priceSource(false, ageS);
            }
        }
        const price = JSON.parse(core.tokensPerJob(JSON.stringify(this.list.body), analysisType));
        return {
            tokensPerJob: price.tokens_per_job,
            ...(price.version === undefined || price.version === null ? {} : { pricingVersion: String(price.version) }),
            pricingSource: source,
        };
    }
}
