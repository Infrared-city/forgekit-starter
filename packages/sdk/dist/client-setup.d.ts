import type { AuthResolver } from "./internal/auth.js";
import type { JobsServiceOptions } from "./jobs.js";
import type { Logger } from "./logger.js";
import type { InfraredClientConfig, InfraredEnvBindings } from "./client-types.js";
export declare const DEFAULT_BASE_URL = "https://api.infrared.city/v2";
export declare function envValue(env: InfraredEnvBindings | undefined, name: keyof InfraredEnvBindings): string | undefined;
export declare function jobsServiceOptions(options: InfraredClientConfig, baseUrl: string, auth: AuthResolver, logger: Logger, timeoutMs: number | undefined): JobsServiceOptions;
