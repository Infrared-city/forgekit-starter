import { IconLayer } from 'deck.gl'

export interface MarkerLayerOptions {
  selectedId?: string
}

export interface MapPoint {
  id: string
  latitude: number
  longitude: number
  name?: string
}

/**
 * Creates an IconLayer for map markers.
 */
export function createMarkerLayer(
  markers: MapPoint[],
  options: MarkerLayerOptions = {},
): IconLayer {
  const { selectedId } = options

  return new IconLayer({
    id: 'marker-layer',
    data: markers,
    getPosition: (d) => [d.longitude, d.latitude, 0],
    getIcon: () => 'marker',
    getSize: (d) => (d.id === selectedId ? 48 : 32),
    getColor: (d) => (d.id === selectedId ? [255, 200, 0] : [255, 100, 100]),
    pickable: true,
  })
}
