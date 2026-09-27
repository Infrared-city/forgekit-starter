import { type CompactGridResult } from "../internal/binary-result.js";
/**
 * Decode an area grid tile in one kernel crossing: inflate the downloaded
 * archive, then either flatten a JSON grid or hand a strict IRBF document to
 * its existing decoder (D107). Replaces this host's own inflate +
 * `JSON.parse` + per-cell flatten for the JSON route (ADR 0006).
 *
 * Throws on a malformed archive — `merge.ts` already treats any exception
 * from this call as that tile's download failure, so there is no separate
 * fallback decoder to keep in sync with this one.
 */
export declare function areaGridResult(content: Uint8Array): CompactGridResult;
