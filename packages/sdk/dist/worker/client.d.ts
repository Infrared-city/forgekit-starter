import type { RunAreaInput, RunAreaOptions } from "../area/run-options.js";
import type { AreaMergeOptions } from "../area/merge.js";
import type { AreaResult, AreaSchedule } from "../area/schedule-types.js";
import type { Polygon } from "../area/types.js";
import type { AreaBuildings, BuildingsConfig } from "../buildings.js";
import type { AreaGroundMaterials, GroundMaterialsService } from "../ground-materials-service.js";
import type { SurfaceColumns } from "../results/surface-columns.js";
import type { AreaVegetation, VegetationService } from "../vegetation.js";
import { type WorkerClientConfig } from "./protocol.js";
/**
 * A `Worker`, or any object with the same three members.
 *
 * @category Worker
 */
export interface WorkerLike {
    /** Sends a message to the worker, optionally transferring objects. */
    postMessage(message: unknown, transfer?: Transferable[]): void;
    /** Listens for the worker's `message`, `messageerror` and `error` events. */
    addEventListener(type: "message" | "messageerror" | "error", listener: (event: Event) => void): void;
    /** Ends the worker. */
    terminate(): void;
}
/**
 * Options for `createWorkerClient`.
 *
 * @category Worker
 */
export interface CreateWorkerClientOptions {
    /** A module worker whose file calls `serveSdkWorker()`. */
    readonly worker: WorkerLike;
    /** The SDK core, compiled once on the page and shared by every worker. */
    readonly module: WebAssembly.Module;
    /** The cloneable part of `InfraredClientConfig` (no functions). */
    readonly config?: WorkerClientConfig;
    /** Runs on the page; the worker asks for a token over its port. */
    readonly getToken?: () => string | Promise<string>;
}
/**
 * Thrown by every open call when the worker ends.
 *
 * - `load`: the worker failed before it was ready. No call started work,
 *   so nothing was sent.
 * - `lost`: every other case, including `dispose()` during a call. The jobs
 *   in `acceptedJobIds` were accepted (the ids that `onAccepted` reported
 *   for this call and the page received before the loss; an id still in
 *   flight can be missing). Every other tile of a `runArea` call is
 *   uncertain: its request may have reached the server. Do not send them again
 *   automatically.
 *
 * @category Worker
 */
export declare class WorkerLostError extends Error {
    /** Why the worker ended: `"load"` or `"lost"`. */
    readonly reason: "load" | "lost";
    /** Ids of the jobs accepted before the worker ended. */
    readonly acceptedJobIds: readonly string[];
    readonly name = "WorkerLostError";
    /**
     * @param reason - `"load"` or `"lost"`, as described above.
     * @param acceptedJobIds - Ids of the jobs the server accepted before the worker ended.
     * @param message - The error message; a default is given for each reason.
     */
    constructor(
    /** Why the worker ended: `"load"` or `"lost"`. */
    reason: "load" | "lost", 
    /** Ids of the jobs accepted before the worker ended. */
    acceptedJobIds: readonly string[], message?: string);
}
/**
 * Options for `WorkerClient.runArea`: the same as `RunAreaOptions`. Callbacks run on the
 * page, and `retryFrom` is a schedule.
 *
 * @category Worker
 */
export type WorkerRunAreaOptions = RunAreaOptions;
/**
 * Options for `WorkerClient.mergeAreaJobs`: the same as the area merge options, without a
 * logger.
 *
 * @category Worker
 */
export type WorkerMergeOptions = Omit<AreaMergeOptions, "logger">;
/**
 * Options for `WorkerClient.vegetation.getArea`: the same as the vegetation service's
 * area options.
 *
 * @category Worker
 */
export type WorkerVegetationOptions = NonNullable<Parameters<VegetationService["getArea"]>[1]>;
/**
 * Options for `WorkerClient.groundMaterials.getArea`: the same as the ground materials
 * service's area options, without a `cleaner`.
 *
 * @category Worker
 */
export type WorkerGroundMaterialsOptions = Omit<NonNullable<Parameters<GroundMaterialsService["getArea"]>[1]>, "cleaner">;
/**
 * Options for `WorkerClient.buildings.getBuildingsInArea`: the same as `BuildingsConfig`.
 *
 * @category Worker
 */
export type WorkerBuildingsOptions = BuildingsConfig;
/**
 * An SDK client that runs in a dedicated worker, created by `createWorkerClient`. Its
 * methods mirror the main client's, and the heavy work (site preparation, encoding,
 * decoding, merging) happens off the page.
 *
 * @category Worker
 */
export interface WorkerClient {
    /**
     * Plans and submits an area analysis in the worker.
     *
     * @param input - The area analysis input.
     * @param polygon - The area to analyse.
     * @param options - Run options. Progress and acceptance callbacks run on the page.
     * @returns The schedule of the submitted tiles.
     * @throws {WorkerLostError} When the worker ends during the call.
     */
    runArea(input: RunAreaInput, polygon: Polygon, options?: WorkerRunAreaOptions): Promise<AreaSchedule>;
    /**
     * Waits for the jobs of an area schedule and merges their results in the worker.
     *
     * @param schedule - A schedule returned by `runArea`.
     * @param options - Merge options.
     * @returns The merged area result. Its grid buffer is transferred, not copied.
     * @throws {WorkerLostError} When the worker ends during the call.
     */
    mergeAreaJobs(schedule: AreaSchedule, options?: WorkerMergeOptions): Promise<AreaResult>;
    /**
     * Merges the surface results (for example facade runs) of an area schedule in the worker.
     *
     * @param schedule - A schedule returned by `runArea`.
     * @param options - Worker count and abort signal.
     * @returns The merged surface result as columns.
     * @throws {WorkerLostError} When the worker ends during the call.
     */
    mergeSurfaceAreaJobs(schedule: AreaSchedule, options?: Pick<WorkerMergeOptions, "maxWorkers" | "signal">): Promise<SurfaceColumns>;
    /** Vegetation reads that run in the worker. */
    readonly vegetation: {
        /** Fetches the vegetation of an area in the worker. */
        getArea(polygon: Polygon, options?: WorkerVegetationOptions): Promise<AreaVegetation>;
    };
    /** Ground material reads that run in the worker. */
    readonly groundMaterials: {
        /** Fetches the ground materials of an area in the worker. */
        getArea(polygon: Polygon, options?: WorkerGroundMaterialsOptions): Promise<AreaGroundMaterials>;
    };
    /** Building reads that run in the worker. */
    readonly buildings: {
        /** Fetches the buildings of an area in the worker. */
        getBuildingsInArea(polygon: Polygon, options?: WorkerBuildingsOptions): Promise<AreaBuildings>;
    };
    /** End the worker. Open calls reject with `WorkerLostError` (`lost`). */
    dispose(): void;
}
/**
 * Creates an SDK client that runs in one dedicated worker.
 *
 * One worker serves one client; the helper has no pool, no retry and no persistence, and it
 * never sends a call again. The worker file must call `serveSdkWorker()`. Errors cross the
 * worker boundary as plain `Error` objects: check `error.name`, not `instanceof`.
 * `getToken` is called per request with no session binding, so use one worker per signed-in
 * session and dispose the client on sign-out.
 *
 * @example
 * ```ts
 * // sdk.worker.ts
 * import { serveSdkWorker } from "@infrared-city/infrared-sdk/worker";
 * serveSdkWorker();
 *
 * // page
 * import { createWorkerClient } from "@infrared-city/infrared-sdk/worker";
 * const sdk = createWorkerClient({
 *   worker: new Worker(new URL("./sdk.worker.ts", import.meta.url), { type: "module" }),
 *   module, // a WebAssembly.Module compiled once on the page
 *   getToken,
 * });
 * const schedule = await sdk.runArea(input, polygon, {
 *   onAccepted: (jobId, tileKey) => saveJobId(jobId, tileKey),
 * });
 * const result = await sdk.mergeAreaJobs(schedule);
 * sdk.dispose();
 * ```
 *
 * @param options - The worker, the compiled SDK core, the cloneable client config and an
 * optional token callback.
 * @returns The worker client.
 * @throws {TypeError} When the worker already serves a client.
 * @category Worker
 */
export declare function createWorkerClient(options: CreateWorkerClientOptions): WorkerClient;
