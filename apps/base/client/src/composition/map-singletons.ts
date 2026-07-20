// Module-level singletons for the /map route. Lives in composition (not the
// route file) to keep the route under the Infrared 400-line limit and so any
// future surface (preview iframe, embeds) can reuse the same wired clients.

import { useAuthStore } from '@/lib/auth.store'
import { placesClient as placesClientSingleton } from '@/lib/places.client'
import { createSdk } from '@/lib/sdk'

export const mapSdk = createSdk({ getToken: () => useAuthStore.getState().idToken ?? '' })
export const placesClient = placesClientSingleton
