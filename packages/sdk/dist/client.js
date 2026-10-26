import { buildAuthResolver } from "./internal/auth.js";
import { rejectRemovedOption } from "./internal/service.js";
import { trimTrailingSlashes } from "./internal/url-trim.js";
import { JobsService } from "./jobs.js";
import { prepareAnalysisPayload } from "./area/payload.js";
import { checkAreaState as pollAreaState } from "./area/poll.js";
import { runAreaAndWaitRounds } from "./area/run-and-wait-retry.js";
import { mergePartsValue, previewParts as previewPartsImpl, runAndWaitParts, runParts as runPartsImpl, } from "./parts/run.js";
import { runArea as submitArea } from "./area/submission.js";
import { previewAreaBatches as previewAreaBatchesImpl } from "./area/preview.js";
import { mergeAreaJobs as mergeGridAreaJobs, mergeSurfaceAreaJobs as mergeSurfaceJobs, } from "./area/merge.js";
import { generateTilesForPolygon } from "./area/tiling.js";
import { BillingService, DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE, resolveTokensPerJob, } from "./billing.js";
import { BuildingsService } from "./buildings.js";
import { decompressResultValue } from "./compat.js";
import { GroundMaterialsService } from "./ground-materials-service.js";
import { VegetationService } from "./vegetation.js";
import { WeatherService } from "./weather.js";
import { consoleLogger } from "./logger.js";
import { AreaTimeoutError, } from "./client-types.js";
import { AnalysisService } from "./analysis-service.js";
import { DEFAULT_BASE_URL, envValue, jobsServiceOptions } from "./client-setup.js";
export { AnalysisService, AreaTimeoutError };
const DEFAULT_AREA_TIMEOUT_S = 3_600;
/**
 * The entry point of the SDK: runs analyses on one site or over a polygon
 * area (split into tiles), and exposes the weather, buildings, vegetation,
 * ground-material and billing services.
 *
 * @category Client
 */
export class InfraredClient {
    /** The API base URL in use, without trailing slashes. */
    baseUrl;
    /** The API key the client was created with, if any. */
    apiKey;
    /** Where the SDK's warnings go. */
    logger;
    /** Submits jobs, reads their status and downloads results. */
    jobs;
    /** Submits requests that already use the API's own keys. */
    analyses;
    /** Weather stations and data. */
    weather;
    /** Buildings around a site. */
    buildings;
    /** Trees around a site. */
    vegetation;
    /** Ground materials around a site. */
    groundMaterials;
    /** The public price list. */
    billing;
    /**
     * Creates a client; give a credential (`apiKey`, `token`, `getToken` or
     * `auth`) here or through the environment.
     *
     * @param options - See `InfraredClientConfig`.
     * @throws {TypeError} when `auth` is combined with another credential, or
     * `INFRARED_GEOMETRY_REF_ENABLED` is not a Boolean string.
     * @throws {InvalidOptionError} when a removed option such as `acquisition` is passed.
     * @throws {Error} when no credential is given.
     */
    constructor(options = {}) {
        // The client-level twin of the guards on the three site-context calls. The
        // field is gone from `InfraredClientConfig`, so a TypeScript literal fails
        // to compile, but a JavaScript caller (or a config built elsewhere) would
        // otherwise get the public-data path silently. MIGRATION.md and D42 promise
        // a TypeError here.
        rejectRemovedOption(options, "acquisition", "the public-data path is the only path; remove the option");
        const apiKey = options.apiKey ?? envValue(options.env, "INFRARED_API_KEY");
        const baseUrl = options.baseUrl ?? envValue(options.env, "INFRARED_BASE_URL") ?? DEFAULT_BASE_URL;
        this.baseUrl = trimTrailingSlashes(String(baseUrl));
        this.apiKey = apiKey;
        this.logger = options.logger ?? consoleLogger;
        const credentialsPresent = apiKey !== undefined || options.token !== undefined || options.getToken !== undefined;
        if (options.auth !== undefined && credentialsPresent) {
            throw new TypeError("auth cannot be combined with apiKey, token, or getToken");
        }
        const auth = options.auth ?? buildAuthResolver({
            ...(apiKey === undefined ? {} : { apiKey }),
            ...(options.token === undefined ? {} : { token: options.token }),
            ...(options.getToken === undefined ? {} : { getToken: options.getToken }),
            ...(options.surface === undefined ? {} : { surface: options.surface }),
        });
        const timeoutMs = options.timeoutMs ?? options.timeout;
        this.jobs = new JobsService(jobsServiceOptions(options, this.baseUrl, auth, this.logger, timeoutMs));
        this.analyses = new AnalysisService(this.jobs);
        const serviceOptions = {
            baseUrl: this.baseUrl,
            auth,
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(timeoutMs === undefined ? {} : { timeoutMs }),
            logger: this.logger, // every acquisition warning, never `console` (D48)
        };
        this.weather = new WeatherService(serviceOptions);
        this.buildings = new BuildingsService(serviceOptions);
        this.vegetation = new VegetationService(serviceOptions);
        this.groundMaterials = new GroundMaterialsService(serviceOptions);
        this.billing = new BillingService(serviceOptions);
    }
    /**
     * Submits one analysis request and returns the accepted `Job` without
     * waiting; follow with `jobs.waitForCompletion`, or use `runAndWait`.
     * Throws a `TypeError` straight away, before a promise is returned, when the request is not
     * valid; later failures reject the returned promise.
     *
     * @example
     * ```ts
     * const job = await client.run({ analysisType: AnalysesName.WindSpeed, ...parameters });
     * ```
     */
    run(input, options = {}) {
        const payload = prepareAnalysisPayload(input);
        return this.analyses.execute(payload, options);
    }
    /**
     * Submits a request, waits for it and returns the decoded result. A
     * `daylight-factor` request whose floors do not fit one job is sent as
     * parts in parallel and joined into the result a single request would give
     * (`maxParts: 1` sends one job); any other request is one job. A
     * `daylight-factor` result is a `DaylightFactorResult`, or the JSON value
     * with `resultFormat: "json"`.
     *
     * Rejects when a job fails or the wait times out.
     *
     * @example
     * ```ts
     * const result = await client.runAndWait({ analysisType: AnalysesName.WindSpeed, ...parameters });
     * ```
     */
    // Maintainer note (not published): the parts are the kernel's plan (D221);
    // the `daylight-factor` result format default is D234.
    runAndWait(input, options = {}) {
        return runAndWaitParts(this.jobs, this.logger, input, options);
    }
    /** Submits a request as its parts without waiting; returns the saved `PartsSchedule`. */
    runParts(input, options = {}) {
        return runPartsImpl(this.jobs, this.logger, input, options);
    }
    /** Reads the status of every open part once; returns the run's counts. */
    checkPartsState(schedule, options = {}) {
        return pollAreaState(this.jobs, schedule, options);
    }
    /** Downloads and joins a finished parts run; throws `AnalysisPartsError` naming a failed part. */
    mergeParts(schedule, options = {}) {
        return mergePartsValue(this.jobs, this.logger, schedule, options);
    }
    /** The parts, sensors and tokens a `runAndWait` of `input` would bill; sends nothing. */
    previewParts(input, options = {}) {
        return previewPartsImpl(this.jobs, this.logger, input, options);
    }
    /**
     * Plans an area run over `polygon`, submits one job per non-empty tile and
     * returns the saved `AreaSchedule` without waiting; finish it with
     * `checkAreaState` and `mergeAreaJobs`.
     *
     * A tile that fails does not stop the run. The tiles that went out before it
     * may be billed. List the failed tiles in `schedule.failedSubmissions` and
     * pass the schedule as `retryFrom` to send only those.
     *
     * @param input - the analysis request, as for `runAndWait`, plus the area settings.
     * @param polygon - the area to analyse.
     * @param options - `maxWorkers` (requests in flight at once), `maxTilesOverride`,
     * `retryFrom`, `onAccepted`, `signal` and `logger`.
     * @returns the saved `AreaSchedule` with one entry for each submitted tile.
     * @throws {Error} when the polygon needs more non-empty tiles than the
     * limit; the message gives the `maxTilesOverride` to pass.
     * @throws {ReadMarginError} when an acquired layer was read with a narrower
     * margin than the analysis needs.
     *
     * @example
     * ```ts
     * const schedule = await client.runArea(input, polygon, { maxTilesOverride: 400 });
     * ```
     */
    async runArea(input, polygon, options = {}) {
        // The client's logger, never `console` (D48); an explicit one still wins.
        return submitArea(this.jobs, input, polygon, { logger: this.logger, ...options });
    }
    /** Reads the status of the schedule's jobs once, updates it and returns the run's counts. */
    checkAreaState(schedule, options = {}) {
        return pollAreaState(this.jobs, schedule, options);
    }
    /**
     * Downloads the finished grid jobs of an area run and merges them into an
     * `AreaResult`. Throws when a tile did not contribute; calling it again
     * with the same schedule completes a run whose results could not be fetched.
     */
    mergeAreaJobs(schedule, options = {}) {
        // The client's logger, never `console` (D48); an explicit one still wins.
        return mergeGridAreaJobs(this.jobs, schedule, { logger: this.logger, ...options });
    }
    /** Downloads the finished surface jobs of an area run and joins them into `SurfaceColumns`. */
    mergeSurfaceAreaJobs(schedule, options = {}) {
        return mergeSurfaceJobs(this.jobs, schedule, { logger: this.logger, ...options }); // D48
    }
    /**
     * Runs an analysis over a polygon area and returns the merged result: it
     * submits the tiles, waits, retries what failed (`retries`) and merges. A
     * surface run returns `SurfaceColumns`, any other run an `AreaResult`.
     * `areaTimeout` is in seconds, default 3600.
     *
     * @throws {AreaTimeoutError} when the run does not finish within `areaTimeout`.
     * @throws {TypeError} when `areaTimeout` is not a positive finite number.
     *
     * @example
     * ```ts
     * const result = await client.runAreaAndWait(input, polygon, { areaTimeout: 1800 });
     * ```
     */
    async runAreaAndWait(input, polygon, options = {}) {
        const areaTimeout = options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S;
        if (typeof areaTimeout !== "number" || !Number.isFinite(areaTimeout) || areaTimeout <= 0) {
            throw new TypeError("areaTimeout must be a positive finite number");
        }
        const schedule0 = await this.runArea(input, polygon, options);
        // D224: waits for completion, then up to `retries` more rounds (default
        // 1) when something is left to resend; see `area/run-and-wait-retry.ts`.
        const schedule = await runAreaAndWaitRounds(this.jobs, (i, p, o) => this.runArea(i, p, o), (s, o) => this.checkAreaState(s, o), input, polygon, {
            ...options, areaTimeout,
            onTimeout: (last) => new AreaTimeoutError(`Area analysis timed out after ${areaTimeout}s: ` +
                `${last.completedCount}/${last.totalCount} completed, ${last.failedCount} failed, ` +
                `${last.runningCount} running`, last),
        }, schedule0);
        if (schedule.surfaceFields === true) {
            const merge = { ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
                ...(options.signal === undefined ? {} : { signal: options.signal }) };
            try {
                return await this.mergeSurfaceAreaJobs(schedule, merge);
            }
            finally {
                this.jobs.captures.forgetSchedule(schedule);
            } // no schedule reaches the caller
        }
        return this.mergeAreaJobs(schedule, {
            ...(options.strategy === undefined ? {} : { strategy: options.strategy }),
            ...(options.windDirectionDeg === undefined ? {} : { windDirectionDeg: options.windDirectionDeg }),
            ...(options.block === undefined ? {} : { block: options.block }),
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
    }
    /** Builds the tile grid covering a polygon, south to north; sends no request. */
    generateTiles(polygon, options = {}) {
        return generateTilesForPolygon(polygon, options);
    }
    /**
     * Estimates an area run from its tile count; submits nothing. The cost uses
     * a default price per job (`previewAreaWithPricing` uses the live price);
     * for a facade run use `previewAreaBatches`. Throws when the polygon needs
     * more non-empty tiles than the limit.
     *
     * @example
     * ```ts
     * const preview = client.previewArea(polygon, { analysisType: "wind-speed" });
     * ```
     */
    previewArea(polygon, options = {}) {
        const tiles = this.generateTiles(polygon, options);
        const tileCount = tiles.flat().filter((tile) => !tile.empty).length;
        return {
            tileCount,
            estimatedTimeS: tileCount * ESTIMATED_SECONDS_PER_TILE,
            estimatedCostTokens: tileCount * DEFAULT_TOKENS_PER_JOB,
        };
    }
    /**
     * Previews a facade run: builds the plan `runArea` would and reports its job
     * count instead of submitting it. Pass the same `input` a `runArea` call
     * would, because `previewArea` under-reports a facade (`analysisSurfaces`) run.
     */
    // Maintainer note (not published): added by WP-6; see area/preview.ts.
    previewAreaBatches(input, polygon, options = {}) {
        return previewAreaBatchesImpl(this.jobs, input, polygon, { logger: this.logger, ...options }); // D48
    }
    /**
     * Like `previewArea`, but priced with the API's current price for the
     * analysis. When the price list cannot be fetched a warning is logged and
     * the default price is used (`pricingSource` is `"fallback"`).
     */
    async previewAreaWithPricing(polygon, options) {
        const preview = this.previewArea(polygon, options);
        try {
            const pricing = await this.billing.getPublicPricing();
            const tokensPerJob = resolveTokensPerJob(pricing, options.analysisType);
            return {
                ...preview,
                estimatedCostTokens: preview.tileCount * tokensPerJob,
                tokensPerJob,
                pricingSource: "remote",
                ...(pricing.version === undefined ? {} : { pricingVersion: String(pricing.version) }),
            };
        }
        catch (error) {
            this.logger.warn({
                event: "pricing_fetch_failed",
                message: `Failed to fetch gateway pricing; using ${DEFAULT_TOKENS_PER_JOB} tokens per job`,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                ...preview,
                tokensPerJob: DEFAULT_TOKENS_PER_JOB,
                pricingSource: "fallback",
            };
        }
    }
    /** Decodes an already downloaded result archive; prefer `jobs.decompress`, which returns a typed result. */
    // Maintainer note (not published): explicit legacy adapter; `jobs.decompress`
    // remains route-aware.
    decompressResult(content) {
        return decompressResultValue(this.jobs, content);
    }
}
