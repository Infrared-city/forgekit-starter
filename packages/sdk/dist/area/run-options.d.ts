import type { AreaBuildings } from "../buildings.js";
import type { AreaGroundMaterials } from "../ground-materials-service.js";
import type { AreaVegetation } from "../vegetation.js";
import type { JobsService, PreparedSubmission } from "../jobs.js";
import type { Logger } from "../logger.js";
import type { BinaryCapability } from "../internal/binary-submission.js";
import type { FacadeCaptures } from "./facade-captures.js";
import type { TerrainContext } from "./types.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/**
 * The analysis request `runArea` takes: `analysisType` (or the wire key
 * `"analysis-type"`) plus the analysis's own parameters.
 *
 * @category Run an analysis
 */
export type RunAreaInput = Readonly<Record<string, unknown>> & ({
    readonly analysisType: string;
    readonly "analysis-type"?: never;
} | {
    readonly "analysis-type": string;
    readonly analysisType?: never;
});
/**
 * The job operations an area run needs: prepare, pre-check, submit and read
 * the status of a job. `InfraredClient.jobs` satisfies it; a custom or mock
 * service only has to provide the four required methods.
 *
 * @category Run an analysis
 */
export type AreaJobsService = Pick<JobsService, "prepareSubmission" | "preflightPrepared" | "submitPrepared" | "getStatus"> & {
    /**
     * Frees what a pre-check is holding for tiles that are then not submitted.
     * Optional: a service that retains nothing has nothing to free.
     */
    readonly releasePreflight?: (prepared: PreparedSubmission) => void;
    /**
     * The client's cache of facade captures and layouts. Optional: without it
     * nothing is captured.
     */
    readonly captures?: FacadeCaptures;
    /**
     * Reads the API's capability document, which decides whether a part of a
     * daylight-factor run can use the binary route. Optional: without it the
     * parts stay on the JSON route. A binary area run reads it once to check
     * its route before the first paid POST.
     */
    readonly binaryCapability?: (signal?: AbortSignal) => Promise<BinaryCapability>;
};
/**
 * The status operations `checkAreaState` and `runAreaAndWait` need.
 * `InfraredClient.jobs` satisfies it.
 *
 * @category Run an analysis
 */
export type AreaStatusService = Pick<JobsService, "getStatus"> & {
    /**
     * The client's facade capture cache. Optional: the run releases the captures of a job that
     * failed and of a run that fails or is aborted.
     */
    readonly captures?: Pick<FacadeCaptures, "forget" | "forgetSchedule">;
    /**
     * Reads the status of many jobs in one request. Optional: without it each
     * job is read on its own.
     */
    readonly getStatusBatch?: JobsService["getStatusBatch"];
    /**
     * Whether a status sweep costs a fixed couple of requests, not one per job.
     * `runAreaAndWait` uses it to choose its poll interval.
     */
    readonly batchedStatusSupported?: boolean;
};
/**
 * Options for `runArea`, `runAreaAndWait` and `previewAreaBatches`.
 *
 * @category Run an analysis
 */
export interface RunAreaOptions {
    /**
     * The target buildings: an `AreaBuildings` from
     * `BuildingsService.getBuildingsInArea`, or a bare `{buildingId: mesh}` map.
     *
     * An `AreaBuildings` carries `origin` — the frame its bodies are in — and
     * the payload path re-anchors from that origin into this run's site frame,
     * so buildings acquired once for a large area can be run as several
     * sub-areas. A bare map carries no frame and is assumed to be in this
     * polygon's frame already: acquire with the same polygon you run.
     */
    readonly buildings?: Readonly<Record<string, unknown>> | AreaBuildings;
    /**
     * The trees: an `AreaVegetation` from `VegetationService.getArea`, or a bare
     * `{key: feature}` map. The acquired object carries the read margin it was
     * fetched with, and a run whose analysis needs a wider one is refused.
     */
    readonly vegetation?: Readonly<Record<string, unknown>> | AreaVegetation;
    /**
     * The ground materials: an `AreaGroundMaterials` from
     * `GroundMaterialsService.getArea`, or a bare `{layer: collection}` map.
     * The acquired object carries its read margin, checked as for `vegetation`.
     */
    readonly groundMaterials?: Readonly<Record<string, unknown>> | AreaGroundMaterials;
    /**
     * Raises the limit on how many non-empty tiles one run may cover. A run
     * over the limit is refused before anything is submitted, and the message
     * gives the number to pass here. Each tile is a billed job, so size the
     * run with a preview first.
     */
    readonly maxTilesOverride?: number;
    /** @deprecated No effect: the engine sets the widths. Removed in 2.0. */
    readonly maxWorkers?: number;
    /** A URL the API calls when a job reaches one of `webhookEvents`. */
    readonly webhookUrl?: string;
    /** The job events that trigger `webhookUrl`. */
    readonly webhookEvents?: readonly string[];
    /**
     * The schedule of an earlier run of the same area and analysis. The run
     * continues from that saved schedule instead of starting a new one.
     */
    readonly retryFrom?: AreaSchedule;
    /**
     * Facade runs only: the most retained sensors one job may carry, a whole
     * number from 1 to 250 000 (the default target). A smaller cap gives more,
     * smaller jobs; each is still an exact, verified count, so a preview with
     * the same cap reports the same jobs and sensors. A retry may omit it or
     * repeat the saved value; a different value is refused.
     */
    readonly maxSensorsPerJob?: number;
    /**
     * How a facade run puts buildings into jobs. `"regular"` (default) counts the
     * sensors of every group of buildings exactly. `"fast"` counts each building
     * once, alone, and packs the buildings by the sum of those counts: planning
     * is faster, and a job holds at most 290,000 sensors (or `maxSensorsPerJob`).
     * The values of each sensor are the same; only which job carries a building
     * changes, so the number of jobs can differ. A retry replays the saved jobs.
     */
    readonly packing?: "regular" | "fast";
    /**
     * Metres of terrain read beyond each tile so its edges are seated on real
     * ground. Default 0 m; the analysis's own minimum (solar family: 128 m) wins when it is larger.
     * A retry must repeat the saved value.
     */
    readonly terrainContextMarginM?: number;
    /**
     * Metres outside each tile's core within which a `contextGeometry` mesh is
     * sent with that tile (a square box, core ± reach). Default 600. Must be
     * larger than the tile margin plus `contextBufferM`, because the context
     * inside that area is removed.
     * `null` sends every mesh to every tile: use it when you choose the context
     * yourself. A changed value changes the tile bodies and their hashes.
     */
    readonly contextReachM?: number | null;
    /**
     * Metres added round each tile's detailed area (tile core plus the
     * detailed-geometry margin). In each tile, the `contextGeometry` triangles
     * inside that area are removed and the rest of each mesh stays, so a merged
     * city mesh or a ground sheet given as context keeps its parts outside the
     * area. The SDK logs one warning with the count. Default 10; 0 = no extra
     * buffer.
     */
    readonly contextBufferM?: number;
    /**
     * Not for callers: the SDK builds the terrain context itself. Passing it is
     * refused; use `terrainContextMarginM` instead.
     */
    readonly terrainContext?: TerrainContext;
    /**
     * `runAreaAndWait` only: seconds to wait for the whole run before it throws
     * `AreaTimeoutError`. A positive number; default 3600.
     */
    readonly areaTimeout?: number;
    /** Called with the run's counts after each submission and status update. */
    readonly onProgress?: (state: AreaState) => void;
    /**
     * Called once for each job id the run records, at the moment it records
     * it, with the tile key. A synchronous observer: it only reports, the run
     * does not wait for a returned promise, and an error thrown here is
     * ignored, so the schedule never changes. Use it to store accepted job ids
     * before `runArea` returns (the worker helper sends them to the page this
     * way); a failed store is the caller's to retry.
     */
    readonly onAccepted?: (jobId: string, tileKey: string) => void;
    /** Aborts the run. */
    readonly signal?: AbortSignal;
    /**
     * How the request is sent. Unset: binary, or JSON for an analysis that has
     * no binary route; a retry keeps the transport of the run it continues.
     * Pass `"json"` to force JSON.
     */
    readonly transport?: "json" | "binary";
    /**
     * Receives warnings, such as an unrecognised request key. `InfraredClient`
     * passes its own logger.
     */
    readonly logger?: Logger;
}
/**
 * Options for `checkAreaState`.
 *
 * @category Run an analysis
 */
export interface CheckAreaStateOptions {
    /** @deprecated No effect: the engine sets the widths. Removed in 2.0. */
    readonly maxWorkers?: number;
    /** Aborts the status check. */
    readonly signal?: AbortSignal;
    /** Called with the run's counts once the check has read every job. */
    readonly onProgress?: (state: AreaState) => void;
}
