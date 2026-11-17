/**
 * The ONE Node implementation of this package (infrared-core#683).
 *
 * `scripts/build.mjs` bundles this file to `dist/node-runtime.cjs`. Every
 * Node entry point is a thin wrapper over that one file:
 *
 * - `dist/index.cjs` (root, `require`) re-exports `root`;
 * - `dist/node.js` (root, `import`) re-exports `root` through `index.cjs`;
 * - `dist/node-tiling.js`, `node-geodata.js`, `node-utilities.js`,
 *   `node-billing.js` and `node-worker.js` (the ESM subpaths) re-export
 *   their namespace below. The worker subpath in Node can load the packaged
 *   threaded core (`createWorkerClient({ threads })`).
 *
 * So a Node process has one module graph, one kernel core and one class
 * object per name, whatever mix of `require` and `import` it uses. Before
 * this, the root resolved to a CommonJS bundle and each subpath to the ESM
 * build: two cores, and `initializeCore()` on one did not prepare the other.
 * This is the "ES module wrapper" approach of the Node documentation
 * (Packages, "Dual package hazard").
 *
 * Browsers do not load this file. They resolve the `import` condition, one
 * ESM graph, and are not changed.
 */
import * as root from "./node.js";
import * as area from "./area/index.js";
import * as geodataEntry from "./geodata/index.js";
import * as utilitiesEntry from "./utilities.js";
import * as billingEntry from "./billing.js";
import { parentPort } from "node:worker_threads";
import * as workerEntry from "./worker/index.js";
// Every Node entry that exports `initializeCore` exports the Node one: it
// loads the packaged WASM when no source is given, and it fills the one core.
const nodeInitialize = { initializeCore: root.initializeCore };
export { root };
export const tiling = Object.freeze({ ...area, ...nodeInitialize });
export const geodata = Object.freeze({ ...geodataEntry, ...nodeInitialize });
export const utilities = Object.freeze({ ...utilitiesEntry });
export const billing = Object.freeze({ ...billingEntry });
// In a Node worker thread, `serveSdkWorker()` listens on `parentPort` by default.
const serveSdkWorker = (options = {}) => {
    const scope = options.scope ?? parentPort;
    if (scope === null)
        throw new Error("serveSdkWorker() needs a worker thread: call it in a node:worker_threads Worker, or pass `scope`");
    workerEntry.serveSdkWorker({ ...options, scope });
};
export const worker = Object.freeze({ ...workerEntry, serveSdkWorker });
