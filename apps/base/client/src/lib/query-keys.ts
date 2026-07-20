// Centralized Query Key Factory
// This ensures consistency across the app for caching and invalidation

export const mapKeys = {
  all: ['map'] as const,
  points: (filters?: { regionId?: string }) => [...mapKeys.all, 'points', filters] as const,
  detail: (id: string) => [...mapKeys.all, 'detail', id] as const,
}

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  profile: (id: string) => [...userKeys.all, 'profile', id] as const,
}

export const apikeysKeys = {
  all: ['apikeys'] as const,
  list: () => [...apikeysKeys.all, 'list'] as const,
}

export const webhooksKeys = {
  all: ['webhooks'] as const,
  secret: () => [...webhooksKeys.all, 'secret'] as const,
}

export const buildingKeys = {
  all: ['buildings'] as const,
  // Use primitive values to prevent cache misses from object reference changes
  viewport: (lat: number, lng: number, width: number, height: number) =>
    [...buildingKeys.all, 'viewport', lat, lng, width, height] as const,
}

export const weatherKeys = {
  all: ['weather'] as const,
  stations: (lat: number, lng: number, radius?: number) =>
    [...weatherKeys.all, 'stations', lat, lng, radius] as const,
  data: (identifier: string, filters: unknown) =>
    [...weatherKeys.all, 'data', identifier, filters] as const,
  full: (identifier: string) => [...weatherKeys.all, 'full', identifier] as const,
}

export const analysisKeys = {
  all: ['analysis'] as const,
  // Cache key generation: buildAnalysisCacheKey() in analysis.utils.ts is the single
  // source of truth for per-result keys. It produces ['analysis', 'result', ...primitives],
  // so invalidating via analysisKeys.all (prefix match) covers all results.
  // Decision: removed unused `result()` factory here to avoid dual ownership.
  // See buildAnalysisCacheKey() for the key structure and rationale.
}

export const groundMaterialsKeys = {
  all: ['ground-materials'] as const,
  elements: () => [...groundMaterialsKeys.all, 'elements'] as const,
  registry: () => [...groundMaterialsKeys.all, 'registry'] as const,
}

export const indoorAnalysisKeys = {
  all: ['indoor-analysis'] as const,
  daylightFactor: (floorUuid: string) =>
    [...indoorAnalysisKeys.all, 'daylight-factor', floorUuid] as const,
}
