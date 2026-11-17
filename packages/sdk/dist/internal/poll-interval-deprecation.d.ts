import type { Logger } from "../logger.js";
/** Say once per process, through the client's logger, that `pollIntervalMs` is deprecated. */
export declare function warnPollIntervalDeprecated(logger: Logger): void;
