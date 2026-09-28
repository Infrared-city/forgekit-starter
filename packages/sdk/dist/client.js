import { buildAuthResolver, } from "./internal/auth.js";
import { rejectRemovedOption } from "./internal/service.js";
import { trimTrailingSlashes } from "./internal/url-trim.js";
import { JobsService, } from "./jobs.js";
import { prepareAnalysisPayload } from "./area/payload.js";
import { checkAreaState as pollAreaState, lastPerJobRequests } from "./area/poll.js";
import { areaPollDelayS, openJobs, POLL_BATCHED_FAST_MAX_JOBS } from "./area/poll-schedule.js";
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
export class AreaTimeoutError extends Error {
    areaState;
    constructor(message, areaState) {
        super(message);
        this.name = "AreaTimeoutError";
        this.areaState = areaState;
    }
}
const DEFAULT_BASE_URL = "https://api.infrared.city/v2";
const DEFAULT_AREA_TIMEOUT_S = 3_600;
function abortableSleep(milliseconds, signal) {
    if (signal?.aborted)
        return Promise.reject(signal.reason ?? new DOMException("aborted", "AbortError"));
    return new Promise((resolve, reject) => {
        const finish = () => {
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const timer = setTimeout(finish, milliseconds);
        const abort = () => {
            clearTimeout(timer);
            reject(signal?.reason ?? new DOMException("aborted", "AbortError"));
        };
        signal?.addEventListener("abort", abort, { once: true });
    });
}
function envValue(env, name) {
    if (env?.[name] !== undefined)
        return env[name];
    return globalThis.process?.env?.[name];
}
function geometryReuseSetting(env) {
    const value = envValue(env, "INFRARED_GEOMETRY_REF_ENABLED");
    if (value === undefined || value === "")
        return true;
    if (/^(1|true|yes|on)$/i.test(value))
        return true;
    if (/^(0|false|no|off)$/i.test(value))
        return false;
    throw new TypeError("INFRARED_GEOMETRY_REF_ENABLED must be a Boolean string");
}
export class AnalysisService {
    jobs;
    constructor(jobs) {
        this.jobs = jobs;
    }
    /** Submit an already wire-keyed request. */
    execute(payload, options = {}) {
        if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
            return Promise.reject(new TypeError("analysis payload must be an object"));
        }
        const analysisType = payload["analysis-type"];
        if (typeof analysisType !== "string" || analysisType.length === 0) {
            return Promise.reject(new TypeError("analysis payload requires analysis-type"));
        }
        return this.jobs.submit(analysisType, payload, options);
    }
}
/** Public client for direct and tiled analyses and site-context services. */
export class InfraredClient {
    baseUrl;
    apiKey;
    logger;
    jobs;
    analyses;
    weather;
    buildings;
    vegetation;
    groundMaterials;
    billing;
    constructor(options = {}) {
        // The client-level twin of the guards on the three site-context calls.
        // The field is gone from `InfraredClientConfig`, so a TypeScript object
        // literal already fails to compile — but a JavaScript caller, or a
        // TypeScript caller passing a config it built elsewhere, would otherwise
        // get the public-data path with no word said. MIGRATION.md and D42 both
        // promise a TypeError here.
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
        const downloadTimeoutMs = options.downloadTimeoutMs ?? options.downloadTimeout;
        const geometryReuseEnabled = geometryReuseSetting(options.env);
        const jobsOptions = {
            baseUrl: this.baseUrl,
            auth,
            ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
            ...(timeoutMs === undefined ? {} : { timeoutMs }),
            ...(downloadTimeoutMs === undefined ? {} : { downloadTimeoutMs }),
            ...(options.gatewayBaseUrl === undefined ? {} : { gatewayBaseUrl: options.gatewayBaseUrl }),
            ...(options.bigPayloadThresholdBytes === undefined ? {} : {
                bigPayloadThresholdBytes: options.bigPayloadThresholdBytes,
            }),
            geometryReuseEnabled,
            logger: this.logger,
            ...(options.onGeometryReuseProbe === undefined ? {} : {
                onGeometryReuseProbe: options.onGeometryReuseProbe,
            }),
        };
        this.jobs = new JobsService(jobsOptions);
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
    run(input, options = {}) {
        const payload = prepareAnalysisPayload(input);
        return this.analyses.execute(payload, options);
    }
    async runAndWait(input, options = {}) {
        const job = await this.run(input, options);
        const completed = await this.jobs.waitForCompletion(job.jobId, options);
        const download = await this.jobs.downloadResults(completed.jobId, {
            job: completed,
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
        return decompressResultValue(this.jobs, download.content);
    }
    runArea(input, polygon, options = {}) {
        return submitArea(this.jobs, input, polygon, options);
    }
    checkAreaState(schedule, options = {}) {
        return pollAreaState(this.jobs, schedule, options);
    }
    mergeAreaJobs(schedule, options = {}) {
        // The client's logger, never `console` (D48); an explicit one still wins.
        return mergeGridAreaJobs(this.jobs, schedule, { logger: this.logger, ...options });
    }
    mergeSurfaceAreaJobs(schedule, options = {}) {
        return mergeSurfaceJobs(this.jobs, schedule, { logger: this.logger, ...options }); // D48
    }
    async runAreaAndWait(input, polygon, options = {}) {
        const areaTimeout = options.areaTimeout ?? DEFAULT_AREA_TIMEOUT_S;
        if (typeof areaTimeout !== "number" || !Number.isFinite(areaTimeout) || areaTimeout <= 0) {
            throw new TypeError("areaTimeout must be a positive finite number");
        }
        const schedule = await this.runArea(input, polygon, options);
        const started = performance.now();
        const deadline = started + areaTimeout * 1_000;
        let attempt = 0;
        while (true) {
            const state = await this.checkAreaState(schedule, {
                ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
                ...(options.onProgress === undefined ? {} : { onProgress: options.onProgress }),
            });
            if (state.isComplete)
                break;
            const remainingS = (deadline - performance.now()) / 1_000;
            if (remainingS <= 0) {
                throw new AreaTimeoutError(`Area analysis timed out after ${areaTimeout}s: ` +
                    `${state.completedCount}/${state.totalCount} completed, ${state.failedCount} failed, ` +
                    `${state.runningCount} running`, state);
            }
            // Which schedule applies is decided by what the LAST sweep cost, not
            // by configuration: the batched route is discovered at runtime and a
            // gateway that lacks it never reports supporting it.
            const elapsedS = (performance.now() - started) / 1_000;
            const delayS = Math.min(remainingS, areaPollDelayS(attempt, this.jobs.batchedStatusSupported, elapsedS, 
            // A sweep that also asked per job is not a one-request sweep.
            openJobs(state) + (lastPerJobRequests(schedule) > 0 ? POLL_BATCHED_FAST_MAX_JOBS : 0)));
            await abortableSleep(delayS * 1_000, options.signal);
            attempt += 1;
        }
        if (schedule.surfaceFields === true) {
            return this.mergeSurfaceAreaJobs(schedule, {
                ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
                ...(options.signal === undefined ? {} : { signal: options.signal }),
            });
        }
        return this.mergeAreaJobs(schedule, {
            ...(options.strategy === undefined ? {} : { strategy: options.strategy }),
            ...(options.windDirectionDeg === undefined ? {} : { windDirectionDeg: options.windDirectionDeg }),
            ...(options.block === undefined ? {} : { block: options.block }),
            ...(options.maxWorkers === undefined ? {} : { maxWorkers: options.maxWorkers }),
            ...(options.signal === undefined ? {} : { signal: options.signal }),
        });
    }
    generateTiles(polygon, options = {}) {
        return generateTilesForPolygon(polygon, options);
    }
    previewArea(polygon, options = {}) {
        const tiles = this.generateTiles(polygon, options);
        const tileCount = tiles.flat().filter((tile) => !tile.empty).length;
        return {
            tileCount,
            estimatedTimeS: tileCount * ESTIMATED_SECONDS_PER_TILE,
            estimatedCostTokens: tileCount * DEFAULT_TOKENS_PER_JOB,
        };
    }
    /** Facade-aware preview (WP-6): the same offline plan `runArea` builds,
     * read for its job count instead of submitted. Pass the SAME `input` a
     * `runArea` call would -- `previewArea` alone under-reports a facade
     * (`analysisSurfaces`) request's real job count. See `area/preview.ts`. */
    previewAreaBatches(input, polygon, options = {}) {
        return previewAreaBatchesImpl(this.jobs, input, polygon, options);
    }
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
    /** Explicit legacy adapter. `jobs.decompress` remains route-aware. */
    decompressResult(content) {
        return decompressResultValue(this.jobs, content);
    }
}
