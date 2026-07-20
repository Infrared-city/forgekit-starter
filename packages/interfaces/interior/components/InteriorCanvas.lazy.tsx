import { lazy, Suspense } from 'react'
import type { InteriorCanvasProps } from './InteriorCanvas'
import { InteriorLoadingSkeleton } from './InteriorLoadingSkeleton'

const InteriorCanvasLazy = lazy(() =>
  import('./InteriorCanvas').then((mod) => ({ default: mod.InteriorCanvas })),
)

/**
 * InteriorCanvasWithSuspense — lazy-loaded InteriorCanvas with Suspense boundary.
 *
 * Follows the MapCanvasWithSuspense pattern. The heavy ThatOpen / Three.js
 * imports are code-split into a separate chunk so the interior route doesn't
 * bloat the initial bundle.
 */
export function InteriorCanvasWithSuspense(props: InteriorCanvasProps) {
  return (
    <Suspense fallback={<InteriorLoadingSkeleton />}>
      <InteriorCanvasLazy {...props} />
    </Suspense>
  )
}
