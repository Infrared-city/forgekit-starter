/**
 * What a tile costs, in one place.
 *
 * The SDK quotes a price in two situations — a preview (`previewArea`) and the
 * refusal a caller gets when a polygon plans more tiles than the cap allows.
 * A refusal is composed offline, before any HTTP, so it has no live gateway
 * pricing to read; `previewAreaWithPricing` is the call that does. Keeping the
 * fallback here, in a module with no imports, lets `area/tiling.ts` quote the
 * same number the preview quotes without dragging the billing service into the
 * lean `/tiling` entry point.
 *
 * `billing.ts` re-exports both, so every existing import path is unchanged.
 * The Python SDK holds the same constant in `_internal/pricing.py`; the two
 * move together or the two SDKs quote different money for the same run.
 */
/** Tokens billed for one tile-sized job, absent live gateway pricing. */
export const DEFAULT_TOKENS_PER_JOB = 10;
/** Rough wall-clock seconds one tile-sized job takes. */
export const ESTIMATED_SECONDS_PER_TILE = 10;
