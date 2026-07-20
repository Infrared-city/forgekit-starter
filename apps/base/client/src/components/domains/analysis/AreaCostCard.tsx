import type { AreaPreviewQueryResult } from '@forge-kit/analysis'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Badge, Button, Card, CardContent, Skeleton } from 'ui'
import { fetchAnalysisUsage } from '../../../lib/billing'

/**
 * Threshold above which the cost card warns the user that the run may
 * exceed the Lambda 15-minute cap. Advisory only — does NOT block the run.
 * 720 s = 12 min leaves a 3-min buffer under the 900 s SDK default.
 */
const OVER_BUDGET_THRESHOLD_S = 720

/** Format tile count as `N tile` / `N tiles` (singular/plural). */
export function formatTileCount(n: number): string {
  return `${n} tile${n === 1 ? '' : 's'}`
}

/** Format seconds as `~N s`, `~N min`, or `~N h` depending on magnitude. */
export function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `~${Math.round(seconds)} s`
  if (seconds < 3600) return `~${Math.round(seconds / 60)} min`
  return `~${Math.round(seconds / 3600)} h`
}

/** Format token count with thousands separators: `~1,200 tokens`. */
export function formatEstimatedCost(tokens: number): string {
  return `~${tokens.toLocaleString('en-US')} tokens`
}

/** Format an exact token count: `1,200 tokens`. */
export function formatActualCost(tokens: number): string {
  return `${tokens.toLocaleString('en-US')} tokens`
}

const CLOCK_SKEW_MS = 5000

export interface AreaActualCostCardProps {
  startedAt: string
  completedAt: string
  analysisType: string
}

/**
 * Post-run sibling to {@link AreaCostCard}: queries the billing-service for
 * the real token cost incurred during a run's time window and renders it in
 * the same card layout. Widens the window ±5s to absorb clock skew between
 * the browser and the ledger writer.
 */
export function AreaActualCostCard({
  startedAt,
  completedAt,
  analysisType,
}: AreaActualCostCardProps) {
  const usageQuery = useQuery({
    queryKey: ['billing-usage', startedAt, completedAt, analysisType],
    queryFn: () =>
      fetchAnalysisUsage({
        from: new Date(new Date(startedAt).getTime() - CLOCK_SKEW_MS).toISOString(),
        to: new Date(new Date(completedAt).getTime() + CLOCK_SKEW_MS).toISOString(),
        analysisType,
      }),
    staleTime: Infinity,
    retry: 3,
    retryDelay: 2000,
  })

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Actual cost</span>
          {usageQuery.isPending ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculating…
            </span>
          ) : usageQuery.isError ? (
            <span className="text-muted-foreground">Unavailable</span>
          ) : usageQuery.data ? (
            <span className="font-medium text-foreground">
              {formatActualCost(usageQuery.data.tokensConsumed)}
            </span>
          ) : null}
        </div>
        {usageQuery.data && usageQuery.data.tokensRefunded > 0 ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Refunded</span>
            <span className="text-muted-foreground">
              {formatActualCost(usageQuery.data.tokensRefunded)}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export interface AreaCostCardProps {
  /** Preview query result from `useAreaPreview()`. */
  query: AreaPreviewQueryResult
  /** Called when the user clicks "Run analysis". */
  onRun: () => void
}

/**
 * Presentational cost card for the area tab.
 *
 * Renders one of four states driven purely by the preview query:
 *
 *   1. `isPending`          → skeleton rows + disabled run button
 *   2. `isError`            → inline error message + Retry button + disabled run
 *   3. `data.tileCount > 0` → three stats + enabled run button (+ over-budget badge if applicable)
 *   4. `data.tileCount === 0` → "outside tileable area" message + disabled run
 *
 * All state lives in the query object — this component is a pure view and
 * does NOT read the store directly.
 */
export function AreaCostCard({ query, onRun }: AreaCostCardProps) {
  const { data, isPending, isError, error, refetch } = query

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-3">
        {isPending ? (
          <>
            <output className="block space-y-2" aria-label="Loading area preview">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </output>
            <Button type="button" disabled className="w-full">
              Run analysis
            </Button>
          </>
        ) : isError ? (
          <>
            <div className="text-sm text-destructive">
              {error?.message ?? 'Failed to load area preview'}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button type="button" disabled className="flex-1">
                Run analysis
              </Button>
            </div>
          </>
        ) : data && data.tileCount === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              0 tiles &mdash; polygon is outside the tileable area
            </p>
            <Button type="button" disabled className="w-full">
              Run analysis
            </Button>
          </>
        ) : data ? (
          <>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tiles</span>
                <span className="font-medium text-foreground">
                  {formatTileCount(data.tileCount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated time</span>
                <span className="font-medium text-foreground">
                  {formatEstimatedTime(data.estimatedTimeS)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated cost</span>
                <span className="font-medium text-foreground">
                  {formatEstimatedCost(data.estimatedCostTokens)}
                </span>
              </div>
            </div>
            {data.estimatedTimeS > OVER_BUDGET_THRESHOLD_S && (
              <Badge
                variant="outline"
                className="w-full justify-center gap-1.5 border-yellow-500/40 bg-yellow-500/10 py-1 text-yellow-700 dark:text-yellow-400"
              >
                <AlertTriangle className="h-3 w-3" />
                May exceed server timeout
              </Badge>
            )}
            <Button type="button" onClick={onRun} className="w-full">
              Run analysis
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
