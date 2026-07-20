/** Suggestion row returned by the `/places/autocomplete` proxy. */
export interface PlaceSuggestion {
  placeId: string
  /** Bold first line. */
  primaryText: string
  /** Muted second line (locality / country). May be null for very generic hits. */
  secondaryText: string | null
  /** Google place types. Used to pick the row icon. */
  types: string[]
}

/** Resolved details — coordinates + normalized address components. */
export interface PlaceDetails {
  placeId: string
  formatted: string
  name: string | null
  coordinates: { lat: number; lng: number }
  locality: string | null
  region: string | null
  country: string | null
  types: string[]
}

/** Optional circular viewport bias for autocomplete. Radius is in meters. */
export interface LocationBias {
  lat: number
  lng: number
  radiusMeters: number
}

export interface AutocompleteOptions {
  signal?: AbortSignal
  sessionToken?: string
  languageCode?: string
  locationBias?: LocationBias
}

export interface DetailsOptions {
  signal?: AbortSignal
  sessionToken?: string
}

export interface PlacesClient {
  autocomplete(input: string, opts?: AutocompleteOptions): Promise<PlaceSuggestion[]>
  details(placeId: string, opts?: DetailsOptions): Promise<PlaceDetails>
  reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<PlaceDetails>
}
