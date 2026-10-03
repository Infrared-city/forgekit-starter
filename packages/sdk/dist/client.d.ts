import { type AuthOptions, type AuthResolver } from "./internal/auth.js";
import type { FetchLike } from "./internal/transport.js";
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
import type { OnGeometryReuseProbe } from "./internal/geometry-reuse/types.js";
export type WireAnalysisRequest = Readonly<Record<string, unknown>> & {
    readonly "analysis-type": string;
};
export interface InfraredEnvBindings {
    readonly INFRARED_API_KEY?: string;
    readonly INFRARED_BASE_URL?: string;
    readonly INFRARED_GEOMETRY_REF_ENABLED?: string;
}
export interface InfraredClientConfig extends AuthOptions {
    readonly baseUrl?: string | URL;
    readonly env?: InfraredEnvBindings;
    readonly auth?: AuthResolver;
    readonly fetch?: FetchLike;
    readonly logger?: Logger;
    readonly timeout?: number;
    readonly timeoutMs?: number;
    readonly downloadTimeout?: number;
    readonly downloadTimeoutMs?: number;
    readonly gatewayBaseUrl?: string | URL;
    readonly bigPayloadThresholdBytes?: number;
    readonly onGeometryReuseProbe?: OnGeometryReuseProbe;
}
export type InfraredClientOptions = InfraredClientConfig;
export interface AreaPreview {
    readonly tileCount: number;
    readonly estimatedTimeS: number;
    readonly estimatedCostTokens: number;
}
export interface AreaPreviewWithPricing extends AreaPreview {
    readonly tokensPerJob: number;
    readonly pricingSource: "remote" | "fallback";
    readonly pricingVersion?: string;
}
export interface RunAreaAndWaitOptions extends RunAreaOptions, AreaMergeOptions {
    /**
     * Retry rounds after the run completes, when it left failed submits,
     * compute-failed jobs or uncertain keys (D224). Default 1; `0` turns this
     * off. Each round asks the kernel for the retry plan with the states this
     * wait already learned (no extra poll of finished jobs), resubmits what it
     * names, and waits again. A round that resubmits nothing stops the loop
     * early. Never retries after a 402 (`submissionAbortStatus`).
     */
    readonly retries?: number;
}
export declare class AreaTimeoutError extends Error {
    readonly areaState: AreaState;
    constructor(message: string, areaState: AreaState);
}
export declare class AnalysisService {
    private readonly jobs;
    constructor(jobs: JobsService);
    /** Submit an already wire-keyed request. */
    execute(payload: WireAnalysisRequest, options?: SubmitOptions): Promise<Job>;
}
/** Public client for direct and tiled analyses and site-context services. */
export declare class InfraredClient {
    readonly baseUrl: string;
    readonly apiKey: string | undefined;
    readonly logger: Logger;
    readonly jobs: JobsService;
    readonly analyses: AnalysisService;
    readonly weather: WeatherService;
    readonly buildings: BuildingsService;
    readonly vegetation: VegetationService;
    readonly groundMaterials: GroundMaterialsService;
    readonly billing: BillingService;
    constructor(options?: InfraredClientConfig);
    run(input: Readonly<Record<string, unknown>>, options?: SubmitOptions): Promise<Job>;
    /**
     * Submit, wait and return the decoded result. A `daylight-factor` request
     * whose floors the kernel packs into more than one part is sent as parts,
     * in parallel, and joined into the result the single request gives, byte
     * for byte (D221); `maxParts: 1` sends one job. Any other request, and a
     * request of one part, is one job, sent as `run` sends it. A
     * `daylight-factor` result is a `DaylightFactorResult` by default, or the
     * JSON value with `resultFormat: "json"` (D234).
     */
    runAndWait(input: Readonly<Record<string, unknown>>, options?: SubmitOptions & RunAndWaitOptions): Promise<unknown>;
    /** Submit a request as its kernel parts (D221); returns the durable schedule. */
    runParts(input: Readonly<Record<string, unknown>>, options?: PartsOptions): Promise<PartsSchedule>;
    /** Poll every open part once. */
    checkPartsState(schedule: PartsSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
    /** Download and join a finished parts run; throws `AnalysisPartsError` naming a failed part. */
    mergeParts(schedule: PartsSchedule, options?: MergePartsOptions): Promise<unknown>;
    /** The parts, sensors and tokens a `runAndWait` of `input` would bill; sends nothing. */
    previewParts(input: Readonly<Record<string, unknown>>, options?: PartsOptions): PartsPreview;
    runArea(input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule>;
    checkAreaState(schedule: AreaSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
    mergeAreaJobs(schedule: AreaSchedule, options?: AreaMergeOptions): Promise<AreaResult>;
    mergeSurfaceAreaJobs(schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceColumns>;
    runAreaAndWait(input: RunAreaInput, polygon: Polygon, options?: RunAreaAndWaitOptions): Promise<AreaResult | SurfaceColumns>;
    generateTiles(polygon: Polygon, options?: {
        readonly analysisType?: string;
        readonly maxTilesOverride?: number;
    }): Tile[][];
    previewArea(polygon: Polygon, options?: {
        readonly analysisType?: string;
        readonly maxTilesOverride?: number;
    }): AreaPreview;
    /** Facade-aware preview (WP-6): the same offline plan `runArea` builds,
     * read for its job count instead of submitted. Pass the SAME `input` a
     * `runArea` call would -- `previewArea` alone under-reports a facade
     * (`analysisSurfaces`) request's real job count. See `area/preview.ts`. */
    previewAreaBatches(input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaBatchPreview>;
    previewAreaWithPricing(polygon: unknown, options: {
        readonly analysisType: AnalysesName;
        readonly maxTilesOverride?: number;
        readonly forceRefresh?: boolean;
    }): Promise<AreaPreviewWithPricing>;
    /** Explicit legacy adapter. `jobs.decompress` remains route-aware. */
    decompressResult(content: Uint8Array): unknown;
}
