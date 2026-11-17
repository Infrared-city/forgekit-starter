import type { Logger } from "../logger.js";
import type { PlannedRequest } from "./plan.js";
/** The capture of the body `request` sends, when the caller asked for triangles and it has facade targets. */
export declare function cellTrisCapture(request: PlannedRequest): Uint8Array | undefined;
/**
 * Attaches the kernel's triangles of job `jobId` to its parsed surface result `value`, in the
 * typed form of a facade layout: on each surface, `cellTris` (9 floats per triangle, a view on
 * one shared buffer) and `cellTrisOffsets` (`cells + 1`: cell `c` owns
 * `cellTris[cellTrisOffsets[c]..cellTrisOffsets[c + 1]]`; a cell with no geometry owns none).
 * A refusal attaches nothing and names its reasons under `cell-tris-fallback`.
 */
export declare function attachCellTris(value: unknown, archive: Uint8Array, jobId: string, capture: Uint8Array, logger: Logger): void;
