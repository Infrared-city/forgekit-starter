import type { AuthHeaders } from "../auth.js";
export declare function credentialPartition(baseUrl: string, headers: AuthHeaders): Promise<string | undefined>;
export declare function exactAuthHeadersDigest(headers: AuthHeaders): Promise<string | undefined>;
/** Match GatewayTransport's case-insensitive, last-entry-wins header writes. */
export declare function normalizeAuthHeaders(headers: AuthHeaders): Record<string, string>;
