import { lazy, Suspense } from 'react'
import type { MapCanvasProps } from './MapCanvas'
import { MapLoadingSkeleton } from './MapLoadingSkeleton'

const MapCanvasLazy = lazy(() => import('./MapCanvas').then((mod) => ({ default: mod.MapCanvas })))

export function MapCanvasWithSuspense(props: MapCanvasProps) {
  return (
    <Suspense fallback={<MapLoadingSkeleton />}>
      <MapCanvasLazy {...props} />
    </Suspense>
  )
}
