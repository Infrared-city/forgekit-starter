import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * Creates a QueryClient configured for testing (no retries, etc.)
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Garbage collect immediately
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Creates a wrapper component with QueryClientProvider for testing React Query hooks.
 *
 * Usage:
 * ```typescript
 * const { result } = renderHook(() => useMyQuery(), { wrapper: createWrapper() })
 * ```
 */
export function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

/**
 * Creates a wrapper with a specific QueryClient instance (useful for testing cache behavior)
 */
export function createWrapperWithClient(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
