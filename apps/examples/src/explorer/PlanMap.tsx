// The 2D view: the plan drawing in a Leaflet map with a flat coordinate
// system (CRS.Simple). One map unit = one metre; lat = y (north), lng = x (east).
// No map tiles are loaded, so it works offline. Pan, zoom and pinch work on phones.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { SCENE_SIZE_M } from '../demo/scene-layout'
import { type MapTip, type Note, noteHtml } from './annotations'

export type { MapTip }

const LABELS: ReadonlyArray<[string, number, number]> = [
  ['Linden Street', 124, 180],
  ['Canyon', 60, 304],
  ['Courtyard', 63, 66],
  ['Tower (60 m)', 217, 178],
  ['Lake', 395, 135],
  ['Hill (20 m)', 420, 392],
  ['Hill tower (45 m)', 348, 298],
  ['Car park', 300, 30],
  ['Park', 330, 250],
]

/** A probe the user dropped with a click. Its tip shows the current layer's value. */
export interface Probe {
  id: number
  x: number
  y: number
  tip: MapTip | null
}

interface Props {
  image: string
  onHover: (p: { x: number; y: number } | null) => void
  tip?: MapTip | null
  probes?: readonly Probe[]
  /** A click on the map (x, y in metres). */
  onPick?: (p: { x: number; y: number }) => void
  /** A click on a probe: remove it. */
  onRemoveProbe?: (id: number) => void
  /** Annotation pins (high, low, notes) with the value at their point. */
  notes?: ReadonlyArray<Note & { tip: MapTip | null }>
}

function probeHtml(p: Probe, n: number): string {
  const chip = p.tip?.color ? `<i style="background:${p.tip.color}"></i>` : ''
  const text = (p.tip?.text ?? 'no value').replace(/[<>&]/g, '')
  return `<div class="probe"><b>${n}</b>${chip}<span>${text}</span></div>`
}

export function PlanMap({
  image,
  onHover,
  tip,
  probes = [],
  onPick,
  onRemoveProbe,
  notes = [],
}: Props) {
  const el = useRef<HTMLDivElement>(null)
  // Cursor position in pixels inside the map, and whether it is in the right half.
  const [at, setAt] = useState<{ x: number; y: number; flip: boolean } | null>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.ImageOverlay | null>(null)
  const hover = useRef(onHover)
  hover.current = onHover
  const pick = useRef(onPick)
  pick.current = onPick
  const remove = useRef(onRemoveProbe)
  remove.current = onRemoveProbe
  const probeLayer = useRef<L.LayerGroup | null>(null)
  const noteLayer = useRef<L.LayerGroup | null>(null)

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
      const p = e.containerPoint
      setAt(inside ? { x: p.x, y: p.y, flip: p.x > m.getSize().x / 2 } : null)
    }
    m.on('mousemove', report)
    m.on('click', (e: L.LeafletMouseEvent) => {
      report(e) // phones have no hover: a tap also reads the value
      const { lat, lng } = e.latlng
      if (lat >= 0 && lng >= 0 && lat < SCENE_SIZE_M && lng < SCENE_SIZE_M)
        pick.current?.({ x: lng, y: lat })
    })
    noteLayer.current = L.layerGroup().addTo(m)
    probeLayer.current = L.layerGroup().addTo(m)
    m.on('mouseout', () => {
      hover.current(null)
      setAt(null)
    })
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

  useEffect(() => {
    const group = probeLayer.current
    if (!group) return
    group.clearLayers()
    probes.forEach((p, i) => {
      L.marker([p.y, p.x], {
        icon: L.divIcon({ className: 'probe-pin', html: probeHtml(p, i + 1), iconSize: [0, 0] }),
        title: 'Click to remove',
      })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          remove.current?.(p.id)
        })
        .addTo(group)
    })
  }, [probes])

  useEffect(() => {
    const group = noteLayer.current
    if (!group) return
    group.clearLayers()
    for (const n of notes) {
      L.marker([n.y, n.x], {
        interactive: false,
        icon: L.divIcon({ className: 'note-anchor', html: noteHtml(n), iconSize: [0, 0] }),
      }).addTo(group)
    }
  }, [notes])

  return (
    <>
      <div ref={el} className="plan-map" data-testid="plan-map" />
      {tip && at && (
        <div
          className={`map-tip${at.flip ? ' flip' : ''}`}
          style={{ left: at.x, top: at.y }}
          data-testid="map-tip"
        >
          {tip.color && <i style={{ background: tip.color }} />}
          {tip.text}
        </div>
      )}
    </>
  )
}
