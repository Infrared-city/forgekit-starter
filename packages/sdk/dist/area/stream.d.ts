/**
 * `runAreaStream`: run analyses over one polygon and hand over each result the
 * moment the kernel `RunEngine` says it is finished. `runAreaAndWait` collects
 * this stream; there is no second path.
 *
 * The TypeScript engine driver (`docs/engine-driver-contract.md`): plan each
 * analysis, then loop "ask the engine for actions → do the HTTP → give the raw
 * answers back". The engine decides every POST, poll, download, retry and
 * hand-over; this host decides nothing. The same code runs on Node, in Node
 * `worker_threads`, in a browser page and in a Web Worker.
 */
import type { RunAreaAndWaitOptions } from "../client-types.js";
import { type Logger } from "../logger.js";
import type { SurfaceColumns } from "../results/surface-columns.js";
import { type RunService } from "./run-io.js";
import type { RunAreaInput } from "./run-options.js";
import type { AreaResult } from "./schedule-types.js";
import type { Polygon } from "./types.js";
/**
 * One finished analysis of `runAreaStream`: its `result`, or the `error` that
 * stopped it. The other analyses of the stream continue either way.
 *
 * @category Run an analysis
 */
export type AreaStreamItem = {
    /** Index of the analysis in the `inputs` list. */
    readonly index: number;
    readonly analysisType: string;
    readonly result: AreaResult | SurfaceColumns;
    readonly error?: undefined;
} | {
    readonly index: number;
    readonly analysisType: string;
    readonly result?: undefined;
    /** Why this analysis gave no result, for example an `AreaTimeoutError` or the abort reason. */
    readonly error: Error;
};
/** The client service a stream needs; `InfraredClient.jobs` satisfies it. */
export type AreaStreamService = RunService;
/**
 * The stream behind `InfraredClient.runAreaStream`. Results come in the order
 * they finish. Leaving the loop early cancels the rest.
 */
export declare function streamArea(service: AreaStreamService, inputs: readonly RunAreaInput[], polygon: Polygon, options?: RunAreaAndWaitOptions & {
    readonly logger?: Logger;
}): AsyncGenerator<AreaStreamItem, void, undefined>;
/**
 * `runAreaAndWait`: the results of a stream of `count` analyses, in input order. When an analysis
 * failed, the first error in input order is thrown after every analysis is finished (as Python's
 * `run_area_and_wait`).
 */
export declare function allResults(stream: AsyncIterable<AreaStreamItem>, count: number): Promise<Array<AreaResult | SurfaceColumns>>;
