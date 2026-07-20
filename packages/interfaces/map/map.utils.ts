import type { LngLatType } from './types'

const R = 6371000 // Earth radius in meters

interface PointWithLatLng {
  lat: number
  lng: number
}

export const calculateDistance = (p1: PointWithLatLng, p2: PointWithLatLng): number => {
  const ph1 = (p1.lat * Math.PI) / 180
  const ph2 = (p2.lat * Math.PI) / 180
  const dPh = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLa = ((p2.lng - p1.lng) * Math.PI) / 180

  const a =
    Math.sin(dPh / 2) * Math.sin(dPh / 2) +
    Math.cos(ph1) * Math.cos(ph2) * Math.sin(dLa / 2) * Math.sin(dLa / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const filterPointsByBounds = (
  points: PointWithLatLng[],
  bounds: { north: number; south: number; east: number; west: number },
) => {
  return points.filter(
    (p) =>
      p.lat <= bounds.north &&
      p.lat >= bounds.south &&
      p.lng <= bounds.east &&
      p.lng >= bounds.west,
  )
}
const convertMetersToDegrees = (lat: number, meters: number): number => {
  return meters / (R * Math.cos((lat * Math.PI) / 180) * (Math.PI / 180))
}

export const getRectangleVertices = (
  lat: number,
  lng: number,
  width: number,
  height: number,
): LngLatType[] => {
  const latOffset = (height / (2 * R)) * (180 / Math.PI)
  const lngOffset = convertMetersToDegrees(lat, width / 2)

  return [
    { lng: lng - lngOffset, lat: lat + latOffset }, // 0 Top-left NW
    { lng: lng + lngOffset, lat: lat + latOffset }, // 1 Top-right NE
    { lng: lng + lngOffset, lat: lat - latOffset }, // 2 Bottom-right SE
    { lng: lng - lngOffset, lat: lat - latOffset }, // 3 Bottom-left SW
    { lng: lng - lngOffset, lat: lat + latOffset }, // 0 Top-left NW
  ]
}

export const getSouthWestFromViewPort = (
  coordinates: { lat: number; lng: number },
  size: { width: number; height: number },
): LngLatType => {
  const latOffset = (size.height / (2 * R)) * (180 / Math.PI)
  const lngOffset = convertMetersToDegrees(coordinates.lat, size.width / 2)

  return { lng: coordinates.lng - lngOffset, lat: coordinates.lat - latOffset }
}
