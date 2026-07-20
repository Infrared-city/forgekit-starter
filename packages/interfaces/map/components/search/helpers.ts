import { Building2, Clock3, Globe2, MapPin } from 'lucide-react'
import type { ComponentType } from 'react'

export const DEBOUNCE_MS = 250
export const MIN_QUERY = 2
export const SESSION_TTL_MS = 5 * 60 * 1000

export function iconForTypes(types: string[]): ComponentType<{ className?: string }> {
  if (types.some((t) => ['country', 'administrative_area_level_1', 'continent'].includes(t)))
    return Globe2
  if (types.some((t) => ['locality', 'postal_town', 'sublocality', 'neighborhood'].includes(t)))
    return Building2
  if (types.some((t) => t === 'establishment' || t === 'point_of_interest')) return Building2
  return MapPin
}

export function iconForRecent(): ComponentType<{ className?: string }> {
  return Clock3
}

/** Map Mapbox/deck.gl zoom level → meter-scale radius for autocomplete bias. */
export function radiusForZoom(zoom: number | null): number {
  if (zoom == null || !Number.isFinite(zoom)) return 50_000
  const km = Math.max(0.25, 50 / 2 ** Math.max(0, zoom - 1))
  return Math.min(50_000, Math.round(km * 1000))
}

export function newSessionToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
