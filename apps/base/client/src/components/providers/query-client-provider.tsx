import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

// Caching policy:
// staleTime: Infinity  -- data never auto-refetches; manual invalidation drives freshness.
// gcTime: 24h          -- inactive data retained long enough to survive a reload via
//                         localStorage persistence (gcTime gates what the persister
//                         restores; anything older is dropped).
// Per-query gcTime overrides (e.g. analysis.cache.ts) are preserved and take precedence.
const GC_TIME = 24 * 60 * 60 * 1000 // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: Infinity,
      gcTime: GC_TIME,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Operation failed')
      },
    },
  },
})

// Global query error handler - shows toast after all retries fail
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    const error = event.query.state.error
    // Only show toast for user-initiated queries (not background refetch)
    if (event.query.state.fetchStatus === 'idle') {
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    }
  }
})

// localStorage persister — survives reload so heavy queries (buildings,
// weather stations, analysis lookups) don't re-fetch on warm load. Excluded:
// any query whose key starts with `auth` / `user` / `profile` / `session`
// (sensitive identity data) and any mutation result (mutations don't enter
// the query cache by default, but the filter is belt-and-braces).
const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: 'forge-kit.rq-cache.v1',
        // Default throttle (1s) is fine. localStorage cap ~5 MB per origin —
        // see comment in dehydrateOptions on what stays out.
      })
    : undefined

// Bump on breaking change to query-key shape so stale persisted entries get
// dropped instead of hydrated into mismatched consumers.
const PERSIST_BUSTER = 'v1'

// Sensitive segments — any string in the queryKey matching one of these
// disqualifies the query from localStorage persistence. Scanning the WHOLE
// key (not just queryKey[0]) catches the common pattern of feature-namespaced
// keys like ['feature', 'user', 'profile'] where the identity segment is
// deeper than head.
const SENSITIVE_KEY_SEGMENTS = new Set([
  'auth',
  'user',
  'profile',
  'session',
  'token',
  'credential',
])

function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  if (queryKey.length === 0) return false
  for (const segment of queryKey) {
    if (typeof segment === 'string' && SENSITIVE_KEY_SEGMENTS.has(segment)) return false
  }
  return true
}

export const AppQueryProvider = ({ children }: { children: ReactNode }) => {
  if (!persister) {
    // SSR fallback path (no window) — defer to the non-persisting provider
    // shape; in practice this branch never runs in the client app.
    return <>{children}</>
  }
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: GC_TIME,
        buster: PERSIST_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: ({ queryKey, state }) => {
            // Only persist successful queries with data; skip pending/error.
            if (state.status !== 'success') return false
            return shouldPersistQuery(queryKey)
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
