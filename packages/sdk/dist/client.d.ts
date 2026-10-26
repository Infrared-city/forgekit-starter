import { JobsService, type Job, type SubmitOptions } from "./jobs.js";
import type { AnalysesName } from "./analysis-types.js";
import type { MergePartsOptions } from "./parts/merge.js";
import { type RunAndWaitOptions } from "./parts/run.js";
import type { PartsOptions, PartsPreview, PartsSchedule } from "./parts/types.js";
import { type AreaBatchPreview } from "./area/preview.js";
import { type AreaMergeOptions } from "./area/merge.js";
import type { CheckAreaStateOptions, RunAreaInput, RunAreaOptions } from "./area/run-options.js";
import type { AreaResult, AreaSchedule, AreaState } from "./area/schedule-types.js";
import type { Polygon, Tile } from "./area/types.js";
import { BillingService } from "./billing.js";
import { BuildingsService } from "./buildings.js";
import { GroundMaterialsService } from "./ground-materials-service.js";
import { VegetationService } from "./vegetation.js";
import { WeatherService } from "./weather.js";
import { type Logger } from "./logger.js";
import type { SurfaceColumns } from "./results/surface-columns.js";
import { AreaTimeoutError, type AreaPreview, type AreaPreviewWithPricing, type InfraredClientConfig, type RunAreaAndWaitOptions } from "./client-types.js";
import { AnalysisService } from "./analysis-service.js";
export { AnalysisService, AreaTimeoutError };
export type { AreaPreview, AreaPreviewWithPricing, InfraredClientConfig, InfraredClientOptions, InfraredEnvBindings, RunAreaAndWaitOptions, WireAnalysisRequest, } from "./client-types.js";
/**
 * The entry point of the SDK: runs analyses on one site or over a polygon
 * area (split into tiles), and exposes the weather, buildings, vegetation,
 * ground-material and billing services.
 *
 * @category Client
 */
export declare class InfraredClient {
    /** The API base URL in use, without trailing slashes. */
    readonly baseUrl: string;
    /** The API key the client was created with, if any. */
    readonly apiKey: string | undefined;
    /** Where the SDK's warnings go. */
    readonly logger: Logger;
    /** Submits jobs, reads their status and downloads results. */
    readonly jobs: JobsService;
    /** Submits requests that already use the API's own keys. */
    readonly analyses: AnalysisService;
    /** Weather stations and data. */
    readonly weather: WeatherService;
    /** Buildings around a site. */
    readonly buildings: BuildingsService;
    /** Trees around a site. */
    readonly vegetation: VegetationService;
    /** Ground materials around a site. */
    readonly groundMaterials: GroundMaterialsService;
    /** The public price list. */
    readonly billing: BillingService;
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
    constructor(options?: InfraredClientConfig);
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
    run(input: Readonly<Record<string, unknown>>, options?: SubmitOptions): Promise<Job>;
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
    runAndWait(input: Readonly<Record<string, unknown>>, options?: SubmitOptions & RunAndWaitOptions): Promise<unknown>;
    /** Submits a request as its parts without waiting; returns the saved `PartsSchedule`. */
    runParts(input: Readonly<Record<string, unknown>>, options?: PartsOptions): Promise<PartsSchedule>;
    /** Reads the status of every open part once; returns the run's counts. */
    checkPartsState(schedule: PartsSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
    /** Downloads and joins a finished parts run; throws `AnalysisPartsError` naming a failed part. */
    mergeParts(schedule: PartsSchedule, options?: MergePartsOptions): Promise<unknown>;
    /** The parts, sensors and tokens a `runAndWait` of `input` would bill; sends nothing. */
    previewParts(input: Readonly<Record<string, unknown>>, options?: PartsOptions): PartsPreview;
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
    runArea(input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule>;
    /** Reads the status of the schedule's jobs once, updates it and returns the run's counts. */
    checkAreaState(schedule: AreaSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
    /**
     * Downloads the finished grid jobs of an area run and merges them into an
     * `AreaResult`. Throws when a tile did not contribute; calling it again
     * with the same schedule completes a run whose results could not be fetched.
     */
    mergeAreaJobs(schedule: AreaSchedule, options?: AreaMergeOptions): Promise<AreaResult>;
    /** Downloads the finished surface jobs of an area run and joins them into `SurfaceColumns`. */
    mergeSurfaceAreaJobs(schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceColumns>;
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
    runAreaAndWait(input: RunAreaInput, polygon: Polygon, options?: RunAreaAndWaitOptions): Promise<AreaResult | SurfaceColumns>;
    /** Builds the tile grid covering a polygon, south to north; sends no request. */
    generateTiles(polygon: Polygon, options?: {
        readonly analysisType?: string;
        readonly maxTilesOverride?: number;
    }): Tile[][];
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
    previewArea(polygon: Polygon, options?: {
        readonly analysisType?: string;
        readonly maxTilesOverride?: number;
    }): AreaPreview;
    /**
     * Previews a facade run: builds the plan `runArea` would and reports its job
     * count instead of submitting it. Pass the same `input` a `runArea` call
     * would, because `previewArea` under-reports a facade (`analysisSurfaces`) run.
     */
    previewAreaBatches(input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaBatchPreview>;
    /**
     * Like `previewArea`, but priced with the API's current price for the
     * analysis. When the price list cannot be fetched a warning is logged and
     * the default price is used (`pricingSource` is `"fallback"`).
     */
    previewAreaWithPricing(polygon: unknown, options: {
        readonly analysisType: AnalysesName;
        readonly maxTilesOverride?: number;
        readonly forceRefresh?: boolean;
    }): Promise<AreaPreviewWithPricing>;
    /** Decodes an already downloaded result archive; prefer `jobs.decompress`, which returns a typed result. */
    decompressResult(content: Uint8Array): unknown;
}
