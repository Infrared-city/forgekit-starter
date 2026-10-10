/**
 * `@infrared-city/infrared-sdk/worker`: one SDK client in one dedicated
 * browser worker. The page calls `createWorkerClient`; the worker file calls
 * `serveSdkWorker`. See `docs/sdk-execution.md` ("One SDK worker").
 */
export { createWorkerClient, WorkerLostError, type CreateWorkerClientOptions, type WorkerClient, type WorkerLike, type WorkerRunAreaOptions, type WorkerMergeOptions, type WorkerVegetationOptions, type WorkerGroundMaterialsOptions, type WorkerBuildingsOptions, } from "./client.js";
export { serveSdkWorker, type ServeSdkWorkerOptions, type WorkerScope } from "./serve.js";
export type { WorkerClientConfig } from "./protocol.js";
export { FacadeLayout, synthesizeFacadeLayout, attachValues } from "../area/facade-layout.js";
export type { SynthesizeFacadeLayoutInput, FacadeLayoutJobSpec, FacadeLayoutMesh, FacadeLayoutFrame, FacadeLayoutJob, FacadeLayoutSynthParams, } from "../area/facade-layout.js";
