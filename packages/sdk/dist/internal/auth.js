// Maintainer note (not published): request authentication is kept in TypeScript,
// outside the shared WASM state.
import { VERSION } from "../version.js";
// Maintainer note (not published): internal pre-dispatch signal that a dynamic
// credential selected another cache partition.
export class AuthPartitionChangedError extends Error {
    name = "AuthPartitionChangedError";
    constructor() {
        super("active authentication credential changed before dispatch");
    }
}
const SDK_HEADER_VALUE = `ts-sdk/${VERSION}`;
/**
 * Build an authentication resolver that evaluates dynamic JWTs on every request.
 *
 * @param options - The credentials to use; see {@link AuthOptions}.
 * @returns A function that resolves the authentication headers for one request.
 * @throws {Error} If `token` and `getToken` are both given, if no credential is given, or
 *   if `getToken` returns an empty or non-string value when the resolver runs.
 * @category Client
 */
export function buildAuthResolver(options) {
    const { apiKey, token, getToken, surface = "script" } = options;
    if (token !== undefined && getToken !== undefined) {
        throw new Error("`token` and `getToken` are mutually exclusive");
    }
    if (!apiKey && token === undefined && getToken === undefined) {
        throw new Error("provide at least one of `apiKey`, `token`, or `getToken`");
    }
    return async () => {
        const headers = {
            "x-infrared-application": surface,
            "x-infrared-sdk": SDK_HEADER_VALUE,
        };
        if (apiKey)
            headers["X-Api-Key"] = apiKey;
        const resolvedToken = getToken === undefined ? token : await getToken();
        if (getToken !== undefined && (typeof resolvedToken !== "string" || !resolvedToken)) {
            throw new Error("`getToken` must return a non-empty string");
        }
        if (resolvedToken)
            headers.Authorization = `Bearer ${resolvedToken}`;
        return headers;
    };
}
