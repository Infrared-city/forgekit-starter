import { Loader2 } from 'lucide-react'
import { Skeleton } from 'ui'

export function MapLoadingSkeleton() {
  return (
    <div className="relative w-full h-full bg-muted">
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10" />

      {/* Center loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-card/80 backdrop-blur-sm rounded-lg p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>

      {/* Fake UI placeholders */}
      <div className="absolute top-4 left-4">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="absolute bottom-4 left-4">
        <Skeleton className="h-6 w-48" />
      </div>
    </div>
  )
}
