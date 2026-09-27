// A small Leaflet map with free OpenStreetMap tiles (no token needed).
// Click the map to move the analysis area. OSM tiles are fine for learning;
// for a public product, pick a tile provider and follow its usage policy.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { LatLon, Polygon } from '../lib/geo'

export interface Overlay {
  url: string
  /** [west, south, east, north] in degrees, from `result.bounds`. */
  bounds: readonly [number, number, number, number]
}

interface Props {
  center: LatLon
  area: Polygon
  overlay?: Overlay | null
  onPick?: (p: LatLon) => void
}

export function MapView({ center, area, overlay, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const areaLayer = useRef<L.Polygon | null>(null)
  const imageLayer = useRef<L.ImageOverlay | null>(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current).setView([center.lat, center.lon], 16)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) =>
      pickRef.current?.({ lat: e.latlng.lat, lon: e.latlng.lng }),
    )
    map.current = m
    return () => {
      m.remove()
      map.current = null
    }
    // Create the map once; later changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    areaLayer.current?.remove()
    const ring = area.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number])
    areaLayer.current = L.polygon(ring, { color: '#111', weight: 2, fill: false }).addTo(m)
    m.panTo([center.lat, center.lon])
  }, [area, center])

  useEffect(() => {
    const m = map.current
    if (!m) return
    imageLayer.current?.remove()
    imageLayer.current = null
    if (overlay) {
      const [w, s, e, n] = overlay.bounds
      imageLayer.current = L.imageOverlay(overlay.url, [
        [s, w],
        [n, e],
      ]).addTo(m)
      // Keep pixels sharp: one pixel is one 1 m cell.
      imageLayer.current.getElement()?.style.setProperty('image-rendering', 'pixelated')
    }
  }, [overlay])

  return <div ref={el} className="map" />
}
