import { A as AnalysesName } from './constants-qkmLe0Zv.js';
import { L as Logger } from './logger-U3BDdomT.js';

/**
 * Pricing model helpers for cost estimation.
 *
 * The gateway exposes a public pricing document at `GET /billing/pricing`.
 * This module defines a lenient TypeScript view of that document plus the
 * resolution logic that turns it into a per-job token price for a given
 * analysis type. The constants below are the documented OFFLINE FALLBACKS —
 * used when the pricing endpoint is unreachable and as the legacy values
 * behind `previewArea`'s local estimate.
 */

/**
 * Offline-fallback token price per submitted job (tile). The gateway's
 * action rail charges `analysisType[type].tokens` per job (v2.4); as of
 * 2026-07 every analysis type prices at 10, matching this constant. Prefer
 * `previewAreaWithPricing()` / `resolveTokensPerJob()` for a live quote.
 */
declare const DEFAULT_TOKENS_PER_JOB = 10;
/** Offline heuristic: estimated wall-clock seconds per tile for previews. */
declare const ESTIMATED_SECONDS_PER_TILE = 10;
/**
 * Lenient view of the gateway's public pricing document
 * (`GET {gatewayBaseUrl}/billing/pricing`). All fields are optional on
 * purpose — the SDK must tolerate additive server-side changes and partial
 * documents without breaking, falling back field-by-field.
 */
interface PublicPricing {
    /** Pricing document version identifier. */
    version?: string | number;
    /**
     * v2.4 analysis catalog — keyed by analysis model name, which is exactly
     * the SDK's `AnalysesName` string value (e.g. `wind-speed`,
     * `solar-radiation`). This is what the gateway's action rail ACTUALLY
     * charges per submitted job (`POST /internal/actions/start`). Prefer this
     * over `perJob`/`actionCatalog`, which v2.4 gateway deployments no longer
     * populate.
     */
    analysisType?: Record<string, {
        tokens?: number;
    }>;
    /**
     * Unified workflow-RUN pricing matrix `{<workflowId>: {<bracket>: tokens}}`
     * — the authoritative charge for `POST /internal/workflows/start`. See
     * `estimateWorkflowRunTokens()`.
     */
    workflows?: Record<string, Record<string, number>>;
    /**
     * Area-tier metadata keyed by bracket name (e.g. `local`,
     * `neighbourhood`), each `{maxKm2}` — the tier's inclusive upper area
     * bound (`null` = unbounded top tier). Prices live in `workflows`; this
     * only maps area → bracket name. See `resolveBracketName()`.
     */
    brackets?: Record<string, {
        maxKm2: number | null;
    }>;
    /**
     * @deprecated Dropped server-side in gateway v2.4 (superseded by
     * `analysisType`). Kept for backward compatibility with pre-v2.4 pricing
     * documents — `resolveTokensPerJob()` only consults this when
     * `analysisType` and `actionCatalog` are both absent/invalid.
     */
    perJob?: Record<string, {
        tokens?: number;
    }>;
    /**
     * @deprecated Dropped server-side in gateway v2.4 (superseded by
     * `analysisType`). Kept for backward compatibility with pre-v2.4 pricing
     * documents.
     */
    actionCatalog?: Record<string, {
        tokens?: number;
    }>;
    /** ISO timestamp the document became effective. */
    effectiveFrom?: string;
    /** Tolerate additive fields without a type break. */
    [extra: string]: unknown;
}
/**
 * Map from SDK analysis type to the gateway pricing document's `perJob`
 * model key.
 */
declare const PER_JOB_MODEL_KEYS: Readonly<Record<AnalysesName, string>>;
/**
 * Resolve the per-job token price for an analysis type from a public
 * pricing document.
 *
 * Resolution order (first valid — finite, non-negative — value wins):
 *   1. `analysisType[type].tokens` — gateway v2.4: what the action rail
 *      ACTUALLY charges per submitted job. Keys are exactly the SDK's
 *      `AnalysesName` string values, so no mapping table is needed.
 *   2. `actionCatalog['run-analysis'].tokens` — pre-v2.4 flat action price.
 *   3. `perJob[modelKey].tokens` — pre-v2.4 per-model price for the type.
 *   4. `perJob['default'].tokens` — pre-v2.4 document-level default.
 *   5. `DEFAULT_TOKENS_PER_JOB` — offline fallback constant.
 *
 * @param pricing - Public pricing document (lenient; may be partial).
 * @param analysisType - Analysis type to price.
 * @returns Tokens charged per submitted job.
 */
declare function resolveTokensPerJob(pricing: PublicPricing, analysisType: AnalysesName): number;
/**
 * Resolve the area-tier bracket name for a polygon area from a public
 * pricing document's `brackets` map.
 *
 * Tiers are ordered ascending by `maxKm2` (a `null` `maxKm2` sorts last —
 * it represents an unbounded top tier). Returns the first tier whose
 * `maxKm2` is `null` or `>= areaKm2`.
 *
 * @param pricing - Public pricing document (lenient; may be partial).
 * @param areaKm2 - Polygon area in square kilometers.
 * @returns The bracket name, or `null` if `brackets` is absent/empty or
 *   `areaKm2` exceeds every finite tier (mirrors the server's fail-closed
 *   behavior — callers should show "exceeds maximum area", never a number).
 */
declare function resolveBracketName(pricing: PublicPricing, areaKm2: number): string | null;
/**
 * Estimate the token cost of a workflow run for a given area from a public
 * pricing document.
 *
 * Resolves the area to a bracket via `resolveBracketName()`, then looks up
 * `workflows[workflowId][bracket]`. Returns `null` on any gap — unknown
 * workflow id, unresolvable bracket, or missing matrix cell — mirroring the
 * gateway's fail-closed `WORKFLOW_UNAVAILABLE` behavior. Never guesses a
 * number for an unpriced combination.
 *
 * @param pricing - Public pricing document (lenient; may be partial).
 * @param workflowId - Workflow id (matrix row key).
 * @param areaKm2 - Polygon area in square kilometers.
 * @returns `{tokens, bracket}` on a full match, else `null`.
 */
declare function estimateWorkflowRunTokens(pricing: PublicPricing, workflowId: string, areaKm2: number): {
    tokens: number;
    bracket: string;
} | null;

/**
 * Billing service client.
 *
 * Fetches the gateway's PUBLIC pricing document (`GET /billing/pricing`,
 * no auth required) with a short TTL cache and in-flight deduplication so
 * repeated previews don't hammer the endpoint.
 *
 * Errors PROPAGATE to the caller — the fallback decision (offline constants
 * vs remote price) is made in `InfraredClient.previewAreaWithPricing`, not
 * here, so direct consumers of the service see real failures.
 */

interface BillingServiceConfig {
    /**
     * Bare gateway URL — the pricing endpoint lives at
     * `{gatewayBaseUrl}/billing/pricing`. `InfraredClient` passes its resolved
     * `gatewayBaseUrl` here.
     */
    gatewayBaseUrl: string;
    logger: Logger;
    /** Request timeout in milliseconds. */
    timeout?: number;
    /** Maximum number of retries for retryable errors. Default: 2 */
    maxRetries?: number;
    /** Cache TTL in milliseconds. Default: 300_000 (5 minutes). */
    cacheTtlMs?: number;
}
/**
 * Interface for dependency injection and testing.
 */
interface IBillingService {
    getPricing(opts?: {
        forceRefresh?: boolean;
    }): Promise<PublicPricing>;
}
/**
 * Service for reading public billing/pricing data from the gateway.
 *
 * The endpoint is public (`auth: none` on the gateway route), so the
 * underlying `HttpClient` is built with a NO-OP auth resolver — no
 * `Authorization` or `X-Api-Key` headers are sent.
 */
declare class BillingService implements IBillingService {
    private httpClient;
    private logger;
    private cacheTtlMs;
    private cached;
    private cacheExpiresAt;
    private inflight;
    constructor(config: BillingServiceConfig);
    /**
     * Get the current public pricing document.
     *
     * Serves from a 5-minute TTL cache; concurrent callers share a single
     * in-flight fetch. `forceRefresh: true` bypasses both cache and dedupe.
     *
     * @throws On network / HTTP / malformed-body errors — no silent fallback.
     */
    getPricing(opts?: {
        forceRefresh?: boolean;
    }): Promise<PublicPricing>;
}

export { BillingService, type BillingServiceConfig, DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE, type IBillingService, PER_JOB_MODEL_KEYS, type PublicPricing, estimateWorkflowRunTokens, resolveBracketName, resolveTokensPerJob };
