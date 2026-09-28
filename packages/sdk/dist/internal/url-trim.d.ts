/**
 * Strips every trailing `/` from a base URL.
 *
 * This used to be `value.replace(/\/+$/, "")`. That regex has no `^`
 * anchor, so `String.prototype.replace` retries the match at every start
 * offset before giving up; each retry re-walks the trailing run of `/`
 * characters. A base URL that is mostly slashes (`"/".repeat(n) + "x"`)
 * makes that O(n^2) — CodeQL's `js/polynomial-redos` (alerts on the
 * vendored TS SDK build in Infrared-city/forgekit-starter PR #1: options.ts
 * baseUrl/gatewayBaseUrl, service.ts baseUrl, client.ts baseUrl,
 * weather-static.ts baseUrl). `baseUrl` is public SDK-constructor input, so
 * a caller that forwards an untrusted string here (a per-tenant gateway
 * setting, for example) can burn CPU on a single call. The identical
 * pattern also existed, unflagged, in geometry-reuse/credentials.ts (the
 * auth-partition key) and transport.ts (a validated gateway URL's path);
 * fixed here too so no copy of the vulnerable regex is left in the SDK.
 *
 * A single backward scan is O(n) regardless of content, with no regex
 * engine involved, so there is nothing left to backtrack. This mirrors the
 * Python SDK, which never used a regex here (`base_url.rstrip("/")`).
 */
export declare function trimTrailingSlashes(value: string): string;
