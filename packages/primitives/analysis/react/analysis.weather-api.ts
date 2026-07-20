import { useQuery } from '@tanstack/react-query'
import type { EPWData } from '../core/analysis.sdk-types'

/**
 * SDK client surface the weather hooks need. The composition root provides
 * the InfraredClient's `weather` service. `TStation` lets the caller pin the
 * station shape (the platform infers it as the SDK's `WeatherLocation`),
 * keeping the primitive SDK-agnostic while giving consumers precise types —
 * defaults to `unknown` so existing untyped callers are unaffected.
 */
export interface WeatherSdkClient<TStation = unknown> {
  weather: {
    getWeatherFileFromLocation: (lat: number, lon: number, radius?: number) => Promise<TStation[]>
    getWeatherFileFromIdentifier: (identifier: string) => Promise<Record<string, unknown>>
  }
}

/**
 * @deprecated Use WeatherSdkClient instead
 */
export interface AnalysisApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
}

/**
 * Weather query key factories. Defined locally to avoid dependency on
 * the app-level query-keys module.
 */
export const weatherKeys = {
  all: ['weather'] as const,
  stations: (lat: number, lng: number, radius?: number) =>
    [...weatherKeys.all, 'stations', lat, lng, radius] as const,
  data: (identifier: string, filters: unknown) =>
    [...weatherKeys.all, 'data', identifier, filters] as const,
  full: (identifier: string) => [...weatherKeys.all, 'full', identifier] as const,
}

/**
 * Location data included with full weather response
 */
interface LocationData {
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  time_zone: number
  elevation: number
  station_id: string
  source: string
  type: string
}

/**
 * Full weather data response including metadata and EPW data
 */
export interface FullWeatherData {
  uuid: string
  fileName: string
  location_data: LocationData
  weatherData: EPWData
}

/**
 * Create weather station hooks with an injected SDK client.
 */
export function createWeatherHooks<TStation = unknown>(sdkClient: WeatherSdkClient<TStation>) {
  function useWeatherStations(latitude: number, longitude: number, radius?: number) {
    return useQuery({
      queryKey: weatherKeys.stations(latitude, longitude, radius),
      queryFn: async () =>
        sdkClient.weather.getWeatherFileFromLocation(latitude, longitude, radius ?? 1000),
      staleTime: 10 * 60 * 1000,
      enabled: Number.isFinite(latitude) && Number.isFinite(longitude),
    })
  }

  function useFullWeatherData(identifier: string | null) {
    return useQuery({
      queryKey: weatherKeys.full(identifier ?? ''),
      queryFn: async () => {
        if (!identifier) throw new Error('No identifier provided')
        return sdkClient.weather.getWeatherFileFromIdentifier(
          identifier,
        ) as unknown as Promise<FullWeatherData>
      },
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      enabled: !!identifier,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    })
  }

  return { useWeatherStations, useFullWeatherData }
}
