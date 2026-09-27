/**
 * The page half of the SDK worker helper: one SDK client in ONE dedicated
 * worker. The helper has no pool, no worker count, no retry and no
 * persistence; the application owns those. It never sends a call again.
 */
import type { RunAreaInput, RunAreaOptions } from "../area/run-options.js";
import type { AreaMergeOptions } from "../area/merge.js";
import type { AreaResult, AreaSchedule } from "../area/schedule-types.js";
import type { Polygon } from "../area/types.js";
import type { AreaBuildings, BuildingsConfig } from "../buildings.js";
import type { AreaGroundMaterials, GroundMaterialsService } from "../ground-materials-service.js";
import type { SurfaceAnalysisResponse } from "../results/surface-analysis.js";
import type { AreaVegetation, VegetationService } from "../vegetation.js";
import { type WorkerClientConfig } from "./protocol.js";
/** A `Worker`, or any port with the same members (tests). */
export interface WorkerLike {
    postMessage(message: unknown, transfer?: Transferable[]): void;
    addEventListener(type: "message" | "messageerror" | "error", listener: (event: Event) => void): void;
    terminate(): void;
}
export interface CreateWorkerClientOptions {
    /** A module worker whose file calls `serveSdkWorker()`. */
    readonly worker: WorkerLike;
    /** The SDK core, compiled once on the page and shared by every worker. */
    readonly module: WebAssembly.Module;
    /** The cloneable part of `InfraredClientConfig`. */
    readonly config?: WorkerClientConfig;
    /** Runs on the page; the worker asks for a token over its port. */
    readonly getToken?: () => string | Promise<string>;
}
/**
 * The worker ended while calls were open.
 *
 * - `load`: the worker failed before it was ready. No call started work,
 *   so nothing was sent.
 * - `lost`: every other case, including `dispose()` during a call. The jobs
 *   in `acceptedJobIds` were accepted (the ids that `onAccepted` reported
 *   for this call and the page received before the loss; an id still in
 *   flight can be missing). Every other tile of a `runArea` call is
 *   UNCERTAIN: its POST may have reached the server. Do not send them again
 *   automatically.
 */
export declare class WorkerLostError extends Error {
    readonly reason: "load" | "lost";
    readonly acceptedJobIds: readonly string[];
    readonly name = "WorkerLostError";
    constructor(reason: "load" | "lost", acceptedJobIds: readonly string[], message?: string);
}
export type WorkerRunAreaOptions = RunAreaOptions;
export type WorkerMergeOptions = Omit<AreaMergeOptions, "logger">;
export type WorkerVegetationOptions = NonNullable<Parameters<VegetationService["getArea"]>[1]>;
export type WorkerGroundMaterialsOptions = Omit<NonNullable<Parameters<GroundMaterialsService["getArea"]>[1]>, "cleaner">;
export type WorkerBuildingsOptions = BuildingsConfig;
export interface WorkerClient {
    runArea(input: RunAreaInput, polygon: Polygon, options?: WorkerRunAreaOptions): Promise<AreaSchedule>;
    mergeAreaJobs(schedule: AreaSchedule, options?: WorkerMergeOptions): Promise<AreaResult>;
    mergeSurfaceAreaJobs(schedule: AreaSchedule, options?: Pick<WorkerMergeOptions, "maxWorkers" | "signal">): Promise<SurfaceAnalysisResponse>;
    readonly vegetation: {
        getArea(polygon: Polygon, options?: WorkerVegetationOptions): Promise<AreaVegetation>;
    };
    readonly groundMaterials: {
        getArea(polygon: Polygon, options?: WorkerGroundMaterialsOptions): Promise<AreaGroundMaterials>;
    };
    readonly buildings: {
        getBuildingsInArea(polygon: Polygon, options?: WorkerBuildingsOptions): Promise<AreaBuildings>;
    };
    /** End the worker. Open calls reject with `WorkerLostError` (`lost`). */
    dispose(): void;
}
/** Serve one SDK client from a dedicated worker. See `docs/sdk-execution.md`. */
export declare function createWorkerClient(options: CreateWorkerClientOptions): WorkerClient;
