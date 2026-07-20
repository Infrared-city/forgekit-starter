import { useAnalysisStore } from '@forge-kit/analysis'
import { MousePointerClick } from 'lucide-react'
import { Card } from 'ui'

/**
 * Floating corner hint shown while the user is actively drawing a polygon
 * in area mode. Renders ONLY when `areaMode && !areaPolygon && areaDrawing`.
 * Auto-hides on polygon completion (the draw hook flips `areaDrawing` back
 * to false on the terminal `addFeature` event and writes `areaPolygon`).
 *
 * Mounted by the analysis plugin's `Overlay` — NOT by the sidebar panel —
 * because the hint has to sit on top of the map canvas, not inside the
 * sidebar column.
 */
export function AreaDrawLegend() {
  'use no memo' // reads the store directly; no deep memo tricks needed
  const show = useAnalysisStore((s) => s.areaMode && !s.areaPolygon && s.areaDrawing)

  if (!show) return null

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <Card className="pointer-events-auto flex flex-row items-center gap-2 border border-border/80 bg-background/95 px-3 py-2 shadow-md backdrop-blur">
        <MousePointerClick className="h-4 w-4 text-sky-500" aria-hidden="true" />
        <p className="text-xs text-foreground">Click to add vertices, double-click to finish</p>
      </Card>
    </div>
  )
}
