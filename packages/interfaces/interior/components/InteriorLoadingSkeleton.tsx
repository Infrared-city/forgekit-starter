import { Loader2 } from 'lucide-react'
import { Skeleton } from 'ui'

/**
 * InteriorLoadingSkeleton — loading placeholder shown while InteriorCanvas lazy-loads.
 *
 * Mirrors the MapLoadingSkeleton pattern: simulated 3D-viewer background with a
 * centered Loader2 spinner + label and fake UI placeholders.
 */
export function InteriorLoadingSkeleton() {
  return (
    <div className="relative w-full h-full bg-muted">
      {/* Simulated 3D viewer background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10" />

      {/* Center loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-card/80 backdrop-blur-sm rounded-lg p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading 3D viewer...</span>
        </div>
      </div>

      {/* Fake toolbar placeholder */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}
