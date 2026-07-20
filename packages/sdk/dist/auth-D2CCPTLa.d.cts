/**
 * Auth resolver — produces request headers for every outbound HTTP call.
 *
 * Three modes (mirrors prior forge-kit `@infrared/sdk` design):
 *   - `apiKey`         → static `X-Api-Key`. Server-to-server / Lambda auth.
 *   - `token`          → static `Authorization: Bearer <token>`. Use for
 *                        long-lived service tokens; never resolved live.
 *   - `getToken`       → live-resolved `Authorization: Bearer <result>`.
 *                        Called on **every** request — right pattern for
 *                        browser/Worker contexts where JWTs expire and the
 *                        app refreshes them out-of-band.
 *
 * `apiKey` may coexist with `token`/`getToken` (gateway authenticates the
 * JWT, downstream Lambdas read `X-Api-Key`). `token` and `getToken` are
 * **mutually exclusive** — providing both throws.
 *
 * The resolver is invoked at fetch time, not constructor time. That gives
 * `getToken` a real `() => Promise<string>` semantics and lets callers swap
 * tokens between requests on the same client.
 */
type AuthHeaders = Record<string, string>;
/** Resolver invoked per request — returns the merged auth header set. */
type AuthResolver = () => Promise<AuthHeaders>;
interface AuthOptions {
    apiKey?: string;
    token?: string;
    getToken?: () => string | Promise<string>;
}
/**
 * Build an `AuthResolver` from the three supported auth modes.
 *
 * Throws if `token` + `getToken` are both supplied (ambiguous), or if
 * none of `apiKey` / `token` / `getToken` are supplied.
 */
declare function buildAuthResolver(opts: AuthOptions): AuthResolver;

export { type AuthResolver as A, type AuthHeaders as a, type AuthOptions as b, buildAuthResolver as c };
