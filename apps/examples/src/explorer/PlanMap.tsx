// The 2D view: the plan drawing in a Leaflet map with a flat coordinate
// system (CRS.Simple). One map unit = one metre; lat = y (north), lng = x (east).
// No map tiles are loaded, so it works offline. Pan, zoom and pinch work on phones.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { SCENE_SIZE_M } from '../demo/scene-layout'

const LABELS: ReadonlyArray<[string, number, number]> = [
  ['Linden Street', 124, 180],
  ['Canyon', 60, 304],
  ['Courtyard', 63, 66],
  ['Tower (60 m)', 217, 178],
  ['Lake', 395, 135],
  ['Hill (20 m)', 420, 392],
  ['Park', 330, 250],
]

interface Props {
  image: string
  onHover: (p: { x: number; y: number } | null) => void
}

export function PlanMap({ image, onHover }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.ImageOverlay | null>(null)
  const hover = useRef(onHover)
  hover.current = onHover

  useEffect(() => {
    if (!el.current) return
    const bounds = L.latLngBounds([0, 0], [SCENE_SIZE_M, SCENE_SIZE_M])
    const m = L.map(el.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      zoomSnap: 0.25,
      attributionControl: false,
      maxBounds: bounds.pad(0.3),
    })
    m.fitBounds(bounds, { padding: [10, 10] })
    for (const [text, x, y] of LABELS) {
      L.marker([y, x], {
        interactive: false,
        icon: L.divIcon({
          className: 'plan-label',
          html: `<span>${text}</span>`,
          iconSize: [0, 0],
        }),
      }).addTo(m)
    }
    const report = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      const inside = lat >= 0 && lng >= 0 && lat < SCENE_SIZE_M && lng < SCENE_SIZE_M
      hover.current(inside ? { x: lng, y: lat } : null)
    }
    m.on('mousemove', report)
    m.on('click', report) // phones have no hover: tap to read a value
    m.on('mouseout', () => hover.current(null))
    const resize = new ResizeObserver(() => m.invalidateSize())
    resize.observe(el.current)
    map.current = m
    return () => {
      resize.disconnect()
      m.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    layer.current?.remove()
    layer.current = L.imageOverlay(image, [
      [0, 0],
      [SCENE_SIZE_M, SCENE_SIZE_M],
    ]).addTo(m)
    layer.current.getElement()?.style.setProperty('image-rendering', 'pixelated')
  }, [image])

  return <div ref={el} className="plan-map" data-testid="plan-map" />
}
