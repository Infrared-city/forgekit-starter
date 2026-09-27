/**
 * `@infrared-city/infrared-sdk-ts/worker`: one SDK client in one dedicated
 * browser worker. The page calls `createWorkerClient`; the worker file calls
 * `serveSdkWorker`. See `docs/sdk-execution.md` ("One SDK worker").
 */
export { createWorkerClient, WorkerLostError, } from "./client.js";
export { serveSdkWorker } from "./serve.js";
