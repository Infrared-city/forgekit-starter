import { RotateCw } from 'lucide-react'
import { Button, Skeleton } from 'ui'
import { MIN_QUERY } from './helpers'

export function SkeletonRows() {
  return (
    <div className="space-y-1 p-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-2">
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyRow({ query }: { query: string }) {
  const trimmed = query.trim()
  return (
    <div className="px-3 py-4 text-sm text-muted-foreground">
      {trimmed.length >= MIN_QUERY ? `No matches for "${trimmed}"` : 'Type to search a place'}
    </div>
  )
}

export function ErrorRow({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
      <span className="text-destructive">{message ?? 'Search failed'}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRetry} className="gap-1">
        <RotateCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  )
}
