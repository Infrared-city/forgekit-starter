import { api } from './api'

export interface UsageUnitRow {
  unitId: string
  unitType: 'action' | 'workflow' | 'inference'
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  paymentPath: 'token' | 'payg' | 'mixed'
  actionId?: string
  analysisType?: string
  workflowId?: string
  runWorkflowId?: string
  tokensConsumed: number
  tokensRefunded: number
  tokensNet: number
  bucketBreakdown?: Record<string, number>
  paygQuantity?: number
  startedAt: string
  completedAt?: string
}

export interface UsageUnitsResponse {
  rows: UsageUnitRow[]
  nextCursor: string | null
}

export interface AnalysisUsage {
  tokensConsumed: number
  tokensRefunded: number
  tokensNet: number
  bucketBreakdown: Record<string, number>
  rowCount: number
}

const MAX_PAGES = 10
const PAGE_LIMIT = 100

export async function fetchAnalysisUsage(params: {
  from: string
  to: string
  analysisType?: string
}): Promise<AnalysisUsage> {
  const aggregate: AnalysisUsage = {
    tokensConsumed: 0,
    tokensRefunded: 0,
    tokensNet: 0,
    bucketBreakdown: {},
    rowCount: 0,
  }

  let cursor: string | null = null
  let pages = 0

  do {
    const search = new URLSearchParams({
      unitType: 'action',
      from: params.from,
      to: params.to,
      limit: String(PAGE_LIMIT),
    })
    if (params.analysisType) search.set('analysisType', params.analysisType)
    if (cursor) search.set('cursor', cursor)

    const page = await api.get<UsageUnitsResponse>(`/billing/usage-units?${search.toString()}`)

    for (const row of page.rows) {
      if (row.status !== 'succeeded') continue
      aggregate.tokensConsumed += row.tokensConsumed
      aggregate.tokensRefunded += row.tokensRefunded
      aggregate.rowCount += 1
      if (row.bucketBreakdown) {
        for (const [bucket, amount] of Object.entries(row.bucketBreakdown)) {
          aggregate.bucketBreakdown[bucket] = (aggregate.bucketBreakdown[bucket] ?? 0) + amount
        }
      }
    }

    cursor = page.nextCursor
    pages += 1
  } while (cursor && pages < MAX_PAGES)

  // Fail closed if the window still has more rows after the page cap.
  // Returning a partial aggregate would render a normal-looking but
  // materially wrong "Actual cost" — the UI surfaces the throw as
  // "Unavailable" via React Query, which is the correct outcome.
  if (cursor) {
    throw new Error(
      `Billing window exceeded ${MAX_PAGES * PAGE_LIMIT} rows — refusing to render a partial aggregate. Narrow the window or raise the cap.`,
    )
  }

  aggregate.tokensNet = aggregate.tokensConsumed - aggregate.tokensRefunded
  return aggregate
}
