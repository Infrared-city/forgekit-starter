import type { PreparedSubmission } from "../job-model.js";
/**
 * The JSON wire bytes of one prepared submission: the text it carries
 * (`PreparedSubmission.json`), or `JSON.stringify` of its body (area groups
 * from the arena, `wire-json.ts`). The ONE writer of the JSON route: the
 * submit sends these bytes, and the daylight-factor parts plan (`parts/`,
 * D221) reads the same bytes, so a one-part request sends what it always sent.
 */
export declare function preparedJsonBytes(prepared: PreparedSubmission): Uint8Array;
