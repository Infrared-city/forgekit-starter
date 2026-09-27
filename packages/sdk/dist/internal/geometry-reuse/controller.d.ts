import type { Job, PreparedSubmission } from "../../jobs.js";
import type { GeometryReuseOptions } from "./options.js";
export type { GeometryReuseOptions } from "./options.js";
/** Return undefined only when the caller must use the unchanged inline path. */
export declare function tryGeometryReuse(preparedSubmission: PreparedSubmission, options: GeometryReuseOptions, signal?: AbortSignal, beforeDispatch?: () => void): Promise<Job | undefined>;
