// Re-exported from @forge-kit/geo-core — the single source of truth for the
// lng/lat <-> local-metres projection. Tree meshes build in polygon-bbox-SW
// local metres (mirrors the buildings convention), so they share buildings'
// METER_OFFSETS depth space. Kept as a stable import path for vegetation
// consumers.
export { computeOriginFromPolygon, latLngToMetersLocal } from '@forge-kit/geo-core'
