import { MapPin } from 'lucide-react'
import { useCallback, useState } from 'react'

export function CoordinateDisplay() {
  const [coords] = useState<{ lat: number; lng: number } | null>(null)

  // This component displays coordinates - the actual coordinate tracking
  // would need to be connected via the DeckGL onHover callback
  // For now, we'll show a placeholder that can be connected later

  if (!coords) {
    return null
  }

  return (
    <div
      className="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-mono shadow-md border border-border"
      role="status"
      aria-label="Current map coordinates"
    >
      <MapPin className="w-3 h-3 text-muted-foreground" />
      <span className="text-muted-foreground">
        {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
      </span>
    </div>
  )
}

// Hook for tracking cursor coordinates
export function useCoordinateTracker() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleHover = useCallback((info: any) => {
    if (info.coordinate) {
      setCoords({
        lng: info.coordinate[0],
        lat: info.coordinate[1],
      })
    } else {
      setCoords(null)
    }
  }, [])

  return { coords, handleHover }
}
