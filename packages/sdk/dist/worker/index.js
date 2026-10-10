/**
 * `@infrared-city/infrared-sdk/worker`: one SDK client in one dedicated
 * browser worker. The page calls `createWorkerClient`; the worker file calls
 * `serveSdkWorker`. See `docs/sdk-execution.md` ("One SDK worker").
 */
export { createWorkerClient, WorkerLostError, } from "./client.js";
export { serveSdkWorker } from "./serve.js";
// Offline, no HTTP, no billing (#707): usable straight inside a worker.
export { FacadeLayout, synthesizeFacadeLayout, attachValues } from "../area/facade-layout.js";
