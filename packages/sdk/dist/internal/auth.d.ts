/**
 * The application an SDK call is made from, sent to the API so usage can be
 * attributed to it.
 *
 * Defaults to `"script"` when not set on {@link AuthOptions}.
 *
 * @category Client
 */
export type InfraredSurface = "platform" | "webapp" | "grasshopper" | "revit" | "qgis" | "arcgis" | "sketchup" | "archicad" | "script" | "cli";
/**
 * Credentials and caller identity for the client.
 *
 * Provide at least one of `apiKey`, `token` or `getToken`. `token` and `getToken`
 * are mutually exclusive.
 *
 * @category Client
 */
export interface AuthOptions {
    /** API key, sent in the `X-Api-Key` header on every request. */
    readonly apiKey?: string;
    /** A fixed bearer token (JWT), sent in the `Authorization` header. */
    readonly token?: string;
    /**
     * Returns the bearer token, called before every request so a refreshed token is
     * picked up. Must return a non-empty string.
     */
    readonly getToken?: () => string | Promise<string>;
    /** The application the calls come from. Defaults to `"script"`. */
    readonly surface?: InfraredSurface;
}
/**
 * The HTTP headers that authenticate one request.
 *
 * @category Client
 */
export type AuthHeaders = Readonly<Record<string, string>>;
/**
 * Produces the authentication headers for the next request. It is evaluated on every
 * request, so a dynamic token is always current.
 *
 * @category Client
 */
export type AuthResolver = () => Promise<AuthHeaders>;
export declare class AuthPartitionChangedError extends Error {
    readonly name = "AuthPartitionChangedError";
    constructor();
}
/**
 * Build an authentication resolver that evaluates dynamic JWTs on every request.
 *
 * @param options - The credentials to use; see {@link AuthOptions}.
 * @returns A function that resolves the authentication headers for one request.
 * @throws {Error} If `token` and `getToken` are both given, if no credential is given, or
 *   if `getToken` returns an empty or non-string value when the resolver runs.
 * @category Client
 */
export declare function buildAuthResolver(options: AuthOptions): AuthResolver;
