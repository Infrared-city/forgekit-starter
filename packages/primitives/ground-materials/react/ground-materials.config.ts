import type { MetersToLatLngFn } from '../core/ground-materials.types'

// ---------------------------------------------------------------------------
// Module-level metersToLatLng ref -- set by the plugin hook
// ---------------------------------------------------------------------------

let _metersToLatLng: MetersToLatLngFn | null = null

/** Set the metersToLatLng function used by import processing. Called by the plugin hook. */
export function setMetersToLatLng(fn: MetersToLatLngFn): void {
  _metersToLatLng = fn
}

/** Get the metersToLatLng function. Throws if not set. */
export function getMetersToLatLng(): MetersToLatLngFn {
  if (!_metersToLatLng) {
    throw new Error(
      '@forge-kit/ground-materials: metersToLatLng not set. ' +
        'Ensure useGroundMaterialsMapPlugin() is called before import processing.',
    )
  }
  return _metersToLatLng
}
