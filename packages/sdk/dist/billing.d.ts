import type { AnalysesName } from "./analysis-types.js";
import { type ServiceOptions } from "./internal/service.js";
export { DEFAULT_TOKENS_PER_JOB, ESTIMATED_SECONDS_PER_TILE } from "./pricing.js";
export interface PublicPricing {
    readonly version?: string | number;
    readonly analysisType?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    readonly workflows?: Readonly<Record<string, Readonly<Record<string, number>>>>;
    readonly brackets?: Readonly<Record<string, {
        readonly maxKm2: number | null;
    }>>;
    readonly perJob?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    readonly actionCatalog?: Readonly<Record<string, {
        readonly tokens?: number;
    }>>;
    readonly effectiveFrom?: string;
    readonly [extra: string]: unknown;
}
export declare class BillingService {
    private readonly transport;
    constructor(options: ServiceOptions);
    getPublicPricing(): Promise<PublicPricing>;
}
export declare const PER_JOB_MODEL_KEYS: Readonly<Record<AnalysesName, string>>;
/** Resolve the actual gateway registry first, then documented legacy fallbacks. */
export declare function resolveTokensPerJob(pricing: PublicPricing, analysisType: AnalysesName): number;
export declare function resolveBracketName(pricing: PublicPricing, areaKm2: number): string | null;
export declare function estimateWorkflowRunTokens(pricing: PublicPricing, workflowId: string, areaKm2: number): {
    readonly tokens: number;
    readonly bracket: string;
} | null;
