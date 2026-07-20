/**
 * Viewport specification for building queries.
 * Defines a geographic rectangle by center point and dimensions in meters.
 */
export interface Viewport {
  latitude: number
  longitude: number
  width: number
  height: number
}
