/**
 * Tile-merge strategy passthrough for SDK 0.10+ `runAreaAndWait` opts.
 *
 * Callers set `strategy` + `windDirectionDeg` on the RunAreaInput extras
 * index signature for wind-speed runs. The SDK throws if directional
 * strategies are sent without `windDirectionDeg` or for non-wind analyses,
 * so this helper forwards them only when both are present and the analysis
 * type is wind-speed. Returns an empty object otherwise (safe to spread).
 */
import type { RunAreaInput } from './analysis.area-run-api'

type MergeStrategy = 'directional' | 'directional_blend'

export interface MergeStrategyOpts {
  strategy?: MergeStrategy
  windDirectionDeg?: number
}

export function resolveMergeStrategy(input: RunAreaInput, analysisType: string): MergeStrategyOpts {
  if (analysisType !== 'wind-speed') return {}
  const strategy = (input as { strategy?: string }).strategy
  const windDirectionDeg = (input as { windDirectionDeg?: number }).windDirectionDeg
  if (strategy !== 'directional' && strategy !== 'directional_blend') {
    console.debug('[resolveMergeStrategy] no strategy on input — centre-crop default', {
      analysisType,
      strategy,
      windDirectionDeg,
    })
    return {}
  }
  if (typeof windDirectionDeg !== 'number') {
    console.debug('[resolveMergeStrategy] strategy set but windDirectionDeg missing', {
      strategy,
      windDirectionDeg,
    })
    return {}
  }
  console.debug('[resolveMergeStrategy] applying →', { strategy, windDirectionDeg })
  return { strategy, windDirectionDeg }
}
