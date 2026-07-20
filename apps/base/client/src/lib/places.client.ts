import { createPlacesClient } from '@forge-kit/map-interface'
import { api } from './api'
import { useAuthStore } from './auth.store'

/**
 * Singleton Google Places client for the /map LocationSearch overlay. Wires
 * the map interface package to the host app's API base URL (mirrors
 * `lib/api.ts`) and the auth store so the JWT bearer is picked up fresh on
 * every request (handles token rotation between sign-in and search).
 */
export const placesClient = createPlacesClient({
  baseUrl: api.baseUrl,
  getToken: () => useAuthStore.getState().idToken,
})
