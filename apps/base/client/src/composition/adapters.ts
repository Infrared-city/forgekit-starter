/**
 * Dependency adapters for cross-primitive wiring.
 *
 * These adapters bridge the gap between what the composition root knows
 * (stores, query clients, SDK client) and what each primitive plugin
 * declares as its dependency interface. They are intentionally thin --
 * just reading from stores or forwarding SDK calls.
 *
 * Only the weather adapter remains — it is consumed by the area-tiled
 * analysis slice to populate the weather station selector.
 */
import type { InfraredClient } from '@infrared-city/infrared-sdk-ts'

// ---------------------------------------------------------------------------
// Weather adapter
// ---------------------------------------------------------------------------

export function createWeatherAdapter(sdkClient: InfraredClient) {
  return {
    getWeatherStations: async (lat: number, lng: number) => {
      return sdkClient.weather.getWeatherFileFromLocation(lat, lng, 1000) as Promise<any[]>
    },
    getWeatherData: async (identifier: string) => {
      return sdkClient.weather.getWeatherFileFromIdentifier(identifier)
    },
  }
}
