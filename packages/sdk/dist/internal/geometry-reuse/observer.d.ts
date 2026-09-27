import type { Logger } from "../../logger.js";
import type { GeometryReuseOptions } from "./options.js";
import type { GeometryReuseProbeOutcome } from "./types.js";
export declare function safeLog(logger: Logger, level: "info" | "warn", event: string, reason: string): void;
/**
 * Report what the first reference-carrying submission of a partition settled.
 *
 * The ids are REAL customer jobs: the submission whose acknowledgement proved
 * the deployment resolves the field, or the one accepted without one whose
 * result must be discarded. The SDK submits no probe job of its own (D71).
 */
export declare function notifyCapability(options: GeometryReuseOptions, outcome: GeometryReuseProbeOutcome, ids: readonly string[]): void;
