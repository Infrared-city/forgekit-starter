import type { AreaBuildings } from "../buildings.js";
import type { AreaGroundMaterials } from "../ground-materials-service.js";
import type { AreaVegetation } from "../vegetation.js";
import type { JobsService, PreparedSubmission } from "../jobs.js";
import type { BinaryCapability } from "../internal/binary-submission.js";
import type { FacadeSynthesisStore } from "./facade-synthesis.js";
import type { TerrainContext } from "./types.js";
import type { AreaSchedule, AreaState } from "./schedule-types.js";
/** Legacy camel-case or explicit wire-keyed input accepted by `runArea`. */
export type RunAreaInput = Readonly<Record<string, unknown>> & ({
    readonly analysisType: string;
    readonly "analysis-type"?: never;
} | {
    readonly "analysis-type": string;
    readonly analysisType?: never;
});
export type AreaJobsService = Pick<JobsService, "prepareSubmission" | "preflightPrepared" | "submitPrepared" | "getStatus"> & {
    /**
     * OPTIONAL, deliberately: `AreaJobsService` is public API, and a hand-rolled
     * or mocked service written against an earlier SDK has no such method.
     * `submitAreaPlan` calls it to free the artifacts a preflight
     * is holding for tiles it then does not submit; a service that retains
     * nothing has nothing to free, which is exactly what its absence means.
     */
    readonly releasePreflight?: (prepared: PreparedSubmission) => void;
    /** OPTIONAL for the same reason: the client's facade capture + layout cache
     * (`area/facade-synthesis.ts`). Its absence means nothing is captured. */
    readonly facadeSynthesis?: FacadeSynthesisStore;
    /**
     * OPTIONAL for the same reason: the live `/binary/v1/capabilities` document
     * (D228 auto-routing for daylight-factor parts). Its absence means "assume
     * no binary route" — the parts stay on the JSON path they always used.
     */
    readonly binaryCapability?: (signal?: AbortSignal) => Promise<BinaryCapability>;
};
export type AreaStatusService = Pick<JobsService, "getStatus"> & {
    /**
     * OPTIONAL, deliberately, for the same reason `releasePreflight` is:
     * `AreaStatusService` is public API and a hand-rolled or mocked service
     * written against an earlier SDK has no such method. Its absence means
     * "no batched status", which is the per-job sweep this SDK has always
     * done (`internal/status-batch.ts`, `docs/DEVIATIONS.md` D121).
     */
    readonly getStatusBatch?: JobsService["getStatusBatch"];
    /**
     * OPTIONAL for the same reason. It is what `runAreaAndWait` reads to pick
     * its poll interval: a sweep that costs two requests affords 2 s, a sweep
     * that costs one request per job does not.
     */
    readonly batchedStatusSupported?: boolean;
};
export interface RunAreaOptions {
    /**
     * The target buildings: an `AreaBuildings` from
     * `BuildingsService.getBuildingsInArea`, or a bare `{buildingId: mesh}` map.
     *
     * An `AreaBuildings` carries `origin` — the frame its bodies are in — and
     * the payload path re-anchors from THAT origin into this run's site frame,
     * so buildings acquired once for a large area can be run as several
     * sub-areas. A bare map carries no frame and is assumed to be in this
     * polygon's frame already: acquire with the same polygon you run
     * (`docs/DEVIATIONS.md` D48).
     */
    readonly buildings?: Readonly<Record<string, unknown>> | AreaBuildings;
    /**
     * The trees: an `AreaVegetation` from `VegetationService.getArea`, or a bare
     * `{key: feature}` map. The acquired object carries the READ MARGIN it was
     * fetched with, and a run whose analysis needs a wider one is refused
     * (`docs/DEVIATIONS.md` D54).
     */
    readonly vegetation?: Readonly<Record<string, unknown>> | AreaVegetation;
    /**
     * The ground materials: an `AreaGroundMaterials` from
     * `GroundMaterialsService.getArea`, or a bare `{layer: collection}` map.
     * The acquired object carries its READ MARGIN, checked as above (D54).
     */
    readonly groundMaterials?: Readonly<Record<string, unknown>> | AreaGroundMaterials;
    readonly maxTilesOverride?: number;
    readonly maxWorkers?: number;
    readonly webhookUrl?: string;
    readonly webhookEvents?: readonly string[];
    readonly retryFrom?: AreaSchedule;
    /**
     * Facade runs only: the most RETAINED sensors one job may carry, a whole
     * number from 1 to 250 000 (the default target). A smaller cap gives more,
     * smaller jobs; each is still an exact, verified count, so a preview with
     * the same cap reports the same jobs and sensors. A retry may omit it or
     * repeat the saved value (`docs/DEVIATIONS.md` D158).
     */
    readonly maxSensorsPerJob?: number;
    readonly terrainContextMarginM?: number;
    readonly terrainContext?: TerrainContext;
    readonly areaTimeout?: number;
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
    readonly signal?: AbortSignal;
    /** Unset: binary, or JSON for an analysis with no binary route (D196); a
     * `retryFrom` keeps its saved transport. Pass `"json"` for JSON. */
    readonly transport?: "json" | "binary";
}
export interface CheckAreaStateOptions {
    readonly maxWorkers?: number;
    readonly signal?: AbortSignal;
    readonly onProgress?: (state: AreaState) => void;
}
