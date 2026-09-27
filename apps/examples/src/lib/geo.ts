// Small geometry helpers. GeoJSON order is ALWAYS [longitude, latitude].

export interface LatLon {
  lat: number
  lon: number
}

export interface Polygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}

/**
 * A square of `sizeM` metres centred on a point. For solar, daylight and
 * thermal analyses use 512 m or more: one tile is 512 m x 512 m, and a
 * smaller area costs the same. Wind tiles are 256 m apart, so a 512 m square
 * is 4 wind tiles and a 256 m square is 1.
 */
export function squareAround(center: LatLon, sizeM = 512): Polygon {
  const dLat = sizeM / 2 / 111_320
  const dLon = sizeM / 2 / (111_320 * Math.cos((center.lat * Math.PI) / 180))
  const { lat, lon } = center
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lon - dLon, lat - dLat],
        [lon + dLon, lat - dLat],
        [lon + dLon, lat + dLat],
        [lon - dLon, lat + dLat],
        [lon - dLon, lat - dLat],
      ],
    ],
  }
}

/**
 * Address to coordinates with OpenStreetMap Nominatim (free, max 1 request a
 * second, fine for a demo). For a real product use a paid geocoder.
 */
export async function geocode(address: string): Promise<LatLon & { label: string }> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Geocoding failed (HTTP ${res.status})`)
  const hits = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  if (hits.length === 0) throw new Error(`No place found for "${address}"`)
  return { lat: Number(hits[0].lat), lon: Number(hits[0].lon), label: hits[0].display_name }
}
