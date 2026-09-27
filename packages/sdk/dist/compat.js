/**
 * Return only the decoded payload for legacy callers.
 *
 * `JobsService.decompress` keeps its route-aware `ParsedResult` contract.
 * Callers that intentionally need the old raw value must opt in here.
 */
export function decompressResultValue(jobs, content, options) {
    return jobs.decompress(content, options).value;
}
