import { type AuthOptions, type AuthResolver } from "./internal/auth.js";
import type { FetchLike } from "./internal/transport.js";
import { JobsService, type Job, type SubmitOptions } from "./jobs.js";
import type { AnalysesName } from "./analysis-types.js";
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
import type { SurfaceAnalysisResponse } from "./results/surface-analysis.js";
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
    runAndWait(input: Readonly<Record<string, unknown>>, options?: SubmitOptions & {
        readonly timeout?: number;
        readonly onPoll?: import("./jobs.js").OnPollCallback;
    }): Promise<unknown>;
    runArea(input: RunAreaInput, polygon: Polygon, options?: RunAreaOptions): Promise<AreaSchedule>;
    checkAreaState(schedule: AreaSchedule, options?: CheckAreaStateOptions): Promise<AreaState>;
    mergeAreaJobs(schedule: AreaSchedule, options?: AreaMergeOptions): Promise<AreaResult>;
    mergeSurfaceAreaJobs(schedule: AreaSchedule, options?: Pick<AreaMergeOptions, "maxWorkers" | "signal" | "logger">): Promise<SurfaceAnalysisResponse>;
    runAreaAndWait(input: RunAreaInput, polygon: Polygon, options?: RunAreaAndWaitOptions): Promise<AreaResult | SurfaceAnalysisResponse>;
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
