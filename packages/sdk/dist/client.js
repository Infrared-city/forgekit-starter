import { buildAuthResolver, } from "./internal/auth.js";
import { rejectRemovedOption } from "./internal/service.js";
import { trimTrailingSlashes } from "./internal/url-trim.js";
import { JobsService, } from "./jobs.js";
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
    /**
     * Submit, wait and return the decoded result. A `daylight-factor` request
     * whose floors the kernel packs into more than one part is sent as parts,
     * in parallel, and joined into the result the single request gives, byte
     * for byte (D221); `maxParts: 1` sends one job. Any other request, and a
     * request of one part, is one job, sent as `run` sends it. A
     * `daylight-factor` result is a `DaylightFactorResult` by default, or the
     * JSON value with `resultFormat: "json"` (D234).
     */
    runAndWait(input, options = {}) {
        return runAndWaitParts(this.jobs, this.logger, input, options);
    }
    /** Submit a request as its kernel parts (D221); returns the durable schedule. */
    runParts(input, options = {}) {
        return runPartsImpl(this.jobs, this.logger, input, options);
    }
    /** Poll every open part once. */
    checkPartsState(schedule, options = {}) {
        return pollAreaState(this.jobs, schedule, options);
    }
    /** Download and join a finished parts run; throws `AnalysisPartsError` naming a failed part. */
    mergeParts(schedule, options = {}) {
        return mergePartsValue(this.jobs, this.logger, schedule, options);
    }
    /** The parts, sensors and tokens a `runAndWait` of `input` would bill; sends nothing. */
    previewParts(input, options = {}) {
        return previewPartsImpl(this.jobs, this.logger, input, options);
    }
    async runArea(input, polygon, options = {}) {
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
