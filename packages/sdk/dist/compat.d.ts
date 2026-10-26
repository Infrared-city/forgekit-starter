import type { JobsService } from "./jobs.js";
import type { ParseResultOptions } from "./results/router.js";
/**
 * Decodes a downloaded result archive and returns only the decoded value.
 *
 * `JobsService.decompress` returns a `ParsedResult` that also says which route
 * the result took. This function drops that and returns the bare payload, for
 * code written against the older raw-value contract.
 *
 * @param jobs - A `JobsService`, or any object with its `decompress` method.
 * @param content - The downloaded result archive bytes.
 * @param options - Optional decoding settings.
 * @returns The decoded payload.
 * @category Results and legend
 */
export declare function decompressResultValue(jobs: Pick<JobsService, "decompress">, content: Uint8Array, options?: ParseResultOptions): unknown;
