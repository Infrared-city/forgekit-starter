import type { Job, PreparedSubmission } from "../../jobs.js";
import type { GeometryReuseOptions } from "./options.js";
export type { GeometryReuseOptions } from "./options.js";
/**
 * Plan with each group's size, so a small group stays inline (D201). The
 * mechanism tests send a few triangles on purpose and turn it off; production
 * never does.
 */
export declare const planning: {
    withSizes: boolean;
};
/** Return undefined only when the caller must use the unchanged inline path. */
export declare function tryGeometryReuse(preparedSubmission: PreparedSubmission, options: GeometryReuseOptions, signal?: AbortSignal, beforeDispatch?: () => void, idempotencyKey?: string): Promise<Job | undefined>;
