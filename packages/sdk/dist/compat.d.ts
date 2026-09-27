import type { JobsService } from "./jobs.js";
import type { ParseResultOptions } from "./results/router.js";
/**
 * Return only the decoded payload for legacy callers.
 *
 * `JobsService.decompress` keeps its route-aware `ParsedResult` contract.
 * Callers that intentionally need the old raw value must opt in here.
 */
export declare function decompressResultValue(jobs: Pick<JobsService, "decompress">, content: Uint8Array, options?: ParseResultOptions): unknown;
